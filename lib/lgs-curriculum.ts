export type CurriculumUnit = { name: string; topics: string[] };
export type CurriculumSubject = {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  units: CurriculumUnit[];
};

export const lgsCurriculum: CurriculumSubject[] = [
  { id: 'turkce', name: 'Türkçe', shortName: 'Türkçe', icon: 'Aa', color: '#ef725f', units: [
    { name: 'Anlam Bilgisi', topics: ['Sözcükte Anlam', 'Cümlede Anlam', 'Paragrafta Konu ve Ana Düşünce', 'Paragrafta Yardımcı Düşünce', 'Paragrafın Yapısı'] },
    { name: 'Dil Bilgisi', topics: ['Fiilimsiler', 'Cümlenin Ögeleri', 'Fiilde Çatı', 'Cümle Türleri', 'Anlatım Bozuklukları'] },
    { name: 'Metin ve Muhakeme', topics: ['Metin Türleri', 'Söz Sanatları', 'Görsel, Grafik ve Tablo Yorumlama', 'Sözel Mantık'] },
    { name: 'Yazım ve Noktalama', topics: ['Yazım Kuralları', 'Noktalama İşaretleri'] },
  ]},
  { id: 'matematik', name: 'Matematik', shortName: 'Matematik', icon: 'π', color: '#7357c7', units: [
    { name: 'Çarpanlar ve Katlar', topics: ['Pozitif Tam Sayıların Çarpanları', 'EBOB ve EKOK', 'Aralarında Asal Sayılar'] },
    { name: 'Üslü İfadeler', topics: ['Tam Sayıların Kuvvetleri', 'Üslü İfadelerle İşlemler', 'Bilimsel Gösterim'] },
    { name: 'Kareköklü İfadeler', topics: ['Karekök ve Tahmin', 'Kareköklü İfadelerle İşlemler', 'Gerçek Sayılar'] },
    { name: 'Veri Analizi ve Olasılık', topics: ['Grafikler', 'Basit Olayların Olma Olasılığı'] },
    { name: 'Cebir', topics: ['Cebirsel İfadeler ve Özdeşlikler', 'Doğrusal Denklemler', 'Eşitsizlikler'] },
    { name: 'Geometri', topics: ['Üçgenler', 'Eşlik ve Benzerlik', 'Dönüşüm Geometrisi', 'Geometrik Cisimler'] },
  ]},
  { id: 'fen', name: 'Fen Bilimleri', shortName: 'Fen', icon: '⚗', color: '#238e89', units: [
    { name: 'Mevsimler ve İklim', topics: ['Mevsimlerin Oluşumu', 'İklim ve Hava Hareketleri'] },
    { name: 'DNA ve Genetik Kod', topics: ['DNA ve Genetik Kod', 'Kalıtım', 'Mutasyon ve Modifikasyon', 'Adaptasyon', 'Biyoteknoloji'] },
    { name: 'Basınç', topics: ['Katı Basıncı', 'Sıvı Basıncı', 'Gaz Basıncı'] },
    { name: 'Madde ve Endüstri', topics: ['Periyodik Sistem', 'Fiziksel ve Kimyasal Değişimler', 'Kimyasal Tepkimeler', 'Asitler ve Bazlar', 'Maddenin Isı ile Etkileşimi', 'Türkiye’de Kimya Endüstrisi'] },
    { name: 'Basit Makineler', topics: ['Basit Makineler'] },
    { name: 'Enerji Dönüşümleri ve Çevre Bilimi', topics: ['Besin Zinciri ve Enerji Akışı', 'Enerji Dönüşümleri', 'Madde Döngüleri ve Çevre Sorunları', 'Sürdürülebilir Kalkınma'] },
    { name: 'Elektrik Yükleri ve Elektrik Enerjisi', topics: ['Elektrik Yükleri ve Elektriklenme', 'Elektrik Yüklü Cisimler', 'Elektrik Enerjisinin Dönüşümü'] },
  ]},
  { id: 'inkilap', name: 'T.C. İnkılap Tarihi ve Atatürkçülük', shortName: 'İnkılap', icon: '✦', color: '#d59a22', units: [
    { name: 'Bir Kahraman Doğuyor', topics: ['Avrupa’daki Gelişmeler ve Osmanlı Devleti', 'Mustafa Kemal’in Çocukluk ve Öğrenim Hayatı', 'Mustafa Kemal’in Askerlik Hayatı'] },
    { name: 'Millî Uyanış', topics: ['I. Dünya Savaşı ve Osmanlı Devleti', 'Mondros Ateşkes Antlaşması ve İşgaller', 'Kuvâ-yı Millîye ve Cemiyetler', 'Millî Mücadele’nin Hazırlık Dönemi', 'Misakımillî ve TBMM'] },
    { name: 'Ya İstiklal Ya Ölüm!', topics: ['Doğu ve Güney Cepheleri', 'Batı Cephesi', 'Maarif Kongresi ve Tekâlif-i Millîye', 'Mudanya ve Lozan'] },
    { name: 'Atatürkçülük ve Çağdaşlaşan Türkiye', topics: ['Atatürk İlkeleri', 'Siyasi ve Hukuki İnkılaplar', 'Eğitim, Kültür ve Toplumsal İnkılaplar', 'Ekonomi Alanındaki Gelişmeler'] },
    { name: 'Demokratikleşme Çabaları', topics: ['Çok Partili Hayata Geçiş Denemeleri', 'Cumhuriyet’e Yönelik Tehditler'] },
    { name: 'Atatürk Dönemi Türk Dış Politikası', topics: ['Türk Dış Politikasının Temel İlkeleri', 'Dış Politikadaki Gelişmeler', 'Hatay’ın Ana Vatana Katılması'] },
    { name: 'Atatürk’ün Ölümü ve Sonrası', topics: ['Atatürk’ün Ölümü ve Yankıları', 'İkinci Dünya Savaşı ve Türkiye', 'Çok Partili Hayata Geçiş'] },
  ]},
  { id: 'din', name: 'Din Kültürü ve Ahlak Bilgisi', shortName: 'Din', icon: '☾', color: '#5377c6', units: [
    { name: 'Kader İnancı', topics: ['Kader ve Kaza İnancı', 'İnsanın İradesi ve Kader', 'Kaderle İlgili Kavramlar', 'Hz. Musa'] },
    { name: 'Zekât ve Sadaka', topics: ['Paylaşma ve Yardımlaşma', 'Zekât ve Sadaka İbadeti', 'Hz. Şuayb', 'Maûn Suresi'] },
    { name: 'Din ve Hayat', topics: ['Din, Birey ve Toplum', 'Dinin Temel Gayesi'] },
    { name: 'Hz. Muhammed’in Örnekliği', topics: ['Doğruluğu ve Güvenilirliği', 'Merhameti, Affediciliği ve İstişaresi', 'Hakkı Gözetmesi', 'Kureyş Suresi'] },
    { name: 'Kur’an-ı Kerim ve Özellikleri', topics: ['İslam Dininin Temel Kaynakları', 'Kur’an’ın Ana Konuları', 'Kur’an’ın Temel Özellikleri', 'Hz. Nuh'] },
  ]},
  { id: 'ingilizce', name: 'İngilizce', shortName: 'İngilizce', icon: 'EN', color: '#a2589e', units: [
    { name: 'Unit 1 · Friendship', topics: ['Accepting and Refusing', 'Apologizing and Giving Explanations'] },
    { name: 'Unit 2 · Teen Life', topics: ['Daily Routines', 'Likes and Dislikes'] },
    { name: 'Unit 3 · In The Kitchen', topics: ['Describing Processes', 'Making Simple Inquiries'] },
    { name: 'Unit 4 · On The Phone', topics: ['Telephone Conversations', 'Leaving a Message'] },
    { name: 'Unit 5 · The Internet', topics: ['Internet Habits', 'Online Safety'] },
    { name: 'Unit 6 · Adventures', topics: ['Preferences', 'Comparisons'] },
    { name: 'Unit 7 · Tourism', topics: ['Describing Places', 'Experiences'] },
    { name: 'Unit 8 · Chores', topics: ['Responsibilities', 'Obligations'] },
    { name: 'Unit 9 · Science', topics: ['Scientific Achievements', 'Past Events'] },
    { name: 'Unit 10 · Natural Forces', topics: ['Natural Disasters', 'Predictions'] },
  ]},
];
