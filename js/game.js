// محرك التلعيب: نقاط الخبرة، المستويات، الأوسمة، المواظبة
import { getState, save, emit } from './store.js';
import { toast, confetti, levelUpOverlay } from './ui.js';

export const XP = {
  activity: 10,      // نشاط تفاعلي (flip/match/order)
  mission: 15,       // مهمة محاكاة
  correct: 5,        // إجابة صحيحة
  lessonDone: 20,    // إتمام درس
  unitDone: 50,      // إتمام وحدة
  diagDone: 30,      // إتمام التشخيصي
  preDone: 15,       // إتمام قبلي الوحدة
  // ── طبقة العمق: تُكافأ محاولةُ الاستحضار والتنبؤ أكثر من مجرد المرور ──
  recall: 8,         // استحضار صحيح بعد فاصل زمني — أثبت أثرًا من إعادة القراءة
  predict: 6,        // التنبؤ قبل تشغيل المحاكاة (يُمنح ولو خاب التنبؤ — الفعل نفسه هو المطلوب)
  predictRight: 6,   // مكافأة إضافية عند صحة التنبؤ
  reviewDone: 12,    // إتمام «مراجعة اليوم» كاملة
};

export const LEVELS = [
  { at: 0,    rank: 'متدرب مبتدئ',        icon: '🔰' },
  { at: 120,  rank: 'مساعد فني',          icon: '🔧' },
  { at: 300,  rank: 'فنّي قياس',           icon: '📏' },
  { at: 600,  rank: 'محلّل اهتزاز',        icon: '📊' },
  { at: 1000, rank: 'أخصائي تشخيص',       icon: '🔍' },
  { at: 1500, rank: 'فنّي اتزان معتمد',    icon: '⚖️' },
  { at: 2200, rank: 'خبير صيانة تنبؤية',  icon: '🏆' },
];

export const BADGES = [
  { id: 'diag',      icon: '🗺️', title: 'بوصلة البداية', desc: 'أكملتَ الاختبار التشخيصي' },
  { id: 'first',     icon: '🥇', title: 'أول خطوة',      desc: 'أكملتَ أول درس' },
  { id: 'perfect',   icon: '✨', title: 'علامة كاملة',    desc: '100% في اختبار درس' },
  { id: 'lab5',      icon: '🔬', title: 'مستكشف المختبر', desc: 'أنجزتَ مهامًا في 5 محاكيات' },
  { id: 'mission10', icon: '🎯', title: 'صائد المهام',    desc: 'أنجزتَ 10 مهام استكشاف' },
  { id: 'streak3',   icon: '🔥', title: 'مواظب',          desc: '3 أيام متتالية فيها تدريب فعلي' },
  // ── طبقة العمق: أوسمة تكافئ الاستحضار والتنبؤ لا الزيارة — أبقِها كما هي عند تلوين الباقي ──
  { id: 'recall25',  icon: '💡', title: 'ذاكرة الفني',    desc: 'استحضرتَ 25 مفهومًا في المراجعة' },
  { id: 'revive',    icon: '🌱', title: 'إحياء',          desc: 'أعدتَ إلى الإتقان مفهومًا سقط منك' },
  { id: 'oracle',    icon: '🔮', title: 'العرّاف',         desc: 'أصبتَ 5 تنبؤات قبل تشغيل المحاكاة' },
  { id: 'u1',        icon: '〰️', title: 'عالم الاهتزاز',       desc: 'أكملتَ الوحدة الأولى' },
  { id: 'u2',        icon: '⚙️', title: 'مبادئ الاهتزاز',      desc: 'أكملتَ الوحدة الثانية' },
  { id: 'u3',        icon: '🔌', title: 'أجهزة القياس',        desc: 'أكملتَ الوحدة الثالثة' },
  { id: 'u4',        icon: '🔍', title: 'المراقبة والتشخيص',   desc: 'أكملتَ الوحدة الرابعة' },
  { id: 'u5',        icon: '⚖️', title: 'الاتزان',             desc: 'أكملتَ الوحدة الخامسة' },
  { id: 'glossary',  icon: '📖', title: 'لغوي التقنية',   desc: 'تصفحتَ قائمة المصطلحات' },
  { id: 'master',    icon: '👑', title: 'الإتقان الكامل', desc: 'أكملتَ كل الدروس' },
];

export function levelInfo(xp = getState().xp) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].at) idx = i;
  const cur = LEVELS[idx];
  const next = LEVELS[idx + 1] || null;
  const base = cur.at;
  const span = next ? next.at - base : 1;
  const pct = next ? Math.min(100, Math.round((xp - base) / span * 100)) : 100;
  return { idx, cur, next, pct };
}

export function award(amount, label) {
  const s = getState();
  const before = levelInfo(s.xp);
  s.xp += amount;
  const after = levelInfo(s.xp);
  save();
  toast(`+${amount} XP ${label ? '· ' + label : ''}`, 'xp');
  emit('xp');
  if (after.idx > before.idx) {
    setTimeout(() => {
      confetti();
      levelUpOverlay(after.cur);
      emit('xp');
    }, 450);
  }
}

export function grantBadge(id) {
  const s = getState();
  if (s.badges.includes(id)) return false;
  const b = BADGES.find(x => x.id === id);
  if (!b) return false;
  s.badges.push(id);
  save();
  setTimeout(() => {
    confetti();
    toast(`${b.icon} وسام جديد: ${b.title}`, 'badge-t');
  }, 650);
  emit('badge', id);
  return true;
}

// سلسلة الأيام: تُحسب بأيام **تدريب فعلي** لا بأيام فتح التطبيق —
// تُستدعى من كل فعل استحضار (إجابة سؤال، مراجعة اليوم)، لا من الإقلاع.
const dayKey = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

export function touchStreak() {
  const s = getState();
  const today = dayKey(new Date());
  if (s.streak.last === today) return;
  const y = dayKey(new Date(Date.now() - 86400000));
  s.streak.count = (s.streak.last === y) ? s.streak.count + 1 : 1;
  s.streak.last = today;
  save();
  if (s.streak.count >= 3) grantBadge('streak3');
  emit('xp');
}

// فحوصات أوسمة تُستدعى بعد الأحداث المهمة
export function checkBadges(course) {
  const s = getState();
  // «مستكشف المختبر» يُمنح على الإنجاز لا على الزيارة: محاكيات أُنجزت فيها مهمة فعلًا
  const simsWorked = new Set(Object.keys(s.missions).map(k => k.split(':')[0]));
  if (simsWorked.size >= 5) grantBadge('lab5');
  if (Object.keys(s.missions).length >= 10) grantBadge('mission10');
  if ((s.recallDone || 0) >= 25) grantBadge('recall25');
  if (Object.values(s.recall || {}).some(r => r.lapses > 0 && r.box >= 4)) grantBadge('revive');
  if (Object.values(s.predict || {}).filter(p => p.ok).length >= 5) grantBadge('oracle');
  if (course) {
    let allDone = true;
    for (const u of course.units) {
      const unitDone = u.lessons.every(l => s.lessons[l.id]?.done);
      if (unitDone) grantBadge(u.id); else allDone = false;
    }
    if (allDone) grantBadge('master');
  }
}
