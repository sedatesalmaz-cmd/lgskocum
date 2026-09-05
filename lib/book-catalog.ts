export type BookCatalogEntry = {
  subjectId: string;
  subjectName: string;
  books: string[];
};

export const bookCatalog: BookCatalogEntry[] = [
  {
    subjectId: 'turkce',
    subjectName: 'Türkçe',
    books: [
      'Ankara Güçlendiren',
      'Fenomen 8B',
      'Paragrafın Ritmi',
      '36 Haftalık Çalışma',
      'Paraf',
      'Yanıt Yayınları',
      'Master Paragraf',
      'Master Türkçe',
      'Fenomen Yazım',
      'Nitelik Deyim',
    ],
  },
  {
    subjectId: 'matematik',
    subjectName: 'Matematik',
    books: [],
  },
  {
    subjectId: 'fen',
    subjectName: 'Fen Bilimleri',
    books: [
      '36 Haftalık Çalışma',
      'Hız Yayınları',
      'Okyanus Master',
      'Paraf',
      'Yanıt Yayınları',
    ],
  },
  {
    subjectId: 'inkilap',
    subjectName: 'T.C. İnkılap Tarihi ve Atatürkçülük',
    books: ['Paraf IQ', 'Ankara Güçlendiren', 'Nartest', 'Hız Uzman'],
  },
  {
    subjectId: 'din',
    subjectName: 'Din Kültürü ve Ahlak Bilgisi',
    books: ['Ankara', 'Hız Uzman', 'Fenomen', 'Ankara Haftalık Denemeler'],
  },
  {
    subjectId: 'ingilizce',
    subjectName: 'İngilizce',
    books: ['Ankara', 'Hız Uzman'],
  },
];

export const booksForSubject = (subjectId: string) =>
  bookCatalog.find((entry) => entry.subjectId === subjectId)?.books ?? [];
