export const metadata = {
  title: "Terms of Service - Otaku's Library | User Agreement",
  description: "Read Otaku's Library terms of service. Understand your rights, responsibilities, and acceptable use policies when using our anime and manga tracking platform.",
  keywords: [
    'terms of service',
    'user agreement',
    'terms and conditions',
    'acceptable use policy',
    'user rights',
    'platform rules'
  ],
  
  openGraph: {
    title: "Terms of Service - Otaku's Library",
    description: "Understand the terms and conditions for using Otaku's Library platform.",
    type: 'website',
    siteName: "Otaku's Library",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: "Terms of Service - Otaku's Library" }],
  },
  
  twitter: {
    card: 'summary',
    title: "Terms of Service - Otaku's Library",
    description: "Your rights and responsibilities as a user of our platform.",
  },
};

export default function TermsLayout({ children }) {
  return children;
}
