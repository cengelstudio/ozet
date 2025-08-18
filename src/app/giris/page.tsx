import Image from 'next/image'
import Link from 'next/link'
import LoginForm from '@/components/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Giriş',
  description: 'ÖZET.today hesabınıza giriş yapın ve güncel haberleri takip edin. Haber kategorileri takip etmek, beğenmek ve yorumlama özelliklerini kullanın.',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="flex h-screen">
        {/* Sol Panel - Brand & Bilgi */}
        <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center bg-gradient-to-br from-red-600 via-red-500 to-red-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 max-w-md text-center text-white px-8">
            <Link href="/" className="inline-block mb-8">
              <Image
                src="/assets/logo-ozet.png"
                alt="ÖZET.today"
                width={200}
                height={50}
                className="h-12 w-auto"
                priority
              />
            </Link>
            <h1 className="text-3xl font-bold mb-4">
              Türkiye'nin Haber Merkezi
            </h1>
            <p className="text-red-100 text-lg leading-relaxed mb-8">
              Güncel haberleri takip edin, kişiselleştirilmiş haber akışınızı oluşturun ve favori platformlarınızdan haberleri kaçırmayın.
            </p>
            <div className="space-y-4 text-sm text-red-100">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span>10+ haber platformundan güncel haberler</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span>Kişiselleştirilmiş haber akışı</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span>Gelişmiş arama ve filtreleme</span>
              </div>
            </div>
          </div>
          {/* Dekoratif pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        </div>

        {/* Sağ Panel - Giriş Formu */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex justify-center mb-8 lg:hidden">
              <Link href="/">
                <Image
                  src="/assets/logo-ozet.png"
                  alt="ÖZET.today"
                  width={160}
                  height={40}
                  className="h-10 w-auto"
                  priority
                />
              </Link>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                ÖZET.today'e Hoş Geldiniz
              </h2>
              <p className="text-gray-600">
                Cengel Studio hesabınızla güvenli giriş yapın ve haberlerinizi takip etmeye başlayın
              </p>
            </div>

            <LoginForm />

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Cengel Studio hesabınız yok mu?{' '}
                <a
                  href="https://id.cengel.studio/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-red-600 hover:text-red-500 transition-colors duration-200"
                >
                  Ücretsiz hesap oluşturun
                </a>
              </p>
            </div>


          </div>
        </div>
      </div>
    </div>
  )
}
