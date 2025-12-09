import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
  title: "Otaku's Library",
  description: "Discover anime, manga, manhwa, manhua, donghua, and webnovels",
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}