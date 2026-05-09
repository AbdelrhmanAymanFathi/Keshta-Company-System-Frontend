<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">{{ isEdit ? $t('admin.editReport') : $t('admin.createReport') }}</h2>

    <div class="bg-white rounded shadow p-4 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-sm font-medium">{{ $t('reports.selectTable') || 'Table' }}</label>
          <select v-model="selectedTable" @change="onTableChange" class="w-full border rounded px-2 py-1">
            <option value="">-- {{ $t('placeholders.select') }} --</option>
            <option v-for="t in tables" :key="t.tableName" :value="t.tableName">{{ t.label || t.tableName }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium">{{ $t('reports.columnModule') }}</label>
          <select v-model="form.module" class="w-full border rounded px-2 py-1">
            <option value="">-- {{ $t('placeholders.select') }} --</option>
            <option v-for="m in modules" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium">{{ $t('reports.columnKey') }}</label>
          <input v-model="form.key" class="w-full border rounded px-2 py-1" />
          <div v-if="errors.key" class="text-xs text-red-600 mt-1">{{ errors.key }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div>
            <label class="block text-sm font-medium">{{ $t('reports.columnTitle') }}</label>
            <input v-model="form.title" class="w-full border rounded px-2 py-1" />
          </div>
            <div>
              <label class="block text-sm font-medium">{{ $t('reports.columnArTitle') || 'Arabic Title' }}</label>
              <input v-model="form.arTitle" class="w-full border rounded px-2 py-1" />
            </div>
        </div>

        <div class="mt-3">
          <label class="block text-sm font-medium">{{ $t('reports.description') || 'Description' }}</label>
          <textarea v-model="form.description" rows="3" class="w-full border rounded px-2 py-1"></textarea>
        </div>
      <div class="flex items-end justify-end mt-3">
            <button @click="generate" class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500" :disabled="busy">
              {{ isEdit ? $t('common.update') : $t('common.generate') || 'Generate' }}
            </button>
          </div>
    </div>

      <div v-if="params.length" class="bg-white rounded shadow p-4 mb-4 overflow-hidden">
        <div class="flex justify-between items-center mb-2">
          <div class="text-sm text-gray-600">{{ $t('reports.fieldSelectorHelp') || 'Choose output fields and filter fields independently.' }}</div>
          <div class="flex gap-2">
            <button @click="selectAllOutput" class="px-2 py-1 border rounded">{{ $t('labels.selectAll') || 'Select Output' }}</button>
            <button @click="clearAllOutput" class="px-2 py-1 border rounded">{{ $t('labels.clear') || 'Clear Output' }}</button>
          </div>
        </div>
      <div v-if="errors.params" class="text-xs text-red-600 mb-2">{{ errors.params }}</div>

      <ul class="divide-y divide-gray-100">
        <li v-for="(f, idx) in params" :key="f.name" draggable @dragstart="onDragStart($event, idx)" @dragover.prevent="onDragOver($event)" @drop="onDrop($event, idx)" class="p-3 border-b flex flex-col lg:flex-row lg:items-start gap-3 overflow-visible">
          <div class="flex flex-wrap items-center gap-3 w-full lg:w-64 shrink-0">
            <label class="flex items-center gap-1 text-sm">
              <input type="checkbox" v-model="f.selectIncluded" @change="onSelectChange(f)" />
              <span>{{ $t('reports.selectField') || 'Output' }}</span>
            </label>
            <label class="flex items-center gap-1 text-sm">
              <input type="checkbox" v-model="f.filterIncluded" @change="onFilterChange(f)" />
              <span>{{ $t('reports.filterField') || 'Filter' }}</span>
            </label>
            <div class="text-sm">
              <div class="font-medium">{{ displayLabel(f) }}</div>
              <div class="text-xs text-gray-500">{{ f.dataType }}</div>
            </div>
          </div>

          <div class="w-full min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 items-center">
            <input v-model="f.label" placeholder="English label" class="w-full border rounded px-2 py-1" />
            <input v-model="f.arName" :placeholder="$t('reports.arLabelPlaceholder') || 'Arabic label (يظهر عند اختيار العربية)'" class="w-full border rounded px-2 py-1" />
            <select v-model="f.paramType" @change="onParamTypeChange(f)" class="w-full border rounded px-2 py-1">
              <option v-for="t in paramTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <div class="flex flex-row lg:flex-col items-end gap-2 shrink-0">
            <button @click="moveUp(idx)" class="px-2 py-1 border rounded">↑</button>
            <button @click="moveDown(idx)" class="px-2 py-1 border rounded">↓</button>
          </div>
        </li>
      </ul>

      <div class="mt-4 rounded border border-amber-200 bg-amber-50 p-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="text-sm font-medium text-amber-900">{{ $t('reports.totalsLabel') || 'Totals' }}</div>
            <div class="text-xs text-amber-800">
              {{ $t('reports.importantColumnsHelp') || 'Choose numeric columns to sum in the executed report.' }}
            </div>
          </div>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="field in selectedTotalFields"
              :key="`total-chip-${field.name}`"
              class="rounded-full bg-amber-200 px-2 py-1 text-xs font-medium text-amber-900"
            >
              {{ displayLabel(field) }}
            </span>
            <span v-if="!selectedTotalFields.length" class="text-xs text-amber-800">
              {{ $t('reports.noImportantColumns') || 'No totals columns selected.' }}
            </span>
          </div>
        </div>
        <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <label
            v-for="field in numericFields"
            :key="`total-toggle-${field.name}`"
            class="flex items-center gap-2 rounded bg-white px-3 py-2 text-sm border border-amber-100"
          >
            <input
              type="checkbox"
              :value="field.name"
              v-model="form.totals"
            />
            <span>{{ displayLabel(field) }}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="bg-white rounded shadow p-4">
      <h4 class="font-semibold mb-2">{{ $t('reports.preview') || 'Preview' }}</h4>
      <div class="mb-2">
        <label class="text-sm text-gray-600">{{ $t('reports.sqlPreview') || 'SQL Preview' }}</label>
        <pre class="text-xs bg-gray-100 p-2 rounded overflow-auto" style="direction:ltr; unicode-bidi:embed;">{{ sqlPreview }}</pre>
      </div>
      <div>
        <label class="text-sm text-gray-600">{{ $t('reports.paramsPreview') || 'Parameters' }}</label>
        <pre class="text-xs bg-gray-100 p-2 rounded overflow-auto">{{ paramsPreview }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getReportTables, getTableFields, getReportModules, createReportFromTable, updateReportFromTable, getReportDef } from '@/api'
import { normalizeReportTotals, normalizeReportFilterFields, normalizeReportSelectFields } from '@/utils/reportDefinitions'

export default {
  props: { reportId: { type: [String, Number], default: null } },
  setup(props) {
    const { locale, t } = useI18n()
    const tables = ref([])
    const modules = ref([])
    const selectedTable = ref('')
    const params = ref([])
    const busy = ref(false)
    const isEdit = computed(() => !!props.reportId)

    const form = ref({ key: '', title: '', arTitle: '', module: '', description: '', totals: [] })

    const paramTypes = ['TEXT','NUMBER','DATE','DROPDOWN','MULTISELECT','BOOLEAN']

    async function loadTables() {
      try {
        const res = await getReportTables()
        // normalize possible response shapes: array, { tables: [...] }, { data: [...] }
        const raw = res && res.data !== undefined ? res.data : res
        let list = []
        if (Array.isArray(raw)) list = raw
        else if (Array.isArray(raw.tables)) list = raw.tables
        else if (Array.isArray(raw.data)) list = raw.data
        else if (Array.isArray(res?.data?.tables)) list = res.data.tables

        // map simple strings or objects to { tableName, label }
        tables.value = list.map((it) => {
          if (typeof it === 'string') return { tableName: it, label: it }
          return {
            tableName: it.tableName ?? it.name ?? it.key ?? it.table ?? '',
            label: it.label ?? it.tableName ?? it.name ?? String(it)
          }
        }).filter(x => x.tableName)
      } catch (err) { console.error('Failed to load tables', err) }
    }

    async function loadModules() {
      try {
        const res = await getReportModules()
        modules.value = Array.isArray(res.data) ? res.data : (res.data?.modules || [])
      } catch (err) { console.error('Failed to load modules', err) }
    }

    const dragIndex = ref(-1)
    async function onTableChange() {
      if (!selectedTable.value) { params.value = []; return }
      try {
        const res = await getTableFields(selectedTable.value)
        const list = Array.isArray(res.data) ? res.data : (res.data?.fields || [])
        params.value = list.map((c, idx) => ({
          name: c.name,
          dataType: c.dataType || c.type || '',
          selectIncluded: false,
          filterIncluded: false,
          label: c.label || c.name,
          arName: c.arName || '',
          paramType: c.suggestedParamType || c.paramType || (c.dataType && String(c.dataType).toLowerCase().includes('date') ? 'DATE' : 'TEXT'),
          summarizable: c.summarizable === true,
          _pos: idx+1
        }))
      } catch (err) { console.error('Failed to load fields', err) }
    }

    async function loadExistingReport() {
      if (!props.reportId) return
      try {
        const res = await getReportDef(props.reportId)
        const payload = res?.data?.data ?? res?.data ?? res
        if (!payload) return
        form.value.key = payload.key || form.value.key
        form.value.title = payload.title || form.value.title
        form.value.arTitle = payload.arTitle || form.value.arTitle
        form.value.description = payload.description || form.value.description
        form.value.module = payload.module || form.value.module
        form.value.totals = normalizeReportTotals(payload)
        const srcTable = payload.sourceTable || payload.tableName || payload.table || selectedTable.value
        selectedTable.value = srcTable || selectedTable.value

        // ensure selected table appears in tables list
        if (selectedTable.value && !tables.value.find(x => x.tableName === selectedTable.value)) {
          tables.value.unshift({ tableName: selectedTable.value, label: selectedTable.value })
        }

        // persisted params may be under different keys or JSON strings
        const parseArrayLike = (value) => {
          if (Array.isArray(value)) return value
          if (typeof value === 'string') {
            try {
              const parsed = JSON.parse(value)
              return Array.isArray(parsed) ? parsed : []
            } catch (error) {
              return []
            }
          }
          return []
        }
        const persisted = parseArrayLike(payload.params).length
          ? parseArrayLike(payload.params)
          : (parseArrayLike(payload.fields).length
              ? parseArrayLike(payload.fields)
              : parseArrayLike(payload.reportParameter))
        const selectNameSet = new Set(normalizeReportSelectFields(payload).map((f) => String(f.name)))
        const filterNameSet = new Set(normalizeReportFilterFields(payload).map((f) => String(f.name)))
        // fetch actual table columns and merge persisted params with table fields so new columns appear
        if (selectedTable.value) {
          try {
            const tfRes = await getTableFields(selectedTable.value)
            const cols = Array.isArray(tfRes.data) ? tfRes.data : (tfRes.data?.fields || [])
            params.value = cols.map((c, idx) => {
              const match = persisted.find(p => String(p.name) === String(c.name))
              return {
                name: c.name,
                dataType: c.dataType || c.type || '',
                selectIncluded: selectNameSet.has(String(c.name)),
                filterIncluded: filterNameSet.has(String(c.name)),
                label: match?.label || c.label || c.name,
                arName: match?.arName || c.arName || '',
                paramType: match?.type || match?.paramType || c.suggestedParamType || (c.dataType && String(c.dataType).toLowerCase().includes('date') ? 'DATE' : 'TEXT'),
                summarizable: c.summarizable === true,
                _pos: (typeof match?.position === 'number' ? match.position : idx+1)
              }
            })
            // sort params by persisted position if available
            params.value.sort((a,b) => (a._pos || 0) - (b._pos || 0))
          } catch (e) {
            // fallback: construct params from persisted only
            if (persisted.length) {
              params.value = persisted.map((f, idx) => ({
                name: f.name,
                dataType: f.dataType || '',
                selectIncluded: selectNameSet.has(String(f.name)) || !selectNameSet.size,
                filterIncluded: filterNameSet.has(String(f.name)),
                label: f.label || f.name,
                arName: f.arName || '',
                paramType: f.type || f.paramType || 'TEXT',
                summarizable: f.summarizable === true,
                _pos: idx+1
              }))
            }
          }
        } else {
          // no table known - fallback to persisted
          if (persisted.length) {
              params.value = persisted.map((f, idx) => ({
                name: f.name,
                dataType: f.dataType || '',
                selectIncluded: selectNameSet.has(String(f.name)) || !selectNameSet.size,
                filterIncluded: filterNameSet.has(String(f.name)),
                label: f.label || f.name,
                arName: f.arName || '',
                paramType: f.type || f.paramType || 'TEXT',
                summarizable: f.summarizable === true,
                _pos: idx+1
            }))
          }
        }
      } catch (err) {
        console.error('Failed to load report for edit', err)
      }
    }

    function selectAllOutput() { params.value.forEach(f => { f.selectIncluded = true }) }
    function clearAllOutput() { params.value.forEach(f => { f.selectIncluded = false }) }
    function onSelectChange() {}
    function onFilterChange() {}
    function onParamTypeChange(field) {
      if (!isNumericField(field)) {
        form.value.totals = (form.value.totals || []).filter(name => name !== field?.name)
      }
    }

    function onDragStart(e, i) {
      dragIndex.value = i
      e.dataTransfer.effectAllowed = 'move'
    }
    function onDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
    function onDrop(e, i) {
      e.preventDefault()
      const from = dragIndex.value
      const to = i
      if (from === -1 || from === to) return
      const arr = params.value
      const item = arr.splice(from,1)[0]
      arr.splice(to,0,item)
      dragIndex.value = -1
    }

    function displayLabel(f) {
      if (locale.value === 'ar') return f.arName || f.label
      return f.label
    }

    function moveUp(i) {
      if (i <= 0) return
      const arr = params.value
      const it = arr.splice(i,1)[0]
      arr.splice(i-1,0,it)
    }
    function moveDown(i) {
      const arr = params.value
      if (i >= arr.length-1) return
      const it = arr.splice(i,1)[0]
      arr.splice(i+1,0,it)
    }

    const selectedFields = computed(() => params.value.filter(f => f.selectIncluded))
    const filterFields = computed(() => params.value.filter(f => f.filterIncluded))
    const numericFields = computed(() => params.value.filter(f => isNumericField(f)))
    const selectedTotalFields = computed(() =>
      numericFields.value.filter(f => (form.value.totals || []).includes(f.name))
    )
    const totalsColumns = computed(() => (form.value.totals || []).filter(Boolean))

    function isNumericField(field) {
      const type = String(field?.paramType || '').toUpperCase()
      const dataType = String(field?.dataType || '').toLowerCase()
      return type === 'NUMBER' || /int|decimal|numeric|number|float|double|money|currency/.test(dataType) || field?.summarizable === true
    }

    const sqlPreview = computed(() => {
      if (!selectedTable.value) return ''
      const cols = selectedFields.value.map(f => `"${f.name}"`).join(', ') || '*'
      const dateFieldCount = filterFields.value.filter(f => f.paramType === 'DATE').length
      const useRangeForSingleDateField = dateFieldCount === 1
      const where = filterFields.value.map(f => {
        if (f.paramType === 'DATE') {
          if (useRangeForSingleDateField) return `("${f.name}" BETWEEN :${f.name}_from AND :${f.name}_to)`
          return `("${f.name}" = :${f.name})`
        }
        if (f.paramType === 'DROPDOWN' || f.paramType === 'MULTISELECT') return `("${f.name}" IN (:${f.name}))`
        if (f.paramType === 'NUMBER') return `("${f.name}" = :${f.name})`
        return `("${f.name}" LIKE :${f.name})`
      }).join(' AND ')
      return `SELECT ${cols} FROM "${selectedTable.value}"${where ? ' WHERE ' + where : ''}`
    })

    const paramsPreview = computed(() => JSON.stringify({
      selectFields: selectedFields.value.map(f => ({ name: f.name, type: f.paramType, label: f.label, arName: f.arName })),
      filterFields: filterFields.value.map(f => ({ name: f.name, type: f.paramType, label: f.label, arName: f.arName })),
      totals: totalsColumns.value.slice()
    }, null, 2))
    const totalsPreview = computed(() => totalsColumns.value.slice())

    const errors = ref({ key: '', title: '', params: '' })
    function validate() {
      errors.value.key = ''
      errors.value.title = ''
      errors.value.params = ''
      if (!form.value.key) errors.value.key = t('reports.errorKeyRequired') || 'Key is required'
      if (!form.value.title) errors.value.title = t('reports.errorTitleRequired') || 'Title is required'
      if (!selectedFields.value.length) errors.value.params = t('reports.errorAtLeastOne') || 'Select at least one output field'
      // param label length
      for (const f of selectedFields.value) {
        if (f.label && f.label.length > 100) { errors.value.params = t('reports.errorLabelTooLong') || 'Label too long'; break }
        if (f.arName && f.arName.length > 100) { errors.value.params = t('reports.errorArLabelTooLong') || 'Arabic label too long'; break }
      }
      return !(errors.value.key || errors.value.title || errors.value.params)
    }

    async function generate() {
      if (!validate()) {
        if (window.$toast) window.$toast(errors.value.key || errors.value.title || errors.value.params, 'warning', 5000)
        return
      }
        const payload = {
        key: form.value.key,
        title: form.value.title,
        arTitle: form.value.arTitle,
        description: form.value.description,
        module: form.value.module,
        tableName: selectedTable.value,
        selectFields: selectedFields.value.map(f => ({
          name: f.name,
          paramType: f.paramType,
          label: f.label,
          arName: f.arName
        })),
        filterFields: filterFields.value.map(f => ({
          name: f.name,
          paramType: f.paramType,
          label: f.label,
          arName: f.arName
        })),
        totals: totalsColumns.value,
      }
      busy.value = true
      try {
        if (isEdit.value) {
          await updateReportFromTable(props.reportId, payload)
          if (window.$toast) window.$toast(t('reports.updateSuccess') || 'Report updated', 'success')
          // Reload the report to show the updated version
          await loadExistingReport()
        } else {
          await createReportFromTable(payload)
          if (window.$toast) window.$toast(t('reports.createSuccess') || 'Report created', 'success')
        }
      } catch (err) {
        console.error('Generate failed', err)
        const msg = err?.response?.data?.message || err.message || 'Failed'
        if (window.$toast) window.$toast(msg, 'error', 7000)
      } finally { busy.value = false }
    }

    onMounted(() => { loadTables(); loadModules(); loadExistingReport() })

    return { tables, modules, selectedTable, params, form, paramTypes, onTableChange, selectAllOutput, clearAllOutput, moveUp, moveDown, displayLabel, sqlPreview, paramsPreview, totalsPreview, generate, busy, isEdit, t, locale, errors, selectedTotalFields, numericFields, onSelectChange, onFilterChange, onParamTypeChange, onDragStart, onDragOver, onDrop, selectedFields, filterFields }
  }
}
</script>

<style scoped>
.drag-handle { cursor: grab }
</style>
