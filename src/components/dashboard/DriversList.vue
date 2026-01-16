<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" :class="isRTL ? 'direction-rtl p-6' : 'p-6'">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <h1 class="text-2xl font-semibold">{{ $t('drivers.title') }}</h1>
      <button @click="openAdd" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
        {{ $t('drivers.add') }}
      </button>
    </div>

    <!-- Search -->
    <div class="mb-4">
      <input v-model="q" @input="onSearchInput" type="search" :placeholder="$t('drivers.searchPlaceholder')"
        class="w-full sm:w-1/2 px-3 py-2 border rounded" />
    </div>

    <!-- Desktop table -->
    <div class="hidden sm:block relative">
      <div class="overflow-auto bg-white rounded shadow">
        <table class="min-w-full divide-y">
          <thead class="bg-indigo-50">
            <tr>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('labels.#') }}</th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('drivers.name') }}</th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('drivers.phone') }}</th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('drivers.contractor') }}</th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('drivers.notes') }}</th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('labels.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(d, idx) in filtered" :key="d.id" class="hover:bg-gray-50 cursor-pointer"
              @contextmenu.prevent="openContextMenu($event, d)">
              <td class="px-6 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider  whitespace-nowrap" :class="isRTL ? 'text-right' : 'text-left'">{{ idx + 1 }}</td>
              <td class="px-6 py-3 text-xs font-medium text-black uppercase tracking-wider  whitespace-nowrap" :class="isRTL ? 'text-right' : 'text-left'">{{ d.name }}</td>
              <td class="px-6 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider  whitespace-nowrap" :class="isRTL ? 'text-right' : 'text-left'">{{ d.phone || '-' }}</td>
              <!-- Fixed: Show contractor name using contractorId -->
              <td class="px-6 py-3 text-xs font-medium text-black uppercase tracking-wider  whitespace-nowrap" :class="isRTL ? 'text-right' : 'text-left'">
                {{ getContractorName(d.contractorId) || '-' }}
              </td>
              <td class="px-6 py-3 text-xs font-medium text-gray-800 uppercase tracking-wider  whitespace-nowrap" :class="isRTL ? 'text-right' : 'text-left'">{{ d.notes || '-' }}</td>
              <td class="px-6 py-3 text-xs font-medium text-black uppercase tracking-wider  whitespace-nowrap">
                <div class="flex gap-2" :class="isRTL ? 'justify-start' : 'justify-end'">
                  <button @click.stop="openEdit(d)"
                    class="px-2 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-white text-xs sm:text-sm">
                    {{ $t('labels.edit') }}
                  </button>
                  <button @click.stop="confirmDelete(d)"
                    class="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm">
                    {{ $t('labels.delete') }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider  whitespace-nowrap" colspan="6" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('drivers.noResults') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile cards -->
    <div class="sm:hidden grid gap-3">
      <div v-for="d in filtered" :key="d.id"
        class="p-3 bg-white rounded shadow flex justify-between items-start cursor-pointer"
        :class="isRTL ? 'flex-row-reverse' : ''" @contextmenu.prevent="openContextMenu($event, d)">
        <div :class="isRTL ? 'text-right' : ''">
          <div class="font-semibold">{{ d.name }}</div>
          <div class="text-sm text-gray-500">
            {{ d.phone || '-' }}<br />
            <!-- Fixed: Show contractor name using contractorId -->
            <span v-if="d.contractorId">
              {{ $t('drivers.contractor') }}: {{ getContractorName(d.contractorId) }}
            </span>
            <br v-if="d.contractorId" />
            <span v-if="d.notes">{{ $t('drivers.notes') }}: {{ d.notes }}</span>
          </div>
        </div>
        <div class="flex flex-col gap-2" :class="isRTL ? 'items-start' : 'items-end'">
          <button @click.stop="openEdit(d)"
            class="px-2 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-white text-xs">
            {{ $t('labels.edit') }}
          </button>
          <button @click.stop="confirmDelete(d)"
            class="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs">
            {{ $t('labels.delete') }}
          </button>
        </div>
      </div>
      <div v-if="filtered.length === 0" class="text-center text-gray-500">
        {{ $t('drivers.noResults') }}
      </div>
    </div>

    <!-- Context Menu (Right-click) -->
    <div v-if="contextMenu.open" class="fixed bg-white rounded-lg shadow-lg py-2 z-50 border min-w-[120px]"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }" @contextmenu.prevent>
      <button @click="contextAction('edit')" class="block w-full px-4 py-2 text-sm hover:bg-gray-100"
        :class="isRTL ? 'text-right' : 'text-left'">
        {{ $t('labels.edit') }}
      </button>
      <button @click="contextAction('delete')" class="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
        :class="isRTL ? 'text-right' : 'text-left'">
        {{ $t('labels.delete') }}
      </button>
    </div>

    <!-- Modal: Add / Edit driver -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black opacity-40" @click="closeModal"></div>
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 z-10">
        <h3 class="text-lg font-semibold mb-4" :class="isRTL ? 'text-right' : ''">
          {{ editing ? $t('drivers.editDriver') : $t('drivers.addDriver') }}
        </h3>
        <div class="grid grid-cols-1 gap-3">
          <label>
            <div class="text-sm mb-1" :class="isRTL ? 'text-right' : ''">{{ $t('drivers.name') }}</div>
            <input v-model="form.name" class="w-full px-3 py-2 border rounded" :class="isRTL ? 'text-right' : ''" />
          </label>
          <label>
            <div class="text-sm mb-1" :class="isRTL ? 'text-right' : ''">{{ $t('drivers.phone') }}</div>
            <input v-model="form.phone" class="w-full px-3 py-2 border rounded" :class="isRTL ? 'text-right' : ''" />
          </label>
          <label>
            <div class="text-sm mb-1" :class="isRTL ? 'text-right' : ''">{{ $t('drivers.contractor') }}</div>
            <select v-model.number="form.contractorId" class="w-full px-3 py-2 border rounded"
              :class="isRTL ? 'text-right' : ''">
              <option :value="null">{{ $t('drivers.noContractorOption') }}</option>
              <option v-for="c in contractors" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </label>
          <label>
            <div class="text-sm mb-1" :class="isRTL ? 'text-right' : ''">{{ $t('drivers.notes') }}</div>
            <input v-model="form.notes" class="w-full px-3 py-2 border rounded" :class="isRTL ? 'text-right' : ''" />
          </label>
        </div>
        <div class="mt-4 flex gap-2 justify-end" :class="isRTL ? 'flex-row-reverse' : ''">
          <button @click="closeModal" class="px-4 py-2 rounded border">{{ $t('labels.cancel') }}</button>
          <button @click="saveDriver"
            :class="['px-4 py-2 rounded text-white', editing ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-indigo-600 hover:bg-indigo-700']">
            {{ $t('labels.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1"
      class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
      <!-- Mobile Pagination -->
      <div class="flex-1 flex justify-between sm:hidden">
        <button @click="changePage(page - 1)" :disabled="page <= 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ $t('labels.previous') || 'Previous' }}
        </button>
        <span class="text-sm text-gray-700 self-center">{{ page }} / {{ totalPages }}</span>
        <button @click="changePage(page + 1)" :disabled="page >= totalPages"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ $t('labels.next') || 'Next' }}
        </button>
      </div>
      <!-- Desktop Pagination -->
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <p class="text-sm text-gray-700">
            {{ $t('labels.showing') || 'Showing' }}
            <span class="font-medium">{{ ((page - 1) * pageSize) + 1 }}</span>
            {{ $t('labels.to') || 'to' }}
            <span class="font-medium">{{ Math.min(page * pageSize, total) }}</span>
            {{ $t('labels.of') || 'of' }}
            <span class="font-medium">{{ total }}</span>
            {{ $t('labels.results') || 'results' }}
          </p>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-700">{{ $t('labels.pageSize') || 'Page size' }}:</label>
            <select v-model="pageSize" @change="onPageSizeChange"
              class="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button @click="changePage(1)" :disabled="page <= 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                  clip-rule="evenodd" />
              </svg>
            </button>
            <button @click="changePage(page - 1)" :disabled="page <= 1"
              class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clip-rule="evenodd" />
              </svg>
            </button>
            <button v-for="p in visiblePages" :key="p" @click="changePage(p)" :class="[
              'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
              p === page
                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
            ]">
              {{ p }}
            </button>
            <button @click="changePage(page + 1)" :disabled="page >= totalPages"
              class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd" />
              </svg>
            </button>
            <button @click="changePage(totalPages)" :disabled="page >= totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10l-4.293-4.293a1 1 0 010-1.414zm6 0a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Confirm delete modal -->
    <div v-if="deleteConfirm.open" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black opacity-40" @click="cancelDelete"></div>
      <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 z-10">
        <p class="mb-4" :class="isRTL ? 'text-right' : ''">
          {{ $t('drivers.deleteConfirm') }} "<strong>{{ deleteConfirm.item.name }}</strong>"?
        </p>
        <div class="flex justify-end gap-2" :class="isRTL ? 'flex-row-reverse' : ''">
          <button @click="cancelDelete" class="px-3 py-1 border rounded">{{ $t('labels.cancel') }}</button>
          <button @click="doDelete" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
            {{ $t('labels.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDrivers, createDriver, updateDriver, deleteDriver, getContractors } from '../../api'

export default {
  name: 'DriversList',
  data() {
    return {
      q: '',
      modalOpen: false,
      editing: false,
      form: { id: null, name: '', phone: '', contractorId: null, notes: '' },
      drivers: [],
      contractors: [],
      deleteConfirm: { open: false, item: null },
      page: 1,
      pageSize: 20,
      total: 0,
      searchTimeout: null,
      controller: null,
      contextMenu: { open: false, x: 0, y: 0, item: null }
    }
  },
  computed: {
    isRTL() {
      return this.$i18n && this.$i18n.locale === 'ar'
    },
    filtered() {
      if (!this.q) return this.drivers
      const s = this.q.toLowerCase()
      return this.drivers.filter(d =>
        (d.name || '').toLowerCase().includes(s) ||
        (d.phone || '').toLowerCase().includes(s) ||
        (this.getContractorName(d.contractorId) || '').toLowerCase().includes(s) ||
        (d.notes || '').toLowerCase().includes(s)
      )
    },
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
    },
    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.page - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }
  },
  mounted() {
    Promise.all([this.loadDrivers(), this.loadContractors()])
    document.addEventListener('click', this.closeContextMenu)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeContextMenu)
  },
  methods: {
    extractArray(payload) {
      return Array.isArray(payload?.items) ? payload.items :
        Array.isArray(payload?.data) ? payload.data :
          Array.isArray(payload) ? payload : []
    },
    async loadDrivers() {
      if (this.controller) this.controller.abort()
      this.controller = new AbortController()
      const signal = this.controller.signal
      try {
        const res = await getDrivers({ page: this.page, pageSize: this.pageSize, q: this.q }, { signal })
        const payload = res.data || {}
        this.drivers = this.extractArray(payload)
        const meta = payload.meta || {}
        this.total = meta.total ?? payload.total ?? this.drivers.length
        this.page = meta.page ?? this.page
        this.pageSize = meta.pageSize ?? meta.perPage ?? payload.pageSize ?? payload.perPage ?? this.pageSize
      } catch (e) {
        if (e.name !== 'AbortError') {
          this.drivers = []
          this.total = 0
        }
      }
    },
    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.page = newPage
        this.loadDrivers()
      }
    },
    onPageSizeChange() {
      this.page = 1
      this.loadDrivers()
    },
    async loadContractors() {
      try {
        const res = await getContractors()
        this.contractors = this.extractArray(res.data || {})
      } catch (e) {
        this.contractors = []
      }
    },
    // New: Get contractor name by ID
    getContractorName(contractorId) {
      if (!contractorId) return null
      const contractor = this.contractors.find(c => c.id === contractorId)
      return contractor ? contractor.name : '-'
    },
    openAdd() {
      this.editing = false
      this.form = { id: null, name: '', phone: '', contractorId: null, notes: '' }
      this.modalOpen = true
    },
    openEdit(d) {
      this.editing = true
      this.form = {
        id: d.id,
        name: d.name,
        phone: d.phone || '',
        contractorId: d.contractorId || null,
        notes: d.notes || ''
      }
      this.modalOpen = true
    },
    closeModal() {
      this.modalOpen = false
    },
    async saveDriver() {
      const name = (this.form.name || '').trim()
      if (!name) {
        window.$toast(this.$t ? this.$t('drivers.validationName') || 'Please enter a name' : 'Please enter a name', 'warning')
        return
      }
      try {
        const payload = {
          name: this.form.name,
          phone: this.form.phone || '',
          notes: this.form.notes || ''
        }
        if (this.form.contractorId != null) payload.contractorId = this.form.contractorId

        if (this.editing && this.form.id) {
          const res = await updateDriver(this.form.id, payload)
          const updated = res.data || payload
          const idx = this.drivers.findIndex(x => x.id === this.form.id)
          if (idx !== -1) this.drivers.splice(idx, 1, updated)
        } else {
          const res = await createDriver(payload)
          this.drivers.push(res.data)
          this.total++
        }
        this.modalOpen = false
      } catch (e) {
        window.$toast(this.$t ? this.$t('drivers.saveError') || 'Error saving driver' : 'Error saving driver', 'error')
      }
    },
    confirmDelete(d) {
      this.deleteConfirm = { open: true, item: d }
    },
    cancelDelete() {
      this.deleteConfirm = { open: false, item: null }
    },
    async doDelete() {
      const id = this.deleteConfirm.item.id
      try {
        await deleteDriver(id)
        this.drivers = this.drivers.filter(d => d.id !== id)
        this.total--
        if (this.drivers.length === 0 && this.page > 1) {
          this.page = Math.max(1, this.page - 1)
          await this.loadDrivers()
        }
      } catch (e) {
        window.$toast(this.$t ? this.$t('drivers.deleteError') || 'Error deleting driver' : 'Error deleting driver', 'error')
      }
      this.cancelDelete()
    },
    onSearchInput() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.page = 1
        this.loadDrivers()
      }, 500)
    },
    openContextMenu(event, item) {
      this.contextMenu = {
        open: true,
        x: event.clientX,
        y: event.clientY,
        item
      }
    },
    closeContextMenu() {
      this.contextMenu.open = false
    },
    contextAction(action) {
      if (action === 'edit') {
        this.openEdit(this.contextMenu.item)
      } else if (action === 'delete') {
        this.confirmDelete(this.contextMenu.item)
      }
      this.closeContextMenu()
    }
  }
}
</script>

<style scoped>
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