import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
  title: "Otaku's Library",
  description: "Discover anime, manga, manhwa, manhua, donghua, and webnovels",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}