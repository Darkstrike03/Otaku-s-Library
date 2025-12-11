'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star, BookOpen, Calendar, Users, TrendingUp, Heart, Bookmark, Share2,
  ChevronDown, ChevronUp, Award, Sparkles, Globe, Flame, AlertCircle,
  Crown, MessageSquare, User, ArrowLeft, Volume2, PenTool, Building2,
  Zap, Radio, Image, Type, BookMarked, Link as LinkIcon, Lightbulb, 
  MessageCircle, Clock, Eye, ThumbsUp, Tv, Film, X, Feather, BookMarked as Pages,
  Layers, Pen, Scroll, BarChart3, BookDashed, TrendingDown, Infinity, ExternalLink, Layers2
} from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { getJsonFile } from '@/lib/pages';
import ReviewSection from '../ReviewSection';
import List from '@/components/List';
import {useTheme} from '../../app/contexts/ThemeContext';

export default function NovelUI() {
  const { isDark } = useTheme();
  const { uid } = useParams();
  const router = useRouter();
  
  const [novelData, setNovelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [relatedItems, setRelatedItems] = useState({
    anime: null,
    manga: null,
    manhwa: null,
    prequel: [],
    sequel: [],
    side_stories: [],
    related: [],
    adaptations: []
  });
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showContentWarning, setShowContentWarning] = useState(false);

 useEffect(() => {
  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };
  fetchUser();
}, []);

  // ✅ KEEP ONLY THIS ONE checkStatus useEffect
useEffect(() => {
  if (!currentUser || !novelData) return;

  const checkStatus = async () => {
    try {
      const { data: userData } = await supabase
        .from('user_data')
        .select('bookmarks, favourites')
        .eq('user_id', currentUser.id)
        .single();

      if (userData) {
        const bookmarks = userData.bookmarks ? userData.bookmarks.split(',').map(b => b.trim()) : [];
        const favourites = userData.favourites ? userData.favourites.split(',').map(f => f.trim()) : [];

        setIsBookmarked(bookmarks.includes(uid));
        setIsFavorite(favourites.includes(uid));
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  checkStatus();
}, [currentUser, uid, novelData]);

  useEffect(() => {
    const fetchNovelData = async () => {
      if (!uid) return;
      
      try {
        setLoading(true);
        const result = await getJsonFile(uid);
        
        if (result?.item) {
          setNovelData(result.item);
          
          // Fetch adaptations from ani_manhu_manhw_manga_don_uid
          if (result.item.ani_manhu_manhw_manga_don_uid) {
            const uids = (Array.isArray(result.item.ani_manhu_manhw_manga_don_uid) 
              ? result.item.ani_manhu_manhw_manga_don_uid 
              : result.item.ani_manhu_manhw_manga_don_uid.split(',')).map(u => u.trim());
            
            const relatedData = {};
            
            for (const relatedUid of uids) {
              const relatedResult = await getJsonFile(relatedUid);
              const lastChar = relatedUid.slice(-1).toUpperCase();
              
              if (lastChar === 'A') relatedData.anime = relatedResult?.item;
              if (lastChar === 'M') relatedData.manga = relatedResult?.item;
              if (lastChar === 'H') relatedData.manhwa = relatedResult?.item;
            }
            
            setRelatedItems(prev => ({ ...prev, ...relatedData }));
          }

          // Fetch prequels
          if (result.item.prequel && Array.isArray(result.item.prequel)) {
            const prequelResults = await Promise.all(result.item.prequel.map(id => getJsonFile(id)));
            setRelatedItems(prev => ({ ...prev, prequel: prequelResults.map(r => r?.item).filter(Boolean) }));
          }

          // Fetch sequels
          if (result.item.sequel && Array.isArray(result.item.sequel)) {
            const sequelResults = await Promise.all(result.item.sequel.map(id => getJsonFile(id)));
            setRelatedItems(prev => ({ ...prev, sequel: sequelResults.map(r => r?.item).filter(Boolean) }));
          }

          // Fetch side stories
          if (result.item.side_stories && Array.isArray(result.item.side_stories)) {
            const sideStoriesResults = await Promise.all(result.item.side_stories.map(id => getJsonFile(id)));
            setRelatedItems(prev => ({ ...prev, side_stories: sideStoriesResults.map(r => r?.item).filter(Boolean) }));
          }

          // Fetch related
          if (result.item.related && Array.isArray(result.item.related)) {
            const relatedResults = await Promise.all(result.item.related.map(id => getJsonFile(id)));
            setRelatedItems(prev => ({ ...prev, related: relatedResults.map(r => r?.item).filter(Boolean) }));
          }

          // Fetch adaptations
          if (result.item.adaptations && Array.isArray(result.item.adaptations)) {
            const adaptationsResults = await Promise.all(result.item.adaptations.map(id => getJsonFile(id)));
            setRelatedItems(prev => ({ ...prev, adaptations: adaptationsResults.map(r => r?.item).filter(Boolean) }));
          }
        } else {
          router.push('/404');
        }
      } catch (error) {
        console.error('Error fetching novel:', error);
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchNovelData();
  }, [uid, router]);


  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} flex items-center justify-center`}>
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-spin"></div>
          <div className={`absolute inset-2 ${isDark ? 'bg-black' : 'bg-white'} rounded-full flex items-center justify-center`}>
            <BookDashed className="w-8 h-8 text-indigo-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!novelData) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} flex items-center justify-center`}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Novel Not Found</h2>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>This novel doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'}`}>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="fixed top-5 left-4 z-30 bg-indigo-600 hover:bg-indigo-700 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all hover:scale-110"
      >
        <ArrowLeft className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>

      {/* Hero Section with Banner - FIXED */}
      <div className={`relative w-full h-[400px] sm:h-[280px] md:h-[350px] lg:h-[400px] overflow-hidden`}>
        <img 
          src={novelData.banner || novelData.poster} 
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover z-10"
          onError={(e) => e.target.style.display = 'none'}
        />  
        {/* Overlay with gradient */}
        <div className={`absolute inset-0 z-5 ${isDark ? 'bg-gradient-to-b from-black/20 via-black/50 to-black' : 'bg-gradient-to-b from-white/20 via-white/50 to-white'}`}></div>
        
        {/* Fallback gradient if image fails */}
        <div className={`absolute inset-0 z-0 ${isDark ? 'bg-gradient-to-br from-indigo-950 via-purple-950 to-black' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-white'}`}></div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end sm:justify-center items-start px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
          <div className="flex flex-col-reverse sm:flex-row w-full gap-3 sm:gap-6 items-end sm:items-center">
            {/* Poster */}
            <div className="w-full sm:w-auto flex-shrink-0">
              <div className="relative group w-34 h-46 sm:w-32 sm:h-44 md:w-40 md:h-56 mx-auto sm:mx-0">
                <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl blur opacity-60 group-hover:opacity-100 transition"></div>
                <img
                  src={novelData.poster}
                  alt={novelData.title}
                  className="relative w-full h-full object-cover rounded-lg sm:rounded-xl shadow-2xl"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x280?text=No+Image';
                  }}
                />
              </div>
            </div>

            {/* Title & Info */}
            <div className="flex-1 min-w-0">
              <div className="mb-2 sm:mb-3 flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className={`text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-200'}`}>
                  {novelData.type || 'Web Novel'}
                </span>
              </div>

              <h1 className={`text-lg sm:text-3xl md:text-4xl lg:text-5xl font-black mb-1 sm:mb-2 leading-tight ${isDark ? 'text-white' : 'text-black'} line-clamp-2 sm:line-clamp-none`}>
                {novelData.title}
              </h1>

              {novelData.native_name && (
                <p className={`text-xs sm:text-base md:text-lg mb-1 sm:mb-2 ${isDark ? 'text-indigo-300' : 'text-indigo-600'} font-semibold line-clamp-1`}>
                  {novelData.native_name}
                </p>
              )}

              {novelData.alt_names && Array.isArray(novelData.alt_names) && novelData.alt_names.length > 0 && (
                <p className={`text-[10px] sm:text-xs mb-2 sm:mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-1`}>
                  {novelData.alt_names.slice(0, 2).join(' • ')}
                </p>
              )}

              {/* Genre Chips */}
              {(novelData.genre || novelData.tags) && Array.isArray(novelData.genre || novelData.tags) && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  {novelData.main_gen && (
                    <span className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                      {novelData.main_gen}
                    </span>
                  )}
                  {(novelData.tags || novelData.genre).slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                        isDark 
                          ? 'bg-white/10 text-indigo-200' 
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={async () => {
  if (!currentUser) {
    alert('Please login first');
    return;
  }
  try {
    // Get current favorites
    const { data: userData, error: fetchError } = await supabase
      .from('user_data')
      .select('favourites')
      .eq('user_id', currentUser.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user data:', fetchError);
      return;
    }

    let favourites = userData?.favourites ? userData.favourites.split(',').map(f => f.trim()) : [];

    if (isFavorite) {
      favourites = favourites.filter(f => f !== uid);
    } else {
      favourites.push(uid);
    }

    const { error: updateError } = await supabase
      .from('user_data')
      .upsert(
        {
          user_id: currentUser.id,
          favourites: favourites.join(', '),
        },
        { onConflict: 'user_id' }
      );

    if (!updateError) {
      setIsFavorite(!isFavorite);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}}
                  className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all hover:scale-105 flex items-center gap-1 sm:gap-2 flex-shrink-0 ${
                    isFavorite
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
                      : `${isDark ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' : 'bg-indigo-200 hover:bg-indigo-300 text-indigo-700'}`
                  }`}
                >
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4" fill={isFavorite ? 'currentColor' : 'none'} />
                  <span className="hidden sm:inline">{isFavorite ? 'Loved' : 'Love'}</span>
                </button>

                <button
                  onClick={async () => {
  if (!currentUser) {
    alert('Please login first');
    return;
  }
  try {
    // Get current bookmarks
    const { data: userData, error: fetchError } = await supabase
      .from('user_data')
      .select('bookmarks')
      .eq('user_id', currentUser.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user data:', fetchError);
      return;
    }

    let bookmarks = userData?.bookmarks ? userData.bookmarks.split(',').map(b => b.trim()) : [];

    if (isBookmarked) {
      bookmarks = bookmarks.filter(b => b !== uid);
    } else {
      bookmarks.push(uid);
    }

    const { error: updateError } = await supabase
      .from('user_data')
      .upsert(
        {
          user_id: currentUser.id,
          bookmarks: bookmarks.join(', '),
        },
        { onConflict: 'user_id' }
      );

    if (!updateError) {
      setIsBookmarked(!isBookmarked);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}}
                  className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all hover:scale-105 flex items-center gap-1 sm:gap-2 flex-shrink-0 ${
                    isBookmarked
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : `${isDark ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' : 'bg-indigo-200 hover:bg-indigo-300 text-indigo-700'}`
                  }`}
                >
                  <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                  <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Mark'}</span>
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold transition-all hover:scale-105 flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 flex-shrink-0"
                >
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Badges */}
        <div className="absolute bottom-4 right-3 sm:bottom-6 sm:right-6 z-20 space-y-2 sm:space-y-3">
          {novelData.rating && (
            <div className={`backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-3 text-center ${isDark ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-indigo-300/20 border border-indigo-300/50'}`}>
              <div className="text-lg sm:text-2xl font-bold text-yellow-400">{novelData.rating}</div>
              <div className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Rating</div>
            </div>
          )}
          {novelData.status && (
            <div className={`backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-3 text-center ${isDark ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-purple-300/20 border border-purple-300/50'}`}>
              <div className={`text-[10px] sm:text-xs font-bold ${novelData.status === 'Ongoing' ? 'text-green-400' : 'text-blue-400'}`}>{novelData.status}</div>
              <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status</div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className={`relative z-10 ${isDark ? 'bg-indigo-950/30' : 'bg-indigo-100/30'} border-t border-b ${isDark ? 'border-indigo-700/30' : 'border-indigo-300/50'}`}>
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {novelData.start_date && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
                </div>
                <p className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-0.5 sm:mb-1`}>Release</p>
                <p className={`text-xs sm:text-sm font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  {new Date(novelData.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                </p>
              </div>
            )}

            {novelData.chapters && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
                </div>
                <p className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-0.5 sm:mb-1`}>Chapters</p>
                <p className={`text-xs sm:text-sm font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>{novelData.chapters}</p>
              </div>
            )}

            {novelData.words && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
                </div>
                <p className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-0.5 sm:mb-1`}>Words</p>
                <p className={`text-xs sm:text-sm font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>{(novelData.words / 1000000).toFixed(1)}M</p>
              </div>
            )}

            {novelData.update_frequency && (
              <div className="text-center hidden sm:block">
                <div className="flex items-center justify-center mb-1">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                </div>
                <p className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-0.5 sm:mb-1`}>Updates</p>
                <p className={`text-xs sm:text-sm font-bold ${isDark ? 'text-orange-300' : 'text-orange-700'} line-clamp-1`}>{novelData.update_frequency}</p>
              </div>
            )}

            {novelData.popularity && (
              <div className="text-center hidden lg:block">
                <div className="flex items-center justify-center mb-1">
                  <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                </div>
                <p className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-0.5 sm:mb-1`}>Popularity</p>
                <p className={`text-xs sm:text-sm font-bold text-red-400`}>#{typeof novelData.popularity === 'object' && novelData.popularity?.rank ? novelData.popularity.rank : 'N/A'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`relative z-10 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
          {/* Content Warning */}
          {novelData.content_warn && (
            <div className={`mb-6 sm:mb-8 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 ${isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              <button
                onClick={() => setShowContentWarning(!showContentWarning)}
                className="flex items-center gap-2 sm:gap-3 w-full"
              >
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                <span className={`text-xs sm:text-base font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  Content Warnings
                </span>
                <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 ml-auto text-red-500 transition-transform ${showContentWarning ? 'rotate-180' : ''}`} />
              </button>
              {showContentWarning && (
                <div className={`mt-3 pt-3 border-t ${isDark ? 'border-red-500/20' : 'border-red-500/20'}`}>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {(Array.isArray(novelData.content_warn) 
                      ? novelData.content_warn 
                      : [novelData.content_warn]).map((warn, idx) => (
                      <span key={idx} className="text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-lg bg-red-500/20 text-red-300">
                        {warn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className={`rounded-2xl p-4 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl animate-fade-in`} style={{ animationDelay: '0.3s' }}>
                                      <h3 className={`text-sm font-black mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'} uppercase tracking-wide`}>
                                        <BookMarked size={16} className="text-purple-400" />
                                        My List
                                      </h3>
                                      <List
                                        uid={uid}
                                        contentType="manhua"
                                        currentUser={currentUser}
                                        isDark={isDark}
                                      />
                                    </div>
          {/* Synopsis */}
          <div className="mb-6 mt-5 sm:mb-8 md:mb-10">
            <h2 className={`text-lg sm:text-xl md:text-2xl font-black mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 ${isDark ? 'text-white' : 'text-black'}`}>
              <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
              The Story
            </h2>
            <div className={`p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl ${isDark ? 'bg-indigo-950/20 border border-indigo-700/30' : 'bg-indigo-100/30 border border-indigo-300/50'}`}>
              <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {showFullSynopsis 
                  ? novelData.synopsis?.replace(/\*\*\*/g, ' ') 
                  : `${novelData.synopsis?.replace(/\*\*\*/g, ' ').substring(0, 350)}...`}
              </p>
              {novelData.synopsis && novelData.synopsis.length > 350 && (
                <button
                  onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                  className="text-indigo-400 hover:text-indigo-300 font-bold mt-3 sm:mt-4 flex items-center gap-1.5 text-xs sm:text-sm"
                >
                  {showFullSynopsis ? 'Collapse' : 'Read Full Synopsis'}
                  {showFullSynopsis ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Two Column Layout for Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-10">
            {/* Left - Creators & Platform */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              {/* Authors */}
              {novelData.authors && (
                <div>
                  <h3 className={`text-xs sm:text-sm font-black mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <Pen className="w-3 h-3 sm:w-4 sm:h-4" />
                    Authors
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {(Array.isArray(novelData.authors) ? novelData.authors : [novelData.authors]).map((author, idx) => (
                      <div key={idx} className={`p-2 sm:p-2.5 rounded-lg ${isDark ? 'bg-indigo-900/40 border border-indigo-700/30' : 'bg-indigo-100/50 border border-indigo-300'}`}>
                        <p className={`text-[10px] sm:text-xs md:text-sm font-bold ${isDark ? 'text-white' : 'text-black'} line-clamp-1`}>{author}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Illustrators */}
              {novelData.illustrator && (
                <div>
                  <h3 className={`text-xs sm:text-sm font-black mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <Image className="w-3 h-3 sm:w-4 sm:h-4" />
                    Illustrators
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {(Array.isArray(novelData.illustrator) ? novelData.illustrator : [novelData.illustrator]).map((illust, idx) => (
                      <div key={idx} className={`p-2 sm:p-2.5 rounded-lg ${isDark ? 'bg-purple-900/40 border border-purple-700/30' : 'bg-purple-100/50 border border-purple-300'}`}>
                        <p className={`text-[10px] sm:text-xs md:text-sm font-bold ${isDark ? 'text-white' : 'text-black'} line-clamp-1`}>{illust}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Translators */}
              {novelData.translators && (
                <div>
                  <h3 className={`text-xs sm:text-sm font-black mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                    Translators
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {(Array.isArray(novelData.translators) ? novelData.translators : [novelData.translators]).map((trans, idx) => (
                      <div key={idx} className={`p-2 sm:p-2.5 rounded-lg ${isDark ? 'bg-indigo-900/40 border border-indigo-700/30' : 'bg-indigo-100/50 border border-indigo-300'}`}>
                        <p className={`text-[10px] sm:text-xs md:text-sm font-bold ${isDark ? 'text-white' : 'text-black'} line-clamp-1`}>{trans}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Publishers */}
                {novelData.publishers && (
                  <div>
                    <h3 className={`text-xs sm:text-sm font-black mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                      <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      Publishers
                    </h3>
                    <div className="space-y-1.5 sm:space-y-2">
                      {(Array.isArray(novelData.publishers) ? novelData.publishers : [novelData.publishers]).map((pub, idx) => (
                        <div key={idx} className={`p-2 sm:p-2.5 rounded-lg ${isDark ? 'bg-indigo-900/40 border border-indigo-700/30' : 'bg-indigo-100/50 border border-indigo-300'}`}>
                          <p className={`text-[10px] sm:text-xs md:text-sm font-bold ${isDark ? 'text-white' : 'text-black'} line-clamp-1`}>{pub}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {/* Platform */}
              {novelData.eng_platform && (
                <div>
                  <h3 className={`text-xs sm:text-sm font-black mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                    Read On
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {(Array.isArray(novelData.eng_platform) ? novelData.eng_platform : [novelData.eng_platform]).map((platform, idx) => (
                      <div key={idx} className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-[10px] sm:text-xs md:text-sm font-bold text-center">
                        {platform}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Original Platform */}
              {novelData.orig_platform && (
                <div>
                  <h3 className={`text-xs sm:text-sm font-black mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <Radio className="w-3 h-3 sm:w-4 sm:h-4" />
                    Original Platform
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {(Array.isArray(novelData.orig_platform) ? novelData.orig_platform : [novelData.orig_platform]).map((platform, idx) => (
                      <div key={idx} className={`p-2 sm:p-2.5 rounded-lg text-center ${isDark ? 'bg-purple-900/40 border border-purple-700/30' : 'bg-purple-100/50 border border-purple-300'}`}>
                        <p className={`text-[10px] sm:text-xs md:text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{platform}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Site */}
              {novelData.official_site && (
                <div>
                  <h3 className={`text-xs sm:text-sm font-black mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                    Official Site
                  </h3>
                  <a 
                    href={novelData.official_site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-[10px] sm:text-xs md:text-sm font-bold text-center inline-block hover:from-indigo-600 hover:to-purple-600 transition"
                  >
                    Visit Website
                  </a>
                </div>
              )}

              {/* Languages */}
              {novelData.languages && Array.isArray(novelData.languages) && (
                <div>
                  <h3 className={`text-xs sm:text-sm font-black mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {novelData.languages.map((lang, idx) => (
                      <span key={idx} className="px-2 py-1 text-[10px] sm:text-xs font-bold rounded bg-indigo-500/20 text-indigo-300">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right - Info & Character Preview */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Information Tab */}
              <div>
                <h3 className={`text-xs sm:text-sm font-black mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                  Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                  {novelData.type && (
                    <div className={`p-2 sm:p-3 rounded-lg ${isDark ? 'bg-indigo-900/20 border border-indigo-700/30' : 'bg-indigo-100/30 border border-indigo-300/50'}`}>
                      <p className={`text-[9px] sm:text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-0.5 sm:mb-1`}>Type</p>
                      <p className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-black'} line-clamp-1`}>{novelData.type}</p>
                    </div>
                  )}
                  {novelData.publishers && (
                    <div className={`p-2 sm:p-3 rounded-lg ${isDark ? 'bg-indigo-900/20 border border-indigo-700/30' : 'bg-indigo-100/30 border border-indigo-300/50'}`}>
                      <p className={`text-[9px] sm:text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-0.5 sm:mb-1`}>Publisher</p>
                      <p className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-black'} line-clamp-1`}>
                        {Array.isArray(novelData.publishers) ? novelData.publishers[0] : novelData.publishers}
                      </p>
                    </div>
                  )}
                  {novelData.end_date && (
                    <div className={`p-2 sm:p-3 rounded-lg ${isDark ? 'bg-indigo-900/20 border border-indigo-700/30' : 'bg-indigo-100/30 border border-indigo-300/50'}`}>
                      <p className={`text-[9px] sm:text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-0.5 sm:mb-1`}>Ended</p>
                      <p className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {new Date(novelData.end_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                      </p>
                    </div>
                  )}
                  {novelData.wordcountperch && (
                    <div className={`p-2 sm:p-3 rounded-lg ${isDark ? 'bg-indigo-900/20 border border-indigo-700/30' : 'bg-indigo-100/30 border border-indigo-300/50'}`}>
                      <p className={`text-[9px] sm:text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-0.5 sm:mb-1`}>Words/Ch</p>
                      <p className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{(novelData.wordcountperch / 1000).toFixed(0)}k</p>
                    </div>
                  )}
                  {novelData.lastupdated_at && (
                  <div className={`p-2 sm:p-3 rounded-lg ${isDark ? 'bg-indigo-900/20 border border-indigo-700/30' : 'bg-indigo-100/30 border border-indigo-300/50'}`}>
                    <p className={`text-[9px] sm:text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-0.5 sm:mb-1`}>Updated</p>
                    <p className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                      {new Date(novelData.lastupdated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                )}

                {novelData.genre && Array.isArray(novelData.genre) && novelData.genre.length > 0 && (
                  <div className={`p-2 sm:p-3 rounded-lg ${isDark ? 'bg-indigo-900/20 border border-indigo-700/30' : 'bg-indigo-100/30 border border-indigo-300/50'}`}>
                    <p className={`text-[9px] sm:text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-0.5 sm:mb-1`}>Genres</p>
                    <p className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-black'} line-clamp-1`}>
                      {novelData.genre.slice(0, 2).join(', ')}
                    </p>
                  </div>
                )}
                </div>
              </div>

              {/* Characters Preview */}
              {novelData.characters && Array.isArray(novelData.characters) && novelData.characters.length > 0 && (
                <div>
                  <h3 className={`text-xs sm:text-sm font-black mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    Main Characters
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                    {novelData.characters.slice(0, 12).map((char, idx) => (
                      <div key={idx} className={`p-2 sm:p-3 rounded-lg text-center ${isDark ? 'bg-indigo-900/40 border border-indigo-700/30' : 'bg-indigo-100/50 border border-indigo-300'}`}>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-1">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <p className={`text-[9px] sm:text-[10px] font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-700'} line-clamp-2`}>
                          {typeof char === 'string' ? char : char.name || 'Unknown'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Special Notes */}
          {novelData.special_notes && (
            <div className={`mb-6 sm:mb-8 md:mb-10 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl ${isDark ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
              <div className="flex items-start gap-2 sm:gap-3 mb-3">
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
                <h3 className={`text-sm sm:text-base font-black ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  Special Notes
                </h3>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {novelData.special_notes}
              </p>
            </div>
          )}

          {/* Librarian's Notes */}
          {novelData.lib_talk && (
            <div className={`mb-6 sm:mb-8 md:mb-10 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border-l-4 ${isDark ? 'bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border-indigo-500' : 'bg-gradient-to-r from-indigo-100/50 to-purple-100/50 border-indigo-500'}`}>
              <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Feather className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-indigo-400 flex-shrink-0" />
                <h3 className={`text-sm sm:text-base md:text-lg font-black ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  Librarian's Note
                </h3>
              </div>
              <p className={`text-xs sm:text-sm md:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {novelData.lib_talk}
              </p>
            </div>
          )}

          {/* Adaptations from ani_manhu_manhw_manga_don_uid */}
          {(relatedItems.anime || relatedItems.manga || relatedItems.manhwa) && (
            <div className="mb-6 sm:mb-8 md:mb-10">
              <h2 className={`text-lg sm:text-xl md:text-2xl font-black mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 ${isDark ? 'text-white' : 'text-black'}`}>
                <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                Media Adaptations
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {relatedItems.anime && (
                  <Link href={`/details/${relatedItems.anime.uid}`}>
                    <div className={`rounded-lg sm:rounded-xl overflow-hidden group hover:scale-105 transition ${isDark ? 'bg-indigo-900/40' : 'bg-indigo-100/50'}`}>
                      <div className="relative h-32 sm:h-40">
                        <img src={relatedItems.anime.poster} alt={relatedItems.anime.title} className="w-full h-full object-cover group-hover:brightness-110 transition" onError={(e) => e.target.src = 'https://via.placeholder.com/200x280?text=No+Image'} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 sm:p-3">
                          <div>
                            <p className="text-[10px] sm:text-xs font-black text-purple-400 mb-0.5">ANIME</p>
                            <p className="text-xs sm:text-sm font-bold text-white line-clamp-2">{relatedItems.anime.title}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                {relatedItems.manga && (
                  <Link href={`/details/${relatedItems.manga.uid}`}>
                    <div className={`rounded-lg sm:rounded-xl overflow-hidden group hover:scale-105 transition ${isDark ? 'bg-indigo-900/40' : 'bg-indigo-100/50'}`}>
                      <div className="relative h-32 sm:h-40">
                        <img src={relatedItems.manga.poster} alt={relatedItems.manga.title} className="w-full h-full object-cover group-hover:brightness-110 transition" onError={(e) => e.target.src = 'https://via.placeholder.com/200x280?text=No+Image'} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 sm:p-3">
                          <div>
                            <p className="text-[10px] sm:text-xs font-black text-blue-400 mb-0.5">MANGA</p>
                            <p className="text-xs sm:text-sm font-bold text-white line-clamp-2">{relatedItems.manga.title}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                {relatedItems.manhwa && (
                  <Link href={`/details/${relatedItems.manhwa.uid}`}>
                    <div className={`rounded-lg sm:rounded-xl overflow-hidden group hover:scale-105 transition ${isDark ? 'bg-indigo-900/40' : 'bg-indigo-100/50'}`}>
                      <div className="relative h-32 sm:h-40">
                        <img src={relatedItems.manhwa.poster} alt={relatedItems.manhwa.title} className="w-full h-full object-cover group-hover:brightness-110 transition" onError={(e) => e.target.src = 'https://via.placeholder.com/200x280?text=No+Image'} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 sm:p-3">
                          <div>
                            <p className="text-[10px] sm:text-xs font-black text-green-400 mb-0.5">MANHWA</p>
                            <p className="text-xs sm:text-sm font-bold text-white line-clamp-2">{relatedItems.manhwa.title}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Series */}
          {(relatedItems.prequel.length > 0 || relatedItems.sequel.length > 0) && (
            <div className="space-y-6 sm:space-y-8 md:mb-10">
              {relatedItems.prequel.length > 0 && (
                <div>
                  <h2 className={`text-lg sm:text-xl md:text-2xl font-black mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 ${isDark ? 'text-white' : 'text-black'}`}>
                    <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                    Before This Story
                  </h2>
                  <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-2">
                    {relatedItems.prequel.map((item, idx) => (
                      <Link key={idx} href={`/details/${item.uid}`}>
                        <div className="flex-shrink-0 w-28 sm:w-32 md:w-36 rounded-lg sm:rounded-xl overflow-hidden hover:scale-105 transition">
                          <img src={item.poster} alt={item.title} className="w-full h-40 sm:h-44 md:h-48 object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/200x280?text=No+Image'} />
                          <div className={`p-2 sm:p-3 ${isDark ? 'bg-indigo-900/40' : 'bg-indigo-100/50'}`}>
                            <p className={`text-[10px] sm:text-xs font-bold ${isDark ? 'text-white' : 'text-black'} line-clamp-2`}>{item.title}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relatedItems.sequel.length > 0 && (
                <div>
                  <h2 className={`text-lg sm:text-xl md:text-2xl font-black mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 ${isDark ? 'text-white' : 'text-black'}`}>
                    <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                    What Comes Next
                  </h2>
                  <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-2">
                    {relatedItems.sequel.map((item, idx) => (
                      <Link key={idx} href={`/details/${item.uid}`}>
                        <div className="flex-shrink-0 w-28 sm:w-32 md:w-36 rounded-lg sm:rounded-xl overflow-hidden hover:scale-105 transition">
                          <img src={item.poster} alt={item.title} className="w-full h-40 sm:h-44 md:h-48 object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/200x280?text=No+Image'} />
                          <div className={`p-2 sm:p-3 ${isDark ? 'bg-indigo-900/40' : 'bg-indigo-100/50'}`}>
                            <p className={`text-[10px] sm:text-xs font-bold ${isDark ? 'text-white' : 'text-black'} line-clamp-2`}>{item.title}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Side Stories */}
          {relatedItems.side_stories.length > 0 && (
            <div className="mb-6 sm:mb-8 md:mb-10">
              <h2 className={`text-lg sm:text-xl md:text-2xl font-black mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 ${isDark ? 'text-white' : 'text-black'}`}>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                Side Stories
              </h2>
              <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-2">
                {relatedItems.side_stories.map((item, idx) => (
                  <Link key={idx} href={`/details/${item.uid}`}>
                    <div className="flex-shrink-0 w-28 sm:w-32 md:w-36 rounded-lg sm:rounded-xl overflow-hidden hover:scale-105 transition">
                      <img src={item.poster} alt={item.title} className="w-full h-40 sm:h-44 md:h-48 object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/200x280?text=No+Image'} />
                      <div className={`p-2 sm:p-3 ${isDark ? 'bg-indigo-900/40' : 'bg-indigo-100/50'}`}>
                        <p className={`text-[10px] sm:text-xs font-bold ${isDark ? 'text-white' : 'text-black'} line-clamp-2`}>{item.title}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related */}
          {relatedItems.related.length > 0 && (
            <div className="mb-6 sm:mb-8 md:mb-10">
              <h2 className={`text-lg sm:text-xl md:text-2xl font-black mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 ${isDark ? 'text-white' : 'text-black'}`}>
                <Layers2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                Related Novels
              </h2>
              <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-2">
                {relatedItems.related.map((item, idx) => (
                  <Link key={idx} href={`/details/${item.uid}`}>
                    <div className="flex-shrink-0 w-28 sm:w-32 md:w-36 rounded-lg sm:rounded-xl overflow-hidden hover:scale-105 transition">
                      <img src={item.poster} alt={item.title} className="w-full h-40 sm:h-44 md:h-48 object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/200x280?text=No+Image'} />
                      <div className={`p-2 sm:p-3 ${isDark ? 'bg-indigo-900/40' : 'bg-indigo-100/50'}`}>
                        <p className={`text-[10px] sm:text-xs font-bold ${isDark ? 'text-white' : 'text-black'} line-clamp-2`}>{item.title}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Adaptations from adaptations field */}
          {relatedItems.adaptations.length > 0 && (
            <div className="mb-6 sm:mb-8 md:mb-10">
              <h2 className={`text-lg sm:text-xl md:text-2xl font-black mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 ${isDark ? 'text-white' : 'text-black'}`}>
                <Film className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                Other Adaptations
              </h2>
              <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-2">
                {relatedItems.adaptations.map((item, idx) => (
                  <Link key={idx} href={`/details/${item.uid}`}>
                    <div className="flex-shrink-0 w-28 sm:w-32 md:w-36 rounded-lg sm:rounded-xl overflow-hidden hover:scale-105 transition">
                      <img src={item.poster} alt={item.title} className="w-full h-40 sm:h-44 md:h-48 object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/200x280?text=No+Image'} />
                      <div className={`p-2 sm:p-3 ${isDark ? 'bg-indigo-900/40' : 'bg-indigo-100/50'}`}>
                        <p className={`text-[10px] sm:text-xs font-bold ${isDark ? 'text-white' : 'text-black'} line-clamp-2`}>{item.title}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Contributors */}
          {novelData.contributors && Array.isArray(novelData.contributors) && novelData.contributors.length > 0 && (
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-indigo-700/30">
              <h2 className={`text-lg sm:text-xl md:text-2xl font-black mb-4 sm:mb-6 ${isDark ? 'text-white' : 'text-black'}`}>Contributed By</h2>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3">
                {novelData.contributors.map((contributor, idx) => (
                  <div key={idx} className={`p-2 sm:p-3 rounded-lg text-center ${isDark ? 'bg-indigo-900/40 border border-indigo-700/30' : 'bg-indigo-100/50 border border-indigo-300'}`}>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-1 sm:mb-2">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <p className={`text-[9px] sm:text-[10px] font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-700'} line-clamp-2`}>{contributor}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg sm:rounded-2xl p-4 sm:p-6 max-w-sm w-full ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>Share This Novel</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href);
                  alert('Link copied!');
                  setShowShareModal(false);
                }}
                className="w-full p-2.5 sm:p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg sm:rounded-lg font-bold transition text-xs sm:text-sm"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={`mt-6 p-4 md-6 lg:8 rounded-lg sm:rounded-xl md:rounded-2xl border-t ${isDark ? 'border-indigo-700/30' : 'border-gray-300'}`}>    
                  <ReviewSection 
    isDark={isDark} 
    uid={uid} 
    category="novel" 
    currentUser={currentUser}
    onReviewUpdated={() => {
      // Refresh novel data when reviews change
      const fetchNovelData = async () => {
        const { data, error } = await supabase
          .from('Webnovel_data')
          .select('rating, review_count')
          .eq('uid', uid)
          .single();
        
        if (!error && data) {
          setNovelData(prev => ({
            ...prev,
            rating: data.rating,
            review_count: data.review_count
          }));
        }
      };
      fetchAnimeData();
    }}
  />
</div>
    </div>
  );
}