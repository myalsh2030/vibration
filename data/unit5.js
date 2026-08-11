// الوحدة الخامسة — الاتزان (u5)
// المصدر المحتوائي: content/TH05.md (من «الوحدة الرابعة: الإتزان») + content/TH06.md كاملًا.
// المرجع العددي الملزم: js/sims/balancekit.js (centrifugalForce · PLANE_RULE/planesNeeded ·
// ISO1940_GRADES · ENGINE_CONFIGS) و«Vibration and Balancing Lab/course-map.md» البند 1.
//
// الفكرة المحورية للوحدة كلها:
//   عدم الاتزان ليس «ثقلًا زائدًا» بل **قوة دوّارة** تنمو مع مربّع السرعة،
//   والاتزان ليس تخفيفًا للوزن بل **إلغاء متجه بمتجه مضاد**.
//
// سقف الرياضيات: معادلات جاهزة + جمع متجهي بصريّ بالمضلّع. لا أعداد مركّبة، ولا حلّ
// نظام معادلات، ولا اشتقاق/تفاضل/تكامل. معامل التأثير يُشرح مفهوميًا — والجهاز يحسبه.
//
// تصحيحات صامتة منقولة من course-map.md (لا يُعرض الخطأ للمتدرب):
//   • صيغة القوة الطاردة في الحقيبة سقط منها الأس: الصواب F = M ω² r.
//   • زاوية الكتلة الرابعة في المثال 4-1: المحصّلة عند 28.1° (الربع الأول)، وكتلة
//     الاتزان تعاكسها عند 208.1° — والخطوة الوسيطة مذكورة صراحةً هنا.

export const UNIT5 = {
  id: 'u5',
  title: 'الاتزان',
  icon: 'scale',
  color: '#fbbf24',
  tagline: 'غرامٌ واحد في غير موضعه… يهدم محملًا بعد ألف ساعة',
  lessons: [
    // ════════════════════════════════════════════════════════════
    // u5l1 — القوى الاستاتيكية والديناميكية والقوة الطاردة المركزية
    // ════════════════════════════════════════════════════════════
    {
      id: 'u5l1',
      title: 'القوى الاستاتيكية والديناميكية والقوة الطاردة',
      minutes: 12,
      concepts: ['static-force', 'dynamic-force', 'centrifugal-force', 'unbalance-def'],
      blocks: [
        {
          t: 'concept',
          title: 'لماذا ترتجف عجلة القيادة عند سرعة بعينها؟',
          icon: '🔥',
          html: 'العجلة نفسها، والطريق نفسه — لكن عند <span class="ltr">100 km/h</span> بالضبط تبدأ عجلة القيادة بالارتجاف، ثم تهدأ إن أسرعتَ أو أبطأت. السبب غرامات قليلة من المطاط في غير موضعها. هذه هي <span class="term">حالة عدم الاتزان <i>Unbalance</i></span>، وسنكتشف في هذا الدرس أنها ليست «وزنًا زائدًا» بل <b>قوة دوّارة</b> تكبر بسرعة مذهلة كلما زادت اللفّات.',
        },
        {
          t: 'concept',
          title: 'قوة ساكنة وقوة متحركة: فرق يغيّر كل شيء',
          icon: '⚖️',
          html: '<span class="term">القوى الاستاتيكية <i>Static Forces</i></span> هي قوى جسم في سكون: محصّلتها صفر ومحصّلة عزومها صفر — كتاب على طاولة، أو مروحة معلّقة في السقف. أما <span class="term">القوى الديناميكية <i>Dynamic Forces</i></span> فقوى الأجسام المتحركة، ومحصّلتها لا تساوي صفرًا بل <b>الكتلة × التسارع</b>. الآلة الساكنة تحمل وزنها فقط؛ والآلة الدائرة تُولّد فوق وزنها قوى تدور معها.',
        },
        {
          t: 'figure',
          caption: 'كتلة غير متزنة واحدة، وسرعتان: مضاعفة السرعة تُربّع القوة — والسهم الأيمن يساوي أربعة أسهم يسرى',
          svg: '<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><circle cx="110" cy="150" r="38" fill="none" stroke="var(--c-simrotor)" stroke-width="2"/><circle cx="290" cy="150" r="38" fill="none" stroke="var(--c-simrotor)" stroke-width="2"/><line x1="110" y1="150" x2="110" y2="116" stroke="var(--c-simtrace)" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="290" y1="150" x2="290" y2="116" stroke="var(--c-simtrace)" stroke-width="1.5" stroke-dasharray="4 3"/><circle cx="110" cy="116" r="9" fill="var(--c-simmass)"/><circle cx="290" cy="116" r="9" fill="var(--c-simmass)"/><line x1="110" y1="107" x2="110" y2="91" stroke="var(--c-amber)" stroke-width="3"/><polygon points="110,83 105,95 115,95" fill="var(--c-amber)"/><line x1="290" y1="107" x2="290" y2="16" stroke="var(--c-amber)" stroke-width="3"/><polygon points="290,8 285,20 295,20" fill="var(--c-amber)"/><text x="110" y="212" text-anchor="middle" fill="var(--c-text)" font-size="14" font-weight="bold">100 RPM</text><text x="290" y="212" text-anchor="middle" fill="var(--c-text)" font-size="14" font-weight="bold">200 RPM</text><text x="110" y="234" text-anchor="middle" fill="var(--c-text2)" font-size="13">F</text><text x="290" y="234" text-anchor="middle" fill="var(--c-text2)" font-size="13">4 F</text><text x="200" y="252" text-anchor="middle" fill="var(--c-text2)" font-size="12">الكتلة نفسها ونصف القطر نفسه</text></svg>',
        },
        {
          t: 'formula',
          name: 'القوة الطاردة المركزية',
          expr: 'F = M × ω<sup>2</sup> × r',
          terms: [
            { sym: 'F', ar: 'القوة الطاردة المركزية', unit: 'N' },
            { sym: 'M', ar: 'الكتلة غير المتزنة', unit: 'kg' },
            { sym: 'ω', ar: 'التردد الدائري، ويُحسب من سرعة الدوران', unit: 'rad/s' },
            { sym: 'r', ar: 'بُعد الكتلة عن مركز الدوران', unit: 'm' },
          ],
          note: 'انتبه للأس: السرعة <b>مربّعة</b> والكتلة ونصف القطر <b>مفردان</b>. احسب ω أولًا: <span class="ltr">ω = 2π × N ÷ 60</span>. وعوّض دائمًا بالوحدات الأساسية: الكتلة بالكيلوغرام ونصف القطر بالمتر.',
        },
        {
          t: 'example',
          title: 'كم قوة يصنعها غرامٌ واحد؟',
          given: [
            'كتلة غير متزنة M = <span class="ltr">79 g</span> أي <span class="ltr">0.079 kg</span>',
            'نصف القطر r = <span class="ltr">100 mm</span> أي <span class="ltr">0.1 m</span>',
            'سرعة الدوران N = <span class="ltr">200 RPM</span>',
          ],
          steps: [
            'التردد الدائري: <span class="ltr">ω = 2 × 3.1416 × 200 ÷ 60</span> = <span class="ltr">20.94 rad/s</span>',
            'ربّع التردد الدائري: <span class="ltr">ω² = 20.94 × 20.94</span> = <span class="ltr">438.6</span>',
            'عوّض في المعادلة: <span class="ltr">F = 0.079 × 438.6 × 0.1</span> = <span class="ltr">3.47 N</span>',
          ],
          answer: 'F ≈ <span class="ltr">3.47 N</span>. ولو ضاعفتَ السرعة وحدها إلى <span class="ltr">400 RPM</span> لصارت <span class="ltr">13.9 N</span> — أربعة أضعاف بلا أن تلمس الكتلة.',
        },
        {
          t: 'flip',
          title: 'اقلب البطاقة: ما الذي يضاعف القوة؟',
          cards: [
            { front: 'ضاعفتُ الكتلة غير المتزنة', back: 'القوة تتضاعف مرة واحدة فقط — العلاقة طردية بسيطة مع M.' },
            { front: 'ضاعفتُ نصف القطر', back: 'القوة تتضاعف مرة واحدة فقط — العلاقة طردية بسيطة مع r.' },
            { front: 'ضاعفتُ سرعة الدوران', back: 'القوة تتضاعف أربع مرات! لأن السرعة داخلة بمربّعها: <span class="ltr">2² = 4</span>. هذه هي القاعدة الذهبية.' },
            { front: 'ثلّثتُ سرعة الدوران', back: 'القوة تصير تسعة أضعاف: <span class="ltr">3² = 9</span>. ولهذا تنجو آلة بطيئة من عدم اتزان يهدم آلة سريعة.' },
          ],
        },
        {
          t: 'concept',
          title: 'ما عدم الاتزان بالضبط؟',
          icon: '⭕',
          html: 'إذا لم ينطبق <span class="term">مركز الثقل <i>Center of Gravity</i></span> على <span class="term">مركز الدوران <i>Center of Rotation</i></span> فبينهما مسافة صغيرة اسمها <b>r</b>. عند الدوران تُولّد هذه المسافة قوة طاردة تدور مع العمود دورةً بدورة. ولهذا بالضبط تظهر بصمة عدم الاتزان في الطيف عند <b><span class="ltr">1×</span></b> سرعة الدوران: القوة تكمل دورة كاملة كلما أكمل العمود دورة.',
        },
        {
          t: 'match',
          title: 'وصّل كل حالة بتصنيفها الصحيح',
          pairs: [
            { a: 'كتاب ساكن على طاولة', b: 'قوى استاتيكية' },
            { a: 'قوة طرد مركزي على دوّار مروحة', b: 'قوى ديناميكية' },
            { a: 'وزن التوربين على قواعده وهو متوقف', b: 'قوى استاتيكية' },
            { a: 'قوة تدور مع العمود وتظهر عند <span class="ltr">1×</span>', b: 'قوى ديناميكية' },
          ],
        },
        {
          t: 'tip',
          html: 'في الورشة: <span class="ltr">8 g</span> فقط على نصف قطر <span class="ltr">100 mm</span> في مروحة تدور <span class="ltr">1500 RPM</span> تُولّد نحو <span class="ltr">20 N</span> تدور مع العمود وتضرب المحملين نحو <span class="ltr">1500</span> مرة في الدقيقة. لا تقل «ثمانية غرامات لا تُذكر» — قل «عشرون نيوتنًا تطرق المحمل مليون طرقة كل عشر ساعات».',
        },
        { t: 'quiz', ref: 'u5l1check' },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // u5l2 — الاتزان الاستاتيكي والديناميكي: مستوى أم مستويان؟
    // ════════════════════════════════════════════════════════════
    {
      id: 'u5l2',
      title: 'الاتزان الاستاتيكي والديناميكي: مستوى أم مستويان؟',
      minutes: 12,
      concepts: ['static-dynamic-balance', 'planes-decision', 'iso-1940'],
      blocks: [
        {
          t: 'concept',
          title: 'اتزنَ وهو ساكن… ثم اهتزّ حين دار',
          icon: '🚩',
          html: 'وضعتَ الدوّار على حافتين ملساوين فاستقرّ في أي وضعية تتركه فيها — إذن هو متزن. شغّلتَ الآلة فاهتزّت. أين الخطأ؟ لا خطأ: أنت اختبرتَ <b>الاتزان الاستاتيكي</b> وحده، والآلة كشفت لك <b>عدم اتزان ديناميكي</b> لا يظهر إلا مع الدوران.',
        },
        {
          t: 'concept',
          title: 'اتزان استاتيكي: مستوى واحد يكفي',
          icon: '⚖️',
          html: '<span class="term">الاتزان الاستاتيكي <i>Static Balance</i></span> يُختبر والآلة <b>ساكنة</b>: يُثبَّت العمود أفقيًا على حافتين أو محملين بلا احتكاك ويُترك حرًا. إن تأرجح حتى استقرّ «موضع الثقل» إلى الأسفل فهو غير متزن استاتيكيًا. علاجه كتلة واحدة في الجهة المقابلة، على <b>مستوى واحد</b> هو مستوى مركز الثقل.',
        },
        {
          t: 'figure',
          caption: 'كتلتان متساويتان في <span class="ltr">M·r</span> لكن في مستويين متقابلين: القوّتان تُلغيان بعضهما — ويبقى عزم يهزّ المحملين',
          svg: '<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><line x1="140" y1="42" x2="140" y2="222" stroke="var(--c-simtrace)" stroke-width="1.5" stroke-dasharray="5 4"/><line x1="260" y1="42" x2="260" y2="222" stroke="var(--c-simtrace)" stroke-width="1.5" stroke-dasharray="5 4"/><rect x="60" y="124" width="280" height="12" rx="3" fill="var(--c-simrotor)"/><rect x="44" y="116" width="24" height="28" rx="3" fill="var(--c-simtrace)"/><rect x="332" y="116" width="24" height="28" rx="3" fill="var(--c-simtrace)"/><line x1="140" y1="124" x2="140" y2="98" stroke="var(--c-simrotor)" stroke-width="3"/><line x1="260" y1="136" x2="260" y2="162" stroke="var(--c-simrotor)" stroke-width="3"/><circle cx="140" cy="86" r="13" fill="var(--c-simmass)"/><circle cx="260" cy="174" r="13" fill="var(--c-simmass)"/><line x1="140" y1="73" x2="140" y2="52" stroke="var(--c-amber)" stroke-width="3"/><polygon points="140,42 134,55 146,55" fill="var(--c-amber)"/><line x1="260" y1="187" x2="260" y2="208" stroke="var(--c-amber)" stroke-width="3"/><polygon points="260,218 254,205 266,205" fill="var(--c-amber)"/><text x="122" y="60" text-anchor="end" fill="var(--c-text)" font-size="14" font-weight="bold">F1</text><text x="278" y="205" text-anchor="start" fill="var(--c-text)" font-size="14" font-weight="bold">F2</text><text x="140" y="244" text-anchor="middle" fill="var(--c-text2)" font-size="12">المستوى الأول</text><text x="260" y="244" text-anchor="middle" fill="var(--c-text2)" font-size="12">المستوى الثاني</text><text x="200" y="112" text-anchor="middle" fill="var(--c-bad)" font-size="13" font-weight="bold">عزم يهزّ المحملين</text><text x="200" y="26" text-anchor="middle" fill="var(--c-text2)" font-size="12">محصّلة القوّتين = صفر · محصّلة العزم ≠ صفر</text></svg>',
        },
        {
          t: 'concept',
          title: 'اتزان ديناميكي: مستويان لا مستوى',
          icon: '⚙️',
          html: '<span class="term">الاتزان الديناميكي <i>Dynamic Balance</i></span> لا يظهر إلا والآلة <b>دائرة</b>، لأن عدم الاتزان موزّع عشوائيًا على طول العمود لا مركّز في نقطة. كتلة تصحيح واحدة قد تُصلح القوة وتُفسد العزم في اللحظة نفسها — ولهذا يحتاج التصحيح إلى <b>مستويين</b> على طول المحور: واحد لإلغاء القوة والآخر لإلغاء العزم.',
        },
        {
          t: 'formula',
          name: 'نسبة الطول إلى القطر — بها يُتّخذ القرار',
          expr: 'النسبة = L ÷ d',
          terms: [
            { sym: 'L', ar: 'طول جسم الدوّار', unit: 'mm' },
            { sym: 'd', ar: 'قطر الدوّار', unit: 'mm' },
          ],
          note: 'إن كانت النسبة <b>أقل من <span class="ltr">0.5</span></b> (دوّار قرصي): سرعة أقل من <span class="ltr">1000 RPM</span> ← مستوى واحد، وإلا ← مستويان.<br>وإن كانت <b>أكبر من <span class="ltr">0.5</span></b> (دوّار ممتدّ): سرعة أقل من <span class="ltr">150 RPM</span> ← مستوى واحد، وإلا ← مستويان.',
        },
        {
          t: 'example',
          title: 'قرار ميداني: كم مستوى يلزم دوّار المروحة؟',
          given: [
            'طول جسم الدوّار L = <span class="ltr">600 mm</span>',
            'قطر الدوّار d = <span class="ltr">300 mm</span>',
            'سرعة التشغيل N = <span class="ltr">1500 RPM</span>',
          ],
          steps: [
            'النسبة: <span class="ltr">L ÷ d = 600 ÷ 300 = 2</span> — أكبر من <span class="ltr">0.5</span>، فهو دوّار ممتدّ.',
            'حدّ الدوّار الممتدّ هو <span class="ltr">150 RPM</span>، وسرعتنا <span class="ltr">1500 RPM</span> تتجاوزه بعشرة أضعاف.',
            'إذن القرار: مستويا تصحيح.',
          ],
          answer: 'مستويان — لأن عدم الاتزان هنا يولّد <b>عزمًا</b> لا تُلغيه كتلة واحدة مهما أتقنتَ ضبط زاويتها.',
        },
        {
          t: 'match',
          title: 'وصّل كل دوّار بعدد مستويات تصحيحه',
          pairs: [
            { a: 'قرص رفيع <span class="ltr">L/d = 0.3</span> عند <span class="ltr">700 RPM</span>', b: 'مستوى واحد' },
            { a: 'قرص رفيع <span class="ltr">L/d = 0.3</span> عند <span class="ltr">1200 RPM</span>', b: 'مستويان' },
            { a: 'دوّار ممتدّ <span class="ltr">L/d = 2</span> عند <span class="ltr">1500 RPM</span>', b: 'مستويان' },
            { a: 'دوّار ممتدّ <span class="ltr">L/d = 3</span> عند <span class="ltr">100 RPM</span>', b: 'مستوى واحد' },
          ],
        },
        {
          t: 'concept',
          title: 'إلى أي حدّ نُتقن الاتزان؟ درجات جودة الاتزان',
          icon: '🎯',
          html: 'لا يوجد دوّار متزن تمامًا — يوجد دوّار متزن <b>بما يكفي لصنفه</b>. يعطي <span class="term">معيار جودة الاتزان <i>ISO 1940</i></span> لكل نوع آلة درجة G: <b><span class="ltr">G 2.5</span></b> للتوربينات البخارية والغازية ودوّارات المولّدات، و<b><span class="ltr">G 6.3</span></b> للمراوح والمضخات وأجزاء الآلات العامة — وهي الأشيع في أعمال الصيانة. كلما صغر الرقم اشتدّ الطلب.',
        },
        {
          t: 'formula',
          name: 'الانحراف المسموح به',
          expr: 'e = 9549 × G ÷ n',
          terms: [
            { sym: 'e', ar: 'انحراف مركز الثقل المسموح به', unit: 'µm' },
            { sym: 'G', ar: 'درجة جودة الاتزان من المعيار', unit: 'mm/s' },
            { sym: 'n', ar: 'سرعة تشغيل الدوّار', unit: 'RPM' },
          ],
          note: 'لاحظ أن <b><span class="ltr">n</span> في المقام</b>: كلما زادت السرعة ضاق المسموح به. مروحة <span class="ltr">G 6.3</span> عند <span class="ltr">1500 RPM</span> يُسمح لها بـ <span class="ltr">40 µm</span>، وعند <span class="ltr">3000 RPM</span> بـ <span class="ltr">20 µm</span> فقط.',
        },
        {
          t: 'tip',
          html: 'في الورشة: لا تبدأ بحساب الكتل — ابدأ بشريط القياس. قِس طول جسم الدوّار وقطره، واقرأ سرعة التشغيل من لوحة الآلة، ثم قرّر: مستوى أم مستويان؟ الفنّي الذي يوازن دوّارًا ممتدًّا بمستوى واحد يقضي يومه في تدوير الكتلة بلا نتيجة — ليس لأنه أخطأ الحساب بل لأنه أخطأ <b>القرار</b>.',
        },
        { t: 'quiz', ref: 'u5l2check' },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // u5l3 — اتزان كتل في مستوى واحد وفي مستويات مختلفة
    // ════════════════════════════════════════════════════════════
    {
      id: 'u5l3',
      title: 'اتزان كتل في مستوى واحد وفي مستويات مختلفة',
      minutes: 15,
      concepts: ['one-plane-balancing', 'vector-polygon', 'trial-mass', 'influence-coefficient', 'two-plane-balancing', 'residual-check'],
      blocks: [
        {
          t: 'concept',
          title: 'لا تُخفّف الوزن — ألغِ المتجه',
          icon: '📏',
          html: 'الاتزان ليس تخفيفًا لوزن الدوّار. القوة الطاردة <b>متجه</b>: له مقدار واتجاه يدوران مع العمود. وإلغاء متجه لا يكون إلا بمتجه آخر مساوٍ له في المقدار ومعاكس له في الاتجاه. هذا كل السرّ — والباقي تفاصيل قياس.',
        },
        {
          t: 'concept',
          title: 'ما يُوازَن هو حاصل ضرب الكتلة في نصف القطر',
          icon: '🔢',
          html: 'بما أن ω واحدة لكل الكتل على العمود نفسه، فهي تُختصر من طرفَي معادلة الاتزان ويبقى شرط بسيط: <b><span class="ltr">M × r = M₁ × r₁</span></b>. أي أن <span class="ltr">100 g</span> على <span class="ltr">50 mm</span> تعادل تمامًا <span class="ltr">50 g</span> على <span class="ltr">100 mm</span>. ولهذا تُقاس شدّة عدم الاتزان بـ <span class="ltr">g·mm</span> لا بالغرام وحده.',
        },
        {
          t: 'figure',
          caption: 'مضلّع القوى: ثلاثة متجهات <span class="ltr">M·r</span> رأسًا بذيل، والمتجه الرابع (بالكهرماني) يُغلق المضلّع عائدًا إلى نقطة البداية — هو كتلة الاتزان',
          svg: '<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><line x1="45" y1="200" x2="380" y2="200" stroke="var(--c-simtrace)" stroke-width="1" stroke-dasharray="4 4"/><line x1="45" y1="200" x2="273" y2="200" stroke="var(--c-simrotor)" stroke-width="3"/><polygon points="273,200 263,195 263,205" fill="var(--c-simrotor)"/><line x1="273" y1="200" x2="355" y2="152" stroke="var(--c-simrotor)" stroke-width="3"/><polygon points="355,152 348,162 343,154" fill="var(--c-simrotor)"/><line x1="355" y1="152" x2="287" y2="71" stroke="var(--c-simrotor)" stroke-width="3"/><polygon points="287,71 298,76 290,83" fill="var(--c-simrotor)"/><line x1="287" y1="71" x2="45" y2="200" stroke="var(--c-amber)" stroke-width="3.5"/><polygon points="45,200 53,189 58,199" fill="var(--c-amber)"/><circle cx="45" cy="200" r="4" fill="var(--c-text)"/><text x="159" y="219" text-anchor="middle" fill="var(--c-text2)" font-size="13">A = 120</text><text x="328" y="172" text-anchor="middle" fill="var(--c-text2)" font-size="13">B = 50</text><text x="344" y="110" text-anchor="middle" fill="var(--c-text2)" font-size="13">C = 56</text><text x="150" y="126" text-anchor="middle" fill="var(--c-amber)" font-size="14" font-weight="bold">D = 144.3</text><text x="150" y="145" text-anchor="middle" fill="var(--c-amber)" font-size="12">208 deg</text><text x="70" y="222" text-anchor="start" fill="var(--c-text2)" font-size="11">0 deg</text><text x="200" y="26" text-anchor="middle" fill="var(--c-text2)" font-size="12">المضلّع المغلق = دوّار متزن</text></svg>',
        },
        {
          t: 'formula',
          name: 'كتلة الاتزان من محصّلة المضلّع',
          expr: 'M<sub>D</sub> × r<sub>D</sub> = محصّلة (M × r)',
          terms: [
            { sym: 'M<sub>D</sub>', ar: 'كتلة الاتزان المطلوبة', unit: 'kg' },
            { sym: 'r<sub>D</sub>', ar: 'نصف القطر الذي ستُثبَّت عليه', unit: 'mm' },
            { sym: 'المحصّلة', ar: 'طول الضلع المُغلِق للمضلّع', unit: 'kg·mm' },
            { sym: 'θ<sub>D</sub>', ar: 'زاوية المحصّلة معكوسة نصف دورة', unit: 'درجة' },
          ],
          note: 'المحصّلة تُقاس من المضلّع مباشرة، أو تُحسب من مجموعي المركّبتين: المحصّلة = √(مجموع الأفقي² + مجموع الرأسي²).',
        },
        {
          t: 'example',
          title: 'مثال الحقيبة: ثلاث كتل على قرص — أين الرابعة؟',
          given: [
            'A: <span class="ltr">1 kg</span> على <span class="ltr">120 mm</span> عند الزاوية <span class="ltr">0°</span>',
            'B: <span class="ltr">0.5 kg</span> على <span class="ltr">100 mm</span> عند <span class="ltr">30°</span>',
            'C: <span class="ltr">0.7 kg</span> على <span class="ltr">80 mm</span> عند <span class="ltr">130°</span>',
            'كتلة الاتزان D ستُثبَّت على نصف قطر <span class="ltr">60 mm</span>',
          ],
          steps: [
            'احسب <span class="ltr">M·r</span> لكل كتلة: A = <span class="ltr">120</span> و B = <span class="ltr">50</span> و C = <span class="ltr">56 kg·mm</span>، ثم حلّل كلًّا منها أفقيًا (<span class="ltr">× cos θ</span>) ورأسيًا (<span class="ltr">× sin θ</span>): مجموع الأفقي = <span class="ltr">127.3</span> ومجموع الرأسي = <span class="ltr">67.9 kg·mm</span>.',
            'المحصّلة = <span class="ltr">√(127.3² + 67.9²)</span> = <span class="ltr">144.3 kg·mm</span>، وزاويتها <span class="ltr">tan⁻¹(67.9 ÷ 127.3)</span> = <span class="ltr">28.1°</span>. <b>حدّد الربع أولًا</b>: المجموعان كلاهما موجب، فالمحصّلة في <b>الربع الأول</b> والزاوية تُؤخذ كما هي.',
            'كتلة الاتزان تعاكس المحصّلة تمامًا: زاويتها = <span class="ltr">28.1° + 180°</span> = <span class="ltr">208.1°</span>، ومقدارها <span class="ltr">M<sub>D</sub> = 144.3 ÷ 60</span> = <span class="ltr">2.4 kg</span>.',
          ],
          answer: 'M<sub>D</sub> ≈ <span class="ltr">2.4 kg</span> عند زاوية <span class="ltr">208°</span> ونصف قطر <span class="ltr">60 mm</span> — وهي بالضبط الضلع الكهرماني الذي أغلق المضلّع في الرسم أعلاه.',
        },
        {
          t: 'sim',
          sim: 'balance-polygon',
          title: 'مضلّع الاتزان',
          desc: 'ثلاث كتل تدور في مستوى واحد — أين تضع الرابعة لتُسكِتها؟',
          missions: [
            { id: 'close-polygon', text: 'أغلق مضلّع القوى بكتلة موازنة واحدة' },
            { id: 'read-angle', text: 'استخرج زاوية كتلة الموازنة بدقة تقلّ عن 5 درجات' },
            { id: 'force-square', text: 'ضاعف سرعة الدوران وسجّل ما حدث لمقادير القوى ولزاوية الموازنة' },
          ],
        },
        {
          t: 'concept',
          title: 'وفي الميدان: أين مضلّعك؟ كتلة الاختبار',
          icon: '🛠',
          html: 'على آلة حقيقية لا تعرف الكتلة غير المتزنة ولا زاويتها — تعرف فقط ما يقرأه الجهاز. فتفعل هذا: تقيس الاهتزاز الأصلي (سعة وزاوية)، ثم تُثبّت <span class="term">كتلة اختبار <i>Trial Mass</i></span> معلومة عند زاوية معلومة، وتقيس مرة أخرى. <b>الفرق بين القراءتين هو أثر كتلة الاختبار وحدها</b> — وهذا هو مضلّعك الحقيقي.',
        },
        {
          t: 'concept',
          title: 'معامل التأثير: بصمة الآلة التي يحسبها الجهاز',
          icon: '💡',
          html: 'إذا قسمتَ أثر كتلة الاختبار على كتلتها حصلتَ على <span class="term">معامل التأثير <i>Influence Coefficient</i></span>: <b>كم وحدة اهتزاز يُحدثها كل غرام، وبأي انزياح زاوي</b>. إنه بصمة هذه الآلة وحدها عند هذه السرعة. و<b>الجهاز هو من يحسبه</b> — تمامًا كما في الواقع. مهمتك أنت: أن تقيس بدقة، وتُدخل بأمانة، وتفسّر النتيجة، وتتحقق منها.',
        },
        {
          t: 'order',
          title: 'رتّب دورة الاتزان الميداني بمستوى واحد',
          items: [
            'اعزل الطاقة، ثم قِس الاهتزاز الأصلي سعةً وزاوية',
            'ثبّت كتلة اختبار معلومة عند زاوية معلومة',
            'شغّل وقِس مرة ثانية لتعرف أثر كتلة الاختبار',
            'دع الجهاز يحسب كتلة التصحيح وزاويتها',
            'ثبّت كتلة التصحيح، ثم شغّل وقِس للتحقق من الانخفاض',
          ],
        },
        {
          t: 'concept',
          title: 'مستويان: الفكرة نفسها… مرتين',
          icon: '⚙️',
          html: 'في <span class="term">الاتزان بمستويين <i>Two-Plane Balancing</i></span> تُقاس السعة والزاوية عند <b>محملين</b> لا محمل واحد، وتُوضع كتلة الاختبار في المستوى الأول مرة وفي الثاني مرة — أي <b>ثلاث دورات تشغيل</b> وثماني قراءات. عندها يعرف الجهاز أثر كل مستوى على كلا المحملين فيحسب كتلتَي التصحيح وزاويتيهما معًا. أنت تقيس وتُدخل وتفسّر؛ الحساب عمله هو.',
        },
        {
          t: 'tip',
          html: 'في الورشة: لا تُغلق أمر العمل قبل <span class="term">قياس التحقّق <i>Residual Check</i></span> — تشغيلة أخيرة تُقاس فيها القراءتان معًا وتُقارنان بحدود <span class="ltr">ISO</span>. ثلاث علامات على أنك أخطأت: انخفض محمل وارتفع الآخر (نسيتَ المستوى الثاني)، أو لم تنخفض القراءة أصلًا (السبب ليس عدم اتزان بل اصطفافًا أو رخاوة)، أو انخفضت ثم عادت بعد ساعة (الكتلة لم تُثبَّت جيدًا).',
        },
        { t: 'quiz', ref: 'u5l3check' },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // u5l4 — اتزان المكائن الترددية والتوربينات البخارية
    // ════════════════════════════════════════════════════════════
    {
      id: 'u5l4',
      title: 'اتزان المكائن الترددية والتوربينات البخارية',
      minutes: 14,
      concepts: ['reciprocating-balance', 'primary-force', 'secondary-force', 'inertia-moment', 'turbine-balance'],
      blocks: [
        {
          t: 'concept',
          title: 'كتلة لا تدور… بل تذهب وتعود',
          icon: '🔧',
          html: 'المروحة تدور فتصنع قوة دوّارة واحدة. أما المكبس فيصعد ويهبط ويقف مرتين في كل دورة — ويُوقِف كتلته ويُعيد إطلاقها مرتين. <span class="term">الكتل الترددية <i>Reciprocating Masses</i></span> لا يمكن أن تتزن تمامًا إلا بكتل ترددية مماثلة في الاتجاه المعاكس، ولهذا يقرّر المصمّم عدد الأسطوانات وزوايا الكرنك قبل أن تُصبّ كتلة اتزان واحدة.',
        },
        {
          t: 'figure',
          caption: 'الكرنك والذراع والمكبس: نصف قطر الكرنك r، وطول ذراع التوصيل L، ونسبتهما <span class="ltr">n = L ÷ r</span> هي التي تحكم القوة الثانوية',
          svg: '<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><rect x="152" y="26" width="96" height="96" rx="4" fill="none" stroke="var(--c-simrotor)" stroke-width="2"/><rect x="158" y="58" width="84" height="26" rx="3" fill="var(--c-simmass)"/><circle cx="200" cy="200" r="45" fill="none" stroke="var(--c-simtrace)" stroke-width="1.5" stroke-dasharray="5 4"/><line x1="200" y1="200" x2="378" y2="200" stroke="var(--c-simtrace)" stroke-width="1" stroke-dasharray="4 4"/><line x1="200" y1="200" x2="222" y2="161" stroke="var(--c-amber)" stroke-width="4"/><line x1="222" y1="161" x2="200" y2="74" stroke="var(--c-simwave)" stroke-width="3"/><circle cx="200" cy="200" r="6" fill="var(--c-text)"/><circle cx="222" cy="161" r="6" fill="var(--c-amber)"/><circle cx="200" cy="74" r="5" fill="var(--c-simwave)"/><text x="238" y="180" text-anchor="start" fill="var(--c-amber)" font-size="14" font-weight="bold">r</text><text x="228" y="118" text-anchor="start" fill="var(--c-simwave)" font-size="14" font-weight="bold">L</text><text x="226" y="212" text-anchor="start" fill="var(--c-text2)" font-size="13">theta</text><text x="200" y="46" text-anchor="middle" fill="var(--c-text2)" font-size="12">المكبس</text><text x="200" y="256" text-anchor="middle" fill="var(--c-text2)" font-size="12">عمود المرفق</text><text x="26" y="40" text-anchor="start" fill="var(--c-text)" font-size="13" font-weight="bold">n = L / r</text><text x="26" y="64" text-anchor="start" fill="var(--c-text2)" font-size="12">الابتدائية عند 1x</text><text x="26" y="84" text-anchor="start" fill="var(--c-text2)" font-size="12">الثانوية عند 2x</text></svg>',
        },
        {
          t: 'formula',
          name: 'قوة القصور الابتدائية',
          expr: 'F<sub>p</sub> = m × ω<sup>2</sup> × r × cos θ',
          terms: [
            { sym: 'F<sub>p</sub>', ar: 'قوة القصور الابتدائية', unit: 'N' },
            { sym: 'm', ar: 'الكتلة الترددية للمكبس والذراع', unit: 'kg' },
            { sym: 'r', ar: 'نصف قطر الكرنك', unit: 'm' },
            { sym: 'θ', ar: 'زاوية الكرنك من نقطة البداية', unit: 'درجة' },
          ],
          note: 'تكمل دورة كاملة مع كل دورة للعمود، فتظهر في الطيف عند <b><span class="ltr">1×</span></b> — بصمة تشبه عدم الاتزان تمامًا. وأقصى قيمة لها عند <span class="ltr">cos θ = 1</span>.',
        },
        {
          t: 'formula',
          name: 'قوة القصور الثانوية',
          expr: 'F<sub>s</sub> = m × ω<sup>2</sup> × r × cos 2θ ÷ n',
          terms: [
            { sym: 'F<sub>s</sub>', ar: 'قوة القصور الثانوية', unit: 'N' },
            { sym: 'n = L ÷ r', ar: 'نسبة طول ذراع التوصيل إلى نصف قطر الكرنك', unit: 'بلا وحدة' },
            { sym: '2θ', ar: 'ضعف زاوية الكرنك', unit: 'درجة' },
          ],
          note: 'تكمل <b>دورتين</b> مع كل دورة للعمود، فتظهر عند <b><span class="ltr">2×</span></b>. وكلما طال ذراع التوصيل كبرت <span class="ltr">n</span> وصغرت الثانوية — ولهذا يُطيل المصمّمون الذراع ما استطاعوا.',
        },
        {
          t: 'example',
          title: 'كم تبلغ قوى القصور في مكبس واحد؟',
          given: [
            'الكتلة الترددية m = <span class="ltr">500 g</span> أي <span class="ltr">0.5 kg</span>',
            'نصف قطر الكرنك r = <span class="ltr">50 mm</span> وذراع التوصيل L = <span class="ltr">200 mm</span>',
            'سرعة الدوران N = <span class="ltr">1500 RPM</span>',
          ],
          steps: [
            '<span class="ltr">ω = 2 × 3.1416 × 1500 ÷ 60</span> = <span class="ltr">157.1 rad/s</span>، و <span class="ltr">ω² = 24674</span>.',
            'أقصى ابتدائية (عند <span class="ltr">cos θ = 1</span>): <span class="ltr">F<sub>p</sub> = 0.5 × 24674 × 0.05</span> = <span class="ltr">617 N</span>.',
            'النسبة <span class="ltr">n = 200 ÷ 50 = 4</span>، فأقصى ثانوية = <span class="ltr">617 ÷ 4</span> = <span class="ltr">154 N</span>.',
          ],
          answer: 'الابتدائية <span class="ltr">617 N</span> بتردد <span class="ltr">1×</span>، والثانوية <span class="ltr">154 N</span> بتردد <span class="ltr">2×</span> — أي رُبعها لأن <span class="ltr">n = 4</span>.',
        },
        {
          t: 'flip',
          title: 'ثلاثة تكوينات… ثلاثة أحكام',
          cards: [
            { front: 'أسطوانة واحدة', back: 'الابتدائية والثانوية غير متزنتين معًا — أشدّ التكوينات اهتزازًا، ولهذا يُعلَّق على مساند مطاطية.' },
            { front: 'أسطوانتان بكرنك <span class="ltr">180°</span>', back: 'الابتدائية تتزن (تُلغي كلٌّ منهما الأخرى)، لكن عزمها لا يتزن، والثانوية تتضاعف بدل أن تُلغى.' },
            { front: 'أربع أسطوانات <span class="ltr">1-3-4-2</span>', back: 'الابتدائية وعزمها متزنان، وعزم الثانوية متزن — لكن القوة الثانوية تتضاعف أربع مرات: عيب المحرك الرباعي الشهير.' },
          ],
        },
        {
          t: 'sim',
          sim: 'recip-forces',
          title: 'قوى القصور في المكائن الترددية',
          desc: 'أسطوانة، ثم أسطوانتان، ثم أربع — أيّها أهدأ ولماذا؟',
          missions: [
            { id: 'one-cyl', text: 'شغّل تكوين الأسطوانة الواحدة واقرأ القوة الابتدائية العظمى' },
            { id: 'two-cancel', text: 'انتقل إلى أسطوانتين وسجّل القوة الابتدائية وعزمها: أيّهما اتزن؟' },
            { id: 'four-secondary', text: 'انتقل إلى أربع أسطوانات وقارن قوّتها الثانوية بقوّة الأسطوانة الواحدة' },
            { id: 'add-mass', text: 'أضف كتلة زائدة إلى مكبس واحد وأظهر عودة القوة الابتدائية' },
          ],
        },
        {
          t: 'concept',
          title: 'القوة صفر… والعزم ليس صفرًا',
          icon: '⚠',
          html: 'في محرك الأسطوانتين تتساوى القوّتان وتتعاكسان فتكون محصّلتهما صفرًا — لكنهما لا تعملان في المستوى نفسه. المسافة بينهما تحوّلهما إلى <span class="term">عزم قصور <i>Inertia Moment</i></span> يُرجّح المحرك حول مركزه ويضرب المحملين بالتناوب. وهذا هو الدرس نفسه الذي رأيته في الدوّار: القوة قد تتزن والعزم لا يتزن.',
        },
        {
          t: 'concept',
          title: 'التوربين البخاري: أخطر ما تُوازنه',
          icon: '🔥',
          html: 'مشاكل التوربينات نادرة وصيانتها قليلة — لكن أي خلل في العضو الدوار يُحدث اهتزازًا قد يُحرّر ريشة من موضعها فتثقب الغلاف وتُحطّم الأجزاء الداخلية. ولهذا يُوازن دوّار التوربين إلى الدرجة <b><span class="ltr">G 2.5</span></b>، ويُدار عند الإحماء ببطء شديد <span class="ltr">10–15 RPM</span> بعلبة تروس التدوير حتى يتمدّد بانتظام ولا ينحني.',
        },
        {
          t: 'tip',
          html: 'في الورشة: التوربين يعمل بالبخار <b>الجاف</b>. دخول الماء مع البخار يصدم الريش صدمًا سريعًا فيختلّ الاتزان — وقد ينتهي الأمر بكارثة. وتذكّر الرقم الذي يُقنع الإدارة: عدم اتزان الآلة قد يرفع استهلاك الطاقة إلى <span class="ltr">20%</span> فوق اللازم، فضلًا عن تلف المحامل. الاتزان بند وفر لا بند كلفة.',
        },
        { t: 'quiz', ref: 'u5l4check' },
      ],
    },
  ],
};

// ════════════════════════════════════════════════════════════════
// بنوك أسئلة الوحدة الخامسة
// ════════════════════════════════════════════════════════════════
export const U5_QUIZZES = {
  // ---------- القبلي: 6 أسئلة ----------
  u5pre: {
    title: 'قبل الانطلاق: أين أنت من الاتزان؟',
    questions: [
      {
        t: 'mc',
        q: 'مروحة صارت تدور بضعف سرعتها السابقة، والكتلة غير المتزنة فيها لم تتغيّر. ماذا يحدث للقوة الطاردة المركزية؟',
        opts: [
          'تتضاعف مرتين لأن العلاقة طردية بسيطة',
          'تبقى ثابتة ما دامت الكتلة نفسها لم تتغيّر',
          'تتضاعف أربع مرات',
        ],
        correct: 2,
        why: 'في <span class="ltr">F = M ω² r</span> تدخل السرعة بمربّعها: مضاعفتها تعني <span class="ltr">2² = 4</span>. أما مضاعفة الكتلة أو نصف القطر فتضاعف القوة مرة واحدة فقط.',
        unit: 'u5',
        concept: 'centrifugal-force',
      },
      {
        t: 'mc',
        q: 'ما أدقّ وصف لحالة عدم الاتزان في دوّار؟',
        opts: [
          'ثقل زائد أُضيف إلى الدوّار عن طريق الخطأ',
          'مركز الثقل لا ينطبق على مركز الدوران بمسافة تتحوّل عند الدوران إلى قوة طاردة',
          'ارتخاء في مسامير تثبيت قاعدة الآلة',
        ],
        correct: 1,
        why: 'عدم الاتزان انزياح بين مركز الثقل ومركز الدوران بمسافة <span class="ltr">r</span>، فتولد قوة طاردة تدور مع العمود. وزن الدوّار الكلي ليس هو المشكلة، والارتخاء بصمة عطل أخرى.',
        unit: 'u5',
        concept: 'unbalance-def',
      },
      {
        t: 'mc',
        q: 'دوّار طوله ضعف قطره يدور عند <span class="ltr">1500 RPM</span>. كم مستوى تصحيح يلزمه؟',
        opts: [
          'مستوى واحد لأن الدوّار قصير نسبيًا وسريع',
          'مستويان: النسبة فوق <span class="ltr">0.5</span> وسرعته <span class="ltr">1500 RPM</span> تتجاوز حدّ الدوّار الممتدّ <span class="ltr">150 RPM</span>',
          'مستوى واحد لأن السرعة أقل من <span class="ltr">3000 RPM</span> بكثير',
        ],
        correct: 1,
        why: 'النسبة <span class="ltr">L/d = 2</span> أكبر من <span class="ltr">0.5</span>، فهو دوّار ممتدّ حدّه <span class="ltr">150 RPM</span>. وسرعته تتجاوز الحدّ بكثير، فعدم الاتزان يولّد عزمًا لا تُلغيه كتلة واحدة.',
        unit: 'u5',
        concept: 'planes-decision',
      },
      {
        t: 'mc',
        q: 'ما الكمية التي تُوازَن فعليًا عند اتزان قرص في مستوى واحد؟',
        opts: [
          'نصف القطر وحده لأن الكتل متساوية',
          'حاصل ضرب الكتلة في نصف قطرها',
          'الكتلة وحدها مهما اختلف موضعها',
        ],
        correct: 1,
        why: 'شرط الاتزان هو <span class="ltr">M × r = M₁ × r₁</span>، فـ <span class="ltr">100 g</span> على <span class="ltr">50 mm</span> تعادل <span class="ltr">50 g</span> على <span class="ltr">100 mm</span>. ولهذا تُقاس الشدة بـ <span class="ltr">g·mm</span>.',
        unit: 'u5',
        concept: 'one-plane-balancing',
      },
      {
        t: 'tf',
        q: 'الاتزان بمستويين يحتاج قراءات عند محملين اثنين لا عند محمل واحد.',
        correct: true,
        why: 'صحيح. كتلة كل مستوى تؤثر في المحملين معًا، فلا بدّ من قراءة السعة والزاوية عند المحملين في كل دورة تشغيل حتى يعرف الجهاز أثر كل مستوى على كليهما.',
        unit: 'u5',
        concept: 'two-plane-balancing',
      },
      {
        t: 'mc',
        q: 'أي تكوين محرك تتضاعف فيه القوة الثانوية أربع مرات؟',
        opts: [
          'المحرك أحادي الأسطوانة',
          'المحرك الثنائي بكرنك <span class="ltr">180°</span>',
          'المحرك الرباعي <span class="ltr">1-3-4-2</span>',
        ],
        correct: 2,
        why: 'في الرباعي تتزن الابتدائية وعزمها ويتزن عزم الثانوية، لكن القوى الثانوية الأربع تتجمّع في الاتجاه نفسه فتتضاعف أربع مرات — عيبه الشهير. وفي الثنائي تتضاعف مرتين فقط.',
        unit: 'u5',
        concept: 'reciprocating-balance',
      },
    ],
  },

  // ---------- نقطة تفتيش الدرس الأول ----------
  u5l1check: {
    title: 'نقطة تفتيش: القوى والقوة الطاردة',
    questions: [
      {
        t: 'mc',
        q: 'كتلة غير متزنة <span class="ltr">79 g</span> على نصف قطر <span class="ltr">100 mm</span> تدور عند <span class="ltr">200 RPM</span>. كم القوة الطاردة تقريبًا؟',
        opts: [
          '<span class="ltr">0.17 N</span>',
          '<span class="ltr">3.47 N</span>',
          '<span class="ltr">34.7 N</span>',
        ],
        correct: 1,
        why: '<span class="ltr">ω = 2π × 200 ÷ 60</span> = <span class="ltr">20.94 rad/s</span>، و <span class="ltr">ω² = 438.6</span>، فتكون <span class="ltr">F = 0.079 × 438.6 × 0.1</span> = <span class="ltr">3.47 N</span>. تذكّر التعويض بالكيلوغرام والمتر.',
        unit: 'u5',
        concept: 'centrifugal-force',
      },
      {
        t: 'tf',
        q: 'في حالة الاتزان الساكن تكون محصّلة القوى ومحصّلة العزوم كلتاهما صفرًا.',
        correct: true,
        why: 'صحيح. هذان هما شرطا الاتزان الاستاتيكي: مجموع القوى الخارجية صفر ومجموع العزوم حول مركز الثقل صفر — وعليهما يقوم علم الاستاتيكا كله.',
        unit: 'u5',
        concept: 'static-force',
      },
      {
        t: 'mc',
        q: 'تحت أي تصنيف تقع القوة الطاردة المركزية في دوّار مضخة أثناء التشغيل؟',
        opts: [
          'قوة استاتيكية لأنها ثابتة المقدار',
          'قوة استاتيكية لأنها ناتجة عن الوزن',
          'قوة ديناميكية لأنها ترتبط بالحركة',
        ],
        correct: 2,
        why: 'القوى الديناميكية قوى الأجسام المتحركة، ومحصّلتها كتلة × تسارع. والقوة الطاردة لا توجد أصلًا والآلة ساكنة — تظهر بالدوران وتختفي بتوقفه.',
        unit: 'u5',
        concept: 'dynamic-force',
      },
      {
        t: 'mc',
        q: 'عند أي تردد تظهر بصمة عدم الاتزان في طيف آلة دوّارة؟',
        opts: [
          'عند <span class="ltr">2×</span> سرعة الدوران',
          'عند <span class="ltr">1×</span> سرعة الدوران',
          'عند تردد مرور الريش',
        ],
        correct: 1,
        why: 'الكتلة غير المتزنة تكمل دورة واحدة كلما أكمل العمود دورة، فقوتها تتردد بتردد الدوران نفسه أي <span class="ltr">1×</span>. أما <span class="ltr">2×</span> فبصمة تُرجّح عدم الاصطفاف.',
        unit: 'u5',
        concept: 'unbalance-def',
      },
    ],
  },

  // ---------- نقطة تفتيش الدرس الثاني ----------
  u5l2check: {
    title: 'نقطة تفتيش: مستوى أم مستويان؟',
    questions: [
      {
        t: 'mc',
        q: 'قرص رفيع نسبته <span class="ltr">L/d = 0.3</span> يدور عند <span class="ltr">1200 RPM</span>. كم مستوى تصحيح يلزمه؟',
        opts: [
          'مستوى واحد لأن نسبته دون <span class="ltr">0.5</span>',
          'مستويان لأن سرعته <span class="ltr">1200 RPM</span> تجاوزت حدّ الدوّار القرصي البالغ <span class="ltr">1000 RPM</span>',
          'مستوى واحد لأنه قرص رفيع وقصير أصلًا',
        ],
        correct: 1,
        why: 'كون الدوّار قرصيًا لا يكفي: حدّ الدوّار القرصي هو <span class="ltr">1000 RPM</span>، وفوقه يصير أدنى انحراف بين مستوى الكتلة ومستوى التصحيح عزمًا محسوسًا. السرعة وحدها قد تفرض مستويين.',
        unit: 'u5',
        concept: 'planes-decision',
      },
      {
        t: 'mc',
        q: 'دوّار استقرّ على الحافتين في أي وضعية تتركه فيها، لكنه اهتزّ عند التشغيل. ما التفسير؟',
        opts: [
          'اختبار الحافتين أُجري بطريقة غير صحيحة',
          'المحملان تالفان ولا علاقة للاتزان',
          'متزن استاتيكيًا وغير متزن ديناميكيًا',
        ],
        correct: 2,
        why: 'اختبار الحافتين يكشف الاتزان الاستاتيكي وحده. أما عدم الاتزان الديناميكي فموزّع على طول العمود ولا يظهر إلا بالدوران — كتلتان متقابلتان قد تُلغيان القوة وتُبقيان عزمًا.',
        unit: 'u5',
        concept: 'static-dynamic-balance',
      },
      {
        t: 'mc',
        q: 'مروحة بدرجة <span class="ltr">G 6.3</span> تدور عند <span class="ltr">1500 RPM</span>. كم الانحراف المسموح به؟',
        opts: [
          '<span class="ltr">4 µm</span>',
          '<span class="ltr">40 µm</span>',
          '<span class="ltr">400 µm</span>',
        ],
        correct: 1,
        why: '<span class="ltr">e = 9549 × G ÷ n</span> = <span class="ltr">9549 × 6.3 ÷ 1500</span> ≈ <span class="ltr">40 µm</span>. ولأن السرعة في المقام، فلو دارت عند <span class="ltr">3000 RPM</span> لصار المسموح <span class="ltr">20 µm</span> فقط.',
        unit: 'u5',
        concept: 'iso-1940',
      },
      {
        t: 'tf',
        q: 'الدرجة <span class="ltr">G 2.5</span> أشدّ طلبًا من <span class="ltr">G 6.3</span>، ولهذا تُخصَّص للتوربينات.',
        correct: true,
        why: 'صحيح. كلما صغر رقم الدرجة ضاق المسموح به. فـ <span class="ltr">G 2.5</span> للتوربينات ودوّارات المولّدات، و<span class="ltr">G 6.3</span> للمراوح والمضخات وأجزاء الآلات العامة وهي الأشيع في الصيانة.',
        unit: 'u5',
        concept: 'iso-1940',
      },
    ],
  },

  // ---------- نقطة تفتيش الدرس الثالث ----------
  u5l3check: {
    title: 'نقطة تفتيش: مضلّع القوى ومعامل التأثير',
    questions: [
      {
        t: 'mc',
        q: 'متى نقول إن مضلّع قوى الكتل الدائرة يدلّ على دوّار متزن؟',
        opts: [
          'حين تتساوى أطوال جميع أضلاعه الأربعة',
          'حين تكون كل زواياه قائمة تمامًا',
          'حين ينغلق المضلّع على نقطة بدايته',
        ],
        correct: 2,
        why: 'انغلاق المضلّع يعني أن محصّلة المتجهات صفر، أي لا قوة متبقية. ولا يشترط تساوي الأضلاع ولا انتظام الزوايا — بل أن يعود آخر متجه إلى نقطة البداية.',
        unit: 'u5',
        concept: 'vector-polygon',
      },
      {
        t: 'mc',
        q: 'لماذا نُثبّت كتلة اختبار على دوّار نعلم أصلًا أنه غير متزن؟',
        opts: [
          'لنزيد الاهتزاز حتى يسهل قياسه بالجهاز',
          'لنُثبّت زاوية الطور قبل بدء القياس',
          'لنعرف كم يستجيب هذا الدوّار لكل غرام',
        ],
        correct: 2,
        why: 'قراءة الاهتزاز وحدها لا تخبرك كم غرامًا تحتاج. الفرق بين القراءة قبل كتلة الاختبار وبعدها هو أثر تلك الكتلة وحدها، ومنه تُعرف استجابة الآلة لكل غرام.',
        unit: 'u5',
        concept: 'trial-mass',
      },
      {
        t: 'mc',
        q: 'ما معامل التأثير بلغة الفنّي؟',
        opts: [
          'نسبة كتلة التصحيح إلى كتلة الدوّار كله',
          'كم وحدة اهتزاز يُحدثها كل غرام، وبأي انزياح زاوي عن موضع كتلة الاختبار',
          'الفرق بين زاوية القراءة وزاوية علامة الطور',
        ],
        correct: 1,
        why: 'معامل التأثير بصمة الآلة عند سرعتها: مقدار الاهتزاز لكل غرام، مع الانزياح الزاوي بين موضع الكتلة وموضع أثرها. والجهاز هو من يحسبه — ومهمتك أن تقيس وتُدخل وتفسّر.',
        unit: 'u5',
        concept: 'influence-coefficient',
      },
      {
        t: 'tf',
        q: 'بعد تثبيت كتلة التصحيح يجب تشغيل الآلة وقياسها مرة أخرى قبل إغلاق أمر العمل.',
        correct: true,
        why: 'صحيح — هذا قياس التحقّق. بلا تشغيلة أخيرة تُقارن بحدود <span class="ltr">ISO</span> لن تعرف: هل انخفض الاهتزاز فعلًا؟ أم انخفض محمل وارتفع الآخر؟ أم أن السبب لم يكن عدم اتزان أصلًا؟',
        unit: 'u5',
        concept: 'residual-check',
      },
    ],
  },

  // ---------- نقطة تفتيش الدرس الرابع ----------
  u5l4check: {
    title: 'نقطة تفتيش: الترددية والتوربينات',
    questions: [
      {
        t: 'mc',
        q: 'عند أي تردد تظهر قوة القصور الابتدائية في طيف محرك ترددي؟',
        opts: [
          'عند <span class="ltr">2×</span> سرعة الدوران',
          'عند نصف سرعة الدوران',
          'عند <span class="ltr">1×</span> سرعة الدوران',
        ],
        correct: 2,
        why: 'الابتدائية تتبع <span class="ltr">cos θ</span>، فتكمل دورة واحدة مع كل دورة للعمود أي <span class="ltr">1×</span>. أما الثانوية فتتبع <span class="ltr">cos 2θ</span> وتكمل دورتين، فتظهر عند <span class="ltr">2×</span>.',
        unit: 'u5',
        concept: 'primary-force',
      },
      {
        t: 'mc',
        q: 'محرك ذراع توصيله <span class="ltr">200 mm</span> ونصف قطر كرنكه <span class="ltr">50 mm</span>. كم تبلغ الثانوية العظمى نسبةً إلى الابتدائية العظمى؟',
        opts: [
          'مثلها تمامًا لأن <span class="ltr">n</span> لا تؤثر',
          'رُبعها لأن <span class="ltr">n = 4</span>',
          'أربعة أضعافها لأن <span class="ltr">n = 4</span>',
        ],
        correct: 1,
        why: 'الثانوية تُقسم على <span class="ltr">n = L ÷ r = 200 ÷ 50 = 4</span>. فلو كانت الابتدائية <span class="ltr">617 N</span> صارت الثانوية <span class="ltr">154 N</span>. وإطالة الذراع تكبّر <span class="ltr">n</span> وتصغّر الثانوية.',
        unit: 'u5',
        concept: 'secondary-force',
      },
      {
        t: 'tf',
        q: 'في محرك بأسطوانتين وكرنك <span class="ltr">180°</span> تتزن القوة الابتدائية لكن عزمها يبقى غير متزن.',
        correct: true,
        why: 'صحيح. القوّتان متساويتان ومتعاكستان فتلغيان بعضهما، لكنهما تعملان في مستويين متباعدين على العمود فتصنعان عزمًا يُرجّح المحرك ويضرب المحملين بالتناوب — والثانوية تتضاعف فوق ذلك.',
        unit: 'u5',
        concept: 'inertia-moment',
      },
      {
        t: 'mc',
        q: 'لماذا يُدار دوّار التوربين البخاري ببطء شديد عند الإحماء؟',
        opts: [
          'لتوفير البخار في مرحلة بدء التشغيل',
          'ليتمدّد بانتظام فلا ينحني عموده',
          'لتقليل الحمل على مولّد الكهرباء',
        ],
        correct: 1,
        why: 'علبة تروس التدوير تُديره <span class="ltr">10–15 RPM</span> ليتوزّع الحرارة على محيط الدوّار كله. لو سُخّن ساكنًا لتمدّد جانب دون جانب فانحنى العمود، وصار غير متزن قبل أن يبدأ العمل.',
        unit: 'u5',
        concept: 'turbine-balance',
      },
    ],
  },
};

// ════════════════════════════════════════════════════════════════
// أسئلة الوحدة الخامسة في الاختبار التشخيصي الشامل
// ════════════════════════════════════════════════════════════════
export const U5_DIAG = [
  {
    t: 'mc',
    q: 'لماذا يهتزّ دوّار مروحة عند سرعة تشغيله بينما لا يبدو عليه شيء وهو متوقف؟',
    opts: [
      'المحامل تسخن بالتشغيل فيزداد الخلوص بداخلها',
      'الهواء المندفع يدفع الريش دفعًا غير منتظم',
      'كتلة صغيرة في غير موضعها تصنع قوة دوّارة',
    ],
    correct: 2,
    why: 'عدم الاتزان قوة طاردة <span class="ltr">F = M ω² r</span> لا توجد إلا بالدوران، وتكبر مع مربّع السرعة. أما سخونة المحامل واضطراب الهواء فبصمات أخرى لها أعراض مختلفة في الطيف.',
    unit: 'u5',
    concept: 'centrifugal-force',
  },
  {
    t: 'mc',
    q: 'ما الفرق الجوهري بين الاتزان الاستاتيكي والاتزان الديناميكي؟',
    opts: [
      'الأول للمكائن الصغيرة والثاني للمكائن الكبيرة',
      'الأول يُصحَّح بمستوى واحد والثاني بمستويين',
      'الأول يُقاس بالغرام والثاني يُقاس بالنيوتن',
    ],
    correct: 1,
    why: 'الاستاتيكي يُختبر والآلة ساكنة ويُصحَّح بكتلة واحدة في مستوى مركز الثقل. والديناميكي لا يظهر إلا بالدوران ويحتاج مستويين: واحد لإلغاء القوة وآخر لإلغاء العزم.',
    unit: 'u5',
    concept: 'static-dynamic-balance',
  },
  {
    t: 'tf',
    q: 'اهتزاز دوّار التوربين البخاري قد يُحرّر ريشة من موضعها فتثقب الغلاف.',
    correct: true,
    why: 'صحيح، ولهذا يُوازن دوّار التوربين إلى الدرجة <span class="ltr">G 2.5</span> ويُشغَّل ببخار جاف. دخول الماء يصدم الريش فيختلّ الاتزان، وقد ينتهي الأمر بتحطّم الأجزاء الداخلية.',
    unit: 'u5',
    concept: 'turbine-balance',
  },
];
