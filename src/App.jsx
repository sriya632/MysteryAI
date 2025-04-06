import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './Header/header';
import Hero from './Hero/hero';
import GameStart from './Case/gameStart.jsx';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/gameStart" element={<GameStart />} />
      </Routes>
    </>
  );
}

export default App;