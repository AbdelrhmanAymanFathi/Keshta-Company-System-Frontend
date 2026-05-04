<template>
  <teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex z-100 items-center justify-center" style="z-index: 150;">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h2 class="text-lg font-bold mb-4">{{ $t('vehicles.addNewContractor') }}</h2>
        
        <form @submit.prevent="onSubmit" class="space-y-4">
          <!-- Name field - full width -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('vehicles.contractorName') || 'Contractor Name' }}
            </label>
            <input 
              v-model="form.name" 
              type="text" 
              :placeholder="$t('vehicles.contractorNamePlaceholder') || 'Enter contractor name'"
              class="w-full border rounded px-3 py-2"
              data-contractor-modal
              required
              autofocus
            />
          </div>

          <!-- Phone, Bank Name, Account Number - 3 columns on large screens -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('contractors.phone') || 'Phone' }}
              </label>
              <input 
                v-model="form.phone" 
                type="tel" 
                :placeholder="$t('contractors.phone') || 'Phone number'"
                class="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('contractors.bankName') || 'Bank Name' }}
              </label>
              <input 
                v-model="form.bankName" 
                type="text" 
                :placeholder="$t('contractors.bankName') || 'Bank name'"
                class="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('contractors.accountNumber') || 'Account Number' }}
              </label>
              <input 
                v-model="form.accountNumber" 
                type="text" 
                :placeholder="$t('contractors.accountNumber') || 'Account number'"
                class="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <!-- Opening Balance and Notes - 2 columns on large screens -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('contractors.openingBalance') || 'Opening Balance' }}
              </label>
              <input 
                v-model="form.openingBalance" 
                type="number" 
                step="0.01"
                :placeholder="$t('contractors.openingBalance') || 'Opening balance'"
                class="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('labels.notes') || 'Notes' }}
              </label>
              <textarea 
                v-model="form.notes" 
                :placeholder="$t('labels.notes') || 'Notes'"
                class="w-full border rounded px-3 py-2 resize-none"
                rows="3"
              />
            </div>
          </div>

          <div class="flex gap-3 justify-end">
            <button 
              type="button" 
              @click="onCancel"
              class="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
              :disabled="loading"
            >
              {{ $t('labels.cancel') }}
            </button>
            <button 
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              :disabled="loading"
            >
              {{ loading ? $t('labels.saving') : $t('labels.create') }}
            </button>
          </div>

          <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
        </form>
      </div>
    </div>
  </teleport>
</template>

<script>
import { createContractor } from '../../../api'

export default {
  name: 'CreateContractorModal',
  emits: ['created', 'cancel'],
  props: {
    isOpen: { type: Boolean, default: false },
    mode: { type: String, default: 'transport', validator: v => ['supply', 'transport', 'equipment'].includes(v) }
  },
  data() {
    return {
      form: {
        name: '',
        phone: '',
        bankName: '',
        accountNumber: '',
        openingBalance: '',
        notes: ''
      },
      loading: false,
      error: ''
    }
  },
  methods: {
    async onSubmit() {
      this.error = ''
      const name = this.form.name?.trim()
      if (!name) {
        this.error = this.$t('vehicles.contractorNameRequired') || 'Contractor name is required'
        return
      }

      this.loading = true
      try {
        const payload = { name }
        
        if (this.form.phone?.trim()) payload.phone = this.form.phone.trim()
        if (this.form.bankName?.trim()) payload.bankName = this.form.bankName.trim()
        if (this.form.accountNumber?.trim()) payload.accountNumber = this.form.accountNumber.trim()
        if (this.form.openingBalance !== '' && this.form.openingBalance !== null) payload.openingBalance = Number(this.form.openingBalance)
        if (this.form.notes?.trim()) payload.notes = this.form.notes.trim()
        
        // Set availability flag based on mode
        if (this.mode === 'supply') {
          payload.availableForSupplies = true
        } else if (this.mode === 'transport') {
          payload.availableForTransports = true
        } else if (this.mode === 'equipment') {
          payload.availableForEquipmentRental = true
        } else if (this.mode === 'extract') {
          payload.availableForExtracts = true
        }
        
        const response = await createContractor(payload)
        const createdList = response.normalized || (Array.isArray(response.data) ? response.data : [response.data])
        const created = createdList[0]
        
        this.$emit('created', created)
        this.resetForm()
      } catch (e) {
        this.error = e?.response?.data?.message || this.$t('vehicles.contractorCreateError') || 'Error creating contractor'
        if (window.$toast) {
          window.$toast(this.error, 'error', 5000)
        }
      } finally {
        this.loading = false
      }
    },
    onCancel() {
      this.$emit('cancel')
      this.resetForm()
    },
    resetForm() {
      this.form = {
        name: '',
        phone: '',
        bankName: '',
        accountNumber: '',
        openingBalance: '',
        notes: ''
      }
      this.error = ''
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.resetForm()
        this.$nextTick(() => {
          document.querySelector('input[data-contractor-modal]')?.focus()
        })
      }
    }
  }
}
</script>
