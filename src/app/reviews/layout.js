export const metadata = {
  title: 'All Reviews - Community Ratings & Opinions | OLIB',
  description: 'Explore all community reviews, ratings, and opinions on anime, manga, manhwa, manhua, donghua, and web novels. Discover what others think and find your next favorite content.',
  keywords: [
    'reviews',
    'anime reviews',
    'manga reviews',
    'manhwa reviews',
    'community ratings',
    'user reviews',
    'content ratings',
    'otaku opinions',
    'OLIB reviews'
  ],
  openGraph: {
    title: 'All Reviews - Community Ratings & Opinions | OLIB',
    description: 'Explore all community reviews, ratings, and opinions on anime, manga, manhwa, manhua, donghua, and web novels.',
    type: 'website',
    siteName: 'OLIB - Otaku Library',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'OLIB Community Reviews'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Reviews - Community Ratings & Opinions | OLIB',
    description: 'Explore all community reviews and ratings from the OLIB community.',
    images: ['/og-image.jpg']
  },
  alternates: {
    canonical: '/reviews'
  }
};

export default function ReviewsLayout({ children }) {
  return children;
}
