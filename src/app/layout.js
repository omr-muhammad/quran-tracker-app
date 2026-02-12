import localFont from 'next/font/local';
import './globals.css';

const amiri = localFont({
  src: [
    {
      path: '../../public/fonts/Amiri-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Amiri-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-amiri',
});

export const metadata = {
  title: 'تعاهد - متتبع مراجعة القرآن',
  description: 'تطبيق لتنظيم وتتبع مراجعة حفظ القرآن الكريم',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'تعاهد',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a1929',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={amiri.variable} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = JSON.parse(localStorage.getItem('taahud_data'))?.theme || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
