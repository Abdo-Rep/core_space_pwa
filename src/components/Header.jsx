import React from 'react';

export default function Header({ theme, toggleTheme }) {
  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand-wrapper">
          <div className="logo-icon">
            <span className="logo-c">C</span>
            <span className="logo-s">S</span>
          </div>
          <div className="brand-text">
            <span className="brand-name">Core Space</span>
            <span className="brand-tagline">Where Deals Take Place</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Light/Dark Toggle Button */}
          <button 
            type="button"
            onClick={toggleTheme}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '14px',
              outline: 'none',
              transition: 'background-color 0.2s'
            }}
            title={theme === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <div className="location-badge">
            {/* Location Pin Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '13px', height: '13px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span>طنطا، مصر</span>
          </div>
        </div>
      </div>
    </header>
  );
}
