// src/App.jsx (update ProtectedRoute component)
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Header from './Header/header';
import Hero from './Hero/hero';
import GameStart from './Case/gameStart.jsx';
import Auth from './Auth/Auth.jsx';
import { onAuthStateChange } from '../Firebase/userAuth';

// Simple protected route component
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setAuthenticated(!!user);
      setLoading(false);
      
      if (!user) {
        navigate('/auth', { state: { from: location } });
      }
    });
    
    return () => unsubscribe();
  }, [navigate, location]);

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <p className="text-purple-300">Loading...</p>
    </div>;
  }

  return authenticated ? children : null;
};

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/auth" element={<Auth />} />
        <Route 
          path="/gameStart" 
          element={
            <ProtectedRoute>
              <GameStart />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;