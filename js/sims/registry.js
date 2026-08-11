// سجل محاكيات المنصة النظرية — العقد الملزم بين المؤلّف والمبرمج.
// نصوص المهام تُنسخ **حرفيًا** من هنا إلى بلوك `sim` في ملف الوحدة، ومعرّفاتها
// هي ما يستدعيه المحاكي بـ ctx.completeMission(id). أي اختلاف حرف يكسر التلعيب.
export const SIMS = [
  {
    id: 'wave-anatomy', icon: 'waves', unit: 'u1',
    title: 'تشريح موجة الاهتزاز',
    concepts: ['cycle-period', 'frequency', 'rpm-hz', 'amplitude', 'phase'],
    desc: 'حرّك السرعة وشاهد الموجة: كم دورة في الثانية، وكم زمنها، وأين تبدأ',
    missions: [
      { id: 'period-read', text: 'اضبط السرعة على 1500 لفة/دقيقة، ثم اقرأ الزمن الدوري من الموجة' },
      { id: 'hz-25', text: 'اجعل تردد الاهتزاز 25 هرتز بالضبط' },
      { id: 'phase-shift', text: 'أزح الطور حتى تبدأ الموجة من قمتها (90 درجة)' },
    ],
  },
  {
    id: 'amplitude-three', icon: 'gauge', unit: 'u1',
    title: 'ثلاث طرق لقياس السعة',
    concepts: ['peak-p2p-rms', 'amplitude'],
    desc: 'القمة، ومن قمة إلى قمة، والقيمة الفعّالة — على الموجة نفسها',
    missions: [
      { id: 'rms-ratio', text: 'أثبت على موجة جيبية أن القيمة الفعّالة = القمة ÷ 1.414' },
      { id: 'p2p-double', text: 'أظهر أن «من قمة إلى قمة» ضعف القمة تمامًا' },
      { id: 'spiky-crest', text: 'بدّل شكل الموجة إلى نبضية واقرأ كيف تغيّرت النسبة بين القمة والفعّالة' },
    ],
  },
  {
    id: 'free-forced', icon: 'tornado', unit: 'u2',
    title: 'الحر والجبري والتخميد',
    concepts: ['free-vibration', 'forced-vibration', 'damping', 'waveform-types'],
    desc: 'اطرق الكتلة فتهتز حرة وتتلاشى، أو ادفعها باستمرار فتهتز جبرًا بلا توقف',
    missions: [
      { id: 'strike-decay', text: 'اطرق الكتلة وسجّل كم ثانية استغرق الاهتزاز حتى تلاشى' },
      { id: 'damp-high', text: 'ارفع التخميد إلى أعلى قيمة وشاهد الاهتزاز يموت قبل إتمام دورة واحدة' },
      { id: 'forced-steady', text: 'شغّل القوة الدورية ودعها تعمل خمس ثوانٍ، ثم صف ما حدث للسعة' },
    ],
  },
  {
    id: 'dof', icon: 'scale', unit: 'u2',
    title: 'درجات الحرية',
    concepts: ['dof', 'natural-frequency', 'stiffness-mass'],
    desc: 'كتلة واحدة لها تردد طبيعي واحد، وكتلتان لهما ترددان',
    missions: [
      { id: 'one-dof', text: 'ابحث عن التردد الطبيعي الوحيد لمنظومة الكتلة الواحدة' },
      { id: 'two-dof', text: 'أضف كتلة ثانية وجد التردّدين الطبيعيين للمنظومة' },
      { id: 'stiffer-up', text: 'ضاعف الصلابة وسجّل التردد الطبيعي قبلها وبعدها' },
    ],
  },
  {
    id: 'resonance', icon: 'zap', unit: 'u2',
    title: 'الرنين والسرعة الحرجة',
    concepts: ['resonance', 'critical-speed', 'resonance-remedy'],
    desc: 'ارفع سرعة الآلة تدريجيًا حتى تلامس ترددها الطبيعي — وشاهد ماذا يحدث',
    missions: [
      { id: 'find-critical', text: 'ارفع السرعة حتى تبلغ قمة الاهتزاز، وسجّل السرعة الحرجة' },
      { id: 'amplify', text: 'اقرأ كم ضعفًا تضخّم الاهتزاز عند الرنين مقارنة بسرعة التشغيل العادية' },
      { id: 'pass-through', text: 'اعبر السرعة الحرجة واستقرّ فوقها، وقارن الاهتزاز بما كان عندها' },
      { id: 'stiffen-fix', text: 'صلّب القاعدة حتى تبتعد السرعة الحرجة عن سرعة التشغيل بأكثر من الربع' },
    ],
  },
  {
    id: 'dva-triangle', icon: 'trending-down', unit: 'u2',
    title: 'الإزاحة والسرعة والتسارع',
    concepts: ['dva', 'quantity-selection', 'unit-conversion'],
    desc: 'اهتزاز واحد بثلاث عيون: أيّها يُظهر العطل وأيّها يخفيه؟',
    missions: [
      { id: 'low-freq-disp', text: 'اضبط التردد على 5 هرتز وقارن المقاييس الثلاثة: أيّها يعطي قراءة معتبرة؟' },
      { id: 'high-freq-acc', text: 'ارفع التردد إلى 2000 هرتز وأعد المقارنة: هل تغيّر ترتيب المقاييس الثلاثة؟' },
      { id: 'velocity-flat', text: 'أظهر أن السرعة تعطي قراءة متوازنة في المجال 10–1000 هرتز — ولهذا يحكم بها معيار ISO' },
    ],
  },
  {
    id: 'sensors', icon: 'manometer', unit: 'u3',
    title: 'اللواقط الثلاثة',
    concepts: ['transducer', 'displacement-sensor', 'velocity-sensor', 'accelerometer', 'sensor-selection', 'shaft-vs-casing'],
    desc: 'لكل لاقط مجال يجيده ومجال يعجز عنه — اختر الصحيح لكل مهمة',
    missions: [
      { id: 'pick-eddy', text: 'اختر اللاقط الصحيح لقياس حركة عمود داخل محمل انزلاقي' },
      { id: 'pick-accel', text: 'اختر اللاقط الصحيح لكشف عيب محمل دحروجي عند 4000 هرتز' },
      { id: 'range-compare', text: 'قارن المجالات الترددية الثلاثة وحدّد أيّ لاقط يغطي أوسع مدى' },
    ],
  },
  {
    id: 'mounting', icon: 'target', unit: 'u3',
    title: 'التثبيت يصنع القراءة',
    concepts: ['mounting-method', 'measurement-point', 'measurement-direction', 'cables-connections'],
    desc: 'الحسّاس نفسه والآلة نفسها — وقراءتان مختلفتان تمامًا',
    missions: [
      { id: 'probe-hides', text: 'قِس بالمسبار اليدوي وافحص الطيف عند رنين المحمل: ماذا ترى؟' },
      { id: 'magnet-shows', text: 'بدّل إلى التثبيت المغناطيسي وأظهر عودة القمة نفسها' },
      { id: 'point-matters', text: 'انقل الحسّاس من غلاف الآلة إلى المحمل وقارن القراءتين' },
    ],
  },
  {
    id: 'fft-lab', icon: 'bar-chart', unit: 'u3',
    title: 'من الموجة إلى الطيف',
    concepts: ['fft', 'time-vs-frequency', 'sampling-rate', 'frequency-resolution', 'leakage-window'],
    desc: 'الموجة الزمنية تقول «يهتز»، والطيف يقول «لماذا»',
    missions: [
      { id: 'two-peaks', text: 'اجمع موجتين بترددين مختلفين وأظهر قمّتيهما منفصلتين في الطيف' },
      { id: 'resolution', text: 'قرّب الترددين حتى تندمج قمّتاهما، ثم ارفع دقة التردد حتى تنفصلا مجددًا' },
      { id: 'leakage', text: 'أظهر التسرّب بالنافذة المستطيلة، ثم عالجه بنافذة هانّ' },
    ],
  },
  {
    id: 'spectrum-read', icon: 'search', unit: 'u4',
    title: 'قراءة الطيف',
    concepts: ['spectrum-reading', 'orders-1x-2x', 'harmonics', 'sidebands', 'noise-floor', 'blade-pass'],
    desc: 'حوّل الطيف من غابة أعمدة إلى جملة مفهومة',
    missions: [
      { id: 'mark-1x', text: 'حدّد قمة 1× على طيف آلة تدور بسرعة معلومة' },
      { id: 'count-harmonics', text: 'عُدّ توافقيات سرعة الدوران الظاهرة فوق أرضية الضجيج' },
      { id: 'sideband-gap', text: 'اقرأ تباعد الجوانب حول قمة عالية التردد وحدّد تردد تعديلها' },
      { id: 'blade-freq', text: 'احسب تردد مرور الريش لمروحة سبع شفرات وأشِر إليه في الطيف' },
    ],
  },
  {
    id: 'iso-judge', icon: 'circle-check', unit: 'u4',
    title: 'الحكم بمعيار ISO',
    concepts: ['iso-10816', 'machine-class', 'fault-severity', 'trend-analysis', 'predictive-maintenance'],
    desc: 'القراءة نفسها قد تعني «جيد» على آلة و«مرفوض» على أخرى',
    missions: [
      { id: 'same-value', text: 'أدخل قيمة 6.0 mm/s وأظهر اختلاف الحكم بين الفئتين الثانية والرابعة' },
      { id: 'classify', text: 'صنّف ثلاث آلات في فئاتها الصحيحة قبل الحكم عليها' },
      { id: 'trend-call', text: 'اقرأ اتجاه ثلاث قراءات متتابعة واتخذ قرار الصيانة المناسب' },
    ],
  },
  {
    id: 'balance-polygon', icon: 'compass', unit: 'u5',
    title: 'مضلّع الاتزان',
    concepts: ['centrifugal-force', 'one-plane-balancing', 'vector-polygon', 'static-dynamic-balance'],
    desc: 'ثلاث كتل تدور في مستوى واحد — أين تضع الرابعة لتُسكِتها؟',
    missions: [
      { id: 'close-polygon', text: 'أغلق مضلّع القوى بكتلة موازنة واحدة' },
      { id: 'read-angle', text: 'استخرج زاوية كتلة الموازنة بدقة تقلّ عن 5 درجات' },
      { id: 'force-square', text: 'ضاعف سرعة الدوران وسجّل ما حدث لمقادير القوى ولزاوية الموازنة' },
    ],
  },
  {
    id: 'recip-forces', icon: 'piston', unit: 'u5',
    title: 'قوى القصور في المكائن الترددية',
    concepts: ['reciprocating-balance', 'primary-force', 'secondary-force', 'inertia-moment'],
    desc: 'أسطوانة، ثم أسطوانتان، ثم أربع — أيّها أهدأ ولماذا؟',
    missions: [
      { id: 'one-cyl', text: 'شغّل تكوين الأسطوانة الواحدة واقرأ القوة الابتدائية العظمى' },
      { id: 'two-cancel', text: 'انتقل إلى أسطوانتين وسجّل القوة الابتدائية وعزمها: أيّهما اتزن؟' },
      { id: 'four-secondary', text: 'انتقل إلى أربع أسطوانات وقارن قوّتها الثانوية بقوّة الأسطوانة الواحدة' },
      { id: 'add-mass', text: 'أضف كتلة زائدة إلى مكبس واحد وأظهر عودة القوة الابتدائية' },
    ],
  },
];

const loaders = {
  'wave-anatomy': () => import('./wave-anatomy.js'),
  'amplitude-three': () => import('./amplitude-three.js'),
  'free-forced': () => import('./free-forced.js'),
  dof: () => import('./dof.js'),
  resonance: () => import('./resonance.js'),
  'dva-triangle': () => import('./dva-triangle.js'),
  sensors: () => import('./sensors.js'),
  mounting: () => import('./mounting.js'),
  'fft-lab': () => import('./fft-lab.js'),
  'spectrum-read': () => import('./spectrum-read.js'),
  'iso-judge': () => import('./iso-judge.js'),
  'balance-polygon': () => import('./balance-polygon.js'),
  'recip-forces': () => import('./recip-forces.js'),
};

export function loadSim(id) {
  const l = loaders[id];
  return l ? l() : Promise.resolve(null);
}
