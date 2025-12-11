'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Star, Clock, BookOpen, Tv, ChevronLeft, ChevronRight, Heart, Github, Upload, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '../app/contexts/ThemeContext';

export default function Twist() {
  const { isDark } = useTheme();
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLists, setUserLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load all user lists from TWIST folder
  useEffect(() => {
    loadUserLists();
  }, []);

  const loadUserLists = async () => {
    setLoading(true);
    try {
      // Get list of JSON files from TWIST folder
      // For now, we'll define available users manually
      // In production, you'd dynamically fetch this list
      const usernames = ['alice', 'bob', 'charlie']; // Add more usernames as files are added
      
      const lists = [];
      for (const username of usernames) {
        try {
          const response = await fetch(`/JSON/TWIST/${username}.json`);
          if (response.ok) {
            const data = await response.json();
            lists.push({
              username,
              ...data
            });
          }
        } catch (error) {
          console.log(`Could not load list for ${username}`);
        }
      }

      if (lists.length === 0) {
        // Use demo data if no lists found
        setUserLists(getDemoData());
      } else {
        setUserLists(lists);
      }
      
      // Select first user by default
      if (lists.length > 0 || getDemoData().length > 0) {
        setSelectedUser(lists.length > 0 ? lists[0].username : getDemoData()[0].username);
      }
    } catch (error) {
      console.error('Error loading user lists:', error);
      setUserLists(getDemoData());
      setSelectedUser(getDemoData()[0]?.username);
    }
    setLoading(false);
  };

  const getDemoData = () => [
    {
      username: 'alice',
      displayName: 'Alice Cooper',
      avatar: 'https://i.pravatar.cc/150?img=1',
      bio: 'Anime enthusiast & manga collector 📚',
      favorites: {
        anime: [
          { id: 1, uid: '1A', title: 'Steins;Gate', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400', rating: 9.1, status: 'Completed', episodes: 24 },
          { id: 2, uid: '2A', title: 'Monster', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400', rating: 8.9, status: 'Completed', episodes: 74 },
          { id: 3, uid: '3A', title: 'Cowboy Bebop', image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400', rating: 8.8, status: 'Completed', episodes: 26 },
        ],
        manga: [
          { id: 1, uid: '1M', title: '20th Century Boys', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', rating: 9.0, status: 'Completed', chapters: 249 },
          { id: 2, uid: '2M', title: 'Pluto', image: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400', rating: 8.9, status: 'Completed', chapters: 65 },
        ],
        manhwa: [
          { id: 1, uid: '1H', title: 'The Breaker', image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400', rating: 8.7, status: 'Completed', chapters: 72 },
        ]
      }
    },
    {
      username: 'bob',
      displayName: 'Bob Ross',
      avatar: 'https://i.pravatar.cc/150?img=12',
      bio: 'Donghua & Manhua lover 🎨',
      favorites: {
        donghua: [
          { id: 1, uid: '1D', title: 'Link Click', image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400', rating: 8.9, status: 'Ongoing', episodes: 22 },
          { id: 2, uid: '2D', title: 'Fog Hill of Five Elements', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400', rating: 8.7, status: 'Ongoing', episodes: 6 },
        ],
        manhua: [
          { id: 1, uid: '1U', title: 'Tales of Demons and Gods', image: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400', rating: 8.5, status: 'Ongoing', chapters: 450 },
          { id: 2, uid: '2U', title: 'Soul Land', image: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=400', rating: 8.6, status: 'Completed', chapters: 330 },
        ],
        webnovels: [
          { id: 1, uid: '1W', title: 'Lord of the Mysteries', image: 'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=400', rating: 9.3, status: 'Completed', chapters: 1394 },
        ]
      }
    },
    {
      username: 'charlie',
      displayName: 'Charlie Chen',
      avatar: 'https://i.pravatar.cc/150?img=33',
      bio: 'Reading everything I can find! 📖',
      favorites: {
        anime: [
          { id: 1, uid: '4A', title: 'Made in Abyss', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400', rating: 8.8, status: 'Ongoing', episodes: 25 },
        ],
        manga: [
          { id: 1, uid: '3M', title: 'Goodnight Punpun', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', rating: 8.9, status: 'Completed', chapters: 147 },
          { id: 2, uid: '4M', title: 'Monster', image: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400', rating: 9.1, status: 'Completed', chapters: 162 },
        ],
        manhwa: [
          { id: 1, uid: '2H', title: 'Solo Leveling', image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400', rating: 9.1, status: 'Completed', chapters: 179 },
          { id: 2, uid: '3H', title: 'Omniscient Reader', image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400', rating: 9.0, status: 'Ongoing', chapters: 160 },
        ],
        webnovels: [
          { id: 1, uid: '2W', title: 'Omniscient Reader\'s Viewpoint', image: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400', rating: 9.2, status: 'Completed', chapters: 551 },
        ]
      }
    }
  ];

  const currentUserData = userLists.find(u => u.username === selectedUser);

  const scroll = (categoryId, direction) => {
    const container = document.getElementById(`twist-scroll-${categoryId}`);
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      anime: Tv,
      manga: BookOpen,
      manhwa: BookOpen,
      manhua: Sparkles,
      donghua: TrendingUp,
      webnovels: BookOpen
    };
    return icons[category] || BookOpen;
  };

  const getCategoryColor = (category) => {
    const colors = {
      anime: 'from-purple-500 to-pink-500',
      manga: 'from-cyan-500 to-blue-500',
      manhwa: 'from-pink-500 to-rose-500',
      manhua: 'from-yellow-500 to-orange-500',
      donghua: 'from-green-500 to-emerald-500',
      webnovels: 'from-indigo-500 to-violet-500'
    };
    return colors[category] || 'from-purple-500 to-pink-500';
  };

  const ContentCard = ({ item, category }) => (
    <div
      onClick={() => router.push(`/details/${item.uid}`)}
      className={`group relative flex-shrink-0 w-48 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:z-10 ${
        isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
      } backdrop-blur-xl`}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${
          isDark ? 'from-black via-black/60 to-transparent' : 'from-white via-white/60 to-transparent'
        }`}></div>

        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full flex items-center gap-1 ${
          isDark ? 'bg-black/80' : 'bg-white/80'
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

      <div className="p-3">
        <h3 className={`font-bold text-sm line-clamp-2 mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
          {item.title}
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <Clock size={12} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
          <span className={isDark ? 'text-white/60' : 'text-black/60'}>
            {item.episodes ? `${item.episodes} eps` : `${item.chapters} ch`}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} transition-colors duration-500 py-8`}>
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-4 rounded-2xl ${
              isDark ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30' : 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20'
            }`}>
              <Users size={32} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
            </div>
            <div>
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black ${isDark ? 'text-white' : 'text-black'}`}>
                TWIST
                <span className={`block sm:inline sm:ml-4 mt-2 sm:mt-0 text-transparent bg-clip-text bg-gradient-to-r ${
                  isDark ? 'from-purple-400 via-pink-400 to-cyan-400' : 'from-purple-600 via-pink-600 to-cyan-600'
                }`}>
                  Community Lists
                </span>
              </h1>
              <p className={`text-lg mt-2 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                Discover curated favorites from our community members
              </p>
            </div>
          </div>

          {/* How to Contribute Banner */}
          <div className={`mt-6 p-6 rounded-2xl ${
            isDark ? 'bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-cyan-900/20 border border-white/10' : 'bg-gradient-to-r from-purple-100/50 via-pink-100/50 to-cyan-100/50 border border-black/10'
          } backdrop-blur-xl`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Github size={24} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                    Share Your Favorites!
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                    Create your own list and submit it via GitHub PR to appear here
                  </p>
                </div>
              </div>
              <a
                href="https://github.com/Darkstrike03/Otaku-s-Library"
                target="_blank"
                rel="noopener noreferrer"
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                  isDark ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                } hover:scale-105 shadow-lg`}
              >
                <Upload size={16} />
                Submit Your List
              </a>
            </div>
          </div>
        </div>

        {/* User Selection */}
        {!loading && userLists.length > 0 && (
          <div className="mb-8">
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              Community Members
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {userLists.map((user) => (
                <Link
                  key={user.username}
                  href={`/twist/${user.username}`}
                  className={`flex-shrink-0 p-4 rounded-2xl transition-all duration-300 ${
                    selectedUser === user.username
                      ? `bg-gradient-to-r ${getCategoryColor('anime')} text-white scale-105 shadow-lg`
                      : isDark
                      ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                      : 'bg-black/5 hover:bg-black/10 border border-black/10 text-black'
                  } backdrop-blur-xl`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                    />
                    <div className="text-left">
                      <h3 className="font-bold text-sm">{user.displayName}</h3>
                      <p className={`text-xs ${selectedUser === user.username ? 'text-white/80' : isDark ? 'text-white/60' : 'text-black/60'}`}>
                        @{user.username}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* User's Favorites */}
        {loading ? (
          <div className="text-center py-20">
            <div className={`text-xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'} animate-pulse`}>
              Loading community lists...
            </div>
          </div>
        ) : !currentUserData ? (
          <div className="text-center py-20">
            <div className={`text-2xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              No lists available yet
            </div>
            <p className={`text-lg ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Be the first to share your favorites!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* User Bio */}
            <div className={`p-6 rounded-2xl ${
              isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
            } backdrop-blur-xl`}>
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={currentUserData.avatar}
                  alt={currentUserData.displayName}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-black'}`}>
                    {currentUserData.displayName}'s Favorites
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                    {currentUserData.bio}
                  </p>
                </div>
              </div>
            </div>

            {/* Categories */}
            {Object.entries(currentUserData.favorites).map(([category, items]) => {
              if (!items || items.length === 0) return null;
              
              const Icon = getCategoryIcon(category);
              const colorClass = getCategoryColor(category);

              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClass}`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className={`text-2xl font-black capitalize ${isDark ? 'text-white' : 'text-black'}`}>
                      {category}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      isDark ? 'bg-white/10 text-white/60' : 'bg-black/10 text-black/60'
                    }`}>
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <div className="relative group/section">
                    {/* Scroll Buttons */}
                    <button
                      onClick={() => scroll(category, 'left')}
                      className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all duration-300 opacity-0 group-hover/section:opacity-100 ${
                        isDark ? 'bg-black/80 hover:bg-black text-white' : 'bg-white/80 hover:bg-white text-black'
                      } backdrop-blur-xl shadow-lg hover:scale-110`}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() => scroll(category, 'right')}
                      className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all duration-300 opacity-0 group-hover/section:opacity-100 ${
                        isDark ? 'bg-black/80 hover:bg-black text-white' : 'bg-white/80 hover:bg-white text-black'
                      } backdrop-blur-xl shadow-lg hover:scale-110`}
                    >
                      <ChevronRight size={24} />
                    </button>

                    {/* Scrollable Container */}
                    <div
                      id={`twist-scroll-${category}`}
                      className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {items.map((item) => (
                        <ContentCard key={item.id} item={item} category={category} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
