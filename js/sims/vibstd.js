// vibstd — المعايير وقواعد الحكم: ISO 2372/10816، مخطط شدة اهتزاز المحمل، عامل القمة، قواعد التشخيص.
// وحدة بيانات وحساب خالصة: لا DOM. كل جدول هنا منقول من مصدره ومُوثّق بمصدره في التعليق فوقه.

// ═══════════════ ISO 2372 (10816) — شدة الاهتزاز بالسرعة الفعالة ═══════════════
// منقول حرفيًا من الحقيبة العملية، الجدول 2-2 «VIBRATION SEVERITY PER ISO 10816».
// المجال الترددي المعتمد للحكم: 10 Hz إلى 1000 Hz (السلّم القياسي 10–1000 Hz).
// الوحدة: mm/s قيمة فعّالة RMS.
export const ISO_CLASSES = {
  I: {
    label: 'مكائن صغيرة', term: 'Class I — Small machines',
    hint: 'حتى نحو 15 kW: مضخات ومراوح صغيرة ومحركات كهربائية صغيرة',
    good: 0.71, satisfactory: 1.80, unsatisfactory: 4.50,
  },
  II: {
    label: 'مكائن متوسطة', term: 'Class II — Medium machines',
    hint: 'نحو 15–75 kW، أو حتى 300 kW على قواعد خاصة',
    good: 1.12, satisfactory: 2.80, unsatisfactory: 7.10,
  },
  III: {
    label: 'مكائن كبيرة على قاعدة صلبة', term: 'Class III — Large, rigid foundation',
    hint: 'مجموعات دوّارة كبيرة، تردد القاعدة الطبيعي أعلى من سرعة الدوران',
    good: 1.80, satisfactory: 4.50, unsatisfactory: 11.2,
  },
  IV: {
    label: 'مكائن كبيرة على قاعدة مرنة', term: 'Class IV — Large, soft foundation',
    hint: 'مجموعات دوّارة كبيرة على تأسيس مرن، كتوربينات ومولّدات كبيرة',
    good: 2.80, satisfactory: 7.10, unsatisfactory: 18.0,
  },
};

// سلّم القيم المطبوع على المخطط (in/s ↔ mm/s) — يُستخدم لرسم المحور بالتدريج نفسه
export const ISO_LADDER = [
  { mms: 0.28, ips: 0.01 }, { mms: 0.45, ips: 0.02 }, { mms: 0.71, ips: 0.03 },
  { mms: 1.12, ips: 0.04 }, { mms: 1.80, ips: 0.07 }, { mms: 2.80, ips: 0.11 },
  { mms: 4.50, ips: 0.18 }, { mms: 7.10, ips: 0.28 }, { mms: 11.2, ips: 0.44 },
  { mms: 18.0, ips: 0.70 }, { mms: 28.0, ips: 1.10 }, { mms: 45.0, ips: 1.77 },
];

export const ISO_ZONES = [
  { key: 'good', label: 'جيد', term: 'Good', tone: 'ok', action: 'استمر بالتشغيل والمراقبة الدورية.' },
  { key: 'satisfactory', label: 'مرضٍ', term: 'Satisfactory', tone: 'ok2', action: 'صالح للتشغيل طويل الأمد؛ راقب الاتجاه العام.' },
  { key: 'unsatisfactory', label: 'غير مرضٍ', term: 'Unsatisfactory', tone: 'warn', action: 'حدّد السبب وخطّط للإصلاح في أقرب توقّف مخطّط.' },
  { key: 'unacceptable', label: 'مرفوض', term: 'Unacceptable', tone: 'bad', action: 'إيقاف: الاستمرار يهدّد المحامل والقارنة والأساس.' },
];

// الحكم على قيمة السرعة الفعّالة بحسب فئة الآلة
export function isoZone(vRms, cls = 'II') {
  const c = ISO_CLASSES[cls] || ISO_CLASSES.II;
  const key = vRms <= c.good ? 'good'
    : vRms <= c.satisfactory ? 'satisfactory'
      : vRms <= c.unsatisfactory ? 'unsatisfactory' : 'unacceptable';
  return { ...ISO_ZONES.find(z => z.key === key), cls, limits: c };
}

// ═══════════════ مخطط شدة اهتزاز المحمل (B&K) ═══════════════
// منقول من الحقيبة العملية (الجدولان 2-5 و3-4). محوران بالديسيبل مرجعهما 10⁻⁶ m/s²:
//   س = RMS التسارع (dB)، ص = أقصى قمة للتسارع (dB)، والمجال 10 Hz – 10 kHz.
// المناطق أربع: ممتاز / جيد / حرج / حرج جدًا، تفصلها خطوط مائلة.
//
// ⚠️ الجدول المرجعي في الحقيبة (الجدولان 2-6 و3-5) فيه خطأ يقيني: صفّه الأول يعطي
//    قمة 140 dB مع فعّالة 145 dB — والقمة لا تكون أصغر من الفعّالة أبدًا (عامل القمة ≥ 1).
//    ولذلك لا يُعتمد ذلك الجدول مثالًا للمتدرب. المنصة تعرض المخطط بهندسته الصحيحة:
//    كلما ارتفعت الفعّالة والقمة معًا ساءت الحالة، والفارق بينهما (عامل القمة بالديسيبل)
//    يفصل العطل الصدمي المبكر عن التدهور العام.
export const DB_REF = 1e-6;                       // m/s² مرجع الديسيبل
export const toDb = v => 20 * Math.log10(Math.max(v, 1e-12) / DB_REF);
export const fromDb = db => DB_REF * Math.pow(10, db / 20);

export const BEARING_CHART = {
  x: { min: 120, max: 160, label: 'التسارع الفعّال', term: 'RMS Acceleration (dB ref 10⁻⁶ m/s²)' },
  y: { min: 130, max: 170, label: 'أقصى قمة للتسارع', term: 'Max Peak Acceleration (dB ref 10⁻⁶ m/s²)' },
  // ── هندسة المخطط ──
  // للمخطط محوران لأن للمحمل طريقين إلى الفشل، وكلٌّ منهما وحده يكفي للإدانة:
  //   (أ) **مستوى الطاقة**: الفعّالة نفسها مرتفعة → تدهور عام.
  //   (ب) **الصدمية**: الفارق بين القمة والفعّالة كبير → نبضات حادة من عيب موضعي مبكر،
  //        وقد تكون الفعّالة ما زالت منخفضة تمامًا. هذه هي الحالة التي يفوتها الفنّي المبتدئ.
  // ولذلك الحكم = **الأسوأ** من الحكمين، لا متوسطهما. (المتوسط يُلغي أثر الصدمية تمامًا،
  // فيصير محمل «فعّالة 130 dB وقمة 150 dB» سليمًا وهو في الحقيقة عيب موضعي بيّن.)
  // والفارق (ص − س) بالديسيبل هو عامل القمة نفسه: 6 dB = عامل قمة 2، و20 dB = عامل قمة 10.
  levelBounds: [130, 140, 150],   // dB على محور الفعّالة
  crestBounds: [8, 14, 22],       // dB فارقًا بين القمة والفعّالة (≈ عامل قمة 2.5 و5 و12.6)
  zones: [
    { key: 'excellent', label: 'ممتاز', term: 'Excellent', tone: 'ok', action: 'المحمل سليم — أعد القياس في الموعد الدوري.' },
    { key: 'good', label: 'جيد', term: 'Good', tone: 'ok2', action: 'حالة مقبولة — قصّر فترة المتابعة ولاحظ الاتجاه.' },
    { key: 'hard', label: 'حرج', term: 'Hard', tone: 'warn', action: 'ابدأ متابعة قريبة وجهّز محملًا بديلًا.' },
    { key: 'critical', label: 'حرج جدًا', term: 'Critical', tone: 'bad', action: 'استبدل المحمل في أقرب فرصة — الفشل وشيك.' },
  ],
};

const bandOf = (v, bounds) => v <= bounds[0] ? 0 : v <= bounds[1] ? 1 : v <= bounds[2] ? 2 : 3;

// الحكم على المحمل من قيمتي التسارع الفعّالة والقمّية (m/s²)
export function bearingZone(aRms, aPeak) {
  const xdb = toDb(aRms), ydb = toDb(aPeak);
  const byLevel = bandOf(xdb, BEARING_CHART.levelBounds);
  const byCrest = bandOf(ydb - xdb, BEARING_CHART.crestBounds);
  const i = Math.max(byLevel, byCrest);
  return {
    ...BEARING_CHART.zones[i], xdb, ydb, crestDb: ydb - xdb,
    driver: byCrest > byLevel ? 'crest' : byLevel > byCrest ? 'level' : 'both',
  };
}

// ═══════════════ عامل القمة ═══════════════
// منقول حرفيًا من الحقيبة العملية، الجدول 1-6 (بحدوده كما هي، ومنها فجوة 2.5–3 التي في الأصل).
export const CREST_WAVE = [
  { min: 1.5, max: 2.5, wave: 'جيبية دورية (بسيطة أو مركّبة)', term: 'Periodic sinusoidal', cause: 'عدم اتزان أو عدم اصطفاف' },
  { min: 3.0, max: 4.0, wave: 'دورية بنبضات منتظمة', term: 'Periodic impulsive', cause: 'محمل بحالة جيدة — نبضات دحرجة طبيعية' },
  { min: 4.0, max: Infinity, wave: 'عشوائية بنبضات', term: 'Random impulsive', cause: 'عيب موضعي في المحمل (تنقّر أو تشقّق)' },
];

// المسار الحقيقي لعامل القمة عبر عمر المحمل — ليس مؤشرًا أحادي الاتجاه.
// هذه هي النقطة التي يخطئ فيها أكثر الفنيين: عامل قمة منخفض لا يعني دائمًا محملًا سليمًا.
export const CREST_LIFE = [
  { stage: 'محمل سليم', crest: 'منخفض (< 6)', rms: 'منخفضة', note: 'لا نبضات — الطاقة موزّعة.' },
  { stage: 'بداية عيب موضعي', crest: 'مرتفع (> 6)', rms: 'ما زالت منخفضة', note: 'نبضات حادة نادرة ترفع القمة بلا رفع الطاقة الكلية. **هنا يجب أن يُكتشف العطل**.' },
  { stage: 'عيب متقدّم', crest: 'يعود منخفضًا (< 6)', rms: 'ترتفع بسرعة', note: 'النبضات كثرت حتى صارت ضجيجًا مستمرًا فهبطت النسبة — الخداع الكلاسيكي.' },
  { stage: 'تلف شديد', crest: 'مرتفع (> 6)', rms: 'مرتفعة', note: 'خلوص داخلي كبير — الفشل وشيك.' },
];

export function crestVerdict(cf, rmsTrend = 'stable') {
  if (cf < 2.5) return { label: 'اهتزاز جيبي دوري', hint: 'قمة قريبة من √2 — الطاقة في تردد واحد. رجّح عدم الاتزان أو عدم الاصطفاف.', tone: 'ok2' };
  if (cf < 4) return { label: 'نبضات دورية طبيعية', hint: 'نبضات دحرجة منتظمة — محمل بحالة جيدة.', tone: 'ok' };
  if (cf < 6) return { label: 'نبضات متزايدة', hint: 'راقب: النبضات تعلو على الأرضية. قارن بالقياس السابق.', tone: 'warn' };
  return { label: 'نبضات عشوائية حادة', hint: 'عيب موضعي في المحمل. تحقّق بترددات BPFO/BPFI في الطيف.', tone: 'bad' };
}

// ═══════════════ قواعد التشخيص من الطيف ═══════════════
// كل قاعدة تُرجع درجة ترجيح 0..1 من نسب السعات، لا من معرفة العطل المحقون —
// فهي تعمل على أي طيف، وتصلح مرجعًا لتفسير قرار المتدرب بعد إجابته.
//
// f: دالة قراءة السعة عند تردد (mm/s قمة) لكل اتجاه: f(mult, dir)
export const DIAG_RULES = [
  {
    id: 'unbalance', label: 'عدم اتزان', term: 'Unbalance',
    signature: '1× مهيمن، شعاعي، والمحوري ضعيف، والطور ثابت لا يتغيّر بين قراءتين.',
    fix: 'اتزان الدوّار في مستوى واحد أو مستويين بحسب نسبة الطول إلى القطر.',
    score(v) {
      const one = Math.max(v.H1, v.V1), two = Math.max(v.H2, v.V2);
      if (one < 0.4) return 0;
      const dominance = one / (one + two + v.A1 + 1e-9);
      const axialLow = 1 - Math.min(1, v.A1 / (one + 1e-9) / 0.5);
      return clamp(dominance * 1.4) * clamp(axialLow) * clamp(one / 2.5);
    },
  },
  {
    id: 'misalignParallel', label: 'عدم اصطفاف متوازٍ', term: 'Parallel Misalignment',
    signature: '2× يساوي 1× أو يعلو عليه، شعاعي، وفرق الطور عبر القارنة قريب من 180°.',
    fix: 'إعادة اصطفاف القارنة بالمؤشّر أو بالليزر، وفحص القدم الرخوة قبلها.',
    score(v) {
      const one = Math.max(v.H1, v.V1), two = Math.max(v.H2, v.V2);
      if (two < 0.4) return 0;
      const ratio = two / (one + 1e-9);
      const axialModerate = 1 - Math.min(1, Math.abs(v.A1 / (one + 1e-9) - 0.4) / 0.6);
      return clamp((ratio - 0.6) / 0.9) * clamp(axialModerate) * clamp(two / 2);
    },
  },
  {
    id: 'misalignAngular', label: 'عدم اصطفاف زاوي', term: 'Angular Misalignment',
    signature: 'المحوري عالٍ: 1× و2× محوريان يبلغان نصف الشعاعي أو أكثر.',
    fix: 'إعادة اصطفاف زاوي بضبط الحشوات تحت الأقدام، ثم فحص إجهاد المواسير.',
    score(v) {
      const rad = Math.max(v.H1, v.V1, v.H2, v.V2);
      const ax = Math.max(v.A1, v.A2);
      if (ax < 0.4) return 0;
      return clamp((ax / (rad + 1e-9) - 0.45) / 0.55) * clamp(ax / 2);
    },
  },
  {
    id: 'looseness', label: 'رخاوة ميكانيكية', term: 'Mechanical Looseness',
    signature: 'سلسلة توافقيات طويلة (حتى 8× وأكثر) مع نصف توافقيات، وأرضية ضجيج مرتفعة، والرأسي سائد.',
    fix: 'شدّ مسامير التثبيت، فحص القدم الرخوة والخلوص في المحامل وشقوق القاعدة.',
    score(v) {
      const harm = (v.H3 + v.H4 + v.H5 + v.H6) / 4;
      const one = Math.max(v.H1, v.V1);
      if (harm < 0.2) return 0;
      const half = v.Hhalf / (one + 1e-9);
      return clamp(harm / (one + 1e-9) / 0.35) * clamp(0.5 + half * 2) * clamp(harm / 0.8);
    },
  },
  {
    id: 'bearing', label: 'عيب في المحمل', term: 'Rolling Element Bearing Defect',
    signature: 'قمم غير توافقية عند BPFO أو BPFI مع جوانب تعديل، وعامل قمة مرتفع، وطاقة عالية التردد.',
    fix: 'استبدال المحمل، وفحص سبب العطل: تشحيم، تركيب، حمل محوري، مرور تيار.',
    score(v) {
      if (v.bearingRel < 0.06) return 0;
      return clamp(v.bearingRel / 0.35) * clamp((v.crest - 3) / 4);
    },
  },
  {
    id: 'cavitation', label: 'تكهّف', term: 'Cavitation',
    signature: 'ضجيج عريض النطاق بلا قمم منفصلة، يعلو مع خنق السحب، ويرافقه صوت حصى.',
    fix: 'ارفع صافي ضاغط المص NPSHa: افتح محبس السحب، نظّف المصفاة، اخفض ارتفاع السحب.',
    score(v) {
      if (v.broadband < 0.15) return 0;
      const peakiness = v.topPeakRel;            // نسبة أعلى قمة إلى الطاقة الكلية
      return clamp(v.broadband / 0.5) * clamp((0.35 - peakiness) / 0.3);
    },
  },
  {
    id: 'resonance', label: 'رنين', term: 'Resonance',
    signature: 'قمة واحدة عالية جدًا لا تتناسب مع شدة العطل، تختفي بتغيير السرعة قليلًا.',
    fix: 'غيّر سرعة التشغيل، أو صلّب القاعدة، أو أضف كتلة موازنة لإزاحة التردد الطبيعي.',
    score(v) {
      return clamp((v.resonanceRel - 0.5) / 0.5);
    },
  },
];

const clamp = x => Math.max(0, Math.min(1, x));

// ترتيب الاحتمالات من متجّه ملامح مقروء من الطيف
export function rankDiagnosis(features) {
  return DIAG_RULES
    .map(r => ({ id: r.id, label: r.label, term: r.term, signature: r.signature, fix: r.fix, score: r.score(features) }))
    .filter(r => r.score > 0.02)
    .sort((a, b) => b.score - a.score);
}

// ═══════════════ نقاط القياس والتثبيت ═══════════════
// سقف التردد بحسب طريقة تثبيت الحسّاس — أهم قاعدة عملية يجهلها المبتدئ:
// المسبار اليدوي يقتل الترددات العالية، فيخفي عيب المحمل تمامًا.
export const MOUNTS = [
  { id: 'stud', label: 'برغي مثبّت', term: 'Stud mounted', fMax: 15000, note: 'الأدق — يتطلب تحضير سطح دائم.' },
  { id: 'adhesive', label: 'لصق', term: 'Adhesive', fMax: 10000, note: 'جيد لنقاط المتابعة الدورية.' },
  { id: 'magnet', label: 'مغناطيس', term: 'Magnet', fMax: 5000, note: 'الأشيع ميدانيًا — كافٍ لأغلب أعطال المحامل.' },
  { id: 'probe', label: 'مسبار يدوي', term: 'Hand probe', fMax: 1000, note: '⚠️ لا يصلح لكشف عيوب المحامل — يقطع كل ما فوق 1 kHz.' },
];

export const DIRECTIONS = [
  { id: 'H', label: 'أفقي', term: 'Horizontal', note: 'أعلى قراءة عادةً — أقل صلابة في اتجاه الدوران.' },
  { id: 'V', label: 'رأسي', term: 'Vertical', note: 'يكشف الرخاوة وضعف القاعدة.' },
  { id: 'A', label: 'محوري', term: 'Axial', note: 'يكشف عدم الاصطفاف الزاوي والعمود المنحني.' },
];

// حدود القياس المتاحة على الجهاز، كما في الحقيبة (5, 10, 20 kHz).
// ⚠️ لا تخلط **نطاق الجهاز** بـ**مجال الحكم**: النطاق سقف ما يلتقطه الجهاز،
//    أما حكم ISO فيُحسب دائمًا من السرعة الفعّالة في المجال 10–1000 Hz داخل أي نطاق مختار.
export const BANDS = [
  { hz: 5000, label: '5 kHz', use: 'الاهتزاز العام واتزان الدوّار — دقة تردد أعلى' },
  { hz: 10000, label: '10 kHz', use: 'القياس العام الشائع؛ ويكفي مخطط شدة المحمل (10 Hz – 10 kHz)' },
  { hz: 20000, label: '20 kHz', use: 'كشف عيوب المحامل والتكهّف — الطاقة عالية التردد' },
];
