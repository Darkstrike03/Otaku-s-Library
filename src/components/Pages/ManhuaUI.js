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
  const contributors = parseArray(manhuaData.contributors);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Floating Back Button */}
      <button
        onClick={() => router.back()}
        className="fixed top-5 left-4 z-30 bg-yellow-500 hover:bg-yellow-600 text-black p-3 rounded-full shadow-xl transition-all hover:scale-110 hover:shadow-yellow-500/50"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Hero Banner Section */}
      <div className={`relative lg:h-[500px] h-[800px]  overflow-hidden`}>
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 via-amber-500 to-orange-600 opacity-30"></div>
        
        {/* Banner Image with Blur */}
        <img
          src={manhuaData.banner || manhuaData.poster}
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
          onError={(e) => e.target.style.display = 'none'}
        />
        
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900' : 'bg-gradient-to-b from-transparent via-white/40 to-white'}`}></div>

        {/* Content Grid Layout */}
        <div className="relative z-10 h-full flex items-end p-6 md:p-10">
          <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
            {/* Poster Card */}
            <div className="col-span-1 flex justify-center md:justify-start">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500"></div>
                <img
                  src={manhuaData.poster}
                  alt={manhuaData.title}
                  className="relative w-48 h-72 object-cover rounded-2xl shadow-2xl"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/200x300?text=No+Image'}
                />
                {manhuaData.rating && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-600 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    ★ {manhuaData.rating}
                  </div>
                )}
              </div>
            </div>

            {/* Title & Meta Info */}
            <div className="col-span-1 md:col-span-3">
              <div className="space-y-4">
                {/* Type Badge */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-600 text-black rounded-full text-sm font-bold">
                    🖼️ Manhua
                  </span>
                  {manhuaData.status && (
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      manhuaData.status === 'Ongoing' 
                        ? 'bg-green-500/30 text-green-200' 
                        : 'bg-blue-900/30 text-blue-900'
                    }`}>
                      {manhuaData.status}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className={`text-4xl md:text-5xl font-black leading-tight ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  {manhuaData.title}
                </h1>

                {/* Alternative Names */}
                {(manhuaData.cn_name || manhuaData.alt_names) && (
                  <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {manhuaData.cn_name || (Array.isArray(manhuaData.alt_names) ? manhuaData.alt_names[0] : manhuaData.alt_names)}
                  </p>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-3 pt-2">
                  {manhuaData.chapters && (
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-200/50'}`}>
                      <div className="text-2xl font-bold text-yellow-400">{manhuaData.chapters}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Chapters</div>
                    </div>
                  )}
                  {manhuaData.volumes && (
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-amber-500/20' : 'bg-amber-200/50'}`}>
                      <div className="text-2xl font-bold text-amber-400">{manhuaData.volumes}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Volumes</div>
                    </div>
                  )}
                  {manhuaData.start_date && (
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-orange-500/20' : 'bg-orange-200/50'}`}>
                      <div className="text-lg font-bold text-orange-400">
                        {new Date(manhuaData.start_date).toLocaleDateString('en-US', { year: '2-digit' })}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Started</div>
                    </div>
                  )}
                  {manhuaData.reading_direction && (
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-200/50'}`}>
                      <div className="text-lg font-bold text-yellow-400 capitalize">{manhuaData.reading_direction?.[0] || 'V'}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Direction</div>
                    </div>
                  )}
                </div>

                                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
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
                    className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
                      isFavorite
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                        : `${isDark ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200' : 'bg-yellow-200 hover:bg-yellow-300 text-yellow-800'}`
                    }`}
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
                    className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
                      isBookmarked
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : `${isDark ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200' : 'bg-yellow-200 hover:bg-yellow-300 text-yellow-800'}`
                    }`}
                  >
                    <BookOpen className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-600 text-black rounded-lg font-bold transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-yellow-500/50"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Tabbed Interface */}
      <div className={`relative z-10 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Tab Navigation */}
        <div className={`sticky top-0 z-20 border-b ${isDark ? 'border-yellow-500/20 bg-gray-900/95' : 'border-yellow-300/50 bg-gray-50/95'} backdrop-blur-sm`}>
          <div className="container mx-auto px-4">
            <div className="flex gap-8 overflow-x-auto">
              {['overview', 'details', 'team', 'story', 'characters'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 font-bold text-sm uppercase transition-all border-b-2 ${
                    activeTab === tab
                      ? 'text-yellow-400 border-yellow-400'
                      : `${isDark ? 'text-gray-400 hover:text-gray-300 border-transparent' : 'text-gray-600 hover:text-gray-700 border-transparent'}`
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
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
              {/* Genre & Tags */}
              {manhuaData.genre && (
                <div>
                  <h3 className={`text-2xl font-black mb-4 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    📚 Genres
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {Array.isArray(manhuaData.genre) ? manhuaData.genre.map((genre, idx) => (
                      <span key={idx} className="px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-amber-600/20 border border-yellow-400/40 text-yellow-300 rounded-full text-sm font-bold">
                        {genre}
                      </span>
                    )) : <span className="text-gray-400">{manhuaData.genre}</span>}
                  </div>
                </div>
              )}

              {/* Demographic & Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {manhuaData.demographic && (
                  <div className={`p-4 rounded-xl border-2 ${isDark ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-100/30 border-yellow-300/50'}`}>
                    <div className="text-xs text-yellow-500 font-bold uppercase mb-1">Demographic</div>
                    <div className={`text-lg font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>{manhuaData.demographic}</div>
                  </div>
                )}
                {manhuaData.langoforigin && (
                  <div className={`p-4 rounded-xl border-2 ${isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-100/30 border-amber-300/50'}`}>
                    <div className="text-xs text-amber-500 font-bold uppercase mb-1">Language</div>
                    <div className={`text-lg font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>{manhuaData.langoforigin}</div>
                  </div>
                )}
                {manhuaData.reading_direction && (
                  <div className={`p-4 rounded-xl border-2 ${isDark ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-100/30 border-orange-300/50'}`}>
                    <div className="text-xs text-orange-500 font-bold uppercase mb-1">Reading</div>
                    <div className={`text-lg font-bold ${isDark ? 'text-orange-300' : 'text-orange-700'} capitalize`}>{manhuaData.reading_direction}</div>
                  </div>
                )}
                {manhuaData.type && (
                  <div className={`p-4 rounded-xl border-2 ${isDark ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-100/30 border-yellow-300/50'}`}>
                    <div className="text-xs text-yellow-500 font-bold uppercase mb-1">Type</div>
                    <div className={`text-lg font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>{manhuaData.type}</div>
                  </div>
                )}
              </div>

              {/* Platforms Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {manhuaData.platform && (
                  <div>
                    <h4 className={`text-lg font-black mb-3 flex items-center gap-2 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      <Globe className="w-5 h-5" /> Platforms
                    </h4>
                    <div className="space-y-2">
                      {(Array.isArray(manhuaData.platform) ? manhuaData.platform : [manhuaData.platform]).map((plat, idx) => (
                        <div key={idx} className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-600 text-black rounded-lg font-bold text-center">
                          {plat}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {manhuaData.serial_platform && (
                  <div>
                    <h4 className={`text-lg font-black mb-3 flex items-center gap-2 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      <Radio className="w-5 h-5" /> Original Platform
                    </h4>
                    <div className="space-y-2">
                      {(Array.isArray(manhuaData.serial_platform) ? manhuaData.serial_platform : [manhuaData.serial_platform]).map((plat, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border-2 text-center font-bold ${isDark ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' : 'bg-amber-100/50 border-amber-300 text-amber-700'}`}>
                          {plat}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Franchise */}
              {manhuaData.franchise && (
                <div className={`p-6 rounded-2xl ${isDark ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-100/30 border border-purple-300/50'}`}>
                  <h4 className={`text-lg font-black mb-3 flex items-center gap-2 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                    <Sparkles className="w-5 h-5" /> Franchise
                  </h4>
                  <p className={`${isDark ? 'text-purple-200' : 'text-purple-800'}`}>{manhuaData.franchise}</p>
                </div>
              )}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Publishers & Contributors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {manhuaData.publishers && (
                  <div>
                    <h4 className={`text-lg font-black mb-3 flex items-center gap-2 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      <Building2 className="w-5 h-5" /> Publishers
                    </h4>
                    <div className="space-y-2">
                      {(Array.isArray(manhuaData.publishers) ? manhuaData.publishers : [manhuaData.publishers]).map((pub, idx) => (
                        <div key={idx} className={`p-3 rounded-lg ${isDark ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-yellow-100/50 border border-yellow-300'}`}>
                          <p className={`font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>{pub}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {manhuaData.official_site && (
                  <div>
                    <h4 className={`text-lg font-black mb-3 flex items-center gap-2 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      <ExternalLink className="w-5 h-5" /> Links
                    </h4>
                    <a 
                      href={manhuaData.official_site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-3 bg-gradient-to-r from-yellow-400 to-amber-600 text-black rounded-lg font-bold text-center hover:shadow-lg hover:shadow-yellow-500/50 transition"
                    >
                      Visit Official Site →
                    </a>
                  </div>
                )}
              </div>

              {/* Dates & Popularity */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {manhuaData.start_date && (
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-100/30 border border-yellow-300/50'}`}>
                    <div className="text-xs text-yellow-500 font-bold mb-2">Started</div>
                    <div className={`text-lg font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      {new Date(manhuaData.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                )}
                {manhuaData.end_date && (
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-amber-100/30 border border-amber-300/50'}`}>
                    <div className="text-xs text-amber-500 font-bold mb-2">Ended</div>
                    <div className={`text-lg font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                      {new Date(manhuaData.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                )}
                {manhuaData.lastupdated_at && (
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-orange-100/30 border border-orange-300/50'}`}>
                    <div className="text-xs text-orange-500 font-bold mb-2">Updated</div>
                    <div className={`text-lg font-bold ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                      {new Date(manhuaData.lastupdated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                )}
                {manhuaData.popularity && (
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-100/30 border border-yellow-300/50'}`}>
                    <div className="text-xs text-yellow-500 font-bold mb-2">Popularity</div>
                    <div className={`text-lg font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      #{typeof manhuaData.popularity === 'object' ? manhuaData.popularity?.rank : 'N/A'}
                    </div>
                  </div>
                )}
              </div>

              {/* Contributors */}
              {contributors.length > 0 && (
                <div>
                  <h4 className={`text-lg font-black mb-3 flex items-center gap-2 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    <Users className="w-5 h-5" /> Contributors
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {contributors.map((contributor, idx) => (
                      <div key={idx} className={`p-3 rounded-lg ${isDark ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-100/30 border border-yellow-300'}`}>
                        <p className={`font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                          {typeof contributor === 'string' ? contributor : contributor.name || contributor.username}
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 max-w-sm w-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>Share This Manhua</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied!');
                setShowShareModal(false);
              }}
              className="w-full p-3 bg-gradient-to-r from-yellow-400 to-amber-600 text-black rounded-lg font-bold hover:shadow-lg transition"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}
      <div className={`mt-6 p-4 md-6 border-t ${isDark ? 'border-yellow-500/20' : 'border-yellow-300/50'}`}>    
            <ReviewSection 
    isDark={isDark} 
    uid={uid} 
    category="manhua" 
    currentUser={currentUser}
    onReviewUpdated={() => {
      // Refresh anime data when reviews change
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
      fetchAnimeData();
    }}
  />
</div>
    </div>
  );
}