export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="text-lg font-medium text-gray-700">Yükleniyor...</span>
        </div>
        <p className="mt-2 text-sm text-gray-500">Haberler getiriliyor</p>
      </div>
    </div>
  )
}
