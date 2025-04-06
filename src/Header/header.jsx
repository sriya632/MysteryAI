import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, logout, getUsername } from '../Auth/Auth';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());
  const [username, setUsername] = useState(getUsername());

  // Update auth state when location changes or local storage changes
  useEffect(() => {
    const checkAuth = () => {
      setLoggedIn(isAuthenticated());
      setUsername(getUsername());
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [location.pathname]);

  const handleAuthClick = () => {
    if (loggedIn) {
      navigate('/gameStart');
    } else {
      navigate('/auth');
    }
  };

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <header className="bg-slate-900 border-b border-purple-800 shadow-lg p-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 
          onClick={() => navigate('/')} 
          className="text-2xl font-bold text-purple-400 cursor-pointer"
        >
          MysteryAI
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {loggedIn && (
          <span className="text-purple-300">
            Welcome, <span className="font-semibold">{username}</span>
          </span>
        )}
        
        {loggedIn ? (
          <div className="flex gap-3">
            <button 
              onClick={handleAuthClick}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-md transition-colors text-white"
            >
              Play Game
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md transition-colors text-white"
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={handleAuthClick}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-md transition-colors text-white"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;