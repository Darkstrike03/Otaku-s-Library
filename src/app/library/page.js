import Library from '@/components/Library';

export const metadata = {
  title: "Browse Library - Otaku's Library | Anime, Manga, Manhwa & More",
  description: "Explore our comprehensive library of anime, manga, manhwa, manhua, donghua, and web novels. Filter, sort, and discover your next favorite series with advanced search and personalized recommendations.",
  keywords: [
    'anime library',
    'manga library',
    'browse anime',
    'browse manga',
    'manhwa list',
    'manhua list',
    'donghua list',
    'web novels',
    'light novels',
    'anime catalog',
    'manga catalog',
    'discover anime',
    'discover manga'
  ],
  
  openGraph: {
    title: "Browse Library - Otaku's Library",
    description: "Explore thousands of anime, manga, manhwa, manhua, donghua, and web novels. Your ultimate content discovery platform.",
    type: 'website',
    siteName: "Otaku's Library",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: "Browse Otaku's Library" }],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: "Browse Library - Otaku's Library",
    description: "Discover anime, manga, manhwa, manhua, donghua, and web novels all in one place.",
    images: ['/og-image.png'],
  },
};

export default function LibraryPage() {
  return <Library />;
}