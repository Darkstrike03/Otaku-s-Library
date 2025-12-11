import SuggestContent from '@/components/SuggestContent';

export const metadata = {
  title: "Suggest Content - Otaku's Library | Add Missing Titles",
  description: "Can't find your favorite anime, manga, manhwa, manhua, donghua, or web novel? Suggest new content to add to our library. Help us build the most comprehensive otaku database.",
  keywords: ['suggest content', 'add anime', 'add manga', 'request anime', 'request manga', 'missing content', 'submit suggestion', 'contribute'],
  openGraph: {
    title: "Suggest Content - Otaku's Library",
    description: "Help us grow! Suggest anime, manga, or other content that's missing from our library.",
    type: 'website',
    siteName: "Otaku's Library",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: "Suggest Content - Otaku's Library" }],
  },
  twitter: {
    card: 'summary',
    title: "Suggest Content - Otaku's Library",
    description: "Can't find your favorite title? Suggest it and help us expand our library!",
  },
};

export default function SuggestPage({ isDark = true }) {
  return <SuggestContent isDark={isDark} />;
}