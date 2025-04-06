import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './Header/header';
import { AuthProvider } from './Auth/authContext.jsx';
import Hero from './Hero/hero';
import GameStart from './Case/gameStart.jsx'; // Import the GameStart component

function App() {
  return (
    <>
      <Header />
      <Routes>
      <AuthProvider>
        <Route path="/" element={<Hero />} /> {/* Home route */}
        <Route path="/gameStart" element={<GameStart />} /> {/* GameStart route */}
        </AuthProvider>
      </Routes>
    </>
  );
}

export default App;