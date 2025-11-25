import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/home/Home';

export default function App() {
  const [isDark, setIsDark] = useState(true); // State for dark mode

  // Function to toggle dark mode
  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div>
      {/* Pass isDark and toggleTheme to Header */}
      <Header isDark={isDark} toggleTheme={toggleTheme} />
      <Home isDark={isDark} toggleTheme={toggleTheme}/>
      <Footer isDark={isDark} />
    </div>
  );
}