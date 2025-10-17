import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { logout } from "../api";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const user = useSelector((state) => state.user.value);
  const { workspacesList } = useSelector((state) => state.workspace);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    if (!sessionStorage.getItem("accessToken")) navigate("/login");
  };
  
  const handleProfile = () => {
    navigate('/profile');
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-base-300/95 backdrop-blur-md shadow-lg border-b border-base-200 sticky top-0 z-50">
      <div className="flex justify-between items-center h-20 px-6 max-w-7xl mx-auto">
        {/* Left - User Profile */}
        <div className="flex-shrink-0 flex items-center">
          <Link 
            to="/profile" 
            className="flex items-center space-x-4 group transition-all duration-200 hover:bg-base-200/50 rounded-2xl p-2"
          >
            <div className="relative">
              <img
                src={user?.avatar?.url || "/default-avatar.png"}
                alt={user?.firstName || "User"}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 shadow-md group-hover:border-primary/40 transition-colors duration-200"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-base-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-primary  text-lg leading-tight">
                {user ? `${user.firstName} ${user.lastName}` : "Guest"}
              </span>
              {user && (
                <span className="text-secondary-content/80 text-sm font-medium">
                  @{user.username}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Center - Navigation Links */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link 
            to="/dashboard" 
            className="text-secondary-content font-semibold hover:text-primary transition-colors duration-200 px-4 py-2 rounded-xl hover:bg-base-200/50"
          >
            Dashboard
          </Link>

          {/* Workspaces Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center space-x-2 text-secondary-content font-semibold hover:text-primary transition-colors duration-200 px-4 py-2 rounded-xl hover:bg-base-200/50"
            >
              <span>My Workspaces</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <div className="absolute left-0 mt-3 w-64 bg-base-content border border-base-200 rounded-2xl shadow-xl backdrop-blur-md z-10 overflow-hidden">
                <ul className="max-h-80 overflow-y-auto">
                  {workspacesList.map((workspace) => (
                    <li key={workspace._id} className="border-b border-base-200 last:border-b-0">
                      <Link
                        to={`/workspace/${workspace._id}`}
                        className="flex items-center px-4 py-3 text-secondary hover:bg-primary/10 hover:text-primary transition-colors duration-200 group"
                        onClick={() => setOpen(false)}
                      >
                        <div className="w-2 h-2 bg-accent rounded-full mr-3 group-hover:scale-125 transition-transform duration-200"></div>
                        <span className="font-medium">{workspace.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {workspacesList.length === 0 && (
                  <div className="px-4 py-6 text-center text-secondary-content/60">
                    <p className="text-sm">No workspaces found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Link 
            to="/analytics" 
            className="text-secondary-content font-semibold hover:text-primary transition-colors duration-200 px-4 py-2 rounded-xl hover:bg-base-200/50"
          >
            Analytics
          </Link>
        </div>

        {/* Right - User Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleProfile}
            className="bg-accent hover:bg-accent/90 text-accent-content font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
          >
            Profile
          </button>
          
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-error hover:bg-error/90 text-error-content font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-primary hover:bg-primary/90 text-primary-content font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-base-200">
        <div className="flex justify-around items-center py-3 px-4">
          <Link 
            to="/dashboard" 
            className="flex flex-col items-center text-secondary-content hover:text-primary transition-colors duration-200 p-2 rounded-lg"
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Dashboard</span>
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className="flex flex-col items-center text-secondary-content hover:text-primary transition-colors duration-200 p-2 rounded-lg"
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-xs font-medium">Workspaces</span>
          </button>

          <Link 
            to="/analytics" 
            className="flex flex-col items-center text-secondary-content hover:text-primary transition-colors duration-200 p-2 rounded-lg"
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium">Analytics</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}