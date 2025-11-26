import React, { useState, useEffect } from 'react';
import { getJsonFile } from './Pages';
import { useParams } from 'react-router-dom';
import { Star, Play, Calendar, Users, TrendingUp, Heart, BookmarkPlus, Share2, ChevronDown, ChevronUp, Tv, Award, Sparkles, Film, MessageCircle, ThumbsUp } from 'lucide-react';

export default function AnimeUI() {
  const { uid } = useParams();
  const [isDark, setIsDark] = useState(true);
  const [animeData, setAnimeData] = useState(null);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isInList, setIsInList] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadAnimeData = async () => {
      const result = await getJsonFile(uid); // Check which file contains the uid
      if (result) {
        setAnimeData(result.item); // Set the item data
      } else {
        console.error('UID not found in any JSON file.');
      }
    };

    loadAnimeData();
  }, [uid]);


  const getDemoData = () => ({
    id: 1, title: 'Frieren: Beyond Journey\'s End', titleJapanese: '葬送のフリーレン',
    titleAlternate: ['Sousou no Frieren'], poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
    banner: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920',
    synopsis: 'During their decade-long quest to defeat the Demon King, the members of the hero\'s party forge bonds through adventures. However, the time Frieren spends with her comrades is merely a fraction of her thousand-year life.',
    rating: 9.2, ranked: 1, popularity: 156, members: 850000, favorites: 45000, type: 'TV', episodes: 28,
    status: 'Currently Airing', aired: 'Sep 29, 2023 to ?', season: 'Fall 2023', broadcast: 'Fridays at 23:00',
    studios: ['Madhouse'], source: 'Manga', genres: ['Adventure', 'Drama', 'Fantasy'], themes: ['Mythology'],
    duration: '24 min per ep', ageRating: 'PG-13',
    score: { overall: 9.2, story: 9.5, animation: 9.0, sound: 8.8, character: 9.3, enjoyment: 9.4 },
    characters: [
      { name: 'Frieren', role: 'Main', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200' },
      { name: 'Fern', role: 'Main', image: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=200' },
      { name: 'Stark', role: 'Main', image: 'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=200' },
    ],
    staff: [{ name: 'Keiichiro Saito', role: 'Director' }, { name: 'Evan Call', role: 'Music' }],
    reviews: 15234, recommendations: 342,
  });

  if (!animeData) return <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} flex items-center justify-center`}><div className="text-purple-500">No data found! Please Contribute</div></div>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Tv },
    { id: 'characters', label: 'Characters', icon: Users },
    { id: 'staff', label: 'Staff', icon: Award },
    { id: 'stats', label: 'Stats', icon: TrendingUp },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'}`}>
      <div className="relative h-[60vh] sm:h-[70vh] overflow-hidden">
        <img src={animeData.banner} alt={animeData.title} className="w-full h-full object-cover" />
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-black via-black/80 to-transparent' : 'bg-gradient-to-t from-white via-white/80 to-transparent'}`}></div>
        <div className={`absolute inset-0 ${isDark ? 'bg-black/40' : 'bg-white/40'} backdrop-blur-[2px]`}></div>

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 sm:px-6 pb-8">
            <div className="grid lg:grid-cols-12 gap-6 items-end">
              <div className="lg:col-span-3 hidden lg:block">
                <div className={`rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300 border-4 ${isDark ? 'border-purple-500/30' : 'border-purple-600/30'}`}>
                  <img src={animeData.poster} alt={animeData.title} className="w-full" />
                  <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full flex items-center gap-1 ${isDark ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-xl`}>
                    <Star size={16} className="text-yellow-400" fill="currentColor" />
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{animeData.rating}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-9">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${isDark ? 'bg-white/10 border border-white/20' : 'bg-black/10 border border-black/20'} backdrop-blur-xl`}>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{animeData.status}</span>
                </div>

                <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-3 ${isDark ? 'text-white' : 'text-black'}`}>{animeData.title}</h1>
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className={`text-lg font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{animeData.titleJapanese}</span>
                  {animeData.titleAlternate?.map((alt, i) => (
                    <span key={i} className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>• {alt}</span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  {[
                    { icon: Star, value: animeData.rating, label: 'Score', color: 'yellow' },
                    { icon: Award, value: `#${animeData.ranked}`, label: 'Ranked', color: 'purple' },
                    { icon: TrendingUp, value: `#${animeData.popularity}`, label: 'Popularity', color: 'cyan' },
                    { icon: Tv, value: animeData.episodes, label: 'Episodes', color: 'pink' },
                  ].map((stat, i) => (
                    <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-black/5'} backdrop-blur-xl`}>
                      <stat.icon size={18} className={`text-${stat.color}-400`} />
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{stat.value}</span>
                      <span className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>{stat.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105 flex items-center gap-2">
                    <Play size={20} fill="currentColor" />Watch Now
                  </button>
                  <button onClick={() => setIsInList(!isInList)} className={`px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2 ${isInList ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white' : isDark ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' : 'bg-black/10 hover:bg-black/20 text-black border border-black/20'} backdrop-blur-xl`}>
                    <BookmarkPlus size={20} />{isInList ? 'In My List' : 'Add to List'}
                  </button>
                  <button onClick={() => setIsFavorite(!isFavorite)} className={`p-3 rounded-xl transition-all hover:scale-105 ${isFavorite ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white' : isDark ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' : 'bg-black/10 hover:bg-black/20 text-black border border-black/20'} backdrop-blur-xl`}>
                    <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button className={`p-3 rounded-xl transition-all hover:scale-105 ${isDark ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' : 'bg-black/10 hover:bg-black/20 text-black border border-black/20'} backdrop-blur-xl`}>
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="lg:hidden">
              <div className={`rounded-2xl overflow-hidden shadow-2xl border-4 ${isDark ? 'border-purple-500/30' : 'border-purple-600/30'}`}>
                <img src={animeData.poster} alt={animeData.title} className="w-full" />
              </div>
            </div>

            <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
              <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                <Film size={20} className="text-purple-400" />Information
              </h3>
              <div className="space-y-3">
                {[
                  ['Type', animeData.type], ['Episodes', animeData.episodes], ['Status', animeData.status],
                  ['Aired', animeData.aired], ['Season', animeData.season], ['Broadcast', animeData.broadcast],
                  ['Studios', animeData.studios.join(', ')], ['Source', animeData.source],
                  ['Duration', animeData.duration], ['Rating', animeData.ageRating]
                ].map(([label, value], i) => (
                  <div key={i} className="flex justify-between items-start">
                    <span className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-black/60'}`}>{label}:</span>
                    <span className={`text-sm font-bold text-right ${isDark ? 'text-white' : 'text-black'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
              <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                <Sparkles size={20} className="text-cyan-400" />Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {[...animeData.genres, ...animeData.themes].map((tag, i) => (
                  <span key={i} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 cursor-pointer ${isDark ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30' : 'bg-purple-500/20 text-purple-600 hover:bg-purple-500/30 border border-purple-500/30'}`}>{tag}</span>
                ))}
              </div>
            </div>

            <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
              <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                <Users size={20} className="text-pink-400" />Community
              </h3>
              <div className="space-y-3">
                {[
                  [Users, 'Members', animeData.members.toLocaleString()],
                  [Heart, 'Favorites', animeData.favorites.toLocaleString()],
                  [MessageCircle, 'Reviews', animeData.reviews.toLocaleString()],
                  [ThumbsUp, 'Recommendations', animeData.recommendations]
                ].map(([Icon, label, value], i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                      <span className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>{label}</span>
                    </div>
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-9">
            <div className="flex flex-wrap gap-3 mb-8 border-b border-white/10 pb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${isActive ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105' : isDark ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-black/60 hover:text-black'}`}>
                    <Icon size={18} />{tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                  <h3 className={`text-2xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Synopsis</h3>
                  <p className={`text-base leading-relaxed ${isDark ? 'text-white/80' : 'text-black/80'} ${!showFullSynopsis && 'line-clamp-4'}`}>{animeData.synopsis}</p>
                  <button onClick={() => setShowFullSynopsis(!showFullSynopsis)} className={`mt-4 flex items-center gap-2 text-sm font-bold ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}>
                    {showFullSynopsis ? <><ChevronUp size={16} />Show Less</> : <><ChevronDown size={16} />Show More</>}
                  </button>
                </div>

                <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                  <h3 className={`text-2xl font-black mb-6 ${isDark ? 'text-white' : 'text-black'}`}>Detailed Scores</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {Object.entries(animeData.score).map(([key, value]) => {
                      const percentage = (value / 10) * 100;
                      return (
                        <div key={key}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-sm font-medium capitalize ${isDark ? 'text-white/80' : 'text-black/80'}`}>{key}</span>
                            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{value}</span>
                          </div>
                          <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'characters' && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {animeData.characters.map((char, i) => (
                  <div key={i} className={`rounded-2xl overflow-hidden transition-all hover:scale-105 cursor-pointer ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl group`}>
                    <div className="relative h-64 overflow-hidden">
                      <img src={char.image} alt={char.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black to-transparent' : 'from-white to-transparent'}`}></div>
                      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${char.role === 'Main' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white/20 text-white backdrop-blur-xl'}`}>{char.role}</div>
                    </div>
                    <div className="p-4">
                      <h4 className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{char.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'staff' && (
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                <h3 className={`text-2xl font-black mb-6 ${isDark ? 'text-white' : 'text-black'}`}>Staff</h3>
                <div className="space-y-4">
                  {animeData.staff.map((person, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{person.name}</span>
                      <span className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>{person.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                  <div className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">#{animeData.ranked}</div>
                  <div className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>Overall Rank</div>
                </div>
                <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                  <div className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">#{animeData.popularity}</div>
                  <div className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>Popularity Rank</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}