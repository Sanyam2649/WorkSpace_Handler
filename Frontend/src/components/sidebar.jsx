import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, clearAuth } from '../api';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Workspaces', path: '/workspace', icon: '📁' },
    { label: 'Profile', path: '/profile', icon: '👤' },
    // { label: 'Analytics', path: '/analytics', icon: '📊' },
    // { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <aside className="w-64 bg-white shadow fixed top-16 left-0 bottom-0 flex flex-col">
      {/* flex-col ensures nav items stack vertically */}
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul>
          {menuItems.map(({ label, path, icon }) => (
            <li key={label} className="mb-2">
              <button
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors duration-200 ${
                  location.pathname === path
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-indigo-100'
                }`}
              >
                <span className="text-lg">{icon}</span>
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout stays at bottom without huge spacing */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center gap-2 transition-colors duration-200"
        >
          🔒 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
