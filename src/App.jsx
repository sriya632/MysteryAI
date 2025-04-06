import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Header from './Header/header';
import Hero from './Hero/hero';
import GameStart from './Case/gameStart.jsx';
import Auth, { isAuthenticated } from './Auth/Auth.jsx'; // Ensure correct import path for Auth component

// Simple protected route component
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/auth', { state: { from: location } });
    }
  }, [navigate, location]);

  return isAuthenticated() ? children : null;
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