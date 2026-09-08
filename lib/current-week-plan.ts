import type {Assignment} from '@/components/coach-workspace';

const task = (
  id:number,
  dueDate:string,
  subjectId:string,
  subject:string,
  book:string,
  topic:string,
  questionCount:number,
  note:string,
):Assignment=>({id,dueDate,subjectId,subject,book,unit:'Haftalık çalışma planı',topic,questionCount,note});

export const currentWeekAssignments:Assignment[]=[
 task(40901,'2026-09-05','turkce','Paragraf','Fenomen 8-A Türkçe','Paragraf – analiz edilmeyen',38,'38 soru'),
 task(40902,'2026-09-06','turkce','Paragraf','Fenomen 8-A Türkçe','Paragraf çalışması',46,'Sayfa 19–27'),
 task(40903,'2026-09-07','turkce','Paragraf','Fenomen 8-A Türkçe','Paragraf çalışması',44,'Sayfa 28–37'),
 task(40904,'2026-09-08','turkce','Paragraf','Fenomen 8-A Türkçe','Paragraf çalışması',41,'Sayfa 38–46'),
 task(40905,'2026-09-09','turkce','Paragraf','Fenomen 8-A Türkçe','Paragraf çalışması',40,'Sayfa 113–119'),
 task(40906,'2026-09-10','turkce','Paragraf','Fenomen 8-A Türkçe','Paragraf çalışması',42,'Sayfa 120–130'),

 task(40907,'2026-09-05','turkce','Türkçe','Haftalık Türkçe Denemeleri','Haftalık 1. deneme',20,'30 dakika'),
 task(40908,'2026-09-06','turkce','Türkçe','Haftalık Türkçe Denemeleri','Haftalık 2. deneme',20,'30 dakika'),
 task(40909,'2026-09-07','turkce','Türkçe','Haftalık Türkçe Denemeleri','Haftalık 3. deneme',20,'30 dakika'),
 task(40910,'2026-09-08','turkce','Türkçe','Haftalık Türkçe Denemeleri','Haftalık 4. deneme',20,'30 dakika'),
 task(40911,'2026-09-09','turkce','Türkçe','Haftalık Türkçe Denemeleri','Haftalık 5. deneme',20,'30 dakika'),
 task(40912,'2026-09-10','turkce','Türkçe','Fenomen 8-A Türkçe','Türkçe çalışması',40,'Sayfa 131–139'),

 task(40913,'2026-09-05','matematik','Matematik','Fenomen Kök + MUBA','Fenomen Kök ve MUBA çalışması',26,'Fenomen Kök sayfa 49–82'),
 task(40914,'2026-09-06','matematik','Matematik','Fenomen Kök','Fenomen Kök çalışması',31,'Sayfa 83–87'),
 task(40915,'2026-09-07','matematik','Matematik','Fenomen Kök','Fenomen Kök çalışması',27,'Sayfa 88–91'),
 task(40916,'2026-09-08','matematik','Matematik','Fenomen Kök','Fenomen Kök çalışması',26,'Sayfa 92–96'),
 task(40917,'2026-09-09','matematik','Matematik','Haftalık Matematik Denemeleri','Haftalık deneme 1 ve 2',40,'40 dakika'),
 task(40918,'2026-09-10','matematik','Matematik','Haftalık Matematik Denemeleri','Haftalık 3. deneme',20,'40 dakika'),

 task(40919,'2026-09-04','fen-bilimleri','Fen Bilimleri','Haftalık Fen Denemeleri','Haftalık Fen 1. deneme',20,'40 dakika'),
 task(40920,'2026-09-05','fen-bilimleri','Fen Bilimleri','Haftalık Fen Denemeleri','Haftalık 2. deneme',20,''),
 task(40921,'2026-09-06','fen-bilimleri','Fen Bilimleri','Haftalık Fen Denemeleri','Haftalık 3. deneme',20,''),
 task(40922,'2026-09-07','fen-bilimleri','Fen Bilimleri','Haftalık Fen Denemeleri','Haftalık 4. deneme',20,''),
 task(40923,'2026-09-08','fen-bilimleri','Fen Bilimleri','Haftalık Fen Denemeleri','Haftalık 5. deneme',20,''),

 task(40924,'2026-09-05','matematik','Matematik','Ankara Yayıncılık','Ankara Matematik çalışması',24,'Sayfa 11–14'),
 task(40925,'2026-09-06','matematik','Matematik','Ankara Yayıncılık','Ankara Matematik çalışması',21,'Sayfa 15–19'),
 task(40926,'2026-09-07','matematik','Matematik','Ankara Yayıncılık','Ankara Matematik çalışması',21,'Sayfa 20–24'),
 task(40927,'2026-09-08','matematik','Matematik','Ankara Yayıncılık','Ankara Matematik çalışması',20,'Sayfa 25–29'),
 task(40928,'2026-09-09','matematik','Matematik','Ankara Yayıncılık','Ankara Matematik çalışması',20,'Sayfa 30–39'),
 task(40929,'2026-09-10','matematik','Matematik','Ankara Yayıncılık','Ankara Matematik çalışması',19,'Sayfa 40–49'),

 task(40930,'2026-09-05','inkilap-tarihi','İnkılap Tarihi','Fenomen','İnkılap Tarihi çalışması',30,'Sayfa 101–114'),
 task(40931,'2026-09-08','inkilap-tarihi','İnkılap Tarihi','Fenomen','İnkılap Tarihi çalışması',30,'Sayfa 115–127'),
 task(40932,'2026-09-09','inkilap-tarihi','İnkılap Tarihi','Fenomen','İnkılap Tarihi çalışması',30,'Sayfa 128–141'),
 task(40933,'2026-09-10','inkilap-tarihi','İnkılap Tarihi','Fenomen','İnkılap Tarihi çalışması',27,'Sayfa 142–152'),

 task(40934,'2026-09-04','fen-bilimleri','Fen Bilimleri','Fenomen Kök','Fenomen Kök çalışması',30,'Sayfa 89–93'),
 task(40935,'2026-09-05','fen-bilimleri','Fen Bilimleri','Fenomen Kök','Fenomen Kök çalışması',30,'Sayfa 94–98'),
 task(40936,'2026-09-06','fen-bilimleri','Fen Bilimleri','Fenomen Kök','Fenomen Kök çalışması',30,'Sayfa 99–103'),
 task(40937,'2026-09-07','fen-bilimleri','Fen Bilimleri','Fenomen Kök','Fenomen Kök çalışması',33,'Sayfa 104–109'),
 task(40938,'2026-09-08','fen-bilimleri','Fen Bilimleri','Fenomen Kök','Fenomen Kök çalışması',34,'Sayfa 110–115'),
 task(40939,'2026-09-09','fen-bilimleri','Fen Bilimleri','Fenomen Kök','Fenomen Kök çalışması',32,'Sayfa 116–121'),
];

export const currentWeekQuestionTotal=currentWeekAssignments.reduce((sum,item)=>sum+item.questionCount,0);
