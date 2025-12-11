'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Heart, Bookmark, Star, TrendingUp, Play, CheckCircle, BookmarkPlus, Hourglass, PauseCircle, XCircle, Clock, Edit, LogOut, Settings, Share2, 
  Calendar, MapPin, Award, Flame, Eye, MessageCircle,
  User, Mail, Globe, Github, Twitter, Instagram, Sparkles, Crown, Target, BookOpen, X, Lock, Shield
} from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { getJsonFile } from '@/lib/pages';
import { uploadToImgBB } from '@/lib/imageUpload';
import ProfileEditor from './ProfileEditor';
import LevelXp from './LevelXp';

export default function Profile({ isDark = true }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('favorites');
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [favoritesData, setFavoritesData] = useState([]);
  const [bookmarksData, setBookmarksData] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [activityData, setActivityData] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [userLists, setUserLists] = useState({});
  const [loadingLists, setLoadingLists] = useState(false);
  const [selectedListType, setSelectedListType] = useState('current');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  
  // Onboarding form state
  const [onboardingData, setOnboardingData] = useState({
    username: '',
    displayname: '',
    profile_pic: '',
    banner: ''
  });
  const [onboardingError, setOnboardingError] = useState('');
  const [savingOnboarding, setSavingOnboarding] = useState(false);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    checkUserAndLoadData();
  }, []);

  // Fetch favorites and bookmarks data
  useEffect(() => {
    if (userData) {
      fetchFavoritesData();
      fetchBookmarksData();
    }
  }, [userData]);

  // Fetch activity when tab changes
  useEffect(() => {
    if (activeTab === 'activity' && currentUser) {
      fetchActivityData();
    }
    if (activeTab === 'stats' && currentUser) {
      fetchUserLists();
    }
  }, [activeTab, currentUser]);

  const fetchUserLists = async () => {
    setLoadingLists(true);
    try {
      const { data: lists, error } = await supabase
        .from('user_lists')
        .select('*')
        .eq('user_id', currentUser.id);

      if (error) throw error;

      // Group by status
      const grouped = {
        viewed: [],
        current: [],
        planned: [],
        awaiting: [],
        delayed: [],
        dropped: []
      };

      if (lists && lists.length > 0) {
        // Fetch content details for each list item
        for (const listItem of lists) {
          try {
            const result = await getJsonFile(listItem.content_uid);
            if (result) {
              const item = {
                uid: listItem.content_uid,
                status: listItem.status,
                addedAt: listItem.updated_at,
                title: result.item.title,
                poster: result.item.poster,
                type: listItem.content_type,
                rating: result.item.rating || 'N/A',
                episodes: result.item.episodes || result.item.chapters || 'N/A',
              };

              if (grouped[listItem.status]) {
                grouped[listItem.status].push(item);
              }
            }
          } catch (err) {
            console.error(`Error fetching data for UID ${listItem.content_uid}:`, err);
          }
        }
      }

      setUserLists(grouped);
    } catch (error) {
      console.error('Error fetching user lists:', error);
    } finally {
      setLoadingLists(false);
    }
  };

  const checkUserAndLoadData = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('No user logged in');
        router.push('/login');
        return;
      }

      setCurrentUser(user);

      // Fetch user data from user_data table
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        
        // If no record exists, create one
        if (error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('user_data')
            .insert([
              { 
                user_id: user.id,
                email: user.email || '',
                username: '',
                displayname: '',
                profile_pic: '',
                banner: ''
              }
            ]);
          
          if (insertError) {
            console.error('Error creating user data:', insertError);
          } else {
            // Show onboarding modal for new user
            setShowOnboardingModal(true);
          }
        }
      } else {
        // Check if required fields are filled
        if (!data.username || !data.displayname || !data.profile_pic || !data.banner) {
          setShowOnboardingModal(true);
          setOnboardingData({
            username: data.username || '',
            displayname: data.displayname || '',
            profile_pic: data.profile_pic || '',
            banner: data.banner || ''
          });
        } else {
          // Transform data to match component structure
          setUserData(transformUserData(data));
        }
      }
    } catch (error) {
      console.error('Error in checkUserAndLoadData:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch actual data for favorites using UIDs
  const fetchFavoritesData = async () => {
    setLoadingFavorites(true);
    try {
      const { data } = await supabase
        .from('user_data')
        .select('favourites')
        .eq('user_id', currentUser.id)
        .single();

      if (data?.favourites) {
        const uids = data.favourites.split(',').map(u => u.trim()).filter(u => u);
        const favoriteItems = [];

        for (const uid of uids) {
          try {
            const result = await getJsonFile(uid);
            if (result) {
              favoriteItems.push({
                uid,
                title: result.item.title,
                poster: result.item.poster,
                type: result.category,
                rating: result.item.rating || 'N/A',
              });
            }
          } catch (err) {
            console.error(`Error fetching data for UID ${uid}:`, err);
          }
        }

        setFavoritesData(favoriteItems);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Fetch actual data for bookmarks using UIDs
  const fetchBookmarksData = async () => {
    setLoadingBookmarks(true);
    try {
      const { data } = await supabase
        .from('user_data')
        .select('bookmarks')
        .eq('user_id', currentUser.id)
        .single();

      if (data?.bookmarks) {
        const uids = data.bookmarks.split(',').map(u => u.trim()).filter(u => u);
        const bookmarkItems = [];

        for (const uid of uids) {
          try {
            const result = await getJsonFile(uid);
            if (result) {
              bookmarkItems.push({
                uid,
                title: result.item.title,
                poster: result.item.poster,
                type: result.category,
                episodes: result.item.episodes,
                status: result.item.status,
                rating: result.item.rating || 'N/A',
              });
            }
          } catch (err) {
            console.error(`Error fetching data for UID ${uid}:`, err);
          }
        }

        setBookmarksData(bookmarkItems);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoadingBookmarks(false);
    }
  };

  // Fetch activity when tab changes
  useEffect(() => {
    if (activeTab === 'activity' && currentUser) {
      fetchActivityData();
    }
  }, [activeTab, currentUser]);

  const fetchActivityData = async () => {
    setLoadingActivity(true);
    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (reviews && reviews.length > 0) {
        const activities = [];

        for (const review of reviews) {
          try {
            const result = await getJsonFile(review.item_uid);
            if (result) {
              activities.push({
                id: review.id,
                item_uid: review.item_uid,
                item_category: review.item_category,
                rating: review.rating,
                review_text: review.review_text,
                created_at: review.created_at,
                likes: review.likes || 0,
                dislikes: review.dislikes || 0,
                title: result.item.title,
                poster: result.item.poster,
                type: result.category,
              });
            }
          } catch (err) {
            console.error(`Error fetching data for UID ${review.item_uid}:`, err);
          }
        }

        setActivityData(activities);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const checkIfOwner = (username) => {
    return username?.toLowerCase() === 'otaku-s-librarian';
  };

  const transformUserData = (data) => {
    const owner = checkIfOwner(data.username);
    setIsOwner(owner);
    
    return {
      username: data.username || 'User',
      displayName: data.displayname || 'New User',
      email: data.email || '',
      bio: data.bio || 'No bio yet.',
      avatar: data.profile_pic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
      banner: data.banner || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920',
      location: data.location || 'Unknown',
      website: data.website || '',
      joinDate: new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      level: parseInt(data.level) || 1,
      badges: parseBadges(data.badges),
      stats: {
        totalWatched: 0,
        totalRead: 0,
        daysSpent: 0,
        reviews: 0,
        followers: 0,
        following: 0
      },
      socialLinks: {
        twitter: '',
        github: '',
        instagram: ''
      },
    };
  };

  const parseBadges = (badgesString) => {
    if (!badgesString) return [];
    try {
      return JSON.parse(badgesString);
    } catch {
      return [];
    }
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setOnboardingError('');
    setSavingOnboarding(true);

    // Validation
    if (!onboardingData.username.trim()) {
      setOnboardingError('Username is required');
      setSavingOnboarding(false);
      return;
    }

    if (!onboardingData.displayname.trim()) {
      setOnboardingError('Display name is required');
      setSavingOnboarding(false);
      return;
    }

    if (!onboardingData.profile_pic.trim()) {
      setOnboardingError('Profile picture URL is required');
      setSavingOnboarding(false);
      return;
    }

    if (!onboardingData.banner.trim()) {
      setOnboardingError('Banner URL is required');
      setSavingOnboarding(false);
      return;
    }

    // Validate URLs
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(onboardingData.profile_pic)) {
      setOnboardingError('Profile picture must be a valid URL (starting with http:// or https://)');
      setSavingOnboarding(false);
      return;
    }

    if (!urlPattern.test(onboardingData.banner)) {
      setOnboardingError('Banner must be a valid URL (starting with http:// or https://)');
      setSavingOnboarding(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('user_data')
        .update({
          username: onboardingData.username.trim(),
          displayname: onboardingData.displayname.trim(),
          profile_pic: onboardingData.profile_pic.trim(),
          banner: onboardingData.banner.trim()
        })
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error updating user data:', error);
        setOnboardingError('Failed to save profile. Please try again.');
        return;
      }

      // Reload data and close modal
      setShowOnboardingModal(false);
      checkUserAndLoadData();
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      setOnboardingError('Failed to save profile. Please try again.');
    } finally {
      setSavingOnboarding(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout failed:', error.message);
      alert('Failed to log out. Please try again.');
    } else {
      router.push('/');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmNewPassword) {
      alert('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password update failed:', error.message);
        alert('Failed to update password: ' + error.message);
        return;
      }

      alert('Password updated successfully!');
      setShowSettingsModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Password update error:', error);
      alert('Failed to update password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const tabs = [
    { id: 'favorites', label: 'Favorites', icon: Heart, count: favoritesData.length },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, count: bookmarksData.length },
    { id: 'activity', label: 'Activity', icon: TrendingUp, count: null },
    { id: 'stats', label: 'Statistics', icon: Award, count: null },
  ];

  const getTypeColor = (type) => {
    const colors = {
      anime: 'from-purple-500 to-pink-500',
      manga: 'from-cyan-500 to-blue-500',
      manhwa: 'from-pink-500 to-rose-500',
      manhua: 'from-yellow-500 to-orange-500',
      donghua: 'from-green-500 to-emerald-500',
      webnovel: 'from-indigo-500 to-violet-500'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };


  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Onboarding Modal */}
      {showOnboardingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
          <div className={`relative w-full max-w-md rounded-3xl overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl my-8`}>
            {/* Gradient Header */}
            <div className="relative h-24 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center">
                  <Crown size={32} className="text-white mx-auto mb-1" />
                  <h2 className="text-2xl font-black text-white">Complete Profile</h2>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
              {onboardingError && (
                <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                  {onboardingError}
                </div>
              )}

              {/* Success Notification */}
              {onboardingData.profile_pic && !onboardingError && (
                <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
                  <span>✓</span>
                  Profile picture uploaded successfully!
                </div>
              )}

              {onboardingData.banner && !onboardingError && (
                <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
                  <span>✓</span>
                  Banner uploaded successfully!
                </div>
              )}

              <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    Username *
                  </label>
                  <input
                    type="text"
                    value={onboardingData.username}
                    onChange={(e) => setOnboardingData({ ...onboardingData, username: e.target.value })}
                    placeholder="otakumaster123"
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isDark
                        ? 'bg-white/5 text-white placeholder-white/40 border-2 border-white/10 focus:border-purple-500'
                        : 'bg-black/5 text-black placeholder-black/40 border-2 border-black/10 focus:border-purple-500'
                    } outline-none`}
                    required
                  />
                </div>

                {/* Display Name */}
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={onboardingData.displayname}
                    onChange={(e) => setOnboardingData({ ...onboardingData, displayname: e.target.value })}
                    placeholder="The Legendary Weeb"
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isDark
                        ? 'bg-white/5 text-white placeholder-white/40 border-2 border-white/10 focus:border-purple-500'
                        : 'bg-black/5 text-black placeholder-black/40 border-2 border-black/10 focus:border-purple-500'
                    } outline-none`}
                    required
                  />
                </div>

                {/* Profile Picture Upload */}
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    Profile Picture *
                  </label>
                  <div className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
                    isDark
                      ? 'border-purple-500/50 hover:border-purple-500 hover:bg-purple-500/10'
                      : 'border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/5'
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadingProfilePic(true);
                          try {
                            setOnboardingError('');
                            const url = await uploadToImgBB(file);
                            setOnboardingData({ ...onboardingData, profile_pic: url });
                            setUploadingProfilePic(false);
                          } catch (error) {
                            setOnboardingError('Failed to upload: ' + error.message);
                            setUploadingProfilePic(false);
                          }
                        }
                      }}
                      className="hidden"
                      id="profile-pic-input"
                    />
                    <label htmlFor="profile-pic-input" className="cursor-pointer">
                      {uploadingProfilePic ? (
                        <div className="space-y-2">
                          <div className="w-16 h-16 rounded-lg mx-auto bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse flex items-center justify-center">
                            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <p className={`text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                            Uploading...
                          </p>
                        </div>
                      ) : onboardingData.profile_pic ? (
                        <div className="space-y-2">
                          <img 
                            src={onboardingData.profile_pic} 
                            alt="Preview" 
                            className="w-16 h-16 rounded-lg mx-auto object-cover"
                          />
                          <p className={`text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                            Click to change
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-2xl">🖼️</div>
                          <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                            Upload image
                          </p>
                          <p className={`text-[10px] ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Banner Upload */}
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    Banner *
                  </label>
                  <div className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
                    isDark
                      ? 'border-purple-500/50 hover:border-purple-500 hover:bg-purple-500/10'
                      : 'border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/5'
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadingBanner(true);
                          try {
                            setOnboardingError('');
                            const url = await uploadToImgBB(file);
                            setOnboardingData({ ...onboardingData, banner: url });
                            setUploadingBanner(false);
                          } catch (error) {
                            setOnboardingError('Failed to upload: ' + error.message);
                            setUploadingBanner(false);
                          }
                        }
                      }}
                      className="hidden"
                      id="banner-input"
                    />
                    <label htmlFor="banner-input" className="cursor-pointer">
                      {uploadingBanner ? (
                        <div className="space-y-2">
                          <div className="w-full h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse flex items-center justify-center">
                            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <p className={`text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                            Uploading banner...
                          </p>
                        </div>
                      ) : onboardingData.banner ? (
                        <div className="space-y-2">
                          <img 
                            src={onboardingData.banner} 
                            alt="Preview" 
                            className="w-full h-16 rounded-lg object-cover"
                          />
                          <p className={`text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                            Click to change
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-2xl">🎨</div>
                          <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                            Upload banner
                          </p>
                          <p className={`text-[10px] ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                            1920x400px recommended
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={savingOnboarding || !onboardingData.profile_pic || !onboardingData.banner}
                  className={`w-full py-3 rounded-lg font-bold text-white text-sm transition-all ${
                    savingOnboarding || !onboardingData.profile_pic || !onboardingData.banner
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  }`}
                >
                  {savingOnboarding ? 'Saving...' : 'Complete Profile'}
                </button>
              </form>

              <p className={`text-center text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                All fields required
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Profile Content (only shows if userData is loaded) */}
      {userData && (
        <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'}`}>
          {/* Banner with Owner Indicator */}
          <div className="relative h-64 sm:h-80 overflow-hidden group">
            <img src={userData.banner} alt="Banner" className="w-full h-full object-cover" />
            <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-black via-black/60 to-transparent' : 'bg-gradient-to-t from-white via-white/60 to-transparent'}`}></div>
            
            {/* Owner Badge */}
            {isOwner && (
              <div className="absolute top-4 left-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full blur-xl opacity-75 animate-pulse"></div>
                  <div className={`relative px-4 py-2 rounded-full flex items-center gap-2 ${isDark ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-xl border-2 border-yellow-500/50`}>
                    <Crown size={18} className="text-yellow-400 animate-bounce" />
                    <span className="text-sm font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      LIBRARY OWNER
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="absolute top-4 right-4 flex gap-2">
              <button className={`p-3 rounded-xl transition-all hover:scale-110 ${isDark ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' : 'bg-black/10 hover:bg-black/20 text-black border border-black/20'} backdrop-blur-xl`}>
                <Share2 size={20} />
              </button>
              <button 
                onClick={() => setShowSettingsModal(true)}
                className={`p-3 rounded-xl transition-all hover:scale-110 ${isDark ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' : 'bg-black/10 hover:bg-black/20 text-black border border-black/20'} backdrop-blur-xl`}
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 -mt-20 relative z-10">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end mb-8">
              {/* Avatar with special styling for owner */}
              <div className="relative group">
                {isOwner ? (
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-3xl blur-lg opacity-100 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
                ) : (
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition duration-500"></div>
                )}
                
                <div className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-4 ${isOwner ? 'border-yellow-500/80' : isDark ? 'border-black' : 'border-white'} shadow-2xl`}>
                  <img src={userData.avatar} alt={userData.username} className="w-full h-full object-cover" />
                  <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Edit size={24} className="text-white" />
                  </button>
                </div>
                
                {/* Level Badge with special styling for owner */}
                <div className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg ${
                  isOwner 
                    ? 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 animate-bounce' 
                    : 'bg-gradient-to-br from-yellow-500 to-orange-500'
                }`}>
                  {userData.level}
                </div>

                {/* Owner Crown Icon */}
                {isOwner && (
                  <div className="absolute -top-3 -right-3 animate-bounce">
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-500 rounded-full blur-lg opacity-75"></div>
                      <div className="relative bg-black/80 backdrop-blur-xl rounded-full p-1.5 border border-yellow-500/50">
                        <Crown size={20} className="text-yellow-400" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className={`text-3xl sm:text-4xl font-black ${isDark ? 'text-white' : 'text-black'}`}>
                    {userData.displayName}
                    {isOwner && <span className="ml-2 text-yellow-400">👑</span>}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    isOwner
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/50'
                      : isDark
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-purple-500/20 text-purple-600 border border-purple-500/30'
                  }`}>
                    @{userData.username}
                  </span>
                  
                  {/* Owner Status Badge */}
                  {isOwner && (
                    <div className={`px-4 py-1.5 rounded-full text-sm font-black flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 backdrop-blur-xl`}>
                      <Crown size={16} className="text-yellow-400" fill="currentColor" />
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        Library Creator
                      </span>
                    </div>
                  )}
                </div>

                {userData.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {userData.badges.map((badge, i) => {
                      const Icon = badge.icon;
                      return (
                        <div key={i} className={`px-3 py-1.5 rounded-xl flex items-center gap-2 bg-gradient-to-r ${badge.color} text-white text-sm font-bold shadow-lg`}>
                          <Icon size={14} />
                          {badge.name}
                        </div>
                      );
                    })}
                  </div>
                )}

          
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                onClick={() => setShowProfileEditor(true)}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 ${
                  isOwner
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white'
                    : isDark
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                } backdrop-blur-xl flex items-center gap-2 justify-center`}
              >
                <Edit size={18} />
                Edit Profile
              </button>

                <button
                  onClick={handleLogout}
                  className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 ${
                    isDark
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                      : 'bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20'
                  } backdrop-blur-xl flex items-center gap-2 justify-center`}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>

            {/* Rest of existing profile content */}
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                {/* Level & XP Card - NEW */}
                <LevelXp 
                  userId={currentUser?.id} 
                  isDark={isDark}
                />

                {/* About Section */}
                <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                  <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    <User size={20} className="text-purple-400" />About
                  </h3>
                  <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-white/80' : 'text-black/80'}`}>{userData.bio}</p>

                  <div className="space-y-3">
                    {[
                      { icon: Calendar, label: 'Joined', value: userData.joinDate },
                      { icon: MapPin, label: 'Location', value: userData.location },
                      { icon: Globe, label: 'Website', value: userData.website },
                      { icon: Mail, label: 'Email', value: userData.email },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <Icon size={16} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                          <div>
                            <div className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>{item.label}</div>
                            <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>{item.value}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Social Links */}
                <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                  <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Globe size={20} className="text-cyan-400" />Social Links
                  </h3>
                  <div className="space-y-3">
                    {[
                      { icon: Twitter, label: 'Twitter', value: userData.socialLinks.twitter, color: 'text-blue-400' },
                      { icon: Github, label: 'GitHub', value: userData.socialLinks.github, color: isDark ? 'text-white' : 'text-black' },
                      { icon: Instagram, label: 'Instagram', value: userData.socialLinks.instagram, color: 'text-pink-400' },
                    ].map((social, i) => {
                      const Icon = social.icon;
                      return (
                        <a key={i} href="#" className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-105 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}>
                          <Icon size={20} className={social.color} />
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>{social.value || 'Not connected'}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>

                
                {/* Community Stats */}
                <div className={`rounded-2xl p-6 mb-3 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                  <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Sparkles size={20} className="text-pink-400" />Community
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Followers', value: userData.stats.followers.toLocaleString() },
                      { label: 'Following', value: userData.stats.following.toLocaleString() },
                    ].map((stat, i) => (
                      <div key={i} className="text-center">
                        <div className={`text-2xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r ${isDark ? 'from-purple-400 to-pink-400' : 'from-purple-600 to-pink-600'}`}>{stat.value}</div>
                        <div className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="lg:col-span-8">
                <div className="flex flex-wrap gap-3 mb-8 border-b border-white/10 pb-4">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${isActive ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105' : isDark ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-black/60 hover:text-black'}`}>
                        <Icon size={18} />{tab.label}
                        {tab.count !== null && <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-white/20' : isDark ? 'bg-white/10' : 'bg-black/10'}`}>{tab.count}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Favorites Tab */}
                {activeTab === 'favorites' && (
                  <div>
                    {loadingFavorites ? (
                      <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className={isDark ? 'text-white/60' : 'text-black/60'}>Loading favorites...</p>
                      </div>
                    ) : favoritesData.length === 0 ? (
                      <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                        <Heart size={48} className={`mx-auto mb-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                        <h3 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-black'}`}>No Favorites Yet</h3>
                        <p className={`${isDark ? 'text-white/60' : 'text-black/60'}`}>Start adding your favorite content!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        {favoritesData.map((item) => (
                          <Link 
                            key={item.uid}
                            href={`/details/${item.uid}`}
                            className={`group relative rounded-2xl overflow-hidden transition-all hover:scale-105 cursor-pointer ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}
                          >
                            <div className="relative aspect-[3/4] overflow-hidden">
                              <img
                                src={item.poster}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black via-black/60 to-transparent' : 'from-white via-white/60 to-transparent'}`}></div>
                              <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-gradient-to-r ${getTypeColor(item.type)} text-white`}>
                                {item.type}
                              </div>
                              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full flex items-center gap-1 ${isDark ? 'bg-black/60' : 'bg-white/60'} backdrop-blur-xl`}>
                                <Star size={12} className="text-yellow-400" fill="currentColor" />
                                <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{item.rating}</span>
                              </div>
                              <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 flex items-center justify-center shadow-lg">
                                <Heart size={16} className="text-white" fill="currentColor" />
                              </div>
                            </div>
                            <div className="p-3">
                              <h4 className={`font-black text-sm line-clamp-2 ${isDark ? 'text-white' : 'text-black'}`}>{item.title}</h4>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Bookmarks Tab */}
                {activeTab === 'bookmarks' && (
                  <div>
                    {loadingBookmarks ? (
                      <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className={isDark ? 'text-white/60' : 'text-black/60'}>Loading bookmarks...</p>
                      </div>
                    ) : bookmarksData.length === 0 ? (
                      <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                        <Bookmark size={48} className={`mx-auto mb-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                        <h3 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-black'}`}>No Bookmarks Yet</h3>
                        <p className={`${isDark ? 'text-white/60' : 'text-black/60'}`}>Start bookmarking content to track your progress!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookmarksData.map((item) => (
                          <a 
                            key={item.uid} 
                            href={`/details/${item.uid}`}
                            className={`group flex gap-4 p-4 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-black/5 hover:bg-black/10 border border-black/10'} backdrop-blur-xl`}
                          >
                            <div className="relative w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden">
                              <img src={item.poster} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h4 className={`font-black text-base line-clamp-1 ${isDark ? 'text-white' : 'text-black'}`}>{item.title}</h4>
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex-shrink-0 bg-gradient-to-r ${getTypeColor(item.type)} text-white`}>{item.type}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${item.status === 'Ongoing' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{item.status}</span>
                                  <span className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>{item.episodes} Episodes</span>
                                </div>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div>
                    {loadingActivity ? (
                      <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className={isDark ? 'text-white/60' : 'text-black/60'}>Loading activity...</p>
                      </div>
                    ) : activityData.length === 0 ? (
                      <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                        <TrendingUp size={48} className={`mx-auto mb-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                        <h3 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-black'}`}>No Activity Yet</h3>
                        <p className={`${isDark ? 'text-white/60' : 'text-black/60'}`}>Your recent activity will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activityData.map((activity) => (
                          <Link 
                            key={activity.id}
                            href={`/details/${activity.item_uid}`}
                            className={`group flex gap-4 p-5 rounded-2xl transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-black/5 hover:bg-black/10 border border-black/10'} backdrop-blur-xl`}
                          >
                            {/* Poster */}
                            <div className="relative w-24 h-32 flex-shrink-0 rounded-xl overflow-hidden">
                              <img 
                                src={activity.poster} 
                                alt={activity.title} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                              />
                              <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold uppercase bg-gradient-to-r ${getTypeColor(activity.type)} text-white`}>
                                {activity.type}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className={`font-black text-lg mb-1 line-clamp-1 ${isDark ? 'text-white' : 'text-black'}`}>
                                    {activity.title}
                                  </h4>
                                  <p className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                                    Reviewed {formatTimeAgo(activity.created_at)}
                                  </p>
                                </div>
                                
                                {/* Rating Badge */}
                                <div className={`flex-shrink-0 px-3 py-1.5 rounded-lg flex items-center gap-1 ${isDark ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-yellow-500/20 border border-yellow-500/30'}`}>
                                  <Star size={14} className="text-yellow-400" fill="currentColor" />
                                  <span className={`text-sm font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                    {activity.rating}/10
                                  </span>
                                </div>
                              </div>

                              {/* Review Text */}
                              {activity.review_text && (
                                <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                                  {activity.review_text}
                                </p>
                              )}

                              {/* Stats */}
                              <div className="flex items-center gap-4">
                                

                                <div className={`ml-auto px-3 py-1 rounded-lg ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-500/20 text-purple-600'} text-xs font-bold flex items-center gap-1`}>
                                  <MessageCircle size={12} />
                                  Review
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                 {activeTab === 'stats' && (
                  <div className="space-y-8">
                    

                    {/* Lists Distribution Graph */}
                    {loadingLists ? (
                      <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className={isDark ? 'text-white/60' : 'text-black/60'}>Loading your lists...</p>
                      </div>
                    ) : (
                      <>
                        {/* Graph Section */}
                        <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                          <h3 className={`text-xl font-black mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                            <Target size={24} className="text-purple-400" />
                            My Lists Distribution
                          </h3>
                          
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {[
                              { key: 'current', label: 'Watching/Reading', color: 'from-emerald-500 to-green-500', icon: Play },
                              { key: 'viewed', label: 'Completed', color: 'from-green-500 to-teal-500', icon: CheckCircle },
                              { key: 'planned', label: 'Plan to Watch/Read', color: 'from-blue-500 to-cyan-500', icon: BookmarkPlus },
                              { key: 'awaiting', label: 'Awaiting', color: 'from-amber-500 to-yellow-500', icon: Hourglass },
                              { key: 'delayed', label: 'On Hold', color: 'from-purple-500 to-violet-500', icon: PauseCircle },
                              { key: 'dropped', label: 'Dropped', color: 'from-red-500 to-rose-500', icon: XCircle },
                            ].map((list) => {
                              const Icon = list.icon;
                              const count = userLists[list.key]?.length || 0;
                              const total = Object.values(userLists).reduce((sum, arr) => sum + arr.length, 0);
                              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                              return (
                                <button
                                  key={list.key}
                                  onClick={() => setSelectedListType(list.key)}
                                  className={`p-4 rounded-xl transition-all hover:scale-105 ${
                                    selectedListType === list.key
                                      ? `bg-gradient-to-r ${list.color} text-white shadow-lg`
                                      : isDark
                                      ? 'bg-white/5 hover:bg-white/10 text-white'
                                      : 'bg-black/5 hover:bg-black/10 text-black'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <Icon size={18} />
                                    <span className="text-xs font-bold">{list.label}</span>
                                  </div>
                                  <div className="text-2xl font-black mb-1">{count}</div>
                                  
                                  {/* Progress Bar */}
                                  <div className={`h-2 rounded-full overflow-hidden ${selectedListType === list.key ? 'bg-white/20' : isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${list.color}`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <p className={`text-xs mt-1 ${selectedListType === list.key ? 'text-white/80' : isDark ? 'text-white/60' : 'text-black/60'}`}>
                                    {percentage}% of total
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Selected List Content */}
                        <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
                          <h3 className={`text-xl font-black mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                            {selectedListType === 'current' && <><Play size={24} className="text-emerald-400" /> Currently Watching/Reading</>}
                            {selectedListType === 'viewed' && <><CheckCircle size={24} className="text-green-400" /> Completed</>}
                            {selectedListType === 'planned' && <><BookmarkPlus size={24} className="text-blue-400" /> Plan to Watch/Read</>}
                            {selectedListType === 'awaiting' && <><Hourglass size={24} className="text-amber-400" /> Awaiting</>}
                            {selectedListType === 'delayed' && <><PauseCircle size={24} className="text-purple-400" /> On Hold</>}
                            {selectedListType === 'dropped' && <><XCircle size={24} className="text-red-400" /> Dropped</>}
                            <span className={`ml-auto text-sm px-3 py-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                              {userLists[selectedListType]?.length || 0} items
                            </span>
                          </h3>

                          {userLists[selectedListType]?.length === 0 ? (
                            <div className="text-center py-12">
                              <div className={`text-6xl mb-4 ${isDark ? 'opacity-20' : 'opacity-10'}`}>📋</div>
                              <p className={`text-lg font-bold ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                                No items in this list yet
                              </p>
                            </div>
                          ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {userLists[selectedListType]?.map((item) => (
                                <Link
                                  key={item.uid}
                                  href={`/details/${item.uid}`}
                                  className={`group relative rounded-xl overflow-hidden transition-all hover:scale-105 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}
                                >
                                  <div className="relative aspect-[3/4] overflow-hidden">
                                    <img
                                      src={item.poster}
                                      alt={item.title}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black via-black/60 to-transparent' : 'from-white via-white/60 to-transparent'}`}></div>
                                    
                                    {/* Type Badge */}
                                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold uppercase bg-gradient-to-r ${getTypeColor(item.type)} text-white`}>
                                      {item.type}
                                    </div>
                                    
                                    {/* Rating */}
                                    {item.rating !== 'N/A' && (
                                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full flex items-center gap-1 ${isDark ? 'bg-black/60' : 'bg-white/60'} backdrop-blur-xl`}>
                                        <Star size={12} className="text-yellow-400" fill="currentColor" />
                                        <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{item.rating}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="p-3">
                                    <h4 className={`font-black text-sm line-clamp-2 mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                                      {item.title}
                                    </h4>
                                    <div className="flex items-center justify-between text-xs">
                                      <span className={isDark ? 'text-white/60' : 'text-black/60'}>
                                        {item.episodes !== 'N/A' && `${item.episodes} eps`}
                                      </span>
                                      <span className={`${isDark ? 'text-white/60' : 'text-black/60'}`}>
                                        {new Date(item.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className={`relative w-full max-w-md rounded-2xl overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            {/* Header */}
            <div className="relative h-20 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative h-full flex items-center justify-center">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <Settings size={24} />
                  Settings
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-500/10 border border-purple-500/30'}`}>
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-purple-400 mt-0.5" />
                  <div>
                    <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-black'}`}>Security Notice</h3>
                    <p className={`text-xs ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                      You can only reset your password after logging in to your account. This ensures maximum security.
                    </p>
                  </div>
                </div>
              </div>

              {/* Password Reset Form */}
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-black'} flex items-center gap-2`}>
                  <Lock size={20} className="text-purple-400" />
                  Change Password
                </h3>

                {/* New Password */}
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    New Password *
                  </label>
                  <div className={`flex items-center px-3 py-2 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                    <Lock size={16} className="mr-2 opacity-70" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className={`flex-1 bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-white/40' : 'text-black placeholder-black/40'}`}
                      required
                    />
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    Confirm New Password *
                  </label>
                  <div className={`flex items-center px-3 py-2 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                    <Lock size={16} className="mr-2 opacity-70" />
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className={`flex-1 bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-white/40' : 'text-black placeholder-black/40'}`}
                      required
                    />
                  </div>
                </div>

                <p className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  Password must be at least 6 characters long
                </p>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={changingPassword}
                  className={`w-full py-3 rounded-lg font-bold text-white transition-all ${changingPassword ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'}`}
                >
                  {changingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showProfileEditor && (
        <ProfileEditor
          isDark={isDark}
          userData={{
            displayName: userData.displayName,
            bio: userData.bio,
            email: userData.email,
            location: userData.location,
            website: userData.website,
            avatar: userData.avatar,
            banner: userData.banner,
          }}
          currentUser={currentUser}
          onClose={() => setShowProfileEditor(false)}
          onSave={checkUserAndLoadData}
        />
      )}
    </>
  );
}
