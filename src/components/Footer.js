'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Github, Twitter, Mail, Heart, Sparkles, TrendingUp, BookOpen, Tv, Book, Users, Star, MessageCircle } from 'lucide-react';

export default function Footer({ isDark }) {
  const [email, setEmail] = useState('');

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    browse: [
      { name: 'Anime', icon: Tv, href: '/library' },
      { name: 'Manga', icon: BookOpen, href: '/library' },
      { name: 'Novels', icon: Book, href: '/library' },
      { name: 'Trending', icon: TrendingUp, href: '/library' },
    ],
    community: [
      { name: 'Forums', icon: Users, href: '#' },
      { name: 'Reviews', icon: Star, href: '#' },
      { name: 'Lists', icon: Sparkles, href: '/list' },
      { name: 'Recommendations', icon: Heart, href: '#' },
    ],
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Contact', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: MessageCircle, label: 'Discord', href: '#' },
    { icon: Github, label: 'GitHub', href: '#' },
  ];

  return (
    <div className={`transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <footer className={`relative ${
        isDark 
          ? 'bg-black/40 backdrop-blur-2xl border-t border-white/10' 
          : 'bg-white/40 backdrop-blur-2xl border-t border-black/10'
      }`}>
        <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
          <div className={`h-full w-1/3 ${
            isDark 
              ? 'bg-gradient-to-r from-transparent via-purple-500 to-transparent' 
              : 'bg-gradient-to-r from-transparent via-purple-600 to-transparent'
          }`} style={{
            animation: 'slide 3s ease-in-out infinite',
          }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
            
            <div className="lg:col-span-4">
              <div className="flex items-center gap-4 group cursor-pointer mb-6">
                <div className="relative flex items-center">
                  <div className={`absolute inset-0 blur-xl opacity-60 ${
                    isDark ? 'bg-purple-600' : 'bg-purple-400'
                  } rounded-full scale-150 group-hover:scale-175 transition-transform duration-500`}></div>
                  
                  <div className="relative flex items-center">
                    <img src="/logo192.png"
                      alt="Otaku's Library Logo"
                      className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-full"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <h2 className={`text-xl font-black tracking-tight ${
                    isDark ? 'text-white' : 'text-black'
                  }`}>
                    OTAKU'S LIBRARY
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className={`h-0.5 w-10 ${
                      isDark ? 'bg-gradient-to-r from-purple-500 to-transparent' 
                      : 'bg-gradient-to-r from-purple-600 to-transparent'
                    }`}></div>
                    <span className={`text-xs font-semibold tracking-widest ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      ALL IN ONE
                    </span>
                  </div>
                </div>
              </div>
              
              <p className={`text-sm mb-6 leading-relaxed ${
                isDark ? 'text-white/60' : 'text-black/60'
              }`}>
                Your ultimate destination for tracking anime, manga, and light novels. Join thousands of otaku worldwide in building your perfect library.
              </p>

              <div className="relative group">
                <div className={`absolute -inset-0.5 ${
                  isDark 
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600' 
                    : 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500'
                } rounded-full opacity-30 group-hover:opacity-100 blur-sm transition-all duration-500`}></div>
                
                <div className="relative flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`flex-1 px-4 py-2.5 rounded-l-full text-sm font-medium transition-all duration-300 ${
                      isDark 
                        ? 'bg-white/5 text-white placeholder-white/40 focus:bg-white/10' 
                        : 'bg-black/5 text-black placeholder-black/40 focus:bg-black/10'
                    } backdrop-blur-xl outline-none border-2 ${
                      isDark ? 'border-white/10 focus:border-white/20' : 'border-black/10 focus:border-black/20'
                    } border-r-0`}
                  />
                  <button className={`px-4 sm:px-6 py-2.5 rounded-r-full text-sm font-bold transition-all duration-300 ${
                    isDark 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                  } flex items-center gap-2 hover:scale-105`}>
                    <Mail size={16} />
                    <span className="hidden sm:inline">Subscribe</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h3 className={`text-sm font-black tracking-wider mb-4 ${
                isDark ? 'text-white' : 'text-black'
              }`}>
                BROWSE
              </h3>
              <ul className="space-y-3">
                {footerLinks.browse.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.name}>
                      <Link href={link.href} className={`flex items-center gap-2 text-sm transition-all duration-300 group ${
                        isDark 
                          ? 'text-white/60 hover:text-purple-400' 
                          : 'text-black/60 hover:text-purple-600'
                      }`}>
                        <Icon size={16} className="group-hover:scale-110 transition-transform duration-300" />
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h3 className={`text-sm font-black tracking-wider mb-4 ${
                isDark ? 'text-white' : 'text-black'
              }`}>
                COMMUNITY
              </h3>
              <ul className="space-y-3">
                {footerLinks.community.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.name}>
                      <Link href={link.href} className={`flex items-center gap-2 text-sm transition-all duration-300 group ${
                        isDark 
                          ? 'text-white/60 hover:text-cyan-400' 
                          : 'text-black/60 hover:text-cyan-600'
                      }`}>
                        <Icon size={16} className="group-hover:scale-110 transition-transform duration-300" />
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h3 className={`text-sm font-black tracking-wider mb-4 ${
                isDark ? 'text-white' : 'text-black'
              }`}>
                COMPANY
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={`text-sm transition-all duration-300 inline-block group ${
                      isDark 
                        ? 'text-white/60 hover:text-pink-400' 
                        : 'text-black/60 hover:text-pink-600'
                    }`}>
                      <span className="group-hover:translate-x-1 inline-block transition-transform duration-300">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h3 className={`text-sm font-black tracking-wider mb-4 ${
                isDark ? 'text-white' : 'text-black'
              }`}>
                CONNECT
              </h3>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                        isDark 
                          ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white' 
                          : 'bg-black/5 hover:bg-black/10 text-black/60 hover:text-black'
                      } backdrop-blur-xl group`}
                    >
                      <Icon size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                    </a>
                  );
                })}
              </div>
              
              <div className={`mt-6 p-4 rounded-xl ${
                isDark ? 'bg-white/5' : 'bg-black/5'
              } backdrop-blur-xl`}>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className={`text-2xl font-black ${
                      isDark 
                        ? 'text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-600' 
                        : 'text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-pink-800'
                    }`}>
                      50K+
                    </div>
                    <div className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                      Users
                    </div>
                  </div>
                  <div>
                    <div className={`text-2xl font-black ${
                      isDark 
                        ? 'text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600' 
                        : 'text-transparent bg-clip-text bg-gradient-to-br from-cyan-600 to-blue-800'
                    }`}>
                      200K+
                    </div>
                    <div className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                      Titles
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`pt-8 border-t ${
            isDark ? 'border-white/10' : 'border-black/10'
          }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                © {currentYear} Otaku's Library. All rights reserved.
              </p>
              
              <div className={`flex items-center gap-2 text-sm ${
                isDark ? 'text-white/60' : 'text-black/60'
              }`}>
                Made with 
                <Heart size={16} className={`${
                  isDark ? 'text-pink-500' : 'text-pink-600'
                } animate-pulse`} fill="currentColor" />
                by otaku, for otaku
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slide {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(200%); }
          }
        `}</style>
      </footer>
    </div>
  );
}