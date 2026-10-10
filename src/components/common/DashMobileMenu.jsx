import React from 'react';
import { Menu, X } from 'lucide-react';
import './DashMobileMenu.css';

/**
 * Professional mobile section navigator for the dashboards.
 *
 * Renders a compact bar (current section + "Sections" button) and a bottom-sheet
 * drawer listing every section. Replaces the horizontally-scrolling tab strip,
 * which scatters sections off-screen and makes them hard to find on a phone.
 *
 * @param {Array}  items     - [{ key, label, icon, count, badge }]
 * @param {string} activeKey - currently selected section key
 * @param {func}   onSelect  - (key) => void
 * @param {string} title     - drawer heading, e.g. "Admin Sections"
 * @param {bool}   isOpen
 * @param {func}   onToggle  - () => void
 */
const DashMobileMenu = ({ items = [], activeKey, onSelect, title = 'Sections', isOpen, onToggle }) => {
  const active = items.find((item) => item.key === activeKey);

  const handleSelect = (key) => {
    onSelect(key);
    onToggle();
  };

  return (
    <>
      {/* Compact bar shown in place of the tab strip */}
      <div className="dash-mobile-bar">
        <div className="dash-mobile-bar-label">
          <small>Current section</small>
          <strong>{active?.label || 'Dashboard'}</strong>
        </div>

        <button
          type="button"
          className="dash-mobile-menu-btn"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={`Open ${title}`}
        >
          <Menu size={17} />
          <span>Sections</span>
        </button>
      </div>

      {/* Bottom-sheet drawer */}
      {isOpen && (
        <>
          <div className="dash-menu-overlay" onClick={onToggle} role="presentation" />
          <div className="dash-menu-sheet" role="dialog" aria-modal="true" aria-label={title}>
            <div className="dash-menu-grabber" />

            <div className="dash-menu-title">
              <h3>{title}</h3>
              <button type="button" className="dash-menu-close" onClick={onToggle} aria-label="Close menu">
                <X size={17} />
              </button>
            </div>

            <div className="dash-menu-list">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = item.key === activeKey;

                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`dash-menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelect(item.key)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {Icon && (
                      <span className="dash-menu-item-icon">
                        <Icon size={17} />
                      </span>
                    )}
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count !== null && (
                      <span className={`dash-menu-item-count ${item.badge ? 'has-badge' : ''}`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DashMobileMenu;
