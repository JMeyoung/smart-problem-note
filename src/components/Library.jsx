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
           node.name.includes('수학') || 
           node.name.includes('오태훈') || 
           node.name.includes('장황') || 
           node.name.includes('Direct') || 
           node.name.includes('교재') ||
           node.name.includes('문법') ||
           node.name.includes('어휘') ||
           node.name.includes('최종본');
  });

  const displayName = node.name; // Keep full, exact original filename without artificial truncation

  if (node.type === 'directory') {
    return (
      <div style={{ marginLeft: '16px', marginTop: '8px' }}>
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', fontWeight: 'bold', padding: '6px 0', gap: '4px' }}
        >
          <span style={{ display: 'inline-block', width: '16px', marginTop: '2px', flexShrink: 0, transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
          {node.name === '⭐ 즐겨찾기' ? <span style={{marginRight:'6px', fontSize:'1.1rem', flexShrink: 0}}>⭐</span> : <FolderIcon />}
          <span style={{ wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.35', flex: 1 }} title={node.name}>{displayName}</span>
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
      style={{ marginLeft: '32px', padding: '8px 4px', display: 'flex', alignItems: 'flex-start', cursor: 'pointer', opacity: 0.95, gap: '6px' }}
      onClick={() => onFileClick(node)}
      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
      onMouseLeave={(e) => e.currentTarget.style.opacity = 0.95}
    >
      <PdfIcon />
      <span style={{ fontSize: '0.92rem', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.35', flex: 1 }} title={node.name}>{displayName}</span>
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

  const [layoutMode, setLayoutMode] = useState('horizontal'); // 'horizontal' | 'vertical' | 'flat'

  return (
    <div 
      className="library-container flex flex-col gap-4" 
      style={{ height: 'calc(100vh - 90px)', position: 'relative', overflow: 'hidden' }}
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

      {/* Top Header & View Controls */}
      <div className="glass-panel flex justify-between items-center library-toolbar" style={{ padding: '0.8rem 1.2rem', gap: '1rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', margin: 0, fontSize: '1.15rem' }}>
            <FolderIcon /> 내 드라이브 파일함
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted-dark)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            총 {libraryData.length}개 최상위 폴더
          </span>
        </div>

        <div className="library-toolbar-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <label 
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.82rem',
              fontWeight: 'bold',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              color: '#60a5fa',
              border: '1px dashed rgba(59, 130, 246, 0.35)',
              borderRadius: 'var(--radius-md)',
              cursor: uploading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            {uploading ? uploadProgress : '📤 PDF 업로드'}
            <input 
              type="file" 
              accept=".pdf" 
              disabled={uploading} 
              onChange={handleUploadFile} 
              style={{ display: 'none' }} 
            />
          </label>

          <input
            type="text"
            className="input-field library-search-input"
            placeholder="🔍 파일명/본문 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '220px', padding: '0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: 'var(--radius-md)' }}
          />

          <div className="library-mode-toggle" style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.2)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <button 
              onClick={() => setLayoutMode('horizontal')}
              title="폴더 가로 나열 뷰"
              style={{ 
                padding: '0.35rem 0.7rem', 
                fontSize: '0.8rem', 
                fontWeight: layoutMode === 'horizontal' ? 'bold' : 'normal',
                backgroundColor: layoutMode === 'horizontal' ? 'var(--accent-primary)' : 'transparent', 
                color: layoutMode === 'horizontal' ? '#fff' : 'var(--text-muted-dark)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              ↔️ 가로 폴더 나열
            </button>
            <button 
              onClick={() => setLayoutMode('vertical')}
              title="세로 사이드바 트리 뷰"
              style={{ 
                padding: '0.35rem 0.7rem', 
                fontSize: '0.8rem', 
                fontWeight: layoutMode === 'vertical' ? 'bold' : 'normal',
                backgroundColor: layoutMode === 'vertical' ? 'var(--accent-primary)' : 'transparent', 
                color: layoutMode === 'vertical' ? '#fff' : 'var(--text-muted-dark)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              ↕️ 세로 트리
            </button>
            <button 
              onClick={() => setLayoutMode('flat')}
              title="모든 파일 목록"
              style={{ 
                padding: '0.35rem 0.7rem', 
                fontSize: '0.8rem', 
                fontWeight: layoutMode === 'flat' ? 'bold' : 'normal',
                backgroundColor: layoutMode === 'flat' ? 'var(--accent-primary)' : 'transparent', 
                color: layoutMode === 'flat' ? '#fff' : 'var(--text-muted-dark)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              📄 전체 파일
            </button>
          </div>
        </div>
      </div>

      {/* Main Body Area */}
      <div className={`library-body${selectedPdf ? ' has-selection' : ''}`} style={{ flex: 1, display: 'flex', gap: '1rem', minHeight: 0, overflow: 'hidden' }}>

        {/* Left Explorer or Horizontal Folder Row */}
        {layoutMode === 'horizontal' ? (
          <div className="library-left-pane" style={{ flex: selectedPdf ? '0 0 420px' : '1', display: 'flex', flexDirection: 'column', gap: '0.75rem', overflow: 'hidden' }}>
            <div 
              style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'row', 
                gap: '1rem', 
                overflowX: 'auto', 
                overflowY: 'auto', 
                paddingBottom: '0.75rem' 
              }}
            >
              {loading ? (
                <p style={{ padding: '1rem' }}>스캔 중입니다...</p>
              ) : error ? (
                <p style={{ color: 'red', padding: '1rem' }}>{error}</p>
              ) : searchResults ? (
                <div className="search-results animate-fade-in" style={{ width: '100%', padding: '1rem' }}>
                  {searchResults.map((res, i) => (
                    <div key={i} onClick={() => setSelectedPdf({ id: res.pdfId, name: res.pdfName })} style={{ padding: '10px', marginBottom: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: '1px solid var(--glass-border)' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '4px' }}>📄 {res.pdfName} (p.{res.pageNumber})</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{res.snippet}"</div>
                    </div>
                  ))}
                </div>
              ) : (
                libraryData.map((rootNode, idx) => (
                  <div
                    key={idx}
                    className="glass-panel animate-fade-in library-folder-card"
                    style={{
                      width: selectedPdf ? '340px' : '360px',
                      minWidth: '300px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      padding: '1rem', 
                      boxSizing: 'border-box',
                      backgroundColor: 'rgba(30, 41, 59, 0.45)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold', fontSize: '1rem', color: '#60a5fa' }}>
                      {rootNode.name === '⭐ 즐겨찾기' ? <span style={{ marginRight: '6px' }}>⭐</span> : <FolderIcon />}
                      <span style={{ wordBreak: 'break-word', flex: 1 }}>{rootNode.name}</span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                      <TreeNode 
                        node={rootNode} 
                        onFileClick={handleFileClick} 
                        favorites={favorites} 
                        onToggleFavorite={handleToggleFavorite} 
                        onDeleteFile={handleDeleteFile} 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div
            className="glass-panel library-sidebar"
            style={{
              width: '420px',
              minWidth: '360px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}
          >
            <div className="tree-root">
              {layoutMode === 'flat' ? (() => {
                const flatFiles = [];
                const flatten = (nodes) => {
                  nodes.forEach(n => {
                    if (n.type === 'file' && !flatFiles.find(f => f.id === n.id)) flatFiles.push(n);
                    if (n.children) flatten(n.children);
                  });
                };
                flatten(libraryData);
                return flatFiles.map((file, idx) => (
                  <TreeNode key={idx} node={file} onFileClick={handleFileClick} favorites={favorites} onToggleFavorite={handleToggleFavorite} onDeleteFile={handleDeleteFile} />
                ));
              })() : libraryData.map((rootNode, idx) => (
                <TreeNode key={idx} node={rootNode} onFileClick={handleFileClick} favorites={favorites} onToggleFavorite={handleToggleFavorite} onDeleteFile={handleDeleteFile} />
              ))}
            </div>
          </div>
        )}

        {/* Right PDF Preview Area */}
        <div className="glass-panel flex-col library-preview-pane" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
          {selectedPdf ? (
            <div className="flex-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  onClick={() => setSelectedPdf(null)}
                  className="btn btn-secondary library-back-btn"
                  style={{ display: 'none' }}
                >
                  ← 목록으로
                </button>
                <h3 style={{ margin: 0, wordBreak: 'break-all', fontSize: '1.15rem' }}>📄 {selectedPdf.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handlePrint} disabled={isPrinting} className="btn btn-secondary">
                    {isPrinting ? '🖨️ 준비 중...' : '🖨️ 프린트'}
                  </button>
                  <button onClick={openExternal} className="btn btn-secondary">
                    새 창으로 열기
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--panel-border)', position: 'relative' }}>
                 <iframe 
                   id="pdf-preview-frame"
                   src={selectedPdf.id && !selectedPdf.id.startsWith('local__') ? `https://drive.google.com/file/d/${selectedPdf.id}/preview` : `/api/pdf/${encodeURIComponent(selectedPdf.id || '')}?name=${encodeURIComponent(selectedPdf.name)}`}
                   title="PDF Preview"
                   style={{ border: 'none', backgroundColor: '#fff', width: '100%', height: '100%' }}
                   allow="autoplay"
                 />
              </div>
            </div>
          ) : (
            <div className="flex-col items-center justify-center" style={{ height: '100%', color: 'var(--text-muted-dark)', textAlign: 'center', padding: '2rem' }}>
              <FolderIcon />
              <h3 style={{ marginTop: '1rem', fontSize: '1.3rem', color: 'var(--text-primary)' }}>가로 폴더함에서 원하시는 교재 PDF를 선택해주세요.</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted-dark)', maxWidth: '500px', margin: '0.5rem auto' }}>
                상단 버튼을 통해 ↔️ 가로 폴더 나열, ↕️ 세로 트리, 📄 전체 파일 뷰 모드로 자유롭게 전환하실 수 있습니다.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
