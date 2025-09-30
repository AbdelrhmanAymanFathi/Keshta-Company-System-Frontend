<template>
  <div class="space-y-6">
    <!-- Header with Add Button -->
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900">{{ $t('transport.transportList') }}</h3>
      <button @click="showAddModal = true" 
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        {{ $t('transport.addTransport') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">{{ $t('common.error') }}</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Transport Table -->
    <div v-else-if="transports.length > 0" class="bg-white shadow-sm rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('transport.date') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('transport.contractor') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('transport.route') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('transport.trips') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('transport.distance') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('transport.total') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('common.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transport in transports" :key="transport.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(transport.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ transport.contractor?.name || '-' }}</div>
                <div class="text-sm text-gray-500">{{ transport.contractor?.phone || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ transport.fromLoc }} → {{ transport.toLoc }}</div>
                <div class="text-sm text-gray-500">{{ transport.vehicleName }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ transport.numTrips }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ transport.distanceKm }} km
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ formatCurrency(transport.total) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button @click="editTransport(transport)" 
                          class="text-indigo-600 hover:text-indigo-900">
                    {{ $t('common.edit') }}
                  </button>
                  <button @click="deleteTransport(transport.id)" 
                          class="text-red-600 hover:text-red-900">
                    {{ $t('common.delete') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('transport.noTransports') }}</h3>
      <p class="mt-1 text-sm text-gray-500">{{ $t('transport.noTransportsDesc') }}</p>
      <div class="mt-6">
        <button @click="showAddModal = true" 
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          {{ $t('transport.addTransport') }}
        </button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <NewTransport 
      v-if="showAddModal" 
      :transport="editingTransport"
      @close="closeModal"
      @saved="handleTransportSaved"
    />
  </div>
</template>

<script>
import { getTransports, deleteTransport } from '@/api'
import NewTransport from './NewTransport.vue'

export default {
  name: 'TransportList',
  components: { NewTransport },
  data() {
    return {
      transports: [],
      loading: false,
      error: null,
      showAddModal: false,
      editingTransport: null
    }
  },
  async mounted() {
    await this.loadTransports()
  },
  methods: {
    async loadTransports() {
      this.loading = true
      this.error = null
      try {
        const response = await getTransports()
        this.transports = response.data.items || []
      } catch (error) {
        this.error = error.response?.data?.message || this.$t('common.loadError')
        console.error('Error loading transports:', error)
      } finally {
        this.loading = false
      }
    },

    async deleteTransport(id) {
      if (!confirm(this.$t('transport.confirmDelete'))) return
      
      try {
        await deleteTransport(id)
        this.transports = this.transports.filter(t => t.id !== id)
        this.$toast?.success(this.$t('transport.deletedSuccessfully'))
      } catch (error) {
        this.error = error.response?.data?.message || this.$t('common.deleteError')
        console.error('Error deleting transport:', error)
      }
    },

    editTransport(transport) {
      this.editingTransport = transport
      this.showAddModal = true
    },

    closeModal() {
      this.showAddModal = false
      this.editingTransport = null
    },

    handleTransportSaved() {
      this.closeModal()
      this.loadTransports()
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP'
      }).format(amount)
    }
  }
}
</script>
