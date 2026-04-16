'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleRegister = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) setMessage(error.message)
    else setMessage('이메일을 확인해주세요 · Check your email ✅')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="text-2xl font-bold text-purple-700 block text-center mb-8">
          Evesnap
        </Link>
        <div className="border border-gray-100 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-2">계정 만들기</h2>
          <p className="text-gray-400 mb-6">Create your account</p>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="이름 · Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400"
            />
            <input
              type="email"
              placeholder="이메일 · Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400"
            />
            <input
              type="password"
              placeholder="비밀번호 · Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400"
            />
            {message && <p className="text-sm text-purple-600">{message}</p>}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="bg-purple-700 text-white py-3 rounded-lg hover:bg-purple-800 transition font-medium"
            >
              {loading ? '...' : '가입하기 · Sign up'}
            </button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-purple-700">로그인 · Login</Link>
          </p>
        </div>
      </div>
    </main>
  )
}