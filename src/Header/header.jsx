import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate(); 
  return (
    <header className="bg-slate-900 border-b border-purple-800 shadow-lg p-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-purple-400">MysteryAI</h1>
      </div>
      <button onClick={() => navigate('/gameStart')}className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-md transition-colors text-white">
        Sign In
      </button>
    </header>
  );
}

export default Header;