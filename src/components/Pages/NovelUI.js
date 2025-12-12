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
import UserProfile from '@/components/UserProfile';
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
  const [contributorsData, setContributorsData] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [similarItems, setSimilarItems] = useState([]);
  const [showAllSimilar, setShowAllSimilar] = useState(false);
  

  // Helper cards for related content
  const RelatedCard = ({ item, label, bgClass }) => (
    <Link href={`/details/${item.uid}`} className="group flex-shrink-0 w-40 sm:w-48 md:w-56 cursor-pointer">
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl hover:scale-105 transition-transform duration-300 shadow-xl hover:shadow-2xl">
        <img
          src={item.poster}
          alt={item.title}
          className="w-full h-56 sm:h-64 md:h-72 object-cover group-hover:brightness-110 transition-all"
          onError={(e) => (e.target.src = 'https://via.placeholder.com/300x450?text=No+Image')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
          <div className={`text-xs md:text-sm font-black mb-2 px-3 py-1.5 rounded-lg ${bgClass} text-white inline-block w-fit`}>
            {label}
          </div>
          <p className="text-base md:text-lg font-bold text-white line-clamp-2 group-hover:line-clamp-none transition-all">
            {item.title}
          </p>
        </div>
      </div>
    </Link>
  );

      {/* Add scrollbar hiding CSS */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
  const SmallRelatedCard = ({ item }) => (
    <Link href={`/details/${item.uid}`} className="group flex-shrink-0 w-36 sm:w-40 md:w-44 cursor-pointer">
      <div className="overflow-hidden rounded-2xl hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl">
        <img
          src={item.poster}
          alt={item.title}
          className="w-full h-52 sm:h-56 md:h-60 object-cover group-hover:brightness-110 transition-all"
          onError={(e) => (e.target.src = 'https://via.placeholder.com/300x450?text=No+Image')}
        />
        <div className={`${isDark ? 'bg-indigo-900/50 backdrop-blur-sm' : 'bg-indigo-100'} p-3 md:p-4`}>
          <p className={`${isDark ? 'text-white' : 'text-black'} text-sm md:text-base font-bold line-clamp-2`}>
            {item.title}
          </p>
        </div>
      </div>
    </Link>
  );

 useEffect(() => {
  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };
  fetchUser();
}, []);

  // Fetch similar items from database
  useEffect(() => {
    const fetchSimilarItems = async () => {
      if (!novelData?.similar_to || !Array.isArray(novelData.similar_to) || novelData.similar_to.length === 0) return;

      try {
        const similarResults = await Promise.all(
          novelData.similar_to.map(async (uid) => {
            const result = await getJsonFile(uid);
            return result?.item || null;
          })
        );
        setSimilarItems(similarResults.filter(Boolean));
      } catch (error) {
        console.error('Error fetching similar items:', error);
      }
    };

    fetchSimilarItems();
  }, [novelData]);

  // Fetch contributors from database
  useEffect(() => {
    const fetchContributors = async () => {
      if (!novelData?.contributors || !Array.isArray(novelData.contributors)) return;
      
      const { data, error } = await supabase
        .from('user_data')
        .select('user_id, username, profile_pic')
        .in('username', novelData.contributors);
      
      if (!error && data) {
        setContributorsData(data);
      }
    };
    
    fetchContributors();
  }, [novelData]);

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

  // Fetch contributors from database
  useEffect(() => {
    const fetchContributors = async () => {
      if (!novelData?.contributors || !Array.isArray(novelData.contributors)) return;
      
      const { data, error } = await supabase
        .from('user_data')
        .select('user_id, username, profile_pic')
        .in('username', novelData.contributors);
      
      if (!error && data) {
        setContributorsData(data);
      }
    };
    
    fetchContributors();
  }, [novelData]);

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
      {/* Back Button - Enhanced */}
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-30 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-3 md:p-4 rounded-2xl shadow-2xl transition-all hover:scale-110 backdrop-blur-sm"
      >
        <ArrowLeft className="w-6 h-6 md:w-7 md:h-7" />
      </button>

      {/* Hero Section - Redesigned for better mobile visibility */}
      <div className="relative w-full min-h-[500px] md:h-[450px] lg:h-[500px] overflow-hidden">
        {/* Banner Image */}
        <img 
          src={novelData.banner || novelData.poster} 
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => e.target.style.display = 'none'}
        />  
        
        {/* Enhanced Gradient Overlay */}
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-black/30 via-black/60 to-black' : 'bg-gradient-to-b from-white/30 via-white/60 to-white'}`}></div>
        
        {/* Fallback gradient if image fails */}
        <div className={`absolute inset-0 -z-10 ${isDark ? 'bg-gradient-to-br from-indigo-950 via-purple-950 to-black' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-white'}`}></div>

        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col justify-end px-4 md:px-8 py-6 md:py-10">
          {/* Mobile: Stack poster above content, Desktop: Side by side */}
          <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-center md:items-end">
            
            {/* Poster - Larger on mobile */}
            <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-start">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <img
                  src={novelData.poster}
                  alt={novelData.title}
                  className="relative w-48 h-72 md:w-52 md:h-80 object-cover rounded-2xl shadow-2xl ring-4 ring-white/20"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x280?text=No+Image';
                  }}
                />
                {/* Status Badge on Poster */}
                <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full backdrop-blur-md ${novelData.status === 'Ongoing' ? 'bg-green-500/90' : 'bg-blue-500/90'} text-white text-xs font-bold shadow-lg`}>
                  {novelData.status}
                </div>
              </div>
            </div>

            {/* Title & Info - Larger text for mobile */}
            <div className="flex-1 w-full text-center md:text-left">
              {/* Type Badge */}
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-bold px-4 py-2 rounded-full shadow-lg ${isDark ? 'bg-indigo-900/80 text-indigo-200' : 'bg-indigo-200 text-indigo-800'}`}>
                  {novelData.type || 'Web Novel'}
                </span>
              </div>

              {/* Title - Much larger for mobile */}
              <h1 className={`text-3xl md:text-4xl lg:text-5xl font-black mb-3 leading-tight ${isDark ? 'text-white' : 'text-black'} drop-shadow-lg`}>
                {novelData.title}
              </h1>

              {/* Native Name */}
              {novelData.native_name && (
                <p className={`text-lg md:text-xl mb-2 ${isDark ? 'text-indigo-300' : 'text-indigo-600'} font-semibold`}>
                  {novelData.native_name}
                </p>
              )}

              {/* Alt Names */}
              {novelData.alt_names && Array.isArray(novelData.alt_names) && novelData.alt_names.length > 0 && (
                <p className={`text-sm md:text-base mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {novelData.alt_names.slice(0, 2).join(' • ')}
                </p>
              )}

              {/* Genre Chips - Bigger and more prominent */}
              {(novelData.genre || novelData.tags) && Array.isArray(novelData.genre || novelData.tags) && (
                <div className="flex flex-wrap gap-2 mb-5 justify-center md:justify-start">
                  {novelData.main_gen && (
                    <span className="px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg">
                      {novelData.main_gen}
                    </span>
                  )}
                  {(novelData.tags || novelData.genre).slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      className={`px-4 py-2 rounded-full text-sm font-medium shadow-md ${
                        isDark 
                          ? 'bg-white/20 text-indigo-200 backdrop-blur-sm' 
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons - Larger and more spaced */}
              <div className="flex gap-3 justify-center md:justify-start">
                <button
                  onClick={async () => {
  if (!currentUser) {
    alert('Please login first');
    return;
  }
  try {
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
                  className={`px-5 py-3 rounded-2xl text-base font-bold transition-all hover:scale-105 flex items-center gap-2 shadow-lg ${
                    isFavorite
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-red-500/50'
                      : `${isDark ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-2 border-white/30' : 'bg-indigo-200 hover:bg-indigo-300 text-indigo-700'}`
                  }`}
                >
                  <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
                  <span>{isFavorite ? 'Loved' : 'Love'}</span>
                </button>

                <button
                  onClick={async () => {
  if (!currentUser) {
    alert('Please login first');
    return;
  }
  try {
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
                  className={`px-5 py-3 rounded-2xl text-base font-bold transition-all hover:scale-105 flex items-center gap-2 shadow-lg ${
                    isBookmarked
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/50'
                      : `${isDark ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-2 border-white/30' : 'bg-indigo-200 hover:bg-indigo-300 text-indigo-700'}`
                  }`}
                >
                  <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
                  <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-5 py-3 rounded-2xl text-base font-bold transition-all hover:scale-105 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stats Cards - Repositioned for mobile */}
        <div className="absolute top-4 right-4 z-20 flex md:flex-col gap-3">
          {novelData.rating && (
            <div className={`backdrop-blur-xl rounded-2xl p-4 text-center min-w-[80px] shadow-xl ${isDark ? 'bg-indigo-500/30 border-2 border-indigo-400/50' : 'bg-indigo-300/40 border-2 border-indigo-400/60'}`}>
              <div className="text-3xl font-black text-yellow-400 mb-1">{novelData.rating}</div>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Rating</div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar - Enhanced with larger text */}
      <div className={`${isDark ? 'bg-gradient-to-r from-indigo-950/50 to-purple-950/50' : 'bg-gradient-to-r from-indigo-100/50 to-purple-100/50'} border-y-2 ${isDark ? 'border-indigo-700/50' : 'border-indigo-300/60'} backdrop-blur-sm`}>
        <div className="container mx-auto px-4 md:px-8 py-4 md:py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {novelData.start_date && (
              <div className="text-center group">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-all">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
                  </div>
                </div>
                <p className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 font-medium`}>Release</p>
                <p className={`text-sm md:text-base font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  {new Date(novelData.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                </p>
              </div>
            )}

            {novelData.chapters && (
              <div className="text-center group">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-all">
                    <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
                  </div>
                </div>
                <p className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 font-medium`}>Chapters</p>
                <p className={`text-sm md:text-base font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>{novelData.chapters}</p>
              </div>
            )}

            {novelData.words && (
              <div className="text-center group">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-all">
                    <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
                  </div>
                </div>
                <p className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 font-medium`}>Words</p>
                <p className={`text-sm md:text-base font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>{(novelData.words / 1000000).toFixed(1)}M</p>
              </div>
            )}

            {novelData.update_frequency && (
              <div className="text-center hidden sm:block group">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 rounded-xl bg-orange-500/20 group-hover:bg-orange-500/30 transition-all">
                    <Zap className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
                  </div>
                </div>
                <p className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 font-medium`}>Updates</p>
                <p className={`text-sm md:text-base font-bold ${isDark ? 'text-orange-300' : 'text-orange-700'} line-clamp-1`}>{novelData.update_frequency}</p>
              </div>
            )}

            {novelData.popularity && (
              <div className="text-center hidden lg:block group">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 rounded-xl bg-red-500/20 group-hover:bg-red-500/30 transition-all">
                    <Flame className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
                  </div>
                </div>
                <p className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1 font-medium`}>Popularity</p>
                <p className={`text-sm md:text-base font-bold text-red-400`}>#{typeof novelData.popularity === 'object' && novelData.popularity?.rank ? novelData.popularity.rank : 'N/A'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`relative z-10 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
          {/* Content Warning - Enhanced visibility */}
          {novelData.content_warn && (
            <div className={`mb-6 sm:mb-8 rounded-3xl p-5 md:p-6 border-2 ${isDark ? 'bg-red-950/30 border-red-500/50' : 'bg-red-50 border-red-300'} shadow-xl`}>
              <button
                onClick={() => setShowContentWarning(!showContentWarning)}
                className="flex items-center gap-3 w-full group"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <span className={`text-lg md:text-xl font-black ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  Content Warnings
                </span>
                <ChevronDown className={`w-6 h-6 ml-auto text-red-500 transition-transform duration-300 ${showContentWarning ? 'rotate-180' : ''}`} />
              </button>
              {showContentWarning && (
                <div className={`mt-4 pt-4 border-t-2 ${isDark ? 'border-red-500/30' : 'border-red-300'}`}>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(novelData.content_warn) 
                      ? novelData.content_warn 
                      : [novelData.content_warn]).map((warn, idx) => (
                      <span key={idx} className="text-sm md:text-base font-bold px-4 py-2 rounded-xl bg-red-500/30 text-red-300 shadow-lg">
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
          {/* Synopsis - Larger text and better spacing */}
          <div className="mb-6 mt-5 sm:mb-8">
            <h2 className={`text-2xl md:text-3xl font-black mb-5 flex items-center gap-3 ${isDark ? 'text-white' : 'text-black'}`}>
              <div className="w-2 h-10 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
              The Story
            </h2>
            <div className={`p-6 md:p-8 rounded-3xl border-2 ${isDark ? 'bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border-indigo-700/50' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300'} shadow-2xl`}>
              <p className={`text-base md:text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {showFullSynopsis 
                  ? novelData.synopsis?.replace(/\*\*\*/g, ' ') 
                  : `${novelData.synopsis?.replace(/\*\*\*/g, ' ').substring(0, 300)}...`}
              </p>
              {novelData.synopsis && novelData.synopsis.length > 300 && (
                <button
                  onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                  className="text-indigo-400 hover:text-indigo-300 font-bold mt-4 flex items-center gap-2 text-base md:text-lg group"
                >
                  {showFullSynopsis ? 'Show Less' : 'Read Full Synopsis'}
                  {showFullSynopsis ? 
                    <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> : 
                    <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                  }
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
                  <h3 className={`text-lg md:text-xl font-black mb-3 flex items-center gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <Pen className="w-5 h-5" />
                    Authors
                  </h3>
                  <div className="space-y-2">
                    {(Array.isArray(novelData.authors) ? novelData.authors : [novelData.authors]).map((author, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border-2 ${isDark ? 'bg-indigo-900/40 border-indigo-700/50' : 'bg-indigo-100 border-indigo-300'} hover:scale-105 transition-transform shadow-lg`}>
                        <p className={`text-base md:text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>{author}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Illustrators */}
              {novelData.illustrator && (
                <div>
                  <h3 className={`text-lg md:text-xl font-black mb-3 flex items-center gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <Image className="w-5 h-5" />
                    Illustrators
                  </h3>
                  <div className="space-y-2">
                    {(Array.isArray(novelData.illustrator) ? novelData.illustrator : [novelData.illustrator]).map((illust, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border-2 ${isDark ? 'bg-purple-900/40 border-purple-700/50' : 'bg-purple-100 border-purple-300'} hover:scale-105 transition-transform shadow-lg`}>
                        <p className={`text-base md:text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>{illust}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Translators */}
              {novelData.translators && (
                <div>
                  <h3 className={`text-lg md:text-xl font-black mb-3 flex items-center gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <Globe className="w-5 h-5" />
                    Translators
                  </h3>
                  <div className="space-y-2">
                    {(Array.isArray(novelData.translators) ? novelData.translators : [novelData.translators]).map((trans, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border-2 ${isDark ? 'bg-indigo-900/40 border-indigo-700/50' : 'bg-indigo-100 border-indigo-300'} hover:scale-105 transition-transform shadow-lg`}>
                        <p className={`text-base md:text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>{trans}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Publishers */}
                {novelData.publishers && (
                  <div>
                    <h3 className={`text-lg md:text-xl font-black mb-3 flex items-center gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                      <Building2 className="w-5 h-5" />
                      Publishers
                    </h3>
                    <div className="space-y-2">
                      {(Array.isArray(novelData.publishers) ? novelData.publishers : [novelData.publishers]).map((pub, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl border-2 ${isDark ? 'bg-indigo-900/40 border-indigo-700/50' : 'bg-indigo-100 border-indigo-300'} hover:scale-105 transition-transform shadow-lg`}>
                          <p className={`text-base md:text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>{pub}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {/* Read On Platforms */}
              {novelData.eng_platform && (
                <div>
                  <h3 className={`text-lg md:text-xl font-black mb-3 flex items-center gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <Globe className="w-5 h-5" />
                    Read On
                  </h3>
                  <div className="space-y-2">
                    {(Array.isArray(novelData.eng_platform) ? novelData.eng_platform : [novelData.eng_platform]).map((platform, idx) => (
                      <div key={idx} className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl text-base md:text-lg font-bold text-center shadow-xl hover:scale-105 transition-transform">
                        {platform}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Original Platform */}
              {novelData.orig_platform && (
                <div>
                  <h3 className={`text-lg md:text-xl font-black mb-3 flex items-center gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <Radio className="w-5 h-5" />
                    Original Platform
                  </h3>
                  <div className="space-y-2">
                    {(Array.isArray(novelData.orig_platform) ? novelData.orig_platform : [novelData.orig_platform]).map((platform, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl text-center border-2 ${isDark ? 'bg-purple-900/40 border-purple-700/50' : 'bg-purple-100 border-purple-300'} hover:scale-105 transition-transform shadow-lg`}>
                        <p className={`text-base md:text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>{platform}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Site */}
              {novelData.official_site && (
                <div>
                  <h3 className={`text-lg md:text-xl font-black mb-3 flex items-center gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <ExternalLink className="w-5 h-5" />
                    Official Site
                  </h3>
                  <a 
                    href={novelData.official_site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl text-base md:text-lg font-bold text-center inline-flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-purple-600 transition w-full shadow-xl hover:scale-105"
                  >
                    Visit Website
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              )}

              {/* Languages */}
              {novelData.languages && Array.isArray(novelData.languages) && (
                <div>
                  <h3 className={`text-lg md:text-xl font-black mb-3 flex items-center gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <Globe className="w-5 h-5" />
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {novelData.languages.map((lang, idx) => (
                      <span key={idx} className="px-4 py-2 text-sm md:text-base font-bold rounded-xl bg-indigo-500/30 text-indigo-300 border-2 border-indigo-500/50 shadow-lg">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right - Info & Character Preview */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Information Grid */}
              <div>
                <h3 className={`text-lg md:text-xl font-black mb-4 flex items-center gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  <BookOpen className="w-5 h-5" />
                  Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {novelData.type && (
                    <div className={`p-4 md:p-5 rounded-2xl border-2 ${isDark ? 'bg-indigo-900/30 border-indigo-700/50' : 'bg-indigo-100 border-indigo-300'} hover:scale-105 transition-transform shadow-lg`}>
                      <p className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 font-semibold`}>Type</p>
                      <p className={`text-base md:text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>{novelData.type}</p>
                    </div>
                  )}
                  {novelData.publishers && (
                    <div className={`p-4 md:p-5 rounded-2xl border-2 ${isDark ? 'bg-indigo-900/30 border-indigo-700/50' : 'bg-indigo-100 border-indigo-300'} hover:scale-105 transition-transform shadow-lg`}>
                      <p className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 font-semibold`}>Publisher</p>
                      <p className={`text-base md:text-lg font-bold ${isDark ? 'text-white' : 'text-black'} line-clamp-1`}>
                        {Array.isArray(novelData.publishers) ? novelData.publishers[0] : novelData.publishers}
                      </p>
                    </div>
                  )}
                  {novelData.end_date && (
                    <div className={`p-4 md:p-5 rounded-2xl border-2 ${isDark ? 'bg-indigo-900/30 border-indigo-700/50' : 'bg-indigo-100 border-indigo-300'} hover:scale-105 transition-transform shadow-lg`}>
                      <p className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 font-semibold`}>Ended</p>
                      <p className={`text-base md:text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {new Date(novelData.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).replace(' ', ' ')}
                      </p>
                    </div>
                  )}
                  {novelData.wordcountperch && (
                    <div className={`p-4 md:p-5 rounded-2xl border-2 ${isDark ? 'bg-indigo-900/30 border-indigo-700/50' : 'bg-indigo-100 border-indigo-300'} hover:scale-105 transition-transform shadow-lg`}>
                      <p className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 font-semibold`}>Words/Ch</p>
                      <p className={`text-base md:text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>{(novelData.wordcountperch / 1000).toFixed(1)}k</p>
                    </div>
                  )}
                  {novelData.lastupdated_at && (
                    <div className={`p-4 md:p-5 rounded-2xl border-2 ${isDark ? 'bg-indigo-900/30 border-indigo-700/50' : 'bg-indigo-100 border-indigo-300'} hover:scale-105 transition-transform shadow-lg`}>
                      <p className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 font-semibold`}>Updated</p>
                      <p className={`text-base md:text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {new Date(novelData.lastupdated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                  {novelData.genre && Array.isArray(novelData.genre) && novelData.genre.length > 0 && (
                    <div className={`p-4 md:p-5 rounded-2xl border-2 ${isDark ? 'bg-indigo-900/30 border-indigo-700/50' : 'bg-indigo-100 border-indigo-300'} hover:scale-105 transition-transform shadow-lg`}>
                      <p className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 font-semibold`}>Genres</p>
                      <p className={`text-base md:text-lg font-bold ${isDark ? 'text-white' : 'text-black'} line-clamp-1`}>
                        {novelData.genre.slice(0, 2).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Characters */}
              {novelData.characters && Array.isArray(novelData.characters) && novelData.characters.length > 0 && (
                <div>
                  <h3 className={`text-lg md:text-xl font-black mb-4 flex items-center gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <User className="w-5 h-5" />
                    Main Characters
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                    {novelData.characters.map((char, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl text-center border-2 ${isDark ? 'bg-indigo-900/40 border-indigo-700/50' : 'bg-indigo-100 border-indigo-300'} hover:scale-105 transition-transform shadow-lg`}>
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-2 shadow-xl">
                          <User className="w-7 h-7 md:w-8 md:h-8 text-white" />
                        </div>
                        <p className={`text-sm md:text-base font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-700'} line-clamp-2`}>
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
            <div className={`mb-6 sm:mb-8 p-6 md:p-8 rounded-3xl border-2 ${isDark ? 'bg-yellow-950/30 border-yellow-500/50' : 'bg-yellow-50 border-yellow-300'} shadow-xl`}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className={`text-xl md:text-2xl font-black ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  Special Notes
                </h3>
              </div>
              <p className={`text-base md:text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'} ml-16`}>
                {novelData.special_notes}
              </p>
            </div>
          )}

          {/* Librarian's Notes */}
          {novelData.lib_talk && (
            <div className={`mb-6 sm:mb-8 p-6 md:p-8 rounded-3xl border-l-4 ${isDark ? 'bg-gradient-to-r from-indigo-950/50 to-purple-950/50 border-indigo-500' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-500'} shadow-xl`}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Feather className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className={`text-xl md:text-2xl font-black ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  Librarian's Note
                </h3>
              </div>
              <p className={`text-base md:text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'} ml-16`}>
                {novelData.lib_talk}
              </p>
            </div>
          )}

          {/* Media Adaptations */}
          {(relatedItems.anime || relatedItems.manga || relatedItems.manhwa) && (
            <div className="mb-6 sm:mb-8 md:mb-10">
              <h2 className={`${isDark ? 'text-white' : 'text-black'} text-2xl md:text-3xl font-black mb-6 flex items-center gap-3`}>
                <div className="w-2 h-10 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                Media Adaptations
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {relatedItems.anime && (
                  <RelatedCard item={relatedItems.anime} label="ANIME" bgClass="bg-purple-500/80" />
                )}
                {relatedItems.manga && (
                  <RelatedCard item={relatedItems.manga} label="MANGA" bgClass="bg-blue-500/80" />
                )}
                {relatedItems.manhwa && (
                  <RelatedCard item={relatedItems.manhwa} label="MANHWA" bgClass="bg-green-500/80" />
                )}
              </div>
            </div>
          )}

          {/* Series Navigation */}
          {(relatedItems.prequel.length > 0 || relatedItems.sequel.length > 0) && (
            <div className="space-y-8 md:space-y-10">
              {relatedItems.prequel.length > 0 && (
                <div>
                  <h2 className={`${isDark ? 'text-white' : 'text-black'} text-2xl md:text-3xl font-black mb-6 flex items-center gap-3`}>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl">
                      <ChevronUp className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    Before This Story
                  </h2>
                  <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 scrollbar-hide">
                    {relatedItems.prequel.map((item, idx) => (
                      <SmallRelatedCard key={idx} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {relatedItems.sequel.length > 0 && (
                <div>
                  <h2 className={`${isDark ? 'text-white' : 'text-black'} text-2xl md:text-3xl font-black mb-6 flex items-center gap-3`}>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl">
                      <ChevronDown className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    What Comes Next
                  </h2>
                  <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 scrollbar-hide">
                    {relatedItems.sequel.map((item, idx) => (
                      <SmallRelatedCard key={idx} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Side Stories */}
          {relatedItems.side_stories.length > 0 && (
            <div className="mb-6 sm:mb-8 md:mb-10">
              <h2 className={`${isDark ? 'text-white' : 'text-black'} text-2xl md:text-3xl font-black mb-6 flex items-center gap-3`}>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-xl">
                  <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                Side Stories
              </h2>
              <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 scrollbar-hide">
                {relatedItems.side_stories.map((item, idx) => (
                  <SmallRelatedCard key={idx} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Related Novels */}
          {relatedItems.related.length > 0 && (
            <div className="mb-6 sm:mb-8 md:mb-10">
              <h2 className={`${isDark ? 'text-white' : 'text-black'} text-2xl md:text-3xl font-black mb-6 flex items-center gap-3`}>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-xl">
                  <Layers2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                Related Novels
              </h2>
              <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 scrollbar-hide">
                {relatedItems.related.map((item, idx) => (
                  <SmallRelatedCard key={idx} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Other Adaptations */}
          {relatedItems.adaptations.length > 0 && (
            <div className="mb-6 sm:mb-8 md:mb-10">
              <h2 className={`${isDark ? 'text-white' : 'text-black'} text-2xl md:text-3xl font-black mb-6 flex items-center gap-3`}>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center shadow-xl">
                  <Film className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                Other Adaptations
              </h2>
              <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 scrollbar-hide">
                {relatedItems.adaptations.map((item, idx) => (
                  <SmallRelatedCard key={idx} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Contributors Section */}
          {novelData.contributors && Array.isArray(novelData.contributors) && novelData.contributors.length > 0 && (
            <div className={`${isDark ? 'border-indigo-700/50' : 'border-indigo-300'} mt-12 md:mt-16 pt-10 md:pt-12 border-t-2`}>
              <h2 className={`${isDark ? 'text-white' : 'text-black'} text-2xl md:text-3xl font-black mb-6 md:mb-8`}>
                Contributed By
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6">
                {novelData.contributors.map((contributor, idx) => {
                  const contributorData = contributorsData.find(c => c.username === contributor);
                  return (
                    <div
                      key={idx}
                      className={`p-4 md:p-5 rounded-2xl text-center cursor-pointer hover:scale-105 transition-all duration-300 border-2 ${
                        isDark
                          ? 'bg-indigo-900/40 border-indigo-700/50 hover:border-indigo-500 hover:bg-indigo-900/60'
                          : 'bg-indigo-100 border-indigo-300 hover:border-indigo-400 hover:bg-indigo-200'
                      } shadow-lg hover:shadow-xl`}
                      onClick={() => {
                        if (contributorData?.user_id) {
                          setSelectedUserId(contributorData.user_id);
                          setShowUserProfile(true);
                        }
                      }}
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden mx-auto mb-3 shadow-lg ring-2 ring-white/20">
                        {contributorData?.profile_pic ? (
                          <img
                            src={contributorData.profile_pic}
                            alt={contributor}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class=\"w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"text-white\"><path d=\"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/></svg></div>';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <User className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                          </div>
                        )}
                      </div>
                      <p className={`${isDark ? 'text-indigo-300' : 'text-indigo-700'} text-sm md:text-base font-bold line-clamp-2`}>
                        {contributor}
                      </p>
                    </div>
                  );
                })}
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

      {/* Similar To Section - Before Reviews */}
      {similarItems.length > 0 && (
        <div className={`mt-10 md:mt-12 px-4 md:px-8`}>
          <div className="max-w-7xl mx-auto">
            <h2 className={`${isDark ? 'text-white' : 'text-black'} text-2xl md:text-3xl font-black mb-6 flex items-center gap-3`}>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-xl">
                <Layers2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              Similar To
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {similarItems.slice(0, showAllSimilar ? similarItems.length : 5).map((item, idx) => (
                <Link key={idx} href={`/details/${item.uid}`} className="group">
                  <div className="overflow-hidden rounded-2xl hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl">
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-full h-56 sm:h-64 md:h-72 object-cover group-hover:brightness-110 transition-all"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/300x450?text=No+Image')}
                    />
                    <div className={`${isDark ? 'bg-indigo-900/50 backdrop-blur-sm' : 'bg-indigo-100'} p-3 md:p-4`}>
                      <p className={`${isDark ? 'text-white' : 'text-black'} text-sm md:text-base font-bold line-clamp-2`}>
                        {item.title}
                      </p>
                      {item.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className={`text-xs md:text-sm font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                            {item.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {similarItems.length > 5 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowAllSimilar(!showAllSimilar)}
                  className={`px-6 py-3 rounded-2xl text-base font-bold transition-all hover:scale-105 flex items-center gap-2 ${
                    isDark
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white'
                      : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white'
                  } shadow-lg`}
                >
                  {showAllSimilar ? (
                    <>
                      <ChevronUp className="w-5 h-5" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      Show {similarItems.length - 5} More
                    </>
                  )}
                </button>
              </div>
            )}
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