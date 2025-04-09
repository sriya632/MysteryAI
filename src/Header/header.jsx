// src/Header/header.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, onAuthStateChange, logoutUser } from '../../Firebase/userAuth';

function Header() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  // Update auth state when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setLoggedIn(!!user);
      setUsername(user ? user.displayName : '');
    });
    
    return () => unsubscribe();
  }, []);

  const handleAuthClick = () => {
    if (loggedIn) {
      navigate('/gameStart');
    } else {
      navigate('/auth');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
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