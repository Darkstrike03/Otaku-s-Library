'use client';
import React from 'react';
import Section1 from './Section1';
import Section2 from './Section2';
import Section3 from './Section3';
import Section4 from './Section4';
import { useTheme } from '../../app/contexts/ThemeContext';

export default function Home() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} transition-colors duration-300`}>
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
    </div>
  );
}