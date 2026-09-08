import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { requireMember } from '@/lib/server-auth';
const db = (env as unknown as { DB: D1Database }).DB;
const allowed = new Set([
  'not_started',
  'in_progress',
  'completed',
  'review_needed',
]);
const seeds = [
  ['turkce', 'Türkçe', 'Fenomen 8-A Paragraf', 'LGS Dil Bilgisi ve Anlam'],
  ['turkce', 'Türkçe', '6-A Paragraf', 'LGS Dil Bilgisi ve Anlam'],
  [
    'matematik',
    'Matematik',
    'Fenomen Yayınları 8A',
    'Çarpanlar ve Katlar & Üslü İfadeler',
  ],
  [
    'matematik',
    'Matematik',
    'Fenomen Yayınları 8B',
    'Çarpanlar ve Katlar & Üslü İfadeler',
  ],
  [
    'matematik',
    'Matematik',
    'Fenomen Yayınları Kök',
    'Çarpanlar ve Katlar & Üslü İfadeler',
  ],
  [
    'matematik',
    'Matematik',
    'MUBA Yayınları',
    'Çarpanlar ve Katlar & Üslü İfadeler',
  ],
  [
    'matematik',
    'Matematik',
    'Nartest Yayınları 36 Hafta Deneme',
    'Çarpanlar ve Katlar & Üslü İfadeler',
  ],
  ['fen', 'Fen Bilimleri', 'MUBA Yayınları', 'Mevsimler ve İklim'],
  ['fen', 'Fen Bilimleri', 'MUBA Yayınları', 'DNA ve Genetik Kod'],
  ['fen', 'Fen Bilimleri', 'Fenomen Yayınları Kök', 'Mevsimler ve İklim'],
  ['fen', 'Fen Bilimleri', 'Fenomen Yayınları Kök', 'DNA ve Genetik Kod'],
  ['inkilap', 'İnkılap', 'Fenomen Yayınları', 'Bir Kahraman Doğuyor'],
  [
    'inkilap',
    'İnkılap',
    'Fenomen Yayınları',
    'Millî Uyanış: Bağımsızlık Yolunda Atılan Adımlar',
  ],
  ['inkilap', 'İnkılap', 'Hız Yayınları A', 'Bir Kahraman Doğuyor'],
  ['inkilap', 'İnkılap', 'Nartest Yayınları', 'Bir Kahraman Doğuyor'],
  ['inkilap', 'İnkılap', 'Paraf Yayınları', 'Bir Kahraman Doğuyor'],
  ['din', 'Din Kültürü', 'Ankara Yayınları Güçlendiren', 'Kader İnancı'],
  ['ingilizce', 'İngilizce', 'Hız Yayınları', 'Unit 1: Friendship'],
] as const;
async function ensure() {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS book_unit_progress (id INTEGER PRIMARY KEY AUTOINCREMENT,subject_id TEXT NOT NULL,subject TEXT NOT NULL,book TEXT NOT NULL,unit TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'not_started',progress INTEGER NOT NULL DEFAULT 0,updated_by TEXT NOT NULL DEFAULT 'system',created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`,
    )
    .run();
  await db
    .prepare(
      'CREATE UNIQUE INDEX IF NOT EXISTS uq_book_unit_progress ON book_unit_progress(subject_id,book,unit)',
    )
    .run();
  const row = await db
    .prepare('SELECT COUNT(*) count FROM book_unit_progress')
    .first<{ count: number }>();
  if (Number(row?.count ?? 0) === 0) {
    const now = new Date().toISOString();
    for (const item of seeds)
      await db
        .prepare(
          'INSERT OR IGNORE INTO book_unit_progress(subject_id,subject,book,unit,status,progress,updated_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)',
        )
        .bind(...item, 'completed', 100, 'geçmiş veri aktarımı', now, now)
        .run();
  }
}
export async function GET(request: Request) {
  try {
    await requireMember(request, db, ['student', 'guardian', 'coach']);
  } catch (error) {
    if (error instanceof Response)
      return NextResponse.json(
        { error: await error.text() },
        { status: error.status },
      );
    return NextResponse.json(
      { error: 'Yetkilendirme başarısız.' },
      { status: 500 },
    );
  }
  await ensure();
  const rows = await db
    .prepare(
      'SELECT id,subject_id subjectId,subject,book,unit,status,progress,updated_by updatedBy,updated_at updatedAt FROM book_unit_progress ORDER BY subject,book,unit',
    )
    .all();
  return NextResponse.json({ items: rows.results });
}
export async function POST(request: Request) {
  try {
    await requireMember(request, db, ['guardian', 'coach']);
  } catch (error) {
    if (error instanceof Response)
      return NextResponse.json(
        { error: await error.text() },
        { status: error.status },
      );
    return NextResponse.json(
      { error: 'Bu işlem yalnızca yetişkin ve koç alanından yapılabilir.' },
      { status: 403 },
    );
  }
  await ensure();
  const body = (await request.json()) as {
    subjectId: string;
    subject: string;
    book: string;
    unit: string;
    status: string;
    progress?: number;
  };
  if (!body.subjectId || !body.book || !body.unit || !allowed.has(body.status))
    return NextResponse.json(
      { error: 'Eksik veya geçersiz bilgi.' },
      { status: 400 },
    );
  const progress =
    body.status === 'completed'
      ? 100
      : body.status === 'not_started'
        ? 0
        : Math.max(0, Math.min(99, Number(body.progress ?? 50)));
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO book_unit_progress(subject_id,subject,book,unit,status,progress,updated_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(subject_id,book,unit) DO UPDATE SET status=excluded.status,progress=excluded.progress,updated_by=excluded.updated_by,updated_at=excluded.updated_at`,
    )
    .bind(
      body.subjectId,
      body.subject,
      body.book,
      body.unit,
      body.status,
      progress,
      'Yetişkin & Koç',
      now,
      now,
    )
    .run();
  return NextResponse.json({ ok: true });
}
