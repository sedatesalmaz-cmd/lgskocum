'use client';
import { useEffect, useState } from 'react';
import { Camera, Check, ImagePlus, RotateCcw, Sparkles, X } from 'lucide-react';
import { BookPicker } from '@/components/book-picker';
import { lgsCurriculum } from '@/lib/lgs-curriculum';
export function WrongQuestionModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null),
    [preview, setPreview] = useState(''),
    [subjectId, setSubjectId] = useState('matematik'),
    [book, setBook] = useState(''),
    [answer, setAnswer] = useState(''),
    [correctAnswer, setCorrectAnswer] = useState(''),
    [analysis, setAnalysis] = useState(''),
    [error, setError] = useState('');
  const [rotation, setRotation] = useState(0),
    [consent, setConsent] = useState(false),
    [loading, setLoading] = useState(false);
  const subject = lgsCurriculum.find((x) => x.id === subjectId)!;
  const [unitName, setUnitName] = useState(subject.units[0].name);
  const unit =
    subject.units.find((x) => x.name === unitName) ?? subject.units[0];
  const [topic, setTopic] = useState(unit.topics[0]);
  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  if (!open) return null;
  const chooseSubject = (id: string) => {
    const next = lgsCurriculum.find((x) => x.id === id)!;
    setSubjectId(id);
    setUnitName(next.units[0].name);
    setTopic(next.units[0].topics[0]);
    setBook('');
  };
  const chooseUnit = (name: string) => {
    const next = subject.units.find((x) => x.name === name)!;
    setUnitName(name);
    setTopic(next.topics[0]);
  };
  const submit = async () => {
    if (!file || !consent) return;
    setLoading(true);
    setError('');
    const form = new FormData();
    form.append('image', file);
    for (const [key, value] of Object.entries({
      subjectId,
      subject: subject.name,
      unit: unit.name,
      topic,
      book: book || 'Kitap belirtilmedi',
      answer,
      correctAnswer,
      privacyConfirmed: 'true',
    }))
      form.append(key, value);
    try {
      const response = await fetch('/api/wrong-questions', {
        method: 'POST',
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Soru kaydedilemedi.');
      setAnalysis(data.analysis);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Soru kaydedilemedi.',
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section className="wrong-modal" role="dialog" aria-modal="true">
        <button className="close" onClick={onClose}>
          <X />
        </button>
        <div className="wrong-modal-head">
          <span>
            <Camera />
          </span>
          <div>
            <p className="eyebrow tealtext">YANLIŞ DEFTERİM</p>
            <h2>Takıldığın soruyu ekle</h2>
          </div>
        </div>
        {analysis ? (
          <div className="analysis-result">
            <span>
              <Sparkles />
            </span>
            <p className="eyebrow">YAPAY ZEKÂ BRANŞ KOÇU ANALİZİ</p>
            <h3>
              {subject.name} · {topic}
            </h3>
            <p>{analysis}</p>
            <button onClick={onClose}>
              <Check /> Yanlış defterine kaydedildi
            </button>
          </div>
        ) : (
          <>
            <div className="wrong-upload-grid">
              <div>
                <label className="photo-drop">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Seçilen yanlış soru"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    />
                  ) : (
                    <>
                      <ImagePlus />
                      <b>Fotoğraf çek veya seç</b>
                      <small>JPG, PNG veya WEBP · en fazla 6 MB</small>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                {preview && (
                  <button
                    className="rotate-photo"
                    onClick={() => setRotation((x) => (x + 90) % 360)}
                  >
                    <RotateCcw /> Döndür
                  </button>
                )}
              </div>
              <div className="wrong-fields">
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
                  <BookPicker subjectId={subjectId} value={book} onChange={setBook} />
                </label>
                <label>
                  Ünite
                  <select
                    value={unit.name}
                    onChange={(e) => chooseUnit(e.target.value)}
                  >
                    {subject.units.map((x) => (
                      <option key={x.name}>{x.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Konu
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  >
                    {unit.topics.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Benim cevabım
                  <input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Örn. B"
                  />
                </label>
                <label>
                  Doğru cevap
                  <input
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    placeholder="Örn. D"
                  />
                </label>
              </div>
            </div>
            <label className="privacy-check">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                <b>Fotoğrafı kontrol ettim.</b> Ad, okul, telefon veya başka
                kişisel bilgi görünmüyor. Gemini analizini onaylıyorum.
              </span>
            </label>
            {error && <p className="entry-error">{error}</p>}
            <button
              className="analyze-question"
              disabled={!file || !consent || loading}
              onClick={submit}
            >
              <Sparkles />
              {loading
                ? 'Soru inceleniyor…'
                : 'Analiz et ve yanlış defterine ekle'}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
