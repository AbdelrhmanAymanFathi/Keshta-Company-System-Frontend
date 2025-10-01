# نظام Refresh Token التلقائي

تم تطبيق نظام refresh token تلقائي متقدم في المشروع لضمان استمرارية جلسة المستخدم دون انقطاع.

## المميزات

### 1. إدارة تلقائية للـ Tokens
- **تحديث تلقائي**: يتم تحديث الـ token تلقائياً قبل انتهاء صلاحيته بـ 5 دقائق
- **إعادة المحاولة**: في حالة فشل الطلب بسبب انتهاء صلاحية الـ token، يتم تحديثه تلقائياً وإعادة المحاولة
- **منع التكرار**: يتم منع محاولات التحديث المتعددة في نفس الوقت

### 2. إدارة الحالة
- **تتبع حالة المصادقة**: تتبع مستمر لحالة تسجيل الدخول
- **إشعارات الأحداث**: نظام إشعارات للتغييرات في حالة المصادقة
- **إعادة التوجيه التلقائي**: إعادة توجيه المستخدم لصفحة تسجيل الدخول عند فشل التحديث

### 3. معالجة الأخطاء
- **معالجة شاملة للأخطاء**: معالجة جميع حالات الفشل المحتملة
- **تسجيل مفصل**: تسجيل مفصل للأخطاء لتسهيل التصحيح
- **استرداد تلقائي**: محاولة استرداد تلقائي من الأخطاء المؤقتة

## الملفات المحدثة

### 1. `src/api.js`
- **TokenManager Class**: فئة لإدارة الـ tokens
- **Interceptors محسنة**: معالجات محسنة للطلبات والاستجابات
- **تحديث تلقائي**: جدولة تحديث الـ token تلقائياً

### 2. `src/auth.js`
- **AuthManager Class**: فئة لإدارة حالة المصادقة
- **إدارة المستخدمين**: تخزين واسترجاع بيانات المستخدم
- **معالجة الأحداث**: نظام إشعارات للتغييرات

### 3. `src/composables/useAuth.js`
- **Vue Composable**: مكون Vue 3 لإدارة المصادقة
- **Reactive State**: حالة تفاعلية للمصادقة
- **Lifecycle Management**: إدارة دورة حياة المكون

### 4. `src/main.js`
- **تهيئة النظام**: تهيئة نظام المصادقة عند بدء التطبيق
- **Event Listeners**: مستمعي الأحداث للمصادقة

## كيفية الاستخدام

### 1. في مكونات Vue
```javascript
import { useAuth } from '@/composables/useAuth'

export default {
  setup() {
    const { isLoggedIn, currentUser, login, logout } = useAuth()
    
    return {
      isLoggedIn,
      currentUser,
      login,
      logout
    }
  }
}
```

### 2. في ملفات JavaScript العادية
```javascript
import authManager from '@/auth'

// تسجيل الدخول
await authManager.login({ email, password })

// تسجيل الخروج
await authManager.logout()

// فحص حالة المصادقة
const isLoggedIn = authManager.isLoggedIn()
```

### 3. الاستماع للأحداث
```javascript
authManager.addListener((event, data) => {
  if (event === 'auth:logout') {
    // معالجة تسجيل الخروج
  }
})
```

## إعدادات النظام

### 1. Buffer Time
```javascript
const bufferTime = 5 * 60; // 5 دقائق قبل انتهاء الصلاحية
```

### 2. Retry Mechanism
- **محاولة واحدة**: محاولة واحدة فقط لإعادة الطلب بعد تحديث الـ token
- **منع التكرار**: منع محاولات التحديث المتعددة

### 3. Error Handling
- **تسجيل مفصل**: تسجيل جميع الأخطاء في console
- **إعادة التوجيه**: إعادة توجيه تلقائي لصفحة تسجيل الدخول

## API Endpoints

### 1. Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

### 2. Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json

Response:
{
  "accessToken": "new_jwt_token"
}
```

### 3. Logout
```
POST /api/auth/logout
Content-Type: application/json
```

## الأمان

### 1. Token Storage
- **localStorage**: تخزين الـ token في localStorage
- **Auto-cleanup**: تنظيف تلقائي عند انتهاء الصلاحية

### 2. Request Security
- **Automatic Headers**: إضافة تلقائية لرؤوس المصادقة
- **Token Validation**: التحقق من صحة الـ token قبل كل طلب

### 3. Error Security
- **Secure Logout**: تسجيل خروج آمن عند فشل التحديث
- **Data Cleanup**: تنظيف البيانات الحساسة

## استكشاف الأخطاء

### 1. Console Logs
```javascript
// تفعيل التسجيل المفصل
console.log('Token refresh scheduled in X minutes')
console.log('Token refreshed successfully')
console.log('Token refresh failed, logging out user')
```

### 2. Network Tab
- مراقبة طلبات `/api/auth/refresh`
- فحص رؤوس الطلبات والاستجابات

### 3. Application Tab
- فحص localStorage للـ tokens
- مراقبة تغييرات البيانات

## التخصيص

### 1. تغيير Buffer Time
```javascript
// في src/api.js
const bufferTime = 10 * 60; // 10 دقائق بدلاً من 5
```

### 2. تغيير Retry Count
```javascript
// في src/api.js
if (!originalRequest._retry && originalRequest._retryCount < 3) {
  // محاولة حتى 3 مرات
}
```

### 3. إضافة Custom Headers
```javascript
// في src/api.js
config.headers['X-Custom-Header'] = 'value'
```

## الدعم

لأي استفسارات أو مشاكل، يرجى مراجعة:
1. Console logs للأخطاء
2. Network tab للطلبات
3. Application tab للبيانات المخزنة

