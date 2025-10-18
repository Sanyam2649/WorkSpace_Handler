import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { logout } from "../api";
import { 
  Menu, 
  X, 
  LogOut, 
  LogIn, 
  User, 
  LayoutDashboard, 
  FolderKanban, 
  BarChart3,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useSelector((state) => state.user.value);
  const { workspacesList } = useSelector((state) => state.workspace);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    if (!sessionStorage.getItem("accessToken")) navigate("/login");
  };
  
  const handleProfile = () => {
    navigate('/profile');
    setMobileMenuOpen(false);
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  return (
    <nav className="w-full bg-base-300/95 backdrop-blur-md shadow-lg border-b border-base-200 sticky top-0 z-50">
      <div className="flex justify-between items-center h-16 lg:h-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Left - User Profile */}
        <div className="flex-shrink-0 flex items-center">
          <Link 
            to="/profile" 
            className="flex items-center space-x-3 group transition-all duration-200 hover:bg-base-200/50 rounded-xl lg:rounded-2xl p-2"
          >
            <div className="relative">
              <img
                src={user?.avatar?.url || "/default-avatar.png"}
                alt={user?.firstName || "User"}
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-primary/20 shadow-md group-hover:border-primary/40 transition-colors duration-200"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-success rounded-full border-2 border-base-300"></div>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-base-content text-sm lg:text-base leading-tight font-semibold">
                {user ? `${user.firstName} ${user.lastName}` : "Guest"}
              </span>
              {user && (
                <span className="text-base-content/70 text-xs lg:text-sm">
                  @{user.username}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Center - Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center space-x-6">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-2 text-base-content font-semibold hover:text-primary transition-colors duration-200 px-4 py-2 rounded-xl hover:bg-base-200/50 border border-transparent hover:border-primary/20"
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          {/* Workspaces Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center space-x-2 text-base-content font-semibold hover:text-primary transition-colors duration-200 px-4 py-2 rounded-xl hover:bg-base-200/50 border border-transparent hover:border-primary/20"
            >
              <FolderKanban size={20} />
              <span>Workspaces</span>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {open && (
              <div className="absolute left-0 mt-3 w-64 bg-base-100 border border-base-300 rounded-2xl shadow-xl backdrop-blur-md z-10 overflow-hidden">
                <div className="p-3 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-base-300">
                  <h3 className="font-semibold text-base-content text-sm">Your Workspaces</h3>
                </div>
                <ul className="max-h-80 overflow-y-auto">
                  {workspacesList.map((workspace) => (
                    <li key={workspace._id} className="border-b border-base-300 last:border-b-0">
                      <Link
                        to={`/workspace/${workspace._id}`}
                        className="flex items-center px-4 py-3 text-base-content hover:bg-primary/10 hover:text-primary transition-colors duration-200 group"
                        onClick={() => setOpen(false)}
                      >
                        <div className="w-2 h-2 bg-accent rounded-full mr-3 group-hover:scale-125 transition-transform duration-200"></div>
                        <span className="font-medium truncate">{workspace.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {workspacesList.length === 0 && (
                  <div className="px-4 py-8 text-center text-base-content/60">
                    <FolderKanban size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No workspaces found</p>
                    <p className="text-xs mt-1">Create your first workspace to get started</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Link 
            to="/analytics" 
            className="flex items-center space-x-2 text-base-content font-semibold hover:text-primary transition-colors duration-200 px-4 py-2 rounded-xl hover:bg-base-200/50 border border-transparent hover:border-primary/20"
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
          </Link>
        </div>

        {/* Right - User Actions (Desktop) */}
        <div className="hidden lg:flex items-center space-x-3">
          <button
            onClick={handleProfile}
            className="flex items-center space-x-2 bg-accent hover:bg-accent/90 text-accent-content font-semibold px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 text-sm lg:text-base border border-accent/20"
          >
            <User size={18} />
            <span>Profile</span>
          </button>
          
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-error hover:bg-error/90 text-error-content font-semibold px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 text-sm lg:text-base border border-error/20"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-content font-semibold px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 text-sm lg:text-base border border-primary/20"
            >
              <LogIn size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center space-x-2">
          {user && (
            <button
              onClick={handleProfile}
              className="flex items-center space-x-1 bg-accent hover:bg-accent/90 text-accent-content font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 shadow-md text-xs sm:text-sm border border-accent/20"
            >
              <User size={14} />
              <span className="hidden sm:inline">Profile</span>
            </button>
          )}
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-base-200/50 transition-colors duration-200 border border-base-300"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="lg:hidden absolute top-full left-0 right-0 bg-base-100 border-b border-base-300 shadow-xl z-40 animate-in slide-in-from-top duration-200"
        >
          <div className="px-4 py-3 space-y-1">
            {/* User Info in Mobile Menu */}
            <div className="p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg mb-2">
              <div className="flex items-center space-x-3">
                <img
                  src={user?.avatar?.url || "/default-avatar.png"}
                  alt={user?.firstName || "User"}
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary/30"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-base-content font-semibold truncate">
                    {user ? `${user.firstName} ${user.lastName}` : "Guest"}
                  </p>
                  {user && (
                    <p className="text-base-content/70 text-sm truncate">
                      @{user.username}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-3 text-base-content hover:text-primary transition-colors duration-200 p-3 rounded-lg hover:bg-base-200/50 border border-transparent hover:border-primary/20"
              onClick={() => setMobileMenuOpen(false)}
            >
              <LayoutDashboard size={20} className="flex-shrink-0 text-primary" />
              <span className="font-medium">Dashboard</span>
            </Link>

            {/* Mobile Workspaces Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center space-x-3 text-base-content hover:text-primary transition-colors duration-200 p-3 rounded-lg hover:bg-base-200/50 border border-transparent hover:border-primary/20 w-full text-left"
              >
                <FolderKanban size={20} className="flex-shrink-0 text-accent" />
                <span className="font-medium">Workspaces</span>
                {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {open && (
                <div className="ml-4 mt-2 bg-base-200 rounded-lg overflow-hidden border border-base-300">
                  <ul className="max-h-48 overflow-y-auto">
                    {workspacesList.map((workspace) => (
                      <li key={workspace._id} className="border-b border-base-300 last:border-b-0">
                        <Link
                          to={`/workspace/${workspace._id}`}
                          className="flex items-center px-3 py-2 text-sm text-base-content hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                          onClick={() => {
                            setOpen(false);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <div className="w-1.5 h-1.5 bg-accent rounded-full mr-2"></div>
                          <span className="truncate">{workspace.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {workspacesList.length === 0 && (
                    <div className="px-3 py-4 text-center text-base-content/60">
                      <FolderKanban size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No workspaces found</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link 
              to="/analytics" 
              className="flex items-center space-x-3 text-base-content hover:text-primary transition-colors duration-200 p-3 rounded-lg hover:bg-base-200/50 border border-transparent hover:border-primary/20"
              onClick={() => setMobileMenuOpen(false)}
            >
              <BarChart3 size={20} className="flex-shrink-0 text-info" />
              <span className="font-medium">Analytics</span>
            </Link>

            {/* Profile Link in Mobile Menu */}
            <button
              onClick={handleProfile}
              className="flex items-center space-x-3 text-base-content hover:text-primary transition-colors duration-200 p-3 rounded-lg hover:bg-base-200/50 border border-transparent hover:border-primary/20 w-full text-left"
            >
              <User size={20} className="flex-shrink-0 text-secondary" />
              <span className="font-medium">My Profile</span>
            </button>

            {/* Mobile Auth Buttons */}
            <div className="pt-3 border-t border-base-300">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 bg-error hover:bg-error/90 text-error-content font-semibold p-3 rounded-lg transition-all duration-200 shadow-md border border-error/20"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-primary-content font-semibold p-3 rounded-lg transition-all duration-200 shadow-md border border-primary/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}