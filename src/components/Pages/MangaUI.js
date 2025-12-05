import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, BookOpen, Calendar, Users, TrendingUp, Heart, Bookmark, Share2,
  ChevronDown, ChevronUp, Award, Sparkles, Globe, Flame, AlertCircle,
  Crown, MessageSquare, User, ArrowLeft, Volume2, PenTool, Building2,
  Zap, Radio, Image, Type, BookMarked, Link as LinkIcon, Lightbulb, MessageCircle
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { getJsonFile } from './Pages';
import html2canvas from 'html2canvas';

export default function MangaUI() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const [mangaData, setMangaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userId, setUserId] = useState(null);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [showContentWarnings, setShowContentWarnings] = useState(false);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getCurrentUser();
  }, []);

  // Load user's bookmarks and favorites
  const loadUserData = async (userId) => {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from('user_data')
        .select('bookmarks, favourites')
        .eq('user_id', userId)
        .single();

      if (data) {
        const bookmarks = data.bookmarks?.split(',').map(b => b.trim()) || [];
        const favorites = data.favourites?.split(',').map(f => f.trim()) || [];
        setIsBookmarked(bookmarks.includes(uid));
        setIsFavorite(favorites.includes(uid));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Fetch manga data
  useEffect(() => {
    const loadMangaData = async () => {
      setLoading(true);
      try {
        const result = await getJsonFile(uid);
        if (result) {
          setMangaData(result.item);
          if (userId) {
            await loadUserData(userId);
          }
        } else {
          console.error('UID not found in any JSON file.');
          setMangaData(null);
        }
      } catch (error) {
        console.error('Error fetching manga data:', error);
        setMangaData(null);
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      loadMangaData();
    }
  }, [uid, userId]);

  // Bookmark toggle
  const toggleBookmark = async () => {
    if (!userId) {
      alert('Please login first');
      return;
    }

    setSavingBookmark(true);
    try {
      const { data: userData } = await supabase
        .from('user_data')
        .select('bookmarks')
        .eq('user_id', userId)
        .single();

      let bookmarks = userData?.bookmarks?.split(',').map(b => b.trim()) || [];

      if (isBookmarked) {
        bookmarks = bookmarks.filter(b => b !== uid);
      } else {
        bookmarks.push(uid);
      }

      const { error } = await supabase
        .from('user_data')
        .update({ bookmarks: bookmarks.join(', ') })
        .eq('user_id', userId);

      if (!error) {
        setIsBookmarked(!isBookmarked);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setSavingBookmark(false);
    }
  };

  // Favorite toggle
  const toggleFavorite = async () => {
    if (!userId) {
      alert('Please login first');
      return;
    }

    setSavingFavorite(true);
    try {
      const { data: userData } = await supabase
        .from('user_data')
        .select('favourites')
        .eq('user_id', userId)
        .single();

      let favorites = userData?.favourites?.split(',').map(f => f.trim()) || [];

      if (isFavorite) {
        favorites = favorites.filter(f => f !== uid);
      } else {
        favorites.push(uid);
      }

      const { error } = await supabase
        .from('user_data')
        .update({ favourites: favorites.join(', ') })
        .eq('user_id', userId);

      if (!error) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setSavingFavorite(false);
    }
  };

  // Parse array fields
  const parseArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return data.split(',').map(item => item.trim());
      }
    }
    return [];
  };

  // Share card generation
  const handleShareCard = async () => {
    setGeneratingCard(true);
    try {
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

      const genres = parseArray(mangaData.genre) || [];

      cardElement.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; display: flex;">
          <div style="position: absolute; inset: 0; opacity: 0.3;">
            <img src="${mangaData.banner || mangaData.poster}" alt="banner" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>

          <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(26,26,46,0.9) 100%);"></div>

          <div style="position: relative; display: flex; width: 100%; height: 100%; align-items: center; justify-content: space-between; padding: 40px; z-index: 10;">
            <div style="flex-shrink: 0; margin-right: 40px;">
              <img 
                src="${mangaData.poster}" 
                alt="poster" 
                style="
                  width: 280px;
                  height: 400px;
                  border-radius: 20px;
                  box-shadow: 0 20px 60px rgba(59, 130, 246, 0.5);
                  border: 4px solid rgba(59, 130, 246, 0.5);
                  object-fit: cover;
                "
              />
            </div>

            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; color: white;">
              <h1 style="
                font-size: 48px;
                font-weight: 900;
                margin: 0;
                margin-bottom: 15px;
                background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                max-width: 90%;
              ">
                ${mangaData.title}
              </h1>

              ${mangaData.jp_name ? `
                <p style="
                  font-size: 18px;
                  color: rgba(59, 130, 246, 0.8);
                  margin: 0;
                  margin-bottom: 20px;
                ">
                  ${mangaData.jp_name}
                </p>
              ` : ''}

              <div style="display: flex; gap: 30px; margin-bottom: 25px; flex-wrap: wrap;">
                <div style="display: flex; flex-direction: column;">
                  <span style="font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: bold;">Status</span>
                  <span style="font-size: 18px; font-weight: bold; color: ${mangaData.status === 'Ongoing' ? '#22c55e' : '#3b82f6'};">
                    ${mangaData.status || 'Unknown'}
                  </span>
                </div>
                <div style="display: flex; flex-direction: column;">
                  <span style="font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: bold;">Chapters</span>
                  <span style="font-size: 18px; font-weight: bold; color: #fbbf24;">
                    ${mangaData.chapters || '?'}
                  </span>
                </div>
                <div style="display: flex; flex-direction: column;">
                  <span style="font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: bold;">Volumes</span>
                  <span style="font-size: 18px; font-weight: bold; color: #fbbf24;">
                    ${mangaData.volumes || '?'}
                  </span>
                </div>
                <div style="display: flex; flex-direction: column;">
                  <span style="font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: bold;">Rating</span>
                  <span style="font-size: 18px; font-weight: bold; color: #fbbf24;">
                    ⭐ ${mangaData.rating || 'N/A'}
                  </span>
                </div>
              </div>

              ${genres.length > 0 ? `
                <div style="margin-bottom: 25px;">
                  <p style="font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: bold; margin: 0 0 10px 0;">Genres</p>
                  <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${genres.map(g => `
                      <span style="
                        background: rgba(59, 130, 246, 0.2);
                        border: 1px solid rgba(59, 130, 246, 0.5);
                        color: #93c5fd;
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

              <div style="
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 15px 20px;
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
                border: 2px solid rgba(59, 130, 246, 0.5);
                border-radius: 12px;
                margin-top: auto;
                width: fit-content;
              ">
                <span style="font-size: 14px; font-weight: bold; color: rgba(255,255,255,0.7);">Check it out:</span>
                <span style="font-size: 16px; font-weight: bold; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                  www.otaku-s-library.vercel.app
                </span>
              </div>
            </div>
          </div>

          <div style="
            position: absolute;
            bottom: 20px;
            right: 40px;
            font-size: 14px;
            color: rgba(59, 130, 246, 0.6);
            font-weight: bold;
          ">
            Otaku's Library
          </div>
        </div>
      `;

      document.body.appendChild(cardElement);

      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      canvas.toBlob(async (blob) => {
        try {
          if (navigator.share && navigator.canShare({ files: [new File([blob], 'manga-card.png', { type: 'image/png' })] })) {
            await navigator.share({
              files: [new File([blob], `${mangaData.title}-card.png`, { type: 'image/png' })],
              title: `Check out ${mangaData.title}!`,
              text: `Discovered this amazing manga on Otaku's Library!`,
            });
          } else {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${mangaData.title}-card.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        } catch (error) {
          console.error('Share failed:', error);
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${mangaData.title}-card.png`;
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

  // Navigate to anime if exists
  const navigateToAnime = () => {
    if (mangaData?.ani_uid) {
      navigate(`/details/${mangaData.ani_uid}`);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} flex items-center justify-center`}>
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full animate-spin"></div>
          <div className={`absolute inset-2 ${isDark ? 'bg-black' : 'bg-white'} rounded-full`}></div>
        </div>
      </div>
    );
  }

  if (!mangaData) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} flex items-center justify-center`}>
        <div className="text-center">
          <AlertCircle size={48} className="text-blue-500 mx-auto mb-4" />
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Manga not found</p>
        </div>
      </div>
    );
  }

  const synopsis = mangaData.synopsis?.replace(/\*\*\*/g, '\n') || 'No synopsis available';
  const genres = parseArray(mangaData.genre);
  const altNames = parseArray(mangaData.alt_names);
  const authors = parseArray(mangaData.authors);
  const artists = parseArray(mangaData.artists);
  const publishers = parseArray(mangaData.publishers);
  const serialization = parseArray(mangaData.serialization);
  const adaptations = parseArray(mangaData.adaptations);
  const prequel = parseArray(mangaData.prequel);
  const sequel = parseArray(mangaData.sequel);
  const sideStories = parseArray(mangaData.side_stories);
  const related = parseArray(mangaData.related);
  const characters = parseArray(mangaData.characters);
  const contentWarnings = parseArray(mangaData.content_warn);
  const contributors = parseArray(mangaData.contributors);
  const libTalks = mangaData.lib_talks || '';
  const characterRel = mangaData.character_rel || '';
  const popularity = parseArray(mangaData.popularity);
  const digital_ink = parseArray(mangaData.digital_ink);
  

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'details', label: 'Details', icon: Award },
    { id: 'characters', label: 'Characters', icon: Users },
    { id: 'relations', label: 'Relations', icon: Sparkles },
    { id: 'adaptations', label: 'Adaptations', icon: Star },
    { id: 'contributors', label: 'Contributors', icon: User },
    { id: 'librarian', label: 'Librarian Talk', icon: Lightbulb },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} overflow-hidden`}>
      {/* Back Button */}
      <div className="fixed top-5 left-4 z-30 group">
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

      {/* Hero Section */}
      <div className="relative h-[80vh] sm:h-[100vh] overflow-hidden group">
        <img
          src={mangaData.banner || mangaData.poster}
          alt={mangaData.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black via-black/60 to-transparent' : 'from-white via-white/60 to-transparent'}`}></div>

        {/* Content Warnings Badge */}
        {contentWarnings.length > 0 && (
  <div className="absolute top-4 right-4 lg:top-20 z-40">
    <button
      onClick={() => setShowContentWarnings(!showContentWarnings)}
      className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
        isDark ? 'bg-red-500/20 border border-red-500/50 hover:bg-red-500/30' : 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/20'
      } backdrop-blur-xl transition-all cursor-pointer`}
    >
      <AlertCircle size={18} className="text-red-500" />
      <span className="text-sm font-bold text-red-500">Content Warning</span>
      {showContentWarnings ? <ChevronUp size={16} className="text-red-500" /> : <ChevronDown size={16} className="text-red-500" />}
    </button>
    
    {/* Dropdown with warnings */}
    {showContentWarnings && (
      <div className={`mt-2 rounded-xl p-4 ${
        isDark ? 'bg-red-500/20 border border-red-500/50' : 'bg-red-500/10 border border-red-500/30'
      } backdrop-blur-xl max-w-xs`}>
        <ul className="space-y-2">
          {contentWarnings.map((warning, i) => (
            <li key={i} className="flex items-start gap-2">
              <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              <span className={`text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                {typeof warning === 'string' ? warning : warning.name || warning}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
)}

        {/* Main Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 z-30">
          <div className="container mx-auto grid lg:grid-cols-12 gap-8 items-end">
            {/* Poster */}
            <div className="lg:col-span-3 flex justify-center lg:justify-start">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <img
                  src={mangaData.poster}
                  alt={mangaData.title}
                  className="relative w-48 sm:w-56 md:w-64 lg:w-72 xl:w-80 h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[28rem] rounded-2xl object-cover shadow-2xl"
                />
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-9">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className={`text-3xl sm:text-5xl font-black ${isDark ? 'text-white' : 'text-black'}`}>
                  {mangaData.title}
                </h1>
              </div>

              {mangaData.jp_name && (
                <p className={`text-lg mb-4 ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                  {mangaData.jp_name}
                </p>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { label: 'Chapters', value: mangaData.chapters, icon: BookOpen },
                  { label: 'Volumes', value: mangaData.volumes, icon: Volume2 },
                  { label: 'Status', value: mangaData.status, icon: Radio },
                  { label: 'Type', value: mangaData.type, icon: Type },
                  { label: 'Rating', value: `⭐ ${mangaData.rating || 'N/A'}`, icon: Star },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className={`px-4 py-2 rounded-xl flex items-center gap-2 ${isDark ? 'bg-white/10 border border-white/20' : 'bg-black/10 border border-black/20'} backdrop-blur-xl`}>
                      <Icon size={16} className="text-blue-400" />
                      <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {stat.value || '-'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={toggleFavorite}
                  disabled={savingFavorite}
                  className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                    isFavorite
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
                      : isDark
                      ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      : 'bg-black/10 hover:bg-black/20 text-black border border-black/20'
                  } backdrop-blur-xl hover:scale-105`}
                >
                  <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                  {savingFavorite ? 'Saving...' : 'Favorite'}
                </button>

                <button
                  onClick={toggleBookmark}
                  disabled={savingBookmark}
                  className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                    isBookmarked
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                      : isDark
                      ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      : 'bg-black/10 hover:bg-black/20 text-black border border-black/20'
                  } backdrop-blur-xl hover:scale-105`}
                >
                  <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                  {savingBookmark ? 'Saving...' : 'Bookmark'}
                </button>

                <button
                  onClick={handleShareCard}
                  disabled={generatingCard}
                  className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                    isDark
                      ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      : 'bg-black/10 hover:bg-black/20 text-black border border-black/20'
                  } backdrop-blur-xl hover:scale-105 disabled:opacity-50`}
                >
                  <Share2 size={18} />
                  {generatingCard ? 'Creating...' : 'Share'}
                </button>

                {mangaData.ani_uid && (
                  <button
                    onClick={navigateToAnime}
                    className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white backdrop-blur-xl hover:scale-105`}
                  >
                    <Sparkles size={18} />
                    View Anime
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-12">
        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white scale-105'
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Synopsis */}
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl mb-8`}>
                <h3 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Synopsis</h3>
                <p className={`leading-relaxed whitespace-pre-wrap ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                  {showFullSynopsis ? synopsis : `${synopsis.substring(0, 300)}...`}
                </p>
                {synopsis.length > 300 && (
                  <button
                    onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                    className="mt-4 text-blue-400 font-bold flex items-center gap-2 hover:gap-3 transition-all"
                  >
                    {showFullSynopsis ? (
                      <>
                        Show less <ChevronUp size={18} />
                      </>
                    ) : (
                      <>
                        Show more <ChevronDown size={18} />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Genres */}
              {genres.length > 0 && (
                <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl mb-8`}>
                  <h3 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Genres</h3>
                  <div className="flex flex-wrap gap-3">
                    {genres.map((genre, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 font-bold border border-blue-500/30"
                      >
                        {typeof genre === 'string' ? genre : genre.name || genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Alternative Names */}
              {altNames.length > 0 && (
                <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl mb-8`}>
                  <h3 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Alternative Names</h3>
                  <div className="space-y-2">
                    {altNames.map((name, i) => (
                      <p key={i} className={`text-sm ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                        {typeof name === 'string' ? name : name.name || name}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Info Card */}
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                <h3 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Information</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Type', value: mangaData.type },
                    { label: 'Status', value: mangaData.status },
                    { label: 'Chapters', value: mangaData.chapters },
                    { label: 'Volumes', value: mangaData.volumes },
                    { label: 'Format', value: mangaData.reading_format },
                    { label: 'Digital/Ink', value: mangaData.digital_ink },
                    { label: 'Demographic', value: mangaData.demographic },
                    { label: 'Rating', value: mangaData.rating },
                    { label: 'Franchise', value: mangaData.franchise },
                  ].map((item, i) => (
                    item.value && (
                      <div key={i} className="pb-3 border-b border-white/10 last:border-b-0">
                        <p className={`text-xs font-bold uppercase ${isDark ? 'text-white/60' : 'text-black/60'}`}>{item.label}</p>
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{item.value}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Official Links */}
              {(mangaData.official_site || mangaData.read_available) && (
                <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                  <h3 className={`text-lg font-black mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    <LinkIcon size={18} className="text-blue-400" />
                    Links
                  </h3>
                  <div className="space-y-3">
                    {mangaData.official_site && (
                      <a
                        href={mangaData.official_site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-bold break-all text-sm block"
                      >
                        Official Site ↗
                      </a>
                    )}
                    {mangaData.read_available && (
                      <p className={`text-sm font-bold ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                        {mangaData.read_available}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {authors.length > 0 && (
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                  <User size={20} className="text-purple-400" />
                  Authors
                </h3>
                <div className="space-y-2">
                  {authors.map((author, i) => (
                    <p key={i} className={`text-sm font-bold ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                      {typeof author === 'string' ? author : author.name || author}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {artists.length > 0 && (
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                  <PenTool size={20} className="text-pink-400" />
                  Artists
                </h3>
                <div className="space-y-2">
                  {artists.map((artist, i) => (
                    <p key={i} className={`text-sm font-bold ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                      {typeof artist === 'string' ? artist : artist.name || artist}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {publishers.length > 0 && (
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                  <Building2 size={20} className="text-cyan-400" />
                  Publishers
                </h3>
                <div className="space-y-2">
                  {publishers.map((pub, i) => (
                    <p key={i} className={`text-sm font-bold ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                      {typeof pub === 'string' ? pub : pub.name || pub}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {serialization.length > 0 && (
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                  <Radio size={20} className="text-orange-400" />
                  Serialization
                </h3>
                <div className="space-y-2">
                  {serialization.map((serial, i) => (
                    <p key={i} className={`text-sm font-bold ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                      {typeof serial === 'string' ? serial : serial.name || serial}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {mangaData.start_date && (
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                  <Calendar size={20} className="text-blue-400" />
                  Publication
                </h3>
                <div className="space-y-2">
                  {mangaData.start_date && (
                    <p className={`text-sm font-bold ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                      <span className={isDark ? 'text-white/60' : 'text-black/60'}>Started:</span> {mangaData.start_date}
                    </p>
                  )}
                  {mangaData.end_date && (
                    <p className={`text-sm font-bold ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                      <span className={isDark ? 'text-white/60' : 'text-black/60'}>Ended:</span> {mangaData.end_date}
                    </p>
                  )}
                </div>
              </div>
            )}

            {mangaData['Eng_translation_upto_ch'] && (
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                  <Globe size={20} className="text-cyan-400" />
                  English Translation
                </h3>
                <p className={`text-sm font-bold ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                  Up to Chapter {mangaData['Eng_translation_upto_ch']}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Characters Tab */}
        {activeTab === 'characters' && (
          <div>
            {characters.length > 0 ? (
              <div>
                {characterRel && (
                  <div className={`rounded-2xl p-6 mb-8 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                    <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                      <MessageCircle size={20} className="text-blue-400" />
                      Character Relations
                    </h3>
                    <p className={`${isDark ? 'text-white/80' : 'text-black/80'} whitespace-pre-wrap`}>{characterRel}</p>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {characters.map((char, i) => (
                    <div key={i} className={`rounded-2xl p-4 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                      <h4 className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {typeof char === 'string' ? char : char.name || char}
                      </h4>
                      {typeof char === 'object' && char.role && (
                        <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>{char.role}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                <Users size={48} className={`mx-auto mb-4 ${isDark ? 'text-white/40' : 'text-black/40'}`} />
                <p className={`text-lg font-bold ${isDark ? 'text-white/60' : 'text-black/60'}`}>No characters available</p>
              </div>
            )}
          </div>
        )}

        {/* Relations Tab */}
        {activeTab === 'relations' && (
          <div>
            {prequel.length > 0 || sequel.length > 0 || sideStories.length > 0 || related.length > 0 ? (
              <div className="space-y-8">
                {prequel.length > 0 && (
                  <div>
                    <h3 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Prequel</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {prequel.map((item, i) => (
                        <div key={i} className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                          <h4 className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                            {typeof item === 'string' ? item : item.title || item.name || item}
                          </h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sequel.length > 0 && (
                  <div>
                    <h3 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Sequel</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sequel.map((item, i) => (
                        <div key={i} className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                          <h4 className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                            {typeof item === 'string' ? item : item.title || item.name || item}
                          </h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sideStories.length > 0 && (
                  <div>
                    <h3 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Side Stories</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sideStories.map((item, i) => (
                        <div key={i} className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                          <h4 className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                            {typeof item === 'string' ? item : item.title || item.name || item}
                          </h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {related.length > 0 && (
                  <div>
                    <h3 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Related</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {related.map((item, i) => (
                        <div key={i} className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                          <h4 className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                            {typeof item === 'string' ? item : item.title || item.name || item}
                          </h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                <Sparkles size={48} className={`mx-auto mb-4 ${isDark ? 'text-white/40' : 'text-black/40'}`} />
                <p className={`text-lg font-bold ${isDark ? 'text-white/60' : 'text-black/60'}`}>No related entries available</p>
              </div>
            )}
          </div>
        )}

        {/* Adaptations Tab */}
        {activeTab === 'adaptations' && (
          <div>
            {mangaData.ani_uid || adaptations.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mangaData.ani_uid && (
                  <button
                    onClick={navigateToAnime}
                    className="rounded-2xl p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:border-purple-500/60 backdrop-blur-xl transition-all hover:scale-105 text-left"
                  >
                    <Sparkles size={24} className="text-purple-400 mb-2" />
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>Anime Adaptation</h4>
                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>Click to view</p>
                  </button>
                )}
                {adaptations.map((adapt, i) => (
                  <div key={i} className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                      {typeof adapt === 'string' ? adapt : adapt.title || adapt.name || adapt}
                    </h4>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                <Sparkles size={48} className={`mx-auto mb-4 ${isDark ? 'text-white/40' : 'text-black/40'}`} />
                <p className={`text-lg font-bold ${isDark ? 'text-white/60' : 'text-black/60'}`}>No adaptations available</p>
              </div>
            )}
          </div>
        )}

        {/* Contributors Tab */}
        {activeTab === 'contributors' && (
          <div>
            {contributors.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {contributors.map((contributor, i) => {
                  const isLibrarian = isLibrarianContributor(contributor);
                  return (
                    <div
                      key={i}
                      className={`rounded-2xl p-6 ${
                        isLibrarian
                          ? 'bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30'
                          : isDark
                          ? 'bg-white/5 border border-white/10'
                          : 'bg-black/5 border border-black/10'
                      } backdrop-blur-xl`}
                    >
                      {isLibrarian && (
                        <div className="flex items-center gap-2 mb-2">
                          <Crown size={16} className="text-yellow-500" />
                          <span className="text-xs font-bold text-yellow-500">Librarian</span>
                        </div>
                      )}
                      <h4 className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {typeof contributor === 'string'
                          ? contributor
                          : contributor.username || contributor.name || contributor.displayName || contributor}
                      </h4>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                <Users size={48} className={`mx-auto mb-4 ${isDark ? 'text-white/40' : 'text-black/40'}`} />
                <p className={`text-lg font-bold ${isDark ? 'text-white/60' : 'text-black/60'}`}>No contributors listed</p>
              </div>
            )}
          </div>
        )}

        {/* Librarian Talk Tab */}
        {activeTab === 'librarian' && (
          <div>
            {libTalks ? (
              <div className={`rounded-2xl p-8 ${isDark ? 'bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/30' : 'bg-gradient-to-br from-blue-600/5 to-cyan-600/5 border border-blue-500/20'} backdrop-blur-xl`}>
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
                    <Lightbulb size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-black'}`}>Librarian's Talk</h3>
                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>Insights from the librarian</p>
                  </div>
                </div>
                <p className={`text-lg leading-relaxed whitespace-pre-wrap ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                  {libTalks}
                </p>
              </div>
            ) : (
              <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                <Lightbulb size={48} className={`mx-auto mb-4 ${isDark ? 'text-white/40' : 'text-black/40'}`} />
                <p className={`text-lg font-bold ${isDark ? 'text-white/60' : 'text-black/60'}`}>No librarian talk available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}