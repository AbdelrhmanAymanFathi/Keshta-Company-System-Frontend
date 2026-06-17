<template>
  <div class="report-builder-page space-y-6">
    <section class="app-page-header report-builder-hero rounded-2xl theme-page-header-bar p-5 shadow-lg shadow-slate-200/50">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div class="min-w-0 flex-1 space-y-3">
          <div class="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-semibold theme-accent-strong backdrop-blur-sm">
            <span class="report-builder-dot" />
            <span>{{ isEdit ? $t('admin.editReport') : $t('admin.createReport') }}</span>
          </div>
          <div>
            <h2 class="text-2xl font-bold tracking-tight theme-text-primary sm:text-3xl">
              {{ isEdit ? $t('admin.editReport') : $t('admin.createReport') }}
            </h2>
            <p class="mt-2 max-w-3xl text-sm leading-relaxed theme-text-secondary">
              {{ $t('reports.fieldSelectorHelp') || 'Choose output fields and filter fields independently.' }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="report-stat-card">
            <span class="report-stat-label">{{ $t('reports.selectField') || 'Output' }}</span>
            <span class="report-stat-value">{{ selectedFields.length }}</span>
          </div>
          <div class="report-stat-card">
            <span class="report-stat-label">{{ $t('reports.filterField') || 'Filter' }}</span>
            <span class="report-stat-value">{{ filterFields.length }}</span>
          </div>
          <div class="report-stat-card">
            <span class="report-stat-label">{{ $t('reports.totalsLabel') || 'Totals' }}</span>
            <span class="report-stat-value">{{ selectedTotalFields.length }}</span>
          </div>
          <div class="report-stat-card">
            <span class="report-stat-label">{{ $t('labels.fields') || 'Fields' }}</span>
            <span class="report-stat-value">{{ params.length }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-lg shadow-slate-200/40 backdrop-blur-sm sm:p-6">
      <div class="mb-5 flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 class="text-base font-semibold theme-text-primary">{{ $t('reports.description') || 'Report details' }}</h3>
          <p class="text-xs theme-text-muted">{{ isEdit ? ($t('reports.updateSuccess') || 'Update report details and builder fields.') : ($t('reports.createSuccess') || 'Define the report identity before choosing fields.') }}</p>
        </div>
        <button @click="generate" class="rounded-xl theme-button px-5 py-2.5 text-sm font-semibold theme-text-light shadow-sm disabled:cursor-not-allowed disabled:opacity-60" :disabled="busy">
          {{ busy ? ($t('labels.loading') || 'Loading...') : (isEdit ? $t('common.update') : $t('common.generate') || 'Generate') }}
        </button>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="space-y-1.5">
          <label class="block text-sm font-medium theme-text-primary">{{ $t('reports.selectTable') || 'Table' }}</label>
          <select v-model="selectedTable" @change="onTableChange" class="report-input">
            <option value="">-- {{ $t('placeholders.select') }} --</option>
            <option v-for="t in tables" :key="t.tableName" :value="t.tableName">{{ t.label || t.tableName }}</option>
          </select>
        </div>

        <div class="space-y-1.5">
          <label class="block text-sm font-medium theme-text-primary">{{ $t('reports.columnModule') }}</label>
          <select v-model="form.module" class="report-input">
            <option value="">-- {{ $t('placeholders.select') }} --</option>
            <option v-for="m in modules" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>

        <div class="space-y-1.5">
          <label class="block text-sm font-medium theme-text-primary">{{ $t('reports.columnKey') }}</label>
          <input v-model="form.key" class="report-input" />
          <div v-if="errors.key" class="text-xs text-red-600">{{ errors.key }}</div>
        </div>

        <div class="space-y-1.5 lg:col-span-1">
          <label class="block text-sm font-medium theme-text-primary">{{ $t('reports.columnTitle') }}</label>
          <input v-model="form.title" class="report-input" />
          <div v-if="errors.title" class="text-xs text-red-600">{{ errors.title }}</div>
        </div>

        <div class="space-y-1.5 lg:col-span-1">
          <label class="block text-sm font-medium theme-text-primary">{{ $t('reports.columnArTitle') || 'Arabic Title' }}</label>
          <input v-model="form.arTitle" class="report-input" />
        </div>

        <div class="space-y-1.5 lg:col-span-1">
          <label class="block text-sm font-medium theme-text-primary">{{ $t('reports.description') || 'Description' }}</label>
          <textarea v-model="form.description" rows="3" class="report-input resize-none"></textarea>
        </div>
      </div>
    </section>

    <section v-if="params.length" class="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-lg shadow-slate-200/40 backdrop-blur-sm sm:p-6">
      <div class="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <h3 class="text-base font-semibold theme-text-primary">{{ $t('reports.preview') || 'Field builder' }}</h3>
          <p class="text-xs theme-text-muted">{{ $t('reports.fieldSelectorHelp') || 'Choose output fields and filter fields independently.' }}</p>
          <div class="flex flex-wrap gap-2">
            <span class="report-info-chip">{{ params.length }} {{ $t('labels.fields') || 'Fields' }}</span>
            <span class="report-info-chip report-info-chip--accent">{{ selectedFields.length }} {{ $t('reports.selectField') || 'Output' }}</span>
            <span class="report-info-chip report-info-chip--soft">{{ filterFields.length }} {{ $t('reports.filterField') || 'Filter' }}</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <button @click="selectAllOutput" class="report-secondary-button">{{ $t('labels.selectAll') || 'Select Output' }}</button>
          <button @click="clearAllOutput" class="report-secondary-button">{{ $t('labels.clear') || 'Clear Output' }}</button>
        </div>
      </div>

      <div v-if="errors.params" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">{{ errors.params }}</div>

      <transition-group name="field-reorder" tag="ul" class="space-y-3">
        <li
          v-for="(f, idx) in params"
          :key="f.name"
          class="report-field-card"
          :class="{
            'report-field-card--dragging': draggedFieldName === f.name,
            'report-field-card--drop-target': dragOverIndex === idx && draggedFieldName !== f.name
          }"
          @dragover.prevent="onDragEnter(idx)"
          @drop.prevent="onDrop(idx, $event)"
          @dragleave="onDragLeave(idx)"
          @dragend="onDragEnd"
        >
          <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-5">
            <div class="flex min-w-0 flex-1 items-start gap-3 xl:max-w-[24rem]">
              <button
                type="button"
                class="report-drag-handle"
                draggable="true"
                :aria-label="$t('labels.drag') || 'Drag'"
                @dragstart.stop="onDragStart(idx, $event)"
                @dragend="onDragEnd"
              >
                <span>⋮⋮</span>
              </button>

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="truncate text-sm font-semibold theme-text-primary">{{ displayLabel(f) }}</p>
                  <span class="report-badge">{{ f.dataType }}</span>
                  <span v-if="isNumericField(f)" class="report-badge report-badge--warm">{{ $t('reports.totalsLabel') || 'Totals' }}</span>
                </div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <label class="report-toggle-chip">
                    <input type="checkbox" v-model="f.selectIncluded" @change="onSelectChange(f)" />
                    <span>{{ $t('reports.selectField') || 'Output' }}</span>
                  </label>
                  <label class="report-toggle-chip report-toggle-chip--soft">
                    <input type="checkbox" v-model="f.filterIncluded" @change="onFilterChange(f)" />
                    <span>{{ $t('reports.filterField') || 'Filter' }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="grid min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold uppercase tracking-wide theme-text-muted">EN</label>
                <input v-model="f.label" placeholder="English label" class="report-input" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold uppercase tracking-wide theme-text-muted">AR</label>
                <input v-model="f.arName" :placeholder="$t('reports.arLabelPlaceholder') || 'Arabic label (يظهر عند اختيار العربية)'" class="report-input" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold uppercase tracking-wide theme-text-muted">{{ $t('reports.columnType') || 'Type' }}</label>
                <select v-model="f.paramType" @change="onParamTypeChange(f)" class="report-input">
                  <option v-for="t in paramTypes" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
            </div>
          </div>
        </li>
      </transition-group>
    </section>

    <section class="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div class="rounded-2xl border border-amber-200/80 bg-amber-50/90 p-5 shadow-lg shadow-amber-100/40 backdrop-blur-sm">
        <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="text-base font-semibold text-amber-950">{{ $t('reports.totalsLabel') || 'Totals' }}</h3>
            <p class="text-xs text-amber-800">{{ $t('reports.importantColumnsHelp') || 'Choose numeric columns to sum in the executed report.' }}</p>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="field in selectedTotalFields"
              :key="`total-chip-${field.name}`"
              class="rounded-full bg-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-950"
            >
              {{ displayLabel(field) }}
            </span>
            <span v-if="!selectedTotalFields.length" class="text-xs text-amber-800">
              {{ $t('reports.noImportantColumns') || 'No totals columns selected.' }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <label
            v-for="field in numericFields"
            :key="`total-toggle-${field.name}`"
            class="flex items-center gap-2 rounded-xl border border-amber-100 bg-white px-3 py-2 text-sm text-amber-950 transition hover:border-amber-200 hover:bg-amber-50/60"
          >
            <input type="checkbox" :value="field.name" v-model="form.totals" />
            <span>{{ displayLabel(field) }}</span>
          </label>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-lg shadow-slate-200/40 backdrop-blur-sm">
        <button type="button" class="flex w-full items-center justify-between gap-3 text-start" @click="togglePreview">
          <div>
            <h4 class="text-base font-semibold theme-text-primary">{{ $t('reports.preview') || 'Preview' }}</h4>
            <p class="text-xs theme-text-muted">{{ previewOpen ? ($t('labels.hide') || 'Hide preview') : ($t('labels.show') || 'Show preview') }}</p>
          </div>
          <span class="report-preview-toggle" :class="{ 'report-preview-toggle--open': previewOpen }">⌄</span>
        </button>

        <transition name="preview-panel">
          <div v-if="previewOpen" class="mt-4 space-y-4">
            <div>
              <label class="text-sm theme-text-secondary">{{ $t('reports.sqlPreview') || 'SQL Preview' }}</label>
              <pre class="report-preview-box" style="direction:ltr; unicode-bidi:embed;">{{ sqlPreview }}</pre>
            </div>
            <div>
              <label class="text-sm theme-text-secondary">{{ $t('reports.paramsPreview') || 'Parameters' }}</label>
              <pre class="report-preview-box">{{ paramsPreview }}</pre>
            </div>
          </div>
        </transition>
      </div>
    </section>
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
    const dragOverIndex = ref(-1)
    const draggedFieldName = ref('')
    const previewOpen = ref(false)

    function normalizeVisibleFieldName(name) {
      const raw = String(name || '').trim()
      if (!raw) return ''
      switch (raw.toLowerCase()) {
        case 'site':
        case 'siteid':
          return 'location'
        case 'contractorid':
          return 'contractor'
        case 'areaid':
          return 'area'
        case 'treasuryid':
          return 'treasury'
        default:
          return raw
      }
    }

    function getFieldNameAliases(fieldLike) {
      const aliases = new Set()
      const visibleName = normalizeVisibleFieldName(fieldLike?.name)
      const filterFieldName = String(fieldLike?.filterFieldName || '').trim()
      if (visibleName) aliases.add(visibleName)
      if (filterFieldName) aliases.add(filterFieldName)
      if (visibleName === 'location') aliases.add('site')
      return Array.from(aliases).filter(Boolean)
    }

    function hasAnyFieldAlias(nameSet, fieldLike) {
      return getFieldNameAliases(fieldLike).some(name => nameSet.has(String(name)))
    }

    async function onTableChange() {
      if (!selectedTable.value) { params.value = []; return }
      try {
        const res = await getTableFields(selectedTable.value)
        const list = Array.isArray(res.data) ? res.data : (res.data?.fields || [])
        params.value = list.map((c, idx) => ({
          name: normalizeVisibleFieldName(c.name),
          dataType: c.dataType || c.type || '',
          selectIncluded: false,
          filterIncluded: false,
          label: c.label || normalizeVisibleFieldName(c.name),
          arName: c.arName || '',
          paramType: c.suggestedParamType || c.paramType || (c.dataType && String(c.dataType).toLowerCase().includes('date') ? 'DATE' : 'TEXT'),
          summarizable: c.summarizable === true,
          filterFieldName: c.filterFieldName || c.name,
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
        const persistedFieldOrder = Array.isArray(payload.fieldOrder) ? payload.fieldOrder.map(name => String(name)) : []
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
        const selectNameSet = new Set(normalizeReportSelectFields(payload).map((f) => normalizeVisibleFieldName(f.name)))
        const filterNameSet = new Set(
          normalizeReportFilterFields(payload)
            .flatMap((f) => getFieldNameAliases(f))
            .map((name) => String(name))
        )
        // fetch actual table columns and merge persisted params with table fields so new columns appear
        if (selectedTable.value) {
          try {
            const tfRes = await getTableFields(selectedTable.value)
            const cols = Array.isArray(tfRes.data) ? tfRes.data : (tfRes.data?.fields || [])
            const orderIndex = new Map(
              (persistedFieldOrder.length ? persistedFieldOrder : cols.map(c => normalizeVisibleFieldName(c.name))).map((name, idx) => [normalizeVisibleFieldName(name), idx + 1])
            )
            params.value = cols.map((c, idx) => {
              const visibleName = normalizeVisibleFieldName(c.name)
              const match = persisted.find(p =>
                normalizeVisibleFieldName(p.name) === visibleName ||
                String(p.name) === String(c.filterFieldName || '') ||
                (visibleName === 'location' && String(p.name) === 'site')
              )
              return {
                name: visibleName,
                dataType: c.dataType || c.type || '',
                selectIncluded: hasAnyFieldAlias(selectNameSet, { name: visibleName, filterFieldName: c.filterFieldName || c.name }),
                filterIncluded: hasAnyFieldAlias(filterNameSet, { name: visibleName, filterFieldName: c.filterFieldName || c.name }),
                label: match?.label || c.label || visibleName,
                arName: match?.arName || c.arName || '',
                paramType: match?.type || match?.paramType || c.suggestedParamType || (c.dataType && String(c.dataType).toLowerCase().includes('date') ? 'DATE' : 'TEXT'),
                summarizable: c.summarizable === true,
                filterFieldName: c.filterFieldName || c.name,
                _pos: orderIndex.get(visibleName) || (typeof match?.position === 'number' ? match.position : idx+1)
              }
            })
            // sort params by persisted position if available
            params.value.sort((a,b) => (a._pos || 0) - (b._pos || 0))
          } catch (e) {
            // fallback: construct params from persisted only
            if (persisted.length) {
              params.value = persisted.map((f, idx) => ({
                name: normalizeVisibleFieldName(f.name),
                dataType: f.dataType || '',
                selectIncluded: hasAnyFieldAlias(selectNameSet, f) || !selectNameSet.size,
                filterIncluded: hasAnyFieldAlias(filterNameSet, f),
                label: f.label || normalizeVisibleFieldName(f.name),
                arName: f.arName || '',
                paramType: f.type || f.paramType || 'TEXT',
                summarizable: f.summarizable === true,
                filterFieldName: f.filterFieldName || f.name,
                _pos: idx+1
              }))
            }
          }
        } else {
          // no table known - fallback to persisted
          if (persisted.length) {
              params.value = persisted.map((f, idx) => ({
                name: normalizeVisibleFieldName(f.name),
                dataType: f.dataType || '',
                selectIncluded: hasAnyFieldAlias(selectNameSet, f) || !selectNameSet.size,
                filterIncluded: hasAnyFieldAlias(filterNameSet, f),
                label: f.label || normalizeVisibleFieldName(f.name),
                arName: f.arName || '',
                paramType: f.type || f.paramType || 'TEXT',
                summarizable: f.summarizable === true,
                filterFieldName: f.filterFieldName || f.name,
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

    function onDragStart(i, e) {
      dragIndex.value = i
      dragOverIndex.value = i
      draggedFieldName.value = params.value[i]?.name || ''
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', String(i))
    }
    function onDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
    function onDragEnter(i) {
      dragOverIndex.value = i
    }
    function onDragLeave(i) {
      if (dragOverIndex.value === i) dragOverIndex.value = -1
    }
    function onDrop(i, e) {
      const from = dragIndex.value !== -1 ? dragIndex.value : Number(e.dataTransfer.getData('text/plain'))
      const to = i
      if (from === to || from == null || Number.isNaN(from)) return onDragEnd()
      const arr = params.value
      const item = arr.splice(from,1)[0]
      arr.splice(to,0,item)
      arr.forEach((entry, index) => { entry._pos = index + 1 })
      onDragEnd()
    }
    function onDragEnd() {
      dragIndex.value = -1
      dragOverIndex.value = -1
      draggedFieldName.value = ''
    }

    function displayLabel(f) {
      if (locale.value === 'ar') return f.arName || f.label
      return f.label
    }

    const selectedFields = computed(() => params.value.filter(f => f.selectIncluded))
    const filterFields = computed(() => params.value.filter(f => f.filterIncluded))
    const numericFields = computed(() => params.value.filter(f => isNumericField(f)))
    const selectedTotalFields = computed(() =>
      numericFields.value.filter(f => (form.value.totals || []).includes(f.name))
    )
    const totalsColumns = computed(() => (form.value.totals || []).filter(Boolean))
    const visibleFieldCount = computed(() => params.value.length)

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
      fieldOrder: params.value.map(f => f.name),
      selectFields: selectedFields.value.map(f => ({ name: f.name, type: f.paramType, label: f.label, arName: f.arName, position: f._pos })),
      filterFields: filterFields.value.map(f => ({ name: f.filterFieldName || f.name, type: f.paramType, label: f.label, arName: f.arName, position: f._pos })),
      totals: totalsColumns.value.slice()
    }, null, 2))
    const totalsPreview = computed(() => totalsColumns.value.slice())
    function togglePreview() { previewOpen.value = !previewOpen.value }

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
        fieldOrder: params.value.map(f => f.name),
        tableName: selectedTable.value,
        selectFields: selectedFields.value.map(f => ({
          name: f.name,
          paramType: f.paramType,
          label: f.label,
          arName: f.arName,
          position: f._pos
        })),
        filterFields: filterFields.value.map(f => ({
          name: f.filterFieldName || f.name,
          paramType: f.paramType,
          label: f.label,
          arName: f.arName,
          position: f._pos
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

    return { tables, modules, selectedTable, params, form, paramTypes, onTableChange, selectAllOutput, clearAllOutput, displayLabel, sqlPreview, paramsPreview, totalsPreview, generate, busy, isEdit, t, locale, errors, selectedTotalFields, numericFields, onSelectChange, onFilterChange, onParamTypeChange, onDragStart, onDragOver, onDragEnter, onDragLeave, onDrop, onDragEnd, selectedFields, filterFields, draggedFieldName, dragOverIndex, previewOpen, togglePreview, visibleFieldCount, isNumericField }
  }
}
</script>

<style scoped>
.report-builder-page {
  min-height: 100%;
}

.report-builder-hero {
  position: relative;
  overflow: hidden;
}

.report-builder-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top right, rgba(var(--theme-primary-rgb), 0.18), transparent 32%),
    linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0));
  pointer-events: none;
}

.report-builder-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: rgb(var(--theme-primary-rgb));
  box-shadow: 0 0 0 0.25rem rgba(var(--theme-primary-rgb), 0.14);
}

.report-stat-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-radius: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.8);
  background: rgba(255, 255, 255, 0.88);
  padding: 0.9rem 1rem;
  backdrop-filter: blur(8px);
}

.report-stat-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgb(100 116 139);
}

.report-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--theme-primary-rgb));
  line-height: 1;
}

.report-input {
  width: 100%;
  border-radius: 0.9rem;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(248, 250, 252, 0.9);
  padding: 0.7rem 0.9rem;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.report-input:focus {
  outline: none;
  border-color: rgba(var(--theme-primary-rgb), 0.45);
  box-shadow: 0 0 0 4px rgba(var(--theme-primary-rgb), 0.10);
  background: white;
}

.report-secondary-button {
  border-radius: 0.85rem;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: white;
  padding: 0.65rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgb(71 85 105);
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.report-secondary-button:hover {
  background: rgb(248 250 252);
  border-color: rgba(var(--theme-primary-rgb), 0.24);
  transform: translateY(-1px);
}

.report-info-chip,
.report-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 9999px;
  border: 1px solid rgba(226, 232, 240, 0.85);
  background: rgb(248 250 252);
  padding: 0.35rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: rgb(71 85 105);
}

.report-info-chip--accent {
  background: rgba(var(--theme-primary-rgb), 0.08);
  border-color: rgba(var(--theme-primary-rgb), 0.22);
  color: rgb(var(--theme-primary-rgb));
}

.report-info-chip--soft {
  background: rgb(241 245 249);
}

.report-badge--warm {
  background: rgb(255 247 237);
  border-color: rgb(253 186 116);
  color: rgb(194 65 12);
}

.report-field-card {
  border-radius: 1.25rem;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.92));
  padding: 1rem;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease,
    background-color 0.22s ease;
}

.report-field-card:hover {
  border-color: rgba(var(--theme-primary-rgb), 0.22);
  box-shadow: 0 12px 30px rgba(148, 163, 184, 0.14);
}

.report-field-card--dragging {
  transform: scale(1.015) rotate(0.15deg);
  border-color: rgba(var(--theme-primary-rgb), 0.42);
  box-shadow: 0 18px 44px rgba(var(--theme-primary-rgb), 0.18);
  background: white;
}

.report-field-card--drop-target {
  border-color: rgba(var(--theme-primary-rgb), 0.38);
  box-shadow: inset 0 0 0 2px rgba(var(--theme-primary-rgb), 0.14);
}

.report-drag-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: white;
  color: rgb(148 163 184);
  font-size: 1.1rem;
  line-height: 1;
  cursor: grab;
  transition: transform 0.2s ease, color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.report-drag-handle:hover {
  color: rgb(var(--theme-primary-rgb));
  border-color: rgba(var(--theme-primary-rgb), 0.24);
  background: rgba(var(--theme-primary-rgb), 0.06);
  transform: translateY(-1px);
}

.report-drag-handle:active {
  cursor: grabbing;
}

.report-toggle-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 9999px;
  border: 1px solid rgba(var(--theme-primary-rgb), 0.18);
  background: rgba(var(--theme-primary-rgb), 0.06);
  padding: 0.45rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgb(var(--theme-primary-rgb));
}

.report-toggle-chip--soft {
  background: rgb(248 250 252);
  border-color: rgba(226, 232, 240, 0.9);
  color: rgb(71 85 105);
}

.report-preview-box {
  overflow: auto;
  border-radius: 1rem;
  background: rgb(248 250 252);
  padding: 0.9rem 1rem;
  font-size: 0.75rem;
  line-height: 1.5;
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.report-preview-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: rgb(248 250 252);
  color: rgb(71 85 105);
  transition: transform 0.22s ease, background-color 0.22s ease;
}

.report-preview-toggle--open {
  transform: rotate(180deg);
  background: rgba(var(--theme-primary-rgb), 0.08);
  color: rgb(var(--theme-primary-rgb));
}

.field-reorder-move,
.field-reorder-enter-active,
.field-reorder-leave-active {
  transition: all 0.24s ease;
}

.field-reorder-enter-from,
.field-reorder-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

.field-reorder-leave-active {
  position: absolute;
  width: calc(100% - 2.5rem);
}

.preview-panel-enter-active,
.preview-panel-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease, max-height 0.22s ease;
  overflow: hidden;
}

.preview-panel-enter-from,
.preview-panel-leave-to {
  opacity: 0;
  transform: translateY(-6px);
  max-height: 0;
}

.preview-panel-enter-to,
.preview-panel-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 34rem;
}
</style>
