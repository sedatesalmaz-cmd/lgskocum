import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { requireMember } from '@/lib/server-auth';
import { currentWeekAssignments } from '@/lib/current-week-plan';

const db = (env as unknown as { DB: D1Database }).DB;

async function ensureAssignments() {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        due_date TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        book TEXT NOT NULL,
        unit TEXT NOT NULL,
        topic TEXT NOT NULL,
        question_count INTEGER NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL
      )`,
    )
    .run();
  await db
    .prepare(
      'CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date)',
    )
    .run();
  const count = await db
    .prepare('SELECT COUNT(*) count FROM assignments')
    .first<{ count: number }>();
  if (Number(count?.count ?? 0) > 0) return;
  const now = new Date().toISOString();
  for (const item of currentWeekAssignments) {
    await db
      .prepare(
        'INSERT OR IGNORE INTO assignments(id,due_date,subject_id,subject,book,unit,topic,question_count,note,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)',
      )
      .bind(
        item.id,
        item.dueDate,
        item.subjectId,
        item.subject,
        item.book,
        item.unit,
        item.topic,
        item.questionCount,
        item.note,
        now,
      )
      .run();
  }
}

const select =
  'SELECT id,due_date dueDate,subject_id subjectId,subject,book,unit,topic,question_count questionCount,note FROM assignments';

export async function GET(request: Request) {
  try {
    await requireMember(request, db, ['student', 'guardian', 'coach']);
    await ensureAssignments();
    const rows = await db
      .prepare(`${select} ORDER BY due_date DESC,id DESC`)
      .all();
    return NextResponse.json({ assignments: rows.results });
  } catch (error) {
    if (error instanceof Response)
      return NextResponse.json(
        { error: await error.text() },
        { status: error.status },
      );
    return NextResponse.json(
      { error: 'Ödevler yüklenemedi.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireMember(request, db, ['guardian', 'coach']);
    await ensureAssignments();
  } catch (error) {
    if (error instanceof Response)
      return NextResponse.json(
        { error: await error.text() },
        { status: error.status },
      );
    return NextResponse.json({ error: 'Ödev kaydedilemedi.' }, { status: 500 });
  }
  const body = (await request.json()) as {
    dueDate: string;
    subjectId: string;
    subject: string;
    book: string;
    unit: string;
    topic: string;
    questionCount: number;
    note?: string;
  };
  if (
    !body.dueDate ||
    !body.subjectId ||
    !body.subject ||
    !body.unit ||
    !body.topic ||
    Number(body.questionCount) < 1
  )
    return NextResponse.json(
      { error: 'Ödev bilgileri eksik.' },
      { status: 400 },
    );
  const result = await db
    .prepare(
      'INSERT INTO assignments(due_date,subject_id,subject,book,unit,topic,question_count,note,created_at) VALUES(?,?,?,?,?,?,?,?,?)',
    )
    .bind(
      body.dueDate,
      body.subjectId,
      body.subject,
      body.book || 'Kitap belirtilmedi',
      body.unit,
      body.topic,
      Number(body.questionCount),
      body.note || '',
      new Date().toISOString(),
    )
    .run();
  const row = await db
    .prepare(`${select} WHERE id=?`)
    .bind(Number(result.meta.last_row_id))
    .first();
  return NextResponse.json({ assignment: row });
}
