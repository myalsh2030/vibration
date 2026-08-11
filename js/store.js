// الحالة المركزية + التخزين المحلي + بث الأحداث
//
// ⚠ يجب تغيير KEY عند استنساخ القالب — **مفتاح فريد لكل مقرر**.
// كل المنصات تُنشر تحت أصل واحد (myalsh2030.github.io) فتتشارك localStorage،
// ومفتاحان متطابقان يعني أن مقررًا يمحو تقدّم المتدرب في مقرر آخر.
// المفاتيح المحجوزة حتى الآن: fm.v1 · fmlab.v1 · rm1.v1
// (بوابة tools/validate.mjs ترفض النشر ما دام المفتاح على قيمته الافتراضية)
const KEY = 'vb.v1';

const DEFAULTS = {
  profile: null,            // {name, avatar, created}
  diag: null,               // {answers:[{unit,concept,ok}], unitScores:{u1:{ok,total}}, done:ts}
  pre: {},                  // u1:{answers:[{concept,ok}], conceptOk:{density:true}, done:ts}
  lessons: {},              // u1l1:{stepsDone:n, done:bool, quiz:{score,total,perfect}, xp:n}
  missions: {},             // 'simId:missionId': true
  simsVisited: {},          // simId: true
  recall: {},               // concept: {box:0..5, due:'YYYY-MM-DD', seen:n, lapses:n, last:'YYYY-MM-DD'}
  recallDone: 0,            // عدد الاستحضارات الصحيحة في «مراجعة اليوم» (تراكمي)
  predict: {},              // simId: {pick:n, ok:bool, revealed:bool}
  xp: 0,
  badges: [],               // ['first-steps', ...]
  streak: { last: '', count: 0 },
  glossaryVisited: false,
  theme: 'dark',            // 'dark' | 'light'
};

let state = load();
const listeners = {};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const parsed = JSON.parse(raw);
    const merged = Object.assign(structuredClone(DEFAULTS), parsed);
    // تطبيع الأنواع: قيمة تالفة في مفتاح واحد لا يجوز أن تعلّق التطبيق كله
    for (const k of Object.keys(DEFAULTS)) {
      const def = DEFAULTS[k], v = merged[k];
      if (def !== null && typeof def === 'object' && !Array.isArray(def)) {
        if (v === null || typeof v !== 'object' || Array.isArray(v)) merged[k] = structuredClone(def);
      } else if (Array.isArray(def) && !Array.isArray(v)) merged[k] = [];
      else if (typeof def === 'number' && typeof v !== 'number') merged[k] = def;
      else if (typeof def === 'boolean' && typeof v !== 'boolean') merged[k] = def;
      else if (typeof def === 'string' && typeof v !== 'string') merged[k] = def;
    }
    if (merged.profile !== null && (typeof merged.profile !== 'object' || !merged.profile?.name)) merged.profile = null;
    if (merged.diag !== null && typeof merged.diag !== 'object') merged.diag = null;
    if (typeof merged.streak.last !== 'string') merged.streak.last = '';
    if (typeof merged.streak.count !== 'number') merged.streak.count = 0;
    return merged;
  } catch {
    return structuredClone(DEFAULTS);
  }
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* مساحة ممتلئة */ }
}

export function getState() { return state; }

export function resetAll() {
  state = structuredClone(DEFAULTS);
  try { localStorage.removeItem(KEY); } catch {}
  emit('reset');
}

export function on(event, fn) {
  (listeners[event] ||= []).push(fn);
  return () => { listeners[event] = (listeners[event] || []).filter(f => f !== fn); };
}

export function emit(event, data) {
  (listeners[event] || []).forEach(fn => { try { fn(data); } catch (e) { console.error(e); } });
}

// ----- مساعدات درس -----
export function lessonState(id) {
  return state.lessons[id] ||= { stepsDone: 0, done: false, quiz: null, xp: 0 };
}

export function isLessonDone(id) {
  return !!state.lessons[id]?.done;
}

export function unitProgress(unit) {
  const total = unit.lessons.length;
  const done = unit.lessons.filter(l => isLessonDone(l.id)).length;
  return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
}
