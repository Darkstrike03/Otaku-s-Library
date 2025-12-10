'use client';

import React, { useState } from 'react';
import { X, Upload, AlertCircle, Check } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { uploadToImgBB } from '@/lib/imageUpload';

export default function ProfileEditor({ isDark, userData, currentUser, onClose, onSave }) {
  // In ProfileEditor.js, change the useState initialization:
const [editData, setEditData] = useState({
  displayname: userData?.displayName || '',
  bio: userData?.bio || '',
  email: userData?.email || '',
  location: userData?.location || '',
  website: userData?.website || '',
  profile_pic: userData?.avatar || '',
  banner: userData?.banner || '',
});

  const [ageConsent, setAgeConsent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageUpload = async (file, type) => {
    if (type === 'profile') setUploading(true);
    else setUploadingBanner(true);

    try {
      const url = await uploadToImgBB(file);
      setEditData({
        ...editData,
        [type === 'profile' ? 'profile_pic' : 'banner']: url
      });
      setError('');
      setSuccess(`${type === 'profile' ? 'Profile picture' : 'Banner'} uploaded successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to upload ${type}: ${err.message}`);
    } finally {
      if (type === 'profile') setUploading(false);
      else setUploadingBanner(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    // Validate required fields
    if (!editData.displayname.trim()) {
      setError('Display name is required');
      setSaving(false);
      return;
    }

    // Remove email validation - it's now optional
    // Validate email format only if provided
    if (editData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editData.email)) {
        setError('Please enter a valid email address');
        setSaving(false);
        return;
      }
    }

    try {
      const updateData = {
        displayname: editData.displayname.trim(),
        bio: editData.bio.trim(),
        email: editData.email.trim(),
        location: editData.location.trim(),
        website: editData.website.trim(),
        profile_pic: editData.profile_pic.trim(),
        banner: editData.banner.trim(),
        age: ageConsent ? 'adult' : null,
      };

      const { error: updateError } = await supabase
        .from('user_data')
        .update(updateData)
        .eq('user_id', currentUser.id);

      if (updateError) {
        setError('Failed to save changes: ' + updateError.message);
        setSaving(false);
        return;
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);
    } catch (err) {
      setError('Error saving profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
      <div className={`relative w-full max-w-2xl rounded-3xl overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl my-8`}>
        
        {/* Header */}
        <div className="relative h-24 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative h-full flex items-center justify-between px-6">
            <h2 className="text-2xl font-black text-white">Edit Profile</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
            >
              <X size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          
          {error && (
            <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm flex items-start gap-2">
              <Check size={18} className="flex-shrink-0 mt-0.5" />
              {success}
            </div>
          )}

          {/* Profile Picture */}
          <div>
            <label className={`block text-sm font-bold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
              Profile Picture
            </label>
            <div className="flex gap-4 items-start">
              {editData.profile_pic && (
                <div className="relative">
                  <img
                    src={editData.profile_pic}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
                  isDark
                    ? 'border-purple-500/50 hover:border-purple-500 hover:bg-purple-500/10'
                    : 'border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/5'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'profile');
                    }}
                    disabled={uploading}
                    className="hidden"
                    id="profile-pic-input"
                  />
                  <label htmlFor="profile-pic-input" className="cursor-pointer block">
                    {uploading ? (
                      <>
                        <div className="w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className={`text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload size={20} className="mx-auto mb-2 text-purple-400" />
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>Upload Picture</p>
                        <p className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Banner */}
          <div>
            <label className={`block text-sm font-bold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
              Banner
            </label>
            {editData.banner && (
              <img
                src={editData.banner}
                alt="Banner preview"
                className="w-full h-32 rounded-lg object-cover mb-4"
              />
            )}
            <div className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
              isDark
                ? 'border-purple-500/50 hover:border-purple-500 hover:bg-purple-500/10'
                : 'border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/5'
            }`}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, 'banner');
                }}
                disabled={uploadingBanner}
                className="hidden"
                id="banner-input"
              />
              <label htmlFor="banner-input" className="cursor-pointer block">
                {uploadingBanner ? (
                  <>
                    <div className="w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className={`text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload size={20} className="mx-auto mb-2 text-purple-400" />
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>Upload Banner</p>
                    <p className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>1920x400px recommended</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
              Display Name *
            </label>
            <input
              type="text"
              value={editData.displayname}
              onChange={(e) => setEditData({ ...editData, displayname: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isDark
                  ? 'bg-white/5 text-white placeholder-white/40 border-2 border-white/10 focus:border-purple-500'
                  : 'bg-black/5 text-black placeholder-black/40 border-2 border-black/10 focus:border-purple-500'
              } outline-none`}
              placeholder="Your display name"
            />
          </div>

          {/* Email */}
          <div>
            <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
              Email 
            </label>
            <input
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isDark
                  ? 'bg-white/5 text-white placeholder-white/40 border-2 border-white/10 focus:border-purple-500'
                  : 'bg-black/5 text-black placeholder-black/40 border-2 border-black/10 focus:border-purple-500'
              } outline-none`}
              placeholder="your.email@example.com"
            />
          </div>

          {/* Bio */}
          <div>
            <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
              Bio
            </label>
            <textarea
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all resize-none ${
                isDark
                  ? 'bg-white/5 text-white placeholder-white/40 border-2 border-white/10 focus:border-purple-500'
                  : 'bg-black/5 text-black placeholder-black/40 border-2 border-black/10 focus:border-purple-500'
              } outline-none`}
              placeholder="Tell us about yourself..."
              rows="4"
            />
          </div>

          {/* Location */}
          <div>
            <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
              Location
            </label>
            <input
              type="text"
              value={editData.location}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isDark
                  ? 'bg-white/5 text-white placeholder-white/40 border-2 border-white/10 focus:border-purple-500'
                  : 'bg-black/5 text-black placeholder-black/40 border-2 border-black/10 focus:border-purple-500'
              } outline-none`}
              placeholder="e.g., Tokyo, Japan"
            />
          </div>

          {/* Website */}
          <div>
            <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
              Website
            </label>
            <input
              type="url"
              value={editData.website}
              onChange={(e) => setEditData({ ...editData, website: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isDark
                  ? 'bg-white/5 text-white placeholder-white/40 border-2 border-white/10 focus:border-purple-500'
                  : 'bg-black/5 text-black placeholder-black/40 border-2 border-black/10 focus:border-purple-500'
              } outline-none`}
              placeholder="https://example.com"
            />
          </div>

          {/* Age Consent Toggle */}
          <div className={`p-4 rounded-xl border-2 ${
            isDark
              ? 'bg-orange-500/10 border-orange-500/30'
              : 'bg-orange-500/5 border-orange-500/20'
          }`}>
            <div className="flex items-start gap-3 mb-3">
              <AlertCircle size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className={`font-bold mb-1 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                  Mature Content (18+)
                </h4>
                <p className={`text-xs ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                  By enabling this, you confirm that you are 18 years or older and consent to viewing NSFW content. 
                  This platform is not responsible for any content you choose to view.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setAgeConsent(!ageConsent)}
                className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                  ageConsent
                    ? 'bg-gradient-to-r from-orange-600 to-red-600'
                    : isDark
                    ? 'bg-white/10'
                    : 'bg-black/10'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-all duration-300 ${
                    ageConsent ? 'translate-x-6' : ''
                  }`}
                />
              </button>
              <span className={`text-sm font-bold ${ageConsent ? 'text-orange-500' : isDark ? 'text-white/60' : 'text-black/60'}`}>
                {ageConsent ? 'Age Verified' : 'Not Verified'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={saving}
              className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  : 'bg-black/10 hover:bg-black/20 text-black border border-black/20'
              } disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all text-white ${
                saving
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
