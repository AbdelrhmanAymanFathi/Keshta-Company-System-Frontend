<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" :class="isRTL ? 'direction-rtl p-6' : 'p-6'">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <h1 class="text-2xl font-semibold">{{ $t('contractors.title') }}</h1>

      <div class="flex items-center gap-2">
        <!-- import excel -->
        <label class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 inline-flex items-center cursor-pointer">
          <input ref="fileInput" type="file" accept=".xlsx,.xls" class="hidden" @change="onFileChange" />
          <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 3v12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 7l4-4 4 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="3" y="13" width="18" height="8" rx="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ $t('contractors.importExcel') }}
        </label>

        <button @click="openAdd()" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          {{ $t('contractors.add') }}
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="mb-4">
      <input v-model="q" type="search" :placeholder="$t('contractors.searchPlaceholder')"
             class="w-full sm:w-1/2 px-3 py-2 border rounded" />
    </div>

    <!-- Desktop table -->
    <div class="hidden sm:block">
      <div class="overflow-auto bg-white rounded shadow">
        <table class="min-w-full divide-y">
          <thead class="bg-indigo-50">
            <tr>
              <th class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('labels.#') }}</th>
              <th class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('contractors.name') }}</th>
              <th class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('contractors.type') }}</th>
              <th class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('contractors.phone') }}</th>
              <th class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('labels.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, idx) in filtered" :key="c.id" class="hover:bg-gray-50">
              <td class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ idx + 1 }}</td>
              <td class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ c.name }}</td>
              <td class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ c.type || '-' }}</td>
              <td class="p-3" :class="isRTL ? 'text-right' : 'text-left'">{{ c.phone || '-' }}</td>
              <td class="p-3">
                <div :class="['flex gap-2', isRTL ? 'flex-row-reverse' : '']">
                  <button @click="openEdit(c)" class="px-2 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-white">{{ $t('labels.edit') }}</button>
                  <button @click="confirmDelete(c)" class="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white">{{ $t('labels.delete') }}</button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td class="p-3" colspan="5" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('contractors.noResults') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile cards -->
    <div class="sm:hidden grid gap-3">
      <div v-for="c in filtered" :key="c.id" :class="['p-3 bg-white rounded shadow flex justify-between items-start', isRTL ? 'flex-row-reverse' : '']">
        <div :class="isRTL ? 'text-right' : ''">
          <div class="font-semibold">{{ c.name }}</div>
          <div class="text-sm text-gray-500">{{ c.type || '-' }} • {{ c.phone || '-' }}</div>
        </div>
        <div class="flex flex-col gap-2">
          <button @click="openEdit(c)" class="px-2 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-white text-xs">{{ $t('labels.edit') }}</button>
          <button @click="confirmDelete(c)" class="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs">{{ $t('labels.delete') }}</button>
        </div>
      </div>
      <div v-if="filtered.length === 0" class="text-center text-gray-500">{{ $t('contractors.noResults') }}</div>
    </div>

    <!-- Modal: Add / Edit contractor -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black opacity-40" @click="closeModal"></div>
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 z-10">
        <h3 class="text-lg font-semibold mb-4" :class="isRTL ? 'text-right' : ''">{{ editing ? $t('contractors.editContractor') : $t('contractors.addContractor') }}</h3>

        <div class="grid grid-cols-1 gap-3">
          <label>
            <div class="text-sm mb-1" :class="isRTL ? 'text-right' : ''">{{ $t('contractors.name') }}</div>
            <input v-model="form.name" class="w-full px-3 py-2 border rounded" :class="isRTL ? 'text-right' : ''" />
          </label>

          <label>
            <div class="text-sm mb-1" :class="isRTL ? 'text-right' : ''">{{ $t('contractors.phone') }}</div>
            <input v-model="form.phone" class="w-full px-3 py-2 border rounded" :class="isRTL ? 'text-right' : ''" />
          </label>

          <label>
            <div class="text-sm mb-1" :class="isRTL ? 'text-right' : ''">{{ $t('contractors.type') }}</div>
            <input v-model="form.type" class="w-full px-3 py-2 border rounded" :class="isRTL ? 'text-right' : ''" />
          </label>
        </div>

        <div class="mt-4 flex gap-2 justify-end" :class="isRTL ? 'flex-row-reverse' : ''">
          <button @click="closeModal" class="px-4 py-2 rounded border">{{ $t('labels.cancel') }}</button>
          <button @click="saveContractor" :class="['px-4 py-2 rounded text-white', editing ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-indigo-600 hover:bg-indigo-700']">
            {{ $t('labels.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm delete modal -->
    <div v-if="deleteConfirm.open" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black opacity-40" @click="cancelDelete"></div>
      <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 z-10">
        <p class="mb-4" :class="isRTL ? 'text-right' : ''">{{ $t('contractors.deleteConfirm') }} "<strong>{{ deleteConfirm.item.name }}</strong>"?</p>
        <div class="flex justify-end gap-2" :class="isRTL ? 'flex-row-reverse' : ''">
          <button @click="cancelDelete" class="px-3 py-1 border rounded">{{ $t('labels.cancel') }}</button>
          <button @click="doDelete" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">{{ $t('labels.delete') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// You'll need 'xlsx' installed (npm i xlsx)
import * as XLSX from 'xlsx'

export default {
  name: 'ContractorsList',
  data() {
    return {
      q: '',
      modalOpen: false,
      editing: false,
      form: { id: null, name: '', phone: '', type: '' },
      contractors: [
        // initial demo data (you can replace with API fetch)
        { id: 1, name: 'عبده الشناوي', phone: '', type: 'عام' },
        { id: 2, name: 'حمد الصريحي', phone: '', type: 'مدني' }
      ],
      deleteConfirm: { open: false, item: null }
    }
  },
  computed: {
    isRTL() { return this.$i18n && this.$i18n.locale === 'ar' },
    filtered() {
      if (!this.q) return this.contractors
      const s = this.q.toLowerCase()
      return this.contractors.filter(c => (c.name||'').toLowerCase().includes(s) || (c.phone||'').toLowerCase().includes(s))
    }
  },
  methods: {
    openAdd() {
      this.editing = false
      this.form = { id: null, name: '', phone: '', type: '' }
      this.modalOpen = true
    },
    openEdit(c) {
      this.editing = true
      this.form = Object.assign({}, c)
      this.modalOpen = true
    },
    closeModal() {
      this.modalOpen = false
    },
    saveContractor() {
      const name = (this.form.name || '').trim()
      if (!name) {
        alert(this.$t('contractors.validationName'))
        return
      }
      if (this.editing) {
        const idx = this.contractors.findIndex(x => x.id === this.form.id)
        if (idx !== -1) this.contractors.splice(idx, 1, Object.assign({}, this.form))
      } else {
        const id = this.contractors.length ? Math.max(...this.contractors.map(c=>c.id)) + 1 : 1
        this.contractors.push({ id, name, phone: this.form.phone, type: this.form.type })
      }
      this.modalOpen = false
    },
    confirmDelete(c) {
      this.deleteConfirm = { open: true, item: c }
    },
    cancelDelete() {
      this.deleteConfirm = { open: false, item: null }
    },
    doDelete() {
      const id = this.deleteConfirm.item.id
      this.contractors = this.contractors.filter(c => c.id !== id)
      this.cancelDelete()
    },

    // ---------- Excel import ----------
    onFileChange(e) {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (evt) => {
        const data = evt.target.result
        const workbook = XLSX.read(data, { type: 'binary' })
        // take first sheet
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        // convert to json (first row may be header or not)
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 })
        this.parseExcelJson(json)
      }
      reader.readAsBinaryString(file)
      // reset input so same file can be re-selected
      this.$refs.fileInput.value = null
    },
    parseExcelJson(json) {
      // json is array of rows (arrays). Find header row by searching for column containing 'مقاول' or 'Contractor'
      if (!Array.isArray(json) || json.length === 0) return
      let headerRowIndex = 0
      for (let i=0;i<Math.min(5,json.length);i++){
        const row = (json[i] || []).map(cell => (cell || '').toString())
        if (row.some(r => /مقاول|Contractor/i.test(r))) { headerRowIndex = i; break }
      }
      const header = (json[headerRowIndex] || []).map(h => (h||'').toString().trim())
      const rows = json.slice(headerRowIndex+1)
      // try to find contractor column index
      let contractorCol = -1
      for (let i=0;i<header.length;i++){
        if (/مقاول|Contractor/i.test(header[i])) { contractorCol = i; break }
      }
      // fallback: if header not found, assume column 1 (index 1)
      if (contractorCol === -1) contractorCol = 1
      const imported = []
      for (const r of rows) {
        const name = (r[contractorCol] || '').toString().trim()
        if (name) imported.push(name)
      }
      // dedupe and add to contractors list (avoid duplicates by name)
      const existingNames = new Set(this.contractors.map(c => c.name))
      let added = 0
      for (const n of imported) {
        if (!existingNames.has(n)) {
          const id = this.contractors.length ? Math.max(...this.contractors.map(c=>c.id)) + 1 : 1
          this.contractors.push({ id, name: n, phone: '', type: '' })
          existingNames.add(n)
          added++
        }
      }
      alert(this.$t('contractors.imported', { count: added }))
    }
  }
}
</script>

<style scoped>
/* small helper in case some elements still need forced RTL alignment */
.direction-rtl input,
.direction-rtl select,
.direction-rtl textarea {
  direction: rtl;
  text-align: right;
}
.direction-rtl table th,
.direction-rtl table td {
  text-align: right;
}
</style>
