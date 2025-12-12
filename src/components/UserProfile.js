'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Mail, MapPin, Link as LinkIcon, Crown, Award, Sparkles, Star, Zap } from 'lucide-react';

export default function UserProfile({ isDark, userId, onClose }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      
      // Parse badges if it's a string
      if (data && data.badges) {
        try {
          if (typeof data.badges === 'string') {
            data.badges = JSON.parse(data.badges);
          }
        } catch (e) {
          console.error('Error parsing badges:', e);
          data.badges = [];
        }
      } else {
        data.badges = [];
      }
      
      setUserData(data);
    } catch (err) {
      console.error('Error loading user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get halo based on level
  const getHalo = (level) => {
    if (!level) return null;
    
    if (level >= 50) {
      return {
        color: 'from-purple-500 via-pink-500 to-cyan-500',
        glow: 'shadow-[0_0_30px_rgba(168,85,247,0.8)]',
        name: 'Legendary'
      };
    } else if (level >= 40) {
      return {
        color: 'from-orange-500 via-red-500 to-pink-500',
        glow: 'shadow-[0_0_25px_rgba(249,115,22,0.7)]',
        name: 'Epic'
      };
    } else if (level >= 30) {
      return {
        color: 'from-emerald-500 via-teal-500 to-cyan-500',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.6)]',
        name: 'Diamond'
      };
    } else if (level >= 20) {
      return {
        color: 'from-yellow-400 to-yellow-600',
        glow: 'shadow-[0_0_20px_rgba(250,204,21,0.6)]',
        name: 'Golden'
      };
    } else if (level >= 10) {
      return {
        color: 'from-gray-300 to-gray-500',
        glow: 'shadow-[0_0_15px_rgba(156,163,175,0.5)]',
        name: 'Silver'
      };
    }
    return null;
  };

  const halo = userData?.level ? getHalo(userData.level) : null;
  const isCreator = userData?.username === 'Otaku-s-librarian';

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <div className="text-white">User not found</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
      <div className={`relative w-full max-w-2xl rounded-3xl overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl my-8 ${
        isCreator ? 'ring-4 ring-purple-500 ring-offset-4 ring-offset-black' : ''
      }`}>
        
        {/* Creator Special Effects */}
        {isCreator && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 animate-pulse pointer-events-none"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-500"></div>
          </>
        )}
        
        {/* Banner */}
        {userData.banner && (
          <div className="relative">
            <img
              src={userData.banner}
              alt="Banner"
              className="w-full h-40 md:h-48 object-cover"
            />
            {isCreator && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-cyan-500/30 animate-pulse"></div>
            )}
          </div>
        )}

        {/* Profile Info */}
        <div className="relative px-4 md:px-8 pb-6">
          {/* Profile Picture with Halo */}
          {userData.profile_pic && (
            <div className="-mt-12 md:-mt-16 mb-4 relative">
              {/* Halo Effect */}
              {halo && (
                <div className={`absolute inset-0 -z-10`}>
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br ${halo.color} opacity-50 blur-2xl ${halo.glow} animate-pulse`}></div>
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-gradient-to-br ${halo.color} animate-spin-slow`} style={{ animation: 'spin 8s linear infinite' }}></div>
                </div>
              )}
              
              <img
                src={userData.profile_pic}
                alt={userData.displayname}
                className={`relative w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 object-cover ${
                  isCreator 
                    ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.8)]' 
                    : halo
                      ? `border-transparent bg-gradient-to-br ${halo.color}`
                      : 'border-gray-900'
                }`}
              />
              
              {/* Level Badge */}
              {userData.level && (
                <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full font-black text-sm flex items-center gap-1 ${
                  isCreator
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white shadow-lg'
                    : halo
                      ? `bg-gradient-to-r ${halo.color} text-white shadow-lg`
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                }`}>
                  <Star size={14} className={isCreator ? 'animate-spin' : ''} />
                  <span>Lv {userData.level}</span>
                </div>
              )}
            </div>
          )}

          {/* User Details */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className={`text-2xl md:text-3xl font-black ${
                isCreator 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400'
                  : isDark ? 'text-white' : 'text-black'
              }`}>
                {userData.displayname}
              </h2>
              
              {/* Special Creator Badge */}
              {isCreator && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white text-xs font-bold animate-pulse">
                  <Sparkles size={14} />
                  <span>Creator</span>
                </div>
              )}
              
              {userData.age === 'adult' && (
                <Crown size={24} className="text-orange-500" title="Age Verified (18+)" />
              )}
              
              {/* Halo Rank Badge */}
              {halo && !isCreator && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${halo.color} text-white text-xs font-bold`}>
                  <Award size={14} />
                  <span>{halo.name}</span>
                </div>
              )}
            </div>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              @{userData.username}
            </p>
          </div>

          {/* Badges Section */}
          {userData.badges && userData.badges.length > 0 && (
            <div className="mb-6">
              <h3 className={`text-sm font-bold mb-2 ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                {userData.badges.map((badge, index) => (
                  <div
                    key={index}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                      isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
                    }`}
                    title={badge.description}
                  >
                    {badge.icon && <span>{badge.icon}</span>}
                    <span>{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {userData.bio && (
            <p className={`mb-6 text-sm md:text-base ${isDark ? 'text-white/80' : 'text-black/80'}`}>
              {userData.bio}
            </p>
          )}

          {/* Contact Info */}
          <div className="space-y-2 mb-6">
            {userData.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-purple-400" />
                <span className={isDark ? 'text-white/70' : 'text-black/70'}>
                  {userData.location}
                </span>
              </div>
            )}
            {userData.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail size={16} className="text-purple-400" />
                <a
                  href={`mailto:${userData.email}`}
                  className={`${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
                >
                  {userData.email}
                </a>
              </div>
            )}
            {userData.website && (
              <div className="flex items-center gap-2 text-sm">
                <LinkIcon size={16} className="text-purple-400" />
                <a
                  href={userData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
                >
                  {userData.website}
                </a>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-lg font-bold transition-all ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-black/10 hover:bg-black/20 text-black'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}