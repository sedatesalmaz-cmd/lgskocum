import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { requireMember } from '@/lib/server-auth';
import { ensureAssignments } from '@/lib/assignments-store';

const db = (env as unknown as { DB: D1Database }).DB;

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
      { error: 'Gelişim verileri yüklenemedi.' },
      { status: 500 },
    );
  }
  try {
    await ensureAssignments(db);
    const targets = await db
      .prepare(
        `SELECT due_date date,subject,SUM(question_count) target
         FROM assignments WHERE due_date>=? GROUP BY due_date,subject`,
      )
      .bind('2026-09-04')
      .all();
    const solved = await db
      .prepare(
        `SELECT sr.study_date date,
          COALESCE(a.subject,
            CASE sr.subject_id
              WHEN 'matematik' THEN 'Matematik'
              WHEN 'fen' THEN 'Fen Bilimleri'
              WHEN 'fen-bilimleri' THEN 'Fen Bilimleri'
              WHEN 'inkilap' THEN 'İnkılap'
              WHEN 'inkilap-tarihi' THEN 'İnkılap'
              WHEN 'din' THEN 'Din Kültürü'
              WHEN 'din-kulturu' THEN 'Din Kültürü'
              WHEN 'ingilizce' THEN 'İngilizce'
              ELSE 'Türkçe'
            END) subject,
          SUM(sr.total) solved
         FROM study_results sr
         LEFT JOIN assignments a ON a.id=sr.assignment_id
         WHERE sr.study_date>=? GROUP BY sr.study_date,subject`,
      )
      .bind('2026-09-04')
      .all();
    return NextResponse.json({
      targets: targets.results,
      solved: solved.results,
    });
  } catch {
    return NextResponse.json({ targets: [], solved: [] });
  }
}
