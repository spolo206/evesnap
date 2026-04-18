'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { translations, getSavedLang, saveLang } from '../lib/i18n'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const [events, setEvents] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState('ko')
  const router = useRouter()

  useEffect(() => {
    setLang(getSavedLang())
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase.from('events').select('*').eq('host_id', user.id).order('created_at', { ascending: false })
      setEvents(data || [])
      setLoading(false)
    }
    init()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const changeLang = (l) => {
    setLang(l)
    saveLang(l)
  }

  const t = translations[lang]

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-700">Evesnap</h1>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {['ko', 'en', 'es'].map(l => (
              <button key={l} onClick={() => changeLang(l)} className={'px-2 py-1 rounded-md text-xs font-medium transition ' + (lang === l ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-400')}>
                {l === 'ko' ? '한' : l === 'en' ? 'EN' : 'ES'}
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-400 hidden md:block">{user?.email}</span>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600">{t.logout}</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">{t.myEvents}</h2>
            <p className="text-gray-400 text-sm mt-1">{events.length} {t.totalEvents}</p>
          </div>
          <Link href="/dashboard/new" className="bg-purple-700 text-white px-5 py-2.5 rounded-lg hover:bg-purple-800 transition text-sm font-medium">
            {t.newEvent}
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-4xl mb-4">📸</p>
            <p className="text-gray-500 mb-2">{t.noEvents}</p>
            <p className="text-gray-400 text-sm mb-6">{t.noEventsSub}</p>
            <Link href="/dashboard/new" className="bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition text-sm">
              {t.createFirst}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {event.cover_url && (
                    <img src={event.cover_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{event.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{event.date} · {event.location || '-'}</p>
                    <span className={'text-xs px-2 py-1 rounded-full mt-2 inline-block ' + (event.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400')}>
                      {event.is_active ? t.active : t.ended}
                    </span>
                  </div>
                </div>
                <Link href={'/dashboard/events/' + event.id} className="bg-purple-700 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-purple-800 transition">
                  {t.manage}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
