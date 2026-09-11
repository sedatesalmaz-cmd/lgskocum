'use client';
import '@/app/progress-dashboard.css';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  RefreshCcw,
  Save,
  Target,
  TrendingUp,
  Medal,
  Trophy,
} from 'lucide-react';
import { weeklyProgress, type WeeklyProgress } from '@/lib/deniz-history';
import { bookCatalog, booksForSubject } from '@/lib/book-catalog';
import { lgsCurriculum } from '@/lib/lgs-curriculum';
import { unitsForBook } from '@/lib/book-units';
type ProgressItem = {
  id: number;
  subjectId: string;
  subject: string;
  book: string;
  unit: string;
  status: 'in_progress' | 'completed' | 'review_needed';
  progress: number;
  updatedBy: string;
  updatedAt: string;
};
const subjectOrder = [
  'Paragraf',
  'Türkçe',
  'Matematik',
  'Fen Bilimleri',
  'İnkılap',
  'Din Kültürü',
  'İngilizce',
];
const colors: Record<string, string> = {
  Paragraf: '#e96f5d',
  Türkçe: '#ef725f',
  Matematik: '#7357c7',
  'Fen Bilimleri': '#238e89',
  İnkılap: '#d59a22',
  'Din Kültürü': '#5377c6',
  İngilizce: '#a2589e',
};
const labels = {
  in_progress: 'Devam ediyor',
  completed: 'Tamamlandı',
  review_needed: 'Tekrar gerekli',
};
const pct = (solved: number, target: number) =>
  target ? Math.round((solved / target) * 100) : 0;
type LiveProgressRow = {
  date: string;
  subject: string;
  target?: number;
  solved?: number;
};
const weekStartFor = (value: string) => {
  const date = new Date(`${value}T12:00:00Z`);
  const daysFromFriday = (date.getUTCDay() - 5 + 7) % 7;
  date.setUTCDate(date.getUTCDate() - daysFromFriday);
  return date.toISOString().slice(0, 10);
};
const addDays = (value: string, days: number) => {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};
const weekLabel = (start: string) => {
  const end = addDays(start, 6);
  const first = new Date(`${start}T12:00:00`).toLocaleDateString('tr-TR', {
    day: 'numeric',
  });
  const last = new Date(`${end}T12:00:00`).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  });
  return `${first}–${last}`;
};
const normalizeSubject = (name: string) => {
  if (name.includes('İnkılap')) return 'İnkılap';
  if (name.includes('Din Kültürü')) return 'Din Kültürü';
  if (name.includes('Fen')) return 'Fen Bilimleri';
  return name;
};
export function ProgressDashboard({ canEdit = false }: { canEdit?: boolean }) {
  const [items, setItems] = useState<ProgressItem[]>([]),
    [liveWeeks, setLiveWeeks] = useState<WeeklyProgress[]>([]),
    [loading, setLoading] = useState(true),
    [subjectId, setSubjectId] = useState('matematik'),
    [book, setBook] = useState(''),
    [unit, setUnit] = useState(''),
    [status, setStatus] = useState<ProgressItem['status']>('in_progress'),
    [progress, setProgress] = useState(50),
    [saved, setSaved] = useState(false);
  const subject = lgsCurriculum.find((x) => x.id === subjectId)!;
  const load = () => {
    setLoading(true);
    fetch('/api/book-progress')
      .then((r) => r.json())
      .then((d: { items?: ProgressItem[] }) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  useEffect(() => {
    fetch('/api/progress-summary')
      .then((r) => r.json())
      .then(
        (data: { targets?: LiveProgressRow[]; solved?: LiveProgressRow[] }) => {
          const weeks = new Map<string, WeeklyProgress>();
          const getWeek = (date: string) => {
            const start = weekStartFor(date);
            if (!weeks.has(start))
              weeks.set(start, {
                start,
                end: addDays(start, 6),
                label: weekLabel(start),
                subjects: {},
              });
            return weeks.get(start)!;
          };
          for (const row of data.targets ?? []) {
            const week = getWeek(row.date);
            const subjectName = normalizeSubject(row.subject);
            const current = week.subjects[subjectName] ?? {
              target: 0,
              solved: 0,
            };
            current.target += Number(row.target ?? 0);
            week.subjects[subjectName] = current;
          }
          for (const row of data.solved ?? []) {
            const week = getWeek(row.date);
            const subjectName = normalizeSubject(row.subject);
            const current = week.subjects[subjectName] ?? {
              target: 0,
              solved: 0,
            };
            current.solved += Number(row.solved ?? 0);
            week.subjects[subjectName] = current;
          }
          setLiveWeeks(
            [...weeks.values()].sort((a, b) => a.start.localeCompare(b.start)),
          );
        },
      )
      .catch(() => setLiveWeeks([]));
  }, []);
  const allWeeks = useMemo(
    () => [
      ...weeklyProgress,
      ...liveWeeks.filter(
        (week) => !weeklyProgress.some((past) => past.start === week.start),
      ),
    ],
    [liveWeeks],
  );
  const totals = useMemo(
    () =>
      subjectOrder.map((name) => {
        const rows = allWeeks.map((w) => w.subjects[name]).filter(Boolean);
        const target = rows.reduce((s, x) => s + x.target, 0),
          solved = rows.reduce((s, x) => s + x.solved, 0);
        return { name, target, solved, rate: pct(solved, target) };
      }),
    [allWeeks],
  );
  const save = async () => {
    if (!book || !unit) return;
    const response = await fetch('/api/book-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId,
        subject: subject.shortName,
        book,
        unit,
        status,
        progress,
      }),
    });
    if (response.ok) {
      setSaved(true);
      await load();
      setTimeout(() => setSaved(false), 1200);
    }
  };
  const tabs = bookCatalog.map((x) => x.subjectId);
  const shown = items.filter((x) => x.subjectId === subjectId);
  const completedBooks = [
    ...new Set(items.map((x) => `${x.subjectId}|||${x.book}`)),
  ].flatMap((key) => {
    const [id, name] = key.split('|||');
    const required = unitsForBook(id, name);
    const rows = items.filter((x) => x.subjectId === id && x.book === name);
    return required.length > 0 &&
      required.every((unitName) =>
        rows.some((row) => row.unit === unitName && row.status === 'completed'),
      )
      ? [
          {
            subjectId: id,
            book: name,
            completedAt:
              rows
                .map((x) => x.updatedAt)
                .sort()
                .at(-1) ?? '',
          },
        ]
      : [];
  });
  const unitOptions = unitsForBook(subjectId, book);
  return (
    <div className="page progress-page">
      <div className="welcome">
        <div>
          <p className="eyebrow">SİSTEM İÇİ KALICI VERİ</p>
          <h1>
            Çalışma geçmişi <span>ders ders ilerliyor.</span>
          </h1>
        </div>
      </div>
      <section className="progress-summary">
        {totals.map((item) => (
          <article key={item.name}>
            <span
              style={{
                background: `${colors[item.name]}18`,
                color: colors[item.name],
              }}
            >
              <Target />
            </span>
            <div>
              <small>{item.name}</small>
              <b>
                {item.solved} / {item.target}
              </b>
              <em>%{item.rate} tamamlandı</em>
            </div>
            <i>
              <u
                style={{
                  width: `${Math.min(item.rate, 100)}%`,
                  background: colors[item.name],
                }}
              />
            </i>
          </article>
        ))}
      </section>
      <section className="weekly-card">
        <div className="progress-title">
          <div>
            <p className="eyebrow">HAFTALIK SORU SAYISI</p>
            <h2>Hedef ve bitirme oranı</h2>
          </div>
          <TrendingUp />
        </div>
        <div className="weekly-table">
          <div className="weekly-head">
            <span>Hafta</span>
            {subjectOrder.map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
          {allWeeks.map((week) => (
            <div className="weekly-row" key={week.start}>
              <strong>{week.label}</strong>
              {subjectOrder.map((name) => {
                const item = week.subjects[name];
                return (
                  <span key={name} className={!item ? 'muted' : ''}>
                    {item ? (
                      <>
                        <b>
                          {item.solved}/{item.target}
                        </b>
                        <small>%{pct(item.solved, item.target)}</small>
                      </>
                    ) : (
                      '—'
                    )}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </section>
      {!canEdit && completedBooks.length > 0 && (
        <section className="book-award">
          <span>
            <Medal />
          </span>
          <div>
            <p className="eyebrow">BÜYÜK BAŞARI</p>
            <h2>Bir kitabı daha tamamladın!</h2>
            <p>
              <b>{completedBooks.at(-1)?.book}</b> artık başarı koleksiyonunda.
              Disiplinin seni hedefe taşıyor!
            </p>
          </div>
          <Trophy />
        </section>
      )}
      {canEdit && completedBooks.length > 0 && (
        <section className="completed-book-log">
          <div className="progress-title">
            <div>
              <p className="eyebrow">TAMAMLANAN KİTAPLAR</p>
              <h2>Başarı kayıtları</h2>
            </div>
            <Medal />
          </div>
          {completedBooks.map((item) => (
            <article key={`${item.subjectId}-${item.book}`}>
              <CheckCircle2 />
              <span>
                <b>{item.book}</b>
                <small>
                  {lgsCurriculum.find((x) => x.id === item.subjectId)?.name} ·{' '}
                  {item.completedAt
                    ? new Date(item.completedAt).toLocaleDateString('tr-TR')
                    : 'Tamamlandı'}
                </small>
              </span>
            </article>
          ))}
        </section>
      )}
      <section className="books-card">
        <div className="progress-title">
          <div>
            <p className="eyebrow">KİTAP–ÜNİTE TAKİBİ</p>
            <h2>Tamamlanan çalışmalar</h2>
          </div>
          <BookOpen />
        </div>
        <div className="progress-tabs">
          {tabs.map((id) => {
            const s = lgsCurriculum.find((x) => x.id === id)!;
            return (
              <button
                key={id}
                className={id === subjectId ? 'active' : ''}
                onClick={() => {
                  setSubjectId(id);
                  setBook('');
                  setUnit('');
                }}
              >
                {s.shortName}
              </button>
            );
          })}
        </div>
        {canEdit && (
          <div className="progress-editor">
            <label>
              Kitap
              <select
                value={book}
                onChange={(e) => {
                  setBook(e.target.value);
                  setUnit('');
                }}
              >
                <option value="">Kitap seçin</option>
                {booksForSubject(subjectId).map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              Ünite
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="">Ünite seçin</option>
                {unitOptions.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
            <label>
              Durum
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as ProgressItem['status'])
                }
              >
                {Object.entries(labels).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            {status === 'in_progress' && (
              <label>
                İlerleme %
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                />
              </label>
            )}
            <button disabled={!book || !unit} onClick={save}>
              <Save />
              {saved ? 'Kaydedildi' : 'Durumu kaydet'}
            </button>
          </div>
        )}{' '}
        {loading ? (
          <p className="progress-loading">Kayıtlar yükleniyor…</p>
        ) : shown.length === 0 ? (
          <p className="progress-loading">
            Bu ders için henüz kitap–ünite kaydı yok.
          </p>
        ) : (
          <div className="book-grid">
            {[...new Set(shown.map((x) => x.book))].map((bookName) => (
              <article key={bookName}>
                <h3>{bookName}</h3>
                <div className="completion-list">
                  {shown
                    .filter((x) => x.book === bookName)
                    .map((row) => (
                      <span
                        key={row.unit}
                        className={`progress-state ${row.status}`}
                      >
                        {row.status === 'completed' ? (
                          <CheckCircle2 />
                        ) : (
                          <RefreshCcw />
                        )}
                        <span>
                          {row.unit}
                          <small>
                            {labels[row.status]}
                            {row.status === 'in_progress'
                              ? ` · %${row.progress}`
                              : ''}
                          </small>
                        </span>
                      </span>
                    ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
