'use client';
import '@/app/weekly-report-fixes.css';
import { useCallback, useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, Sparkles } from 'lucide-react';
import { lgsCurriculum } from '@/lib/lgs-curriculum';
import { currentReportDate, reportWeek } from '@/lib/report-week';
import { QuestionPhotoGallery } from '@/components/question-photo-gallery';
type Stats = { subjectId: string; solved: number; correct: number; wrong: number; blank: number; topicCount: number };
type Report = { status: string; generalSummary: string; branchReports: Array<{ subject: string; report: string }>; createdAt: string };
type WeeklyData = { subjects: Stats[]; photoCount: number; report: Report | null; error?: string };
export function WeeklyReportPanel() {
  const [date, setDate] = useState(currentReportDate);
  const { weekStart, weekEnd } = reportWeek(date);
  const [data, setData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/weekly-report?weekStart=' + weekStart + '&weekEnd=' + weekEnd);
      const d = await r.json() as WeeklyData;
      if (!r.ok) throw new Error(d.error || 'Haftalık veriler alınamadı.');
      setData(d); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Haftalık veriler alınamadı.'); }
  }, [weekStart, weekEnd]);
  useEffect(() => {
    setData(null);
    let active = true;
    const load = async () => {
      try {
        const r = await fetch('/api/weekly-report?weekStart=' + weekStart + '&weekEnd=' + weekEnd);
        const d = await r.json() as WeeklyData;
        if (!r.ok) throw new Error(d.error || 'Haftalık veriler alınamadı.');
        if (active) { setData(d); setError(''); }
      } catch (e) { if (active) setError(e instanceof Error ? e.message : 'Haftalık veriler alınamadı.'); }
    };
    void load();
    const tick = () => { if (document.visibilityState === 'visible') void load(); };
    const timer = window.setInterval(tick, 30000);
    window.addEventListener('focus', tick);
    return () => { active = false; clearInterval(timer); window.removeEventListener('focus', tick); };
  }, [weekStart, weekEnd]);
  const closeWeek = async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch('/api/weekly-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ weekStart, weekEnd }) });
      const report = await r.json() as Report & { error?: string };
      if (!r.ok) throw new Error(report.error || 'Rapor oluşturulamadı.');
      setData(current => current ? { ...current, report } : null);
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Rapor oluşturulamadı.'); }
    finally { setLoading(false); }
  };
  const totals = (data?.subjects ?? []).reduce((a, s) => ({ solved: a.solved + s.solved, correct: a.correct + s.correct, topics: a.topics + s.topicCount }), { solved: 0, correct: 0, topics: 0 });
  const accuracy = totals.solved ? Math.round(totals.correct / totals.solved * 100) : 0;
  const report = data?.report;
  const format = (value: string) => new Date(value + 'T12:00:00Z').toLocaleDateString('tr-TR', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });
  return <section className="weekly-ai-card">
    <div className="weekly-ai-head"><span><BarChart3 /></span><div>
      <p className="eyebrow">HAFTALIK DEĞERLENDİRME · {data ? totals.solved ? 'GÜNCEL VERİLER' : 'HENÜZ GİRİŞ YOK' : 'YÜKLENİYOR'}</p>
      <h2>Hafta bir bakışta</h2>
    </div></div>
    <label className="weekly-report-date"><span>Haftadan bir gün seç</span>
      <input type="date" value={date} disabled={loading} onChange={e => { if (e.target.value) setDate(e.target.value); }} />
    </label>
    <p>{format(weekStart)} – {format(weekEnd)} · Pazartesi–Pazar</p>
    <section className="coach-kpis">
      <article><span>Çözülen soru</span><b>{data ? totals.solved : '—'}</b></article>
      <article className="success"><span>Doğruluk</span><b>{data ? '%' + accuracy : '—'}</b><small>Doğru / toplam soru</small></article>
      <article><span>Çalışılan konu</span><b>{data ? totals.topics : '—'}</b><small>Hazır oluş puanı değildir</small></article>
      <article><button className="photo-gallery-open" disabled={!data} onClick={() => setGalleryOpen(true)}><span>Soru fotoğrafı</span><b>{data ? data.photoCount : '—'}</b><small>Fotoğrafları gör</small></button></article>
    </section>
    <div className="branch-reports">
      {lgsCurriculum.map(subject => {
        const s = data?.subjects.find(x => x.subjectId === subject.id);
        return <details key={subject.id}><summary>{subject.name} · {s ? s.solved + ' soru' : data ? 'Giriş yok' : '—'}</summary>
          {s && <p>{s.correct} doğru · {s.wrong} yanlış · {s.blank} boş · Doğruluk %{Math.round(s.correct / s.solved * 100)}</p>}
        </details>;
      })}
    </div>
    <p>Sayılar girişlerle güncellenir. Değerlendirme raporu aşağıdaki düğmeyle hazırlanır; kayıtlar silinmez ve yeni girişler engellenmez.</p>
    <div className="report-scope"><CheckCircle2 /> Ad ve profil fotoğrafı gönderilmez</div>
    <div className="coach-actions">
      <button className="close-week" onClick={closeWeek} disabled={loading || !data || totals.solved === 0}><Sparkles />{loading ? 'Hafta değerlendiriliyor…' : 'Haftayı kapat ve rapor oluştur'}</button>
      <button onClick={refresh} disabled={loading}>Verileri yenile</button>
    </div>
    {error && <p className="ai-error" role="alert">{error}</p>}
    {report && <div className="weekly-report">
      <p className="eyebrow">{report.status === 'ai' ? 'YAPAY ZEKÂ KOÇ RAPORU' : 'İSTATİSTİK ÖZETİ · GEMINI KULLANILAMADI'}</p>
      <h3>{format(weekStart)} – {format(weekEnd)}</h3>
      <p>{report.generalSummary}</p>
      <small>{new Date(report.createdAt).toLocaleString('tr-TR')} tarihinde oluşturuldu. Sonradan giriş yapıldıysa raporu yeniden oluşturun.</small>
      <div className="branch-reports">{report.branchReports.map(item => <details key={item.subject}><summary>{item.subject} değerlendirmesi</summary><p>{item.report}</p></details>)}</div>
    </div>}
    {galleryOpen && <QuestionPhotoGallery key={weekStart} from={weekStart} to={weekEnd} onClose={() => setGalleryOpen(false)} />}
  </section>;
}
