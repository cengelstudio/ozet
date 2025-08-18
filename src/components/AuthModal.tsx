import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Image from 'next/image'
import Link from 'next/link'

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
  action: 'like' | 'save' | 'follow'
}

const actionMessages = {
  like: 'beğenmek',
  save: 'kaydetmek',
  follow: 'takip etmek'
}

export default function AuthModal({ isOpen, onClose, action }: AuthModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-xl transition-all border border-gray-100">
                <div className="flex flex-col items-center">
                  {/* Logo */}
                  <div className="w-20 h-20 mb-8 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                    <Image
                      src="/assets/logo.png"
                      alt="ÖZET"
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </div>

                  {/* Title & Description */}
                  <div className="text-center mb-8">
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-bold text-gray-900 mb-3"
                    >
                      Giriş Yapmalısın
                    </Dialog.Title>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Bu haberi <span className="text-primary-600 font-semibold">{actionMessages[action]}</span> için<br />giriş yapman gerekiyor.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col w-full gap-3">
                    <Link
                      href="/giris"
                      className="group relative inline-flex justify-center items-center gap-2 px-6 py-4 text-lg font-semibold text-white bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:from-red-800 active:to-red-900 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-all duration-200 overflow-hidden border-2 border-red-500"
                      onClick={onClose}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
                      </svg>
                      Giriş Yap
                    </Link>
                  </div>

                  {/* Info Text */}
                  <div className="mt-8 text-center">
                    <p className="text-base text-gray-500">
                      Henüz hesabın yok mu?
                    </p>
                    <Link
                      href="/kayit"
                      className="mt-2 inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold text-base hover:underline"
                      onClick={onClose}
                    >
                      Hemen kaydol
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-0.5">
                        <path fillRule="evenodd" d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
