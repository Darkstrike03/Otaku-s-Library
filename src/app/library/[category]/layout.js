export async function generateMetadata({ params }) {
  const { category } = await params;
  
  const categoryNames = {
    anime: 'Anime',
    manga: 'Manga',
    manhwa: 'Manhwa',
    manhua: 'Manhua',
    donghua: 'Donghua',
    webnovel: 'Web Novels',
  };

  const categoryName = categoryNames[category?.toLowerCase()] || 'Content';
  
  return {
    title: `${categoryName} Library - Otaku's Library | Browse ${categoryName}`,
    description: `Explore our comprehensive ${categoryName} library. Discover new titles, read reviews, track your progress, and get personalized recommendations. Find your next favorite ${categoryName.toLowerCase()} series.`,
    keywords: [
      `${category} library`,
      `browse ${category}`,
      `${category} list`,
      `${category} database`,
      `${category} catalog`,
      `find ${category}`,
      `${category} recommendations`,
      `track ${category}`,
    ],
    openGraph: {
      title: `${categoryName} Library - Otaku's Library`,
      description: `Browse and discover ${categoryName}. Track your favorites, read reviews, and get personalized recommendations.`,
      type: 'website',
      siteName: "Otaku's Library",
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${categoryName} Library - Otaku's Library` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryName} Library - Otaku's Library`,
      description: `Discover and track ${categoryName}. Your personal ${categoryName.toLowerCase()} collection awaits!`,
    },
  };
}

export default function LibraryCategoryLayout({ children }) {
  return children;
}
