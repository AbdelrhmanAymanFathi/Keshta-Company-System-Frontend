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
            <th class="p-3">{{ $t('labels.contractor') }}</th>
            <th class="p-3">{{ $t('labels.crusher') }}</th>
            <th class="p-3">{{ $t('labels.location') }}</th>
            <th class="p-3">{{ $t('labels.vehicle') }}</th>
            <th class="p-3">{{ $t('labels.crusherTicket') }}</th>
            <th class="p-3">{{ $t('labels.companyTicket') }}</th>
            <th class="p-3">{{ $t('labels.companyCapacity') }}</th>
            <th class="p-3">{{ $t('labels.crusherCapacity') }}</th>
            <th class="p-3">{{ $t('labels.unitPrice') }}</th>
            <th class="p-3">{{ $t('labels.discount') }}</th>
            <!-- <th class="p-3">{{ $t('labels.notes') }}</th> -->
            <th class="p-3">{{ $t('labels.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, idx) in supplies" :key="s.id" class="hover:bg-gray-50" @contextmenu.prevent="onRowContextMenu($event, s)">
            <td class="p-3">{{ (page - 1) * pageSize + idx + 1 }}</td>
            <td class="p-3">{{ formatDate(s.date) }}</td>
            <td class="p-3">{{ s.contractor?.name || '-' }}</td>
            <td class="p-3">{{ s.crusher?.name || '-' }}</td>
            <td class="p-3">{{ s.location?.name || '-' }}</td>
            <td class="p-3">{{ s.vehicle?.name || '-' }}</td>
            <td class="p-3">{{ s.crusherTicket || '-' }}</td>
            <td class="p-3">{{ s.companyTicket || '-' }}</td>
            <td class="p-3">{{ s.companyCapacity || '-' }}</td>
            <td class="p-3">{{ s.crusherCapacity || '-' }}</td>
            <td class="p-3">{{ s.unitPrice || '-' }}</td>
            <td class="p-3">{{ s.discount || '-' }}</td>
            <!-- <td class="p-3">{{ s.notes || '-' }}</td> -->
            <td class="p-3">
              <button @click="confirmDelete(s)" class="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700">
                {{ $t('labels.delete') }}
              </button>
            </td>
          </tr>
          <tr v-if="supplies.length === 0">
            <td class="p-3" :colspan="14" >
              {{ $t('supply.noExportsFound') || 'No exports found' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination
      v-if="totalPages > 1"
      :currentPage="page"
      :pageSize="pageSize"
      :total="total"
      :totalPages="totalPages"
      :pageSizeOptions="[10,20,50,100]"
      @update:page="(p) => { page = p; loadSupplies() }"
      @update:pageSize="(size) => { pageSize = size; page = 1; loadSupplies() }"
    />

    <!-- Context menu for row actions -->
    <div v-if="contextMenu.visible" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }" class="absolute z-50 bg-white border rounded shadow-md" @click.stop>
      <ul class="p-2">
        <li>
          <button @click="confirmDelete(contextMenu.item)" class="w-full text-left px-3 py-1 hover:bg-gray-100 text-sm text-red-600">{{ $t('labels.delete') }}</button>
        </li>
      </ul>
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
import { getDeliveries, deleteDelivery } from '../../api'
import TableModal from '../shared/TableModal.vue'  // تأكد من المسار الصحيح
import Pagination from '../shared/Pagination.vue'

export default {
  name: 'SuppliesList',

  components: {
    TableModal,
    Pagination
  },

  data() {
    return {
      supplies: [],
      modalOpen: false,
      form: {},
      page: 1,
      pageSize: 20,
      total: 0,
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        item: null
      }
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
    document.addEventListener('click', this.closeContextMenu)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closeContextMenu)
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

    onRowContextMenu(e, item) {
      this.contextMenu.visible = true
      // position relative to viewport
      this.contextMenu.x = e.clientX
      this.contextMenu.y = e.clientY
      this.contextMenu.item = item
    },

    closeContextMenu() {
      this.contextMenu.visible = false
      this.contextMenu.item = null
    },

    confirmDelete(item) {
      const confirmed = confirm(this.$t('supply.confirmDeleteExport') || 'Delete this export?')
      if (confirmed) {
        this.handleDelete(item.id)
      }
    },

    async handleDelete(id) {
      try {
        await deleteDelivery(id)
        // backend may return 204; just reload
        await this.loadSupplies()
      } catch (e) {
        console.error('Failed to delete export', e)
        alert(this.$t('common.deleteError') || 'Failed to delete')
      }
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