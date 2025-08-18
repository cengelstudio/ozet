import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import TokenVerificationProvider from '../components/TokenVerificationProvider'
import AutoLogoutNotification from '../components/AutoLogoutNotification'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

// Dinamik URL oluşturma - her zaman production URL'ini kullan
const getBaseUrl = () => {
  return 'https://ozet.today'
}

const baseUrl = getBaseUrl()

export const metadata = {
  title: {
    default: 'ÖZET: Günün Özeti',
    template: '%s - ÖZET: Günün Özeti'
  },
  description: 'Türkiye ve dünyadan en güncel haberler, son dakika gelişmeleri, ekonomi, siyaset, spor ve teknoloji haberleri. Güvenilir kaynaklardan derlenen tarafsız habercilik.',
  keywords: [
    'haber',
    'güncel haberler',
    'son dakika',
    'Türkiye haberleri',
    'dünya haberleri',
    'ekonomi haberleri',
    'siyaset haberleri',
    'spor haberleri',
    'teknoloji haberleri',
    'gazete',
    'haber sitesi',
    'günlük haberler',
    'haber özeti',
    'güvenilir haber',
    'tarafsız habercilik'
  ],
  authors: [{ name: 'ÖZET.today' }],
  creator: 'ÖZET.today',
  publisher: 'ÖZET.today',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: `${baseUrl}`,
    title: 'ÖZET',
    description: 'Türkiye ve dünyadan en güncel haberler, son dakika gelişmeleri, ekonomi, siyaset, spor ve teknoloji haberleri.',
    siteName: 'ÖZET',
    images: [
      {
        url: `${baseUrl}/social-profile.png`,
        width: 1200,
        height: 630,
        alt: 'ÖZET.today logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ÖZET',
    description: 'Türkiye ve dünyadan en güncel haberler, son dakika gelişmeleri.',
    images: [`${baseUrl}/social-profile.png`],
    creator: '@ozettoday',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className={`${inter.variable} h-full bg-white`}>
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ff0102" />
        <meta name="msapplication-TileColor" content="#ff0102" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="geo.region" content="TR" />
        <meta name="geo.placename" content="Türkiye" />
        <meta name="geo.position" content="39.9334;32.8597" />
        <meta name="ICBM" content="39.9334, 32.8597" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="1 days" />
        <meta name="language" content="Turkish" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href="https://ozet.today" />
        <link rel="alternate" hrefLang="tr" href="https://ozet.today" />
        <link rel="alternate" hrefLang="x-default" href="https://ozet.today" />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2Q6LRYJGFT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2Q6LRYJGFT');
          `}
        </Script>
      </head>
      <body className="h-full">
        <TokenVerificationProvider>
          <div className="min-h-full">
            <Header />
            <AutoLogoutNotification />
            <main className="pt-[90px]">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </TokenVerificationProvider>
      </body>
    </html>
  )
}
