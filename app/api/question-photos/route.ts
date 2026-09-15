import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { requireMember } from '@/lib/server-auth';
const db = (env as unknown as { DB: D1Database }).DB;
export async function GET(request: Request) {
  try {
    await requireMember(request, db, ['student', 'guardian', 'coach']);
    const p = new URL(request.url).searchParams;
    const start = p.get('from'), end = p.get('to');
    if (!start || !end || !/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || start > end) return NextResponse.json({ error: 'Geçerli tarihler seçin.' }, { status: 400 });
    const before = Number(p.get('before')) || Number.MAX_SAFE_INTEGER;
    const rows = await db.prepare('SELECT w.id, w.subject_id subjectId, w.unit, w.topic, w.analysis, s.book, s.study_date studyDate FROM wrong_questions w JOIN study_results s ON s.id = w.study_result_id WHERE s.study_date BETWEEN ? AND ? AND w.id < ? ORDER BY w.id DESC LIMIT 13').bind(start, end, before).all();
    const photos = rows.results.slice(0, 12);
    return NextResponse.json({ photos, hasMore: rows.results.length > 12 }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (e) {
    if (e instanceof Response) return NextResponse.json({ error: 'Giriş veya yetki gerekli.' }, { status: e.status });
    return NextResponse.json({ error: 'Fotoğraflar alınamadı.' }, { status: 500 });
  }
}
