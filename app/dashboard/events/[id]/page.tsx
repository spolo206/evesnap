'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { QRCodeSVG } from 'qrcode.react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function EventPage() {
  const [event, setEvent] = useState(null)
  const [photos, setPhotos] = useState([])
  const [comments, setComments] = useState({})
  const [likes, setLikes] = useState({})
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState('overview')
  const [view, setView] = useState('grid')
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const router = useRouter()
  const { id } = useParams()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: eventData } = await supabase.from('events').select('*').eq('id', id).single()
      if (!eventData) { router.push('/dashboard'); return }
      setEvent(eventData)
      const { data: photosData } = await supabase.from('photos').select('*').eq('event_id', id).order('created_at', { ascending: false })
      setPhotos(photosData || [])
      const photoIds = (photosData || []).map(p => p.id)
      if (photoIds.length > 0) {
        const { data: likesData } = await supabase.from('likes').select('photo_id').in('photo_id', photoIds)
        const likeCount = {}
        ;(likesData || []).forEach(l => { likeCount[l.photo_id] = (likeCount[l.photo_id] || 0) + 1 })
        setLikes(likeCount)
        const { data: commentsData } = await supabase.from('comments').select('*').in('photo_id', photoIds).order('created_at', { ascending: true })
        const commentsMap = {}
        ;(commentsData || []).forEach(c => {
          if (!commentsMap[c.photo_id]) commentsMap[c.photo_id] = []
          commentsMap[c.photo_id].push(c)
        })
        setComments(commentsMap)
      }
      setLoading(false)
    }
    init()
  }, [id])

  const copyLink = () => {
    const link = window.location.origin + '/event/' + event.slug
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadAll = async () => {
    setDownloading(true)
    const response = await fetch('/api/download/' + id)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = event.name + '-photos.zip'
    a.click()
    window.URL.revokeObjectURL(url)
    setDownloading(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  const eventUrl = typeof window !== 'undefined' ? window.location.origin + '/event/' + event.slug : ''

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-700">Evesnap</h1>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</Link>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
          {event.cover_url && (
            <div className="w-full h-48 rounded-xl overflow-hidden mb-6">
              <img src={event.cover_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{event.name}</h2>
              <p className="text-gray-400 text-sm mt-1">{event.date} · {event.location || 'No location'}</p>
              <span className={'text-xs px-2 py-1 rounded-full mt-2 inline-block ' + (event.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400')}>
                {event.is_active ? '진행 중 · Active' : '종료 · Ended'}
              </span>
            </div>
            <div className="flex gap-2">
              <Link href={'/dashboard/events/' + id + '/edit'} className="border border-gray-200 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                ✏️ Edit
              </Link>
              <button onClick={copyLink} className="border border-gray-200 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                {copied ? '✅ Copied!' : '🔗 Copy link'}
              </button>
            </div>
          </div>
          <div className="mt-4 bg-purple-50 rounded-xl p-4">
            <p className="text-xs text-purple-400 mb-1">Guest link</p>
            <p className="text-purple-700 font-mono text-sm break-all">{eventUrl}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('overview')} className={'px-4 py-2 rounded-lg text-sm font-medium transition ' + (tab === 'overview' ? 'bg-purple-700 text-white' : 'bg-white border border-gray-200 text-gray-500')}>📊 Overview</button>
          <button onClick={() => setTab('qr')} className={'px-4 py-2 rounded-lg text-sm font-medium transition ' + (tab === 'qr' ? 'bg-purple-700 text-white' : 'bg-white border border-gray-200 text-gray-500')}>📱 QR Code</button>
          <button onClick={() => setTab('photos')} className={'px-4 py-2 rounded-lg text-sm font-medium transition ' + (tab === 'photos' ? 'bg-purple-700 text-white' : 'bg-white border border-gray-200 text-gray-500')}>{'🖼️ Photos (' + photos.length + ')'}</button>
        </div>

        {tab === 'overview' && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <p className="text-3xl font-bold text-purple-700">{photos.length}</p>
              <p className="text-gray-400 text-sm mt-1">Photos</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <p className="text-3xl font-bold text-purple-700">{new Set(photos.map(p => p.guest_name).filter(Boolean)).size}</p>
              <p className="text-gray-400 text-sm mt-1">Guests</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <p className="text-3xl font-bold text-purple-700">{photos.filter(p => p.message).length}</p>
              <p className="text-gray-400 text-sm mt-1">Messages</p>
            </div>
          </div>
        )}

        {tab === 'qr' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-gray-500 text-sm mb-6">Show this QR to your guests</p>
            <div className="flex justify-center mb-6">
              <div className="p-6 border border-gray-100 rounded-2xl inline-block">
                <QRCodeSVG value={eventUrl} size={220} fgColor="#6d28d9" level="H" />
              </div>
            </div>
            <p className="text-gray-400 text-xs font-mono mb-6">{eventUrl}</p>
            <button onClick={copyLink} className="bg-purple-700 text-white px-6 py-3 rounded-lg text-sm hover:bg-purple-800 transition">
              {copied ? '✅ Copied!' : '🔗 Copy link'}
            </button>
          </div>
        )}

        {tab === 'photos' && (
          <div>
            {photos.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <p className="text-4xl mb-3">📸</p>
                <p className="text-gray-400">No photos yet</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    <button onClick={() => setView('grid')} className={'px-3 py-1.5 rounded-md text-sm font-medium transition ' + (view === 'grid' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-400')}>⊞ Grid</button>
                    <button onClick={() => setView('feed')} className={'px-3 py-1.5 rounded-md text-sm font-medium transition ' + (view === 'feed' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-400')}>☰ Feed</button>
                  </div>
                  <button onClick={downloadAll} disabled={downloading} className="bg-purple-700 text-white px-5 py-2.5 rounded-lg text-sm hover:bg-purple-800 transition disabled:opacity-50">
                    {downloading ? '⏳ Preparing...' : '⬇️ Download all (ZIP)'}
                  </button>
                </div>

                {view === 'grid' && (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map(photo => (
                      <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {view === 'feed' && (
                  <div className="flex flex-col gap-6">
                    {photos.map(photo => (
                      <div key={photo.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-700">
                            {photo.guest_name ? photo.guest_name[0].toUpperCase() : '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{photo.guest_name || 'Guest'}</p>
                            <p className="text-xs text-gray-400">{new Date(photo.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <img src={photo.url} alt="" className="w-full object-cover cursor-pointer" style={{ maxHeight: '500px' }} onClick={() => setSelectedPhoto(photo)} />
                        <div className="px-4 py-3">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-sm text-gray-400">{'❤️ ' + (likes[photo.id] || 0)}</span>
                            <span className="text-sm text-gray-400">{'💬 ' + (comments[photo.id] || []).length}</span>
                            <a href={photo.url} download="photo.jpg" className="ml-auto text-sm text-gray-400 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition">Download</a>
                          </div>
                          {photo.message && (
                            <p className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">{photo.guest_name || 'Guest'}</span>
                              {' ' + photo.message}
                            </p>
                          )}
                          {(comments[photo.id] || []).map(c => (
                            <p key={c.id} className="text-sm text-gray-500 mb-1">
                              <span className="font-medium">{c.guest_name || 'Guest'}</span>
                              {' ' + c.content}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-700">
                  {selectedPhoto.guest_name ? selectedPhoto.guest_name[0].toUpperCase() : '?'}
                </div>
                <p className="text-sm font-medium">{selectedPhoto.guest_name || 'Guest'}</p>
              </div>
              <button onClick={() => setSelectedPhoto(null)} className="text-gray-400 text-xl">✕</button>
            </div>
            <img src={selectedPhoto.url} alt="" className="w-full object-cover" />
            <div className="px-4 py-3">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-sm text-gray-400">{'❤️ ' + (likes[selectedPhoto.id] || 0)}</span>
                <span className="text-sm text-gray-400">{'💬 ' + (comments[selectedPhoto.id] || []).length}</span>
                <a href={selectedPhoto.url} download="photo.jpg" className="ml-auto text-sm text-gray-400 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition">Download</a>
              </div>
              {selectedPhoto.message && (
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">{selectedPhoto.guest_name || 'Guest'}</span>
                  {' ' + selectedPhoto.message}
                </p>
              )}
              {(comments[selectedPhoto.id] || []).map(c => (
                <p key={c.id} className="text-sm text-gray-500 mb-1">
                  <span className="font-medium">{c.guest_name || 'Guest'}</span>
                  {' ' + c.content}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
