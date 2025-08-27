import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './AppleStyleNavbar.css';

const AppleStyleNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={`apple-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/" onClick={closeMenu}>DocAI</Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="navbar-links">
          <NavLink 
            to="/review" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            智能审核
          </NavLink>
          <NavLink 
            to="/standards" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            标准文档库
          </NavLink>
          <NavLink 
            to="/editor" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            智能编写
          </NavLink>
        </nav>

        {/* Search and User Actions */}
        <div className="navbar-actions">
          <button className="search-button" aria-label="搜索">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11.5 11.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
          <button className="user-button" aria-label="用户">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 14C2 11.7909 4.23858 10 7 10H9C11.7614 10 14 11.7909 14 14V15H2V14Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={`menu-button ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="菜单"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <NavLink 
            to="/review" 
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            智能审核
          </NavLink>
          <NavLink 
            to="/standards" 
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            标准文档库
          </NavLink>
          <NavLink 
            to="/editor" 
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            智能编写
          </NavLink>
          <div className="mobile-menu-actions">
            <button className="mobile-search-button">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M11.5 11.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              搜索
            </button>
            <button className="mobile-user-button">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 14C2 11.7909 4.23858 10 7 10H9C11.7614 10 14 11.7909 14 14V15H2V14Z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              登录
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppleStyleNavbar;