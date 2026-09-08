import {NextResponse} from 'next/server';
import {env} from 'cloudflare:workers';
import {requireMember} from '@/lib/server-auth';
import {lgsExamSources,lgsExamSubjects} from '@/lib/lgs-question-catalog';
const db=(env as unknown as {DB:D1Database}).DB;

type CatalogQuestion={id:number;year:number;subjectId:string;questionNumber:number;unit:string|null;topic:string|null;tagStatus:string;officialUrl:string};

async function authorize(request:Request){return requireMember(request,db,['guardian','coach'])}

export async function GET(request:Request){
 try{await authorize(request)}catch(error){if(error instanceof Response)return NextResponse.json({error:await error.text()},{status:error.status});return NextResponse.json({error:'Yetkilendirme kontrolü başarısız.'},{status:500})}
 const url=new URL(request.url);const year=Number(url.searchParams.get('year')||2026);const subjectId=url.searchParams.get('subject')||'matematik';
 const totals=await db.prepare("SELECT COUNT(*) total, SUM(CASE WHEN tag_status='approved' THEN 1 ELSE 0 END) approved FROM lgs_questions").first<{total:number;approved:number}>();
 const rows=await db.prepare('SELECT q.id,q.year,q.subject_id subjectId,q.question_number questionNumber,q.unit,q.topic,q.tag_status tagStatus,s.official_url officialUrl FROM lgs_questions q JOIN source_documents s ON s.id=q.source_id WHERE q.year=? AND q.subject_id=? ORDER BY q.question_number').bind(year,subjectId).all<CatalogQuestion>();
 return NextResponse.json({questions:rows.results,totals:{total:Number(totals?.total??0),approved:Number(totals?.approved??0)}});
}

export async function POST(request:Request){
 let member;try{member=await authorize(request)}catch(error){if(error instanceof Response)return NextResponse.json({error:await error.text()},{status:error.status});return NextResponse.json({error:'Yetkilendirme kontrolü başarısız.'},{status:500})}
 const body=await request.json() as {action:string;id?:number;unit?:string;topic?:string};
 if(body.action==='initialize'){
  const now=new Date().toISOString();
  for(const source of lgsExamSources){await db.prepare('INSERT OR IGNORE INTO source_documents (year,title,official_url,publisher,checked_at,status) VALUES (?,?,?,?,?,?)').bind(source.year,`${source.year} LGS Merkezî Sınavı`,source.url,'MEB',now,'active').run();const row=await db.prepare('SELECT id FROM source_documents WHERE year=?').bind(source.year).first<{id:number}>();if(!row)continue;const statements=[];for(const subject of lgsExamSubjects){for(let number=1;number<=subject.count;number++)statements.push(db.prepare('INSERT OR IGNORE INTO lgs_questions (source_id,year,subject_id,question_number,tag_status,created_at) VALUES (?,?,?,?,?,?)').bind(row.id,source.year,subject.id,number,'pending',now))}await db.batch(statements)}
  return NextResponse.json({ok:true,total:810});
 }
 if(body.action==='approve'&&body.id&&body.unit&&body.topic){await db.prepare("UPDATE lgs_questions SET unit=?,topic=?,tag_status='approved',approved_by=?,approved_at=? WHERE id=?").bind(body.unit,body.topic,member.email,new Date().toISOString(),body.id).run();return NextResponse.json({ok:true})}
 return NextResponse.json({error:'Geçersiz işlem.'},{status:400});
}
