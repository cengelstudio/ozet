'use client'

import { Fragment, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Disclosure, Transition, Menu } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import InfoStrip from './InfoStrip'
import { useAuth } from '@/hooks/useAuth'

const navigation = [
  { name: 'Ana Sayfa', href: '/' as const },
  { name: 'Son Dakika', href: '/son-dakika' as const },
  { name: 'Harita', href: '/harita' as const },
  { name: '#Deprem', href: '/deprem-haberleri' as const },
  { name: '#Yangın', href: '/yangin-haberleri' as const },
  { name: 'Platformlar', href: '/platformlar' as const },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, isAuthenticated, loading, logout } = useAuth()
  const pathname = usePathname()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Arama sayfasına yönlendir
      window.location.href = `/arama/${encodeURIComponent(searchQuery.trim())}`
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  // ESC tuşuna basıldığında search input'unu kapat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }

    if (isSearchOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchOpen])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="fixed w-full top-0 z-50">
      <Disclosure as="nav" className="bg-black">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between items-center py-4">
                {/* Logo */}
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Link href="/" className="block h-14 flex items-center">
                      <Image
                        src="/assets/logo-ozet.png"
                        alt="ÖZET.today"
                        width={128}
                        height={32}
                        className="h-11 w-auto"
                        priority
                      />
                    </Link>
                  </div>

                  {/* Desktop Navigation */}
                  <div className="hidden lg:ml-4 lg:flex">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            isActive
                              ? 'text-white font-bold'
                              : 'text-gray-300 hover:text-white',
                            'inline-flex items-center px-3 h-14 text-sm transition-colors duration-200'
                          )}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          {item.name}
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* Right Side Actions */}
                <div className="hidden lg:flex lg:items-center space-x-4">
                  <div className="relative">
                    {/* Search Button/Input Container */}
                    <div className="flex items-center">
                      <Transition
                        show={isSearchOpen}
                        as={Fragment}
                        enter="transition-all ease-out duration-300 transform"
                        enterFrom="opacity-0 scale-95 -translate-x-4"
                        enterTo="opacity-100 scale-100 translate-x-0"
                        leave="transition-all ease-in duration-200 transform"
                        leaveFrom="opacity-100 scale-100 translate-x-0"
                        leaveTo="opacity-0 scale-95 -translate-x-4"
                      >
                        <form onSubmit={handleSearch} className="relative mr-3">
                          <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Haberlerde ara..."
                            className="w-72 h-9 pl-4 pr-10 text-sm bg-gray-900 border border-gray-700 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors duration-200"
                          >
                            <MagnifyingGlassIcon className="h-4 w-4" />
                          </button>
                        </form>
                      </Transition>

                      <button
                        type="button"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className={`text-white hover:text-gray-300 transition-all duration-200 ${
                          isSearchOpen ? 'rotate-90 text-gray-400' : 'rotate-0'
                        }`}
                      >
                        {isSearchOpen ? (
                          <XMarkIcon className="h-5 w-5" />
                        ) : (
                          <MagnifyingGlassIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex items-center h-9 px-4 text-sm text-white bg-gray-600 rounded-lg">
                      <div className="animate-pulse bg-gray-400 rounded-full h-4 w-4"></div>
                      <span className="ml-2">Yükleniyor...</span>
                    </div>
                  ) : isAuthenticated && user ? (
                    <Menu as="div" className="relative">
                      <Menu.Button className="flex items-center space-x-2 border border-gray-600 hover:border-gray-500 rounded-lg px-3 py-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
                        <div className="flex items-center space-x-2">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-600"
                            />
                          ) : (
                            <UserCircleIcon className="h-8 w-8 text-white" />
                          )}
                          <span className="text-sm text-white font-medium hidden md:block">
                            {user.name}
                          </span>
                        </div>
                        <ChevronDownIcon className="h-4 w-4 text-gray-300 transition-transform duration-200" />
                      </Menu.Button>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95 -translate-y-2"
                        enterTo="transform opacity-100 scale-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="transform opacity-100 scale-100 translate-y-0"
                        leaveTo="transform opacity-0 scale-95 -translate-y-2"
                      >
                        <Menu.Items className="absolute right-0 mt-4 w-56 bg-white rounded-xl shadow-xl ring-1 ring-gray-200 focus:outline-none z-50 border border-gray-100">
                          <div className="py-2">
                            {/* User Info Header */}
                            <div className="px-4 py-3 border-b border-gray-100">
                              <div className="flex items-center space-x-3">
                                {user.avatarUrl ? (
                                  <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-200"
                                  />
                                ) : (
                                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                  <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </div>

                            {/* Menu Items */}
                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <a
                                    href="https://id.cengel.studio/account"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${
                                      active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                    } flex items-center px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group`}
                                  >
                                    <div className="flex items-center justify-center w-5 h-5 mr-3 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-200">
                                      <UserCircleIcon className="h-3 w-3 text-blue-600" />
                                    </div>
                                    Hesabım
                                    <svg className="ml-auto h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={handleLogout}
                                    className={`${
                                      active ? 'bg-red-50 text-red-700' : 'text-red-600'
                                    } flex items-center w-full text-left px-4 py-3 text-sm hover:bg-red-50 hover:text-red-700 transition-all duration-200 group`}
                                  >
                                    <div className="flex items-center justify-center w-5 h-5 mr-3 rounded-full bg-red-100 group-hover:bg-red-200 transition-colors duration-200">
                                      <svg className="h-3 w-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                      </svg>
                                    </div>
                                    Çıkış Yap
                                  </button>
                                )}
                              </Menu.Item>
                            </div>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : (
                    <Link
                      href="/giris"
                      className="flex items-center h-9 px-4 text-sm text-white hover:text-white bg-[#ff0102] hover:bg-red-600 font-medium transition-colors duration-200 rounded-lg focus:outline-none shadow-sm"
                    >
                      <UserCircleIcon className="h-4 w-4" aria-hidden="true" />
                      <span className="ml-2">Giriş Yap</span>
                    </Link>
                  )}
                </div>

                {/* Mobile menu button */}
                <div className="flex items-center lg:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center h-8 px-2 text-gray-300 hover:text-white transition-colors duration-200 rounded focus:outline-none">
                    <span className="sr-only">Ana menüyü aç</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            <Disclosure.Panel className="lg:hidden bg-black">
              <div className="space-y-1 pb-3 pt-2">
                {/* Mobile navigation */}
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Disclosure.Button
                      key={item.name}
                      as={Link}
                      href={item.href}
                      className={classNames(
                        isActive
                          ? 'text-white font-bold'
                          : 'text-gray-300 hover:text-white',
                        'block px-3 py-2 text-base transition-colors duration-200'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  )
                })}
              </div>

              {/* Mobile search */}
              <div className="border-t border-gray-700 pb-3 pt-4 px-4">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Haberlerde ara..."
                    className="w-full h-10 pl-4 pr-10 text-sm bg-gray-900 border border-gray-700 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4" />
                  </button>
                </form>
              </div>

              {/* Mobile user actions */}
              <div className="border-t border-gray-700 pb-3 pt-4 px-2">
                <div className="space-y-1">
                  {loading ? (
                    <div className="px-3 py-2 text-base text-gray-400">
                      Yükleniyor...
                    </div>
                  ) : isAuthenticated && user ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 px-3 py-2 border border-gray-600 rounded-lg mx-2">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <UserCircleIcon className="h-8 w-8 text-white" />
                        )}
                        <div>
                          <div className="text-sm text-white font-medium">{user.name}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                      <a
                        href="https://id.cengel.studio/account"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-left px-3 py-2 text-base text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none"
                      >
                        Hesabım
                      </a>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-2 text-base text-red-400 hover:text-red-300 transition-colors duration-200 focus:outline-none"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/giris"
                      className="block px-3 py-2 text-base text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none"
                    >
                      Giriş Yap
                    </Link>
                  )}
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <InfoStrip />
    </div>
  )
}
