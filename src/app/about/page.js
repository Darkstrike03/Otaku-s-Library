'use client';

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Users, Target, Heart, Zap, BookOpen, Globe } from 'lucide-react';

export default function AboutPage() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} transition-colors duration-500 py-16`}>
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            About Us
          </h1>
          <p className={`text-lg ${isDark ? 'text-white/60' : 'text-black/60'}`}>
            Your ultimate otaku companion, built by fans for fans
          </p>
        </div>

        {/* Mission Section */}
        <div className={`p-8 rounded-2xl mb-8 ${
          isDark ? 'bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-cyan-900/20 border border-white/10' 
          : 'bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-cyan-100/50 border border-black/10'
        } backdrop-blur-xl`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
              <Target size={24} className="text-white" />
            </div>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-black'}`}>
              Our Mission
            </h2>
          </div>
          <p className={`text-lg leading-relaxed ${isDark ? 'text-white/80' : 'text-black/80'}`}>
            Otaku's Library was created to unite the best features of MyAnimeList, AniList, MangaUpdates, and NovelUpdates into one comprehensive platform. We aim to provide otaku worldwide with a seamless experience to track, discover, and share their favorite anime, manga, manhwa, manhua, donghua, and web novels.
          </p>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {[
            {
              icon: Users,
              title: 'Community First',
              description: 'Built by the community, for the community. Every feature is designed with our users in mind.',
              color: 'from-purple-500 to-pink-500'
            },
            {
              icon: BookOpen,
              title: 'Comprehensive Library',
              description: 'Track everything from anime to web novels in one place. No more juggling multiple platforms.',
              color: 'from-cyan-500 to-blue-500'
            },
            {
              icon: Zap,
              title: 'Always Improving',
              description: 'We continuously add new features and improvements based on community feedback.',
              color: 'from-pink-500 to-rose-500'
            },
            {
              icon: Globe,
              title: 'Global Community',
              description: 'Connect with fellow otaku from around the world and share your passion.',
              color: 'from-yellow-500 to-orange-500'
            }
          ].map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className={`p-6 rounded-2xl ${
                  isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
                } backdrop-blur-xl hover:scale-105 transition-all duration-300`}
              >
                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${value.color}`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                  {value.title}
                </h3>
                <p className={`${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Story */}
        <div className={`p-8 rounded-2xl ${
          isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
        } backdrop-blur-xl`}>
          <h2 className={`text-2xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            Our Story
          </h2>
          <div className={`space-y-4 ${isDark ? 'text-white/70' : 'text-black/70'}`}>
            <p className="leading-relaxed">
              Otaku's Library started as a passion project by a group of dedicated anime and manga fans who were frustrated with having to use multiple platforms to track their favorite content. We wanted a single, unified platform that could handle everything from seasonal anime to ongoing web novels.
            </p>
            <p className="leading-relaxed">
              What began as a small project has grown into a vibrant community of otaku from all corners of the globe. We're constantly working to improve the platform, add new features, and make it the best possible experience for our users.
            </p>
            <p className="leading-relaxed">
              Thank you for being part of our journey. Together, we're building something special.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
