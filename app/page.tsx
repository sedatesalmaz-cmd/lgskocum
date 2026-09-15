'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookCheck,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  GraduationCap,
  House,
  ImagePlus,
  Lightbulb,
  Menu,
  MessageCircleMore,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UsersRound,
  X,
} from 'lucide-react';
import { TopicsWorkspace } from '@/components/topics-workspace';
import { CoachWorkspace, type Assignment } from '@/components/coach-workspace';
import { WrongQuestionModal, type QuestionContext } from '@/components/wrong-question-modal';
import { ProgressDashboard } from '@/components/progress-dashboard';
import { QuestionCatalog } from '@/components/question-catalog';
import { AdminPanel } from '@/components/admin-panel';
import {
  StudyEntryModal,
  type StudyResult,
} from '@/components/study-entry-modal';
import { DailyCoachDashboard } from '@/components/daily-coach-dashboard';
import { AccessGate, type UserSession } from '@/components/access-gate';

const subjects = [
  ['Paragraf', '¶', '#ef725f', '#ffebe6', 0],
  ['Matematik', 'π', '#7357c7', '#eee9fb', 0],
  ['Türkçe', 'Aa', '#ef725f', '#ffebe6', 0],
  ['Fen', '⚗', '#238e89', '#dff4ef', 0],
  ['İnkılap', '✦', '#d59a22', '#fff2cf', 0],
] as const;
const coaches = [
  ['MT', 'Matematik', 'Merve T.', 'Yeni değerlendirme', '#7357c7'],
  ['TÖ', 'Türkçe', 'Tolga Ö.', 'Rapor hazır', '#ef725f'],
  ['SA', 'Fen Bilimleri', 'Selin A.', 'İnceliyor', '#238e89'],
  ['EK', 'İnkılap Tarihi', 'Eren K.', 'Rapor hazır', '#d59a22'],
  ['DY', 'Din Kültürü', 'Derya Y.', 'Rapor hazır', '#5377c6'],
  ['CE', 'İngilizce', 'Cansu E.', 'Yeni değerlendirme', '#a2589e'],
] as const;
function Ring({ value }: { value: number }) {
  return (
    <div
      className="ring"
      style={{ '--value': `${value * 3.6}deg` } as React.CSSProperties}
    >
      <div>
        <strong>{value}</strong>
        <span>%</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [wrongOpen, setWrongOpen] = useState(false);
  const [wrongContext, setWrongContext] = useState<{
    assignment: QuestionContext;
    studyResultId: number;
  } | null>(null);
  const [view, setView] = useState<'student' | 'adult'>('student');
  const [section, setSection] = useState<
    'today' | 'topics' | 'assignments' | 'progress' | 'catalog' | 'admin'
  >('today');
  const [navOpen, setNavOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [count, setCount] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [studyResults, setStudyResults] = useState<Record<number, StudyResult>>(
    {},
  );
  const acceptSession = useCallback((next: UserSession) => {
    setSession(next);
    setView(next.role === 'student' ? 'student' : 'adult');
    setSection('today');
  }, []);
  const signOut = async () => {
    await fetch('/api/access', { method: 'DELETE' });
    setSession(null);
    setAssignments([]);
    setStudyResults({});
  };
  const openWrongQuestion = (
    assignment?: QuestionContext,
    studyResultId?: number,
  ) => {
    setWrongContext(
      assignment && studyResultId ? { assignment, studyResultId } : null,
    );
    setWrongOpen(true);
  };
  const todayKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const todayAssignments = assignments.filter(
    (item) => item.dueDate === todayKey,
  );
  const weekAgoDate = new Date(`${todayKey}T12:00:00`);
  weekAgoDate.setDate(weekAgoDate.getDate() - 7);
  const weekAgoKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(weekAgoDate);
  const carryoverAssignments = assignments.filter(
    (item) =>
      item.dueDate < todayKey &&
      item.dueDate >= weekAgoKey &&
      !studyResults[item.id],
  );
  const todayTarget = todayAssignments.reduce(
    (sum, item) => sum + item.questionCount,
    0,
  );
  const todayAssignmentIds = new Set(todayAssignments.map((item) => item.id));
  const todayTotals = Object.values(studyResults)
    .filter((item) => todayAssignmentIds.has(item.assignmentId))
    .reduce(
      (sum, item) => ({
        total: sum.total + item.total,
        correct: sum.correct + item.correct,
        wrong: sum.wrong + item.wrong,
        blank: sum.blank + item.blank,
      }),
      { total: 0, correct: 0, wrong: 0, blank: 0 },
    );
  const todayRate = todayTarget
    ? Math.min(100, Math.round((todayTotals.total / todayTarget) * 100))
    : 0;
  const completedTasks = todayAssignments.filter(
    (item) => studyResults[item.id],
  ).length;
  useEffect(() => {
    if (!session) return;
    fetch('/api/assignments')
      .then((r) => r.json())
      .then((data: { assignments?: Assignment[] }) => {
        setAssignments(data.assignments ?? []);
      })
      .catch(() => {});
    fetch(`/api/study-results?from=${weekAgoKey}&to=${todayKey}`)
      .then((r) => r.json())
      .then((data: { results?: StudyResult[] }) =>
        setStudyResults(
          Object.fromEntries(
            (data.results ?? [])
              .filter((x) => x.assignmentId)
              .map((x) => [x.assignmentId, x]),
          ),
        ),
      )
      .catch(() => {});
  }, [todayKey, weekAgoKey, session]);
  const addAssignment = async (item: Omit<Assignment, 'id'>) => {
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = (await response.json()) as { assignment?: Assignment; error?: string };
      if (!response.ok || !data.assignment)
        return { assignment: null, error: data.error ?? 'Ödev eklenemedi.' };
      setAssignments((current) => [data.assignment!, ...current]);
      return { assignment: data.assignment };
    } catch {
      return { assignment: null, error: 'Bağlantı kurulamadı. Lütfen tekrar deneyin.' };
    }
  };
  const deleteAssignment = async (id: number) => {
    try {
      const response = await fetch(`/api/assignments?id=${id}`, { method: 'DELETE' });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok)
        return { ok: false, error: data.error ?? 'Ödev iptal edilemedi.' };
      setAssignments((current) => current.filter((item) => item.id !== id));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Bağlantı kurulamadı. Lütfen tekrar deneyin.' };
    }
  };
  const undoResult = async (assignmentId: number) => {
    const response = await fetch(
      `/api/study-results?assignmentId=${assignmentId}`,
      { method: 'DELETE' },
    );
    if (!response.ok) return;
    setStudyResults((current) => {
      const next = { ...current };
      delete next[assignmentId];
      return next;
    });
  };
  const save = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
    }, 900);
  };
  if (!session)
    return (
      <main className="shell">
        <AccessGate onAuthenticated={acceptSession} />
      </main>
    );
  return (
    <main className="shell">
      {navOpen && (
        <button
          className="mobile-nav-backdrop"
          aria-label="Menüyü kapat"
          onClick={() => setNavOpen(false)}
        />
      )}
      <aside className={`side ${navOpen ? 'mobile-open' : ''}`}>
        <button
          className="brand"
          aria-label="Bugünkü rotaya git"
          onClick={() => {
            setSection('today');
            setNavOpen(false);
          }}
        >
          <span>R</span>
        </button>
        <nav>
          <button
            className={section === 'today' ? 'active' : ''}
            onClick={() => {
              setSection('today');
              setNavOpen(false);
            }}
          >
            <House />
            <i>Bugün</i>
          </button>
          <button
            className={
              (
                view === 'student'
                  ? section === 'topics'
                  : section === 'assignments'
              )
                ? 'active'
                : ''
            }
            onClick={() => {
              setSection(view === 'student' ? 'topics' : 'assignments');
              setNavOpen(false);
            }}
          >
            <Target />
            <i>{view === 'student' ? 'Konularım' : 'Ödev Ver'}</i>
          </button>
          <button
            className={section === 'progress' ? 'active' : ''}
            onClick={() => {
              setSection('progress');
              setNavOpen(false);
            }}
          >
            <BarChart3 />
            <i>Gelişim</i>
          </button>
          {view === 'adult' && (
            <>
              <button
                className={section === 'catalog' ? 'active' : ''}
                onClick={() => {
                  setSection('catalog');
                  setNavOpen(false);
                }}
              >
                <BookCheck />
                <i>Soru Kataloğu</i>
              </button>
              {session.role === 'admin' && <button
                className={section === 'admin' ? 'active' : ''}
                onClick={() => {
                  setSection('admin');
                  setNavOpen(false);
                }}
              >
                <ShieldCheck />
                <i>Yönetim</i>
              </button>}
            </>
          )}
          {view === 'adult' && <button
            onClick={() => {
              setView('adult');
              setSection('today');
              setNavOpen(false);
            }}
          >
            <UsersRound />
            <i>Koçlarım</i>
          </button>}
        </nav>
        <button className="mini">D</button>
      </aside>
      <section className="workspace">
        <header className="top">
          <button
            className="hamb"
            aria-label={navOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((current) => !current)}
          >
            <Menu />
          </button>
          <div className="switch"><button className="on">{session.role === 'student' ? 'Deniz' : session.role === 'admin' ? 'Admin' : 'Koç & Öğretmen'}</button></div>
          <div className="topright">
            <span>
              <Flame /> 0 günlük seri
            </span>
            <b>S</b>
            <button className="session-exit" onClick={() => void signOut()}>Çıkış</button>
          </div>
        </header>
        {section === 'progress' ? (
          <ProgressDashboard
            canEdit={view === 'adult'}
            assignments={assignments}
          />
        ) : section === 'catalog' && view === 'adult' ? (
          <QuestionCatalog />
        ) : section === 'admin' && view === 'adult' ? (
          <AdminPanel
            onDataCleared={() => {
              setAssignments([]);
              setStudyResults({});
            }}
          />
        ) : view === 'student' ? (
          section === 'topics' ? (
            <TopicsWorkspace onWrong={(context, id) => openWrongQuestion(context, id)} />
          ) : (
            <div className="page student-visual">
              <div className="welcome student-welcome">
                <div>
                  <p className="eyebrow">4–10 EYLÜL HAFTASI</p>
                  <h1>
                    Bugünkü rotan <span>hazır Deniz!</span>
                  </h1>
                  <p>
                    Bir göreve dokun, sonucunu gir ve ilerleme halkasını
                    tamamla.
                  </p>
                </div>
                <div className="student-badges">
                  <span>
                    <Flame /> Bugünün ritmi
                  </span>
                  <b>
                    {completedTasks}/{todayAssignments.length} görev
                  </b>
                </div>
              </div>
              <section className="hero student-hero">
                <article className="daily">
                  <div className="dailycopy">
                    <span className="pill">
                      <Sparkles /> BUGÜNÜN HEDEFİ
                    </span>
                    <h2>
                      {todayAssignments.length > 0 ? (
                        <>
                          Bugün {todayAssignments.length} görevde
                          <br />
                          {todayTarget} soru seni bekliyor.
                        </>
                      ) : (
                        <>
                          Bugün için atanmış
                          <br />
                          bir çalışma bulunmuyor.
                        </>
                      )}
                    </h2>
                    <p>
                      {todayAssignments.length > 0
                        ? todayRate >= 100
                          ? 'Harika! Bugünkü hedefini tamamladın.'
                          : 'Her tamamlanan görev seni hedefe biraz daha yaklaştırıyor.'
                        : 'Bugün dinlenip yarının rotasına hazırlanabilirsin.'}
                    </p>
                  </div>
                  <div className="dailyprogress">
                    <Ring value={todayRate} />
                    <b>
                      {todayTotals.total} / {todayTarget} soru
                    </b>
                    <small>
                      {todayAssignments.length > 0
                        ? `${Math.max(0, todayTarget - todayTotals.total)} soru kaldı`
                        : 'Bugün dinlenme günü'}
                    </small>
                  </div>
                </article>
                <article className="note student-note">
                  <div className="notehead">
                    <span className="coachavatar">
                      <Star />
                    </span>
                    <div>
                      <small>BUGÜNÜN MESAJI</small>
                      <b>
                        {todayRate >= 100
                          ? 'Rota tamamlandı!'
                          : todayRate >= 50
                            ? 'Yarıyı geçtin!'
                            : 'Küçük adımlarla başla'}
                      </b>
                    </div>
                    <MessageCircleMore />
                  </div>
                  <blockquote>
                    {todayRate >= 100
                      ? 'Bugünkü emeğin haftalık hedefine güçlü bir katkı sağladı.'
                      : todayRate >= 50
                        ? 'Ritmini koru; sıradaki görev seni hedefe daha da yaklaştıracak.'
                        : 'İlk göreve dokunarak başlayabilirsin. Başlamak en büyük adımdır.'}
                  </blockquote>
                  <div className="mini-progress">
                    <i>
                      <u style={{ width: `${todayRate}%` }} />
                    </i>
                    <span>%{todayRate}</span>
                  </div>
                </article>
              </section>
              <section className="student-kpis">
                <article>
                  <span className="kpi-icon solved">
                    <BookOpen />
                  </span>
                  <div>
                    <small>ÇÖZÜLEN</small>
                    <b>{todayTotals.total}</b>
                  </div>
                </article>
                <article>
                  <span className="kpi-icon correct">
                    <Check />
                  </span>
                  <div>
                    <small>DOĞRU</small>
                    <b>{todayTotals.correct}</b>
                  </div>
                </article>
                <article>
                  <span className="kpi-icon wrong-kpi">
                    <X />
                  </span>
                  <div>
                    <small>YANLIŞ</small>
                    <b>{todayTotals.wrong}</b>
                  </div>
                </article>
                <article>
                  <span className="kpi-icon blank">
                    <Clock3 />
                  </span>
                  <div>
                    <small>BOŞ</small>
                    <b>{todayTotals.blank}</b>
                  </div>
                </article>
              </section>
              <section className="route">
                <Heading
                  kicker="BUGÜNKÜ ROTA"
                  title="Göreve dokun ve sonucunu gir"
                  color="coral"
                  extra={<span className="done">Günlük giriş</span>}
                />
                <div className="tasks">
                  {todayAssignments.length === 0 ? (
                    <p>Bugün için ödev bulunmuyor.</p>
                  ) : (
                    todayAssignments.map((item) => (
                      <Task
                        key={item.id}
                        done={Boolean(studyResults[item.id])}
                        onClick={() => setSelectedAssignment(item)}
                        onUndo={
                          studyResults[item.id]
                            ? () => undoResult(item.id)
                            : undefined
                        }
                        icon={item.subjectId === 'matematik' ? 'π' : '•'}
                        color={
                          item.subjectId === 'matematik' ? 'purple' : 'teal'
                        }
                        top={
                          item.subject.toUpperCase() +
                          ' · ' +
                          item.questionCount +
                          ' SORU'
                        }
                        title={item.topic}
                        meta={
                          studyResults[item.id]
                            ? `${studyResults[item.id].correct}D · ${studyResults[item.id].wrong}Y · ${studyResults[item.id].blank}B`
                            : [item.book, item.note].filter(Boolean).join(' · ')
                        }
                      />
                    ))
                  )}
                </div>
              </section>
              {carryoverAssignments.length > 0 && (
                <section className="route carryover-route">
                  <Heading
                    kicker="ÖNCEKİ TARİHTEN KALAN"
                    title="Bu görevler seni bekliyor"
                    color="violet"
                    extra={
                      <span className="carryover-count">
                        Son 7 gün · {carryoverAssignments.length} görev
                      </span>
                    }
                  />
                  <p className="carryover-help">
                    Tamamlanmamış görevler yedi gün boyunca burada kalır. Göreve
                    dokunduğunda çalışma bugünün tarihine kaydedilir.
                  </p>
                  <div className="tasks">
                    {carryoverAssignments.map((item) => (
                      <Task
                        key={item.id}
                        done={false}
                        onClick={() => setSelectedAssignment(item)}
                        icon={item.subjectId === 'matematik' ? 'π' : '•'}
                        color={
                          item.subjectId === 'matematik' ? 'purple' : 'teal'
                        }
                        top={`${item.subject.toUpperCase()} · ${item.questionCount} SORU`}
                        title={item.topic}
                        meta={`${new Date(`${item.dueDate}T12:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} tarihinden kaldı · ${item.book}`}
                      />
                    ))}
                  </div>
                </section>
              )}
              <section className="lower">
                <article className="weak">
                  <Heading
                    kicker="GÜÇLENDİRME ZAMANI"
                    title="Birlikte toparlayalım"
                    color="violet"
                    extra={<Lightbulb />}
                  />
                  <div className="weaktopic">
                    <span>
                      0<small>/100</small>
                    </span>
                    <div>
                      <small>VERİ BEKLENİYOR</small>
                      <b>Henüz güçlendirme konusu yok</b>
                      <p>
                        Geçmiş çalışmalar girildiğinde öncelikli konular burada
                        belirlenecek.
                      </p>
                    </div>
                  </div>
                </article>
                <article className="wrong">
                  <span className="camera">
                    <Camera />
                  </span>
                  <div>
                    <p className="eyebrow tealtext">YANLIŞ DEFTERİM</p>
                    <h2>Takıldığın soruyu sakla</h2>
                    <p>
                      Fotoğrafını çek, konusunu seç. Koçun görsün; zamanı
                      gelince tekrar karşına çıksın.
                    </p>
                    <button onClick={() => openWrongQuestion()}>
                      <ImagePlus /> Fotoğrafla soru ekle
                    </button>
                  </div>
                </article>
              </section>
            </div>
          )
        ) : section === 'assignments' ? (
          <CoachWorkspace
            assignments={assignments}
            onAdd={addAssignment}
            onDelete={deleteAssignment}
          />
        ) : (
          <>
            <DailyCoachDashboard assignments={assignments} />
            <div className="page">
              <div className="welcome">
                <div>
                  <p className="eyebrow">
                    HAFTALIK DEĞERLENDİRME · VERİ BEKLENİYOR
                  </p>
                  <h1>
                    Deniz’in haftası <span>bir bakışta.</span>
                  </h1>
                </div>
                <button
                  className="outline"
                  onClick={() => setSection('assignments')}
                >
                  Ödev ver <ArrowRight />
                </button>
              </div>
              <section className="summaries">
                <Summary
                  icon={<BookOpen />}
                  cls="violetbg"
                  label="ÇÖZÜLEN SORU"
                  value="0"
                  detail="Veri yok"
                />
                <Summary
                  icon={<Target />}
                  cls="coralbg"
                  label="HAFTALIK DOĞRULUK"
                  value="%0"
                  detail="Veri yok"
                />
                <Summary
                  icon={<GraduationCap />}
                  cls="tealbg"
                  label="HAZIR KONULAR"
                  value="0 / 0"
                  detail="Veri yok"
                />
              </section>
              <section className="adultgrid">
                <article className="coachpanel">
                  <Heading
                    kicker="BRANŞ KOÇLARI"
                    title="Uzman değerlendirmeleri"
                    color="violet"
                    extra={<span className="done">6 branş</span>}
                  />
                  <div className="coachtabs">
                    {coaches.map((c, i) => (
                      <button
                        key={c[1]}
                        className={i === 0 ? 'selected' : ''}
                        style={{ '--coach': c[4] } as React.CSSProperties}
                      >
                        <span>{c[0]}</span>
                        <div>
                          <b>{c[1]}</b>
                          <small>Veri bekleniyor</small>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="evaluation">
                    <div className="evalhead">
                      <span className="coachavatar large">—</span>
                      <div>
                        <small>HAFTALIK RAPOR</small>
                        <h3>Henüz değerlendirme oluşturulmadı</h3>
                      </div>
                    </div>
                    <p>
                      Gerçek çalışma verileri girilip hafta kapatıldığında branş
                      raporları burada görünecek.
                    </p>
                  </div>
                </article>
                <aside className="readiness">
                  <Heading
                    kicker="KONU HARİTASI"
                    title="Hazır oluş"
                    color="coral"
                  />
                  {subjects.map((s) => (
                    <div className="subject" key={s[0]}>
                      <span style={{ background: s[3], color: s[2] }}>
                        {s[1]}
                      </span>
                      <div>
                        <b>{s[0]}</b>
                        <i>
                          <u style={{ width: `${s[4]}%`, background: s[2] }} />
                        </i>
                      </div>
                      <strong>{s[4]}</strong>
                    </div>
                  ))}
                  <button className="link">
                    Tüm konu haritası <ArrowRight />
                  </button>
                </aside>
              </section>
            </div>
          </>
        )}
      </section>
      {open && (
        <div
          className="backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <section className="modal" role="dialog" aria-modal="true">
            <button className="close" onClick={() => setOpen(false)}>
              <X />
            </button>
            <span className="modalicon">π</span>
            <p className="eyebrow">HIZLI KAYIT</p>
            <h2>Ne çalıştın?</h2>
            <label>Ders ve konu</label>
            <button className="select">
              <span>
                <b>Matematik</b>
                <small>Doğrusal Denklemler</small>
              </span>
              <ChevronRight />
            </button>
            <div className="numbers">
              <Counter
                label="Toplam soru"
                value={count}
                minus={() => setCount(Math.max(0, count - 5))}
                plus={() => setCount(count + 5)}
              />
              <Counter
                label="Yanlış"
                value={wrong}
                minus={() => setWrong(Math.max(0, wrong - 1))}
                plus={() => setWrong(Math.min(count, wrong + 1))}
              />
            </div>
            <div className="result">
              <span>
                <Check /> Doğru
              </span>
              <b>{Math.max(0, count - wrong)}</b>
              <span>Net</span>
              <b>{(Math.max(0, count - wrong) - wrong / 3).toFixed(2)}</b>
            </div>
            <button className={`save ${saved ? 'saved' : ''}`} onClick={save}>
              {saved ? (
                <>
                  <Check /> Kaydedildi!
                </>
              ) : (
                <>
                  Çalışmayı kaydet <ArrowRight />
                </>
              )}
            </button>
          </section>
        </div>
      )}
      <WrongQuestionModal
        open={wrongOpen}
        assignment={wrongContext?.assignment}
        studyResultId={wrongContext?.studyResultId}
        onClose={() => {
          setWrongOpen(false);
          setWrongContext(null);
        }}
      />
      {selectedAssignment && (
        <StudyEntryModal
          assignment={selectedAssignment}
          existing={studyResults[selectedAssignment.id]}
          defaultStudyDate={
            selectedAssignment.dueDate < todayKey ? todayKey : undefined
          }
          onClose={() => setSelectedAssignment(null)}
          onSaved={(result) => {
            const assignment = selectedAssignment;
            setStudyResults((x) => ({ ...x, [result.assignmentId]: result }));
            setSelectedAssignment(null);
            if (result.wrong + result.blank > 0)
              openWrongQuestion(assignment, result.id);
          }}
        />
      )}
    </main>
  );
}
function Heading({
  kicker,
  title,
  color,
  extra,
}: {
  kicker: string;
  title: string;
  color: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="heading">
      <div>
        <p className={`eyebrow ${color}`}>{kicker}</p>
        <h2>{title}</h2>
      </div>
      {extra}
    </div>
  );
}
function Task({
  done,
  onClick,
  onUndo,
  icon,
  color,
  top,
  title,
  meta,
}: {
  done?: boolean;
  onClick?: () => void;
  onUndo?: () => void;
  icon: string;
  color: string;
  top: string;
  title: string;
  meta: string;
}) {
  return (
    <article
      className={`task ${done ? 'complete' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <span className="task-check">{done && <Check />}</span>
      <span className={`taskicon ${color}`}>{icon}</span>
      <div className="task-copy">
        <small>{top}</small>
        <b>{title}</b>
      </div>
      <em>
        <Clock3 /> <span>{meta}</span>
      </em>
      {onUndo && (
        <button
          className="undo-task"
          onClick={(e) => {
            e.stopPropagation();
            onUndo();
          }}
          title="Bu girişi sil"
        >
          <RotateCcw /> Geri al
        </button>
      )}
    </article>
  );
}
function Summary({
  icon,
  cls,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  cls: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="summary">
      <span className={cls}>{icon}</span>
      <div>
        <small>{label}</small>
        <b>{value}</b>
        <em>
          <TrendingUp /> {detail}
        </em>
      </div>
    </article>
  );
}
function Counter({
  label,
  value,
  minus,
  plus,
}: {
  label: string;
  value: number;
  minus: () => void;
  plus: () => void;
}) {
  return (
    <label>
      {label}
      <div>
        <button onClick={minus}>−</button>
        <strong>{value}</strong>
        <button onClick={plus}>+</button>
      </div>
    </label>
  );
}
