<!-- eslint-disable no-useless-escape -->
<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-2xl font-semibold">{{ (report && (locale === 'ar' ? (report.arTitle || report.title) : report.title)) || $t('admin.runReport') }}</h2>
        <p class="text-sm text-gray-600">{{ (report && report.description) || '' }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="execute" :disabled="executing" class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition disabled:opacity-50">{{ $t('labels.search') }}</button>
        <button @click="clear" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">{{ $t('labels.clear') }}</button>
        <button @click="downloadCsv" :disabled="!report || !!exportingFormat" class="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-400 transition disabled:opacity-50">
          {{ exportingFormat === 'csv' ? ($t('labels.loading') || 'Loading...') : ($t('reports.downloadCsv') || 'Download CSV') }}
        </button>
        <button @click="downloadXlsx" :disabled="!report || !!exportingFormat" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition disabled:opacity-50">
          {{ exportingFormat === 'xlsx' ? ($t('labels.loading') || 'Loading...') : ($t('reports.downloadExcel') || 'Download Excel') }}
        </button>
        <button @click="downloadPdf" :disabled="!report || !!exportingFormat" class="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-500 transition disabled:opacity-50">
          {{ exportingFormat === 'pdf' ? ($t('labels.loading') || 'Loading...') : ($t('reports.downloadPdf') || 'Download PDF') }}
        </button>
      </div>
    </div>
    <p v-if="exportError" class="mb-4 text-sm text-red-600">{{ exportError }}</p>

    <div class="bg-white rounded shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="p in (report && report.params) || []" :key="p.name">
          <label class="block text-sm font-medium mb-1">{{ (locale === 'ar' && p.arName) ? p.arName : (p.label || p.name) }}</label>

          <div v-if="!p.type || p.type === 'TEXT'">
            <input v-model="values[p.name]" class="w-full border rounded px-3 py-2" />
          </div>
          <div v-else-if="p.type === 'NUMBER'">
            <input type="number" v-model.number="values[p.name]" class="w-full border rounded px-3 py-2" />
          </div>
          <div v-else-if="p.type === 'DATE'">
            <DateField v-model="values[p.name]" class="w-full border rounded px-3 py-2" />
          </div>
          <div v-else-if="p.type === 'BOOLEAN'">
            <input type="checkbox" v-model="values[p.name]" />
          </div>
          <div v-else-if="p.type === 'DROPDOWN' || p.type === 'MULTISELECT'">
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
            <div v-else class="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500 text-sm">
              {{ locale === 'ar' ? 'يرجى اختيار ' : 'Please select ' }}{{ (paramDependencies[p.name] || []).map(dep => {
                const depParam = (report && report.params || []).find(pr => pr.name === dep)
                return (locale === 'ar' && depParam?.arName) ? depParam.arName : (depParam?.label || dep)
              }).join(', ') }}{{ locale === 'ar' ? ' أولاً' : ' first' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded shadow p-4">
      <div v-if="effectiveImportantColumns.length" class="mb-4 rounded border border-amber-200 bg-amber-50 p-3">
        <div class="text-sm font-medium text-amber-900">{{ $t('reports.importantColumns') || 'Totals columns' }}</div>
        <div class="mt-2 flex flex-wrap gap-1">
          <span
            v-for="column in effectiveImportantColumns"
            :key="`important-column-${column}`"
            class="rounded-full bg-amber-200 px-2 py-1 text-xs font-medium text-amber-900"
          >
            {{ getHeaderLabel(column) }}
          </span>
        </div>
      </div>
      <div v-if="executing" class="py-12 flex justify-center"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th v-for="col in columns" :key="col" class="px-4 py-2 text-start text-xs font-medium text-gray-500 uppercase">{{ getHeaderLabel(col) }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="!(tableData && tableData.length)">
                <td :colspan="(columns && columns.length) || 1" class="px-4 py-6 text-sm text-gray-500 text-center">{{ $t('reports.noResults') || 'No results' }}</td>
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
                  <div class="truncate max-w-[20rem]">{{ getValue(row, col) }}</div>
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
import { isDynamicReportTotalsRow, normalizeImportantColumns, splitFooterRow } from '@/utils/reportDefinitions'
import { downloadBlobData, getFilenameFromHeaders } from '@/utils/downloadFile'

export default {
  components: { SearchDropdown, DateField },
  props: { reportId: { type: [String, Number], required: true } },
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

    // Detect parameter dependencies (e.g., vehicleId depends on contractorId)
    const paramDependencies = computed(() => {
      const deps = {}
      ;(report.value?.params || []).forEach(p => {
        if (p.dataSourceSql && typeof p.dataSourceSql === 'string') {
          // Extract parameter references like :contractorId from SQL
          const matches = p.dataSourceSql.match(/:(\w+)/g) || []
          const paramRefs = matches.map(m => m.substring(1)).filter(ref => ref !== p.name)
          if (paramRefs.length) deps[p.name] = paramRefs
        }
      })
      return deps
    })

    const reportImportantColumns = computed(() => normalizeImportantColumns(report.value || {}))
    const resultImportantColumns = computed(() =>
      Array.isArray(result.value?.importantColumns) ? result.value.importantColumns : []
    )
    const effectiveImportantColumns = computed(() =>
      resultImportantColumns.value.length ? resultImportantColumns.value : reportImportantColumns.value
    )

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
      const first = table.find(row => !isTotalsRow(row)) || table[0]
      if (!first || typeof first !== 'object') return []
      // helper to read raw value for a column from an example row
      const rawValue = (row, col) => {
        if (!row) return undefined
        if (col.includes('.')) {
          const parts = col.split('.')
          let cur = row
          for (const p of parts) {
            if (cur == null) return undefined
            cur = cur[p]
          }
          return cur
        }
        return row[col]
      }

      // build initial candidate columns, skipping top-level *Id fields
      const baseCols = []
      Object.keys(first).forEach(k => {
        if (String(k).startsWith('__')) return
        if (k.endsWith('Id')) return
        const v = first[k]
        if (v === null) baseCols.push(k)
        else if (Array.isArray(v)) baseCols.push(k)
        else if (typeof v === 'object') {
          const subKeys = Object.keys(v || {})
          if (subKeys.includes('name')) baseCols.push(`${k}.name`)
          else if (subKeys.length === 0) baseCols.push(k)
          else {
            subKeys.forEach(sk => {
              if (sk === 'id' || sk.endsWith('Id')) return
              baseCols.push(`${k}.${sk}`)
            })
          }
        } else {
          baseCols.push(k)
        }
      })

      // classify columns by sample value; consider name-based heuristics for date fields
      const nonNumeric = []
      const numeric = []
      const dateCols = []

      baseCols.forEach(col => {
        const sample = rawValue(first, col)
        const s = sample
        const name = String(col || '').toLowerCase()
        const nameLooksLikeDate = name === 'date' || name.endsWith('date') || name.endsWith('at')
        const isDate = nameLooksLikeDate || (typeof s === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(s))
        const isNumber = typeof s === 'number' || (typeof s === 'string' && s !== '' && !Number.isNaN(Number(s)))
        if (isDate) dateCols.push(col)
        else if (isNumber) numeric.push(col)
        else nonNumeric.push(col)
      })

      // move any notes columns to the end of the non-numeric group
      const notesCols = []
      const otherNonNumeric = []
      nonNumeric.forEach(c => {
        const last = String(c).split('.').pop().toLowerCase()
        if (last === 'notes') notesCols.push(c)
        else otherNonNumeric.push(c)
      })

      // ensure discount and total go to the very end
      const discountCols = []
      const totalCols = []
      // const filterOut = (arr) => arr.filter(c => {
      //   const last = String(c).split('.').pop().toLowerCase()
      //   return last !== 'discount' && last !== 'total'
      // })

      // collect and remove discount/total from otherNonNumeric and numeric
      const remainingNonNumeric = []
      otherNonNumeric.forEach(c => {
        const last = String(c).split('.').pop().toLowerCase()
        if (last === 'discount') discountCols.push(c)
        else if (last === 'total') totalCols.push(c)
        else remainingNonNumeric.push(c)
      })

      const remainingNumeric = []
      numeric.forEach(c => {
        const last = String(c).split('.').pop().toLowerCase()
        if (last === 'discount') discountCols.push(c)
        else if (last === 'total') totalCols.push(c)
        else remainingNumeric.push(c)
      })

      // order: date columns first, then other non-numeric (excluding notes), then notes, then remaining numeric, then discount, then total
      return [...dateCols, ...remainingNonNumeric, ...notesCols, ...remainingNumeric, ...discountCols, ...totalCols]
    })

    const tableData = computed(() => {
      return normalizedResultRows.value
    })

    const isTotalsRow = (row) => isDynamicReportTotalsRow(row)

    const getRawValue = (row, col) => {
      if (!row) return undefined
      if (String(col).includes('.')) {
        const parts = String(col).split('.')
        let cur = row
        for (const p of parts) {
          if (cur == null) return undefined
          cur = cur[p]
        }
        return cur
      }
      return row[col]
    }

    // const formatDateYMD = (d) => {
    //   if (!(d instanceof Date)) d = new Date(d)
    //   if (isNaN(d.getTime())) return ''
    //   const y = d.getFullYear()
    //   const m = String(d.getMonth() + 1).padStart(2, '0')
    //   const day = String(d.getDate()).padStart(2, '0')
    //   return `${y}/${m}/${day}`
    // }

    // const formatDateTimeYMDHMS = (d) => {
    //   if (!(d instanceof Date)) d = new Date(d)
    //   if (isNaN(d.getTime())) return ''
    //   const y = d.getFullYear()
    //   const m = String(d.getMonth() + 1).padStart(2, '0')
    //   const day = String(d.getDate()).padStart(2, '0')
    //   return `${y}/${m}/${day}`
    // }

    const parseIsoUtcString = (s) => {
      // Match strict UTC ISO like 2026-02-02T00:00:00.000Z or without milliseconds
      const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?Z$/.exec(s)
      if (!m) return null
      const [, Y, M, D] = m
      return { Y, M, D}
    }

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
        const firstColumn = columns.value[0]
        const rawTotalsValue = getRawValue(row, col)
        const label = findTotalsRowLabel(row)
        if (col === firstColumn) return label
        if (typeof rawTotalsValue === 'string' && /totals?/i.test(rawTotalsValue)) return ''
      }
      // attempt to read raw value
      const readRaw = (r, c) => {
        if (!r) return undefined
        if (c.includes('.')) {
          const parts = c.split('.')
          let cur = r
          for (const p of parts) {
            if (cur == null) return undefined
            cur = cur[p]
          }
          return cur
        }
        return r[c]
      }

      const raw = readRaw(row, col)

      const pathSegments = String(col).toLowerCase().split('.')
      const lastSegment = pathSegments[pathSegments.length - 1]
      const lowerCol = String(col).toLowerCase()
      const isContractorField = pathSegments.includes('contractor')
      const isDriverField = pathSegments.some(s => s.includes('driver'))
      const isIsRentalField = lowerCol.includes('isrental') || lowerCol.includes('is_rental') || lowerCol.includes('is-rental')

      // If contractor/driver is not set, show a dash
      if (raw == null) {
        if (isContractorField || isDriverField) return '-'
        return ''
      }

      // If this column refers to an isRental boolean, show translated Yes/No
      if (isIsRentalField) {
        if (raw == null) return '-'
        const truthy = (raw === true || raw === 1 || raw === '1' || String(raw).toLowerCase() === 'true' || String(raw).toLowerCase() === 'yes' || String(raw).toLowerCase() === 'y')
        return t(truthy ? 'labels.yes' : 'labels.no')
      }

      // If this column refers to a contractor, prefer showing the contractor's name
      if (isContractorField) {
        if (typeof raw === 'object' && raw !== null) {
          const candidate = raw.name || raw.label || raw.title || raw.displayName || raw.fullName
          if (candidate) return candidate
        }
        // Fallback: if the row contains a nested contractor object, use its name
        if ((typeof raw === 'string' || typeof raw === 'number') && row && row.contractor && typeof row.contractor === 'object') {
          const candidate2 = row.contractor.name || row.contractor.label || row.contractor.title
          if (candidate2) return candidate2
        }
        // Fallback to raw primitive value if present
        if (typeof raw === 'string' || typeof raw === 'number') return String(raw)
      }

      // If this column refers to a driver, prefer showing the driver's name
      if (isDriverField) {
        if (typeof raw === 'object' && raw !== null) {
          const candidate = raw.name || raw.label || raw.title || raw.displayName || raw.fullName
          if (candidate) return candidate
        }
        if ((typeof raw === 'string' || typeof raw === 'number') && row && row.driver && typeof row.driver === 'object') {
          const candidate2 = row.driver.name || row.driver.label || row.driver.title
          if (candidate2) return candidate2
        }
        if (typeof raw === 'string' || typeof raw === 'number') return String(raw)
      }

      // format dates (ISO-like)
      if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(raw)) {
        const keepTime = /datetime|timestamp|time|at/.test(lastSegment)
        const iso = parseIsoUtcString(raw)
        if (iso) {
          const D = String(iso.D).padStart(2, '0')
          const M = String(iso.M).padStart(2, '0')
          const Y = iso.Y
          return keepTime ? `${D}/${M}/${Y}` : `${D}/${M}/${Y}`
        }
        // fallback: return the raw string if not a strict UTC ISO
        return raw
      }

      if (typeof raw === 'object') return JSON.stringify(raw)
      return String(raw)
    }

    const humanize = (key) => {
      if (!key) return ''
      const last = String(key).split('.').pop()
      const withSpaces = last
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_.-]+/g, ' ')
      return withSpaces.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
    }

    const getHeaderLabel = (col) => {
      if (!col) return ''
      const keyFull = `reports.columns.${String(col).replace(/\./g, '_')}`
      const translatedFull = t(keyFull)
      if (translatedFull && translatedFull !== keyFull) return translatedFull

      const lowerCol = String(col).toLowerCase()

      // If the column path includes 'driver' or 'contractor', prefer contextual header.
      if (lowerCol.includes('driver')) {
        const translatedDriverName = t(`reports.columns.${String(col).replace(/\./g, '_')}`)
        if (translatedDriverName && translatedDriverName !== `reports.columns.${String(col).replace(/\./g, '_')}`) return translatedDriverName
        const translatedDriver = t('reports.columns.driver')
        if (translatedDriver && translatedDriver !== 'reports.columns.driver') return translatedDriver
        return humanize('driver')
      }
      if (lowerCol.includes('contractor')) {
        const translatedContractorName = t(`reports.columns.${String(col).replace(/\./g, '_')}`)
        if (translatedContractorName && translatedContractorName !== `reports.columns.${String(col).replace(/\./g, '_')}`) return translatedContractorName
        const translatedContractor = t('reports.columns.contractor')
        if (translatedContractor && translatedContractor !== 'reports.columns.contractor') return translatedContractor
        return humanize('contractor')
      }

      const last = String(col).split('.').pop()
      const keyLast = `reports.columns.${last}`
      const translatedLast = t(keyLast)
      if (translatedLast && translatedLast !== keyLast) return translatedLast

      return humanize(col)
    }

    const load = async () => {
      try {
        const res = await getReportDef(props.reportId)
        // normalize payload shape: some backends wrap object under `data`
        const payload = res?.data?.data ?? res?.data ?? null
        report.value = payload

        // normalize params: backend may store as JSON string
        if (report.value) {
          if (report.value.params && typeof report.value.params === 'string') {
            try { report.value.params = JSON.parse(report.value.params) } catch (e) { report.value.params = [] }
          }
          if (!Array.isArray(report.value.params)) report.value.params = []
          report.value.importantColumns = normalizeImportantColumns(report.value)

          ;(report.value.params || []).forEach(p => {
            if (p.type === 'MULTISELECT') values.value[p.name] = p.default || []
            else values.value[p.name] = p.default ?? null
            if (p.type === 'DROPDOWN' || p.type === 'MULTISELECT') loadOptions(p.name)
          })
        }
      } catch (err) {
        console.error('Failed to load report', err)
      }
    }

    function buildExecutePayload() {
      const params = {}
      ;(report.value?.params || []).forEach(p => {
        const val = values.value[p.name]
        if (p.type === 'DROPDOWN') params[p.name] = val ? (val.id ?? val.value ?? val) : null
        else if (p.type === 'MULTISELECT') params[p.name] = Array.isArray(val) ? val.map(it => it && (it.id ?? it.value ?? it)) : []
        else if (p.type === 'NUMBER') params[p.name] = val !== null && val !== undefined && val !== '' ? Number(val) : null
        else if (p.type === 'BOOLEAN') params[p.name] = Boolean(val)
        else params[p.name] = val
      })
      return { params }
    }

    async function downloadReport(format) {
      exportError.value = ''
      exportingFormat.value = format
      try {
        const res = await executeReport(props.reportId, buildExecutePayload(), {
          format,
          responseType: 'blob'
        })
        const fallbackName = `dynamic-report-${props.reportId}.${format}`
        const filename = getFilenameFromHeaders(res.headers, fallbackName) || fallbackName
        const mimeType = res.headers?.['content-type'] || res.headers?.['Content-Type'] || 'application/octet-stream'
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
        // Build query params object including dependencies (e.g., contractorId for vehicleId)
        const queryObj = {}
        if (q) queryObj.q = q
        
        const deps = paramDependencies.value[paramName] || []
        deps.forEach(depName => {
          const depValue = values.value[depName]
          if (depValue) {
            const depId = depValue.id ?? depValue.value ?? depValue
            queryObj[depName] = depId
          }
        })

        const res = await getReportParamOptions(props.reportId, paramName, queryObj)
        const items = Array.isArray(res.data || res) ? (res.data || res).map((it, idx) => ({ id: it.id ?? it.value ?? it.key ?? idx, label: it.label ?? it.name ?? String(it) })) : []
        paramOptions.value[paramName] = items
      } catch (err) {
        console.error('Failed to load options for', paramName, err)
        paramOptions.value[paramName] = []
      } finally { paramLoading.value[paramName] = false }
    }

    function onOptionSearch(paramName, q) {
      selectedLabels.value[paramName] = q
      loadOptions(paramName, q)
    }

    function onSelectOptionGeneric(p, item) {
      if (!p) return
      if (p.type === 'MULTISELECT') {
        if (!Array.isArray(values.value[p.name])) values.value[p.name] = []
        const exists = values.value[p.name].some(x => x.id === item.id)
        if (!exists) values.value[p.name].push(item)
      } else {
        values.value[p.name] = item
      }

      // Handle cascading: if this parameter is a dependency for others, reload those
      Object.keys(paramDependencies.value).forEach(depParamName => {
        const deps = paramDependencies.value[depParamName]
        if (deps && Array.isArray(deps) && deps.includes(p.name)) {
          // Clear the dependent field value
          values.value[depParamName] = null
          selectedLabels.value[depParamName] = ''
          // Reload options for the dependent field with the new context
          loadOptions(depParamName)
        }
      })
    }

    function clear() {
      result.value = null
      exportError.value = ''
      values.value = {}
      ;(report.value?.params || []).forEach(p => {
        values.value[p.name] = p.type === 'MULTISELECT' ? [] : (p.default ?? null)
      })
    }

    async function execute() {
      try {
        executing.value = true
        exportError.value = ''
        const res = await executeReport(props.reportId, buildExecutePayload())
        result.value = res.data
      } catch (err) {
        console.error('Execute failed', err)
        result.value = err?.response?.data || { error: String(err) }
      } finally { executing.value = false }
    }

    const downloadCsv = () => downloadReport('csv')
    const downloadXlsx = () => downloadReport('xlsx')
    const downloadPdf = () => downloadReport('pdf')

    watch(() => props.reportId, load, { immediate: true })

    return { report, values, execute, result, executing, exportingFormat, exportError, paramOptions, paramDependencies, selectedLabels, onOptionSearch, onSelectOptionGeneric, clear, columns, effectiveImportantColumns, isTotalsRow, locale, tableData, getValue, getHeaderLabel, downloadCsv, downloadXlsx, downloadPdf }
  }
}
</script>
