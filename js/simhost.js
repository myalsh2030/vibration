// مضيف المحاكاة: بوابة التنبؤ ← تحميل المحاكاة ← قائمة المهام والمكافآت
//
// بوابة التنبؤ (نمط «تنبّأ ← لاحظ ← فسّر»): قبل أن تعمل المحاكاة يُسأل المتدرب
// «ماذا سيحدث لو…؟» ويُلزَم باختيار. ولا يُكشف له الصواب عند الاختيار — بل يُترك
// ليكتشفه بيده، ثم يُقارَن تنبؤه بالنتيجة عند أول مهمة يُنجزها.
// من يرى النتيجة بلا التزام مسبق يقول «كنت أعرف» ولا يتعلم؛ ومن التزم ثم خُولف لا ينسى.
import { el, confetti } from './ui.js';
import { getState, save } from './store.js';
import { award, XP, checkBadges } from './game.js';
import { loadSim } from './sims/registry.js';
import { COURSE } from '../data/course.js';
import { PREDICT } from '../data/predict.js';

// container: عنصر — simId — missions: [{id, text}] — يرجع {destroy}
export function hostSim(container, simId, missions = []) {
  const s = getState();
  s.simsVisited[simId] = true;
  save();

  const gateBox = el('div');
  const simWrap = el('div', { class: 'sim-wrap' });
  const missionEls = {};
  let missionBox = null;

  if (missions.length) {
    missionBox = el('div', { class: 'missions' },
      el('div', { class: 'm-head' }, '🎯 مهام الاستكشاف'),
      missions.map(m => {
        const done = !!s.missions[`${simId}:${m.id}`];
        const node = el('div', { class: `mission ${done ? 'done' : ''}` },
          el('span', { class: 'm-ic' }, done ? '✅' : '⭕'),
          el('span', { class: 'm-txt', html: m.text }),
        );
        missionEls[m.id] = node;
        return node;
      }),
    );
  }

  container.append(gateBox, simWrap, missionBox || '');

  // ───────────────────────── بوابة التنبؤ ─────────────────────────
  const P = PREDICT[simId];

  // بطاقة السؤال — تسبق المحاكاة ولا تُظهر شيئًا عن الصواب
  function renderAsk() {
    gateBox.innerHTML = '';
    const btns = P.opts.map((o, i) => el('button', { class: 'q-opt', html: o, onclick: () => pick(i) }));
    gateBox.append(el('div', { class: 'predict-gate ask' },
      el('div', { class: 'pg-head' }, '🔮 تنبّأ أولًا'),
      el('div', { class: 'pg-q', html: P.q }),
      el('div', { class: 'q-opts' }, btns),
      el('div', { class: 'small muted', style: 'margin-top:8px' },
        'لن نخبرك بالجواب — اختر، ثم اكتشفه بيدك في المحاكاة.'),
    ));

    function pick(i) {
      const st = getState();
      st.predict[simId] = { pick: i, ok: i === P.correct, revealed: false };
      save();
      award(XP.predict, 'تنبؤ مسجَّل');
      renderHeld();
      mount();
    }
  }

  // بطاقة «سُجِّل تنبؤك» — تبقى معروضة أثناء التجريب
  function renderHeld() {
    const rec = getState().predict[simId];
    gateBox.innerHTML = '';
    gateBox.append(el('div', { class: 'predict-gate held' },
      el('div', { class: 'pg-head' }, '📌 تنبؤك المسجَّل'),
      el('div', { class: 'pg-cmp' }, el('span', { html: P.opts[rec.pick] })),
      el('div', { class: 'small muted', style: 'margin-top:6px' },
        'جرّب الآن وتحقق بنفسك — سنقارن تنبؤك بالنتيجة عند أول مهمة تُنجزها.'),
      el('button', { class: 'btn ghost sm', style: 'margin-top:10px', onclick: reveal }, 'اكشف الجواب الآن'),
    ));
  }

  // بطاقة المقارنة — عرض خالص، تصلح للزيارات اللاحقة أيضًا
  function renderVerdict() {
    const rec = getState().predict[simId];
    gateBox.innerHTML = '';
    gateBox.append(el('div', { class: `predict-gate ${rec.ok ? 'right' : 'wrong'}` },
      el('div', { class: 'pg-head' }, rec.ok ? '🔮 تنبؤك كان صائبًا' : '🔄 خالفتك المحاكاة — وهنا يبدأ التعلّم'),
      el('div', { class: 'pg-cmp' },
        el('div', null, el('b', null, 'تنبأتَ: '), el('span', { html: P.opts[rec.pick] })),
        rec.ok ? '' : el('div', null, el('b', null, 'والصواب: '), el('span', { html: P.opts[P.correct] })),
      ),
      el('div', { class: 'pg-why', html: P.why }),
    ));
  }

  // الكشف الفعلي: يُمنح مرة واحدة فقط
  function reveal() {
    const rec = getState().predict[simId];
    if (!P || !rec || rec.revealed) return;
    rec.revealed = true;
    save();
    if (rec.ok) { award(XP.predictRight, 'تنبؤ صائب'); confetti(20); }
    checkBadges(COURSE);
    renderVerdict();
  }

  // ───────────────────────── المهام ─────────────────────────
  const ctx = {
    missions,
    isMissionDone: (mid) => !!getState().missions[`${simId}:${mid}`],
    completeMission(mid) {
      const st = getState();
      const key = `${simId}:${mid}`;
      if (st.missions[key]) return;
      st.missions[key] = true;
      save();
      const node = missionEls[mid];
      if (node) {
        node.classList.add('done');
        node.querySelector('.m-ic').textContent = '✅';
      }
      award(XP.mission, 'مهمة استكشاف');
      confetti(16);
      checkBadges(COURSE);
      reveal();   // أول مهمة تُنجَز = لحظة المشاهدة ← تُكشف المقارنة
    },
  };

  // ───────────────────────── التحميل ─────────────────────────
  let instance = null;
  let destroyed = false;
  let mounted = false;

  function mount() {
    if (mounted || destroyed) return;
    mounted = true;
    loadSim(simId).then(mod => {
      if (destroyed) return;
      if (!mod?.mount) {
        simWrap.append(el('div', { class: 'card muted center' }, 'تعذر تحميل المحاكاة'));
        return;
      }
      try { instance = mod.mount(simWrap, ctx); }
      catch (e) {
        console.error('sim mount failed:', simId, e);
        simWrap.append(el('div', { class: 'card muted center' }, 'حدث خطأ في تشغيل المحاكاة'));
      }
    }).catch(e => {
      console.error('sim load failed:', simId, e);
      if (!destroyed) simWrap.append(el('div', { class: 'card muted center' }, 'تعذر تحميل المحاكاة'));
    });
  }

  const prior = s.predict[simId];
  if (P && !prior) {
    renderAsk();                    // أول زيارة: البوابة تسبق المحاكاة، ولا تُحمَّل قبل الاختيار
  } else {
    if (P && prior) (prior.revealed ? renderVerdict : renderHeld)();
    checkBadges();
    mount();
  }

  return {
    destroy() {
      destroyed = true;
      try { instance?.destroy?.(); } catch {}
    },
  };
}
