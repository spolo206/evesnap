'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function EditEvent() {
  const [event, setEvent] = useState(null)
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('wedding')
  const [language, setLanguage] = useState('ko')
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { id } = useParams()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('events').select('*').eq('id', id).single()
      if (!data) { router.push('/dashboard'); return }
      setEvent(data)
      setName(data.name || '')
      setDate(data.date || '')
      setLocation(data.location || '')
      setType(data.type || 'wedding')
      setLanguage(data.language || 'ko')
      setCoverPreview(data.cover_url || null)
    }
    init()
  }, [id])

  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    if (!name) { setError('Please enter event name'); return }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    let cover_url = event.cover_url
    if (coverFile) {
      const cleanName = coverFile.name.replace(/[^a-zA-Z0-9.]/g, '_')
      const fileName = user.id + '/' + Date.now() + '-' + cleanName
      const { error: uploadError } = await supabase.storage.from('covers').upload(fileName, coverFile)
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('covers').getPublicUrl(fileName)
        cover_url = urlData.publicUrl
      }
    }

    const { error } = await supabase
      .from('events')
      .update({ name, date, location, type, language, cover_url })
      .eq('id', id)

    if (error) { setError(error.message); setLoading(false); return }
    setSaved(true)
    setTimeout(() => { setSaved(false); router.push('/dashboard/events/' + id) }, 1500)
    setLoading(false)
  }

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-700">Evesnap</h1>
        <Link href={'/dashboard/events/' + id} className="text-sm text-gray-400 hover:text-gray-600">← Back</Link>
      </header>

      <div className="max-w-lg mx-auto px-8 py-10">
        <h2 className="text-2xl font-bold mb-2">이벤트 수정 · Edit event</h2>
        <p className="text-gray-400 text-sm mb-8">Update your event details</p>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col gap-5">
          <div>
            <label className="text-sm text-gray-500 mb-1.5 block">이벤트 이름 · Event name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400" />
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1.5 block">날짜 · Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400" />
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1.5 block">장소 · Location</label>
            <input type="text" placeholder="예: 제주도 · Jeju Island" value={location} onChange={e => setLocation(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400" />
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1.5 block">이벤트 종류 · Event type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400">
              <option value="wedding">결혼식 · Wedding</option>
              <option value="birthday">생일 · Birthday</option>
              <option value="party">파티 · Party</option>
              <option value="corporate">기업 행사 · Corporate</option>
              <option value="other">기타 · Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1.5 block">갤러리 언어 · Gallery language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400">
              <option value="ko">한국어 · Korean</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1.5 block">커버 사진 · Cover photo</label>
            <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" id="cover-input" />
            {coverPreview ? (
              <div className="relative">
                <img src={coverPreview} alt="" className="w-full h-48 object-cover rounded-xl" />
                <label htmlFor="cover-input" className="absolute bottom-2 right-2 bg-purple-700 text-white text-xs px-3 py-1.5 rounded-lg cursor-pointer">Change</label>
              </div>
            ) : (
              <label htmlFor="cover-input" className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-purple-300 transition">
                <p className="text-3xl mb-2">🖼️</p>
                <p className="text-sm text-gray-400">Click to upload cover photo</p>
              </label>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button onClick={handleSave} disabled={loading} className="bg-purple-700 text-white py-3 rounded-lg hover:bg-purple-800 transition font-medium disabled:opacity-50">
            {saved ? '✅ Saved!' : loading ? '...' : '저장하기 · Save changes'}
          </button>
        </div>
      </div>
    </main>
  )
}
