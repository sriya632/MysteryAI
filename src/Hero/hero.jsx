// src/Hero/hero.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChange } from '../../Firebase/userAuth';

function Hero() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  
  useEffect(() => {
    // Update logged in status when auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      setLoggedIn(!!user);
    });
    
    return () => unsubscribe();
  }, []);

  const handlePlayGame = () => {
    if (loggedIn) {
      navigate('/gameStart');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 bg-slate-900 font-mono">
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-slate-800 rounded-lg shadow-xl p-8 border border-purple-900">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">Welcome to Mystery Game AI!</h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-purple-300">Rules</h3>
            <ul className="space-y-2 text-slate-200 text-center">
              <li className="flex items-start justify-center">
                <span className="text-purple-400 mr-2">•</span> 
                <span>Solve the mystery by finding clues</span>
              </li>
              <li className="flex items-start justify-center">
                <span className="text-purple-400 mr-2">•</span> 
                <span>Ask questions to uncover hidden secrets</span>
              </li>
              <li className="flex items-start justify-center">
                <span className="text-purple-400 mr-2">•</span> 
                <span>Make deductions to identify the culprit</span>
              </li>
              <li className="flex items-start justify-center">
                <span className="text-purple-400 mr-2">•</span> 
                <span>Submit your final theory to win the game</span>
              </li>
              <li className="flex items-start justify-center">
                <span className="text-purple-400 mr-2">•</span> 
                <span>Time is limited, so think carefully</span>
              </li>
            </ul>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handlePlayGame}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-md text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {loggedIn ? 'Play Game' : 'Sign In to Play'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;