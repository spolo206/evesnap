'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function getSessionId() {
  let id = localStorage.getItem('evesnap_session')
  if (!id) { id = Math.random().toString(36).substring(2); localStorage.setItem('evesnap_session', id) }
  return id
}

function getSavedName() { return localStorage.getItem('evesnap_name') || '' }
function saveName(name) { if (name) localStorage.setItem('evesnap_name', name) }
function getSavedLang() { return localStorage.getItem('evesnap_lang') || null }
function saveLang(lang) { localStorage.setItem('evesnap_lang', lang) }

const t = {
  ko: { upload: '📤 사진 올리기', gallery: '🖼️ 갤러리', name: '이름', namePh: '예: 김민준', message: '메시지 (선택사항)', messagePh: '축하 메시지를 남겨주세요...', select: '사진 선택', choose: '사진 선택', selected: '장 선택됨', uploadBtn: '📤 업로드하기', successTitle: '업로드 완료!', successSub: '감사합니다', viewGallery: '갤러리 보기', noPhotos: '아직 사진이 없습니다', guest: '익명', feed: '☰ 피드', grid: '⊞ 그리드', addComment: '댓글 추가...', yourName: '이름...', post: '게시', download: '⬇️ 다운로드' },
  en: { upload: '📤 Upload', gallery: '🖼️ Gallery', name: 'Your name', namePh: 'e.g. John', message: 'Message (optional)', messagePh: 'Leave a message...', select: 'Select photos', choose: 'Choose photos', selected: 'photos selected', uploadBtn: '📤 Upload photos', successTitle: 'Uploaded!', successSub: 'Thank you!', viewGallery: 'View gallery', noPhotos: 'No photos yet', guest: 'Guest', feed: '☰ Feed', grid: '⊞ Grid', addComment: 'Add a comment...', yourName: 'Your name...', post: 'Post', download: '⬇️ Download' },
  es: { upload: '📤 Subir', gallery: '🖼️ Galería', name: 'Tu nombre', namePh: 'ej: María', message: 'Mensaje (opcional)', messagePh: 'Deja un mensaje...', select: 'Seleccionar fotos', choose: 'Elegir fotos', selected: 'fotos seleccionadas', uploadBtn: '📤 Subir fotos', successTitle: '¡Subido!', successSub: '¡Gracias!', viewGallery: 'Ver galería', noPhotos: 'No hay fotos aún', guest: 'Invitado', feed: '☰ Feed', grid: '⊞ Grid', addComment: 'Añadir comentario...', yourName: 'Tu nombre...', post: 'Publicar', download: '⬇️ Descargar' }
}

export default function GuestPage() {
  const [event, setEvent] = useState(null)
  const [photos, setPhotos] = useState([])
  const [guestName, setGuestName] = useState('')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tab, setTab] = useState('upload')
  const [view, setView] = useState('feed')
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [likes, setLikes] = useState({})
  const [liked, setLiked] = useState({})
  const [comments, setComments] = useState({})
  const [newComment, setNewComment] = useState('')
  const [commentName, setCommentName] = useState('')
  const [lang, setLang] = useState('ko')
  const { slug } = useParams()

  useEffect(() => {
    const savedName = getSavedName()
    setGuestName(savedName)
    setCommentName(savedName)
    const init = async () => {
      const { data } = await supabase.from('events').select('*').eq('slug', slug).single()
      setEvent(data)
      const savedLang = getSavedLang()
      if (savedLang) setLang(savedLang)
      else if (data) setLang(data.language || 'ko')
      if (data) await loadPhotos(data.id)
    }
    init()
  }, [slug])

  const loadPhotos = async (eventId) => {
    const { data: photosData } = await supabase.from('photos').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
    setPhotos(photosData || [])
    const sessionId = getSessionId()
    const photoIds = (photosData || []).map(p => p.id)
    if (photoIds.length > 0) {
      const { data: likesData } = await supabase.from('likes').select('photo_id, session_id').in('photo_id', photoIds)
      const likeCount = {}
      const likedMap = {}
      ;(likesData || []).forEach(l => {
        likeCount[l.photo_id] = (likeCount[l.photo_id] || 0) + 1
        if (l.session_id === sessionId) likedMap[l.photo_id] = true
      })
      setLikes(likeCount)
      setLiked(likedMap)
      const { data: commentsData } = await supabase.from('comments').select('*').in('photo_id', photoIds).order('created_at', { ascending: true })
      const commentsMap = {}
      ;(commentsData || []).forEach(c => {
        if (!commentsMap[c.photo_id]) commentsMap[c.photo_id] = []
        commentsMap[c.photo_id].push(c)
      })
      setComments(commentsMap)
    }
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) return
    setLoading(true)
    saveName(guestName)
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
      const fileName = event.id + '/' + Date.now() + '-' + i + '-' + cleanName
      const { error: uploadError } = await supabase.storage.from('photos').upload(fileName, file)
      if (uploadError) { console.error(uploadError); continue }
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName)
      await supabase.from('photos').insert({ event_id: event.id, guest_name: guestName || null, message: i === 0 ? message || null : null, url: urlData.publicUrl, approved: true })
    }
    setSuccess(true)
    setLoading(false)
    setFiles(null)
    setMessage('')
    await loadPhotos(event.id)
  }

  const handleLike = async (photoId) => {
    const sessionId = getSessionId()
    if (liked[photoId]) {
      await supabase.from('likes').delete().eq('photo_id', photoId).eq('session_id', sessionId)
      setLikes(l => ({ ...l, [photoId]: (l[photoId] || 1) - 1 }))
      setLiked(l => ({ ...l, [photoId]: false }))
    } else {
      await supabase.from('likes').insert({ photo_id: photoId, session_id: sessionId })
      setLikes(l => ({ ...l, [photoId]: (l[photoId] || 0) + 1 }))
      setLiked(l => ({ ...l, [photoId]: true }))
    }
  }

  const handleComment = async (photoId) => {
    if (!newComment.trim()) return
    const nameToUse = commentName || guestName || null
    const { data } = await supabase.from('comments').insert({ photo_id: photoId, guest_name: nameToUse, content: newComment.trim() }).select().single()
    setComments(c => ({ ...c, [photoId]: [...(c[photoId] || []), data] }))
    setNewComment('')
  }

  const changeLang = (l) => { setLang(l); saveLang(l) }

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  const tx = t[lang] || t.ko

  return (
    <main className="min-h-screen bg-white">
      <div className="relative text-white">
        {event.cover_url ? (
          <div className="relative">
            <img src={event.cover_url} alt="" className="w-full h-56 object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
              <p className="text-4xl mb-3">📸</p>
              <h1 className="text-2xl font-bold mb-1 text-center drop-shadow-lg">{event.name}</h1>
              <p className="text-sm drop-shadow-lg">{event.date} {event.location ? '· ' + event.location : ''}</p>
            </div>
          </div>
        ) : (
          <div className="bg-purple-700 px-6 py-10 text-center">
            <p className="text-4xl mb-3">📸</p>
            <h1 className="text-2xl font-bold mb-1">{event.name}</h1>
            <p className="text-purple-200 text-sm">{event.date} {event.location ? '· ' + event.location : ''}</p>
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-1 bg-black bg-opacity-30 rounded-lg p-1">
          {['ko', 'en', 'es'].map(l => (
            <button key={l} onClick={() => changeLang(l)} className={'px-2 py-1 rounded-md text-xs font-medium transition ' + (lang === l ? 'bg-white text-purple-700' : 'text-white')}>
              {l === 'ko' ? '한' : l === 'en' ? 'EN' : 'ES'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex border-b border-gray-100">
        <button onClick={() => setTab('upload')} className={'flex-1 py-3 text-sm font-medium transition ' + (tab === 'upload' ? 'text-purple-700 border-b-2 border-purple-700' : 'text-gray-400')}>{tx.upload}</button>
        <button onClick={() => setTab('gallery')} className={'flex-1 py-3 text-sm font-medium transition ' + (tab === 'gallery' ? 'text-purple-700 border-b-2 border-purple-700' : 'text-gray-400')}>{tx.gallery + ' (' + photos.length + ')'}</button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {tab === 'upload' && (
          <div className="flex flex-col gap-4">
            {success ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">🎉</p>
                <p className="text-xl font-bold mb-2">{tx.successTitle}</p>
                <p className="text-gray-400 text-sm mb-6">{tx.successSub}</p>
                <button onClick={() => { setSuccess(false); setTab('gallery') }} className="bg-purple-700 text-white px-6 py-3 rounded-lg text-sm">{tx.viewGallery}</button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">{tx.name} *</label>
                  <input type="text" placeholder={tx.namePh} value={guestName} onChange={e => { setGuestName(e.target.value); setCommentName(e.target.value) }} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">{tx.message}</label>
                  <textarea placeholder={tx.messagePh} value={message} onChange={e => setMessage(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-400 resize-none" />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">{tx.select}</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                    <p className="text-3xl mb-2">📷</p>
                    <input type="file" accept="image/*" multiple onChange={e => setFiles(e.target.files)} className="hidden" id="file-input" />
                    <label htmlFor="file-input" className="bg-purple-700 text-white px-5 py-2 rounded-lg text-sm cursor-pointer hover:bg-purple-800 transition">{tx.choose}</label>
                    {files && files.length > 0 && (
                      <p className="text-purple-600 text-sm mt-3">{files.length} {tx.selected}</p>
                    )}
                  </div>
                </div>
                <button onClick={handleUpload} disabled={loading || !files || files.length === 0 || !guestName.trim()} className="bg-purple-700 text-white py-3 rounded-lg hover:bg-purple-800 transition font-medium disabled:opacity-50">
                  {loading ? '...' : tx.uploadBtn}
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'gallery' && (
          <div>
            {photos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🖼️</p>
                <p className="text-gray-400">{tx.noPhotos}</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-end mb-4">
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    <button onClick={() => setView('feed')} className={'px-3 py-1.5 rounded-md text-sm font-medium transition ' + (view === 'feed' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-400')}>{tx.feed}</button>
                    <button onClick={() => setView('grid')} className={'px-3 py-1.5 rounded-md text-sm font-medium transition ' + (view === 'grid' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-400')}>{tx.grid}</button>
                  </div>
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
                      <div key={photo.id} className="border border-gray-100 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-700">
                            {photo.guest_name ? photo.guest_name[0].toUpperCase() : '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{photo.guest_name || tx.guest}</p>
                            <p className="text-xs text-gray-400">{new Date(photo.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <img src={photo.url} alt="" className="w-full object-cover cursor-pointer" style={{ maxHeight: '500px' }} onClick={() => setSelectedPhoto(photo)} />
                        <div className="px-4 py-3">
                          <div className="flex items-center gap-4 mb-2">
                            <button onClick={() => handleLike(photo.id)} className="flex items-center gap-1">
                              <span className="text-xl">{liked[photo.id] ? '❤️' : '🤍'}</span>
                              <span className="text-sm text-gray-400">{likes[photo.id] || 0}</span>
                            </button>
                            <span className="text-xl">💬</span>
                            <a href={'/api/download-photo?url=' + encodeURIComponent(photo.url)} download="evesnap-photo.jpg" className="ml-auto text-sm text-purple-700 border border-purple-200 px-3 py-1 rounded-lg hover:bg-purple-50 transition">{tx.download}</a>
                          </div>
                          {photo.message && (
                            <p className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">{photo.guest_name || tx.guest}</span>
                              {' ' + photo.message}
                            </p>
                          )}
                          {(comments[photo.id] || []).map(c => (
                            <p key={c.id} className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">{c.guest_name || tx.guest}</span>
                              {' ' + c.content}
                            </p>
                          ))}
                          <div className="flex flex-col gap-2 mt-3 border-t border-gray-50 pt-3">
                            {!getSavedName() && (
                              <input type="text" placeholder={tx.yourName} value={commentName} onChange={e => { setCommentName(e.target.value); saveName(e.target.value) }} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400" />
                            )}
                            <div className="flex gap-2">
                              <input type="text" placeholder={tx.addComment} value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleComment(photo.id) }} className="flex-1 text-sm border-none outline-none text-gray-600 placeholder-gray-300" />
                              <button onClick={() => handleComment(photo.id)} className="text-purple-700 text-sm font-medium">{tx.post}</button>
                            </div>
                          </div>
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
                <p className="text-sm font-medium">{selectedPhoto.guest_name || tx.guest}</p>
              </div>
              <button onClick={() => setSelectedPhoto(null)} className="text-gray-400 text-xl">✕</button>
            </div>
            <img src={selectedPhoto.url} alt="" className="w-full object-cover" />
            <div className="px-4 py-3">
              <div className="flex items-center gap-4 mb-3">
                <button onClick={() => handleLike(selectedPhoto.id)} className="flex items-center gap-1">
                  <span className="text-xl">{liked[selectedPhoto.id] ? '❤️' : '🤍'}</span>
                  <span className="text-sm text-gray-400">{likes[selectedPhoto.id] || 0}</span>
                </button>
                <a href={'/api/download-photo?url=' + encodeURIComponent(selectedPhoto.url)} download="evesnap-photo.jpg" className="ml-auto text-sm text-purple-700 border border-purple-200 px-3 py-1 rounded-lg hover:bg-purple-50 transition">{tx.download}</a>
              </div>
              {selectedPhoto.message && (
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">{selectedPhoto.guest_name || tx.guest}</span>
                  {' ' + selectedPhoto.message}
                </p>
              )}
              {(comments[selectedPhoto.id] || []).map(c => (
                <p key={c.id} className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">{c.guest_name || tx.guest}</span>
                  {' ' + c.content}
                </p>
              ))}
              <div className="flex flex-col gap-2 mt-3 border-t border-gray-100 pt-3">
                {!getSavedName() && (
                  <input type="text" placeholder={tx.yourName} value={commentName} onChange={e => { setCommentName(e.target.value); saveName(e.target.value) }} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400" />
                )}
                <div className="flex gap-2">
                  <input type="text" placeholder={tx.addComment} value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleComment(selectedPhoto.id) }} className="flex-1 text-sm border-none outline-none text-gray-600 placeholder-gray-300" />
                  <button onClick={() => handleComment(selectedPhoto.id)} className="text-purple-700 text-sm font-medium">{tx.post}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}