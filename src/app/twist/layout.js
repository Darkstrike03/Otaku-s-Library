export const metadata = {
  title: "TWIST - Otaku's Library | User Curated Favorites",
  description: "Explore TWIST - curated favorite lists from fellow otaku. Discover personalized anime, manga, manhwa, manhua, donghua, and web novel recommendations from passionate fans in our community.",
  keywords: [
    'twist',
    'user favorites',
    'curated lists',
    'anime recommendations',
    'manga recommendations',
    'user lists',
    'community picks',
    'otaku favorites',
    'curated anime',
    'curated manga',
    'personal recommendations'
  ],
  
  openGraph: {
    title: "TWIST - Otaku's Library",
    description: "Discover curated favorite lists from passionate otaku. Explore personalized recommendations from our community.",
    type: 'website',
    siteName: "Otaku's Library",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "TWIST - Curated Favorites from Otaku's Library",
      }
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: "TWIST - Otaku's Library",
    description: "Explore curated favorites from fellow otaku. Find your next obsession!",
    images: ['/og-image.png'],
  },
};

export default function TwistLayout({ children }) {
  return children;
}
