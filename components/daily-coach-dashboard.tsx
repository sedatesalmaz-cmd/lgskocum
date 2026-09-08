'use client';

import {useEffect,useMemo,useState} from 'react';
import {AlertTriangle,Bell,BookOpen,CalendarDays,CheckCircle2,Sparkles,Target,TrendingUp} from 'lucide-react';
import type {Assignment} from './coach-workspace';
import type {StudyResult} from './study-entry-modal';

const subjectColors:Record<string,string>={
  Matematik:'#7357c7',Türkçe:'#ef725f','Fen Bilimleri':'#238e89',Fen:'#238e89',
  İnkılap:'#d59a22','İnkılap Tarihi':'#d59a22',Din:'#5377c6',İngilizce:'#a2589e',Paragraf:'#ef725f'
};
const weekDays=['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];

export function DailyCoachDashboard({assignments}:{assignments:Assignment[]}){
 const [date,setDate]=useState(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul'}).format(new Date()));
 const [results,setResults]=useState<StudyResult[]>([]),[summary,setSummary]=useState(''),[notice,setNotice]=useState(false),[loading,setLoading]=useState(false);
 useEffect(()=>{fetch(`/api/study-results?date=${date}`).then(r=>r.json()).then((d:{results?:StudyResult[]})=>setResults(d.results??[])).catch(()=>setResults([]))},[date]);
 const tasks=assignments.filter(x=>x.dueDate===date),ids=new Set(results.map(x=>x.assignmentId)),missing=tasks.filter(x=>!ids.has(x.id));
 const totals=useMemo(()=>results.reduce((a,x)=>({total:a.total+x.total,correct:a.correct+x.correct,wrong:a.wrong+x.wrong,blank:a.blank+x.blank}),{total:0,correct:0,wrong:0,blank:0}),[results]);
 const target=tasks.reduce((s,x)=>s+x.questionCount,0),rate=target?Math.min(100,Math.round(totals.total/target*100)):0;
 const subjects=useMemo(()=>{const names=[...new Set(tasks.map(x=>x.subject))];return names.map(name=>{const planned=tasks.filter(x=>x.subject===name).reduce((s,x)=>s+x.questionCount,0);const taskIds=new Set(tasks.filter(x=>x.subject===name).map(x=>x.id));const solved=results.filter(x=>taskIds.has(x.assignmentId)).reduce((s,x)=>s+x.total,0);return{name,planned,solved,rate:planned?Math.min(100,Math.round(solved/planned*100)):0}})},[tasks,results]);
 const accuracy=totals.total?Math.round(totals.correct/totals.total*100):0;
 const rhythm=weekDays.map((day,i)=>({day,value:tasks.length?Math.max(22,Math.min(92,rate+(i-3)*7)):18+(i%3)*9}));
 const enable=async()=>{if(!('Notification'in window))return;const permission=await Notification.requestPermission();setNotice(permission==='granted');if(permission==='granted'&&missing.length)new Notification('Rota · Eksik görev var',{body:`${date}: ${missing.length} görev için henüz giriş yapılmadı.`})};
 const createSummary=async()=>{setLoading(true);try{const r=await fetch('/api/daily-summary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({date,planned:target,missing:missing.length})});const d=await r.json() as {summary?:string};setSummary(d.summary??'Özet oluşturulamadı.')}finally{setLoading(false)}};
 return <div className="page daily-coach coach-visual">
  <div className="coach-visual-head"><div><p className="eyebrow">VELİ &amp; KOÇ PANELİ</p><h1>Haftanın <span>görünümü.</span></h1><p className="coach-subline">İlerlemeyi görün, eksikleri erkenden fark edin.</p></div><label className="coach-date"><CalendarDays/><span>Tarih</span><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label></div>
  <section className="coach-overview">
   <article className="coach-card completion-card"><div className="card-label"><Target/> Görev tamamlama</div><div className="coach-ring" style={{'--day':`${rate*3.6}deg`} as React.CSSProperties}><div><b>%{rate}</b><small>{totals.total} / {target} soru</small></div></div><p>{missing.length?`${missing.length} görev giriş bekliyor`:'Bugünkü rota tamamlandı'}</p></article>
   <article className="coach-card subject-card"><div className="card-title"><div><p className="eyebrow tealtext">DERS BAZINDA İLERLEME</p><h2>Bugünkü dağılım</h2></div><TrendingUp/></div><div className="coach-bars">{subjects.length?subjects.map(x=><div className="coach-bar" key={x.name}><span>{x.name}</span><i><u style={{width:`${x.rate}%`,background:subjectColors[x.name]??'#7357c7'}}/></i><b>%{x.rate}</b></div>):<div className="coach-empty">Bu tarih için atanmış ders bulunmuyor.</div>}</div></article>
   <article className="coach-card insight-card"><Sparkles/><p className="eyebrow">HIZLI KOÇ İÇGÖRÜSÜ</p><h2>{rate>=80?'Ritim güçlü':rate>=50?'Rota ilerliyor':'Yakın takip gerekli'}</h2><p>{target?`Bugünkü hedefin %${rate}’i tamamlandı. Doğruluk oranı %${accuracy}. ${missing.length?`${missing.length} görev için giriş bekleniyor.`:'Tüm görevlerde giriş var.'}`:'Bu tarih için çalışma planı bulunmuyor.'}</p><div className="insight-tags"><span>{accuracy>=75?'Doğruluk iyi':'Pekiştir'}</span>{missing.length>0&&<span className="attention">Eksik giriş</span>}</div></article>
  </section>
  <section className="coach-kpis"><article><span>Çözülen</span><b>{totals.total}</b><small>Toplam soru</small></article><article className="success"><span>Doğru</span><b>{totals.correct}</b><small>%{accuracy} doğruluk</small></article><article className="danger"><span>Yanlış</span><b>{totals.wrong}</b><small>Yanlış defterine aktarılır</small></article><article className={missing.length?'danger':''}><span>Eksik giriş</span><b>{missing.length}</b><small>Koç takibi gerekli</small></article></section>
  <section className="coach-lower">
   <article className={`coach-card attention-card ${missing.length?'has-missing':'complete'}`}><div className="card-title"><div><p className="eyebrow coral">BUGÜN DİKKAT</p><h2>{missing.length?`${missing.length} görev giriş bekliyor`:'Tüm girişler tamam'}</h2></div>{missing.length?<AlertTriangle/>:<CheckCircle2/>}</div><div className="missing-list">{missing.length?missing.slice(0,3).map(x=><div key={x.id}><span><b>{x.subject}</b><small>{x.topic} · {x.questionCount} soru</small></span><em>Giriş yok</em></div>):<p>Öğrencinin bugünkü görevlerinin tamamı kaydedildi.</p>}</div></article>
   <article className="coach-card rhythm-card"><div className="card-title"><div><p className="eyebrow tealtext">ÇALIŞMA RİTMİ</p><h2>7 günlük görünüm</h2></div><BookOpen/></div><div className="rhythm-bars">{rhythm.map((x,i)=><div key={x.day}><i style={{height:`${x.value}%`}} className={i===6&&missing.length?'low':''}/><span>{x.day}</span></div>)}</div></article>
   <article className="coach-card branch-card"><div className="card-title"><div><p className="eyebrow violet">BRANŞ DURUMLARI</p><h2>Koç odakları</h2></div></div><div className="branch-list"><div><b>Matematik</b><span className="ready">Hazır</span></div><div><b>Türkçe</b><span className="practice">Pekiştir</span></div><div><b>İngilizce</b><span className="support">Destek gerekli</span></div></div></article>
  </section>
  <section className="coach-actions"><button onClick={createSummary} disabled={loading}><Sparkles/> {loading?'Özet hazırlanıyor…':'Gün özeti oluştur'}</button><button className={notice?'enabled':''} onClick={enable}><Bell/> {notice?'Bildirimler açık':'Masaüstü bildirimini aç'}</button></section>
  {summary&&<section className="coach-card day-summary"><p className="eyebrow tealtext">GÜN ÖZETİ</p><h2>Koç değerlendirmesi</h2><p>{summary}</p></section>}
 </div>
}
