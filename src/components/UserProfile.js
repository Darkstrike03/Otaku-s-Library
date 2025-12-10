'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Mail, MapPin, Link as LinkIcon, Crown } from 'lucide-react';

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
      setUserData(data);
    } catch (err) {
      console.error('Error loading user profile:', err);
    } finally {
      setLoading(false);
    }
  };

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
      <div className={`relative w-full max-w-2xl rounded-3xl overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl my-8`}>
        
        {/* Banner */}
        {userData.banner && (
          <img
            src={userData.banner}
            alt="Banner"
            className="w-full h-40 md:h-48 object-cover"
          />
        )}

        {/* Profile Info */}
        <div className="relative px-4 md:px-8 pb-6">
          {/* Profile Picture */}
          {userData.profile_pic && (
            <div className="-mt-12 md:-mt-16 mb-4">
              <img
                src={userData.profile_pic}
                alt={userData.displayname}
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-gray-900 object-cover"
              />
            </div>
          )}

          {/* User Details */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`text-2xl md:text-3xl font-black ${isDark ? 'text-white' : 'text-black'}`}>
                {userData.displayname}
              </h2>
              {userData.age === 'adult' && (
                <Crown size={24} className="text-orange-500" title="Age Verified (18+)" />
              )}
            </div>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              @{userData.username}
            </p>
          </div>

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