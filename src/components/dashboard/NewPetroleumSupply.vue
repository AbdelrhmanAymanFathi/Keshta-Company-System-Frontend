<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'">
    <div class="flex items-start justify-between mb-4">
      <h3 class="text-lg font-semibold">{{ supplyId ? $t('labels.update') : $t('labels.add') }} — {{ $t('dashboard.newPetroleumSupply') }}</h3>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label>
        <div class="text-sm mb-1">{{ $t('petroleum.date') }}</div>
        <input type="date" v-model="form.date" class="w-full px-3 py-2 border rounded" />
      </label>

      <label>
        <div class="text-sm mb-1">{{ $t('petroleum.productName') }}</div>
        <input v-model="form.productName" class="w-full px-3 py-2 border rounded" />
      </label>

      <label>
        <div class="text-sm mb-1">{{ $t('labels.location') }}</div>
        <select v-model="form.warehouseId" class="w-full px-3 py-2 border rounded">
          <option :value="null">—</option>
          <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
        </select>
      </label>

      <label>
        <div class="text-sm mb-1">{{ $t('petroleum.supplyPermitNo') }}</div>
        <input v-model="form.supplyPermitNo" class="w-full px-3 py-2 border rounded" />
      </label>

      <label>
        <div class="text-sm mb-1">{{ $t('petroleum.loadTons') }}</div>
        <input type="number" step="any" v-model.number="form.loadTons" class="w-full px-3 py-2 border rounded" />
      </label>

      <label>
        <div class="text-sm mb-1">{{ $t('petroleum.tonPrice') }}</div>
        <input type="number" step="any" v-model.number="form.tonPrice" class="w-full px-3 py-2 border rounded" />
      </label>

      <label>
        <div class="text-sm mb-1">{{ $t('petroleum.supplyTo') }}</div>
        <input v-model="form.supplyTo" class="w-full px-3 py-2 border rounded" />
      </label>

      <label>
        <div class="text-sm mb-1">{{ $t('petroleum.supplier') }}</div>
        <select v-model="form.supplierId" class="w-full px-3 py-2 border rounded">
          <option :value="null">—</option>
          <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </label>

      <label>
        <div class="text-sm mb-1">{{ $t('petroleum.vehicleNumber') }}</div>
        <input v-model="form.vehicleNumber" class="w-full px-3 py-2 border rounded" />
      </label>

      <label>
        <div class="text-sm mb-1">{{ $t('petroleum.paymentMethod') }}</div>
        <input v-model="form.paymentMethod" class="w-full px-3 py-2 border rounded" />
      </label>

      <label>
        <div class="text-sm mb-1">{{ $t('petroleum.settlementDate') }}</div>
        <input type="date" v-model="form.settlementDate" class="w-full px-3 py-2 border rounded" />
      </label>

      <label>
        <div class="text-sm mb-1">{{ $t('petroleum.transportContractor') }}</div>
        <select v-model="form.transportContractorId" class="w-full px-3 py-2 border rounded">
          <option :value="null">—</option>
          <option v-for="c in contractors" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </label>

      <label>
        <div class="text-sm mb-1">{{ $t('petroleum.transportPricePerTon') }}</div>
        <input type="number" step="any" v-model.number="form.transportPricePerTon" class="w-full px-3 py-2 border rounded" />
      </label>

      <label class="md:col-span-2">
        <div class="text-sm mb-1">{{ $t('petroleum.notes') }}</div>
        <textarea v-model="form.notes" class="w-full px-3 py-2 border rounded" rows="3"></textarea>
      </label>

      <div class="md:col-span-2 flex gap-4 justify-end">
        <div class="space-y-1 text-sm mr-auto">
          <div><span class="font-medium">{{ $t('petroleum.supplierDue') }}:</span> {{ formatCurrency(supplierDue) }}</div>
          <div><span class="font-medium">{{ $t('petroleum.transportTotal') }}:</span> {{ formatCurrency(transportTotal) }}</div>
        </div>

        <button @click="$emit('cancel')" class="px-4 py-2 border rounded">{{ $t('labels.cancel') }}</button>
        <button @click="save" :disabled="saving" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{{ saving ? $t('labels.saving') : $t('labels.save') }}</button>
      </div>

      <div v-if="saveError" class="md:col-span-2 text-sm text-red-600">{{ saveError }}</div>
    </div>
  </div>
</template>

<script>
import { getPetroleumSupply, createPetroleumSupply, updatePetroleumSupply, getSuppliers, getLocations, getContractors } from '@/api'

export default {
  name: 'NewPetroleumSupply',
  props: { supplyId: { type: [Number, String], default: null } },
  data() {
    return {
      form: {
        date: '',
        productName: '',
        warehouseId: null,
        supplyPermitNo: '',
        loadTons: 0,
        tonPrice: 0,
        supplyTo: '',
        supplierId: null,
        vehicleNumber: '',
        paymentMethod: '',
        settlementDate: '',
        transportContractorId: null,
        transportPricePerTon: 0,
        notes: ''
      },
      warehouses: [],
      suppliers: [],
      contractors: [],
      saving: false,
      saveError: null
    }
  },
  computed: {
    isRTL() { return this.$i18n && this.$i18n.locale === 'ar' },
    supplierDue() { return (Number(this.form.loadTons || 0) * Number(this.form.tonPrice || 0)) || 0 },
    transportTotal() { return (Number(this.form.loadTons || 0) * Number(this.form.transportPricePerTon || 0)) || 0 }
  },
  async mounted() {
    await this.loadLookups()
    if (this.supplyId) await this.loadSupply()
  },
  methods: {
    async loadLookups() {
      try {
        const locs = await getLocations()
        this.warehouses = locs.data || []
      } catch (e) { this.warehouses = [] }

      try {
        const resp = await getSuppliers({ pageSize: 200 })
        this.suppliers = Array.isArray(resp.data.items) ? resp.data.items : (Array.isArray(resp.data) ? resp.data : [])
      } catch (e) { this.suppliers = [] }

      try {
        const ctr = await getContractors({ pageSize: 200 })
        this.contractors = Array.isArray(ctr.data.items) ? ctr.data.items : (Array.isArray(ctr.data) ? ctr.data : [])
      } catch (e) { this.contractors = [] }
    },
    async loadSupply() {
      try {
        const resp = await getPetroleumSupply(this.supplyId)
        const data = resp.data || {}
        // Map backend fields to form fields (assume names match)
        Object.assign(this.form, {
          date: data.date ? data.date.split('T')[0] : data.date,
          productName: data.productName,
          warehouseId: data.warehouseId,
          supplyPermitNo: data.supplyPermitNo,
          loadTons: data.loadTons,
          tonPrice: data.tonPrice,
          supplyTo: data.supplyTo,
          supplierId: data.supplierId,
          vehicleNumber: data.vehicleNumber,
          paymentMethod: data.paymentMethod,
          settlementDate: data.settlementDate ? data.settlementDate.split('T')[0] : data.settlementDate,
          transportContractorId: data.transportContractorId,
          transportPricePerTon: data.transportPricePerTon,
          notes: data.notes
        })
      } catch (err) {
        // ignore
      }
    },
    async save() {
      this.saveError = null
      // basic validation
      if (!this.form.date || !this.form.productName || !this.form.warehouseId || !this.form.supplyPermitNo || !this.form.loadTons || !this.form.tonPrice || !this.form.supplyTo || !this.form.supplierId) {
        this.saveError = this.$t('common.saveError') + ': ' + this.$t('labels.required')
        return
      }

      // transport contractor required if transportPricePerTon is set
      if (this.form.transportPricePerTon && !this.form.transportContractorId) {
        this.saveError = this.$t('common.saveError') + ': transport contractor is required when transport price is set'
        return
      }

      this.saving = true
      try {
        if (this.supplyId) {
          await updatePetroleumSupply(this.supplyId, this.form)
        } else {
          await createPetroleumSupply(this.form)
        }
        this.$emit('saved')
      } catch (err) {
        console.error('Error saving petroleum supply:', err)
        this.saveError = err.response?.data?.message || this.$t('common.saveError')
      } finally {
        this.saving = false
      }
    }
    ,
    formatCurrency(v) {
      return Number(v || 0).toLocaleString(this.isRTL ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' })
    },
    formatNumber(v) {
      return Number(v || 0).toLocaleString(this.isRTL ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 })
    }
  }
}
</script>
