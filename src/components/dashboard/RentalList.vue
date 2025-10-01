<template>
  <div class="space-y-6">
    <!-- Header with Search and Add Button -->
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
            v-model="searchQuery" 
            @input="onSearchInput"
            type="text" 
            :placeholder="$t('rental.searchPlaceholder')"
            class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
          <div v-if="searchQuery" class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button @click="clearSearch" class="text-gray-400 hover:text-gray-600">
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

    <!-- Stats Bar -->
    <div class="bg-gray-50 rounded-lg p-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div class="text-sm text-gray-600">
          {{ $t('rental.totalRentals') }}: <span class="font-semibold">{{ pagination.total }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <label>{{ $t('rental.pageSize') }}:</label>
          <select v-model="pagination.pageSize" @change="onPageSizeChange" 
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
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="text-red-800">{{ error }}</span>
      </div>
    </div>

    <!-- Rentals Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <!-- No Results Message -->
      <div v-if="rentals.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('rental.noResults') }}</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ searchQuery ? $t('rental.searchBy') : 'Get started by creating a new rental.' }}
        </p>
        <div v-if="!searchQuery" class="mt-6">
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
            <tr v-for="rental in rentals" :key="rental.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(rental.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ rental.equipment }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ rental.name }}
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
      <div v-if="pagination.total > pagination.pageSize" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <!-- Mobile Pagination -->
        <div class="flex-1 flex justify-between sm:hidden">
          <button @click="changePage(pagination.page - 1)" 
            :disabled="pagination.page <= 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ $t('labels.previous') }}
          </button>
          <span class="text-sm text-gray-700 self-center">
            {{ pagination.page }} / {{ totalPages }}
          </span>
          <button @click="changePage(pagination.page + 1)" 
            :disabled="pagination.page >= totalPages"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ $t('labels.next') }}
          </button>
        </div>

        <!-- Desktop Pagination -->
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <p class="text-sm text-gray-700">
              {{ $t('labels.showing') }} 
              <span class="font-medium">{{ ((pagination.page - 1) * pagination.pageSize) + 1 }}</span>
              {{ $t('labels.to') }}
              <span class="font-medium">{{ Math.min(pagination.page * pagination.pageSize, pagination.total) }}</span>
              {{ $t('labels.of') }}
              <span class="font-medium">{{ pagination.total }}</span>
              {{ $t('labels.results') }}
            </p>
            
            <!-- Go to Page Input -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-700">{{ $t('rental.goToPage') }}:</label>
              <input 
                v-model.number="goToPageInput" 
                @keyup.enter="goToPage"
                type="number" 
                :min="1" 
                :max="totalPages"
                class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
              <button @click="goToPage" 
                class="px-2 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">
                Go
              </button>
            </div>
          </div>

          <!-- Page Numbers -->
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <!-- First Page -->
              <button @click="changePage(1)" 
                :disabled="pagination.page <= 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
              </button>

              <!-- Previous Page -->
              <button @click="changePage(pagination.page - 1)" 
                :disabled="pagination.page <= 1"
                class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>

              <!-- Page Numbers -->
              <template v-for="page in visiblePages" :key="page">
                <button @click="changePage(page)" 
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    page === pagination.page 
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' 
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  ]">
                  {{ page }}
                </button>
              </template>

              <!-- Next Page -->
              <button @click="changePage(pagination.page + 1)" 
                :disabled="pagination.page >= totalPages"
                class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>

              <!-- Last Page -->
              <button @click="changePage(totalPages)" 
                :disabled="pagination.page >= totalPages"
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
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ isEditing ? $t('rental.editRental') : $t('rental.addRental') }}
          </h3>
          
          <form @submit.prevent="saveRental" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('rental.date') }} *
              </label>
              <input v-model="form.date" type="date" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('rental.equipment') }} *
              </label>
              <input v-model="form.equipment" type="text" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('rental.name') }} *
              </label>
              <input v-model="form.name" type="text" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('rental.hours') }} *
              </label>
              <input v-model.number="form.hours" type="number" min="0" step="0.5" required
                @input="calculateTotal"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('rental.hourlyRate') }} *
              </label>
              <input v-model.number="form.hourlyRate" type="number" min="0" step="0.01" required
                @input="calculateTotal"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('rental.total') }}
              </label>
              <input v-model.number="form.total" type="number" readonly
                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('rental.notes') }}
              </label>
              <textarea v-model="form.notes" rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="closeModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
                {{ $t('labels.cancel') }}
              </button>
              <button type="submit" :disabled="saving"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition">
                {{ saving ? $t('labels.saving') : (isEditing ? $t('labels.update') : $t('labels.save')) }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div class="mt-2 text-center">
            <h3 class="text-lg font-medium text-gray-900">{{ $t('rental.deleteRental') }}</h3>
            <div class="mt-2 px-7 py-3">
              <p class="text-sm text-gray-500">
                {{ $t('rental.deleteConfirmation') }}
              </p>
            </div>
          </div>
          <div class="flex justify-center gap-3 pt-4">
            <button @click="showDeleteModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
              {{ $t('labels.cancel') }}
            </button>
            <button @click="deleteRental" :disabled="deleting"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition">
              {{ deleting ? $t('labels.deleting') : $t('labels.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getRentals, createRental, updateRental, deleteRental } from '@/api'

export default {
  name: 'RentalList',
  data() {
    return {
      rentals: [],
      loading: false,
      error: null,
      saving: false,
      deleting: false,
      showModal: false,
      showDeleteModal: false,
      isEditing: false,
      rentalToDelete: null,
      searchQuery: '',
      searchTimeout: null,
      goToPageInput: 1,
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      form: {
        id: null,
        date: '',
        equipment: '',
        name: '',
        hours: 0,
        hourlyRate: 0,
        total: 0,
        notes: ''
      }
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.pagination.total / this.pagination.pageSize)
    },
    visiblePages() {
      const current = this.pagination.page
      const total = this.totalPages
      const delta = 2
      
      let start = Math.max(1, current - delta)
      let end = Math.min(total, current + delta)
      
      // Adjust if we're near the beginning or end
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
    }
  },
  mounted() {
    this.loadRentals()
  },
  beforeUnmount() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  },
  methods: {
    async loadRentals() {
      this.loading = true
      this.error = null
      try {
        const response = await getRentals(this.pagination.page, this.pagination.pageSize, this.searchQuery)
        this.rentals = response.data.items
        this.pagination.total = response.data.total
        this.pagination.pageSize = response.data.pageSize
        this.goToPageInput = this.pagination.page
      } catch (error) {
        console.error('Error loading rentals:', error)
        this.error = this.$t('rental.loadError')
      } finally {
        this.loading = false
      }
    },

    // Search functionality
    onSearchInput() {
      // Clear existing timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      // Set new timeout for debounced search
      this.searchTimeout = setTimeout(() => {
        this.pagination.page = 1 // Reset to first page when searching
        this.loadRentals()
      }, 500) // 500ms delay
    },

    clearSearch() {
      this.searchQuery = ''
      this.pagination.page = 1
      this.loadRentals()
    },

    // Pagination functionality
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.pagination.page = page
        this.goToPageInput = page
        this.loadRentals()
      }
    },

    goToPage() {
      if (this.goToPageInput >= 1 && this.goToPageInput <= this.totalPages) {
        this.changePage(this.goToPageInput)
      }
    },

    onPageSizeChange() {
      this.pagination.page = 1
      this.goToPageInput = 1
      this.loadRentals()
    },

    openAddModal() {
      this.isEditing = false
      this.form = {
        id: null,
        date: new Date().toISOString().split('T')[0],
        equipment: '',
        name: '',
        hours: 0,
        hourlyRate: 0,
        total: 0,
        notes: ''
      }
      this.showModal = true
    },

    openEditModal(rental) {
      this.isEditing = true
      this.form = {
        id: rental.id,
        date: rental.date.split('T')[0],
        equipment: rental.equipment,
        name: rental.name,
        hours: parseFloat(rental.hours),
        hourlyRate: parseFloat(rental.hourlyRate),
        total: parseFloat(rental.total),
        notes: rental.notes || ''
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.form = {
        id: null,
        date: '',
        equipment: '',
        name: '',
        hours: 0,
        hourlyRate: 0,
        total: 0,
        notes: ''
      }
    },

    calculateTotal() {
      this.form.total = this.form.hours * this.form.hourlyRate
    },

    async saveRental() {
      this.saving = true
      try {
        const rentalData = {
          ...this.form,
          date: new Date(this.form.date).toISOString()
        }

        if (this.isEditing) {
          await updateRental(this.form.id, rentalData)
        } else {
          await createRental(rentalData)
        }

        this.closeModal()
        await this.loadRentals()
      } catch (error) {
        console.error('Error saving rental:', error)
        this.error = this.$t('rental.saveError')
      } finally {
        this.saving = false
      }
    },

    confirmDelete(rental) {
      this.rentalToDelete = rental
      this.showDeleteModal = true
    },

    async deleteRental() {
      this.deleting = true
      try {
        await deleteRental(this.rentalToDelete.id)
        this.showDeleteModal = false
        this.rentalToDelete = null
        await this.loadRentals()
      } catch (error) {
        console.error('Error deleting rental:', error)
        this.error = this.$t('rental.deleteError')
      } finally {
        this.deleting = false
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString(this.$i18n.locale === 'ar' ? 'ar-EG' : 'en-US')
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat(this.$i18n.locale === 'ar' ? 'ar-EG' : 'en-US', {
        style: 'currency',
        currency: 'EGP'
      }).format(amount)
    }
  }
}
</script>
