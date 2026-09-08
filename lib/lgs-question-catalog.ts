export const lgsExamSources=[
 {year:2018,url:'https://odsgm.meb.gov.tr/www/2-haziran-2018-tarihinde-yapilan-sinavla-ogrenci-alacak-ortaogretim-kurumlarina-iliskin-merkezi-sinava-ait-soru-ve-cevap-anahtarlari/icerik/317'},
 {year:2019,url:'https://odsgm.meb.gov.tr/www/1-haziran-2019-tarihinde-yapilan-sinavla-ogrenci-alacak-ortaogretim-kurumlarina-iliskin-merkezi-sinav-soru-kitapciklari-ve-cevap-anahtarlari/icerik/465'},
 {year:2020,url:'https://odsgm.meb.gov.tr/www/arama/sonuc?q=2020%20LGS%20soru%20kitapciklari'},
 {year:2021,url:'https://odsgm.meb.gov.tr/www/arama/sonuc?q=2021%20LGS%20soru%20kitapciklari'},
 {year:2022,url:'https://odsgm.meb.gov.tr/www/arama/sonuc?q=2022%20LGS%20soru%20kitapciklari'},
 {year:2023,url:'https://odsgm.meb.gov.tr/www/arama/sonuc?q=2023%20LGS%20soru%20kitapciklari'},
 {year:2024,url:'https://odsgm.meb.gov.tr/www/arama/sonuc?q=2024%20LGS%20soru%20kitapciklari'},
 {year:2025,url:'https://odsgm.meb.gov.tr/www/arama/sonuc?q=2025%20LGS%20soru%20kitapciklari'},
 {year:2026,url:'https://odsgm.meb.gov.tr/www/lgs-kapsamindaki-merkezi-sinavin-soru-kitapciklari-ve-cevap-anahtarlari-yayimlandi/icerik/1678/'},
] as const;

export const lgsExamSubjects=[
 {id:'turkce',name:'Türkçe',count:20},
 {id:'matematik',name:'Matematik',count:20},
 {id:'fen',name:'Fen Bilimleri',count:20},
 {id:'inkilap',name:'T.C. İnkılap Tarihi',count:10},
 {id:'din',name:'Din Kültürü',count:10},
 {id:'ingilizce',name:'İngilizce',count:10},
] as const;

export const subjectName=(id:string)=>lgsExamSubjects.find(item=>item.id===id)?.name??id;
