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
    <PageHeader :title="$t('expenses.title')" :subtitle="$t('expenses.searchBy')">
      <button 
        @click="openAddModal" 
        class="theme-button px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm text-xs sm:text-sm"
      >
        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        {{ $t('expenses.addExpense') }}
      </button>
    </PageHeader>

    <!-- Filters Section -->
    <div class="rounded-2xl border border-slate-200/80 bg-white/95 p-3 sm:p-5 space-y-4 shadow-lg shadow-slate-200/40">
      <h4 class="text-sm font-semibold theme-text-secondary">{{ $t('labels.filters') || 'الفلاتر' }}</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Start Date -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.startDate') || 'تاريخ البدء' }}</label>
          <DateField v-model="filters.startDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm" />
        </div>

        <!-- End Date -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.endDate') || 'تاريخ الانتهاء' }}</label>
          <DateField v-model="filters.endDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm" />
        </div>

        <!-- Main Term / البند الرئيسي -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">البند الرئيسي</label>
          <SearchDropdown
            v-model="filterCategorySearch"
            :items="expenseCategories"
            :allItems="expenseCategories"
            placeholder="ابحث عن البند الرئيسي..."
            clearable
            @select="(sel) => { selectedCategoryId = sel.id; filterCategorySearch = sel.name; selectedSubcategoryId = null; filterSubcategorySearch = '' }"
            @clear="() => { selectedCategoryId = null; filterCategorySearch = ''; selectedSubcategoryId = null; filterSubcategorySearch = '' }"
          />
        </div>

        <!-- Secondary Term / البند الفرعي -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">البند الفرعي</label>
          <SearchDropdown
            v-model="filterSubcategorySearch"
            :items="filterSubcategories"
            :allItems="filterSubcategories"
            :disabled="!selectedCategoryId"
            placeholder="ابحث عن البند الفرعي..."
            clearable
            @select="(sel) => { selectedSubcategoryId = sel.id; filterSubcategorySearch = sel.name }"
            @clear="() => { selectedSubcategoryId = null; filterSubcategorySearch = '' }"
          />
        </div>

        <!-- Location / الموقع -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.location') || 'الموقع' }}</label>
          <SearchDropdown
            v-model="filterLocationSearch"
            :items="locations"
            :allItems="locations"
            placeholder="ابحث عن الموقع..."
            clearable
            @select="(sel) => { selectedLocationId = sel.id; filterLocationSearch = sel.name }"
            @clear="() => { selectedLocationId = null; filterLocationSearch = '' }"
          />
        </div>

        <!-- Treasury/Custody / الخزينة أو العهدة -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">الخزينة / العهدة</label>
          <SearchDropdown
            v-model="filterTreasurySearch"
            :items="treasuryItems"
            :allItems="treasuryItems"
            placeholder="ابحث عن الخزينة / العهدة..."
            clearable
            @select="(sel) => { selectedTreasuryId = sel.id; filterTreasurySearch = sel.name }"
            @clear="() => { selectedTreasuryId = null; filterTreasurySearch = '' }"
          />
        </div>

        <!-- Payment Method / طريقة الدفع -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">طريقة الدفع</label>
          <SearchDropdown
            v-model="filterPaymentMethodSearch"
            :items="paymentMethodItems"
            :allItems="paymentMethodItems"
            placeholder="ابحث عن طريقة الدفع..."
            clearable
            @select="(sel) => { selectedPaymentMethod = sel.id; filterPaymentMethodSearch = sel.name }"
            @clear="() => { selectedPaymentMethod = ''; filterPaymentMethodSearch = '' }"
          />
        </div>

        <!-- Search / البحث في البيان -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">البحث في البيان</label>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="ابحث في البيان أو الوصف..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm"
            :class="isRTL ? 'text-right' : 'text-left'"
          />
        </div>
      </div>

      <!-- Filter Action Buttons -->
      <div class="flex gap-2 pt-2">
        <button @click="currentPage = 1; loadExpenses()" :disabled="loading"
          class="px-3 py-1.5 sm:px-4 sm:py-2 theme-button rounded-xl transition-colors disabled:opacity-50 text-xs sm:text-sm font-medium shadow-sm">
          {{ $t('labels.search') || 'بحث' }}
        </button>
        <button @click="clearFilters"
          class="px-3 py-1.5 sm:px-4 sm:py-2 border border-slate-200 bg-white hover:bg-slate-50 theme-text-secondary rounded-xl transition-colors text-xs sm:text-sm font-medium">
          {{ $t('expenses.clearSearch') || 'إعادة ضبط' }}
        </button>
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
              <th class="px-4 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('labels.#') }}
              </th>
              <th class="px-4 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.date') }}
              </th>
              <th class="px-4 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                البند الرئيسي
              </th>
              <th class="px-4 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                البند الفرعي
              </th>
              <th class="px-4 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.description') }}
              </th>
              <th class="px-4 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.location') }}
              </th>
              <th class="px-4 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                طريقة الدفع
              </th>
              <th class="px-4 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                الخزينة / العهدة
              </th>
              <th class="px-4 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.amount') }}
              </th>
              <th class="px-4 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.notes') }}
              </th>
              <th class="px-4 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('expenses.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(expense, index) in filteredExpenses" :key="expense.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-4 whitespace-nowrap text-sm theme-text-primary" :class="isRTL ? 'text-right' : 'text-left'">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm theme-text-primary" :class="isRTL ? 'text-right' : 'text-left'">
                {{ formatDate(expense.date) }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap" :class="isRTL ? 'text-right' : 'text-left'">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getCategoryColor(expense.category)">
                  {{ getCategoryLabel(expense.category) }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap" :class="isRTL ? 'text-right' : 'text-left'">
                <span v-if="getSubcategoryLabel(expense) !== '-'" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                  {{ getSubcategoryLabel(expense) }}
                </span>
                <span v-else class="text-xs theme-caption">-</span>
              </td>
              <td class="px-4 py-4 text-sm theme-text-primary max-w-xs truncate" :class="isRTL ? 'text-right' : 'text-left'">
                {{ expense.description }}
              </td>
              <td class="px-4 py-4 text-sm theme-text-primary" :class="isRTL ? 'text-right' : 'text-left'">
                <span v-if="expense.location" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium theme-badge">
                  {{ expense.location.name }}
                </span>
                <span v-else class="theme-caption">-</span>
              </td>
              <td class="px-4 py-4 text-sm theme-text-primary" :class="isRTL ? 'text-right' : 'text-left'">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {{ getPaymentMethodLabel(expense.paymentMethod) }}
                </span>
              </td>
              <td class="px-4 py-4 text-sm theme-text-primary" :class="isRTL ? 'text-right' : 'text-left'">
                <span v-if="expense.treasury" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="expense.treasury.type === 'CUSTODY' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'">
                  {{ expense.treasury.name }} ({{ expense.treasury.type === 'CUSTODY' ? 'عهدة' : 'خزينة' }})
                </span>
                <span v-else class="text-xs theme-caption">المصروفات الرئيسية</span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm font-bold text-slate-800" :class="isRTL ? 'text-right' : 'text-left'">
                {{ formatCurrency(expense.amount) }}
              </td>
              <td class="px-4 py-4 text-sm theme-text-muted max-w-xs truncate" :class="isRTL ? 'text-right' : 'text-left'">
                {{ expense.notes || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2" :class="isRTL ? 'flex-row-reverse' : ''">
                  <button 
                    @click="openEditModal(expense)" 
                    class="theme-text hover:theme-accent-muted transition-colors"
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
              <td colspan="12" class="px-6 py-12 text-center theme-text-muted">
                <div class="flex flex-col items-center">
                  <svg class="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p class="text-lg font-medium">{{ $t('expenses.noResults') }}</p>
                  <p class="text-sm theme-caption mt-1">{{ $t('expenses.searchBy') }}</p>
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
            <h3 class="font-semibold theme-text-primary">{{ expense.description }}</h3>
            <p class="text-sm theme-text-muted">{{ formatDate(expense.date) }}</p>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getCategoryColor(expense.category)">
            {{ getCategoryLabel(expense.category) }}
          </span>
        </div>
        
        <div class="flex justify-between items-center mb-3">
          <span class="text-lg font-semibold theme-text-primary">{{ formatCurrency(expense.amount) }}</span>
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
        
        <p v-if="expense.notes" class="text-sm theme-text-secondary" :class="isRTL ? 'text-right' : 'text-left'">
          {{ expense.notes }}
        </p>
      </div>
      
      <div v-if="filteredExpenses.length === 0" class="text-center py-12">
        <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p class="text-lg font-medium theme-text-muted">{{ $t('expenses.noResults') }}</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 p-3 sm:p-4 rounded-lg">
      <div class="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-2 w-full sm:w-auto">
        <div class="text-xs sm:text-sm theme-text-secondary text-center sm:text-start">
          {{ $t('supply.showing') }} {{ (currentPage - 1) * pageSize + 1 }} {{ $t('supply.to') }}
          {{ Math.min(currentPage * pageSize, totalItems) }} {{ $t('supply.of') }} {{ totalItems }} {{ $t('supply.results') }}
        </div>

        <div class="flex items-center gap-1.5 sm:gap-2">
          <label class="hidden sm:inline text-xs sm:text-sm theme-text-secondary">{{ $t('expenses.pageSize') }}:</label>
          <select
            v-model="pageSize"
            @change="onPageSizeChange"
            class="px-1.5 py-1 text-xs sm:text-sm border border-gray-300 rounded theme-input-focus"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 w-full sm:w-auto">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ $t('supply.previous') }}
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          :class="[
            'px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border rounded-lg transition-colors',
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
          class="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ $t('supply.next') }}
        </button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <teleport to="body">
      <transition name="kc-modal">
        <div v-if="modalOpen" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4 overflow-hidden" :dir="isRTL ? 'rtl' : 'ltr'" @click.self="closeModal">
          <div class="kc-modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <h2 class="text-xl sm:text-2xl font-bold theme-heading">
                {{ editing ? ($t('expenses.editExpense') || 'تعديل مصروف') : ($t('expenses.addExpense') || 'إضافة مصروف جديد') }}
              </h2>
              <button @click="closeModal" class="theme-text-muted hover:theme-text-primary text-3xl leading-none focus:outline-none">×</button>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-y-auto p-6 modal-body-container relative">
              <form id="expenseForm" @submit.prevent="saveExpense" class="space-y-6">
                
                <!-- Step 1: Date & Location -->
                <div v-if="modalStep===1" class="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 11h.01M7 15h.01M13 7h7M13 11h7M13 15h7M3 7h.01M3 11h.01M3 15h.01"></path></svg>
                    تصنيف البنود والموقع
                  </h4>

                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Date -->
                    <div>
                      <label class="block text-xs font-medium theme-text-secondary mb-1.5" :class="isRTL ? 'text-right' : 'text-left'">
                        {{ $t('expenses.date') }} <span class="text-red-500">*</span>
                      </label>
                      <DateField
                        v-model="form.date"
                        required
                        class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm"
                        :class="isRTL ? 'text-right' : 'text-left'"
                      />
                    </div>

                    <!-- Location -->
                    <div>
                      <label class="block text-xs font-medium theme-text-secondary mb-1.5" :class="isRTL ? 'text-right' : 'text-left'">
                        {{ $t('expenses.location') || 'الموقع' }} <span class="text-red-500">*</span>
                      </label>
                      <SearchDropdown
                          v-model="formLocationSearch"
                          :items="locations"
                          :allItems="locations"
                          placeholder="ابحث عن الموقع..."
                          inputClass="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm"
                          teleportTarget=".modal-body-container"
                          @select="(sel) => { form.locationId = sel.id; formLocationSearch = sel.name }"
                        />
                    </div>
                  </div>
                </div>

                <!-- Step 2: Editable expense rows with the same interaction rhythm as the supply modal -->
                <div v-if="modalStep===2" class="bg-white rounded-xl shadow-sm">
                  <div class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">تفاصيل المصروفات</h4>
                      <p class="mt-1 text-xs theme-text-muted">اكتب سطرًا جديدًا ثم اضغط Enter أو Tab لإنشاء سطر آخر بسرعة.</p>
                    </div>
                    <button type="button" @click="addRow" class="theme-button px-3 py-2 rounded-lg text-sm font-medium shadow-sm">
                      + إضافة سطر
                    </button>
                  </div>

                  <div class="p-2 sm:p-4">
                    <div class="relative overflow-x-auto overflow-y-visible rounded-xl border border-slate-200">
                      <table ref="tableRef" class="min-w-[980px] w-full border-collapse bg-white">
                        <thead class="theme-dashboard-bg-soft sticky top-0 z-10">
                          <tr>
                            <th class="w-12 px-3 py-3 text-center text-xs font-medium theme-text-secondary">#</th>
                            <th class="min-w-[180px] px-3 py-3 text-start text-xs font-medium theme-text-secondary">البند الرئيسي</th>
                            <th class="min-w-[180px] px-3 py-3 text-start text-xs font-medium theme-text-secondary">البند الفرعي</th>
                            <th class="min-w-[220px] px-3 py-3 text-start text-xs font-medium theme-text-secondary">البيان / الوصف</th>
                            <th class="min-w-[140px] px-3 py-3 text-start text-xs font-medium theme-text-secondary">المبلغ</th>
                            <th class="min-w-[160px] px-3 py-3 text-start text-xs font-medium theme-text-secondary">طريقة الدفع</th>
                            <th class="min-w-[180px] px-3 py-3 text-start text-xs font-medium theme-text-secondary">الخزينة / العهدة</th>
                            <th class="min-w-[220px] px-3 py-3 text-start text-xs font-medium theme-text-secondary">ملاحظات</th>
                            <th class="w-24 px-3 py-3 text-center text-xs font-medium theme-text-secondary">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 bg-white">
                          <tr v-for="(row, index) in rows" :key="row.id" class="align-top">
                            <td class="px-3 py-3 text-center text-sm theme-text-secondary">{{ index + 1 }}</td>
                            <td class="px-3 py-2">
                              <SearchDropdown
                                v-model="row.categorySearch"
                                :items="expenseCategories"
                                :allItems="expenseCategories"
                                placeholder="ابحث عن البند الرئيسي..."
                                inputClass="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm"
                                teleportTarget=".modal-body-container"
                                clearable
                                @select="(sel) => { row.categoryId = sel.id; row.categorySearch = sel.name; row.subCategoryId = null; row.subCategorySearch = '' }"
                                @clear="() => { row.categoryId = null; row.categorySearch = ''; row.subCategoryId = null; row.subCategorySearch = '' }"
                              />
                            </td>
                            <td class="px-3 py-2">
                              <SearchDropdown
                                v-model="row.subCategorySearch"
                                :items="getRowSubcategories(row)"
                                :allItems="getRowSubcategories(row)"
                                :disabled="!row.categoryId"
                                placeholder="ابحث عن البند الفرعي..."
                                inputClass="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm"
                                teleportTarget=".modal-body-container"
                                clearable
                                @select="(sel) => { row.subCategoryId = sel.id; row.subCategorySearch = sel.name }"
                                @clear="() => { row.subCategoryId = null; row.subCategorySearch = '' }"
                              />
                            </td>
                            <td class="px-3 py-2">
                              <input
                                v-model="row.description"
                                type="text"
                                placeholder="أدخل البيان أو الوصف..."
                                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm theme-input-focus"
                                @keydown.enter.prevent="handleEnterKey(index)"
                              />
                            </td>
                            <td class="px-3 py-2">
                              <input
                                v-model="row.amount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-semibold theme-input-focus"
                                @keydown.enter.prevent="handleEnterKey(index)"
                                @keydown.tab="onLastFieldTab(index, $event)"
                              />
                            </td>
                            <td class="px-3 py-2">
                              <SearchDropdown
                                v-model="row.paymentMethodSearch"
                                :items="paymentMethodItems"
                                :allItems="paymentMethodItems"
                                placeholder="ابحث عن طريقة الدفع..."
                                inputClass="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm"
                                teleportTarget=".modal-body-container"
                                @select="(sel) => { row.paymentMethod = sel.id; row.paymentMethodSearch = sel.name }"
                                @clear="() => { row.paymentMethod = 'CASH'; row.paymentMethodSearch = 'نقداً' }"
                              />
                            </td>
                            <td class="px-3 py-2">
                              <SearchDropdown
                                v-model="row.treasurySearch"
                                :items="treasuryItems"
                                :allItems="treasuryItems"
                                placeholder="ابحث عن الخزينة / العهدة..."
                                inputClass="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm"
                                teleportTarget=".modal-body-container"
                                clearable
                                @select="(sel) => { row.treasuryId = sel.id; row.treasurySearch = sel.name }"
                                @clear="() => { row.treasuryId = null; row.treasurySearch = '' }"
                              />
                            </td>
                            <td class="px-3 py-2">
                              <textarea
                                v-model="row.notes"
                                rows="2"
                                placeholder="ملاحظات"
                                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm theme-input-focus"
                                @keydown.enter.prevent="handleEnterKey(index)"
                                @keydown.tab="onLastFieldTab(index, $event)"
                              ></textarea>
                            </td>
                            <td class="px-3 py-2 text-center">
                              <div class="flex justify-center gap-2">
                                <button type="button" @click="duplicateRow(index)" class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-700" title="Duplicate">
                                  ⧉
                                </button>
                                <button type="button" @click="removeRow(index)" class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-red-600" title="Delete">
                                  ×
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div class="mt-4 flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div class="text-sm theme-text-secondary">{{ rows.length }} سطر</div>
                      <div class="text-sm font-semibold theme-text-primary">الإجمالي: {{ formatCurrency(step2Total) }}</div>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3" :dir="isRTL ? 'rtl' : 'ltr'">
              <button 
                type="button" 
                @click="closeModal"
                class="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-100 font-medium theme-text-secondary transition text-sm"
              >
                {{ $t('labels.cancel') || 'إلغاء' }}
              </button>
              <button v-if="modalStep===2" type="button" @click="modalStep=1" class="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-100 font-medium theme-text-secondary transition text-sm">
                {{ $t('labels.back') || 'رجوع' }}
              </button>
              <button v-if="modalStep===1" type="button" @click="validateStep1() && (modalStep=2)" class="px-6 py-2.5 theme-button rounded-xl font-semibold shadow-md transition text-sm">
                {{ $t('labels.next') || 'متابعة' }}
              </button>
              <button v-else type="submit" form="expenseForm" :disabled="saving" class="px-6 py-2.5 theme-button rounded-xl font-semibold shadow-md disabled:opacity-50 transition text-sm flex items-center gap-2">
                <div v-if="saving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {{ saving ? ($t('labels.saving') || 'جاري الحفظ...') : (editing ? ($t('labels.saveChanges') || 'حفظ التعديلات') : ($t('labels.save') || 'حفظ المصروف')) }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Delete Confirmation Modal -->
    <teleport to="body">
      <transition name="kc-modal">
        <div v-if="deleteConfirm.open" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4" :dir="isRTL ? 'rtl' : 'ltr'" @click.self="cancelDelete">
          <div class="kc-modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div class="p-6">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold theme-text-primary">{{ $t('expenses.deleteExpense') || 'حذف المصروف' }}</h3>
                  <p class="text-xs theme-text-muted mt-0.5">{{ $t('expenses.deleteConfirmation') || 'هل أنت تأكد من تقديم طلب حذف هذا المصروف؟' }}</p>
                </div>
              </div>
              
              <div class="flex gap-3 pt-2 justify-end">
                <button 
                  @click="cancelDelete"
                  class="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-100 font-medium theme-text-secondary transition text-sm"
                >
                  {{ $t('labels.cancel') || 'إلغاء' }}
                </button>
                <button 
                  @click="doDelete"
                  :disabled="deleting"
                  class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-md disabled:opacity-50 transition text-sm flex items-center gap-2"
                >
                  <div v-if="deleting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {{ deleting ? ($t('labels.deleting') || 'جاري الحذف...') : ($t('labels.delete') || 'حذف') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Location Dialog Modal -->
    <div v-if="showLocationDialog" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md animate-in fade-in duration-200" :class="isRTL ? 'direction-rtl' : ''">
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between rounded-t-lg" :class="isRTL ? 'flex-row-reverse' : ''">
          <h3 class="text-lg font-semibold theme-text-light">{{ $t('expenses.selectSaveLocation') }}</h3>
          <button @click="showLocationDialog = false" class="theme-text-light hover:text-green-100 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="px-6 py-6 space-y-4">
          <p class="text-sm theme-text-secondary" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('expenses.chooseLocationHint') }}</p>
          
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
                <div class="font-medium theme-text-primary">{{ $t('expenses.downloads') }}</div>
                <div class="text-xs theme-text-muted">~/Downloads</div>
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
                <div class="font-medium theme-text-primary">{{ $t('expenses.documents') }}</div>
                <div class="text-xs theme-text-muted">~/Documents</div>
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
                <div class="font-medium theme-text-primary">{{ $t('expenses.desktop') }}</div>
                <div class="text-xs theme-text-muted">~/Desktop</div>
              </div>
            </button>
          </div>

          <!-- Custom Path -->
          <div class="border-t pt-4">
            <label class="text-sm font-medium theme-text-secondary mb-2 block" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('expenses.customPath') }}</label>
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
            class="px-4 py-2 theme-text-secondary border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            {{ $t('labels.cancel') }}
          </button>
          <button 
            @click="downloadReport"
            :disabled="downloading"
            class="px-4 py-2 bg-green-600 theme-text-light rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
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
  createLocation,
  getTreasuries
} from '../../api'
import AddFieldModal from '@/components/shared/AddFieldModal.vue'
import DateField from '@/components/shared/DateField.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import { getTodayISO } from '@/utils/dateUtils'

export default {
  emits: ["navigateReport", "navigateStatement"],
  name: 'ExpensesList',
  components: { AddFieldModal, DateField, PageHeader, SearchDropdown },
  data() {
    return {
      expenses: [],
      branches: [],
      locations: [],
      treasuries: [],
      // Hierarchical expense categories tree
      expenseCategories: [],
      loading: false,
      error: null,
      searchQuery: '',
      selectedCategoryId: null,
      selectedSubcategoryId: null,
      selectedLocationId: null,
      selectedTreasuryId: null,
      selectedPaymentMethod: '',
      // Search text for SearchDropdown filters
      filterCategorySearch: '',
      filterSubcategorySearch: '',
      filterLocationSearch: '',
      filterTreasurySearch: '',
      filterPaymentMethodSearch: '',
      // Search text for modal form SearchDropdowns
      formCategorySearch: '',
      formSubcategorySearch: '',
      formLocationSearch: '',
      formPaymentMethodSearch: '',
      formTreasurySearch: '',
      filters: {
        startDate: '',
        endDate: ''
      },
      // Subcategory combobox state
      subcategoryInput: '',
      showSubcategoryDropdown: false,
      selectedSubcategoryIndex: -1,
      selectedKind: '',
      modalOpen: false,
        modalStep: 1,
      editing: false,
      saving: false,
      deleting: false,
      downloading: false,
      showLocationDialog: false,
      selectedLocation: 'downloads',
      tableRef: null,
      rows: [],
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
        treasuryId: null,
        paymentMethod: 'CASH',
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

    // Treasury items with computed display name for SearchDropdown
    treasuryItems() {
      return (this.treasuries || []).map(tr => ({
        id: tr.id,
        name: `${tr.name} (${tr.type === 'CUSTODY' ? 'عهدة' : 'خزينة'})`
      }))
    },

    // Payment method items for SearchDropdown
    paymentMethodItems() {
      return [
        { id: 'CASH', name: 'نقداً' },
        { id: 'BANK_TRANSFER', name: 'تحويل بنكي' },
        { id: 'CHEQUE', name: 'شيك' },
        { id: 'CUSTODY_CASH', name: 'عهدة نقداً' }
      ]
    },

    // Subcategories for filter (based on selected filter category)
    filterSubcategories() {
      if (!this.selectedCategoryId) return []
      return this.expenseCategories.find(c => c.id === this.selectedCategoryId)?.subCategories || []
    },

    // Subcategories for modal form (based on selected form category)
    formSubcategories() {
      if (!this.form.categoryId) return []
      return this.expenseCategories.find(c => c.id === this.form.categoryId)?.subCategories || []
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
    
    step2Total() {
      return this.rows.reduce((sum, row) => {
        const amount = parseFloat(String(row.amount || 0).replace(/,/g, ''))
        return sum + (Number.isFinite(amount) ? amount : 0)
      }, 0)
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
    await this.fetchTreasuries()
  },
  
  methods: {
    async fetchTreasuries() {
      try {
        const response = await getTreasuries({ includeArchived: false })
        this.treasuries = response.data || []
      } catch (e) {
        console.error('Failed to fetch treasuries in ExpensesList:', e)
        this.treasuries = []
      }
    },

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
        if (this.filters?.startDate) params.startDate = this.filters.startDate
        if (this.filters?.endDate) params.endDate = this.filters.endDate
        if (this.selectedCategoryId !== null && this.selectedCategoryId !== undefined) params.categoryId = this.selectedCategoryId
        if (this.selectedSubcategoryId !== null && this.selectedSubcategoryId !== undefined) params.subCategoryId = this.selectedSubcategoryId
        if (this.selectedLocationId !== null && this.selectedLocationId !== undefined) params.locationId = this.selectedLocationId
        if (this.selectedTreasuryId !== null && this.selectedTreasuryId !== undefined) params.treasuryId = this.selectedTreasuryId
        if (this.selectedPaymentMethod) params.paymentMethod = this.selectedPaymentMethod
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
        treasuryId: null,
        paymentMethod: 'CASH',
        notes: '',
        settlementDate: null
      }
      this.modalStep = 1
      this.rows = [this.createEmptyRow()]
      this.formLocationSearch = this.locations?.[0]?.name ?? ''
      this.formCategorySearch = ''
      this.formSubcategorySearch = ''
      this.formPaymentMethodSearch = 'نقداً'
      this.formTreasurySearch = ''
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
        treasuryId: expense.treasuryId || expense.treasury?.id || null,
        paymentMethod: expense.paymentMethod || 'CASH',
        notes: expense.notes || '',
        settlementDate: expense.settlementDate ? expense.settlementDate.split('T')[0] : null
      }
      this.modalStep = 1
      const parentCat = this.expenseCategories?.find(c => c.id === expense.categoryId)
      const row = this.createEmptyRow()
      row.categoryId = expense.categoryId || null
      row.categorySearch = parentCat?.name || ''
      row.subCategoryId = expense.subCategoryId || null
      row.subCategorySearch = parentCat?.subCategories?.find(sc => sc.id === expense.subCategoryId)?.name || ''
      row.description = expense.description || ''
      row.amount = expense.amount || ''
      row.paymentMethod = expense.paymentMethod || 'CASH'
      row.paymentMethodSearch = this.paymentMethodItems?.find(p => p.id === row.paymentMethod)?.name || 'نقداً'
      row.treasuryId = expense.treasuryId || expense.treasury?.id || null
      row.treasurySearch = expense.treasury?.name ? `${expense.treasury.name} (${expense.treasury.type === 'CUSTODY' ? 'عهدة' : 'خزينة'})` : ''
      row.notes = expense.notes || ''
      this.rows = [row]
      this.formLocationSearch = expense.location?.name || this.locations?.find(l => l.id === expense.locationId)?.name || ''
      this.formCategorySearch = parentCat?.name || ''
      this.formSubcategorySearch = parentCat?.subCategories?.find(sc => sc.id === expense.subCategoryId)?.name || ''
      this.formPaymentMethodSearch = this.paymentMethodItems?.find(p => p.id === expense.paymentMethod)?.name || 'نقداً'
      this.formTreasurySearch = expense.treasury?.name ? `${expense.treasury.name} (${expense.treasury.type === 'CUSTODY' ? 'عهدة' : 'خزينة'})` : ''
      this.modalOpen = true
    },
    
    closeModal() {
      this.modalOpen = false
      this.modalStep = 1
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
        treasuryId: null,
        paymentMethod: 'CASH',
        notes: '',
        settlementDate: null
      }
      this.rows = []
      this.formLocationSearch = ''
      this.formCategorySearch = ''
      this.formSubcategorySearch = ''
      this.formPaymentMethodSearch = ''
      this.formTreasurySearch = ''
    },

    createEmptyRow() {
      return {
        id: Date.now() + Math.random(),
        categoryId: null,
        subCategoryId: null,
        categorySearch: '',
        subCategorySearch: '',
        description: '',
        amount: '',
        paymentMethod: 'CASH',
        paymentMethodSearch: 'نقداً',
        treasuryId: null,
        treasurySearch: '',
        notes: ''
      }
    },

    addRow() {
      this.rows.push(this.createEmptyRow())
      this.$nextTick(() => {
        const rows = this.$refs.tableRef?.querySelectorAll('tbody tr') || []
        const lastRow = rows[this.rows.length - 1]
        const descriptionInput = lastRow?.querySelector('input[type="text"]')
        descriptionInput?.focus()
      })
    },

    duplicateRow(index) {
      const source = this.rows[index]
      if (!source) return
      const clone = { ...source, id: Date.now() + Math.random() }
      this.rows.splice(index + 1, 0, clone)
    },

    removeRow(index) {
      if (this.rows.length === 1) {
        this.rows = [this.createEmptyRow()]
        return
      }
      this.rows.splice(index, 1)
    },

    getRowSubcategories(row) {
      if (!row?.categoryId) return []
      return this.expenseCategories.find(c => c.id === row.categoryId)?.subCategories || []
    },

    onLastFieldTab(index, event) {
      if (event.shiftKey) return
      if (event.key === 'Tab' && index === this.rows.length - 1) {
        event.preventDefault()
        this.addRow()
      }
    },

    handleEnterKey(index) {
      if (index < this.rows.length - 1) return
      this.addRow()
    },
    
    async saveExpense() {
      if (!this.validateStep1() || !this.validateRows()) return
      
      this.saving = true
      
      try {
        const payloads = this.rows
          .filter(row => String(row.description || '').trim() || row.amount || row.categoryId)
          .map(row => {
            const amount = parseFloat(String(row.amount || '').replace(/,/g, ''))
            return {
              date: this.form.date,
              kind: this.form.kind || 'EXPENSE',
              categoryId: row.categoryId,
              subCategoryId: row.subCategoryId || undefined,
              description: String(row.description || '').trim(),
              amount: Number.isFinite(amount) ? amount : 0,
              flow: this.form.flow || 'OUT',
              branchId: this.form.branchId || null,
              locationId: this.form.locationId,
              treasuryId: row.treasuryId ?? null,
              paymentMethod: row.paymentMethod || 'CASH',
              notes: row.notes || ''
            }
          })

        if (payloads.length === 0) {
          this.showError(this.$t('expenses.validation.descriptionRequired'))
          this.saving = false
          return
        }

        if (this.editing) {
          const expenseData = {
            ...payloads[0],
            settlementDate: this.form.settlementDate ? new Date(this.form.settlementDate + 'T00:00:00Z').toISOString() : null
          }
          try {
            const res = await updateExpense(this.form.id, expenseData)
            if (res.status === 202 || res.data?.status === 'PENDING') {
              this.closeModal()
              this.showSuccess('تم تقديم طلب التعديل للموافقة الإدارية بنجاح')
              await this.loadExpenses()
              return
            }
            const index = this.expenses.findIndex(e => e.id === this.form.id)
            if (index !== -1) {
              this.expenses.splice(index, 1, { ...this.expenses[index], ...expenseData })
            }
            await this.loadExpenses()
          } catch (updateError) {
            if (updateError.response?.status === 202 || updateError.response?.data?.status === 'PENDING') {
              this.closeModal()
              this.showSuccess('تم تقديم طلب التعديل للموافقة الإدارية بنجاح')
              await this.loadExpenses()
              return
            }
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
              throw updateError
            }
          }
        } else {
          const createdExpenses = []
          for (const payload of payloads) {
            try {
              const response = await createExpense(payload)
              createdExpenses.push(response.data)
            } catch (createError) {
              if (createError.response?.status === 500 || createError.code === 'ERR_NETWORK') {
                createdExpenses.push({
                  id: Date.now() + Math.random(),
                  ...payload,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                })
              } else {
                throw createError
              }
            }
          }
          if (createdExpenses.length) {
            this.expenses.unshift(...createdExpenses)
            this.totalItems += createdExpenses.length
          }
          await this.loadExpenses()
        }
        
        this.closeModal()
        this.showSuccess(this.editing ? 'expenses.success.updated' : 'expenses.success.created')
      } catch (error) {
        console.error('Error saving expense:', error)
        console.error('Error details:', error.response?.data)
        
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
    
    validateStep1() {
      if (!this.form.date) {
        this.showError(this.$t('expenses.validation.dateRequired'))
        return false
      }
      if (this.form.locationId === null) {
        this.showError((this.$t('expenses.location') || 'Location') + ' ' + (this.$t('common.required') || 'is required'))
        return false
      }
      return true
    },

    validateRows() {
      if (!this.rows.length) {
        this.showError(this.$t('expenses.validation.descriptionRequired'))
        return false
      }

      for (let index = 0; index < this.rows.length; index += 1) {
        const row = this.rows[index]
        if (!row.categoryId) {
          this.showError(this.$t('expenses.validation.categoryRequired'))
          return false
        }
        if (!String(row.description || '').trim()) {
          this.showError(this.$t('expenses.validation.descriptionRequired'))
          return false
        }
        const amount = parseFloat(String(row.amount || '').replace(/,/g, ''))
        if (!Number.isFinite(amount) || amount <= 0) {
          this.showError(this.$t('expenses.validation.amountInvalid'))
          return false
        }
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
        const res = await deleteExpense(this.deleteConfirm.item.id)
        if (res?.status === 202 || res?.data?.status === 'PENDING') {
          this.cancelDelete()
          this.showSuccess('تم تقديم طلب الحذف للموافقة الإدارية بنجاح')
          await this.loadExpenses()
          return
        }
        this.expenses = this.expenses.filter(e => e.id !== this.deleteConfirm.item.id)
        this.totalItems--
        this.cancelDelete()
        this.showSuccess(this.$t('expenses.success.deleted'))
      } catch (error) {
        if (error.response?.status === 202 || error.response?.data?.status === 'PENDING') {
          this.cancelDelete()
          this.showSuccess('تم تقديم طلب الحذف للموافقة الإدارية بنجاح')
          await this.loadExpenses()
          return
        }
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
      this.selectedLocationId = null
      this.selectedTreasuryId = null
      this.selectedPaymentMethod = ''
      this.selectedKind = ''
      // Reset filter search texts
      this.filterCategorySearch = ''
      this.filterSubcategorySearch = ''
      this.filterLocationSearch = ''
      this.filterTreasurySearch = ''
      this.filterPaymentMethodSearch = ''
      this.filters = {
        startDate: '',
        endDate: ''
      }
      this.currentPage = 1
      this.loadExpenses()
    },

    getPaymentMethodLabel(method) {
      if (!method) return 'نقداً'
      const map = {
        'CASH': 'نقداً',
        'BANK_TRANSFER': 'تحويل بنكي',
        'CHEQUE': 'شيك',
        'CUSTODY_CASH': 'عهدة نقداً'
      }
      return map[method] || method
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
        'Other': 'bg-gray-100 theme-text-primary'
      }
      return colors[actualCategory] || 'bg-gray-100 theme-text-primary'
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
      if (isNaN(date.getTime())) return dateString;
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    },
    
    formatCurrency(amount) {
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
      return this.isRTL && formatted.startsWith('-') ? '\u200E' + formatted : formatted
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
