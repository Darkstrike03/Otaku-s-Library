'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star, BookOpen, Calendar, Users, TrendingUp, Heart, Bookmark, Share2,
  ChevronDown, ChevronUp, Award, Sparkles, Globe, Flame, AlertCircle,
  Crown, MessageSquare, User, ArrowLeft, Volume2, PenTool, Building2,
  Zap, Radio, Image, Type, BookMarked, Link as LinkIcon, Lightbulb, MessageCircle,
  Mic, Music, Film, Play, Grid3x3, List, Eye, Layers, BarChart3, Hexagon
} from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { getJsonFile } from '@/lib/pages';
import html2canvas from 'html2canvas';

export default function DonghuaUI({isDark = true}) {
  const { uid } = useParams();
  const router = useRouter();
  const [donghuaData, setDonghuaData] = useState(null);
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
  const [relatedWorks, setRelatedWorks] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getCurrentUser();
  }, []);

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

  useEffect(() => {
    const loadDonghuaData = async () => {
      setLoading(true);
      try {
        const result = await getJsonFile(uid);
        if (result) {
          setDonghuaData(result.item);
          if (result.item.novel_manhua_uid) {
          const relatedResult = await getJsonFile(result.item.novel_manhua_uid);
          if (relatedResult) {
            setRelatedWorks(relatedResult.item);
          }
        }
          if (userId) {
            await loadUserData(userId);
          }
        } else {
          setDonghuaData(null);
        }
      } catch (error) {
        console.error('Error fetching donghua data:', error);
        setDonghuaData(null);
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      loadDonghuaData();
    }
  }, [uid, userId]);

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
        background: linear-gradient(135deg, #000000 0%, #0a2818 100%);
        display: flex;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      const genre = parseArray(donghuaData.genre) || [];

      cardElement.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; display: flex;">
          <div style="position: absolute; inset: 0; opacity: 0.3;">
            <img src="${donghuaData.banner || donghuaData.poster}" alt="banner" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>

          <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(10,40,24,0.9) 100%);"></div>

          <div style="position: relative; display: flex; width: 100%; height: 100%; align-items: center; justify-content: space-between; padding: 40px; z-index: 10;">
            <div style="flex-shrink: 0; margin-right: 40px;">
              <img 
                src="${donghuaData.poster}" 
                alt="poster" 
                style="
                  width: 280px;
                  height: 400px;
                  border-radius: 20px;
                  box-shadow: 0 20px 60px rgba(34, 197, 94, 0.5);
                  border: 4px solid rgba(34, 197, 94, 0.5);
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
                background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                max-width: 90%;
              ">
                ${donghuaData.title}
              </h1>

              ${donghuaData.cn_name ? `
                <p style="
                  font-size: 18px;
                  color: rgba(34, 197, 94, 0.8);
                  margin: 0;
                  margin-bottom: 20px;
                ">
                  ${donghuaData.cn_name}
                </p>
              ` : ''}

              <div style="display: flex; gap: 30px; margin-bottom: 25px; flex-wrap: wrap;">
                <div style="display: flex; flex-direction: column;">
                  <span style="font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: bold;">Status</span>
                  <span style="font-size: 18px; font-weight: bold; color: ${donghuaData.status === 'Ongoing' ? '#22c55e' : '#10b981'};">
                    ${donghuaData.status || 'Unknown'}
                  </span>
                </div>
                <div style="display: flex; flex-direction: column;">
                  <span style="font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: bold;">Episodes</span>
                  <span style="font-size: 18px; font-weight: bold; color: #86efac;">
                    ${donghuaData.episodes || '?'}
                  </span>
                </div>
                <div style="display: flex; flex-direction: column;">
                  <span style="font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: bold;">Season</span>
                  <span style="font-size: 18px; font-weight: bold; color: #86efac;">
                    ${donghuaData.season || '?'}
                  </span>
                </div>
                <div style="display: flex; flex-direction: column;">
                  <span style="font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: bold;">Rating</span>
                  <span style="font-size: 18px; font-weight: bold; color: #86efac;">
                    ⭐ ${donghuaData.rating || 'N/A'}
                  </span>
                </div>
              </div>

              ${genre.length > 0 ? `
                <div style="margin-bottom: 25px;">
                  <p style="font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; font-weight: bold; margin: 0 0 10px 0;">Genres</p>
                  <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${genre.map(g => `
                      <span style="
                        background: rgba(34, 197, 94, 0.2);
                        border: 1px solid rgba(34, 197, 94, 0.5);
                        color: #86efac;
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
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%);
                border: 2px solid rgba(34, 197, 94, 0.5);
                border-radius: 12px;
                margin-top: auto;
                width: fit-content;
              ">
                <span style="font-size: 14px; font-weight: bold; color: rgba(255,255,255,0.7);">Check it out:</span>
                <span style="font-size: 16px; font-weight: bold; background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
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
            color: rgba(34, 197, 94, 0.6);
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
          if (navigator.share && navigator.canShare({ files: [new File([blob], 'donghua-card.png', { type: 'image/png' })] })) {
            await navigator.share({
              files: [new File([blob], `${donghuaData.title}-card.png`, { type: 'image/png' })],
              title: `Check out ${donghuaData.title}!`,
              text: `Discovered this amazing donghua on Otaku's Library!`,
            });
          } else {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${donghuaData.title}-card.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        } catch (error) {
          console.error('Share failed:', error);
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
        <div className="space-y-4 text-center">
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-green-500"
                style={{
                  animation: `bounce 1.4s infinite`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
          <p className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>Loading Donghua...</p>
          <style>{`@keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } }`}</style>
        </div>
      </div>
    );
  }

  if (!donghuaData) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} flex items-center justify-center`}>
        <div className="text-center">
          <Hexagon size={64} className="text-green-500 mx-auto mb-6 opacity-50" />
          <h2 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-black'}`}>Donghua Not Found</h2>
          <p className={`text-lg mt-2 ${isDark ? 'text-white/60' : 'text-black/60'}`}>The anime you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const synopsis = donghuaData.synopsis?.replace(/\*\*\*/g, '\n') || 'No synopsis available';
  const genre = parseArray(donghuaData.genre);
  const altNames = parseArray(donghuaData.alt_names);
  const directors = parseArray(donghuaData.director);
  const studios = parseArray(donghuaData.studios);
  const producers = parseArray(donghuaData.producers);
  const voiceCast = parseArray(donghuaData.voice_cast);
  const streamingPlatforms = parseArray(donghuaData.streaming_platforms);
  const adaptations = parseArray(donghuaData.adaptations);
  const prequel = parseArray(donghuaData.prequel);
  const sequel = parseArray(donghuaData.sequel);
  const sideStories = parseArray(donghuaData.side_stories);
  const related = parseArray(donghuaData.related);
  const characters = parseArray(donghuaData.characters);
  const contentWarnings = parseArray(donghuaData.content_warn);
  const contributors = parseArray(donghuaData.contributors);
  const ost = parseArray(donghuaData.ost);
  const libTalks = donghuaData.lib_talks || '';
  const characterRel = donghuaData.character_rel || '';
  const popularity = parseArray(donghuaData.popularity);

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
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'}`}>
      {/* Navigation Header */}
      <nav className={`sticky top-0 z-50 ${isDark ? 'bg-black/80 border-b border-green-500/20' : 'bg-white/80 border-b border-green-500/20'} backdrop-blur-lg`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
          >
            <ArrowLeft size={20} className="text-green-400" />
          </button>
          
          <h1 className={`text-2xl font-black truncate ${isDark ? 'text-white' : 'text-black'}`}>
            {donghuaData.title}
          </h1>

          <div className="flex gap-2">
            <button
              onClick={toggleFavorite}
              disabled={savingFavorite}
              className={`p-2 rounded-lg transition-all ${
                isFavorite
                  ? 'bg-red-500/20 text-red-400'
                  : isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'
              }`}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={toggleBookmark}
              disabled={savingBookmark}
              className={`p-2 rounded-lg transition-all ${
                isBookmarked
                  ? 'bg-green-500/20 text-green-400'
                  : isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'
              }`}
            >
              <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Vertical Layout */}
      <div className={`relative min-h-[600px] overflow-hidden ${isDark ? 'bg-gradient-to-br from-green-950/20 via-black to-black' : 'bg-gradient-to-br from-green-50 via-white to-white'}`}>
        {/* Hero Section with Vertical Layout */}
  {/* Banner Background */}
        {donghuaData.banner && (
            <img
            src={donghuaData.banner}
            alt="banner"
            className="absolute inset-0 w-full h-full object-cover"
            />
        )}
        
        {/* Overlay Gradient */}
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-black/40 via-black/60 to-black' : 'bg-gradient-to-b from-white/40 via-white/60 to-white'}`} />

        {/* Decorative Grid Background */}
        <div className="absolute inset-0 opacity-10"></div>

        {/* Content */}
        <div className="relative container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-5 gap-12 items-start">
            {/* Poster Section */}
            <div className="lg:col-span-2 flex justify-center">
              <div className="relative group w-full max-w-xs">
                {/* Animated Border */}
                <div className={`absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isDark ? 'bg-gradient-to-br from-green-600 via-emerald-600 to-green-500' : 'bg-gradient-to-br from-green-400 via-emerald-400 to-green-300'}`} />
                
                {/* Poster Image */}
                <img
                  src={donghuaData.poster}
                  alt={donghuaData.title}
                  className={`relative w-full aspect-[3/4] object-cover rounded-3xl shadow-2xl transition-transform duration-500 group-hover:scale-105`}
                />

                {/* Rating Badge */}
                {donghuaData.rating && (
                  <div className={`absolute -top-5 -right-5 w-20 h-20 rounded-full flex items-center justify-center font-black text-xl shadow-2xl ${isDark ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-black' : 'bg-gradient-to-br from-yellow-300 to-amber-400 text-white'}`}>
                    ★ {donghuaData.rating}
                  </div>
                )}

                {/* Status Badge */}
                {donghuaData.status && (
                  <div className={`absolute -bottom-3 left-6 px-6 py-2 rounded-full font-bold text-sm ${
                    donghuaData.status === 'Ongoing'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  } shadow-lg`}>
                    {donghuaData.status}
                  </div>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <h1 className={`text-5xl lg:text-6xl font-black leading-tight mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    {donghuaData.title}
                  </h1>
                  {donghuaData.cn_name && (
                    <p className={`text-xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {donghuaData.cn_name}
                    </p>
                  )}
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Play, label: 'Episodes', value: donghuaData.episodes },
                    { icon: Calendar, label: 'Season', value: donghuaData.season },
                    { icon: Film, label: 'Type', value: donghuaData.type },
                    { icon: Radio, label: 'Source', value: donghuaData.source },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      stat.value && (
                        <div key={i} className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border border-green-500/30' : 'bg-black/5 border border-green-500/30'} backdrop-blur-sm`}>
                          <div className="flex items-center gap-3 mb-2">
                            <Icon size={18} className="text-green-400" />
                            <p className={`text-xs font-bold uppercase ${isDark ? 'text-white/60' : 'text-black/60'}`}>{stat.label}</p>
                          </div>
                          <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-black'}`}>{stat.value}</p>
                        </div>
                      )
                    );
                  })}
                </div>

                {/* Action Buttons */}
                                    {/* Action Buttons */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleShareCard}
                      disabled={generatingCard}
                      className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${isDark ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} disabled:opacity-50`}
                    >
                      <Share2 size={18} />
                      {generatingCard ? 'Creating...' : 'Share Card'}
                    </button>
                    {contentWarnings.length > 0 && (
                      <button
                        onClick={() => setShowContentWarnings(!showContentWarnings)}
                        className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${isDark ? 'bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400' : 'bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-600'}`}
                      >
                        <AlertCircle size={18} />
                        <span className="font-bold">Content Warnings</span>
                        {showContentWarnings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    )}
                  </div>
                  
                  {showContentWarnings && contentWarnings.length > 0 && (
                    <div className={`p-4 rounded-xl space-y-2 ${isDark ? 'bg-red-600/10 border border-red-500/30' : 'bg-red-600/5 border border-red-500/20'}`}>
                      {contentWarnings.map((w, i) => (
                        <p key={i} className={`text-sm font-bold ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                          • {typeof w === 'string' ? w : w.name || w}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Alternative Names */}
                {altNames.length > 0 && (
                  <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                    <p className={`text-xs font-bold uppercase mb-2 ${isDark ? 'text-white/60' : 'text-black/60'}`}>Also Known As</p>
                    <p className={`${isDark ? 'text-white/80' : 'text-black/80'}`}>
                      {altNames.map((n, i) => (typeof n === 'string' ? n : n.name || n)).join(' • ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Horizontal Scroll */}
      <div className={`sticky top-16 z-40 ${isDark ? 'bg-black/90 border-b border-green-500/20' : 'bg-white/90 border-b border-green-500/20'} backdrop-blur-xl`}>
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3">
            {[
              { id: 'overview', icon: Eye, label: 'Overview' },
              { id: 'details', icon: Layers, label: 'Details' },
              { id: 'characters', icon: Users, label: 'Characters' },
              { id: 'voicecast', icon: Mic, label: 'Voice Cast' },
              { id: 'ost', icon: Music, label: 'OST' },
              { id: 'relations', icon: Sparkles, label: 'Relations' },
              { id: 'adaptations', icon: Star, label: 'Adaptations' },
              { id: 'contributors', icon: User, label: 'Contributors' },
              { id: 'librarian', icon: Lightbulb, label: 'Librarian Talk' },
              { id: 'sourcework', icon: BookOpen, label: 'Source Work' },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white scale-105'
                      : isDark
                      ? 'hover:bg-white/5 text-white/60'
                      : 'hover:bg-black/5 text-black/60'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Featured Synopsis */}
            <div className={`relative rounded-3xl overflow-hidden ${isDark ? 'bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-green-500/30' : 'bg-gradient-to-br from-green-600/5 to-emerald-600/5 border border-green-500/20'}`}>
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-3xl -z-10" />
              
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-green-500' : 'bg-green-600'}`} />
                  <h2 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-black'}`}>Synopsis</h2>
                </div>
                
                <p className={`text-lg leading-relaxed whitespace-pre-wrap ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                  {showFullSynopsis ? synopsis : `${synopsis.substring(0, 400)}...`}
                </p>

                {synopsis.length > 400 && (
                  <button
                    onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                    className={`mt-6 font-bold flex items-center gap-2 ${isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'} transition-all`}
                  >
                    {showFullSynopsis ? (
                      <>
                        <ChevronUp size={18} /> Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown size={18} /> Show More
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Genres with Animated Cards */}
            {genre.length > 0 && (
              <div>
                <h3 className={`text-2xl font-black mb-6 ${isDark ? 'text-white' : 'text-black'}`}>Genres</h3>
                <div className="flex flex-wrap gap-3">
                  {genre.map((genre, i) => (
                    <div
                      key={i}
                      className={`px-6 py-3 rounded-2xl font-bold backdrop-blur-xl transition-all hover:scale-110 cursor-pointer ${isDark ? 'bg-green-600/20 border border-green-500/50 text-green-300 hover:bg-green-600/30' : 'bg-green-600/10 border border-green-500/30 text-green-700 hover:bg-green-600/20'}`}
                    >
                      {typeof genre === 'string' ? genre : genre.name || genre}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Streaming Platforms */}
            {streamingPlatforms.length > 0 && (
              <div>
                <h3 className={`text-2xl font-black mb-6 ${isDark ? 'text-white' : 'text-black'}`}>Available On</h3>
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                  {streamingPlatforms.map((platform, i) => (
                    <div key={i} className={`p-4 rounded-2xl text-center font-bold ${isDark ? 'bg-green-600/20 border border-green-500/30 text-green-300' : 'bg-green-600/10 border border-green-500/20 text-green-700'}`}>
                      {typeof platform === 'string' ? platform : platform.name || platform}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Details */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {directors.length > 0 && (
                <div className={`p-6 rounded-3xl ${isDark ? 'bg-white/5 border border-green-500/30' : 'bg-black/5 border border-green-500/20'}`}>
                  <h4 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    <Film size={20} /> Directors
                  </h4>
                  <div className="space-y-2">
                    {directors.map((d, i) => (
                      <p key={i} className={`font-bold ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                        {typeof d === 'string' ? d : d.name || d}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {studios.length > 0 && (
                <div className={`p-6 rounded-3xl ${isDark ? 'bg-white/5 border border-green-500/30' : 'bg-black/5 border border-green-500/20'}`}>
                  <h4 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    <Building2 size={20} /> Studios
                  </h4>
                  <div className="space-y-2">
                    {studios.map((s, i) => (
                      <p key={i} className={`font-bold ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                        {typeof s === 'string' ? s : s.name || s}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {producers.length > 0 && (
                <div className={`p-6 rounded-3xl ${isDark ? 'bg-white/5 border border-green-500/30' : 'bg-black/5 border border-green-500/20'}`}>
                  <h4 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    <Users size={20} /> Producers
                  </h4>
                  <div className="space-y-2">
                    {producers.map((p, i) => (
                      <p key={i} className={`font-bold ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                        {typeof p === 'string' ? p : p.name || p}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {donghuaData.aired && (
                <div className={`p-6 rounded-3xl ${isDark ? 'bg-white/5 border border-green-500/30' : 'bg-black/5 border border-green-500/20'}`}>
                  <h4 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    <Calendar size={20} /> Aired
                  </h4>
                  <p className={`font-bold ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                    {typeof donghuaData.aired === 'string' ? donghuaData.aired : JSON.stringify(donghuaData.aired)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Source Work */}
{activeTab === 'sourcework' && (
  <div>
    {relatedWorks && relatedWorks.title ? (
      <div className={`p-8 rounded-3xl ${isDark ? 'bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30' : 'bg-gradient-to-br from-blue-600/5 to-purple-600/5 border border-blue-500/20'}`}>
        <h3 className={`text-2xl font-black mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
          {relatedWorks.type || 'Source Work'}
        </h3>
        <p className={`mb-4 ${isDark ? 'text-white/80' : 'text-black/80'}`}>
          {relatedWorks.title}
        </p>
        {relatedWorks.synopsis && (
          <p className={`${isDark ? 'text-white/70' : 'text-black/70'} whitespace-pre-wrap`}>
            {relatedWorks.synopsis}
          </p>
        )}
      </div>
    ) : (
      <div className={`text-center py-16 rounded-3xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
        <BookOpen size={48} className={`mx-auto mb-4 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
        <p className={`font-bold ${isDark ? 'text-white/60' : 'text-black/60'}`}>No source work linked</p>
      </div>
    )}
  </div>
)}

        {/* Characters */}
        {activeTab === 'characters' && (
          <div className="space-y-8">
            {characterRel && (
              <div className={`p-8 rounded-3xl ${isDark ? 'bg-blue-600/10 border border-blue-500/30' : 'bg-blue-600/5 border border-blue-500/20'}`}>
                <h3 className={`text-xl font-black mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Character Relations</h3>
                <p className={`${isDark ? 'text-white/80' : 'text-black/80'} whitespace-pre-wrap`}>{characterRel}</p>
              </div>
            )}

            {characters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters.map((char, i) => (
                  <div key={i} className={`p-6 rounded-2xl group cursor-pointer transition-all hover:scale-105 ${isDark ? 'bg-white/5 hover:bg-white/10 border border-green-500/20' : 'bg-black/5 hover:bg-black/10 border border-green-500/20'}`}>
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                      {typeof char === 'string' ? char : char.name || char}
                    </h4>
                    {typeof char === 'object' && char.role && (
                      <p className={`text-sm mt-2 ${isDark ? 'text-white/60' : 'text-black/60'}`}>{char.role}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-16 rounded-3xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                <Users size={48} className={`mx-auto mb-4 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
                <p className={`font-bold ${isDark ? 'text-white/60' : 'text-black/60'}`}>No characters listed</p>
              </div>
            )}
          </div>
        )}

        {/* Voice Cast */}
        {activeTab === 'voicecast' && (
          <div>
            {voiceCast.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {voiceCast.map((actor, i) => (
                  <div key={i} className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-green-500/20' : 'bg-black/5 border border-green-500/20'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Mic size={16} className="text-green-400" />
                      <h4 className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {typeof actor === 'string' ? actor : actor.name || actor.voice_actor || actor}
                      </h4>
                    </div>
                    {typeof actor === 'object' && actor.character && (
                      <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>as {actor.character}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-16 rounded-3xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                <Mic size={48} className={`mx-auto mb-4 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
                <p className={`font-bold ${isDark ? 'text-white/60' : 'text-black/60'}`}>No voice cast available</p>
              </div>
            )}
          </div>
        )}

        {/* OST */}
        {activeTab === 'ost' && (
          <div>
            {ost.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ost.map((track, i) => (
                  <div key={i} className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-green-500/20' : 'bg-black/5 border border-green-500/20'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Music size={16} className="text-green-400" />
                      <h4 className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {typeof track === 'string' ? track : track.title || track.name || track}
                      </h4>
                    </div>
                    {typeof track === 'object' && track.artist && (
                      <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>by {track.artist}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-16 rounded-3xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                <Music size={48} className={`mx-auto mb-4 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
                <p className={`font-bold ${isDark ? 'text-white/60' : 'text-black/60'}`}>No OST available</p>
              </div>
            )}
          </div>
        )}

        {/* Relations */}
        {activeTab === 'relations' && (
          <div className="space-y-8">
            {prequel.length > 0 && (
              <div>
                <h3 className={`text-2xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Prequel</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prequel.map((item, i) => (
                    <div key={i} className={`p-6 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                      <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {typeof item === 'string' ? item : item.title || item.name || item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sequel.length > 0 && (
              <div>
                <h3 className={`text-2xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Sequel</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sequel.map((item, i) => (
                    <div key={i} className={`p-6 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                      <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {typeof item === 'string' ? item : item.title || item.name || item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sideStories.length > 0 && (
              <div>
                <h3 className={`text-2xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Side Stories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sideStories.map((item, i) => (
                    <div key={i} className={`p-6 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                      <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {typeof item === 'string' ? item : item.title || item.name || item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {related.length > 0 && (
              <div>
                <h3 className={`text-2xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Related</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {related.map((item, i) => (
                    <div key={i} className={`p-6 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                      <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {typeof item === 'string' ? item : item.title || item.name || item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Adaptations */}
        {activeTab === 'adaptations' && (
          <div>
            {adaptations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adaptations.map((adapt, i) => (
                  <div key={i} className={`p-6 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                      {typeof adapt === 'string' ? adapt : adapt.title || adapt.name || adapt}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-16 rounded-3xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                <Sparkles size={48} className={`mx-auto mb-4 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
                <p className={`font-bold ${isDark ? 'text-white/60' : 'text-black/60'}`}>No adaptations available</p>
              </div>
            )}
          </div>
        )}

        {/* Contributors */}
        {activeTab === 'contributors' && (
          <div>
            {contributors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contributors.map((contributor, i) => {
                  const isLibrarian = isLibrarianContributor(contributor);
                  return (
                    <div
                      key={i}
                      className={`p-6 rounded-2xl ${
                        isLibrarian
                          ? isDark
                            ? 'bg-yellow-600/20 border border-yellow-500/30'
                            : 'bg-yellow-600/10 border border-yellow-500/20'
                          : isDark
                          ? 'bg-white/5'
                          : 'bg-black/5'
                      }`}
                    >
                      {isLibrarian && (
                        <div className="flex items-center gap-2 mb-2">
                          <Crown size={16} className="text-yellow-500" />
                          <span className="text-xs font-bold text-yellow-500">Librarian</span>
                        </div>
                      )}
                      <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {typeof contributor === 'string' ? contributor : contributor.username || contributor.name || contributor.displayName || contributor}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`text-center py-16 rounded-3xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                <Users size={48} className={`mx-auto mb-4 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
                <p className={`font-bold ${isDark ? 'text-white/60' : 'text-black/60'}`}>No contributors</p>
              </div>
            )}
          </div>
        )}

        {/* Librarian Talk */}
        {activeTab === 'librarian' && (
          <div>
            {libTalks ? (
              <div className={`p-8 rounded-3xl ${isDark ? 'bg-gradient-to-br from-yellow-600/10 to-orange-600/10 border border-yellow-500/30' : 'bg-gradient-to-br from-yellow-600/5 to-orange-600/5 border border-yellow-500/20'}`}>
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-4 rounded-2xl ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-500/10'}`}>
                    <Lightbulb size={24} className="text-yellow-500" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-black'}`}>Librarian's Insights</h3>
                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>Personal thoughts and recommendations</p>
                  </div>
                </div>
                <p className={`text-lg leading-relaxed whitespace-pre-wrap ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                  {libTalks}
                </p>
              </div>
            ) : (
              <div className={`text-center py-16 rounded-3xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                <Lightbulb size={48} className={`mx-auto mb-4 ${isDark ? 'text-white/30' : 'text-black/30'}`} />
                <p className={`font-bold ${isDark ? 'text-white/60' : 'text-black/60'}`}>No insights yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}