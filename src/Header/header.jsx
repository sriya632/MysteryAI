import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import AuthModal from './AuthModal';

function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleAuthClick = () => {
    if (currentUser) {
      // Sign out
      logout()
        .catch(error => {
          console.error("Error signing out:", error);
        });
    } else {
      // Show sign in modal
      setShowAuthModal(true);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-purple-800 shadow-lg p-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-purple-400">MysteryAI</h1>
      </div>
      
      <button 
        onClick={handleAuthClick}
        className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-md transition-colors text-white"
      >
        {currentUser ? 'Sign Out' : 'Sign In'}
      </button>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </header>
  );
}

export default Header;