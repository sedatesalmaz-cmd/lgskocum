import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { requireMember } from '@/lib/server-auth';
import { ensureAssignments } from '@/lib/assignments-store';

const db = (env as unknown as { DB: D1Database }).DB;

const select =
  'SELECT id,due_date dueDate,subject_id subjectId,subject,book,unit,topic,question_count questionCount,note FROM assignments';

export async function GET(request: Request) {
  try {
    await requireMember(request, db, ['student', 'guardian', 'coach']);
    await ensureAssignments(db);
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
    await ensureAssignments(db);
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
    (body.subjectId !== 'paragraf' && (!body.unit || !body.topic)) ||
    Number(body.questionCount) < 1
  )
    return NextResponse.json(
      { error: 'Ödev bilgileri eksik.' },
      { status: 400 },
    );
  const normalizedBook = body.book || 'Kitap belirtilmedi';
  const duplicate = await db
    .prepare(
      'SELECT id FROM assignments WHERE due_date=? AND subject_id=? AND book=? AND unit=? AND topic=? LIMIT 1',
    )
    .bind(body.dueDate, body.subjectId, normalizedBook, body.unit, body.topic)
    .first();
  if (duplicate)
    return NextResponse.json(
      { error: 'Bu ödev aynı tarih, ders, kitap ve konu için zaten eklenmiş.' },
      { status: 409 },
    );
  const result = await db
    .prepare(
      'INSERT INTO assignments(due_date,subject_id,subject,book,unit,topic,question_count,note,created_at) VALUES(?,?,?,?,?,?,?,?,?)',
    )
    .bind(
      body.dueDate,
      body.subjectId,
      body.subject,
      normalizedBook,
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

export async function DELETE(request: Request) {
  try {
    await requireMember(request, db, ['guardian', 'coach']);
    await ensureAssignments(db);
  } catch (error) {
    if (error instanceof Response)
      return NextResponse.json(
        { error: await error.text() },
        { status: error.status },
      );
    return NextResponse.json({ error: 'Ödev iptal edilemedi.' }, { status: 500 });
  }
  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!Number.isInteger(id) || id < 1)
    return NextResponse.json({ error: 'Geçersiz ödev.' }, { status: 400 });
  const completed = await db
    .prepare('SELECT id FROM study_results WHERE assignment_id=? LIMIT 1')
    .bind(id)
    .first();
  if (completed)
    return NextResponse.json(
      { error: 'Sonuç girişi yapılmış ödev iptal edilemez. Önce öğrenci girişini geri alın.' },
      { status: 409 },
    );
  await db.prepare('DELETE FROM assignments WHERE id=?').bind(id).run();
  return NextResponse.json({ ok: true });
}
