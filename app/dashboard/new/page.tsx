'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NewEvent() {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('wedding')
  const [language, setLanguage] = useState('ko')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleCreate = async () => {
    if (!name) { setError('이벤트 이름을 입력해주세요 · Please enter event name'); return }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const slug = name.toLowerCase()
      .replace(/[^a-z0-9가-힣\s]/g, '')
      .replace(/\s+/g, '-')
      + '-' + Math.random().toString(36).substring(2, 7)

    const { data, error } = await supabase
      .from('events')
      .insert({
        host_id: user.id,
        name,
        date,
        location,
        type,
        language,
        slug,
        is_active: true
      })
      .select()
      .single()

    if (error) { setError(error.message); setLoading(false); return }
    router.push(`/dashboard/events/${data.id}`)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-700">Evesnap</h1>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
          ← 대시보드 · Dashboard
        </Link>
      </header>

      <div className="max-w-lg mx-auto px-8 py-10">
        <h2 className="text-2xl font-bold mb-2">새 이벤트 만들기</h2>
        <p className="text-gray-400 text-sm mb-8">Create a new event</p>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col gap-5">
          <div>
            <label className="text-sm text-gray-500 mb-1.5 block">이벤트 이름 · Event name *</label>
            <input
              type="text"
              placeholder="예: 사라 & 톰의 결혼식"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1.5 block">날짜 · Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1.5 block">장소 · Location</label>
            <input
              type="text"
              placeholder="예: 제주도 · Jeju Island"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1.5 block">이벤트 종류 · Event type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400"
            >
              <option value="wedding">결혼식 · Wedding</option>
              <option value="birthday">생일 · Birthday</option>
              <option value="party">파티 · Party</option>
              <option value="corporate">기업 행사 · Corporate</option>
              <option value="other">기타 · Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1.5 block">갤러리 언어 · Gallery language</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400"
            >
              <option value="ko">한국어 · Korean</option>
              <option value="en">English</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="bg-purple-700 text-white py-3 rounded-lg hover:bg-purple-800 transition font-medium"
          >
            {loading ? '...' : '이벤트 만들기 · Create event'}
          </button>
        </div>
      </div>
    </main>
  )
}