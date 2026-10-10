import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Heart, User, LogOut, Menu, X, LogIn, HelpCircle } from 'lucide-react';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItemCount } = useCart();

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Close the drawer whenever the route changes so it never covers the new page.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // While the drawer is open: close on Escape, on outside click, and lock page scroll.
  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    const onPointerDown = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="main-header" ref={headerRef}>
      <div className="header-container">

        {/* Brand Logo */}
        <Link to="/" className="logo-area" onClick={closeMobileMenu}>
          <span className="logo-title">ASHVA</span>
          <span className="logo-subtitle">EQUINE WELLNESS</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-menu-desktop">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Home
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Products Catalog
          </NavLink>

          <a href="/#events" className="nav-link">Upcoming Events</a>

          <NavLink
            to="/working-horses"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Our Mission
          </NavLink>

          <NavLink
            to="/donate"
            className={({ isActive }) => (isActive ? 'nav-link active nav-donate-highlight' : 'nav-link nav-donate-highlight')}
          >
            <Heart size={15} className="donate-heart-icon" />
            Donate
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Contact Us
          </NavLink>
        </nav>

        {/* Right Header Actions */}
        <div className="header-right-actions">

          {/* Shopping Cart Icon with Dynamic Count Badge */}
          <Link to="/cart" className="cart-capsule-btn" aria-label="Shopping Cart">
            <ShoppingBag size={18} />
            <span className="cart-text">Cart</span>
            {totalItemCount > 0 && (
              <span className="cart-count-badge">{totalItemCount}</span>
            )}
          </Link>

          {/* User Auth Profile Badge */}
          {isAuthenticated ? (
            <div className="user-profile-dropdown">
              <span className="user-name-tag">
                <User size={15} />
                <span className="user-name-text">
                  {user?.name?.split(' ')[0]}{' '}
                  {user?.role === 'volunteer' && user?.status !== 'approved'
                    ? '(Pending)'
                    : `(${user?.role})`}
                </span>
              </span>

              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" className="dash-link">Admin Desk</Link>
              )}
              {user?.role === 'volunteer' && user?.status === 'approved' && (
                <Link to="/volunteer/dashboard" className="dash-link">Volunteer Desk</Link>
              )}
              {user?.role === 'volunteer' && user?.status !== 'approved' && (
                <Link to="/volunteer" className="dash-link">Approval Status</Link>
              )}
              {user?.role === 'customer' && (
                <>
                  <Link to="/orders" className="dash-link">My Orders</Link>
                  <Link to="/volunteer" state={{ mode: 'apply' }} className="dash-link">Apply as Volunteer</Link>
                </>
              )}

              <button className="btn-logout-header" onClick={logout} title="Sign Out">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-signin-nav">
              <LogIn size={15} />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className={`mobile-toggle-btn ${isMobileMenuOpen ? 'is-open' : ''}`}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-drawer"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <nav id="mobile-drawer" className="mobile-drawer-menu" aria-label="Mobile navigation">
          <div className="mobile-drawer-sheet">
            <div className="mobile-drawer-links">
              <NavLink to="/" end onClick={closeMobileMenu} className="mobile-link">Home</NavLink>
              <NavLink to="/products" onClick={closeMobileMenu} className="mobile-link">Products Catalog</NavLink>
              <NavLink to="/working-horses" onClick={closeMobileMenu} className="mobile-link">Our Mission</NavLink>
              <a href="/#events" onClick={closeMobileMenu} className="mobile-link">Upcoming Events</a>
              <a href="/#faq" onClick={closeMobileMenu} className="mobile-link">
                <HelpCircle size={16} aria-hidden="true" />
                FAQs
              </a>
              <NavLink to="/donate" onClick={closeMobileMenu} className="mobile-link donate">
                <Heart size={16} aria-hidden="true" />
                Donate Now
              </NavLink>
              <NavLink to="/contact" onClick={closeMobileMenu} className="mobile-link">Contact Us</NavLink>
              <NavLink to="/cart" onClick={closeMobileMenu} className="mobile-link">
                <ShoppingBag size={16} aria-hidden="true" />
                Cart ({totalItemCount} {totalItemCount === 1 ? 'Item' : 'Items'})
              </NavLink>
            </div>

            <div className="mobile-drawer-footer">
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Link to="/admin/dashboard" onClick={closeMobileMenu} className="mobile-link">Admin Dashboard</Link>
                  )}
                  {user?.role === 'volunteer' && user?.status === 'approved' && (
                    <Link to="/volunteer/dashboard" onClick={closeMobileMenu} className="mobile-link">Volunteer Dashboard</Link>
                  )}
                  {user?.role === 'volunteer' && user?.status !== 'approved' && (
                    <Link to="/volunteer" onClick={closeMobileMenu} className="mobile-link">Approval Status</Link>
                  )}
                  {user?.role === 'customer' && (
                    <>
                      <Link to="/orders" onClick={closeMobileMenu} className="mobile-link">My Orders</Link>
                      <Link to="/volunteer" state={{ mode: 'apply' }} onClick={closeMobileMenu} className="mobile-link">Apply as Volunteer</Link>
                    </>
                  )}
                  <button className="mobile-logout-btn" onClick={() => { logout(); closeMobileMenu(); }}>
                    <LogOut size={16} />
                    Sign Out ({user?.name?.split(' ')[0]})
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="mobile-signin-btn"
                >
                  <LogIn size={16} />
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;