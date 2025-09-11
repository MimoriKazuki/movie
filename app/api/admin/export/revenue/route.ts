import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function toCsvValue(val: any): string {
  if (val === null || val === undefined) return ''
  const s = String(val)
  // quote if contains comma, quote or newline
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function buildCsv(headers: string[], rows: any[][]): string {
  const headerLine = headers.map(toCsvValue).join(',')
  const lines = rows.map(r => r.map(toCsvValue).join(','))
  return [headerLine, ...lines].join('\n') + '\n'
}

function parseRange(range?: string): { start?: Date } {
  if (!range) return {}
  const now = new Date()
  if (range === '7d') {
    const d = new Date(now)
    d.setDate(d.getDate() - 7)
    return { start: d }
  }
  if (range === '30d') {
    const d = new Date(now)
    d.setDate(d.getDate() - 30)
    return { start: d }
  }
  if (range === '90d') {
    const d = new Date(now)
    d.setDate(d.getDate() - 90)
    return { start: d }
  }
  return {}
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const url = new URL(request.url)
  const category = (url.searchParams.get('category') || 'all') as 'all' | 'video' | 'course' | 'prompt'
  const range = url.searchParams.get('range') || '30d'
  const startParam = url.searchParams.get('start')
  const endParam = url.searchParams.get('end')
  const { start: rangeStart } = parseRange(range)
  const start = startParam ? new Date(startParam) : rangeStart
  const end = endParam ? new Date(endParam) : undefined

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const sinceIso = start?.toISOString()
  const untilIso = end?.toISOString()

  // Fetch purchases
  const [videoPurchasesRes, coursePurchasesRes, promptPurchasesRes] = await Promise.all([
    (async () => {
      if (category !== 'all' && category !== 'video') return [] as any[]
      let q = supabase
        .from('video_purchases')
        .select('video_id, user_id, price_paid, purchased_at, created_at')
        .eq('status', 'active')
      if (sinceIso) q = q.gte('purchased_at', sinceIso)
      if (untilIso) q = q.lte('purchased_at', untilIso)
      const { data } = await q
      return data || []
    })(),
    (async () => {
      if (category !== 'all' && category !== 'course') return [] as any[]
      let q = supabase
        .from('course_purchases')
        .select('course_id, user_id, price_paid, purchased_at')
        .eq('status', 'active')
      if (sinceIso) q = q.gte('purchased_at', sinceIso)
      if (untilIso) q = q.lte('purchased_at', untilIso)
      const { data } = await q
      return data || []
    })(),
    (async () => {
      if (category !== 'all' && category !== 'prompt') return [] as any[]
      let q = supabase
        .from('prompt_purchases')
        .select('prompt_id, buyer_id, price, purchased_at')
      if (sinceIso) q = q.gte('purchased_at', sinceIso)
      if (untilIso) q = q.lte('purchased_at', untilIso)
      const { data } = await q
      return data || []
    })(),
  ])

  // Load titles
  const videoIds = Array.from(new Set(videoPurchasesRes.map(v => v.video_id).filter(Boolean)))
  const courseIds = Array.from(new Set(coursePurchasesRes.map(c => c.course_id).filter(Boolean)))
  const promptIds = Array.from(new Set(promptPurchasesRes.map(p => p.prompt_id).filter(Boolean)))

  const [videoTitles, courseTitles, promptTitles] = await Promise.all([
    videoIds.length ? supabase.from('videos').select('id, title').in('id', videoIds) : Promise.resolve({ data: [] as any[] }),
    courseIds.length ? supabase.from('courses').select('id, title').in('id', courseIds) : Promise.resolve({ data: [] as any[] }),
    promptIds.length ? supabase.from('prompts').select('id, title').in('id', promptIds) : Promise.resolve({ data: [] as any[] }),
  ])

  const videoTitleMap = new Map((videoTitles.data || []).map((v: any) => [v.id, v.title]))
  const courseTitleMap = new Map((courseTitles.data || []).map((c: any) => [c.id, c.title]))
  const promptTitleMap = new Map((promptTitles.data || []).map((p: any) => [p.id, p.title]))

  // Build rows
  const rows: any[][] = []

  videoPurchasesRes.forEach(r => {
    const date = r.purchased_at || r.created_at
    rows.push(['video', r.video_id, videoTitleMap.get(r.video_id) || '', r.user_id, date, r.price_paid])
  })
  coursePurchasesRes.forEach(r => {
    rows.push(['course', r.course_id, courseTitleMap.get(r.course_id) || '', r.user_id, r.purchased_at, r.price_paid])
  })
  promptPurchasesRes.forEach(r => {
    rows.push(['prompt', r.prompt_id, promptTitleMap.get(r.prompt_id) || '', r.buyer_id, r.purchased_at, r.price])
  })

  // Sort by date desc
  rows.sort((a, b) => new Date(b[4]).getTime() - new Date(a[4]).getTime())

  const headers = ['type', 'item_id', 'title', 'user_id', 'purchased_at', 'amount']
  const csv = buildCsv(headers, rows)

  const rangeLabel = startParam || endParam ? `${startParam || ''}_${endParam || ''}` : range
  const fileName = `revenue_${category}_${rangeLabel}_${new Date().toISOString().slice(0,10)}.csv`
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    },
  })
}
