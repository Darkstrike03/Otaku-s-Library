'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tv, BookOpen, Book, Flame, TrendingUp, Star, Clock, ChevronLeft, Sparkles, Filter, SortAsc } from 'lucide-react';
import { useTheme } from '../app/contexts/ThemeContext';

export default function Popular({ category }) {
  const { isDark } = useTheme();
  const [popularData, setPopularData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [sortBy, setSortBy] = useState('rank'); // rank, rating, title
  const [filterStatus, setFilterStatus] = useState('all'); // all, ongoing, completed, hiatus
  const router = useRouter();

  // Categories configuration
  const categories = {
    anime: { name: 'Anime', icon: Tv, color: 'from-purple-500 to-pink-500', bgColor: 'purple' },
    manga: { name: 'Manga', icon: BookOpen, color: 'from-cyan-500 to-blue-500', bgColor: 'cyan' },
    manhwa: { name: 'Manhwa', icon: Book, color: 'from-pink-500 to-rose-500', bgColor: 'pink' },
    manhua: { name: 'Manhua', icon: Sparkles, color: 'from-yellow-500 to-orange-500', bgColor: 'yellow' },
    donghua: { name: 'Donghua', icon: TrendingUp, color: 'from-green-500 to-emerald-500', bgColor: 'green' },
    webnovels: { name: 'Novels', icon: Book, color: 'from-indigo-500 to-violet-500', bgColor: 'indigo' },
  };

  const currentCategory = categories[category] || categories.anime;
  const CategoryIcon = currentCategory.icon;

  // Load popular data from JSON
  useEffect(() => {
    const loadPopularData = async () => {
      try {
        const response = await fetch('/JSON/popular26.11.25.json');
        if (response.ok) {
          const data = await response.json();
          console.log('Loaded data:', data);
          console.log('Category:', category);
          const categoryData = data[category] || [];
          console.log('Category data:', categoryData);
          setPopularData(categoryData);
          setFilteredData(categoryData);
        } else {
          console.error('Failed to load JSON:', response.status);
        }
      } catch (error) {
        console.error('Error loading popular data:', error);
      }
    };

    loadPopularData();
  }, [category]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...popularData];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => 
        item.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Sort
    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
    // Default is rank order (as loaded)

    setFilteredData(filtered);
  }, [popularData, sortBy, filterStatus]);

  const handleCardClick = (uid) => {
    router.push(`/details/${uid}`);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} transition-colors duration-500 py-16 sm:py-24`}>
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => router.back()}
            className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-full transition-all duration-300 ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' 
                : 'bg-black/5 hover:bg-black/10 text-black border border-black/10'
            } backdrop-blur-xl`}
          >
            <ChevronLeft size={20} />
            <span className="font-bold">Back</span>
          </button>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
          } backdrop-blur-xl`}>
            <Flame size={20} className={`${isDark ? 'text-orange-400' : 'text-orange-600'} animate-pulse`} />
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              Trending Now
            </span>
          </div>

          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-4 ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            Popular
            <span className={`block sm:inline sm:ml-4 mt-2 sm:mt-0 text-transparent bg-clip-text bg-gradient-to-r ${currentCategory.color}`}>
              {currentCategory.name}
            </span>
          </h1>

          <p className={`text-lg ${isDark ? 'text-white/60' : 'text-black/60'} max-w-2xl`}>
            Discover all trending {currentCategory.name.toLowerCase()} this week
          </p>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Sort By */}
          <div className="flex items-center gap-2">
            <SortAsc size={20} className={isDark ? 'text-white/60' : 'text-black/60'} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 rounded-full font-bold transition-all duration-300 ${
                isDark 
                  ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' 
                  : 'bg-black/5 hover:bg-black/10 text-black border border-black/10'
              } backdrop-blur-xl cursor-pointer`}
            >
              <option value="rank">Sort by Rank</option>
              <option value="rating">Sort by Rating</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div className="flex items-center gap-2">
            <Filter size={20} className={isDark ? 'text-white/60' : 'text-black/60'} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-full font-bold transition-all duration-300 ${
                isDark 
                  ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' 
                  : 'bg-black/5 hover:bg-black/10 text-black border border-black/10'
              } backdrop-blur-xl cursor-pointer`}
            >
              <option value="all">All Status</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="hiatus">Hiatus</option>
            </select>
          </div>

          {/* Results Count */}
          <div className={`ml-auto px-4 py-2 rounded-full ${
            isDark ? 'bg-white/5 text-white/60 border border-white/10' : 'bg-black/5 text-black/60 border border-black/10'
          } backdrop-blur-xl`}>
            <span className="font-bold">{filteredData.length}</span> Results
          </div>
        </div>

        {/* Grid Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredData.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item.uid)}
              className="group/card cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 ${
                isDark ? 'bg-white/5' : 'bg-black/5'
              } backdrop-blur-xl border ${
                isDark ? 'border-white/10' : 'border-black/10'
              } hover:shadow-2xl`}>
                {/* Image */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                  />
                  
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${
                    isDark 
                      ? 'from-black via-black/50 to-transparent' 
                      : 'from-white via-white/50 to-transparent'
                  }`}></div>

                  {/* Rank badge */}
                  <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl text-white bg-gradient-to-br ${currentCategory.color} shadow-lg`}>
                    #{index + 1}
                  </div>

                  {/* Rating */}
                  <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full flex items-center gap-1 ${
                    isDark ? 'bg-black/50' : 'bg-white/50'
                  } backdrop-blur-xl`}>
                    <Star size={14} className="text-yellow-400" fill="currentColor" />
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                      {item.rating}
                    </span>
                  </div>

                  {/* Status badge */}
                  <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === 'Ongoing' 
                      ? 'bg-green-500/80 text-white' 
                      : item.status === 'Completed' 
                        ? 'bg-blue-500/80 text-white' 
                        : 'bg-orange-500/80 text-white'
                  } backdrop-blur-xl`}>
                    {item.status}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div
                    className={`font-black text-lg mb-2 line-clamp-2 ${
                      isDark ? 'text-white' : 'text-black'
                    }`}
                  >
                    {item.title}
                  </div>

                  <div className={`flex items-center gap-4 text-sm ${
                    isDark ? 'text-white/60' : 'text-black/60'
                  }`}>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>
                        {item.episodes ? `${item.episodes} Eps` : `${item.chapters} Ch`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp size={14} />
                      <span>Trending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="text-center py-16">
            <div className={`text-6xl mb-4 ${isDark ? 'text-white/20' : 'text-black/20'}`}>
              <CategoryIcon size={64} className="mx-auto" />
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
              No results found
            </h3>
            <p className={`${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
