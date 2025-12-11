import Profile from '@/components/Profile';

export const metadata = {
  title: "My Profile - Otaku's Library | Manage Your Account",
  description: "View and manage your profile, update your information, customize your experience, and track your otaku journey. See your stats, achievements, and activity history.",
  keywords: [
    'user profile',
    'my profile',
    'account settings',
    'user stats',
    'profile settings',
    'otaku profile',
    'anime stats',
    'manga stats'
  ],
  
  openGraph: {
    title: "My Profile - Otaku's Library",
    description: "Manage your profile and track your otaku journey with personalized stats and achievements.",
    type: 'profile',
    siteName: "Otaku's Library",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: "My Profile - Otaku's Library" }],
  },
  
  twitter: {
    card: 'summary',
    title: "My Profile - Otaku's Library",
    description: "View your stats, achievements, and activity.",
  },
  
  robots: {
    index: false,
    follow: true,
  },
};

export default function ProfilePage() {
  return <Profile />;
}