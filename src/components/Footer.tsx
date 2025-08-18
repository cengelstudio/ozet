import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo ve açıklama */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/assets/logo-ozet.png"
                alt="ÖZET.today"
                width={120}
                height={30}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed max-w-md">
              Türkiye'nin haber merkezi. Güncel haberleri takip edin, kişiselleştirilmiş haber akışınızı oluşturun ve favori platformlarınızdan haberleri kaçırmayın.
            </p>
          </div>

          {/* Hızlı linkler */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-600 hover:text-red-600 transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/son-dakika" className="text-sm text-gray-600 hover:text-red-600 transition-colors">
                  Son Dakika
                </Link>
              </li>
              <li>
                <Link href="/platformlar" className="text-sm text-gray-600 hover:text-red-600 transition-colors">
                  Platformlar
                </Link>
              </li>
              <li>
                <Link href="/arama" className="text-sm text-gray-600 hover:text-red-600 transition-colors">
                  Arama
                </Link>
              </li>
            </ul>
          </div>

          {/* Destek */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Destek</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/giris" className="text-sm text-gray-600 hover:text-red-600 transition-colors">
                  Giriş Yap
                </Link>
              </li>
              <li>
                <Link href="/kullanim-kosullari" className="text-sm text-gray-600 hover:text-red-600 transition-colors">
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link href="/gizlilik-politikasi" className="text-sm text-gray-600 hover:text-red-600 transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info@ozet.today"
                  className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  İletişim
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt çizgi */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2024 ÖZET.today. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a
                href="https://id.cengel.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Cengel Studio ile güçlendirildi
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
