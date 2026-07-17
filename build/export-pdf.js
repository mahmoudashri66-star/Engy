/**
 * export-pdf.js
 * يجمع كل ملفات .md بالمشروع بالترتيب الصحيح، يضيف غلاف وفهرس،
 * ويصدرها PDF واحد بمعالجة RTL كاملة (جداول، فقرات، قوائم، عزل bidi للمحتوى اللاتيني).
 *
 * التشغيل: node build/export-pdf.js
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer');

const ROOT = path.join(__dirname, '..');
const OUTPUT_PDF = path.join(ROOT, 'وثيقة-المشروع-الكاملة.pdf');

// ترتيب الملفات كما يظهر في فهرس README.md
// ملاحظة: تم استبعاد research-notes.md عمدًا من نسخة PDF التقديمية (تبقى متاحة
// فقط في مستودع GitHub للفريق الداخلي)، لأنها وثيقة تحقّق بحثي داخلي (مصادر،
// فجوات معلوماتية) لا تخص جمهور العرض النهائي وقد تُحدث لبسًا لديهم.
const FILES_ORDER = [
  { file: '01-creative-concept.md', titleFallback: 'الفكرة الإبداعية' },
  { file: '02-story-structure.md', titleFallback: 'البنية الدرامية والمدة الزمنية' },
  { file: '03-script.md', titleFallback: 'السكريبت الكامل' },
  { file: '04-shot-list.md', titleFallback: 'الشوت لست' },
  { file: '05-directing-guide.md', titleFallback: 'دليل الإخراج' },
  { file: '06-cinematography-guide.md', titleFallback: 'دليل التصوير السينمائي' },
  { file: '07-editing-guide.md', titleFallback: 'دليل المونتاج' },
  { file: '08-production-plan.md', titleFallback: 'خطة الإنتاج' },
  { file: '09-technical-specs.md', titleFallback: 'المواصفات التقنية' },
  { file: '10-assets-checklist.md', titleFallback: 'تشيك ليست الأصول' },
  { file: '11-risk-management.md', titleFallback: 'إدارة المخاطر' },
  { file: '12-alternative-locations.md', titleFallback: 'مواقع تصوير بديلة' },
];

/**
 * معالجة BiDi للمحتوى اللاتيني/الأرقام داخل النصوص العربية:
 * نغلف أي متتالية لاتينية/أرقام/رموز إنجليزية بوسم span بعزل اتجاهي LTR
 * حتى لا تنقلب ترتيب الأحرف والأرقام والرموز الإنجليزية داخل الجملة العربية.
 *
 * ملاحظة مهمة: يجب تجنب معالجة كيانات HTML (مثل &quot; &amp; &#39; ...) حتى لا
 * تنقطع عن علامتي & و ; المحيطتين بها وتظهر كنص حرفي بدل الحرف الحقيقي.
 */
function isolateLatinRuns(html) {
  // نتجاهل الوسوم نفسها (لا نعالج جوه <...>) ونعالج فقط النصوص الظاهرة
  return html.replace(/(<[^>]+>)|(&[a-zA-Z0-9#]+;)|([^<&]+)/g, (match, tag, entity, text) => {
    if (tag) return tag;
    if (entity) return entity; // اترك كيانات HTML كما هي بدون لمسها
    // متتالية من: حروف لاتينية، أرقام، ورموز شائعة (: / - . _ % # @ , ( ) [ ])
    return text.replace(
      /([A-Za-z0-9][A-Za-z0-9:\/\-\._%#@,()\[\]\s]*[A-Za-z0-9%\)\]])|([A-Za-z0-9])/g,
      (m) => `<span class="ltr-isolate" dir="ltr">${m}</span>`
    );
  });
}

/**
 * marked يحوّل علامة التنصيص العادية (") إلى كيان &quot; ضمن عملية الـ escaping
 * التلقائية للنصوص. نعيدها هنا لعلامة تنصيص حقيقية (نص عرض عادي، غير جزء من
 * أي وسم HTML)، لأن ظهورها كنص حرفي "quot;" في الـ PDF غير مقبول بصريًا.
 */
function fixMarkedQuoteEntities(html) {
  return html.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// خريطة اسم الملف ← عنوانه المقروء، تُستخدم لتحويل أي رابط ماركداون داخلي
// من صيغة "[`file.md`](./file.md)" إلى اسم قسم مفهوم بدون اسم ملف تقني
const TITLE_BY_FILENAME = Object.fromEntries(
  FILES_ORDER.map((f) => [f.file, f.titleFallback])
);

/**
 * تنظيف الإحالات الداخلية بين الملفات (مثل "راجع [`09-technical-specs.md`](...)")
 * قبل تحويل النص لـ HTML، لأن اسم الملف التقني لا يعني شيئًا لقارئ خارجي لا
 * يملك وصول إلى مستودع GitHub:
 *
 * 1) أي رابط لملف research-notes.md (المستبعد من نسخة PDF بالكامل) يُحذف مع
 *    حرف الجر "في" الذي يسبقه مباشرة، لأن الجملة تبقى سليمة نحويًا بدونه.
 * 2) أي رابط لملف آخر ضمن هذه الوثيقة يتحول لاسم القسم بصيغة «القسم»
 *    بدون أي بناء رابط أو اسم ملف ظاهر.
 */
function stripInternalFileReferences(rawMarkdown) {
  let text = rawMarkdown;

  // 1) إزالة الإحالة لملف research-notes.md مع حرف الجر السابق لها
  text = text.replace(/\s*في\s*\[`research-notes\.md`\]\(\.\/research-notes\.md\)/g, '');
  // احتياط: أي صيغة أخرى لرابط research-notes.md لم تُغطَّ بالنمط أعلاه
  text = text.replace(/\[`research-notes\.md`\]\(\.\/research-notes\.md\)/g, 'وثيقة التحقق البحثي الداخلية');

  // 2) تحويل أي رابط ماركداون داخلي آخر لاسم قسم مقروء
  text = text.replace(/\[`([\w\-]+\.md)`\]\(\.\/[\w\-]+\.md\)/g, (match, filename) => {
    const title = TITLE_BY_FILENAME[filename];
    return title ? `«${title}»` : 'القسم المرتبط';
  });

  return text;
}

function mdFileToHtml(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const cleaned = stripInternalFileReferences(raw);
  const html = marked.parse(cleaned, { mangle: false, headerIds: true });
  const fixed = fixMarkedQuoteEntities(html);
  return isolateLatinRuns(fixed);
}

function buildCoverPageHtml() {
  return `
  <section class="cover-page">
    <div class="cover-badge">مستند إنتاج كامل</div>
    <h1 class="cover-title">القصة اللي هتعملها بنفسك</h1>
    <p class="cover-subtitle">فيديو تعريفي لبرنامج الإعلام الرقمي</p>
    <p class="cover-subtitle-2">كلية الإعلام والاتصال — جامعة الإسكندرية الأهلية</p>
    <div class="cover-divider"></div>
    <table class="cover-info-table">
      <tr><td class="k">المدة الرئيسية</td><td class="v"><span class="ltr-isolate" dir="ltr">3:30</span> دقيقة (+ تيزر <span class="ltr-isolate" dir="ltr">60</span> ثانية)</td></tr>
      <tr><td class="k">الجمهور المستهدف</td><td class="v">طلاب ثانوي عامة، أولياء أمور، متقدمين محتملين</td></tr>
      <tr><td class="k">مكان التصوير</td><td class="v">حرم الجامعة (سموحة) + مواقع بديلة اختيارية</td></tr>
      <tr><td class="k">حالة المشروع</td><td class="v">مكتمل بجميع أقسامه — جاهز للمراجعة</td></tr>
    </table>
    <div class="cover-footer">
      <p>تم إعداد هذه الوثيقة بواسطة Kiro — مساعد الذكاء الاصطناعي للتطوير</p>
      <p class="cover-warning">⚠️ راجع أي نقطة معلَّمة [افتراض قابل للتعديل] مع رئيس القسم قبل التنفيذ الفعلي</p>
      <p class="cover-copyright">© <span class="ltr-isolate" dir="ltr">MACAL EMPIRE</span> — جميع الحقوق محفوظة</p>
    </div>
  </section>
  <div class="page-break"></div>
  `;
}

function buildTocHtml() {
  const rows = FILES_ORDER.map((f, idx) => {
    const num = String(idx).padStart(2, '0');
    return `<tr><td class="toc-num"><span class="ltr-isolate" dir="ltr">${num}</span></td><td class="toc-title">${f.titleFallback}</td></tr>`;
  }).join('\n');

  return `
  <section class="toc-page">
    <h2 class="toc-heading">فهرس المستندات</h2>
    <table class="toc-table">
      ${rows}
    </table>
  </section>
  <div class="page-break"></div>
  `;
}

function buildSectionHtml(fileMeta, html) {
  return `
  <section class="doc-section">
    ${html}
  </section>
  <div class="page-break"></div>
  `;
}

function buildFullHtml(bodyHtml) {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<title>وثيقة المشروع الكاملة</title>
<style>
  @font-face {
    font-family: 'Cairo';
    src: local('Cairo');
  }
  @font-face {
    font-family: 'Tajawal';
    src: local('Tajawal');
  }

  * { box-sizing: border-box; }

  html, body {
    direction: rtl;
    text-align: right;
    unicode-bidi: embed;
    font-family: 'Cairo', 'Tajawal', 'Noto Naskh Arabic', 'Noto Sans Arabic', sans-serif;
    color: #1a1a1a;
    line-height: 1.9;
    font-size: 13.5px;
    margin: 0;
    padding: 0;
  }

  .ltr-isolate {
    unicode-bidi: isolate;
    direction: ltr;
    display: inline;
    font-family: 'Tajawal', 'Cairo', sans-serif;
  }

  /* ===== الغلاف ===== */
  .cover-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px;
    background: linear-gradient(160deg, #0f1b2d 0%, #16324f 55%, #1c4f72 100%);
    color: #ffffff;
  }
  .cover-badge {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.35);
    border-radius: 30px;
    padding: 6px 22px;
    font-size: 13px;
    margin-bottom: 28px;
    letter-spacing: 0.5px;
  }
  .cover-title {
    font-size: 40px;
    font-weight: 800;
    margin: 0 0 14px 0;
  }
  .cover-subtitle {
    font-size: 20px;
    margin: 0;
    opacity: 0.92;
  }
  .cover-subtitle-2 {
    font-size: 16px;
    margin: 6px 0 0 0;
    opacity: 0.75;
  }
  .cover-divider {
    width: 90px;
    height: 3px;
    background: #ffcf5c;
    margin: 34px 0;
    border-radius: 2px;
  }
  .cover-info-table {
    width: 78%;
    border-collapse: collapse;
    margin-bottom: 40px;
  }
  .cover-info-table td {
    padding: 10px 14px;
    font-size: 13.5px;
    border-bottom: 1px solid rgba(255,255,255,0.15);
  }
  .cover-info-table td.k {
    color: #ffcf5c;
    font-weight: 700;
    text-align: right;
    width: 38%;
  }
  .cover-info-table td.v {
    text-align: right;
    opacity: 0.95;
  }
  /* عزل صريح: منع القاعدة العامة لتظليل صفوف الجداول الزوجية (tbody tr:nth-child(even))
     من التأثير على جدول الغلاف، لأنها كانت تجعل النص الأبيض غير مقروء على خلفية فاتحة */
  .cover-info-table tr:nth-child(even) {
    background: transparent !important;
  }
  .cover-footer {
    margin-top: 10px;
    font-size: 11.5px;
    opacity: 0.75;
    max-width: 80%;
  }
  .cover-warning {
    margin-top: 10px;
    color: #ffcf5c;
    opacity: 1;
    font-weight: 700;
  }
  .cover-copyright {
    margin-top: 18px;
    color: #ffffff;
    opacity: 0.6;
    font-size: 10.5px;
    letter-spacing: 0.5px;
  }

  /* ===== العلامة المائية (تظهر على كل صفحة) ===== */
  .watermark-layer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
  }
  .watermark-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-35deg);
    white-space: nowrap;
    font-size: 60px;
    font-weight: 800;
    color: rgba(22, 50, 79, 0.06);
    letter-spacing: 6px;
    font-family: 'Cairo', sans-serif;
  }

  /* ===== الفهرس ===== */
  .toc-page {
    padding: 60px 50px;
  }
  .toc-heading {
    font-size: 26px;
    border-bottom: 3px solid #16324f;
    padding-bottom: 14px;
    margin-bottom: 30px;
    color: #16324f;
  }
  .toc-table {
    width: 100%;
    border-collapse: collapse;
  }
  .toc-table tr {
    border-bottom: 1px solid #e2e2e2;
  }
  .toc-table td {
    padding: 12px 8px;
    text-align: right;
  }
  .toc-num {
    width: 60px;
    color: #16324f;
    font-weight: 800;
    font-size: 15px;
  }
  .toc-title {
    font-size: 15px;
  }

  /* ===== الأقسام / المحتوى ===== */
  .doc-section {
    padding: 45px 50px 20px 50px;
  }

  .page-break {
    page-break-after: always;
  }

  h1 {
    font-size: 24px;
    color: #16324f;
    border-bottom: 3px solid #ffcf5c;
    padding-bottom: 10px;
    margin-top: 0;
  }
  h2 {
    font-size: 19px;
    color: #16324f;
    margin-top: 30px;
    border-right: 5px solid #16324f;
    padding-right: 12px;
  }
  h3 {
    font-size: 16px;
    color: #1c4f72;
    margin-top: 22px;
  }
  h4 {
    font-size: 14px;
    color: #333;
  }

  p { margin: 10px 0; text-align: right; }

  strong { color: #0f1b2d; }

  blockquote {
    margin: 14px 0;
    padding: 10px 16px;
    border-right: 4px solid #ffcf5c;
    background: #fff9ec;
    border-radius: 4px;
    color: #6b5a1f;
    font-size: 12.5px;
  }

  code {
    background: #f1f1f1;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    direction: ltr;
    unicode-bidi: isolate;
    font-size: 12px;
  }

  pre {
    background: #1a1a1a;
    color: #f1f1f1;
    padding: 14px;
    border-radius: 6px;
    direction: ltr;
    unicode-bidi: isolate;
    text-align: left;
    overflow-x: auto;
    font-size: 11.5px;
    line-height: 1.6;
  }
  pre code {
    background: none;
    padding: 0;
    color: inherit;
  }

  ul, ol {
    padding-right: 26px;
    padding-left: 0;
    margin: 10px 0;
  }
  li { margin: 5px 0; text-align: right; }

  hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 26px 0;
  }

  a {
    color: #1c4f72;
    text-decoration: none;
    border-bottom: 1px dotted #1c4f72;
  }

  /* ===== الجداول بمعالجة RTL كاملة ===== */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    direction: rtl;
    font-size: 12px;
  }
  thead {
    display: table-header-group;
  }
  th, td {
    border: 1px solid #d7d7d7;
    padding: 8px 10px;
    text-align: right;
    vertical-align: top;
  }
  th {
    background: #16324f;
    color: #ffffff;
    font-weight: 700;
    text-align: right;
  }
  tbody tr:nth-child(even) {
    background: #f7f9fb;
  }

  input[type="checkbox"] {
    margin-left: 6px;
    margin-right: 0;
  }

  /* منع انقطاع الجدول بشكل قبيح بين الصفحات كلما أمكن */
  table, tr {
    page-break-inside: auto;
  }

  img { max-width: 100%; }
</style>
</head>
<body>
<div class="watermark-layer">
  <div class="watermark-text">MACAL EMPIRE</div>
</div>
${bodyHtml}
</body>
</html>
`;
}

async function main() {
  console.log('📖 قراءة وتحويل ملفات Markdown...');

  let bodyHtml = '';
  bodyHtml += buildCoverPageHtml();
  bodyHtml += buildTocHtml();

  for (const fileMeta of FILES_ORDER) {
    const filePath = path.join(ROOT, fileMeta.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  الملف غير موجود، تم تجاوزه: ${fileMeta.file}`);
      continue;
    }
    console.log(`  ✓ ${fileMeta.file}`);
    const html = mdFileToHtml(filePath);
    bodyHtml += buildSectionHtml(fileMeta, html);
  }

  const fullHtml = buildFullHtml(bodyHtml);

  const htmlOutPath = path.join(ROOT, 'build', '_rendered.html');
  fs.writeFileSync(htmlOutPath, fullHtml, 'utf-8');
  console.log(`📄 تم إنشاء HTML وسيط: ${htmlOutPath}`);

  console.log('🚀 تشغيل Chromium وتصدير PDF...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto('file://' + htmlOutPath, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    printBackground: true,
    margin: { top: '18mm', bottom: '18mm', left: '14mm', right: '14mm' },
    displayHeaderFooter: true,
    headerTemplate: `<div></div>`,
    footerTemplate: `
      <div dir="rtl" style="width:100%; font-size:8.5px; color:#999; direction:rtl; text-align:center; font-family: Cairo, Tajawal, sans-serif; padding:0 14mm;">
        <span>&#169; MACAL EMPIRE &mdash; جميع الحقوق محفوظة</span>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    `,
  });

  await browser.close();
  console.log(`✅ تم إنشاء PDF بنجاح: ${OUTPUT_PDF}`);
}

main().catch((err) => {
  console.error('❌ حدث خطأ أثناء التصدير:', err);
  process.exit(1);
});
