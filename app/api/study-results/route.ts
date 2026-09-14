import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { requireMember } from '@/lib/server-auth';

const db = (env as unknown as { DB: D1Database }).DB;

async function authorize(request: Request) {
  return requireMember(request, db, ['student', 'guardian', 'coach']);
}

export async function GET(request: Request) {
  try {
    await authorize(request);
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

  const params = new URL(request.url).searchParams;
  const date = params.get('date');
  const from = params.get('from');
  const to = params.get('to');
  const subjectId = params.get('subjectId');
  const select =
    'SELECT id,assignment_id assignmentId,study_date studyDate,subject_id subjectId,unit,topic,book,total,correct,wrong,blank FROM study_results';

  if (date) {
    const rows = await db
      .prepare(`${select} WHERE study_date=? ORDER BY created_at DESC`)
      .bind(date)
      .all();
    return NextResponse.json({ results: rows.results });
  }
  if (from && to) {
    const rows = await db
      .prepare(
        `${select} WHERE study_date BETWEEN ? AND ? ORDER BY study_date DESC,created_at DESC`,
      )
      .bind(from, to)
      .all();
    return NextResponse.json({ results: rows.results });
  }
  if (subjectId) {
    const rows = await db
      .prepare(
        `${select} WHERE subject_id=? ORDER BY study_date DESC,created_at DESC LIMIT 500`,
      )
      .bind(subjectId)
      .all();
    return NextResponse.json({ results: rows.results });
  }
  return NextResponse.json(
    { error: 'Tarih veya ders bilgisi eksik.' },
    { status: 400 },
  );
}

export async function POST(request: Request) {
  try {
    await authorize(request);
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

  const body = (await request.json()) as {
    assignmentId?: number | null;
    studyDate: string;
    subjectId: string;
    unit: string;
    topic: string;
    book: string;
    total: number;
    correct: number;
    wrong: number;
    blank: number;
  };
  if (
    !body.studyDate ||
    !body.subjectId ||
    (body.subjectId !== 'paragraf' && (!body.unit || !body.topic)) ||
    body.total <= 0 ||
    body.correct + body.wrong + body.blank !== body.total
  )
    return NextResponse.json(
      {
        error:
          body.total <= 0
            ? 'Çözülen soru sayısı en az 1 olmalıdır.'
            : 'Soru sayıları birbiriyle uyuşmuyor.',
      },
      { status: 400 },
    );

  const now = new Date().toISOString();
  const assignmentId = body.assignmentId || null;
  if (assignmentId) {
    await db
      .prepare(
        'INSERT INTO study_results (assignment_id,study_date,subject_id,unit,topic,book,total,correct,wrong,blank,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(assignment_id) DO UPDATE SET study_date=excluded.study_date,subject_id=excluded.subject_id,unit=excluded.unit,topic=excluded.topic,book=excluded.book,total=excluded.total,correct=excluded.correct,wrong=excluded.wrong,blank=excluded.blank',
      )
      .bind(
        assignmentId,
        body.studyDate,
        body.subjectId,
        body.unit,
        body.topic,
        body.book,
        body.total,
        body.correct,
        body.wrong,
        body.blank,
        now,
      )
      .run();
    const row = await db
      .prepare('SELECT id FROM study_results WHERE assignment_id=?')
      .bind(assignmentId)
      .first<{ id: number }>();
    return NextResponse.json({
      ok: true,
      id: row?.id,
      wrongRemaining: body.wrong,
    });
  }

  const result = await db
    .prepare(
      'INSERT INTO study_results (assignment_id,study_date,subject_id,unit,topic,book,total,correct,wrong,blank,created_at) VALUES (NULL,?,?,?,?,?,?,?,?,?,?)',
    )
    .bind(
      body.studyDate,
      body.subjectId,
      body.unit,
      body.topic,
      body.book || 'Kitap seçilmedi',
      body.total,
      body.correct,
      body.wrong,
      body.blank,
      now,
    )
    .run();
  return NextResponse.json({
    ok: true,
    id: Number(result.meta.last_row_id),
    wrongRemaining: body.wrong,
  });
}

export async function DELETE(request: Request) {
  try {
    await authorize(request);
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
  const assignmentId = Number(
    new URL(request.url).searchParams.get('assignmentId'),
  );
  if (!assignmentId)
    return NextResponse.json(
      { error: 'Görev bilgisi eksik.' },
      { status: 400 },
    );
  await db
    .prepare('DELETE FROM study_results WHERE assignment_id=?')
    .bind(assignmentId)
    .run();
  return NextResponse.json({ ok: true });
}
