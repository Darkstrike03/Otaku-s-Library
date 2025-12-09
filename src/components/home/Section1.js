'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tv, BookOpen, Book, TrendingUp, Sparkles, Zap, ChevronRight, Bell, Calendar, Star, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HeroSection({ isDark, toggleTheme }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [currentNotice, setCurrentNotice] = useState(0);

  const features = [
    {
      icon: Tv,
      title: 'Anime Tracking',
      description: 'Track your favorite anime series',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'purple',
    },
    {
      icon: BookOpen,
      title: 'Manga Library',
      description: 'Organize your manga collection',
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'cyan',
    },
    {
      icon: Book,
      title: 'Novel Updates',
      description: 'Never miss a chapter release',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'pink',
    },
    {
      icon: Sparkles,
      title: 'Your Twist',
      description: 'Personalized recommendations',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'yellow',
    },
  ];

  const notices = [
    {
      type: 'notice',
      icon: Bell,
      title: 'New Feature Alert',
      content: 'Advanced search filters now available!',
      color: 'purple',
    },
    {
      type: 'anime',
      icon: Tv,
      title: 'Trending Anime',
      content: 'Frieren: Beyond Journey\'s End - Episode 28 Released',
      color: 'cyan',
    },
    {
      type: 'news',
      icon: TrendingUp,
      title: 'Community News',
      content: 'Winter 2025 Season Guide is now live!',
      color: 'pink',
    },
  ];

  const stats = [
    { number: '50K+', label: 'Active Users', icon: Users },
    { number: '200K+', label: 'Titles', icon: Star },
    { number: '1M+', label: 'Reviews', icon: Sparkles },
    { number: '500K+', label: 'Lists Created', icon: TrendingUp },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNotice((prev) => (prev + 1) % notices.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-white'}`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 left-10 w-72 h-72 ${
            isDark ? 'bg-purple-600/20' : 'bg-purple-400/20'
          } rounded-full blur-3xl animate-pulse`}></div>
          <div className={`absolute bottom-20 right-10 w-96 h-96 ${
            isDark ? 'bg-cyan-600/20' : 'bg-cyan-400/20'
          } rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${
            isDark ? 'bg-pink-600/10' : 'bg-pink-400/10'
          } rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
                isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
              } backdrop-blur-xl`}>
                <Zap size={16} className={`${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                  All-in-One Platform
                </span>
              </div>

              {/* Main Heading */}
              <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight ${
                isDark ? 'text-white' : 'text-black'
              }`}>
                Your Ultimate
                <span className={`block mt-2 text-transparent bg-clip-text bg-gradient-to-r ${
                  isDark 
                    ? 'from-purple-400 via-pink-400 to-cyan-400' 
                    : 'from-purple-600 via-pink-600 to-cyan-600'
                }`}>
                  Otaku Hub
                </span>
              </h1>

              {/* Description */}
              <p className={`text-lg sm:text-xl mb-8 leading-relaxed ${
                isDark ? 'text-white/60' : 'text-black/60'
              }`}>
                Combining the best of <span className={`font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>MyAnimeList</span>, <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>AniList</span>, <span className={`font-bold ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>MangaUpdates</span>, and <span className={`font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>NovelUpdates</span> — with our own unique twist.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center lg:justify-start">
                <button className={`group relative px-8 py-4 rounded-full font-bold text-white overflow-hidden transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                } shadow-lg hover:shadow-2xl`}>
                  <span className="relative z-10 flex items-center gap-2">
                  Contribute to Repo
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>

                <button className={`px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? 'bg-white/5 hover:bg-white/10 text-white border-2 border-white/20' 
                    : 'bg-black/5 hover:bg-black/10 text-black border-2 border-black/20'
                } backdrop-blur-xl`}>
                  Explore Features
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-xl ${
                        isDark ? 'bg-white/5' : 'bg-black/5'
                      } backdrop-blur-xl border ${
                        isDark ? 'border-white/10' : 'border-black/10'
                      } hover:scale-105 transition-transform duration-300`}
                    >
                      <Icon size={20} className={`${isDark ? 'text-purple-400' : 'text-purple-600'} mb-2`} />
                      <div className={`text-2xl font-black ${
                        isDark 
                          ? 'text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-600' 
                          : 'text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-pink-800'
                      }`}>
                        {stat.number}
                      </div>
                      <div className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Content - Feature Cards & Notices */}
            <div className="space-y-6">
              {/* Feature Cards */}
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  const isActive = activeTab === index;
                  return (
                    <div
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-500 ${
                        isActive 
                          ? isDark 
                            ? 'bg-white/10 border-2 border-white/20 scale-105' 
                            : 'bg-black/10 border-2 border-black/20 scale-105'
                          : isDark
                            ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                            : 'bg-black/5 border border-black/10 hover:bg-black/10'
                      } backdrop-blur-xl group`}
                    >
                      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${feature.color} blur-xl`}></div>
                      
                      <div className="relative z-10">
                        <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                          isActive 
                            ? `bg-gradient-to-br ${feature.color}` 
                            : isDark ? 'bg-white/10' : 'bg-black/10'
                        } transition-all duration-500 ${isActive ? 'scale-110' : ''}`}>
                          <Icon size={24} className="text-white" />
                        </div>
                        
                        <h3 className={`text-lg font-black mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                          {feature.title}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Notice Board */}
              <div className={`relative p-6 rounded-2xl ${
                isDark 
                  ? 'bg-white/5 border border-white/10' 
                  : 'bg-black/5 border border-black/10'
              } backdrop-blur-xl overflow-hidden`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-black'}`}>
                    Latest Updates
                  </h3>
                  <Calendar size={20} className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>

                {/* Notice Carousel */}
                <div className="relative h-24 overflow-hidden">
                  {notices.map((notice, index) => {
                    const Icon = notice.icon;
                    const isActive = currentNotice === index;
                    return (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-500 ${
                          isActive 
                            ? 'opacity-100 translate-y-0' 
                            : index < currentNotice 
                              ? 'opacity-0 -translate-y-full' 
                              : 'opacity-0 translate-y-full'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            notice.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                            notice.color === 'cyan' ? 'bg-gradient-to-br from-cyan-500 to-blue-500' :
                            'bg-gradient-to-br from-pink-500 to-rose-500'
                          }`}>
                            <Icon size={20} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                              {notice.title}
                            </h4>
                            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                              {notice.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Notice Indicators */}
                <div className="flex gap-2 mt-4 justify-center">
                  {notices.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentNotice(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentNotice === index 
                          ? isDark 
                            ? 'w-8 bg-purple-500' 
                            : 'w-8 bg-purple-600'
                          : isDark 
                            ? 'w-1.5 bg-white/20' 
                            : 'w-1.5 bg-black/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0,64 C240,96 480,96 720,64 C960,32 1200,32 1440,64 L1440,120 L0,120 Z"
              fill={isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)'}
              className="animate-pulse"
            />
          </svg>
        </div>
      </section>
    </div>
  );
}