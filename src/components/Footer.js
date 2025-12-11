'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Github, Twitter, Mail, Music, Heart, Sparkles, TrendingUp, BookOpen, Tv, Book, Users, Star, MessageCircle, AlertTriangle, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/supabaseClient';

export default function Footer({ isDark }) {
  const [reportExpanded, setReportExpanded] = useState(false);
  const [reportData, setReportData] = useState({
    type: 'bug',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    browse: [
      { name: 'Anime', icon: Tv, href: '/library/anime' },
      { name: 'Manga', icon: BookOpen, href: '/library/manga' },
      { name: 'Novels', icon: Book, href: '/library/webnovels' },
      { name: 'Trending', icon: TrendingUp, href: '/library' },
    ],
    community: [
      { name: 'Forums', icon: Users, href: '#' },
      { name: 'Reviews', icon: Star, href: '#' },
      { name: 'Lists', icon: Sparkles, href: '/twist' },
      { name: 'Recommendations', icon: Heart, href: '#' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  };

  const socialLinks = [
    { icon: Music, label: 'Spotify', href: '#' },
    { icon: MessageCircle, label: 'Discord', href: '#' },
    { icon: Github, label: 'GitHub', href: 'https://github.com/Darkstrike03/Otaku-s-Library' },
  ];

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save report to Supabase
      const { data, error } = await supabase
        .from('reports')
        .insert([
          {
            type: reportData.type,
            message: reportData.message,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error submitting report:', error);
        alert('Failed to submit report. Please try again or contact us directly.');
      } else {
        alert('Thank you for your report! We\'ll look into it.');
        setReportData({ type: 'bug', message: '' });
        setReportExpanded(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit report. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

              {/* Report Section */}
              <div className={`rounded-2xl overflow-hidden ${
                isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
              } backdrop-blur-xl transition-all duration-300`}>
                <button
                  onClick={() => setReportExpanded(!reportExpanded)}
                  className={`w-full p-4 flex items-center justify-between transition-all duration-300 ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={20} className={`${
                      isDark ? 'text-orange-400' : 'text-orange-600'
                    }`} />
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                      Report an Issue
                    </span>
                  </div>
                  {reportExpanded ? (
                    <ChevronUp size={20} className={isDark ? 'text-white/60' : 'text-black/60'} />
                  ) : (
                    <ChevronDown size={20} className={isDark ? 'text-white/60' : 'text-black/60'} />
                  )}
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${
                  reportExpanded ? 'max-h-96' : 'max-h-0'
                }`}>
                  <form onSubmit={handleReportSubmit} className="p-4 pt-0 space-y-4">
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${
                        isDark ? 'text-white/80' : 'text-black/80'
                      }`}>
                        Issue Type
                      </label>
                      <select
                        value={reportData.type}
                        onChange={(e) => setReportData({ ...reportData, type: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm ${
                          isDark 
                            ? 'bg-white/5 text-white border border-white/10' 
                            : 'bg-black/5 text-black border border-black/10'
                        } outline-none focus:border-orange-500 transition-all duration-300`}
                      >
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="content">Content Issue</option>
                        <option value="abuse">Report Abuse</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${
                        isDark ? 'text-white/80' : 'text-black/80'
                      }`}>
                        Description
                      </label>
                      <textarea
                        value={reportData.message}
                        onChange={(e) => setReportData({ ...reportData, message: e.target.value })}
                        required
                        placeholder="Please describe the issue..."
                        rows={4}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm ${
                          isDark 
                            ? 'bg-white/5 text-white placeholder-white/40 border border-white/10' 
                            : 'bg-black/5 text-black placeholder-black/40 border border-black/10'
                        } outline-none focus:border-orange-500 transition-all duration-300 resize-none`}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                        isDark 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white' 
                          : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white'
                      } flex items-center justify-center gap-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Send size={16} />
                      {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </form>
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