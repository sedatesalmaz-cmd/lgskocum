'use client';
import { useEffect, useState } from 'react';
import { Camera, Check, ImagePlus, Sparkles, X } from 'lucide-react';
import { BookPicker } from '@/components/book-picker';
import { lgsCurriculum } from '@/lib/lgs-curriculum';
import type { Assignment } from '@/components/coach-workspace';
import { QuestionPhotoEditor } from '@/components/question-photo-editor';
export type QuestionContext = Pick<Assignment, 'subjectId' | 'book' | 'unit' | 'topic'>;
export function WrongQuestionModal({
  open,
  onClose,
  assignment,
  studyResultId,
}: {
  open: boolean;
  onClose: () => void;
  assignment?: QuestionContext | null;
  studyResultId?: number | null;
}) {
  const [file, setFile] = useState<File | null>(null),
    [preview, setPreview] = useState(''),
    [subjectId, setSubjectId] = useState('matematik'),
    [book, setBook] = useState(''),
    [analysis, setAnalysis] = useState(''),
    [saved, setSaved] = useState(false),
    [analysisAvailable, setAnalysisAvailable] = useState(false),
    [error, setError] = useState('');
  const [savedCount, setSavedCount] = useState(0),
    [photoLimit, setPhotoLimit] = useState<number | null>(null),
    [consent, setConsent] = useState(false),
    [loading, setLoading] = useState(false);
  const subject = lgsCurriculum.find((x) => x.id === subjectId)!;
  const isParagraph = subjectId === 'paragraf';
  const [unitName, setUnitName] = useState(subject.units[0]?.name ?? '');
  const unit =
    subject.units.find((x) => x.name === unitName) ?? subject.units[0];
  const [topic, setTopic] = useState(unit?.topics[0] ?? '');
  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => {
    if (!open) return;
    setSaved(false);
    setAnalysis('');
    setAnalysisAvailable(false);
    setError('');
    setFile(null); setConsent(false); setSavedCount(0); setPhotoLimit(null);
    if (studyResultId) fetch(`/api/wrong-questions?studyResultId=${studyResultId}`).then(async r => { const data = await r.json() as { count?: number; limit: number; error?: string }; if (!r.ok) throw new Error(data.error); return data; }).then(data => {
      if (typeof data.count === 'number') { setSavedCount(data.count); setPhotoLimit(data.limit); }
    }).catch(() => setError('Fotoğraf adedi alınamadı. Tekrar açmayı deneyin.'));
    if (!assignment) return;
    setSubjectId(assignment.subjectId);
    setBook(assignment.book === 'Kitap belirtilmedi' ? '' : assignment.book);
    setUnitName(assignment.unit);
    setTopic(assignment.topic);
  }, [open, assignment, studyResultId]);
  if (!open) return null;
  const chooseSubject = (id: string) => {
    const next = lgsCurriculum.find((x) => x.id === id)!;
    setSubjectId(id);
    setUnitName(next.units[0]?.name ?? '');
    setTopic(next.units[0]?.topics[0] ?? '');
    setBook('');
  };
  const chooseUnit = (name: string) => {
    const next = subject.units.find((x) => x.name === name)!;
    setUnitName(name);
    setTopic(next.topics[0]);
  };
  const submit = async () => {
    if (!file || !consent || (photoLimit !== null && savedCount >= photoLimit)) return;
    setLoading(true);
    setError('');
    const form = new FormData();
    form.append('image', file);
    for (const [key, value] of Object.entries({
      subjectId,
      subject: subject.name,
      unit: isParagraph ? '' : unitName,
      topic: isParagraph ? '' : topic,
      book: book || 'Kitap belirtilmedi',
      privacyConfirmed: 'true',
    }))
      form.append(key, value);
    if (studyResultId) form.append('studyResultId', String(studyResultId));
    try {
      const response = await fetch('/api/wrong-questions', {
        method: 'POST',
        body: form,
      });
      const data = await response.json() as { error?: string; analysis?: string; analysisStatus?: string; count?: number };
      if (!response.ok) throw new Error(data.error || 'Soru kaydedilemedi.');
      setAnalysis(data.analysis ?? '');
      setAnalysisAvailable(data.analysisStatus === 'completed');
      setSaved(true);
      setSavedCount(data.count ?? savedCount + 1);
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
            {photoLimit !== null && <p>{savedCount} / {photoLimit} soru fotoğrafı kaydedildi · yanlış + boş</p>}
          </div>
        </div>
        {saved ? (
          <div className="analysis-result">
            <span>
              <Sparkles />
            </span>
            <p className="eyebrow">
              {analysisAvailable ? 'YAPAY ZEKÂ BRANŞ KOÇU ANALİZİ' : 'YANLIŞ DEFTERİ KAYDI'}
            </p>
            <h3>
              {subject.name}{topic ? ` · ${topic}` : ''}
            </h3>
            <p>
              {analysisAvailable
                ? analysis
                : 'Fotoğraf yanlış defterine kaydedildi. Gemini analizi şu anda kullanılamıyor; koçunuz kaydı yine de görebilir.'}
            </p>
            <button onClick={onClose}>
              <Check /> Yanlış defterine kaydedildi
            </button>
            {(photoLimit === null || savedCount < photoLimit) && <button onClick={() => { setSaved(false); setFile(null); setConsent(false); }}>Sonraki sorunun fotoğrafını ekle{photoLimit !== null ? ` (${photoLimit - savedCount} kaldı)` : ''}</button>}
          </div>
        ) : (
          <>
            <div className="wrong-upload-grid">
              <div>
                {preview ? <QuestionPhotoEditor src={preview} onChange={next => { setFile(next); setConsent(false); }} /> : <label className="photo-drop">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Seçilen yanlış soru"
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
                </label>}
                {preview && <button className="rotate-photo" onClick={() => { setFile(null); setConsent(false); }}>Başka fotoğraf seç</button>}
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
                {!isParagraph && <label>
                  Ünite
                  <select value={unitName} onChange={(e) => chooseUnit(e.target.value)}>
                    {!subject.units.some(x => x.name === unitName) && <option>{unitName}</option>}
                    {subject.units.map((x) => <option key={x.name}>{x.name}</option>)}
                  </select>
                </label>}
                {!isParagraph && <label>
                  Konu
                  <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                    {!unit?.topics.includes(topic) && <option>{topic}</option>}
                    {unit?.topics.map((x) => <option key={x}>{x}</option>)}
                  </select>
                </label>}
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
                kişisel bilgi görünmüyor. Kaydı ve mümkünse Gemini analizini onaylıyorum.
              </span>
            </label>
            {error && <p className="entry-error">{error}</p>}
            {photoLimit !== null && savedCount >= photoLimit && <p className="entry-success">Bu çalışmanın tüm soru fotoğrafları kaydedildi.</p>}
            <button
              className="analyze-question"
              disabled={!file || !consent || loading || (!!studyResultId && photoLimit === null) || (photoLimit !== null && savedCount >= photoLimit)}
              onClick={submit}
            >
              <Sparkles />
              {loading
                ? 'Soru inceleniyor…'
                : 'Yanlış defterine ekle ve analiz et'}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
