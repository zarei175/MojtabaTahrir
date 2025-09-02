import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { WishlistProvider } from '../contexts/WishlistContext';
import { ToastProvider } from '../contexts/ToastContext';
import { LoadingProvider } from '../contexts/LoadingContext';
import LoadingBar from '../components/ui/LoadingBar';
import Toast from '../components/ui/Toast';
import '../styles/globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Google Analytics tracking
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Track page views
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Prevent zoom on iOS Safari
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', preventDefault, { passive: false });
    return () => {
      document.removeEventListener('touchstart', preventDefault);
    };
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <div className={`${inter.variable} font-sans antialiased`}>
        <LoadingProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ToastProvider>
                  <LoadingBar />
                  <Component {...pageProps} />
                  <Toast />
                </ToastProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </LoadingProvider>
      </div>
    </>
  );
}