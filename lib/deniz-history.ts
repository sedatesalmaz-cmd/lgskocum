export type WeeklySubject = { target: number; solved: number };
export type WeeklyProgress = {
  label: string;
  start: string;
  end: string;
  subjects: Record<string, WeeklySubject>;
};
export type BookCompletion = {
  subject: string;
  book: string;
  completed: string[];
  ongoing?: string[];
};

export const weeklyProgress: WeeklyProgress[] = [];

export const bookCompletions: BookCompletion[] = [];
