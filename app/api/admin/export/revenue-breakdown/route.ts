import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function toCsvValue(val: any): string {
  if (val === null || val === undefined) return ''
  const s = String(val)
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
  const d = new Date(now)
  if (range === '7d') d.setDate(d.getDate() - 7)
  else if (range === '30d') d.setDate(d.getDate() - 30)
  else if (range === '90d') d.setDate(d.getDate() - 90)
  else return {}
  return { start: d }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const url = new URL(request.url)
  const range = url.searchParams.get('range') || '30d'
  const startParam = url.searchParams.get('start')
  const endParam = url.searchParams.get('end')
  const { start: rangeStart } = parseRange(range)
  const start = startParam ? new Date(startParam) : rangeStart
  const end = endParam ? new Date(endParam) : undefined

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const sinceIso = start?.toISOString()
  const untilIso = end?.toISOString()

  // Fetch purchases
  const [videoRes, courseRes, promptRes] = await Promise.all([
    (async () => {
      let q = supabase
        .from('video_purchases')
        .select('price_paid, purchased_at, created_at')
        .eq('status', 'active')
      if (sinceIso) q = q.gte('purchased_at', sinceIso)
      if (untilIso) q = q.lte('purchased_at', untilIso)
      const { data } = await q
      return data || []
    })(),
    (async () => {
      let q = supabase
        .from('course_purchases')
        .select('price_paid, purchased_at')
        .eq('status', 'active')
      if (sinceIso) q = q.gte('purchased_at', sinceIso)
      if (untilIso) q = q.lte('purchased_at', untilIso)
      const { data } = await q
      return data || []
    })(),
    (async () => {
      let q = supabase
        .from('prompt_purchases')
        .select('price, purchased_at')
      if (sinceIso) q = q.gte('purchased_at', sinceIso)
      if (untilIso) q = q.lte('purchased_at', untilIso)
      const { data } = await q
      return data || []
    })(),
  ])

  const dayMap = new Map<string, { date: string; video: number; course: number; prompt: number; total: number }>()

  const ensureDay = (isoDate: string) => {
    const day = isoDate.split('T')[0]
    if (!dayMap.has(day)) dayMap.set(day, { date: day, video: 0, course: 0, prompt: 0, total: 0 })
    return dayMap.get(day)!
  }

  videoRes.forEach(r => {
    const d = r.purchased_at || r.created_at
    if (!d) return
    const bucket = ensureDay(d)
    bucket.video += r.price_paid || 0
    bucket.total += r.price_paid || 0
  })
  courseRes.forEach(r => {
    const d = r.purchased_at
    if (!d) return
    const bucket = ensureDay(d)
    bucket.course += r.price_paid || 0
    bucket.total += r.price_paid || 0
  })
  promptRes.forEach(r => {
    const d = r.purchased_at
    if (!d) return
    const bucket = ensureDay(d)
    bucket.prompt += r.price || 0
    bucket.total += r.price || 0
  })

  const rows = Array.from(dayMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(r => [r.date, r.video, r.course, r.prompt, r.total])

  const headers = ['date', 'video', 'course', 'prompt', 'total']
  const csv = buildCsv(headers, rows)
  const rangeLabel = startParam || endParam ? `${startParam || ''}_${endParam || ''}` : range
  const fileName = `revenue_breakdown_${rangeLabel}_${new Date().toISOString().slice(0,10)}.csv`
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    },
  })
}

