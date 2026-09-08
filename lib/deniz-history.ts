export type WeeklySubject = { target: number; solved: number };
export type WeeklyProgress = { label: string; start: string; end: string; subjects: Record<string, WeeklySubject> };
export type BookCompletion = { subject: string; book: string; completed: string[]; ongoing?: string[] };

export const weeklyProgress: WeeklyProgress[] = [
  {label:'18–24 Tem',start:'2026-07-18',end:'2026-07-24',subjects:{Paragraf:{target:350,solved:350},Türkçe:{target:200,solved:60},Matematik:{target:210,solved:210},'Fen Bilimleri':{target:200,solved:95},İnkılap:{target:44,solved:0}}},
  {label:'24–30 Tem',start:'2026-07-24',end:'2026-07-30',subjects:{Paragraf:{target:323,solved:300},Türkçe:{target:212,solved:212},Matematik:{target:279,solved:196},'Fen Bilimleri':{target:232,solved:232},İnkılap:{target:43,solved:0}}},
  {label:'31 Tem–6 Ağu',start:'2026-07-31',end:'2026-08-06',subjects:{Paragraf:{target:180,solved:180},Türkçe:{target:150,solved:150},Matematik:{target:166,solved:160},'Fen Bilimleri':{target:166,solved:166},İnkılap:{target:43,solved:43}}},
  {label:'7–14 Ağu',start:'2026-08-07',end:'2026-08-14',subjects:{Paragraf:{target:328,solved:328},Türkçe:{target:170,solved:170},Matematik:{target:206,solved:104},'Fen Bilimleri':{target:132,solved:107},İnkılap:{target:61,solved:55}}},
  {label:'14–21 Ağu',start:'2026-08-14',end:'2026-08-21',subjects:{Paragraf:{target:280,solved:280},Türkçe:{target:179,solved:179},Matematik:{target:86,solved:80},'Fen Bilimleri':{target:182,solved:182},İnkılap:{target:72,solved:72}}},
  {label:'21–28 Ağu',start:'2026-08-21',end:'2026-08-28',subjects:{Paragraf:{target:245,solved:245},Türkçe:{target:170,solved:170},Matematik:{target:240,solved:240},'Fen Bilimleri':{target:175,solved:175},İnkılap:{target:97,solved:97}}},
  {label:'28 Ağu–4 Eyl',start:'2026-08-28',end:'2026-09-04',subjects:{Paragraf:{target:223,solved:168},Türkçe:{target:240,solved:240},Matematik:{target:275,solved:255},'Fen Bilimleri':{target:117,solved:117},İnkılap:{target:80,solved:80},'Din Kültürü':{target:40,solved:40}}},
];

export const bookCompletions: BookCompletion[] = [
  {subject:'Türkçe',book:'Fenomen 8-A Soru Bankası',completed:['Fiilimsiler','Cümlenin Öğeleri']},
  {subject:'Matematik',book:'Fenomen 8-A Soru Bankası',completed:['Çarpanlar ve Katlar']},
  {subject:'Matematik',book:'Fenomen 8-B Soru Bankası',completed:['Çarpanlar ve Katlar']},
  {subject:'Matematik',book:'Fenomen Kök',completed:['Çarpanlar ve Katlar','Üslü İfadeler']},
  {subject:'Matematik',book:'MUBA',completed:['Çarpanlar ve Katlar','Üslü İfadeler']},
  {subject:'Matematik',book:'Nartest 36 Haftalık Deneme',completed:['Çarpanlar ve Katlar']},
  {subject:'Fen Bilimleri',book:'Konu Çalışma',completed:['Mevsimler ve İklim','DNA ve Genetik Kod','Basınç']},
  {subject:'Fen Bilimleri',book:'MUBA Fasikül',completed:['Mevsimler ve İklim','DNA ve Genetik Kod','Basınç']},
  {subject:'Fen Bilimleri',book:'Fenomen Kök',completed:['Mevsimler ve İklim','DNA ve Genetik Kod']},
  {subject:'Fen Bilimleri',book:'Nartest Prestij Soru Bankası',completed:['Mevsimler ve İklim','DNA ve Genetik Kod']},
  {subject:'Fen Bilimleri',book:'MEB Örnek Sorular',completed:['Mevsimler ve İklim']},
  {subject:'Fen Bilimleri',book:'36 Haftalık Deneme',completed:['Mevsimler ve İklim']},
  {subject:'İnkılap',book:'Fenomen 8',completed:['Bir Kahraman Doğuyor','Milli Uyanış: Bağımsızlık Yolunda Atılan Adımlar']},
  {subject:'İnkılap',book:'Hız',completed:['Bir Kahraman Doğuyor']},
  {subject:'İnkılap',book:'Nartest',completed:['Bir Kahraman Doğuyor']},
  {subject:'İnkılap',book:'Paraf',completed:['Bir Kahraman Doğuyor']},
  {subject:'Din Kültürü',book:'MEB Örnek Sorular',completed:['Kader İnancı']},
  {subject:'Din Kültürü',book:'36 Haftalık Deneme',completed:['Kader İnancı']},
  {subject:'İngilizce',book:'MEB Örnek Sorular',completed:['Friendship','Tourism']},
  {subject:'İngilizce',book:'36 Haftalık Deneme',completed:['Friendship']},
];
