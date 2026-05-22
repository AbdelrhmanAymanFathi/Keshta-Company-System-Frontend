<template>
  <AddFieldModal
    :open="fieldModal.open"
    :type="fieldModal.type"
    :name="fieldModal.name"
    :branch-category="fieldModal.category"
    :parent-category-name="fieldModal.parentName"
    @close="closeFieldModal"
    @save="handleFieldSave"
  />
  <div :dir="isRTL ? 'rtl' : 'ltr'" :class="isRTL ? 'direction-rtl p-6' : 'p-6'">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">{{ $t('expenses.title') }}</h1>
        <p class="text-gray-600 mt-1">{{ $t('expenses.searchBy') }}</p>
      </div>

      <button 
        @click="openAddModal" 
        class="theme-button px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        {{ $t('expenses.addExpense') }}
      </button>

      <!-- Export button removed as per UI request -->
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
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg theme-input-focus"
              :class="isRTL ? 'text-right' : 'text-left'"
            />
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" :class="isRTL ? 'left-auto right-3' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        
        <div class="flex gap-2">
          <select 
            v-model.number="selectedCategoryId" 
            class="px-4 py-2 border border-gray-300 rounded-lg theme-input-focus"
            :class="isRTL ? 'text-right' : 'text-left'"
          >
            <option :value="null">{{ $t('expenses.category') }}</option>
            <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <div v-if="selectedCategoryId" :class="['flex items-center gap-2']">
            <div class="relative flex-1">
              <input
                v-model="subcategoryInput"
                @input="handleSubcategoryInput"
                @focus="handleSubcategoryInput"
                @blur="handleSubcategoryBlur"
                @keydown="handleSubcategoryKeydown"
                :disabled="loading"
                :placeholder="$t('expenses.subcategory')"
                :class="['w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none theme-input-focus', isRTL ? 'text-right' : 'text-left']"
              />
              <div v-if="showSubcategoryDropdown && (filteredSubcategoryOptions.length > 0)" class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto" :class="isRTL ? 'text-right' : 'text-left'">
                <div v-for="(option, index) in filteredSubcategoryOptions" :key="option.value" @mousedown.prevent="selectSubcategory(option.value)" :class="['px-3 py-2 cursor-pointer theme-hover-soft transition-colors', selectedSubcategoryIndex === index ? 'theme-icon-bg' : '']">
                  {{ option.label }}
                </div>
              </div>
            </div>
            <button
              type="button"
              @click="addSubcategoryPrompt(selectedCategoryId)"
              :disabled="!selectedCategoryId"
              class="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :title="$t('expenses.addSubcategory') || 'Add subcategory'"
            >
              +
            </button>
          </div>
          <select v-model="selectedKind" class="px-4 py-2 border border-gray-300 rounded-lg theme-input-focus" :class="isRTL ? 'text-right' : 'text-left'">
            <option value="">{{ $t('expenses.typeAll') || 'All Types' }}</option>
            <option value="EXPENSE">{{ $t('expenses.kind.expense') || 'مصروف' }}</option>
            <option value="ADVANCE">{{ $t('expenses.kind.advance') || 'عهدة' }}</option>
          </select>
          
          <button 
            v-if="searchQuery || selectedCategoryId"
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
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 theme-border-accent"></div>
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
                {{ $t('expenses.type') || 'Type' }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                  :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.category') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                  :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.description') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.branch') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.location') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.amount') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.signedAmount') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.flow') }}
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
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" :class="isRTL ? 'text-right' : 'text-left'">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="expense.kind === 'ADVANCE' ? 'bg-yellow-100 text-yellow-800' : 'theme-icon-bg theme-text-muted'">
                  {{ expense.kind === 'ADVANCE' ? ( $t('expenses.kind.advance') || 'عهدة' ) : ( $t('expenses.kind.expense') || 'مصروف' ) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap" :class="isRTL ? 'text-right' : 'text-left'">
                <div class="flex flex-col gap-1" :class="isRTL ? 'items-end' : 'items-start'">
                  <!-- Category pill -->
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getCategoryColor(expense.category)">
                    {{ getCategoryLabel(expense.category) }}
                  </span>

                  <!-- Subcategory line -->
                  <span class="text-xs text-gray-600">
                    {{ getSubcategoryLabel(expense) }}
                  </span>
                </div>
              </td>

              <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" :class="isRTL ? 'text-right' : 'text-left'">
                {{ expense.description }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900" :class="isRTL ? 'text-right' : 'text-left'">
                <span v-if="expense.branch" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium theme-badge">
                  {{ expense.branch.name }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900" :class="isRTL ? 'text-right' : 'text-left'">
                <span v-if="expense.location" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium theme-badge">
                  {{ expense.location.name }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" :class="isRTL ? 'text-right' : 'text-left'">
                {{ formatCurrency(expense.amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" :class="[isRTL ? 'text-right' : 'text-left', expense.signedAmount < 0 ? 'text-red-600' : 'text-green-600']">
                {{ formatCurrency(expense.signedAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="expense.flow === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ expense.flow === 'IN' ? $t('expenses.flowIn') : $t('expenses.flowOut') }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" :class="isRTL ? 'text-right' : 'text-left'">
                {{ expense.notes || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2" :class="isRTL ? 'flex-row-reverse' : ''">
                  <button 
                    @click="openEditModal(expense)" 
                    class="theme-text hover:theme-text-muted transition-colors"
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
              <td colspan="12" class="px-6 py-12 text-center text-gray-500">
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
              class="p-2 theme-text theme-hover-soft rounded-lg transition-colors"
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
            class="px-2 py-1 text-sm border border-gray-300 rounded theme-input-focus"
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
              ? 'theme-button theme-border-accent' 
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
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto">
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

          <form @submit.prevent="saveExpense" class="grid gap-4 grid-cols-1 md:grid-cols-2">
            <!-- Date - Column 1 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.date') }} <span class="text-red-500">*</span>
              </label>
              <DateField
                v-model="form.date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg theme-input-focus"
                :class="isRTL ? 'text-right' : 'text-left'"
              />
            </div>

            <!-- Category - Column 2 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.category') }} <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-2">
                <select 
                  v-model.number="form.categoryId" 
                  required
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg theme-input-focus"
                  :class="isRTL ? 'text-right' : 'text-left'"
                >
                  <option :value="null">{{ $t('expenses.category') }}</option>
                  <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
                <button type="button" @click="addCategoryPrompt" class="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">+</button>
              </div>
            </div>

            <!-- Subcategory (optional) - Column 2 -->
            <div v-if="form.categoryId">
              <label class="block text-sm font-medium text-gray-700 mb-1" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.subcategory') }}
              </label>

              <div class="flex gap-2">
                <select v-model.number="form.subCategoryId" class="flex-1 w-full px-3 py-2 border border-gray-300 rounded-lg" :class="isRTL ? 'text-right' : 'text-left'">
                  <option :value="null">{{ $t('expenses.subcategory') }}</option>
                  <option v-for="sc in (expenseCategories.find(c=>c.id===form.categoryId)?.subCategories || [])" :key="sc.id" :value="sc.id">{{ sc.name }}</option>
                </select>

                <button type="button" @click="addSubcategoryPrompt()" class="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">+</button>
              </div>
            </div>

            <!-- Kind (EXPENSE / ADVANCE) - Column 1 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('expenses.kindLabel') }}</label>
              <select v-model="form.kind" class="w-full px-3 py-2 border border-gray-300 rounded-lg" :class="isRTL ? 'text-right' : 'text-left'">
                <option value="EXPENSE">{{ $t('expenses.kind.expense') || 'مصروف' }}</option>
                <option value="ADVANCE">{{ $t('expenses.kind.advance') || 'عهدة' }}</option>
              </select>
            </div>

            <!-- Description - Full Width -->
            <div class="col-span-1 md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.description') }} <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="form.description" 
                type="text" 
                required
                :placeholder="$t('expenses.description')"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg theme-input-focus"
                :class="isRTL ? 'text-right' : 'text-left'"
              />
            </div>

            <!-- Flow Type - Column 1 -->
            <!-- <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.flow') }} <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-2">
                <button 
                  type="button"
                  @click="form.flow = 'OUT'"
                  :class="[
                    'flex-1 px-3 py-2 rounded-lg font-medium transition',
                    form.flow === 'OUT' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ $t('expenses.flowOut') }}
                </button>
                <button 
                  type="button"
                  @click="form.flow = 'IN'"
                  :class="[
                    'flex-1 px-3 py-2 rounded-lg font-medium transition',
                    form.flow === 'IN' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ $t('expenses.flowIn') }}
                </button>
              </div>
            </div> -->

            <!-- Settlement Date - Column 2 (for all flows as status/closing date) -->
            <div class="animate-in fade-in">
              <label class="block text-sm font-medium text-gray-700 mb-1" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.settlementDate') }}
              </label>
              <DateField
                v-model="form.settlementDate"
                :placeholder="$t('expenses.settlementDatePlaceholder')"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg theme-input-focus"
                :class="isRTL ? 'text-right' : 'text-left'"
              />
              <p class="text-xs text-gray-500 mt-1">{{ $t('expenses.settlementDateHint') }}</p>
            </div>

            <!-- Branch - Column 1 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.branch') }}
              </label>
              <div class="flex gap-2">
                <select 
                  v-model="form.branchId" 
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg theme-input-focus"
                  :class="isRTL ? 'text-right' : 'text-left'"
                >
                  <option :value="null">{{ $t('finance.companyWallet') || 'Main Treasury' }}</option>
                  <option v-for="branch in branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
                </select>
                <button type="button" @click="addBranchPrompt" class="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">+</button>
              </div>
            </div>

            <!-- Location - Column 2 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.location') || 'Location' }} <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-2">
                <select 
                  v-model="form.locationId" 
                  required
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg theme-input-focus"
                  :class="isRTL ? 'text-right' : 'text-left'"
                >
                  <option :value="null">{{ $t('expenses.location') || 'Location' }}</option>
                  <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
                </select>
                <button type="button" @click="addLocationPrompt" class="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">+</button>
              </div>
            </div>

            <!-- Amount - Column 2 -->
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
                class="w-full px-3 py-2 border border-gray-300 rounded-lg theme-input-focus"
                :class="isRTL ? 'text-right' : 'text-left'"
              />
            </div>

            <!-- Notes - Full Width -->
            <div class="col-span-1 md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.notes') }}
              </label>
              <textarea 
                v-model="form.notes" 
                rows="2"
                :placeholder="$t('expenses.notes')"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg theme-input-focus"
                :class="isRTL ? 'text-right' : 'text-left'"
              ></textarea>
            </div>

            <!-- Buttons - Full Width -->
            <div class="col-span-1 md:col-span-2 flex gap-3 pt-4" :class="isRTL ? 'flex-row-reverse' : ''">
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
                class="flex-1 px-4 py-2 theme-button rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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

    <!-- Location Dialog Modal -->
    <div v-if="showLocationDialog" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md animate-in fade-in duration-200" :class="isRTL ? 'direction-rtl' : ''">
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between rounded-t-lg" :class="isRTL ? 'flex-row-reverse' : ''">
          <h3 class="text-lg font-semibold text-white">{{ $t('expenses.selectSaveLocation') }}</h3>
          <button @click="showLocationDialog = false" class="text-white hover:text-green-100 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="px-6 py-6 space-y-4">
          <p class="text-sm text-gray-600" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('expenses.chooseLocationHint') }}</p>
          
          <!-- Quick Select Options -->
          <div class="space-y-2">
            <button 
              @click="selectedLocation = 'downloads'"
              :class="[
                'w-full px-4 py-3 rounded-lg border-2 transition-all text-left flex items-center gap-3',
                selectedLocation === 'downloads' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50',
                isRTL ? 'flex-row-reverse text-right' : ''
              ]"
            >
              <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <div>
                <div class="font-medium text-gray-800">{{ $t('expenses.downloads') }}</div>
                <div class="text-xs text-gray-500">~/Downloads</div>
              </div>
            </button>

            <button 
              @click="selectedLocation = 'documents'"
              :class="[
                'w-full px-4 py-3 rounded-lg border-2 transition-all text-left flex items-center gap-3',
                selectedLocation === 'documents' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50',
                isRTL ? 'flex-row-reverse text-right' : ''
              ]"
            >
              <svg class="w-5 h-5 theme-text flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <div>
                <div class="font-medium text-gray-800">{{ $t('expenses.documents') }}</div>
                <div class="text-xs text-gray-500">~/Documents</div>
              </div>
            </button>

            <button 
              @click="selectedLocation = 'desktop'"
              :class="[
                'w-full px-4 py-3 rounded-lg border-2 transition-all text-left flex items-center gap-3',
                selectedLocation === 'desktop' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50',
                isRTL ? 'flex-row-reverse text-right' : ''
              ]"
            >
              <svg class="w-5 h-5 theme-text flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <div class="font-medium text-gray-800">{{ $t('expenses.desktop') }}</div>
                <div class="text-xs text-gray-500">~/Desktop</div>
              </div>
            </button>
          </div>

          <!-- Custom Path -->
          <div class="border-t pt-4">
            <label class="text-sm font-medium text-gray-700 mb-2 block" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('expenses.customPath') }}</label>
            <input 
              v-model="selectedLocation"
              type="text"
              placeholder="e.g., /home/user/reports"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              :class="isRTL ? 'text-right' : 'text-left'"
            >
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 rounded-b-lg border-t" :class="isRTL ? 'flex-row-reverse' : ''">
          <button 
            @click="showLocationDialog = false"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            {{ $t('labels.cancel') }}
          </button>
          <button 
            @click="downloadReport"
            :disabled="downloading"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            <div v-if="downloading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {{ downloading ? $t('labels.downloading') : $t('labels.download') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getExpenses,
  getExpenseCategories,
  createExpenseCategory,
  createExpenseSubCategory,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpensesReport,
  getBranches,
  getLocations,
  createBranch,
  createLocation
} from '../../api'
import AddFieldModal from '@/components/shared/AddFieldModal.vue'
import DateField from '@/components/shared/DateField.vue'
import { getTodayISO } from '@/utils/dateUtils'

export default {
  emits: ["navigateReport", "navigateStatement"],
  name: 'ExpensesList',
  components: { AddFieldModal, DateField },
  data() {
    return {
      expenses: [],
      branches: [],
      locations: [],
      // Hierarchical expense categories tree
      expenseCategories: [],
      loading: false,
      error: null,
      searchQuery: '',
      selectedCategoryId: null,
      selectedSubcategoryId: null,
      // Subcategory combobox state
      subcategoryInput: '',
      showSubcategoryDropdown: false,
      selectedSubcategoryIndex: -1,
      selectedKind: '',
      modalOpen: false,
      editing: false,
      saving: false,
      deleting: false,
      downloading: false,
      showLocationDialog: false,
      selectedLocation: 'downloads',
      fieldModal: { open: false, type: '', name: '', category: '', parentId: null },
      form: {
        id: null,
        date: '',
        categoryId: null,
        subCategoryId: null,
        kind: 'EXPENSE',
        description: '',
        amount: '',
        notes: '',
        flow: 'OUT',
        branchId: null,
        locationId: null,
        settlementDate: null
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

    // Subcategory options computed from selected category
    subcategoryOptions() {
      const subcats = this.expenseCategories.find(c => c.id === this.selectedCategoryId)?.subCategories || []
      return subcats.map(sc => ({ value: sc.id, label: sc.name }))
    },

    filteredSubcategoryOptions() {
      if (!this.subcategoryInput || !this.subcategoryInput.trim()) return this.subcategoryOptions
      const q = this.subcategoryInput.toLowerCase().trim()
      return this.subcategoryOptions.filter(opt => opt.label.toLowerCase().includes(q))
    },

    // Map of category keys -> localized labels (from i18n), used by getCategoryLabel/getCategoryColor
    categories() {
      try {
        const base = this.$tm && this.$tm('expenses.categories')
        return base || {}
      } catch (e) {
        return {}
      }
    },
    
    filteredExpenses() {
      let filtered = this.expenses
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(expense => 
          (expense.description || '').toLowerCase().includes(query) ||
          (expense.category || '').toLowerCase().includes(query) ||
          (expense.classification || '').toLowerCase().includes(query) ||
          (expense.notes && expense.notes.toLowerCase().includes(query))
        )
      }
      
      if (this.selectedCategoryId) {
        filtered = filtered.filter(expense => expense.categoryId === this.selectedCategoryId)
      }
      if (this.selectedSubcategoryId) {
        filtered = filtered.filter(expense => expense.subCategoryId === this.selectedSubcategoryId)
      }
      if (this.selectedKind) {
        filtered = filtered.filter(expense => expense.kind === this.selectedKind)
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
    selectedCategoryId() {
      this.selectedSubcategoryId = null
      this.subcategoryInput = ''
      this.currentPage = 1
      this.loadExpenses()
    },
    selectedSubcategoryId() {
      // Keep input label in sync and trigger filtering
      if (this.selectedSubcategoryId) {
        const sc = this.subcategoryOptions.find(s => s.value === this.selectedSubcategoryId)
        this.subcategoryInput = sc ? sc.label : ''
      } else {
        this.subcategoryInput = ''
      }
      this.currentPage = 1
      this.loadExpenses()
    },
    selectedKind() {
      this.currentPage = 1
      this.loadExpenses()
    }
  },
  
  async mounted() {
    // Load hierarchical expense categories
    try {
      const r = await getExpenseCategories()
      this.expenseCategories = r.data || []
    } catch (e) {
      this.expenseCategories = []
    }
    await this.loadExpenses()
    await this.fetchBranches()
    await this.fetchLocations()
  },
  
  methods: {
    async loadExpenses() {
      this.loading = true
      this.error = null
      
      try {
        // Build params object with all filters (only non-empty values)
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize
        }
        if (this.searchQuery) params.q = this.searchQuery
        if (this.selectedCategoryId !== null && this.selectedCategoryId !== undefined) params.categoryId = this.selectedCategoryId
        if (this.selectedSubcategoryId !== null && this.selectedSubcategoryId !== undefined) params.subCategoryId = this.selectedSubcategoryId
        if (this.selectedKind) params.kind = this.selectedKind
        
        const response = await getExpenses(params)
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
    // Subcategory combobox handlers
    handleSubcategoryInput() {
      this.showSubcategoryDropdown = true
      this.selectedSubcategoryIndex = -1
    },

    handleSubcategoryBlur() {
      setTimeout(() => {
        if (!this.showSubcategoryDropdown) return
        this.showSubcategoryDropdown = false
        if (this.selectedSubcategoryId) {
          const sc = this.subcategoryOptions.find(s => s.value === this.selectedSubcategoryId)
          this.subcategoryInput = sc ? sc.label : ''
        } else {
          this.subcategoryInput = ''
        }
        this.selectedSubcategoryIndex = -1
      }, 200)
    },

    selectSubcategory(subcatId) {
      const opt = this.subcategoryOptions.find(s => s.value === subcatId)
      if (opt) {
        this.subcategoryInput = opt.label
        this.selectedSubcategoryId = opt.value
        this.showSubcategoryDropdown = false
        this.selectedSubcategoryIndex = -1
        this.currentPage = 1
        this.loadExpenses()
      }
    },

    handleSubcategoryKeydown(event) {
      if (event.key === 'Enter') {
        event.preventDefault()
        if (this.filteredSubcategoryOptions.length > 0 && this.selectedSubcategoryIndex >= 0) {
          const option = this.filteredSubcategoryOptions[this.selectedSubcategoryIndex]
          this.selectSubcategory(option.value)
        } else if (this.filteredSubcategoryOptions.length === 1) {
          this.selectSubcategory(this.filteredSubcategoryOptions[0].value)
        }
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        if (this.showSubcategoryDropdown) {
          this.selectedSubcategoryIndex = Math.min(this.selectedSubcategoryIndex + 1, this.filteredSubcategoryOptions.length - 1)
        } else {
          this.showSubcategoryDropdown = true
          this.selectedSubcategoryIndex = 0
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        if (this.showSubcategoryDropdown) {
          this.selectedSubcategoryIndex = Math.max(this.selectedSubcategoryIndex - 1, -1)
        }
      } else if (event.key === 'Escape') {
        this.showSubcategoryDropdown = false
        this.selectedSubcategoryIndex = -1
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
        date: getTodayISO(),
        categoryId: null,
        subCategoryId: null,
        kind: 'EXPENSE',
        description: '',
        amount: '',
        flow: 'OUT',
        branchId: null,
        locationId: this.locations?.[0]?.id ?? null,
        notes: '',
        settlementDate: null
      }
      this.modalOpen = true
    },
    
    openEditModal(expense) {
      this.editing = true
      this.form = {
        id: expense.id,
        date: expense.date.split('T')[0],
        categoryId: expense.categoryId || null,
        subCategoryId: expense.subCategoryId || null,
        kind: expense.kind || 'EXPENSE',
        description: expense.description,
        amount: expense.amount,
        flow: expense.flow || 'OUT',
        branchId: expense.branchId || null,
        locationId: expense.locationId || null,
        notes: expense.notes || '',
        settlementDate: expense.settlementDate || null
      }
      this.modalOpen = true
    },
    
    closeModal() {
      this.modalOpen = false
      this.form = {
        id: null,
        date: '',
        categoryId: null,
        subCategoryId: null,
        kind: 'EXPENSE',
        description: '',
        amount: '',
        flow: 'OUT',
        branchId: null,
        locationId: null,
        notes: '',
        settlementDate: null
      }
    },
    
    async saveExpense() {
      if (!this.validateForm()) return
      
      this.saving = true
      
      try {
        const expenseData = {
          date: this.form.date,
          kind: this.form.kind || 'EXPENSE',
          categoryId: this.form.categoryId,
          subCategoryId: this.form.subCategoryId || undefined,
          description: this.form.description,
          amount: parseFloat(this.form.amount),
          flow: this.form.flow || 'OUT',
          branchId: this.form.branchId || null,
          // send the selected locationId (required and validated)
          locationId: this.form.locationId,
          notes: this.form.notes || ''
        }
        // Normalize settlementDate: send either null or an ISO datetime string
        if (this.form.settlementDate) {
          // Inputs of type=date produce YYYY-MM-DD. Make an explicit UTC ISO datetime
          const parsed = new Date(this.form.settlementDate + 'T00:00:00Z')
          if (isNaN(parsed.getTime())) {
            this.showError(this.$t('expenses.validation.settlementDateInvalid') || 'Invalid settlement date')
            this.saving = false
            return
          }
          expenseData.settlementDate = parsed.toISOString()
        } else {
          expenseData.settlementDate = null
        }
        
        if (this.editing) {
          try {
            await updateExpense(this.form.id, expenseData)
            const index = this.expenses.findIndex(e => e.id === this.form.id)
            if (index !== -1) {
              this.expenses.splice(index, 1, { ...this.expenses[index], ...expenseData })
            }
            // Refresh list to pick up any backend-side changes (including saved category)
            await this.loadExpenses()
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
            // Refresh list to reflect newly created expense (and capture any backend-assigned category)
            await this.loadExpenses()
            this.totalItems = this.expenses.length
          } catch (createError) {
            // If backend is not available, simulate creation
            if (createError.response?.status === 500 || createError.code === 'ERR_NETWORK') {
              console.log('Backend not available, simulating expense creation')
              const newExpense = {
                id: Date.now(), // Generate a temporary ID
                date: expenseData.date + 'T00:00:00.000Z',
                  category: (this.expenseCategories.find(c => c.id === expenseData.categoryId)?.name) || '',
                  categoryId: expenseData.categoryId || null,
                  subCategoryId: expenseData.subCategoryId || null,
                description: expenseData.description,
                  amount: expenseData.amount.toString(),
                  notes: expenseData.notes,
                  location: this.locations.find(l => l.id === expenseData.locationId) || null,
                  locationId: expenseData.locationId,
                  classification: '',
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
      if (!this.form.categoryId) {
        this.showError(this.$t('expenses.validation.categoryRequired'))
        return false
      }
      if (this.form.locationId === null) {
        this.showError((this.$t('expenses.location') || 'Location') + ' ' + (this.$t('common.required') || 'is required'))
        return false
      }
      // Category validity is enforced via categoryId selection; no extra check needed here
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
      this.selectedCategoryId = null
      this.selectedSubcategoryId = null
      this.selectedKind = ''
      this.currentPage = 1
      this.loadExpenses()
    },
    
    getCategoryLabel(category) {
      if (!category) return '-'
      // Handle both string and numeric categories and missing categories map
      const categories = this.categories || {}
      const categoryKey = typeof category === 'number' ? Object.keys(categories)[category] : category
      return categories[categoryKey] || categories[category] || category
    },
    
    getCategoryColor(category) {
      // Handle both string and numeric categories and missing categories map
      const categories = this.categories || {}
      const categoryKey = typeof category === 'number' ? Object.keys(categories)[category] : category
      const actualCategory = categoryKey || category
      
      const colors = {
        'Travel': 'theme-badge',
        'Meals': 'bg-green-100 text-green-800',
        'Office': 'theme-badge',
        'Equipment': 'bg-orange-100 text-orange-800',
        'Maintenance': 'bg-red-100 text-red-800',
        'Utilities': 'bg-yellow-100 text-yellow-800',
        'Marketing': 'bg-pink-100 text-pink-800',
        'Other': 'bg-gray-100 text-gray-800'
      }
      return colors[actualCategory] || 'bg-gray-100 text-gray-800'
    },

    getSubcategoryLabel(expense) {
      // Prefer resolving by IDs from hierarchical tree
      if (expense?.subCategoryId && this.expenseCategories?.length) {
        const cat = this.expenseCategories.find(c => c.id === expense.categoryId)
        const sub = cat?.subCategories?.find(sc => sc.id === expense.subCategoryId)
        if (sub?.name) return sub.name
      }

      // Fallback: legacy text field from backend
      return expense?.classification || '-'
    },
    
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      // Always use Gregorian calendar (en-US) to avoid Hijri in Chrome Arabic
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },
    
    formatCurrency(amount) {
      return new Intl.NumberFormat(this.isRTL ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: 'EGP'
      }).format(amount)
    },
    
    async downloadReport() {
      this.downloading = true
      try {
        const params = {}
        if (this.searchQuery) params.q = this.searchQuery
        if (this.selectedCategoryId !== null && this.selectedCategoryId !== undefined) params.categoryId = this.selectedCategoryId
        if (this.selectedSubcategoryId !== null && this.selectedSubcategoryId !== undefined) params.subCategoryId = this.selectedSubcategoryId
        if (this.selectedKind) params.kind = this.selectedKind
        // (Only pass filters available in this component: query, categoryId, subCategoryId, kind)
        const response = await getExpensesReport(params)
        // Handle both direct blob and response.data blob
        const blobData = response instanceof Blob ? response : response.data
        
        if (!(blobData instanceof Blob)) {
          throw new Error('Invalid response: expected Blob, got ' + typeof blobData)
        }
        
        const url = window.URL.createObjectURL(blobData)
        const link = document.createElement('a')
        link.href = url
        
        // Map selected location to filename
        let filename = 'expenses-report-' + getTodayISO() + '.xlsx'
        
        // Create download link with filename
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.parentNode.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        // Close modal after successful download
        this.showLocationDialog = false
        this.selectedLocation = 'downloads'
        
        this.showSuccess(this.$t('expenses.exportReport') + ' ' + (this.$t('common.success') || 'Success'))
      } catch (error) {
        console.error('Error downloading report:', error)
        const message = error.response?.data?.message || this.$t('expenses.reportError') || 'Failed to download report'
        this.showError(message)
      } finally {
        this.downloading = false
      }
    },
    
    async fetchBranches() {
      try {
        const response = await getBranches()
        this.branches = response.data || []
        // Don't auto-select first branch, default to Main Treasury (null)
      } catch (error) {
        console.error('Error loading branches:', error)
        this.branches = []
      }
    },

    async fetchLocations() {
      try {
        const res = await getLocations()
        // API may return array or { items: [] }
        this.locations = Array.isArray(res.data) ? res.data : (res.data.items || [])
        if (this.locations.length > 0 && !this.form.locationId) {
          this.form.locationId = this.locations[0].id
        }
      } catch (error) {
        console.error('Error loading locations:', error)
        this.locations = []
      }
    },


    addCategoryPrompt() {
      this.fieldModal = { open: true, type: 'category', name: '', category: '', parentId: null }
    },

    addSubcategoryPrompt(parentId = null) {
      // Allow invoking from the add/edit form (uses this.form.categoryId)
      // or from the filters (passes the selectedCategoryId)
      const categoryId = parentId || this.form.categoryId
      if (!categoryId) {
        this.showError(this.$t('expenses.validation.categoryRequired') || 'Select category first')
        return
      }
      const parentName = (this.expenseCategories.find(c => c.id === categoryId)?.name) || ''
      this.fieldModal = { open: true, type: 'subcategory', name: '', category: '', parentId: categoryId, parentName }
    },

    async refreshExpenseCategories() {
      const r = await getExpenseCategories()
      this.expenseCategories = r.data || []
    },

    addBranchPrompt() {
      this.fieldModal = { open: true, type: 'branch', name: '', category: '' }
    },

    addLocationPrompt() {
      this.fieldModal = { open: true, type: 'location', name: '', category: '' }
    },

    handleFieldSave(payload) {
      this.fieldModal.name = payload.name
      this.fieldModal.category = payload.category || ''
      this.saveFieldModal()
    },

    async saveFieldModal() {
      if (!this.fieldModal.name) {
        this.showError(
          this.fieldModal.type === 'category'
            ? this.$t('expenses.enterCategoryName')
            : this.fieldModal.type === 'branch'
            ? this.$t('expenses.enterBranchName')
            : this.$t('expenses.enterLocationName')
        )
        return
      }
      if (this.fieldModal.type === 'category') {
        const res = await createExpenseCategory({ name: this.fieldModal.name })
        await this.refreshExpenseCategories()
        this.form.categoryId = res.data.id
        this.form.subCategoryId = null
        this.showSuccess(this.$t('expenses.success.categoryAdded') || 'Category added')
      }
      else if (this.fieldModal.type === 'subcategory') {
        const categoryId = this.fieldModal.parentId
        const res = await createExpenseSubCategory(categoryId, { name: this.fieldModal.name })
        await this.refreshExpenseCategories()
        // Update both the add/edit form (if present) and the filter selection so the new subcategory is immediately usable
        this.form.categoryId = categoryId
        this.form.subCategoryId = res.data.id
        this.selectedCategoryId = categoryId
        this.selectedSubcategoryId = res.data.id
        this.showSuccess(this.$t('expenses.success.subcategoryAdded') || 'Subcategory added')
      } else if (this.fieldModal.type === 'branch') {
        try {
          const payload = { name: this.fieldModal.name, category: this.fieldModal.category }
          const res = await createBranch(payload)
          const newBranch = res.data
          this.branches.unshift(newBranch)
          this.form.branchId = newBranch.id
          this.showSuccess(this.$t('expenses.success.branchAdded') || 'Branch added')
        } catch (error) {
          console.error('Error creating branch, simulating:', error)
          // simulate
          const newBranch = { id: Date.now(), name: this.fieldModal.name, category: this.fieldModal.category }
          this.branches.unshift(newBranch)
          this.form.branchId = newBranch.id
          this.showSuccess('Branch added (simulated)')
        }
      } else if (this.fieldModal.type === 'location') {
        try {
          const payload = { name: this.fieldModal.name }
          const res = await createLocation(payload)
          const newLocation = res.data
          this.locations.unshift(newLocation)
          this.form.locationId = newLocation.id
          this.showSuccess(this.$t('expenses.success.locationAdded') || 'Location added')
        } catch (error) {
          console.error('Error creating location, simulating:', error)
          const newLocation = { id: Date.now(), name: this.fieldModal.name }
          this.locations.unshift(newLocation)
          this.form.locationId = newLocation.id
          this.showSuccess('Location added (simulated)')
        }
      }
      this.closeFieldModal()
    },

    closeFieldModal() {
      this.fieldModal = { open: false, type: '', name: '', category: '' }
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
