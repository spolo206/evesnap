'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const [events, setEvents] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false })
      setEvents(data || [])
      setLoading(false)
    }
    init()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-700">Evesnap</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{user?.email}</span>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600">
            로그아웃 · Logout
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">내 이벤트 · My Events</h2>
            <p className="text-gray-400 text-sm mt-1">{events.length} events total</p>
          </div>
          <Link href="/dashboard/new" className="bg-purple-700 text-white px-5 py-2.5 rounded-lg hover:bg-purple-800 transition text-sm font-medium">
            + 새 이벤트 · New event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-4xl mb-4">📸</p>
            <p className="text-gray-500 mb-2">아직 이벤트가 없습니다</p>
            <p className="text-gray-400 text-sm mb-6">No events yet — create your first one!</p>
            <Link href="/dashboard/new" className="bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition text-sm">
              첫 이벤트 만들기 · Create first event
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{event.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {event.date} · {event.location || 'No location'}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${event.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {event.is_active ? '진행 중 · Active' : '종료 · Ended'}
                  </span>
                </div>
                <Link
                  href={`/dashboard/events/${event.id}`}
                  className="bg-purple-700 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-purple-800 transition"
                >
                  관리 · Manage
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}