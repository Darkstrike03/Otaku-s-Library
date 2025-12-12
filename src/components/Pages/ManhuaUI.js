'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star, BookOpen, Calendar, Users, TrendingUp, Heart, Share2,
  ChevronDown, ChevronUp, AlertCircle, ArrowLeft, Image, Sparkles,
  Globe, Flame, Building2, Zap, User, Film, X, Feather, Radio,
  ExternalLink, Layers2, BarChart3, Lightbulb, Pen, Info, Grid3x3,
  Palette, Eye, TrendingDown, Award, Zap as Lightning, Clock, Link as LinkIcon,
  BookMarked
} from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { getJsonFile } from '@/lib/pages';
import ReviewSection from '../ReviewSection';
import List from '@/components/List';
import {useTheme} from '../../app/contexts/ThemeContext';
import UserProfile from '@/components/UserProfile';

export default function ManhuaUI() {
  const { isDark } = useTheme();
  const { uid } = useParams();
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const [manhuaData, setManhuaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [relatedItems, setRelatedItems] = useState({
    prequel: [],
    sequel: [],
    adaptations: [],
    side_stories: [],
    related: [],
    novelAdaptation: null
  });
  const [contributors, setContributors] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Parse helper function
  const parseArray = (data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [data];
      } catch {
        return [data];
      }
    }
    return [];
  };
  
  useEffect(() => {
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if(user){
      setCurrentUser(user);
    }
  };
  getCurrentUser();
}, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchContributors = async () => {
      if (!manhuaData?.contributors) return;
      
      const contributorsList = parseArray(manhuaData.contributors);
      if (contributorsList.length === 0) return;

      try {
        const { data, error } = await supabase
          .from('user_data')
          .select('user_id, username, profile_pic')
          .in('username', contributorsList);

        if (!error && data) {
          setContributors(data);
        }
      } catch (error) {
        console.error('Error fetching contributors:', error);
      }
    };

    fetchContributors();
  }, [manhuaData]);
    useEffect(() => {
    if (!currentUser || !manhuaData) return;

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
  }, [currentUser, uid, manhuaData]);
  useEffect(() => {
    const fetchManhuaData = async () => {
      if (!uid) return;
      try {
        setLoading(true);
        const result = await getJsonFile(uid);
        if (result?.item) {
          setManhuaData(result.item);
          
          // Fetch adaptations
          if (result.item.adaptations) {
            const adaptationIds = parseArray(result.item.adaptations);
            const adaptationResults = await Promise.all(
              adaptationIds.map(id => getJsonFile(id))
            );
            setRelatedItems(prev => ({ ...prev, adaptations: adaptationResults.map(r => r?.item).filter(Boolean) }));
          }

          // Fetch prequel
          if (result.item.prequel) {
            const prequelIds = parseArray(result.item.prequel);
            const prequelResults = await Promise.all(
              prequelIds.map(id => getJsonFile(id))
            );
            setRelatedItems(prev => ({ ...prev, prequel: prequelResults.map(r => r?.item).filter(Boolean) }));
          }

          // Fetch sequel
          if (result.item.sequel) {
            const sequelIds = parseArray(result.item.sequel);
            const sequelResults = await Promise.all(
              sequelIds.map(id => getJsonFile(id))
            );
            setRelatedItems(prev => ({ ...prev, sequel: sequelResults.map(r => r?.item).filter(Boolean) }));
          }

          // Fetch side stories
          if (result.item.side_stories) {
            const sideStoryIds = parseArray(result.item.side_stories);
            const sideStoryResults = await Promise.all(
              sideStoryIds.map(id => getJsonFile(id))
            );
            setRelatedItems(prev => ({ ...prev, side_stories: sideStoryResults.map(r => r?.item).filter(Boolean) }));
          }

          // Fetch related
          if (result.item.related) {
            const relatedIds = parseArray(result.item.related);
            const relatedResults = await Promise.all(
              relatedIds.map(id => getJsonFile(id))
            );
            setRelatedItems(prev => ({ ...prev, related: relatedResults.map(r => r?.item).filter(Boolean) }));
          }

          // Fetch novel adaptation
          if (result.item.don_novel_uid) {
            const novelResult = await getJsonFile(result.item.don_novel_uid);
            setRelatedItems(prev => ({ ...prev, novelAdaptation: novelResult?.item }));
          }
        } else {
          router.push('/404');
        }
      } catch (error) {
        console.error('Error fetching manhua:', error);
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };
    fetchManhuaData();
  }, [uid, router]);

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading Manhua...</p>
        </div>
      </div>
    );
  }

  if (!manhuaData) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Manhua Not Found</h2>
        </div>
      </div>
    );
  }

  const characters = parseArray(manhuaData.characters);
  const contentWarnings = parseArray(manhuaData.content_warn);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Floating Back Button - Nothing OS Style */}
      <button
        onClick={() => router.back()}
        className="fixed top-5 left-4 z-30 bg-yellow-500 hover:bg-yellow-600 text-black p-3 rounded-full shadow-xl transition-all hover:scale-110 active:scale-95"
        style={{ 
          transform: 'translateZ(0)',
          boxShadow: '0 8px 24px rgba(234, 179, 8, 0.4)'
        }}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Hero Banner Section - Samsung One UI Inspired */}
      <div className="relative h-[60vh] sm:h-[55vh] lg:h-[50vh] overflow-hidden">
        {/* Banner Image */}
        <div className="absolute inset-0">
          <img
            src={manhuaData.banner || manhuaData.poster}
            alt="Banner"
            className="w-full h-full object-cover"
            style={{ 
              transform: 'translateZ(0)',
              filter: 'blur(8px) brightness(0.7)',
              scale: '1.1'
            }}
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
        
        {/* Gradient Overlay - Samsung Compatible */}
        <div 
          className="absolute inset-0"
          style={{
            background: isDark 
              ? 'linear-gradient(to bottom, rgba(17, 24, 39, 0) 0%, rgba(17, 24, 39, 0.3) 40%, rgba(17, 24, 39, 0.95) 100%)'
              : 'linear-gradient(to bottom, rgba(249, 250, 251, 0) 0%, rgba(249, 250, 251, 0.3) 40%, rgba(249, 250, 251, 0.95) 100%)'
          }}
        />

        {/* Mobile Title Overlay */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0 p-6 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <span 
              className="px-4 py-1.5 text-black rounded-full text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
                transform: 'translateZ(0)'
              }}
            >
              🖼️ Manhua
            </span>
            {manhuaData.status && (
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                manhuaData.status === 'Ongoing' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-500 text-white'
              }`}
              style={{
                opacity: 0.95,
                transform: 'translateZ(0)'
              }}>
                {manhuaData.status}
              </span>
            )}
          </div>
          <h1 
            className={`text-3xl sm:text-4xl font-black leading-tight mb-2 ${isDark ? 'text-yellow-300' : 'text-yellow-400'}`}
            style={{
              textShadow: isDark 
                ? '0 2px 8px rgba(0, 0, 0, 0.8), 0 4px 16px rgba(0, 0, 0, 0.5)'
                : '0 2px 8px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.3)'
            }}
          >
            {manhuaData.title}
          </h1>
          {(manhuaData.cn_name || manhuaData.alt_names) && (
            <p 
              className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-100'}`}
              style={{
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)'
              }}
            >
              {manhuaData.cn_name || (Array.isArray(manhuaData.alt_names) ? manhuaData.alt_names[0] : manhuaData.alt_names)}
            </p>
          )}
        </div>
      </div>

      {/* Content Section - Samsung One UI Bottom-Heavy Layout */}
      <div className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-10 sm:py-12 lg:py-16`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Poster Card - Material Design Elevation */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="relative group">
                  <div 
                    className="absolute -inset-1 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)',
                      opacity: 0.4,
                      filter: 'blur(16px)',
                      transform: 'translateZ(0)'
                    }}
                  />
                  <img
                    src={manhuaData.poster}
                    alt={manhuaData.title}
                    className="relative w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl"
                    style={{
                      transform: 'translateZ(0)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
                    }}
                    onError={(e) => e.target.src = 'https://via.placeholder.com/400x600?text=No+Image'}
                  />
                  {manhuaData.rating && (
                    <div 
                      className="absolute -top-2 -right-2 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        boxShadow: '0 4px 16px rgba(251, 191, 36, 0.5)',
                        transform: 'translateZ(0)'
                      }}
                    >
                      ★ {manhuaData.rating}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Title Section - Hidden on Mobile */}
              <div className="hidden lg:block space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span 
                    className="px-5 py-2.5 text-black rounded-full text-sm font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                      transform: 'translateZ(0)'
                    }}
                  >
                    🖼️ Manhua
                  </span>
                  {manhuaData.status && (
                    <span className={`px-5 py-2.5 rounded-full text-sm font-bold ${
                      manhuaData.status === 'Ongoing' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-500 text-white'
                    }`}
                    style={{
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      transform: 'translateZ(0)'
                    }}>
                      {manhuaData.status}
                    </span>
                  )}
                </div>

                <h1 className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>
                  {manhuaData.title}
                </h1>

                {(manhuaData.cn_name || manhuaData.alt_names) && (
                  <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {manhuaData.cn_name || (Array.isArray(manhuaData.alt_names) ? manhuaData.alt_names[0] : manhuaData.alt_names)}
                  </p>
                )}
              </div>

              {/* Stats Cards - Material Design 3.0 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {manhuaData.chapters && (
                  <div 
                    className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    style={{
                      boxShadow: isDark 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.08)',
                      transform: 'translateZ(0)',
                      border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(251, 191, 36, 0.15)'
                    }}
                  >
                    <div className="text-3xl font-black text-yellow-500">{manhuaData.chapters}</div>
                    <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Chapters</div>
                  </div>
                )}
                {manhuaData.volumes && (
                  <div 
                    className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    style={{
                      boxShadow: isDark 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.08)',
                      transform: 'translateZ(0)',
                      border: isDark ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(245, 158, 11, 0.15)'
                    }}
                  >
                    <div className="text-3xl font-black text-amber-500">{manhuaData.volumes}</div>
                    <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Volumes</div>
                  </div>
                )}
                {manhuaData.start_date && (
                  <div 
                    className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    style={{
                      boxShadow: isDark 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.08)',
                      transform: 'translateZ(0)',
                      border: isDark ? '1px solid rgba(234, 88, 12, 0.2)' : '1px solid rgba(234, 88, 12, 0.15)'
                    }}
                  >
                    <div className="text-2xl font-black text-orange-500">
                      {new Date(manhuaData.start_date).toLocaleDateString('en-US', { year: '2-digit' })}
                    </div>
                    <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Started</div>
                  </div>
                )}
                {manhuaData.reading_direction && (
                  <div 
                    className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    style={{
                      boxShadow: isDark 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.08)',
                      transform: 'translateZ(0)',
                      border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(251, 191, 36, 0.15)'
                    }}
                  >
                    <div className="text-2xl font-black text-yellow-500 capitalize">{manhuaData.reading_direction?.[0] || 'V'}</div>
                    <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Direction</div>
                  </div>
                )}
              </div>

                              {/* Action Buttons - Material Design 3.0 */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={async () => {
                    if (!currentUser) { alert('Please login'); return; }
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
                    } catch (error) { console.error('Error:', error); }
                  }}
                  className={`px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
                    isFavorite
                      ? 'bg-red-500 text-white'
                      : `${isDark ? 'bg-gray-800 text-yellow-300' : 'bg-white text-yellow-700'}`
                  }`}
                  style={{
                    boxShadow: isFavorite
                      ? '0 4px 16px rgba(239, 68, 68, 0.4)'
                      : isDark 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.08)',
                    transform: 'translateZ(0)',
                    border: !isFavorite ? (isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(251, 191, 36, 0.15)') : 'none'
                  }}
                >
                  <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
                  {isFavorite ? 'Favorited' : 'Favorite'}
                </button>
                <button
                  onClick={async () => {
                    if (!currentUser) { alert('Please login'); return; }
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
                    } catch (error) { console.error('Error:', error); }
                  }}
                  className={`px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
                    isBookmarked
                      ? 'bg-blue-500 text-white'
                      : `${isDark ? 'bg-gray-800 text-yellow-300' : 'bg-white text-yellow-700'}`
                  }`}
                  style={{
                    boxShadow: isBookmarked
                      ? '0 4px 16px rgba(59, 130, 246, 0.4)'
                      : isDark 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.08)',
                    transform: 'translateZ(0)',
                    border: !isBookmarked ? (isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(251, 191, 36, 0.15)') : 'none'
                  }}
                >
                  <BookOpen className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-6 py-3 text-black rounded-full font-bold transition-all flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    boxShadow: '0 4px 16px rgba(251, 191, 36, 0.4)',
                    transform: 'translateZ(0)'
                  }}
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Tabbed Interface */}
      <div className={`relative z-10 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Tab Navigation - Nothing OS Clean Style */}
        <div 
          className={`sticky top-0 z-20 border-b ${isDark ? 'border-yellow-500/20 bg-gray-900' : 'border-yellow-300/30 bg-gray-50'}`}
          style={{
            opacity: 0.98,
            transform: 'translateZ(0)'
          }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8 overflow-x-auto no-scrollbar">
              {['overview', 'details', 'team', 'story', 'characters'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 font-bold text-sm uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                    activeTab === tab
                      ? 'text-yellow-500 border-yellow-500'
                      : `${isDark ? 'text-gray-400 hover:text-gray-300 border-transparent' : 'text-gray-600 hover:text-gray-700 border-transparent'}`
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* My List Section */}
              <div 
                className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                style={{
                  boxShadow: isDark 
                    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                    : '0 4px 12px rgba(0, 0, 0, 0.08)',
                  transform: 'translateZ(0)',
                  border: isDark ? '1px solid rgba(251, 191, 36, 0.1)' : '1px solid rgba(251, 191, 36, 0.08)'
                }}
              >
                <h3 className={`text-sm font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'} uppercase tracking-wide`}>
                  <BookMarked size={18} className="text-yellow-500" />
                  My List
                </h3>
                <List
                  uid={uid}
                  contentType="manhua"
                  currentUser={currentUser}
                  isDark={isDark}
                />
              </div>

              {/* Genre & Tags - Material Design Pills */}
              {manhuaData.genre && (
                <div>
                  <h3 className={`text-2xl font-black mb-6 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>
                    📚 Genres
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {Array.isArray(manhuaData.genre) ? manhuaData.genre.map((genre, idx) => (
                      <span 
                        key={idx} 
                        className={`px-5 py-2.5 rounded-full text-sm font-bold ${isDark ? 'bg-gray-800 text-yellow-300' : 'bg-white text-yellow-700'}`}
                        style={{
                          boxShadow: isDark 
                            ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                            : '0 2px 8px rgba(0, 0, 0, 0.08)',
                          transform: 'translateZ(0)',
                          border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(251, 191, 36, 0.15)'
                        }}
                      >
                        {genre}
                      </span>
                    )) : <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{manhuaData.genre}</span>}
                  </div>
                </div>
              )}

              {/* Demographic & Info Grid - Material Design Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {manhuaData.demographic && (
                  <div 
                    className={`p-5 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    style={{
                      boxShadow: isDark 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.08)',
                      transform: 'translateZ(0)',
                      border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(251, 191, 36, 0.15)'
                    }}
                  >
                    <div className="text-xs text-yellow-500 font-bold uppercase tracking-wider mb-2">Demographic</div>
                    <div className={`text-lg font-black ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>{manhuaData.demographic}</div>
                  </div>
                )}
                {manhuaData.langoforigin && (
                  <div 
                    className={`p-5 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    style={{
                      boxShadow: isDark 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.08)',
                      transform: 'translateZ(0)',
                      border: isDark ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(245, 158, 11, 0.15)'
                    }}
                  >
                    <div className="text-xs text-amber-500 font-bold uppercase tracking-wider mb-2">Language</div>
                    <div className={`text-lg font-black ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>{manhuaData.langoforigin}</div>
                  </div>
                )}
                {manhuaData.reading_direction && (
                  <div 
                    className={`p-5 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    style={{
                      boxShadow: isDark 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.08)',
                      transform: 'translateZ(0)',
                      border: isDark ? '1px solid rgba(234, 88, 12, 0.2)' : '1px solid rgba(234, 88, 12, 0.15)'
                    }}
                  >
                    <div className="text-xs text-orange-500 font-bold uppercase tracking-wider mb-2">Reading</div>
                    <div className={`text-lg font-black ${isDark ? 'text-orange-300' : 'text-orange-700'} capitalize`}>{manhuaData.reading_direction}</div>
                  </div>
                )}
                {manhuaData.type && (
                  <div 
                    className={`p-5 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    style={{
                      boxShadow: isDark 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.08)',
                      transform: 'translateZ(0)',
                      border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(251, 191, 36, 0.15)'
                    }}
                  >
                    <div className="text-xs text-yellow-500 font-bold uppercase tracking-wider mb-2">Type</div>
                    <div className={`text-lg font-black ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>{manhuaData.type}</div>
                  </div>
                )}
              </div>

              {/* Platforms Section - Enhanced Material Design */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {manhuaData.platform && (
                  <div>
                    <h4 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>
                      <Globe className="w-5 h-5" /> Platforms
                    </h4>
                    <div className="space-y-3">
                      {(Array.isArray(manhuaData.platform) ? manhuaData.platform : [manhuaData.platform]).map((plat, idx) => (
                        <div 
                          key={idx} 
                          className="px-5 py-3 text-black rounded-xl font-bold text-center"
                          style={{
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                            transform: 'translateZ(0)'
                          }}
                        >
                          {plat}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {manhuaData.serial_platform && (
                  <div>
                    <h4 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>
                      <Radio className="w-5 h-5" /> Original Platform
                    </h4>
                    <div className="space-y-3">
                      {(Array.isArray(manhuaData.serial_platform) ? manhuaData.serial_platform : [manhuaData.serial_platform]).map((plat, idx) => (
                        <div 
                          key={idx} 
                          className={`p-4 rounded-xl text-center font-bold ${isDark ? 'bg-gray-800 text-amber-300' : 'bg-white text-amber-700'}`}
                          style={{
                            boxShadow: isDark 
                              ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                              : '0 4px 12px rgba(0, 0, 0, 0.08)',
                            transform: 'translateZ(0)',
                            border: isDark ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(245, 158, 11, 0.15)'
                          }}
                        >
                          {plat}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Franchise - Material Design Highlight */}
              {manhuaData.franchise && (
                <div 
                  className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                  style={{
                    boxShadow: isDark 
                      ? '0 8px 24px rgba(0, 0, 0, 0.3)'
                      : '0 8px 24px rgba(0, 0, 0, 0.08)',
                    transform: 'translateZ(0)',
                    border: isDark ? '1px solid rgba(147, 51, 234, 0.2)' : '1px solid rgba(147, 51, 234, 0.15)'
                  }}
                >
                  <h4 className={`text-lg font-black mb-3 flex items-center gap-2 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                    <Sparkles className="w-5 h-5" /> Franchise
                  </h4>
                  <p className={`${isDark ? 'text-purple-200' : 'text-purple-800'} font-medium`}>{manhuaData.franchise}</p>
                </div>
              )}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-8">
              {/* Publishers & Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {manhuaData.publishers && (
                  <div>
                    <h4 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>
                      <Building2 className="w-5 h-5" /> Publishers
                    </h4>
                    <div className="space-y-3">
                      {(Array.isArray(manhuaData.publishers) ? manhuaData.publishers : [manhuaData.publishers]).map((pub, idx) => (
                        <div 
                          key={idx} 
                          className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                          style={{
                            boxShadow: isDark 
                              ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                              : '0 4px 12px rgba(0, 0, 0, 0.08)',
                            transform: 'translateZ(0)',
                            border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(251, 191, 36, 0.15)'
                          }}
                        >
                          <p className={`font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>{pub}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {manhuaData.official_site && (
                  <div>
                    <h4 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>
                      <ExternalLink className="w-5 h-5" /> Links
                    </h4>
                    <a 
                      href={manhuaData.official_site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-6 py-4 text-black rounded-xl font-bold text-center transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        boxShadow: '0 4px 16px rgba(251, 191, 36, 0.4)',
                        transform: 'translateZ(0)'
                      }}
                    >
                      Visit Official Site →
                    </a>
                  </div>
                )}
              </div>

              {/* Dates & Popularity - Material Design Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {manhuaData.start_date && (
                  <div 
                    className={`p-5 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    style={{
                      boxShadow: isDark 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.08)',
                      transform: 'translateZ(0)',
                      border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(251, 191, 36, 0.15)'
                    }}
                  >
                    <div className="text-xs text-yellow-500 font-bold uppercase tracking-wider mb-2">Started</div>
                    <div className={`text-lg font-black ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      {new Date(manhuaData.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                )}
                {manhuaData.end_date && (
                  <div 
                    className={`p-5 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    style={{
                      boxShadow: isDark 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.08)',
                      transform: 'translateZ(0)',
                      border: isDark ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(245, 158, 11, 0.15)'
                    }}
                  >
                    <div className="text-xs text-amber-500 font-bold uppercase tracking-wider mb-2">Ended</div>
                    <div className={`text-lg font-black ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                      {new Date(manhuaData.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                )}
                {manhuaData.lastupdated_at && (
                  <div 
                    className={`p-5 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    style={{
                      boxShadow: isDark 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.08)',
                      transform: 'translateZ(0)',
                      border: isDark ? '1px solid rgba(234, 88, 12, 0.2)' : '1px solid rgba(234, 88, 12, 0.15)'
                    }}
                  >
                    <div className="text-xs text-orange-500 font-bold uppercase tracking-wider mb-2">Updated</div>
                    <div className={`text-lg font-black ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                      {new Date(manhuaData.lastupdated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                )}
                {manhuaData.popularity && (
                  <div 
                    className={`p-5 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    style={{
                      boxShadow: isDark 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.08)',
                      transform: 'translateZ(0)',
                      border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(251, 191, 36, 0.15)'
                    }}
                  >
                    <div className="text-xs text-yellow-500 font-bold uppercase tracking-wider mb-2">Popularity</div>
                    <div className={`text-lg font-black ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      #{typeof manhuaData.popularity === 'object' ? manhuaData.popularity?.rank : 'N/A'}
                    </div>
                  </div>
                )}
              </div>

              {/* Contributors - Database Integrated with Profile Pictures */}
              {contributors.length > 0 && (
                <div>
                  <h4 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>
                    <Users className="w-5 h-5" /> Contributors
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {contributors.map((contributor, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-2xl text-center cursor-pointer transition-all hover:scale-105 active:scale-95 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                        style={{
                          boxShadow: isDark 
                            ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                            : '0 4px 12px rgba(0, 0, 0, 0.08)',
                          transform: 'translateZ(0)',
                          border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(251, 191, 36, 0.15)'
                        }}
                        onClick={() => {
                          setSelectedUserId(contributor.user_id);
                          setShowUserProfile(true);
                        }}
                      >
                        {contributor.profile_pic ? (
                          <img 
                            src={contributor.profile_pic} 
                            alt={contributor.username}
                            className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                            style={{
                              boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                              transform: 'translateZ(0)'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-black font-black text-xl"
                          style={{
                            display: contributor.profile_pic ? 'none' : 'flex',
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                            transform: 'translateZ(0)'
                          }}
                        >
                          {contributor.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <p className={`font-bold text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'} truncate`}>
                          {contributor.username}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}         

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {manhuaData.authors && (
                  <div>
                    <h4 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      <Pen className="w-5 h-5" /> Authors
                    </h4>
                    <div className="space-y-3">
                      {(Array.isArray(manhuaData.authors) ? manhuaData.authors : [manhuaData.authors]).map((author, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border-l-4 ${isDark ? 'bg-yellow-500/10 border-yellow-500' : 'bg-yellow-100/30 border-yellow-500'}`}>
                          <p className={`font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>{author}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {manhuaData.artists && (
                  <div>
                    <h4 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                      <Palette className="w-5 h-5" /> Artists
                    </h4>
                    <div className="space-y-3">
                      {(Array.isArray(manhuaData.artists) ? manhuaData.artists : [manhuaData.artists]).map((artist, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border-l-4 ${isDark ? 'bg-amber-500/10 border-amber-500' : 'bg-amber-100/30 border-amber-500'}`}>
                          <p className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>{artist}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Story Tab */}
          {activeTab === 'story' && (
            <div className="space-y-6">
              {manhuaData.synopsis && (
                <div>
                  <h3 className={`text-2xl font-black mb-4 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    📖 Synopsis
                  </h3>
                  <div className={`p-6 rounded-2xl ${isDark ? 'bg-yellow-500/10 border-2 border-yellow-500/30' : 'bg-yellow-100/30 border-2 border-yellow-300/50'}`}>
                    <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {showFullSynopsis ? manhuaData.synopsis : `${manhuaData.synopsis.substring(0, 400)}...`}
                    </p>
                    {manhuaData.synopsis.length > 400 && (
                      <button
                        onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                        className="mt-4 text-yellow-500 hover:text-yellow-400 font-bold flex items-center gap-2"
                      >
                        {showFullSynopsis ? 'Show Less' : 'Read More'}
                        {showFullSynopsis ? <ChevronUp /> : <ChevronDown />}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {manhuaData.lib_talks && (
                <div className={`p-6 rounded-2xl border-l-4 ${isDark ? 'bg-yellow-600/20 border-yellow-500' : 'bg-yellow-100/50 border-yellow-500'}`}>
                  <h4 className={`text-lg font-black mb-3 flex items-center gap-2 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    <Feather className="w-5 h-5" /> Librarian's Note
                  </h4>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{manhuaData.lib_talks}</p>
                </div>
              )}

              {manhuaData.character_rel && (
                <div className={`p-6 rounded-2xl border-l-4 ${isDark ? 'bg-blue-600/20 border-blue-500' : 'bg-blue-100/50 border-blue-500'}`}>
                  <h4 className={`text-lg font-black mb-3 flex items-center gap-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                    <Users className="w-5 h-5" /> Character Relations
                  </h4>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{manhuaData.character_rel}</p>
                </div>
              )}

              {contentWarnings.length > 0 && (
                <div className={`p-6 rounded-2xl border-2 ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-100/30 border-red-300/50'}`}>
                  <h4 className={`text-lg font-black mb-3 flex items-center gap-2 text-red-500`}>
                    <AlertCircle className="w-5 h-5" /> Content Warnings
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {contentWarnings.map((warn, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-bold">
                        {warn}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Items */}
              {(relatedItems.prequel.length > 0 || relatedItems.sequel.length > 0 || relatedItems.side_stories.length > 0 || relatedItems.adaptations.length > 0 || relatedItems.related.length > 0 || relatedItems.novelAdaptation) && (
                <div className="space-y-6 mt-8">
                  {relatedItems.prequel.length > 0 && (
                    <div>
                      <h4 className={`text-lg font-black mb-4 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>📚 Prequel</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedItems.prequel.map((item, idx) => (
                          <Link key={idx} href={`/details/${item.uid}`}>
                            <div className={`p-4 rounded-lg cursor-pointer hover:scale-105 transition ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                              <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{item.title}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {relatedItems.sequel.length > 0 && (
                    <div>
                      <h4 className={`text-lg font-black mb-4 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>📚 Sequel</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedItems.sequel.map((item, idx) => (
                          <Link key={idx} href={`/details/${item.uid}`}>
                            <div className={`p-4 rounded-lg cursor-pointer hover:scale-105 transition ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                              <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{item.title}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {relatedItems.side_stories.length > 0 && (
                    <div>
                      <h4 className={`text-lg font-black mb-4 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>📚 Side Stories</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedItems.side_stories.map((item, idx) => (
                          <Link key={idx} href={`/details/${item.uid}`}>
                            <div className={`p-4 rounded-lg cursor-pointer hover:scale-105 transition ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                              <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{item.title}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {relatedItems.adaptations.length > 0 && (
                    <div>
                      <h4 className={`text-lg font-black mb-4 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>📚 Adaptations</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedItems.adaptations.map((item, idx) => (
                          <Link key={idx} href={`/details/${item.uid}`}>
                            <div className={`p-4 rounded-lg cursor-pointer hover:scale-105 transition ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                              <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{item.title}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {relatedItems.related.length > 0 && (
                    <div>
                      <h4 className={`text-lg font-black mb-4 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>📚 Related</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedItems.related.map((item, idx) => (
                          <Link key={idx} href={`/details/${item.uid}`}>
                            <div className={`p-4 rounded-lg cursor-pointer hover:scale-105 transition ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                              <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{item.title}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {relatedItems.novelAdaptation && (
                    <div>
                      <h4 className={`text-lg font-black mb-4 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>📚 Novel Adaptation</h4>
                      <Link href={`/details/${relatedItems.novelAdaptation.uid}`}>
                        <div className={`p-4 rounded-lg cursor-pointer hover:scale-105 transition ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{relatedItems.novelAdaptation.title}</p>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Characters Tab */}
          {activeTab === 'characters' && (
            <div className="space-y-6">
              {characters.length > 0 ? (
                <>
                  <h3 className={`text-2xl font-black ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    👥 Characters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {characters.map((character, idx) => (
                      <div key={idx} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                          {typeof character === 'string' ? character : character.name}
                        </p>
                        {typeof character === 'object' && character.role && (
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{character.role}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No character information available.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal - Material Design */}
      {showShareModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        >
          <div 
            className={`rounded-2xl p-6 max-w-sm w-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              transform: 'translateZ(0)'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>Share This Manhua</h3>
              <button 
                onClick={() => setShowShareModal(false)} 
                className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied!');
                setShowShareModal(false);
              }}
              className="w-full p-4 text-black rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                boxShadow: '0 4px 16px rgba(251, 191, 36, 0.4)',
                transform: 'translateZ(0)'
              }}
            >
              Copy Link
            </button>
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

      <div className={`mt-6 p-4 md-6 border-t ${isDark ? 'border-yellow-500/20' : 'border-yellow-300/50'}`}>    
            <ReviewSection 
    isDark={isDark} 
    uid={uid} 
    category="manhua" 
    currentUser={currentUser}
    onReviewUpdated={() => {
      // Refresh manhua data when reviews change
      const fetchManhuaData = async () => {
        const { data, error } = await supabase
          .from('Manhua_data')
          .select('rating, review_count')
          .eq('uid', uid)
          .single();
        
        if (!error && data) {
          setManhuaData(prev => ({
            ...prev,
            rating: data.rating,
            review_count: data.review_count
          }));
        }
      };
      fetchManhuaData();
    }}
  />
</div>
    </div>
  );
}