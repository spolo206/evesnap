import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-5 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-purple-700">Evesnap</h1>
        <div className="flex gap-4">
          <Link href="/login" className="text-gray-600 hover:text-purple-700 transition">
            Login
          </Link>
          <Link href="/register" className="bg-purple-700 text-white px-5 py-2 rounded-lg hover:bg-purple-800 transition">
            시작하기 / Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center py-24 px-8">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          모든 순간을 함께 담다
        </h2>
        <p className="text-xl text-gray-500 mb-4">
          Capture every moment together
        </p>
        <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
          QR 코드 하나로 모든 게스트의 사진을 한 곳에 · Share all guest photos in one place with a single QR code
        </p>
        <Link href="/register" className="bg-purple-700 text-white px-8 py-4 rounded-xl text-lg hover:bg-purple-800 transition">
          무료로 시작하기 · Start free
        </Link>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 py-16 max-w-5xl mx-auto">
        <div className="text-center p-6 rounded-2xl border border-gray-100">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-lg font-semibold mb-2">앱 없이 · No app needed</h3>
          <p className="text-gray-500 text-sm">게스트는 QR만 스캔하면 됩니다 · Guests just scan the QR code</p>
        </div>
        <div className="text-center p-6 rounded-2xl border border-gray-100">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold mb-2">완전 비공개 · 100% Private</h3>
          <p className="text-gray-500 text-sm">링크가 있는 사람만 접근 가능 · Only people with the link can access</p>
        </div>
        <div className="text-center p-6 rounded-2xl border border-gray-100">
          <div className="text-4xl mb-4">⬇️</div>
          <h3 className="text-lg font-semibold mb-2">한번에 다운로드 · Download all</h3>
          <p className="text-gray-500 text-sm">모든 사진을 한 번에 · All photos in one click</p>
        </div>
      </section>
    </main>
  )
}