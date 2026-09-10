import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Heart, User, LogOut, Menu, X } from 'lucide-react';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItemCount } = useCart();

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="main-header">
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
                {user?.name?.split(' ')[0]} {user?.role === 'volunteer' && user?.status !== 'approved' ? '(Application Pending)' : `(${user?.role})`}
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
              Sign In
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button className="mobile-toggle-btn" onClick={toggleMobileMenu} aria-label="Toggle Menu">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-menu">
          <NavLink to="/" end onClick={closeMobileMenu} className="mobile-link">Home</NavLink>
          <NavLink to="/products" onClick={closeMobileMenu} className="mobile-link">Products Catalog</NavLink>
          <NavLink to="/working-horses" onClick={closeMobileMenu} className="mobile-link">Working Horses Initiative</NavLink>
          <a href="/#events" onClick={closeMobileMenu} className="mobile-link">Upcoming Events</a>
          <NavLink to="/working-horses" onClick={closeMobileMenu} className="mobile-link">Our Mission</NavLink>
          <NavLink to="/donate" onClick={closeMobileMenu} className="mobile-link donate">
            <Heart size={16} aria-hidden="true" />
            Donate Now
          </NavLink>
          <NavLink to="/contact" onClick={closeMobileMenu} className="mobile-link">Contact Us</NavLink>
          <NavLink to="/cart" onClick={closeMobileMenu} className="mobile-link">
            Cart ({totalItemCount} Items)
          </NavLink>

          {isAuthenticated ? (
            <button className="mobile-logout-btn" onClick={() => { logout(); closeMobileMenu(); }}>
              Sign Out ({user?.name})
            </button>
          ) : (
            <Link to="/login" onClick={closeMobileMenu} className="mobile-signin-btn">
              Sign In / Register
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;