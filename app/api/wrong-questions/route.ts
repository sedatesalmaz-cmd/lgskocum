import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { requireMember } from '@/lib/server-auth';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}

export async function GET(request: Request) {
  try {
    await requireMember(request, env.DB, ['student', 'guardian', 'coach']);
    const id = Number(new URL(request.url).searchParams.get('studyResultId'));
    const result = await env.DB.prepare('SELECT wrong + blank AS photo_limit, (SELECT COUNT(*) FROM wrong_questions WHERE study_result_id = study_results.id) AS photo_count FROM study_results WHERE id = ?').bind(id).first<{ photo_limit: number; photo_count: number }>();
    if (!result) return NextResponse.json({ error: 'Çalışma bulunamadı.' }, { status: 404 });
    return NextResponse.json({ count: result.photo_count, limit: result.photo_limit });
  } catch (error) {
    if (error instanceof Response) return NextResponse.json({ error: await error.text() }, { status: error.status });
    return NextResponse.json({ error: 'Fotoğraf adedi alınamadı.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireMember(request, env.DB, ['student', 'guardian', 'coach']);
    const form = await request.formData();
    const image = form.get('image');
    if (!(image instanceof File))
      return NextResponse.json({ error: 'Bir soru fotoğrafı seçin.' }, { status: 400 });
    if (!allowedTypes.has(image.type) || image.size > 6 * 1024 * 1024)
      return NextResponse.json({ error: 'Fotoğraf JPG, PNG veya WEBP olmalı ve 6 MB’ı aşmamalı.' }, { status: 400 });
    if (form.get('privacyConfirmed') !== 'true')
      return NextResponse.json({ error: 'Kişisel bilgi kontrolünü onaylayın.' }, { status: 400 });

    const subject = String(form.get('subject') || '');
    const subjectId = String(form.get('subjectId') || '');
    const unit = String(form.get('unit') || '');
    const topic = String(form.get('topic') || '');
    const studyResultId = Number(form.get('studyResultId')) || null;
    if (studyResultId) {
      const result = await env.DB.prepare('SELECT wrong + blank AS photo_limit, (SELECT COUNT(*) FROM wrong_questions WHERE study_result_id = study_results.id) AS photo_count FROM study_results WHERE id = ?').bind(studyResultId).first<{ photo_limit: number; photo_count: number }>();
      if (!result || result.photo_count >= result.photo_limit) return NextResponse.json({ error: 'Bu çalışmanın yanlış ve boş soruları için tüm fotoğraflar kaydedilmiş.' }, { status: 409 });
    }
    if (!subject || !subjectId || (subjectId !== 'paragraf' && (!unit || !topic)))
      return NextResponse.json({ error: 'Ders, ünite ve konu bilgileri eksik.' }, { status: 400 });

    const buffer = await image.arrayBuffer();
    let analysis: string | null = null;
    let analysisStatus: 'completed' | 'unavailable' = 'unavailable';
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify({
              contents: [{ parts: [
                { text: `Anonim LGS yanlış veya boş sorusu. Ders: ${subject}; ünite: ${unit || 'yok'}; konu: ${topic || 'yok'}. Öğrencinin cevabı bilinmiyor; kesin hata nedeni uydurma. Kişisel bilgi görürsen analiz yapma. Aksi halde 120 kelimeyi aşmadan soru türü, olası zorlanma noktası, kısa çözüm yaklaşımı ve benzer soruda dikkat edilecek noktayı yaz.` },
                { inline_data: { mime_type: image.type, data: toBase64(buffer) } },
              ] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 350 },
            }),
          },
        );
        if (response.ok) {
          const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
          analysis = data.candidates?.[0]?.content?.parts
            ?.map((part: { text?: string }) => part.text ?? '')
            .join('').trim() || null;
          if (analysis) analysisStatus = 'completed';
        }
      } catch {
        analysis = null;
      }
    }

    const imageKey = `wrong-questions/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}`;
    await env.UPLOADS.put(imageKey, buffer, { httpMetadata: { contentType: image.type } });
    const inserted = await env.DB.prepare(
      'INSERT INTO wrong_questions (study_result_id, subject_id, unit, topic, image_key, analysis, created_at) SELECT ?, ?, ?, ?, ?, ?, ? WHERE ? IS NULL OR (SELECT COUNT(*) FROM wrong_questions WHERE study_result_id = ?) < (SELECT wrong + blank FROM study_results WHERE id = ?)',
    ).bind(studyResultId, subjectId, unit, topic, imageKey, analysis, new Date().toISOString(), studyResultId, studyResultId, studyResultId).run();
    if (!inserted.meta.changes) { await env.UPLOADS.delete(imageKey); return NextResponse.json({ error: 'Bu çalışma için fotoğraf sınırına ulaşıldı.' }, { status: 409 }); }
    const thumbnail = form.get('thumbnail');
    if (thumbnail instanceof File && thumbnail.type === 'image/jpeg' && thumbnail.size <= 100 * 1024) {
      try { await env.UPLOADS.put(imageKey + '/thumbnail', await thumbnail.arrayBuffer(), { httpMetadata: { contentType: 'image/jpeg' } }); } catch { /* Önizleme hatası asıl soru kaydını engellemez. */ }
    }
    const count = studyResultId ? await env.DB.prepare('SELECT COUNT(*) AS count FROM wrong_questions WHERE study_result_id = ?').bind(studyResultId).first<{ count: number }>() : null;
    return NextResponse.json({ saved: true, analysis, analysisStatus, count: count?.count });
  } catch (error) {
    if (error instanceof Response)
      return NextResponse.json({ error: await error.text() }, { status: error.status });
    return NextResponse.json({ error: 'Soru kaydedilemedi.' }, { status: 500 });
  }
}
