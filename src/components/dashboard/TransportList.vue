<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="space-y-6 p-6">
    <!-- Header with Add Button -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-semibold mb-6 text-gray-800">{{ $t('transport.transportList') }}</h2>
      <button @click="showAddModal = true"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
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
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="mr-3"> <!-- mr بدل ml في RTL -->
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
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('transport.date') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('transport.contractor') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('transport.route') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('transport.category') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('transport.trips') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('transport.distance') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('transport.vehicleCapacity') || 'Capacity' }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('transport.rate') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('transport.discount') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('transport.total') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('common.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transport in transports" :key="transport.id" class="hover:bg-gray-50 cursor-pointer"
              @contextmenu.prevent="openContextMenu($event, transport)">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" :class="isRTL ? 'text-right' : 'text-left'">
                {{ formatDate(transport.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap" :class="isRTL ? 'text-right' : 'text-left'">
                <div class="text-sm font-medium text-gray-900">{{ transport.contractor?.name || '-' }}</div>
                <div class="text-sm text-gray-500">{{ transport.contractor?.phone || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap" :class="isRTL ? 'text-right' : 'text-left'">
                <div class="text-sm text-gray-900">{{ transport.fromLoc }} → {{ transport.toLoc }}</div>
                <div class="text-sm text-gray-500">{{ getVehicleDisplay(transport) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                {{ transport.category?.trim() || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{{ transport.numTrips }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{{ transport.distanceKm }} km
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                {{ transport.vehicleCubicCapacity != null ? transport.vehicleCubicCapacity : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                {{ formatCurrency(transport.rate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                <span :class="parseFloat(transport.discount) > 0 ? 'text-red-600 font-medium' : 'text-gray-500'">
                  {{ transport.discount }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                {{ formatCurrency(transport.total) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex gap-3" :class="isRTL ? 'justify-start' : 'justify-end'">
                  <button @click.stop="editTransport(transport)" class="text-indigo-600 hover:text-indigo-900"
                    :title="$t('common.edit')">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click.stop="deleteTransport(transport.id)" class="text-red-600 hover:text-red-900"
                    :title="$t('common.delete')">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Use shared Pagination component -->
      <Pagination :current-page="page" :page-size="pageSize" :total="total" :total-pages="totalPages"
        @update:page="changePage" @update:pageSize="onPageSizeChange" />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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

    <!-- Context Menu (Right-click) -->
    <div v-if="contextMenu.open" class="fixed bg-white rounded-lg shadow-lg py-2 z-50 border min-w-[120px]"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }" @contextmenu.prevent>
      <button @click="contextAction('edit')" class="block w-full px-4 py-2 text-sm hover:bg-gray-100"
        :class="isRTL ? 'text-right' : 'text-left'">
        {{ $t('common.edit') }}
      </button>
      <button @click="contextAction('delete')" class="block w-full px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
        :class="isRTL ? 'text-right' : 'text-left'">
        {{ $t('common.delete') }}
      </button>
    </div>

    <!-- Add/Edit Modal -->
    <NewTransport v-if="showAddModal" :transport="editingTransport" @close="closeModal" @saved="handleTransportSaved" />
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

    onMounted(() => load())

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
      editingTransport: null,
      contextMenu: { open: false, x: 0, y: 0, item: null }
    }
  },
  computed: {
    isRTL() {
      return this.$i18n?.locale === 'ar'
    }
  },
  mounted() {
    document.addEventListener('click', this.closeContextMenu)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeContextMenu)
  },
  methods: {
    async loadTransports() {
      this.error = null
      try {
        await this.reloadTransports()
      } catch (err) {
        this.error = err.response?.data?.message || this.$t('common.loadError')
        console.error('Error loading transports:', err)
      }
    },
    async changePage(newPage) {
      this.setPage(newPage)
      await this.loadTransports()
    },
    async onPageSizeChange(newSize) {
      this.setPageSize(newSize)
      await this.loadTransports()
    },
    async deleteTransport(id) {
      if (!confirm(this.$t('transport.confirmDelete'))) return
      try {
        await deleteTransport(id)
        // Remove locally and reload to keep consistency
        await this.loadTransports()
        this.$toast?.success(this.$t('transport.deletedSuccessfully'))
      } catch (err) {
        this.error = err.response?.data?.message || this.$t('common.deleteError')
        console.error('Error deleting transport:', err)
      }
    },
    editTransport(transport) {
      this.editingTransport = { ...transport } // Clone to avoid mutation issues
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
      const date = new Date(dateString)

      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()

      return `${day}/${month}/${year}`
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', { // Use 'en-US' for consistent formatting
        style: 'currency',
        currency: 'EGP'
      }).format(amount)
    },
    getVehicleDisplay(transport) {
      // Show vehicle name if available, otherwise show capacity
      if (transport.vehicleName) {
        return transport.vehicleName
      }
      if (transport.vehicleCubicCapacity) {
        return `${transport.vehicleCubicCapacity} م³`
      }
      return '-'
    },
    // Context Menu
    openContextMenu(event, item) {
      this.contextMenu = {
        open: true,
        x: event.clientX,
        y: event.clientY,
        item
      }
    },
    closeContextMenu() {
      this.contextMenu.open = false
    },
    contextAction(action) {
      if (action === 'edit') {
        this.editTransport(this.contextMenu.item)
      } else if (action === 'delete') {
        this.deleteTransport(this.contextMenu.item.id)
      }
      this.closeContextMenu()
    }
  }
}
</script>

<style scoped>
/* Optional: improve RTL table alignment if needed */
[dir="rtl"] table th,
[dir="rtl"] table td {
  text-align: right;
}
</style>