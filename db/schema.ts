import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
export const members = sqliteTable('members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique(),
  email: text('email').notNull(),
  role: text('role').notNull(),
  subjectId: text('subject_id'),
  createdAt: text('created_at').notNull(),
});
export const assignments = sqliteTable('assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dueDate: text('due_date').notNull(),
  subjectId: text('subject_id').notNull(),
  subject: text('subject').notNull(),
  book: text('book').notNull(),
  unit: text('unit').notNull(),
  topic: text('topic').notNull(),
  questionCount: integer('question_count').notNull(),
  note: text('note').notNull().default(''),
  createdAt: text('created_at').notNull(),
});
export const studyResults = sqliteTable(
  'study_results',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    assignmentId: integer('assignment_id'),
    studyDate: text('study_date').notNull(),
    subjectId: text('subject_id').notNull(),
    unit: text('unit').notNull(),
    topic: text('topic').notNull(),
    book: text('book').notNull(),
    total: integer('total').notNull(),
    correct: integer('correct').notNull(),
    wrong: integer('wrong').notNull(),
    blank: integer('blank').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('uq_study_results_assignment').on(table.assignmentId),
    index('idx_study_results_date').on(table.studyDate),
  ],
);
export const wrongQuestions = sqliteTable('wrong_questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studyResultId: integer('study_result_id'),
  subjectId: text('subject_id').notNull(),
  unit: text('unit').notNull(),
  topic: text('topic').notNull(),
  imageKey: text('image_key').notNull(),
  analysis: text('analysis'),
  createdAt: text('created_at').notNull(),
});
export const weeklyReports = sqliteTable('weekly_reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  weekStart: text('week_start').notNull(),
  weekEnd: text('week_end').notNull(),
  status: text('status').notNull().default('draft'),
  branchReports: text('branch_reports').notNull(),
  generalSummary: text('general_summary').notNull(),
  createdAt: text('created_at').notNull(),
});
export const bookUnitProgress = sqliteTable(
  'book_unit_progress',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    subjectId: text('subject_id').notNull(),
    subject: text('subject').notNull(),
    book: text('book').notNull(),
    unit: text('unit').notNull(),
    status: text('status').notNull().default('not_started'),
    progress: integer('progress').notNull().default(0),
    updatedBy: text('updated_by').notNull().default('system'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('uq_book_unit_progress').on(
      table.subjectId,
      table.book,
      table.unit,
    ),
    index('idx_book_unit_progress_subject').on(table.subjectId, table.status),
  ],
);
export const sourceDocuments = sqliteTable('source_documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  year: integer('year').notNull().unique(),
  title: text('title').notNull(),
  officialUrl: text('official_url').notNull(),
  publisher: text('publisher').notNull().default('MEB'),
  checkedAt: text('checked_at').notNull(),
  status: text('status').notNull().default('active'),
});
export const lgsQuestions = sqliteTable(
  'lgs_questions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sourceId: integer('source_id')
      .notNull()
      .references(() => sourceDocuments.id),
    year: integer('year').notNull(),
    subjectId: text('subject_id').notNull(),
    questionNumber: integer('question_number').notNull(),
    unit: text('unit'),
    topic: text('topic'),
    tagStatus: text('tag_status').notNull().default('pending'),
    approvedBy: text('approved_by'),
    approvedAt: text('approved_at'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('uq_lgs_questions_year_subject_number').on(
      table.year,
      table.subjectId,
      table.questionNumber,
    ),
    index('idx_lgs_questions_review').on(
      table.year,
      table.subjectId,
      table.tagStatus,
    ),
    index('idx_lgs_questions_topic').on(
      table.subjectId,
      table.topic,
      table.tagStatus,
    ),
  ],
);
