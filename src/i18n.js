import { createI18n } from 'vue-i18n'

// الرسائل لكل اللغات
const messages = {
  en: {
    login: {
      title: "Login",
      username: "Username",
      password: "Password",
      button: "Login"
    },
    dashboard: {
      welcome: "Welcome"
    }
  },
  ar: {
    login: {
      title: "تسجيل الدخول",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      button: "دخول"
    },
    dashboard: {
      welcome: "أهلاً بك"
    }
  }
}

// إعداد i18n
const i18n = createI18n({
  locale: 'en', // اللغة الافتراضية
  fallbackLocale: 'en',
  messages,
})

export default i18n
