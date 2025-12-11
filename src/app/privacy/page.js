'use client';

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Shield, Eye, Lock, Database, Cookie, AlertTriangle } from 'lucide-react';

export default function PrivacyPage() {
  const { isDark } = useTheme();

  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: 'We collect information you provide directly to us, such as your username, email address, profile information, and activity on the platform including your anime/manga lists, reviews, and ratings.'
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      content: 'We use the information we collect to provide, maintain, and improve our services, to personalize your experience, to communicate with you, and to monitor and analyze trends and usage.'
    },
    {
      icon: Lock,
      title: 'Information Security',
      content: 'We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.'
    },
    {
      icon: Cookie,
      title: 'Cookies and Tracking',
      content: 'We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.'
    },
    {
      icon: Shield,
      title: 'Data Sharing',
      content: 'We do not sell your personal information. We may share your information with third-party service providers who perform services on our behalf, or when required by law.'
    },
    {
      icon: AlertTriangle,
      title: 'Your Rights',
      content: 'You have the right to access, update, or delete your personal information at any time. You can do this through your account settings or by contacting us directly.'
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} transition-colors duration-500 py-16`}>
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            Privacy Policy
          </h1>
          <p className={`text-lg ${isDark ? 'text-white/60' : 'text-black/60'}`}>
            Last updated: December 11, 2025
          </p>
        </div>

        <div className={`p-8 rounded-2xl mb-8 ${
          isDark ? 'bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-cyan-900/20 border border-white/10' 
          : 'bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-cyan-100/50 border border-black/10'
        } backdrop-blur-xl`}>
          <p className={`text-lg leading-relaxed ${isDark ? 'text-white/80' : 'text-black/80'}`}>
            At Otaku's Library, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={index}
                className={`p-6 rounded-2xl ${
                  isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
                } backdrop-blur-xl`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-black mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
                      {section.title}
                    </h2>
                    <p className={`leading-relaxed ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={`mt-12 p-6 rounded-2xl ${
          isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
        } backdrop-blur-xl`}>
          <h2 className={`text-xl font-black mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
            Contact Us
          </h2>
          <p className={`${isDark ? 'text-white/70' : 'text-black/70'}`}>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@otakulibrary.com" className="text-purple-500 hover:text-purple-400 font-bold">
              privacy@otakulibrary.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
