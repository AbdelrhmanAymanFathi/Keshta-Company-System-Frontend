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

# 🏗️ Keshta Company System

نظام **قشطة لإدارة المقاولات** (Keshta Company System) هو تطبيق ويب لإدارة التوريدات، المقاولين، السيارات، والمصروفات الخاصة بشركة مقاولات.  
البرنامج معمول بواجهة حديثة باستخدام **Vue.js + Vite + TailwindCSS** مع دعم **i18n** للغات (العربية / الإنجليزية).

---

## ✨ المميزات الحالية

### 🎨 الواجهة
- **Navbar حديثة** مع ألوان **Indigo غامقة + Gradient** لخلق تجربة بصرية عصرية.
- **Sidebar تفاعلية**:
  - تظهر بشكل كامل على **الشاشات الكبيرة (Desktop)** مع زر **Collapse** للتحكم في إظهار/إخفاء النصوص.
  - على **الموبايل** تفتح كـ Drawer جانبي متجاوب.
  - أيقونات حديثة باستخدام **lucide-react**.
  - توافق كامل مع **RTL** عند اختيار اللغة العربية.
- **تصميم متجاوب (Responsive)** يعمل بكفاءة على الموبايل والتابلت والديسكتوب.

---

### 🌐 تعدد اللغات (i18n)
- تم إضافة دعم للغتين:
  - 🇬🇧 **الإنجليزية** (افتراضي).
  - 🇸🇦 **العربية** (RTL).
- ملفات الترجمة جاهزة لكل من:
  - تسجيل الدخول.
  - الـ Navbar.
  - Dashboard (التوريدات، السيارات، المقاولين).
  - Labels وحقول الإدخال.
  - إدارة المقاولين (إضافة، تعديل، استيراد Excel).

---

### 📂 الموديولات الحالية
1. **Login Page**: تسجيل دخول بسيط مع دعم اللغتين.
2. **Dashboard**: صفحة رئيسية بها روابط للتنقل بين التوريدات والمقاولين والمركبات.
3. **Contractors Management**:
   - إضافة وتعديل مقاولين.
   - استيراد مقاولين من ملف Excel.
   - البحث بالاسم أو الهاتف.
   - إشعارات بعد الاستيراد (تم استيراد {count} مقاولين جدد).
4. **Supplies Module** (قيد التطوير):
   - إضافة توريدة جديدة.
   - حقول: الموقع، المنطقة، التاريخ، المقاول، الكسارة، السيارة، البونات، السعر، التكعيبات، الإجمالي.
   - أزرار: إضافة صف، حفظ، إلغاء.

---

## 🛠️ التقنيات المستخدمة
- **Vue 3** + **Vite**
- **TailwindCSS** (تصميم حديث + Responsive)
- **lucide-react** (أيقونات حديثة)
- **vue-i18n** (تعدد اللغات)
- **JavaScript (ES6+)**

---

## 🚀 طريقة التشغيل

### 1. Clone المشروع
```bash
git clone https://github.com/USERNAME/keshta-company-system.git
cd keshta-company-system
```

### 2. تثبيت الاعتمادات
```bash
npm install
```

### 3. تشغيل المشروع
```bash
npm run serve
```

### 4. فتح المتصفح
اذهب إلى `http://localhost:8080`

---

## 📡 واجهة البرمجة الخلفية (Backend)

- يتطلب المشروع وجود واجهة برمجة خلفية (Backend) تعمل على `http://localhost:3000` مع نقاط النهاية (API endpoints) المذكورة أعلاه.
- تنسيق البيانات لتوريدات/صادرات يتم توثيقه في `src/api.js`.

---

## 📂 هيكل المشروع

```
src/
  api.js           # استدعاءات API
  i18n.js          # إعدادات الترجمة
  locales/         # ملفات الترجمة
  components/
    dashboard/
      Dashboard.vue
      NewSupply.vue
      SuppliesList.vue
      ContractorsList.vue
      VehiclesList.vue
  assets/          # الصور والأيقونات
```

## ملاحظات

- جميع النماذج تتحقق من الحقول المطلوبة قبل الحفظ.
- واجهة المستخدم محسّنة لكل من الديسكتوب والموبايل.
- حالة الشريط الجانبي (مcollapsed/expanded) محفوظة في localStorage.
- جميع التسميات ونصوص واجهة المستخدم قابلة للترجمة.

## الرخصة

MIT






