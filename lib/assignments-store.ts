import { currentWeekAssignments } from '@/lib/current-week-plan';

export async function ensureAssignments(db: D1Database) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        due_date TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        book TEXT NOT NULL,
        unit TEXT NOT NULL,
        topic TEXT NOT NULL,
        question_count INTEGER NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL
      )`,
    )
    .run();
  await db
    .prepare(
      'CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date)',
    )
    .run();
  const now = new Date().toISOString();
  await db.batch(
    currentWeekAssignments.map((item) =>
      db
        .prepare(
          'INSERT OR IGNORE INTO assignments(id,due_date,subject_id,subject,book,unit,topic,question_count,note,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)',
        )
        .bind(
          item.id,
          item.dueDate,
          item.subjectId,
          item.subject,
          item.book,
          item.unit,
          item.topic,
          item.questionCount,
          item.note,
          now,
        ),
    ),
  );
}
