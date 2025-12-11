'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star, BookOpen, Calendar, Users, TrendingUp, Heart, Bookmark, Share2, ChevronDown, ChevronUp, Award, Sparkles, Globe, Flame, AlertCircle, Crown, MessageSquare, User, ArrowLeft, Volume2, PenTool, Building2, Zap, Radio, Image, Type, BookMarked, Link as LinkIcon, Lightbulb, MessageCircle, Clock, Eye, ThumbsUp, Tv, Film, X} from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { getJsonFile } from '@/lib/pages';
import html2canvas from 'html2canvas';
import ReviewSection from '../ReviewSection';
import List from '@/components/List';

export default function ManhwaUI({ isDark = true }) {
  const { uid } = useParams();
  const router = useRouter();
  
  // State
  const [manhwaData, setManhwaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [relatedItems, setRelatedItems] = useState({
    anime: null,
    novel: null,
    prequel: [],
    sequel: [],
    spinoffs: [],
    sideStories: [],
    related: [],
    adaptations: []
  });
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showContentWarning, setShowContentWarning] = useState(false);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => async () =>{
    const getCurrentUser = async () => {
      const { data: {user}} = await supabase.auth.getUser();
      if(user){
        setUserId(user.id);
        await loadUserData(user.id);
      }
    };
    getCurrentUser();
  },[]);

  // Fetch manhwa data with all related items
  useEffect(() => {
    const fetchManhwaData = async () => {
      if (!uid) return;
      
      try {
        setLoading(true);
        const result = await getJsonFile(uid);
        
        if (result?.item) {
          setManhwaData(result.item);
          
          // Fetch anime/novel adaptations
          if (result.item.ani_novel_uid) {
            const uids = result.item.ani_novel_uid.split(',').map(u => u.trim());
            const relatedData = {};
            
            for (const relatedUid of uids) {
              const relatedResult = await getJsonFile(relatedUid);
              const lastChar = relatedUid.slice(-1).toUpperCase();
              
              if (lastChar === 'A') relatedData.anime = relatedResult?.item;
              if (lastChar === 'W') relatedData.novel = relatedResult?.item;
            }
            
            setRelatedItems(prev => ({ ...prev, ...relatedData }));
          }

          // Fetch other adaptations
          if (result.item.adaptations && Array.isArray(result.item.adaptations)) {
            const adaptationResults = await Promise.all(
              result.item.adaptations.map(id => getJsonFile(id))
            );
            setRelatedItems(prev => ({ ...prev, adaptations: adaptationResults.map(r => r?.item).filter(Boolean) }));
          }
          
          // Fetch prequel
          if (result.item.prequel) {
            const prequels = Array.isArray(result.item.prequel) ? result.item.prequel : [result.item.prequel];
            const prequelResults = await Promise.all(prequels.map(id => getJsonFile(id)));
            setRelatedItems(prev => ({ ...prev, prequel: prequelResults.map(r => r?.item).filter(Boolean) }));
          }

          // Fetch sequel
          if (result.item.sequel) {
            const sequels = Array.isArray(result.item.sequel) ? result.item.sequel : [result.item.sequel];
            const sequelResults = await Promise.all(sequels.map(id => getJsonFile(id)));
            setRelatedItems(prev => ({ ...prev, sequel: sequelResults.map(r => r?.item).filter(Boolean) }));
          }

          // Fetch spinoffs
          if (result.item.spin_offs && Array.isArray(result.item.spin_offs)) {
            const spinoffResults = await Promise.all(
              result.item.spin_offs.map(id => getJsonFile(id))
            );
            setRelatedItems(prev => ({ ...prev, spinoffs: spinoffResults.map(r => r?.item).filter(Boolean) }));
          }

          // Fetch side stories
          if (result.item.side_stories && Array.isArray(result.item.side_stories)) {
            const sideStoryResults = await Promise.all(
              result.item.side_stories.map(id => getJsonFile(id))
            );
            setRelatedItems(prev => ({ ...prev, sideStories: sideStoryResults.map(r => r?.item).filter(Boolean) }));
          }

          // Fetch related
          if (result.item.related && Array.isArray(result.item.related)) {
            const relatedResults = await Promise.all(
              result.item.related.map(id => getJsonFile(id))
            );
            setRelatedItems(prev => ({ ...prev, related: relatedResults.map(r => r?.item).filter(Boolean) }));
          }
        } else {
          router.push('/404');
        }
      } catch (error) {
        console.error('Error fetching manhwa:', error);
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchManhwaData();
  }, [uid, router]);

  // Check favorite/bookmark status
  useEffect(() => {
  if (!currentUser || !manhwaData) return;

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
}, [currentUser, uid, manhwaData]);

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} flex items-center justify-center`}>
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-spin"></div>
          <div className={`absolute inset-2 ${isDark ? 'bg-black' : 'bg-white'} rounded-full flex items-center justify-center`}>
            <BookOpen className="w-8 h-8 text-purple-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!manhwaData) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} flex items-center justify-center`}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Manhwa Not Found</h2>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>This manhwa doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'}`}>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="fixed top-5 left-4 z-30 bg-purple-600 hover:bg-purple-700 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all hover:scale-110"
      >
        <ArrowLeft className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>

      {/* Hero Section */}
      <div className="relative h-[35vh] sm:h-[45vh] lg:h-[60vh] overflow-hidden">
        <img
          src={manhwaData.banner || manhwaData.poster}
          alt={manhwaData.title}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black via-black/70 to-transparent' : 'from-white via-white/70 to-transparent'}`}></div>
        
        {/* Floating Stats */}
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 flex gap-2">
          {manhwaData.rating && (
            <div className="bg-yellow-500 text-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-black" />
              {manhwaData.rating}
            </div>
          )}
          {manhwaData.popularity && (
            <div className="bg-purple-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1">
              <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">#{manhwaData.popularity.rank || 'N/A'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 -mt-20 sm:-mt-24 lg:-mt-28 relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Poster Column */}
          <div className="lg:w-1/4 flex justify-center lg:justify-start">
            <div className="w-full max-w-[180px] sm:max-w-[220px] lg:max-w-none">
              {/* Poster */}
              <div className="relative group mb-4">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition"></div>
                <img
                  src={manhwaData.poster}
                  alt={manhwaData.title}
                  className="relative w-full aspect-[2/3] object-cover rounded-xl shadow-2xl"
                />
              </div>

              {/* Action Buttons - Redesigned */}
              <div className="space-y-2">
                <button
                  onClick={async () => {
  if (!currentUser) {
    alert('Please login first');
    return;
  }
  try {
    const { data: userData } = await supabase
      .from('user_data')
      .select('favourites')
      .eq('user_id', currentUser.id)
      .single();

    let favourites = userData?.favourites ? userData.favourites.split(',').map(f => f.trim()) : [];

    if (isFavorite) {
      favourites = favourites.filter(f => f !== uid);
    } else {
      favourites.push(uid);
    }

    await supabase.from('user_data').upsert(
      { user_id: currentUser.id, favourites: favourites.join(', ') },
      { onConflict: 'user_id' }
    );

    setIsFavorite(!isFavorite);
  } catch (error) {
    console.error('Error:', error);
  }
}}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all hover:scale-105 ${
                    isFavorite
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30'
                      : `${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' : 'bg-gray-200 hover:bg-gray-300 text-black border border-gray-300'}`
                  }`}
                >
                  <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
                  <span className="hidden sm:inline">{isFavorite ? 'Favorited' : 'Favorite'}</span>
                  <span className="sm:hidden">Favorite</span>
                </button>

                <button
                  onClick={async () => {
  if (!currentUser) {
    alert('Please login first');
    return;
  }
  try {
    const { data: userData } = await supabase
      .from('user_data')
      .select('bookmarks')
      .eq('user_id', currentUser.id)
      .single();

    let bookmarks = userData?.bookmarks ? userData.bookmarks.split(',').map(b => b.trim()) : [];

    if (isBookmarked) {
      bookmarks = bookmarks.filter(b => b !== uid);
    } else {
      bookmarks.push(uid);
    }

    await supabase.from('user_data').upsert(
      { user_id: currentUser.id, bookmarks: bookmarks.join(', ') },
      { onConflict: 'user_id' }
    );

    setIsBookmarked(!isBookmarked);
  } catch (error) {
    console.error('Error:', error);
  }
}}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all hover:scale-105 ${
                    isBookmarked
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                      : `${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' : 'bg-gray-200 hover:bg-gray-300 text-black border border-gray-300'}`
                  }`}
                >
                  <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                  {isBookmarked ? 'Saved' : 'Bookmark'}
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all hover:scale-105 ${
                    isDark ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>

              {/* Info Box - Hidden on mobile */}
              <div className={`hidden md:block mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <h3 className={`font-bold mb-2 text-sm ${isDark ? 'text-white' : 'text-black'}`}>Information</h3>
                <div className="space-y-1.5 text-xs">
                  {manhwaData.type && (
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Type:</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{manhwaData.type}</span>
                    </div>
                  )}
                  {manhwaData.status && (
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Status:</span>
                      <span className={`font-semibold ${manhwaData.status === 'Ongoing' ? 'text-green-500' : 'text-blue-500'}`}>
                        {manhwaData.status}
                      </span>
                    </div>
                  )}
                  {manhwaData.chapters && (
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Chapters:</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{manhwaData.chapters}</span>
                    </div>
                  )}
                  {manhwaData.demographic && (
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Target:</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{manhwaData.demographic}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Franchise Badge */}
              {manhwaData.franchise && (
                <div className={`mt-3 p-2 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-3 h-3 text-purple-500" />
                    <span className={`text-xs font-semibold ${isDark ? 'text-purple-300' : 'text-purple-700'} line-clamp-1`}>
                      {manhwaData.franchise}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Column */}
          <div className="lg:w-3/4">
            {/* Title Section */}
            <div className="mb-4">
              <h1 className={`text-xl sm:text-2xl lg:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                {manhwaData.title}
              </h1>
              
              {manhwaData.kr_name && (
                <p className={`text-sm sm:text-base lg:text-lg mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {manhwaData.kr_name}
                </p>
              )}

              {manhwaData.alt_names && Array.isArray(manhwaData.alt_names) && manhwaData.alt_names.length > 0 && (
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} line-clamp-1`}>
                  Also: {manhwaData.alt_names.join(', ')}
                </p>
              )}
            </div>

            {/* Genre Tags */}
            {manhwaData.genre && Array.isArray(manhwaData.genre) && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {manhwaData.main_gen && (
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    ⭐ {manhwaData.main_gen}
                  </span>
                )}
                {manhwaData.genre.slice(0, 5).map((genre, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {genre}
                  </span>
                ))}
                {manhwaData.genre.length > 5 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                    +{manhwaData.genre.length - 5}
                  </span>
                )}
              </div>
            )}

            {/* Stats Grid - 2 columns mobile, 4 desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
              {manhwaData.start_date && (
                <div className={`p-2 sm:p-3 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <Calendar className="w-3 h-3 text-green-500" />
                    <span className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Started</span>
                  </div>
                  <p className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    {new Date(manhwaData.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </p>
                </div>
              )}

              {manhwaData.chapters && (
                <div className={`p-2 sm:p-3 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <BookOpen className="w-3 h-3 text-blue-500" />
                    <span className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Chapters</span>
                  </div>
                  <p className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{manhwaData.chapters}</p>
                </div>
              )}

              {manhwaData.rating && (
                <div className={`p-2 sm:p-3 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Rating</span>
                  </div>
                  <p className={`text-xs sm:text-sm font-bold text-yellow-500`}>{manhwaData.rating}/10</p>
                </div>
              )}

              {manhwaData.status && (
                <div className={`p-2 sm:p-3 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <Clock className="w-3 h-3 text-purple-500" />
                    <span className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status</span>
                  </div>
                  <p className={`text-xs sm:text-sm font-bold ${manhwaData.status === 'Ongoing' ? 'text-green-500' : 'text-blue-500'}`}>
                    {manhwaData.status}
                  </p>
                </div>
              )}
            </div>

            {/* Content Warning */}
            {manhwaData.content_warn && (
              <div className={`mb-4 p-3 sm:p-4 rounded-lg ${isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                <button
                  onClick={() => setShowContentWarning(!showContentWarning)}
                  className="flex items-center gap-2 w-full"
                >
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                  <span className={`text-xs sm:text-sm font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    Content Warning
                  </span>
                  <ChevronDown className={`w-4 h-4 ml-auto text-red-500 transition-transform ${showContentWarning ? 'rotate-180' : ''}`} />
                </button>
                {showContentWarning && (
                  <div className={`mt-3 pt-3 border-t ${isDark ? 'border-red-500/20' : 'border-red-500/20'}`}>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                      {Array.isArray(manhwaData.content_warn) 
                        ? manhwaData.content_warn.join(', ') 
                        : manhwaData.content_warn}
                    </p>
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
            <div className="mb-4 mt-3">
              <h2 className={`text-base sm:text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                Synopsis
              </h2>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {showFullSynopsis 
                    ? manhwaData.synopsis?.replace(/\*\*\*/g, ' ') 
                    : `${manhwaData.synopsis?.replace(/\*\*\*/g, ' ').substring(0, 250)}...`}
                </p>
                {manhwaData.synopsis && manhwaData.synopsis.length > 250 && (
                  <button
                    onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                    className="text-purple-500 hover:text-purple-400 font-bold mt-2 flex items-center gap-1 text-xs sm:text-sm"
                  >
                    {showFullSynopsis ? 'Show less' : 'Read more'}
                    {showFullSynopsis ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>

            {/* Platform & Studio - Single Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {manhwaData.platform && (
                <div>
                  <h3 className={`text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Platform</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(manhwaData.platform) ? manhwaData.platform : [manhwaData.platform]).slice(0, 2).map((platform, idx) => (
                      <div
                        key={idx}
                        className="px-2 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded text-xs font-semibold flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        {platform}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {manhwaData.studio && (
                <div>
                  <h3 className={`text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Studio</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(manhwaData.studio) ? manhwaData.studio : [manhwaData.studio]).slice(0, 2).map((studio, idx) => (
                      <div
                        key={idx}
                        className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                          isDark ? 'bg-gray-800 text-purple-400' : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        <Building2 className="w-3 h-3" />
                        {studio}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-100'} mt-4`}>
              <div className="flex border-b overflow-x-auto scrollbar-hide">
                {['overview', 'characters', 'staff', 'relations'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`flex-shrink-0 py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-bold transition capitalize whitespace-nowrap ${
                      selectedTab === tab
                        ? 'border-b-2 border-purple-600 text-purple-600'
                        : `${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className={`p-3 sm:p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                {selectedTab === 'overview' && (
                  <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                    {manhwaData.authors && (
                      <div>
                        <p className={`font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Authors</p>
                        <p className={isDark ? 'text-white' : 'text-black'}>
                          {Array.isArray(manhwaData.authors) ? manhwaData.authors.join(', ') : manhwaData.authors}
                        </p>
                      </div>
                    )}
                    {manhwaData.artists && (
                      <div>
                        <p className={`font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Artists</p>
                        <p className={isDark ? 'text-white' : 'text-black'}>
                          {Array.isArray(manhwaData.artists) ? manhwaData.artists.join(', ') : manhwaData.artists}
                        </p>
                      </div>
                    )}
                    {manhwaData.publishers && (
                      <div>
                        <p className={`font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Publishers</p>
                        <p className={isDark ? 'text-white' : 'text-black'}>
                          {Array.isArray(manhwaData.publishers) ? manhwaData.publishers.join(', ') : manhwaData.publishers}
                        </p>
                      </div>
                    )}
                    {manhwaData.demographic && (
                      <div>
                        <p className={`font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Demographic</p>
                        <p className={isDark ? 'text-white' : 'text-black'}>{manhwaData.demographic}</p>
                      </div>
                    )}
                    {manhwaData.eng_transl_upto && (
                      <div>
                        <p className={`font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Eng. Translation</p>
                        <p className={isDark ? 'text-white' : 'text-black'}>Ch. {manhwaData.eng_transl_upto}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === 'characters' && (
                  <div>
                    {manhwaData.characters && Array.isArray(manhwaData.characters) && manhwaData.characters.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {manhwaData.characters.slice(0, 6).map((char, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                          >
                            <div className="flex items-center gap-2">
                              <User className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                              <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-black'} line-clamp-1`}>
                                {typeof char === 'string' ? char : char.name || 'Unknown'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-center py-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        No characters listed
                      </p>
                    )}
                  </div>
                )}

                {selectedTab === 'staff' && (
                  <div className="space-y-3">
                    {manhwaData.authors && (
                      <div>
                        <h4 className={`font-bold text-sm mb-2 flex items-center gap-1 ${isDark ? 'text-white' : 'text-black'}`}>
                          <PenTool className="w-4 h-4 text-purple-500" />
                          Authors
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(manhwaData.authors) ? manhwaData.authors : [manhwaData.authors]).map((author, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-semibold">
                              {author}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {manhwaData.artists && (
                      <div>
                        <h4 className={`font-bold text-sm mb-2 flex items-center gap-1 ${isDark ? 'text-white' : 'text-black'}`}>
                          <Image className="w-4 h-4 text-cyan-500" />
                          Artists
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(manhwaData.artists) ? manhwaData.artists : [manhwaData.artists]).map((artist, idx) => (
                            <span key={idx} className="px-2 py-1 bg-cyan-600 text-white rounded text-xs font-semibold">
                              {artist}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === 'relations' && (
                  <div className="space-y-3">
                    {(relatedItems.anime || relatedItems.novel) && (
                      <div>
                        <h4 className={`font-bold text-sm mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Adaptations</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {relatedItems.anime && (
                            <Link href={`/details/${relatedItems.anime.uid}`}>
                              <div className={`p-2 rounded-lg cursor-pointer transition hover:scale-105 ${isDark ? 'bg-gray-800' : 'bg-white border'}`}>
                                <img src={relatedItems.anime.poster} alt={relatedItems.anime.title} className="w-full h-24 object-cover rounded mb-1" />
                                <p className={`font-semibold text-xs ${isDark ? 'text-white' : 'text-black'} line-clamp-1`}>{relatedItems.anime.title}</p>
                                <p className="text-[10px] text-purple-500">Anime</p>
                              </div>
                            </Link>
                          )}
                          {relatedItems.novel && (
                            <Link href={`/details/${relatedItems.novel.uid}`}>
                              <div className={`p-2 rounded-lg cursor-pointer transition hover:scale-105 ${isDark ? 'bg-gray-800' : 'bg-white border'}`}>
                                <img src={relatedItems.novel.poster} alt={relatedItems.novel.title} className="w-full h-24 object-cover rounded mb-1" />
                                <p className={`font-semibold text-xs ${isDark ? 'text-white' : 'text-black'} line-clamp-1`}>{relatedItems.novel.title}</p>
                                <p className="text-[10px] text-cyan-500">Novel</p>
                              </div>
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Librarian's Notes Section (like AnimeUI) */}
      {manhwaData.lib_talks && (
        <div className={`py-6 ${isDark ? 'bg-gray-900/50' : 'bg-gray-100/50'}`}>
          <div className="container mx-auto px-3 sm:px-4">
            <div className={`rounded-lg p-4 sm:p-6 ${isDark ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-cyan-500/10 border border-cyan-500/30'}`}>
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Librarian's Notes</h3>
              </div>
              <div className={`p-3 sm:p-4 rounded-lg ${isDark ? 'bg-cyan-500/10 border-l-4 border-cyan-500' : 'bg-cyan-500/10 border-l-4 border-cyan-500'}`}>
                <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-cyan-100' : 'text-cyan-900'}`}>
                  {manhwaData.lib_talks}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Related Works Sections */}
      {(relatedItems.prequel.length > 0 || relatedItems.sequel.length > 0 || relatedItems.spinoffs.length > 0) && (
        <div className={`py-6 ${isDark ? 'bg-black' : 'bg-white'}`}>
          <div className="container mx-auto px-3 sm:px-4">
            {relatedItems.prequel.length > 0 && (
              <div className="mb-6">
                <h2 className={`text-base sm:text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>Prequel</h2>
                <div className="flex overflow-x-auto gap-2 pb-2">
                  {relatedItems.prequel.map((item, idx) => (
                    <Link key={idx} href={`/details/${item.uid}`}>
                      <div className="flex-shrink-0 w-28 sm:w-32">
                        <img src={item.poster} alt={item.title} className="w-full h-36 sm:h-40 object-cover rounded-lg mb-1" />
                        <p className={`text-xs font-bold text-center line-clamp-2 ${isDark ? 'text-white' : 'text-black'}`}>{item.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {relatedItems.sequel.length > 0 && (
              <div className="mb-6">
                <h2 className={`text-base sm:text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>Sequel</h2>
                <div className="flex overflow-x-auto gap-2 pb-2">
                  {relatedItems.sequel.map((item, idx) => (
                    <Link key={idx} href={`/details/${item.uid}`}>
                      <div className="flex-shrink-0 w-28 sm:w-32">
                        <img src={item.poster} alt={item.title} className="w-full h-36 sm:h-40 object-cover rounded-lg mb-1" />
                        <p className={`text-xs font-bold text-center line-clamp-2 ${isDark ? 'text-white' : 'text-black'}`}>{item.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {relatedItems.spinoffs.length > 0 && (
              <div>
                <h2 className={`text-base sm:text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>Spin-offs</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {relatedItems.spinoffs.map((item, idx) => (
                    <Link key={idx} href={`/details/${item.uid}`}>
                      <div>
                        <img src={item.poster} alt={item.title} className="w-full h-32 sm:h-36 object-cover rounded-lg mb-1" />
                        <p className={`text-[10px] sm:text-xs font-bold text-center line-clamp-2 ${isDark ? 'text-white' : 'text-black'}`}>{item.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contributors */}
      {manhwaData.contributors && Array.isArray(manhwaData.contributors) && manhwaData.contributors.length > 0 && (
        <div className={`py-6 ${isDark ? 'bg-gray-900/50' : 'bg-gray-100/50'}`}>
          <div className="container mx-auto px-3 sm:px-4">
            <h2 className={`text-base sm:text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>Contributors</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {manhwaData.contributors.map((contributor, idx) => (
                <div key={idx} className={`p-2 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <User className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                  <p className={`text-[10px] font-bold ${isDark ? 'text-white' : 'text-black'} line-clamp-1`}>{contributor}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 max-w-sm w-full ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>Share</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href);
                  alert('Link copied!');
                  setShowShareModal(false);
                }}
                className="w-full p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition text-sm"
              >
                Copy Link
              </button>
              <button
                onClick={async () => {
                  const element = document.querySelector('[id="poster"]');
                  if (element) {
                    const canvas = await html2canvas(element);
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL();
                    link.download = `${manhwaData.title}.png`;
                    link.click();
                  }
                  setShowShareModal(false);
                }}
                className="w-full p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition text-sm"
              >
                Download Image
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={`mt-6 p=4 mb-6`}>    
                  <ReviewSection 
    isDark={isDark} 
    uid={uid} 
    category="manhwa" 
    currentUser={currentUser}
    onReviewUpdated={() => {
      // Refresh anime data when reviews change
      const fetchmanhwaData = async () => {
        const { data, error } = await supabase
          .from('Manhwa_data')
          .select('rating, review_count')
          .eq('uid', uid)
          .single();
        
        if (!error && data) {
          setManhwaData(prev => ({
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