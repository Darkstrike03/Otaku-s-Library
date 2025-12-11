'use client';

import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import Login from './Login';
import { ThemeProvider, useTheme } from '../app/contexts/ThemeContext';

function LayoutContent({ children }) {
  const { isDark, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

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
      
      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} transition-colors duration-300`}>
        {children}
      </div>
      
      <Footer isDark={isDark} />
    </div>
  );
}

export default function ClientLayout({ children }) {
  return (
    <ThemeProvider>
      <LayoutContent>{children}</LayoutContent>
    </ThemeProvider>
  );
}