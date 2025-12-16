<template>
  <div class="space-y-6">
    <!-- Header with Add Button -->
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900">{{ $t('transport.transportList') }}</h3>
      <div class="flex items-center gap-2">
        <button @click="showAddModal = true" 
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          {{ $t('transport.addTransport') }}
        </button>
      </div>
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
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('transport.date') }}
              </th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('transport.contractor') }}
              </th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('transport.route') }}
              </th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('transport.trips') }}
              </th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('transport.distance') }}
              </th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('transport.total') }}
              </th>
              <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                <div class="text-sm text-gray-500">{{ transport.vehicleName || '-' }}</div>
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

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414zm6 0a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
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
import { onMounted } from 'vue'
import { getTransports, deleteTransport } from '@/api'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/shared/Pagination.vue'
import NewTransport from './NewTransport.vue'

export default {
  name: 'TransportList',
  components: { NewTransport, Pagination },
  setup() {
    const fetchTransports = (page, pageSize, extra = {}) =>
      getTransports({ page, pageSize, ...extra })

    const {
      items,
      page,
      pageSize,
      total,
      totalPages,
      loading,
      load,
      setPage,
      setPageSize
    } = usePagination(fetchTransports, {
      initialPage: 1,
      initialPageSize: 20,
      resourceName: 'transports'
    })

    onMounted(() => {
      load()
    })

    return {
      transports: items,
      page,
      pageSize,
      total,
      totalPages,
      loading,
      setPage,
      setPageSize,
      reloadTransports: load
    }
  },
  data() {
    return {
      error: null,
      showAddModal: false,
      editingTransport: null
    }
  },
  methods: {
    async loadTransports() {
      this.error = null
      try {
        await this.reloadTransports()
      } catch (error) {
        this.error = error.response?.data?.message || this.$t('common.loadError')
        console.error('Error loading transports:', error)
      }
    },
    async changePage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.setPage(newPage)
        await this.loadTransports()
      }
    },
    async onPageSizeChange(newSize) {
      this.setPageSize(newSize)
      await this.loadTransports()
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

    async handleTransportSaved() {
      this.closeModal()
      await this.loadTransports()
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
