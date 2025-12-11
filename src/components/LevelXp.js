'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Award, TrendingUp, ThumbsUp, ThumbsDown, Zap, Star } from 'lucide-react';

export default function LevelXp({ userId, isDark = true }) {
  const [xpData, setXpData] = useState({
    totalXp: 0,
    level: 0,
    reviewCount: 0,
    totalLikes: 0,
    totalDislikes: 0,
    progress: 0,
    nextLevelXp: 0,
    popularity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    calculateUserXp();
  }, [userId]);

  const calculateUserXp = async () => {
    try {
      setLoading(true);

      // Fetch all reviews by user
      const { data: reviews, error: reviewError } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', userId);

      if (reviewError) throw reviewError;

      const reviewIds = reviews?.map(r => r.id) || [];
      const reviewCount = reviewIds.length;

      // Base XP from reviews (10 XP per review)
      let baseXp = reviewCount * 10;
      let totalLikes = 0;
      let totalDislikes = 0;

      if (reviewIds.length > 0) {
        // Fetch all votes for user's reviews
        const { data: votes, error: votesError } = await supabase
          .from('review_votes')
          .select('vote_type')
          .in('review_id', reviewIds);

        if (votesError) throw votesError;

        // Count likes and dislikes
        votes?.forEach(vote => {
          if (vote.vote_type === 'like') totalLikes++;
          else if (vote.vote_type === 'dislike') totalDislikes++;
        });
      }

      // Calculate bonus/penalty XP
      const likeXp = totalLikes * 5;
      const dislikeXp = totalDislikes * -3;

      // Total XP (cannot go below 0)
      const totalXp = Math.max(0, baseXp + likeXp + dislikeXp);

      // Calculate level (capped at 999)
      const level = Math.min(999, Math.floor(totalXp / 10));

      // Calculate progress to next level
      const currentLevelXp = level * 10;
      const nextLevelXp = (level + 1) * 10;
      const progress = ((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

      // Popularity score (likes - dislikes)
      const popularity = totalLikes - totalDislikes;

      setXpData({
        totalXp,
        level,
        reviewCount,
        totalLikes,
        totalDislikes,
        progress: Math.min(100, Math.max(0, progress)),
        nextLevelXp,
        popularity
      });
    } catch (error) {
      console.error('Error calculating XP:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`p-4 rounded-xl ${isDark ? 'bg-indigo-950/40' : 'bg-indigo-100/40'} animate-pulse`}>
        <div className="h-24 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg"></div>
      </div>
    );
  }

  const getLevelColor = (level) => {
    if (level >= 500) return 'from-yellow-400 to-orange-500';
    if (level >= 250) return 'from-purple-400 to-pink-500';
    if (level >= 100) return 'from-blue-400 to-indigo-500';
    if (level >= 50) return 'from-green-400 to-emerald-500';
    return 'from-gray-400 to-slate-500';
  };

  return (
    <div className={`p-4 sm:p-6 rounded-xl border ${isDark ? 'bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border-indigo-700/30' : 'bg-gradient-to-br from-indigo-100/40 to-purple-100/40 border-indigo-300/50'}`}>
      {/* Level Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getLevelColor(xpData.level)} flex items-center justify-center shadow-lg`}>
            <div className={`w-14 h-14 rounded-full ${isDark ? 'bg-black' : 'bg-white'} flex items-center justify-center`}>
              <span className={`text-xl font-black bg-gradient-to-br ${getLevelColor(xpData.level)} bg-clip-text text-transparent`}>
                {xpData.level}
              </span>
            </div>
          </div>
          <div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Level</p>
            <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-black'}`}>{xpData.level}</p>
            <p className={`text-xs ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>{xpData.totalXp} XP</p>
          </div>
        </div>

        {/* Popularity Badge */}
        <div className={`px-3 py-2 rounded-lg ${xpData.popularity > 0 ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30' : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30'}`}>
          <div className="flex items-center gap-1">
            <TrendingUp className={`w-4 h-4 ${xpData.popularity > 0 ? 'text-green-400' : 'text-red-400'}`} />
            <span className={`text-sm font-bold ${xpData.popularity > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {xpData.popularity > 0 ? '+' : ''}{xpData.popularity}
            </span>
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Popularity</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Progress to Level {xpData.level + 1}</span>
          <span className={isDark ? 'text-indigo-300' : 'text-indigo-600'}>{xpData.progress.toFixed(0)}%</span>
        </div>
        <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/10'} overflow-hidden`}>
          <div 
            className={`h-full bg-gradient-to-r ${getLevelColor(xpData.level)} transition-all duration-500`}
            style={{ width: `${xpData.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
          <Award className="w-4 h-4 mx-auto mb-1 text-indigo-400" />
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Reviews</p>
          <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{xpData.reviewCount}</p>
        </div>
        
        <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
          <ThumbsUp className="w-4 h-4 mx-auto mb-1 text-green-400" />
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Likes</p>
          <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{xpData.totalLikes}</p>
        </div>
        
        <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
          <ThumbsDown className="w-4 h-4 mx-auto mb-1 text-red-400" />
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Dislikes</p>
          <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{xpData.totalDislikes}</p>
        </div>
      </div>

      {/* XP Breakdown */}
      <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>XP Breakdown:</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Base (Reviews)</span>
            <span className={isDark ? 'text-indigo-300' : 'text-indigo-600'}>+{xpData.reviewCount * 10} XP</span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Likes Bonus</span>
            <span className="text-green-400">+{xpData.totalLikes * 5} XP</span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Dislikes Penalty</span>
            <span className="text-red-400">{xpData.totalDislikes * -3} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}