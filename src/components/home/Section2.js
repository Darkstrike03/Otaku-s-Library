import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, BookOpen, Book, Flame, TrendingUp, Star, Clock, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function PopularSection({ isDark }) {
  const [activeCategory, setActiveCategory] = useState('anime');
  const [popularData, setPopularData] = useState(null);
  const navigate = useNavigate();

  // Categories with icons and colors
  const categories = [
    { id: 'anime', name: 'Anime', icon: Tv, color: 'from-purple-500 to-pink-500', bgColor: 'purple' },
    { id: 'manga', name: 'Manga', icon: BookOpen, color: 'from-cyan-500 to-blue-500', bgColor: 'cyan' },
    { id: 'manhwa', name: 'Manhwa', icon: Book, color: 'from-pink-500 to-rose-500', bgColor: 'pink' },
    { id: 'manhua', name: 'Manhua', icon: Sparkles, color: 'from-yellow-500 to-orange-500', bgColor: 'yellow' },
    { id: 'donghua', name: 'Donghua', icon: TrendingUp, color: 'from-green-500 to-emerald-500', bgColor: 'green' },
    { id: 'webnovels', name: 'Novels', icon: Book, color: 'from-indigo-500 to-violet-500', bgColor: 'indigo' },
  ];

  // Load popular.json from /JSON folder
  useEffect(() => {
    const loadPopularData = async () => {
      try {
        // Try to read from the JSON folder
        const response = await fetch('/JSON/popular26.11.25.json');
        if (response.ok) {
          const data = await response.json();
          setPopularData(data);
        } else {
          // Fallback to demo data if file doesn't exist
          setPopularData(getDemoData());
        }
      } catch (error) {
        console.log('Using demo data:', error);
        setPopularData(getDemoData());
      }
    };

    loadPopularData();
  }, []);

  // Demo data structure (replace with actual data from popular.json)
  const getDemoData = () => ({
    anime: [
      { id: 1, title: 'Frieren: Beyond Journey\'s End', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400', rating: 9.2, status: 'Ongoing', episodes: 28 },
      { id: 2, title: 'Attack on Titan', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400', rating: 9.0, status: 'Completed', episodes: 87 },
      { id: 3, title: 'Demon Slayer', image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400', rating: 8.8, status: 'Ongoing', episodes: 55 },
      { id: 4, title: 'Jujutsu Kaisen', image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400', rating: 8.9, status: 'Ongoing', episodes: 47 },
      { id: 5, title: 'One Piece', image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400', rating: 8.7, status: 'Ongoing', episodes: 1100 },
    ],
    manga: [
      { id: 1, title: 'Berserk', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', rating: 9.5, status: 'Ongoing', chapters: 374 },
      { id: 2, title: 'One Punch Man', image: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400', rating: 8.8, status: 'Ongoing', chapters: 195 },
      { id: 3, title: 'Chainsaw Man', image: 'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=400', rating: 8.9, status: 'Completed', chapters: 97 },
      { id: 4, title: 'Tokyo Ghoul', image: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=400', rating: 8.6, status: 'Completed', chapters: 143 },
      { id: 5, title: 'Vagabond', image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400', rating: 9.3, status: 'Hiatus', chapters: 327 },
    ],
    manhwa: [
      { id: 1, title: 'Solo Leveling', image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400', rating: 9.1, status: 'Completed', chapters: 179 },
      { id: 2, title: 'Tower of God', image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400', rating: 8.7, status: 'Ongoing', chapters: 590 },
      { id: 3, title: 'The Beginning After The End', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400', rating: 8.9, status: 'Ongoing', chapters: 180 },
      { id: 4, title: 'Omniscient Reader', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400', rating: 9.0, status: 'Ongoing', chapters: 160 },
      { id: 5, title: 'Eleceed', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', rating: 8.8, status: 'Ongoing', chapters: 280 },
    ],
    manhua: [
      { id: 1, title: 'Tales of Demons and Gods', image: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400', rating: 8.5, status: 'Ongoing', chapters: 450 },
      { id: 2, title: 'Martial Peak', image: 'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=400', rating: 8.3, status: 'Ongoing', chapters: 3800 },
      { id: 3, title: 'Soul Land', image: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=400', rating: 8.6, status: 'Completed', chapters: 330 },
      { id: 4, title: 'Apotheosis', image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400', rating: 8.4, status: 'Ongoing', chapters: 900 },
      { id: 5, title: 'Battle Through the Heavens', image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400', rating: 8.7, status: 'Completed', chapters: 1650 },
    ],
    donghua: [
      { id: 1, title: 'Link Click', image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400', rating: 8.9, status: 'Ongoing', episodes: 22 },
      { id: 2, title: 'The Daily Life of the Immortal King', image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400', rating: 8.5, status: 'Ongoing', episodes: 30 },
      { id: 3, title: 'Fog Hill of Five Elements', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400', rating: 8.7, status: 'Ongoing', episodes: 6 },
      { id: 4, title: 'Swallowed Star', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400', rating: 8.4, status: 'Ongoing', episodes: 90 },
      { id: 5, title: 'Soul Land', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', rating: 8.6, status: 'Ongoing', episodes: 265 },
    ],
    webnovels: [
      { id: 1, title: 'Omniscient Reader\'s Viewpoint', image: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400', rating: 9.2, status: 'Completed', chapters: 551 },
      { id: 2, title: 'The Lord of the Mysteries', image: 'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=400', rating: 9.3, status: 'Completed', chapters: 1394 },
      { id: 3, title: 'Reverend Insanity', image: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=400', rating: 9.1, status: 'Hiatus', chapters: 2334 },
      { id: 4, title: 'Shadow Slave', image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400', rating: 8.9, status: 'Ongoing', chapters: 1800 },
      { id: 5, title: 'My House of Horrors', image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400', rating: 8.8, status: 'Completed', chapters: 1378 },
    ],
  });

  const scroll = (direction) => {
    const container = document.getElementById(`scroll-${activeCategory}`);
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

    // Handle card click
  const handleCardClick = (uid) => {
    navigate(`/details/${uid}`); // Navigate to details page with uid
  };
  const currentData = popularData?.[activeCategory] || [];
  const activeTab = categories.find(cat => cat.id === activeCategory);

  return (
    <div className={`${isDark ? 'bg-black' : 'bg-white'} transition-colors duration-500 py-16 sm:py-24`}>
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
          } backdrop-blur-xl`}>
            <Flame size={20} className={`${isDark ? 'text-orange-400' : 'text-orange-600'} animate-pulse`} />
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              Trending Now
            </span>
          </div>

          <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-4 ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            Popular
            <span className={`block sm:inline sm:ml-4 mt-2 sm:mt-0 text-transparent bg-clip-text bg-gradient-to-r ${
              isDark 
                ? 'from-purple-400 via-pink-400 to-cyan-400' 
                : 'from-purple-600 via-pink-600 to-cyan-600'
            }`}>
              This Week
            </span>
          </h2>

          <p className={`text-lg ${isDark ? 'text-white/60' : 'text-black/60'} max-w-2xl mx-auto`}>
            Discover what's hot in the otaku community right now
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-3 pt-9 lg:justify-center justify-normal ps-20 overflow-x-auto scrollbar-hide pb-9 mb-5">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`relative px-6 py-3 rounded-full font-bold transition-all duration-300 group ${
                  isActive 
                    ? 'scale-105' 
                    : 'hover:scale-105'
                }`}
              >
                {/* Glow effect */}
                {isActive && (
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${category.color} opacity-50 blur-xl animate-pulse`}></div>
                )}
                
                {/* Button content */}
                <div className={`relative flex items-center gap-2 ${
                  isActive 
                    ? `bg-gradient-to-r ${category.color} text-white` 
                    : isDark 
                      ? 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white' 
                      : 'bg-black/5 text-black/60 hover:bg-black/10 hover:text-black'
                } px-6 py-3 rounded-full backdrop-blur-xl border ${
                  isActive 
                    ? 'border-transparent' 
                    : isDark ? 'border-white/10' : 'border-black/10'
                }`}>
                  <Icon size={18} />
                  <span>{category.name}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Cards Container */}
        <div className="relative group/container">
          {/* Scroll Buttons */}
          <button
            onClick={() => scroll('left')}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all duration-300 ${
              isDark 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-black/10 hover:bg-black/20 text-black'
            } backdrop-blur-xl opacity-0 group-hover/container:opacity-100 -translate-x-4 group-hover/container:translate-x-0 hidden lg:block`}
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={() => scroll('right')}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all duration-300 ${
              isDark 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-black/10 hover:bg-black/20 text-black'
            } backdrop-blur-xl opacity-0 group-hover/container:opacity-100 translate-x-4 group-hover/container:translate-x-0 hidden lg:block`}
          >
            <ChevronRight size={24} />
          </button>

          {/* Scrollable Cards */}
          <div
            id={`scroll-${activeCategory}`}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {currentData.map((item, index) => (
              <div
                key={item.id}
                onClick={() => handleCardClick(item.uid)} // Pass the uid to the details page
                className="flex-shrink-0 w-64 group/card snap-start"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 cursor-pointer ${
                  isDark ? 'bg-white/5' : 'bg-black/5'
                } backdrop-blur-xl border ${
                  isDark ? 'border-white/10' : 'border-black/10'
                }`}>
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
                    <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl text-white bg-gradient-to-br ${activeTab.color} shadow-lg`}>
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
                    <div className={`absolute bottom-11 left-4 px-3 py-1 rounded-full text-xs font-bold ${
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
                      className={`font-black text-lg mb-2 overflow-hidden ${
                        isDark ? 'text-white' : 'text-black'
                      }`}
                      style={{
                        maxHeight: '1.5rem', // Limit the height of the title container
                        overflowY: 'auto', // Enable vertical scrolling for overflow text
                        scrollbarWidth: 'none' // Thin scrollbar for better aesthetics
                      }}
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
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className={`group px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105 ${
            isDark 
              ? `bg-gradient-to-r ${activeTab.color} text-white hover:shadow-2xl` 
              : `bg-gradient-to-r ${activeTab.color} text-white hover:shadow-2xl`
          }`}>
            <span className="flex items-center gap-2">
              View All {activeTab.name}
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}