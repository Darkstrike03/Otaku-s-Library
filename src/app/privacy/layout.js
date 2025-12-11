export const metadata = {
  title: "Privacy Policy - Otaku's Library | Your Data Protection",
  description: "Read Otaku's Library privacy policy. Learn how we collect, use, protect, and manage your personal information. We take your privacy seriously and are committed to transparency.",
  keywords: [
    'privacy policy',
    'data protection',
    'user privacy',
    'data security',
    'cookies policy',
    'GDPR compliance',
    'privacy rights'
  ],
  
  openGraph: {
    title: "Privacy Policy - Otaku's Library",
    description: "Your privacy matters. Learn how Otaku's Library protects and manages your personal information.",
    type: 'website',
    siteName: "Otaku's Library",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: "Privacy Policy - Otaku's Library" }],
  },
  
  twitter: {
    card: 'summary',
    title: "Privacy Policy - Otaku's Library",
    description: "Learn how we protect your data and respect your privacy.",
  },
};

export default function PrivacyLayout({ children }) {
  return children;
}
