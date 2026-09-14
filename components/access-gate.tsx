'use client';
import '@/app/access-gate.css';
import { useEffect, useState } from 'react';
import { KeyRound } from 'lucide-react';
export type UserSession = { username: string; role: 'student' | 'coach' | 'admin' };
export function AccessGate({ onAuthenticated }: { onAuthenticated: (session: UserSession) => void }) {
  const [ready, setReady] = useState(false), [username, setUsername] = useState(''), [password, setPassword] = useState(''), [error, setError] = useState('');
  useEffect(() => { fetch('/api/access').then((response) => response.json()).then((data: { authorized?: boolean; username?: string; role?: UserSession['role'] }) => { if (data.authorized && data.username && data.role) onAuthenticated({ username: data.username, role: data.role }); setReady(true); }).catch(() => setReady(true)); }, [onAuthenticated]);
  const enter = async () => { setError(''); const response = await fetch('/api/access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) }); const data = await response.json() as { error?: string; username?: string; role?: UserSession['role'] }; if (!response.ok || !data.username || !data.role) return setError(data.error ?? 'Giriş yapılamadı.'); onAuthenticated({ username: data.username, role: data.role }); };
  if (!ready) return <div className="access-gate"><section><p>Giriş kontrol ediliyor…</p></section></div>;
  return <div className="access-gate"><section><span><KeyRound /></span><p className="eyebrow">GÜVENLİ GİRİŞ</p><h1>Rota’ya hoş geldiniz</h1><p>Kendi kullanıcı adınız ve şifrenizle giriş yapın.</p><input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Kullanıcı adı" autoComplete="username" autoFocus /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void enter()} placeholder="Şifre" autoComplete="current-password" />{error && <small>{error}</small>}<button onClick={enter}>Giriş yap</button></section></div>;
}
