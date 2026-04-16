'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { QRCodeSVG } from 'qrcode.react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function EventPage() {
  const [event, setEvent] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'overview' | 'photos' | 'qr'>('overview')
  const router = useRouter()
  const { id } = useParams()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

      if (!eventData) { router.push('/dashboard'); return }
      setEvent(eventData)

      const { data: photosData } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', id)
        .order('created_at', { ascending: false })

      setPhotos(photosData || [])
      setLoading(false)
    }
    init()
  }, [id])

  const copyLink = () => {
    const link = `${window.location.origin}/event/${event.slug}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  const eventUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/event/${event.slug}`

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-700">Evesnap</h1>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
          ← 대시보드 · Dashboard
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-10">
        {/* Event header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{event.name}</h2>
              <p className="text-gray-400 text-sm mt-1">{event.date} · {event.location || 'No location'}</p>
              <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${event.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {event.is_active ? '진행 중 · Active' : '종료 · Ended'}
              </span>
            </div>
            <button
              onClick={copyLink}
              className="border border-gray-200 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              {copied ? '✅ 복사됨!' : '🔗 링크 복사 · Copy link'}
            </button>
          </div>

          <div className="mt-4 bg-purple-50 rounded-xl p-4">
            <p className="text-xs text-purple-400 mb-1">게스트 링크 · Guest link</p>
            <p className="text-purple-700 font-mono text-sm break-all">{eventUrl}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('overview')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'overview' ? 'bg-purple-700 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>
            📊 Overview
          </button>
          <button onClick={() => setTab('qr')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'qr' ? 'bg-purple-700 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>
            📱 QR Code
          </button>
          <button onClick={() => setTab('photos')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'photos' ? 'bg-purple-700 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>
            🖼️ 사진 · Photos ({photos.length})
          </button>
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <p className="text-3xl font-bold text-purple-700">{photos.length}</p>
              <p className="text-gray-400 text-sm mt-1">사진 · Photos</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <p className="text-3xl font-bold text-purple-700">
                {new Set(photos.map(p => p.guest_name).filter(Boolean)).size}
              </p>
              <p className="text-gray-400 text-sm mt-1">게스트 · Guests</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <p className="text-3xl font-bold text-purple-700">
                {photos.filter(p => p.message).length}
              </p>
              <p className="text-gray-400 text-sm mt-1">메시지 · Messages</p>
            </div>
          </div>
        )}

        {/* QR */}
        {tab === 'qr' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-gray-500 text-sm mb-6">
              게스트에게 이 QR을 보여주세요 · Show this QR to your guests
            </p>
            <div className="flex justify-center mb-6">
              <div className="p-6 border border-gray-100 rounded-2xl inline-block">
                <QRCodeSVG
                  value={eventUrl}
                  size={220}
                  fgColor="#6d28d9"
                  level="H"
                />
              </div>
            </div>
            <p className="text-gray-400 text-xs font-mono mb-6">{eventUrl}</p>
            <button
              onClick={copyLink}
              className="bg-purple-700 text-white px-6 py-3 rounded-lg text-sm hover:bg-purple-800 transition"
            >
              {copied ? '✅ 복사됨!' : '🔗 링크 복사 · Copy link'}
            </button>
          </div>
        )}

        {/* Photos */}
        {tab === 'photos' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            {photos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">📸</p>
                <p className="text-gray-400">아직 사진이 없습니다 · No photos yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {photos.map(photo => (
                  <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}