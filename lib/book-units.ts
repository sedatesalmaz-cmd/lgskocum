import { lgsCurriculum } from '@/lib/lgs-curriculum';
export const denemeWeeks = Array.from(
  { length: 36 },
  (_, index) => `${index + 1}. Hafta`,
);
export const isWeeklyTestBook = (bookName: string) => {
  const value = bookName.toLocaleLowerCase('tr-TR');
  return value.includes('deneme') || value.includes('36 hafta');
};
export const unitsForBook = (subjectId: string, bookName: string) =>
  isWeeklyTestBook(bookName)
    ? denemeWeeks
    : (lgsCurriculum
        .find((item) => item.id === subjectId)
        ?.units.map((item) => item.name) ?? []);
