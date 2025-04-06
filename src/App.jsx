import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './Header/header';
import Hero from './Hero/hero';
import GameStart from './Case/gameStart.jsx'; // Import the GameStart component

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Hero />} /> {/* Home route */}
        <Route path="/gameStart" element={<GameStart />} /> {/* GameStart route */}
      </Routes>
    </>
  );
}

export default App;