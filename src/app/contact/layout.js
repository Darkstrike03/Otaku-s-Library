export const metadata = {
  title: "Contact Us - Otaku's Library | Get in Touch",
  description: "Have questions, feedback, or suggestions? Contact the Otaku's Library team. We'd love to hear from you about features, bug reports, or partnership opportunities.",
  keywords: [
    'contact otaku library',
    'anime tracker support',
    'manga tracker contact',
    'get in touch',
    'feedback',
    'bug report',
    'customer support'
  ],
  
  openGraph: {
    title: "Contact Us - Otaku's Library",
    description: "Get in touch with the Otaku's Library team. We're here to help with questions, feedback, and suggestions.",
    type: 'website',
    siteName: "Otaku's Library",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: "Contact Otaku's Library" }],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: "Contact Us - Otaku's Library",
    description: "Have questions or feedback? We'd love to hear from you!",
    images: ['/og-image.png'],
  },
};

export default function ContactLayout({ children }) {
  return children;
}
