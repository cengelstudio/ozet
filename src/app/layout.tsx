import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/useAuth"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ÖZET.today - Türkiye'nin Haber Merkezi",
  description: "Güncel haberleri takip edin, kişiselleştirilmiş haber akışınızı oluşturun ve favori platformlarınızdan haberleri kaçırmayın.",
  keywords: "haber, güncel haberler, Türkiye haberleri, son dakika, haber takip, RSS, haber platformları",
  authors: [{ name: "ÖZET.today" }],
  creator: "ÖZET.today",
  publisher: "ÖZET.today",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ozet.today'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "ÖZET.today - Türkiye'nin Haber Merkezi",
    description: "Güncel haberleri takip edin, kişiselleştirilmiş haber akışınızı oluşturun ve favori platformlarınızdan haberleri kaçırmayın.",
    url: 'https://ozet.today',
    siteName: 'ÖZET.today',
    images: [
      {
        url: '/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ÖZET.today - Türkiye\'nin Haber Merkezi',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "ÖZET.today - Türkiye'nin Haber Merkezi",
    description: "Güncel haberleri takip edin, kişiselleştirilmiş haber akışınızı oluşturun ve favori platformlarınızdan haberleri kaçırmayın.",
    images: ['/assets/og-image.jpg'],
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
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://id.cengel.studio" />

        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//id.cengel.studio" />

        {/* Meta tags for better SEO */}
        <meta name="theme-color" content="#dc2626" />
        <meta name="msapplication-TileColor" content="#dc2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ÖZET.today" />

        {/* Structured data for rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ÖZET.today",
              "description": "Türkiye'nin Haber Merkezi",
              "url": "https://ozet.today",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://ozet.today/arama?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="pt-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
