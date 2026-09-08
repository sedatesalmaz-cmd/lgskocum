'use client';
import '@/app/progress-dashboard.css';
import {useMemo,useState} from 'react';
import {BookOpen,CheckCircle2,Target,TrendingUp} from 'lucide-react';
import {bookCompletions,weeklyProgress} from '@/lib/deniz-history';

const subjectOrder=['Paragraf','Türkçe','Matematik','Fen Bilimleri','İnkılap','Din Kültürü','İngilizce'];
const colors:Record<string,string>={Paragraf:'#e96f5d',Türkçe:'#ef725f',Matematik:'#7357c7','Fen Bilimleri':'#238e89',İnkılap:'#d59a22','Din Kültürü':'#5377c6',İngilizce:'#a2589e'};
const pct=(solved:number,target:number)=>target?Math.round(solved/target*100):0;

export function ProgressDashboard(){
 const [subject,setSubject]=useState('Matematik');
 const totals=useMemo(()=>subjectOrder.map(name=>{const rows=weeklyProgress.map(w=>w.subjects[name]).filter(Boolean);const target=rows.reduce((s,x)=>s+x.target,0),solved=rows.reduce((s,x)=>s+x.solved,0);return{name,target,solved,rate:pct(solved,target)}}),[]);
 const books=bookCompletions.filter(x=>x.subject===subject);
 return <div className="page progress-page">
  <div className="welcome"><div><p className="eyebrow">18 TEMMUZ–4 EYLÜL 2026</p><h1>Çalışma geçmişi <span>ders ders ilerliyor.</span></h1></div></div>
  <section className="progress-summary">{totals.map(item=><article key={item.name}><span style={{background:`${colors[item.name]}18`,color:colors[item.name]}}><Target/></span><div><small>{item.name}</small><b>{item.solved} / {item.target}</b><em>%{item.rate} tamamlandı</em></div><i><u style={{width:`${Math.min(item.rate,100)}%`,background:colors[item.name]}}/></i></article>)}</section>
  <section className="weekly-card"><div className="progress-title"><div><p className="eyebrow">HAFTALIK SORU SAYISI</p><h2>Hedef ve bitirme oranı</h2></div><TrendingUp/></div><div className="weekly-table"><div className="weekly-head"><span>Hafta</span>{subjectOrder.map(x=><span key={x}>{x}</span>)}</div>{weeklyProgress.map(week=><div className="weekly-row" key={week.start}><strong>{week.label}</strong>{subjectOrder.map(name=>{const item=week.subjects[name];return <span key={name} className={!item?'muted':''}>{item?<><b>{item.solved}/{item.target}</b><small>%{pct(item.solved,item.target)}</small></>:'—'}</span>})}</div>)}</div></section>
  <section className="books-card"><div className="progress-title"><div><p className="eyebrow">KİTAP–ÜNİTE TAKİBİ</p><h2>Tamamlanan çalışmalar</h2></div><BookOpen/></div><div className="progress-tabs">{[...new Set(bookCompletions.map(x=>x.subject))].map(x=><button key={x} className={x===subject?'active':''} onClick={()=>setSubject(x)}>{x}</button>)}</div><div className="book-grid">{books.map(book=><article key={book.book}><h3>{book.book}</h3><div className="completion-list">{book.completed.map(unit=><span key={unit}><CheckCircle2/> {unit}</span>)}</div>{book.ongoing&&<div className="ongoing"><b>Devam ediyor</b>{book.ongoing.map(unit=><small key={unit}>{unit}</small>)}</div>}</article>)}</div></section>
 </div>
}
