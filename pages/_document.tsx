import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fa" dir="rtl">
      <Head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        
        {/* Meta tags */}
        <meta charSet="utf-8" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="مجتبی تحریر" />
        <meta name="apple-mobile-web-app-title" content="مجتبی تحریر" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "مجتبی تحریر",
              "description": "فروشگاه آنلاین لوازم التحریر و نوشت‌افزار",
              "url": "https://mojtabatahrir.com",
              "logo": "https://mojtabatahrir.com/images/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+98-21-12345678",
                "contactType": "customer service",
                "availableLanguage": "Persian"
              },
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "خیابان انقلاب، نرسیده به چهارراه کالج",
                "addressLocality": "تهران",
                "addressCountry": "IR"
              },
              "sameAs": [
                "https://instagram.com/mojtabatahrir",
                "https://telegram.me/mojtabatahrir"
              ]
            })
          }}
        />

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}

        {/* Critical CSS for RTL */}
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              box-sizing: border-box;
            }
            html {
              scroll-behavior: smooth;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              direction: rtl;
              text-align: right;
            }
            .loading-skeleton {
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: loading 1.5s infinite;
            }
            @keyframes loading {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `
        }} />
      </Head>
      <body>
        {/* No Script Fallback */}
        <noscript>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            textAlign: 'center',
            padding: '20px'
          }}>
            <div>
              <h2>JavaScript مورد نیاز است</h2>
              <p>برای استفاده از این وب‌سایت، لطفاً JavaScript را فعال کنید.</p>
            </div>
          </div>
        </noscript>

        <Main />
        <NextScript />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </Html>
  );
}