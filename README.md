

# Qeshta Co. Dashboard - Vue 3 + Tailwind + i18n

مشروع Dashboard لشركة مقاولات "قشطة" باستخدام Vue 3 وTailwindCSS، مع دعم اللغات العربي والإنجليزي (i18n).

---

## 🛠 التقنيات المستخدمة / Tech Stack

- **Vue 3** - Frontend framework
- **Vue CLI** - لإنشاء المشروع وإدارته
- **TailwindCSS v3** - لتصميم واجهات حديثة ومتجاوبة
- **Vue I18n v9** - لدعم اللغات العربية والإنجليزية
- **ESLint** - للتحقق من جودة الكود
- **Vite / Vue Loader** - لتحويل ملفات .vue وتشغيل المشروع

---

## 📂 هيكل المشروع / Project Structure

```

my-vue-app/
├─ src/
│  ├─ components/
│  │  ├─ Login.vue            # صفحة تسجيل الدخول مع زر تغيير اللغة
│  │  ├─ dashboard/
│  │  │  ├─ Dashboard.vue     # Dashboard الرئيسي + sidebar + top navbar
│  │  │  ├─ NewSupply.vue     # صفحة إنشاء توريدة جديدة
│  │  │  ├─ SuppliesList.vue  # عرض التوريدات
│  │  │  ├─ ContractorsList.vue # عرض المقاولين
│  │  │  └─ VehiclesList.vue    # عرض السيارات
│  ├─ main.js                 # نقطة دخول المشروع
│  └─ i18n.js                 # إعداد Vue I18n لدعم اللغات
├─ public/
│  └─ flags/                  # أيقونات الأعلام للغات
├─ package.json
└─ README.md

````

---

## 🔹 الميزات الحالية / Current Features

1. **Login Page**
   - اسم المستخدم + كلمة المرور
   - زر تغيير اللغة 🇺🇸 / 🇪🇬
   - واجهة متجاوبة باستخدام Tailwind

2. **Dashboard**
   - **Top Navbar**: يعرض الأقسام الرئيسية (التوريدات، النقل، المصروفات، إيجار المعدات، معدات الشركة)
   - **Sidebar عمودي**: يعرض صفحات فرعية لكل قسم عند اختياره
   - **Main Content Area**: يعرض الصفحة الفرعية المختارة (component ديناميكي)
   - **Responsive**: متجاوب على جميع الشاشات
   - **Multi-language support**: عربي / إنجليزي عبر Vue I18n

3. **ESLint fixes**
   - جميع الأخطاء المتعلقة بـ `multi-word component names` تم إصلاحها
   - مشاكل unused props و emit في Login.vue تم حلها

4. **Tailwind**
   - تصميم حديث، ألوان واضحة، hover effects، responsive flex/grid layout

---

## 🔹 خطوات تشغيل المشروع / How to run

```bash
# تثبيت الاعتمادات / install dependencies
npm install

# تشغيل المشروع في وضع التطوير / run dev server
npm run serve

# فتح المشروع على المتصفح عادة على http://localhost:8080
````

---

## 🔹 الملاحظات / Notes

* ملفات Vue components مصممة لتكون modular وسهلة التوسع
* Main Dashboard يعتمد على `menuMap` و `selectedTop` / `selectedVertical` لتغيير المحتوى ديناميكيًا
* i18n يمكن توسيعه بإضافة المزيد من المفاتيح في `i18n.js`
* يمكن إضافة Vue Router لاحقًا لتسهيل التنقل بين الصفحات بدل التحكم بالـ component ديناميكي

---
# Project structure snapshot

هذا المستند يحتفظ بصورة لحالة شجرة الملفات في مشروعك (لقطة من بيئة العمل الآن). احفظت هنا المسارات حتى تقدر ترجع لها لاحقًا.

> **ملاحظة:** هذا المستند مرئي داخل واجهة المحادثة (canvas). إذا تريد حفظه في المستودع Git فعّل الأوامر في قسم "حفظ snapshot إلى repo" أدناه.

---

## الملفات والمجلدات الرئيسية (كما في VSCode screenshot)

```
my-vue-app/
├─ node_modules/
├─ public/
│  ├─ flags/
│  ├─ favicon.ico
│  └─ index.html
├─ src/
│  ├─ assets/
│  ├─ components/
│  │  ├─ dashboard/
│  │  │  ├─ ContractorsList.vue
│  │  │  ├─ Dashboard.vue
│  │  │  ├─ NewSupply.vue
│  │  │  ├─ SuppliesList.vue
│  │  │  └─ VehiclesList.vue
│  │  ├─ Login.vue
│  │  └─ App.vue
│  ├─ i18n.js
│  └─ main.js
├─ .gitignore
├─ babel.config.js
├─ jsconfig.json
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ README.md
└─ tailwind.config.js
```

---

## ملاحظات سريعة من اللقطة

* ملف `i18n.js` مفتوح على السطر \~102 ويحتوي إعدادات الترجمات (locale/messages).
* الطرفية (terminal) أظهرت تحذير: `37 vulnerabilities (3 low, 20 moderate, 12 high, 2 critical)` — أنصح تشغيل `npm audit` و/أو `npm audit fix` بعد مراجعة التغييرات.
* رفعت سابقًا ملفي Excel إلى المسار: `/mnt/data/توريدات سن طريق الامتداد2025.xlsx` و`/mnt/data/توريد سن 6 جديد سفنكس.xlsx` (موجودان على الـ container الخاص بالجلسة).

---

## حفظ snapshot داخل المستودع (git)

إذا حابب تحفظ نسخة من هذه الشجرة داخل repo كملف `project-structure.txt`، شغّل الأوامر التالية في طرفية المشروع:

**إذا مثبت `tree`:**

```bash
# استثناء node_modules
tree -I node_modules -a > project-structure.txt
```

**إن لم يكن `tree` مثبتاً (بديل باستخدام find):**



---






