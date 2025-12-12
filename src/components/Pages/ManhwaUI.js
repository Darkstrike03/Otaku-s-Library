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
import {useTheme} from '../../app/contexts/ThemeContext';
import UserProfile from '@/components/UserProfile';

export default function ManhwaUI() {
  const { isDark } = useTheme();
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
  const [contributors, setContributors] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);

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

  // Fetch contributors data from user_data
  useEffect(() => {
    const fetchContributors = async () => {
      if (!manhwaData?.contributors || !Array.isArray(manhwaData.contributors)) return;
      
      try {
        const contributorData = await Promise.all(
          manhwaData.contributors.map(async (username) => {
            const { data, error } = await supabase
              .from('user_data')
              .select('user_id, username, displayname, profile_pic')
              .eq('username', username)
              .single();
            
            if (error || !data) {
              return { username, displayname: username, profile_pic: null, user_id: null };
            }
            
            return data;
          })
        );
        
        setContributors(contributorData);
      } catch (error) {
        console.error('Error fetching contributors:', error);
      }
    };
    
    fetchContributors();
  }, [manhwaData]);

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
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Back Button - One UI Style */}
      <button
        onClick={() => router.back()}
        className={`fixed top-4 sm:top-6 left-4 sm:left-6 lg:left-8 z-30 ${isDark ? 'bg-white/10 backdrop-blur-xl border border-white/20' : 'bg-black/5 backdrop-blur-xl border border-black/10'} p-3 sm:p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95`}
      >
        <ArrowLeft className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-white' : 'text-black'}`} />
      </button>

      {/* Hero Section - Minimalist & Clean */}
      <div className="relative h-[60vh] sm:h-[55vh] md:h-[50vh] overflow-hidden isolate">
        <img
          src={manhwaData.banner || manhwaData.poster}
          alt={manhwaData.title}
          className="w-full h-full object-cover"
          style={{ transform: 'translateZ(0)' }}
        />
        <div 
          className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-black/20 via-black/60 to-black' : 'bg-gradient-to-b from-white/20 via-white/60 to-gray-50'}`}
          style={{ transform: 'translateZ(0)' }}
        ></div>
        
        {/* Title on Banner - Mobile Only for Impact */}
        <div className="absolute bottom-16 left-4 right-4 sm:hidden z-10">
          <h1 className={`text-3xl font-black mb-2 leading-tight ${isDark ? 'text-white drop-shadow-2xl' : 'text-white drop-shadow-2xl'}`}
            style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)' }}
          >
            {manhwaData.title}
          </h1>
          {manhwaData.kr_name && (
            <p className="text-base text-white/90 font-medium"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}
            >
              {manhwaData.kr_name}
            </p>
          )}
        </div>
        
        {/* Clean Floating Stats */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 flex flex-wrap gap-2 sm:gap-3 z-10">
          {manhwaData.rating && (
            <div 
              className="bg-yellow-400 text-black px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-black flex items-center gap-1.5 sm:gap-2 shadow-lg"
              style={{ opacity: 0.95 }}
            >
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
              <span className="text-base sm:text-lg">{manhwaData.rating}</span>
            </div>
          )}
          {manhwaData.popularity && (
            <div 
              className="bg-purple-500 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-black flex items-center gap-1.5 sm:gap-2 shadow-lg"
              style={{ opacity: 0.95 }}
            >
              <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-base sm:text-lg">#{manhwaData.popularity.rank || 'N/A'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - One UI Layout (Content at bottom for thumb reach) */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-[1400px]">
        {/* Title Section - Large & Bold (Hidden on Mobile, shown on tablet+) */}
        <div className="hidden sm:block mb-8 sm:mb-10 lg:mb-12">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-black mb-3 sm:mb-4 leading-tight ${isDark ? 'text-white' : 'text-black'}`}>
            {manhwaData.title}
          </h1>
          
          {manhwaData.kr_name && (
            <p className={`text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {manhwaData.kr_name}
            </p>
          )}

          {manhwaData.alt_names && Array.isArray(manhwaData.alt_names) && manhwaData.alt_names.length > 0 && (
            <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {manhwaData.alt_names.join(' • ')}
            </p>
          )}
        </div>

        {/* Alt names only for mobile (title is on banner) */}
        {manhwaData.alt_names && Array.isArray(manhwaData.alt_names) && manhwaData.alt_names.length > 0 && (
          <div className="sm:hidden mb-6">
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {manhwaData.alt_names.join(' • ')}
            </p>
          </div>
        )}

        {/* Poster & Quick Actions - Card Style */}
        <div className="grid lg:grid-cols-12 xl:grid-cols-10 gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
          {/* Poster Card */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 backdrop-blur-xl shadow-xl`}>
              {/* Poster Image */}
              <div className="relative group mb-4 sm:mb-5 lg:mb-6 overflow-hidden rounded-xl sm:rounded-2xl">
                <img
                  src={manhwaData.poster}
                  alt={manhwaData.title}
                  className="w-full aspect-[2/3] object-cover"
                />
              </div>

              {/* Action Buttons - Clean & Spaced */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-5 lg:mb-6">
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
                  className={`w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all active:scale-95 ${
                    isFavorite
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30'
                      : `${isDark ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20' : 'bg-gray-100 hover:bg-gray-200 text-black border border-gray-200'}`
                  }`}
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" fill={isFavorite ? 'currentColor' : 'none'} />
                  <span>{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
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
                  className={`w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all active:scale-95 ${
                    isBookmarked
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                      : `${isDark ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20' : 'bg-gray-100 hover:bg-gray-200 text-black border border-gray-200'}`
                  }`}
                >
                  <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
                  <span className="hidden sm:inline">{isBookmarked ? 'Bookmarked' : 'Add to Reading List'}</span>
                  <span className="sm:hidden">{isBookmarked ? 'Saved' : 'Bookmark'}</span>
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className={`w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all active:scale-95 ${
                    isDark ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  }`}
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Share
                </button>
              </div>

              {/* Info Section - Cleaner */}
              <div className={`${isDark ? 'bg-white/5' : 'bg-gray-50'} rounded-xl sm:rounded-2xl p-4 sm:p-5`}>
                <h3 className={`font-black mb-3 sm:mb-4 text-base sm:text-lg ${isDark ? 'text-white' : 'text-black'}`}>Details</h3>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  {manhwaData.type && (
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Type</span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{manhwaData.type}</span>
                    </div>
                  )}
                  {manhwaData.status && (
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Status</span>
                      <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                        manhwaData.status === 'Ongoing' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {manhwaData.status}
                      </span>
                    </div>
                  )}
                  {manhwaData.chapters && (
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Chapters</span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{manhwaData.chapters}</span>
                    </div>
                  )}
                  {manhwaData.demographic && (
                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Demographic</span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{manhwaData.demographic}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Franchise Badge */}
              {manhwaData.franchise && (
                <div className={`mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl ${isDark ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'}`}>
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                    <span className={`text-xs sm:text-sm font-bold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                      {manhwaData.franchise}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Column */}
          <div className="lg:col-span-8 xl:col-span-7 space-y-6 sm:space-y-8">
            {/* Genre Tags - Pill Style */}
            {manhwaData.genre && Array.isArray(manhwaData.genre) && (
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {manhwaData.main_gen && (
                  <span className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-black bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30">
                    {manhwaData.main_gen}
                  </span>
                )}
                {manhwaData.genre.slice(0, 6).map((genre, idx) => (
                  <span
                    key={idx}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${
                      isDark ? 'bg-white/10 text-white border border-white/20' : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    {genre}
                  </span>
                ))}
                {manhwaData.genre.length > 6 && (
                  <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${isDark ? 'bg-white/5 text-gray-400 border border-white/10' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                    +{manhwaData.genre.length - 6} more
                  </span>
                )}
              </div>
            )}

            {/* Stats Cards - Grid Layout */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {manhwaData.start_date && (
                <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5`}>
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mb-2 sm:mb-3" />
                  <p className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Started</p>
                  <p className={`text-sm sm:text-base lg:text-lg font-black ${isDark ? 'text-white' : 'text-black'}`}>
                    {new Date(manhwaData.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </p>
                </div>
              )}

              {manhwaData.chapters && (
                <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5`}>
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mb-2 sm:mb-3" />
                  <p className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Chapters</p>
                  <p className={`text-sm sm:text-base lg:text-lg font-black ${isDark ? 'text-white' : 'text-black'}`}>{manhwaData.chapters}</p>
                </div>
              )}

              {manhwaData.rating && (
                <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5`}>
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mb-2 sm:mb-3" />
                  <p className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Rating</p>
                  <p className="text-sm sm:text-base lg:text-lg font-black text-yellow-500">{manhwaData.rating}<span className="text-xs sm:text-sm">/10</span></p>
                </div>
              )}

              {manhwaData.status && (
                <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5`}>
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mb-2 sm:mb-3" />
                  <p className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Status</p>
                  <p className={`text-sm sm:text-base lg:text-lg font-black ${manhwaData.status === 'Ongoing' ? 'text-green-500' : 'text-blue-500'}`}>
                    {manhwaData.status}
                  </p>
                </div>
              )}
            </div>

            {/* Content Warning - Clean Alert */}
            {manhwaData.content_warn && (
              <div className={`${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'} border rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6`}>
                <button
                  onClick={() => setShowContentWarning(!showContentWarning)}
                  className="flex items-center gap-2 sm:gap-3 w-full"
                >
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                  <span className={`text-sm sm:text-base font-black ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    Content Warning
                  </span>
                  <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 ml-auto text-red-500 transition-transform ${showContentWarning ? 'rotate-180' : ''}`} />
                </button>
                {showContentWarning && (
                  <div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t ${isDark ? 'border-red-500/20' : 'border-red-200'}`}>
                    <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                      {Array.isArray(manhwaData.content_warn) 
                        ? manhwaData.content_warn.join(', ') 
                        : manhwaData.content_warn}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* My List Card */}
            <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6`}>
              <h3 className={`text-lg sm:text-xl font-black mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 ${isDark ? 'text-white' : 'text-black'}`}>
                <BookMarked className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                <span className="hidden sm:inline">My Reading List</span>
                <span className="sm:hidden">My List</span>
              </h3>
              <List
                uid={uid}
                contentType="manhwa"
                currentUser={currentUser}
                isDark={isDark}
              />
            </div>

            {/* Synopsis Card - Large & Readable */}
            <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6`}>
              <h2 className={`text-xl sm:text-2xl font-black mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                Synopsis
              </h2>
              <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {showFullSynopsis 
                  ? manhwaData.synopsis?.replace(/\*\*\*/g, ' ') 
                  : `${manhwaData.synopsis?.replace(/\*\*\*/g, ' ').substring(0, 350)}...`}
              </p>
              {manhwaData.synopsis && manhwaData.synopsis.length > 350 && (
                <button
                  onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                  className="text-purple-500 hover:text-purple-400 font-black mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm"
                >
                  {showFullSynopsis ? 'Show less' : 'Read more'}
                  {showFullSynopsis ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                </button>
              )}
            </div>

            {/* Platform & Studio - Side by Side Cards */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {manhwaData.platform && (
                <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6`}>
                  <h3 className={`text-base sm:text-lg font-black mb-3 sm:mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    Platform
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(manhwaData.platform) ? manhwaData.platform : [manhwaData.platform]).map((platform, idx) => (
                      <div
                        key={idx}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold"
                      >
                        {platform}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {manhwaData.studio && (
                <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6`}>
                  <h3 className={`text-base sm:text-lg font-black mb-3 sm:mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                    Studio
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(manhwaData.studio) ? manhwaData.studio : [manhwaData.studio]).map((studio, idx) => (
                      <div
                        key={idx}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold ${
                          isDark ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {studio}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tabs - Modern Design */}
            <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} border rounded-xl sm:rounded-2xl overflow-hidden`}>
              <div className="flex gap-1 sm:gap-2 p-1.5 sm:p-2 overflow-x-auto scrollbar-hide">
                {['overview', 'characters', 'staff', 'relations'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all capitalize whitespace-nowrap ${
                      selectedTab === tab
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                        : `${isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-5 lg:p-6">
                {selectedTab === 'overview' && (
                  <div className="grid sm:grid-cols-2 gap-6 text-base">
                    {manhwaData.authors && (
                      <div>
                        <p className={`font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 text-sm`}>Authors</p>
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                          {Array.isArray(manhwaData.authors) ? manhwaData.authors.join(', ') : manhwaData.authors}
                        </p>
                      </div>
                    )}
                    {manhwaData.artists && (
                      <div>
                        <p className={`font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 text-sm`}>Artists</p>
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                          {Array.isArray(manhwaData.artists) ? manhwaData.artists.join(', ') : manhwaData.artists}
                        </p>
                      </div>
                    )}
                    {manhwaData.publishers && (
                      <div>
                        <p className={`font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 text-sm`}>Publishers</p>
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                          {Array.isArray(manhwaData.publishers) ? manhwaData.publishers.join(', ') : manhwaData.publishers}
                        </p>
                      </div>
                    )}
                    {manhwaData.demographic && (
                      <div>
                        <p className={`font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 text-sm`}>Demographic</p>
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{manhwaData.demographic}</p>
                      </div>
                    )}
                    {manhwaData.eng_transl_upto && (
                      <div>
                        <p className={`font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 text-sm`}>Eng. Translation</p>
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>Chapter {manhwaData.eng_transl_upto}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === 'characters' && (
                  <div>
                    {manhwaData.characters && Array.isArray(manhwaData.characters) && manhwaData.characters.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {manhwaData.characters.slice(0, 8).map((char, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                                {typeof char === 'string' ? char : char.name || 'Unknown'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        No characters listed
                      </p>
                    )}
                  </div>
                )}

                {selectedTab === 'staff' && (
                  <div className="space-y-6">
                    {manhwaData.authors && (
                      <div>
                        <h4 className={`font-black text-lg mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                          <PenTool className="w-5 h-5 text-purple-500" />
                          Authors
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {(Array.isArray(manhwaData.authors) ? manhwaData.authors : [manhwaData.authors]).map((author, idx) => (
                            <span key={idx} className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/30">
                              {author}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {manhwaData.artists && (
                      <div>
                        <h4 className={`font-black text-lg mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                          <Image className="w-5 h-5 text-cyan-500" />
                          Artists
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {(Array.isArray(manhwaData.artists) ? manhwaData.artists : [manhwaData.artists]).map((artist, idx) => (
                            <span key={idx} className="px-4 py-2 bg-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-500/30">
                              {artist}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === 'relations' && (
                  <div className="space-y-6">
                    {(relatedItems.anime || relatedItems.novel) && (
                      <div>
                        <h4 className={`font-black text-lg mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Adaptations</h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {relatedItems.anime && (
                            <Link href={`/details/${relatedItems.anime.uid}`}>
                              <div className={`p-4 rounded-2xl cursor-pointer transition-all hover:scale-105 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                                <img src={relatedItems.anime.poster} alt={relatedItems.anime.title} className="w-full h-48 object-cover rounded-xl mb-3" />
                                <p className={`font-bold ${isDark ? 'text-white' : 'text-black'} line-clamp-2 mb-1`}>{relatedItems.anime.title}</p>
                                <p className="text-sm text-purple-500 font-bold">Anime Adaptation</p>
                              </div>
                            </Link>
                          )}
                          {relatedItems.novel && (
                            <Link href={`/details/${relatedItems.novel.uid}`}>
                              <div className={`p-4 rounded-2xl cursor-pointer transition-all hover:scale-105 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                                <img src={relatedItems.novel.poster} alt={relatedItems.novel.title} className="w-full h-48 object-cover rounded-xl mb-3" />
                                <p className={`font-bold ${isDark ? 'text-white' : 'text-black'} line-clamp-2 mb-1`}>{relatedItems.novel.title}</p>
                                <p className="text-sm text-cyan-500 font-bold">Novel</p>
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

      {/* Librarian's Notes - Cleaner Card */}
      {manhwaData.lib_talks && (
        <div className={`py-8 sm:py-10 lg:py-12 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">
            <div className={`${isDark ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'} border rounded-2xl sm:rounded-3xl p-6 sm:p-7 lg:p-8`}>
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-black'}`}>Librarian's Thoughts</h3>
              </div>
              <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-cyan-100' : 'text-cyan-900'}`}>
                {manhwaData.lib_talks}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Related Works - Spacious Grid */}
      {(relatedItems.prequel.length > 0 || relatedItems.sequel.length > 0 || relatedItems.spinoffs.length > 0) && (
        <div className={`py-8 sm:py-10 lg:py-12 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px] space-y-8 sm:space-y-10 lg:space-y-12">
            {relatedItems.prequel.length > 0 && (
              <div>
                <h2 className={`text-xl sm:text-2xl font-black mb-4 sm:mb-6 ${isDark ? 'text-white' : 'text-black'}`}>Prequel</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {relatedItems.prequel.map((item, idx) => (
                    <Link key={idx} href={`/details/${item.uid}`}>
                      <div className="group cursor-pointer">
                        <div className="relative overflow-hidden rounded-2xl mb-3">
                          <img 
                            src={item.poster} 
                            alt={item.title} 
                            className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-110" 
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black/80 to-transparent' : 'from-white/80 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                        </div>
                        <p className={`text-sm font-bold text-center line-clamp-2 ${isDark ? 'text-white' : 'text-black'}`}>{item.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {relatedItems.sequel.length > 0 && (
              <div>
                <h2 className={`text-2xl font-black mb-6 ${isDark ? 'text-white' : 'text-black'}`}>Sequel</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {relatedItems.sequel.map((item, idx) => (
                    <Link key={idx} href={`/details/${item.uid}`}>
                      <div className="group cursor-pointer">
                        <div className="relative overflow-hidden rounded-2xl mb-3">
                          <img 
                            src={item.poster} 
                            alt={item.title} 
                            className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-110" 
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black/80 to-transparent' : 'from-white/80 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                        </div>
                        <p className={`text-sm font-bold text-center line-clamp-2 ${isDark ? 'text-white' : 'text-black'}`}>{item.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {relatedItems.spinoffs.length > 0 && (
              <div>
                <h2 className={`text-2xl font-black mb-6 ${isDark ? 'text-white' : 'text-black'}`}>Spin-offs</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {relatedItems.spinoffs.map((item, idx) => (
                    <Link key={idx} href={`/details/${item.uid}`}>
                      <div className="group cursor-pointer">
                        <div className="relative overflow-hidden rounded-2xl mb-3">
                          <img 
                            src={item.poster} 
                            alt={item.title} 
                            className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-110" 
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black/80 to-transparent' : 'from-white/80 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                        </div>
                        <p className={`text-sm font-bold text-center line-clamp-2 ${isDark ? 'text-white' : 'text-black'}`}>{item.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contributors - Clean Grid */}
      {contributors && contributors.length > 0 && (
        <div className={`py-8 sm:py-10 lg:py-12 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">
            <h2 className={`text-xl sm:text-2xl font-black mb-4 sm:mb-6 ${isDark ? 'text-white' : 'text-black'}`}>Contributors</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {contributors.map((contributor, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (contributor.user_id) {
                      setSelectedUserId(contributor.user_id);
                      setShowUserProfile(true);
                    }
                  }}
                  disabled={!contributor.user_id}
                  className={`${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50'} border rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center transition-all ${contributor.user_id ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default opacity-70'}`}
                >
                  {contributor.profile_pic ? (
                    <img 
                      src={contributor.profile_pic} 
                      alt={contributor.displayname || contributor.username}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover mx-auto mb-2 sm:mb-3"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                  )}
                  <p className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-black'} line-clamp-2`}>
                    {contributor.displayname || contributor.username}
                  </p>
                  {contributor.username && contributor.displayname && (
                    <p className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      @{contributor.username}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal - Refined */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-6">
          <div className={`${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'} border rounded-3xl p-8 max-w-md w-full shadow-2xl`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-black'}`}>Share</h3>
              <button 
                onClick={() => setShowShareModal(false)} 
                className={`${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} p-2 rounded-full transition-colors`}
              >
                <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-black'}`} />
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href);
                  alert('Link copied!');
                  setShowShareModal(false);
                }}
                className="w-full p-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl font-bold transition-all text-base shadow-lg shadow-blue-500/30 active:scale-95"
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
                className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold transition-all text-base shadow-lg shadow-green-500/30 active:scale-95"
              >
                Download Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section - Spacious */}
      <div className={`py-8 sm:py-10 lg:py-12 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">
          <ReviewSection 
            isDark={isDark} 
            uid={uid} 
            category="manhwa" 
            currentUser={currentUser}
            onReviewUpdated={() => {
              const fetchManhwaData = async () => {
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
              fetchManhwaData();
            }}
          />
        </div>
      </div>

      {/* User Profile Modal */}
      {showUserProfile && selectedUserId && (
        <UserProfile 
          isDark={isDark}
          userId={selectedUserId}
          onClose={() => {
            setShowUserProfile(false);
            setSelectedUserId(null);
          }}
        />
      )}
    </div>
  );
}