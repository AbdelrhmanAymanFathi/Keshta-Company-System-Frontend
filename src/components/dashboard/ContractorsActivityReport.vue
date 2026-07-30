<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center gap-4 flex-wrap">
      <div>
        <h3 class="text-xl font-bold theme-text-primary">{{ t('title') }}</h3>
        <p class="text-sm theme-text-secondary mt-1">{{ t('description') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button 
          @click="refresh" 
          :disabled="loading"
          class="bg-gray-100 hover:bg-gray-200 theme-text-primary px-3 py-2 rounded-xl transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {{ $t('labels.refresh') || 'Refresh' }}
        </button>
        <button 
          @click="downloadReport('xlsx')" 
          :disabled="downloading || loading"
          class="theme-button px-4 py-2 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 text-sm font-medium theme-text-light shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v12m0 0l-3-3m3 3l3-3M5 20h14"/>
          </svg>
          {{ t('exportExcel') }}
        </button>
        <button 
          @click="downloadReport('pdf')" 
          :disabled="downloading || loading"
          class="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 text-sm font-medium shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v12m0 0l-3-3m3 3l3-3M5 20h14"/>
          </svg>
          {{ t('exportPdf') }}
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
      <h4 class="text-sm font-semibold theme-text-secondary">{{ $t('labels.filters') || 'Filters' }}</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Location Selection -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ t('location') }}</label>
          <select 
            v-model="filters.locationId"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none theme-input-focus"
          >
            <option value="">{{ t('allLocations') }}</option>
            <option v-for="l in locations" :key="l.id" :value="l.id">
              {{ (isRTL && l.arName) ? l.arName : l.name }}
            </option>
          </select>
        </div>
        
        <!-- Module Selection -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ t('module') }}</label>
          <select 
            v-model="filters.module"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none theme-input-focus"
          >
            <option value="">{{ t('allModules') }}</option>
            <option value="SUPPLY">{{ t('modules.SUPPLY') }}</option>
            <option value="TRANSPORT">{{ t('modules.TRANSPORT') }}</option>
            <option value="RENTAL">{{ t('modules.RENTAL') }}</option>
            <option value="EXTRACT">{{ t('modules.EXTRACT') }}</option>
          </select>
        </div>

        <!-- Contractor Selection -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ t('contractor') }}</label>
          <select 
            v-model="filters.contractorId"
            :disabled="!filters.module"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none theme-input-focus disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed"
          >
            <option value="">{{ t('allContractors') }}</option>
            <option v-for="c in contractors" :key="c.id" :value="c.id">
              {{ (isRTL && c.arName) ? c.arName : c.name }}
            </option>
          </select>
        </div>

        <!-- Start Date -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ t('dateFrom') }}</label>
          <DateField
            v-model="filters.startDate"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none theme-input-focus"
          />
        </div>

        <!-- End Date -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ t('dateTo') }}</label>
          <DateField
            v-model="filters.endDate"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none theme-input-focus"
          />
        </div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-slate-100 flex-wrap">
        <!-- Switches Control Group Wrapper -->
        <div class="flex flex-wrap items-center gap-6 rounded-2xl p-4 select-none">
          
          <!-- Detailed Mode Switch -->
          <div class="flex items-center gap-3">
            <label class="relative inline-flex items-center cursor-pointer group">
              <input type="checkbox" v-model="isDetailedMode" class="sr-only peer" @change="loadReport">
              
              <!-- Toggle background track -->
              <div :class="[
                'relative w-12 h-6 rounded-full border transition-all duration-300 shadow-inner',
                isDetailedMode 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-600 shadow-emerald-200/50' 
                  : 'bg-slate-200 border-slate-300'
              ]">
                <!-- Toggle indicator with icon -->
                <div :class="[
                  'absolute top-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center group-hover:scale-105',
                  isRTL 
                    ? (isDetailedMode ? 'right-[26px]' : 'right-[2px]')
                    : (isDetailedMode ? 'left-[26px]' : 'left-[2px]')
                ]">
                  <!-- X icon (unchecked) -->
                  <svg v-if="!isDetailedMode" class="w-3 h-3 text-slate-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <!-- Check icon (checked) -->
                  <svg v-else class="w-3 h-3 text-indigo-600 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>

              <div class="flex flex-col ms-3">
                <span class="text-xs font-semibold theme-text-primary transition-colors duration-200 group-hover:text-indigo-900">
                  {{ isRTL ? 'عرض تفصيلي (الحركات)' : 'Detailed Mode (Transactions)' }}
                </span>
                <span class="text-[10px] theme-text-muted leading-tight">
                  {{ isDetailedMode 
                    ? (isRTL ? 'يعرض تفاصيل الحركات والعمليات' : 'Showing detailed transaction ledger') 
                    : (isRTL ? 'يعرض ملخص نشاط المقاولين فقط' : 'Showing contractor activity summary only')
                  }}
                </span>
              </div>
            </label>
          </div>
        
          <!-- Hide Deleted Transactions Switch -->
          <div class="flex items-center gap-3" v-if="isDetailedMode">
            <label class="relative inline-flex items-center cursor-pointer group">
              <input type="checkbox" v-model="filters.onlyAddedAndReversals" class="sr-only peer" @change="loadReport">
              
              <!-- Toggle background track -->
              <div :class="[
                'relative w-12 h-6 rounded-full border transition-all duration-300 shadow-inner',
                filters.onlyAddedAndReversals 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-600 shadow-emerald-200/50' 
                  : 'bg-slate-200 border-slate-300'
              ]">
                <!-- Toggle indicator with icon -->
                <div :class="[
                  'absolute top-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center group-hover:scale-105',
                  isRTL 
                    ? (filters.onlyAddedAndReversals ? 'right-[26px]' : 'right-[2px]')
                    : (filters.onlyAddedAndReversals ? 'left-[26px]' : 'left-[2px]')
                ]">
                  <!-- X icon (unchecked) -->
                  <svg v-if="!filters.onlyAddedAndReversals" class="w-3 h-3 text-slate-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <!-- Check icon (checked) -->
                  <svg v-else class="w-3 h-3 text-emerald-600 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>

              <div class="flex flex-col ms-3">
                <span class="text-xs font-semibold theme-text-primary transition-colors duration-200 group-hover:text-indigo-900">
                  {{ isRTL ? 'إخفاء العمليات المحذوفة' : 'Hide Deleted Transactions' }}
                </span>
                <span class="text-[10px] theme-text-muted leading-tight">
                  {{ filters.onlyAddedAndReversals 
                    ? (isRTL ? 'تم استبعاد حركات الحذف وعكسها' : 'Excluding deleted records & reversals')
                    : (isRTL ? 'يعرض جميع حركات الحساب' : 'Showing all ledger records') 
                  }}
                </span>
              </div>
            </label>
          </div>

        </div>

        <div class="flex gap-2">
          <button 
            @click="loadReport"
            :disabled="loading"
            class="px-4 py-2 theme-button rounded-xl transition-colors disabled:opacity-50 text-sm font-semibold theme-text-light shadow-sm"
          >
            {{ t('generate') }}
          </button>
          <button 
            @click="clearFilters"
            class="px-4 py-2 border border-slate-200 bg-slate-100 hover:bg-slate-200 theme-text-secondary rounded-xl transition-colors text-sm font-semibold"
          >
            {{ t('clear') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="text-sm text-rose-800 font-medium">{{ error }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="flex flex-col items-center justify-center py-16 gap-2">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 theme-border-accent"></div>
      <p class="text-sm theme-text-secondary font-medium">{{ t('loading') }}</p>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 table-auto">
          <thead class="bg-slate-50">
            <tr v-if="!isDetailedMode">
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ t('contractor') }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ t('module') }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ t('description') || 'Description' }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ t('outstandingBefore') }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ t('totalOfWork') }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ t('totalPaid') }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ t('outstandingAfter') }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ t('notes') }}</th>
            </tr>
            <tr v-else>
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">ID</th>
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ $t('labels.date') || 'Date' }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ t('contractor') }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ t('module') }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ t('actionType') }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ t('description') || 'Description' }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ t('outstandingBefore') }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ t('totalOfWork') }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ t('totalPaid') }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ t('outstandingAfter') }}</th>
              <th class="px-4 py-3 text-start text-xs font-semibold theme-text-muted uppercase tracking-wider whitespace-nowrap">{{ t('notes') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-100" v-if="items.length">
            <template v-if="!isDetailedMode">
              <tr v-for="(row, index) in items" :key="index" class="hover:bg-slate-50/50 transition-colors">
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium theme-text-primary">{{ row.contractorName }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm theme-text-primary">
                  <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" :class="getModuleClass(row.module)">
                    {{ t(`modules.${row.module}`) }}
                  </span>
                </td>
                <td class="px-4 py-4 text-sm theme-text-primary min-w-[200px]">{{ isRTL && row.arDescription ? row.arDescription : row.description }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium theme-text-primary">{{ formatCurrency(row.outstandingBefore) }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">{{ row.totalOfWork !== 0 ? formatCurrency(row.totalOfWork) : '-' }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-semibold text-rose-600">{{ row.totalPaid !== 0 ? formatCurrency(row.totalPaid) : '-' }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium theme-text-primary">{{ formatCurrency(row.outstandingAfter) }}</td>
                <td class="px-4 py-4 text-sm theme-text-secondary min-w-[150px]">{{ isRTL && row.arNotes ? row.arNotes : row.notes || '-' }}</td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="(row, index) in items" :key="row.id || index" class="hover:bg-slate-50/50 transition-colors">
                <td class="px-4 py-4 whitespace-nowrap text-sm theme-text-primary">{{ row.id }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm theme-text-primary">{{ formatDate(row.date) }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium theme-text-primary">{{ row.contractorName }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm theme-text-primary">
                  <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" :class="getModuleClass(row.module)">
                    {{ t(`modules.${row.module}`) }}
                  </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm theme-text-primary">
                  {{ isRTL && row.arAction ? row.arAction : row.action }}
                </td>
                <td class="px-4 py-4 text-sm theme-text-primary min-w-[200px]">{{ isRTL && row.arDescription ? row.arDescription : row.description }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium theme-text-primary">{{ formatCurrency(row.outstandingBefore) }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">{{ row.totalOfWork !== 0 ? formatCurrency(row.totalOfWork) : '-' }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-semibold text-rose-600">{{ row.totalPaid !== 0 ? formatCurrency(row.totalPaid) : '-' }}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium theme-text-primary">{{ formatCurrency(row.outstandingAfter) }}</td>
                <td class="px-4 py-4 text-sm theme-text-secondary min-w-[150px]">{{ isRTL && row.arNotes ? row.arNotes : row.notes || '-' }}</td>
              </tr>
            </template>
          </tbody>
          <tbody v-else>
            <tr>
              <td :colspan="isDetailedMode ? 11 : 8" class="px-4 py-12 text-center text-sm theme-text-muted font-medium bg-slate-50/20">
                {{ t('noData') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary / Totals Row at End of Table -->
      <div v-if="items.length > 0" class="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold theme-text-secondary">{{ t('totals') }}:</span>
        </div>
        <div class="flex items-center gap-6 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="text-xs theme-text-secondary">{{ t('totalOfWork') }}:</span>
            <span class="text-base font-bold text-emerald-600">{{ formatCurrency(totals.totalOfWork) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs theme-text-secondary">{{ t('totalPaid') }}:</span>
            <span class="text-base font-bold text-rose-600">{{ formatCurrency(totals.totalPaid) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getContractors, getContractorsActivityReportData, getLocations } from '@/api'
import DateField from '../shared/DateField.vue'
import { buildQueryParams } from '@/utils/buildQueryParams'
import { downloadBlobData, getFilenameFromHeaders } from '@/utils/downloadFile'

export default {
  name: 'ContractorsActivityReport',
  components: { DateField },
  setup() {
    const { locale } = useI18n()
    const isRTL = computed(() => locale.value === 'ar')

    const loading = ref(false)
    const downloading = ref(false)
    const error = ref(null)
    const contractors = ref([])
    const locations = ref([])
    const items = ref([])
    
    const totals = ref({
      totalOfWork: 0,
      totalPaid: 0
    })

    const filters = ref({
      contractorId: '',
      module: '',
      locationId: '',
      startDate: '',
      endDate: '',
      onlyAddedAndReversals: false,
      reportVariant: 'simple'
    })

    const isDetailedMode = computed({
      get() {
        return filters.value.reportVariant === 'detailed'
      },
      set(val) {
        filters.value.reportVariant = val ? 'detailed' : 'simple'
      }
    })

    watch(() => filters.value.module, async (newVal) => {
      filters.value.contractorId = ''
      if (newVal) {
        await loadContractors(newVal)
      } else {
        contractors.value = []
      }
    })

    // Localized helper translations
    const t = (key) => {
      const translations = {
        en: {
          title: 'Contractors Activity Report',
          description: 'Detailed statement of contractor work activities and payments across all system modules.',
          contractor: 'Contractor',
          module: 'Module',
          outstandingBefore: 'Outstanding Before',
          totalOfWork: 'Debit (Owed)',
          totalPaid: 'Credit (Paid)',
          outstandingAfter: 'Outstanding After',
          notes: 'Notes',
          allModules: 'All Modules',
          allContractors: 'All Contractors',
          exportExcel: 'Excel Export',
          exportPdf: 'PDF Export',
          generate: 'Search / Generate',
          clear: 'Reset',
          dateFrom: 'Date From',
          dateTo: 'Date To',
          noData: 'No transactions found. Choose a different range or filter.',
          loading: 'Loading activities...',
          totals: 'Totals',
          location: 'Location',
          allLocations: 'All Locations',
          actionType: 'Type',
          modules: {
            SUPPLY: 'Supply',
            TRANSPORT: 'Transport',
            RENTAL: 'Equipment Rental',
            EXTRACT: 'Extracts',
            EXPENSE: 'Expenses'
          }
        },
        ar: {
          title: 'تقرير نشاط المقاولين',
          description: 'كشف الحركة التفصيلية لأعمال ومدفوعات المقاولين في مختلف الأقسام.',
          contractor: 'المقاول',
          module: 'القسم',
          outstandingBefore: 'الرصيد السابق',
          totalOfWork: 'مدين',
          totalPaid: 'دائن',
          outstandingAfter: 'الرصيد الحالي',
          notes: 'ملاحظات',
          allModules: 'كل الأقسام',
          allContractors: 'كل المقاولين',
          exportExcel: 'تصدير إكسل',
          exportPdf: 'تصدير PDF',
          generate: 'عرض التقرير',
          clear: 'إعادة ضبط',
          dateFrom: 'من تاريخ',
          dateTo: 'إلى تاريخ',
          noData: 'لا توجد حركات للفترة أو الفلاتر المحددة.',
          loading: 'جاري تحميل الحركات...',
          totals: 'الإجماليات',
          location: 'الموقع',
          allLocations: 'كل المواقع',
          actionType: 'النوع',
          modules: {
            SUPPLY: 'توريدات',
            TRANSPORT: 'نقل',
            RENTAL: 'إيجار معدات',
            EXTRACT: 'مستخلصات',
            EXPENSE: 'مصاريف'
          }
        }
      }
      const lang = locale.value === 'ar' ? 'ar' : 'en'
      // Support nested key lookup (e.g., 'modules.SUPPLY')
      if (key.includes('.')) {
        const parts = key.split('.')
        return translations[lang]?.[parts[0]]?.[parts[1]] || key
      }
      return translations[lang]?.[key] || key
    }

    const loadContractors = async (module = '') => {
      try {
        const mode = module === 'RENTAL' ? 'rentals' : module
        const res = await getContractors({ pageSize: 1000, mode })
        const payload = res.data || {}
        contractors.value = Array.isArray(payload.items)
          ? payload.items
          : Array.isArray(payload.data)
            ? payload.data
            : Array.isArray(payload)
              ? payload
              : []
      } catch (err) {
        console.error('Failed to load contractors:', err)
      }
    }

    const loadReport = async () => {
      error.value = null
      
      // Basic range validation
      if (filters.value.startDate && filters.value.endDate) {
        const s = new Date(filters.value.startDate)
        const e = new Date(filters.value.endDate)
        if (e < s) {
          items.value = []
          error.value = isRTL.value 
            ? 'تأكد أن تاريخ النهاية بعد أو يساوي تاريخ البداية' 
            : 'End date must be greater than or equal to Start date'
          return
        }
      }

      loading.value = true
      try {
        const queryParams = buildQueryParams(filters.value)
        const response = await getContractorsActivityReportData(queryParams, 'json')
        const { data } = response

        items.value = data.rows || []
        totals.value = data.totals || { totalOfWork: 0, totalPaid: 0 }
      } catch (err) {
        console.error('Failed to load contractors activity report:', err)
        error.value = err.response?.data?.message || 'Failed to load report'
      } finally {
        loading.value = false
      }
    }

    const clearFilters = () => {
      filters.value = {
        contractorId: '',
        module: '',
        locationId: '',
        startDate: '',
        endDate: '',
        onlyAddedAndReversals: false,
        reportVariant: 'simple'
      }
      // Re-initialize default date range
      setDefaultDates()
      items.value = []
      totals.value = { totalOfWork: 0, totalPaid: 0 }
    }

    const refresh = async () => {
      await loadReport()
    }

    const downloadReport = async (format) => {
      downloading.value = true
      error.value = null
      try {
        const queryParams = buildQueryParams(filters.value)
        // Pass current locale language to the export endpoint
        queryParams.lang = locale.value === 'ar' ? 'ar' : 'en'

        const { data, headers } = await getContractorsActivityReportData(queryParams, format)
        
        let filename = getFilenameFromHeaders(headers, null)
        if (!filename) {
          const ext = format === 'pdf' ? 'pdf' : 'xlsx'
          filename = `contractors-activity-report-${filters.value.startDate || 'all'}.${ext}`
        }

        const mimeType = format === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

        downloadBlobData(data, filename, mimeType)
      } catch (err) {
        console.error('Failed to download report:', err)
        error.value = err.response?.data?.message || 'Failed to download report'
      } finally {
        downloading.value = false
      }
    }

    const getModuleClass = (module) => {
      const classes = {
        SUPPLY: 'bg-blue-50 text-blue-700 border border-blue-200',
        TRANSPORT: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        RENTAL: 'bg-purple-50 text-purple-700 border border-purple-200',
        EXTRACT: 'bg-amber-50 text-amber-700 border border-amber-200',
        EXPENSE: 'bg-rose-50 text-rose-700 border border-rose-200'
      }
      return classes[module] || 'bg-slate-50 text-slate-700 border border-slate-200'
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return dateString // Date formatted already by backend (dd/MM/yyyy)
    }

    const formatCurrency = (amount) => {
      const rtl = locale.value?.startsWith('ar')
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0)
      return rtl && formatted.startsWith('-') ? '\u200E' + formatted : formatted
    }

    const loadLocations = async () => {
      try {
        const res = await getLocations()
        locations.value = Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || [])
      } catch (err) {
        console.error('Failed to load locations:', err)
      }
    }

    const setDefaultDates = () => {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
      filters.value.endDate = endDate.toISOString().split('T')[0]
      filters.value.startDate = startDate.toISOString().split('T')[0]
    }

    onMounted(async () => {
      setDefaultDates()
      await loadLocations()
      // No initial contractors loaded until a module is selected.
    })

    return {
      isRTL,
      loading,
      downloading,
      error,
      contractors,
      locations,
      items,
      totals,
      filters,
      isDetailedMode,
      t,
      loadReport,
      clearFilters,
      refresh,
      downloadReport,
      getModuleClass,
      formatDate,
      formatCurrency
    }
  }
}
</script>
