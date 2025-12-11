export async function generateMetadata({ params }) {
  const { username } = await params;
  
  // Try to load user data for better metadata
  let displayName = username;
  let bio = '';
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/JSON/TWIST/${username}.json`);
    if (response.ok) {
      const userData = await response.json();
      displayName = userData.displayName || username;
      bio = userData.bio || '';
    }
  } catch (error) {
    // If fetch fails, use username as fallback
  }
  
  return {
    title: `${displayName}'s TWIST - Otaku's Library | Curated Favorites`,
    description: bio || `Explore ${displayName}'s curated list of favorite anime, manga, manhwa, manhua, donghua, and web novels. Discover what this passionate otaku recommends from their personal collection.`,
    keywords: [
      `${username} favorites`,
      'user favorites',
      'curated anime',
      'curated manga',
      'personal recommendations',
      'twist list',
      'otaku recommendations',
    ],
    openGraph: {
      title: `${displayName}'s TWIST - Otaku's Library`,
      description: `Explore ${displayName}'s favorite anime, manga, and more. Get personalized recommendations from a fellow otaku.`,
      type: 'profile',
      siteName: "Otaku's Library",
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${displayName}'s TWIST` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName}'s TWIST - Otaku's Library`,
      description: `Check out ${displayName}'s curated favorites! Find your next obsession.`,
    },
  };
}

export default function UserTwistLayout({ children }) {
  return children;
}
