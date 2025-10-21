<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-6">
    <h2 class="text-2xl font-semibold mb-4">{{ $t('dashboard.suppliesList') }}</h2>
    <div class="overflow-auto bg-white rounded shadow">
      <table class="min-w-full divide-y">
        <thead class="bg-indigo-50">
          <tr>
            <th class="p-3">#</th>
            <th class="p-3">{{ $t('labels.date') }}</th>
            <th class="p-3">{{ $t('labels.location') }}</th>
            <th class="p-3">{{ $t('labels.crusher') }}</th>
            <th class="p-3">{{ $t('labels.contractor') }}</th>
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
            <td class="p-3">{{ formatNumber(calculateTotal(s)) }}</td>
            <td class="p-3">
              <button @click="openEdit(s)" class="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700">{{ $t('labels.edit') }}</button>
            </td>
          </tr>
          <tr v-if="supplies.length === 0">
            <td class="p-3" colspan="7">{{ $t('dashboard.suppliesList') }}: {{ $t('contractors.noResults') }}</td>
          </tr>
        </tbody>
      </table>
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

export default {
  name: 'SuppliesList',
  data() {
    return {
      supplies: [],
      modalOpen: false,
      form: {}
    }
  },
  computed: {
    isRTL() { return this.$i18n && this.$i18n.locale === 'ar' }
  },
  async mounted() {
    try {
      const res = await getDeliveries();
      // Handle the new response structure with items array
      this.supplies = Array.isArray(res.data.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      this.supplies = [];
    }
  },
  methods: {
    formatNumber(v) {
      return Number(v).toLocaleString(this.isRTL ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 })
    },
    formatDate(dateString) {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString()
      } catch (error) {
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
      this.form = Object.assign({}, supply)
      this.modalOpen = true
    },
    closeModal() {
      this.modalOpen = false
    },
    async saveEdit() {
      // You may need to call an API to update the supply, e.g. PATCH /api/exports/:id
      // For now, just update locally
      const idx = this.supplies.findIndex(s => s.id === this.form.id)
      if (idx !== -1) this.supplies.splice(idx, 1, Object.assign({}, this.form))
      this.modalOpen = false
      // TODO: call backend to persist changes if needed
    }
  }
}
</script>

<style scoped>
/* ...existing code... */
</style>
