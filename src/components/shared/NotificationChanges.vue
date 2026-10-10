<template>
  <!-- Before → after of an edit awaiting approval (sent to admins only) -->
  <div class="mt-1 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5 space-y-0.5 text-xs">
    <div v-for="c in shown" :key="c.field" class="flex flex-wrap items-baseline gap-x-1.5">
      <span class="text-slate-500">{{ fieldLabel(c.field) }}:</span>
      <span class="line-through text-red-500">{{ formatValue(c.before, c.field) }}</span>
      <span class="text-slate-400">{{ isRTL ? '←' : '→' }}</span>
      <span class="font-semibold text-emerald-600">{{ formatValue(c.after, c.field) }}</span>
    </div>
    <div v-if="hiddenCount > 0" class="text-slate-400">
      {{ isRTL ? `+${hiddenCount} تغييرات أخرى` : `+${hiddenCount} more changes` }}
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'

const LABELS = {
  ar: {
    date: 'التاريخ', amount: 'المبلغ', total: 'الإجمالي', notes: 'الملاحظات', description: 'البيان',
    categoryId: 'التصنيف', subCategoryId: 'التصنيف الفرعي', treasuryId: 'الخزينة',
    destinationTreasuryId: 'الخزينة المحول إليها', locationId: 'الموقع', locationName: 'الموقع',
    contractorId: 'المقاول', contractorName: 'المقاول', itemId: 'البند', crusherId: 'الكسارة',
    vehicleId: 'السيارة', driverId: 'السائق', branchId: 'الفرع', paymentMethod: 'طريقة الدفع',
    openingBalance: 'رصيد أول المدة', accountType: 'الحساب', sites: 'حسب الموقع',
    unitPrice: 'سعر الوحدة', discount: 'الخصم', hours: 'عدد الساعات', hourlyRate: 'سعر الساعة',
    companyCapacity: 'كمية الشركة', crusherCapacity: 'كمية الكسارة', numTrips: 'عدد النقلات',
    distanceKm: 'المسافة (كم)', isRental: 'مستأجر', settlementDate: 'تاريخ التسوية',
  },
  en: {
    date: 'Date', amount: 'Amount', total: 'Total', notes: 'Notes', description: 'Description',
    categoryId: 'Category', subCategoryId: 'Sub-category', treasuryId: 'Treasury',
    destinationTreasuryId: 'Destination Treasury', locationId: 'Site', locationName: 'Site',
    contractorId: 'Contractor', contractorName: 'Contractor', itemId: 'Item', crusherId: 'Crusher',
    vehicleId: 'Vehicle', driverId: 'Driver', branchId: 'Branch', paymentMethod: 'Payment Method',
    openingBalance: 'Opening Balance', accountType: 'Account', sites: 'Per Site',
    unitPrice: 'Unit Price', discount: 'Discount', hours: 'Hours', hourlyRate: 'Hourly Rate',
    companyCapacity: 'Company Qty', crusherCapacity: 'Crusher Qty', numTrips: 'Trips',
    distanceKm: 'Distance (Km)', isRental: 'Rented', settlementDate: 'Settlement Date',
  },
}

const ACCOUNT_TYPES = {
  ar: { SUPPLY: 'توريدات', TRANSPORT: 'نقل', RENTAL: 'إيجار معدات', EXTRACT: 'مستخلصات', EXPENSE: 'مصروفات' },
  en: { SUPPLY: 'Supply', TRANSPORT: 'Transport', RENTAL: 'Equipment Rental', EXTRACT: 'Extracts', EXPENSE: 'Expenses' },
}

const MONEY_KEYS = ['amount', 'total', 'unitPrice', 'discount', 'hourlyRate', 'openingBalance']

export default {
  name: 'NotificationChanges',
  props: {
    changes: { type: Array, required: true },
    // Rows shown before collapsing into "+N more"
    limit: { type: Number, default: 0 },
  },
  setup() {
    const { locale } = useI18n()
    return { locale }
  },
  computed: {
    lang() {
      return this.locale === 'ar' ? 'ar' : 'en'
    },
    isRTL() {
      return this.lang === 'ar'
    },
    shown() {
      return this.limit ? this.changes.slice(0, this.limit) : this.changes
    },
    hiddenCount() {
      return this.changes.length - this.shown.length
    },
  },
  methods: {
    fieldLabel(field) {
      return LABELS[this.lang][field] || field
    },
    formatValue(val, field) {
      if (val === null || val === undefined || val === '') return '-'
      if (typeof val === 'boolean') return val ? (this.isRTL ? 'نعم' : 'Yes') : (this.isRTL ? 'لا' : 'No')
      if (field === 'accountType') return ACCOUNT_TYPES[this.lang][val] || val
      if (MONEY_KEYS.includes(field) && !isNaN(Number(val))) {
        const formatted = Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        return this.isRTL ? '‎' + formatted : formatted
      }
      // Ids whose record was deleted come back unresolved
      if (typeof val === 'number' && field.endsWith('Id')) return `#${val}`
      return val
    },
  },
}
</script>
