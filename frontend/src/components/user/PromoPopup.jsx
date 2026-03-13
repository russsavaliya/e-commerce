import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import promoImage from '../../assets/images/promo.png';

/**
 * Promotional Popup Component -  esigned
 * Elegant luxury style matching brand aesthetic
 * Primary color: rgb(72,29,111)
 * Background tint: rgba(72,29,111,0.1)
 */

const PromoPopup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;

    const popupClosed = sessionStorage.getItem('promoPopupClosed');
    if (!popupClosed) {
      const delay = Math.floor(Math.random() * 2000) + 3000;
      const timer = setTimeout(() => {
        setIsVisible(true);
        setTimeout(() => setIsAnimating(true), 10);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('promoPopupClosed', 'true');
    }, 400);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleShopNow = () => {
    handleClose();
    navigate('/sale');
  };

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Dancing+Script:wght@700&display=swap');

        @keyframes popIn {
          0% { transform: scale(0.8) translateY(30px); opacity: 0; }
          60% { transform: scale(1.03) translateY(-4px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        @keyframes fadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.9) translateY(10px); }
        }

        @keyframes floatBadge {
          0%, 100% { transform: rotate(-3deg) translateY(0px); }
          50% { transform: rotate(-3deg) translateY(-4px); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes tickTock {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }

        @keyframes scooterFloat {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          25% { transform: translateX(3px) rotate(1deg); }
          75% { transform: translateX(-3px) rotate(-1deg); }
        }

        .promo-modal-enter {
          animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .promo-modal-exit {
          animation: fadeOut 0.4s ease-in forwards;
        }

        .badge-float {
          animation: floatBadge 2.5s ease-in-out infinite;
        }

        .shimmer-btn {
          background: linear-gradient(
            90deg,
            rgb(72,29,111) 0%,
            rgb(110,50,160) 40%,
            rgb(72,29,111) 60%,
            rgb(55,20,90) 100%
          );
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        .clock-hand {
          animation: tickTock 1s ease-in-out infinite;
          transform-origin: center bottom;
        }

        .scooter-anim {
          animation: scooterFloat 3s ease-in-out infinite;
        }

        /* Scalloped / lace border effect */
        .scallop-border {
          position: relative;
        }

        .scallop-border::before {
          content: '';
          position: absolute;
          inset: 6px;
          border-radius: 20px;
          border: 1.5px solid rgba(72,29,111,0.18);
          pointer-events: none;
          z-index: 1;
        }

        .scallop-outer {
          background-image: 
            radial-gradient(circle at 0% 50%, transparent 8px, rgba(72,29,111,0.12) 8px, rgba(72,29,111,0.12) 9.5px, transparent 9.5px),
            radial-gradient(circle at 100% 50%, transparent 8px, rgba(72,29,111,0.12) 8px, rgba(72,29,111,0.12) 9.5px, transparent 9.5px),
            radial-gradient(circle at 50% 0%, transparent 8px, rgba(72,29,111,0.12) 8px, rgba(72,29,111,0.12) 9.5px, transparent 9.5px),
            radial-gradient(circle at 50% 100%, transparent 8px, rgba(72,29,111,0.12) 8px, rgba(72,29,111,0.12) 9.5px, transparent 9.5px);
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: isAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(20,5,35,0)',
          backdropFilter: isAnimating ? 'blur(4px)' : 'blur(0px)',
          transition: 'all 0.4s ease',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
        }}
      >
        {/* Modal */}
        <div
          className={isAnimating ? 'promo-modal-enter' : 'promo-modal-exit'}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '380px',
            borderRadius: '28px',
            background: 'linear-gradient(160deg, #fdf6f9 0%, #f9eff5 40%, #f3e8f0 100%)',
            boxShadow: '0 30px 80px rgba(72,29,111,0.35), 0 0 0 1px rgba(72,29,111,0.08)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Outer decorative ring */}
          <div style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '22px',
            border: '1px solid rgba(72,29,111,0.15)',
            pointerEvents: 'none',
            zIndex: 2,
          }} />

          {/* Lace pattern top strip */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '14px',
            background: `repeating-radial-gradient(circle at 10px 0px, transparent 0, transparent 7px, rgba(72,29,111,0.13) 7px, rgba(72,29,111,0.13) 8px) top left / 20px 14px`,
            zIndex: 3,
          }} />
          {/* Lace pattern bottom strip */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '14px',
            background: `repeating-radial-gradient(circle at 10px 14px, transparent 0, transparent 7px, rgba(72,29,111,0.13) 7px, rgba(72,29,111,0.13) 8px) bottom left / 20px 14px`,
            zIndex: 3,
          }} />

          {/* Corner florals (SVG) */}
          <svg style={{ position: 'absolute', top: 8, right: 8, width: 48, height: 48, opacity: 0.18, zIndex: 2 }} viewBox="0 0 48 48">
            <circle cx="40" cy="8" r="3" fill="rgb(72,29,111)" />
            <circle cx="32" cy="4" r="2" fill="rgb(72,29,111)" />
            <circle cx="44" cy="18" r="2" fill="rgb(72,29,111)" />
            <path d="M28 8 Q36 2 44 10 Q38 18 28 14 Z" fill="none" stroke="rgb(72,29,111)" strokeWidth="0.8" />
            <circle cx="36" cy="12" r="1.5" fill="rgb(72,29,111)" />
          </svg>
          <svg style={{ position: 'absolute', bottom: 8, left: 8, width: 48, height: 48, opacity: 0.18, zIndex: 2 }} viewBox="0 0 48 48">
            <circle cx="8" cy="40" r="3" fill="rgb(72,29,111)" />
            <circle cx="16" cy="44" r="2" fill="rgb(72,29,111)" />
            <circle cx="4" cy="30" r="2" fill="rgb(72,29,111)" />
            <path d="M20 40 Q12 46 4 38 Q10 30 20 34 Z" fill="none" stroke="rgb(72,29,111)" strokeWidth="0.8" />
          </svg>

          {/* Special Offer Badge (top-left) */}
          <div className="badge-float" style={{
            position: 'absolute',
            top: 18,
            left: 18,
            zIndex: 10,
            width: 72,
            height: 72,
          }}>
            <svg viewBox="0 0 72 72" width="72" height="72">
              <defs>
                <linearGradient id="sealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgb(90,35,130)" />
                  <stop offset="100%" stopColor="rgb(55,15,85)" />
                </linearGradient>
              </defs>
              {/* Seal spikes */}
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i / 16) * 360;
                const r1 = 33, r2 = 36;
                const rad = (angle * Math.PI) / 180;
                const x1 = 36 + r1 * Math.cos(rad), y1 = 36 + r1 * Math.sin(rad);
                const a2 = ((angle + 11.25) * Math.PI) / 180;
                const x2 = 36 + r2 * Math.cos(a2), y2 = 36 + r2 * Math.sin(a2);
                const a3 = ((angle + 22.5) * Math.PI) / 180;
                const x3 = 36 + r1 * Math.cos(a3), y3 = 36 + r1 * Math.sin(a3);
                return <path key={i} d={`M36 36 L${x1} ${y1} L${x2} ${y2} L${x3} ${y3} Z`} fill="url(#sealGrad)" />;
              })}
              <circle cx="36" cy="36" r="28" fill="url(#sealGrad)" />
              <circle cx="36" cy="36" r="25" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <text x="36" y="30" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1">SPECIAL</text>
              <text x="36" y="40" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1">OFFER</text>
              {/* Clock */}
              <circle cx="36" cy="50" r="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
              <line className="clock-hand" x1="36" y1="50" x2="36" y2="46" stroke="white" strokeWidth="1" strokeLinecap="round" />
              <line x1="36" y1="50" x2="39" y2="50" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
            </svg>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1.5px solid rgba(72,29,111,0.25)',
              background: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgb(72,29,111)',
              fontSize: '16px',
              lineHeight: 1,
              transition: 'all 0.2s',
              backdropFilter: 'blur(4px)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.95)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.7)'}
            aria-label="Close"
          >
            ✕
          </button>

          {/* Content */}
          <div style={{ padding: '28px 24px 22px', position: 'relative', zIndex: 5 }}>

            {/* Promo Image Area */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '12px',
              marginBottom: '16px',
            }}>
              <div className="scooter-anim" style={{
                width: '100%',
                maxWidth: '240px',
                height: 'auto',
                position: 'relative',
              }}>
                {/* Soft radial glow behind image */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '12px',
                  background: 'radial-gradient(ellipse at center, rgba(72,29,111,0.08) 0%, transparent 70%)',
                  zIndex: 0,
                }} />
                {/* Promo Image */}
                <img
                  src={promoImage}
                  alt="Promotional offer"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '8px',
                    position: 'relative',
                    zIndex: 2,
                  }}
                />
              </div>
            </div>

            {/* Heading */}
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '26px',
              fontWeight: '700',
              textAlign: 'center',
              color: 'rgb(72,29,111)',
              lineHeight: 1.2,
              margin: '0 0 8px',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}>
              Complimentary<br />Delivery
            </h2>

            {/* Sub-text */}
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '15px',
              textAlign: 'center',
              color: 'rgba(72,29,111)',
              lineHeight: 1.6,
              margin: '0 0 6px',
              fontWeight: 400,
            }}>
              To celebrate you! Enjoy free shipping<br />
              on every order, for today only.
            </p>

            {/* Urgency line */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              margin: '8px 0 16px',
            }}>
              <p style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '14px',
                fontWeight: '600',
                color: 'rgb(72,29,111)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                margin: 0,
              }}>
                HURRY — Offer ends soon!
              </p>
              {/* Mini clock */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgb(72,29,111)" strokeWidth="1.5" />
                <line className="clock-hand" x1="12" y1="12" x2="12" y2="6" stroke="rgb(72,29,111)" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="12" y1="12" x2="16" y2="12" stroke="rgb(72,29,111)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleShopNow}
              className="shimmer-btn"
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: '50px',
                border: 'none',
                cursor: 'pointer',
                color: 'white',
                fontSize: '14px',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: '600',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 8px 30px rgba(72,29,111,0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(72,29,111,0.5)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(72,29,111,0.4)';
              }}
            >
              <span>Explore &amp; Shop Now</span>
              <span style={{ fontSize: '16px' }}>→</span>
            </button>

            {/* Secondary close */}
            <button
              onClick={handleClose}
              style={{
                width: '100%',
                marginTop: '10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Dancing Script', cursive",
                fontSize: '17px',
                color: 'rgba(72,29,111,0.6)',
                textAlign: 'center',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgb(72,29,111)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(72,29,111,0.6)'}
            >
              Or perhaps another time
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PromoPopup;