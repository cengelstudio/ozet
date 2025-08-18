export default function NewsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ÖZET.today OAuth Sistemi
        </h3>
        <p className="text-gray-600">
          Cengel Studio ile entegre OAuth sistemi başarıyla çalışıyor. Güvenli giriş ve otomatik token kontrolü aktif.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Token Doğrulama
        </h3>
        <p className="text-gray-600">
          Her 1 dakikada bir token kontrolü yapılıyor. Bağlantı kesildiğinde otomatik logout gerçekleşiyor.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Güvenlik
        </h3>
        <p className="text-gray-600">
          Session yönetimi ve CSRF koruması aktif. Tüm OAuth işlemleri güvenli şekilde gerçekleştiriliyor.
        </p>
      </div>
    </div>
  )
}
