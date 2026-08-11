// «مراجعة اليوم» — جلسة استحضار متباعد قصيرة تُنجَز يوميًا
// لا تعرض محتوى جديدًا: تعيد ما دُرِّس فعلًا قُبيل نسيانه، ومشابكةً بين الوحدات.
import { el, icon } from '../ui.js';
import { getState, save } from '../store.js';
import { runQuiz, resultCard } from '../quiz.js';
import { award, XP, checkBadges } from '../game.js';
import { buildSession, recallStats, conceptLabel, conceptLesson, SESSION_MAX } from '../recall.js';
import { COURSE } from '../../data/course.js';

export function renderReview(app) {
  const stats = recallStats();
  const session = buildSession(SESSION_MAX);

  if (!session.length) { renderEmpty(app, stats); return; }

  app.append(
    el('h1', { class: 'page-title' }, '💡 مراجعة اليوم'),
    el('p', { class: 'page-sub' },
      `${session.length} ${session.length === 1 ? 'سؤال' : session.length === 2 ? 'سؤالان' : 'أسئلة'} من دروس سبقت. `
      + 'لا تعد إلى الدرس قبل المحاولة — محاولة الاستحضار نفسها هي التي تُثبّت المعلومة، ولو أخطأت.'),
  );

  const stage = el('div');
  app.append(stage);

  runQuiz(stage, { questions: session }, {
    xpPerCorrect: XP.recall,
    onDone(result, host) {
      const s = getState();
      s.recallDone = (s.recallDone || 0) + result.score;
      save();
      award(XP.reviewDone, 'إتمام مراجعة اليوم');
      checkBadges(COURSE);

      // المفاهيم التي سقطت اليوم ← روابط مباشرة إلى دروسها (بلا تكرار)
      const missed = [...new Set(result.answers.filter(a => !a.ok && a.concept).map(a => a.concept))];

      host.innerHTML = '';
      host.append(resultCard(result, {
        msg: result.pct === 100
          ? 'استحضار كامل — هذه المفاهيم تباعدت مواعيدها، ولن تراها قريبًا.'
          : 'ما أخطأتَ فيه سيعود غدًا. هذا مقصود: التكرار بعد الخطأ هو ما يُثبّت.',
        actions: [
          ...missed.map(c => {
            const L = conceptLesson(c);
            return L ? el('a', { class: 'btn ghost sm', href: `#/lesson/${L.lesson}` },
              `↻ راجع «${conceptLabel(c)}» في ${L.title}`) : null;
          }).filter(Boolean),
          el('a', { class: 'btn wide', href: '#/' }, 'إلى خريطة الرحلة 🚀'),
        ],
      }));
      host.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  });
}

// لا شيء مستحق اليوم — نعرض حالة الذاكرة بدل صفحة فارغة
function renderEmpty(app, stats) {
  const seeded = stats.tracked > 0;
  app.append(
    el('h1', { class: 'page-title' }, '💡 مراجعة اليوم'),
    el('div', { class: 'card center' },
      el('div', { style: 'font-size:52px' }, seeded ? '✅' : '🌱'),
      el('div', { style: 'font-weight:800; font-size:17px; margin-top:6px' },
        seeded ? 'لا شيء مستحق اليوم' : 'لم تبدأ ذاكرتك بعد'),
      el('p', { class: 'small muted', style: 'margin-top:6px' },
        seeded
          ? 'كل مفهوم درستَه ما زال في موعده. عُد غدًا — أو تقدّم في مرحلة جديدة.'
          : 'أجب عن نقطة تفتيش أو عن الاختبار التشخيصي، وستبدأ المفاهيم بالدخول إلى جدول المراجعة تلقائيًا.'),
      el('a', { class: 'btn wide', style: 'margin-top:14px', href: '#/' }, 'إلى خريطة الرحلة 🚀'),
    ),
    seeded ? memoryCard(stats) : '',
  );
}

// شريط حالة الذاكرة — يُستعمل هنا وفي شاشة «أنا»
export function memoryCard(stats = recallStats()) {
  const bars = [
    { n: stats.mastered, label: 'مُتقن', color: 'var(--c-ok)' },
    { n: stats.learning, label: 'قيد التثبيت', color: 'var(--c-water)' },
    { n: stats.shaky, label: 'يحتاج تكرارًا', color: '#fb923c' },
  ];
  const total = Math.max(1, stats.tracked);
  return el('div', { class: 'card' },
    el('div', { style: 'font-weight:800; font-size:15px; margin-bottom:8px' }, '📊 حالة ذاكرتك'),
    el('div', { style: 'display:flex; height:12px; border-radius:99px; overflow:hidden; gap:2px' },
      bars.map(b => b.n ? el('div', { style: `width:${b.n / total * 100}%; background:${b.color}` }) : null).filter(Boolean)),
    el('div', { style: 'display:flex; gap:14px; flex-wrap:wrap; margin-top:8px' },
      bars.map(b => el('span', { class: 'small muted' },
        el('span', { style: `display:inline-block;width:9px;height:9px;border-radius:3px;background:${b.color};margin-inline-end:5px` }),
        `${b.label}: ${b.n}`))),
    el('div', { class: 'small muted', style: 'margin-top:8px' },
      `${stats.tracked} من ${stats.total} مفهومًا دخلت جدول المراجعة · ${stats.correct} استحضارًا صحيحًا`),
  );
}
