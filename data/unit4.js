// الوحدة الرابعة — المراقبة والتشخيص 🔍
// المصدر المحتوائي: content/TH04.md كاملًا + content/TH05.md حتى الشكل 3-9.
// المرجع الملزم للأرقام والمعايير: js/sims/vibstd.js (ISO_CLASSES · CREST_WAVE · CREST_LIFE ·
// BEARING_CHART · DIAG_RULES) و«Vibration and Balancing Lab/course-map.md» البند 1.
//
// ⚠️ ملاحظتان منقولتان عن التصحيحات الصامتة (تُكتب صوابًا ولا يُعرض الخطأ للمتدرب):
//   • مجال حكم ISO هو 10–1000 Hz حصرًا، ولا يُخلط بنطاق الجهاز (5/10/20 kHz).
//   • الحكم في مخطط شدة اهتزاز المحمل يؤخذ من **الأسوأ** بين مستوى الطاقة والصدمية لا من متوسطهما.
//
// ملف بيانات خالص (ES Module) بلا أي منطق.

export const UNIT4 = {
  id: 'u4',
  title: 'المراقبة والتشخيص',
  icon: 'search',
  color: '#34d399',
  tagline: 'الآلة تشكو قبل أن تتوقف — تعلّم أن تقرأ شكواها',
  lessons: [
    // ============================================================
    // u4l1 — أنظمة المراقبة وبرنامج الصيانة التنبؤية
    // ============================================================
    {
      id: 'u4l1',
      title: 'أنظمة المراقبة وبرنامج الصيانة التنبؤية',
      minutes: 12,
      concepts: ['monitoring-manual', 'monitoring-portable', 'monitoring-online', 'trend-analysis'],
      blocks: [
        {
          t: 'concept',
          title: 'ثلاث طرق لحراسة آلة واحدة',
          icon: '🔍',
          html: 'مروحة تهوية في مستودع، ومضخة تغذية في خط إنتاج، وتوربين لا يتوقف إلا مرة في السنة — أتحرسها كلها بالطريقة نفسها؟ لا. لكل آلة نظام <span class="term">مراقبة اهتزاز <i>Vibration Monitoring</i></span> يناسب خطورتها وكلفة توقّفها: <b>يدوي</b>، أو <b>محمول</b>، أو <b>مستمر آلي</b>. اختيار النظام يسبق القياس، لا العكس.',
        },
        {
          t: 'flip',
          title: 'اقلب البطاقة: أي نظام مراقبة أنا؟',
          cards: [
            {
              front: 'النظام اليدوي (Manual System)',
              back: 'جهاز قياس محمول باليد يعطي رقمًا فوريًا أثناء الجولة الدورية. رخيص وسهل وقليل المعايرة، لكنه <b>يقيس ولا يحلّل</b>، وذاكرته صغيرة أو معدومة، ويتأثر كثيرًا بخطأ الفنّي في اختيار موضع القياس وزاويته.',
            },
            {
              front: 'النظام المحمول (Portable Data Collector)',
              back: 'جامع بيانات يقيس ويحلّل في الميدان، ثم تُفرَّغ قراءاته في حاسب يحفظها سنوات فيقارن حالة الآلة اليوم بحالتها قبل ستة أشهر. عيبه: ثمن البرنامج قد يساوي ثمن الجهاز، ويحتاج معايرة عند كل قياس.',
            },
            {
              front: 'النظام المستمر الآلي (Online Monitoring)',
              back: 'حسّاسات مثبّتة دائمًا على الآلة تُرسل قراءاتها بلا انقطاع إلى حاسب مركزي، فيحذّر الفنّي فورًا و<b>يوقف الآلة آليًا</b> عند الحد الحرج. كلفته عالية وتركيبه يحتاج مهارة، لكنه وحده يمسك عطلًا يولد بين جولتين.',
            },
          ],
        },
        {
          t: 'figure',
          caption: 'سلسلة النظام المستمر: حسّاسات ثابتة ← وحدة جمع ← حاسب مركزي يحلّل ويقرّر، ومنه تحذير فوري للفنّي أو أمر إيقاف آلي عند الحد الحرج',
          svg: '<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><text x="200" y="24" text-anchor="middle" fill="var(--c-text)" font-size="13" font-weight="bold">نظام المراقبة المستمرة للاهتزازات</text><rect x="288" y="46" width="102" height="60" rx="10" fill="none" stroke="var(--c-simrotor)" stroke-width="2"/><circle cx="304" cy="62" r="4" fill="var(--c-simsensor)"/><circle cx="304" cy="76" r="4" fill="var(--c-simsensor)"/><circle cx="304" cy="90" r="4" fill="var(--c-simsensor)"/><text x="348" y="72" text-anchor="middle" fill="var(--c-text)" font-size="11" font-weight="bold">الآلة وحسّاساتها</text><text x="348" y="90" text-anchor="middle" fill="var(--c-text2)" font-size="9">قياس دائم بلا انقطاع</text><line x1="288" y1="76" x2="274" y2="76" stroke="var(--c-text2)" stroke-width="2"/><polygon points="268,76 277,71 277,81" fill="var(--c-text2)"/><rect x="144" y="46" width="124" height="60" rx="10" fill="none" stroke="var(--c-water)" stroke-width="2"/><text x="206" y="72" text-anchor="middle" fill="var(--c-text)" font-size="11" font-weight="bold">وحدة جمع البيانات</text><text x="206" y="90" text-anchor="middle" fill="var(--c-text2)" font-size="9">تجميع وتحليل آلي</text><line x1="144" y1="76" x2="130" y2="76" stroke="var(--c-text2)" stroke-width="2"/><polygon points="124,76 133,71 133,81" fill="var(--c-text2)"/><rect x="10" y="46" width="114" height="60" rx="10" fill="none" stroke="var(--c-water2)" stroke-width="2"/><text x="67" y="72" text-anchor="middle" fill="var(--c-text)" font-size="11" font-weight="bold">الحاسب المركزي</text><text x="67" y="90" text-anchor="middle" fill="var(--c-text2)" font-size="9">قاعدة بيانات وتحليل</text><line x1="67" y1="106" x2="67" y2="140" stroke="var(--c-text2)" stroke-width="2"/><line x1="67" y1="140" x2="206" y2="140" stroke="var(--c-text2)" stroke-width="2"/><line x1="206" y1="140" x2="206" y2="162" stroke="var(--c-text2)" stroke-width="2"/><polygon points="206,168 201,159 211,159" fill="var(--c-text2)"/><line x1="67" y1="140" x2="67" y2="162" stroke="var(--c-text2)" stroke-width="2"/><polygon points="67,168 62,159 72,159" fill="var(--c-text2)"/><rect x="144" y="170" width="124" height="52" rx="10" fill="none" stroke="var(--c-warn)" stroke-width="2"/><text x="206" y="194" text-anchor="middle" fill="var(--c-text)" font-size="11" font-weight="bold">تحذير فوري للفنّي</text><text x="206" y="211" text-anchor="middle" fill="var(--c-text2)" font-size="9">قبل بلوغ الحد الحرج</text><rect x="10" y="170" width="114" height="52" rx="10" fill="none" stroke="var(--c-bad)" stroke-width="2"/><text x="67" y="194" text-anchor="middle" fill="var(--c-text)" font-size="11" font-weight="bold">إيقاف آلي</text><text x="67" y="211" text-anchor="middle" fill="var(--c-text2)" font-size="9">حماية من عطب كارثي</text><text x="200" y="248" text-anchor="middle" fill="var(--c-text2)" font-size="10">القرار يُتّخذ آليًا حين لا يكون الفنّي حاضرًا</text></svg>',
        },
        {
          t: 'concept',
          title: 'كيف تختار؟ اسأل: كم يكلّف توقّفها؟',
          icon: '⚙️',
          html: 'المعيار ليس ثمن الجهاز بل ثمن التوقف المفاجئ:<ul><li>آلة غير حرجة يكفيها <b>جهاز يدوي</b> في جولة دورية.</li><li>آلة مهمة في الإنتاج تستحق <b>جامع بيانات محمول</b> يبني لها تاريخًا يُقارن.</li><li>آلة يعني توقّفها خسارة كبيرة أو خطرًا على السلامة تستحق <b>مراقبة مستمرة</b> بحسّاسات ثابتة.</li></ul>',
        },
        {
          t: 'match',
          title: 'وصّل كل آلة بنظام المراقبة الذي يناسبها',
          pairs: [
            { a: 'مروحة تهوية في مستودع', b: 'جهاز يدوي في جولة شهرية' },
            { a: 'مضخة تغذية في خط إنتاج', b: 'جامع بيانات محمول يبني تاريخًا' },
            { a: 'توربين بخاري يعمل بلا توقّف', b: 'مراقبة مستمرة بحسّاسات ثابتة' },
            { a: 'آلة يهدّد توقفها السلامة', b: 'إيقاف آلي عند تجاوز الحد الحرج' },
          ],
        },
        {
          t: 'concept',
          title: 'الرقم وحده لا يعني شيئًا',
          icon: '📈',
          html: 'قراءة <span class="ltr">3.0 mm/s</span> اليوم: جيدة أم سيئة؟ لا تعرف حتى تعرف <b>من أين جاءت</b>. <span class="term">تحليل الاتجاه العام <i>Trend Analysis</i></span> هو متابعة القراءة نفسها، في النقطة نفسها وبالاتجاه نفسه، شهرًا بعد شهر. آلة صعدت من <span class="ltr">1.4</span> إلى <span class="ltr">3.4 mm/s</span> في شهرين أخطر من آلة ثابتة على <span class="ltr">4.0 mm/s</span> منذ سنة.',
        },
        {
          t: 'figure',
          caption: 'ستّ قراءات شهرية لمضخة من الفئة الثانية: القيمة ما زالت تحت حد الرفض، لكن ميل المنحنى هو الإنذار الحقيقي — الاتجاه يسبق العطل',
          svg: '<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><text x="372" y="30" text-anchor="end" fill="var(--c-text2)" font-size="10">السرعة الفعّالة mm/s</text><line x1="40" y1="215" x2="372" y2="215" stroke="var(--c-border2)" stroke-width="2"/><line x1="372" y1="40" x2="372" y2="215" stroke="var(--c-border2)" stroke-width="2"/><line x1="40" y1="64" x2="372" y2="64" stroke="var(--c-bad)" stroke-width="1.5" stroke-dasharray="6 4"/><text x="46" y="59" fill="var(--c-bad)" font-size="10">حد الرفض 7.10</text><line x1="40" y1="156" x2="372" y2="156" stroke="var(--c-warn)" stroke-width="1.5" stroke-dasharray="6 4"/><text x="46" y="151" fill="var(--c-warn)" font-size="10">حد التنبيه 2.80</text><polyline points="348,190 296,185 244,181 192,168 140,143 88,96" fill="none" stroke="var(--c-water)" stroke-width="2.5"/><circle cx="348" cy="190" r="4" fill="var(--c-water)"/><circle cx="296" cy="185" r="4" fill="var(--c-water)"/><circle cx="244" cy="181" r="4" fill="var(--c-water)"/><circle cx="192" cy="168" r="4" fill="var(--c-water)"/><circle cx="140" cy="143" r="4" fill="var(--c-warn)"/><circle cx="88" cy="96" r="5.5" fill="var(--c-bad)"/><text x="348" y="232" text-anchor="middle" fill="var(--c-text2)" font-size="10">1</text><text x="296" y="232" text-anchor="middle" fill="var(--c-text2)" font-size="10">2</text><text x="244" y="232" text-anchor="middle" fill="var(--c-text2)" font-size="10">3</text><text x="192" y="232" text-anchor="middle" fill="var(--c-text2)" font-size="10">4</text><text x="140" y="232" text-anchor="middle" fill="var(--c-text2)" font-size="10">5</text><text x="88" y="232" text-anchor="middle" fill="var(--c-text2)" font-size="10">6</text><text x="206" y="250" text-anchor="middle" fill="var(--c-text2)" font-size="10">الشهر (من اليمين إلى اليسار)</text><text x="88" y="84" text-anchor="middle" fill="var(--c-bad)" font-size="10">5.6</text><text x="348" y="182" text-anchor="middle" fill="var(--c-text2)" font-size="10">1.2</text></svg>',
        },
        {
          t: 'order',
          title: 'رتّب خطوات بناء برنامج صيانة تنبؤية',
          items: [
            'حصر الآلات وترتيبها بحسب حرجيّتها',
            'تحديد نقاط القياس واتجاهاتها على كل آلة',
            'تسجيل قراءة أساس للآلة وهي سليمة',
            'القياس الدوري على المسار نفسه ورسم الاتجاه',
            'التدخّل قبل العطل عند صعود الاتجاه',
          ],
        },
        {
          t: 'tip',
          html: 'لا تقارن آلة بآلة، قارن الآلة بنفسها. مضختان متطابقتان قد تختلف قراءتاهما بسبب القاعدة والتمديدات. القياس الأول على آلة سليمة بعد التركيب أو العمرة اسمه <span class="term">قراءة الأساس <i>Baseline</i></span>، وهو أثمن رقم في ملف الآلة كله — بدونه يصير تحليل الاتجاه تخمينًا.',
        },
        { t: 'quiz', ref: 'u4l1check' },
      ],
    },

    // ============================================================
    // u4l2 — قراءة الطيف: 1× و2× والتوافقيات والجوانب
    // ============================================================
    {
      id: 'u4l2',
      title: 'قراءة الطيف: 1× و2× والتوافقيات والجوانب',
      minutes: 15,
      concepts: ['spectrum-reading', 'orders-1x-2x', 'harmonics', 'sidebands', 'noise-floor', 'blade-pass', 'bearing-frequencies'],
      blocks: [
        {
          t: 'concept',
          title: 'الموجة تقول «يهتزّ»… والطيف يقول «لماذا»',
          icon: '📊',
          html: 'الموجة الزمنية تعطيك رقمًا واحدًا: كم يهتزّ. أما <span class="term">الطيف <i>Spectrum</i></span> فيفكّك ذلك الرقم إلى قممٍ، كلٌّ منها عند تردد معيّن — ولكل عطل ميكانيكي تردد يسكنه. المحور الأفقي <b>التردد</b> والرأسي <b>السعة</b>. والقراءة الذكية ليست «القمة عالية» بل «القمة عالية <b>عند أي تردد</b>».',
        },
        {
          t: 'figure',
          caption: 'طيف محرك يدور <span class="ltr">1500 RPM</span>: قمة 1× عند <span class="ltr">25 Hz</span> وقمة 2× عند <span class="ltr">50 Hz</span>، ثم توافقيات متناقصة فوق أرضية الضجيج',
          svg: '<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><text x="372" y="30" text-anchor="end" fill="var(--c-text2)" font-size="10">السعة mm/s</text><line x1="40" y1="215" x2="372" y2="215" stroke="var(--c-border2)" stroke-width="2"/><line x1="372" y1="40" x2="372" y2="215" stroke="var(--c-border2)" stroke-width="2"/><rect x="40" y="207" width="332" height="8" fill="var(--c-simtrace)" opacity="0.45"/><text x="46" y="202" fill="var(--c-text2)" font-size="9">أرضية الضجيج</text><rect x="341" y="97" width="14" height="118" fill="var(--c-simspec)"/><rect x="289" y="149" width="14" height="66" fill="var(--c-simspec)"/><rect x="237" y="185" width="14" height="30" fill="var(--c-simspec)"/><rect x="185" y="193" width="14" height="22" fill="var(--c-simspec)"/><rect x="133" y="200" width="14" height="15" fill="var(--c-simspec)"/><rect x="81" y="204" width="14" height="11" fill="var(--c-simspec)"/><text x="348" y="88" text-anchor="middle" fill="var(--c-text)" font-size="10">القمة المهيمنة</text><text x="348" y="230" text-anchor="middle" fill="var(--c-text)" font-size="11" font-weight="bold">1×</text><text x="296" y="230" text-anchor="middle" fill="var(--c-text)" font-size="11" font-weight="bold">2×</text><text x="244" y="230" text-anchor="middle" fill="var(--c-text2)" font-size="11">3×</text><text x="192" y="230" text-anchor="middle" fill="var(--c-text2)" font-size="11">4×</text><text x="140" y="230" text-anchor="middle" fill="var(--c-text2)" font-size="11">5×</text><text x="88" y="230" text-anchor="middle" fill="var(--c-text2)" font-size="11">6×</text><text x="348" y="246" text-anchor="middle" fill="var(--c-text2)" font-size="9">25 Hz</text><text x="296" y="246" text-anchor="middle" fill="var(--c-text2)" font-size="9">50 Hz</text><text x="140" y="246" text-anchor="middle" fill="var(--c-text2)" font-size="9">التردد</text></svg>',
        },
        {
          t: 'concept',
          title: 'المرتبة: تحدّث بلغة سرعة الدوران',
          icon: '🎯',
          html: 'حوّل سرعة الآلة إلى هرتز أولًا: <span class="ltr">1500 RPM ÷ 60 = 25 Hz</span>. هذا التردد هو <span class="term">المرتبة الأولى <i>1× First Order</i></span>. والقمة عند ضعفه <span class="ltr">50 Hz</span> هي <b>2×</b>، وعند ثلاثة أضعافه <b>3×</b>. الفنّي المحترف لا يقول «قمة عند <span class="ltr">50 Hz</span>» بل «قمة عند 2×» — لأن المعنى في النسبة لا في الرقم المجرّد.',
        },
        {
          t: 'formula',
          name: 'تردد مرور الريش',
          expr: 'BPF = Z × f',
          terms: [
            { sym: 'BPF', ar: 'تردد مرور الريش', unit: 'Hz' },
            { sym: 'Z', ar: 'عدد الشفرات أو الريش', unit: 'عدد' },
            { sym: 'f', ar: 'سرعة الدوران', unit: 'Hz' },
          ],
          note: 'وتُحسب <span class="ltr">f</span> من سرعة الآلة: <span class="ltr">RPM ÷ 60</span>. والقاعدة نفسها تنطبق على ريش المروحة وريش دافعة المضخة وشفرات التوربين — فهذه قمة <b>تصميم</b> لا قمة عطل.',
        },
        {
          t: 'example',
          title: 'مروحة بسبع شفرات: أين تتوقّع قممها؟',
          given: ['سرعة المروحة <span class="ltr">1800 RPM</span>', 'عدد الشفرات <span class="ltr">Z = 7</span>'],
          steps: [
            'سرعة الدوران بالهرتز: <span class="ltr">1800 ÷ 60 = 30 Hz</span> — وهذه قمة 1×.',
            'تردد مرور الريش: <span class="ltr">7 × 30 = 210 Hz</span>.',
            'موقعها بين 6× عند <span class="ltr">180 Hz</span> و8× عند <span class="ltr">240 Hz</span>، فلا تخلطها بتوافقية.',
          ],
          answer: 'قمة <span class="ltr">210 Hz</span> ليست عطلًا بذاتها: هي بصمة تصميم المروحة. وتصير إنذارًا حين ترتفع عن قراءة الأساس أو تظهر حولها جوانب.',
        },
        {
          t: 'concept',
          title: 'ثلاثة ملامح تقرأها في كل طيف',
          icon: '📏',
          html: '<ul><li><b><span class="term">التوافقيات <i>Harmonics</i></span></b>: قمم عند مضاعفات صحيحة لتردد أساسي (2×، 3×، 4×…). سلسلة طويلة منها تعني رخاوة أو تلامسًا.</li><li><b><span class="term">الجوانب <i>Sidebands</i></span></b>: قمم صغيرة تحفّ قمة عالية على مسافات متساوية، والمسافة نفسها تدلّ على مصدر التعديل.</li><li><b><span class="term">أرضية الضجيج <i>Noise Floor</i></span></b>: الحشائش المنخفضة تحت القمم كلها. ارتفاعها بلا قمم واضحة علامة تكهّف أو تشحيم رديء.</li></ul>',
        },
        {
          t: 'figure',
          caption: 'جوانب حول قمة <span class="term">تردد عيب المحمل <i>Bearing Fault Frequency</i></span>: التباعد بين كل جانبين متساوٍ ويساوي 1× — أي أن الدوران هو ما يعدّل نبضات العيب',
          svg: '<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><text x="200" y="26" text-anchor="middle" fill="var(--c-text)" font-size="12" font-weight="bold">جوانب متساوية التباعد حول قمة عالية التردد</text><line x1="30" y1="210" x2="380" y2="210" stroke="var(--c-border2)" stroke-width="2"/><rect x="204" y="110" width="12" height="100" fill="var(--c-simspec)"/><rect x="170" y="158" width="10" height="52" fill="var(--c-simspec)" opacity="0.75"/><rect x="240" y="158" width="10" height="52" fill="var(--c-simspec)" opacity="0.75"/><rect x="136" y="180" width="10" height="30" fill="var(--c-simspec)" opacity="0.6"/><rect x="274" y="180" width="10" height="30" fill="var(--c-simspec)" opacity="0.6"/><rect x="102" y="194" width="10" height="16" fill="var(--c-simspec)" opacity="0.45"/><rect x="308" y="194" width="10" height="16" fill="var(--c-simspec)" opacity="0.45"/><line x1="175" y1="100" x2="210" y2="100" stroke="var(--c-amber)" stroke-width="2"/><polygon points="171,100 179,96 179,104" fill="var(--c-amber)"/><polygon points="214,100 206,96 206,104" fill="var(--c-amber)"/><text x="192" y="90" text-anchor="middle" fill="var(--c-amber)" font-size="11">التباعد = 1×</text><text x="210" y="228" text-anchor="middle" fill="var(--c-text)" font-size="10">تردد عيب المحمل</text><text x="120" y="228" text-anchor="middle" fill="var(--c-text2)" font-size="10">جوانب</text><text x="290" y="228" text-anchor="middle" fill="var(--c-text2)" font-size="10">جوانب</text><text x="200" y="248" text-anchor="middle" fill="var(--c-text2)" font-size="10">قياس التباعد يكشف من يعدّل من</text></svg>',
        },
        {
          t: 'match',
          title: 'وصّل كل ملمح في الطيف بما يعنيه',
          pairs: [
            { a: 'قمة مهيمنة عند 1× وحدها', b: 'عدم اتزان في الدوّار' },
            { a: 'سلسلة 3× و4× و5× و6×', b: 'رخاوة ميكانيكية' },
            { a: 'قمم لا تقع على مضاعفات صحيحة', b: 'ترددات عيوب المحامل' },
            { a: 'قمة عند عدد الشفرات × 1×', b: 'تردد مرور الريش' },
            { a: 'حشائش مرتفعة تحت القمم كلها', b: 'أرضية ضجيج عالية' },
          ],
        },
        {
          t: 'sim',
          sim: 'spectrum-read',
          title: 'قراءة الطيف',
          desc: 'حوّل الطيف من غابة أعمدة إلى جملة مفهومة',
          missions: [
            { id: 'mark-1x', text: 'حدّد قمة 1× على طيف آلة تدور بسرعة معلومة' },
            { id: 'count-harmonics', text: 'عُدّ توافقيات سرعة الدوران الظاهرة فوق أرضية الضجيج' },
            { id: 'sideband-gap', text: 'اقرأ تباعد الجوانب حول قمة عالية التردد وحدّد تردد تعديلها' },
            { id: 'blade-freq', text: 'احسب تردد مرور الريش لمروحة سبع شفرات وأشِر إليه في الطيف' },
          ],
        },
        {
          t: 'tip',
          html: 'قبل أن تحكم على أي قمة، اكتب سرعة الآلة بالهرتز في زاوية الورقة. أكثر أخطاء التشخيص سببها فنّي قرأ قمة عند <span class="ltr">100 Hz</span> وحكم عليها وهو لا يدري أنها 2× لآلة تدور <span class="ltr">3000 RPM</span> — أي عدم اصطفاف، لا عيب محمل.',
        },
        { t: 'quiz', ref: 'u4l2check' },
      ],
    },

    // ============================================================
    // u4l3 — بصمات الأعطال والحكم بالمعيار (12 بلوكًا)
    // ============================================================
    {
      id: 'u4l3',
      title: 'بصمات الأعطال والحكم بالمعيار',
      minutes: 18,
      concepts: [
        'fault-severity', 'iso-10816', 'machine-class', 'crest-factor', 'bearing-severity-chart',
        'unbalance-signature', 'misalignment-signature', 'looseness-signature', 'bearing-signature',
        'cavitation-signature', 'envelope-detection', 'diagnosis-method',
      ],
      blocks: [
        {
          t: 'concept',
          title: 'سؤالان لا سؤال واحد',
          icon: '🔍',
          html: 'أمام أي آلة تهتزّ تسأل سؤالين <b>بترتيب</b>: كم شدّتها؟ ثم ما سببها؟ الأول يجيب عنه <span class="term">معيار ISO 2372 (10816) <i>Vibration Severity</i></span> برقم واحد يقرّر: تُشغّل أم تُوقف. والثاني يجيب عنه شكل الطيف ببصمة العطل. من عكس الترتيب أضاع يومًا في تشخيص آلة لا تحتاج تدخّلًا أصلًا.',
        },
        {
          t: 'figure',
          caption: 'سلّم ISO 2372 (10816) بالسرعة الفعّالة <span class="ltr">mm/s</span>: الحدود الأربعة تتحرّك صعودًا كلما كبرت الآلة ولان أساسها — القراءة نفسها قد تكون «جيدة» على فئة و«مرفوضة» على أخرى',
          svg: '<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><text x="390" y="22" text-anchor="end" fill="var(--c-text2)" font-size="10">السرعة الفعّالة mm/s</text><rect x="300" y="173" width="70" height="32" fill="var(--c-ok)" opacity="0.40"/><rect x="300" y="141" width="70" height="32" fill="var(--c-ok)" opacity="0.18"/><rect x="300" y="109" width="70" height="32" fill="var(--c-warn)" opacity="0.38"/><rect x="300" y="30" width="70" height="79" fill="var(--c-bad)" opacity="0.38"/><text x="335" y="170" text-anchor="middle" fill="var(--c-text)" font-size="9">0.71</text><text x="335" y="138" text-anchor="middle" fill="var(--c-text)" font-size="9">1.80</text><text x="335" y="106" text-anchor="middle" fill="var(--c-text)" font-size="9">4.50</text><rect x="220" y="157" width="70" height="48" fill="var(--c-ok)" opacity="0.40"/><rect x="220" y="126" width="70" height="31" fill="var(--c-ok)" opacity="0.18"/><rect x="220" y="94" width="70" height="32" fill="var(--c-warn)" opacity="0.38"/><rect x="220" y="30" width="70" height="64" fill="var(--c-bad)" opacity="0.38"/><text x="255" y="154" text-anchor="middle" fill="var(--c-text)" font-size="9">1.12</text><text x="255" y="123" text-anchor="middle" fill="var(--c-text)" font-size="9">2.80</text><text x="255" y="91" text-anchor="middle" fill="var(--c-text)" font-size="9">7.10</text><rect x="140" y="141" width="70" height="64" fill="var(--c-ok)" opacity="0.40"/><rect x="140" y="109" width="70" height="32" fill="var(--c-ok)" opacity="0.18"/><rect x="140" y="78" width="70" height="31" fill="var(--c-warn)" opacity="0.38"/><rect x="140" y="30" width="70" height="48" fill="var(--c-bad)" opacity="0.38"/><text x="175" y="138" text-anchor="middle" fill="var(--c-text)" font-size="9">1.80</text><text x="175" y="106" text-anchor="middle" fill="var(--c-text)" font-size="9">4.50</text><text x="175" y="75" text-anchor="middle" fill="var(--c-text)" font-size="9">11.2</text><rect x="60" y="126" width="70" height="79" fill="var(--c-ok)" opacity="0.40"/><rect x="60" y="94" width="70" height="32" fill="var(--c-ok)" opacity="0.18"/><rect x="60" y="62" width="70" height="32" fill="var(--c-warn)" opacity="0.38"/><rect x="60" y="30" width="70" height="32" fill="var(--c-bad)" opacity="0.38"/><text x="95" y="123" text-anchor="middle" fill="var(--c-text)" font-size="9">2.80</text><text x="95" y="91" text-anchor="middle" fill="var(--c-text)" font-size="9">7.10</text><text x="95" y="59" text-anchor="middle" fill="var(--c-text)" font-size="9">18.0</text><line x1="50" y1="205" x2="380" y2="205" stroke="var(--c-border2)" stroke-width="2"/><text x="335" y="220" text-anchor="middle" fill="var(--c-text)" font-size="11" font-weight="bold">I</text><text x="255" y="220" text-anchor="middle" fill="var(--c-text)" font-size="11" font-weight="bold">II</text><text x="175" y="220" text-anchor="middle" fill="var(--c-text)" font-size="11" font-weight="bold">III</text><text x="95" y="220" text-anchor="middle" fill="var(--c-text)" font-size="11" font-weight="bold">IV</text><text x="335" y="234" text-anchor="middle" fill="var(--c-text2)" font-size="9">صغيرة</text><text x="255" y="234" text-anchor="middle" fill="var(--c-text2)" font-size="9">متوسطة</text><text x="175" y="234" text-anchor="middle" fill="var(--c-text2)" font-size="9">كبيرة/صلبة</text><text x="95" y="234" text-anchor="middle" fill="var(--c-text2)" font-size="9">كبيرة/مرنة</text><rect x="340" y="244" width="12" height="12" fill="var(--c-bad)" opacity="0.38"/><text x="336" y="254" text-anchor="end" fill="var(--c-text2)" font-size="9">مرفوض</text><rect x="258" y="244" width="12" height="12" fill="var(--c-warn)" opacity="0.38"/><text x="254" y="254" text-anchor="end" fill="var(--c-text2)" font-size="9">غير مرضٍ</text><rect x="168" y="244" width="12" height="12" fill="var(--c-ok)" opacity="0.18"/><text x="164" y="254" text-anchor="end" fill="var(--c-text2)" font-size="9">مرضٍ</text><rect x="78" y="244" width="12" height="12" fill="var(--c-ok)" opacity="0.40"/><text x="74" y="254" text-anchor="end" fill="var(--c-text2)" font-size="9">جيد</text></svg>',
        },
        {
          t: 'concept',
          title: 'الحكم بالمعيار في ثلاث خطوات',
          icon: '📋',
          html: '<ul><li><b>صنّف الآلة</b>: <span class="term">فئة <i>Machine Class</i></span> I صغيرة (حتى نحو <span class="ltr">15 kW</span>) · II متوسطة (<span class="ltr">15–75 kW</span>) · III كبيرة على <b>أساس صلب</b> · IV كبيرة على <b>أساس مرن</b>.</li><li><b>قِس السرعة الفعّالة</b> في المجال <span class="ltr">10–1000 Hz</span> حصرًا — هذا مجال الحكم، وهو غير نطاق الجهاز (<span class="ltr">5</span> أو <span class="ltr">10</span> أو <span class="ltr">20 kHz</span>) الذي تختاره لالتقاط الترددات العالية.</li><li><b>اقرأ المنطقة</b>: جيد (واصل) · مرضٍ (راقب الاتجاه) · غير مرضٍ (خطّط للإصلاح في أقرب توقّف) · مرفوض (أوقف).</li></ul>',
        },
        {
          t: 'sim',
          sim: 'iso-judge',
          title: 'الحكم بمعيار ISO',
          desc: 'القراءة نفسها قد تعني «جيد» على آلة و«مرفوض» على أخرى',
          missions: [
            { id: 'same-value', text: 'أدخل قيمة 6.0 mm/s وأظهر اختلاف الحكم بين الفئتين الثانية والرابعة' },
            { id: 'classify', text: 'صنّف ثلاث آلات في فئاتها الصحيحة قبل الحكم عليها' },
            { id: 'trend-call', text: 'اقرأ اتجاه ثلاث قراءات متتابعة واتخذ قرار الصيانة المناسب' },
          ],
        },
        {
          t: 'formula',
          name: 'عامل القمة',
          expr: 'عامل القمة = القمة ÷ القيمة الفعّالة',
          terms: [
            { sym: 'Peak', ar: 'أعلى قمة في الإشارة', unit: 'm/s²' },
            { sym: 'RMS', ar: 'القيمة الفعّالة للإشارة', unit: 'm/s²' },
            { sym: 'CF', ar: 'عامل القمة — نسبة بلا وحدة', unit: 'نسبة' },
          ],
          note: 'دلالته: <span class="ltr">1.5–2.5</span> موجة جيبية (عدم اتزان أو عدم اصطفاف) · <span class="ltr">3–4</span> نبضات دورية منتظمة (محمل بحالة جيدة) · <b>أكثر من <span class="ltr">4</span></b> نبضات عشوائية (عيب موضعي). والعتبة العملية التي يتوقّف عندها الفنّي هي <span class="ltr">6</span>.',
        },
        {
          t: 'flip',
          title: 'عامل القمة عبر عمر المحمل — أربع محطات',
          cards: [
            { front: 'محمل سليم', back: 'عامل القمة <b>منخفض</b> والفعّالة <b>منخفضة</b>. لا نبضات حادة، والطاقة موزّعة على الطيف كله.' },
            { front: 'بداية عيب موضعي', back: 'عامل القمة <b>مرتفع</b> والفعّالة <b>ما زالت منخفضة</b>: نبضات حادة نادرة ترفع القمة بلا رفع الطاقة الكلية. <b>هنا يجب أن يُكتشف العطل</b>.' },
            { front: 'عيب متقدّم', back: 'عامل القمة <b>يعود منخفضًا</b> بينما الفعّالة <b>ترتفع بسرعة</b>: كثرت النبضات حتى صارت ضجيجًا مستمرًا فهبطت النسبة — وهو الخداع الكلاسيكي.' },
            { front: 'تلف شديد', back: 'عامل القمة <b>مرتفع</b> والفعّالة <b>مرتفعة</b> معًا: خلوص داخلي كبير، والفشل وشيك.' },
          ],
        },
        {
          t: 'tip',
          html: '<b>الخداع الذي يوقع أكثر الفنيين:</b> عامل قمة منخفض <b>لا يعني</b> محملًا سليمًا. اقرأه دائمًا مع القيمة الفعّالة: منخفضان معًا = سليم · منخفض مع فعّالة صاعدة = <b>عيب متقدّم</b> لا شفاء منه. رقم واحد لا يشخّص، والرقمان معًا يشخّصان.',
        },
        {
          t: 'example',
          title: 'محمل بفعّالة منخفضة… وحكمه «حرج»',
          given: [
            'التسارع الفعّال المقيس <span class="ltr">3.16 m/s²</span>',
            'أقصى قمة للتسارع <span class="ltr">31.6 m/s²</span>',
            'محورا المخطط بالديسيبل ومرجعهما <span class="ltr">10⁻⁶ m/s²</span>، والصيغة <span class="ltr">L = 20 log(المقاس ÷ المرجع)</span>',
          ],
          steps: [
            'الفعّالة بالديسيبل: <span class="ltr">20 × log(3.16 ÷ 0.000001) = 130 dB</span>.',
            'القمة بالديسيبل: <span class="ltr">20 × log(31.6 ÷ 0.000001) = 150 dB</span>.',
            'الفارق <span class="ltr">150 − 130 = 20 dB</span>، أي عامل قمة <span class="ltr">10</span> — صدمية عالية جدًا.',
          ],
          answer: 'مناطق المخطط أربع: ممتاز · جيد · حرج · حرج جدًا. ومستوى الطاقة هنا يقول «ممتاز» بينما تقول الصدمية «حرج» — والحكم يؤخذ من <b>الأسوأ</b> بين المحورين لا من متوسطهما. النتيجة: <b>حرج</b>؛ قصّر فترة المتابعة وجهّز محملًا بديلًا.',
        },
        {
          t: 'figure',
          caption: 'ثلاث بصمات على المحور نفسه: عدم الاتزان يرفع 1× وحده، وعدم الاصطفاف المتوازي يجعل 2× يعلو على 1×، والرخاوة تمدّ سلسلة توافقيات فوق أرضية مرتفعة',
          svg: '<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><text x="326" y="30" text-anchor="middle" fill="var(--c-text)" font-size="11" font-weight="bold">عدم اتزان</text><text x="195" y="30" text-anchor="middle" fill="var(--c-text)" font-size="11" font-weight="bold">عدم اصطفاف</text><text x="65" y="30" text-anchor="middle" fill="var(--c-text)" font-size="11" font-weight="bold">رخاوة</text><line x1="276" y1="190" x2="376" y2="190" stroke="var(--c-border2)" stroke-width="2"/><rect x="362" y="90" width="8" height="100" fill="var(--c-simspec)"/><rect x="346" y="174" width="8" height="16" fill="var(--c-simspec)"/><rect x="330" y="182" width="8" height="8" fill="var(--c-simspec)"/><rect x="314" y="184" width="8" height="6" fill="var(--c-simspec)"/><rect x="298" y="185" width="8" height="5" fill="var(--c-simspec)"/><rect x="282" y="186" width="8" height="4" fill="var(--c-simspec)"/><text x="366" y="202" text-anchor="middle" fill="var(--c-text2)" font-size="8">1×</text><text x="350" y="202" text-anchor="middle" fill="var(--c-text2)" font-size="8">2×</text><line x1="146" y1="190" x2="246" y2="190" stroke="var(--c-border2)" stroke-width="2"/><rect x="232" y="138" width="8" height="52" fill="var(--c-simspec)"/><rect x="216" y="94" width="8" height="96" fill="var(--c-simspec)"/><rect x="200" y="164" width="8" height="26" fill="var(--c-simspec)"/><rect x="184" y="178" width="8" height="12" fill="var(--c-simspec)"/><rect x="168" y="182" width="8" height="8" fill="var(--c-simspec)"/><rect x="152" y="184" width="8" height="6" fill="var(--c-simspec)"/><text x="236" y="202" text-anchor="middle" fill="var(--c-text2)" font-size="8">1×</text><text x="220" y="202" text-anchor="middle" fill="var(--c-text2)" font-size="8">2×</text><line x1="16" y1="190" x2="116" y2="190" stroke="var(--c-border2)" stroke-width="2"/><rect x="16" y="178" width="100" height="12" fill="var(--c-simtrace)" opacity="0.5"/><rect x="102" y="135" width="8" height="55" fill="var(--c-simspec)"/><rect x="86" y="148" width="8" height="42" fill="var(--c-simspec)"/><rect x="70" y="150" width="8" height="40" fill="var(--c-simspec)"/><rect x="54" y="152" width="8" height="38" fill="var(--c-simspec)"/><rect x="38" y="156" width="8" height="34" fill="var(--c-simspec)"/><rect x="22" y="158" width="8" height="32" fill="var(--c-simspec)"/><text x="106" y="202" text-anchor="middle" fill="var(--c-text2)" font-size="8">1×</text><text x="90" y="202" text-anchor="middle" fill="var(--c-text2)" font-size="8">2×</text><text x="326" y="222" text-anchor="middle" fill="var(--c-text2)" font-size="9">1× وحده يهيمن</text><text x="195" y="222" text-anchor="middle" fill="var(--c-text2)" font-size="9">2× يعلو على 1×</text><text x="65" y="222" text-anchor="middle" fill="var(--c-text2)" font-size="9">توافقيات طويلة</text><text x="326" y="238" text-anchor="middle" fill="var(--c-text2)" font-size="9">المحوري ضعيف</text><text x="195" y="238" text-anchor="middle" fill="var(--c-text2)" font-size="9">فرق طور 180°</text><text x="65" y="238" text-anchor="middle" fill="var(--c-text2)" font-size="9">أرضية مرتفعة</text></svg>',
        },
        {
          t: 'match',
          title: 'وصّل كل بصمة بعطلها وإصلاحه',
          pairs: [
            { a: '1× مهيمن شعاعي، والمحوري ضعيف، والطور ثابت', b: 'عدم اتزان — وازن الدوّار' },
            { a: '2× يعلو على 1×، وفرق طور 180° عبر القارنة', b: 'عدم اصطفاف متوازٍ — أعد الاصطفاف' },
            { a: 'المحوري عالٍ يبلغ نصف الشعاعي أو أكثر', b: 'عدم اصطفاف زاوي — اضبط الحشوات' },
            { a: 'توافقيات طويلة ونصف توافقيات وأرضية عالية', b: 'رخاوة — شدّ مسامير التثبيت' },
            { a: 'قمم لا-توافقية مع جوانب وعامل قمة مرتفع', b: 'عيب محمل — استبدله وافحص تشحيمه' },
          ],
        },
        {
          t: 'concept',
          title: 'منهجية التشخيص: من الرقم إلى أمر العمل',
          icon: '🛠',
          html: 'رتّب خطواتك دائمًا: سرعة الآلة بالهرتز ← الحكم بالمعيار ← أي الاتجاهات أعلى قراءةً (أفقي أم رأسي أم محوري) ← نسبة 2× إلى 1× ← الطور عبر القارنة ← عامل القمة وأرضية الضجيج. وإن بقي الشكّ على المحمل فاستعمل <span class="term">كشف المغلّف <i>Envelope Detection</i></span>: يصفّي الإشارة ويستخلص سعتها فتبرز النبضات الضعيفة عالية التردد وتظهر ترددات العيب واضحة. أما ضجيج عريض بلا قمم مع صوت حصى في مضخة فهو <span class="term">تكهّف <i>Cavitation</i></span>، وعلاجه في خط السحب لا في الدوّار.',
        },
        { t: 'quiz', ref: 'u4l3check' },
      ],
    },
  ],
};

// ================================================================
// بنوك أسئلة الوحدة الرابعة
// ================================================================
export const U4_QUIZZES = {
  // ---------------- الاختبار القبلي (6 أسئلة) ----------------
  u4pre: {
    title: 'قبل الانطلاق: ماذا تعرف عن مراقبة الآلات وتشخيصها؟',
    questions: [
      {
        t: 'mc',
        q: 'ما الذي يقدّمه جامع البيانات المحمول ولا يقدّمه جهاز القياس اليدوي البسيط؟',
        opts: [
          'يحفظ القراءات ويقارن حالة اليوم بالأمس',
          'يقيس الاهتزاز على الآلة أثناء عملها',
          'يحتاج فنّيًا يمرّ على الآلة في جولة',
        ],
        correct: 0,
        why: 'الجهاز اليدوي يعطي رقمًا فوريًا ثم ينساه. جامع البيانات يخزّن القراءة ويُفرّغها في حاسب، فتُقارن الآلة بنفسها عبر الأشهر — وهذا أساس الصيانة التنبؤية.',
        unit: 'u4',
        concept: 'monitoring-portable',
      },
      {
        t: 'mc',
        q: 'في طيف الاهتزاز، ماذا يحمل المحور الأفقي؟',
        opts: [
          'التردد بالهرتز',
          'الزمن بالثواني',
          'شدة الاهتزاز',
        ],
        correct: 0,
        why: 'الطيف يفكّك الاهتزاز على محور التردد: كل قمة عند تردد معيّن. أما السعة فعلى المحور الرأسي، والزمن محور الموجة الزمنية لا الطيف.',
        unit: 'u4',
        concept: 'spectrum-reading',
      },
      {
        t: 'mc',
        q: 'آلة تدور <span class="ltr">1500 RPM</span>. عند أي تردد تتوقّع قمة 1×؟',
        opts: [
          '<span class="ltr">25 Hz</span>',
          '<span class="ltr">50 Hz</span>',
          '<span class="ltr">1500 Hz</span>',
        ],
        correct: 0,
        why: 'التحويل: <span class="ltr">1500 ÷ 60 = 25 Hz</span>. أما <span class="ltr">50 Hz</span> فهي 2× أي ضعف سرعة الدوران، وليست 1×.',
        unit: 'u4',
        concept: 'orders-1x-2x',
      },
      {
        t: 'mc',
        q: 'مروحة بخمس شفرات تدور <span class="ltr">1200 RPM</span>. أين تتوقّع تردد مرور الريش؟',
        opts: [
          '<span class="ltr">100 Hz</span>',
          '<span class="ltr">20 Hz</span>',
          '<span class="ltr">240 Hz</span>',
        ],
        correct: 0,
        why: 'سرعة الدوران <span class="ltr">1200 ÷ 60 = 20 Hz</span>، وتردد مرور الريش = عدد الشفرات × سرعة الدوران = <span class="ltr">5 × 20 = 100 Hz</span>.',
        unit: 'u4',
        concept: 'blade-pass',
      },
      {
        t: 'mc',
        q: 'قراءة <span class="ltr">5.0 mm/s</span> فعّالة على مضخة صغيرة من الفئة الأولى. في أي منطقة تقع؟',
        opts: [
          'مرفوض — أوقف الآلة',
          'غير مرضٍ — خطّط للإصلاح',
          'مرضٍ — واصل التشغيل',
        ],
        correct: 0,
        why: 'حدود الفئة الأولى هي <span class="ltr">0.71 / 1.80 / 4.50 mm/s</span>، وقراءة <span class="ltr">5.0</span> تتجاوز الحد الثالث فتقع في منطقة «مرفوض».',
        unit: 'u4',
        concept: 'iso-10816',
      },
      {
        t: 'tf',
        q: 'عامل قمة منخفض يعني دائمًا أن المحمل بحالة جيدة.',
        correct: false,
        why: 'خطأ. عامل القمة يرتفع مع بداية العيب الموضعي ثم <b>يعود منخفضًا</b> مع تفاقمه بينما ترتفع القيمة الفعّالة. اقرأ الرقمين معًا: منخفضان = سليم، ومنخفض مع فعّالة صاعدة = عيب متقدّم.',
        unit: 'u4',
        concept: 'crest-factor',
      },
    ],
  },

  // ---------------- نقطة تفتيش الدرس الأول (4 أسئلة) ----------------
  u4l1check: {
    title: 'نقطة تفتيش: أنظمة المراقبة والاتجاه العام',
    questions: [
      {
        t: 'mc',
        q: 'ما أبرز عيب في نظام المراقبة اليدوي بجهاز قياس بسيط؟',
        opts: [
          'يقيس ولا يخزّن القراءات ولا يحلّلها',
          'يحتاج معايرة يومية قبل كل جولة',
          'لا يصلح للمكائن الدوّارة إطلاقًا',
        ],
        correct: 0,
        why: 'الجهاز اليدوي رخيص وسهل، لكنه يعطي رقمًا فوريًا بلا ذاكرة ولا تحليل طيفي، فلا يبني تاريخًا للآلة — ولهذا يُكمَّل بجامع بيانات أو بنظام مستمر.',
        unit: 'u4',
        concept: 'monitoring-manual',
      },
      {
        t: 'mc',
        q: 'لماذا تُفرَّغ قراءات جامع البيانات المحمول في حاسب بعد الجولة؟',
        opts: [
          'سعته محدودة والمقارنة التاريخية تحتاج قاعدة بيانات',
          'لأن الجهاز لا يعرض الطيف على شاشته الصغيرة في الميدان',
          'لأن إطفاء الجهاز يمسح معايرته وقراءاته معًا',
        ],
        correct: 0,
        why: 'الجهاز المحمول يجمع ويحلّل في الميدان لكن ذاكرته محدودة. القيمة الحقيقية تأتي من حفظ سنوات من القراءات في الحاسب لمقارنة حالة الآلة اليوم بحالتها سابقًا.',
        unit: 'u4',
        concept: 'monitoring-portable',
      },
      {
        t: 'tf',
        q: 'النظام المستمر الآلي يستطيع إيقاف الآلة تلقائيًا عند بلوغ حالة حرجة.',
        correct: true,
        why: 'صحيح. الحسّاسات الثابتة ترسل القراءة بلا انقطاع إلى حاسب مركزي، فيصدر تحذيرًا للفنّي، ويصدر في الحالة الحرجة أمر إيقاف آليًا لحماية الآلة من عطب كارثي.',
        unit: 'u4',
        concept: 'monitoring-online',
      },
      {
        t: 'mc',
        q: 'ثلاث قراءات متتابعة لمضخة: <span class="ltr">1.4</span> ثم <span class="ltr">1.6</span> ثم <span class="ltr">3.4 mm/s</span>. ما القرار الأنسب؟',
        opts: [
          'قصّر فترة القياس وابحث عن السبب',
          'لا تفعل شيئًا فالقراءات كلها منخفضة',
          'أعد معايرة الجهاز فالفروق غير منطقية',
        ],
        correct: 0,
        why: 'القيمة المطلقة ما زالت منخفضة، لكن <b>الاتجاه</b> هو الإنذار: القراءة تضاعفت في فترة واحدة. تحليل الاتجاه يكشف العطل قبل أن يبلغ حدود المعيار.',
        unit: 'u4',
        concept: 'trend-analysis',
      },
    ],
  },

  // ---------------- نقطة تفتيش الدرس الثاني (4 أسئلة) ----------------
  u4l2check: {
    title: 'نقطة تفتيش: قراءة الطيف',
    questions: [
      {
        t: 'mc',
        q: 'طيف آلة يُظهر قممًا عند 2× و3× و4× و5× و6× مع أرضية ضجيج مرتفعة. ما أرجح تفسير؟',
        opts: [
          'رخاوة ميكانيكية في التثبيت',
          'عدم اتزان في دوّار المروحة',
          'تكهّف عند مدخل سحب المضخة',
        ],
        correct: 0,
        why: 'سلسلة التوافقيات الطويلة مع ارتفاع أرضية الضجيج هي بصمة الرخاوة. عدم الاتزان يعطي 1× مهيمنًا وحده، والتكهّف يعطي ضجيجًا عريضًا بلا قمم منتظمة.',
        unit: 'u4',
        concept: 'harmonics',
      },
      {
        t: 'mc',
        q: 'حول قمة عالية التردد تظهر قمم صغيرة متساوية التباعد. عمّ يخبرك مقدار هذا التباعد؟',
        opts: [
          'عن تردد ما يعدّل العيب: سرعة الدوران غالبًا',
          'عن سعة القمة المركزية وشدّة العيب الذي أنتجها',
          'عن نطاق التردد الذي اخترته على الجهاز',
        ],
        correct: 0,
        why: 'الجوانب ناتج تعديل، وتباعدها المتساوي يساوي تردد المُعدِّل. في عيوب المحامل يكون هذا التباعد سرعة الدوران 1× عادةً، فيؤكّد أن مصدر النبضات يدور مع العمود.',
        unit: 'u4',
        concept: 'sidebands',
      },
      {
        t: 'mc',
        q: 'ما الذي يميّز ترددات عيوب المحامل عن التوافقيات في الطيف؟',
        opts: [
          'أنها لا تقع على مضاعفات صحيحة للدوران',
          'أنها تظهر دائمًا تحت تردد الدوران نفسه',
          'أنها أعلى سعة من قمة 1× في كل الأحوال',
        ],
        correct: 0,
        why: 'ترددات عيوب المحامل تنتج من هندسة المحمل وعدد كراته، فتقع عند مضاعفات <b>غير صحيحة</b> لسرعة الدوران — وهذا بالضبط ما يفصلها عن سلسلة التوافقيات.',
        unit: 'u4',
        concept: 'bearing-frequencies',
      },
      {
        t: 'mc',
        q: 'ارتفعت أرضية الضجيج في طيف مضخة بلا ظهور قمم جديدة واضحة. ما أرجح ما يحدث؟',
        opts: [
          'ضجيج عريض عشوائي من تكهّف أو تشحيم رديء',
          'عدم اتزان تطوّر في دوّار المضخة فجأة',
          'رخاوة في مسامير قاعدة المضخة والمحرك',
        ],
        correct: 0,
        why: 'العطل ذو التردد المحدد يرفع قمة بعينها. أما ارتفاع الأرضية كلها بلا قمم فيدلّ على مصدر عشوائي عريض النطاق: فقاعات التكهّف أو احتكاك جاف من تشحيم رديء.',
        unit: 'u4',
        concept: 'noise-floor',
      },
    ],
  },

  // ---------------- نقطة تفتيش الدرس الثالث (4 أسئلة) ----------------
  u4l3check: {
    title: 'نقطة تفتيش: البصمات والحكم بالمعيار',
    questions: [
      {
        t: 'mc',
        q: 'قراءة <span class="ltr">6.0 mm/s</span> فعّالة. كيف يختلف الحكم بين آلة من الفئة الثانية وأخرى من الفئة الرابعة؟',
        opts: [
          '«غير مرضٍ» على الثانية و«مرضٍ» على الرابعة',
          '«مرفوض» على الثانية و«جيد» على الرابعة',
          'الحكم واحد لأن القراءة واحدة في الحالتين',
        ],
        correct: 0,
        why: 'حدود الفئة الثانية <span class="ltr">1.12 / 2.80 / 7.10</span> والرابعة <span class="ltr">2.80 / 7.10 / 18.0</span>. فقراءة <span class="ltr">6.0</span> تتجاوز الحد الثاني للفئة الثانية فتصير غير مرضية، وتبقى دون الحد الثاني للفئة الرابعة فتُعدّ مرضية.',
        unit: 'u4',
        concept: 'machine-class',
      },
      {
        t: 'mc',
        q: 'محمل: التسارع الفعّال <span class="ltr">130 dB</span> وأقصى قمة <span class="ltr">150 dB</span>. ما الحكم على المخطط؟',
        opts: [
          'حرج — الصدمية وحدها تكفي للإدانة',
          'ممتاز — الفعّالة عند أدنى حدودها',
          'جيد — المتوسط بين القيمتين مقبول',
        ],
        correct: 0,
        why: 'الفارق <span class="ltr">20 dB</span> يعني عامل قمة <span class="ltr">10</span>: نبضات حادة من عيب موضعي. والحكم على المخطط يؤخذ من <b>الأسوأ</b> بين مستوى الطاقة والصدمية، لا من متوسطهما.',
        unit: 'u4',
        concept: 'bearing-severity-chart',
      },
      {
        t: 'mc',
        q: 'قراءة 1× عالية أفقيًا ورأسيًا، والمحوري ضعيف، والطور ثابت بين قراءتين. ما العطل؟',
        opts: [
          'عدم اتزان في دوّار الآلة',
          'عدم اصطفاف زاوي في القارنة',
          'رخاوة في مسامير القاعدة',
        ],
        correct: 0,
        why: 'بصمة عدم الاتزان: 1× مهيمن شعاعيًا، والمحوري ضعيف، والطور ثابت لا يتغيّر. لو كان اصطفافًا زاويًا لعلا المحوري، ولو كانت رخاوة لظهرت سلسلة توافقيات ونصف توافقيات.',
        unit: 'u4',
        concept: 'unbalance-signature',
      },
      {
        t: 'mc',
        q: 'قمة 2× تعلو على 1× شعاعيًا، وفرق الطور عبر القارنة قريب من <span class="ltr">180°</span>. ما العطل وما إصلاحه؟',
        opts: [
          'عدم اصطفاف متوازٍ — أعد الاصطفاف',
          'عدم اتزان — وازن الدوّار في مستوى واحد',
          'عيب محمل — استبدله وافحص تشحيمه جيدًا',
        ],
        correct: 0,
        why: 'علوّ 2× على 1× شعاعيًا مع فرق طور <span class="ltr">180°</span> عبر القارنة هو توقيع عدم الاصطفاف المتوازي، وإصلاحه إعادة اصطفاف القارنة بعد فحص القدم الرخوة.',
        unit: 'u4',
        concept: 'misalignment-signature',
      },
    ],
  },
};

// ================================================================
// أسئلة الوحدة الرابعة في الاختبار التشخيصي الشامل (3 أسئلة)
// ================================================================
export const U4_DIAG = [
  {
    t: 'mc',
    q: 'قِست اهتزاز آلة فوجدت القراءة مرتفعة. ما أول ما تفعله؟',
    opts: [
      'أقارنها بحدود المعيار لفئتها',
      'أفكّ القارنة وأفحص محاور الآلة',
      'أستبدل المحمل قبل أي فحص آخر',
    ],
    correct: 0,
    why: 'الترتيب دائمًا: كم شدّتها (بالمعيار وبفئة الآلة) قبل ما سببها. الحكم أولًا يمنعك من صرف يوم كامل في تشخيص آلة لا تحتاج تدخّلًا.',
    unit: 'u4',
    concept: 'fault-severity',
  },
  {
    t: 'mc',
    q: 'ما أول معلومة يحتاجها من يريد قراءة طيف آلة؟',
    opts: [
      'سرعة دورانها بالهرتز',
      'عمر محاملها بالساعات',
      'قدرة محركها بالكيلوواط',
    ],
    correct: 0,
    why: 'كل قراءة طيف تبدأ بتحويل سرعة الآلة إلى هرتز، فمنها تُعرف 1× ومضاعفاتها. وبدونها تبقى القمم أرقامًا بلا معنى.',
    unit: 'u4',
    concept: 'diagnosis-method',
  },
  {
    t: 'mc',
    q: 'طيف آلة مليء بمضاعفات كثيرة لسرعة الدوران وأرضية ضجيجه مرتفعة، والقراءة الرأسية هي الأعلى. ما أرجح عطل؟',
    opts: [
      'رخاوة ميكانيكية',
      'عدم اتزان في الدوّار',
      'تكهّف في المضخة',
    ],
    correct: 0,
    why: 'سلسلة التوافقيات الطويلة مع أرضية مرتفعة وسيادة الاتجاه الرأسي هي بصمة الرخاوة: مسامير تثبيت مرتخية أو قدم رخوة أو خلوص زائد في المحامل.',
    unit: 'u4',
    concept: 'looseness-signature',
  },
];
