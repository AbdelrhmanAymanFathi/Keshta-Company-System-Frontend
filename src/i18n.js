import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    appName: 'Qeshta Co.',
    login: { title: "Login", username: "Username", password: "Password", button: "Login" },
    navbar: { 
      supplies: "Supplies", transport: "Transport", expenses: "Expenses", 
      equipmentRent: "Equipment Rent", companyEquipment: "Company Equipment" 
    },
    dashboard: {
      newSupply: "New Supply",
      suppliesList: "Supplies List",
      contractorsList: "Contractors List",
      vehiclesList: "Vehicles List",
      collapse: "Collapse",
      expand: "Expand",
      collapseSidebar: "Collapse sidebar",
      expandSidebar: "Expand sidebar",
      openMenu: "Open menu",
      closeMenu: "Close menu"
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
      next: "Next",
      '#': '#',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      logout: 'Logout',
      subtotal: 'Subtotal',
      totalDiscount: 'Total Discount',
      grandTotal: 'Grand Total',
      duplicate: 'Duplicate'
    },
    contractors: {
      title: "Contractors",
      add: "Add Contractor",
      editContractor: "Edit Contractor",
      addContractor: "Add Contractor",
      importExcel: "Import Excel",
      name: "Name",
      phone: "Phone",
      type: "Type",
      noResults: "No contractors found",
      imported: "Imported {count} new contractors",
      deleteConfirm: "Are you sure you want to delete",
      validationName: "Please enter contractor name",
      searchPlaceholder: "Search by name or phone..."
    }
  },
  ar: {
    appName: 'شركة قشطة',
    login: { title: "تسجيل الدخول", username: "اسم المستخدم", password: "كلمة المرور", button: "دخول" },
    navbar: { 
      supplies: "التوريدات", transport: "النقل", expenses: "المصروفات", 
      equipmentRent: "ايجار المعدات", companyEquipment: "معدات الشركة" 
    },
    dashboard: {
      newSupply: "إنشاء توريده جديدة",
      suppliesList: "عرض التوريدات",
      contractorsList: "عرض المقاولين",
      vehiclesList: "عرض السيارات",
      collapse: "طي",
      expand: "توسيع",
      collapseSidebar: "طي الشريط الجانبي",
      expandSidebar: "توسيع الشريط الجانبي",
      openMenu: "فتح القائمة",
      closeMenu: "إغلاق القائمة"
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
      next: "التالي",
      '#': '#',
      save: 'حفظ',
      cancel: 'إلغاء',
      edit: 'تعديل',
      delete: 'حذف',
      logout: 'تسجبل الخروج',
      subtotal: 'المجموع الجزئي',
      totalDiscount: 'إجمالي الخصم',
      grandTotal: 'الإجمالي الكلي',
      duplicate: 'تكرار'
    },
    contractors: {
      title: "المقاولين",
      add: "إضافة مقاول",
      editContractor: "تعديل مقاول",
      addContractor: "إضافة مقاول",
      importExcel: "استيراد Excel",
      name: "الاسم",
      phone: "الهاتف",
      type: "النوع",
      noResults: "لا توجد نتائج",
      imported: "تم استيراد {count} مقاولين جدد",
      deleteConfirm: "هل أنت متأكد أنك تريد حذف",
      validationName: "من فضلك أدخل اسم المقاول",
      searchPlaceholder: "ابحث بالاسم أو الهاتف..."
    }
  }
}

const i18n = createI18n({
  legacy: false,
  locale: 'en',         // default language
  fallbackLocale: 'en', // fallback
  messages,
})

export default i18n
