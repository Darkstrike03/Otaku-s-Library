import SuggestContent from '@/components/SuggestContent';

export const metadata = {
  title: 'Suggest Content - Otaku\'s Library',
  description: 'Suggest new anime, manga, and more content for our library',
};

export default function SuggestPage({ isDark = true }) {
  return <SuggestContent isDark={isDark} />;
}