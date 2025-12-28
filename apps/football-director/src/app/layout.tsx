import './global.css';
import { ThemeProvider } from '../providers/ThemeProvider';
import { BottomNav } from '../components/navigation/BottomNav';
import { InstallPrompt } from '../components/pwa/InstallPrompt';
import { OfflineIndicator } from '../components/pwa/OfflineIndicator';
import { UpdateNotification } from '../components/pwa/UpdateNotification';
import { WelcomeMessage } from '../components/pwa/WelcomeMessage';

export const metadata = {
  title: 'Football Director',
  description: 'Build, manage, and lead your football team to glory. Make tactical decisions, sign players, and compete for trophies in this immersive football management simulator.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Football Director',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#21808D' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-cream-50 dark:bg-dark-bg-primary text-slate-900 dark:text-dark-text-primary transition-colors">
        <ThemeProvider>
          {children}
          <BottomNav />
          <InstallPrompt />
          <OfflineIndicator />
          <UpdateNotification />
          <WelcomeMessage />
        </ThemeProvider>
      </body>
    </html>
  );
}
