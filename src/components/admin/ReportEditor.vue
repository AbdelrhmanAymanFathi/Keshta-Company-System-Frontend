<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h2 class="text-xl font-bold mb-4">{{ isNew ? $t('admin.createReport') : $t('admin.editReport') }}</h2>
    <div class="bg-white rounded shadow p-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium">{{ $t('reports.columnKey') }}</label>
          <input v-model="form.key" class="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label class="block text-sm font-medium">{{ $t('reports.columnTitle') }}</label>
          <input v-model="form.title" class="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label class="block text-sm font-medium">{{ $t('reports.columnArTitle') || 'Arabic Title' }}</label>
          <input v-model="form.arTitle" class="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label class="block text-sm font-medium">{{ $t('reports.columnModule') }}</label>
          <SearchDropdown
            :modelValue="selectedModuleLabel"
            :items="modulesOptions"
            :allItems="modulesOptions"
            itemKey="id"
            itemLabel="label"
            :placeholder="$t('placeholders.search')"
            :inputClass="'w-full border rounded px-2 py-1'"
            @update:modelValue="val => selectedModuleLabel = val"
            @select="onSelectModule"
          />
        </div>
        <div>
          <label class="block text-sm font-medium">{{ $t('reports.columnActive') }}</label>
          <input type="checkbox" v-model="form.active" />
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium">{{ $t('reports.description') }}</label>
          <textarea v-model="form.description" class="w-full border rounded px-2 py-1" rows="3"></textarea>
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium">{{ $t('reports.queryText') }}</label>
          <textarea v-model="form.queryText" class="w-full border rounded px-2 py-1 text-left font-mono text-sm" rows="8" :dir="ltr" style="direction:ltr; unicode-bidi:embed; text-align: start;"></textarea>
          <p class="text-xs text-gray-500 mt-1">{{ $t('reports.queryHelp') }}</p>
        </div>
      </div>

      <div class="mt-4 flex justify-end gap-2">
          <router-link to="/dashboard/admin/reports" class="px-3 py-2 border rounded flex items-center gap-2 hover:bg-gray-50 transition">
            <span>{{ $t('labels.cancel') }}</span>
          </router-link>
          <button @click="save" class="px-4 py-2 bg-emerald-600 text-white rounded flex items-center gap-2 hover:bg-emerald-500 transition">
            <span>{{ $t('labels.save') }}</span>
          </button>
        </div>
    </div>
</div>

  <div class="max-w-4xl mx-auto mt-6">
    <h3 class="font-semibold mb-2">{{ $t('admin.parameters') }}</h3>
    <div class="bg-white rounded shadow p-3">
      <div class="flex justify-between mb-2">
          <div class="text-sm text-gray-600">{{ $t('reports.parametersHelp') || '' }}</div>
        <div>
          <button @click="startEditParam(null)" class="px-3 py-1 bg-emerald-600 text-white rounded flex items-center gap-2 hover:bg-emerald-500 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
            </svg>
            <span>{{ $t('reports.newParameter') }}</span>
          </button>
        </div>
      </div>

      <ul>
        <li v-for="(p, idx) in form.params" :key="p.name" draggable @dragstart="onDragStart($event, idx)" @dragover.prevent="onDragOver($event, idx)" @drop="onDrop($event, idx)"
            class="p-3 border-b flex items-center justify-between hover:bg-gray-50 transition">
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7.414A2 2 0 0016.586 6L13 2.414A2 2 0 0011.586 2H4z" />
            </svg>
            <div>
              <strong class="block">{{ (locale !== 'en' && p.arName) ? p.arName : p.name }}</strong>
              <span class="text-sm text-gray-600">{{ p.label || p.type }}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="startEditParam(p, idx)" class="px-2 py-1 bg-yellow-400 text-white rounded flex items-center gap-1 hover:bg-yellow-300 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /></svg>
              <span class="text-sm">{{ $t('labels.edit') }}</span>
            </button>
            <button @click="removeParam(idx)" class="px-2 py-1 bg-red-600 text-white rounded flex items-center gap-1 hover:bg-red-500 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 100 2h14a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm2 6a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1z" clip-rule="evenodd" /></svg>
              <span class="text-sm">{{ $t('labels.delete') }}</span>
            </button>
          </div>
        </li>
      </ul>

      <div v-if="editingParam" class="mt-3 border-t pt-3">
        <h4 class="font-medium">{{ $t('reports.parameterEditor') }}</h4>
        <div class="grid grid-cols-2 gap-3 mt-2">
          <div>
            <label class="block text-sm">{{ $t('reports.paramName') }}</label>
            <input v-model="editingParam.name" class="w-full border rounded px-2 py-1" />
            <div v-if="nameError" class="text-red-600 text-sm mt-1">{{ nameError }}</div>
          </div>
          <div>
            <label class="block text-sm">{{ $t('reports.paramLabel') }}</label>
            <input v-model="editingParam.label" class="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label class="block text-sm">{{ $t('reports.paramArName') }}</label>
            <input v-model="editingParam.arName" class="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label class="block text-sm">{{ $t('reports.paramType') }}</label>
            <select v-model="editingParam.type" class="w-full border rounded px-2 py-1">
              <option v-for="t in paramTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm">{{ $t('reports.paramRequired') }}</label>
            <input type="checkbox" v-model="editingParam.required" />
          </div>
          <div class="col-span-2">
            <label class="block text-sm">{{ $t('reports.dataSourceSql') }}</label>
            <textarea v-model="editingParam.dataSourceSql" class="w-full border rounded px-2 py-1" :dir="ltr" style="direction:ltr; unicode-bidi:embed; text-align: start;" rows="3"></textarea>
          </div>
          <div class="col-span-2">
            <label class="block text-sm">{{ $t('reports.metaJson') }}</label>
            <textarea v-model="editingParam.meta" placeholder='e.g. { "placeholder":"Search..." }' class="w-full border rounded px-2 py-1" rows="3"></textarea>
          </div>
        </div>
        <div class="flex gap-2 justify-end mt-3">
          <button @click="cancelEditParam" class="px-3 py-1 border rounded flex items-center gap-2 hover:bg-gray-50 transition">
            <span>{{ $t('labels.cancel') }}</span>
          </button>
          <button @click="saveParam" class="px-3 py-1 bg-emerald-600 text-white rounded flex items-center gap-2 hover:bg-emerald-500 transition">
            <span>{{ $t('reports.saveParam') }}</span>
          </button>
          <button v-if="!isNew && editingParam.name" @click="previewOptions(editingParam.name)" class="px-3 py-1 bg-indigo-600 text-white rounded flex items-center gap-2 hover:bg-indigo-500 transition">
            <span>{{ $t('admin.previewOptions') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getReportDef, createReportDef, updateReportDef, getReportParamOptions, getReportModules } from '@/api'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  components: { SearchDropdown },
  props: { modal: { type: Boolean, default: false } },
  emits: ['saved'],
  setup(props, { emit }) {
    const { t, locale } = useI18n()
    const route = useRoute()
    const router = useRouter()
    const id = route.params.id
    const isNew = !id || id === 'new'
    const form = ref({ key: '', title: '', arTitle: '', ReportJobType: '', description: '', queryText: '', active: true, params: [] })
    const editingParam = ref(null)
    const dragIndex = ref(-1)
    const nameError = ref('')

    const paramTypes = ['TEXT','NUMBER','DATE','DROPDOWN','MULTISELECT','BOOLEAN']
    const modulesOptions = ref([])
    const selectedModuleLabel = ref('')

    async function loadModules() {
      try {
        const res = await getReportModules()
        const list = Array.isArray(res?.data?.modules) ? res.data.modules : (res?.data || [])
        modulesOptions.value = list.map((m, idx) => ({ id: m, label: String(m) }))
      } catch (err) {
        console.error('Failed to load report modules', err)
        modulesOptions.value = []
      }
    }

    function startEditParam(p, idx) {
      editingParam.value = { ...(p || { name: '', arName: '', label: '', type: 'TEXT', required: false, position: form.value.params.length + 1, dataSourceSql: '', meta: {} }), __idx: (typeof idx === 'number' ? idx : null) }
    }

    function cancelEditParam() { editingParam.value = null; nameError.value = '' }

    function saveParam() {
      const p = editingParam.value
      if (!p) return
      // validate name
      const re = /^[a-zA-Z_][a-zA-Z0-9_]*$/
      if (!re.test(p.name)) {
        nameError.value = 'Invalid name. Use letters, digits and underscore, cannot start with digit.'
        return
      }
      // duplicate check
      const dup = form.value.params.some((x, i) => x.name === p.name && i !== p.__idx)
      if (dup) {
        nameError.value = 'Duplicate parameter name'
        return
      }
      // prepare object
      const obj = { name: p.name, arName: p.arName || '', label: p.label, type: p.type, required: Boolean(p.required), position: p.position || (form.value.params.length + 1), dataSourceSql: p.dataSourceSql || '', meta: p.meta || {} }
      if (typeof p.__idx === 'number' && p.__idx !== null) {
        form.value.params.splice(p.__idx, 1, obj)
      } else {
        form.value.params.push(obj)
      }
      editingParam.value = null
      nameError.value = ''
      // renumber positions
      form.value.params.forEach((pp, i) => pp.position = i + 1)
    }

    function removeParam(i) {
      if (!confirm(t('reports.confirmRemoveParam'))) return
      form.value.params.splice(i,1)
      form.value.params.forEach((pp, idx) => pp.position = idx+1)
    }

    function onDragStart(e, i) {
      dragIndex.value = i
      e.dataTransfer.effectAllowed = 'move'
    }
    function onDragOver(e) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
    }
    function onDrop(e, i) {
      e.preventDefault()
      const from = dragIndex.value
      const to = i
      if (from === -1 || from === to) return
      const arr = form.value.params
      const item = arr.splice(from,1)[0]
      arr.splice(to,0,item)
      arr.forEach((pp, idx) => pp.position = idx+1)
      dragIndex.value = -1
    }


    const initialJson = ref('')

    const load = async () => {
      if (!isNew) {
        const res = await getReportDef(id)
        form.value = res.data || form.value
      }
      // set selected module label from loaded form
      selectedModuleLabel.value = form.value.module || ''
      // capture initial snapshot for dirty checking
      initialJson.value = JSON.stringify(form.value)
      // notify parent no unsaved changes
      emit('dirty-changed', false)
    }

    // when a module is selected from dropdown
    function onSelectModule(item) {
      if (!item) {
        form.value.module = ''
        selectedModuleLabel.value = ''
        return
      }
      form.value.module = item.id ?? item.label ?? item
      selectedModuleLabel.value = item.label ?? String(item)
    }

    const save = async () => {
      try {
        // validate param names before saving
        const nameRe = /^[a-zA-Z_][a-zA-Z0-9_]*$/
        const names = new Set()
        for (const p of form.value.params || []) {
          if (!nameRe.test(p.name)) throw new Error('Invalid parameter name: ' + p.name)
          if (names.has(p.name)) throw new Error('Duplicate parameter name: ' + p.name)
          names.add(p.name)
        }

        if (isNew) {
          await createReportDef(form.value)
        } else {
          await updateReportDef(id, form.value)
        }
        if (props.modal) {
          emit('saved')
        } else {
          router.push({ name: 'admin-reports-list' })
        }
      } catch (err) {
        console.error('Save failed', err)
        alert(t('reports.saveFailed') + ': ' + (err?.message || err))
      }
    }

    async function previewOptions(paramName) {
      if (!id || id === 'new') { alert(t('reports.saveFirstToPreview')); return }
      try {
        const res = await getReportParamOptions(id, paramName, '')
        alert(t('reports.previewRows') + '\n' + JSON.stringify(res.data?.slice(0,10) || res.data || [], null, 2))
      } catch (err) {
        console.error('Preview options failed', err)
        alert(t('reports.previewFailed') + ': ' + (err?.response?.data?.message || err.message))
      }
    }

    // watch for changes to form to detect dirty state
    watch(form, (newVal) => {
      const current = JSON.stringify(newVal)
      const dirty = current !== initialJson.value
      emit('dirty-changed', dirty)
    }, { deep: true })

    // also consider editingParam as making the form dirty while editing
    watch(editingParam, (v) => {
      emit('dirty-changed', Boolean(v))
    })

    onMounted(load)
    onMounted(loadModules)
    return { form, save, isNew, editingParam, paramTypes, startEditParam, removeParam, onDragStart, onDragOver, onDrop, saveParam, cancelEditParam, nameError, previewOptions, locale, modulesOptions, selectedModuleLabel, onSelectModule }
  }
}
</script>
