'use client'
import { useState } from 'react'
import Link from 'next/link'

const texts = {
  ko: {
    hero: '모든 순간을 함께 담다',
    sub: 'QR 코드 하나로 모든 게스트의 사진을 한 곳에',
    cta: '무료로 시작하기',
    login: '로그인',
    feature1: '앱 없이',
    feature1sub: '게스트는 QR만 스캔하면 됩니다',
    feature2: '100% 비공개',
    feature2sub: '링크가 있는 사람만 접근 가능',
    feature3: '한번에 다운로드',
    feature3sub: '모든 사진을 한 번에',
    how: '어떻게 작동하나요?',
    step1: '이벤트 만들기',
    step1sub: '이름, 날짜, 장소를 입력하세요',
    step2: 'QR 공유하기',
    step2sub: '게스트에게 QR을 보여주세요',
    step3: '사진 모으기',
    step3sub: '모든 사진이 자동으로 모입니다',
  },
  en: {
    hero: 'Capture every moment together',
    sub: 'Share all guest photos in one place with a single QR code',
    cta: 'Start free',
    login: 'Login',
    feature1: 'No app needed',
    feature1sub: 'Guests just scan the QR code',
    feature2: '100% Private',
    feature2sub: 'Only people with the link can access',
    feature3: 'Download all',
    feature3sub: 'All photos in one click',
    how: 'How it works',
    step1: 'Create event',
    step1sub: 'Enter name, date and location',
    step2: 'Share QR',
    step2sub: 'Show the QR to your guests',
    step3: 'Collect photos',
    step3sub: 'All photos collected automatically',
  },
  es: {
    hero: 'Captura cada momento juntos',
    sub: 'Comparte todas las fotos de tus invitados en un solo lugar con un QR',
    cta: 'Empezar gratis',
    login: 'Iniciar sesión',
    feature1: 'Sin app',
    feature1sub: 'Los invitados solo escanean el QR',
    feature2: '100% Privado',
    feature2sub: 'Solo quien tiene el link puede acceder',
    feature3: 'Descarga todo',
    feature3sub: 'Todas las fotos en un clic',
    how: '¿Cómo funciona?',
    step1: 'Crea el evento',
    step1sub: 'Ingresa nombre, fecha y lugar',
    step2: 'Comparte el QR',
    step2sub: 'Muéstrale el QR a tus invitados',
    step3: 'Reúne las fotos',
    step3sub: 'Todas las fotos se reúnen automáticamente',
  }
}

export default function Home() {
  const [lang, setLang] = useState<'ko' | 'en' | 'es'>('ko')
  const [menuOpen, setMenuOpen] = useState(false)
  const t = texts[lang]

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-purple-700">Evesnap</h1>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['ko', 'en', 'es'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${lang === l ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {l === 'ko' ? '한국어' : l === 'en' ? 'EN' : 'ES'}
              </button>
            ))}
          </div>
          <Link href="/login" className="text-gray-500 text-sm hover:text-purple-700 transition">
            {t.login}
          </Link>
          <Link href="/register" className="bg-purple-700 text-white px-5 py-2 rounded-lg hover:bg-purple-800 transition text-sm font-medium">
            {t.cta}
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-500 text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-6 py-4 flex flex-col gap-4">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
            {(['ko', 'en', 'es'] as const).map(l => (
              <button
                key={l}
                onClick={() => { setLang(l); setMenuOpen(false) }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${lang === l ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-400'}`}
              >
                {l === 'ko' ? '한국어' : l === 'en' ? 'EN' : 'ES'}
              </button>
            ))}
          </div>
          <Link href="/login" onClick={() => setMenuOpen(false)} className="text-gray-600 text-sm">
            {t.login}
          </Link>
          <Link href="/register" onClick={() => setMenuOpen(false)} className="bg-purple-700 text-white px-5 py-3 rounded-lg text-sm font-medium text-center">
            {t.cta}
          </Link>
        </div>
      )}

      {/* Hero */}
      <section className="text-center py-20 px-6 bg-gradient-to-b from-purple-50 to-white">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 max-w-2xl mx-auto leading-tight">
          {t.hero}
        </h2>
        <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
          {t.sub}
        </p>
        <Link href="/register" className="bg-purple-700 text-white px-8 py-4 rounded-xl text-lg hover:bg-purple-800 transition font-medium">
          {t.cta} →
        </Link>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-16 max-w-5xl mx-auto">
        {[
          { emoji: '📱', title: t.feature1, sub: t.feature1sub },
          { emoji: '🔒', title: t.feature2, sub: t.feature2sub },
          { emoji: '⬇️', title: t.feature3, sub: t.feature3sub },
        ].map((f, i) => (
          <div key={i} className="text-center p-8 rounded-2xl bg-purple-50 border border-purple-100">
            <div className="text-4xl mb-4">{f.emoji}</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.sub}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">{t.how}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '1', title: t.step1, sub: t.step1sub, emoji: '✏️' },
              { num: '2', title: t.step2, sub: t.step2sub, emoji: '📱' },
              { num: '3', title: t.step3, sub: t.step3sub, emoji: '🖼️' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-purple-700 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {s.num}
                </div>
                <div className="text-2xl mb-2">{s.emoji}</div>
                <h4 className="font-semibold text-gray-800 mb-1">{s.title}</h4>
                <p className="text-gray-400 text-sm">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="text-center py-20 px-6">
        <h3 className="text-3xl font-bold text-gray-900 mb-4">{t.hero}</h3>
        <p className="text-gray-400 mb-8">{t.sub}</p>
        <Link href="/register" className="bg-purple-700 text-white px-8 py-4 rounded-xl text-lg hover:bg-purple-800 transition font-medium">
          {t.cta} →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6 text-center">
        <p className="text-purple-700 font-bold text-lg mb-2">Evesnap</p>
        <p className="text-gray-400 text-sm">© 2025 Evesnap</p>
      </footer>
    </main>
  )
}