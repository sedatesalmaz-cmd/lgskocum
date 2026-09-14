import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { requireAdmin } from '@/lib/server-auth';

const db = (env as unknown as { DB: D1Database; UPLOADS: R2Bucket }).DB;
const uploads = (env as unknown as { DB: D1Database; UPLOADS: R2Bucket })
  .UPLOADS;

const groups = {
  assignments: ['assignments'],
  results: ['study_results'],
  wrongQuestions: ['wrong_questions'],
  reports: ['weekly_reports'],
  bookProgress: ['book_unit_progress'],
} as const;

type Scope = keyof typeof groups | 'all';

async function authorize(request: Request) {
  try {
    return requireAdmin(request);
  } catch (error) {
    if (error instanceof Response) throw error;
    throw new Response('Yönetici kontrolü yapılamadı', { status: 500 });
  }
}

async function counts() {
  const entries = await Promise.all(
    Object.entries(groups).map(async ([key, tables]) => {
      const rows = await Promise.all(
        tables.map((table) =>
          db
            .prepare(`SELECT COUNT(*) count FROM ${table}`)
            .first<{ count: number }>(),
        ),
      );
      return [key, rows.reduce((sum, row) => sum + Number(row?.count ?? 0), 0)];
    }),
  );
  return Object.fromEntries(entries);
}

export async function GET(request: Request) {
  try {
    const admin = await authorize(request);
    return NextResponse.json({
      authorized: true,
      email: admin.email,
      counts: await counts(),
    });
  } catch (error) {
    if (error instanceof Response)
      return NextResponse.json(
        { authorized: false, error: await error.text() },
        { status: error.status },
      );
    return NextResponse.json(
      { error: 'Yönetim bilgileri alınamadı.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await authorize(request);
    const body = (await request.json()) as {
      scope?: Scope;
      confirmation?: string;
    };
    const scope = body.scope;
    if (!scope || (scope !== 'all' && !(scope in groups)))
      return NextResponse.json(
        { error: 'Geçersiz silme kapsamı.' },
        { status: 400 },
      );
    if (body.confirmation !== 'VERİLERİ SİL')
      return NextResponse.json(
        { error: 'Onay ifadesi eksik.' },
        { status: 400 },
      );

    if (scope === 'all' || scope === 'wrongQuestions') {
      const keys = await db
        .prepare('SELECT image_key imageKey FROM wrong_questions')
        .all<{ imageKey: string }>();
      const imageKeys = keys.results.map((row) => row.imageKey).filter(Boolean);
      if (imageKeys.length) await uploads.delete(imageKeys);
    }

    const tables =
      scope === 'all'
        ? [
            'wrong_questions',
            'study_results',
            'weekly_reports',
            'book_unit_progress',
            'assignments',
          ]
        : [...groups[scope]];
    await db.batch(tables.map((table) => db.prepare(`DELETE FROM ${table}`)));

    return NextResponse.json({
      ok: true,
      deletedBy: admin.email,
      counts: await counts(),
    });
  } catch (error) {
    if (error instanceof Response)
      return NextResponse.json(
        { error: await error.text() },
        { status: error.status },
      );
    return NextResponse.json({ error: 'Veriler silinemedi.' }, { status: 500 });
  }
}
