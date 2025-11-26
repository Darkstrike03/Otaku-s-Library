import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/home/Home';
import AnimeUI from './components/Pages/AnimeUi';

export default function App() {
  const [isDark, setIsDark] = useState(true); // State for dark mode

  // Function to toggle dark mode
  const toggleTheme = () => setIsDark(!isDark);

  return (
    <Router>
      <Header isDark={isDark} toggleTheme={toggleTheme} />
      <Routes>
      <Route path="/" element={<Home isDark={isDark} toggleTheme={toggleTheme}/>} />
      <Route path="/details/:uid" element={<AnimeUI />} />
      </Routes>
      <Footer isDark={isDark} />  
    </Router>
  );
}