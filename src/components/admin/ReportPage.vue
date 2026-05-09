<!-- eslint-disable no-useless-escape -->
<template>
  <div class="p-6 overflow-visible">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-2xl font-semibold">
          {{ (report && (locale === 'ar' ? (report.arTitle || report.title) : report.title)) || $t('admin.runReport') }}
        </h2>
        <p class="text-sm text-gray-600">{{ (report && report.description) || '' }}</p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="execute"
          :disabled="executing"
          class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition disabled:opacity-50"
        >
          {{ $t('labels.search') }}
        </button>

        <button
          @click="clear"
          class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          {{ $t('labels.clear') }}
        </button>

        <button
          @click="downloadCsv"
          :disabled="!report || !hasExportableRows || !!exportingFormat"
          class="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-400 transition disabled:opacity-50"
        >
          {{ exportingFormat === 'csv' ? ($t('labels.loading') || 'Loading...') : ($t('reports.downloadCsv') || 'Download CSV') }}
        </button>

        <button
          @click="downloadXlsx"
          :disabled="!report || !hasExportableRows || !!exportingFormat"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition disabled:opacity-50"
        >
          {{ exportingFormat === 'xlsx' ? ($t('labels.loading') || 'Loading...') : ($t('reports.downloadExcel') || 'Download Excel') }}
        </button>

        <button
          @click="downloadPdf"
          :disabled="!report || !hasExportableRows || !!exportingFormat"
          class="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-500 transition disabled:opacity-50"
        >
          {{ exportingFormat === 'pdf' ? ($t('labels.loading') || 'Loading...') : ($t('reports.downloadPdf') || 'Download PDF') }}
        </button>
      </div>
    </div>

    <p v-if="exportError" class="mb-4 text-sm text-red-600">
      {{ exportError }}
    </p>

    <div class="relative z-30 bg-white rounded shadow p-4 mb-6 overflow-visible">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-visible">
        <div
          v-for="p in reportFilterFields"
          :key="p.name"
          class="relative overflow-visible"
          :class="activeDropdown === p.name ? 'z-[9999]' : 'z-0'"
        >
          <label class="block text-sm font-medium mb-1">
            {{ (locale === 'ar' && p.arName) ? p.arName : (p.label || p.name) }}
          </label>

          <div v-if="!p.type || p.type === 'TEXT'">
            <input
              v-model="values[p.name]"
              class="w-full border rounded px-3 py-2"
            />
          </div>

          <div v-else-if="p.type === 'NUMBER'">
            <input
              type="number"
              v-model.number="values[p.name]"
              class="w-full border rounded px-3 py-2"
            />
          </div>

          <div v-else-if="p.type === 'DATE'">
            <DateField
              v-model="values[p.name]"
              class="w-full border rounded px-3 py-2"
            />
          </div>

          <div v-else-if="p.type === 'BOOLEAN'">
            <input
              type="checkbox"
              v-model="values[p.name]"
            />
          </div>

          <div
            v-else-if="p.type === 'DROPDOWN' || p.type === 'MULTISELECT'"
            class="relative z-[9999] overflow-visible"
            @focusin="activeDropdown = p.name"
            @mousedown="activeDropdown = p.name"
          >
            <SearchDropdown
              v-if="!paramDependencies[p.name] || (paramDependencies[p.name] && paramDependencies[p.name].every(dep => values[dep]))"
              :modelValue="selectedLabels[p.name] || ''"
              :items="paramOptions[p.name] || []"
              :allItems="paramOptions[p.name] || []"
              :placeholder="$t('placeholders.search')"
              itemKey="id"
              itemLabel="label"
              :inputClass="'w-full border rounded px-3 py-2'"
              @update:modelValue="q => onOptionSearch(p.name, q)"
              @select="item => onSelectOptionGeneric(p, item)"
            />

            <div
              v-else
              class="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500 text-sm"
            >
              {{ locale === 'ar' ? 'يرجى اختيار ' : 'Please select ' }}{{ (paramDependencies[p.name] || []).map(dep => {
                const depParam = reportFilterFields.find(pr => pr.name === dep)
                return (locale === 'ar' && depParam?.arName) ? depParam.arName : (depParam?.label || dep)
              }).join(', ') }}{{ locale === 'ar' ? ' أولاً' : ' first' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="relative z-10 bg-white rounded shadow p-4">
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

      <div
        v-if="executing"
        class="py-12 flex justify-center"
      >
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  v-for="col in columns"
                  :key="col"
                  class="px-4 py-2 text-start text-xs font-medium text-gray-500 uppercase"
                >
                  {{ getHeaderLabel(col) }}
                </th>
              </tr>
            </thead>

            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="!(tableData && tableData.length)">
                <td
                  :colspan="(columns && columns.length) || 1"
                  class="px-4 py-6 text-sm text-gray-500 text-center"
                >
                  {{ $t('reports.noResults') || 'No results' }}
                </td>
              </tr>

              <tr
                v-for="(row, idx) in tableData"
                :key="idx"
                :class="isTotalsRow(row) ? 'bg-amber-50 font-semibold' : ''"
              >
                <td
                  v-for="col in columns"
                  :key="col"
                  class="px-4 py-2 text-sm"
                  :class="isTotalsRow(row) ? 'border-t-2 border-amber-300 text-amber-950' : 'text-gray-700'"
                >
                  <div class="truncate max-w-[20rem]">
                    {{ getValue(row, col) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
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

export default {
  components: { SearchDropdown, DateField },

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
      reportSelectFields,
      reportFilterFields,
      values,
      execute,
      result,
      executing,
      exportingFormat,
      exportError,
      paramOptions,
      paramDependencies,
      selectedLabels,
      activeDropdown,
      onOptionSearch,
      onSelectOptionGeneric,
      clear,
      columns,
      effectiveTotalsColumns,
      isTotalsRow,
      locale,
      tableData,
      hasExportableRows,
      getValue,
      getHeaderLabel,
      downloadCsv,
      downloadXlsx,
      downloadPdf
    }
  }
}
</script>
