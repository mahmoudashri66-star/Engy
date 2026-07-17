# 7️⃣ دليل المونتاج (Editing Guide)

يغطي هذا الدليل التنفيذ على **Adobe Premiere Pro** (للفريق الذي يريد تحكمًا أعمق) و **CapCut** (للفريق الذي يحتاج سرعة وسهولة على الموبايل/الديسكتوب). كل الخطوات مصممة لتكون قابلة للتنفيذ فعليًا من طلاب بلا خبرة مونتاج متقدمة، مع بديل بسيط لكل تقنية متقدمة.

---

## 1. هيكلة المشروع (Project Structure) — قبل البدء

أنشئ نفس بنية المجلدات داخل مشروع المونتاج نفسه (سواء Premiere أو CapCut) لتسهيل التنظيم:

```
01_Footage_Raw/
   ├── Scene1_Hook/
   ├── Scene2_Confusion/
   ├── Scene3_Discovery/
   ├── Scene4_Archive/
   ├── Scene5_Skills/
   ├── Scene6_RealProof/
   ├── Scene7_MatchCut/
   ├── Scene8_Graduation/
   └── Scene9_Ending/
02_Screen_Recordings/
03_Audio/
   ├── VO_Recordings/
   ├── Music/
   └── SFX/
04_Graphics_Assets/
   ├── Logos/
   ├── Text_Templates/
   └── News_Article_Screenshot/
05_Exports/
```

---

## 2. الإيقاع العام (Pacing)

| المرحلة | عدد اللقطات لكل ثانية تقريبًا | نوع القطع |
|---|---|---|
| Hook | لقطة واحدة كل 3-5 ثواني | Cut ناعم |
| Problem | لقطة كل 2-3 ثواني | Cut عادي |
| Discovery | لقطة كل 2 ثواني | Cut + Push transitions خفيفة |
| Transformation (Montage) | لقطة كل 1-2 ثانية | Fast cuts متزامنة مع بيت الموسيقى (Beat sync) |
| Real Proof | لقطة كل 3-4 ثواني | Cut مع توقف أطول على الـ Insert (الخبر) |
| Journey (Match Cut + Time-lapse) | لقطة كل 0.5-1 ثانية | Match cut + Speed ramp |
| Graduation | لقطة كل 3-4 ثواني | Cut احتفالي هادئ |
| Ending | لقطة واحدة مطولة | بدون قطع تقريبًا |

---

## 3. الموسيقى (Music)

### الإرشادات العامة:
- استخدم **مسار موسيقي واحد أساسي** يتغير في شدته (Intensity) بدل تبديل مقطوعات متعددة — يخلق تماسكًا.
- المصادر الموصى بها للموسيقى الخالية من حقوق الملكية (Royalty-free): YouTube Audio Library، Epidemic Sound (إذا توفر اشتراك)، Pixabay Music.
- **نمط الموسيقى المطلوب:** بداية Piano/Ambient minimal (Hook + Problem) → تصاعد تدريجي بإضافة Beats وPercussion (Discovery + Transformation) → قمة عاطفية مع أوركسترا خفيفة/سترينج (Real Proof + Graduation) → عودة هادئة Piano/Ambient (Ending).

### نقاط تزامن حرجة (Sync Points):
- **0:15** (بداية Scene 3 - الدخول للجامعة): يجب أن يتوافق مع أول Beat قوي في الموسيقى.
- **2:00** (بداية Scene 6 - Real Proof): توقف مؤقت في الموسيقى (Musical breath) قبل الدخول في اللحظة العاطفية.
- **3:10** (بداية Scene 9 - Ending): خفض شدة الموسيقى بشكل كبير (Duck) لصالح صوت سارة.

---

## 4. تعليمات Adobe Premiere Pro

### أ. إعداد المشروع
1. `File > New > Project` → اختر إعدادات Sequence بدقة **1920x1080، 25fps أو 24fps** (راجع [`09-technical-specs.md`](./09-technical-specs.md)).
2. استخدم **Bins منفصلة** في نافذة Project تطابق بنية المجلدات أعلاه.

### ب. المونتاج الأساسي
- استخدم **Multi-camera sequence** إذا صوّرت مشهد المقابلات بأكثر من كاميرا/زاوية.
- استخدم **J-Cuts وL-Cuts** في مشاهد الحوار (صوت المتحدث التالي يبدأ قبل ظهوره بصريًا) لخلق انتقالات ناعمة بين المقابلات.

### ج. Match Cut (Scene 7.1 → 7.2)
1. ضع اللقطتين على نفس المسار (Track) متتاليتين.
2. استخدم أداة **Position/Scale** في Effect Controls لضبط تطابق تكوين الكادر إذا كان هناك اختلاف طفيف.
3. أضف Cut بسيط بدون Transition مرئي — قوة الـ Match Cut تأتي من التطابق البصري نفسه لا من تأثير انتقالي.

### د. Speed Ramping (Scene 7.3 - سيكوانس مرور الوقت)
1. استخدم أداة **Time Remapping** (كليك يمين على الكليب → Show Clip Keyframes → Time Remapping).
2. أضف Keyframes لتسريع/تبطيء السرعة بين اللقطات المختلفة.
3. بديل أسهل: استخدم **Rate Stretch Tool** لتسريع الكليب بالكامل بنسبة ثابتة (مثلاً 200%).

### هـ. النصوص على الشاشة (On-screen Text)
1. استخدم **Essential Graphics panel** (`Window > Essential Graphics`) لإنشاء قوالب نصية قابلة لإعادة الاستخدام.
2. لعناوين الكليبات المتحركة في Scene 1.3، استخدم **Position keyframes** بسيطة لجعل النص "يتزحلق" داخل وخارج الكادر.

### و. الانتقال بين "الحاضر" و"الأرشيف" (Scene 4)
1. طبّق تأثير **Lumetri Color** على كليبات Scene 4 فقط: قلّل Saturation بمقدار 20-30%، ارفع درجة الحرارة (Temperature) للأصفر الخفيف، قلّل Contrast بمقدار 10%.
2. أضف **Vignette خفيف** (من Lumetri > Vignette) لتقوية إحساس "الأرشيف".

### ز. التدرج اللوني النهائي (Color Grading)
1. استخدم **Lumetri Color panel** لكل Sequence.
2. طبّق تصحيح أساسي أولًا (Exposure, Contrast, White Balance) على كل اللقطات لتوحيد الإضاءة.
3. أضف "Look" متسق عبر الفيديو كله (LUT بسيط دافئ ومتوسط التباين) ثم عدّل يدويًا حسب المرحلة كما هو موضح في [`06-cinematography-guide.md`](./06-cinematography-guide.md).

### ح. الصوت
1. استخدم **Essential Sound panel** لتصنيف كل مسار صوتي (Dialogue/Music/SFX) وتطبيق معالجة تلقائية (Dynamics, Loudness) مناسبة لكل نوع.
2. ضع الـ VO بتاع سارة على مستوى **-3dB إلى -6dB** أعلى من الموسيقى في الخلفية لضمان وضوحه.

### ط. التصدير
1. `File > Export > Media` → إعدادات H.264، راجع [`09-technical-specs.md`](./09-technical-specs.md) للتفاصيل الدقيقة.

---

## 5. تعليمات CapCut (نسخة الديسكتوب أو الموبايل)

### أ. إعداد المشروع
1. أنشئ مشروع جديد بنسبة **16:9** (للفيديو الرئيسي) ونسخة منفصلة **9:16** (للتيزر).
2. رفع كل الفوتيج مباشرة لمكتبة المشروع، ثم تنظيمها في Folders تطابق بنية المجلدات أعلاه.

### ب. المونتاج الأساسي
- استخدم خاصية **"Auto Cut"** لتقليل الفوتيج الطويل بسرعة، ثم اضبط يدويًا نقاط القطع الدقيقة.
- استخدم **Speed tool** (أيقونة الساعة) لتطبيق Speed Ramp بسهولة على Scene 7.3 — اختر "Curve" وحدد نقاط التسريع/التبطيء بصريًا.

### ج. Match Cut
- ضع اللقطتين متتاليتين على الـ Timeline، واستخدم أداة **Crop/Position** للتأكد من تطابق الكادر تقريبًا، ثم استخدم **Transition "Cut"** (بدون تأثير) بينهما.

### د. النصوص المتحركة
1. استخدم قسم **Text > Add Text**، ثم طبّق **Text Animation presets** (مثل "Slide in" أو "Typewriter") لعناوين الكليبات في Scene 1.
2. لخط عربي واضح وسينمائي، استخدم خطوط مثل "Cairo" أو "Tajawal" (تحميلها كخط مخصص إذا لم تكن متوفرة داخل التطبيق).

### هـ. المرشحات (Filters) لمشهد الأرشيف
1. اذهب لـ **Filters > Vintage/Retro** واختر فلتر بتشبع منخفض ودرجة صفراء خفيفة.
2. أضف **Vignette** من قسم Effects لتقوية الإحساس بالأرشيف.

### و. الموسيقى والصوت
1. استخدم مكتبة الموسيقى المدمجة في CapCut (خالية من حقوق الملكية) أو ارفع مسارك الخاص.
2. استخدم خاصية **"Beat Sync"** (المزامنة مع نغمات الموسيقى) للمساعدة في ضبط توقيت القطع في مشهد Transformation السريع.
3. استخدم **Auto Captions** لتوليد الترجمة/الكابشنز تلقائيًا، ثم صحّح الأخطاء يدويًا (مهم جدًا للهجة العامية).

### ز. التدرج اللوني
1. استخدم **Adjust > Color** لتطبيق تعديلات أساسية (Brightness, Contrast, Saturation, Temperature) بشكل متسق.
2. يمكن تطبيق "Filter" جاهز على كل الفيديو ثم تعديل شدته (Intensity slider) بدل التدرج اليدوي المعقد.

### ح. التصدير
1. `Export` → اختر الدقة **1080p** والـ Frame rate المطابق لإعداد المشروع، راجع [`09-technical-specs.md`](./09-technical-specs.md).

---

## 6. الرسوميات المتحركة (Motion Graphics) — بديل بسيط ومتقدم

| العنصر | الطريقة البسيطة (CapCut/Premiere أساسي) | البديل المتقدم (Premiere + After Effects) |
|---|---|---|
| شعار الكلية (Logo Reveal) | Text/Image + Fade in + Scale animation بسيط | After Effects: Logo animation باستخدام Shape layers وEasy Ease keyframes |
| عناوين الكليبات المتحركة (Scene 1) | Text preset "Slide in" جاهز | After Effects: Animated text مع Track Matte لمحاكاة واجهة برنامج مونتاج فعلية |
| أيقونات المجالات الوظيفية (Scene 8.3) | صور PNG بخلفية شفافة + Fade in متتالي | After Effects: Icon animations بحركة Bounce/Elastic خفيفة |
| شاشة المعلومات الختامية | تصميم ثابت بالنص والشعار | After Effects: تصميم متحرك بطبقات (الشعار يظهر أولاً، ثم النص، ثم روابط التواصل) |

---

## 7. الكابشنز (Captions)

- **ضرورية** لأن نسبة كبيرة من مستخدمي السوشيال ميديا يتفرجون بدون صوت.
- استخدم كابشنز محروقة (Burned-in) بخط واضح وحجم كبير كفاية للموبايل.
- تأكد من صحة الكتابة العامية المصرية في الكابشنز (الأدوات التلقائية غالبًا تخطئ في اللهجة العامية) — **يجب المراجعة اليدوية الكاملة** لكل سطر.

---

## 8. مخرجات التصدير المطلوبة (راجع أيضًا [`09-technical-specs.md`](./09-technical-specs.md))

1. **النسخة الرئيسية:** 16:9، 1080p، 3:30 دقيقة — للموقع الرسمي واليوتيوب وفيسبوك.
2. **نسخة التيزر:** 9:16، 1080x1920، 60 ثانية — للـ Reels/Stories/TikTok.
3. **نسخة بكابشنز محروقة عربي** لكل من النسختين أعلاه.
