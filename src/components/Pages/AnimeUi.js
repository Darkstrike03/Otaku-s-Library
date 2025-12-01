import React, { useState, useEffect } from 'react';
import { getJsonFile } from './Pages';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Play, ArrowLeft, Calendar, Users, TrendingUp, Heart, Bookmark, Share2, ChevronDown, ChevronUp, Tv, Award, Sparkles, Film, MessageCircle, ThumbsUp, Music, Zap, Globe, Flame, AlertCircle, Crown, MessageSquare, User } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import html2canvas from 'html2canvas';

export default function AnimeUI() {
  const { uid } = useParams();
  const [isDark, setIsDark] = useState(true);
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
  const navigate = useNavigate();

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
      // Create a temporary card element
      const cardElement = document.createElement('div');
      cardElement.id = 'share-card-temp';
      cardElement.style.cssText = `
        position: fixed;
        left: -9999px;
        top: -9999px;
        width: 1200px;
        height: 630px;
        background: linear-gradient(135deg, #000000 0%, #1a1a2e 100%);
        display: flex;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      cardElement.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; display: flex;">
          {/* Banner Background */}
          <div style="position: absolute; inset: 0; opacity: 0.3;">
            <img src="${animeData.banner || animeData.poster}" alt="banner" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>

          {/* Dark Overlay */}
          <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(26,26,46,0.9) 100%);"></div>

          {/* Content */}
          <div style="position: relative; display: flex; width: 100%; height: 100%; align-items: center; justify-content: space-between; padding: 40px; z-index: 10;">
            {/* Left Side - Poster */}
            <div style="flex-shrink: 0; margin-right: 40px;">
              <img 
                src="${animeData.poster}" 
                alt="poster" 
                style="
                  width: 280px;
                  height: 400px;
                  border-radius: 20px;
                  box-shadow: 0 20px 60px rgba(168, 85, 247, 0.5);
                  border: 4px solid rgba(168, 85, 247, 0.5);
                  object-fit: cover;
                "
              />
            </div>

            {/* Right Side - Info */}
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; color: white;">
              {/* Title */}
              <h1 style="
                font-size: 48px;
                font-weight: 900;
                margin: 0;
                margin-bottom: 15px;
                background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                max-width: 90%;
              ">
                ${animeData.title}
              </h1>

              {/* Japanese Name */}
              ${animeData.jp_name ? `
                <p style="
                  font-size: 18px;
                  color: rgba(168, 85, 247, 0.8);
                  margin: 0;
                  margin-bottom: 20px;
                ">
                  ${animeData.jp_name}
                </p>
              ` : ''}

              {/* Info Row */}
              <div style="display: flex; gap: 30px; margin-bottom: 25px; flex-wrap: wrap;">
                <div style="display: flex; flex-direction: column;">
                  <span style="font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: bold;">Status</span>
                  <span style="font-size: 18px; font-weight: bold; color: ${animeData.status === 'Ongoing' ? '#22c55e' : '#3b82f6'};">
                    ${animeData.status || 'Unknown'}
                  </span>
                </div>
                <div style="display: flex; flex-direction: column;">
                  <span style="font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: bold;">Episodes</span>
                  <span style="font-size: 18px; font-weight: bold; color: #fbbf24;">
                    ${animeData.episodes || '?'}
                  </span>
                </div>
                <div style="display: flex; flex-direction: column;">
                  <span style="font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: bold;">Rating</span>
                  <span style="font-size: 18px; font-weight: bold; color: #fbbf24;">
                    ⭐ ${animeData.rating || 'N/A'}
                  </span>
                </div>
                <div style="display: flex; flex-direction: column;">
                  <span style="font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: bold;">Type</span>
                  <span style="font-size: 18px; font-weight: bold; color: #06b6d4;">
                    ${animeData.type || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Genres */}
              ${genres.length > 0 ? `
                <div style="margin-bottom: 25px;">
                  <p style="font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: bold; margin: 0 0 10px 0;">Genres</p>
                  <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${genres.map(g => `
                      <span style="
                        background: rgba(168, 85, 247, 0.2);
                        border: 1px solid rgba(168, 85, 247, 0.5);
                        color: #a78bfa;
                        padding: 6px 12px;
                        border-radius: 8px;
                        font-size: 13px;
                        font-weight: bold;
                      ">
                        ${typeof g === 'string' ? g : g.name || g}
                      </span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              {/* Website Link */}
              <div style="
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 15px 20px;
                background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
                border: 2px solid rgba(168, 85, 247, 0.5);
                border-radius: 12px;
                margin-top: auto;
                width: fit-content;
              ">
                <span style="font-size: 14px; font-weight: bold; color: rgba(255,255,255,0.7);">Check it out:</span>
                <span style="font-size: 16px; font-weight: bold; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                  www.otaku-s-library.vercel.app
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Watermark */}
          <div style="
            position: absolute;
            bottom: 20px;
            right: 40px;
            font-size: 14px;
            color: rgba(168, 85, 247, 0.6);
            font-weight: bold;
          ">
            Otaku's Library
          </div>
        </div>
      `;

      document.body.appendChild(cardElement);

      // Generate canvas from the element
      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      // Convert canvas to blob and share
      canvas.toBlob(async (blob) => {
        try {
          // Check if Web Share API is available
          if (navigator.share && navigator.canShare({ files: [new File([blob], 'anime-card.png', { type: 'image/png' })] })) {
            await navigator.share({
              files: [new File([blob], `${animeData.title}-card.png`, { type: 'image/png' })],
              title: `Check out ${animeData.title}!`,
              text: `Discovered this amazing anime on Otaku's Library!`,
            });
          } else {
            // Fallback: Download the image
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${animeData.title}-card.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        } catch (error) {
          console.error('Share failed:', error);
          // Fallback: Download
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${animeData.title}-card.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } finally {
          document.body.removeChild(cardElement);
          setGeneratingCard(false);
        }
      });
    } catch (error) {
      console.error('Error generating share card:', error);
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
      <div className="fixed top-25 left-20 z-30 group">
        <button
          onClick={() => navigate(-1)}
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
                    { icon: Star, value: animeData.rating || 'N/A', label: 'Score', color: 'yellow' },
                    { icon: Tv, value: animeData.episodes || '?', label: 'Episodes', color: 'pink' },
                    { icon: Calendar, value: animeData.season || 'Unknown', label: 'Season', color: 'cyan' },
                    { icon: Zap, value: animeData.type || 'Unknown', label: 'Type', color: 'orange' },
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
                  <button className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105 transform hover:shadow-2xl flex items-center gap-2 group/btn">
                    <Play size={20} fill="currentColor" className="group-hover/btn:translate-x-1 transition-transform" />
                    Watch Now
                  </button>
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
                    disabled={savingFavorite}
                  >
                    <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button 
                    onClick={handleShareCard}
                    disabled={generatingCard}
                    className={`p-3 rounded-xl transition-all hover:scale-110 transform ${isDark ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' : 'bg-black/10 hover:bg-black/20 text-black border border-black/20'} backdrop-blur-xl disabled:opacity-50`}
                    title="Share this anime"
                  >
                    <Share2 size={20} />
                  </button>
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
      `}</style>
    </div>
  );

}
