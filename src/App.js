import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/home/Home';
import Library from './components/Library';
import Profile from './components/Profile';
import Login from './components/Login';
import AnimeUI from './components/Pages/AnimeUi';
import MangaUI from './components/Pages/MangaUI';

// Router component that checks UID and routes to correct component
function DetailPageRouter() {
  const { uid } = useParams();
  
  if (!uid) {
    return <div className="text-white text-center mt-10">Invalid UID</div>;
  }
  
  const lastLetter = uid.charAt(uid.length - 1).toUpperCase();

  switch (lastLetter) {
    case 'A':
      return <AnimeUI />;
    case 'M':
      return <MangaUI />;
    case 'H':
      return <AnimeUI />; // Replace with ManhwaUI when ready
    case 'U':
      return <AnimeUI />; // Replace with ManhuaUI when ready
    case 'D':
      return <AnimeUI />; // Replace with DonghuaUI when ready
    case 'W':
      return <AnimeUI />; // Replace with WebnovelUI when ready
    default:
      return <AnimeUI />;
  }
}

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <Router>
      <Header 
        isDark={isDark} 
        toggleTheme={toggleTheme}
        isLoggedIn={isLoggedIn}
        onOpenLogin={() => setShowLogin(true)}
      />

      {showLogin && (
        <Login
          isDark={isDark}
          onLogin={() => {
            setIsLoggedIn(true);
            setShowLogin(false);
          }}
          onClose={() => setShowLogin(false)}
        />
      )}

      <Routes>
        <Route path="/" element={<Home isDark={isDark} toggleTheme={toggleTheme} />} />
        <Route path="/details/:uid" element={<DetailPageRouter />} />
        <Route path="/library" element={<Library isDark={isDark} />} />
        <Route path="/profile" element={<Profile isDark={isDark} />} />
      </Routes>

      <Footer isDark={isDark} />
    </Router>
  );
}