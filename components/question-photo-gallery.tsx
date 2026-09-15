'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { lgsCurriculum } from '@/lib/lgs-curriculum';
import '@/app/question-photo-gallery.css';
type Photo = { id: number; subjectId: string; unit: string; topic: string; book: string; studyDate: string; analysis: string | null };
function Thumbnail({ id }: { id: number }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className="photo-gallery-placeholder">Fotoğrafı aç</span> : <img src={`/api/question-photos/${id}?thumbnail=1`} loading="lazy" decoding="async" alt="Soru önizlemesi" onError={() => setFailed(true)} />;
}
export function QuestionPhotoGallery({ from, to, onClose }: { from: string; to: string; onClose: () => void }) {
  const [photos, setPhotos] = useState<Photo[]>([]), [selected, setSelected] = useState<Photo | null>(null);
  const [hasMore, setHasMore] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState(''), [imageError, setImageError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/question-photos?from=${from}&to=${to}`, { signal: controller.signal }).then(async r => {
      const d = await r.json() as { photos?: Photo[]; hasMore?: boolean; error?: string };
      if (!r.ok) throw new Error(d.error || 'Fotoğraflar alınamadı.');
      setPhotos(d.photos ?? []); setHasMore(!!d.hasMore);
    }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Fotoğraflar alınamadı.'); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [from, to]);
  const nextPage = async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`/api/question-photos?from=${from}&to=${to}&before=${photos.at(-1)?.id}`);
      const d = await r.json() as { photos?: Photo[]; hasMore?: boolean; error?: string };
      if (!r.ok) throw new Error(d.error || 'Fotoğraflar alınamadı.');
      setPhotos(current => [...current, ...(d.photos ?? [])]); setHasMore(!!d.hasMore);
    } catch (e) { setError(e instanceof Error ? e.message : 'Fotoğraflar alınamadı.'); }
    finally { setLoading(false); }
  };
  const name = (p: Photo) => lgsCurriculum.find(x => x.id === p.subjectId)?.name ?? p.subjectId;
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="question-photo-gallery" showCloseButton={false}>
    <div className="photo-gallery-heading"><DialogTitle>Soru fotoğrafları</DialogTitle><DialogClose className="photo-gallery-button">Kapat</DialogClose></div>
    <DialogDescription>{from} – {to} · Fotoğrafa dokunarak açın. Yeni yapay zekâ sorgusu yapılmaz.</DialogDescription>
    {selected ? <div>
      <button className="photo-gallery-button" onClick={() => setSelected(null)}>← Galeriye dön</button>
      <h3>{name(selected)} · {selected.topic || 'Soru çalışması'}</h3><p>{selected.studyDate} · {selected.book} · {selected.unit}</p>
      <div className="photo-gallery-detail">
        {imageError ? <p role="alert">Fotoğraf yüklenemedi. Galeriye dönüp tekrar deneyin.</p> : <img src={`/api/question-photos/${selected.id}`} alt={`${name(selected)} soru fotoğrafı`} onError={() => setImageError(true)} />}
        <aside><h3>Kayıtlı analiz</h3><p>{selected.analysis || 'Bu soru için henüz Gemini analizi bulunmuyor. Fotoğraf kaydı mevcut.'}</p></aside>
      </div>
    </div> : <>
      <div className="photo-gallery-grid">{photos.map(p => <button key={p.id} className="photo-gallery-tile" onClick={() => { setSelected(p); setImageError(false); }}>
        <Thumbnail id={p.id} /><b>{name(p)}</b><span>{p.topic || 'Soru çalışması'}</span><small>{p.studyDate} · {p.book}</small>
      </button>)}</div>
      {!loading && !photos.length && !error && <p>Bu haftaya bağlı soru fotoğrafı bulunmuyor.</p>}
      {hasMore && <button className="photo-gallery-button" disabled={loading} onClick={nextPage}>Diğer fotoğrafları göster</button>}
    </>}
    {loading && <p role="status">Fotoğraflar yükleniyor…</p>}{error && <p role="alert">{error}</p>}
  </DialogContent></Dialog>;
}
