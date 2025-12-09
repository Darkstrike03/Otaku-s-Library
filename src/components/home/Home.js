'use client';

import React, { useState } from 'react';
import Section1 from './Section1';
import Section2 from './Section2';
import Section3 from './Section3';
import Section4 from './Section4';

export default function Home() {
  // Move state management here (client component)
  const [isDark, setIsDark] = useState(true);
  
  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'}`}>
      <Section1 isDark={isDark} toggleTheme={toggleTheme} />
      <Section2 isDark={isDark} />
      <Section3 isDark={isDark} />
      <Section4 isDark={isDark} />
    </div>
  );
}