import Login from '@/components/Login';

export const metadata = {
  title: "Login - Otaku's Library | Sign In to Your Account",
  description: "Welcome back! Sign in to your Otaku's Library account to access your anime lists, manga collections, reviews, and personalized recommendations. Join thousands of otaku worldwide.",
  keywords: ['login', 'sign in', 'user login', 'account access', 'anime tracker login', 'manga tracker login'],
  openGraph: {
    title: "Login - Otaku's Library",
    description: "Sign in to access your anime and manga lists, reviews, and personalized content.",
    type: 'website',
    siteName: "Otaku's Library",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: "Login - Otaku's Library" }],
  },
  twitter: {
    card: 'summary',
    title: "Login - Otaku's Library",
    description: "Welcome back! Sign in to your account.",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ProfilePage() {
  return <Login />;
}