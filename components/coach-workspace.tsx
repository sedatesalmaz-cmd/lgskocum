'use client';
import {useState} from 'react';
import {BookOpen,CalendarDays,Check} from 'lucide-react';
import {booksForSubject} from '@/lib/book-catalog';
import {lgsCurriculum} from '@/lib/lgs-curriculum';
import {WeeklyReportPanel} from '@/components/weekly-report-panel';
export type Assignment={id:number;dueDate:string;subjectId:string;subject:string;book:string;unit:string;topic:string;questionCount:number;note:string};
export function CoachWorkspace({assignments,onAdd}:{assignments:Assignment[];onAdd:(item:Assignment)=>void}){
 const [subjectId,setSubjectId]=useState('matematik');const subject=lgsCurriculum.find(x=>x.id===subjectId)!;const [unitName,setUnitName]=useState(subject.units[0].name);const unit=subject.units.find(x=>x.name===unitName)??subject.units[0];
 const [topic,setTopic]=useState(unit.topics[0]);const [book,setBook]=useState('');const [dueDate,setDueDate]=useState(new Date().toISOString().slice(0,10));const [questionCount,setQuestionCount]=useState(20);const [note,setNote]=useState('');const [saved,setSaved]=useState(false);
 const chooseSubject=(id:string)=>{const next=lgsCurriculum.find(x=>x.id===id)!;setSubjectId(id);setUnitName(next.units[0].name);setTopic(next.units[0].topics[0]);setBook('')};const chooseUnit=(name:string)=>{const next=subject.units.find(x=>x.name===name)!;setUnitName(name);setTopic(next.topics[0])};
 const add=()=>{if(questionCount<1)return;onAdd({id:Date.now(),dueDate,subjectId,subject:subject.name,book:book||'Kitap belirtilmedi',unit:unit.name,topic,questionCount,note});setSaved(true);setTimeout(()=>setSaved(false),1400)};
 return <div className="page coach-workspace-page"><div className="welcome"><div><p className="eyebrow">YETİŞKİN & KOÇ ALANI</p><h1>Ödev ver <span>ve haftayı değerlendir.</span></h1></div><span className="role-badge">Öğrenci yalnızca görüntüler</span></div><div className="coach-tools-grid">
 <section className="coach-tool-card"><div className="tool-title"><span><BookOpen/></span><div><p className="eyebrow">YENİ ÖDEV</p><h2>Ders planına görev ekle</h2></div></div><div className="coach-form">
 <label>Ders<select value={subjectId} onChange={e=>chooseSubject(e.target.value)}>{lgsCurriculum.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label><label>Kitap<select value={book} onChange={e=>setBook(e.target.value)}><option value="">Kitap seçin</option>{booksForSubject(subjectId).map(x=><option key={x}>{x}</option>)}</select></label><label>Ünite<select value={unit.name} onChange={e=>chooseUnit(e.target.value)}>{subject.units.map(x=><option key={x.name}>{x.name}</option>)}</select></label><label>Konu<select value={topic} onChange={e=>setTopic(e.target.value)}>{unit.topics.map(x=><option key={x}>{x}</option>)}</select></label><label><span><CalendarDays/> Teslim günü</span><input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}/></label><label>Soru hedefi<input type="number" min="1" value={questionCount} onChange={e=>setQuestionCount(Number(e.target.value))}/></label><label className="wide">Öğretmen notu<textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Ödev açıklaması veya Gemini'ye sorunuz…"/></label>
 </div><button className={`save-entry ${saved?'saved':''}`} onClick={add}>{saved?<><Check/> Ödev eklendi</>:'Öğrencinin rotasına ekle'}</button><div className="assignment-list"><b>Eklenen ödevler</b>{assignments.map(x=><article key={x.id}><span>{x.subject}</span><div><strong>{x.topic}</strong><small>{x.book} · {x.questionCount} soru · {new Date(`${x.dueDate}T12:00:00`).toLocaleDateString('tr-TR')}</small></div></article>)}</div></section>
 <WeeklyReportPanel/>
 </div></div>
}
