import Link from 'next/link'

const navigation = {
  main: [
    { name: 'Hakkımızda', href: '/hakkimizda' },
    { name: 'Gizlilik Politikası', href: '/gizlilik' },
    { name: 'Kullanım Koşulları', href: '/kosullar' },
    { name: 'İletişim', href: '/iletisim' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-primary-700 font-bold text-lg">Ö</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ÖZET.today</span>
            </div>
            <p className="text-gray-600 max-w-md">
              Türkiye ve dünyadan en güncel haberleri, güvenilir kaynaklardan derleyerek sunuyoruz.
              Kaliteli ve tarafsız habercilik anlayışımızla sizlere hizmet veriyoruz.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Platform</h3>
            <nav className="space-y-3">
              {navigation.main.slice(0, 2).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Yasal</h3>
            <nav className="space-y-3">
              {navigation.main.slice(2).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ÖZET.today. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  )
}
