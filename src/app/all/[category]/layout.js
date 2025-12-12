export async function generateMetadata({ params }) {
  const { category } = await params;
  
  const categoryNames = {
    anime: 'Anime',
    manga: 'Manga',
    manhwa: 'Manhwa',
    manhua: 'Manhua',
    donghua: 'Donghua',
    webnovels: 'Web Novels'
  };

  const categoryName = categoryNames[category] || 'Content';

  return {
    title: `Popular ${categoryName} - Trending This Week | OLIB`,
    description: `Discover the most popular ${categoryName.toLowerCase()} this week. Browse trending titles, top ratings, and fan favorites in our comprehensive ${categoryName.toLowerCase()} collection.`,
    keywords: [
      `popular ${category}`,
      `trending ${category}`,
      `best ${category}`,
      `top ${category}`,
      `${category} rankings`,
      `${category} recommendations`,
      'otaku library',
      'OLIB'
    ],
    openGraph: {
      title: `Popular ${categoryName} - Trending This Week | OLIB`,
      description: `Discover the most popular ${categoryName.toLowerCase()} this week. Browse trending titles, top ratings, and fan favorites.`,
      type: 'website',
      siteName: 'OLIB - Otaku Library',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `Popular ${categoryName} on OLIB`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `Popular ${categoryName} - Trending This Week | OLIB`,
      description: `Discover the most popular ${categoryName.toLowerCase()} this week. Browse trending titles and top ratings.`,
      images: ['/og-image.jpg']
    },
    alternates: {
      canonical: `/all/${category}`
    }
  };
}

export default function PopularCategoryLayout({ children }) {
  return children;
}
