<template>
  <div class="space-y-6">
    <!-- Header with Search, Filter and Add Button -->
    <div class="flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div class="flex-1 w-full sm:w-auto">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ $t('rental.rentalList') }}</h3>
          <!-- Search Bar -->
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input 
              :value="rentalsStore.filters.q" 
              @input="onSearchInput"
              type="text" 
              :placeholder="$t('rental.searchPlaceholder')"
              class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
            <div v-if="rentalsStore.filters.q" class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button @click="clearSearch" class="text-gray-400 hover:text-gray-600" aria-label="Clear search">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ $t('rental.searchBy') }}</p>
        </div>
        
        <button @click="openAddModal" 
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition whitespace-nowrap">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          {{ $t('rental.addRental') }}
        </button>
      </div>

      <!-- Filter Bar -->
      <div class="flex flex-wrap items-center gap-3 bg-gray-50 rounded-lg p-3">
        <span class="text-sm font-medium text-gray-700">{{ $t('rental.filterBy') }}:</span>
        <div class="flex gap-2">
          <button
            @click="setCompanyOwnedFilter(null)"
            :class="[
              'px-3 py-1 rounded-md text-sm font-medium transition',
              rentalsStore.filters.isCompanyOwned === null
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            ]"
          >
            {{ $t('rental.all') }}
          </button>
          <button
            @click="setCompanyOwnedFilter(true)"
            :class="[
              'px-3 py-1 rounded-md text-sm font-medium transition',
              rentalsStore.filters.isCompanyOwned === true
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            ]"
          >
            {{ $t('rental.companyEquipment') }}
          </button>
          <button
            @click="setCompanyOwnedFilter(false)"
            :class="[
              'px-3 py-1 rounded-md text-sm font-medium transition',
              rentalsStore.filters.isCompanyOwned === false
                ? 'bg-gray-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            ]"
          >
            {{ $t('rental.externalRental') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="bg-gray-50 rounded-lg p-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div class="text-sm text-gray-600">
          {{ $t('rental.totalRentals') }}: <span class="font-semibold">{{ rentalsStore.total }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <label>{{ $t('rental.pageSize') }}:</label>
          <select :value="rentalsStore.pageSize" @change="onPageSizeChange" 
            class="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="rentalsStore.loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="rentalsStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="text-red-800">{{ rentalsStore.error }}</span>
      </div>
    </div>

    <!-- Rentals Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <!-- No Results Message -->
      <div v-if="rentalsStore.items.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('rental.noResults') }}</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ rentalsStore.filters.q ? $t('rental.searchBy') : 'Get started by creating a new rental.' }}
        </p>
        <div v-if="!rentalsStore.filters.q" class="mt-6">
          <button @click="openAddModal" 
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            {{ $t('rental.addRental') }}
          </button>
        </div>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('rental.date') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('rental.equipment') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('rental.name') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('rental.type') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('rental.hours') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('rental.hourlyRate') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('rental.total') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('rental.notes') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('labels.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="rental in rentalsStore.items" :key="rental.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(rental.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ rental.equipment }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ rental.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <Badge :variant="rental.isCompanyOwned ? 'company' : 'external'">
                  {{ rental.isCompanyOwned ? $t('rental.companyEquipment') : $t('rental.externalRental') }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ rental.hours }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatCurrency(rental.hourlyRate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {{ formatCurrency(rental.total) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                {{ rental.notes || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2">
                  <button @click="openEditModal(rental)" 
                    class="text-indigo-600 hover:text-indigo-900 transition">
                    {{ $t('labels.edit') }}
                  </button>
                  <button @click="confirmDelete(rental)" 
                    class="text-red-600 hover:text-red-900 transition">
                    {{ $t('labels.delete') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Enhanced Pagination -->
      <div v-if="rentalsStore.totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <!-- Mobile Pagination -->
        <div class="flex-1 flex justify-between sm:hidden">
          <button @click="changePage(rentalsStore.page - 1)" 
            :disabled="rentalsStore.page <= 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ $t('labels.previous') }}
          </button>
          <span class="text-sm text-gray-700 self-center">
            {{ rentalsStore.page }} / {{ rentalsStore.totalPages }}
          </span>
          <button @click="changePage(rentalsStore.page + 1)" 
            :disabled="rentalsStore.page >= rentalsStore.totalPages"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ $t('labels.next') }}
          </button>
        </div>

        <!-- Desktop Pagination -->
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <p class="text-sm text-gray-700">
              {{ $t('labels.showing') }} 
              <span class="font-medium">{{ ((rentalsStore.page - 1) * rentalsStore.pageSize) + 1 }}</span>
              {{ $t('labels.to') }}
              <span class="font-medium">{{ Math.min(rentalsStore.page * rentalsStore.pageSize, rentalsStore.total) }}</span>
              {{ $t('labels.of') }}
              <span class="font-medium">{{ rentalsStore.total }}</span>
              {{ $t('labels.results') }}
            </p>
          </div>

          <!-- Page Numbers -->
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button @click="changePage(1)" 
                :disabled="rentalsStore.page <= 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
              </button>

              <button @click="changePage(rentalsStore.page - 1)" 
                :disabled="rentalsStore.page <= 1"
                class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>

              <template v-for="page in visiblePages" :key="page">
                <button @click="changePage(page)" 
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    page === rentalsStore.page 
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' 
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  ]">
                  {{ page }}
                </button>
              </template>

              <button @click="changePage(rentalsStore.page + 1)" 
                :disabled="rentalsStore.page >= rentalsStore.totalPages"
                class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>

              <button @click="changePage(rentalsStore.totalPages)" 
                :disabled="rentalsStore.page >= rentalsStore.totalPages"
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

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="closeModal">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white m-4">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ isEditing ? $t('rental.editRental') : $t('rental.addRental') }}
          </h3>
          
          <RentalForm
            :model-value="form.value"
            :loading="saving"
            :is-editing="isEditing"
            @update:model-value="updateForm"
            @submit="saveRental"
            @cancel="closeModal"
          />
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmDialog
      :show="showDeleteModal"
      :title="$t('rental.deleteRental')"
      :message="$t('rental.deleteConfirmation')"
      :loading="deleting"
      type="danger"
      @confirm="deleteRental"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRentalsStore } from '@/stores/useRentalsStore'
import RentalForm from './RentalForm.vue'
import Badge from '../shared/Badge.vue'
import ConfirmDialog from '../shared/ConfirmDialog.vue'

export default {
  name: 'RentalList',
  components: { RentalForm, Badge, ConfirmDialog },
  setup() {
    const rentalsStore = useRentalsStore()
    const showModal = ref(false)
    const showDeleteModal = ref(false)
    const isEditing = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const rentalToDelete = ref(null)
    const searchTimeout = ref(null)

    const form = ref({
      id: null,
      date: new Date().toISOString().split('T')[0],
      equipment: '',
      name: '',
      hours: 0,
      hourlyRate: 0,
      total: 0,
      notes: '',
      isCompanyOwned: true
    })

    const visiblePages = computed(() => {
      const current = rentalsStore.page
      const total = rentalsStore.totalPages
      const delta = 2
      
      let start = Math.max(1, current - delta)
      let end = Math.min(total, current + delta)
      
      if (current <= delta) {
        end = Math.min(total, 2 * delta + 1)
      }
      if (current >= total - delta) {
        start = Math.max(1, total - 2 * delta)
      }
      
      const pages = []
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    const onSearchInput = (event) => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }

      searchTimeout.value = setTimeout(() => {
        // update the store filter; a watcher on the specific filter keys
        // will trigger fetchRentals. Avoid calling fetchRentals here to
        // prevent redundant/recursive triggers.
        rentalsStore.setSearchQuery(event.target.value)
      }, 500)
    }

    const clearSearch = () => {
      // update filter only; watcher will fetch results
      rentalsStore.setSearchQuery('')
    }

    const setCompanyOwnedFilter = (value) => {
      // update filter only; watcher will fetch results
      rentalsStore.setCompanyOwnedFilter(value)
    }

    const changePage = (page) => {
      if (page >= 1 && page <= rentalsStore.totalPages) {
        rentalsStore.setPage(page)
        rentalsStore.fetchRentals()
      }
    }

    const onPageSizeChange = (event) => {
      rentalsStore.setPageSize(parseInt(event.target.value))
      rentalsStore.fetchRentals()
    }

    const openAddModal = () => {
      isEditing.value = false
      form.value = {
        id: null,
        date: new Date().toISOString().split('T')[0],
        equipment: '',
        name: '',
        hours: 0,
        hourlyRate: 0,
        total: 0,
        notes: '',
        isCompanyOwned: true
      }
      showModal.value = true
    }

    const openEditModal = (rental) => {
      isEditing.value = true
      form.value = {
        id: rental.id,
        date: rental.date.split('T')[0],
        equipment: rental.equipment,
        name: rental.name,
        hours: parseFloat(rental.hours),
        hourlyRate: parseFloat(rental.hourlyRate),
        total: parseFloat(rental.total),
        notes: rental.notes || '',
        isCompanyOwned: rental.isCompanyOwned !== undefined ? rental.isCompanyOwned : true
      }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      form.value = {
        id: null,
        date: new Date().toISOString().split('T')[0],
        equipment: '',
        name: '',
        hours: 0,
        hourlyRate: 0,
        total: 0,
        notes: '',
        isCompanyOwned: true
      }
    }

    const updateForm = (val) => {
      // Mutate existing object fields instead of replacing the ref itself.
      // This reduces the chance of creating a new object reference that
      // triggers child watchers and causes a recursive update loop.
      if (val && typeof val === 'object') {
        Object.assign(form.value, val)
      }
    }

    const saveRental = async (rentalData) => {
      saving.value = true
      try {
        if (isEditing.value) {
          await rentalsStore.updateRental(form.value.id, rentalData)
          if (window.$toast) {
            window.$toast('Rental updated successfully', 'success')
          }
        } else {
          await rentalsStore.createRental(rentalData)
          if (window.$toast) {
            window.$toast('Rental created successfully', 'success')
          }
        }
        closeModal()
      } catch (error) {
        console.error('Error saving rental:', error)
        if (window.$toast) {
          window.$toast(error.response?.data?.message || 'Failed to save rental', 'error')
        }
      } finally {
        saving.value = false
      }
    }

    const confirmDelete = (rental) => {
      rentalToDelete.value = rental
      showDeleteModal.value = true
    }

    const deleteRental = async () => {
      deleting.value = true
      try {
        await rentalsStore.deleteRental(rentalToDelete.value.id)
        showDeleteModal.value = false
        rentalToDelete.value = null
        if (window.$toast) {
          window.$toast('Rental deleted successfully', 'success')
        }
      } catch (error) {
        console.error('Error deleting rental:', error)
        if (window.$toast) {
          window.$toast(error.response?.data?.message || 'Failed to delete rental', 'error')
        }
      } finally {
        deleting.value = false
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 2
      }).format(amount)
    }

    // Watch only the specific filter properties we care about and reload.
    // Watching the entire filters object with deep: true could re-run when
    // unrelated reactive changes occur; this can lead to recursive updates
    // if fetchRentals (or other actions) indirectly change reactive state.
    watch(
      () => [rentalsStore.filters.q, rentalsStore.filters.isCompanyOwned],
      () => {
        rentalsStore.fetchRentals()
      }
    )

    onMounted(() => {
      rentalsStore.fetchRentals()
    })

    onUnmounted(() => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }
    })

    return {
      rentalsStore,
      showModal,
      showDeleteModal,
      isEditing,
      saving,
      deleting,
      form,
      visiblePages,
      onSearchInput,
      clearSearch,
      setCompanyOwnedFilter,
      changePage,
      onPageSizeChange,
      openAddModal,
      openEditModal,
      closeModal,
      updateForm,
      saveRental,
      confirmDelete,
      deleteRental,
      formatDate,
      formatCurrency
    }
  }
}
</script>
