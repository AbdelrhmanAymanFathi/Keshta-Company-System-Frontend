import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    login: { title: "Login", username: "Username", password: "Password", button: "Login" },
    navbar: { supplies: "Supplies", transport: "Transport", expenses: "Expenses", equipmentRent: "Equipment Rent", companyEquipment: "Company Equipment" },
    dashboard: {
      newSupply: "New Supply", suppliesList: "Supplies List", contractorsList: "Contractors List", vehiclesList: "Vehicles List"
    }
  },
  ar: {
    login: { title: "تسجيل الدخول", username: "اسم المستخدم", password: "كلمة المرور", button: "دخول" },
    navbar: { supplies: "التوريدات", transport: "النقل", expenses: "المصروفات", equipmentRent: "ايجار المعدات", companyEquipment: "معدات الشركة" },
    dashboard: {
      newSupply: "إنشاء توريده جديدة", suppliesList: "عرض التوريدات", contractorsList: "عرض المقاولين", vehiclesList: "عرض السيارات"
    }
  }
}

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})

export default i18n
