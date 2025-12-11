import List from '@/components/List';

export const metadata = {
  title: "My Lists - Otaku's Library | Track Your Anime & Manga",
  description: "Manage your personal anime and manga lists. Organize what you're watching, reading, planning, completed, on-hold, or dropped. Track your progress and never forget where you left off.",
  keywords: [
    'anime list',
    'manga list',
    'my anime list',
    'my manga list',
    'track anime',
    'track manga',
    'watching list',
    'reading list',
    'completed list',
    'plan to watch',
    'plan to read'
  ],
  
  openGraph: {
    title: "My Lists - Otaku's Library",
    description: "Track and organize your anime, manga, manhwa, and more. Keep all your lists in one place.",
    type: 'website',
    siteName: "Otaku's Library",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: "My Lists - Otaku's Library" }],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: "My Lists - Otaku's Library",
    description: "Organize and track all your anime and manga in one place.",
    images: ['/og-image.png'],
  },
};

export default function ProfilePage() {
  return <List />;
}