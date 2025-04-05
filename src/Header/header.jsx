import React from 'react';

function Header() {
  return (
    <header className="bg-slate-900 border-b border-purple-800 shadow-lg p-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-purple-400">MysteryAI</h1>
      </div>
      <button className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-md transition-colors text-white">
        Sign In
      </button>
    </header>
  );
}

export default Header;