import React from "react";
import { Link, useNavigate} from "react-router-dom";
import { useSelector } from "react-redux";
import { logout } from "../api";

export default function Navbar() {
  const user = useSelector((state) => state.user.value);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    handleNavigation();
  };
  
  const handleNavigation =  () => {
    if(!sessionStorage.getItem('accessToken') && ! sessionStorage.getItem('refresToken'))
    {
      navigate('/auth')
    }
  }

  return (
    <nav className="w-full bg-white shadow sticky top-0 z-30">
      <div className="flex justify-between items-center h-16 px-4"> {/* Full width */}
        {/* Left - Logo / User Info */}
        <div className="flex-shrink-0 flex items-center">
          <Link to="/dashboard" className="flex items-center space-x-3">
            {/* Avatar */}
            <img
              src={user?.avatar?.url || "/default-avatar.png"}
              alt={user?.firstName || "User"}
              className="w-10 h-10 rounded-full object-cover"
            />

            {/* Name and username */}
            <div className="flex flex-col">
              <span className="text-indigo-600 text-lg font-semibold">
                {user ? `${user.firstName} ${user.lastName}` : "Guest"}
              </span>
              {user && (
                <span className="text-gray-500 text-sm">@{user.username}</span>
              )}
            </div>
          </Link>
        </div>

        {/* Center - Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600">
            Dashboard
          </Link>
          <Link to="/workspace" className="text-gray-700 hover:text-indigo-600">
            Workspaces
          </Link>
          <Link to="/analytics" className="text-gray-700 hover:text-indigo-600">
            Analytics
          </Link>
          <Link to="/profile" className="text-gray-700 hover:text-indigo-600">
            Profile
          </Link>
        </div>

        {/* Right - User Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-700">
                Hi, {user.firstName || user.username}
              </span>
              <button
                onClick={handleLogout}
                
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
