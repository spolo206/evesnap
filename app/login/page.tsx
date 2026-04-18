'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [lang, setLang] = useState('ko')
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) router.push('/dashboard')
    }
    checkSession()
    const saved = localStorage.getItem('evesnap_org_lang') || 'ko'
    setLang(saved)
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  const t = {
    ko: { title: '로그인', sub: '계정에 로그인하세요', email: '이메일', pass: '비밀번호', btn: '로그인', noAccount: '계정이 없으신가요?', signup: '가입하기' },
    en: { title: 'Sign in', sub: 'Sign in to your account', email: 'Email', pass: 'Password', btn: 'Sign in', noAccount: "Don't have an account?", signup: 'Sign up' },
    es: { title: 'Iniciar sesión', sub: 'Accede a tu cuenta', email: 'Email', pass: 'Contraseña', btn: 'Entrar', noAccount: '¿No tienes cuenta?', signup: 'Regístrate' }
  }[lang]

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-2xl font-bold text-purple-700">Evesnap</Link>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {['ko', 'en', 'es'].map(l => (
              <button key={l} onClick={() => { setLang(l); localStorage.setItem('evesnap_org_lang', l) }} className={'px-2 py-1 rounded-md text-xs font-medium transition ' + (lang === l ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-400')}>
                {l === 'ko' ? '한' : l === 'en' ? 'EN' : 'ES'}
              </button>
            ))}
          </div>
        </div>
        <div className="border border-gray-100 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
          <p className="text-gray-400 mb-6">{t.sub}</p>
          <div className="flex flex-col gap-4">
            <input type="email" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400" />
            <input type="password" placeholder={t.pass} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400" />
            {message && <p className="text-sm text-red-500">{message}</p>}
            <button onClick={handleLogin} disabled={loading} className="bg-purple-700 text-white py-3 rounded-lg hover:bg-purple-800 transition font-medium disabled:opacity-50">
              {loading ? '...' : t.btn}
            </button>
          </div>
          <p className="text-center text-sm text-gray-400 mt-6">
            {t.noAccount}{' '}
            <Link href="/register" className="text-purple-700">{t.signup}</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
