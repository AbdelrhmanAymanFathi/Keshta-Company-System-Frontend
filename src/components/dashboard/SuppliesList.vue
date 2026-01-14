<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-6">
    <!-- Header + زر التوريد الجديد -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold">{{ $t('dashboard.suppliesList') }}</h2>

      <!-- الزر اللي هيفتح الـ Modal -->
      <TableModal
        :showTriggerButton="true"
        triggerButtonText="توريد جديد +"
        modalTitle="إنشاء توريد جديد"
      />
    </div>

    <!-- الجدول -->
    <div class="overflow-auto bg-white rounded shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-indigo-50">
          <tr>
            <th class="p-3">#</th>
            <th class="p-3">{{ $t('labels.date') }}</th>
            <th class="p-3">{{ $t('labels.location') }}</th>
            <th class="p-3">{{ $t('labels.crusher') }}</th>
            <th class="p-3">{{ $t('labels.contractor') }}</th>
            <th class="p-3">{{ $t('labels.vehicle') }}</th>
            <th class="p-3">{{ $t('labels.total') }}</th>
            <th class="p-3">{{ $t('labels.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, idx) in supplies" :key="s.id" class="hover:bg-gray-50">
            <td class="p-3">{{ idx + 1 }}</td>
            <td class="p-3">{{ formatDate(s.date) }}</td>
            <td class="p-3">{{ s.location?.name || '-' }}</td>
            <td class="p-3">{{ s.crusher?.name || '-' }}</td>
            <td class="p-3">{{ s.contractor?.name || '-' }}</td>
            <td class="p-3">{{ s.vehicle?.name || '-' }}</td>
            <td class="p-3">{{ formatNumber(calculateTotal(s)) }}</td>
            <td class="p-3">
              <button @click="openEdit(s)" class="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700">
                {{ $t('labels.edit') }}
              </button>
            </td>
          </tr>
          <tr v-if="supplies.length === 0">
            <td class="p-3" colspan="8" >
              {{ $t('dashboard.suppliesList') }}: {{ $t('contractors.noResults') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
      <!-- Mobile Pagination -->
      <div class="flex-1 flex justify-between sm:hidden">
        <button @click="changePage(page - 1)"
          :disabled="page <= 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ $t('labels.previous') || 'Previous' }}
        </button>
        <span class="text-sm text-gray-700 self-center">
          {{ page }} / {{ totalPages }}
        </span>
        <button @click="changePage(page + 1)"
          :disabled="page >= totalPages"
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

        <!-- Page Numbers -->
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button @click="changePage(1)"
              :disabled="page <= 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
            </button>

            <button @click="changePage(page - 1)"
              :disabled="page <= 1"
              class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>

            <template v-for="p in visiblePages" :key="p">
              <button @click="changePage(p)"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  p === page
                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                ]">
                {{ p }}
              </button>
            </template>

            <button @click="changePage(page + 1)"
              :disabled="page >= totalPages"
              class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>

            <button @click="changePage(totalPages)"
              :disabled="page >= totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10l-4.293-4.293a1 1 0 010-1.414zm6 0a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black opacity-40" @click="closeModal"></div>
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 z-10">
        <h3 class="text-lg font-semibold mb-4">{{ $t('dashboard.suppliesList') }} — {{ $t('labels.edit') }}</h3>
        <div class="grid grid-cols-2 gap-4">
          <label>
            <div class="text-sm mb-1">{{ $t('labels.site') }}</div>
            <input v-model="form.site" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('labels.area') }}</div>
            <input v-model="form.area" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('labels.date') }}</div>
            <input v-model="form.date" type="date" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('labels.contractor') }}</div>
            <input v-model="form.contractor" class="w-full px-3 py-2 border rounded" />
          </label>
          <label>
            <div class="text-sm mb-1">{{ $t('labels.total') }}</div>
            <input v-model.number="form.grandTotal" type="number" class="w-full px-3 py-2 border rounded" />
          </label>
        </div>
        <div class="mt-4 flex gap-2 justify-end">
          <button @click="closeModal" class="px-4 py-2 rounded border">{{ $t('labels.cancel') }}</button>
          <button @click="saveEdit" class="px-4 py-2 rounded text-white bg-indigo-600 hover:bg-indigo-700">{{ $t('labels.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDeliveries } from '../../api'
import TableModal from '../shared/TableModal.vue'  // تأكد من المسار الصحيح

export default {
  name: 'SuppliesList',

  components: {
    TableModal
  },

  data() {
    return {
      supplies: [],
      modalOpen: false,
      form: {},
      page: 1,
      pageSize: 20,
      total: 0
    }
  },

  computed: {
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
    },
    isRTL() {
      return this.$i18n?.locale === 'ar'
    }
  },

  async mounted() {
    await this.loadSupplies()
  },

  methods: {
    async loadSupplies() {
      try {
        const res = await getDeliveries({
          page: this.page,
          pageSize: this.pageSize
        })
        this.supplies = Array.isArray(res.data.items) ? res.data.items : (Array.isArray(res.data) ? res.data : [])
        this.total = res.data.total || this.supplies.length
        this.pageSize = res.data.pageSize || this.pageSize
      } catch (e) {
        console.error('Error loading supplies:', e)
        this.supplies = []
        this.total = 0
      }
    },

    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.page = newPage
        this.loadSupplies()
      }
    },

    onPageSizeChange() {
      this.page = 1
      this.loadSupplies()
    },

    formatNumber(v) {
      return Number(v).toLocaleString(this.isRTL ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 })
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString(this.isRTL ? 'ar-EG' : 'en-US')
      } catch {
        return dateString
      }
    },

    calculateTotal(supply) {
      const capacity = parseFloat(supply.companyCapacity || supply.crusherCapacity || 0)
      const unitPrice = parseFloat(supply.unitPrice || 0)
      const discount = parseFloat(supply.discount || 0)
      return (capacity * unitPrice) - discount
    },

    openEdit(supply) {
      this.form = { ...supply }
      this.modalOpen = true
    },

    closeModal() {
      this.modalOpen = false
    },

    async saveEdit() {
      const idx = this.supplies.findIndex(s => s.id === this.form.id)
      if (idx !== -1) {
        this.supplies[idx] = { ...this.form }
      }
      this.modalOpen = false
      // TODO: استدعاء API للحفظ في الـ backend
    }
  }
}
</script>

<style scoped>
/* أي ستايل إضافي هنا إذا أردت */
</style>