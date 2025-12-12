'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  Trophy, 
  Medal, 
  Award,
  User,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Tv,
  BookOpen,
  Book,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../app/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import UserProfile from './UserProfile';

export default function Allreview() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [topReviewers, setTopReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest'); // latest, highest-rating, lowest-rating, most-helpful

  // Categories
  const categories = [
    { id: 'all', name: 'All', icon: Star },
    { id: 'anime', name: 'Anime', icon: Tv },
    { id: 'manga', name: 'Manga', icon: BookOpen },
    { id: 'manhwa', name: 'Manhwa', icon: Book },
    { id: 'manhua', name: 'Manhua', icon: Sparkles },
    { id: 'donghua', name: 'Donghua', icon: TrendingUp },
    { id: 'webnovels', name: 'Novels', icon: Book },
  ];

  // Load all reviews
  useEffect(() => {
    loadAllReviews();
    loadTopReviewers();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    filterAndSortReviews();
  }, [reviews, searchQuery, selectedCategory, sortBy]);

  const loadContentData = async (uid) => {
    if (!uid) {
      console.log('No UID provided');
      return null;
    }

    const lastLetter = uid.charAt(uid.length - 1).toUpperCase();
    const tableMap = {
      A: 'Ani_data',
      M: 'Manga_data',
      H: 'Manhwa_data',
      U: 'Manhua_data',
      D: 'Donghua_data',
      W: 'Webnovel_data',
    };

    const tableName = tableMap[lastLetter];
    console.log('Loading content for UID:', uid, 'from table:', tableName);
    
    if (!tableName) {
      console.log('No table found for last letter:', lastLetter);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('uid, title, poster')
        .eq('uid', uid)
        .single();

      if (error) {
        console.error('Error loading content data for', uid, ':', error);
        return null;
      }
      
      if (!data) {
        console.log('No data found for UID:', uid);
        return null;
      }
      
      console.log('Loaded content:', data);
      return data;
    } catch (error) {
      console.error('Exception loading content data:', error);
      return null;
    }
  };

  const loadAllReviews = async () => {
    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      if (reviewsData && reviewsData.length > 0) {
        console.log('Loaded reviews:', reviewsData.length);
        console.log('Sample review:', reviewsData[0]);
        
        // Load user data for all reviewers
        const userIds = [...new Set(reviewsData.map(r => r.user_id))];
        const { data: userData, error: userError } = await supabase
          .from('user_data')
          .select('user_id, displayname, profile_pic')
          .in('user_id', userIds);

        if (userError) throw userError;

        // Load vote counts for all reviews
        const reviewIds = reviewsData.map(r => r.id);
        const { data: votes, error: votesError } = await supabase
          .from('review_votes')
          .select('review_id, vote_type');

        if (votesError) console.error('Error loading votes:', votesError);

        // Calculate vote counts
        const voteCounts = {};
        reviewIds.forEach(id => {
          voteCounts[id] = {
            likes: votes?.filter(v => v.review_id === id && v.vote_type === 'like').length || 0,
            dislikes: votes?.filter(v => v.review_id === id && v.vote_type === 'dislike').length || 0,
          };
        });

        // Load content data for all reviews
        console.log('Loading content data for UIDs:', reviewsData.map(r => r.item_uid));
        const contentDataPromises = reviewsData.map(review => loadContentData(review.item_uid));
        const contentDataResults = await Promise.all(contentDataPromises);
        console.log('Content data results:', contentDataResults);

        // Map user data, vote counts, and content data to reviews
        const reviewsWithData = reviewsData.map((review, index) => ({
          ...review,
          userData: userData?.find(u => u.user_id === review.user_id),
          contentData: contentDataResults[index],
          likes: voteCounts[review.id]?.likes || 0,
          dislikes: voteCounts[review.id]?.dislikes || 0,
          helpfulness: (voteCounts[review.id]?.likes || 0) - (voteCounts[review.id]?.dislikes || 0),
        }));

        setReviews(reviewsWithData);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTopReviewers = async () => {
    try {
      // Get review counts per user
      const { data: reviewCounts, error } = await supabase
        .from('reviews')
        .select('user_id');

      if (error) throw error;

      // Count reviews per user
      const userReviewCounts = {};
      reviewCounts?.forEach(review => {
        userReviewCounts[review.user_id] = (userReviewCounts[review.user_id] || 0) + 1;
      });

      // Get top 5 users
      const topUserIds = Object.entries(userReviewCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([userId]) => userId);

      // Load user data for top reviewers
      const { data: userData, error: userError } = await supabase
        .from('user_data')
        .select('user_id, displayname, profile_pic')
        .in('user_id', topUserIds);

      if (userError) throw userError;

      // Combine data
      const topReviewersData = topUserIds.map((userId, index) => ({
        rank: index + 1,
        userId,
        reviewCount: userReviewCounts[userId],
        userData: userData?.find(u => u.user_id === userId),
      }));

      setTopReviewers(topReviewersData);
    } catch (err) {
      console.error('Error loading top reviewers:', err);
    }
  };

  const filterAndSortReviews = () => {
    let filtered = [...reviews];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(review => review.item_category === selectedCategory);
    }

    // Filter by search query (search in review text or item title)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(review =>
        review.review_text?.toLowerCase().includes(query) ||
        review.contentData?.title?.toLowerCase().includes(query) ||
        review.userData?.displayname?.toLowerCase().includes(query)
      );
    }

    // Sort reviews
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'highest-rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest-rating':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'most-helpful':
        filtered.sort((a, b) => b.helpfulness - a.helpfulness);
        break;
      default:
        break;
    }

    setFilteredReviews(filtered);
  };

  const handleReviewClick = (review) => {
    if (review.item_uid) {
      router.push(`/details/${review.item_uid}`);
    }
  };

  const handleUserClick = (userId) => {
    setSelectedUser(userId);
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Award className="text-orange-600" size={24} />;
      default:
        return <Star className="text-blue-500" size={20} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} transition-colors duration-500 py-16 sm:py-24`}>
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black mb-4 ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            All
            <span className="block sm:inline sm:ml-4 mt-2 sm:mt-0 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              Reviews
            </span>
          </h1>
          <p className={`text-base sm:text-lg ${isDark ? 'text-white/60' : 'text-black/60'} max-w-2xl`}>
            Explore what the community thinks about your favorite content
          </p>
        </div>

        {/* Top Reviewers Section */}
        <div className={`mb-8 sm:mb-12 p-4 sm:p-6 rounded-2xl ${
          isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
        } backdrop-blur-xl`}>
          <h2 className={`text-xl sm:text-2xl font-black mb-4 sm:mb-6 ${isDark ? 'text-white' : 'text-black'} flex items-center gap-2`}>
            <Trophy className="text-yellow-500" />
            Top Reviewers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {topReviewers.map((reviewer) => (
              <div
                key={reviewer.userId}
                onClick={() => handleUserClick(reviewer.userId)}
                className={`flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                  isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'
                }`}
              >
                <div className="relative mb-3">
                  {getRankIcon(reviewer.rank)}
                  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    reviewer.rank === 1 ? 'bg-yellow-500 text-white' :
                    reviewer.rank === 2 ? 'bg-gray-400 text-white' :
                    reviewer.rank === 3 ? 'bg-orange-600 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {reviewer.rank}
                  </div>
                </div>
                {reviewer.userData?.profile_pic ? (
                  <img
                    src={reviewer.userData.profile_pic}
                    alt={reviewer.userData.displayname}
                    className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-purple-500"
                  />
                ) : (
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                    isDark ? 'bg-white/10' : 'bg-black/10'
                  }`}>
                    <User size={32} className={isDark ? 'text-white/60' : 'text-black/60'} />
                  </div>
                )}
                <div className={`font-bold text-center ${isDark ? 'text-white' : 'text-black'}`}>
                  {reviewer.userData?.displayname || 'Anonymous'}
                </div>
                <div className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  {reviewer.reviewCount} reviews
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-white/60' : 'text-black/60'
            }`} size={20} />
            <input
              type="text"
              placeholder="Search reviews, titles, or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-full font-medium transition-all duration-300 ${
                isDark 
                  ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10 placeholder-white/40' 
                  : 'bg-black/5 hover:bg-black/10 text-black border border-black/10 placeholder-black/40'
              } backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all duration-300 whitespace-nowrap ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105' 
                      : isDark 
                        ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10' 
                        : 'bg-black/5 hover:bg-black/10 text-black/60 hover:text-black border border-black/10'
                  } backdrop-blur-xl`}
                >
                  <Icon size={16} />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Sort Options and Results Count */}
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4 justify-between">
            <div className="flex items-center gap-2">
              <Filter size={20} className={isDark ? 'text-white/60' : 'text-black/60'} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`text-sm sm:text-base px-3 sm:px-4 py-2 rounded-full font-bold transition-all duration-300 ${
                  isDark 
                    ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' 
                    : 'bg-black/5 hover:bg-black/10 text-black border border-black/10'
                } backdrop-blur-xl cursor-pointer`}
              >
                <option value="latest">Latest Reviews</option>
                <option value="highest-rating">Highest Rating</option>
                <option value="lowest-rating">Lowest Rating</option>
                <option value="most-helpful">Most Helpful</option>
              </select>
            </div>

            <div className={`text-sm sm:text-base px-3 sm:px-4 py-2 rounded-full ${
              isDark ? 'bg-white/5 text-white/60 border border-white/10' : 'bg-black/5 text-black/60 border border-black/10'
            } backdrop-blur-xl`}>
              <span className="font-bold">{filteredReviews.length}</span> Reviews
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-16">
              <div className={`text-6xl mb-4 ${isDark ? 'text-white/20' : 'text-black/20'}`}>
                <Star size={64} className="mx-auto" />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                No reviews found
              </h3>
              <p className={`${isDark ? 'text-white/60' : 'text-black/60'}`}>
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review.id}
                className={`p-4 sm:p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                  isDark ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-black/5 hover:bg-black/10 border border-black/10'
                } backdrop-blur-xl`}
              >
                {/* Review Header */}
                <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1">
                    {/* Content Poster */}
                    <div
                      onClick={() => handleReviewClick(review)}
                      className="cursor-pointer group flex-shrink-0"
                    >
                      {review.contentData?.poster ? (
                        <img
                          src={review.contentData.poster}
                          alt={review.contentData.title}
                          className="w-24 h-32 sm:w-32 sm:h-48 rounded-lg object-cover border-2 border-purple-500 group-hover:border-purple-400 transition-colors shadow-lg"
                        />
                      ) : (
                        <div className={`w-24 h-32 sm:w-32 sm:h-48 rounded-lg flex items-center justify-center ${
                          isDark ? 'bg-white/10' : 'bg-black/10'
                        } border-2 border-purple-500`}>
                          <BookOpen size={32} className={`sm:size-12 ${isDark ? 'text-white/60' : 'text-black/60'}`} />
                        </div>
                      )}
                    </div>

                    {/* User Avatar */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserClick(review.user_id);
                      }}
                      className="cursor-pointer flex-shrink-0"
                    >
                      {review.userData?.profile_pic ? (
                        <img
                          src={review.userData.profile_pic}
                          alt={review.userData.displayname}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-cyan-500"
                        />
                      ) : (
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                          isDark ? 'bg-white/10' : 'bg-black/10'
                        }`}>
                          <User size={20} className={`sm:size-6 ${isDark ? 'text-white/60' : 'text-black/60'}`} />
                        </div>
                      )}
                    </div>

                    {/* User Info and Content */}
                    <div className="flex-1 min-w-0">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(review.user_id);
                        }}
                        className="cursor-pointer"
                      >
                        <div className={`text-sm sm:text-base font-bold ${isDark ? 'text-white hover:text-purple-400' : 'text-black hover:text-purple-600'} transition-colors`}>
                          {review.userData?.displayname || 'Anonymous'}
                        </div>
                      </div>
                      
                      <div
                        onClick={() => handleReviewClick(review)}
                        className="cursor-pointer group"
                      >
                        <div className={`text-xs sm:text-sm ${isDark ? 'text-white/60 group-hover:text-white/80' : 'text-black/60 group-hover:text-black/80'} mb-1 transition-colors`}>
                          reviewed <span className="font-semibold">{review.contentData?.title || 'Unknown Content'}</span>
                          <span className="mx-2">•</span>
                          <span className="capitalize">{review.item_category}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              
                              className={`sm:w-4 sm:h-4 ${star <= review.rating ? 'text-yellow-400' : isDark ? 'text-white/20' : 'text-black/20'}`}
                              fill={star <= review.rating ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                        <span className={`text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-black/60'} flex items-center gap-1`}>
                          <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
                          {formatDate(review.created_at)}
                        </span>
                      </div>

                      {review.review_text && (
                        <p className={`text-sm sm:text-base ${isDark ? 'text-white/80' : 'text-black/80'} leading-relaxed`}>
                          {review.review_text}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Helpfulness Votes */}
                  <div className="flex sm:flex-col flex-row gap-2 sm:gap-2">
                    <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full ${
                      isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-500/20 text-green-600'
                    }`}>
                      <ThumbsUp size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span className="text-xs sm:text-sm font-bold">{review.likes}</span>
                    </div>
                    <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full ${
                      isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-500/20 text-red-600'
                    }`}>
                      <ThumbsDown size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span className="text-xs sm:text-sm font-bold">{review.dislikes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfile
          isDark={isDark}
          userId={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
