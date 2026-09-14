'use client';
import { useState } from 'react';
import { BookOpen, CalendarDays, Check, Trash2 } from 'lucide-react';
import { BookPicker } from '@/components/book-picker';
import { lgsCurriculum } from '@/lib/lgs-curriculum';
import { isWeeklyTestBook, unitsForBook } from '@/lib/book-units';
import { WeeklyReportPanel } from '@/components/weekly-report-panel';
export type Assignment = {
  id: number;
  dueDate: string;
  subjectId: string;
  subject: string;
  book: string;
  unit: string;
  topic: string;
  questionCount: number;
  note: string;
};
export function CoachWorkspace({
  assignments,
  onAdd,
  onDelete,
}: {
  assignments: Assignment[];
  onAdd: (item: Omit<Assignment, 'id'>) => Promise<{ assignment: Assignment | null; error?: string }>;
  onDelete: (id: number) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [subjectId, setSubjectId] = useState('matematik');
  const subject = lgsCurriculum.find((x) => x.id === subjectId)!;
  const isParagraph = subjectId === 'paragraf';
  const [unitName, setUnitName] = useState(subject.units[0]?.name ?? '');
  const [book, setBook] = useState('');
  const weeklyTest = isWeeklyTestBook(book);
  const availableUnits = unitsForBook(subjectId, book);
  const unit =
    subject.units.find((x) => x.name === unitName) ?? subject.units[0];
  const [topic, setTopic] = useState(unit?.topics[0] ?? '');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [questionCount, setQuestionCount] = useState<number | ''>(20);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const chooseSubject = (id: string) => {
    const next = lgsCurriculum.find((x) => x.id === id)!;
    setSubjectId(id);
    setUnitName(next.units[0]?.name ?? '');
    setTopic(next.units[0]?.topics[0] ?? '');
    setBook('');
  };
  const chooseUnit = (name: string) => {
    if (weeklyTest) {
      setUnitName(name);
      setTopic('Haftalık deneme');
      return;
    }
    const next = subject.units.find((x) => x.name === name)!;
    setUnitName(name);
    setTopic(next.topics[0]);
  };
  const chooseBook = (name: string) => {
    setBook(name);
    if (isParagraph) {
      setUnitName('');
      setTopic('');
      return;
    }
    const nextUnits = unitsForBook(subjectId, name);
    setUnitName(nextUnits[0] ?? subject.units[0].name);
    setTopic(
      isWeeklyTestBook(name) ? 'Haftalık deneme' : subject.units[0].topics[0],
    );
  };
  const add = async () => {
    if (questionCount === '' || questionCount < 1) {
      setMessage('Soru hedefi en az 1 olmalıdır.');
      return;
    }
    const normalizedBook = book || 'Kitap belirtilmedi';
    const duplicate = assignments.some(
      (item) =>
        item.dueDate === dueDate &&
        item.subjectId === subjectId &&
        item.book === normalizedBook &&
        item.unit === unitName &&
        item.topic === topic,
    );
    if (duplicate) {
      setMessage('Bu ödev aynı tarih, ders, kitap ve konu için zaten eklenmiş.');
      return;
    }
    setMessage('');
    const result = await onAdd({
      dueDate,
      subjectId,
      subject: subject.name,
      book: normalizedBook,
      unit: unitName,
      topic,
      questionCount,
      note,
    });
    if (!result.assignment) {
      setMessage(result.error ?? 'Ödev eklenemedi.');
      return;
    }
    setSaved(true);
    const initial = lgsCurriculum.find((item) => item.id === 'matematik')!;
    setSubjectId('matematik');
    setBook('');
    setUnitName(initial.units[0].name);
    setTopic(initial.units[0].topics[0]);
    setDueDate(new Date().toISOString().slice(0, 10));
    setQuestionCount('');
    setNote('');
    setTimeout(() => setSaved(false), 1400);
  };
  const cancelAssignment = async (id: number) => {
    if (!window.confirm('Bu ödev öğrencinin rotasından kaldırılsın mı?')) return;
    setDeletingId(id);
    setMessage('');
    const result = await onDelete(id);
    setDeletingId(null);
    setMessage(
      result.ok ? 'Ödev iptal edildi.' : result.error ?? 'Ödev iptal edilemedi.',
    );
  };
  return (
    <div className="page coach-workspace-page">
      <div className="welcome">
        <div>
          <p className="eyebrow">YETİŞKİN & KOÇ ALANI</p>
          <h1>
            Ödev ver <span>ve haftayı değerlendir.</span>
          </h1>
        </div>
        <span className="role-badge">Öğrenci yalnızca görüntüler</span>
      </div>
      <div className="coach-tools-grid">
        <section className="coach-tool-card">
          <div className="tool-title">
            <span>
              <BookOpen />
            </span>
            <div>
              <p className="eyebrow">YENİ ÖDEV</p>
              <h2>Ders planına görev ekle</h2>
            </div>
          </div>
          <div className="coach-form">
            <label>
              Ders
              <select
                value={subjectId}
                onChange={(e) => chooseSubject(e.target.value)}
              >
                {lgsCurriculum.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Kitap
              <BookPicker
                subjectId={subjectId}
                value={book}
                onChange={chooseBook}
              />
            </label>
            {!isParagraph && <label>
              Ünite
              <select value={unitName} onChange={(e) => chooseUnit(e.target.value)}>
                {availableUnits.map((name) => <option key={name}>{name}</option>)}
              </select>
            </label>}
            {!isParagraph && !weeklyTest && (
              <label>
                Konu
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  {unit?.topics.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            )}
            {isParagraph && (
              <p className="wide entry-unit">Paragraf ödevinde ünite ve konu seçilmez.</p>
            )}
            <label>
              <span>
                <CalendarDays /> Teslim günü
              </span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>
            <label>
              Soru hedefi
              <input
                type="number"
                min="1"
                value={questionCount}
                onChange={(e) =>
                  setQuestionCount(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
              />
            </label>
            <label className="wide">
              Öğretmen notu
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ödev açıklaması veya Gemini'ye sorunuz…"
              />
            </label>
          </div>
          {message && (
            <p className={message.includes('iptal edildi') ? 'entry-success' : 'entry-error'}>
              {message}
            </p>
          )}
          <button
            className={`save-entry ${saved ? 'saved' : ''}`}
            onClick={add}
          >
            {saved ? (
              <>
                <Check /> Ödev eklendi
              </>
            ) : (
              'Öğrencinin rotasına ekle'
            )}
          </button>
          <div className="assignment-list">
            <b>Eklenen ödevler</b>
            {assignments.map((x) => (
              <article key={x.id}>
                <span>{x.subject}</span>
                <div>
                  <strong>{x.topic || 'Paragraf çalışması'}</strong>
                  <small>
                    {x.book} · {x.questionCount} soru ·{' '}
                    {new Date(`${x.dueDate}T12:00:00`).toLocaleDateString(
                      'tr-TR',
                    )}
                  </small>
                </div>
                <button
                  type="button"
                  className="cancel-assignment"
                  onClick={() => void cancelAssignment(x.id)}
                  disabled={deletingId === x.id}
                  aria-label={`${x.subject} ödevini iptal et`}
                >
                  <Trash2 />
                  {deletingId === x.id ? 'İptal ediliyor…' : 'İptal et'}
                </button>
              </article>
            ))}
          </div>
        </section>
        <WeeklyReportPanel />
      </div>
    </div>
  );
}
