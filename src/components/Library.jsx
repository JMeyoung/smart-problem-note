import React, { useState, useEffect } from 'react';

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

const FolderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'8px'}}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const StarIcon = ({ isFavorite, onClick }) => (
  <svg 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    width="16" height="16" viewBox="0 0 24 24" 
    fill={isFavorite ? "#f59e0b" : "none"} 
    stroke={isFavorite ? "#f59e0b" : "currentColor"} 
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    style={{marginLeft:'auto', cursor:'pointer', color: isFavorite ? '#f59e0b' : 'var(--text-muted)'}}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const PdfIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'8px', flexShrink: 0}}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const TrashIcon = ({ onClick }) => (
  <svg 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    style={{marginLeft:'6px', cursor:'pointer', color: 'var(--text-muted)'}}
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const TreeNode = ({ node, onFileClick, favorites, onToggleFavorite, onDeleteFile }) => {
  const [isOpen, setIsOpen] = useState(() => {
    return node.name === '⭐ 즐겨찾기' || 
           node.name.includes('편입 수학') || 
           node.name.includes('교재') ||
           node.name.includes('문법') ||
           node.name.includes('어휘') ||
           node.name.includes('최종본');
  });

  const displayName = node.name.replace(/고득점\s*완성\s*(혼합형\s*)?문제풀이/g, '고완풀');

  if (node.type === 'directory') {
    return (
      <div style={{ marginLeft: '20px', marginTop: '8px' }}>
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold', padding: '4px 0', overflow: 'hidden' }}
        >
          <span style={{ display: 'inline-block', width: '16px', marginRight: '4px', flexShrink: 0, transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
          {node.name === '⭐ 즐겨찾기' ? <span style={{marginRight:'8px', fontSize:'1.1rem', flexShrink: 0}}>⭐</span> : <FolderIcon />}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }} title={node.name}>{displayName}</span>
        </div>
        {isOpen && node.children && (
          <div className="animate-fade-in">
            {node.children.map((child, idx) => (
              <TreeNode key={idx} node={child} onFileClick={onFileClick} favorites={favorites} onToggleFavorite={onToggleFavorite} onDeleteFile={onDeleteFile} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isFavorite = favorites.has(node.id);
  const isUploaded = node.id && node.id.includes('업로드한 교재/');

  return (
    <div 
      style={{ marginLeft: '44px', padding: '6px 0', display: 'flex', alignItems: 'center', cursor: 'pointer', opacity: 0.9, paddingRight: '8px' }}
      onClick={() => onFileClick(node)}
      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
      onMouseLeave={(e) => e.currentTarget.style.opacity = 0.9}
    >
      <PdfIcon />
      <span style={{ fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={node.name}>{displayName}</span>
      <StarIcon isFavorite={isFavorite} onClick={() => onToggleFavorite(node.id)} />
      {isUploaded && <TrashIcon onClick={() => onDeleteFile(node)} />}
    </div>
  );
};

export default function Library({ onOpenPdfExternally }) {
  const [libraryData, setLibraryData] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [recentFiles, setRecentFiles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('smart_problem_note_recent_files') || '[]');
    } catch {
      return [];
    }
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [isFlatView, setIsFlatView] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert('PDF 파일만 업로드할 수 있습니다.');
        return;
      }
      const fakeEvent = { target: { files: [file] } };
      handleUploadFile(fakeEvent);
    }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('PDF 파일만 업로드할 수 있습니다.');
      return;
    }
    
    setUploading(true);
    setUploadProgress('업로드 중...');
    
    const formData = new FormData();
    formData.append('pdf', file);
    
    try {
      const res = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData
      });
      const data = await parseApiResponse(res);
      if (data.success) {
        setUploadProgress('성공! 분석 중...');
        setTimeout(() => {
          setUploadProgress('');
          setUploading(false);
          fetchLibrary();
        }, 1500);
      } else {
        alert(data.error || '업로드 실패');
        setUploading(false);
        setUploadProgress('');
      }
    } catch (err) {
      console.error(err);
      alert('업로드 중 오류 발생');
      setUploading(false);
      setUploadProgress('');
    }
  };
  
  const buildVirtualFolders = (libData, favSet, recents) => {
    let newLibData = [...libData];
    
    // Add favorites
    const favFiles = [];
    const findFavs = (nodes) => {
      nodes.forEach(n => {
        if (n.type === 'file' && favSet.has(n.id)) favFiles.push(n);
        else if (n.children) findFavs(n.children);
      });
    };
    findFavs(libData);
    
    if (favFiles.length > 0) {
      newLibData = [{ name: '⭐ 즐겨찾기', type: 'directory', children: favFiles }, ...newLibData];
    }
    
    // Add recents (only if they still exist in the library data)
    const allValidIds = new Set();
    const collectIds = (nodes) => {
      nodes.forEach(n => {
        if (n.type === 'file') allValidIds.add(n.id);
        else if (n.children) collectIds(n.children);
      });
    };
    collectIds(libData);

    const validRecents = (recents || []).filter(f => allValidIds.has(f.id));
    if (validRecents.length > 0) {
      newLibData = [{ name: '🕒 최근 열어본 파일', type: 'directory', children: validRecents }, ...newLibData];
    }
    
    return newLibData;
  };

  const fetchLibrary = async () => {
    try {
      const [libRes, favRes] = await Promise.all([
        fetch('/api/library'),
        fetch('/api/favorites')
      ]);
      const libData = await parseApiResponse(libRes);
      const favData = await parseApiResponse(favRes);
      
      if (libData.error) throw new Error(libData.error);
      
      const favSet = new Set(favData.favorites || []);
      setFavorites(favSet);
      const filterTree = (nodes, parentName = '') => {
        return nodes.filter(n => {
          if (n.type === 'directory' && n.name.startsWith('3.') && parentName.includes('미분')) {
            return false;
          }
          if (n.children) {
            n.children = filterTree(n.children, n.name);
          }
          return true;
        });
      };

      const filteredLibrary = filterTree(libData.library);
      setLibraryData(buildVirtualFolders(filteredLibrary, favSet, recentFiles));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleToggleFavorite = async (fileId) => {
    const isFav = favorites.has(fileId);
    try {
      const res = await fetch(`/api/favorites${isFav ? '/' + fileId : ''}`, {
        method: isFav ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: isFav ? null : JSON.stringify({ fileId })
      });
      const data = await res.json();
      if (data.success) {
        const newFavSet = new Set(data.favorites);
        setFavorites(newFavSet);
        
        // Rebuild virtual folders without fetching from network
        setLibraryData(prev => {
          const originalTree = prev.filter(n => n.name !== '⭐ 즐겨찾기' && n.name !== '🕒 최근 열어본 파일');
          return buildVirtualFolders(originalTree, newFavSet, recentFiles);
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFile = async (node) => {
    if (!window.confirm(`'${node.name}' 파일을 정말 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/upload-pdf?id=${encodeURIComponent(node.id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchLibrary(); // Refresh library
        if (selectedPdf && selectedPdf.id === node.id) {
          setSelectedPdf(null);
        }
      } else {
        alert(data.error || '삭제 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search-pdf?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  

  const handleFileClick = (fileNode) => {
    setSelectedPdf(fileNode);
    
    // Update recent files
    const newRecent = [fileNode, ...recentFiles.filter(f => f.id !== fileNode.id)].slice(0, 5);
    localStorage.setItem('smart_problem_note_recent_files', JSON.stringify(newRecent));
    setRecentFiles(newRecent);
    
    setLibraryData(prev => {
      const originalTree = prev.filter(n => n.name !== '⭐ 즐겨찾기' && n.name !== '🕒 최근 열어본 파일');
      return buildVirtualFolders(originalTree, favorites, newRecent);
    });
  };

  const handlePrint = async () => {
    if (!selectedPdf) return;
    setIsPrinting(true);
    try {
      const pdfUrl = selectedPdf.id ? `/api/pdf/${selectedPdf.id}` : `/api/pdf-by-name/${encodeURIComponent(selectedPdf.name)}`;
      
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const printIframe = document.createElement('iframe');
      printIframe.style.display = 'none';
      printIframe.src = blobUrl;
      
      document.body.appendChild(printIframe);
      
      printIframe.onload = () => {
        try {
          printIframe.contentWindow.focus();
          printIframe.contentWindow.print();
        } catch (e) {
          console.error('Print error:', e);
          window.open(blobUrl, '_blank'); // fallback
        }
        setTimeout(() => {
          document.body.removeChild(printIframe);
          URL.revokeObjectURL(blobUrl);
          setIsPrinting(false);
        }, 10000);
      };
    } catch (err) {
      console.error(err);
      setIsPrinting(false);
      alert('프린트를 준비하는 중 오류가 발생했습니다.');
    }
  };

  const openExternal = async () => {
    if (!selectedPdf) return;
    if (selectedPdf.id && !selectedPdf.id.startsWith('local__')) {
      window.open('/api/pdf/' + selectedPdf.id, '_blank'); // Wait, the backend already handles Google Drive files with /api/pdf/:id
    } else {
      window.open('/api/pdf/' + encodeURIComponent(selectedPdf.id || '') + '?name=' + encodeURIComponent(selectedPdf.name), '_blank');
    }
  };

  return (
    <div 
      className="library-container flex gap-6" 
      style={{ height: 'calc(100vh - 90px)', position: 'relative' }}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
    >
      {isDragActive && (
        <div 
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onDragOver={handleDrag}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            border: '4px dashed #3b82f6',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            pointerEvents: 'all'
          }}
        >
          <div style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            padding: '2rem 4rem', 
            borderRadius: 'var(--radius-lg)', 
            boxShadow: 'var(--shadow-xl)',
            color: '#60a5fa',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            textAlign: 'center',
            border: '1px solid var(--glass-border)',
            pointerEvents: 'none'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📥</div>
            PDF 파일을 화면에 놓아서 바로 업로드하세요
          </div>
        </div>
      )}
      {/* Sidebar Tree */}
      <div 
        className="glass-panel" 
        style={{ 
          width: '250px', 
          padding: '1.2rem 0.5rem 1.2rem 1.2rem', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          boxSizing: 'border-box'
        }}
      >
        <h2 style={{ display: 'flex', alignItems: 'center', margin: '0 0 0.5rem 0', paddingRight: '1rem', fontSize: '1.1rem' }}>
          <FolderIcon /> 내 드라이브 파일함
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted-dark)', marginBottom: '10px', paddingRight: '1rem' }}>
          수학, 영어 및 어휘 관련 PDF 파일들을 탐색하세요.
        </p>

        <div style={{ marginBottom: '1rem', paddingRight: '1rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label 
              style={{
                display: 'block',
                padding: '0.6rem',
                fontSize: '0.82rem',
                fontWeight: 'bold',
                textAlign: 'center',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#60a5fa',
                border: '1px dashed rgba(59, 130, 246, 0.3)',
                borderRadius: 'var(--radius-md)',
                cursor: uploading ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease, border-color 0.2s ease'
              }}
            >
              {uploading ? uploadProgress : '📤 교재/해설 PDF 업로드'}
              <input 
                type="file" 
                accept=".pdf" 
                disabled={uploading} 
                onChange={handleUploadFile} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>

          <input
            type="text"
            className="input-field"
            placeholder="🔍 파일명/본문 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}
          />
          <button 
            onClick={() => setIsFlatView(!isFlatView)}
            style={{ 
              width: '100%', 
              padding: '0.4rem', 
              fontSize: '0.8rem', 
              backgroundColor: isFlatView ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-tertiary)', 
              color: isFlatView ? '#34d399' : 'var(--text-primary)',
              border: `1px solid ${isFlatView ? 'rgba(16, 185, 129, 0.3)' : 'var(--glass-border)'}`,
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            {isFlatView ? '📂 폴더 구조로 보기' : '📄 모든 파일 한눈에 보기'}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }}>
        {loading ? (
          <p>스캔 중입니다...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : searchResults ? (
          <div className="search-results animate-fade-in">
            {isSearching && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>검색 중...</p>}
            {!isSearching && searchResults.length === 0 && <p style={{ fontSize: '0.85rem' }}>검색 결과가 없습니다.</p>}
            {searchResults.map((res, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedPdf({ id: res.pdfId, name: res.pdfName })}
                style={{ 
                  padding: '10px', 
                  marginBottom: '8px', 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  borderRadius: 'var(--radius-sm)', 
                  cursor: 'pointer',
                  border: '1px solid var(--glass-border)'
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '4px' }}>
                  📄 {res.pdfName} (p.{res.pageNumber})
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  "{res.snippet}"
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="tree-root">
            {isFlatView ? (() => {
              const flatFiles = [];
              const flatten = (nodes) => {
                nodes.forEach(n => {
                  if (n.type === 'file') {
                    // Avoid duplicates if a file is both in ⭐ 즐겨찾기 and its original folder
                    if (!flatFiles.find(f => f.id === n.id)) {
                      flatFiles.push(n);
                    }
                  }
                  if (n.children) flatten(n.children);
                });
              };
              flatten(libraryData);
              return flatFiles.map((file, idx) => (
                <TreeNode 
                  key={idx} 
                  node={file} 
                  onFileClick={handleFileClick} 
                  favorites={favorites} 
                  onToggleFavorite={handleToggleFavorite} 
                  onDeleteFile={handleDeleteFile}
                />
              ));
            })() : libraryData.map((rootNode, idx) => (
              <TreeNode key={idx} node={rootNode} onFileClick={handleFileClick} favorites={favorites} onToggleFavorite={handleToggleFavorite} onDeleteFile={handleDeleteFile} />
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-panel flex-col" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        {selectedPdf ? (
          <div className="flex-col" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ margin: 0, wordBreak: 'break-all', fontSize: '1.2rem' }}>📄 {selectedPdf.name}</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={handlePrint} 
                  disabled={isPrinting}
                  className="btn btn-secondary">
                  {isPrinting ? '🖨️ 준비 중...' : '🖨️ 프린트'}
                </button>
                <button onClick={openExternal} className="btn btn-secondary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  새 창으로 열기
                </button>
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--panel-border)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
               <iframe 
                 id="pdf-preview-frame"
                 src={selectedPdf.id && !selectedPdf.id.startsWith('local__') ? `https://drive.google.com/file/d/${selectedPdf.id}/preview` : `/api/pdf/${encodeURIComponent(selectedPdf.id || '')}?name=${encodeURIComponent(selectedPdf.name)}`}
                 title="PDF Preview"
                 style={{ border: 'none', backgroundColor: '#fff', width: '100%', height: '100%', flex: 1 }}
                 allow="autoplay"
               />
            </div>
          </div>
        ) : (
          <div className="flex-col items-center justify-center" style={{ height: '100%', color: 'var(--text-muted-dark)' }}>
            <FolderIcon />
            <p style={{ marginTop: '16px', fontSize: '1.2rem' }}>왼쪽 트리에서 파일을 선택해주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
