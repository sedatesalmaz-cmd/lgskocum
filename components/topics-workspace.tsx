'use client';

import { useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { BookPicker } from '@/components/book-picker';
import { lgsCurriculum } from '@/lib/lgs-curriculum';

type Entry = {
  id: number;
  date: string;
  subject: string;
  unit: string;
  topic: string;
  book: string;
  total: number;
  correct: number;
  wrong: number;
  blank: number;
};

export function TopicsWorkspace() {
  const [subjectId, setSubjectId] = useState('matematik');
  const subject = lgsCurriculum.find((item) => item.id === subjectId)!;
  const [unitName, setUnitName] = useState('');
  const unit = subject.units.find((item) => item.name === unitName);
  const [topic, setTopic] = useState('');
  const [book, setBook] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [total, setTotal] = useState(20);
  const [wrong, setWrong] = useState(0);
  const [blank, setBlank] = useState(0);
  const [entries, setEntries] = useState<Entry[]>([]);
  const correct = Math.max(0, total - wrong - blank);
  const selectedCount = useMemo(
    () =>
      entries
        .filter((entry) => entry.subject === subject.name)
        .reduce((sum, entry) => sum + entry.total, 0),
    [entries, subject.name],
  );

  const chooseSubject = (id: string) => {
    setSubjectId(id);
    setUnitName('');
    setTopic('');
    setBook('');
  };

  const chooseUnit = (name: string) => {
    if (unitName === name) {
      setUnitName('');
      setTopic('');
      return;
    }
    setUnitName(name);
    setTopic('');
  };

  const saveEntry = () => {
    if (!unit || !topic || total < 1 || wrong + blank > total) return;
    setEntries((current) => [
      {
        id: Date.now(),
        date,
        subject: subject.name,
        unit: unit.name,
        topic,
        book: book || 'Kitap seçilmedi',
        total,
        correct,
        wrong,
        blank,
      },
      ...current,
    ]);
  };

  return (
    <div className="page topics-page">
      <div className="welcome topics-welcome">
        <div>
          <p className="eyebrow">MEB 8. SINIF KONU HARİTASI</p>
          <h1>
            Konularım <span>adım adım ilerliyor.</span>
          </h1>
        </div>
        <div className="topic-total">
          <b>{selectedCount}</b>
          <span>bu oturumda eklenen soru</span>
        </div>
      </div>

      <div className="subject-picker" aria-label="Dersler">
        {lgsCurriculum.map((item) => (
          <button
            key={item.id}
            className={item.id === subjectId ? 'selected' : ''}
            style={{ '--subject': item.color } as React.CSSProperties}
            onClick={() => chooseSubject(item.id)}
          >
            <span>{item.icon}</span>
            <b>{item.shortName}</b>
            <small>{item.units.length} bölüm</small>
          </button>
        ))}
      </div>

      <div className="topics-layout">
        <section className="curriculum-panel">
          <div className="topic-panel-head">
            <div>
              <p className="eyebrow">{subject.name.toUpperCase()}</p>
              <h2>Ünite ve konular</h2>
            </div>
            <span>
              {subject.units.reduce((sum, item) => sum + item.topics.length, 0)}{' '}
              konu
            </span>
          </div>
          <div className="unit-list">
            {subject.units.map((item) => (
              <article
                key={item.name}
                className={item.name === unitName ? 'open' : ''}
              >
                <button
                  className="unit-button"
                  onClick={() => chooseUnit(item.name)}
                >
                  <span>
                    <b>{item.name}</b>
                    <small>{item.topics.length} konu</small>
                  </span>
                  <ChevronRight />
                </button>
                {item.name === unitName && (
                  <div className="topic-list">
                    {item.topics.map((itemTopic) => (
                      <button
                        key={itemTopic}
                        className={itemTopic === topic ? 'active' : ''}
                        onClick={() => setTopic(itemTopic)}
                      >
                        <i>{itemTopic === topic && <Check />}</i>
                        <span>{itemTopic}</span>
                        <small>
                          {entries
                            .filter((entry) => entry.topic === itemTopic)
                            .reduce((sum, entry) => sum + entry.total, 0)}{' '}
                          soru
                        </small>
                      </button>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {unit && topic ? <aside className="entry-panel">
          <span
            className="entry-icon"
            style={{ background: `${subject.color}18`, color: subject.color }}
          >
            {subject.icon}
          </span>
          <p className="eyebrow">GEÇMİŞ VEYA BUGÜNKÜ ÇALIŞMA</p>
          <h2>{topic}</h2>
          <p className="entry-unit">
            {subject.name} · {unit.name}
          </p>
          <label>
            <span>
              <CalendarDays /> Çalışma tarihi
            </span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
          <label>
            <span>
              <BookOpen /> Kullanılan kitap
            </span>
            <BookPicker subjectId={subjectId} value={book} onChange={setBook} />
          </label>
          <div className="entry-numbers">
            <NumberField label="Toplam" value={total} onChange={setTotal} />
            <NumberField label="Yanlış" value={wrong} onChange={setWrong} />
            <NumberField label="Boş" value={blank} onChange={setBlank} />
          </div>
          <div className="entry-result">
            <span>Doğru</span>
            <b>{correct}</b>
            <span>Net</span>
            <b>{(correct - wrong / 3).toFixed(2)}</b>
          </div>
          {wrong + blank > total && (
            <p className="entry-error">
              Yanlış ve boş toplamı, toplam soru sayısını aşamaz.
            </p>
          )}
          <button
            className="save-entry"
            onClick={saveEntry}
            disabled={wrong + blank > total || total < 1}
          >
            <Plus /> Çalışmayı ekle
          </button>
        </aside> : <aside className="entry-panel entry-panel-empty">
          <span className="entry-icon" style={{ background: `${subject.color}18`, color: subject.color }}>{subject.icon}</span>
          <p className="eyebrow">ÇALIŞMA GİRİŞİ</p>
          <h2>Önce bir konu seç</h2>
          <p className="entry-unit">Üniteyi aç, çalıştığın konuya dokun. Giriş alanı burada hazır olacak.</p>
        </aside>}
      </div>

      {entries.length > 0 && (
        <section className="recent-entries">
          <div className="topic-panel-head">
            <div>
              <p className="eyebrow">YENİ EKLENENLER</p>
              <h2>Çalışma geçmişi</h2>
            </div>
          </div>
          {entries.slice(0, 5).map((entry) => (
            <article key={entry.id}>
              <span>
                {new Date(`${entry.date}T12:00:00`).toLocaleDateString(
                  'tr-TR',
                  { day: 'numeric', month: 'short' },
                )}
              </span>
              <div>
                <b>{entry.topic}</b>
                <small>
                  {entry.subject} · {entry.book}
                </small>
              </div>
              <strong>{entry.total} soru</strong>
              <em>
                {entry.correct}D · {entry.wrong}Y · {entry.blank}B
              </em>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(Math.max(0, Number(event.target.value)))}
      />
    </label>
  );
}
