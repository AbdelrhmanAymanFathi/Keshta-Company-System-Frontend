<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-2xl font-semibold">{{ (report && report.title) || $t('admin.runReport') }}</h2>
        <p class="text-sm text-gray-600">{{ (report && report.description) || '' }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="execute" :disabled="executing" class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition disabled:opacity-50">{{ $t('labels.search') }}</button>
        <button @click="clear" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">{{ $t('labels.clear') }}</button>
      </div>
    </div>

    <div class="bg-white rounded shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="p in (report && report.params) || []" :key="p.name">
          <label class="block text-sm font-medium mb-1">{{ p.label || ((locale !== 'en' && p.arName) ? p.arName : p.name) }}</label>

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
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded shadow p-4">
      <div v-if="executing" class="py-12 flex justify-center"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      <div v-else>
        <div v-if="Array.isArray(result) && result.length">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th v-for="col in columns" :key="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{{ col }}</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(row, idx) in result" :key="idx">
                  <td v-for="col in columns" :key="col" class="px-4 py-2 text-sm text-gray-700">{{ row[col] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else-if="result">
          <pre class="text-xs bg-gray-100 p-2 rounded overflow-auto" :dir="ltr" style="direction:ltr; unicode-bidi:embed; text-align: start;">{{ JSON.stringify(result, null, 2) }}</pre>
        </div>
        <div v-else class="text-sm text-gray-500">{{ $t('reports.noResults') || 'No results yet' }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getReportDef, executeReport, getReportParamOptions } from '@/api'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'

export default {
  components: { SearchDropdown },
  props: { reportId: { type: [String, Number], required: true } },
  setup(props) {
    const { locale } = useI18n()
    const report = ref(null)
    const values = ref({})
    const result = ref(null)
    const executing = ref(false)

    const paramOptions = ref({})
    const paramLoading = ref({})
    const selectedLabels = ref({})

    const columns = computed(() => {
      if (!Array.isArray(result.value) || !result.value.length) return []
      const first = result.value[0]
      if (typeof first === 'object' && first !== null) return Object.keys(first)
      return []
    })

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

    async function loadOptions(paramName, q = '') {
      paramLoading.value[paramName] = true
      try {
        const res = await getReportParamOptions(props.reportId, paramName, q)
        const items = Array.isArray(res.data) ? res.data.map((it, idx) => ({ id: it.id ?? it.value ?? it.key ?? idx, label: it.label ?? it.name ?? String(it) })) : []
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

    return { report, values, execute, result, executing, paramOptions, selectedLabels, onOptionSearch, onSelectOptionGeneric, clear, columns, locale }
  }
}
</script>
