import React from 'react';
import HeroSection from './Section1';
import PopularSection from './Section2';
import LibrarianPicks from './Section3';
import Section4 from './Section4';

export default function Home({ isDark, toggleTheme }) {
  return (
    <div>
      <HeroSection isDark={isDark} toggleTheme={toggleTheme}/>
      <PopularSection isDark={isDark} />
      <LibrarianPicks isDark={isDark} />
      <Section4 isDark={isDark} />
    </div>
  );
}