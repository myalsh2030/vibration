// أسطول الآلات الافتراضية — بيانات خالصة تستهلكها كل محطات المعمل.
// كل آلة تحمل: مواصفاتها الميكانيكية، هندسة محاملها، نقاط قياسها، ورسمها التخطيطي.
//
// الرسم **تصريحي**: قائمة أجزاء بإحداثيات نسبية (0..1) يرسمها analyzer.js.
// فلا يكتب ملف محطةٍ شيفرةَ رسمٍ أبدًا، وتتغيّر الآلة بتغيير بيانات لا بتغيير كود.
//
// resp: استجابة النقطة لمصدر العطل — عطل في المحرك يُقرأ أعلى عند محمل المحرك.
//       هذا ما يجعل سؤال «أي نقطة هي الأسوأ؟» سؤالًا حقيقيًا لا زينة.

const P = (id, label, hint, x, y, resp, dirs = ['H', 'V', 'A']) => ({ id, label, hint, x, y, resp, dirs });

// ألوان الأجزاء: مفاتيح تُترجم في analyzer.js إلى ألوان من kit.pal (الوضعان فاتح وداكن)
const BODY = 'body', ROTOR = 'rotor', SHAFT = 'shaft', BASE = 'base', PIPE = 'pipe', ACCENT = 'accent';

export const MACHINES = {

  // ═══════════ مضخة طرد مركزي — الوحدة الأولى ═══════════
  pump: {
    id: 'pump', label: 'مضخة طرد مركزي', term: 'Centrifugal Pump', emoji: '💧',
    rpm: 2950, kw: 22, isoClass: 'II', mount: 'rigid',
    vanes: 6, natHz: 205, floorG: 0.004,
    bearing: { n: 9, bd: 7.94, pd: 38.5, phi: 0, resHz: 3100, label: '6206' },
    note: 'مضخة تغذية بسرعة 2950 دورة/دقيقة وقدرة 22 كيلوواط — فئة ISO الثانية.',
    points: [
      P('p1', 'ن1 محمل المحرك', 'جهة القارنة على المحرك الكهربائي', 0.30, 0.50, { motor: 1.0, coupling: 0.7, driven: 0.35 }),
      P('p2', 'ن2 محمل المضخة — جهة القيادة', 'أقرب محمل للقارنة على المضخة', 0.56, 0.50, { motor: 0.45, coupling: 1.0, driven: 0.75 }),
      P('p3', 'ن3 محمل المضخة — جهة غير القيادة', 'المحمل الخلفي خلف الدافعة', 0.74, 0.50, { motor: 0.20, coupling: 0.5, driven: 1.0 }),
    ],
    parts: [
      { t: 'rect', x: 0.06, y: 0.74, w: 0.88, h: 0.09, fill: BASE, label: 'القاعدة' },
      { t: 'rect', x: 0.16, y: 0.36, w: 0.26, h: 0.38, fill: BODY, r: 0.02, label: 'محرك كهربائي' },
      { t: 'lines', pts: [[0.19, 0.40, 0.19, 0.70], [0.23, 0.40, 0.23, 0.70], [0.27, 0.40, 0.27, 0.70], [0.31, 0.40, 0.31, 0.70]], fill: SHAFT },
      { t: 'rect', x: 0.42, y: 0.50, w: 0.10, h: 0.08, fill: ACCENT, r: 0.01, label: 'قارنة' },
      { t: 'circle', x: 0.66, y: 0.50, r: 0.16, fill: BODY, label: 'حلزون المضخة' },
      { t: 'circle', x: 0.66, y: 0.50, r: 0.095, fill: ROTOR, label: 'الدافعة' },
      { t: 'rect', x: 0.52, y: 0.475, w: 0.14, h: 0.05, fill: SHAFT },
      { t: 'rect', x: 0.62, y: 0.10, w: 0.08, h: 0.24, fill: PIPE, label: 'الطرد' },
      { t: 'rect', x: 0.80, y: 0.44, w: 0.14, h: 0.12, fill: PIPE, label: 'السحب' },
    ],
  },

  // ═══════════ توربين بخاري — الوحدة الثانية ═══════════
  turbine: {
    id: 'turbine', label: 'توربين بخاري', term: 'Steam Turbine', emoji: '🔥',
    rpm: 3000, kw: 850, isoClass: 'III', mount: 'rigid',
    vanes: 0, blades: 0, natHz: 128, floorG: 0.006,
    bearing: { n: 12, bd: 12.7, pd: 68.3, phi: 0, resHz: 2700, label: 'محمل انزلاقي مساند' },
    note: 'توربين بخاري 850 كيلوواط عند 3000 دورة/دقيقة على أساس صلب — فئة ISO الثالثة.',
    points: [
      P('p1', 'ن1 المحمل الأمامي', 'جهة دخول البخار', 0.26, 0.52, { motor: 1.0, coupling: 0.55, driven: 0.3 }),
      P('p2', 'ن2 المحمل الخلفي', 'جهة المخرج قبل القارنة', 0.62, 0.52, { motor: 0.4, coupling: 1.0, driven: 0.7 }),
      P('p3', 'ن3 محمل المولّد', 'على الحمل المقود', 0.84, 0.52, { motor: 0.2, coupling: 0.6, driven: 1.0 }),
    ],
    parts: [
      { t: 'rect', x: 0.05, y: 0.76, w: 0.90, h: 0.08, fill: BASE, label: 'الأساس' },
      { t: 'rect', x: 0.14, y: 0.30, w: 0.44, h: 0.46, fill: BODY, r: 0.03, label: 'غلاف التوربين' },
      { t: 'tri', pts: [[0.20, 0.68], [0.52, 0.68], [0.52, 0.36], [0.20, 0.46]], fill: ROTOR, label: 'صفوف الريش' },
      { t: 'rect', x: 0.10, y: 0.49, w: 0.70, h: 0.045, fill: SHAFT, label: 'العمود' },
      { t: 'rect', x: 0.60, y: 0.46, w: 0.08, h: 0.10, fill: ACCENT, r: 0.01, label: 'قارنة' },
      { t: 'rect', x: 0.70, y: 0.36, w: 0.22, h: 0.34, fill: BODY, r: 0.02, label: 'المولّد' },
      { t: 'rect', x: 0.22, y: 0.10, w: 0.09, h: 0.21, fill: PIPE, label: 'دخول البخار' },
    ],
  },

  // ═══════════ مروحة طرد مركزي — الوحدة الثالثة ═══════════
  // أرقام هذه المروحة مطابقة لطيف الحقيبة (الشكل 3-12/3-17): 1× عند 30 Hz
  // وسبع شفرات فيقع تردد مرور الريش عند 7×30 = 210 Hz، وهي القمة المهيمنة المقروءة 209 Hz.
  fan: {
    id: 'fan', label: 'مروحة طرد مركزي', term: 'Centrifugal Fan', emoji: '💨',
    rpm: 1800, kw: 15, isoClass: 'II', mount: 'flexible',
    blades: 7, natHz: 74, floorG: 0.005,
    bearing: { n: 8, bd: 9.53, pd: 44.5, phi: 0, resHz: 2900, label: '6208' },
    note: 'مروحة سبع شفرات عند 1800 دورة/دقيقة على أساس مرن — تردد مرور الريش 210 هرتز.',
    points: [
      P('p1', 'ن1 محمل المحرك', 'على المحرك الكهربائي', 0.24, 0.54, { motor: 1.0, coupling: 0.65, driven: 0.3 }),
      P('p2', 'ن2 محمل المروحة — جهة القيادة', 'قرب سير الإدارة', 0.55, 0.54, { motor: 0.4, coupling: 1.0, driven: 0.8 }),
      P('p3', 'ن3 محمل المروحة — جهة غير القيادة', 'المحمل الحرّ', 0.80, 0.54, { motor: 0.18, coupling: 0.45, driven: 1.0 }),
    ],
    parts: [
      { t: 'rect', x: 0.05, y: 0.78, w: 0.90, h: 0.07, fill: BASE, label: 'قاعدة مرنة' },
      { t: 'rect', x: 0.12, y: 0.42, w: 0.22, h: 0.36, fill: BODY, r: 0.02, label: 'محرك' },
      { t: 'lines', pts: [[0.15, 0.46, 0.15, 0.74], [0.19, 0.46, 0.19, 0.74], [0.23, 0.46, 0.23, 0.74]], fill: SHAFT },
      { t: 'circle', x: 0.68, y: 0.46, r: 0.21, fill: BODY, label: 'غلاف المروحة' },
      { t: 'blades', x: 0.68, y: 0.46, r: 0.145, n: 7, fill: ROTOR, label: 'سبع شفرات' },
      { t: 'rect', x: 0.34, y: 0.53, w: 0.34, h: 0.03, fill: SHAFT, label: 'سير الإدارة' },
      { t: 'rect', x: 0.62, y: 0.06, w: 0.13, h: 0.20, fill: PIPE, label: 'التصريف' },
    ],
  },

  // ═══════════ منصة اتزان الدوّارات — الوحدة الرابعة ═══════════
  rotorRig: {
    id: 'rotorRig', label: 'منصة اتزان الدوّارات', term: 'Rotor Balancing Rig', emoji: '⚖️',
    rpm: 1500, kw: 1.1, isoClass: 'I', mount: 'rigid',
    natHz: 46, floorG: 0.003,
    bearing: { n: 8, bd: 6.35, pd: 30.0, phi: 0, resHz: 3400, label: '6205' },
    // هندسة الدوّار: قرصان على عمود بين محملين — L/D يفرض مستويين
    rotor: { lengthMm: 420, diameterMm: 160, massKg: 6.4, planeRadiusMm: 70, holes: 12 },
    note: 'دوّار بقرصين على عمود واحد بين محملين — نسبة الطول إلى القطر 2.6 فيلزمه مستويان.',
    points: [
      P('p1', 'ن1 المحمل الأيسر (المستوى 1)', 'يقابل قرص التصحيح الأول', 0.28, 0.54, { plane1: 1.0, plane2: 0.32 }, ['H', 'V']),
      P('p2', 'ن2 المحمل الأيمن (المستوى 2)', 'يقابل قرص التصحيح الثاني', 0.72, 0.54, { plane1: 0.32, plane2: 1.0 }, ['H', 'V']),
    ],
    parts: [
      { t: 'rect', x: 0.05, y: 0.76, w: 0.90, h: 0.08, fill: BASE, label: 'قاعدة المنصة' },
      { t: 'rect', x: 0.06, y: 0.40, w: 0.12, h: 0.36, fill: BODY, r: 0.01, label: 'محرك' },
      { t: 'rect', x: 0.20, y: 0.52, w: 0.62, h: 0.035, fill: SHAFT, label: 'العمود' },
      { t: 'rect', x: 0.24, y: 0.56, w: 0.08, h: 0.20, fill: BODY, label: 'مسند 1' },
      { t: 'rect', x: 0.68, y: 0.56, w: 0.08, h: 0.20, fill: BODY, label: 'مسند 2' },
      { t: 'disc', x: 0.38, y: 0.535, r: 0.17, fill: ROTOR, holes: 12, label: 'المستوى 1' },
      { t: 'disc', x: 0.62, y: 0.535, r: 0.17, fill: ROTOR, holes: 12, label: 'المستوى 2' },
      { t: 'tacho', x: 0.86, y: 0.535, label: 'مستشعر الطور' },
    ],
  },

  // ═══════════ مكينة ترددية — الوحدة الخامسة ═══════════
  recip: {
    id: 'recip', label: 'مكينة ترددية', term: 'Reciprocating Machine', emoji: '🔧',
    rpm: 1500, kw: 18, isoClass: 'II', mount: 'flexible',
    natHz: 88, floorG: 0.010,
    bearing: { n: 10, bd: 8.73, pd: 50.0, phi: 0, resHz: 2600, label: 'محمل رئيسي' },
    // هندسة الكرنك — منها تُحسب قوى القصور
    crank: { massRecG: 500, crankRmm: 50, rodLmm: 200, pitchMm: 100 },
    // المطاوعة: كم مليمترًا/ثانية من الاهتزاز يُحدثه كل نيوتن من قوى القصور المتبقية.
    // خاصية تركيب الآلة على مساندها المطاطية — بها يتحوّل حساب القوة إلى قراءة على الجهاز.
    mobility: 0.006,
    note: 'ضاغط ترددي بسرعة 1500 دورة/دقيقة — نصف قطر الكرنك 50 مم وذراع التوصيل 200 مم (n = 4).',
    points: [
      P('p1', 'ن1 المحمل الرئيسي الأمامي', 'على جسم الكرنك', 0.30, 0.62, { motor: 1.0, coupling: 0.6, driven: 0.4 }),
      P('p2', 'ن2 رأس الأسطوانة', 'أعلى نقطة على الأسطوانة', 0.52, 0.22, { motor: 0.5, coupling: 0.7, driven: 1.0 }),
      P('p3', 'ن3 المحمل الخلفي', 'جهة دولاب الطيران', 0.76, 0.62, { motor: 0.7, coupling: 1.0, driven: 0.5 }),
    ],
    parts: [
      { t: 'rect', x: 0.05, y: 0.80, w: 0.90, h: 0.07, fill: BASE, label: 'مساند مطاطية' },
      { t: 'rect', x: 0.20, y: 0.50, w: 0.56, h: 0.30, fill: BODY, r: 0.02, label: 'علبة الكرنك' },
      { t: 'rect', x: 0.44, y: 0.14, w: 0.14, h: 0.36, fill: BODY, r: 0.01, label: 'الأسطوانة' },
      { t: 'piston', x: 0.51, y: 0.62, r: 0.10, label: 'مكبس وكرنك' },
      { t: 'circle', x: 0.80, y: 0.62, r: 0.11, fill: ROTOR, label: 'دولاب الطيران' },
    ],
  },

  // ═══════════ منصة القوة الطاردة المركزية — الوحدة السادسة ═══════════
  // الأرقام مطابقة لجداول الحقيبة: كتل 54/79/104 g، أنصاف أقطار 25..125 mm، سرعات 100..250 RPM.
  centrifugalRig: {
    id: 'centrifugalRig', label: 'منصة القوة الطاردة المركزية', term: 'Centrifugal Force Rig', emoji: '🌀',
    rpm: 200, kw: 0.37, isoClass: 'I', mount: 'rigid',
    natHz: 22, floorG: 0.002,
    bearing: { n: 7, bd: 5.5, pd: 26.0, phi: 0, resHz: 3600, label: '6204' },
    rig: { masses: [54, 79, 104], radii: [25, 50, 75, 100, 125], speeds: [100, 150, 200, 250] },
    note: 'ذراع دوّار بكتلة قابلة للنقل ومقياس قوة — لإثبات أن القوة تتناسب مع مربّع السرعة.',
    points: [
      P('p1', 'ن1 مقياس القوة', 'خلية الحمل تحت المحور', 0.50, 0.72, { rig: 1.0 }, ['H', 'V']),
    ],
    parts: [
      { t: 'rect', x: 0.10, y: 0.80, w: 0.80, h: 0.08, fill: BASE, label: 'القاعدة' },
      { t: 'rect', x: 0.40, y: 0.56, w: 0.20, h: 0.24, fill: BODY, r: 0.02, label: 'محرك ومقياس قوة' },
      { t: 'rect', x: 0.485, y: 0.30, w: 0.03, h: 0.26, fill: SHAFT, label: 'عمود' },
      { t: 'arm', x: 0.50, y: 0.30, label: 'ذراع وكتلة متحركة' },
    ],
  },

  // ═══════════ آلة التشخيص الأعمى — جناح الاعتماد ═══════════
  // تُستنسخ من إحدى الآلات أعلاه بحسب بذرة الجلسة، فلا يعرف المتدرب ما أمامه مسبقًا.
  blindPool: ['pump', 'fan', 'turbine'],
};

// أعطال قابلة للحقن مع أماكنها ومدياتها — تستهلكها محطات التشخيص
export const FAULT_POOL = [
  { type: 'unbalance', at: 'driven', sevRange: [0.35, 0.9], label: 'عدم اتزان', answer: 'unbalance' },
  { type: 'misalignParallel', at: 'coupling', sevRange: [0.35, 0.85], label: 'عدم اصطفاف متوازٍ', answer: 'misalignParallel' },
  { type: 'misalignAngular', at: 'coupling', sevRange: [0.35, 0.85], label: 'عدم اصطفاف زاوي', answer: 'misalignAngular' },
  { type: 'looseness', at: 'motor', sevRange: [0.35, 0.85], label: 'رخاوة ميكانيكية', answer: 'looseness' },
  { type: 'bearingOuter', at: 'driven', sevRange: [0.4, 0.9], label: 'عيب المسار الخارجي', answer: 'bearing' },
  { type: 'bearingInner', at: 'driven', sevRange: [0.4, 0.9], label: 'عيب المسار الداخلي', answer: 'bearing' },
  { type: 'cavitation', at: 'driven', sevRange: [0.45, 0.9], label: 'تكهّف', answer: 'cavitation', only: ['pump'] },
  { type: 'bentShaft', at: 'driven', sevRange: [0.4, 0.8], label: 'عمود منحنٍ', answer: 'misalignAngular' },
];

// خيارات التشخيص المعروضة على المتدرب (الترتيب ثابت — المشتّتات جميعها أعطال حقيقية)
export const DIAGNOSIS_OPTIONS = [
  { id: 'unbalance', label: 'عدم اتزان', term: 'Unbalance' },
  { id: 'misalignParallel', label: 'عدم اصطفاف متوازٍ', term: 'Parallel Misalignment' },
  { id: 'misalignAngular', label: 'عدم اصطفاف زاوي', term: 'Angular Misalignment' },
  { id: 'looseness', label: 'رخاوة ميكانيكية', term: 'Mechanical Looseness' },
  { id: 'bearing', label: 'عيب في المحمل', term: 'Bearing Defect' },
  { id: 'cavitation', label: 'تكهّف', term: 'Cavitation' },
  { id: 'resonance', label: 'رنين', term: 'Resonance' },
];

// اختيار عطل من البذرة — نفس البذرة تعطي نفس العطل دائمًا (قابلية إعادة الحالة للمدرب)
export function pickFault(seed, machineId, pool = FAULT_POOL) {
  const usable = pool.filter(f => !f.only || f.only.includes(machineId));
  let a = (seed >>> 0) || 1;
  a = Math.imul(a ^ (a >>> 15), 2246822507) >>> 0;
  const f = usable[a % usable.length];
  const frac = ((Math.imul(a ^ (a >>> 13), 3266489909) >>> 0) % 1000) / 1000;
  return { ...f, sev: f.sevRange[0] + frac * (f.sevRange[1] - f.sevRange[0]) };
}
