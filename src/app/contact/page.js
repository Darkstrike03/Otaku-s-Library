'use client';

import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Mail, MessageCircle, Github, MapPin, Send } from 'lucide-react';

export const metadata = {
  title: "Contact Us - Otaku's Library | Get in Touch",
  description: "Have questions, feedback, or suggestions? Contact the Otaku's Library team. We'd love to hear from you about features, bug reports, or partnership opportunities.",
  keywords: ['contact otaku library', 'anime tracker support', 'manga tracker contact', 'get in touch', 'feedback', 'bug report', 'customer support'],
  openGraph: {
    title: "Contact Us - Otaku's Library",
    description: "Get in touch with the Otaku's Library team. We're here to help with questions, feedback, and suggestions.",
    type: 'website',
    siteName: "Otaku's Library",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: "Contact Otaku's Library" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Contact Us - Otaku's Library",
    description: "Have questions or feedback? We'd love to hear from you!",
  },
};

export default function ContactPage() {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', formData);
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-white'} transition-colors duration-500 py-16`}>
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
            Contact Us
          </h1>
          <p className={`text-lg ${isDark ? 'text-white/60' : 'text-black/60'}`}>
            We'd love to hear from you!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Mail, title: 'Email', content: 'support@otakulibrary.com', color: 'from-purple-500 to-pink-500' },
            { icon: MessageCircle, title: 'Discord', content: 'Join our server', color: 'from-cyan-500 to-blue-500' },
            { icon: Github, title: 'GitHub', content: 'Contribute to the project', color: 'from-pink-500 to-rose-500' }
          ].map((contact, index) => {
            const Icon = contact.icon;
            return (
              <div
                key={index}
                className={`p-6 rounded-2xl text-center ${
                  isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
                } backdrop-blur-xl hover:scale-105 transition-all duration-300`}
              >
                <div className={`w-12 h-12 rounded-xl mb-4 mx-auto flex items-center justify-center bg-gradient-to-br ${contact.color}`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className={`font-black mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                  {contact.title}
                </h3>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  {contact.content}
                </p>
              </div>
            );
          })}
        </div>

        <div className={`p-8 rounded-2xl ${
          isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
        } backdrop-blur-xl`}>
          <h2 className={`text-2xl font-black mb-6 ${isDark ? 'text-white' : 'text-black'}`}>
            Send us a message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className={`w-full px-4 py-3 rounded-xl ${
                    isDark ? 'bg-white/5 text-white border border-white/10' : 'bg-black/5 text-black border border-black/10'
                  } outline-none focus:border-purple-500 transition-all duration-300`}
                />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className={`w-full px-4 py-3 rounded-xl ${
                    isDark ? 'bg-white/5 text-white border border-white/10' : 'bg-black/5 text-black border border-black/10'
                  } outline-none focus:border-purple-500 transition-all duration-300`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className={`w-full px-4 py-3 rounded-xl ${
                  isDark ? 'bg-white/5 text-white border border-white/10' : 'bg-black/5 text-black border border-black/10'
                } outline-none focus:border-purple-500 transition-all duration-300`}
              />
            </div>
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={6}
                className={`w-full px-4 py-3 rounded-xl ${
                  isDark ? 'bg-white/5 text-white border border-white/10' : 'bg-black/5 text-black border border-black/10'
                } outline-none focus:border-purple-500 transition-all duration-300 resize-none`}
              />
            </div>
            <button
              type="submit"
              className={`w-full px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2`}
            >
              <Send size={20} />
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
