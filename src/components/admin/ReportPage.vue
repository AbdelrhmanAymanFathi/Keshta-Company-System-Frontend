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
        <button @click="downloadXlsx" :disabled="!(tableData && tableData.length)" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition disabled:opacity-50">{{ $t('reports.downloadExcel') || 'Download Excel' }}</button>
      </div>
    </div>

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
            <input type="date" v-model="values[p.name]" class="w-full border rounded px-3 py-2" />
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
              <tr v-for="(row, idx) in tableData" :key="idx">
                <td v-for="col in columns" :key="col" class="px-4 py-2 text-sm text-gray-700">
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
import * as XLSX from 'xlsx'

export default {
  components: { SearchDropdown },
  props: { reportId: { type: [String, Number], required: true } },
  setup(props) {
    const { locale, t } = useI18n()
    const report = ref(null)
    const values = ref({})
    const result = ref(null)
    const executing = ref(false)

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

    const columns = computed(() => {
      const table = (() => {
        if (Array.isArray(result.value) && result.value.length) return result.value
        if (result.value && Array.isArray(result.value.rows) && result.value.rows.length) return result.value.rows
        if (result.value && Array.isArray(result.value.data) && result.value.data.length) return result.value.data
        return []
      })()
      if (!table || !table.length) return []
      const first = table[0]
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
      if (Array.isArray(result.value) && result.value.length) return result.value
      if (result.value && Array.isArray(result.value.rows) && result.value.rows.length) return result.value.rows
      if (result.value && Array.isArray(result.value.data) && result.value.data.length) return result.value.data
      return []
    })

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

    const formatDateYMD = (d) => {
      if (!(d instanceof Date)) d = new Date(d)
      if (isNaN(d.getTime())) return ''
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}/${m}/${day}`
    }

    const formatDateTimeYMDHMS = (d) => {
      if (!(d instanceof Date)) d = new Date(d)
      if (isNaN(d.getTime())) return ''
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}/${m}/${day}`
    }

    const parseIsoUtcString = (s) => {
      // Match strict UTC ISO like 2026-02-02T00:00:00.000Z or without milliseconds
      const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?Z$/.exec(s)
      if (!m) return null
      const [, Y, M, D] = m
      return { Y, M, D}
    }

    const getValue = (row, col) => {
      if (!row) return ''
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
      if (raw == null) return ''

      // format dates (ISO-like)
      if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(raw)) {
        const last = String(col).split('.').pop().toLowerCase()
        const keepTime = /datetime|timestamp|time|at/.test(last)
        const iso = parseIsoUtcString(raw)
        if (iso) {
          return keepTime ? `${iso.Y}/${iso.M}/${iso.D}` : `${iso.Y}/${iso.M}/${iso.D}`
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
        .replace(/[_\.\-]+/g, ' ')
      return withSpaces.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
    }

    const getHeaderLabel = (col) => {
      if (!col) return ''
      const keyFull = `reports.columns.${String(col).replace(/\./g, '_')}`
      const translatedFull = t(keyFull)
      if (translatedFull && translatedFull !== keyFull) return translatedFull

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

    function downloadExcel() {
      try {
        const rows = tableData.value || []
        if (!rows.length) return
        const cols = columns.value || []

        const csvRows = []
        // header row: use translated header labels where possible
        csvRows.push(cols.map(c => '"' + String(getHeaderLabel(c)).replace(/"/g, '""') + '"').join(','))

        rows.forEach(r => {
          const vals = cols.map(c => {
            const raw = getRawValue(r, c)
            let v
            if (raw === null || raw === undefined) v = ''
            else if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(raw)) {
              const last = String(c).split('.').pop().toLowerCase()
              const keepTime = /datetime|timestamp|time|at/.test(last)
              const iso = parseIsoUtcString(raw)
              if (iso) {
                v = keepTime ? `${iso.Y}/${iso.M}/${iso.D}` : `${iso.Y}/${iso.M}/${iso.D}`
              } else {
                v = raw
              }
            } else if (typeof raw === 'object') v = JSON.stringify(raw)
            else v = String(raw)

            v = v.replace(/"/g, '""')
            return '"' + v + '"'
          })
          csvRows.push(vals.join(','))
        })

        const csvString = csvRows.join('\r\n')
        // add BOM so Excel opens UTF-8 CSV correctly
        const blob = new Blob(["\uFEFF", csvString], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const title = report.value && (locale.value === 'ar' ? (report.value.arTitle || report.value.title) : report.value.title) || 'report'
        // keep unicode letters/numbers; replace spaces with underscores
        const safe = String(title).replace(/[^^\p{L}\p{N}\- _\.]/gu, '').replace(/\s+/g, '_') || 'report'
        const dateStr = new Date().toISOString().slice(0, 10)
        a.download = `${safe}_${dateStr}.csv`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error('Download failed', err)
      }
    }

    function downloadXlsx() {
      try {
        const rows = tableData.value || []
        if (!rows.length) return
        const cols = columns.value || []

        const data = []
        const header = cols.map(c => String(getHeaderLabel(c)))
        data.push(header)

        rows.forEach(r => {
          const row = cols.map(c => {
            const raw = getRawValue(r, c)
            if (raw === null || raw === undefined) return ''
            if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(raw)) {
              const last = String(c).split('.').pop().toLowerCase()
              const keepTime = /datetime|timestamp|time|at/.test(last)
              const iso = parseIsoUtcString(raw)
              if (iso) return keepTime ? `${iso.Y}/${iso.M}/${iso.D}` : `${iso.Y}/${iso.M}/${iso.D}`
              return raw
            }
            if (typeof raw === 'object') return JSON.stringify(raw)
            return raw
          })
          data.push(row)
        })

        const ws = XLSX.utils.aoa_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Report')
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        const blob = new Blob([wbout], { type: 'application/octet-stream' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const title = report.value && (locale.value === 'ar' ? (report.value.arTitle || report.value.title) : report.value.title) || 'report'
        // keep unicode letters/numbers; replace spaces with underscores
        const safe = String(title).replace(/[^^\p{L}\p{N}\- _\.]/gu, '').replace(/\s+/g, '_') || 'report'
        const dateStr = new Date().toISOString().slice(0, 10)
        a.download = `${safe}_${dateStr}.xlsx`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error('XLSX download failed', err)
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
      values.value = {}
    }

    async function execute() {
      try {
        executing.value = true
        const params = {}
        ;(report.value.params || []).forEach(p => {
          const val = values.value[p.name]
          if (p.type === 'DROPDOWN') params[p.name] = val ? (val.id ?? val.value ?? val) : null
          else if (p.type === 'MULTISELECT') params[p.name] = Array.isArray(val) ? val.map(it => it && (it.id ?? it.value ?? it)) : []
          else if (p.type === 'NUMBER') params[p.name] = val !== null && val !== undefined && val !== '' ? Number(val) : null
          else if (p.type === 'BOOLEAN') params[p.name] = Boolean(val)
          else params[p.name] = val
        })
        const res = await executeReport(props.reportId, { params })
        result.value = res.data
      } catch (err) {
        console.error('Execute failed', err)
        result.value = err?.response?.data || { error: String(err) }
      } finally { executing.value = false }
    }

    watch(() => props.reportId, load, { immediate: true })

    return { report, values, execute, result, executing, paramOptions, paramDependencies, selectedLabels, onOptionSearch, onSelectOptionGeneric, clear, columns, locale, tableData, getValue, getHeaderLabel, downloadExcel, downloadXlsx }
  }
}
</script>
