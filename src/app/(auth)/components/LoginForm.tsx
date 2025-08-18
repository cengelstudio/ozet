"use client"
import {AuthenticationError, PromiseReturnType} from "blitz"
import Link from "next/link"
import {LabeledTextField} from "src/app/components/LabeledTextField"
import {Form, FORM_ERROR} from "src/app/components/Form"
import login from "../mutations/login"
import {Login} from "../validations"
import {useMutation} from "@blitzjs/rpc"
import {useSearchParams} from "next/navigation"
import {useRouter} from "next/navigation"
import type {Route} from "next"
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

type LoginFormProps = {
  onSuccess?: (user: PromiseReturnType<typeof login>) => void
}

export const LoginForm = (props: LoginFormProps) => {
  const [loginMutation] = useMutation(login)
  const router = useRouter()
  const next = useSearchParams()?.get("next")
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex min-h-full flex-col justify-center px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-gray-900 mb-3 animate-slide-up">
            Tekrar Hoş Geldiniz
          </h1>
          <p className="text-gray-600 text-sm animate-slide-up animation-delay-150">
            Hesabınıza giriş yaparak güncel haberleri takip edin
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 animate-fade-in animation-delay-300 hover:shadow-lg transition-shadow duration-300">
          <Form
            submitText="Giriş Yap"
            schema={Login}
            initialValues={{email: "", password: ""}}
            onSubmit={async (values) => {
              try {
                await loginMutation(values)
                router.refresh()
                if (next) {
                  router.push(next as Route)
                } else {
                  router.push("/")
                }
              } catch (error: any) {
                if (error instanceof AuthenticationError) {
                  return {[FORM_ERROR]: "E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin."}
                } else {
                  return {
                    [FORM_ERROR]:
                      "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
                  }
                }
              }
            }}
          >
            <div className="space-y-4">
              <LabeledTextField
                name="email"
                label="E-posta Adresi"
                placeholder="ornek@mail.com"
                type="email"
                icon={<EnvelopeIcon />}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Beni hatırla
                  </label>
                </div>
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Şifremi unuttum
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                Giriş Yap
              </button>
            </div>
          </Form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">veya</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google ile giriş yap</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <Link
              href="/signup"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Hemen ücretsiz kayıt olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
