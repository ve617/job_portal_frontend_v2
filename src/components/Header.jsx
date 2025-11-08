import React, { useState } from 'react';
import '../styles/Header.css';

const Header = ({ activeSection, scrollToSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (sectionId) => {
    scrollToSection(sectionId);
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <img src="/logo.jpg" alt="NetPy Technologies Logo" className="logo-image" />
            <h2>NetPy Technologies</h2>
          </div>
          
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <ul>
              <li>
                <button onClick={() => handleNavClick('home')}>
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('job-details')}>
                  Job Details
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('apply')}>
                  Apply
                </button>
              </li>
            </ul>
          </nav>

          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
