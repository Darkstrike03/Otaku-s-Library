'use client';

import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import Login from './Login';

export default function ClientLayout({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className={isDark ? 'dark' : ''}>
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

      {children}

      <Footer isDark={isDark} />
    </div>
  );
}