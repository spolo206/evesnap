import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await context.params

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', eventId)

  if (!photos || photos.length === 0) {
    return NextResponse.json({ error: 'No photos found' }, { status: 404 })
  }

  const zip = new JSZip()

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i]
    const response = await fetch(photo.url)
    const buffer = await response.arrayBuffer()
    const ext = photo.url.split('.').pop()?.split('?')[0] || 'jpg'
    zip.file(`photo-${i + 1}.${ext}`, buffer)
  }

  const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' })

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="evesnap-photos.zip"`,
    },
  })
}