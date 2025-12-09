'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabaseClient';
import {
  Grid, List, Search, SlidersHorizontal, ChevronDown, Star, Clock, BookOpen, Tv, Book,
  Sparkles, TrendingUp, Filter, X, Heart, MessageCircle, Plus
} from 'lucide-react';

export default function Library() {
  const [isDark, setIsDark] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryData, setLibraryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null); // Track expanded card
  const router = useRouter();

  const categories = [
    { id: 'all', name: 'All', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
    { id: 'anime', name: 'Anime', icon: Tv, color: 'from-purple-500 to-pink-500' },
    { id: 'manga', name: 'Manga', icon: BookOpen, color: 'from-cyan-500 to-blue-500' },
    { id: 'manhwa', name: 'Manhwa', icon: Book, color: 'from-pink-500 to-rose-500' },
    { id: 'manhua', name: 'Manhua', icon: Sparkles, color: 'from-yellow-500 to-orange-500' },
    { id: 'donghua', name: 'Donghua', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { id: 'webnovels', name: 'Web Novels', icon: Book, color: 'from-indigo-500 to-violet-500' },
  ];

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const sortOptions = [
    { value: 'title', label: 'Title (A-Z)' },
    { value: 'rating', label: 'Rating' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'recent', label: 'Recently Added' },
  ];

  useEffect(() => {
    loadLibraryData();
  }, []);

  useEffect(() => {
    filterAndSortData();
  }, [libraryData, selectedCategory, sortBy, searchQuery, selectedLetter]);

  // Fetch data from Supabase
  const loadLibraryData = async () => {
  setLoading(true);
  try {
    const tables = [
      { name: 'Ani_data', category: 'anime', hasEpisodes: true },
      { name: 'Manga_data', category: 'manga', hasEpisodes: false },
      { name: 'Manhwa_data', category: 'manhwa', hasEpisodes: false },
      { name: 'Webnovel_data', category: 'webnovels', hasEpisodes: false },
      { name: 'Manhua_data', category: 'manhua', hasEpisodes: false },
      { name: 'Donghua_data', category: 'donghua', hasEpisodes: true },
    ];

    let allData = [];

    // Fetch from all tables
    for (const table of tables) {
  // Select different columns based on table type
  const columns = table.hasEpisodes 
    ? 'uid, title, poster, rating, status, episodes, main_gen, genre, synopsis'
    : 'uid, title, poster, rating, status, chapters, main_gen, genre, synopsis';

  const { data, error } = await supabase
    .from(table.name)
    .select(columns);

  if (!error && data) {
    const formattedData = data.map((item) => ({
      id: item.uid,
      uid: item.uid,
      title: item.title || 'Unknown Title',
      poster: item.poster || 'https://via.placeholder.com/300x450?text=No+Image',
      rating: item.rating || 'N/A',
      status: item.status || 'Unknown',
      episodes: item.episodes || 0,
      chapters: item.chapters || 0,
      main_gen: item.main_gen || 'Unknown Genre',
      genre: Array.isArray(item.genre) ? item.genre.join(', ') : item.genre || 'Unknown Genre',
      synopsis: item.synopsis || 'No synopsis available.',
      category: table.category,
    }));
    allData = [...allData, ...formattedData];
  } else if (error) {
    console.error(`Error fetching from ${table.name}:`, error); // Add this for debugging
  }
}

    setLibraryData(allData.length > 0 ? allData : getDemoData());
  } catch (error) {
    console.error('Unexpected error:', error);
    setLibraryData(getDemoData());
  }
  setLoading(false);
};

  const getDemoData = () => {
    const demoItems = [];
    const categories = ['anime', 'manga', 'manhwa', 'manhua', 'donghua', 'webnovels'];
    const titles = ['Attack on Titan', 'Berserk', 'Solo Leveling', 'Tales of Demons', 'Link Click', 'Omniscient Reader'];
    
    categories.forEach((cat, i) => {
      for (let j = 0; j < 8; j++) {
        const suffixMap = { anime: 'A', manga: 'M', manhwa: 'H', manhua: 'U', donghua: 'D', webnovels: 'W' };
demoItems.push({
  id: `${i * 8 + j}${suffixMap[cat]}`,
  uid: `${i * 8 + j}${suffixMap[cat]}`, // add this
  title: `${titles[i]} ${j + 1}`,
  category: cat,
  poster: `https://images.unsplash.com/photo-${1578632767115 + j}?w=400`,
  rating: (8 + Math.random() * 1.5).toFixed(1),
  status: ['Ongoing', 'Completed', 'Hiatus'][Math.floor(Math.random() * 3)],
  episodes: cat === 'anime' || cat === 'donghua' ? Math.floor(Math.random() * 50) + 10 : undefined,
  chapters: cat !== 'anime' && cat !== 'donghua' ? Math.floor(Math.random() * 200) + 50 : undefined,
});
      }
    });
    return demoItems;
  };

  const filterAndSortData = () => {
    let filtered = [...libraryData];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLetter !== 'all') {
      filtered = filtered.filter(item => 
        item.title.toUpperCase().startsWith(selectedLetter)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'rating':
          return parseFloat(b.rating) - parseFloat(a.rating);
        case 'popularity':
          return (b.members || 0) - (a.members || 0);
        case 'recent':
          return b.id - a.id;
        default:
          return 0;
      }
    });

    setFilteredData(filtered);
  };

  const toggleExpandCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id); // Toggle expanded card
  };

  const GridCard = ({ item }) => (
  <div
    className={`group relative rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer ${
      expandedCard === item.id ? 'col-span-2 row-span-2' : ''
    } ${
      isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
    } backdrop-blur-xl`}
    onClick={() => toggleExpandCard(item.id)}
  >
    {/* Poster Section */}
    <div className={`relative overflow-hidden transition-all duration-500 ${
      expandedCard === item.id ? 'h-64' : 'aspect-[3/4]'
    }`}>
      <img 
        src={item.poster} 
        alt={item.title} 
        className={`w-full h-full object-cover transition-all duration-500 ${
          expandedCard === item.id ? 'object-top' : 'group-hover:scale-110'
        }`} 
      />
      <div className={`absolute inset-0 bg-gradient-to-t ${
        isDark ? 'from-black via-black/60 to-transparent' : 'from-white via-white/60 to-transparent'
      }`}></div>

      {/* Badges */}
      <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
        isDark ? 'bg-purple-500/80 text-white' : 'bg-purple-600/80 text-white'
      } backdrop-blur-xl`}>
        {item.main_gen}
      </div>

      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full flex items-center gap-1 ${
        isDark ? 'bg-black/60' : 'bg-white/60'
      } backdrop-blur-xl`}>
        <Star size={12} className="text-yellow-400" fill="currentColor" />
        <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{item.rating}</span>
      </div>

      <div className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${
        item.status === 'Ongoing' ? 'bg-green-500/80' : item.status === 'Completed' ? 'bg-blue-500/80' : 'bg-orange-500/80'
      } text-white backdrop-blur-xl`}>
        {item.status}
      </div>
    </div>

    {/* Content Section */}
    <div className={`p-4 transition-all duration-500 ${
      expandedCard === item.id ? 'space-y-4' : ''
    }`}>
      <h3 className={`font-black text-base mb-2 transition-all duration-300 ${
        expandedCard === item.id ? 'text-xl' : 'line-clamp-2'
      } ${isDark ? 'text-white' : 'text-black'}`}>
        {item.title}
      </h3>

      {/* Expanded Details with smooth animation */}
      <div className={`overflow-hidden transition-all duration-500 ${
        expandedCard === item.id ? 'max-h-108 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {expandedCard === item.id && (
          <div className="space-y-3 animate-fadeIn">
            {/* Genre Pills */}
            <div className="flex flex-wrap gap-2">
              {item.genre.split(', ').slice(0, 3).map((genre, idx) => (
                <span 
                  key={idx}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isDark 
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30' 
                      : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 border border-purple-500/30'
                  }`}
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            {/* Synopsis with Custom Scrollbar */}
<div className={`relative ${
  isDark ? 'bg-white/5' : 'bg-black/5'
} rounded-xl p-3 border ${
  isDark ? 'border-white/10' : 'border-black/10'
}`}>
  <div className={`text-sm leading-relaxed max-h-32 overflow-y-auto pr-2 custom-scrollbar ${
    isDark ? 'text-white/70' : 'text-black/70'
  }`}>
    {item.synopsis}
  </div>
  {/* Scroll Indicator */}
  <div className={`absolute bottom-0 left-0 right-0 h-8 pointer-events-none bg-gradient-to-t ${
    isDark ? 'from-white/5 to-transparent' : 'from-black/5 to-transparent'
  }`}></div>
</div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 pt-2">
              {item.episodes > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                  <span className={`text-xs font-bold ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                    {item.episodes} eps
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* More Details Button */}
<button
  onClick={(e) => {
    e.stopPropagation();
    router.push(`/details/${item.uid}`); // now uid exists
  }}
  className={`w-full mt-2 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group ${
    isDark 
      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/20' 
      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30'
  } hover:scale-[1.02] active:scale-95`}
>
  <BookOpen size={16} className="group-hover:rotate-12 transition-transform duration-300" />
  View Full Details
  <ChevronDown size={16} className="-rotate-90 group-hover:translate-x-1 transition-transform duration-300" />
</button>
    </div>

    {/* Expand Indicator */}
    <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
      isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
    } backdrop-blur-xl ${expandedCard === item.id ? 'rotate-180' : ''}`}>
      <ChevronDown size={14} className={isDark ? 'text-white' : 'text-black'} />
    </div>
  </div>
);

  const ListItem = ({ item }) => (
    <div className={`group flex gap-4 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
      isDark ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-black/5 hover:bg-black/10 border border-black/10'
    } backdrop-blur-xl`}>
      <div className="relative w-24 h-32 flex-shrink-0 rounded-xl overflow-hidden">
        <img src={item.poster} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold ${
          isDark ? 'bg-black/80' : 'bg-white/80'
        } backdrop-blur-xl`}>
          <Star size={10} className="text-yellow-400 inline" fill="currentColor" /> {item.rating}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={`font-black text-lg line-clamp-1 ${isDark ? 'text-white' : 'text-black'}`}>
              {item.title}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex-shrink-0 ${
              isDark ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-purple-500/20 text-purple-600 border border-purple-500/30'
            }`}>
              {item.category}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className={`px-2.5 py-1 rounded-lg ${
              item.status === 'Ongoing' ? 'bg-green-500/20 text-green-400' : item.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
            }`}>
              {item.status}
            </span>
            <span className={isDark ? 'text-white/60' : 'text-black/60'}>
              {item.episodes ? `${item.episodes} Episodes` : `${item.chapters} Chapters`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} transition-colors duration-500 py-8`}>
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            Library
            <span className={`block sm:inline sm:ml-4 mt-2 sm:mt-0 text-transparent bg-clip-text bg-gradient-to-r ${
              isDark ? 'from-purple-400 via-pink-400 to-cyan-400' : 'from-purple-600 via-pink-600 to-cyan-600'
            }`}>
              Collection
            </span>
          </h1>
          <p className={`text-lg ${isDark ? 'text-white/60' : 'text-black/60'}`}>
            Browse through {filteredData.length} titles across all categories
          </p>
        </div>

        {/* Search & Controls */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-full opacity-30 group-hover:opacity-100 blur-sm transition-all duration-500`}></div>
            <div className="relative flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title..."
                className={`flex-1 px-6 py-4 pl-14 rounded-full text-base font-medium transition-all duration-300 ${
                  isDark ? 'bg-white/5 text-white placeholder-white/40 focus:bg-white/10' : 'bg-black/5 text-black placeholder-black/40 focus:bg-black/10'
                } backdrop-blur-xl outline-none border-2 ${isDark ? 'border-white/10 focus:border-white/20' : 'border-black/10 focus:border-black/20'}`}
              />
              <Search className={`absolute left-5 top-1/2 -translate-y-1/2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} size={20} />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className={`absolute right-5 top-1/2 -translate-y-1/2 p-1 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}>
                  <X size={18} className={isDark ? 'text-white/60' : 'text-black/60'} />
                </button>
              )}
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className={`flex items-center gap-2 p-1.5 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
              <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : isDark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}>
                <Grid size={18} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : isDark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}>
                <List size={18} />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 cursor-pointer ${isDark ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' : 'bg-black/5 hover:bg-black/10 text-black border border-black/10'} backdrop-blur-xl outline-none`}>
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Filter Button */}
            <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${isDark ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' : 'bg-black/5 hover:bg-black/10 text-black border border-black/10'} backdrop-blur-xl`}>
              <Filter size={18} />
              Filters
              <ChevronDown size={16} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex-1"></div>

            {/* Results Count */}
            <span className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              {filteredData.length} results
            </span>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl space-y-6`}>
              {/* Category Filter */}
              <div>
                <h3 className={`text-sm font-black mb-3 ${isDark ? 'text-white' : 'text-black'}`}>CATEGORY</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => {
                    const Icon = cat.icon;
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${isActive ? `bg-gradient-to-r ${cat.color} text-white scale-105` : isDark ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-black/60 hover:text-black'}`}>
                        <Icon size={16} />
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* A-Z Filter */}
              <div>
                <h3 className={`text-sm font-black mb-3 ${isDark ? 'text-white' : 'text-black'}`}>ALPHABETICAL</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedLetter('all')} className={`w-10 h-10 rounded-lg font-bold text-sm transition-all duration-300 ${selectedLetter === 'all' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-110' : isDark ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-black/60 hover:text-black'}`}>
                    All
                  </button>
                  {alphabet.map(letter => (
                    <button key={letter} onClick={() => setSelectedLetter(letter)} className={`w-10 h-10 rounded-lg font-bold text-sm transition-all duration-300 ${selectedLetter === letter ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-110' : isDark ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-black/60 hover:text-black'}`}>
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Grid/List */}
        {loading ? (
          <div className="text-center py-20">
            <div className={`text-xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'} animate-pulse`}>
              Loading library...
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20">
            <div className={`text-2xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              No results found
            </div>
            <p className={`text-lg ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6' : 'space-y-4'}>
              {filteredData.map(item => (
                viewMode === 'grid' ? <GridCard key={item.id} item={item} /> : <ListItem key={item.id} item={item} />
              ))}
            </div>

            {/* End Message */}
            <div className={`mt-16 p-8 sm:p-12 rounded-3xl text-center relative overflow-hidden ${
              isDark ? 'bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-cyan-900/20 border border-white/10' : 'bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-cyan-100/50 border border-black/10'
            } backdrop-blur-xl`}>
              {/* Decorative elements */}
              <div className={`absolute top-0 left-0 w-32 h-32 ${isDark ? 'bg-purple-500/20' : 'bg-purple-400/20'} rounded-full blur-3xl`}></div>
              <div className={`absolute bottom-0 right-0 w-32 h-32 ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-400/20'} rounded-full blur-3xl`}></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
                  <Heart size={32} className="text-white" />
                </div>
                
                <h3 className={`text-2xl sm:text-3xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                  Can't Find Your Favorite?
                </h3>
                
                <p className={`text-base sm:text-lg mb-8 max-w-2xl mx-auto ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                  Missing an anime, manga, manhwa, manhua, donghua, or web novel? Help us grow the library!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="group px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                    <MessageCircle size={20} />
                    Let Us Know
                  </button>
                  
                  <button className={`px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 ${
                    isDark ? 'bg-white/10 hover:bg-white/20 text-white border-2 border-white/20' : 'bg-black/10 hover:bg-black/20 text-black border-2 border-black/20'
                  } backdrop-blur-xl`}>
                    <Plus size={20} />
                    Contribute
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <style jsx>{`
        @keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}
      `}</style>
    </div>
  );
}