import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { diaryService } from '../services/diary';
import { authService } from '../services/auth';
import {
  Plus, ChevronLeft, ChevronRight,
  Share2, Lock, ArrowLeft, X,
  Edit2, Trash2, Play, Pause, BookOpen, LogOut, Camera, BarChart2
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import AnalyticsModal from '../components/AnalyticsModal';

// ─── Constants ────────────────────────────────────────────────────────────────
const FLIP_MS = 850;
const FLIP_MID = 420; // swap content halfway through flip

// ─── Map diaries: 1 diary = 1 spread ─────────────────────────────────────────
// Like a real diary — each entry has its own page (left + right).
// Long content is split between the two halves, no continuation pages.
const paginateDiaries = (raw) => {
  return raw.map((diary, i) => {
    const content = diary.content || '';
    let split = content.length;
    
    // Only split in half if content is long enough (e.g. > 600 chars)
    if (content.length >= 600) {
      const mid = Math.ceil(content.length / 2);
      split = content.lastIndexOf(' ', mid);
      if (split <= 0) split = mid;
    }

    return {
      id: String(diary.id),
      title: diary.title,
      date: diary.created_at,
      mood: diary.mood || 'neutral',
      isPrivate: diary.is_private,
      imageURLs: diary.image_urls || [],
      leftContent: content.substring(0, split).trim(),
      rightContent: content.substring(split).trim() || null,
      original: diary,
    };
  });
};

const MOODS = { happy: '😄', neutral: '😐', sad: '😢', angry: '😠' };

const fmtDate = (s) => {
  if (!s) return '';
  return new Date(s).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ─── Sub-component: Envelope Overlay ─────────────────────────────────────────
const PrivateEnvelopeOverlay = ({ onUnlock }) => {
  const [isBreaking, setIsBreaking] = useState(false);

  const handleBreak = () => {
    setIsBreaking(true);
    setTimeout(() => {
      onUnlock();
    }, 1500); // Wait for flap open and fade out
  };

  return (
    <div className={`ks-envelope-overlay ${isBreaking ? 'ks-envelope--opening' : ''}`}>
      <div className="ks-envelope-wrapper">
        <div className="ks-envelope-body">
          <div className="ks-envelope-flap-top"></div>
          <div className="ks-envelope-flap-left"></div>
          <div className="ks-envelope-flap-right"></div>
          <div className="ks-envelope-flap-bottom"></div>
          <div className="ks-wax-seal" onClick={handleBreak}>
            <div className={`ks-wax-core ${isBreaking ? 'ks-wax-core--broken' : ''}`}></div>
            {isBreaking && (
              <>
                <div className="ks-wax-fragment ks-wax-p1"></div>
                <div className="ks-wax-fragment ks-wax-p2"></div>
                <div className="ks-wax-fragment ks-wax-p3"></div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="ks-envelope-text">Chạm vào sáp để bẻ nắp</div>
    </div>
  );
};

// ─── Sub-component: Left Page Content ────────────────────────────────────────
const LeftPageContent = ({ spread, pageNum, onEdit, onDelete, isLocked }) => (
  <>
    <div className="ks-content__meta">
      <span>{fmtDate(spread?.date)}</span>
      {spread && onEdit && !isLocked && (
        <div style={{ display: 'flex', gap: '14px', opacity: 0.4 }}>
          <Edit2 size={14} style={{ cursor: 'pointer' }} onClick={() => onEdit(spread.original)} />
          <Trash2 size={14} style={{ cursor: 'pointer' }} onClick={onDelete} />
        </div>
      )}
    </div>

    {spread && <h2 className="ks-content__title">{spread.title}</h2>}

    <div className="ks-content__text">
      {isLocked ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.3 }}>
          <Lock size={48} strokeWidth={1} style={{ marginBottom: '16px' }} />
          <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: '18px' }}>Ký ức đã bị niêm phong</span>
        </div>
      ) : (
        spread?.leftContent
      )}
    </div>

    <div className="ks-page-footer">
      {spread?.mood && !isLocked && <span style={{ fontSize: '16px' }}>{MOODS[spread.mood]}</span>}
      <span className="ks-page-num">{pageNum}</span>
    </div>
  </>
);

// ─── Sub-component: Right Page Content ───────────────────────────────────────
const RightPageContent = ({ spread, username, pageNum, isLocked, onUnlock }) => (
  <>
    {isLocked && <PrivateEnvelopeOverlay onUnlock={onUnlock} />}
    
    <div className="ks-content__text" style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
      {!isLocked && (spread?.rightContent ? spread.rightContent : (
        (!spread?.imageURLs || spread.imageURLs.length === 0) && (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.04 }}>
            <BookOpen size={140} strokeWidth={0.5} />
          </div>
        )
      ))}
      {!isLocked && spread?.imageURLs?.length > 0 && (
        <div className="ks-clothesline-container">
          <div className="ks-clothesline-string"></div>
          {spread.imageURLs.map((url, idx) => {
            const rot = ((((idx * 5) + 2) % 10) - 5); /* Lắc nhẹ vài độ */
            return (
              <div 
                key={idx} 
                className="ks-polaroid-hanging" 
                style={{ transform: `rotate(${rot}deg)` }}
              >
                <div className="ks-polaroid-clip"></div>
                <div className="ks-polaroid-photo">
                  <img src={`http://localhost:8080${url}`} alt="polaroid" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
    <div className="ks-page-footer" style={{ justifyContent: 'flex-end' }}>
      <span className="ks-page-num">{pageNum}</span>
      {spread?.isPrivate && <Lock size={11} />}
      <span style={{ fontFamily: 'Montserrat', fontSize: '9px', letterSpacing: '2px' }}>{username}</span>
    </div>
  </>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const DashboardPage = () => {
  const navigate = useNavigate();
  const [bookSpreads, setBookSpreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipState, setFlipState] = useState(null);
  const [isWriting, setIsWriting] = useState(false);
  const [writingData, setWritingData] = useState({ title: '', content: '', mood: 'neutral', isPrivate: true });
  const [isSaving, setIsSaving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [unlockedDiaries, setUnlockedDiaries] = useState(new Set());
  const audioRef = useRef(null);
  const user = authService.getCurrentUser() || { username: 'Khách' };
  const username = (user.username || 'Khách').toUpperCase();
const [filter, setFilter] = useState({});

  const fetchDiaries = useCallback(async (filterObj = {}) => {
    try {
      setIsLoading(true);
      const data = Object.keys(filterObj).length ? await diaryService.search(filterObj) : await diaryService.getAll();
      const spreads = paginateDiaries(data || []);
      setBookSpreads(spreads);
      setCurrentIdx(i => Math.min(i, Math.max(spreads.length - 1, 0)));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search handler
  const handleSearch = (keyword) => {
    const newFilter = { ...filter, keyword };
    setFilter(newFilter);
    fetchDiaries(newFilter);
  };

  // Filter change handler
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    fetchDiaries(newFilter);
  };
  

  useEffect(() => { fetchDiaries(); }, [fetchDiaries]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') handleFlip('next');
      if (e.key === 'ArrowLeft') handleFlip('prev');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // ── Flip ──────────────────────────────────────────────────────────────────
  const handleFlip = (dir) => {
    if (flipState || bookSpreads.length === 0) return;
    const toIdx = dir === 'next'
      ? Math.min(currentIdx + 1, bookSpreads.length - 1)
      : Math.max(currentIdx - 1, 0);
    if (toIdx === currentIdx) return;

    const from = bookSpreads[currentIdx];
    const to = bookSpreads[toIdx];

    // Capture front/back content for the flip page faces
    setFlipState({
      dir,
      // Front face = page being "picked up"
      frontSpread: from,
      frontRight: dir === 'next',   // front shows right page when going next
      // Back face = page revealed on the other side
      backSpread: to,
      backRight: dir !== 'next',   // back shows right page when going prev
      toIdx,
    });

    // At halfway: swap static pages (hidden behind flip page at this moment)
    setTimeout(() => setCurrentIdx(toIdx), FLIP_MID);
    // At end: clear flip animation
    setTimeout(() => setFlipState(null), FLIP_MS + 60);
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    const diary = bookSpreads[currentIdx]?.original;
    if (!diary || !window.confirm('Xóa ký ức này vĩnh viễn?')) return;
    try {
      await diaryService.delete(diary.id);
      setCurrentIdx(0);
      fetchDiaries();
    } catch { alert('Xóa không thành công!'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (writingData.id)
        await diaryService.update(writingData.id, {
          title: writingData.title,
          content: writingData.content,
          mood: writingData.mood,
          is_private: writingData.isPrivate,
          tags: writingData.tags,
          image_urls: writingData.imageURLs
        });
      else
        await diaryService.create(
          writingData.title, 
          writingData.content, 
          writingData.mood, 
          writingData.isPrivate,
          writingData.tags,
          writingData.imageURLs
        );
      setIsWriting(false);
      fetchDiaries();
    } catch { alert('Lỗi khi lưu.'); }
    finally { setIsSaving(false); }
  };

  const startWriting = (diary = null) => {
    setWritingData(diary ? {
      id: diary.id, title: diary.title, content: diary.content,
      mood: diary.mood || 'neutral',
      isPrivate: diary.is_private !== undefined ? diary.is_private : true,
      tags: diary.tags || '',
      imageURLs: diary.image_urls || [],
    } : { title: '', content: '', mood: 'neutral', isPrivate: true, tags: '', imageURLs: [] });
    setIsWriting(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsSaving(true);
      const url = await diaryService.uploadImage(file);
      setWritingData(d => ({ ...d, imageURLs: [...d.imageURLs, url] }));
    } catch {
      alert('Tải ảnh thất bại. (File < 5MB, định dạng: jpg, png, webp)');
    } finally {
      setIsSaving(false);
    }
  };

  const current = bookSpreads[currentIdx];

  return (
    <div className="ks-sunlight-gradient">
      <audio ref={audioRef} src="../public/mp3/intro.mp3" loop />

      {/* ── STICKY HEADER & FILTER BAR ── */}
      <div className="ks-header-wrapper">
        <header className="ks-dashboard-header">
          <button className="ks-nav-back" onClick={() => navigate('/')}>
            <ArrowLeft size={13} /><span>THƯ VIỆN</span>
          </button>

          <div className="ks-logo-inline">
            <BookOpen size={17} />
            <span>The Keepsake</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="ks-icon-btn" title="Thống kê" onClick={() => setShowAnalytics(true)}>
              <BarChart2 size={16} />
            </button>
            <button id="btn-new-diary" className="ks-btn-primary" onClick={() => startWriting()}>
              <Plus size={14} /> VIẾT MỚI
            </button>
            <button className="ks-icon-btn" title="Đăng xuất"
              onClick={() => { authService.logout(); navigate('/login'); }}>
              <LogOut size={15} />
            </button>
          </div>
        </header>
        
        {/* The new extremely sleek inline filter bar */}
        <FilterPanel filter={filter} setFilter={handleFilterChange} />
      </div>

      {/* ── STAGE ── */}
      <main className="ks-stage" style={{ paddingBottom: '64px' }}>

        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', opacity: 0.35 }}>
            <div className="ks-spinner" />
            <span style={{ fontFamily: 'Montserrat', fontSize: '10px', letterSpacing: '3px' }}>ĐANG TẢI...</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && bookSpreads.length === 0 && (
          <div className="ks-empty-state animate-slide-up">
            <BookOpen size={80} strokeWidth={0.8} />
            <h2>Thư viện chưa có ký ức</h2>
            <p>Hãy bắt đầu ghi lại những khoảnh khắc đầu tiên của bạn.</p>
            <button className="ks-btn-primary" style={{ opacity: 1 }} onClick={() => startWriting()}>
              <Plus size={14} /> BẮT ĐẦU NGAY
            </button>
          </div>
        )}

        {/* Book */}
        {!isLoading && bookSpreads.length > 0 && (
          <>
            {/* Prev button */}
            <button className="ks-btn-nav ks-btn-nav--prev"
              onClick={() => handleFlip('prev')}
              disabled={currentIdx === 0 || !!flipState}
              title="Trang trước (←)">
              <ChevronLeft size={26} />
            </button>

            {/* ── BOOK ── */}
            <div className="ks-book" aria-label="Sách nhật ký">

              {/* LEFT static page */}
              <div className="ks-book__page ks-book__page--left">
                <LeftPageContent
                  spread={current}
                  pageNum={currentIdx * 2 + 1}
                  onEdit={startWriting}
                  onDelete={handleDelete}
                  isLocked={current?.isPrivate && !unlockedDiaries.has(current.id)}
                />
              </div>

              {/* SPINE */}
              <div className="ks-book__spine">
                <div className="ks-book__spine-line ks-book__spine-line--top" />
                <div className="ks-book__spine-stitches" />
                <div className="ks-book__spine-line ks-book__spine-line--bottom" />
              </div>

              {/* RIGHT static page */}
              <div className="ks-book__page ks-book__page--right">
                <RightPageContent
                  spread={current}
                  username={username}
                  pageNum={currentIdx * 2 + 2}
                  isLocked={current?.isPrivate && !unlockedDiaries.has(current.id)}
                  onUnlock={() => setUnlockedDiaries(prev => new Set(prev).add(current.id))}
                />
              </div>

              {/* ── 3D FLIP PAGE ── */}
              {flipState && (() => {
                const frontIsRight = flipState.frontRight;
                const backIsRight = flipState.backRight;
                return (
                  <div className={`ks-flip-page ks-flip-page--${flipState.dir}`} aria-hidden="true">
                    {/* FRONT FACE — the page being picked up */}
                    <div className={`ks-flip-page__face ks-flip-page__face--front${frontIsRight ? '' : ' ks-page-ruled'}`}>
                      <div className="ks-flip-page__content">
                        {frontIsRight
                          ? <RightPageContent spread={flipState.frontSpread} username={username} pageNum={currentIdx * 2 + 2} isLocked={flipState.frontSpread?.isPrivate && !unlockedDiaries.has(flipState.frontSpread.id)} onUnlock={() => setUnlockedDiaries(prev => new Set(prev).add(flipState.frontSpread.id))} />
                          : <LeftPageContent spread={flipState.frontSpread} pageNum={currentIdx * 2 + 1} isLocked={flipState.frontSpread?.isPrivate && !unlockedDiaries.has(flipState.frontSpread.id)} />
                        }
                      </div>
                    </div>
                    {/* BACK FACE — the page that gets revealed */}
                    <div className={`ks-flip-page__face ks-flip-page__face--back${backIsRight ? '' : ' ks-page-ruled'}`}>
                      <div className="ks-flip-page__content">
                        {backIsRight
                          ? <RightPageContent spread={flipState.backSpread} username={username} pageNum={flipState.toIdx * 2 + 2} isLocked={flipState.backSpread?.isPrivate && !unlockedDiaries.has(flipState.backSpread.id)} onUnlock={() => setUnlockedDiaries(prev => new Set(prev).add(flipState.backSpread.id))} />
                          : <LeftPageContent spread={flipState.backSpread} pageNum={flipState.toIdx * 2 + 1} isLocked={flipState.backSpread?.isPrivate && !unlockedDiaries.has(flipState.backSpread.id)} />
                        }
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Next button */}
            <button className="ks-btn-nav ks-btn-nav--next"
              onClick={() => handleFlip('next')}
              disabled={currentIdx === bookSpreads.length - 1 || !!flipState}
              title="Trang tiếp (→)">
              <ChevronRight size={26} />
            </button>

            {/* Page dots (max 10 shown) */}
            {bookSpreads.length > 1 && bookSpreads.length <= 12 && (
              <div className="ks-page-dots">
                {bookSpreads.map((_, i) => (
                  <button key={i}
                    className={`ks-page-dot ${i === currentIdx ? 'ks-page-dot--active' : ''}`}
                    onClick={() => !flipState && setCurrentIdx(i)}
                    title={`Trang ${i + 1}`}
                  />
                ))}
              </div>
            )}
            {bookSpreads.length > 12 && (
              <div className="ks-page-dots">
                <span style={{ fontFamily: 'Montserrat', fontSize: '10px', letterSpacing: '2px', opacity: 0.4 }}>
                  {currentIdx + 1} / {bookSpreads.length}
                </span>
              </div>
            )}
          </>
        )}

        {/* Audio player */}
        <div className="ks-audio-btn">
          <button
            title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc nền'}
            onClick={() => {
              if (isPlaying) audioRef.current?.pause();
              else audioRef.current?.play();
              setIsPlaying(p => !p);
            }}>
            {isPlaying
              ? <Pause size={18} color="var(--ks-terracotta)" fill="var(--ks-terracotta)" />
              : <Play size={18} color="var(--ks-terracotta)" fill="var(--ks-terracotta)" />}
          </button>
        </div>
      </main>

      {/* ── WRITE MODAL ── */}
      {isWriting && (
        <div className="ks-modal" onClick={() => setIsWriting(false)}>
          <div className="ks-modal__body" onClick={e => e.stopPropagation()}>
            {/* Spine strip */}
            <div className="ks-book__spine" style={{ width: '16px', flexShrink: 0, position: 'relative' }}>
              <div className="ks-book__spine-line ks-book__spine-line--top" />
              <div className="ks-book__spine-line ks-book__spine-line--bottom" />
            </div>

            {/* LEFT — write area */}
            <div className="ks-modal__page ks-modal__page--ruled">
              <div className="ks-modal__header">
                <span className="ks-modal__label">{writingData.id ? 'CHỈNH SỬA KÝ ỨC' : 'KÝ ỨC MỚI'}</span>
                <button className="ks-modal__close" onClick={() => setIsWriting(false)}><X size={18} /></button>
              </div>
              <input
                className="ks-modal__input-title"
                placeholder="Tiêu đề hôm nay..."
                value={writingData.title}
                onChange={e => setWritingData(d => ({ ...d, title: e.target.value }))}
                autoFocus
              />
              <textarea
                className="ks-modal__textarea"
                placeholder="Bắt đầu từ một khoảnh khắc nhỏ..."
                value={writingData.content}
                onChange={e => setWritingData(d => ({ ...d, content: e.target.value }))}
              />
            </div>

            {/* RIGHT — options + save */}
            <div className="ks-modal__page ks-modal__page--options">
              <div>
                <div className="ks-modal__section-label">TÂM TRẠNG</div>
                <div className="ks-mood-grid">
                  {[
                    { v: 'happy', e: '😄', l: 'Vui vẻ' },
                    { v: 'neutral', e: '😐', l: 'Bình thường' },
                    { v: 'sad', e: '😢', l: 'Buồn' },
                    { v: 'angry', e: '😠', l: 'Tức giận' },
                  ].map(m => (
                    <button key={m.v}
                      className={`ks-mood-btn ${writingData.mood === m.v ? 'ks-mood-btn--active' : ''}`}
                      onClick={() => setWritingData(d => ({ ...d, mood: m.v }))}>
                      <span>{m.e}</span>{m.l}
                    </button>
                  ))}
                </div>
                <label className="ks-modal__privacy">
                  <input type="checkbox" checked={writingData.isPrivate}
                    onChange={e => setWritingData(d => ({ ...d, isPrivate: e.target.checked }))}
                    style={{ accentColor: 'var(--ks-teal)', width: '15px', height: '15px' }}
                  />
                  <Lock size={12} opacity={0.5} />
                  Chỉ mình tôi đọc
                </label>

                <div style={{ marginTop: '16px' }}>
                  <div className="ks-modal__section-label">ĐÍNH KÈM (MỘT KỶ NIỆM BẰNG ẢNH)</div>
                  {!writingData.imageURLs?.length ? (
                    <label className="ks-btn-outline" style={{ display: 'flex', width: '100%', justifyContent: 'center', cursor: 'pointer', padding: '8px' }}>
                      <Camera size={14} style={{ marginRight: '6px' }} />
                      Thêm ảnh (Tùy chọn)
                      <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', alignItems: 'center' }}>
                      {writingData.imageURLs.map((url, i) => (
                        <div key={i} style={{ position: 'relative', flexShrink: 0, border: '1px solid #ddd', padding: '4px', background: '#fff', borderRadius: '4px' }}>
                          <img src={`http://localhost:8080${url}`} alt="preview" style={{ height: '80px', width: 'auto', objectFit: 'cover' }} />
                          <button 
                            onClick={() => setWritingData(d => ({ ...d, imageURLs: d.imageURLs.filter((_, idx) => idx !== i) }))}
                            className="ks-icon-btn" 
                            style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ffebee', color: 'red', borderRadius: '50%', padding: '2px', border: '1px solid rgba(0,0,0,0.1)' }}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '80px', border: '1px dashed #ccc', borderRadius: '4px', cursor: 'pointer', flexShrink: 0, background: '#fafafa' }}>
                        <Plus size={20} color="#999" />
                        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div className="ks-quill-icon">🖋️</div>
                <button className="ks-btn-primary" onClick={handleSave} disabled={isSaving}
                  style={{ width: '100%', justifyContent: 'center' }}>
                  {isSaving ? 'ĐANG LƯU...' : 'NIÊM PHONG KÝ ỨC'}
                </button>
                <p className="ks-modal__hint">Trang {bookSpreads.length + 1}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAnalytics && <AnalyticsModal onClose={() => setShowAnalytics(false)} />}
    </div>
  );
};

export default DashboardPage;
