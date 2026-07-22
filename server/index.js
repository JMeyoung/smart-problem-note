import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { google } from 'googleapis';
import pdf from 'pdf-parse';
import { exec } from 'child_process';
import os from 'os';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Multer in-memory storage for uploaded files
const upload = multer({ storage: multer.memoryStorage() });


// Cloud-ready Paths (Railway Volume)
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// PDF Index Cache Path
const CACHE_FILE = path.join(DATA_DIR, 'pdf_index_cache.json');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const FAVORITES_FILE = path.join(DATA_DIR, 'favorites.json');

// Local Library Directories (Repo vs Persistent Volume)
const LOCAL_LIB_REPO = path.join(process.cwd(), 'library');
const LOCAL_LIB_PERSIST = path.join(DATA_DIR, 'library');

if (!fs.existsSync(LOCAL_LIB_REPO)) fs.mkdirSync(LOCAL_LIB_REPO, { recursive: true });
if (!fs.existsSync(LOCAL_LIB_PERSIST)) fs.mkdirSync(LOCAL_LIB_PERSIST, { recursive: true });

// Helper: Get local PDF files recursively
function getLocalPdfFiles(dir, relativeDir = '') {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      const relPath = path.join(relativeDir, file);
      if (stat.isDirectory()) {
        results = results.concat(getLocalPdfFiles(filePath, relPath));
      } else if (file.toLowerCase().endsWith('.pdf')) {
        results.push({
          id: `local__${relPath}`,
          name: file,
          path: relPath,
          localPath: filePath,
          modifiedAt: stat.mtime.toISOString()
        });
      }
    }
  } catch (err) {
    console.error('[LocalLib] Error scanning directory', dir, err.message);
  }
  return results;
}

// Combine repo library and persistent library
function scanAllLocalPdfs() {
  const repoFiles = getLocalPdfFiles(LOCAL_LIB_REPO, '기본 제공 교재');
  const persistFiles = getLocalPdfFiles(LOCAL_LIB_PERSIST, '업로드한 교재');
  const combined = {};
  for (const f of repoFiles) {
    combined[f.path] = f;
  }
  for (const f of persistFiles) {
    combined[f.path] = f;
  }
  return Object.values(combined);
}

// Fast UI Cache for Two-Track Sync
let uiFilesCache = [];

// Google Drive API Setup
let auth = null;
let drive = null;
try {
  if (process.env.GOOGLE_CREDENTIALS) {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    drive = google.drive({ version: 'v3', auth });
    console.log('[Drive] Google Drive API initialized via GOOGLE_CREDENTIALS');
  } else {
    console.warn('[Drive] Missing GOOGLE_CREDENTIALS environment variable.');
  }
} catch (e) {
  console.error('[Drive] Failed to initialize Google Drive API:', e.message);
}

// Target folder ID for the root of the library
const DRIVE_ROOT_FOLDER_ID = process.env.DRIVE_ROOT_FOLDER_ID || '';

// Memory storage for PDF Page Index
let pdfPageIndex = {};
let indexingStatus = {
  isIndexing: false,
  totalFiles: 0,
  indexedFiles: 0,
  error: null
};

// Helper: Get all files and folders in Drive root recursively
async function getDriveFiles(folderId, pathSoFar = '', visitedIds = new Set()) {
  if (!drive) return [];
  if (visitedIds.has(folderId)) {
    console.log(`[Drive] Circular shortcut detected for folder ${folderId}, skipping.`);
    return [];
  }
  visitedIds.add(folderId);
  let results = [];
  try {
    let pageToken = null;
    do {
      const res = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, shortcutDetails)',
        pageSize: 1000,
        pageToken: pageToken
      });
      
      const folderPromises = [];
      for (const file of res.data.files) {
        let isFolder = file.mimeType === 'application/vnd.google-apps.folder';
        let isPdf = file.mimeType === 'application/pdf';
        let targetId = file.id;

        // Handle shortcuts
        if (file.mimeType === 'application/vnd.google-apps.shortcut' && file.shortcutDetails) {
          isFolder = file.shortcutDetails.targetMimeType === 'application/vnd.google-apps.folder';
          isPdf = file.shortcutDetails.targetMimeType === 'application/pdf';
          targetId = file.shortcutDetails.targetId;
        }

        if (isFolder) {
          folderPromises.push(getDriveFiles(targetId, path.join(pathSoFar, file.name), visitedIds));
        } else if (isPdf) {
          results.push({
            id: targetId,
            name: file.name,
            path: path.join(pathSoFar, file.name),
            modifiedAt: file.modifiedTime || new Date().toISOString()
          });
        }
      }
      
      const subResultsArray = await Promise.all(folderPromises);
      for (const subResults of subResultsArray) {
        results = results.concat(subResults);
      }
      
      pageToken = res.data.nextPageToken;
    } while (pageToken);
  } catch (err) {
    console.error('[Drive] Error fetching files for folder', folderId, err.message);
  }
  return results;
}

// Download PDF buffer from Drive
async function downloadPdfFromDrive(fileId) {
  try {
    const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' });
    return Buffer.from(res.data);
  } catch (err) {
    console.error('[Drive] Error downloading file', fileId, err.message);
    return null;
  }
}

async function getAiNotesFromDrive() {
  if (!drive) return [];
  try {
    const res = await drive.files.list({
      q: "name='ai_notes.json' and trashed=false",
      fields: 'files(id, name)',
      pageSize: 1
    });
    if (res.data.files && res.data.files.length > 0) {
      const fileId = res.data.files[0].id;
      const buffer = await downloadPdfFromDrive(fileId);
      if (buffer) {
        return JSON.parse(buffer.toString('utf8'));
      }
    }
  } catch (err) {
    console.error('[Drive] Error fetching ai_notes.json', err.message);
  }
  return [];
}

async function getAllSharedFiles() {
  if (!drive) return [];
  let results = [];
  try {
    let pageToken = null;
    do {
      const res = await drive.files.list({
        q: "sharedWithMe = true and trashed = false",
        fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, shortcutDetails)',
        pageSize: 1000,
        pageToken: pageToken
      });
      for (const file of res.data.files) {
        let isFolder = file.mimeType === 'application/vnd.google-apps.folder';
        let isPdf = file.mimeType === 'application/pdf';
        let targetId = file.id;

        if (file.mimeType === 'application/vnd.google-apps.shortcut' && file.shortcutDetails) {
          isFolder = file.shortcutDetails.targetMimeType === 'application/vnd.google-apps.folder';
          isPdf = file.shortcutDetails.targetMimeType === 'application/pdf';
          targetId = file.shortcutDetails.targetId;
        }

        if (isFolder) {
          results = results.concat(await getDriveFiles(targetId, file.name));
        } else if (isPdf) {
          results.push({
            id: targetId,
            name: file.name,
            path: file.name,
            modifiedAt: file.modifiedTime || new Date().toISOString()
          });
        }
      }
      pageToken = res.data.nextPageToken;
    } while (pageToken);
  } catch (err) {
    console.error('[Drive] Error fetching shared files', err.message);
  }
  return results;
}

async function buildPdfIndex() {
  if (indexingStatus.isIndexing) return;
  
  try {
    indexingStatus.isIndexing = true;
    indexingStatus.error = null;
    
    let allFiles = [];
    
    // 1. Scan Local Library Files
    const localFiles = scanAllLocalPdfs();
    console.log(`[Index] Scanned local library. Found ${localFiles.length} files.`);
    allFiles = allFiles.concat(localFiles);
    
    // [Two-Track Sync] Update UI Cache immediately so frontend is not blocked
    uiFilesCache = allFiles;

    indexingStatus.totalFiles = allFiles.length;
    indexingStatus.indexedFiles = 0;
    
    if (fs.existsSync(CACHE_FILE)) {
      try {
        const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        pdfPageIndex = cacheData;
      } catch(e) {
        pdfPageIndex = {};
      }
    }
    
    let hasChanges = false;
    
    // [Cache Cleanup] Remove files from pdfPageIndex that were deleted
    const currentFileIds = new Set(allFiles.map(f => f.id));
    for (const cachedId in pdfPageIndex) {
      if (!currentFileIds.has(cachedId)) {
        console.log(`[Index] Removing deleted file from cache: ${pdfPageIndex[cachedId].name}`);
        delete pdfPageIndex[cachedId];
        hasChanges = true;
      }
    }

    for (const file of allFiles) {
      const fileId = file.id;
      const cached = pdfPageIndex[fileId];
      if (!cached || cached.modifiedAt !== file.modifiedAt) {
        console.log(`[Index] Parsing: ${file.name}...`);
        
        let buffer = null;
        if (fileId.startsWith('local__')) {
          if (fs.existsSync(file.localPath)) {
            buffer = fs.readFileSync(file.localPath);
          } else {
            console.error(`[Index] Local file not found: ${file.localPath}`);
          }
        } else {
          buffer = await downloadPdfFromDrive(fileId);
        }

        if (buffer) {
          try {
            const data = await pdf(buffer);
            const pages = data.text.split('\n\n').map((text, i) => ({
              pageNumber: i + 1,
              text: text.trim()
            })).filter(p => p.text.length > 10);
            
            pdfPageIndex[fileId] = {
              id: fileId,
              name: file.name,
              path: file.path,
              localPath: file.localPath, // Store for local streaming
              modifiedAt: file.modifiedAt,
              pages
            };
            hasChanges = true;
          } catch(e) {
            console.error(`[Index] Error parsing PDF ${file.name}:`, e.message);
          }
        }
      } else {
        // Even if cached, the path might have changed (e.g. moved into a subfolder)
        if (cached.path !== file.path) {
          cached.path = file.path;
          hasChanges = true;
        }
        // Sync localPath in cache if it's a local file and wasn't stored
        if (fileId.startsWith('local__') && !cached.localPath) {
          cached.localPath = file.localPath;
          hasChanges = true;
        }
      }
      indexingStatus.indexedFiles++;
    }
    
    if (hasChanges) {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(pdfPageIndex), 'utf8');
    }
    
  } catch (err) {
    indexingStatus.error = err.message;
  } finally {
    indexingStatus.isIndexing = false;
  }
}

function startPdfIndexing() {
  buildPdfIndex().catch(console.error);
}

// API: Server Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    indexing: indexingStatus,
    indexedPdfCount: Object.keys(pdfPageIndex).length
  });
});

// API: AI Notes Sync
app.get('/api/ai_notes', async (req, res) => {
  try {
    const notes = await getAiNotesFromDrive();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function buildTreeFromFiles(files) {
  const root = [];
  files.forEach(file => {
    const parts = file.path.split('/');
    let currentLevel = root;
    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      let existingNode = currentLevel.find(n => n.name === part);
      if (!existingNode) {
        existingNode = {
          name: part,
          type: isFile ? 'file' : 'directory',
          id: isFile ? file.id : undefined,
          children: isFile ? undefined : []
        };
        currentLevel.push(existingNode);
      }
      if (!isFile) currentLevel = existingNode.children;
    });
  });

  function sortTree(nodes) {
    nodes.sort((a, b) => {
      if (a.type === 'directory' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'directory') return 1;
      return a.name.localeCompare(b.name, 'ko-KR');
    });
    nodes.forEach(node => {
      if (node.children) sortTree(node.children);
    });
    return nodes;
  }

  return sortTree(root);
}

app.get('/api/library', (req, res) => {
  try {
    // If uiFilesCache is empty but pdfPageIndex has data, fallback to pdfPageIndex for initial load
    const files = uiFilesCache.length > 0 ? uiFilesCache : Object.values(pdfPageIndex);
    const library = buildTreeFromFiles(files);
    res.json({ library });
  } catch (err) {
    res.status(500).json({ error: '라이브러리 에러' });
  }
});

app.get('/api/pdf/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    if (fileId.startsWith('local__')) {
      const relPath = fileId.replace('local__', '');
      let localPath = null;
      const foundInCache = pdfPageIndex[fileId];
      const foundInUiCache = uiFilesCache.find(f => f.id === fileId);
        
      if (foundInCache && foundInCache.localPath) {
        localPath = foundInCache.localPath;
      } else if (foundInUiCache && foundInUiCache.localPath) {
        localPath = foundInUiCache.localPath;
      } else {
        // Last resort fallback (only works for root files)
        const persistPath = path.join(LOCAL_LIB_PERSIST, relPath);
        const repoPath = path.join(LOCAL_LIB_REPO, relPath);
        if (fs.existsSync(persistPath)) localPath = persistPath;
        else if (fs.existsSync(repoPath)) localPath = repoPath;
      }
      
      if (localPath && fs.existsSync(localPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
        fs.createReadStream(localPath).pipe(res);
        return;
      } else {
        return res.status(404).send('Local PDF file not found');
      }
    }

    if (!drive) throw new Error('Drive API not initialized');
    const driveRes = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    driveRes.data.pipe(res);
  } catch (err) {
    res.status(500).send('PDF Error: ' + err.message);
  }
});

app.get('/api/pdf-by-name/:name', async (req, res) => {
  try {
    const name = req.params.name;
    let matchedFile = null;
    for (const key in pdfPageIndex) {
      if (pdfPageIndex[key].name === name) {
        matchedFile = pdfPageIndex[key];
        break;
      }
    }
    
    if (!matchedFile) {
      const locals = scanAllLocalPdfs();
      const foundLocal = locals.find(f => f.name === name);
      if (foundLocal) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
        fs.createReadStream(foundLocal.localPath).pipe(res);
        return;
      }
      return res.status(404).send('PDF Not Found in Index or Local Library');
    }
    
    if (matchedFile.id.startsWith('local__')) {
      if (fs.existsSync(matchedFile.localPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
        fs.createReadStream(matchedFile.localPath).pipe(res);
        return;
      }
    }

    if (!drive) throw new Error('Drive API not initialized');
    const driveRes = await drive.files.get({ fileId: matchedFile.id, alt: 'media' }, { responseType: 'stream' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    driveRes.data.pipe(res);
  } catch (err) {
    res.status(500).send('PDF Error: ' + err.message);
  }
});

// API: Get all Notes
app.get('/api/notes', (req, res) => {
  try {
    if (!fs.existsSync(NOTES_FILE)) {
      return res.json({ notes: [] });
    }
    const data = fs.readFileSync(NOTES_FILE, 'utf-8');
    res.json({ notes: JSON.parse(data) });
  } catch (err) {
    res.status(500).json({ error: '노트 불러오기 실패' });
  }
});

// API: Save Note
app.post('/api/notes', (req, res) => {
  try {
    const newNote = req.body;
    let notes = [];
    if (fs.existsSync(NOTES_FILE)) {
      notes = JSON.parse(fs.readFileSync(NOTES_FILE, 'utf-8'));
    }
    newNote.id = Date.now().toString();
    newNote.createdAt = new Date().toISOString();
    notes.push(newNote);
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2), 'utf-8');
    res.json({ success: true, note: newNote });
  } catch (err) {
    res.status(500).json({ error: '노트 저장 실패' });
  }
});

// API: Delete Note
app.delete('/api/notes/:id', (req, res) => {
  try {
    if (!fs.existsSync(NOTES_FILE)) return res.json({ success: true });
    let notes = JSON.parse(fs.readFileSync(NOTES_FILE, 'utf-8'));
    notes = notes.filter(n => n.id !== req.params.id);
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '노트 삭제 실패' });
  }
});

// API: Force Re-indexing
app.post('/api/reindex', async (req, res) => {
  if (indexingStatus.isIndexing) {
    return res.status(400).json({ error: 'Indexing is already in progress' });
  }
  startPdfIndexing(); // Run in background
  res.json({ message: 'Indexing started in background' });
});

// API: Open Local PDF in OS Viewer
app.post('/api/open-pdf', (req, res) => {
  const { pdfPath } = req.body;
  if (!pdfPath) {
    return res.status(400).json({ error: 'PDF 경로가 제공되지 않았습니다.' });
  }

  // Security check: Must reside in Google Drive
  if (!pdfPath.startsWith(GOOGLE_DRIVE_ROOT)) {
    return res.status(403).json({ error: '지정된 파일 경로에 접근 권한이 없습니다.' });
  }

  if (!fs.existsSync(pdfPath)) {
    return res.status(404).json({ error: '파일이 존재하지 않습니다.' });
  }

  const platform = os.platform();
  let cmd = '';

  if (platform === 'darwin') {
    cmd = `open "${pdfPath}"`;
  } else if (platform === 'win32') {
    cmd = `start "" "${pdfPath}"`;
  } else {
    cmd = `xdg-open "${pdfPath}"`;
  }

  exec(cmd, (error) => {
    if (error) {
      console.error(`[Exec] Failed to open PDF: ${pdfPath}. Error:`, error);
      return res.status(500).json({ error: 'PDF 파일을 여는 데 실패했습니다.' });
    }
    res.json({ success: true, message: 'PDF 파일이 시스템 뷰어에서 실행되었습니다.' });
  });
});

// API: Solve image
function searchPdfIndex(queryText) {
  const keywords = queryText.split(/[\\s,.\\n]+/).filter(w => w.length > 1);
  const results = [];
  for (const fileKey in pdfPageIndex) {
    const fileData = pdfPageIndex[fileKey];
    if (!fileData.pages) continue;
    for (const page of fileData.pages) {
      let score = 0;
      for (const kw of keywords) {
        if (page.text.includes(kw)) {
          score++;
        }
      }
      if (score > 2) { // threshold
        results.push({
          pdfId: fileData.id,
          pdfName: fileData.name,
          pdfPath: fileData.path,
          pageNumber: page.pageNumber,
          text: page.text,
          score
        });
      }
    }
  }
  return results.sort((a, b) => b.score - a.score);
}

const modelCache = new Map();

async function getBestGeminiModel(apiKey) {
  if (modelCache.has(apiKey)) return modelCache.get(apiKey);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) {
      console.warn('[Gemini] Failed to list models, defaulting to gemini-1.5-flash');
      return 'gemini-1.5-flash';
    }
    const data = await res.json();
    const models = data.models || [];
    
    const validModels = models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'));
    
    let bestModel = validModels.find(m => m.name.includes('gemini-3.5-flash')) ||
                    validModels.find(m => m.name.includes('gemini-3.0-flash')) ||
                    validModels.find(m => m.name.includes('gemini-2.5-flash')) ||
                    validModels.find(m => m.name.includes('gemini-2.0-flash')) ||
                    validModels.find(m => m.name.includes('gemini-1.5-flash')) ||
                    validModels.find(m => m.name.includes('gemini-1.5-pro')) ||
                    validModels.find(m => m.name.includes('gemini-pro')) ||
                    validModels[validModels.length - 1];
                    
    const modelName = bestModel ? bestModel.name.replace('models/', '') : 'gemini-2.5-flash';
    console.log(`[Gemini] Auto-detected best model: ${modelName}`);
    modelCache.set(apiKey, modelName);
    return modelName;
  } catch(e) {
    console.warn('[Gemini] Error listing models:', e.message);
    return 'gemini-2.5-flash';
  }
}

// Helper to convert buffer to GenerativePart format for Gemini API
function bufferToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

// Helper to safely call Gemini with automatic fallback on 503 / 429 / model overload errors
async function generateContentWithFallback(genAI, promptOrParts, preferredModelName, config = {}) {
  const modelsToTry = [
    preferredModelName,
    'gemini-3.5-flash',
    'gemini-3.0-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ].filter((m, index, self) => m && self.indexOf(m) === index);

  let lastError;
  for (const modelName of modelsToTry) {
    try {
      console.log(`[Gemini] Calling generateContent using model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName, ...config });
      const result = await model.generateContent(promptOrParts);
      return result;
    } catch (err) {
      console.warn(`[Gemini] Model ${modelName} failed (${err.message}). Trying next fallback model...`);
      lastError = err;
    }
  }
  throw lastError;
}

app.post('/api/solve', upload.single('image'), async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'] || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'Gemini API Key가 제공되지 않았습니다. 환경변수 설정이나 요청 헤더에 x-api-key를 지정해 주세요.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: '업로드된 이미지 파일이 없습니다.' });
    }

    console.log(`[API-Solve] Processing solve request for file: ${req.file.originalname}`);

    // Initialize Gemini client with provided API Key
    const genAI = new GoogleGenerativeAI(apiKey);
    const bestModelName = await getBestGeminiModel(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: bestModelName,
      generationConfig: { responseMimeType: "application/json" }
    });

    const imagePart = bufferToGenerativePart(req.file.buffer, req.file.mimetype);

    // Call 1: OCR problem text & analyze user handwritten solutions
    console.log('[API-Solve] Call 1: Running OCR and Handwriting analysis...');
    const ocrPrompt = `
      You are an expert OCR AI system. Analyze this image and extract:
      1. The main question text (problem content) written in the image. Keep formulas or numbers intact.
      2. Detect if the user wrote their own solution or handwritten scrap note on this image. If yes, transcribe that handwritten solution into "userSolutionText" and set "hasUserSolution" to true. If no user handwriting is found, leave "userSolutionText" empty and "hasUserSolution" to false.
      3. Classify the subject as one of: "수학", "영어", "국어", "과학", "기타".

      Your output must be a JSON object with this structure:
      {
        "questionText": "exact question text parsed...",
        "hasUserSolution": true/false,
        "userSolutionText": "transcribed user handwriting...",
        "subject": "수학/영어/국어/과학/기타"
      }
    `;

    const ocrResult = await generateContentWithFallback(genAI, [imagePart, ocrPrompt], bestModelName, { generationConfig: { responseMimeType: "application/json" } });
    const ocrResponseText = ocrResult.response.text();
    let ocrData;
    try {
      ocrData = JSON.parse(ocrResponseText);
      console.log('[API-Solve] OCR output parsed successfully:', ocrData.subject);
    } catch (e) {
      console.error('[API-Solve] Failed to parse JSON from OCR output:', ocrResponseText);
      throw new Error('OCR 단계에서 결과 데이터를 해석하지 못했습니다.');
    }

    // Call 2: Match with local PDFs
    console.log('[API-Solve] Searching local PDF index for matches...');
    const matches = searchPdfIndex(ocrData.questionText);
    
    // Select top 2 distinct PDF files
    const selectedMatches = [];
    const seenFiles = new Set();
    for (const match of matches) {
      if (!seenFiles.has(match.pdfPath)) {
        seenFiles.add(match.pdfPath);
        selectedMatches.push(match);
      }
      if (selectedMatches.length >= 2) break;
    }
    
    // Determine primary match (prefer solution file)
    let primaryMatch = null;
    let secondaryMatch = null;
    
    if (selectedMatches.length > 0) {
      const solIndex = selectedMatches.findIndex(m => /해설|풀이|해답|답안|solution|answer|key/i.test(m.pdfName));
      if (solIndex !== -1) {
        primaryMatch = selectedMatches[solIndex];
        secondaryMatch = selectedMatches[solIndex === 0 ? 1 : 0] || null;
      } else {
        primaryMatch = selectedMatches[0];
        secondaryMatch = selectedMatches[1] || null;
      }
      console.log(`[API-Solve] Matches selected: Primary=${primaryMatch.pdfName} (${primaryMatch.pageNumber}p), Secondary=${secondaryMatch ? secondaryMatch.pdfName : 'None'}`);
    } else {
      console.log('[API-Solve] No PDF matches found.');
    }

    // Call 3: Solve the problem with reference context if available
    console.log('[API-Solve] Call 2: Solving problem via Gemini...');
    
    // Switch response type to standard JSON configuration
    const bestModelNameForSolver = await getBestGeminiModel(apiKey);
    const solverModel = genAI.getGenerativeModel({ 
      model: bestModelNameForSolver,
      generationConfig: { responseMimeType: "application/json" }
    });

    let solverPrompt = `
      당신은 친절하고 뛰어난 전문 강사(멘토)입니다.
      아래 [문제 내용]을 학생들이 이해하기 쉽게 깊이 있게 풀이해 주세요.

      [문제 내용]
      ${ocrData.questionText}
    `;

    if (selectedMatches.length > 0) {
      solverPrompt += `\n\n[구글 드라이브 교재/해설지 참조 컨텍스트]`;
      
      selectedMatches.forEach((match, idx) => {
        const isSolutionFile = /해설|풀이|해답|답안|solution|answer|key/i.test(match.pdfName);
        const fileTypeLabel = isSolutionFile ? "공식 해설/풀이" : "교재 문제 지문";
        
        solverPrompt += `
        
        참조 ${idx + 1} (${fileTypeLabel}):
        - 파일명: ${match.pdfName}
        - 페이지: ${match.pageNumber}페이지
        - 텍스트 내용:
        """
        ${match.text}
        """
        `;
      });
      
      solverPrompt += `
      
      참고: 위 참조 컨텍스트에는 이 문제의 원본 지문 또는 공식 해설지 텍스트가 포함되어 있습니다.
      특히 '공식 해설/풀이' 참조가 있다면 해당 풀이 로직과 정답을 최우선으로 반영하여 학생에게 설명해 주세요.
      `;
    }

    if (ocrData.hasUserSolution && ocrData.userSolutionText) {
      solverPrompt += `
      
      [학생이 시도한 풀이]
      """
      ${ocrData.userSolutionText}
      """
      
      참고: 학생이 문제 옆에 손글씨로 적은 풀이입니다. 
      이 풀이 방식이 맞았는지, 틀렸다면 어느 단계에서 어떤 오개념 때문에 오류가 발생했는지 해설 끝부분에 "오답 분석"으로 친절히 짚어주세요.
      `;
    }

    solverPrompt += `
      반드시 출력은 다음 구조의 JSON 객체여야 합니다:
      {
        "title": "개념을 반영한 적절하고 매력적인 문제 제목 (예: 미적분 - 함수의 극한)",
        "correctAnswer": "최종 정답 (예: '5' 또는 'x = -2' 등)",
        "explanation": "Markdown 포맷을 활용한 친절하고 상세한 줄글 해설 및 단계별 풀이 과정. **중요: 모든 수학 수식, 함수, 변수는 반드시 KaTeX 문법을 사용하여 인라인 수식은 $수식$, 블록 수식은 $$수식$$ 형태로 작성하세요.**",
        "approachGuide": {
          "keyConcept": "이 문제를 풀기 위해 머릿속에서 떠올려야 하는 핵심 개념이나 공식 명칭",
          "clueWord": "문제 본문에서 이 방식을 떠올려야 하는 힌트 문구 또는 조건식 (반드시 단일 문자열 텍스트 하나로만 작성, 쉼표로 분리 금지. 수식이 있다면 $수식$ 형식 사용)",
          "stepByStep": [
            "1단계 행동 지침 (무엇으로 식을 시작하는지)",
            "2단계 행동 지침 (어떻게 전개하거나 적용하는지)",
            "3단계 행동 지침 (최종 계산을 마무리 짓는 법)"
          ],
          "pitfall": "학생들이 주로 혼동하는 개념이나 계산 실수 함정 포인트"
        }
      }
    `;

    // Solve call (using original image too to capture visuals)
    const solveResult = await generateContentWithFallback(genAI, [imagePart, solverPrompt], bestModelNameForSolver, { generationConfig: { responseMimeType: "application/json" } });
    const solveResponseText = solveResult.response.text();
    const cleanSolveResponseText = solveResponseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    let finalOutput;
    
    try {
      finalOutput = JSON.parse(cleanSolveResponseText);
    } catch (e) {
      console.error('[API-Solve] Failed to parse Solver output:', solveResponseText);
      throw new Error('AI 풀이 단계에서 결과 데이터를 해석하지 못했습니다.');
    }

    // Send final synthesized results
    res.json({
      title: finalOutput.title,
      subject: ocrData.subject,
      question: ocrData.questionText,
      mySolution: ocrData.userSolutionText || '',
      correctAnswer: finalOutput.correctAnswer,
      explanation: finalOutput.explanation,
      difficulty: ocrData.subject === '영어' ? 3 : 4, // smart default
      pdfReference: primaryMatch ? {
        pdfId: primaryMatch.pdfId,
        pdfName: primaryMatch.pdfName,
        pageNumber: primaryMatch.pageNumber,
        matchedSnippet: primaryMatch.text.substring(0, 300) + '...'
      } : null,
      pdfReferenceSecondary: secondaryMatch ? {
        pdfId: secondaryMatch.pdfId,
        pdfName: secondaryMatch.pdfName,
        pageNumber: secondaryMatch.pageNumber,
        matchedSnippet: secondaryMatch.text.substring(0, 300) + '...'
      } : null,
      approachGuide: finalOutput.approachGuide || null
    });

  } catch (err) {
    console.error('[API-Solve] Critical solver error:', err);
    res.status(500).json({ error: err.message || '서버 내부 오류가 발생했습니다.' });
  }
});

// API: Analyze problem approach guide table
app.post('/api/analyze-approach', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'] || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'Gemini API Key가 없습니다. 설정 창에서 입력해주세요.' });
    }

    const { question, subject } = req.body;
    if (!question) {
      return res.status(400).json({ error: '분석할 문제 내용이 없습니다.' });
    }

    console.log(`[API-Analyze] Analyzing problem approach for subject: ${subject}`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const bestModelName = await getBestGeminiModel(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: bestModelName,
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      당신은 수험생을 위한 최고의 입시 멘토입니다.
      아래 [문제 내용]을 읽고, 이 문제를 풀기 위해 가장 중요한 핵심 개념, 발문 속 결정적인 힌트(단서), 3단계 접근 전략, 그리고 주의해야 할 오답 함정을 정리해 주세요.
      과목 대분류는 '${subject || "기타"}'입니다.

      [문제 내용]
      ${question}

      출력은 반드시 다음 구조를 정확히 지키는 JSON이어야 합니다:
      {
        "keyConcept": "핵심 개념이나 이론/공식 명칭",
        "clueWord": "문제 본문에서 이 방식을 떠올려야 하는 힌트 문구 또는 부호 조건 (반드시 단일 문자열 텍스트 하나로만 작성, 쉼표로 분리 금지)",
        "stepByStep": [
          "1단계 행동 지침 (무엇을 시작하고 어떻게 식을 세우는지)",
          "2단계 행동 지침 (어떻게 전개하고 어떤 변화식을 쓰는지)",
          "3단계 행동 지침 (최종 계산 시 정리하는 법)"
        ],
        "pitfall": "시험장에서 수험생들이 흔히 범하는 계산 실수, 착각, 함정 조건"
      }
    `;

    const result = await generateContentWithFallback(genAI, prompt, bestModelName, { generationConfig: { responseMimeType: "application/json" } });
    const responseText = result.response.text();
    const cleanResponseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    let approachGuide;
    try {
      const parsed = JSON.parse(cleanResponseText);
      approachGuide = parsed;
    } catch (e) {
      console.error('[API-Analyze] Failed to parse JSON from AI analysis:', responseText);
      throw new Error('AI 분석 결과를 파싱하는 데 실패했습니다.');
    }

    res.json({ approachGuide });
  } catch (err) {
    console.error('[API-Analyze] Error:', err);
    res.status(500).json({ error: err.message || '접근법 분석 중 오류가 발생했습니다.' });
  }
});


// API: Search PDF contents and filenames
app.get('/api/search-pdf', (req, res) => {
  const query = req.query.q;
  if (!query) return res.json({ results: [] });
  
  const searchLower = query.toLowerCase();
  
  // Setup aliases for searching
  const searchTerms = [searchLower];
  if (searchLower.includes('고완풀')) searchTerms.push('고득점 완성');
  if (searchLower.includes('더단단') || searchLower.includes('더 단단')) searchTerms.push('the 단단');
  
  const results = [];
  
  // Search through all cached pdf texts and names
  for (const fileId in pdfPageIndex) {
    const fileData = pdfPageIndex[fileId];
    const fileNameLower = fileData.name.toLowerCase();
    
    // 1. Filename match check
    const matchesFileName = searchTerms.some(term => fileNameLower.includes(term));
    if (matchesFileName) {
      results.push({
        pdfId: fileId,
        pdfName: fileData.name,
        pageNumber: 1, // Default to page 1 for filename match
        snippet: '📄 파일 이름이 검색어와 일치합니다.'
      });
    }

    if (!fileData.pages) continue;
    
    // 2. Content match check
    for (const page of fileData.pages) {
      const pageTextLower = page.text.toLowerCase();
      
      let matchedTerm = null;
      for (const term of searchTerms) {
        if (pageTextLower.includes(term)) {
          matchedTerm = term;
          break;
        }
      }
      
      if (matchedTerm) {
        // Extract a snippet around the match
        const matchIndex = pageTextLower.indexOf(matchedTerm);
        const start = Math.max(0, matchIndex - 50);
        const end = Math.min(page.text.length, matchIndex + matchedTerm.length + 50);
        let snippet = page.text.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < page.text.length) snippet = snippet + '...';
        
        results.push({
          pdfId: fileId,
          pdfName: fileData.name,
          pageNumber: page.pageNumber,
          snippet: snippet
        });
        
        // Limit results per file to avoid huge payloads
        if (results.filter(r => r.pdfId === fileId).length > 3) break;
      }
    }
  }
  
  res.json({ results });
});

// API: Get Favorites
app.get('/api/favorites', (req, res) => {
  try {
    if (!fs.existsSync(FAVORITES_FILE)) return res.json({ favorites: [] });
    const data = JSON.parse(fs.readFileSync(FAVORITES_FILE, 'utf-8'));
    res.json({ favorites: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load favorites' });
  }
});

// API: Add Favorite
app.post('/api/favorites', (req, res) => {
  try {
    const { fileId } = req.body;
    if (!fileId) return res.status(400).json({ error: 'fileId required' });
    
    let favorites = [];
    if (fs.existsSync(FAVORITES_FILE)) {
      favorites = JSON.parse(fs.readFileSync(FAVORITES_FILE, 'utf-8'));
    }
    if (!favorites.includes(fileId)) {
      favorites.push(fileId);
      fs.writeFileSync(FAVORITES_FILE, JSON.stringify(favorites), 'utf-8');
    }
    res.json({ success: true, favorites });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save favorite' });
  }
});

// API: Remove Favorite
app.delete('/api/favorites/:id', (req, res) => {
  try {
    const fileId = req.params.id;
    if (!fs.existsSync(FAVORITES_FILE)) return res.json({ success: true, favorites: [] });
    
    let favorites = JSON.parse(fs.readFileSync(FAVORITES_FILE, 'utf-8'));
    favorites = favorites.filter(id => id !== fileId);
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify(favorites), 'utf-8');
    
    res.json({ success: true, favorites });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete favorite' });
  }
});

// API: Upload PDF to Local Library
app.post('/api/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '업로드할 PDF 파일이 없습니다.' });
    }
    let filename = req.file.originalname;
    try {
      // Multer decodes originalname as latin1 by default, causing garbled Korean characters
      filename = Buffer.from(filename, 'latin1').toString('utf8');
    } catch (err) {
      console.warn('[Upload] Failed to decode filename from latin1:', err.message);
    }
    filename = filename.normalize('NFC');

    if (!filename.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ error: 'PDF 파일만 업로드할 수 있습니다.' });
    }
    const targetPath = path.join(LOCAL_LIB_PERSIST, filename);
    fs.writeFileSync(targetPath, req.file.buffer);
    console.log(`[Upload] Saved PDF locally: ${targetPath}`);
    
    // Trigger index rebuild in the background
    startPdfIndexing();
    
    res.json({ success: true, filename });
  } catch (err) {
    console.error('[Upload] Error saving file:', err.message);
    res.status(500).json({ error: 'PDF 파일 저장 실패: ' + err.message });
  }
});

// API: Delete uploaded PDF from Local Library
app.delete('/api/upload-pdf', async (req, res) => {
  try {
    const fileId = req.query.id;
    if (!fileId || !fileId.startsWith('local__업로드한 교재/')) {
      return res.status(400).json({ error: '유효하지 않은 파일 ID입니다.' });
    }
    
    // Validate that it's actually in LOCAL_LIB_PERSIST
    const relativePath = fileId.replace('local__업로드한 교재/', '');
    const targetPath = path.join(LOCAL_LIB_PERSIST, relativePath);
    
    // Protect against path traversal
    if (!targetPath.startsWith(LOCAL_LIB_PERSIST)) {
      return res.status(400).json({ error: '잘못된 경로입니다.' });
    }
    
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      console.log(`[Delete] Removed local PDF: ${targetPath}`);
      
      // Trigger index rebuild
      startPdfIndexing();
      
      res.json({ success: true });
    } else {
      res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
    }
  } catch (err) {
    console.error('[Delete] Error removing file:', err.message);
    res.status(500).json({ error: '삭제 실패: ' + err.message });
  }
});

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  });
}

// Start Express server and trigger initial indexing
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Backend running on port ${PORT}`);
  // Pre-load UI cache from disk so the frontend is never empty on restart
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      pdfPageIndex = cacheData;
      uiFilesCache = Object.values(cacheData).map(f => ({
        id: f.id,
        name: f.name,
        path: f.path,
        modifiedAt: f.modifiedAt
      }));
      console.log(`[Server] Preloaded ${uiFilesCache.length} files into UI cache from disk.`);
    } catch(e) {
      console.error('[Server] Failed to preload cache:', e.message);
    }
  }
  // Trigger indexing on start
  startPdfIndexing();
});
