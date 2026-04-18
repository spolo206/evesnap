'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
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

  const handleRegister = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) setMessage(error.message)
    else setMessage(lang === 'ko' ? '이메일을 확인해주세요 ✅' : lang === 'es' ? '¡Revisa tu email ✅' : 'Check your email ✅')
    setLoading(false)
  }

  const t = {
    ko: { title: '계정 만들기', sub: '무료로 시작하세요', name: '이름', email: '이메일', pass: '비밀번호', btn: '가입하기', hasAccount: '이미 계정이 있으신가요?', login: '로그인' },
    en: { title: 'Create account', sub: 'Start for free', name: 'Name', email: 'Email', pass: 'Password', btn: 'Sign up', hasAccount: 'Already have an account?', login: 'Sign in' },
    es: { title: 'Crear cuenta', sub: 'Empieza gratis', name: 'Nombre', email: 'Email', pass: 'Contraseña', btn: 'Registrarse', hasAccount: '¿Ya tienes cuenta?', login: 'Iniciar sesión' }
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
            <input type="text" placeholder={t.name} value={name} onChange={e => setName(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400" />
            <input type="email" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400" />
            <input type="password" placeholder={t.pass} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRegister()} className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400" />
            {message && <p className="text-sm text-purple-600">{message}</p>}
            <button onClick={handleRegister} disabled={loading} className="bg-purple-700 text-white py-3 rounded-lg hover:bg-purple-800 transition font-medium disabled:opacity-50">
              {loading ? '...' : t.btn}
            </button>
          </div>
          <p className="text-center text-sm text-gray-400 mt-6">
            {t.hasAccount}{' '}
            <Link href="/login" className="text-purple-700">{t.login}</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
