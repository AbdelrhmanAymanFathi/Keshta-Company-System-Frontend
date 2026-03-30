<template>
  <teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex z-100 items-center justify-center" style="z-index: 150;">
      <div class="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full">
        <h2 class="text-lg font-bold mb-4">{{ $t('vehicles.addNewContractor') }}</h2>
        
        <form @submit.prevent="onSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('vehicles.contractorName') || 'Contractor Name' }}
            </label>
            <input 
              v-model="contractorName" 
              type="text" 
              :placeholder="$t('vehicles.contractorNamePlaceholder') || 'Enter contractor name'"
              class="w-full border rounded px-3 py-2"
              data-contractor-modal
              required
              autofocus
            />
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
    isOpen: { type: Boolean, default: false }
  },
  data() {
    return {
      contractorName: '',
      loading: false,
      error: ''
    }
  },
  methods: {
    async onSubmit() {
      this.error = ''
      if (!this.contractorName.trim()) {
        this.error = this.$t('vehicles.contractorNameRequired') || 'Contractor name is required'
        return
      }

      this.loading = true
      try {
        const response = await createContractor({ name: this.contractorName.trim() })
        const createdList = response.normalized || (Array.isArray(response.data) ? response.data : [response.data])
        const created = createdList.find(c => c.availableForTransports) || createdList[0]
        
        this.$emit('created', created)
        this.contractorName = ''
        this.error = ''
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
      this.contractorName = ''
      this.error = ''
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.contractorName = ''
        this.error = ''
        this.$nextTick(() => {
          document.querySelector('input[data-contractor-modal]')?.focus()
        })
      }
    }
  }
}
</script>
