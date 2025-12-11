'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Send, CheckCircle, XCircle, Clock, AlertCircle, Trash2, LogIn } from 'lucide-react';

export default function SuggestContent({ isDark = true }) {
  const [contentName, setContentName] = useState('');
  const [contentType, setContentType] = useState('anime');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [duplicates, setDuplicates] = useState({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const contentTypes = ['anime', 'manga', 'manhwa', 'manhua', 'donghua', 'webnovel', 'hentai'];

  // Load current user and their data
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        // Fetch user data from user_data table
        const { data: userData, error } = await supabase
          .from('user_data')
          .select('username')
          .eq('user_id', user.id)
          .single();

        if (!error && userData) {
          setUserData(userData);
        }
      } else {
        // No user logged in
        setUserData(null);
        setIsAnonymous(true);
      }
    };
    loadUser();
  }, []);

  // Load requests
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('content_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRequests(data || []);
      checkDuplicates(data || []);
    } catch (err) {
      console.error('Error loading requests:', err);
    }
  };

  const checkDuplicates = (data) => {
    const duplicateMap = {};
    const nameCount = {};

    data.forEach(req => {
      const normalizedName = req.content_name.toLowerCase().trim();
      const key = `${normalizedName}-${req.content_type}`;

      if (!nameCount[key]) {
        nameCount[key] = [];
      }
      nameCount[key].push(req.id);
    });

    Object.entries(nameCount).forEach(([key, ids]) => {
      if (ids.length > 1) {
        ids.forEach(id => {
          duplicateMap[id] = ids.length;
        });
      }
    });

    setDuplicates(duplicateMap);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!contentName.trim()) {
      setMessage('❌ Content name is required');
      return;
    }

    // Check if trying to submit non-anonymously without being logged in
    if (!isAnonymous && !currentUser) {
      setMessage('❌ You must be logged in to submit with your name');
      setShowLoginPrompt(true);
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('content_suggestions')
        .insert([
          {
            content_name: contentName.trim(),
            content_type: contentType,
            user_id: currentUser?.id || null,
            user_name: isAnonymous ? null : userData?.username || null,
            is_anonymous: isAnonymous,
            is_approved: null,
            created_at: new Date(),
          },
        ]);

      if (error) throw error;

      setMessage('✅ Thank you! Your suggestion has been submitted.');
      setContentName('');

      setTimeout(() => {
        setMessage('');
        loadRequests();
      }, 2000);
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('content_suggestions')
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;
      loadRequests();
    } catch (err) {
      console.error('Error approving request:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      const { error } = await supabase
        .from('content_suggestions')
        .update({ is_approved: false })
        .eq('id', id);

      if (error) throw error;
      loadRequests();
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this suggestion?')) return;

    try {
      const { error } = await supabase
        .from('content_suggestions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadRequests();
    } catch (err) {
      console.error('Error deleting request:', err);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'pending') return req.is_approved === null;
    if (activeTab === 'accepted') return req.is_approved === true;
    if (activeTab === 'rejected') return req.is_approved === false;
    return true;
  });

  const stats = {
    pending: requests.filter(r => r.is_approved === null).length,
    accepted: requests.filter(r => r.is_approved === true).length,
    rejected: requests.filter(r => r.is_approved === false).length,
    total: requests.length,
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'}`}>
      {/* Hero Section */}
      <div className={`relative py-12 sm:py-16 overflow-hidden ${isDark ? 'bg-gradient-to-br from-purple-900/20 to-pink-900/20' : 'bg-gradient-to-br from-purple-100/30 to-pink-100/30'}`}>
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
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

        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            Suggest Content
          </h1>
          <p className={`text-lg ${isDark ? 'text-white/70' : 'text-black/70'}`}>
            Help us grow our library! Suggest anime, manga, and more.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className={`rounded-3xl p-6 sm:p-8 sticky top-24 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} backdrop-blur-xl`}>
              <h2 className={`text-2xl font-black mb-6 ${isDark ? 'text-white' : 'text-black'}`}>
                Submit Your Idea
              </h2>

              {/* Login Prompt */}
              {!currentUser && (
                <div className={`rounded-xl p-4 mb-6 ${isDark ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-blue-500/20 border border-blue-500/30'}`}>
                  <div className="flex items-start gap-3">
                    <LogIn size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className={`text-sm font-bold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                        Login to submit with your name
                      </p>
                      <p className={`text-xs ${isDark ? 'text-blue-300/70' : 'text-blue-700/70'}`}>
                        Submit anonymously without login, or login to be recognized for your suggestion.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Content Name */}
                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    Content Name *
                  </label>
                  <input
                    type="text"
                    value={contentName}
                    onChange={(e) => setContentName(e.target.value)}
                    placeholder="e.g., Attack on Titan Season 5"
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isDark
                        ? 'bg-white/10 text-white placeholder-white/40 focus:bg-white/20 border border-white/10 focus:border-white/30'
                        : 'bg-black/10 text-black placeholder-black/40 focus:bg-black/20 border border-black/10 focus:border-black/30'
                    } outline-none`}
                  />
                </div>

                {/* Content Type */}
                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    Content Type *
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isDark
                        ? 'bg-white/10 text-white border border-white/10 focus:border-white/30'
                        : 'bg-black/10 text-black border border-black/10 focus:border-black/30'
                    } outline-none`}
                  >
                    {contentTypes.map(type => (
                      <option key={type} value={type} className={isDark ? 'bg-gray-900' : 'bg-white'}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Anonymous Toggle */}
                <div className={`rounded-xl p-4 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => {
                        if (!currentUser && !e.target.checked) {
                          setMessage('❌ You must be logged in to submit with your name');
                          return;
                        }
                        setIsAnonymous(e.target.checked);
                      }}
                      disabled={!currentUser}
                      className={`w-5 h-5 rounded ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                      Submit Anonymously
                    </span>
                  </label>

                  {/* Show user info if logged in and not anonymous */}
                  {currentUser && !isAnonymous && userData && (
                    <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                      <p className={`text-xs font-medium ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                        Submitting as:
                      </p>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {userData.username}
                      </p>
                    </div>
                  )}
                </div>

                {/* Message */}
                {message && (
                  <div className={`p-3 rounded-lg text-sm font-medium ${
                    message.includes('✅')
                      ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-500/20 text-green-600'
                      : isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-500/20 text-red-600'
                  }`}>
                    {message}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  {submitting ? 'Submitting...' : 'Submit Suggestion'}
                </button>
              </form>
            </div>
          </div>

          {/* Requests List Section */}
          <div className="lg:col-span-2">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total', count: stats.total, color: 'purple', icon: '📊' },
                { label: 'Pending', count: stats.pending, color: 'yellow', icon: '⏳' },
                { label: 'Accepted', count: stats.accepted, color: 'green', icon: '✅' },
                { label: 'Rejected', count: stats.rejected, color: 'red', icon: '❌' },
              ].map(stat => (
                <div
                  key={stat.label}
                  className={`rounded-2xl p-4 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}
                >
                  <div className="text-2xl font-black mb-1">{stat.icon}</div>
                  <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-black'}`}>
                    {stat.count}
                  </p>
                  <p className={`text-xs font-medium ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['pending', 'accepted', 'rejected'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-black/5 text-black hover:bg-black/10'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} ({
                    tab === 'pending' ? stats.pending : tab === 'accepted' ? stats.accepted : stats.rejected
                  })
                </button>
              ))}
            </div>

            {/* Requests List */}
            <div className="space-y-4">
              {filteredRequests.length > 0 ? (
                filteredRequests.map(request => (
                  <div
                    key={request.id}
                    className={`rounded-2xl p-5 sm:p-6 transition-all hover:scale-102 ${
                      isDark ? 'bg-white/5 border border-white/10 hover:border-white/20' : 'bg-black/5 border border-black/10 hover:border-black/20'
                    } backdrop-blur-xl`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-black'}`}>
                            {request.content_name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            request.content_type === 'anime' ? 'bg-blue-500/20 text-blue-400' :
                            request.content_type === 'manga' ? 'bg-purple-500/20 text-purple-400' :
                            request.content_type === 'donghua' ? 'bg-red-500/20 text-red-400' :
                            request.content_type === 'webnovel' ? 'bg-cyan-500/20 text-cyan-400' :
                            'bg-pink-500/20 text-pink-400'
                          }`}>
                            {request.content_type}
                          </span>
                        </div>

                        {/* Duplicate Warning */}
                        {duplicates[request.id] && (
                          <div className="flex items-center gap-2 mb-2 text-yellow-500">
                            <AlertCircle size={16} />
                            <span className="text-xs font-medium">
                              {duplicates[request.id]} similar requests found
                            </span>
                          </div>
                        )}

                        {/* User Info */}
                        <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                          {request.is_anonymous ? '👤 Anonymous' : `👤 ${request.user_name}`}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Status Icon */}
                      <div>
                        {request.is_approved === true && <CheckCircle size={28} className="text-green-500" />}
                        {request.is_approved === false && <XCircle size={28} className="text-red-500" />}
                        {request.is_approved === null && <Clock size={28} className="text-yellow-500" />}
                      </div>
                    </div>

                    {/* Actions (Admin Only) */}
                    {currentUser?.user_metadata?.role === 'admin' && request.is_approved === null && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="flex-1 px-4 py-2 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="flex-1 px-4 py-2 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                        <button
                          onClick={() => handleDelete(request.id)}
                          className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                            isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'
                          }`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={`rounded-2xl p-12 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
                  <p className={`text-lg font-medium ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                    No {activeTab} requests yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-pulse {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}