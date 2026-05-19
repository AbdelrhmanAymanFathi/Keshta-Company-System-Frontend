<!-- eslint-disable no-useless-escape -->
<template>
  <div
    class="report-page min-h-full sm:p-6 lg:p-8 overflow-visible"
    :dir="isRTL ? 'rtl' : 'ltr'"
    :class="{ 'direction-rtl': isRTL }"
  >
    <header class="relative mb-6 overflow-hidden rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50 px-5 py-6 sm:px-8 sm:py-7 shadow-lg shadow-slate-200/50">
      <div
        class="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
        style="background-image: radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.09) 1px, transparent 0); background-size: 24px 24px;"
      />
      <div
        class="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-indigo-200/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -bottom-20 -start-10 h-56 w-56 rounded-full bg-sky-200/25 blur-3xl"
        aria-hidden="true"
      />
      <div class="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div class="min-w-0 flex-1 space-y-2">
          <div class="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/90 px-3 py-1 text-xs font-medium text-indigo-700 backdrop-blur-sm">
            <ChartBarSquareIcon class="h-3.5 w-3.5 shrink-0" />
            <span>{{ $t('admin.runReport') }}</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {{ reportTitle }}
          </h1>
          <p
            v-if="report?.description"
            class="max-w-2xl text-sm leading-relaxed text-slate-600"
          >
            {{ report.description }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            @click="execute"
            :disabled="executing"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:from-indigo-500 hover:to-sky-500 focus:outline-none focus:ring-2 focus:ring-indigo-300/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowPathIcon v-if="executing" class="h-4 w-4 animate-spin" />
            <MagnifyingGlassIcon v-else class="h-4 w-4" />
            {{ $t('labels.search') }}
          </button>
          <button
            type="button"
            @click="clear"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <ArrowUturnLeftIcon class="h-4 w-4" />
            {{ $t('labels.clear') }}
          </button>
        </div>
      </div>
    </header>

    <Transition name="report-fade">
      <div
        v-if="exportError"
        class="mb-5 flex items-start gap-3 rounded-2xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm"
        role="alert"
      >
        <ExclamationCircleIcon class="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
        <span>{{ exportError }}</span>
      </div>
    </Transition>

    <section
      v-if="reportFilterFields.length"
      class="relative z-30 mb-6 overflow-visible rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-lg shadow-slate-200/40 backdrop-blur-sm sm:p-6"
    >
      <div class="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <FunnelIcon class="h-5 w-5" />
        </div>
        <div>
          <h2 class="text-sm font-semibold text-slate-900">
            {{ $t('admin.parameters') || $t('labels.filters') }}
          </h2>
          <p class="text-xs text-slate-500">
            {{ locale === 'ar' ? 'حدّد المعايير ثم اضغط بحث' : 'Set criteria, then run search' }}
          </p>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-5 overflow-visible md:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="p in reportFilterFields"
          :key="p.name"
          class="relative overflow-visible"
          :class="activeDropdown === p.name ? 'z-[9999]' : 'z-0'"
        >
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {{ (locale === 'ar' && p.arName) ? p.arName : (p.label || p.name) }}
          </label>

          <div v-if="!p.type || p.type === 'TEXT'">
            <input
              v-model="values[p.name]"
              :class="inputClass"
              :placeholder="$t('placeholders.search')"
            />
          </div>

          <div v-else-if="p.type === 'NUMBER'">
            <input
              type="number"
              v-model.number="values[p.name]"
              :class="inputClass"
            />
          </div>

          <div v-else-if="p.type === 'DATE'">
            <DateField
              v-model="values[p.name]"
              :class="inputClass"
            />
          </div>

          <div
            v-else-if="p.type === 'BOOLEAN'"
            class="flex h-[42px] items-center"
          >
            <label class="group inline-flex cursor-pointer items-center gap-3">
              <span class="relative">
                <input type="checkbox" v-model="values[p.name]" class="peer sr-only" />
                <span class="block h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-indigo-600 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500/40" />
                <span class="absolute start-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
              </span>
              <span class="text-sm text-slate-600 group-hover:text-slate-900">
                {{ values[p.name] ? ($t('labels.active') || 'Yes') : ($t('labels.inactive') || 'No') }}
              </span>
            </label>
          </div>

          <div
            v-else-if="p.type === 'DROPDOWN' || p.type === 'MULTISELECT'"
            class="relative z-[9999] overflow-visible"
            @focusin="activeDropdown = p.name"
            @mousedown="activeDropdown = p.name"
          >
            <div
              v-if="paramLoading[p.name]"
              class="flex items-center gap-2 py-2 text-xs text-slate-500"
            >
              <ArrowPathIcon class="h-3.5 w-3.5 animate-spin text-indigo-500" />
              {{ $t('reports.loadingOptions') || $t('labels.loading') }}
            </div>
            <SearchDropdown
              v-else-if="!paramDependencies[p.name] || (paramDependencies[p.name] && paramDependencies[p.name].every(dep => values[dep]))"
              :modelValue="selectedLabels[p.name] || ''"
              :items="paramOptions[p.name] || []"
              :allItems="paramOptions[p.name] || []"
              :placeholder="$t('placeholders.search')"
              itemKey="id"
              itemLabel="label"
              :inputClass="inputClass"
              @update:modelValue="q => onOptionSearch(p.name, q)"
              @select="item => onSelectOptionGeneric(p, item)"
            />

            <div
              v-else
              :class="[inputClass, 'flex items-center gap-2 bg-slate-100/80 text-slate-500']"
            >
              <InformationCircleIcon class="h-4 w-4 shrink-0 text-indigo-500" />
              <span class="text-xs leading-snug">
              {{ locale === 'ar' ? 'يرجى اختيار ' : 'Please select ' }}{{ (paramDependencies[p.name] || []).map(dep => {
                const depParam = reportFilterFields.find(pr => pr.name === dep)
                return (locale === 'ar' && depParam?.arName) ? depParam.arName : (depParam?.label || dep)
              }).join(', ') }}{{ locale === 'ar' ? ' أولاً' : ' first' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="relative z-10 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40">
      <div class="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div class="flex flex-wrap items-center gap-2">
          <TableCellsIcon class="h-5 w-5 text-indigo-600" />
          <span class="text-sm font-semibold text-slate-800">{{ locale === 'ar' ? 'النتائج' : 'Results' }}</span>
          <span v-if="hasResults && !executing" class="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
            {{ dataRowCount }} {{ locale === 'ar' ? 'صف' : 'rows' }}
          </span>
          <span v-if="columns.length && !executing" class="inline-flex items-center rounded-full bg-slate-200/80 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {{ columns.length }} {{ locale === 'ar' ? 'عمود' : 'cols' }}
          </span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" @click="downloadCsv" :disabled="!report || !hasExportableRows || !!exportingFormat" class="report-export-btn report-export-btn--csv" :title="$t('reports.downloadCsv') || 'CSV'">
            <DocumentTextIcon class="h-4 w-4" />
            <span class="hidden sm:inline">{{ exportingFormat === 'csv' ? ($t('labels.loading') || '...') : 'CSV' }}</span>
          </button>
          <button type="button" @click="downloadXlsx" :disabled="!report || !hasExportableRows || !!exportingFormat" class="report-export-btn report-export-btn--xlsx" :title="$t('reports.downloadExcel') || 'Excel'">
            <TableCellsIcon class="h-4 w-4" />
            <span class="hidden sm:inline">{{ exportingFormat === 'xlsx' ? ($t('labels.loading') || '...') : 'Excel' }}</span>
          </button>
          <button type="button" @click="downloadPdf" :disabled="!report || !hasExportableRows || !!exportingFormat" class="report-export-btn report-export-btn--pdf" :title="$t('reports.downloadPdf') || 'PDF'">
            <DocumentArrowDownIcon class="h-4 w-4" />
            <span class="hidden sm:inline">{{ exportingFormat === 'pdf' ? ($t('labels.loading') || '...') : 'PDF' }}</span>
          </button>
        </div>
      </div>
      <div class="p-4 sm:p-6">
      <!-- <div
        v-if="reportSelectFields.length"
        class="mb-4 rounded border border-sky-200 bg-sky-50 p-3"
      >
        <div class="text-sm font-medium text-sky-900">
          {{ $t('reports.selectFields') || 'Output fields' }}
        </div>

        <div class="mt-2 flex flex-wrap gap-1">
          <span
            v-for="field in reportSelectFields"
            :key="`select-field-${field.name}`"
            class="rounded-full bg-sky-200 px-2 py-1 text-xs font-medium text-sky-900"
          >
            {{ field.label || field.name }}
          </span>
        </div>
      </div> -->

      <!-- <div
        v-if="effectiveTotalsColumns.length"
        class="mb-4 rounded border border-amber-200 bg-amber-50 p-3"
      >
        <div class="text-sm font-medium text-amber-900">
          {{ $t('reports.totalsLabel') || 'Totals' }}
        </div>

        <div class="mt-2 flex flex-wrap gap-1">
          <span
            v-for="column in effectiveTotalsColumns"
            :key="`total-column-${column}`"
            class="rounded-full bg-amber-200 px-2 py-1 text-xs font-medium text-amber-900"
          >
            {{ getHeaderLabel(column) }}
          </span>
        </div>
      </div> -->

      <div v-if="executing" class="flex flex-col items-center justify-center gap-4 py-16">
        <div class="relative h-12 w-12">
          <div class="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div class="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600" />
        </div>
        <p class="text-sm font-medium text-slate-500">{{ $t('labels.loading') }}</p>
      </div>

      <div v-else class="overflow-hidden rounded-xl border border-slate-200/80">
        <div class="overflow-x-auto">
          <table class="report-table min-w-full">
            <thead>
              <tr>
                <th
                  v-for="col in columns"
                  :key="col"
                  class="whitespace-nowrap px-4 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-6"
                >
                  {{ getHeaderLabel(col) }}
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="!(tableData && tableData.length)">
                <td :colspan="(columns && columns.length) || 1" class="px-6 py-16 text-center">
                  <div class="mx-auto flex max-w-sm flex-col items-center gap-3">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <TableCellsIcon class="h-7 w-7" />
                    </div>
                    <p class="text-sm font-medium text-slate-600">
                      {{ $t('reports.noResults') || 'No results' }}
                    </p>
                    <p class="text-xs text-slate-400">
                      {{ locale === 'ar' ? 'اضبط الفلاتر واضغط بحث لعرض البيانات' : 'Adjust filters and run search to view data' }}
                    </p>
                  </div>
                </td>
              </tr>
              <tr
                v-for="(row, idx) in tableData"
                :key="idx"
                :class="[
                  'transition-colors',
                  isTotalsRow(row)
                    ? 'report-totals-row bg-gradient-to-r from-slate-50 to-indigo-50 font-semibold'
                    : 'hover:bg-indigo-50/40'
                ]"
              >
                <td
                  v-for="col in columns"
                  :key="col"
                  class="whitespace-nowrap px-4 py-3 text-sm sm:px-6"
                  :class="isTotalsRow(row) ? 'border-t-2 border-indigo-200 text-slate-900' : 'text-slate-700'"
                >
                  <div class="max-w-[20rem] truncate" :title="getValue(row, col)">
                    {{ getValue(row, col) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getReportDef, executeReport, getReportParamOptions } from '@/api'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import DateField from '@/components/shared/DateField.vue'
import {
  isDynamicReportTotalsRow,
  normalizeReportTotals,
  normalizeReportFilterFields,
  normalizeReportSelectFields,
  splitFooterRow
} from '@/utils/reportDefinitions'
import { downloadBlobData, getFilenameFromHeaders } from '@/utils/downloadFile'
import {
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ChartBarSquareIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  TableCellsIcon
} from '@heroicons/vue/24/outline'

const INPUT_CLASS =
  'w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition-all duration-200'

export default {
  components: {
    SearchDropdown,
    DateField,
    ArrowPathIcon,
    ArrowUturnLeftIcon,
    ChartBarSquareIcon,
    DocumentArrowDownIcon,
    DocumentTextIcon,
    ExclamationCircleIcon,
    FunnelIcon,
    InformationCircleIcon,
    MagnifyingGlassIcon,
    TableCellsIcon
  },

  props: {
    reportId: {
      type: [String, Number],
      required: true
    }
  },

  setup(props) {
    const { locale, t } = useI18n()

    const report = ref(null)
    const values = ref({})
    const result = ref(null)
    const executing = ref(false)
    const exportingFormat = ref('')
    const exportError = ref('')

    const paramOptions = ref({})
    const paramLoading = ref({})
    const selectedLabels = ref({})
    const activeDropdown = ref(null)

    const isRTL = computed(() => locale.value === 'ar')
    const inputClass = INPUT_CLASS

    const reportTitle = computed(() => {
      if (!report.value) return t('admin.runReport')
      return locale.value === 'ar'
        ? (report.value.arTitle || report.value.title || t('admin.runReport'))
        : (report.value.title || report.value.arTitle || t('admin.runReport'))
    })

    const reportSelectFields = computed(() => normalizeReportSelectFields(report.value || {}))
    const reportFilterFields = computed(() => normalizeReportFilterFields(report.value || {}))

    const getParamByName = (paramName) => {
      return reportFilterFields.value.find((p) => p.name === paramName)
    }

    function clearParamValue(paramName) {
      const param = getParamByName(paramName)

      if (param?.type === 'MULTISELECT') {
        values.value[paramName] = []
      } else if (param?.type === 'BOOLEAN') {
        values.value[paramName] = false
      } else {
        values.value[paramName] = null
      }

      selectedLabels.value[paramName] = ''
    }

    const paramDependencies = computed(() => {
      const deps = {}

      ;(reportFilterFields.value || []).forEach((p) => {
        if (p.dataSourceSql && typeof p.dataSourceSql === 'string') {
          const matches = p.dataSourceSql.match(/:(\w+)/g) || []
          const paramRefs = matches
            .map((m) => m.substring(1))
            .filter((refName) => refName !== p.name)

          if (paramRefs.length) {
            deps[p.name] = paramRefs
          }
        }
      })

      return deps
    })

    const reportTotals = computed(() => normalizeReportTotals(report.value || {}))

    const resultTotals = computed(() => {
      if (Array.isArray(result.value?.totals)) return result.value.totals
      if (Array.isArray(result.value?.importantColumns)) return result.value.importantColumns
      return []
    })

    const effectiveTotalsColumns = computed(() => {
      return resultTotals.value.length ? resultTotals.value : reportTotals.value
    })

    const normalizedResultRows = computed(() => {
      const rawRows = (() => {
        if (Array.isArray(result.value)) return result.value
        if (result.value && Array.isArray(result.value.rows)) return result.value.rows
        if (result.value && Array.isArray(result.value.data)) return result.value.data
        return []
      })()

      const { dataRows, footerRow } = splitFooterRow(rawRows, isDynamicReportTotalsRow)
      const standaloneFooter = isDynamicReportTotalsRow(result.value?.totalsRow) ? result.value.totalsRow : null
      const effectiveFooter = footerRow || standaloneFooter

      return effectiveFooter ? [...dataRows, effectiveFooter] : dataRows
    })

    const columns = computed(() => {
      const table = normalizedResultRows.value

      if (!table || !table.length) return []

      const first = table.find((row) => !isTotalsRow(row)) || table[0]

      if (!first || typeof first !== 'object') return []

      return Object.keys(first).filter((key) => !String(key).startsWith('__'))
    })

    const tableData = computed(() => {
      return normalizedResultRows.value
    })

    const hasExportableRows = computed(() => {
      return normalizedResultRows.value.some((row) => !isTotalsRow(row))
    })

    const hasResults = computed(() => normalizedResultRows.value.length > 0)

    const dataRowCount = computed(() => {
      return normalizedResultRows.value.filter((row) => !isTotalsRow(row)).length
    })

    const isTotalsRow = (row) => isDynamicReportTotalsRow(row)

    const totalsRowLabel = computed(() => t('reports.totalsLabel') || 'Totals')

    const findTotalsRowLabel = (row) => {
      if (!row || typeof row !== 'object') return totalsRowLabel.value

      const labelPattern = /totals?/i
      const labelEntry = Object.entries(row).find(([key, value]) => {
        if (String(key).startsWith('__')) return false
        return typeof value === 'string' && labelPattern.test(value)
      })

      return labelEntry?.[1] || totalsRowLabel.value
    }

    const getValue = (row, col) => {
      if (!row) return ''

      if (isTotalsRow(row)) {
        const label = findTotalsRowLabel(row)

        if (col === columns.value[0]) {
          return label
        }
      }

      const raw = row[col]

      if (raw === null || raw === undefined) return ''
      if (typeof raw === 'object') return JSON.stringify(raw)

      return String(raw)
    }

    const humanize = (key) => {
      if (!key) return ''

      const last = String(key).split('.').pop()
      const withSpaces = last
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_.-]+/g, ' ')

      return withSpaces
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ')
    }

    const getHeaderLabel = (col) => {
      if (!col) return ''

      const keyFull = `reports.columns.${String(col).replace(/\./g, '_')}`
      const translatedFull = t(keyFull)

      if (translatedFull && translatedFull !== keyFull) {
        return translatedFull
      }

      const lowerCol = String(col).toLowerCase()

      if (lowerCol.includes('driver')) {
        const translatedDriverName = t(`reports.columns.${String(col).replace(/\./g, '_')}`)

        if (
          translatedDriverName &&
          translatedDriverName !== `reports.columns.${String(col).replace(/\./g, '_')}`
        ) {
          return translatedDriverName
        }

        const translatedDriver = t('reports.columns.driver')

        if (translatedDriver && translatedDriver !== 'reports.columns.driver') {
          return translatedDriver
        }

        return humanize('driver')
      }

      if (lowerCol.includes('contractor')) {
        const translatedContractorName = t(`reports.columns.${String(col).replace(/\./g, '_')}`)

        if (
          translatedContractorName &&
          translatedContractorName !== `reports.columns.${String(col).replace(/\./g, '_')}`
        ) {
          return translatedContractorName
        }

        const translatedContractor = t('reports.columns.contractor')

        if (translatedContractor && translatedContractor !== 'reports.columns.contractor') {
          return translatedContractor
        }

        return humanize('contractor')
      }

      const last = String(col).split('.').pop()
      const keyLast = `reports.columns.${last}`
      const translatedLast = t(keyLast)

      if (translatedLast && translatedLast !== keyLast) {
        return translatedLast
      }

      return humanize(col)
    }

    const pad2 = (value) => String(value).padStart(2, '0')

    const formatExportTimestamp = (date = new Date()) => {
      const y = date.getFullYear()
      const m = pad2(date.getMonth() + 1)
      const d = pad2(date.getDate())
      const h = pad2(date.getHours())
      const min = pad2(date.getMinutes())
      const s = pad2(date.getSeconds())
      return `${y}-${m}-${d}_${h}-${min}-${s}`
    }

    const sanitizeFilenamePart = (value) => {
      const text = String(value || '').trim()
      if (!text) return 'report'
      return text
        .replace(/[\\/:*?"<>|]+/g, '-')
        .replace(/\s+/g, ' ')
        .replace(/\s/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
    }

    const getReportExportBaseName = () => {
      const displayName = locale.value === 'ar'
        ? (report.value?.arTitle || report.value?.title || 'report')
        : (report.value?.title || report.value?.arTitle || 'report')
      return `${sanitizeFilenamePart(displayName)}-${formatExportTimestamp()}`
    }

    const load = async () => {
      try {
        const res = await getReportDef(props.reportId)
        const payload = res?.data?.data ?? res?.data ?? null

        report.value = payload

        if (report.value) {
          if (report.value.params && typeof report.value.params === 'string') {
            try {
              report.value.params = JSON.parse(report.value.params)
            } catch (e) {
              report.value.params = []
            }
          }

          if (!Array.isArray(report.value.params)) {
            report.value.params = []
          }

          report.value.filterFields = normalizeReportFilterFields(report.value)
          report.value.selectFields = normalizeReportSelectFields(report.value)
          report.value.totals = normalizeReportTotals(report.value)

          ;(reportFilterFields.value || []).forEach((p) => {
            if (p.type === 'MULTISELECT') {
              values.value[p.name] = p.default || []
            } else {
              values.value[p.name] = p.default ?? null
            }

            if (p.type === 'DROPDOWN' || p.type === 'MULTISELECT') {
              loadOptions(p.name)
            }
          })
        }
      } catch (err) {
        console.error('Failed to load report', err)
      }
    }

    function buildExecutePayload() {
      const params = {}

      ;(reportFilterFields.value || []).forEach((p) => {
        const val = values.value[p.name]

        if (p.type === 'DROPDOWN') {
          params[p.name] = val && typeof val === 'object' ? (val.id ?? val.value ?? val) : null
        } else if (p.type === 'MULTISELECT') {
          params[p.name] = Array.isArray(val)
            ? val.map((it) => it && (it.id ?? it.value ?? it))
            : []
        } else if (p.type === 'NUMBER') {
          params[p.name] = val !== null && val !== undefined && val !== '' ? Number(val) : null
        } else if (p.type === 'BOOLEAN') {
          params[p.name] = Boolean(val)
        } else {
          params[p.name] = val === '' || val === null || val === undefined ? null : val
        }
      })

      return { params }
    }

    async function downloadReport(format) {
      exportError.value = ''
      exportingFormat.value = format

      if (!hasExportableRows.value) {
        exportError.value = t('reports.noResults') || 'No results'
        exportingFormat.value = ''
        return
      }

      try {
        const res = await executeReport(props.reportId, buildExecutePayload(), {
          shape: 'display',
          format,
          lang: locale.value === 'ar' ? 'ar' : 'en',
          responseType: 'blob'
        })

        const fallbackName = `${getReportExportBaseName()}.${format}`
        const filename = getFilenameFromHeaders(res.headers, fallbackName) || fallbackName
        const mimeType =
          res.headers?.['content-type'] ||
          res.headers?.['Content-Type'] ||
          'application/octet-stream'

        downloadBlobData(res.data, filename, mimeType)
      } catch (err) {
        console.error(`Dynamic report ${format} export failed`, err)
        exportError.value = err?.response?.data?.message || t('reports.downloadError') || 'Export failed'
      } finally {
        exportingFormat.value = ''
      }
    }

    async function loadOptions(paramName, q = '') {
      paramLoading.value[paramName] = true

      try {
        const queryObj = {}

        if (q) {
          queryObj.q = q
        }

        const deps = paramDependencies.value[paramName] || []

        deps.forEach((depName) => {
          const depValue = values.value[depName]

          if (depValue) {
            const depId = depValue.id ?? depValue.value ?? depValue
            queryObj[depName] = depId
          }
        })

        const res = await getReportParamOptions(props.reportId, paramName, queryObj)

        const items = Array.isArray(res.data || res)
          ? (res.data || res).map((it, idx) => ({
              id: it.id ?? it.value ?? it.key ?? idx,
              label: it.label ?? it.name ?? String(it)
            }))
          : []

        paramOptions.value[paramName] = items
      } catch (err) {
        console.error('Failed to load options for', paramName, err)
        paramOptions.value[paramName] = []
      } finally {
        paramLoading.value[paramName] = false
      }
    }

    function onOptionSearch(paramName, q) {
      activeDropdown.value = paramName
      selectedLabels.value[paramName] = q

      if (getParamByName(paramName)?.type === 'DROPDOWN') {
        values.value[paramName] = null
      }

      loadOptions(paramName, q)
    }

    function onSelectOptionGeneric(p, item) {
      if (!p) return

      activeDropdown.value = p.name

      if (p.type === 'MULTISELECT') {
        if (!Array.isArray(values.value[p.name])) {
          values.value[p.name] = []
        }

        const exists = values.value[p.name].some((x) => x.id === item.id)

        if (!exists) {
          values.value[p.name].push(item)
        }
      } else {
        values.value[p.name] = item
      }

      Object.keys(paramDependencies.value).forEach((depParamName) => {
        const deps = paramDependencies.value[depParamName]

        if (deps && Array.isArray(deps) && deps.includes(p.name)) {
          clearParamValue(depParamName)
          loadOptions(depParamName)
        }
      })
    }

    function clear() {
      result.value = null
      exportError.value = ''
      values.value = {}
      selectedLabels.value = {}
      activeDropdown.value = null

      ;(reportFilterFields.value || []).forEach((p) => {
        clearParamValue(p.name)

        if (p.type === 'MULTISELECT') {
          values.value[p.name] = []
        } else if (p.type === 'BOOLEAN') {
          values.value[p.name] = false
        } else {
          values.value[p.name] = p.default ?? null
        }
      })
    }

    async function execute() {
      try {
        executing.value = true
        exportError.value = ''
        activeDropdown.value = null

        const res = await executeReport(props.reportId, buildExecutePayload(), {
          shape: 'display'
        })

        result.value = res.data
      } catch (err) {
        console.error('Execute failed', err)
        result.value = err?.response?.data || { error: String(err) }
      } finally {
        executing.value = false
      }
    }

    const downloadCsv = () => downloadReport('csv')
    const downloadXlsx = () => downloadReport('xlsx')
    const downloadPdf = () => downloadReport('pdf')

    watch(() => props.reportId, load, { immediate: true })

    return {
      report,
      reportTitle,
      reportSelectFields,
      reportFilterFields,
      values,
      execute,
      result,
      executing,
      exportingFormat,
      exportError,
      paramOptions,
      paramLoading,
      paramDependencies,
      selectedLabels,
      activeDropdown,
      onOptionSearch,
      onSelectOptionGeneric,
      clear,
      columns,
      effectiveTotalsColumns,
      isTotalsRow,
      isRTL,
      locale,
      inputClass,
      tableData,
      hasExportableRows,
      hasResults,
      dataRowCount,
      getValue,
      getHeaderLabel,
      downloadCsv,
      downloadXlsx,
      downloadPdf
    }
  }
}
</script>

<style scoped>
.report-page {
  background: linear-gradient(160deg, #f8fafc 0%, #eef2ff 52%, #f8fafc 100%);
  min-height: 100%;
}

.report-fade-enter-active,
.report-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.report-fade-enter-from,
.report-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.report-export-btn {
  @apply inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40;
}

.report-export-btn--csv {
  @apply border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 focus:ring-slate-300;
}

.report-export-btn--xlsx {
  @apply border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus:ring-indigo-300;
}

.report-export-btn--pdf {
  @apply border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 focus:ring-sky-300;
}

.report-table thead {
  @apply bg-gradient-to-r from-slate-50 to-indigo-50;
}

.report-table tbody tr + tr td {
  @apply border-t border-slate-100;
}

.report-totals-row td:first-child {
  @apply font-bold;
}
</style>
