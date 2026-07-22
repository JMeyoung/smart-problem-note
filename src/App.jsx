import React, { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';
import Library from './components/Library';

// SVG Icons as components to keep it clean and self-contained
const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"></path>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6"></path>
  </svg>
);

const BookOpenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

const CameraIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const SyncIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
  </svg>
);

const SparklesIcon = ({ className }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ color: '#d8b4fe' }}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
  </svg>
);

const StarIcon = ({ filled, onClick, style }) => (
  <span 
    onClick={onClick} 
    style={{ cursor: onClick ? 'pointer' : 'default', ...style }} 
    className={`star-symbol ${filled ? 'active' : ''}`}
  >
    {filled ? '★' : '☆'}
  </span>
);

const DraggableTabSwitcher = ({ activeTab, setActiveTab }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [dragX, setDragX] = useState(0);
  
  const startXRef = useRef(0);

  // DRAG_THRESHOLD 5px, elastic boundary ±8px
  const DRAG_THRESHOLD = 5;
  const ELASTIC_LIMIT = 8;

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
      const diffX = clientX - startXRef.current;
      
      if (!hasDragged && Math.abs(diffX) > DRAG_THRESHOLD) {
        setHasDragged(true);
      }

      if (hasDragged) {
        const containerWidth = containerRef.current ? containerRef.current.offsetWidth : 300;
        const pillWidth = containerWidth / 2;
        
        let targetX = diffX;
        if (activeTab === 'library') {
          targetX = Math.max(-ELASTIC_LIMIT, Math.min(pillWidth + ELASTIC_LIMIT, diffX));
        } else {
          targetX = Math.max(-pillWidth - ELASTIC_LIMIT, Math.min(ELASTIC_LIMIT, diffX));
        }
        setDragX(targetX);
      }
    };

    const handleMouseUp = () => {
      const containerWidth = containerRef.current ? containerRef.current.offsetWidth : 300;
      const pillWidth = containerWidth / 2;

      if (hasDragged) {
        if (activeTab === 'library' && dragX > pillWidth / 2) {
          setActiveTab('dashboard');
        } else if (activeTab === 'dashboard' && dragX < -pillWidth / 2) {
          setActiveTab('library');
        }
      }
      
      setIsDragging(false);
      setHasDragged(false);
      setDragX(0);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, hasDragged, dragX, activeTab, setActiveTab]);

  const handleStart = (clientX) => {
    setIsDragging(true);
    startXRef.current = clientX;
    setDragX(0);
  };

  const containerWidth = containerRef.current ? containerRef.current.offsetWidth : 300;
  const pillWidth = containerWidth / 2;
  const activeOffset = activeTab === 'library' ? 0 : pillWidth;
  const translatePosition = activeOffset + dragX;

  return (
    <div 
      ref={containerRef}
      className="draggable-tab-container"
      style={{
        position: 'relative',
        display: 'flex',
        width: 'calc(100% - 4rem)',
        maxWidth: '500px',
        margin: '0 auto 1.5rem',
        padding: '5px',
        borderRadius: '99px',
        background: 'rgba(255, 255, 255, 0.18)',
        backdropFilter: 'blur(20px) saturate(190%) contrast(1.02)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.5), inset 0 -1px 1px rgba(0, 0, 0, 0.05), 0 10px 30px rgba(0, 0, 0, 0.06)',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      {/* Dynamic light (200%+ size, rotating with drag position) */}
      <div 
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.32), transparent 45%)',
          pointerEvents: 'none',
          transform: `rotate(${dragX * 1.5}deg)`,
          transition: isDragging ? 'none' : 'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 1
        }}
      />

      {/* Sliding Pill */}
      <div
        className={`draggable-tab-pill ${isDragging ? 'dragging' : ''}`}
        onMouseDown={(e) => { e.preventDefault(); handleStart(e.clientX); }}
        onTouchStart={(e) => { handleStart(e.touches[0].clientX); }}
        style={{
          position: 'absolute',
          top: '5px',
          bottom: '5px',
          left: '5px',
          width: 'calc(50% - 5px)',
          borderRadius: '99px',
          background: isDragging 
            ? 'rgba(255, 255, 255, 0.22)' 
            : '#ffffff',
          backdropFilter: isDragging ? 'blur(10px) saturate(200%) brightness(1.15)' : 'none',
          boxShadow: isDragging 
            ? 'none' 
            : '0 4px 10px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
          transform: `translateX(${translatePosition}px) scale(${isDragging ? 1.08 : 1})`,
          transition: isDragging 
            ? 'transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1), scale 150ms cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), scale 500ms cubic-bezier(0.34, 1.56, 0.64, 1), background-color 300ms, backdrop-filter 300ms',
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: 10,
          willChange: isDragging ? 'transform, scale' : 'auto'
        }}
      >
        {/* Caustics overlay (drag only, opacity 0 -> 1) */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.25\'/%3E%3C/svg%3E")',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            opacity: isDragging ? 1 : 0,
            transition: 'opacity 250ms ease',
            willChange: 'opacity'
          }}
        />
      </div>

      {/* Tab Buttons (labels) */}
      <div 
        onClick={() => !hasDragged && setActiveTab('library')}
        style={{
          flex: 1,
          textAlign: 'center',
          padding: '12px 0',
          fontWeight: 700,
          fontSize: '0.95rem',
          color: activeTab === 'library' && !isDragging ? '#1e293b' : 'rgba(30, 41, 59, 0.65)',
          cursor: 'pointer',
          zIndex: 11,
          transition: 'color 300ms',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        📁 내 드라이브 라이브러리
      </div>
      
      <div 
        onClick={() => !hasDragged && setActiveTab('dashboard')}
        style={{
          flex: 1,
          textAlign: 'center',
          padding: '12px 0',
          fontWeight: 700,
          fontSize: '0.95rem',
          color: activeTab === 'dashboard' && !isDragging ? '#1e293b' : 'rgba(30, 41, 59, 0.65)',
          cursor: 'pointer',
          zIndex: 11,
          transition: 'color 300ms',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        📝 오답노트 관리 / 대시보드
      </div>
    </div>
  );
};

const SUB_SUBJECTS = {
  '수학': ['미적분과 급수', '다변수와 미적분', '선형대수', '공학수학'],
  '영어': ['어휘', '문법'],
  '직접 입력': []
};

const INITIAL_FORM_STATE = {
  title: '',
  subject: '수학',
  subSubject: '미적분과 급수',
  customSubject: '',
  textbook: '자체 오답노트',
  question: '',
  imageUrl: '',
  mySolution: '',
  correctAnswer: '',
  explanation: '',
  difficulty: 3,
  pdfReference: null,
  pdfReferenceSecondary: null,
  approachGuide: null
};

// Preprocess LaTeX & special exam symbols to prevent broken characters
const preprocessLatexText = (str) => {
  if (!str) return '';
  let clean = String(str);
  
  // Clean replacement characters or broken UTF-8 bytes
  clean = clean.replace(/[\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

  // Automatically wrap naked LaTeX expressions (like \frac{a}{b}, \lim_{x\to0}, \int, \sqrt) in $...$ if not already wrapped
  const nakedLatexRegex = /(\\(?:frac|sqrt|lim|int|sum|prod|alpha|beta|gamma|delta|theta|pi|infty|le|ge|neq|approx|times|div|vec|log|ln|sin|cos|tan)\b[^\$\n]*?)(?=(?:[^\$]*\$[^\$]*\$)*[^\$]*$)/gi;
  clean = clean.replace(nakedLatexRegex, (match) => {
    return `$${match.trim()}$`;
  });

  return clean;
};

// Latex rendering helper component
const LatexText = ({ text, highlight = '' }) => {
  if (!text) return null;
  const processedText = preprocessLatexText(text);

  if (!window.katex) {
    return <span>{processedText}</span>;
  }

  // Split text by LaTeX blocks: $$...$$ (display math) and $...$ (inline math)
  const regex = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
  const splitParts = processedText.split(regex);

  // Search term highlight helper
  const highlightHelper = (plainText) => {
    if (!highlight.trim()) return plainText;
    const cleanHighlight = highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const parts = plainText.split(new RegExp(`(${cleanHighlight})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? <mark key={i}>{part}</mark> 
        : part
    );
  };

  return (
    <span>
      {splitParts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2).trim();
          try {
            const html = window.katex.renderToString(math, { displayMode: true, throwOnError: false });
            return <div key={index} dangerouslySetInnerHTML={{ __html: html }} className="katex-display" />;
          } catch (e) {
            return <code key={index}>{part}</code>;
          }
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1).trim();
          try {
            const html = window.katex.renderToString(math, { displayMode: false, throwOnError: false });
            return <span key={index} dangerouslySetInnerHTML={{ __html: html }} className="katex-inline" />;
          } catch (e) {
            return <code key={index}>{part}</code>;
          }
        } else {
          return <React.Fragment key={index}>{highlightHelper(part)}</React.Fragment>;
        }
      })}
    </span>
  );
};

const highlightText = (text, query) => {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) => 
    part.toLowerCase() === query.toLowerCase() ? <mark key={i} className="highlight">{part}</mark> : part
  );
};

function App() {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('smart_note_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');

  // --- States ---
  const [problems, setProblems] = useState(() => {
    const saved = localStorage.getItem('smart_problem_note_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('smart_problem_note_theme');
    return saved || 'dark';
  });

  const [colorTheme, setColorTheme] = useState(() => {
    return localStorage.getItem('smart_problem_note_color_theme') || 'white';
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  // Gemini API Key & settings
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('smart_problem_note_api_key') || '';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [serverStatus, setServerStatus] = useState({ connected: false, pdfCount: 0 });
  const [reindexing, setReindexing] = useState(false);
  const [analyzingIds, setAnalyzingIds] = useState(new Set()); // IDs of problems being analyzed for approach guide

  // Upload and AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('전체');
  const [sortBy, setSortBy] = useState('newest');
  
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [editingId, setEditingId] = useState(null);
  
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [revealedAnswers, setRevealedAnswers] = useState(new Set());

  // Print & Bulk Delete selected list
  const [selectedForPrint, setSelectedForPrint] = useState(new Set());

  // Leitner study states
  const [activeTestCard, setActiveTestCard] = useState(null); // problem ID being reviewed

  const fileInputRef = useRef(null);
  const fileInputImportRef = useRef(null);

  // --- Effects ---

const parseApiResponse = async (response) => {
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    if (!response.ok) {
      throw new Error(`서버 연결 지연 (${response.status}): ${text.trim() || '잠시 후 다시 시도해 주세요.'}`);
    }
    throw new Error(`서버 응답 규격 오류: ${text.slice(0, 80)}`);
  }
  if (!response.ok) {
    throw new Error(data.error || `서버 처리 오류 (${response.status})`);
  }
  return data;
};

  useEffect(() => {
    fetch('/api/ai_notes')
      .then(res => parseApiResponse(res))
      .then(data => {
        if (data && Array.isArray(data)) {
          setProblems(prev => {
            const newProblems = [...prev];
            let changed = false;
            for (const note of data) {
              if (!newProblems.find(p => 
                p.id === note.id || 
                (note.questionNumber && note.pdfName && p.questionNumber === note.questionNumber && p.pdfName === note.pdfName)
              )) {
                newProblems.push(note);
                changed = true;
              }
            }
            if (changed) {
              localStorage.setItem('smart_problem_note_data', JSON.stringify(newProblems));
              return newProblems;
            }
            return prev;
          });
        }
      }).catch(console.error);
  }, []);

  useEffect(() => {
    localStorage.setItem('smart_problem_note_data', JSON.stringify(problems));
  }, [problems]);

  useEffect(() => {
    localStorage.setItem('smart_problem_note_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('smart_problem_note_color_theme', colorTheme);
    document.documentElement.setAttribute('data-color-theme', colorTheme);
  }, [colorTheme]);

  // Check connection to Node Express server
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          setServerStatus({ connected: true, pdfCount: data.indexedPdfCount });
          if (data.indexing.isIndexing) {
            setReindexing(true);
          } else {
            setReindexing(false);
          }
        } else {
          setServerStatus({ connected: false, pdfCount: 0 });
        }
      } catch (e) {
        setServerStatus({ connected: false, pdfCount: 0 });
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- Theme Handler ---
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // --- API Key Saver ---
  const handleSaveApiKey = (e) => {
    e.preventDefault();
    const key = e.target.elements.apiKeyInput.value.trim();
    setApiKey(key);
    localStorage.setItem('smart_problem_note_api_key', key);
    setShowSettings(false);
    setErrorMsg('');
  };

  // --- PDF Manual Reindexing Trigger ---
  const handleForceReindex = async () => {
    setReindexing(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/reindex', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '동기화 요청이 실패했습니다.');
      }
      
      alert('구글 드라이브 PDF 동기화가 시작되었습니다. 스캔이 완료되면 대시보드 상태가 업데이트됩니다.');
      
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const checkRes = await fetch('/api/status');
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            if (!checkData.indexing.isIndexing || attempts > 15) {
              setServerStatus({ connected: true, pdfCount: checkData.indexedPdfCount });
              setReindexing(false);
              clearInterval(interval);
            }
          }
        } catch (e) {
          clearInterval(interval);
          setReindexing(false);
        }
      }, 2000);
      
    } catch (err) {
      setErrorMsg(err.message || '서버 통신 중 오류가 발생했습니다.');
      setReindexing(false);
    }
  };

  // --- Data Export (Backup) ---
  const handleExportData = () => {
    const dataStr = JSON.stringify(problems, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart_problem_note_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- Data Import (Restore) ---
  const triggerImportFile = () => {
    fileInputImportRef.current?.click();
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (!Array.isArray(importedData)) {
          throw new Error('올바른 오답노트 백업 파일 형식이 아닙니다.');
        }

        if (window.confirm(`백업 파일에서 ${importedData.length}개의 문제를 불러오시겠습니까? 기존 오답 목록과 대조하여 없는 문항들만 새로 병합됩니다.`)) {
          setProblems(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newProblems = importedData.filter(p => !existingIds.has(p.id));
            return [...newProblems, ...prev];
          });
          alert('데이터 복원이 정상 완료되었습니다!');
        }
      } catch (err) {
        alert(`복원 실패: ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (fileInputImportRef.current) fileInputImportRef.current.value = '';
  };

  // --- AI Problem Approach Analysis Handler ---
  const handleAnalyzeApproach = async (problemId, questionText, subjectText) => {
    setAnalyzingIds(prev => {
      const next = new Set(prev);
      next.add(problemId);
      return next;
    });
    setErrorMsg('');

    try {
      const res = await fetch('/api/analyze-approach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({ question: questionText, subject: subjectText })
      });

      const result = await parseApiResponse(res);

      setProblems(prev => prev.map(p => {
        if (p.id === problemId) {
          return {
            ...p,
            approachGuide: result.approachGuide
          };
        }
        return p;
      }));

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || '백엔드 서버와 통신할 수 없습니다. 서버가 실행 중인지 확인하세요.');
    } finally {
      setAnalyzingIds(prev => {
        const next = new Set(prev);
        next.delete(problemId);
        return next;
      });
    }
  };

  // --- Unique Subject Tags List ---
  const allTags = useMemo(() => {
    const tags = new Set(['수학', '영어']);
    problems.forEach(p => {
      if (p.subject) tags.add(p.subject);
    });
    return Array.from(tags);
  }, [problems]);

  // --- Input Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'subject') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        subSubject: SUB_SUBJECTS[value]?.[0] || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDifficultyChange = (rating) => {
    setFormData(prev => ({ ...prev, difficulty: rating }));
  };

  // --- PDF Open API Handler ---
  const handleOpenPdf = (pdfRef, e) => {
    e.stopPropagation();
    if (!pdfRef) return;
    
    // Cloud-ready: Open the PDF streaming endpoint in a new tab
    if (pdfRef.pdfId) {
      window.open('/api/pdf/' + pdfRef.pdfId, '_blank');
    } else if (pdfRef.pdfName) {
      window.open('/api/pdf-by-name/' + encodeURIComponent(pdfRef.pdfName), '_blank');
    }
  };

  // --- Camera/Image Solve Handler ---
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      
      setAiLoading(true);
      setErrorMsg('');
      setAiStatus('이미지 업로드 준비 중...');

      const formDataToSend = new FormData();
      formDataToSend.append('image', file);

      try {
        setAiStatus('AI 이미지 분석 및 교재/해설지 매칭 중 (약 5~12초 소요)...');
        
        const response = await fetch('/api/solve', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey
          },
          body: formDataToSend
        });

        const result = await parseApiResponse(response);
        
        // Auto fill form data
        const isDefaultSubject = ['수학', '영어'].includes(result.subject);
        setFormData({
          title: result.title || '',
          subject: isDefaultSubject ? result.subject : '직접 입력',
          customSubject: isDefaultSubject ? '' : result.subject,
          question: result.question || '',
          imageUrl: dataUrl, // Keep exact original image!
          mySolution: result.mySolution || '',
          correctAnswer: result.correctAnswer || '',
          explanation: result.explanation || '',
          difficulty: result.difficulty || 3,
          pdfReference: result.pdfReference || null,
          pdfReferenceSecondary: result.pdfReferenceSecondary || null,
          approachGuide: result.approachGuide || null
        });

        setAiStatus('');
        window.scrollTo({ top: 180, behavior: 'smooth' });

      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || '서버와의 통신이 실패했습니다.');
      } finally {
        setAiLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Accordion Controls ---
  const toggleCardExpand = (id) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAnswerReveal = (id, e) => {
    if (e) e.stopPropagation();
    setRevealedAnswers(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // --- Leitner Review system triggers ---
  const handleLeitnerResult = (problemId, passed) => {
    const problem = problems.find(p => p.id === problemId);
    if (!problem) return;

    const currentLevel = problem.reviewLevel || 0;
    let newLevel = 0;
    let daysToAdd = 1;

    if (passed) {
      newLevel = Math.min(5, currentLevel + 1);
      if (newLevel === 1) daysToAdd = 1;      // 1 day
      else if (newLevel === 2) daysToAdd = 3; // 3 days
      else if (newLevel === 3) daysToAdd = 7; // 7 days
      else if (newLevel === 4) daysToAdd = 14;// 14 days
      else if (newLevel === 5) daysToAdd = 30;// 30 days (Mastered)
    } else {
      newLevel = 0;
      daysToAdd = 1; // test again tomorrow
    }

    const nextReviewDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();

    setProblems(prev => prev.map(p => {
      if (p.id === problemId) {
        return {
          ...p,
          reviewLevel: newLevel,
          nextReviewDate,
          reviewHistory: [...(p.reviewHistory || []), {
            date: new Date().toISOString(),
            passed,
            levelFrom: currentLevel,
            levelTo: newLevel
          }]
        };
      }
      return p;
    }));

    setActiveTestCard(null);
    setRevealedAnswers(prev => {
      const next = new Set(prev);
      next.delete(problemId);
      return next;
    });

    alert(`복습 결과가 기록되었습니다! (결과: ${passed ? '성공' : '실패'}, 레벨: Lv.${newLevel}, 다음 복습: ${daysToAdd}일 뒤)`);
  };

  // --- Print & Bulk Delete Test triggers ---
  const handleTogglePrintSelect = (id, e) => {
    e.stopPropagation();
    setSelectedForPrint(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handlePrintExam = () => {
    if (selectedForPrint.size === 0) {
      if (window.confirm('선택된 문제가 없습니다. 현재 리스트의 모든 문제를 인쇄하시겠습니까?')) {
        window.print();
      }
    } else {
      window.print();
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`선택한 ${selectedForPrint.size}개의 오답 노트를 일괄 삭제하시겠습니까? 이 작업은 절대 되돌릴 수 없습니다.`)) {
      setProblems(prev => prev.filter(p => !selectedForPrint.has(p.id)));
      
      setSelectedForPrint(new Set());
      setExpandedCards(prev => {
        const next = new Set(prev);
        problems.forEach(p => {
          if (selectedForPrint.has(p.id)) next.delete(p.id);
        });
        return next;
      });
      alert('선택된 오답 노트들이 일괄 삭제되었습니다.');
    }
  };

  const clearPrintSelection = () => {
    setSelectedForPrint(new Set());
  };

  // --- Form Actions (CRUD) ---
  const handleFormSubmit = (e) => {
    e.preventDefault();

    const finalizedSubject = formData.subject === '직접 입력' 
      ? (formData.customSubject.trim() || '기타') 
      : formData.subject;

    const isNew = !editingId;
    const nowIso = new Date().toISOString();

    const newProblem = {
      id: editingId || Date.now(),
      title: formData.title.trim() || `${finalizedSubject} 문제`,
      subject: finalizedSubject,
      question: formData.question.trim(),
      mySolution: formData.mySolution.trim(),
      correctAnswer: formData.correctAnswer.trim(),
      explanation: formData.explanation.trim(),
      difficulty: formData.difficulty,
      pdfReference: formData.pdfReference,
      pdfReferenceSecondary: formData.pdfReferenceSecondary,
      approachGuide: formData.approachGuide,
      
      // Leitner fields (keep if editing)
      reviewLevel: isNew ? 0 : (problems.find(p => p.id === editingId)?.reviewLevel || 0),
      nextReviewDate: isNew ? nowIso : (problems.find(p => p.id === editingId)?.nextReviewDate || nowIso),
      reviewHistory: isNew ? [] : (problems.find(p => p.id === editingId)?.reviewHistory || []),
      
      createdAt: editingId 
        ? (problems.find(p => p.id === editingId)?.createdAt || nowIso)
        : nowIso
    };

    if (editingId) {
      setProblems(prev => prev.map(p => p.id === editingId ? newProblem : p));
      setEditingId(null);
    } else {
      setProblems(prev => [newProblem, ...prev]);
      setExpandedCards(prev => {
        const next = new Set(prev);
        next.add(newProblem.id);
        return next;
      });
    }

    setFormData(INITIAL_FORM_STATE);
  };

  const handleEditClick = (problem, e) => {
    e.stopPropagation();
    setEditingId(problem.id);
    
    const isDefaultSubject = ['수학', '영어'].includes(problem.subject);
    
    setFormData({
      title: problem.title,
      subject: isDefaultSubject ? problem.subject : '직접 입력',
      customSubject: isDefaultSubject ? '' : problem.subject,
      question: problem.question,
      mySolution: problem.mySolution,
      correctAnswer: problem.correctAnswer,
      explanation: problem.explanation,
      difficulty: problem.difficulty,
      pdfReference: problem.pdfReference || null,
      pdfReferenceSecondary: problem.pdfReferenceSecondary || null,
      approachGuide: problem.approachGuide || null
    });

    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    if (window.confirm('이 오답 노트를 삭제하시겠습니까?')) {
      setProblems(prev => prev.filter(p => p.id !== id));
      
      setExpandedCards(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setRevealedAnswers(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setSelectedForPrint(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      
      if (editingId === id) {
        setEditingId(null);
        setFormData(INITIAL_FORM_STATE);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM_STATE);
  };

  const [selectedTextbook, setSelectedTextbook] = useState('전체');

  const allTextbooks = useMemo(() => {
    const set = new Set();
    problems.forEach(p => {
      const tb = (p.textbook || '자체 오답노트').trim();
      if (tb) set.add(tb);
    });
    return Array.from(set);
  }, [problems]);

  // --- Select All Filtered Problems Handler ---
  const handleSelectAllFiltered = () => {
    const filteredIds = filteredProblems.map(p => p.id);
    setSelectedForPrint(prev => {
      const next = new Set(prev);
      const allSelected = filteredIds.every(id => next.has(id));
      if (allSelected) {
        filteredIds.forEach(id => next.delete(id));
      } else {
        filteredIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  // --- Filtering & Sorting ---
  const filteredProblems = useMemo(() => {
    return problems
      .filter(p => {
        // Spaced Repetition Due Filter
        if (selectedTag === '⏰ 오늘 복습') {
          const isDue = new Date(p.nextReviewDate || new Date().toISOString()) <= new Date();
          const isMastered = p.reviewLevel === 5;
          return isDue && !isMastered;
        }

        // Subject Tag Filter
        if (selectedTag !== '전체' && p.subject !== selectedTag) {
          return false;
        }

        // Textbook Filter
        if (selectedTextbook !== '전체') {
          const pTextbook = (p.textbook || '자체 오답노트').trim();
          if (pTextbook !== selectedTextbook) return false;
        }
        
        // Search Filter
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(query);
          const matchSubject = p.subject.toLowerCase().includes(query);
          const matchTextbook = p.textbook ? p.textbook.toLowerCase().includes(query) : false;
          const matchQuestion = p.question.toLowerCase().includes(query);
          const matchSolution = p.mySolution.toLowerCase().includes(query);
          const matchAnswer = p.correctAnswer.toLowerCase().includes(query);
          const matchExplanation = p.explanation.toLowerCase().includes(query);
          const matchPdf = p.pdfReference?.pdfName.toLowerCase().includes(query) || false;
          const matchPdfSec = p.pdfReferenceSecondary?.pdfName.toLowerCase().includes(query) || false;
          
          return matchTitle || matchSubject || matchTextbook || matchQuestion || matchSolution || matchAnswer || matchExplanation || matchPdf || matchPdfSec;
        }
        
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === 'oldest') {
          return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (sortBy === 'difficulty') {
          return b.difficulty - a.difficulty;
        }
        return 0;
      });
  }, [problems, searchQuery, selectedTag, selectedTextbook, sortBy]);

  // Format date helper
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
  };

  const isSolutionFile = (filename) => {
    return /해설|풀이|해답|답안|solution|answer|key/i.test(filename);
  };

  // Get Spaced Repetition D-day text
  const getDDayInfo = (problem) => {
    if (problem.reviewLevel === 5) {
      return { text: '완벽 정복 🏆', type: 'mastered' };
    }
    const diffTime = new Date(problem.nextReviewDate || new Date().toISOString()) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return { text: '복습 필요 ⚠️', type: 'due' };
    } else {
      return { text: `복습 D-${diffDays}`, type: 'future' };
    }
  };

  const dueReviewCount = useMemo(() => {
    return problems.filter(p => {
      const isDue = new Date(p.nextReviewDate || new Date().toISOString()) <= new Date();
      return isDue && p.reviewLevel !== 5;
    }).length;
  }, [problems]);

  if (!isAuthenticated) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
          <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpenIcon /> 
            스마트 오답노트
          </h2>
          <p style={{ color: 'var(--text-muted-dark)', marginBottom: '30px' }}>
            클라우드 접속을 위해 비밀번호를 입력해주세요.
          </p>
          <form onSubmit={(e) => {
            e.preventDefault();
            // In a real app, this should be verified on the backend.
            // For now, a simple client-side check.
            if (passwordInput === '1234') { 
              localStorage.setItem('smart_note_auth', 'true');
              setIsAuthenticated(true);
            } else {
              alert('비밀번호가 틀렸습니다.');
            }
          }}>
            <input 
              type="password" 
              value={passwordInput} 
              onChange={(e) => setPasswordInput(e.target.value)} 
              placeholder="비밀번호를 입력하세요 (기본: 1234)" 
              style={{ width: '100%', marginBottom: '20px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--glass-bg)' }} 
              autoFocus
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              접속하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* HEADER SECTION */}
      <header className="app-header glass-panel animate-fade-in">
        <div className="header-title-area">
          <h1>
            <BookOpenIcon />
            스마트 오답노트
          </h1>
          <p>틀린 문제를 기록하고 가리며 똑똑하게 복습하세요</p>
        </div>
        <div className="header-controls">
          <div className={`server-badge ${serverStatus.connected ? 'online' : 'offline'}`} title={serverStatus.connected ? `구글 드라이브 PDF 연동 중 (${serverStatus.pdfCount}개 스캔됨)` : '로컬 백엔드 서버 연결 끊김'}>
            <span className="badge-dot"></span>
            {serverStatus.connected ? `교재/해설 연동 중 (${serverStatus.pdfCount}개)` : '로컬 서버 오프라인'}
          </div>

          {/* Color Theme Selector Pills */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              background: 'rgba(255,255,255,0.08)', 
              padding: '3px 6px', 
              borderRadius: 'var(--radius-pill)', 
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(12px)'
            }}
          >
            {[
              { id: 'white', emoji: '⚪', label: '퓨어 화이트' },
              { id: 'indigo', emoji: '🌌', label: '딥 스페이스' },
              { id: 'aurora', emoji: '🔮', label: '오로라 핑크' },
              { id: 'sage', emoji: '🌿', label: '세이지 에메랄드' },
              { id: 'amber', emoji: '🍯', label: '웜 앰버' },
              { id: 'sunset', emoji: '🌅', label: '선셋 트와일라잇' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setColorTheme(item.id)}
                title={`${item.label} 테마 적용`}
                style={{
                  background: colorTheme === item.id ? 'var(--accent-primary)' : 'transparent',
                  color: colorTheme === item.id ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.18s ease, box-shadow 0.18s ease',
                  boxShadow: colorTheme === item.id ? '0 2px 10px rgba(0,0,0,0.25)' : 'none'
                }}
              >
                {item.emoji} {item.label}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className={`settings-btn ${showSettings ? 'active' : ''}`}
            aria-label="설정"
            title="API Key 설정 및 백업 관리"
          >
            <SettingsIcon />
          </button>

          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn"
            aria-label="화면 테마 변경"
            title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      {/* TABS */}
      <DraggableTabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'library' ? (
        <div style={{ padding: '0 20px' }}>
          <Library />
        </div>
      ) : (
      <main className="app-main">
        {/* SETTINGS & BACKUP PANEL */}
      {showSettings && (
        <div className="settings-panel glass-panel animate-fade-in">
          <h3>⚙️ 시스템 및 AI 설정</h3>
          <form onSubmit={handleSaveApiKey} className="api-key-form">
            <div className="form-group">
              <label htmlFor="apiKeyInput">Gemini API Key</label>
              <input 
                type="password" 
                id="apiKeyInput" 
                name="apiKeyInput" 
                defaultValue={apiKey} 
                placeholder="AI 키를 입력하세요 (AI Studio에서 발급 가능)" 
                required
              />
              <p className="hint">API 키는 브라우저 로컬 저장소(localStorage)에 안전하게 보관됩니다.</p>
            </div>
            <div className="settings-actions">
              <button type="submit" className="btn btn-primary">API Key 저장</button>
              <button type="button" onClick={() => setShowSettings(false)} className="btn btn-secondary">닫기</button>
            </div>
          </form>

          {/* Sync group */}
          {serverStatus.connected && (
            <div className="settings-reindex-group">
              <h4>📚 구글 드라이브 동기화</h4>
              <p className="hint">구글 드라이브 폴더에 새 교재/해설지 PDF를 추가한 경우 아래 버튼을 눌러 동기화하세요.</p>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ width: 'fit-content', gap: '0.5rem' }} 
                onClick={handleForceReindex}
                disabled={reindexing}
              >
                <SyncIcon className={reindexing ? 'spin-icon' : ''} />
                {reindexing ? 'PDF 인덱스 스캔 중...' : '교재 파일 강제 동기화'}
              </button>
            </div>
          )}

          {/* Backup and Restore UI */}
          <div className="settings-backup-group">
            <h4>💾 데이터 백업 및 복원</h4>
            <button className="btn btn-secondary" onClick={handleExportData}>
              📥 오답 백업하기 (JSON 내보내기)
            </button>
            <button className="btn btn-secondary" onClick={triggerImportFile}>
              📤 오답 복원하기 (JSON 가져오기)
            </button>
            <input 
              type="file" 
              ref={fileInputImportRef} 
              onChange={handleImportData} 
              accept=".json" 
              style={{ display: 'none' }}
            />
          </div>
        </div>
      )}

      {/* ERROR MESSAGE BAR */}
      {errorMsg && (
        <div className="error-alert glass-panel animate-fade-in">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="close-alert-btn">×</button>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="app-content">
        
        {/* LEFT COLUMN: FORM PANEL */}
        <aside className="form-panel glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2>
            {editingId ? '오답 수정하기' : '새 오답 등록'}
            {editingId && <span className="edit-mode-badge">수정 중</span>}
          </h2>

          {/* AI CAMERA CAPTURE ZONE */}
          {!editingId && (
            <div className={`ai-upload-zone ${aiLoading ? 'loading' : ''}`} onClick={triggerFileInput}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                capture="environment" 
                style={{ display: 'none' }}
              />
              
              {aiLoading ? (
                <div className="ai-loader-container">
                  <div className="pulse-spinner"></div>
                  <p className="ai-status-text">{aiStatus}</p>
                </div>
              ) : (
                <>
                  <div className="ai-upload-icon-wrapper">
                    <CameraIcon />
                  </div>
                  <h3>사진 찍어 AI 문제 추가</h3>
                  <p>문제를 촬영하거나 이미지를 올리면 AI가 풀이해 드립니다.</p>
                  <span className="drive-match-hint">※ 구글 드라이브 내 교재/해설지 PDF 자동 연동 검색</span>
                </>
              )}
            </div>
          )}
          
          <form onSubmit={handleFormSubmit} className="problem-form">
            {/* Primary Reference Badge */}
            {formData.pdfReference && (
              <div className="pdf-reference-badge animate-fade-in" style={{ borderColor: isSolutionFile(formData.pdfReference.pdfName) ? 'rgba(16, 185, 129, 0.3)' : 'rgba(6, 182, 212, 0.3)', background: isSolutionFile(formData.pdfReference.pdfName) ? 'rgba(16, 185, 129, 0.05)' : 'rgba(6, 182, 212, 0.05)' }}>
                <span className="badge-icon">📖</span>
                <div className="badge-text">
                  <strong>{isSolutionFile(formData.pdfReference.pdfName) ? '해설지 연동:' : '교재 지문 연동:'}</strong> {formData.pdfReference.pdfName} ({formData.pdfReference.pageNumber}페이지)
                </div>
                <button 
                  type="button" 
                  className="remove-ref-btn" 
                  onClick={() => setFormData(prev => ({ ...prev, pdfReference: null }))}
                  title="연동 해제"
                >
                  ×
                </button>
              </div>
            )}

            {/* Secondary Reference Badge */}
            {formData.pdfReferenceSecondary && (
              <div className="pdf-reference-badge animate-fade-in" style={{ borderColor: isSolutionFile(formData.pdfReferenceSecondary.pdfName) ? 'rgba(16, 185, 129, 0.3)' : 'rgba(6, 182, 212, 0.3)', background: isSolutionFile(formData.pdfReferenceSecondary.pdfName) ? 'rgba(16, 185, 129, 0.05)' : 'rgba(6, 182, 212, 0.05)' }}>
                <span className="badge-icon">📖</span>
                <div className="badge-text">
                  <strong>{isSolutionFile(formData.pdfReferenceSecondary.pdfName) ? '해설지 연동:' : '교재 지문 연동:'}</strong> {formData.pdfReferenceSecondary.pdfName} ({formData.pdfReferenceSecondary.pageNumber}페이지)
                </div>
                <button 
                  type="button" 
                  className="remove-ref-btn" 
                  onClick={() => setFormData(prev => ({ ...prev, pdfReferenceSecondary: null }))}
                  title="연동 해제"
                >
                  ×
                </button>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="subject">과목</label>
                <select 
                  id="subject" 
                  name="subject" 
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                >
                  <option value="수학">수학</option>
                  <option value="영어">영어</option>
                  <option value="직접 입력">직접 입력...</option>
                </select>
              </div>

              {SUB_SUBJECTS[formData.subject] && SUB_SUBJECTS[formData.subject].length > 0 && (
                <div className="form-group">
                  <label htmlFor="subSubject">세부 과목 (단원)</label>
                  <select 
                    id="subSubject" 
                    name="subSubject" 
                    value={formData.subSubject}
                    onChange={handleInputChange}
                    required
                  >
                    {SUB_SUBJECTS[formData.subject].map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>난이도</label>
                <div className="star-rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="star-btn"
                      onClick={() => handleDifficultyChange(star)}
                      title={`${star}점`}
                    >
                      <StarIcon filled={star <= formData.difficulty} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {formData.subject === '직접 입력' && (
              <div className="form-group animate-fade-in">
                <label htmlFor="customSubject">과목 직접 입력</label>
                <input 
                  type="text" 
                  id="customSubject" 
                  name="customSubject" 
                  placeholder="예: 사회, 역사" 
                  value={formData.customSubject}
                  onChange={handleInputChange}
                  required={formData.subject === '직접 입력'}
                  maxLength={15}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="textbook">교재 / 출처 분류 <span style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 400 }}>(선택)</span></label>
              <input 
                type="text" 
                id="textbook" 
                name="textbook" 
                placeholder="예: 2025 편입수학 기출, 마더텅..." 
                value={formData.textbook || ''}
                onChange={handleInputChange}
                maxLength={40}
              />
            </div>

            <div className="form-group">
              <label htmlFor="title">문제 제목 <span style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 400 }}>(선택)</span></label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                placeholder="예: 2026 수능 대비 모의고사 15번" 
                value={formData.title}
                onChange={handleInputChange}
                maxLength={40}
              />
            </div>

            <div className="form-group">
              <label htmlFor="question">문제 내용</label>
              <textarea 
                id="question" 
                name="question" 
                placeholder="질문이나 문제를 입력하세요..." 
                value={formData.question}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="mySolution">내 풀이 <span style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 400 }}>(선택 사항 - 미입력 가능)</span></label>
              <textarea 
                id="mySolution" 
                name="mySolution" 
                placeholder="자신이 풀었던 방식을 적어보세요... (선택 사항)" 
                value={formData.mySolution}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="correctAnswer">정답</label>
                <input 
                  type="text" 
                  id="correctAnswer" 
                  name="correctAnswer" 
                  placeholder="답안을 입력하세요..." 
                  value={formData.correctAnswer}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="explanation">해설 및 오답 분석</label>
              <textarea 
                id="explanation" 
                name="explanation" 
                placeholder="올바른 풀이법 및 오답 원인을 정리하세요..." 
                value={formData.explanation}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {editingId ? '수정 완료' : '오답 저장'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">
                  취소
                </button>
              )}
            </div>
          </form>
        </aside>

        {/* RIGHT COLUMN: SEARCH & LIST PANEL */}
        <main className="list-panel">

          {/* PRINT ONLY WORKBOOK HEADER */}
          <div className="print-only-header">
            <h2>📄 스마트 오답노트 - 선택 문항 모음집 (PDF)</h2>
            <p>생성일시: {new Date().toLocaleDateString('ko-KR')} | 선택된 문제 수: {selectedForPrint.size || filteredProblems.length}개</p>
          </div>
          
          {/* PRINT & BULK ACTIONS CONTROL BLOCK */}
          {selectedForPrint.size > 0 && (
            <div className="print-actions-card glass-panel animate-fade-in" style={{ borderColor: 'var(--accent-secondary)' }}>
              <span>🛠️ 선택된 문항: <strong>{selectedForPrint.size}</strong>개</span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-primary" onClick={handlePrintExam}>📄 선택 문항 통합 PDF 다운로드</button>
                <button className="btn btn-danger" onClick={handleBulkDelete}>선택 일괄 삭제</button>
                <button className="btn btn-secondary" onClick={clearPrintSelection}>선택 해제</button>
              </div>
            </div>
          )}

          {/* SEARCH & FILTERS CARD */}
          <div className="search-filter-card glass-panel animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="search-bar-wrapper">
              <SearchIcon />
              <input 
                type="text" 
                className="search-input" 
                placeholder="제목, 교재명, 문제 내용, 해설, 연동 PDF 키워드로 검색..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-row">
              <select 
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">최신 등록순</option>
                <option value="oldest">오래된 등록순</option>
                <option value="difficulty">난이도 높은순</option>
              </select>

              <select 
                className="filter-select"
                value={selectedTextbook}
                onChange={(e) => setSelectedTextbook(e.target.value)}
              >
                <option value="전체">📚 모든 교재 분류 ({problems.length})</option>
                {allTextbooks.map(tb => (
                  <option key={tb} value={tb}>📚 {tb} ({problems.filter(p => (p.textbook || '자체 오답노트') === tb).length})</option>
                ))}
              </select>

              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)' }}
                onClick={handleSelectAllFiltered}
              >
                {filteredProblems.every(p => selectedForPrint.has(p.id)) && filteredProblems.length > 0 ? '☑️ 선택 해제' : '☑️ 현재 화면 문항 전체 선택'}
              </button>

              <div className="filter-tags-list">
                <button 
                  className={`filter-tag-chip ${selectedTag === '전체' ? 'active' : ''}`}
                  onClick={() => setSelectedTag('전체')}
                >
                  전체 ({problems.length})
                </button>

                {/* Spaced Repetition Due Filter Tag */}
                <button 
                  className={`filter-tag-chip ${selectedTag === '⏰ 오늘 복습' ? 'active' : ''}`}
                  onClick={() => setSelectedTag('⏰ 오늘 복습')}
                  style={{ border: '1px solid var(--accent-danger)' }}
                >
                  ⏰ 오늘 복습 ({dueReviewCount})
                </button>

                {allTags.map((tag) => {
                  const count = problems.filter(p => p.subject === tag).length;
                  return (
                    <button 
                      key={tag}
                      className={`filter-tag-chip ${selectedTag === tag ? 'active' : ''}`}
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="stats-info">
                검색 결과: <strong>{filteredProblems.length}</strong>개
              </div>
            </div>
          </div>

          {/* PROBLEM LIST */}
          <div className="problems-list">
            {filteredProblems.length > 0 ? (
              filteredProblems.map((problem, index) => {
                const isExpanded = expandedCards.has(problem.id);
                const isRevealed = revealedAnswers.has(problem.id);
                const isTesting = activeTestCard === problem.id;
                const ddayInfo = getDDayInfo(problem);

                return (
                  <article 
                    key={problem.id} 
                    className={`problem-card glass-panel animate-fade-in ${selectedForPrint.size > 0 && !selectedForPrint.has(problem.id) ? 'no-print' : ''}`}
                    style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                  >
                    {/* Header */}
                    <div className="card-header" onClick={() => toggleCardExpand(problem.id)} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        {/* Print Selector Checkbox */}
                        <div className="print-selection-wrapper" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="print-checkbox" 
                            title="일괄 처리 선택"
                            checked={selectedForPrint.has(problem.id)}
                            onChange={(e) => handleTogglePrintSelect(problem.id, e)}
                          />
                        </div>

                        <div>
                          <div className="card-meta">
                            <span className="subject-badge">{problem.subject}{problem.subSubject ? ` > ${problem.subSubject}` : ''}</span>
                            <span className="subject-badge" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-primary)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
                              📚 {problem.textbook || '자체 오답노트'}
                            </span>
                            <span className="card-date">{formatDate(problem.createdAt)}</span>
                            <div className="difficulty-stars" title={`난이도: ${problem.difficulty}`}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <StarIcon key={star} filled={star <= problem.difficulty} style={{ fontSize: '0.8rem' }} />
                              ))}
                            </div>

                            {/* Leitner Level Badge */}
                            <span className={`review-level-badge level-${problem.reviewLevel || 0}`}>
                              Lv.{problem.reviewLevel || 0}
                            </span>
                            
                            {/* D-Day badge */}
                            <span className={`review-dday-indicator ${ddayInfo.type}`}>
                              {ddayInfo.text}
                            </span>

                            {/* PDF References */}
                            {problem.pdfReference && (
                              <span 
                                className="pdf-linked-tag" 
                                style={{ borderColor: isSolutionFile(problem.pdfReference.pdfName) ? 'rgba(16, 185, 129, 0.3)' : 'rgba(6, 182, 212, 0.3)', background: isSolutionFile(problem.pdfReference.pdfName) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)', color: isSolutionFile(problem.pdfReference.pdfName) ? '#34d399' : '#22d3ee' }} 
                                title="클릭 시 로컬 PDF 리더로 열기"
                                onClick={(e) => handleOpenPdf(problem.pdfReference, e)}
                              >
                                🔗 {isSolutionFile(problem.pdfReference.pdfName) ? '해설지' : '교재'} 열기
                              </span>
                            )}
                            {problem.pdfReferenceSecondary && (
                              <span 
                                className="pdf-linked-tag" 
                                style={{ borderColor: isSolutionFile(problem.pdfReferenceSecondary.pdfName) ? 'rgba(16, 185, 129, 0.3)' : 'rgba(6, 182, 212, 0.3)', background: isSolutionFile(problem.pdfReferenceSecondary.pdfName) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)', color: isSolutionFile(problem.pdfReferenceSecondary.pdfName) ? '#34d399' : '#22d3ee' }} 
                                title="클릭 시 로컬 PDF 리더로 열기"
                                onClick={(e) => handleOpenPdf(problem.pdfReferenceSecondary, e)}
                              >
                                🔗 {isSolutionFile(problem.pdfReferenceSecondary.pdfName) ? '해설지' : '교재'} 열기
                              </span>
                            )}
                          </div>
                          
                          <h3 className="card-title">
                            {highlightText(problem.title, searchQuery)}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button 
                          className="card-action-btn edit-btn" 
                          onClick={(e) => handleEditClick(problem, e)}
                          title="오답 노트 수정"
                        >
                          <EditIcon />
                        </button>
                        <button 
                          className="card-action-btn delete-btn" 
                          onClick={(e) => handleDeleteClick(problem.id, e)}
                          title="오답 노트 삭제"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>

                    {/* Accordion Body */}
                    {isExpanded && (
                      <div className="card-body animate-fade-in">
                        {/* PDF Reference 1 Info */}
                        {problem.pdfReference && (
                          <div className="section-box pdf-reference-info-box" style={{ borderColor: isSolutionFile(problem.pdfReference.pdfName) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)', background: isSolutionFile(problem.pdfReference.pdfName) ? 'rgba(16, 185, 129, 0.03)' : 'rgba(6, 182, 212, 0.03)' }}>
                            <div className="section-label" style={{ color: isSolutionFile(problem.pdfReference.pdfName) ? 'var(--accent-success)' : 'var(--accent-info)', marginBottom: '0.25rem' }}>
                              📚 연동된 구글 드라이브 {isSolutionFile(problem.pdfReference.pdfName) ? '해설지' : '교재 지문'} 정보
                            </div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                              {problem.pdfReference.pdfName} ({problem.pdfReference.pageNumber} 페이지)
                            </p>
                            {problem.pdfReference.matchedSnippet && (
                              <p className="pdf-snippet-text" style={{ borderLeftColor: isSolutionFile(problem.pdfReference.pdfName) ? 'var(--accent-success)' : 'var(--accent-info)' }}>
                                ... <LatexText text={problem.pdfReference.matchedSnippet} highlight={searchQuery} /> ...
                              </p>
                            )}
                          </div>
                        )}

                        {/* PDF Reference 2 Info */}
                        {problem.pdfReferenceSecondary && (
                          <div className="section-box pdf-reference-info-box" style={{ borderColor: isSolutionFile(problem.pdfReferenceSecondary.pdfName) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)', background: isSolutionFile(problem.pdfReferenceSecondary.pdfName) ? 'rgba(16, 185, 129, 0.03)' : 'rgba(6, 182, 212, 0.03)' }}>
                            <div className="section-label" style={{ color: isSolutionFile(problem.pdfReferenceSecondary.pdfName) ? 'var(--accent-success)' : 'var(--accent-info)', marginBottom: '0.25rem' }}>
                              📚 연동된 구글 드라이브 {isSolutionFile(problem.pdfReferenceSecondary.pdfName) ? '해설지' : '교재 지문'} 정보
                            </div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                              {problem.pdfReferenceSecondary.pdfName} ({problem.pdfReferenceSecondary.pageNumber} 페이지)
                            </p>
                            {problem.pdfReferenceSecondary.matchedSnippet && (
                              <p className="pdf-snippet-text" style={{ borderLeftColor: isSolutionFile(problem.pdfReferenceSecondary.pdfName) ? 'var(--accent-success)' : 'var(--accent-info)' }}>
                                ... <LatexText text={problem.pdfReferenceSecondary.matchedSnippet} highlight={searchQuery} /> ...
                              </p>
                            )}
                          </div>
                        )}

                        {/* Question and AI Guide Side-by-Side Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                          {/* 1. Question Section */}
                          <div className="section-box" style={{ margin: 0 }}>
                            <div className="section-label label-question">
                              <span>❓</span> 문제 내용
                            </div>
                            <div className="section-text">
                              <LatexText text={problem.question} highlight={searchQuery} />
                              {problem.imageUrl && (
                                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed var(--glass-border)' }}>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span>📸</span> 실제 시험지 원본 이미지 (기호/그림 100% 보존)
                                  </div>
                                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                                    <img 
                                      src={problem.imageUrl} 
                                      alt="실제 시험지 문제 양식 이미지" 
                                      style={{ maxWidth: '100%', display: 'block', borderRadius: 'var(--radius-sm)', cursor: 'zoom-in' }} 
                                      onClick={() => window.open(problem.imageUrl, '_blank')}
                                      title="클릭하여 새 탭에서 원본 해상도로 확대 보기"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 1.5. AI Approach Guide Table */}
                          {problem.approachGuide ? (
                            <div className="section-box approach-section animate-fade-in" style={{ margin: 0, height: '100%' }}>
                              <div className="section-label" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <SparklesIcon />
                                <span>AI 문제 접근법 상세 공략표</span>
                              </div>
                            <table className="approach-table">
                              <tbody>
                                <tr>
                                  <th>🔑 핵심 개념</th>
                                  <td>
                                    <LatexText text={problem.approachGuide.keyConcept} highlight={searchQuery} />
                                  </td>
                                </tr>
                                <tr>
                                  <th>🎯 발문 단서</th>
                                  <td>
                                    <LatexText text={problem.approachGuide.clueWord} highlight={searchQuery} />
                                  </td>
                                </tr>
                                <tr>
                                  <th>🏃 3단계 공략</th>
                                  <td>
                                    <ol className="approach-step-list">
                                      {problem.approachGuide.stepByStep?.map((step, sIdx) => (
                                        <li key={sIdx}>
                                          <LatexText text={step} highlight={searchQuery} />
                                        </li>
                                      ))}
                                    </ol>
                                  </td>
                                </tr>
                                <tr>
                                  <th>⚠️ 함정 피하기</th>
                                  <td className="pitfall-warning-text">
                                    <LatexText text={problem.approachGuide.pitfall} highlight={searchQuery} />
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="section-box" style={{ background: 'rgba(255, 255, 255, 0.01)', borderStyle: 'dashed', textAlign: 'left' }}>
                            <div className="section-label" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <SparklesIcon />
                              <span>AI 문제 접근 공략</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              이 문제의 핵심 이론, 발문 단서, 단계별 행동 전략 및 주의할 함정 표를 생성합니다.
                            </p>
                            <button
                              type="button"
                              className="btn-ai-analyze"
                              disabled={analyzingIds.has(problem.id)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAnalyzeApproach(problem.id, problem.question, problem.subject);
                              }}
                            >
                              <SparklesIcon className={analyzingIds.has(problem.id) ? 'spin-icon' : ''} />
                              {analyzingIds.has(problem.id) ? 'AI 분석 중...' : 'AI 문제 접근법 상세 안내표 생성'}
                            </button>
                          </div>
                        )}
                        </div>

                        {/* Printable working space */}
                        <div className="print-workspace"></div>

                        {/* 2. My Solution Section (Optional) */}
                        {problem.mySolution && problem.mySolution.trim() !== '' && (
                          <div className="section-box">
                            <div className="section-label label-my-sol">
                              <span>✏️</span> 내 풀이
                            </div>
                            <div className="section-text">
                              <LatexText text={problem.mySolution} highlight={searchQuery} />
                            </div>
                          </div>
                        )}

                        {/* Spaced repetition footer & practice test trigger */}
                        {!isTesting && (
                          <div className="spaced-repetition-footer">
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              현재 복습 레벨: <strong>Lv.{problem.reviewLevel || 0}</strong>
                            </span>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem', minHeight: 'auto' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTestCard(problem.id);
                                if (!isRevealed) toggleAnswerReveal(problem.id);
                              }}
                            >
                              🔥 지금 바로 복습 테스트
                            </button>
                          </div>
                        )}

                        {/* Leitner Test box panel */}
                        {isTesting && (
                          <div className="leitner-test-box animate-fade-in">
                            <h4>📝 복습 테스트 완료 판정</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              문제 풀이가 어떠셨나요? 정답 해설을 보시고 아래 결과를 정직하게 기록해 주세요.
                            </p>
                            
                            {!isRevealed ? (
                              <button 
                                className="btn btn-primary" 
                                style={{ margin: '0.5rem auto 0', width: 'fit-content' }}
                                onClick={() => toggleAnswerReveal(problem.id)}
                              >
                                👀 정답 해설 확인하기
                              </button>
                            ) : (
                              <div className="leitner-test-actions">
                                <button 
                                  className="btn btn-success" 
                                  onClick={() => handleLeitnerResult(problem.id, true)}
                                >
                                  👍 정답을 맞혔습니다 (레벨 업)
                                </button>
                                <button 
                                  className="btn btn-danger" 
                                  onClick={() => handleLeitnerResult(problem.id, false)}
                                >
                                  👎 틀렸습니다 (처음부터 다시)
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Practice / Reveal Answer Area */}
                        {!isTesting && !isRevealed ? (
                          <div className="practice-reveal-section">
                            <span className="practice-text">🤔 정답과 풀이법을 다시 맞혀보세요. 준비가 되면 아래 버튼을 누르세요.</span>
                            <button 
                              className="btn btn-primary reveal-btn"
                              onClick={(e) => toggleAnswerReveal(problem.id, e)}
                            >
                              👀 정답 및 해설 확인하기
                            </button>
                          </div>
                        ) : (
                          (!isTesting || isRevealed) && (
                            <>
                              {/* 3. Correct Answer Section */}
                              <div className="section-box animate-fade-in">
                                <div className="section-label label-correct" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                  <span>✅ 정답</span>
                                  {!isTesting && (
                                    <button 
                                      className="btn btn-secondary" 
                                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', minHeight: 'auto' }}
                                      onClick={(e) => toggleAnswerReveal(problem.id, e)}
                                    >
                                      정답 가리기
                                    </button>
                                  )}
                                </div>
                                <div className="section-text" style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>
                                  <LatexText text={problem.correctAnswer} highlight={searchQuery} />
                                </div>
                              </div>

                              {/* 4. Explanation Section */}
                              <div className="section-box animate-fade-in">
                                <div className="section-label label-exp">
                                  <span>📖 해설 및 오답 분석</span>
                                </div>
                                <div className="section-text">
                                  <LatexText text={problem.explanation} highlight={searchQuery} />
                                </div>
                              </div>
                            </>
                          )
                        )}

                        {/* 5. Review History Timeline Log */}
                        {problem.reviewHistory && problem.reviewHistory.length > 0 && (
                          <div className="review-history-section">
                            <div className="section-label" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              📈 복습 이력 타임라인 ({problem.reviewHistory.length}회 수행)
                            </div>
                            <div className="history-timeline">
                              {problem.reviewHistory.map((hist, idx) => (
                                <div className="timeline-item" key={idx}>
                                  <div className={`timeline-dot ${hist.passed ? 'passed' : 'failed'}`}></div>
                                  <div className="timeline-content">
                                    <span>
                                      Lv.{hist.levelFrom} ➔ Lv.{hist.levelTo} ({hist.passed ? '성공' : '실패'})
                                    </span>
                                    <span className="timeline-date">{formatDate(hist.date)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                    {/* Expand/Collapse Toggle Footer */}
                    <div className="expand-toggle" onClick={() => toggleCardExpand(problem.id)}>
                      <span>{isExpanded ? '상세 정보 접기' : '상세 정보 펼치기 (내 풀이, 정답, 해설)'}</span>
                      <ChevronDownIcon className={`expand-icon ${isExpanded ? 'expanded' : ''}`} />
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="empty-state glass-panel animate-fade-in">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
                <h3>저장된 오답이 없습니다</h3>
                <p>
                  {searchQuery || selectedTag !== '전체' 
                    ? '검색어 또는 필터 조건에 맞는 오답을 찾을 수 없습니다. 조건을 변경해보세요.'
                    : selectedTag === '⏰ 오늘 복습'
                      ? '오늘 복습해야 할 오답이 없습니다! 다 복습하셨거나 복습 대상이 아직 없습니다.'
                      : '왼쪽 입력 폼의 [사진 찍어 AI 문제 추가] 버튼을 눌러보거나 수동으로 문제를 등록해보세요!'}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </main>
  )}
</div>
);
}export default App;
