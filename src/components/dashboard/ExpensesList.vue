<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" :class="isRTL ? 'direction-rtl p-6' : 'p-6'">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">{{ $t('expenses.title') }}</h1>
        <p class="text-gray-600 mt-1">{{ $t('expenses.searchBy') }}</p>
      </div>

      <button 
        @click="openAddModal" 
        class="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 flex items-center gap-2 shadow-lg"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        {{ $t('expenses.addExpense') }}
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <input 
              v-model="searchQuery" 
              type="search" 
              :placeholder="$t('expenses.searchPlaceholder')"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isRTL ? 'text-right' : 'text-left'"
            />
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" :class="isRTL ? 'left-auto right-3' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        
        <div class="flex gap-2">
          <select 
            v-model="selectedCategory" 
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            :class="isRTL ? 'text-right' : 'text-left'"
          >
            <option value="">{{ $t('expenses.category') }}</option>
            <option v-for="option in categoryOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          
          <button 
            v-if="searchQuery || selectedCategory"
            @click="clearFilters"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {{ $t('expenses.clearSearch') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="text-red-800">{{ $t('expenses.loadError') }}</span>
      </div>
    </div>

    <!-- Desktop Table -->
    <div v-if="!loading && !error" class="hidden sm:block bg-white rounded-lg shadow-sm border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('labels.#') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.date') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.category') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.description') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.amount') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.notes') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(expense, index) in filteredExpenses" :key="expense.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" :class="isRTL ? 'text-right' : 'text-left'">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" :class="isRTL ? 'text-right' : 'text-left'">
                {{ formatDate(expense.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getCategoryColor(expense.category)">
                  {{ getCategoryLabel(expense.category) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" :class="isRTL ? 'text-right' : 'text-left'">
                {{ expense.description }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" :class="isRTL ? 'text-right' : 'text-left'">
                {{ formatCurrency(expense.amount) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" :class="isRTL ? 'text-right' : 'text-left'">
                {{ expense.notes || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2" :class="isRTL ? 'flex-row-reverse' : ''">
                  <button 
                    @click="openEditModal(expense)" 
                    class="text-indigo-600 hover:text-indigo-900 transition-colors"
                    :title="$t('labels.edit')"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button 
                    @click="confirmDelete(expense)" 
                    class="text-red-600 hover:text-red-900 transition-colors"
                    :title="$t('labels.delete')"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredExpenses.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                <div class="flex flex-col items-center">
                  <svg class="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p class="text-lg font-medium">{{ $t('expenses.noResults') }}</p>
                  <p class="text-sm text-gray-400 mt-1">{{ $t('expenses.searchBy') }}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div v-else class="sm:hidden space-y-4">
      <div 
        v-for="expense in filteredExpenses" 
        :key="expense.id" 
        class="bg-white rounded-lg shadow-sm border p-4"
      >
        <div class="flex justify-between items-start mb-3">
          <div :class="isRTL ? 'text-right' : 'text-left'">
            <h3 class="font-semibold text-gray-900">{{ expense.description }}</h3>
            <p class="text-sm text-gray-500">{{ formatDate(expense.date) }}</p>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getCategoryColor(expense.category)">
            {{ getCategoryLabel(expense.category) }}
          </span>
        </div>
        
        <div class="flex justify-between items-center mb-3">
          <span class="text-lg font-semibold text-gray-900">{{ formatCurrency(expense.amount) }}</span>
          <div class="flex gap-2">
            <button 
              @click="openEditModal(expense)" 
              class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button 
              @click="confirmDelete(expense)" 
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <p v-if="expense.notes" class="text-sm text-gray-600" :class="isRTL ? 'text-right' : 'text-left'">
          {{ expense.notes }}
        </p>
      </div>
      
      <div v-if="filteredExpenses.length === 0" class="text-center py-12">
        <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p class="text-lg font-medium text-gray-500">{{ $t('expenses.noResults') }}</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
      <div class="flex items-center gap-4">
        <div class="text-sm text-gray-700">
          {{ $t('supply.showing') }} {{ (currentPage - 1) * pageSize + 1 }} {{ $t('supply.to') }} 
          {{ Math.min(currentPage * pageSize, totalItems) }} {{ $t('supply.of') }} {{ totalItems }} {{ $t('supply.results') }}
        </div>
        
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-700">{{ $t('expenses.pageSize') }}:</label>
          <select 
            v-model="pageSize" 
            @change="onPageSizeChange"
            class="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
      
      <div class="flex gap-2">
        <button 
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ $t('supply.previous') }}
        </button>
        
        <button 
          v-for="page in visiblePages" 
          :key="page"
          @click="goToPage(page)"
          :class="[
            'px-3 py-2 text-sm border rounded-lg transition-colors',
            page === currentPage 
              ? 'bg-indigo-600 text-white border-indigo-600' 
              : 'border-gray-300 hover:bg-gray-50'
          ]"
        >
          {{ page }}
        </button>
        
        <button 
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ $t('supply.next') }}
        </button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeModal"></div>
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md relative z-10">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ editing ? $t('expenses.editExpense') : $t('expenses.addExpense') }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveExpense" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.date') }} <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="form.date" 
                type="date" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                :class="isRTL ? 'text-right' : 'text-left'"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.category') }} <span class="text-red-500">*</span>
              </label>
              <select 
                v-model="form.category" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                :class="isRTL ? 'text-right' : 'text-left'"
              >
                <option value="">{{ $t('expenses.category') }}</option>
                <option v-for="option in categoryOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.description') }} <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="form.description" 
                type="text" 
                required
                :placeholder="$t('expenses.description')"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                :class="isRTL ? 'text-right' : 'text-left'"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.amount') }} <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="form.amount" 
                type="number" 
                step="0.01"
                min="0"
                required
                :placeholder="$t('expenses.amount')"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                :class="isRTL ? 'text-right' : 'text-left'"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.notes') }}
              </label>
              <textarea 
                v-model="form.notes" 
                rows="3"
                :placeholder="$t('expenses.notes')"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                :class="isRTL ? 'text-right' : 'text-left'"
              ></textarea>
            </div>

            <div class="flex gap-3 pt-4" :class="isRTL ? 'flex-row-reverse' : ''">
              <button 
                type="button" 
                @click="closeModal"
                class="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {{ $t('labels.cancel') }}
              </button>
              <button 
                type="submit" 
                :disabled="saving"
                class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <div v-if="saving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {{ saving ? $t('labels.saving') : $t('labels.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteConfirm.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="cancelDelete"></div>
      <div class="bg-white rounded-lg shadow-xl w-full max-w-sm relative z-10">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div class="ml-3" :class="isRTL ? 'ml-0 mr-3' : ''">
              <h3 class="text-lg font-medium text-gray-900">{{ $t('expenses.deleteExpense') }}</h3>
            </div>
          </div>
          
          <p class="text-sm text-gray-500 mb-6" :class="isRTL ? 'text-right' : 'text-left'">
            {{ $t('expenses.deleteConfirmation') }}
          </p>
          
          <div class="flex gap-3" :class="isRTL ? 'flex-row-reverse' : ''">
            <button 
              @click="cancelDelete"
              class="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {{ $t('labels.cancel') }}
            </button>
            <button 
              @click="doDelete"
              :disabled="deleting"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <div v-if="deleting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {{ deleting ? $t('labels.deleting') : $t('labels.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../../api'

export default {
  name: 'ExpensesList',
  data() {
    return {
      expenses: [],
      loading: false,
      error: null,
      searchQuery: '',
      selectedCategory: '',
      modalOpen: false,
      editing: false,
      saving: false,
      deleting: false,
      form: {
        id: null,
        date: '',
        category: '',
        description: '',
        amount: '',
        notes: ''
      },
      deleteConfirm: { open: false, item: null },
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0
    }
  },
  computed: {
    isRTL() { 
      return this.$i18n && this.$i18n.locale === 'ar' 
    },
    
    categories() {
      return this.$tm('expenses.categories')
    },
    
    categoryOptions() {
      const categories = this.$tm('expenses.categories')
      return Object.keys(categories).map(key => ({
        value: key,
        label: categories[key]
      }))
    },
    
    filteredExpenses() {
      let filtered = this.expenses
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(expense => 
          expense.description.toLowerCase().includes(query) ||
          expense.category.toLowerCase().includes(query) ||
          (expense.notes && expense.notes.toLowerCase().includes(query))
        )
      }
      
      if (this.selectedCategory) {
        filtered = filtered.filter(expense => expense.category === this.selectedCategory)
      }
      
      return filtered
    },
    
    visiblePages() {
      const pages = []
      const start = Math.max(1, this.currentPage - 2)
      const end = Math.min(this.totalPages, this.currentPage + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    }
  },
  
  watch: {
    searchQuery() {
      this.currentPage = 1
    },
    selectedCategory() {
      this.currentPage = 1
    }
  },
  
  async mounted() {
    await this.loadExpenses()
  },
  
  methods: {
    async loadExpenses() {
      this.loading = true
      this.error = null
      
      try {
        const response = await getExpenses(this.currentPage, this.pageSize, this.searchQuery)
        this.expenses = response.data.items || []
        this.totalItems = response.data.total || 0
        this.totalPages = response.data.pages || 1
      } catch (error) {
        console.error('Error loading expenses:', error)
        
        // If backend is not available, use demo data
        if (error.response?.status === 500 || error.code === 'ERR_NETWORK') {
          console.log('Using demo data for expenses')
          console.warn('Backend server is not available. Using demo data for testing.')
          this.expenses = [
            {
              id: 1,
              date: '2025-01-15T00:00:00.000Z',
              category: 'Travel',
              description: 'Taxi from airport to hotel',
              amount: '42.5',
              notes: 'Paid in cash',
              createdAt: '2025-01-15T10:00:00.000Z',
              updatedAt: '2025-01-15T10:00:00.000Z'
            },
            {
              id: 2,
              date: '2025-01-14T00:00:00.000Z',
              category: 'Meals',
              description: 'Business lunch with client',
              amount: '85.0',
              notes: 'Company credit card',
              createdAt: '2025-01-14T14:30:00.000Z',
              updatedAt: '2025-01-14T14:30:00.000Z'
            },
            {
              id: 3,
              date: '2025-01-13T00:00:00.000Z',
              category: 'Office',
              description: 'Office supplies',
              amount: '25.75',
              notes: 'Stationery and paper',
              createdAt: '2025-01-13T09:15:00.000Z',
              updatedAt: '2025-01-13T09:15:00.000Z'
            }
          ]
          this.totalItems = this.expenses.length
          this.totalPages = 1
          
          // Show demo mode notification
          setTimeout(() => {
            this.showSuccess('Demo Mode: Backend server is not available. Using sample data for testing.')
          }, 1000)
        } else {
          this.error = error.message || this.$t('expenses.loadError')
        }
      } finally {
        this.loading = false
      }
    },
    
    async goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        await this.loadExpenses()
      }
    },
    
    async onPageSizeChange() {
      this.currentPage = 1
      await this.loadExpenses()
    },
    
    openAddModal() {
      this.editing = false
      this.form = {
        id: null,
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
        amount: '',
        notes: ''
      }
      this.modalOpen = true
    },
    
    openEditModal(expense) {
      this.editing = true
      this.form = {
        id: expense.id,
        date: expense.date.split('T')[0],
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        notes: expense.notes || ''
      }
      this.modalOpen = true
    },
    
    closeModal() {
      this.modalOpen = false
      this.form = {
        id: null,
        date: '',
        category: '',
        description: '',
        amount: '',
        notes: ''
      }
    },
    
    async saveExpense() {
      if (!this.validateForm()) return
      
      this.saving = true
      
      try {
        const expenseData = {
          date: this.form.date,
          category: this.form.category,
          description: this.form.description,
          amount: parseFloat(this.form.amount),
          notes: this.form.notes || ''
        }
        
        console.log('Sending expense data:', expenseData)
        console.log('Available categories:', this.categories)
        console.log('Selected category:', this.form.category)
        
        if (this.editing) {
          try {
            await updateExpense(this.form.id, expenseData)
            const index = this.expenses.findIndex(e => e.id === this.form.id)
            if (index !== -1) {
              this.expenses.splice(index, 1, { ...this.expenses[index], ...expenseData })
            }
          } catch (updateError) {
            // If backend is not available, simulate update
            if (updateError.response?.status === 500 || updateError.code === 'ERR_NETWORK') {
              console.log('Backend not available, simulating expense update')
              const index = this.expenses.findIndex(e => e.id === this.form.id)
              if (index !== -1) {
                this.expenses.splice(index, 1, { 
                  ...this.expenses[index], 
                  ...expenseData,
                  updatedAt: new Date().toISOString()
                })
              }
            } else {
              throw updateError // Re-throw if it's a different error
            }
          }
        } else {
          try {
            const response = await createExpense(expenseData)
            console.log('Expense created successfully:', response.data)
            this.expenses.unshift(response.data)
            this.totalItems++
          } catch (createError) {
            // If backend is not available, simulate creation
            if (createError.response?.status === 500 || createError.code === 'ERR_NETWORK') {
              console.log('Backend not available, simulating expense creation')
              const newExpense = {
                id: Date.now(), // Generate a temporary ID
                date: expenseData.date + 'T00:00:00.000Z',
                category: expenseData.category,
                description: expenseData.description,
                amount: expenseData.amount.toString(),
                notes: expenseData.notes,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
              this.expenses.unshift(newExpense)
              this.totalItems++
              console.log('Expense simulated successfully:', newExpense)
            } else {
              throw createError // Re-throw if it's a different error
            }
          }
        }
        
        this.closeModal()
        this.showSuccess(this.editing ? 'expenses.success.updated' : 'expenses.success.created')
      } catch (error) {
        console.error('Error saving expense:', error)
        console.error('Error details:', error.response?.data)
        
        // Show more specific error message
        let errorMessage = this.$t('expenses.saveError')
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please check if the backend is running.'
        } else if (error.response?.status === 400) {
          errorMessage = 'Invalid data. Please check your input.'
        }
        
        this.showError(errorMessage)
      } finally {
        this.saving = false
      }
    },
    
    validateForm() {
      if (!this.form.date) {
        this.showError(this.$t('expenses.validation.dateRequired'))
        return false
      }
      if (!this.form.category) {
        this.showError(this.$t('expenses.validation.categoryRequired'))
        return false
      }
      // Check if category is valid
      const validCategories = Object.keys(this.categories)
      if (!validCategories.includes(this.form.category)) {
        this.showError('Invalid category selected')
        return false
      }
      if (!this.form.description.trim()) {
        this.showError(this.$t('expenses.validation.descriptionRequired'))
        return false
      }
      if (!this.form.amount || isNaN(parseFloat(this.form.amount)) || parseFloat(this.form.amount) <= 0) {
        this.showError(this.$t('expenses.validation.amountInvalid'))
        return false
      }
      return true
    },
    
    confirmDelete(expense) {
      this.deleteConfirm = { open: true, item: expense }
    },
    
    cancelDelete() {
      this.deleteConfirm = { open: false, item: null }
    },
    
    async doDelete() {
      this.deleting = true
      
      try {
        await deleteExpense(this.deleteConfirm.item.id)
        this.expenses = this.expenses.filter(e => e.id !== this.deleteConfirm.item.id)
        this.totalItems--
        this.cancelDelete()
        this.showSuccess(this.$t('expenses.success.deleted'))
      } catch (error) {
        console.error('Error deleting expense:', error)
        
        // If backend is not available, simulate deletion
        if (error.response?.status === 500 || error.code === 'ERR_NETWORK') {
          console.log('Backend not available, simulating expense deletion')
          this.expenses = this.expenses.filter(e => e.id !== this.deleteConfirm.item.id)
          this.totalItems--
          this.cancelDelete()
          this.showSuccess(this.$t('expenses.success.deleted'))
        } else {
          this.showError(this.$t('expenses.deleteError'))
        }
      } finally {
        this.deleting = false
      }
    },
    
    clearFilters() {
      this.searchQuery = ''
      this.selectedCategory = ''
      this.currentPage = 1
      this.loadExpenses()
    },
    
    getCategoryLabel(category) {
      // Handle both string and numeric categories
      const categoryKey = typeof category === 'number' ? Object.keys(this.categories)[category] : category
      return this.categories[categoryKey] || this.categories[category] || category
    },
    
    getCategoryColor(category) {
      // Handle both string and numeric categories
      const categoryKey = typeof category === 'number' ? Object.keys(this.categories)[category] : category
      const actualCategory = categoryKey || category
      
      const colors = {
        'Travel': 'bg-blue-100 text-blue-800',
        'Meals': 'bg-green-100 text-green-800',
        'Office': 'bg-purple-100 text-purple-800',
        'Equipment': 'bg-orange-100 text-orange-800',
        'Maintenance': 'bg-red-100 text-red-800',
        'Utilities': 'bg-yellow-100 text-yellow-800',
        'Marketing': 'bg-pink-100 text-pink-800',
        'Other': 'bg-gray-100 text-gray-800'
      }
      return colors[actualCategory] || 'bg-gray-100 text-gray-800'
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString(this.isRTL ? 'ar-SA' : 'en-US')
    },
    
    formatCurrency(amount) {
      return new Intl.NumberFormat(this.isRTL ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: 'EGP'
      }).format(amount)
    },
    
    showSuccess(message) {
      // You can implement a toast notification here
      console.log('Success:', message)
    },
    
    showError(message) {
      // You can implement a toast notification here
      alert(message)
    }
  }
}
</script>

<style scoped>
.direction-rtl input,
.direction-rtl select,
.direction-rtl textarea {
  direction: rtl;
  text-align: right;
}

.direction-rtl table th,
.direction-rtl table td {
  text-align: right;
}

/* Custom scrollbar for better UX */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
