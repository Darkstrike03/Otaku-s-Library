import Home from '@/components/home/Home';

export const metadata = {
  title: "Otaku's Library - Your Ultimate Anime, Manga & Light Novel Tracker",
  description: "Track anime, manga, manhwa, manhua, donghua, and web novels all in one place. Join thousands of otaku worldwide with personalized lists, reviews, and recommendations. The best of MyAnimeList, AniList, MangaUpdates, and NovelUpdates combined.",
  keywords: [
    'anime tracker',
    'manga tracker',
    'manhwa',
    'manhua',
    'donghua',
    'web novels',
    'light novels',
    'anime list',
    'manga list',
    'otaku',
    'MyAnimeList alternative',
    'AniList alternative',
    'anime database',
    'manga database',
    'anime recommendations',
    'manga recommendations',
    'track anime',
    'track manga',
    'anime reviews',
    'manga reviews'
  ],
  authors: [{ name: "Otaku's Library Team" }],
  creator: "Otaku's Library",
  publisher: "Otaku's Library",
  applicationName: "Otaku's Library",
  
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://otakulibrary.com',
    siteName: "Otaku's Library",
    title: "Otaku's Library - Your Ultimate Anime, Manga & Light Novel Tracker",
    description: "Track anime, manga, manhwa, manhua, donghua, and web novels all in one place. Join thousands of otaku worldwide with personalized lists, reviews, and recommendations.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Otaku's Library - All-in-One Otaku Platform",
        type: 'image/png',
      }
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: "Otaku's Library - Your Ultimate Anime, Manga & Light Novel Tracker",
    description: "Track anime, manga, manhwa, manhua, donghua, and web novels all in one place. The best of MyAnimeList, AniList, MangaUpdates, and NovelUpdates combined.",
    creator: '@OtakusLibrary',
    images: ['/og-image.png'],
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  alternates: {
    canonical: 'https://otaku-s-library.vercel.app',
  },
  
  category: 'entertainment',
};

export default function Page() {
  return <Home />;
}