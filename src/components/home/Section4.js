'use client';
import React from "react";
import {
  Tv,
  BookOpen,
  BookMarked,
  LibraryBig,
  ScrollText,
  Layers,
  LucideIcon
} from "lucide-react";
import { useTheme } from '../../app/contexts/ThemeContext';
import Link from 'next/link';

export default function Section4() {
  const { isDark } = useTheme();
  const categories = [
    {
      name: "Anime",
      icon: Tv,
      gradient: "from-purple-500 to-pink-500",
      href: "/library/anime"
    },
    {
      name: "Manga",
      icon: BookOpen,
      gradient: "from-blue-500 to-cyan-500",
      href: "/library/manga"
    },
    {
      name: "Manhwa",
      icon: Layers,
      gradient: "from-orange-500 to-amber-500",
      href: "/library/manhwa"
    },
    {
      name: "Manhua",
      icon: BookMarked,
      gradient: "from-red-500 to-rose-500",
      href: "/library/manhua"
    },
    {
      name: "Donghua",
      icon: ScrollText,
      gradient: "from-green-500 to-emerald-500",
      href: "/library/donghua"
    },
    {
      name: "Web Novels",
      icon: LibraryBig,
      gradient: "from-indigo-500 to-violet-500",
      href: "/library/webnovels"
    },
  ];

  return (
    <section
      className={`py-20 transition-colors duration-500 ${
        isDark ? "bg-black" : "bg-white"
      }`}
    >
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
          <div className={`h-full w-1/3 ${
            isDark 
              ? 'bg-gradient-to-r from-transparent via-purple-500 to-transparent' 
              : 'bg-gradient-to-r from-transparent via-purple-600 to-transparent'
          }`} style={{
            animation: 'slide 3s ease-in-out infinite',
          }}></div>
        </div>
        
      <div className="container mx-auto px-4">
        {/* Title */}
        <div className="flex flex-col items-center mb-12">
          <h2
            className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Explore by{" "}
            <span
              className={`text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-pink-600`}
            >
              Category
            </span>
          </h2>

          <div
            className={`mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500`}
          ></div>

          <p
            className={`mt-4 text-sm sm:text-base ${
              isDark ? "text-white/50" : "text-black/50"
            }`}
          >
            Discover everything from anime to novels in one place
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;

            return (
              <Link
                key={idx}
                href={cat.href}
                className={`
                  group relative p-6 flex flex-col items-center rounded-2xl cursor-pointer select-none
                  backdrop-blur-xl border transition-all duration-500
                  ${
                    isDark
                      ? "bg-white/5 border-white/10 hover:border-white/20"
                      : "bg-black/5 border-black/10 hover:border-black/20"
                  }
                `}
              >
                {/* Glow Behind */}
                <div
                  className={`
                    absolute inset-0 opacity-0 group-hover:opacity-100 blur-2xl rounded-2xl 
                    bg-gradient-to-br ${cat.gradient}
                    transition-all duration-700
                  `}
                ></div>

                {/* Icon */}
                <div
                  className={`
                    relative p-4 rounded-full mb-3 transition-all duration-500
                    bg-gradient-to-br ${cat.gradient}
                    text-white shadow-lg group-hover:scale-110
                  `}
                >
                  <Icon size={28} />
                </div>

                {/* Label */}
                <p
                  className={`relative font-semibold text-sm sm:text-base transition-all duration-300 ${
                    isDark ? "text-white" : "text-black"
                  } group-hover:tracking-wide`}
                >
                  {cat.name}
                </p>

                {/* Bottom glow on hover */}
                <div
                  className={`
                    absolute bottom-0 mb-1 h-1 w-10 rounded-full opacity-0 group-hover:opacity-100
                    bg-gradient-to-r ${cat.gradient} transition-all duration-700
                  `}
                ></div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
