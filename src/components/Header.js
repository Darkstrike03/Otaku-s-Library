import React, { useState } from 'react';
import { Search, Moon, Sun, Menu, BookOpen, Tv, Book, X } from 'lucide-react';

export default function Header({ isDark, toggleTheme }) {
  const [searchValue, setSearchValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className={`transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-white'}`}>
      {/* Glassmorphism Header */}
      <header
        className={`sticky top-0 z-50 ${
          isDark
            ? 'bg-black/40 backdrop-blur-2xl border-b border-white/10'
            : 'bg-white/40 backdrop-blur-2xl border-b border-black/10'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between gap-8">
            {/* Logo */}
            <div className="flex items-center gap-6 group cursor-pointer flex-shrink-0">
              <div className="relative flex items-center">
                <div
                  className={`absolute inset-0 blur-xl opacity-60 ${
                    isDark ? 'bg-purple-600' : 'bg-purple-400'
                  } rounded-full scale-150 group-hover:scale-175 transition-transform duration-500`}
                ></div>

                <div className="relative flex items-center">
                  <span
                    className={`text-5xl font-black ${
                      isDark
                        ? 'text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-600'
                        : 'text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-pink-800'
                    } font-serif tracking-tighter transform group-hover:scale-110 transition-transform duration-300`}
                  >
                    O
                  </span>
                  <span
                    className={`text-5xl font-black ${
                      isDark
                        ? 'text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600'
                        : 'text-transparent bg-clip-text bg-gradient-to-br from-cyan-600 to-blue-800'
                    } font-mono -ml-5 transform group-hover:scale-110 transition-transform duration-300`}
                  >
                    L
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <h1
                  className={`text-2xl font-black tracking-tight ${
                    isDark ? 'text-white' : 'text-black'
                  } group-hover:tracking-wide transition-all duration-300`}
                >
                  OTAKU'S LIBRARY
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div
                    className={`h-0.5 w-12 ${
                      isDark ? 'bg-gradient-to-r from-purple-500 to-transparent' : 'bg-gradient-to-r from-purple-600 to-transparent'
                    } group-hover:w-20 transition-all duration-300`}
                  ></div>
                  <span
                    className={`text-xs font-semibold tracking-widest ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`}
                  >
                    ALL IN ONE
                  </span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative group">
              <div
                className={`absolute -inset-0.5 ${
                  isDark
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600'
                    : 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500'
                } rounded-full opacity-30 group-hover:opacity-100 blur-sm transition-all duration-500`}
              ></div>

              <div className="relative">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search anime, manga, novels, characters..."
                  className={`w-full px-6 py-3.5 pl-14 pr-6 rounded-full text-sm font-medium transition-all duration-300 ${
                    isDark
                      ? 'bg-white/5 text-white placeholder-white/40 focus:bg-white/10'
                      : 'bg-black/5 text-black placeholder-black/40 focus:bg-black/10'
                  } backdrop-blur-xl outline-none border-2 ${
                    isDark ? 'border-white/10 focus:border-white/20' : 'border-black/10 focus:border-black/20'
                  }`}
                />
                <Search
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                    isDark ? 'text-purple-400' : 'text-purple-600'
                  } transition-colors duration-300`}
                  size={20}
                />

                {!searchValue && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Tv size={16} className={`${isDark ? 'text-white/20' : 'text-black/20'}`} />
                    <BookOpen size={16} className={`${isDark ? 'text-white/20' : 'text-black/20'}`} />
                    <Book size={16} className={`${isDark ? 'text-white/20' : 'text-black/20'}`} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <button
                onClick={toggleTheme} // Use the toggleTheme function passed as a prop
                className={`relative w-16 h-8 rounded-full transition-all duration-500 ${
                  isDark ? 'bg-white/10' : 'bg-black/10'
                } group/toggle hover:scale-110`}
                aria-label="Toggle theme"
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 rounded-full transition-all duration-500 ${
                    isDark
                      ? 'translate-x-0 bg-gradient-to-br from-purple-500 to-pink-500'
                      : 'translate-x-8 bg-gradient-to-br from-yellow-400 to-orange-500'
                  } flex items-center justify-center shadow-lg`}
                >
                  {isDark ? <Moon size={14} className="text-white" /> : <Sun size={14} className="text-white" />}
                </div>
              </button>

              <button
                className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'
                } backdrop-blur-xl`}
                aria-label="Menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>

          {/* Mobile & Tablet Layout */}
          <div className="lg:hidden">
            {/* Top Row - Logo and Controls */}
            <div className="flex items-center justify-between mb-3">
              {/* Compact Logo */}
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative flex items-center">
                  <div
                    className={`absolute inset-0 blur-lg opacity-60 ${
                      isDark ? 'bg-purple-600' : 'bg-purple-400'
                    } rounded-full scale-150`}
                  ></div>

                  <div className="relative flex items-center">
                    <span
                      className={`text-3xl sm:text-4xl font-black ${
                        isDark
                          ? 'text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-600'
                          : 'text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-pink-800'
                      } font-serif tracking-tighter`}
                    >
                      O
                    </span>
                    <span
                      className={`text-3xl sm:text-4xl font-black ${
                        isDark
                          ? 'text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600'
                          : 'text-transparent bg-clip-text bg-gradient-to-br from-cyan-600 to-blue-800'
                      } font-mono -ml-3 sm:-ml-4`}
                    >
                      L
                    </span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <h1
                    className={`text-lg sm:text-xl font-black tracking-tight ${
                      isDark ? 'text-white' : 'text-black'
                    }`}
                  >
                    OTAKU'S LIBRARY
                  </h1>
                  <span
                    className={`text-xs font-semibold tracking-wider ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`}
                  >
                    ALL IN ONE
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={toggleTheme}
                  className={`relative w-12 sm:w-14 h-7 sm:h-8 rounded-full transition-all duration-500 ${
                    isDark ? 'bg-white/10' : 'bg-black/10'
                  }`}
                  aria-label="Toggle theme"
                >
                  <div
                    className={`absolute top-1 left-1 w-5 sm:w-6 h-5 sm:h-6 rounded-full transition-all duration-500 ${
                      isDark
                        ? 'translate-x-0 bg-gradient-to-br from-purple-500 to-pink-500'
                        : 'translate-x-5 sm:translate-x-6 bg-gradient-to-br from-yellow-400 to-orange-500'
                    } flex items-center justify-center shadow-lg`}
                  >
                    {isDark ? <Moon size={12} className="text-white" /> : <Sun size={12} className="text-white" />}
                  </div>
                </button>

                <button
                  onClick={toggleMenu}
                  className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${
                    isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'
                  } backdrop-blur-xl`}
                  aria-label="Menu"
                >
                  {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>

            {/* Search Bar - Full Width */}
            <div className="relative group">
              <div
                className={`absolute -inset-0.5 ${
                  isDark
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600'
                    : 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500'
                } rounded-full opacity-30 group-hover:opacity-100 blur-sm transition-all duration-500`}
              ></div>

              <div className="relative">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search..."
                  className={`w-full px-4 sm:px-5 py-3 pl-11 sm:pl-12 pr-4 rounded-full text-sm font-medium transition-all duration-300 ${
                    isDark
                      ? 'bg-white/5 text-white placeholder-white/40 focus:bg-white/10'
                      : 'bg-black/5 text-black placeholder-black/40 focus:bg-black/10'
                  } backdrop-blur-xl outline-none border-2 ${
                    isDark ? 'border-white/10 focus:border-white/20' : 'border-black/10 focus:border-black/20'
                  }`}
                />
                <Search
                  className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 ${
                    isDark ? 'text-purple-400' : 'text-purple-600'
                  } transition-colors duration-300`}
                  size={18}
                />

                {!searchValue && (
                  <div className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-2">
                    <Tv size={14} className={`${isDark ? 'text-white/20' : 'text-black/20'}`} />
                    <BookOpen size={14} className={`${isDark ? 'text-white/20' : 'text-black/20'}`} />
                    <Book size={14} className={`${isDark ? 'text-white/20' : 'text-black/20'}`} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Animated border bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
          <div
            className={`h-full w-1/3 ${
              isDark
                ? 'bg-gradient-to-r from-transparent via-purple-500 to-transparent'
                : 'bg-gradient-to-r from-transparent via-purple-600 to-transparent'
            }`}
            style={{
              animation: 'slide 3s ease-in-out infinite',
            }}
          ></div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className={`lg:hidden fixed inset-0 z-40 ${
            isDark ? 'bg-black/95' : 'bg-white/95'
          } backdrop-blur-xl`}
        >
          <div className="container mx-auto px-4 py-6">
            <div className={`text-center text-xl ${isDark ? 'text-white' : 'text-black'}`}>Menu content here</div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}