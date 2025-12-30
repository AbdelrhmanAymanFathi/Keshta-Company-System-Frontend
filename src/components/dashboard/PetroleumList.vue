<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-semibold">{{ $t('dashboard.petroleumList') }}</h2>
      <div class="flex items-center gap-2">
        <button @click="openCreate" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{{ $t('dashboard.newPetroleumSupply') }}</button>
      </div>
    </div>

    <div class="bg-white rounded shadow p-4 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs text-gray-700">{{ $t('labels.search') }}</label>
          <input v-model="filters.q" @keyup.enter="load" class="w-full px-3 py-2 border rounded text-sm" />
        </div>
        <div>
          <label class="block text-xs text-gray-700">{{ $t('labels.startDate') }}</label>
          <input v-model="filters.startDate" type="date" class="w-full px-3 py-2 border rounded text-sm" />
        </div>
        <div>
          <label class="block text-xs text-gray-700">{{ $t('labels.endDate') }}</label>
          <input v-model="filters.endDate" type="date" class="w-full px-3 py-2 border rounded text-sm" />
        </div>
      </div>
      <div class="flex gap-2">
        <button @click="load" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{{ $t('labels.search') }}</button>
        <button @click="clearFilters" class="px-4 py-2 bg-gray-200 rounded">{{ $t('labels.clear') }}</button>
      </div>
    </div>

    <div class="overflow-auto bg-white rounded shadow mt-4">
      <table class="min-w-full divide-y">
        <thead class="bg-indigo-50">
          <tr>
            <th class="p-3">#</th>
            <th class="p-3">{{ $t('petroleum.date') }}</th>
            <th class="p-3">{{ $t('petroleum.productName') }}</th>
            <th class="p-3">{{ $t('petroleum.supplyPermitNo') }}</th>
            <th class="p-3">{{ $t('petroleum.loadTons') }}</th>
            <th class="p-3">{{ $t('petroleum.tonPrice') }}</th>
            <th class="p-3">{{ $t('petroleum.supplierDue') }}</th>
            <th class="p-3">{{ $t('petroleum.transportContractor') }}</th>
            <th class="p-3">{{ $t('petroleum.transportTotal') }}</th>
            <th class="p-3">{{ $t('labels.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in items" :key="row.id" class="hover:bg-gray-50">
            <td class="p-3">{{ (page - 1) * pageSize + idx + 1 }}</td>
            <td class="p-3">{{ formatDate(row.date) }}</td>
            <td class="p-3">{{ row.productName || '-' }}</td>
            <td class="p-3">{{ row.supplyPermitNo || '-' }}</td>
            <td class="p-3">{{ formatNumber(row.loadTons) }}</td>
            <td class="p-3">{{ formatCurrency(row.tonPrice) }}</td>
            <td class="p-3">{{ formatCurrency(row.supplierDue) }}</td>
            <td class="p-3">{{ row.transportContractor?.name || '-' }}</td>
            <td class="p-3">{{ formatCurrency(row.transportTotal) }}</td>
            <td class="p-3">
              <div class="flex gap-2">
                <button @click="openEdit(row)" class="px-2 py-1 rounded bg-indigo-600 text-white">{{ $t('labels.edit') }}</button>
                <button @click="confirmDelete(row.id)" class="px-2 py-1 rounded bg-red-600 text-white">{{ $t('labels.delete') }}</button>
              </div>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td class="p-3" colspan="10">{{ $t('labels.noData') }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
      <div class="flex items-center gap-4">
        <p class="text-sm text-gray-700">
          {{ $t('labels.showing') }}
          <span class="font-medium">{{ ((page - 1) * pageSize) + 1 }}</span>
          {{ $t('labels.to') }}
          <span class="font-medium">{{ Math.min(page * pageSize, total) }}</span>
          {{ $t('labels.of') }}
          <span class="font-medium">{{ total }}</span>
          {{ $t('labels.results') }}
        </p>
      </div>
      <div>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button @click="changePage(1)" :disabled="page <= 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">«</button>
          <button @click="changePage(page - 1)" :disabled="page <= 1" class="relative inline-flex items-center px-2 py-2 border bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">‹</button>
          <template v-for="p in visiblePages" :key="p">
            <button @click="changePage(p)" :class="['relative inline-flex items-center px-4 py-2 border text-sm font-medium', p === page ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50']">{{ p }}</button>
          </template>
          <button @click="changePage(page + 1)" :disabled="page >= totalPages" class="relative inline-flex items-center px-2 py-2 border bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">›</button>
          <button @click="changePage(totalPages)" :disabled="page >= totalPages" class="relative inline-flex items-center px-2 py-2 rounded-r-md border bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">»</button>
        </nav>
      </div>
    </div>

    <!-- Edit / Create Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black opacity-40" @click="closeModal"></div>
      <div class="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 z-10">
        <NewPetroleumSupply :supplyId="editingId" @saved="onSaved" @cancel="closeModal" />
      </div>
    </div>

  </div>
</template>

<script>
import { getPetroleumSupplies, deletePetroleumSupply } from '@/api'
import NewPetroleumSupply from './NewPetroleumSupply.vue'

export default {
  name: 'PetroleumList',
  components: { NewPetroleumSupply },
  data() {
    return {
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      filters: { q: '', startDate: '', endDate: '' },
      modalOpen: false,
      editingId: null
    }
  },
  computed: {
    totalPages() { return Math.ceil(this.total / this.pageSize) },
    visiblePages() {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, this.page - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages, start + maxVisible - 1);
      if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
    },
    isRTL() { return this.$i18n && this.$i18n.locale === 'ar' }
  },
  async mounted() {
    await this.load()
  },
  methods: {
    async load() {
      try {
        const resp = await getPetroleumSupplies({ page: this.page, pageSize: this.pageSize, ...this.filters })
        const data = resp.data || {}
        this.items = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : [])
        this.total = data.total || this.items.length
        this.pageSize = data.pageSize || this.pageSize
      } catch (err) {
        this.items = []
        this.total = 0
      }
    },
    changePage(p) {
      if (p < 1 || p > this.totalPages) return
      this.page = p
      this.load()
    },
    clearFilters() {
      this.filters = { q: '', startDate: '', endDate: '' }
      this.page = 1
      this.load()
    },
    formatDate(d) {
      if (!d) return '-'
      try { return new Date(d).toLocaleDateString() } catch (e) { return d }
    },
    formatNumber(v) { return Number(v || 0).toLocaleString(this.isRTL ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 }) },
    formatCurrency(v) { return Number(v || 0).toLocaleString(this.isRTL ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' }) },
    openCreate() { this.editingId = null; this.modalOpen = true },
    openEdit(row) { this.editingId = row.id; this.modalOpen = true },
    closeModal() { this.modalOpen = false },
    async confirmDelete(id) {
      if (!confirm(this.$t('labels.delete') + '?')) return
      try {
        await deletePetroleumSupply(id)
        await this.load()
      } catch (err) {
        alert(this.$t('common.deleteError'))
      }
    },
    async onSaved() {
      this.modalOpen = false
      await this.load()
    }
  }
}
</script>
