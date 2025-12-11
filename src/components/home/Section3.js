'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../app/contexts/ThemeContext';
import { Crown, Sparkles, Star, TrendingUp, Heart, Eye, BookmarkPlus, Play, ChevronRight } from 'lucide-react';

export default function LibrarianPicks() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [picksData, setPicksData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState('all');

  // Load librarian_picks.json from /JSON folder
  useEffect(() => {
    const loadPicksData = async () => {
      try {
        const response = await fetch('/JSON/librarian_picks.json');
        if (response.ok) {
          const data = await response.json();
          setPicksData(data);
        } else {
          setPicksData(getDemoData());
        }
      } catch (error) {
        console.log('Using demo data:', error);
        setPicksData(getDemoData());
      }
    };

    loadPicksData();
  }, []);

  // Demo data structure
  const getDemoData = () => ({
    picks: [
      { id: 1, uid: '6A', title: 'Frieren: Beyond Journey\'s End', type: 'anime', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400', rating: 9.2, reason: 'Beautiful storytelling and character development', tags: ['Fantasy', 'Adventure', 'Drama'] },
      { id: 2, uid: '2H', title: 'Solo Leveling', type: 'manhwa', image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400', rating: 9.1, reason: 'Epic power progression and stunning art', tags: ['Action', 'Fantasy', 'Overpowered'] },
      { id: 3, uid: '2W', title: 'Omniscient Reader\'s Viewpoint', type: 'webnovel', image: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400', rating: 9.3, reason: 'Mind-blowing plot twists and world-building', tags: ['Fantasy', 'System', 'Mystery'] },
      { id: 4, uid: '6M', title: 'Berserk', type: 'manga', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', rating: 9.5, reason: 'Masterpiece of dark fantasy and art', tags: ['Dark Fantasy', 'Seinen', 'Action'] },
      { id: 5, uid: '1D', title: 'Link Click', type: 'donghua', image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400', rating: 8.9, reason: 'Unique time travel concept with emotional depth', tags: ['Thriller', 'Mystery', 'Time Travel'] },
      { id: 6, uid: '1U', title: 'Tales of Demons and Gods', type: 'manhua', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400', rating: 8.6, reason: 'Satisfying revenge story with cultivation', tags: ['Cultivation', 'Reincarnation', 'Action'] },
      { id: 7, uid: '9A', title: 'Chainsaw Man', type: 'manga', image: 'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=400', rating: 8.9, reason: 'Bold and unconventional storytelling', tags: ['Action', 'Horror', 'Comedy'] },
      { id: 8, uid: '4H', title: 'The Beginning After The End', type: 'manhwa', image: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=400', rating: 8.9, reason: 'Perfect blend of magic and martial arts', tags: ['Fantasy', 'Reincarnation', 'Magic'] },
      { id: 9, uid: '1W', title: 'Lord of the Mysteries', type: 'webnovel', image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400', rating: 9.4, reason: 'Incredibly intricate world and mystery elements', tags: ['Mystery', 'Steampunk', 'Fantasy'] },
      { id: 10, uid: '1A', title: 'Attack on Titan', type: 'anime', image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400', rating: 9.0, reason: 'Revolutionary storytelling and plot twists', tags: ['Action', 'Mystery', 'Dark'] },
      { id: 11, uid: '5H', title: 'Tower of God', type: 'manhwa', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', rating: 8.7, reason: 'Expansive world with complex power system', tags: ['Fantasy', 'Adventure', 'Mystery'] },
      { id: 12, uid: '4A', title: 'Jujutsu Kaisen', type: 'anime', image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400', rating: 8.9, reason: 'Modern classic with amazing fight choreography', tags: ['Action', 'Supernatural', 'Shounen'] },
    ]
  });

  const filters = [
    { id: 'all', label: 'Featured', icon: Crown },
    { id: 'anime', label: 'Anime', icon: Play },
    { id: 'manga', label: 'Manga', icon: BookmarkPlus },
    { id: 'manhwa', label: 'Manhwa', icon: Star },
    { id: 'manhua', label: 'Manhua', icon: Sparkles },
    { id: 'donghua', label: 'Donghua', icon: TrendingUp },
    { id: 'webnovel', label: 'Novel', icon: Heart },
  ];

  const filteredPicks = picksData?.picks?.filter(pick => 
    filter === 'all' || pick.type === filter
  ) || [];

  const getTypeColor = (type) => {
    switch(type) {
      case 'anime': return 'from-purple-500 to-pink-500';
      case 'manga': return 'from-cyan-500 to-blue-500';
      case 'manhwa': return 'from-pink-500 to-rose-500';
      case 'manhua': return 'from-yellow-500 to-orange-500';
      case 'donghua': return 'from-green-500 to-emerald-500';
      case 'webnovel': return 'from-indigo-500 to-violet-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch(type) {
      case 'anime': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'manga': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'manhwa': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'manhua': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'donghua': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'webnovel': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className={`${isDark ? 'bg-black' : 'bg-white'} transition-colors duration-500 py-16 sm:py-24 relative overflow-hidden`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 right-0 w-96 h-96 ${
          isDark ? 'bg-purple-600/10' : 'bg-purple-400/10'
        } rounded-full blur-3xl`}></div>
        <div className={`absolute bottom-0 left-0 w-96 h-96 ${
          isDark ? 'bg-cyan-600/10' : 'bg-cyan-400/10'
        } rounded-full blur-3xl`}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
          } backdrop-blur-xl relative`}>
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 opacity-30 blur-lg animate-pulse`}></div>
            <Crown size={20} className={`${isDark ? 'text-yellow-400' : 'text-yellow-600'} relative z-10`} />
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'} relative z-10`}>
              Curated by The Librarian
            </span>
          </div>

          <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-4 ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            The Librarian
            <span className={`block sm:inline sm:ml-4 mt-2 sm:mt-0 text-transparent bg-clip-text bg-gradient-to-r ${
              isDark 
                ? 'from-yellow-400 via-orange-400 to-pink-400' 
                : 'from-yellow-600 via-orange-600 to-pink-600'
            }`}>
              Picks
            </span>
          </h2>

          <p className={`text-lg ${isDark ? 'text-white/60' : 'text-black/60'} max-w-2xl mx-auto mb-2`}>
            Personally handpicked gems that deserve your attention
          </p>
          <p className={`text-sm ${isDark ? 'text-yellow-400/80' : 'text-yellow-600/80'} font-medium`}>
            Updated weekly with fresh recommendations
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-3 pt-7 justify-normal lg:justify-center ps-10 overflow-x-auto scrollbar-hide pb-5 mb-13">
          {filters.map((filterOption) => {
            const Icon = filterOption.icon;
            const isActive = filter === filterOption.id;
            return (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id)}
                className={`relative px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                  isActive 
                    ? 'scale-105' 
                    : 'hover:scale-105'
                }`}
              >
                {isActive && (
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 opacity-50 blur-lg animate-pulse`}></div>
                )}
                
                <div className={`relative flex items-center gap-2 ${
                  isActive 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                    : isDark 
                      ? 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white' 
                      : 'bg-black/5 text-black/60 hover:bg-black/10 hover:text-black'
                } px-5 py-2.5 rounded-full backdrop-blur-xl border ${
                  isActive 
                    ? 'border-transparent' 
                    : isDark ? 'border-white/10' : 'border-black/10'
                }`}>
                  <Icon size={16} />
                  <span>{filterOption.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Masonry Grid Layout */}
        <div className="columns-2 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filteredPicks.map((pick, index) => (
            <div
              key={pick.id}
              className="break-inside-avoid"
              style={{ 
                animationDelay: `${index * 50}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards',
                opacity: 0
              }}
            >
              <div
                onClick={() => setSelectedItem(pick)}
                className={`relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 cursor-pointer group ${
                  isDark ? 'bg-white/5' : 'bg-black/5'
                } backdrop-blur-xl border ${
                  isDark ? 'border-white/10 hover:border-white/20' : 'border-black/10 hover:border-black/20'
                }`}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3.5] sm:aspect-[3.5/4] overflow-hidden">
                  <img
                    src={pick.image}
                    alt={pick.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${
                    isDark 
                      ? 'from-black via-black/60 to-transparent' 
                      : 'from-white via-white/60 to-transparent'
                  } opacity-90`}></div>

                  {/* Type Badge */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-xl border ${
                    isDark ? getTypeBadgeColor(pick.type) : getTypeBadgeColor(pick.type)
                  }`}>
                    {pick.type}
                  </div>

                  {/* Rating */}
                  <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    isDark ? 'bg-black/60' : 'bg-white/60'
                  } backdrop-blur-xl`}>
                    <Star size={12} className="text-yellow-400" fill="currentColor" />
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                      {pick.rating}
                    </span>
                  </div>

                  {/* Librarian Crown - appears on hover */}
                  <div className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg scale-90 group-hover:scale-100`}>
                    <Crown size={18} className="text-white" fill="currentColor" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className={`font-black text-base mb-2 line-clamp-2 ${
                    isDark ? 'text-white' : 'text-black'
                  }`}
                  style={{
                        maxHeight: '1.5rem', // Limit the height of the title container
                        overflowY: 'auto', // Enable vertical scrolling for overflow text
                        scrollbarWidth: 'none' // Thin scrollbar for better aesthetics
                      }}>
                    {pick.title}
                  </div>

                  {/* Reason */}
                  <div className={`text-sm mb-3 line-clamp-2 italic ${
                    isDark ? 'text-yellow-400/80' : 'text-yellow-600/80'
                  }`}
                  style={{
                        maxHeight: '1.4rem', // Limit the height of the title container
                        overflowX: 'auto', // Enable vertical scrolling for overflow text
                        scrollbarWidth: 'none' // Thin scrollbar for better aesthetics
                      }}>
                    "{pick.reason}"
                  </div>

                  {/* Tags */}
                  <div className="hidden sm:flex flex-wrap gap-2">
                    {pick.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          isDark 
                            ? 'bg-white/10 text-white/70' 
                            : 'bg-black/10 text-black/70'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hover Border Glow */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${getTypeColor(pick.type)} blur-xl -z-10`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Link href="/twist/alice">
            <button className={`group px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105 bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-2xl`}>
              <span className="flex items-center gap-2">
                <Crown size={20} />
                Discover More Picks
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button>
          </Link>
        </div>
      </div>

      {/* Modal for selected item */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className={`relative max-w-2xl w-full rounded-3xl overflow-hidden ${
              isDark ? 'bg-gray-900' : 'bg-white'
            } shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-96">
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${
                isDark 
                  ? 'from-gray-900 via-gray-900/60 to-transparent' 
                  : 'from-white via-white/60 to-transparent'
              }`}></div>
              
              <button
                onClick={() => setSelectedItem(null)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
                } backdrop-blur-xl transition-all duration-300`}
              >
                <span className={`text-xl ${isDark ? 'text-white' : 'text-black'}`}>×</span>
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 ${
                    isDark ? getTypeBadgeColor(selectedItem.type) : getTypeBadgeColor(selectedItem.type)
                  } border`}>
                    {selectedItem.type}
                  </div>
                  <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-black'}`}>
                    {selectedItem.title}
                  </h3>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
                  isDark ? 'bg-white/10' : 'bg-black/10'
                }`}>
                  <Star size={16} className="text-yellow-400" fill="currentColor" />
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    {selectedItem.rating}
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-xl mb-4 ${
                isDark ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'
              }`}>
                <div className="flex items-start gap-2">
                  <Crown size={18} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className={`italic ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {selectedItem.reason}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedItem.tags.map((tag, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      isDark 
                        ? 'bg-white/10 text-white' 
                        : 'bg-black/10 text-black'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button 
                onClick={() => router.push(`/details/${selectedItem.uid}`)}
                className={`w-full py-3 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r ${getTypeColor(selectedItem.type)} text-white hover:scale-105`}
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
          @keyframes scrollText {
  0% { transform: translateX(100%); }
  10% { transform: translateX(0); }
  90% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}

      `}</style>
    </div>
  );
}