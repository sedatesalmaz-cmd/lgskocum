import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { requireMember } from '@/lib/server-auth';
import { lgsCurriculum } from '@/lib/lgs-curriculum';
import { reportWeek } from '@/lib/report-week';
const db = (env as unknown as { DB: D1Database }).DB;
type Stats = { subjectId: string; solved: number; correct: number; wrong: number; blank: number; topics: string | null; topicCount: number };
type Branch = { subject: string; report: string };
function dates(start: unknown, end: unknown) {
  if (typeof start !== 'string' || typeof end !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) throw new Error('Geçerli hafta tarihleri seçin.');
  const week = reportWeek(start);
  if (week.weekStart !== start || week.weekEnd !== end) throw new Error('Hafta pazartesi başlayıp pazar bitmelidir.');
  return week;
}
async function loadStats(start: string, end: string) {
  const rows = await db.prepare('SELECT subject_id subjectId, SUM(total) solved, SUM(correct) correct, SUM(wrong) wrong, SUM(blank) blank, GROUP_CONCAT(DISTINCT topic) topics, COUNT(DISTINCT NULLIF(topic, ?)) topicCount FROM study_results WHERE study_date BETWEEN ? AND ? GROUP BY subject_id').bind('', start, end).all<Stats>();
  const photos = await db.prepare('SELECT COUNT(*) count FROM wrong_questions w JOIN study_results s ON s.id = w.study_result_id WHERE s.study_date BETWEEN ? AND ?').bind(start, end).first<{ count: number }>();
  return { subjects: rows.results, photoCount: Number(photos?.count ?? 0) };
}
async function askGemini(key: string, prompt: string) {
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: .2, maxOutputTokens: 500 } }), signal: AbortSignal.timeout(20000),
  });
  if (!r.ok) throw new Error('Gemini kullanılamıyor.');
  const data = await r.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = data.candidates?.[0]?.content?.parts?.map(p => p.text ?? '').join('').trim();
  if (!text) throw new Error('Gemini yanıtı boş.');
  return text;
}
function fail(error: unknown) {
  if (error instanceof Response) return NextResponse.json({ error: error.status === 401 ? 'Giriş gerekli.' : 'Bu işlem için yetkiniz yok.' }, { status: error.status });
  return NextResponse.json({ error: error instanceof Error ? error.message : 'Haftalık veriler alınamadı.' }, { status: 500 });
}
export async function GET(request: Request) {
  try {
    await requireMember(request, db, ['guardian', 'coach']);
    const p = new URL(request.url).searchParams;
    const { weekStart, weekEnd } = dates(p.get('weekStart'), p.get('weekEnd'));
    const stats = await loadStats(weekStart, weekEnd);
    const report = await db.prepare('SELECT status, branch_reports branchReports, general_summary generalSummary, created_at createdAt FROM weekly_reports WHERE week_start = ? AND week_end = ? ORDER BY id DESC LIMIT 1').bind(weekStart, weekEnd).first<{ status: string; branchReports: string; generalSummary: string; createdAt: string }>();
    return NextResponse.json({ ...stats, report: report ? { ...report, branchReports: JSON.parse(report.branchReports) } : null });
  } catch (error) { return fail(error); }
}
export async function POST(request: Request) {
  try {
    await requireMember(request, db, ['guardian', 'coach']);
    const body = await request.json() as { weekStart?: string; weekEnd?: string };
    const { weekStart, weekEnd } = dates(body.weekStart, body.weekEnd);
    const stats = await loadStats(weekStart, weekEnd);
    if (!stats.subjects.length) return NextResponse.json({ error: 'Bu hafta için henüz çalışma girişi bulunmuyor.' }, { status: 409 });
    const totals = stats.subjects.reduce((a, s) => ({ solved: a.solved + s.solved, correct: a.correct + s.correct, wrong: a.wrong + s.wrong, blank: a.blank + s.blank }), { solved: 0, correct: 0, wrong: 0, blank: 0 });
    let branchReports: Branch[] = stats.subjects.map(s => ({ subject: lgsCurriculum.find(x => x.id === s.subjectId)?.name ?? s.subjectId, report: s.solved + ' soru: ' + s.correct + ' doğru, ' + s.wrong + ' yanlış, ' + s.blank + ' boş. Doğruluk %' + Math.round(s.correct / s.solved * 100) + '. Çalışılan konular: ' + (s.topics || 'Ünitesiz çalışma') + '. Bu sayılar tek başına konuya hazır olunduğunu kanıtlamaz.' }));
    let generalSummary = weekStart + '–' + weekEnd + ': ' + totals.solved + ' soru çözüldü; ' + totals.correct + ' doğru, ' + totals.wrong + ' yanlış, ' + totals.blank + ' boş. Bu girişlere bağlı ' + stats.photoCount + ' soru fotoğrafı var. Bu rapor istatistik özetidir; yapay zekâ değerlendirmesi değildir.';
    let status = 'statistical';
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      try {
        const analyses = await db.prepare('SELECT w.subject_id subjectId, w.topic, w.analysis FROM wrong_questions w JOIN study_results s ON s.id = w.study_result_id WHERE s.study_date BETWEEN ? AND ? AND w.analysis IS NOT NULL ORDER BY w.id DESC LIMIT 20').bind(weekStart, weekEnd).all<{ subjectId: string; topic: string; analysis: string }>();
        const aiBranches: Branch[] = [];
        for (const s of stats.subjects) {
          const subject = lgsCurriculum.find(x => x.id === s.subjectId)?.name ?? s.subjectId;
          const report = await askGemini(key, 'Anonim LGS branş değerlendirmesi. Kişisel bilgi kullanma, veri dışı çıkarım, tanı veya başarı garantisi verme. En fazla 100 kelime: güçlü yön, pekiştirme ihtiyacı, gelecek haftanın ölçülebilir önerisi. Ders: ' + subject + '. Sonuçlar: ' + JSON.stringify(s) + '. Kaydedilmiş soru analizleri (en fazla 20 soruluk örneklem): ' + JSON.stringify(analyses.results.filter(x => x.subjectId === s.subjectId).map(x => ({ topic: x.topic, analysis: x.analysis.slice(0, 1000) }))) + '. Analiz edilmemiş soruların içeriği bilinmiyor.');
          aiBranches.push({ subject, report });
        }
        const general = await askGemini(key, 'Anonim branş raporlarını veli ve gerçek koç için en fazla 170 kelimelik haftalık rapora dönüştür. Veri dışı çıkarım yapma. İlerleme, iki öncelik ve gelecek haftanın dengesi. ' + JSON.stringify(aiBranches));
        branchReports = aiBranches; generalSummary = general; status = 'ai';
      } catch { /* Gemini kullanılamazsa istatistik özeti sunulur. */ }
    }
    const createdAt = new Date().toISOString();
    await db.prepare('INSERT INTO weekly_reports (week_start, week_end, status, branch_reports, general_summary, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(weekStart, weekEnd, status, JSON.stringify(branchReports), generalSummary, createdAt).run();
    return NextResponse.json({ weekStart, weekEnd, status, branchReports, generalSummary, createdAt });
  } catch (error) { return fail(error); }
}
