'use client';

import '@/app/admin-panel.css';
import { useEffect, useState } from 'react';
import {
  Database,
  LockKeyhole,
  RefreshCcw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Scope =
  | 'assignments'
  | 'results'
  | 'wrongQuestions'
  | 'reports'
  | 'bookProgress'
  | 'all';
type Counts = Record<Exclude<Scope, 'all'>, number>;

const sections: Array<{
  scope: Exclude<Scope, 'all'>;
  title: string;
  detail: string;
}> = [
  {
    scope: 'assignments',
    title: 'Ödevler',
    detail: 'Koç tarafından verilmiş bütün ödevler',
  },
  {
    scope: 'results',
    title: 'Çalışma girişleri',
    detail: 'Doğru, yanlış, boş ve soru sayıları',
  },
  {
    scope: 'wrongQuestions',
    title: 'Yanlış defteri',
    detail: 'Soru kayıtları, analizler ve fotoğraflar',
  },
  {
    scope: 'reports',
    title: 'Haftalık raporlar',
    detail: 'Oluşturulmuş branş ve hafta değerlendirmeleri',
  },
  {
    scope: 'bookProgress',
    title: 'Kitap–ünite ilerlemesi',
    detail: 'Tamamlandı ve tekrar gerekli kayıtları',
  },
];

export function AdminPanel({ onDataCleared }: { onDataCleared: () => void }) {
  const [state, setState] = useState<
    'loading' | 'signedOut' | 'forbidden' | 'ready'
  >('loading');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [counts, setCounts] = useState<Partial<Counts>>({});
  const [busy, setBusy] = useState<Scope | null>(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    setState('loading');
    const response = await fetch('/api/admin');
    const data = (await response.json()) as {
      authorized?: boolean;
      email?: string;
      counts?: Counts;
    };
    if (response.status === 401) return setState('signedOut');
    if (!response.ok || !data.authorized) {
      const identityResponse = await fetch('/api/whoami');
      if (identityResponse.ok) {
        const identity = (await identityResponse.json()) as {
          email?: string;
          userId?: string;
        };
        setEmail(identity.email ?? '');
        setUserId(identity.userId ?? '');
      }
      return setState('forbidden');
    }
    setEmail(data.email ?? '');
    setCounts(data.counts ?? {});
    setState('ready');
  };

  useEffect(() => {
    void load();
  }, []);

  const remove = async (scope: Scope) => {
    setBusy(scope);
    setMessage('');
    const response = await fetch('/api/admin', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope, confirmation: 'VERİLERİ SİL' }),
    });
    const data = (await response.json()) as { counts?: Counts; error?: string };
    setBusy(null);
    if (!response.ok)
      return setMessage(data.error ?? 'Silme işlemi tamamlanamadı.');
    setCounts(data.counts ?? {});
    setMessage(
      scope === 'all'
        ? 'Tüm çalışma verileri temizlendi.'
        : 'Seçilen kayıtlar temizlendi.',
    );
    onDataCleared();
  };

  if (state === 'loading')
    return (
      <div className="page admin-state">
        <RefreshCcw className="spin" /> Yönetici hesabı kontrol ediliyor…
      </div>
    );

  if (state === 'signedOut')
    return (
      <div className="page admin-state admin-login">
        <LockKeyhole />
        <p className="eyebrow">SADECE SEDAT İÇİN</p>
        <h1>Yönetici girişi</h1>
        <p>
          Bu alan çalışma verilerini kalıcı olarak silebildiği için ChatGPT
          hesabınızla korunur.
        </p>
        <a href="/signin-with-chatgpt?return_to=/" target="_top">
          ChatGPT ile yönetici girişi yap
        </a>
      </div>
    );

  if (state === 'forbidden')
    return (
      <div className="page admin-state admin-login">
        <LockKeyhole />
        <h1>Bu hesap yetkili değil</h1>
        <p>Yönetim alanı yalnızca sistem sahibinin hesabına açıktır.</p>
        {email && <p>Oturum: {email}</p>}
        {userId && <p className="admin-identity">Kimlik: {userId}</p>}
      </div>
    );

  return (
    <div className="page admin-page">
      <header className="admin-hero">
        <span>
          <ShieldCheck />
        </span>
        <div>
          <p className="eyebrow">SİSTEM YÖNETİMİ</p>
          <h1>Tüm veri kontrolü sizde.</h1>
          <p>{email} hesabıyla yönetici olarak giriş yapıldı.</p>
        </div>
      </header>

      <section className="admin-list">
        {sections.map((item) => (
          <article key={item.scope}>
            <span className="admin-data-icon">
              <Database />
            </span>
            <div>
              <h2>{item.title}</h2>
              <p>{item.detail}</p>
            </div>
            <b>{counts[item.scope] ?? 0} kayıt</b>
            <DeleteDialog
              title={`${item.title} silinsin mi?`}
              description="Bu işlem geri alınamaz. Yalnızca bu bölümdeki kayıtlar kalıcı olarak silinecek."
              busy={busy === item.scope}
              onConfirm={() => void remove(item.scope)}
            />
          </article>
        ))}
      </section>

      <section className="admin-danger">
        <div>
          <p className="eyebrow">TAM SIFIRLAMA</p>
          <h2>Tüm çalışma verilerini temizle</h2>
          <p>
            Ders, ünite ve kitap katalogları korunur. Ödevler, öğrenci
            girişleri, yanlış fotoğrafları, raporlar ve kitap ilerlemeleri
            silinir.
          </p>
        </div>
        <DeleteDialog
          title="Tüm çalışma verileri silinsin mi?"
          description="Bu işlem geri alınamaz. Ders, ünite ve kitap listeleri korunacak; öğrencinin bütün çalışma geçmişi silinecek."
          busy={busy === 'all'}
          onConfirm={() => void remove('all')}
          all
        />
      </section>
      {message && (
        <p className="admin-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

function DeleteDialog({
  title,
  description,
  busy,
  onConfirm,
  all = false,
}: {
  title: string;
  description: string;
  busy: boolean;
  onConfirm: () => void;
  all?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={all ? 'admin-reset' : 'admin-delete'}
        disabled={busy}
      >
        <Trash2 /> {busy ? 'Siliniyor…' : all ? 'Tümünü temizle' : 'Sil'}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Vazgeç</AlertDialogCancel>
          <AlertDialogAction className="admin-confirm" onClick={onConfirm}>
            Kalıcı olarak sil
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
