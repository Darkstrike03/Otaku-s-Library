export const metadata = {
  title: "About Us - Otaku's Library | Our Mission & Story",
  description: "Learn about Otaku's Library - your ultimate anime, manga, and light novel tracker. Built by passionate fans to unite the otaku community worldwide with comprehensive tracking, reviews, and recommendations.",
  keywords: [
    'about otaku library',
    'anime tracker about',
    'manga tracker mission',
    'otaku community',
    'anime tracking platform',
    'who made otaku library'
  ],
  
  openGraph: {
    title: "About Us - Otaku's Library",
    description: "Built by fans for fans. Learn how Otaku's Library brings together anime, manga, manhwa, manhua, donghua, and web novels in one unified platform.",
    type: 'website',
    siteName: "Otaku's Library",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: "About Otaku's Library" }],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: "About Us - Otaku's Library",
    description: "Built by fans for fans. Your ultimate otaku companion for tracking anime, manga, and more.",
    images: ['/og-image.png'],
  },
};

export default function AboutLayout({ children }) {
  return children;
}
