import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function toCsvValue(val: any): string {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
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
  const limit = parseInt(url.searchParams.get('limit') || '100', 10)
  const category = (url.searchParams.get('category') || 'all') as 'all' | 'video' | 'course' | 'prompt'
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

  const [videoRes, courseRes, promptRes] = await Promise.all([
    (async () => {
      if (category !== 'all' && category !== 'video') return [] as any[]
      let q = supabase
        .from('video_purchases')
        .select('video_id, price_paid, purchased_at, created_at')
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
        .select('course_id, price_paid, purchased_at')
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
        .select('prompt_id, price, purchased_at')
      if (sinceIso) q = q.gte('purchased_at', sinceIso)
      if (untilIso) q = q.lte('purchased_at', untilIso)
      const { data } = await q
      return data || []
    })(),
  ])

  const videoIds = Array.from(new Set(videoRes.map(v => v.video_id).filter(Boolean)))
  const courseIds = Array.from(new Set(courseRes.map(c => c.course_id).filter(Boolean)))
  const promptIds = Array.from(new Set(promptRes.map(p => p.prompt_id).filter(Boolean)))

  const [videoTitles, courseTitles, promptTitles] = await Promise.all([
    videoIds.length ? supabase.from('videos').select('id, title').in('id', videoIds) : Promise.resolve({ data: [] as any[] }),
    courseIds.length ? supabase.from('courses').select('id, title').in('id', courseIds) : Promise.resolve({ data: [] as any[] }),
    promptIds.length ? supabase.from('prompts').select('id, title').in('id', promptIds) : Promise.resolve({ data: [] as any[] }),
  ])

  const videoTitleMap = new Map((videoTitles.data || []).map((v: any) => [v.id, v.title]))
  const courseTitleMap = new Map((courseTitles.data || []).map((c: any) => [c.id, c.title]))
  const promptTitleMap = new Map((promptTitles.data || []).map((p: any) => [p.id, p.title]))

  const rank = [] as any[]

  const videoAgg = Object.values(
    videoRes.reduce((acc: any, r: any) => {
      const key = r.video_id
      if (!key) return acc
      if (!acc[key]) acc[key] = { type: 'video', id: key, title: videoTitleMap.get(key) || '', count: 0, revenue: 0 }
      acc[key].count += 1
      acc[key].revenue += r.price_paid || 0
      return acc
    }, {})
  )
  const courseAgg = Object.values(
    courseRes.reduce((acc: any, r: any) => {
      const key = r.course_id
      if (!key) return acc
      if (!acc[key]) acc[key] = { type: 'course', id: key, title: courseTitleMap.get(key) || '', count: 0, revenue: 0 }
      acc[key].count += 1
      acc[key].revenue += r.price_paid || 0
      return acc
    }, {})
  )
  const promptAgg = Object.values(
    promptRes.reduce((acc: any, r: any) => {
      const key = r.prompt_id
      if (!key) return acc
      if (!acc[key]) acc[key] = { type: 'prompt', id: key, title: promptTitleMap.get(key) || '', count: 0, revenue: 0 }
      acc[key].count += 1
      acc[key].revenue += r.price || 0
      return acc
    }, {})
  )

  if (category === 'all' || category === 'video') rank.push(...videoAgg)
  if (category === 'all' || category === 'course') rank.push(...courseAgg)
  if (category === 'all' || category === 'prompt') rank.push(...promptAgg)

  rank.sort((a, b) => b.revenue - a.revenue)
  const top = rank.slice(0, Math.max(1, Math.min(limit, 1000)))

  const headers = ['type', 'item_id', 'title', 'count', 'revenue']
  const rows = top.map(r => [r.type, r.id, r.title, r.count, r.revenue])
  const csv = buildCsv(headers, rows)
  const rangeLabel = startParam || endParam ? `${startParam || ''}_${endParam || ''}` : range
  const fileName = `revenue_ranking_${category}_${rangeLabel}_${new Date().toISOString().slice(0,10)}.csv`
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    },
  })
}

