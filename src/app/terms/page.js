'use client';

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FileText, CheckCircle, XCircle, AlertCircle, UserCheck, Scale } from 'lucide-react';

export default function TermsPage() {
  const { isDark } = useTheme();

  const sections = [
    {
      icon: UserCheck,
      title: 'Account Registration',
      content: 'You must be at least 13 years old to use this service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.'
    },
    {
      icon: CheckCircle,
      title: 'Acceptable Use',
      content: 'You agree to use the platform for lawful purposes only. Do not post spam, harassment, hate speech, or any content that violates the rights of others. Respect community guidelines and fellow users.'
    },
    {
      icon: XCircle,
      title: 'Prohibited Activities',
      content: 'You may not attempt to hack, scrape, or reverse engineer the platform. Do not create multiple accounts to manipulate ratings or reviews. Sharing copyrighted content without permission is strictly prohibited.'
    },
    {
      icon: FileText,
      title: 'User Content',
      content: 'You retain ownership of content you post, but grant us a license to use, display, and distribute it on the platform. You are responsible for ensuring you have the rights to any content you upload.'
    },
    {
      icon: Scale,
      title: 'Intellectual Property',
      content: 'All content, features, and functionality on Otaku\'s Library are owned by us or our licensors and are protected by copyright, trademark, and other intellectual property laws.'
    },
    {
      icon: AlertCircle,
      title: 'Limitation of Liability',
      content: 'We provide the service "as is" without warranties. We are not liable for any damages arising from your use of the platform, including but not limited to data loss or service interruptions.'
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} transition-colors duration-500 py-16`}>
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            Terms of Service
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
            Welcome to Otaku's Library. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.
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
        } backdrop-blur-xl space-y-4`}>
          <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-black'}`}>
            Changes to Terms
          </h2>
          <p className={`${isDark ? 'text-white/70' : 'text-black/70'}`}>
            We reserve the right to modify these terms at any time. We will notify users of any material changes via email or platform notification.
          </p>
          <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-black'}`}>
            Contact Us
          </h2>
          <p className={`${isDark ? 'text-white/70' : 'text-black/70'}`}>
            If you have any questions about these Terms of Service, please contact us at{' '}
            <a href="mailto:legal@otakulibrary.com" className="text-purple-500 hover:text-purple-400 font-bold">
              legal@otakulibrary.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
