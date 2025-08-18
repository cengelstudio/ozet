import {useAuthenticatedBlitzContext} from "../blitz-server"
import Link from "next/link"
import { GlobeAltIcon } from "@heroicons/react/24/solid"

export default async function AuthLayout({children}: {children: React.ReactNode}) {
  await useAuthenticatedBlitzContext({
    redirectAuthenticatedTo: "/",
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <GlobeAltIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                  ÖZET.today
                </h1>
                <p className="text-xs text-gray-500">Güncel Haberler</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative pt-24 pb-12">
        {children}
      </div>
    </div>
  )
}
