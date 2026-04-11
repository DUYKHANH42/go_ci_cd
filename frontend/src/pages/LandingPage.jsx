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

        {/* LANDING PAGE — BOOK COVER */}
        <div className="ks-cover" onClick={handleOpenBook}>
          <div className="ks-cover__binding" />

          {/* TOP ICON */}
          <div style={{ position: 'absolute', top: '48px', opacity: 0.25 }}>
            <Sparkles size={40} color="#fff" />
          </div>

          {/* TITLE BLOCK */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: 'auto 0',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '10px',
              letterSpacing: '8px',
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '20px',
              fontFamily: 'Montserrat',
              fontWeight: '400',
            }}>
              THE PERSONAL
            </div>

            <h1 className="ks-cover__title">
              The<br />Keepsake
            </h1>

            <div style={{
              marginTop: '28px',
              height: '1px',
              width: '64px',
              background: 'rgba(255,255,255,0.25)',
            }} />

            <div style={{
              marginTop: '28px',
              fontSize: '11px',
              letterSpacing: '3px',
              color: 'rgba(255,255,255,0.3)',
              fontFamily: 'Montserrat',
            }}>
              NHẬT KÝ CỦA BẠN
            </div>
          </div>

          {/* FOOTER */}
          <div className="ks-cover__footer">
            <div style={{
              letterSpacing: '4px',
              textTransform: 'uppercase',
              fontSize: '9px',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: '24px',
              fontFamily: 'Montserrat',
            }}>
              ARCHIVE MMXXIV
            </div>

            <button
              className="ks-btn-primary"
              style={{
                background: 'white',
                color: 'var(--ks-teal)',
                boxShadow: '0 12px 35px rgba(0,0,0,0.25)',
                width: '220px',
                justifyContent: 'center',
              }}
            >
              {authService.isAuthenticated() ? 'VÀO NHẬT KÝ' : 'MỞ ARCHIVE'}
            </button>
          </div>

          {/* DECORATIVE BOOK ICON */}
          <div style={{ position: 'absolute', bottom: '40px', right: '36px', opacity: 0.08 }}>
            <BookOpen size={100} color="#fff" strokeWidth={1} />
          </div>
        </div>
      </main>

      <footer style={{
        padding: '32px',
        textAlign: 'center',
        opacity: 0.3,
        fontSize: '10px',
        letterSpacing: '4px',
        fontFamily: 'Montserrat',
        fontWeight: '300',
      }}>
        &copy; MMXXIV THE KEEPSAKE · MỘT SẢN PHẨM CỦA SỰ HOÀI NIỆM
      </footer>
    </div>
  );
};

export default LandingPage;
