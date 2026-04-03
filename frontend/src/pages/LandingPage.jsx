import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { Sparkles, BookOpen } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleOpenBook = () => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="ks-sunlight-gradient">
      <main className="ks-stage">
        
        {/* LANDING PAGE BEM: ks-cover (v4.0) */}
        <div className="ks-cover" onClick={handleOpenBook}>
          <div className="ks-cover__binding"></div>
          
          <div style={{ position: 'absolute', top: '48px', opacity: 0.3 }}>
             <Sparkles size={48} color="#fff" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'auto 0' }}>
            <div style={{ fontSize: '10px', letterSpacing: '8px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px', fontWeight: '300' }}>THE PERSONAL</div>
            <h1 className="ks-cover__title">
               The<br/>Keepsake
            </h1>
            <div style={{ marginTop: '24px', height: '1px', width: '80px', background: 'rgba(255,255,255,0.2)' }}></div>
          </div>

          <div className="ks-cover__footer">
             <div style={{ letterSpacing: '4px', textTransform: 'uppercase', fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>
                ARCHIVE MMXXIV
             </div>
             
             <button className="ks-btn-primary" style={{ background: 'white', color: 'var(--ks-teal)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', width: '220px', justifyContent: 'center' }}>
                {authService.isAuthenticated() ? 'VÀO NHẬT KÝ' : 'MỞ ARCHIVE'}
             </button>
          </div>

          <div style={{ position: 'absolute', bottom: '40px', right: '40px', opacity: 0.1 }}>
             <BookOpen size={120} color="#fff" strokeWidth={1} />
          </div>
        </div>

        {/* ATMOSPHERIC DECORATION */}
        <div style={{ position: 'absolute', bottom: '10%', left: '15%', opacity: 0.05, transform: 'rotate(-25deg)' }}>
           <img src="https://cdn-icons-png.flaticon.com/512/3069/3069212.png" alt="feather" width="150" />
        </div>
      </main>

      <footer style={{ padding: '40px', textAlign: 'center', opacity: 0.3, fontSize: '10px', letterSpacing: '4px', fontWeight: '300' }}>
         &copy; MMXXIV THE KEEPSAKE . MỘT SẢN PHẨM CỦA SỰ HOÀI NIỆM
      </footer>
    </div>
  );
};

export default LandingPage;
