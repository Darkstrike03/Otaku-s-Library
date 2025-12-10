'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Star, Send, Trash2, Edit2, ThumbsUp, ThumbsDown } from 'lucide-react';
import UserProfile from './UserProfile';

export default function ReviewSection({ isDark, uid, category, currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userVotes, setUserVotes] = useState({}); // { reviewId: 'like' | 'dislike' | null }

  // Form states
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Load reviews
  useEffect(() => {
    loadReviews();
  }, [uid]);

  // Add this useEffect to load user data for reviews
  useEffect(() => {
    loadReviews();
  }, [uid]);

  const loadUserDataForReviews = async (userIds) => {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('user_id, displayname, profile_pic')
        .in('user_id', userIds);

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error loading user data:', err);
      return [];
    }
  };

  // Update loadReviews function
  const loadReviews = async () => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('item_uid', uid)
      .eq('item_category', category)  // ✅ Filter by category
      .order('created_at', { ascending: false });

      if (error) throw error;

      // Load user data for all reviewers
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(r => r.user_id))];
        const userData = await loadUserDataForReviews(userIds);
        
        // Map user data to reviews
        const reviewsWithUsers = data.map(review => ({
          ...review,
          userData: userData.find(u => u.user_id === review.user_id)
        }));
        
        setReviews(reviewsWithUsers);

        // Check if current user has a review
        if (currentUser) {
          const userRev = reviewsWithUsers.find(r => r.user_id === currentUser.id);
          if (userRev) {
            setUserReview(userRev);
            setRating(userRev.rating);
            setReviewText(userRev.review_text || '');
          }
        }
      } else {
        setReviews(data || []);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // Replace the updateAverageRating function with this improved version
const updateAverageRating = async (itemUid) => {
  try {
    console.log(`Starting updateAverageRating for ${itemUid} in category: ${category}`);
    
    // Get all reviews for THIS category and uid
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('item_uid', itemUid)
      .eq('item_category', category);

    if (reviewsError) throw reviewsError;

    console.log(`Found ${reviews?.length || 0} reviews for ${itemUid}`);

    // Determine table name based on category (with correct capitalization)
    let tableName = 'Ani_data';
    if (category === 'manga') tableName = 'Manga_data';
    if (category === 'novel') tableName = 'Webnovel_data';
    if (category === 'manhwa') tableName = 'Manhwa_data';
    if (category === 'manhua') tableName = 'Manhua_data';
    if (category === 'donghua') tableName = 'Donghua_data';

    const reviewCount = reviews?.length || 0;
    const reviewsTotal = reviews?.reduce((sum, r) => sum + r.rating, 0) || 0;

    // Calculate community rating (average of all reviews)
    let communityRating;
    if (reviewCount === 0) {
      communityRating = 0;
    } else {
      communityRating = (reviewsTotal / reviewCount).toFixed(2);
    }

    console.log(`Calculated rating: ${communityRating} from ${reviewCount} reviews`);
    console.log(`Updating ${tableName} where uid = ${itemUid}`);

    // Check if the item exists first
    const { data: existingItem, error: checkError } = await supabase
      .from(tableName)
      .select('uid, rating')
      .eq('uid', itemUid)
      .single();

    if (checkError) {
      console.error(`Item not found in ${tableName}:`, checkError);
      return;
    }

    console.log(`Found existing item. Current rating: ${existingItem.rating}`);

    // Update the rating in the database with ONLY community rating
    const { data: updateData, error: updateError } = await supabase
      .from(tableName)
      .update({
        rating: parseFloat(communityRating),
        review_count: reviewCount,
      })
      .eq('uid', itemUid)
      .select();

    if (updateError) throw updateError;

    console.log(`✅ Successfully updated ${tableName}: ${itemUid}`);
    console.log(`New rating: ${communityRating} (${reviewCount} reviews)`);
    console.log('Updated data:', updateData);
  } catch (err) {
    console.error('Error updating average rating:', err);
    setError(`Failed to update rating: ${err.message}`);
  }
};

  const handleSubmitReview = async () => {
    if (!currentUser) {
      setError('Please login to post a review');
      return;
    }

    if (!rating) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const reviewData = {
        user_id: currentUser.id,
        item_uid: uid,
        item_category: category,
        rating: rating,
        review_text: reviewText.trim() || null,
      };

      if (isEditing && userReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update(reviewData)
          .eq('id', userReview.id);

        if (error) throw error;
        setSuccess('Review updated successfully!');
        setIsEditing(false);
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert([reviewData]);

        if (error) {
          if (error.code === '23505') {
            setError('You already have a review. Edit it instead.');
          } else {
            throw error;
          }
          setSubmitting(false);
          return;
        }
        setSuccess('Review posted successfully!');
      }

      // Update average rating in ani_data
      await updateAverageRating(uid);

      // Reset form
      setRating(0);
      setReviewText('');
      setTimeout(() => {
        loadReviews();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete your review?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      setSuccess('Review deleted');
      setUserReview(null);
      setRating(0);
      setReviewText('');
      
      // Update average rating in ani_data
      await updateAverageRating(uid);
      
      loadReviews();
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  // Add this useEffect to load user votes
  useEffect(() => {
    if (currentUser) {
      loadUserVotes();
    }
  }, [currentUser]);

  const loadUserVotes = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('review_votes')
        .select('review_id, vote_type')
        .eq('user_id', currentUser.id);

      if (error) throw error;

      const votesMap = {};
      data?.forEach(vote => {
        votesMap[vote.review_id] = vote.vote_type;
      });
      setUserVotes(votesMap);
    } catch (err) {
      console.error('Error loading user votes:', err);
    }
  };

  const handleVoteReview = async (reviewId, voteType) => {
    if (!currentUser) {
      setError('Please login to vote');
      return;
    }

    const review = reviews.find(r => r.id === reviewId);
    if (review.user_id === currentUser.id) {
      setError('You cannot vote on your own reviews');
      return;
    }

    try {
      const currentVote = userVotes[reviewId];

      // If clicking the same vote, remove it
      if (currentVote === voteType) {
        await supabase
          .from('review_votes')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', currentUser.id);

        setUserVotes(prev => ({
          ...prev,
          [reviewId]: null
        }));
      } else {
        // Upsert the vote (insert or update)
        const { error } = await supabase
          .from('review_votes')
          .upsert(
            {
              review_id: reviewId,
              user_id: currentUser.id,
              vote_type: voteType,
            },
            { onConflict: 'review_id,user_id' }
          );

        if (error) throw error;

        setUserVotes(prev => ({
          ...prev,
          [reviewId]: voteType
        }));
      }

      // Recalculate vote counts
      loadReviews();
    } catch (err) {
      console.error('Error voting on review:', err);
      setError('Failed to save vote');
    }
  };

  // Replace the handleLikeReview function with this
  const handleLikeReview = async (reviewId, currentLikes) => {
    await handleVoteReview(reviewId, 'like');
  };

  const handleDislikeReview = async (reviewId, currentDislikes) => {
    await handleVoteReview(reviewId, 'dislike');
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className={`rounded-2xl lg:rounded-3xl p-4 md:p-6 lg:p-8 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
      
      {/* Header with stats */}
      <div className="mb-6 lg:mb-8">
        <h3 className={`text-2xl md:text-3xl font-black mb-3 md:mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
          Reviews
        </h3>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-white/30'}
                />
              ))}
            </div>
            <span className={`text-xl md:text-2xl font-black ${isDark ? 'text-white' : 'text-black'}`}>
              {averageRating}
            </span>
            <span className={`text-xs md:text-sm ml-2 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              out of 10
            </span>
          </div>
          <span className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
            {reviews.length} review{reviews.length !== 1 ? 's' : ''} from {reviews.length} user{reviews.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Error/Success messages */}
      {error && (
        <div className="p-3 md:p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-xs md:text-sm mb-4 md:mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 md:p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-xs md:text-sm mb-4 md:mb-6">
          {success}
        </div>
      )}

      {/* Review form */}
      <div className={`rounded-xl lg:rounded-2xl p-4 md:p-6 mb-6 lg:mb-8 ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
        <h4 className={`font-bold mb-3 md:mb-4 text-base md:text-lg ${isDark ? 'text-white' : 'text-black'}`}>
          {isEditing ? 'Edit Your Review' : 'Write a Review'}
        </h4>

        {/* Rating selector */}
        <div className="mb-4">
          <label className={`block text-xs md:text-sm font-bold mb-2 ${isDark ? 'text-white/80' : 'text-black/80'}`}>
            Rating *
          </label>
          <div className="flex gap-1 md:gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={20}
                  className={`md:w-7 md:h-7 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : isDark
                      ? 'text-white/30'
                      : 'text-black/30'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className={`text-xs mt-2 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
            {rating ? `You rated: ${rating}/10` : 'Select a rating'}
          </p>
        </div>

        {/* Review text */}
        <div className="mb-4">
          <label className={`block text-xs md:text-sm font-bold mb-2 ${isDark ? 'text-white/80' : 'text-black/80'}`}>
            Review (Optional)
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your thoughts about this title..."
            className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm resize-none ${
              isDark
                ? 'bg-white/5 text-white placeholder-white/40 border border-white/10 focus:border-purple-500'
                : 'bg-black/5 text-black placeholder-black/40 border border-black/10 focus:border-purple-500'
            } outline-none`}
            rows="4"
            maxLength={500}
          />
          <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
            {reviewText.length}/500
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleSubmitReview}
            disabled={submitting || !rating}
            className={`flex-1 px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm md:text-base font-bold flex items-center justify-center gap-2 transition-all ${
              submitting || !rating
                ? 'bg-gray-500 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105'
            }`}
          >
            <Send size={16} />
            {submitting ? 'Posting...' : isEditing ? 'Update Review' : 'Post Review'}
          </button>
          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                setRating(userReview?.rating || 0);
                setReviewText(userReview?.review_text || '');
              }}
              className={`flex-1 sm:flex-none px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm md:text-base font-bold transition-all ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-black/10 hover:bg-black/20 text-black'
              }`}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3 md:space-y-4">
        {loading ? (
          <p className={isDark ? 'text-white/60' : 'text-black/60'}>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className={isDark ? 'text-white/60' : 'text-black/60'}>No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className={`p-3 md:p-4 rounded-lg lg:rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}
            >
              {/* User info header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 md:gap-3 flex-1">
                  <img
                    src={review.userData?.profile_pic || '/default-avatar.png'}
                    alt={review.userData?.displayname || 'User'}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => setSelectedUser(review.user_id)}
                      className={`text-sm md:text-base font-bold truncate hover:underline transition-all ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600'}`}
                    >
                      {review.userData?.displayname || 'Anonymous'}
                    </button>
                    <p className={`text-xs ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {currentUser?.id === review.user_id && (
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit2 size={14} className="md:w-4 md:h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 size={14} className="md:w-4 md:h-4 text-red-400" />
                    </button>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={`md:w-4 md:h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : isDark ? 'text-white/20' : 'text-black/20'}`}
                    />
                  ))}
                </div>
                <span className={`text-xs md:text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                  {review.rating}/10
                </span>
              </div>

              {/* Review text */}
              {review.review_text && (
                <p className={`mb-3 text-xs md:text-sm ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                  {review.review_text}
                </p>
              )}

              {/* Like/Dislike buttons */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleVoteReview(review.id, 'like')}
                  disabled={review.user_id === currentUser?.id}
                  className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg transition-all text-xs md:text-sm ${
                    userVotes[review.id] === 'like'
                      ? isDark ? 'bg-green-500/30 text-green-400' : 'bg-green-500/30 text-green-600'
                      : isDark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-black/10 text-black/70'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={review.user_id === currentUser?.id ? "Can't vote on your own review" : "Like"}
                >
                  <ThumbsUp size={12} className="md:w-4 md:h-4" />
                  <span>{review.likes || 0}</span>
                </button>

                <button
                  onClick={() => handleVoteReview(review.id, 'dislike')}
                  disabled={review.user_id === currentUser?.id}
                  className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg transition-all text-xs md:text-sm ${
                    userVotes[review.id] === 'dislike'
                      ? isDark ? 'bg-red-500/30 text-red-400' : 'bg-red-500/30 text-red-600'
                      : isDark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-black/10 text-black/70'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={review.user_id === currentUser?.id ? "Can't vote on your own review" : "Dislike"}
                >
                  <ThumbsDown size={12} className="md:w-4 md:h-4" />
                  <span>{review.dislikes || 0}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedUser && (
        <UserProfile
          isDark={isDark}
          userId={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}