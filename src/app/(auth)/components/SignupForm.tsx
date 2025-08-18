"use client"
import {LabeledTextField} from "src/app/components/LabeledTextField"
import {Form, FORM_ERROR} from "src/app/components/Form"
import signup from "../mutations/signup"
import {Signup} from "../validations"
import {useMutation} from "@blitzjs/rpc"
import {useRouter} from "next/navigation"
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, UserIcon, CheckIcon } from "@heroicons/react/24/outline"
import { useState } from "react"
import Link from "next/link"

type SignupFormProps = {
  onSuccess?: () => void
}

export const SignupForm = (props: SignupFormProps) => {
  const [signupMutation] = useMutation(signup)
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const checkPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    setPasswordStrength(strength)
  }

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500'
    if (strength <= 3) return 'bg-yellow-500'
    if (strength <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStrengthText = (strength: number) => {
    if (strength <= 2) return 'Zayıf'
    if (strength <= 3) return 'Orta'
    if (strength <= 4) return 'İyi'
    return 'Güçlü'
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hesap Oluşturun
          </h1>
          <p className="text-gray-600">
            Ücretsiz hesap oluşturarak güncel haberleri kaçırmayın
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-3xl border border-white/20">
          <Form
            submitText="Hesap Oluştur"
            schema={Signup}
            initialValues={{email: "", password: ""}}
            onSubmit={async (values) => {
              try {
                await signupMutation(values)
                router.refresh()
                router.push("/")
              } catch (error: any) {
                if (error.code === "P2002" && error.meta?.target?.includes("email")) {
                  return {email: "Bu e-posta adresi zaten kullanılıyor"}
                } else {
                  return {[FORM_ERROR]: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."}
                }
              }
            }}
          >
            <div className="space-y-6">
              <LabeledTextField
                name="email"
                label="E-posta Adresi"
                placeholder="ornek@mail.com"
                type="email"
                icon={<EnvelopeIcon />}
              />

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Şifre
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    onChange={(e) => checkPasswordStrength(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all duration-200 bg-white hover:bg-gray-50"
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
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Şifre gücü:</span>
                    <span className={`font-medium ${getStrengthColor(passwordStrength).replace('bg-', 'text-')}`}>
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength ? getStrengthColor(passwordStrength) : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="text-sm">
                    <label htmlFor="terms" className="text-gray-700">
                      <Link href="/terms" className="text-primary-600 hover:text-primary-500 underline">
                        Kullanım Şartları
                      </Link>
                      {' '}ve{' '}
                      <Link href="/privacy" className="text-primary-600 hover:text-primary-500 underline">
                        Gizlilik Politikası
                      </Link>
                      'nı kabul ediyorum
                    </label>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-5">
                    <input
                      id="newsletter"
                      name="newsletter"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="text-sm">
                    <label htmlFor="newsletter" className="text-gray-700">
                      Güncel haberler ve özel içerikler için e-posta almak istiyorum
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <CheckIcon className="h-5 w-5 text-primary-500 group-hover:text-primary-400 transition-colors duration-200" />
                  </span>
                  Hesap Oluştur
                </button>
              </div>
            </div>
          </Form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/80 text-gray-500">veya</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="ml-2">Google ile kayıt ol</span>
                </button>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link
              href="/login"
              className="font-semibold text-primary-600 hover:text-primary-500 transition-colors duration-200 hover:underline"
            >
              Giriş yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
