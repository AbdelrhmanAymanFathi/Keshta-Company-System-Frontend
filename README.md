

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


