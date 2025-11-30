import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Library from './components/Library';
import Profile from './components/Profile';
import Home from './components/home/Home';
import AnimeUI from './components/Pages/AnimeUi';
import Login from './components/Login'; // ⬅️ import Login

export default function App() {
  const [isDark, setIsDark] = useState(true);

  // AUTH STATE
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <Router>
      {/* HEADER */}
      <Header 
        isDark={isDark} 
        toggleTheme={toggleTheme}
        isLoggedIn={isLoggedIn}                // ⬅️ give login state to Header
        onOpenLogin={() => setShowLogin(true)} // ⬅️ tell Header how to open modal
      />

      {/* LOGIN MODAL */}
      {showLogin && (
        <Login
          isDark={isDark}
          onLogin={() => {
            setIsLoggedIn(true);  // ⬅️ mark user as logged in
            setShowLogin(false);  // ⬅️ close modal
          }}
          onClose={() => setShowLogin(false)}
        />
      )}

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<Home isDark={isDark} toggleTheme={toggleTheme}/>} />
        <Route path="/details/:uid" element={<AnimeUI />} />
        <Route path="/library" element={<Library isDark={isDark} />} />
        <Route path="/profile" element={<Profile isDark={isDark} />} />
      </Routes>

      <Footer isDark={isDark} />
    </Router>
  );
}
