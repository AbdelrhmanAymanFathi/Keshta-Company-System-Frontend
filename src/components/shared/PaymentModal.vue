<template>
  <div v-if="visible" class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
      <div class="space-y-3">
        <div>
          <label class="block text-sm text-gray-700">{{ $t('payments.amount') }}</label>
          <input v-model="form.amount" type="number" step="0.01" class="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label class="block text-sm text-gray-700">{{ $t('payments.date') }}</label>
          <input v-model="form.date" type="datetime-local" class="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label class="block text-sm text-gray-700">{{ $t('payments.notes') }}</label>
          <textarea v-model="form.notes" class="w-full border rounded px-2 py-1"></textarea>
        </div>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <button @click="$emit('close')" class="px-3 py-1 border rounded">{{ $t('labels.cancel') }}</button>
        <button @click="submit" :disabled="submitting" class="bg-green-600 text-white px-3 py-1 rounded">
          {{ submitting ? $t('labels.saving') : $t('payments.savePayment') }}
        </button>
      </div>
      <div v-if="error" class="text-red-600 mt-3">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import { createPayment } from '@/api'
export default {
  name: 'PaymentModal',
  props: {
    visible: { type: Boolean, default: false },
    parentType: { type: String, default: 'export' }, // 'export' or 'transport'
    parentId: { type: [String, Number], default: null }
  },
  data() {
    return {
      form: {
        amount: '',
        date: new Date().toISOString().slice(0,16),
        notes: ''
      },
      submitting: false,
      error: ''
    }
  },
  computed: {
    title() {
      return this.parentType === 'export' ? this.$t('payments.addPaymentExport') : this.$t('payments.addPaymentTransport')
    }
  },
  methods: {
    async submit() {
      this.error = ''
      if (!this.form.amount || Number(this.form.amount) <= 0) {
        this.error = this.$t('payments.invalidAmount')
        return
      }
      const payload = {
        amount: String(Number(this.form.amount).toFixed(2)),
        date: new Date(this.form.date).toISOString(),
        notes: this.form.notes || undefined
      }
      if (this.parentType === 'export') payload.exportId = Number(this.parentId)
      else payload.transportId = Number(this.parentId)

      this.submitting = true
      try {
        const res = await createPayment(payload)
        this.$emit('saved', res.data)
        this.$emit('close')
      } catch (e) {
        console.error('createPayment error', e)
        this.error = e?.response?.data?.message || e.message || this.$t('payments.createFailed')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>
