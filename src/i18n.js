import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    login: { title: "Login", username: "Username", password: "Password", button: "Login" },
    navbar: { 
      supplies: "Supplies", transport: "Transport", expenses: "Expenses", 
      equipmentRent: "Equipment Rent", companyEquipment: "Company Equipment" 
    },
    dashboard: {
      newSupply: "New Supply", suppliesList: "Supplies List", contractorsList: "Contractors List", vehiclesList: "Vehicles List"
    },
    labels: {
      site: "Site",
      area: "Area",
      date: "Date",
      contractor: "Contractor",
      crusher: "Crusher",
      vehicle: "Vehicle",
      crusherBon: "Crusher Bon",
      companyBon: "Company Bon",
      discount: "Discount",
      price: "Price/ton",
      cubic: "Cubic Meter",
      total: "Total",
      actions: "Actions",
      addRow: "Add Row",
      saveSupply: "Save Supply",
      next: "Next"
    }
  },
  ar: {
    login: { title: "تسجيل الدخول", username: "اسم المستخدم", password: "كلمة المرور", button: "دخول" },
    navbar: { 
      supplies: "التوريدات", transport: "النقل", expenses: "المصروفات", 
      equipmentRent: "ايجار المعدات", companyEquipment: "معدات الشركة" 
    },
    dashboard: {
      newSupply: "إنشاء توريده جديدة", suppliesList: "عرض التوريدات", contractorsList: "عرض المقاولين", vehiclesList: "عرض السيارات"
    },
    labels: {
      site: "الموقع",
      area: "المنطقة",
      date: "التاريخ",
      contractor: "المقاول",
      crusher: "الكسارة",
      vehicle: "العربة",
      crusherBon: "رقم بون الكسارة",
      companyBon: "رقم بون الشركة",
      discount: "الخصم",
      price: "سعر السن",
      cubic: "التكعيبات",
      total: "الإجمالي",
      actions: "إجراءات",
      addRow: "إضافة صف",
      saveSupply: "حفظ التوريدات",
      next: "التالي"
    }
  }
}

const i18n = createI18n({
  legacy: false,
  locale: 'en',         // اللغة الافتراضية
  fallbackLocale: 'en', // لو الترجمة مش موجودة
  messages,
})

export default i18n
