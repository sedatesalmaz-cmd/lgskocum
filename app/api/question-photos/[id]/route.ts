import { env } from 'cloudflare:workers';
import { requireMember } from '@/lib/server-auth';
const bindings = env as unknown as { DB: D1Database; UPLOADS: R2Bucket };
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireMember(request, bindings.DB, ['student', 'guardian', 'coach']);
    const id = Number((await context.params).id);
    if (!Number.isSafeInteger(id) || id <= 0) return new Response('Fotoğraf bulunamadı.', { status: 404 });
    const row = await bindings.DB.prepare('SELECT image_key imageKey FROM wrong_questions WHERE id = ?').bind(id).first<{ imageKey: string }>();
    if (!row) return new Response('Fotoğraf bulunamadı.', { status: 404 });
    const thumb = new URL(request.url).searchParams.get('thumbnail') === '1';
    const object = await bindings.UPLOADS.get(row.imageKey + (thumb ? '/thumbnail' : ''));
    if (!object) return new Response('Fotoğraf bulunamadı.', { status: 404, headers: { 'Cache-Control': 'private, max-age=300' } });
    const headers = new Headers({ 'Content-Type': object.httpMetadata?.contentType || 'image/jpeg', 'Cache-Control': 'private, max-age=300', 'ETag': object.httpEtag, 'X-Content-Type-Options': 'nosniff' });
    if (request.headers.get('If-None-Match') === object.httpEtag) return new Response(null, { status: 304, headers });
    return new Response(object.body, { headers });
  } catch (e) {
    if (e instanceof Response) return new Response('Giriş veya yetki gerekli.', { status: e.status, headers: { 'Cache-Control': 'no-store' } });
    return new Response('Fotoğraf yüklenemedi.', { status: 500 });
  }
}
