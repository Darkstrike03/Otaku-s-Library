'use client';

import React, { useState, useEffect } from 'react';
import { getJsonFile } from '@/lib/pages';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Play, ArrowLeft, Calendar, Users, TrendingUp, Heart, Bookmark, Share2, ChevronDown, ChevronUp, Tv, Award, Sparkles, Film, MessageCircle, ThumbsUp, Music, Zap, Globe, Flame, AlertCircle, Crown, MessageSquare, User, ChevronRight } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import html2canvas from 'html2canvas';
import ReviewSection from '../ReviewSection';
import List from '@/components/List';

export default function AnimeUI({isDark = true}) {
  const { uid } = useParams();
  const [animeData, setAnimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userId, setUserId] = useState(null);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [generatingCard, setGeneratingCard] = useState(false);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Load bookmark and favorite status
        await loadUserData(user.id);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
  const fetchAnimeData = async () => {
    try {
      const { data, error } = await supabase
        .from('Ani_data')
        .select('*')
        .eq('uid', uid)
        .single();

      if (error) throw error;
      setAnimeData(data);
    } catch (err) {
      console.error('Error fetching anime data:', err);
    }
  };

  if (uid) {
    fetchAnimeData();
  }
}, [uid]);

  // Load user's bookmarks and favorites
  const loadUserData = async (userId) => {
    const { data, error } = await supabase
      .from('user_data')
      .select('bookmarks, favourites')
      .eq('user_id', userId)
      .single();

    if (data) {
      const bookmarks = data.bookmarks ? data.bookmarks.split(',').map(b => b.trim()) : [];
      const favourites = data.favourites ? data.favourites.split(',').map(f => f.trim()) : [];

      setIsBookmarked(bookmarks.includes(uid));
      setIsFavorite(favourites.includes(uid));
    }
  };

  useEffect(() => {
    const loadAnimeData = async () => {
      setLoading(true);
      const result = await getJsonFile(uid);
      if (result) {
        setAnimeData(result.item);
      } else {
        console.error('UID not found in any JSON file.');
      }
      setLoading(false);
    };

    loadAnimeData();
  }, [uid]);

  useEffect(() => {
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      setUserId(user.id);
      // Load bookmark and favorite status
      await loadUserData(user.id);
    }
  };

  getCurrentUser();
}, []);
  
  // Helper function to parse JSON safely
  const parseJSON = (data) => {
    if (!data) return [];
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return Array.isArray(data) ? data : [];
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = async () => {
    if (!userId || !uid) {
      console.error('User ID or UID missing');
      return;
    }

    setSavingBookmark(true);

    try {
      // Get current bookmarks
      const { data: userData, error: fetchError } = await supabase
        .from('user_data')
        .select('bookmarks')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user data:', fetchError);
        setSavingBookmark(false);
        return;
      }

      let bookmarks = userData?.bookmarks ? userData.bookmarks.split(',').map(b => b.trim()) : [];

      if (isBookmarked) {
        // Remove from bookmarks
        bookmarks = bookmarks.filter(b => b !== uid);
      } else {
        // Add to bookmarks
        bookmarks.push(uid);
      }

      const bookmarksString = bookmarks.join(', ');

      // Upsert user data
      const { error: updateError } = await supabase
        .from('user_data')
        .upsert(
          {
            user_id: userId,
            bookmarks: bookmarksString,
          },
          { onConflict: 'user_id' }
        );

      if (updateError) {
        console.error('Error updating bookmarks:', updateError);
      } else {
        setIsBookmarked(!isBookmarked);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setSavingBookmark(false);
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!userId || !uid) {
      console.error('User ID or UID missing');
      return;
    }

    setSavingFavorite(true);

    try {
      // Get current favorites
      const { data: userData, error: fetchError } = await supabase
        .from('user_data')
        .select('favourites')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user data:', fetchError);
        setSavingFavorite(false);
        return;
      }

      let favourites = userData?.favourites ? userData.favourites.split(',').map(f => f.trim()) : [];

      if (isFavorite) {
        // Remove from favorites
        favourites = favourites.filter(f => f !== uid);
      } else {
        // Add to favorites
        favourites.push(uid);
      }

      const favouritesString = favourites.join(', ');

      // Upsert user data
      const { error: updateError } = await supabase
        .from('user_data')
        .upsert(
          {
            user_id: userId,
            favourites: favouritesString,
          },
          { onConflict: 'user_id' }
        );

      if (updateError) {
        console.error('Error updating favorites:', updateError);
      } else {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setSavingFavorite(false);
    }
  };

  const handleShareCard = async () => {
    setGeneratingCard(true);
    
    try {
      // Create share text with details
      const shareText = `🎬 Check out: ${animeData.title}
⭐ Rating: ${animeData.rating || 'N/A'}
📺 Episodes: ${animeData.episodes || '?'}
📅 Status: ${animeData.status}
🎭 Type: ${animeData.type}

Discovered on Otaku's Library 🔥
https://www.otaku-s-library.vercel.app`;

      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title: `Check out ${animeData.title}!`,
          text: shareText,
          url: `${window.location.origin}?anime=${uid}`,
        });
        setGeneratingCard(false);
        return;
      }

      // Fallback: Copy to clipboard and show options
      await navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard! You can now paste and share on any platform.');
      setGeneratingCard(false);
    } catch (error) {
      console.error('Share failed:', error);
      setGeneratingCard(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} flex items-center justify-center`}>
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-spin"></div>
          <div className={`absolute inset-2 ${isDark ? 'bg-black' : 'bg-white'} rounded-full`}></div>
        </div>
      </div>
    );
  }

  if (!animeData) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} flex items-center justify-center`}>
        <div className="text-center">
          <AlertCircle size={48} className="text-purple-500 mx-auto mb-4" />
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>No data found! Please contribute</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Tv },
    { id: 'production', label: 'Production', icon: Film },
    { id: 'themes', label: 'Themes', icon: Music },
    { id: 'characters', label: 'Characters', icon: Users },
    { id: 'relations', label: 'Relations', icon: Sparkles },
    { id: 'contributors', label: 'Contributors', icon: User },
    { id: 'streaming', label: 'Streaming', icon: Globe },
  ];

  const genres = parseJSON(animeData.genre) || [];
  const producers = parseJSON(animeData.producer) || [];
  const cast = parseJSON(animeData.cast) || [];
  const openingThemes = parseJSON(animeData.opening_theme) || [];
  const endingThemes = parseJSON(animeData.ending_theme) || [];
  const prequel = parseJSON(animeData.prequel);
  const sequel = parseJSON(animeData.sequel);
  const sideStory = parseJSON(animeData.side_story);
  const contributors = parseJSON(animeData.contributers) || [];

  // Create a helper function to check if contributor is "The Librarian"
  const isLibrarianContributor = (contributor) => {
    if (typeof contributor === 'string') {
      return contributor.toLowerCase() === 'the librarian';
    }
    if (typeof contributor === 'object' && contributor !== null) {
      return (
        contributor.username?.toLowerCase() === 'the librarian' || 
        contributor.name?.toLowerCase() === 'the librarian' ||
        contributor.displayName?.toLowerCase() === 'the librarian'
      );
    }
    return false;
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} overflow-hidden`}>
      
      {/* Back Button - Fixed Position */}
      <div className="fixed top-5 left-4 z-30 group">
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all hover:scale-110 transform ${
            isDark
              ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              : 'bg-black/10 hover:bg-black/20 text-black border border-black/20'
          } backdrop-blur-xl shadow-lg hover:shadow-xl group-hover:gap-3`}
          title="Go back"
        >
          <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
          <span className="hidden sm:inline text-sm">Back</span>
        </button>
      </div>
      
      {/* Hero Section with Banner */}
      <div className="relative h-[80vh] sm:h-[100vh] overflow-hidden group">
        <div className="absolute inset-0">
          <img 
            src={animeData.banner || animeData.poster} 
            alt={animeData.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>

        {/* Animated gradient overlays */}
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-black via-black/80 to-transparent' : 'bg-gradient-to-t from-white via-white/80 to-transparent'}`}></div>
        <div className={`absolute inset-0 ${isDark ? 'bg-black/40' : 'bg-white/40'} backdrop-blur-[2px]`}></div>

        {/* Animated particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
              style={{
                background: `linear-gradient(135deg, #a855f7 0%, #ec4899 100%)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 sm:px-6 pb-8 w-full">
            <div className="grid lg:grid-cols-12 gap-6 items-end">
              {/* Poster Card */}
              <div className="lg:col-span-3 hidden lg:block animate-fade-in">
                <div className={`relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500 border-4 ${isDark ? 'border-purple-500/50' : 'border-purple-600/50'} group/poster`}>
                  <img src={animeData.poster} alt={animeData.title} className="w-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/poster:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <Play size={48} className="text-white" fill="white" />
                  </div>
                  <div className={`absolute top-4 right-4 px-4 py-2 rounded-full flex items-center gap-2 ${isDark ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-xl border border-purple-500/50`}>
                    <Star size={18} className="text-yellow-400" fill="currentColor" />
                    <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-black'}`}>{animeData.rating || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Title and Info */}
              <div className="lg:col-span-9 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {/* Status Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${isDark ? 'bg-white/10 border border-white/20' : 'bg-black/10 border border-black/20'} backdrop-blur-xl animate-pulse`}>
                  <div className={`w-3 h-3 rounded-full ${animeData.status === 'Ongoing' ? 'bg-green-500' : 'bg-blue-500'} animate-pulse`}></div>
                  <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{animeData.status || 'Unknown'}</span>
                </div>

                {/* Title */}
                <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-3 ${isDark ? 'text-white' : 'text-black'} drop-shadow-lg`}>{animeData.title}</h1>

                {/* Alternative Titles */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {animeData.jp_name && <span className={`text-lg font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{animeData.jp_name}</span>}
                  {animeData.romanji && <span className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>• {animeData.romanji}</span>}
                  {animeData.alter_name && <span className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>• {animeData.alter_name}</span>}
                </div>

                {/* Stats Grid */}
                <div className="flex flex-wrap gap-3 mb-8">
                 {[
  { icon: Star, value: animeData?.rating ? parseFloat(animeData.rating).toFixed(2) : 'N/A', label: 'Score', color: 'yellow' },
  { icon: MessageSquare, value: animeData?.review_count || 0, label: 'Reviews', color: 'purple' },
  { icon: Tv, value: animeData?.episodes || '?', label: 'Episodes', color: 'pink' },
  { icon: Calendar, value: animeData?.season || 'Unknown', label: 'Season', color: 'cyan' },
  { icon: Zap, value: animeData?.type || 'Unknown', label: 'Type', color: 'orange' },
].map((stat, i) => (
  <div
    key={i}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl hover:scale-110 transition-transform duration-300 animate-fade-in`}
    style={{ animationDelay: `${0.1 + i * 0.05}s` }}
  >
    <stat.icon size={18} className={`text-${stat.color}-400`} />
    <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{stat.value}</span>
    <span className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>{stat.label}</span>
  </div>
))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleBookmarkToggle}
                    disabled={savingBookmark}
                    className={`px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2 transform ${
                      isBookmarked
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                        : isDark
                        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        : 'bg-black/10 hover:bg-black/20 text-black border border-black/20'
                    } backdrop-blur-xl disabled:opacity-50`}
                  >
                    <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
                    {savingBookmark ? 'Saving...' : isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                  <button
                    onClick={handleFavoriteToggle}
                    disabled={savingFavorite}
                    className={`p-3 rounded-xl transition-all hover:scale-110 transform ${
                      isFavorite ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white' : isDark ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' : 'bg-black/10 hover:bg-black/20 text-black border border-black/20'
                    } backdrop-blur-xl disabled:opacity-50`}
                    
                  >
                    <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  {/* Share Button with Dropdown */}
                  <button 
                    onClick={() => setShowShareModal(true)}
                    className={`p-3 rounded-xl transition-all hover:scale-110 transform ${isDark ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' : 'bg-black/10 hover:bg-black/20 text-black border border-black/20'} backdrop-blur-xl`}
                    title="Share this anime"
                  >
                    <Share2 size={20} />
                  </button>

                  {/* Share Modal Popup */}
                  {showShareModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                      <div className={`relative w-full max-w-sm rounded-3xl overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl animate-pop-in`}>
                        
                        {/* Header */}
                        <div className="relative h-32 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600">
                          <div className="absolute inset-0 bg-black/20"></div>
                          <div className="relative h-full flex items-center justify-center">
                            <div className="text-center">
                              <Share2 size={32} className="text-white mx-auto mb-2" />
                              <h2 className="text-2xl font-black text-white">Share This</h2>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-3">
                          
                          {/* WhatsApp */}
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(`🎬 Check out: ${animeData.title}\n⭐ Rating: ${animeData.rating || 'N/A'}\n📺 Episodes: ${animeData.episodes || '?'}\n\nDiscover on Otaku's Library: ${window.location.href}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShowShareModal(false)}
                            className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all hover:scale-105 transform ${isDark ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30' : 'bg-green-500/20 hover:bg-green-500/30 text-green-600 border border-green-500/30'}`}
                          >
                            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.946 1.299c-1.504.996-2.59 2.353-3.179 3.833-.589 1.48-.537 3.058.21 4.487 1.524 2.939 4.802 4.752 7.838 4.752 1.305 0 2.58-.26 3.79-.78 1.21-.52 2.297-1.278 3.158-2.25l-.789-1.289c-.763.949-1.731 1.634-2.78 2.065-1.049.431-2.161.652-3.379.652-2.455 0-4.917-1.35-6.083-3.43-.591-1.041-.649-2.304-.158-3.5.49-1.196 1.48-2.15 2.655-2.708 1.174-.558 2.525-.677 3.832-.336z"/>
                            </svg>
                            <div className="flex-1">
                              <p className="font-bold">WhatsApp</p>
                              <p className="text-xs opacity-70">Share with contacts</p>
                            </div>
                            <ChevronRight size={20} />
                          </a>

                          {/* Facebook */}
                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShowShareModal(false)}
                            className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all hover:scale-105 transform ${isDark ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30' : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-600 border border-blue-600/30'}`}
                          >
                            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            <div className="flex-1">
                              <p className="font-bold">Facebook</p>
                              <p className="text-xs opacity-70">Share on your wall</p>
                            </div>
                            <ChevronRight size={20} />
                          </a>

                          {/* Twitter/X */}
                          <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out: ${animeData.title} ⭐${animeData.rating || 'N/A'}\n`)}&url=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShowShareModal(false)}
                            className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all hover:scale-105 transform ${isDark ? 'bg-black/30 hover:bg-black/40 text-white border border-white/20' : 'bg-black/30 hover:bg-black/40 text-white border border-white/20'}`}
                          >
                            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7"/>
                            </svg>
                            <div className="flex-1">
                              <p className="font-bold">Twitter/X</p>
                              <p className="text-xs opacity-70">Tweet about it</p>
                            </div>
                            <ChevronRight size={20} />
                          </a>

                          {/* Instagram */}
                          <button
                            onClick={() => {
                              alert('Open Instagram and share the link in your story or DM!');
                              setShowShareModal(false);
                            }}
                            className={`w-full flex items-center gap-4 px-5 py-3 rounded-xl transition-all hover:scale-105 transform ${isDark ? 'bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/30' : 'bg-pink-500/20 hover:bg-pink-500/30 text-pink-600 border border-pink-500/30'}`}
                          >
                            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
                            </svg>
                            <div className="flex-1">
                              <p className="font-bold">Instagram</p>
                              <p className="text-xs opacity-70">Share in story</p>
                            </div>
                            <ChevronRight size={20} />
                          </button>

                          {/* Copy Link */}
                          <button
                            onClick={async () => {
                              await navigator.clipboard.writeText(window.location.href);
                              alert('Link copied to clipboard!');
                              setShowShareModal(false);
                            }}
                            className={`w-full flex items-center gap-4 px-5 py-3 rounded-xl transition-all hover:scale-105 transform ${isDark ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30' : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 border border-purple-500/30'}`}
                          >
                            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <div className="flex-1">
                              <p className="font-bold">Copy Link</p>
                              <p className="text-xs opacity-70">Copy to clipboard</p>
                            </div>
                            <ChevronRight size={20} />
                          </button>
                        </div>

                        {/* Close Button */}
                        <div className="p-4 border-t border-white/10">
                          <button
                            onClick={() => setShowShareModal(false)}
                            className={`w-full py-2.5 rounded-lg font-bold transition-all ${
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Mobile Poster */}
            <div className="lg:hidden animate-fade-in">
              <div className={`rounded-2xl overflow-hidden shadow-2xl border-4 ${isDark ? 'border-purple-500/30' : 'border-purple-600/30'}`}>
                <img src={animeData.poster} alt={animeData.title} className="w-full" />
              </div>
            </div>

            {/* Information Card */}
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl animate-fade-in`}>
              <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                <Film size={20} className="text-purple-400" />
                Information
              </h3>
              <div className="space-y-3">
                {[
                  ['Type', animeData.type],
                  ['Episodes', animeData.episodes || 'Unknown'],
                  ['Status', animeData.status],
                  ['Aired', animeData.aired || 'Unknown'],
                  ['Season', animeData.season || 'Unknown'],
                  ['Duration', animeData.duration || 'Unknown'],
                  ['Studios', animeData.ani_studio || 'Unknown'],
                  ['Source', animeData.source || 'Unknown'],
                  ['Rating', animeData.rating || 'N/A'],
                  ['Demographic', animeData.demographic || 'Unknown'],
                ].map(([label, value], i) => (
                  <div key={i} className="flex justify-between items-start hover:translate-x-1 transition-transform">
                    <span className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-black/60'}`}>{label}:</span>
                    <span className={`text-sm font-bold text-right ${isDark ? 'text-white' : 'text-black'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Genres Card */}
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl animate-fade-in`} style={{ animationDelay: '0.1s' }}>
              <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                <Sparkles size={20} className="text-cyan-400" />
                Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {genres.length > 0 ? genres.map((genre, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-110 cursor-pointer ${isDark ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30' : 'bg-purple-500/20 text-purple-600 hover:bg-purple-500/30 border border-purple-500/30'}`}
                  >
                    {typeof genre === 'string' ? genre : genre.name || genre}
                  </span>
                )) : <span className={isDark ? 'text-white/60' : 'text-black/60'}>No genres available</span>}
              </div>
            </div>

            {/* Content Warning */}
            {animeData.content_warn && (
              <div className={`rounded-2xl p-4 ${isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-500/10 border border-red-500/30'} backdrop-blur-xl animate-fade-in`} style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className={`font-bold text-sm mb-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>Content Warning</h4>
                    <p className={`text-sm ${isDark ? 'text-red-400/80' : 'text-red-600/80'}`}>{animeData.content_warn}</p>
                  </div>
                </div>
              </div>
            )}
            <div className={`rounded-2xl p-4 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl animate-fade-in`} style={{ animationDelay: '0.3s' }}>
              <h3 className={`text-sm font-black mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'} uppercase tracking-wide`}>
                <Bookmark size={16} className="text-purple-400" />
                My List
              </h3>
              <List
                uid={uid}
                contentType="anime"
                currentUser={currentUser}
                isDark={isDark}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-white/10 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105 shadow-lg'
                        : isDark
                        ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                        : 'bg-black/5 hover:bg-black/10 text-black/60 hover:text-black'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Synopsis */}
                  <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl`}>
                    <h3 className={`text-2xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Synopsis</h3>
                    <p className={`text-base leading-relaxed ${isDark ? 'text-white/80' : 'text-black/80'} ${!showFullSynopsis && 'line-clamp-4'}`}>
                      {animeData.synopsis || animeData.syn || 'No synopsis available'}
                    </p>
                    <button
                      onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                      className={`mt-4 flex items-center gap-2 text-sm font-bold transition-all ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
                    >
                      {showFullSynopsis ? <><ChevronUp size={16} />Show Less</> : <><ChevronDown size={16} />Show More</>}
                    </button>
                  </div>

                  {/* Key Information Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Director', value: animeData.director, icon: Award },
                      { label: 'Music Composer', value: animeData.music_com, icon: Music },
                      { label: 'Source', value: animeData.source, icon: Zap },
                      { label: 'Author', value: animeData.author, icon: Film },
                    ].map((item, i) => (
                      item.value && (
                        <div
                          key={i}
                          className={`rounded-xl p-4 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl hover:border-purple-500/50 transition-all`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <item.icon size={16} className="text-purple-400" />
                            <span className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-black/60'}`}>{item.label}</span>
                          </div>
                          <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{item.value}</p>
                        </div>
                      )
                    ))}
                  </div>

                  {/* Official Website */}
                  {animeData.official_website && (
                    <a
                      href={animeData.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block rounded-2xl p-4 ${isDark ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30' : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'} transition-all hover:scale-105 text-center font-bold text-purple-400`}
                    >
                      <Globe size={18} className="inline mr-2" />
                      Visit Official Website
                    </a>
                  )}
                </div>
              )}

              {/* Production Tab */}
              {activeTab === 'production' && (
                <div className="space-y-6">
                  {/* Staff Information */}
                  <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                    <h3 className={`text-2xl font-black mb-6 ${isDark ? 'text-white' : 'text-black'}`}>Production Staff</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { label: 'Director', value: animeData.director },
                        { label: 'Artist', value: animeData.artist },
                        { label: 'Script Writer', value: animeData.script_writer },
                        { label: 'Music Composer', value: animeData.music_com },
                        { label: 'Sound Director', value: animeData.sound_direc },
                      ].map((staff, i) => (
                        staff.value && (
                          <div key={i} className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} hover:scale-105 transition-transform`}>
                            <p className={`text-sm font-medium mb-1 ${isDark ? 'text-white/60' : 'text-black/60'}`}>{staff.label}</p>
                            <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{staff.value}</p>
                          </div>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Producers */}
                  {producers.length > 0 && (
                    <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                      <h3 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Producers</h3>
                      <div className="flex flex-wrap gap-2">
                        {producers.map((producer, i) => (
                          <span key={i} className={`px-4 py-2 rounded-lg ${isDark ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-purple-500/20 text-purple-600 border border-purple-500/30'}`}>
                            {typeof producer === 'string' ? producer : producer.name || producer}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Adaptations */}
                  {animeData.adaptations && (
                    <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                      <h3 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Adaptations</h3>
                      <p className={isDark ? 'text-white/80' : 'text-black/80'}>{animeData.adaptations}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Themes Tab */}
              {activeTab === 'themes' && (
                <div className="space-y-6">
                  {/* Opening Themes */}
                  {openingThemes.length > 0 && (
                    <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                      <h3 className={`text-2xl font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                        <Music size={24} className="text-purple-400" />
                        Opening Themes
                      </h3>
                      <div className="space-y-2">
                        {openingThemes.map((theme, i) => (
                          <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} hover:border-purple-500/50 transition-all`}>
                            <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                              {typeof theme === 'string' ? theme : theme.name || JSON.stringify(theme)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ending Themes */}
                  {endingThemes.length > 0 && (
                    <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                      <h3 className={`text-2xl font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                        <Music size={24} className="text-pink-400" />
                        Ending Themes
                      </h3>
                      <div className="space-y-2">
                        {endingThemes.map((theme, i) => (
                          <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} hover:border-pink-500/50 transition-all`}>
                            <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                              {typeof theme === 'string' ? theme : theme.name || JSON.stringify(theme)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* OST */}
                  {animeData.ost && (
                    <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                      <h3 className={`text-xl font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                        <Music size={20} className="text-cyan-400" />
                        Original Soundtrack
                      </h3>
                      <p className={isDark ? 'text-white/80' : 'text-black/80'}>{animeData.ost}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Characters Tab */}
              {activeTab === 'characters' && (
                <div>
                  {cast && cast.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cast.map((character, i) => (
                        <div
                          key={i}
                          className={`rounded-2xl overflow-hidden transition-all hover:scale-105 cursor-pointer ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl group hover:shadow-2xl`}
                        >
                          <div className="relative h-64 overflow-hidden">
                            <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20' : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'}`}>
                              <Users size={64} className={`opacity-30 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                            </div>
                            <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black to-transparent' : 'from-white to-transparent'}`}></div>
                            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'}`}>
                              Main
                            </div>
                          </div>
                          <div className="p-4">
                            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                              {typeof character === 'string' ? character : character.name || character.character || JSON.stringify(character)}
                            </h4>
                            {character.voice_actor && (
                              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>VA: {character.voice_actor}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
                      <Users size={48} className={`mx-auto mb-4 opacity-50 ${isDark ? 'text-white' : 'text-black'}`} />
                      <p className={isDark ? 'text-white/60' : 'text-black/60'}>No character information available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Character Relations Tab */}
              {activeTab === 'relations' && (
                <div className="space-y-6">
                  {prequel && (
                    <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                      <h3 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Prequel</h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(prequel) ? prequel.map((p, i) => (
                          <span key={i} className={`px-4 py-2 rounded-lg ${isDark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-500/20 text-blue-600 border border-blue-500/30'}`}>
                            {typeof p === 'string' ? p : p.title || p.name || p}
                          </span>
                        )) : <span className={isDark ? 'text-white/60' : 'text-black/60'}>{typeof prequel === 'string' ? prequel : 'Unknown'}</span>}
                      </div>
                    </div>
                  )}

                  {sequel && (
                    <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                      <h3 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Sequel</h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(sequel) ? sequel.map((s, i) => (
                          <span key={i} className={`px-4 py-2 rounded-lg ${isDark ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-green-500/20 text-green-600 border border-green-500/30'}`}>
                            {typeof s === 'string' ? s : s.title || s.name || s}
                          </span>
                        )) : <span className={isDark ? 'text-white/60' : 'text-black/60'}>{typeof sequel === 'string' ? sequel : 'Unknown'}</span>}
                      </div>
                    </div>
                  )}

                  {sideStory && (
                    <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                      <h3 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Side Stories</h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(sideStory) ? sideStory.map((story, i) => (
                          <span key={i} className={`px-4 py-2 rounded-lg ${isDark ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-orange-500/20 text-orange-600 border border-orange-500/30'}`}>
                            {typeof story === 'string' ? story : story.title || story.name || story}
                          </span>
                        )) : <span className={isDark ? 'text-white/60' : 'text-black/60'}>{typeof sideStory === 'string' ? sideStory : 'Unknown'}</span>}
                      </div>
                    </div>
                  )}

                  {animeData.chara_rel && (
                    <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                      <h3 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Character Relations</h3>
                      <p className={isDark ? 'text-white/80' : 'text-black/80'}>{animeData.chara_rel}</p>
                    </div>
                  )}

                  {animeData.frachise && (
                    <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                      <h3 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Franchise</h3>
                      <p className={isDark ? 'text-white/80' : 'text-black/80'}>{animeData.frachise}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Streaming Tab */}
              {activeTab === 'streaming' && (
                <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                  {animeData.streaming_avail ? (
                    <>
                      <Globe size={48} className="mx-auto mb-4 text-cyan-400" />
                      <h3 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Available On</h3>
                      <p className={`text-lg ${isDark ? 'text-white/80' : 'text-black/80'}`}>{animeData.streaming_avail}</p>
                    </>
                  ) : (
                    <>
                      <Globe size={48} className="mx-auto mb-4 opacity-50" />
                      <p className={isDark ? 'text-white/60' : 'text-black/60'}>Streaming information not available</p>
                    </>
                  )}
                </div>
              )}

              {/* Contributors Tab */}
  {activeTab === 'contributors' && (
    <div className="space-y-6">
      {/* Lib Talks Section */}
      {animeData.lib_talks && (
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl`}>
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare size={24} className="text-cyan-400" />
            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-black'}`}>Librarian's Notes</h3>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-cyan-500/10 border-l-4 border-cyan-500' : 'bg-cyan-500/10 border-l-4 border-cyan-500'}`}>
            <p className={`text-base leading-relaxed ${isDark ? 'text-cyan-100' : 'text-cyan-900'}`}>
              {animeData.lib_talks}
            </p>
          </div>
        </div>
      )}

      {/* Contributors Section */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl`}>
        <h3 className={`text-2xl font-black mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
          <Users size={24} className="text-purple-400" />
          Contributors
        </h3>

        {contributors.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contributors.map((contributor, i) => {
              const isLibrarian = typeof contributor === 'string' 
                ? contributor.toLowerCase() === 'the librarian'
                : contributor.username?.toLowerCase() === 'the librarian' || contributor.toLowerCase() === 'the librarian';

              return (
                <div
                  key={i}
                  className={`relative rounded-xl p-4 transition-all hover:scale-105 cursor-pointer ${
                    isLibrarian
                      ? isDark
                        ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                        : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                      : isDark
                      ? 'bg-white/5 border border-white/10 hover:border-purple-500/50'
                      : 'bg-black/5 border border-black/10 hover:border-purple-500/50'
                  } backdrop-blur-xl`}
                >
                  {/* Librarian Badge */}
                  {isLibrarian && (
                    <div className="absolute -top-2 -right-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full blur animate-pulse"></div>
                        <div className={`relative rounded-full p-2 ${isDark ? 'bg-black' : 'bg-white'}`}>
                          <Crown size={16} className="text-yellow-500" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-lg ${
                      isLibrarian
                        ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30'
                        : isDark
                        ? 'bg-purple-500/20'
                        : 'bg-purple-500/20'
                    }`}>
                      <User size={20} className={isLibrarian ? 'text-yellow-400' : 'text-purple-400'} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold text-sm mb-1 ${
                        isLibrarian
                          ? 'text-yellow-300'
                          : isDark
                          ? 'text-white'
                          : 'text-black'
                      }`}>
                        {typeof contributor === 'string' ? contributor : contributor.username || contributor.name || contributor}
                      </h4>
                      {isLibrarian && (
                        <p className={`text-xs ${isDark ? 'text-yellow-400/60' : 'text-yellow-600/60'}`}>
                          Owner & Curator
                        </p>
                      )}
                      {contributor.role && !isLibrarian && (
                        <p className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                          {contributor.role}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contribution indicator */}
                  {isLibrarian && (
                    <div className="mt-3 pt-3 border-t border-yellow-500/30">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-yellow-500/20 rounded-full h-1">
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full" style={{ width: '100%' }}></div>
                        </div>
                        <span className="text-xs font-bold text-yellow-400">100%</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`rounded-xl p-8 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
            <Users size={48} className={`mx-auto mb-4 opacity-50 ${isDark ? 'text-white' : 'text-black'}`} />
            <p className={isDark ? 'text-white/60' : 'text-black/60'}>No contributors yet</p>
          </div>
        )}
      </div>

      {/* Contribution Stats */}
      {contributors.length > 0 && (
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20' : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20'} backdrop-blur-xl`}>
          <h4 className={`text-lg font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Contribution Stats</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
              <p className={`text-2xl font-black ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{contributors.length}</p>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>Total Contributors</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
              <p className={`text-2xl font-black ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                {contributors.filter(c => isLibrarianContributor(c)).length}
              </p>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>Curated By</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
              <p className={`text-2xl font-black ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
                {contributors.filter(c => !isLibrarianContributor(c)).length}
              </p>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>Community</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )}
    {/* At the bottom of your content */}
<div className={`mt-6`}>    
  <ReviewSection 
    isDark={isDark} 
    uid={uid} 
    category="anime" 
    currentUser={currentUser}
    onReviewUpdated={() => {
      // Refresh anime data when reviews change
      const fetchAnimeData = async () => {
        const { data, error } = await supabase
          .from('Ani_data')
          .select('rating, review_count')
          .eq('uid', uid)
          .single();
        
        if (!error && data) {
          setAnimeData(prev => ({
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
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
         @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        @keyframes pop-in {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-pop-in {
          animation: pop-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );

}