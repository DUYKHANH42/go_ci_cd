import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { diaryService } from '../services/diary';
import { authService } from '../services/auth';
import { 
  Plus, 
  ChevronLeft,
  ChevronRight,
  Share2,
  Lock,
  ArrowLeft,
  X,
  Edit2,
  Trash2,
  Play,
  Pause,
  BookOpen
} from 'lucide-react';

const DashboardPage = () => {
  const [diaries, setDiaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Book State
  const [bookSpreads, setBookSpreads] = useState([]); 
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [flipDirection, setFlipDirection] = useState(null); // 'next' or 'prev'

  // Modal State
  const [isWriting, setIsWriting] = useState(false);
  const [writingData, setWritingData] = useState({ title: '', content: '', mood: 'neutral', isPrivate: true });
  const [isSaving, setIsSaving] = useState(false);

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const PIANO_LOFI_URL = "https://archive.org/download/soft-piano-background-music/Soft%20Piano%20Music.mp3"; 

  const user = authService.getCurrentUser() || { username: 'Khách' };

  useEffect(() => {
    fetchDiaries();
  }, []);

  const formatDateVN = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Balanced Pagination Logic v7.4 (Masterpiece - Space-preserving)
  const paginateDiaries = (rawDiaries) => {
    const spreads = [];

    rawDiaries.forEach(diary => {
      const fullContent = diary.content || '';
      let pIndex = 0;
      
      const SPREAD_LIMIT = 1000; 
      let remaining = fullContent;
      
      while (remaining.length > 0) {
        let spreadBlock = remaining.substring(0, SPREAD_LIMIT);
        let nextStart = SPREAD_LIMIT;
        
        if (remaining.length > SPREAD_LIMIT) {
          const lastSpace = spreadBlock.lastIndexOf(' ');
          if (lastSpace !== -1) {
            spreadBlock = remaining.substring(0, lastSpace);
            nextStart = lastSpace; // DO NOT add +1, preserve the space for the next spread
          }
        }
        
        const mid = Math.ceil(spreadBlock.length / 2);
        let splitIdx = spreadBlock.lastIndexOf(' ', mid);
        if (splitIdx === -1) splitIdx = mid;
        
        // v7.4 Fix: Preserve leading spaces to avoid 'logicThe'
        const left = spreadBlock.substring(0, splitIdx);
        const right = spreadBlock.substring(splitIdx); 

        spreads.push({
          id: `${diary.id}-p${pIndex}`,
          title: pIndex === 0 ? diary.title : `${diary.title} (tiếp theo)`,
          date: diary.created_at,
          leftContent: left,
          rightContent: right || null,
          original: diary
        });
        
        remaining = remaining.substring(nextStart); // NO TRIM HERE
        pIndex++;
      }
    });

    return spreads;
  };

  const fetchDiaries = async () => {
    try {
      setIsLoading(true);
      const data = await diaryService.getAll();
      const spreads = paginateDiaries(data || []);
      setBookSpreads(spreads);
      if (spreads.length > 0 && currentSpreadIndex >= spreads.length) {
         setCurrentSpreadIndex(0);
      }
    } catch (err) {
      console.error("Diary load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlip = (direction) => {
    if (flipDirection) return;
    setFlipDirection(direction);
    
    setTimeout(() => {
      if (direction === 'next' && currentSpreadIndex < bookSpreads.length - 1) {
        setCurrentSpreadIndex(prev => prev + 1);
      } else if (direction === 'prev' && currentSpreadIndex > 0) {
        setCurrentSpreadIndex(prev => prev - 1);
      }
    }, 450);

    setTimeout(() => {
      setFlipDirection(null);
    }, 950);
  };

  const handleDelete = async () => {
    const currentDiary = bookSpreads[currentSpreadIndex]?.original;
    if (!currentDiary) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa ký ức này vĩnh viễn?")) {
      try {
        await diaryService.delete(currentDiary.id);
        fetchDiaries();
      } catch (err) {
        alert("Xóa ký ức không thành công!");
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (writingData.id) {
         await diaryService.update(writingData.id, writingData);
      } else {
         await diaryService.create(writingData.title, writingData.content, writingData.mood, writingData.isPrivate);
      }
      setIsWriting(false);
      fetchDiaries();
    } catch (err) {
      alert("Lỗi khi lưu ký ức.");
    } finally {
      setIsSaving(false);
    }
  };

  const startWriting = (diary = null) => {
    if (diary) {
      setWritingData({
        id: diary.id,
        title: diary.title,
        content: diary.content,
        mood: diary.mood || 'neutral',
        isPrivate: diary.isPrivate
      });
    } else {
      setWritingData({ title: '', content: '', mood: 'neutral', isPrivate: true });
    }
    setIsWriting(true);
  };

  const currentSpread = bookSpreads[currentSpreadIndex];

  return (
    <div className="ks-sunlight-gradient">
      <audio ref={audioRef} src={PIANO_LOFI_URL} loop />

      {/* TOP BAR */}
      <div style={{ height: '70px', padding: '0 4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer', fontFamily: 'Montserrat', fontSize: '0.8rem', letterSpacing: '4px', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ArrowLeft size={16} /> THƯ VIỆN
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button className="ks-btn-primary" onClick={() => startWriting()}>
             VIẾT KÝ ỨC MỚI <Plus size={18} />
          </button>
          <button onClick={() => { authService.logout(); navigate('/login'); }} style={{ color: '#888', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '10px', letterSpacing: '2px' }}>ĐĂNG XUẤT</button>
        </div>
      </div>

      <main className="ks-stage">
        {bookSpreads.length > 0 ? (
          <div className="ks-book">
             <div className="ks-book__spine"></div>

             {/* LEFT PAGE */}
             <div className="ks-book__page ks-book__page--left">
                <div className="ks-content__meta">
                   <span>{formatDateVN(currentSpread.date)}</span>
                   <div style={{ display: 'flex', gap: '1.2rem', opacity: 0.3, cursor: 'pointer' }}>
                      <Edit2 size={18} onClick={() => startWriting(currentSpread.original)} />
                      <Trash2 size={18} onClick={handleDelete} />
                   </div>
                </div>
                
                <h2 className="ks-content__title">
                   {currentSpread.title}
                </h2>

                <div className="ks-content__text">
                   {currentSpread.leftContent}
                </div>
                
                <div style={{ marginTop: '20px', fontSize: '10px', opacity: 0.2, fontStyle: 'italic', fontStyle: 'uppercase', letterSpacing: '1px' }}>
                   CHAPTER {currentSpreadIndex + 1}
                </div>
             </div>

             {/* RIGHT PAGE */}
             <div className="ks-book__page ks-book__page--right">
                <div className="ks-content__text">
                   {currentSpread.rightContent ? (
                      currentSpread.rightContent
                   ) : (
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.05 }}>
                         <BookOpen size={200} strokeWidth={0.5} />
                      </div>
                   )}
                </div>

                <div className="ks-content__meta" style={{ justifyContent: 'flex-end', gap: '1.5rem' }}>
                   <span>{user.username.toUpperCase()}</span>
                   <Lock size={14} />
                   <Share2 size={14} />
                </div>
             </div>

             {/* ANIMATION OVERLAY */}
             <div className={`ks-flip-overlay ${flipDirection === 'next' ? 'ks-flip-overlay--next' : ''} ${flipDirection === 'prev' ? 'ks-flip-overlay--prev' : ''}`}></div>
          </div>
        ) : (
          !isLoading && (
             <div style={{ textAlign: 'center', opacity: 0.3 }}>
                <BookOpen size={120} strokeWidth={0.5} />
                <h1 style={{ fontFamily: 'Playfair Display', fontSize: '48px', marginTop: '24px' }}>Thư viện chưa có ký ức.</h1>
                <button className="ks-btn-primary" onClick={() => startWriting()} style={{ marginTop: '32px' }}>BẮT ĐẦU NGAY</button>
             </div>
          )
        )}

        {/* CONTROLS */}
        {bookSpreads.length > 1 && (
           <>
              <button className="ks-btn-nav ks-btn-nav--prev" onClick={() => handleFlip('prev')} disabled={currentSpreadIndex === 0}>
                 <ChevronLeft size={48} />
              </button>
              <button className="ks-btn-nav ks-btn-nav--next" onClick={() => handleFlip('next')} disabled={currentSpreadIndex === bookSpreads.length - 1}>
                 <ChevronRight size={48} />
              </button>
           </>
        )}

        {/* AUDIO */}
        <div style={{ position: 'fixed', bottom: '40px', left: '40px', zIndex: 1000 }}>
           <button onClick={() => {
              if (isPlaying) audioRef.current.pause();
              else audioRef.current.play();
              setIsPlaying(!isPlaying);
           }} style={{ background: 'white', border: 'none', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
              {isPlaying ? <Pause size={24} color="#8D5555" fill="#8D5555" /> : <Play size={24} color="#8D5555" fill="#8D5555" />}
           </button>
        </div>
      </main>

      {/* MODAL (BEM ks-modal) */}
      {isWriting && (
        <div className="ks-modal" onClick={() => setIsWriting(false)}>
           <div className="ks-modal__body" onClick={e => e.stopPropagation()}>
              <div className="ks-book__spine" style={{ width: '20px' }}></div>
              
              <div className="ks-modal__page ks-modal__page--ruled">
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ fontSize: '10px', opacity: 0.4, letterSpacing: '4px' }}>NEW REFLECTION</div>
                    <X size={20} onClick={() => setIsWriting(false)} style={{ cursor: 'pointer', opacity: 0.3 }} />
                 </div>
                 
                 <input 
                   className="ks-modal__input-title" 
                   placeholder="Tiêu đề..."
                   value={writingData.title}
                   onChange={e => setWritingData({...writingData, title: e.target.value})}
                 />

                 <textarea 
                   className="ks-modal__textarea"
                   placeholder="Hôm nay của bạn thế nào?"
                   value={writingData.content}
                   onChange={e => setWritingData({...writingData, content: e.target.value})}
                 />
              </div>

              <div className="ks-modal__page" style={{ background: '#fafafa', justifyContent: 'center', alignItems: 'center' }}>
                 <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '64px', marginBottom: '32px', opacity: 0.1 }}>🖋️</div>
                    <button className="ks-btn-primary" onClick={handleSave} disabled={isSaving}>
                       {isSaving ? 'ĐANG LƯU...' : 'NIÊM PHONG'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
