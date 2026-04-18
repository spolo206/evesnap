'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function GuestPage() {
  const [event, setEvent] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [guestName, setGuestName] = useState('')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tab, setTab] = useState<'upload' | 'gallery'>('upload')
  const { slug } = useParams()

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .single()
      setEvent(data)

      const { data: photosData } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', data?.id)
        .order('created_at', { ascending: false })
      setPhotos(photosData || [])
    }
    init()
  }, [slug])

  const handleUpload = async () => {
    if (!files || files.length === 0) return
    setLoading(true)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
      const fileName = `${event.id}/${Date.now()}-${i}-${cleanName}`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file)

      if (uploadError) { console.error(uploadError); continue }

      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName)

      await supabase.from('photos').insert({
        event_id: event.id,
        guest_name: guestName || null,
        message: i === 0 ? message || null : null,
        url: urlData.publicUrl,
        approved: true
      })
    }

    setSuccess(true)
    setLoading(false)
    setFiles(null)
    setMessage('')

    const { data: photosData } = await supabase
      .from('photos')
      .select('*')
      .eq('event_id', event?.id)
      .order('created_at', { ascending: false })
    setPhotos(photosData || [])
  }

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  const isKorean = event.language === 'ko'

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-purple-700 text-white px-6 py-10 text-center">
        <p className="text-4xl mb-3">📸</p>
        <h1 className="text-2xl font-bold mb-1">{event.name}</h1>
        <p className="text-purple-200 text-sm">
          {event.date} {event.location ? `· ${event.location}` : ''}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setTab('upload')}
          className={`flex-1 py-3 text-sm font-medium transition ${tab === 'upload' ? 'text-purple-700 border-b-2 border-purple-700' : 'text-gray-400'}`}
        >
          {isKorean ? '📤 사진 올리기' : '📤 Upload photos'}
        </button>
        <button
          onClick={() => setTab('gallery')}
          className={`flex-1 py-3 text-sm font-medium transition ${tab === 'gallery' ? 'text-purple-700 border-b-2 border-purple-700' : 'text-gray-400'}`}
        >
          {isKorean ? `🖼️ 갤러리 (${photos.length})` : `🖼️ Gallery (${photos.length})`}
        </button>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8">
        {tab === 'upload' && (
          <div className="flex flex-col gap-4">
            {success ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">🎉</p>
                <p className="text-xl font-bold mb-2">
                  {isKorean ? '업로드 완료!' : 'Uploaded!'}
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  {isKorean ? '소중한 순간을 공유해주셔서 감사합니다' : 'Thank you for sharing your memories!'}
                </p>
                <button
                  onClick={() => { setSuccess(false); setTab('gallery') }}
                  className="bg-purple-700 text-white px-6 py-3 rounded-lg text-sm"
                >
                  {isKorean ? '갤러리 보기' : 'View gallery'}
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">
                    {isKorean ? '이름 (선택사항)' : 'Your name (optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={isKorean ? '예: 김민준' : 'e.g. John'}
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">
                    {isKorean ? '메시지 (선택사항)' : 'Message (optional)'}
                  </label>
                  <textarea
                    placeholder={isKorean ? '축하 메시지를 남겨주세요...' : 'Leave a message...'}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400 resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">
                    {isKorean ? '사진 선택' : 'Select photos'}
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                    <p className="text-3xl mb-2">📷</p>
                    <p className="text-gray-400 text-sm mb-3">
                      {isKorean ? '사진을 선택하세요' : 'Choose your photos'}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => setFiles(e.target.files)}
                      className="hidden"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="bg-purple-700 text-white px-5 py-2 rounded-lg text-sm cursor-pointer hover:bg-purple-800 transition">
                      {isKorean ? '사진 선택' : 'Choose photos'}
                    </label>
                    {files && files.length > 0 && (
                      <p className="text-purple-600 text-sm mt-3">
                        {files.length} {isKorean ? '장 선택됨' : 'photos selected'}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={loading || !files || files.length === 0}
                  className="bg-purple-700 text-white py-3 rounded-lg hover:bg-purple-800 transition font-medium disabled:opacity-50"
                >
                  {loading ? '...' : isKorean ? '📤 업로드하기' : '📤 Upload photos'}
                </button>
              </>
            )}
          </div>
        )}

        {tab === 'gallery' && (
          <div>
            {photos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🖼️</p>
                <p className="text-gray-400">
                  {isKorean ? '아직 사진이 없습니다' : 'No photos yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
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