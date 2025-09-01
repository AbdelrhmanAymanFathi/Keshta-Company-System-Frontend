

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

## 🔹 Git Commit Messages المقترحة / Suggested Git Commits

```bash
git add .
git commit -m "✨ Add LoginPage with multi-language support and Tailwind styling"
git commit -m "🔧 Fix ESLint multi-word component names in Dashboard"
git commit -m "🛠 Fix Dashboard menuMap brackets and dynamic components"
git commit -m "✅ Finalize responsive Dashboard layout with top navbar and vertical sidebar"
git commit -m "📦 Update README.md with project structure, features, and instructions"
```

---

> المشروع حاليا frontend فقط، يمكن لاحقًا ربطه بـ backend وVue Router للحصول على تطبيق كامل.
> Currently frontend-only; backend & Vue Router integration can be added later.

```

---

لو تحب، أقدر أجهزلك **i18n.js جاهز** للغة العربي والإنجليزي لكل الكلمات اللي موجودة في dashboard + login بحيث كل شيء يترجم مباشر.  

تحب أعمل ده دلوقتي؟
