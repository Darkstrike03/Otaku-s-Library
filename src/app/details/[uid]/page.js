import { notFound } from 'next/navigation';
import AnimeUI from '@/components/Pages/AnimeUi';
import MangaUI from '@/components/Pages/MangaUI';
import ManhwaUI from '@/components/Pages/ManhwaUI';
import ManhuaUI from '@/components/Pages/ManhuaUI';
import DonghuaUI from '@/components/Pages/DonghuaUI';
import { getJsonFile } from '@/lib/pages';
import NovelUI from '@/components/Pages/NovelUI';

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { uid } = await params;
  const result = await getJsonFile(uid);
  
  if (!result?.item) {
    return { 
      title: 'Not Found - Otaku\'s Library',
      description: 'Content not found'
    };
  }

  const item = result.item;
  const synopsis = item.synopsis?.replace(/\*\*\*/g, ' ') || 'No synopsis available';

  return {
    title: `${item.title} - Otaku's Library`,
    description: synopsis.substring(0, 160),
    openGraph: {
      title: item.title,
      description: synopsis.substring(0, 200),
      images: item.poster ? [
        {
          url: item.poster,
          width: 1200,
          height: 630,
          alt: item.title,
        }
      ] : [],
      type: 'website',
      siteName: "Otaku's Library",
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: synopsis.substring(0, 200),
      images: item.poster ? [item.poster] : [],
    },
  };
}

export default async function Page({ params }) {
  const { uid } = await params;
  
  if (!uid) {
    return notFound();
  }

  const lastChar = uid.slice(-1).toUpperCase();

  switch (lastChar) {
    case 'A':
      return <AnimeUI />;
    case 'M':
      return <MangaUI />;
    case 'H':
      return <ManhwaUI />;
    case 'U':
      return <ManhuaUI />;
    case 'D':
      return <DonghuaUI />;
    case 'W':
      return <NovelUI />;
    default:
      return notFound();
  }
}
