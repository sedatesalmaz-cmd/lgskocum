'use client';
import { useRef, useState } from 'react';

export function QuestionPhotoEditor({ src, onChange }: { src: string; onChange: (file: File) => void }) {
  const image = useRef<HTMLImageElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 1, h: 1 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const point = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) };
  };
  const transform = async (rotate: boolean) => {
    const img = image.current;
    if (!img?.naturalWidth) return;
    setBusy(true); setError('');
    try {
      const canvas = document.createElement('canvas');
      const w = rotate ? img.naturalWidth : Math.round(img.naturalWidth * crop.w);
      const h = rotate ? img.naturalHeight : Math.round(img.naturalHeight * crop.h);
      if (w < 20 || h < 20) throw new Error('Biraz daha büyük bir alan seçin.');
      const scale = Math.min(1, 2400 / Math.max(w, h));
      canvas.width = Math.round((rotate ? h : w) * scale);
      canvas.height = Math.round((rotate ? w : h) * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Fotoğraf düzenlenemedi.');
      if (rotate) {
        ctx.translate(canvas.width, 0); ctx.rotate(Math.PI / 2);
        ctx.drawImage(img, 0, 0, w * scale, h * scale);
      } else ctx.drawImage(img, img.naturalWidth * crop.x, img.naturalHeight * crop.y, w, h, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      if (!blob) throw new Error('Fotoğraf düzenlenemedi.');
      onChange(new File([blob], 'soru.jpg', { type: 'image/jpeg' }));
      setCrop({ x: 0, y: 0, w: 1, h: 1 });
    } catch (e) { setError(e instanceof Error ? e.message : 'Fotoğraf düzenlenemedi.'); }
    finally { setBusy(false); }
  };
  return <div>
    <p>Parmağınla sorunun çevresini seç, sonra kırp.</p>
    <div style={{ position: 'relative', touchAction: 'none', overflow: 'hidden' }}
      onPointerDown={e => { start.current = point(e); e.currentTarget.setPointerCapture(e.pointerId); }}
      onPointerMove={e => { if (!start.current) return; const p = point(e), s = start.current; setCrop({ x: Math.min(p.x, s.x), y: Math.min(p.y, s.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) }); }}
      onPointerUp={() => { start.current = null; }} onPointerCancel={() => { start.current = null; }}>
      <img ref={image} src={src} alt="Kırpılacak soru fotoğrafı" draggable={false} style={{ display: 'block', width: '100%', height: 'auto' }} />
      <div style={{ position: 'absolute', pointerEvents: 'none', left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.w * 100}%`, height: `${crop.h * 100}%`, border: '3px solid #218d89', boxShadow: '0 0 0 2000px rgba(0,0,0,.25)' }} />
    </div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
      <button type="button" className="rotate-photo" disabled={busy} onClick={() => transform(false)}>Kırpmayı uygula</button>
      <button type="button" className="rotate-photo" disabled={busy} onClick={() => transform(true)}>Döndür</button>
      <button type="button" className="rotate-photo" onClick={() => setCrop({ x: 0, y: 0, w: 1, h: 1 })}>Tüm fotoğraf</button>
    </div>
    {error && <p className="entry-error">{error}</p>}
  </div>;
}
