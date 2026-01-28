import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/program', icon: '👤', label: 'Program and Avatar customization' },
    { path: '/challenges', icon: '🏆', label: 'Challenges' },
    { path: '/goals', icon: '📈', label: 'Goals and Progress' },
    { path: '/activity-food', icon: '🍴', label: 'Activity and Food Log' },
    { path: '/notifications', icon: '📋', label: 'Notifications and Report' },
    { path: '/chatbot', icon: '💬', label: 'Chatbot' }
  ];

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
