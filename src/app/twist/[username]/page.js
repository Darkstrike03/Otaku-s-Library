'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Star, Clock, BookOpen, Tv, ChevronLeft, ChevronRight, Heart, Github, ArrowLeft, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '@/supabaseClient';
import UserProfile from '@/components/UserProfile';

export default function UserTwistPage() {
  const params = useParams();
  const username = params.username;
  const { isDark } = useTheme();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, [username]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/JSON/TWIST/${username}.json`);
      if (response.ok) {
        const data = await response.json();
        
        // Fetch user data from Supabase
        const { data: supabaseUserData, error } = await supabase
          .from('user_data')
          .select('user_id, username, displayname, profile_pic, bio')
          .eq('username', data.username)
          .single();
        
        setUserData({
          username: data.username,
          displayName: supabaseUserData?.displayname || data.displayName || data.username,
          avatar: supabaseUserData?.profile_pic || data.avatar || `https://i.pravatar.cc/150?u=${data.username}`,
          bio: supabaseUserData?.bio || data.bio || 'No bio available',
          user_id: supabaseUserData?.user_id || null,
          favorites: data.favorites
        });
      } else {
        // User not found
        setUserData(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserData(null);
    }
    setLoading(false);
  };

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

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} transition-colors duration-500 py-8`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center py-20">
            <div className={`text-xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'} animate-pulse`}>
              Loading...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} transition-colors duration-500 py-8`}>
        <div className="container mx-auto px-4 sm:px-6">
          <Link href="/twist" className={`inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-xl ${
            isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'
          } transition-all duration-300`}>
            <ArrowLeft size={20} />
            Back to TWIST
          </Link>
          
          <div className="text-center py-20">
            <div className={`text-2xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              User not found
            </div>
            <p className={`text-lg ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              This user hasn't shared their favorites yet
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} transition-colors duration-500 py-8`}>
      <div className="container mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <Link href="/twist" className={`inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-xl ${
          isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'
        } transition-all duration-300`}>
          <ArrowLeft size={20} />
          Back to TWIST
        </Link>

        {/* User Profile Header */}
        <div className={`p-8 rounded-2xl mb-8 ${
          isDark ? 'bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-cyan-900/20 border border-white/10' : 'bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-cyan-100/50 border border-black/10'
        } backdrop-blur-xl`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src={userData.avatar}
              alt={userData.displayName}
              onClick={() => {
                if (userData.user_id) {
                  setSelectedUserId(userData.user_id);
                  setShowUserProfile(true);
                }
              }}
              className="w-24 h-24 rounded-full object-cover border-4 border-white/20 cursor-pointer hover:ring-4 hover:ring-purple-500/50 transition-all"
            />
            <div className="flex-1 text-center sm:text-left">
              <h1 className={`text-3xl sm:text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                {userData.displayName}
              </h1>
              <p className={`text-lg mb-4 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                @{userData.username}
              </p>
              <p className={`text-base ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                {userData.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-8">
          {Object.entries(userData.favorites).map(([category, items]) => {
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
      </div>

      {/* User Profile Modal */}
      {showUserProfile && selectedUserId && (
        <UserProfile 
          userId={selectedUserId}
          onClose={() => {
            setShowUserProfile(false);
            setSelectedUserId(null);
          }}
          isDark={isDark}
        />
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
