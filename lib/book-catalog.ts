export type BookItem = {
  name: string;
  category?: string;
  image?: string;
  short: string;
  color: string;
};
export type BookCatalogEntry = {
  subjectId: string;
  subjectName: string;
  books: BookItem[];
};
const book = (
  name: string,
  short: string,
  color: string,
  image?: string,
  category?: string,
): BookItem => ({ name, short, color, image, category });
export const bookCatalog: BookCatalogEntry[] = [
  {
    subjectId: 'turkce',
    subjectName: 'Türkçe ve Paragraf',
    books: [
      book(
        'Classmate 36 Hafta Deneme',
        'CL',
        '#285c92',
        '/books/classmate-turkce.jpg',
        'Türkçe',
      ),
      book(
        'Fenomen Yayınları 8A',
        'F8A',
        '#1478a0',
        '/books/fenomen.png',
        'Türkçe',
      ),
      book(
        'Paraf Yayınları Deneme',
        'PRF',
        '#e04c37',
        '/books/paraf.jpg',
        'Türkçe',
      ),
      book('Ankara Yayınları', 'ANK', '#dc5b2c', undefined, 'Türkçe'),
      book(
        'Nitelik Yayınları B',
        'NTL',
        '#5965a8',
        '/books/nitelik.jpg',
        'Türkçe',
      ),
      book(
        'Fenomen Yazım Kuralları',
        'FY',
        '#1478a0',
        '/books/fenomen.png',
        'Türkçe',
      ),
      book('Yanıt Yayınları', 'YNT', '#e65b29', '/books/yanit.jpg', 'Türkçe'),
      book(
        'Okyanus Yayınları Türkçe',
        'OKY',
        '#1969a6',
        '/books/okyanus.png',
        'Türkçe',
      ),
      book('Fenomen Deyimler', 'FD', '#1478a0', '/books/fenomen.png', 'Türkçe'),
      book(
        'Fenomen Yayınları 8B',
        'F8B',
        '#1478a0',
        '/books/fenomen.png',
        'Türkçe',
      ),
      book(
        'Fenomen Yayınları A Paragraf',
        'FPA',
        '#1478a0',
        '/books/fenomen.png',
        'Paragraf',
      ),
      book(
        'Okyanus Yayınları Paragraf',
        'OP',
        '#1969a6',
        '/books/okyanus.png',
        'Paragraf',
      ),
      book(
        'Arı Yayınları Paragraf',
        'ARI',
        '#f0b323',
        '/books/ari.png',
        'Paragraf',
      ),
    ],
  },
  {
    subjectId: 'matematik',
    subjectName: 'Matematik',
    books: [
      book('MUBA Yayınları', 'MUBA', '#1e8f69', '/books/muba.jpg'),
      book('Nartest Yayınları 36 Hafta Deneme', 'NAR', '#e35d2f'),
      book('Fenomen Yayınları 8A', 'F8A', '#1478a0', '/books/fenomen.png'),
      book('Hız Yayınları', 'HIZ', '#e52629', '/books/hiz.jpg'),
      book('Fenomen Yayınları 8B', 'F8B', '#1478a0', '/books/fenomen.png'),
      book('Fenomen Yayınları Kök', 'KÖK', '#1478a0', '/books/fenomen.png'),
      book('Ankara Yayınları', 'ANK', '#dc5b2c'),
    ],
  },
  {
    subjectId: 'fen',
    subjectName: 'Fen Bilimleri',
    books: [
      book('Fenomen Yayınları Kök', 'KÖK', '#1478a0', '/books/fenomen.png'),
      book('Classmate 36 Hafta Deneme', 'CL', '#285c92', '/books/okyanus.png'),
      book('MUBA Yayınları', 'MUBA', '#1e8f69', '/books/muba.jpg'),
      book('Hız Yayınları', 'HIZ', '#e52629', '/books/hiz.jpg'),
      book('Yanıt Yayınları', 'YNT', '#e65b29', '/books/yanit.jpg'),
      book('Okyanus Yayınları', 'OKY', '#1969a6', '/books/okyanus.png'),
      book(
        'Sinan Kuzucu Yayınları',
        'SK',
        '#a62d39',
        '/books/sinan-kuzucu.jpg',
      ),
      book('Fenomen Yayınları 8A', 'F8A', '#1478a0', '/books/fenomen.png'),
      book('Kontak Yayınları 36 Hafta Deneme', 'KON', '#7a58a6'),
    ],
  },
  {
    subjectId: 'inkilap',
    subjectName: 'T.C. İnkılap Tarihi ve Atatürkçülük',
    books: [
      book('Paraf Yayınları', 'PRF', '#e04c37', '/books/paraf.jpg'),
      book('Nartest Yayınları', 'NAR', '#e35d2f'),
      book('Hız Yayınları A', 'HIZ', '#e52629', '/books/hiz.jpg'),
      book('Fenomen Yayınları', 'FEN', '#1478a0', '/books/fenomen.png'),
      book('Ankara Yayınları Güçlendiren', 'ANK', '#dc5b2c'),
    ],
  },
  {
    subjectId: 'din',
    subjectName: 'Din Kültürü ve Ahlak Bilgisi',
    books: [book('Ankara Yayınları Güçlendiren', 'ANK', '#dc5b2c')],
  },
  {
    subjectId: 'ingilizce',
    subjectName: 'İngilizce',
    books: [book('Hız Yayınları', 'HIZ', '#e52629', '/books/hiz.jpg')],
  },
];
export const bookItemsForSubject = (subjectId: string) =>
  bookCatalog.find(
    (entry) => entry.subjectId === (subjectId === 'paragraf' ? 'turkce' : subjectId),
  )?.books ?? [];
export const booksForSubject = (subjectId: string) =>
  bookItemsForSubject(subjectId).map((item) => item.name);
export const findBook = (subjectId: string, name: string) =>
  bookItemsForSubject(subjectId).find((item) => item.name === name);
