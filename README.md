# 🏗️ Keshta Company System

EN: Construction Company Management System built with Vue 3 + Tailwind + i18n | AR: نظام إدارة شركة مقاولات مبني باستخدام Vue 3 + Tailwind + i18n

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![i18n](https://img.shields.io/badge/i18n-9.x-yellow)](https://kazupon.github.io/vue-i18n/)

## 📑 Table of Contents

EN: Jump to section: | AR: انتقل إلى القسم:

- [Features](#-features--المميزات)
- [Architecture](#-architecture--البنية)
- [Installation](#-installation--التثبيت)
- [Configuration](#-configuration--الإعدادات)
- [Usage](#-usage--الاستخدام)
- [API Reference](#-api-reference--مرجع-api)
- [Database Schema](#-database-schema--مخطط-قاعدة-البيانات)
- [Development](#-development--التطوير)
- [Security](#️-security--الأمان)
- [Contributing](#-contributing--المساهمة)
- [License](#-license--الترخيص)

## ✨ Features / المميزات

EN: Core features: | AR: المميزات الأساسية:

- **Authentication** | **المصادقة**
  - EN: Login with username/password | AR: تسجيل الدخول باسم المستخدم/كلمة المرور
  - EN: Language switcher (🇺🇸/🇪🇬) | AR: تبديل اللغة (🇺🇸/🇪🇬)
  - EN: Responsive design using TailwindCSS | AR: تصميم متجاوب باستخدام TailwindCSS

- **Dashboard** | **لوحة التحكم**
  - EN: Main Dashboard with dynamic components | AR: لوحة تحكم رئيسية بمكونات ديناميكية
  - EN: Sidebar and top navbar for navigation | AR: شريط جانبي وأعلى للتنقل
  - EN: Multi-language support (Arabic/English) | AR: دعم متعدد اللغات (العربية/الإنجليزية)

- **Contractors Management** | **إدارة المقاولين**
  - EN: Add, edit, and import contractors from Excel | AR: إضافة وتعديل واستيراد المقاولين من Excel
  - EN: Search by name or phone | AR: البحث بالاسم أو الهاتف
  - EN: Notifications after import | AR: إشعارات بعد الاستيراد

- **Supplies Module** (قيد التطوير) | **نموذج التوريدات** (قيد التطوير)
  - EN: Add new supply with details | AR: إضافة توريدة جديدة مع التفاصيل
  - EN: Fields for location, date, contractor, vehicle, etc. | AR: حقول للموقع، التاريخ، المقاول، السيارة، إلخ.
  - EN: Buttons for add row, save, cancel | AR: أزرار لإضافة صف، حفظ، إلغاء

## 🏛 Architecture / البنية

EN: The system follows a modern Vue 3 architecture: | AR: يتبع النظام بنية Vue 3 حديثة:

```mermaid
graph TD
    A[Browser] --> B[Vue 3 Frontend]
    B --> C[Vue Router]
    B --> D[Vuex Store]
    B --> E[i18n]
    D --> F[API Client]
    F --> G[Backend API]
```

## 🚀 Installation / التثبيت

### 1. Clone the project / استنساخ المشروع
```bash
git clone https://github.com/USERNAME/keshta-company-system.git
cd keshta-company-system
```

### 2. Install dependencies / تثبيت الاعتمادات
```bash
npm install
```

### 3. Run the project / تشغيل المشروع
```bash
npm run serve
```

### 4. Open in browser / فتح في المتصفح
Go to `http://localhost:8080` / اذهب إلى `http://localhost:8080`

## ⚙️ Configuration / الإعدادات

### Environment Variables / متغيرات البيئة

```env
# Required / مطلوب
VUE_APP_API_BASE_URL=http://localhost:3000
VUE_APP_DEFAULT_LOCALE=en

# Optional / اختياري
VUE_APP_TITLE=Keshta Co.
VUE_APP_DEBUG=false
```

## 🛠 Usage / الاستخدام

- EN: Access the login page, enter credentials, and switch languages to test i18n.
- AR: الوصول إلى صفحة تسجيل الدخول، إدخال بيانات الاعتماد، وتبديل اللغات لاختبار i18n.

## 📚 API Reference / مرجع API

- EN: The API endpoints are defined in `src/api.js`.
- AR: نقاط نهاية API معرفة في `src/api.js`.

### Delete semantics / سلوك الحذف

- EN: The frontend expects the backend to support RESTful deletes under `/api/rentals/:id` and `/api/rentals/:rentalId/payouts/:payoutId`. Backends commonly return 204 No Content for successful deletes or 404 Not Found if the resource was already removed. The frontend treats 404 on DELETE as a safe/idempotent outcome and will refresh the list instead of showing a hard error.
- AR: الواجهة الأمامية تتوقع وجود نقاط نهاية حذف RESTful تحت `/api/rentals/:id` و `/api/rentals/:rentalId/payouts/:payoutId`. عادةً ما يعيد الخادم 204 No Content عند حذف ناجح أو 404 Not Found إذا كان المورد محذوفًا بالفعل. الواجهة الآن تتعامل مع 404 في عمليات الحذف باعتبارها نتيجة آمنة (محوِّلة)، وتقوم بتحديث القائمة بدلاً من إظهار خطأ صريح.

## 🗄 Database Schema / مخطط قاعدة البيانات

- EN: The database schema is not included in this version.
- AR: مخطط قاعدة البيانات غير متوفر في هذه النسخة.

## 🔧 Development / التطوير

- EN: Use `npm run serve` for development with hot-reloading.
- AR: استخدم `npm run serve` للتطوير مع إعادة تحميل ساخنة.

### Fix HMR websocket errors (Docker / remote browsers)

If you see an error like "Firefox can’t establish a connection to the server at ws://172.19.0.2:8080/ws" that means the HMR (hot module reload) client inside the browser is trying to connect to the dev server using the container's internal IP. When running the frontend inside Docker, the container's internal IP is not reachable from your browser.

Fixes:

- Set the websocket host and port for the dev server so the injected HMR client uses a reachable address. We added configuration to `vue.config.js` and you can control it with the following environment variables:

```env
DEV_SERVER_WS_PROTOCOL=ws       # or wss for HTTPS
DEV_SERVER_WS_HOST=localhost    # the hostname the browser can reach (e.g. host machine IP or localhost)
DEV_SERVER_WS_PORT=8080        # the port exposed by the dev server
```

Example (when running docker-compose): set the DEV_SERVER_WS_HOST to `host.docker.internal` or to the host machine IP and restart the frontend service so the HMR client connects to the correct URL.

AR: إذا رأيت رسالة خطأ مثل "Firefox can’t establish a connection to the server at ws://172.19.0.2:8080/ws" فهذا يعني أن عميل HMR داخل المتصفح يحاول الاتصال بعنوان IP الداخلي للحاوية، وهو غير قابل للوصول من المتصفح. لحل المشكلة عيّن متغيرات البيئة أعلاه أو استخدم `host.docker.internal` ثم أعد تشغيل الخدمة.

## 🔒 Security / الأمان

- EN: Ensure to set `VUE_APP_API_URL` to your backend API URL.
- AR: تأكد من تعيين `VUE_APP_API_URL` على عنوان URL الخاص بواجهة برمجة التطبيقات الخلفية.

## 🤝 Contributing / المساهمة

- EN: Contributions are welcome! Please submit a PR or issue.
- AR: المساهمات مرحب بها! يرجى تقديم طلب سحب أو مشكلة.

## 📜 License / الترخيص

- EN: This project is licensed under the MIT License.
- AR: هذا المشروع مرخص بموجب رخصة MIT.






