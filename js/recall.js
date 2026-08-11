// محرك الاستحضار المتباعد — «مراجعة اليوم»
//
// الفكرة التربوية: المعلومة تُنسى بعد أيام من تعلّمها، وأقوى ما يثبّتها ليس إعادة القراءة
// بل **محاولة الاستحضار** قبيل النسيان. فبدل أن يمرّ المتدرب على الدرس مرة واحدة،
// يعيده هذا المحرك عليه بفواصل متباعدة: يوم، ثم ثلاثة، ثم أسبوع… وكلما أخطأ عاد للبداية.
//
// كل مفهوم في عقد المفاهيم (data/concepts.js) له «صندوق» من 0 إلى 5:
//   0 = جديد أو ساقط (يُسأل اليوم)      1..5 = بفواصل BOX_DAYS
// ولا يُسأل مفهوم إلا بعد إنجاز درسه — فلا يفسد المحرك تسلسل المقرر المقفل.

import { getState, save, isLessonDone } from './store.js';
import { COURSE } from '../data/course.js';
import { QUIZZES } from '../data/quizzes.js';
import { CONCEPTS } from '../data/concepts.js';
import { shuffled } from './ui.js';

export const BOX_DAYS = [1, 3, 7, 16, 35];   // فاصل الصندوق 1..5 بالأيام
export const SESSION_MAX = 8;                 // سقف أسئلة الجلسة الواحدة — قصيرة تُنجَز يوميًا

// ───────────────────────── فهارس ثابتة ─────────────────────────
const meta = new Map(CONCEPTS.map(c => [c.id, c]));

// مفهوم ← الدرس الذي يُدرَّس فيه أولًا (بوابة الإتاحة)
const homeLesson = new Map();
for (const u of COURSE.units || []) for (const l of u.lessons || []) {
  for (const c of l.concepts || []) if (!homeLesson.has(c)) homeLesson.set(c, { lesson: l.id, unit: u.id, title: l.title });
}

// مفهوم ← أسئلته من كل البنوك (بلا تكرار نصّي)
const pool = new Map();
for (const [bank, q] of Object.entries(QUIZZES)) {
  for (const it of q.questions || []) {
    if (!it.concept) continue;
    if (!pool.has(it.concept)) pool.set(it.concept, []);
    const arr = pool.get(it.concept);
    if (!arr.some(x => x.q === it.q)) arr.push({ ...it, bank });
  }
}

// ───────────────────────── تقويم ─────────────────────────
const dayKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const today = () => dayKey(new Date());
const plusDays = n => dayKey(new Date(Date.now() + n * 86400000));

// ───────────────────────── الحالة ─────────────────────────
function slot(concept) {
  const s = getState();
  return s.recall[concept] ||= { box: 0, due: today(), seen: 0, lapses: 0, last: '' };
}

/**
 * تسجيل محاولة استحضار. تُستدعى من كل موضع يجيب فيه المتدرب عن سؤال موسوم بمفهوم:
 * نقطة تفتيش الدرس، القبلي، التشخيصي، ومراجعة اليوم نفسها.
 * @returns {{box:number, revived:boolean}} حالة المفهوم بعد التسجيل
 */
export function record(concept, ok) {
  if (!concept || !meta.has(concept)) return { box: 0, revived: false };
  const r = slot(concept);
  const wasBox = r.box;
  r.seen++;
  r.last = today();
  if (ok) {
    r.box = Math.min(r.box + 1, BOX_DAYS.length);
    r.due = plusDays(BOX_DAYS[r.box - 1]);
  } else {
    if (wasBox >= 3) r.lapses++;      // نسيان حقيقي بعد إتقان — لا خطأ متعلّم جديد
    r.box = 1;
    r.due = plusDays(BOX_DAYS[0]);
  }
  save();
  return { box: r.box, revived: ok && wasBox === 1 && r.lapses > 0 };
}

/** هل صار المفهوم متاحًا للمراجعة؟ (دُرِّس فعلًا وأُنجز درسه) */
function available(concept) {
  const h = homeLesson.get(concept);
  return !!h && isLessonDone(h.lesson) && (pool.get(concept) || []).length > 0;
}

/** المفاهيم المستحقة اليوم، مرتبة بالأولوية: الساقط أولًا ثم الأقدم استحقاقًا ثم الأضعف صندوقًا */
export function dueList() {
  const s = getState();
  const t = today();
  const out = [];
  for (const c of meta.keys()) {
    if (!available(c)) continue;
    const r = s.recall[c];
    if (!r) continue;                    // لم يُسأل عنه قط — يدخل الجدول عند أول إجابة
    if (r.last === t) continue;          // رُوجع اليوم — لا يتكرر في اليوم نفسه
    if (r.due > t) continue;
    out.push({ concept: c, ...r });
  }
  out.sort((a, b) => (b.lapses - a.lapses) || (a.due < b.due ? -1 : a.due > b.due ? 1 : 0) || (a.box - b.box));
  return out;
}

export function dueCount() { return dueList().length; }

/**
 * بناء جلسة مراجعة: سؤال واحد لكل مفهوم مستحق، **مشابكة** بين الوحدات لا تجميعًا —
 * الخلط بين موضوعات مختلفة يجبر الذهن على اختيار الأداة الصحيحة، وهو أنفع من التكرار المتجانس.
 */
export function buildSession(max = SESSION_MAX) {
  const due = dueList();
  if (!due.length) return [];

  // اسحب سؤالًا لكل مفهوم (عشوائيًا من مجموعته لتفادي حفظ نص بعينه)
  const picked = due.map(d => {
    const qs = pool.get(d.concept) || [];
    const q = shuffled(qs)[0];
    return { ...q, concept: d.concept, box: d.box, lapses: d.lapses };
  });

  // مشابكة: دوّر على الوحدات بالتناوب بدل تسليم أسئلة الوحدة الواحدة متتابعة
  const byUnit = new Map();
  for (const q of picked) {
    const un = homeLesson.get(q.concept)?.unit || 'u?';
    if (!byUnit.has(un)) byUnit.set(un, []);
    byUnit.get(un).push(q);
  }
  const lanes = [...byUnit.values()];
  const out = [];
  while (out.length < max && lanes.some(l => l.length)) {
    for (const lane of lanes) {
      if (!lane.length || out.length >= max) continue;
      out.push(lane.shift());
    }
  }
  return out;
}

/** ملخص للعرض في «أنا» وفي الرئيسية */
export function recallStats() {
  const s = getState();
  const known = Object.entries(s.recall).filter(([c]) => meta.has(c));
  const mastered = known.filter(([, r]) => r.box >= 4).length;
  const learning = known.filter(([, r]) => r.box >= 1 && r.box < 4).length;
  const shaky = known.filter(([, r]) => r.lapses > 0 && r.box < 3).length;
  return {
    tracked: known.length,
    total: CONCEPTS.length,
    mastered, learning, shaky,
    due: dueCount(),
    correct: s.recallDone || 0,
  };
}

/** تسمية المفهوم للعرض (من العقد، وإلا فالمعرّف) */
export function conceptLabel(c) { return meta.get(c)?.label || c; }

/** الدرس الذي يشرح هذا المفهوم — لزر «راجع الدرس» بعد خطأ */
export function conceptLesson(c) { return homeLesson.get(c) || null; }
