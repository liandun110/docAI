import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { Link, NavLink } from 'react-router-dom';
import './AppleStyleNavbar.css';

const AppleStyleNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // New state for dropdown

  const dropdownRef = useRef(null); // Ref for the dropdown container
  const userButtonRef = useRef(null); // Ref for the user button

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false); // Close dropdown when mobile menu is closed
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
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

        {/* Search and Document Type Actions */}
        <div className="navbar-actions">
          <button className="search-button" aria-label="搜索">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11.5 11.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
          <div style={{ position: 'relative' }}> {/* Wrapper for dropdown positioning */}
            <button
              className="user-button"
              aria-label="文档类型选择"
              onClick={toggleDropdown}
              ref={userButtonRef}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 14C2 11.7909 4.23858 10 7 10H9C11.7614 10 14 11.7909 14 14V15H2V14Z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="document-type-dropdown" ref={dropdownRef}>
                <NavLink
                  to="/editor"
                  className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
                  onClick={closeDropdown}
                  state={{ docType: 'gongan' }}
                >
                  公安标准
                </NavLink>
                <NavLink
                  to="/editor"
                  className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
                  onClick={closeDropdown}
                  state={{ docType: 'patent' }}
                >
                  发明专利
                </NavLink>
                <NavLink
                  to="/editor"
                  className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
                  onClick={closeDropdown}
                  state={{ docType: 'paper' }}
                >
                  科技论文
                </NavLink>
              </div>
            )}
          </div>
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
            <button className="mobile-user-button" onClick={toggleDropdown}> {/* Mobile dropdown trigger */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 14C2 11.7909 4.23858 10 7 10H9C11.7614 10 14 11.7909 14 14V15H2V14Z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              文档类型
            </button>
            {isDropdownOpen && ( // Mobile dropdown
              <div className="mobile-document-type-dropdown">
                <NavLink
                  to="/editor"
                  className={({ isActive }) => `mobile-dropdown-item ${isActive ? 'active' : ''}`}
                  onClick={closeMenu} // Close both mobile menu and dropdown
                  state={{ docType: 'gongan' }}
                >
                  公安标准
                </NavLink>
                <NavLink
                  to="/editor"
                  className={({ isActive }) => `mobile-dropdown-item ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                  state={{ docType: 'patent' }}
                >
                  发明专利
                </NavLink>
                <NavLink
                  to="/editor"
                  className={({ isActive }) => `mobile-dropdown-item ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                  state={{ docType: 'paper' }}
                >
                  科技论文
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppleStyleNavbar;