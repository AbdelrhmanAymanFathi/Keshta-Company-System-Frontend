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
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">
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
      <h4 class="text-sm font-semibold theme-text-secondary">{{ $t('labels.filters') }}</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Start Date -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.startDate') }}</label>
          <DateField v-model="filters.startDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm" />
        </div>

        <!-- End Date -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.endDate') }}</label>
          <DateField v-model="filters.endDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm" />
        </div>

        <!-- Settlement Date From / تاريخ التسوية من -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('expenses.settlementDate') }} {{ $t('labels.startDate') }}</label>
          <DateField v-model="filters.settlementDateStart"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm"
            :placeholder="$t('expenses.settlementDatePlaceholder')"
          />
        </div>

        <!-- Settlement Date To / تاريخ التسوية إلى -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('expenses.settlementDate') }} {{ $t('labels.endDate') }}</label>
          <DateField v-model="filters.settlementDateEnd"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm"
            :placeholder="$t('expenses.settlementDatePlaceholder')"
          />
        </div>

        <!-- Main Term / البند الرئيسي -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('expenses.mainTerm') }}</label>
          <SearchDropdown
            v-model="filterCategorySearch"
            :items="expenseCategories"
            :allItems="expenseCategories"
            :placeholder="$t('expenses.searchMainTerm')"
            clearable
            @select="(sel) => { selectedCategoryId = sel.id; filterCategorySearch = sel.name; selectedSubcategoryId = null; filterSubcategorySearch = '' }"
            @clear="() => { selectedCategoryId = null; filterCategorySearch = ''; selectedSubcategoryId = null; filterSubcategorySearch = '' }"
          />
        </div>

        <!-- Secondary Term / البند الفرعي -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('expenses.subTerm') }}</label>
          <SearchDropdown
            v-model="filterSubcategorySearch"
            :items="filterSubcategories"
            :allItems="filterSubcategories"
            :placeholder="$t('expenses.searchSubTerm')"
            clearable
            @select="(sel) => { selectedSubcategoryId = sel.id; filterSubcategorySearch = sel.name }"
            @clear="() => { selectedSubcategoryId = null; filterSubcategorySearch = '' }"
          />
        </div>

        <!-- Location / الموقع -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('expenses.location') }}</label>
          <SearchDropdown
            v-model="filterLocationSearch"
            :items="locations"
            :allItems="locations"
            :placeholder="$t('expenses.searchLocation')"
            clearable
            @select="(sel) => { selectedLocationId = sel.id; filterLocationSearch = sel.name }"
            @clear="() => { selectedLocationId = null; filterLocationSearch = '' }"
          />
        </div>

        <!-- Treasury/Custody / الخزينة أو العهدة -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('expenses.treasuryOrCustody') }}</label>
          <SearchDropdown
            v-model="filterTreasurySearch"
            :items="treasuryItems"
            :allItems="treasuryItems"
            :placeholder="$t('expenses.searchTreasury')"
            clearable
            @select="(sel) => { selectedTreasuryId = sel.id; filterTreasurySearch = sel.name }"
            @clear="() => { selectedTreasuryId = null; filterTreasurySearch = '' }"
          />
        </div>

        <!-- Payment Method / طريقة الدفع -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('expenses.paymentMethod') }}</label>
          <SearchDropdown
            v-model="filterPaymentMethodSearch"
            :items="paymentMethodItems"
            :allItems="paymentMethodItems"
            :placeholder="$t('expenses.searchPaymentMethod')"
            clearable
            @select="(sel) => { selectedPaymentMethod = sel.id; filterPaymentMethodSearch = sel.name }"
            @clear="() => { selectedPaymentMethod = ''; filterPaymentMethodSearch = '' }"
          />
        </div>

        <!-- Search / البحث في البيان -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('expenses.searchStatement') }}</label>
          <input 
            v-model="searchQuery" 
            type="text" 
            :placeholder="$t('expenses.searchNotesPlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm"
            :class="isRTL ? 'text-right' : 'text-left'"
          />
        </div>

        <!-- Search by amount / البحث بالمبلغ -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('expenses.searchAmount') }}</label>
          <input
            v-model="amountSearch"
            type="text"
            inputmode="decimal"
            :placeholder="$t('expenses.searchAmountPlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm"
            :class="isRTL ? 'text-right' : 'text-left'"
          />
        </div>
      </div>

      <!-- Filter Action Buttons -->
      <div class="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
        <button @click="currentPage = 1; resolveSubcategoryFilterFromSearch(); loadExpenses()" :disabled="loading"
          class="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 theme-button rounded-xl transition-colors disabled:opacity-50 text-xs sm:text-sm font-medium shadow-sm">
          {{ $t('labels.search') }}
        </button>
        <button @click="clearFilters"
          class="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 border border-slate-200 bg-white hover:bg-slate-50 theme-text-secondary rounded-xl transition-colors text-xs sm:text-sm font-medium">
          {{ $t('expenses.clearSearch') }}
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

    <!-- Laptop/desktop: one card, all columns visible, text wraps instead of clipping -->
    <div v-if="!loading && !error" class="expenses-list-card hidden lg:block rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40">
      <table class="expenses-list-table">
        <colgroup>
          <col style="width: 3.5%" />
          <col style="width: 8%" />
          <col style="width: 9%" />
          <col style="width: 9%" />
          <col style="width: 11%" />
          <col style="width: 9%" />
          <col style="width: 7%" />
          <col style="width: 12%" />
          <col style="width: 8%" />
          <col style="width: 10%" />
          <col style="width: 6%" />
          <col style="width: 7.5%" />
        </colgroup>
        <thead>
          <tr>
            <th>{{ $t('labels.#') }}</th>
            <th class="cursor-pointer select-none hover:opacity-80" @click="sortBy('date')">
              {{ $t('expenses.date') }}
              <SortIcon :active="sortField === 'date'" :dir="sortOrder" />
            </th>
            <th>{{ $t('expenses.mainTerm') }}</th>
            <th>{{ $t('expenses.subTerm') }}</th>
            <th>{{ $t('expenses.description') }}</th>
            <th>{{ $t('expenses.location') }}</th>
            <th>{{ $t('expenses.paymentMethod') }}</th>
            <th>{{ $t('expenses.treasuryOrCustody') }}</th>
            <th>{{ $t('expenses.settlementDate') }}</th>
            <th>{{ $t('expenses.amount') }}</th>
            <th>{{ $t('expenses.notes') }}</th>
            <th class="actions-col">{{ $t('expenses.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(expense, index) in filteredExpenses" :key="expense.id" @contextmenu.prevent="showExpenseContextMenu($event, expense)">
            <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
            <td>{{ formatDate(expense.date) }}</td>
            <td>
              <span class="expense-chip" :class="getCategoryColor(expense.category)">{{ getCategoryLabel(expense.category) }}</span>
            </td>
            <td>
              <span v-if="getSubcategoryLabel(expense) !== '-'" class="expense-chip bg-slate-100 text-slate-700">{{ getSubcategoryLabel(expense) }}</span>
              <span v-else>-</span>
            </td>
            <td>{{ expense.description }}</td>
            <td>
              <span v-if="expense.location" class="expense-chip theme-badge">{{ expense.location.name }}</span>
              <span v-else>-</span>
            </td>
            <td>
              <span class="expense-chip bg-emerald-50 text-emerald-800 border border-emerald-200">{{ getPaymentMethodLabel(expense.paymentMethod) }}</span>
            </td>
            <td>
              <span v-if="expense.treasury" class="expense-chip" :class="expense.treasury.type === 'CUSTODY' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'">
                {{ expense.treasury.name }} ({{ expense.treasury.type === 'CUSTODY' ? 'عهدة' : 'خزينة' }})
              </span>
              <span v-else>{{ $t('expenses.mainExpensesFallback') }}</span>
              <span v-if="expense.destinationTreasury" class="expense-chip bg-violet-100 text-violet-800">
                ← {{ expense.destinationTreasury.name }}
              </span>
            </td>
            <td>{{ formatDate(expense.settlementDate) }}</td>
            <td class="amount-cell">{{ formatCurrency(expense.amount) }}</td>
            <td>{{ expense.notes || '-' }}</td>
            <td class="actions-col">
              <div class="flex gap-1.5">
                <button type="button" @click="openEditModal(expense)" class="theme-text" :title="$t('labels.edit')">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button type="button" @click="confirmDelete(expense)" class="text-red-600" :title="$t('labels.delete')">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredExpenses.length === 0">
            <td colspan="12" class="empty-cell">
              <p class="text-lg font-medium">{{ $t('expenses.noResults') }}</p>
              <p class="text-sm theme-caption mt-1">{{ $t('expenses.searchBy') }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Phone / tablet: same fields stacked inside one card -->
    <div v-if="!loading && !error" class="lg:hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40">
      <div
        v-for="expense in filteredExpenses"
        :key="expense.id"
        class="border-b border-slate-100 last:border-b-0 p-4"
        @contextmenu.prevent="showExpenseContextMenu($event, expense)"
      >
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="min-w-0">
            <h3 class="font-semibold theme-text-primary break-words">{{ expense.description }}</h3>
            <p class="text-sm theme-text-muted mt-1">{{ formatDate(expense.date) }}</p>
          </div>
          <span class="text-base font-bold text-slate-800 shrink-0">{{ formatCurrency(expense.amount) }}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div><span class="theme-caption">{{ $t('expenses.mainTerm') }}:</span> {{ getCategoryLabel(expense.category) }}</div>
          <div><span class="theme-caption">{{ $t('expenses.subTerm') }}:</span> {{ getSubcategoryLabel(expense) }}</div>
          <div><span class="theme-caption">{{ $t('expenses.location') }}:</span> {{ expense.location?.name || '-' }}</div>
          <div><span class="theme-caption">{{ $t('expenses.paymentMethod') }}:</span> {{ getPaymentMethodLabel(expense.paymentMethod) }}</div>
          <div>
            <span class="theme-caption">{{ $t('expenses.treasuryOrCustody') }}:</span>
            {{ expense.treasury ? `${expense.treasury.name} (${expense.treasury.type === 'CUSTODY' ? 'عهدة' : 'خزينة'})` : $t('expenses.mainExpensesFallback') }}
            <span v-if="expense.destinationTreasury"> ← {{ expense.destinationTreasury.name }}</span>
          </div>
          <div><span class="theme-caption">{{ $t('expenses.settlementDate') }}:</span> {{ formatDate(expense.settlementDate) }}</div>
        </div>
        <p v-if="expense.notes" class="text-sm theme-text-secondary mt-3 break-words">{{ expense.notes }}</p>
        <div class="flex gap-2 mt-3">
          <button type="button" @click="openEditModal(expense)" class="p-2 theme-text" :title="$t('labels.edit')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button type="button" @click="confirmDelete(expense)" class="p-2 text-red-600" :title="$t('labels.delete')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>
      <div v-if="filteredExpenses.length === 0" class="text-center py-12 theme-text-muted">{{ $t('expenses.noResults') }}</div>
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

    <!-- Context Menu for Rows -->
    <div v-if="expenseContextMenu.visible" 
         class="context-menu" 
         :style="{ top: expenseContextMenu.top + 'px', left: expenseContextMenu.left + 'px' }"
         @click="hideExpenseContextMenu">
      <div class="context-menu-item" @click="openEditModal(expenseContextMenu.expense)">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
        <span>{{ $t('labels.edit') || 'تعديل' }}</span>
      </div>
      <div class="context-menu-item delete-item" @click="confirmDelete(expenseContextMenu.expense)">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
        <span>{{ $t('labels.delete') || 'حذف' }}</span>
      </div>
    </div>
    
    <!-- Add/Edit Modal -->
    <teleport to="body">
      <transition name="kc-modal">
        <div v-if="modalOpen" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4 overflow-hidden" :dir="isRTL ? 'rtl' : 'ltr'" @click.self="closeModal">
          <div class="kc-modal-panel bg-white rounded-2xl shadow-2xl w-[calc(100vw-16px)] max-w-[calc(100vw-16px)] md:w-[96vw] md:max-w-[96vw] max-h-[95vh] flex flex-col" :class="isRTL ? 'rtl-modal' : ''">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <h2 class="text-xl sm:text-2xl font-bold theme-heading">
                {{ editing ? ($t('expenses.editExpense') || 'تعديل مصروف') : ($t('expenses.addExpense') || 'إضافة مصروف جديد') }}
              </h2>
              <button @click="closeModal" class="theme-text-muted hover:theme-text-primary text-3xl leading-none focus:outline-none">×</button>
            </div>

            <!-- Body -->
            <div class="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 modal-body-container relative" :class="isRTL ? 'rtl-modal' : ''">
              <form id="expenseForm" @submit.prevent="saveExpense" class="space-y-6" :class="isRTL ? 'rtl-modal' : ''">
                
                <!-- Step 1: Date & Treasury -->
                <!-- Step 1: Settlement Date & Treasury -->
                <div v-if="modalStep===1" class="bg-white rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 11h.01M7 15h.01M13 7h7M13 11h7M13 15h7M3 7h.01M3 11h.01M3 15h.01"></path></svg>
                    {{ $t('expenses.modalStepOneTitle') }}
                  </h4>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- Settlement Date -->
                    <div>
                      <label class="block text-xs font-medium theme-text-secondary mb-1.5" :class="isRTL ? 'text-right' : 'text-left'">
                        {{ $t('expenses.settlementDate') || 'تاريخ التسوية' }} <span class="text-red-500">*</span>
                      </label>
                      <DateField
                        v-model="form.settlementDate"
                        required
                        class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm"
                        :class="isRTL ? 'text-right' : 'text-left'"
                      />
                    </div>

                    <!-- Treasury -->
                    <div>
                      <label class="block text-xs font-medium theme-text-secondary mb-1.5" :class="isRTL ? 'text-right' : 'text-left'">
                        {{ $t('expenses.treasuryOrCustody') }} <span class="text-red-500">*</span>
                      </label>
                      <SearchDropdown
                        v-model="formTreasurySearch"
                        :items="treasuryItems"
                        :allItems="treasuryItems"
                        :placeholder="$t('expenses.searchTreasury')"
                        :inputClass="'w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm ' + (isRTL ? 'text-right' : 'text-left')"
                        teleportTarget="body"
                        clearable
                        @select="onSelectSourceTreasury"
                        @clear="onClearSourceTreasury"
                      />
                    </div>

                </div>
                </div>

                <!-- Step 2: Editable expense rows with exact requested column structure -->
                <div v-if="modalStep===2" class="bg-white rounded-xl shadow-sm">
                  <div class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">{{ $t('expenses.modalStepTwoTitle') }}</h4>
                      <p class="mt-1 text-xs theme-text-muted">{{ $t('expenses.modalStepTwoHint') }}</p>
                    </div>
                    <button type="button" @click="addRow" class="theme-button px-3 py-2 rounded-lg text-sm font-medium shadow-sm">
                      + {{ $t('expenses.addRow') }}
                    </button>
                  </div>

                  <div class="p-4 sm:p-5">
                    <div class="expense-rows-table-container relative overflow-x-auto overflow-y-visible rounded-xl border border-slate-200">
                      <table ref="tableRef" class="expense-rows-table w-full border-collapse bg-white" style="table-layout:auto;min-width:max-content">
                        <thead class="theme-dashboard-bg-soft sticky top-0 z-10">
                          <tr>
                            <th class="w-10 px-2 py-2 text-center text-xs font-medium theme-text-secondary">#</th>
                            <th class="expense-column-date px-2 py-2 text-start text-xs font-medium theme-text-secondary whitespace-nowrap" style="min-width:8rem;width:8rem">{{ $t('expenses.date') || 'التاريخ' }}</th>
                            <th class="expense-column-amount px-2 py-2 text-start text-xs font-medium theme-text-secondary whitespace-nowrap" style="min-width:7rem;width:7rem">{{ $t('expenses.amount') }}</th>
                            <th class="expense-column-description px-2 py-2 text-start text-xs font-medium theme-text-secondary" style="min-width:9rem">{{ $t('expenses.statementOrDescription') }}</th>
                            <th class="expense-column-category px-2 py-2 text-start text-xs font-medium theme-text-secondary" style="min-width:10rem">{{ $t('expenses.subTerm') }}</th>
                            <th class="expense-column-category px-2 py-2 text-start text-xs font-medium theme-text-secondary" style="min-width:10rem">{{ $t('expenses.mainTerm') }}</th>
                            <th class="expense-column-category px-2 py-2 text-start text-xs font-medium theme-text-secondary" style="min-width:9rem">{{ $t('expenses.location') }}</th>
                            <th class="expense-column-notes px-2 py-2 text-start text-xs font-medium theme-text-secondary" style="min-width:8rem">{{ $t('expenses.notes') }}</th>
                            <th class="expense-column-settlement px-2 py-2 text-start text-xs font-medium theme-text-secondary whitespace-nowrap" style="min-width:7.5rem;width:7.5rem">{{ $t('expenses.settlementDate') || 'تاريخ التسوية' }}</th>
                            <th class="actions-col px-2 py-2 text-center text-xs font-medium theme-text-secondary whitespace-nowrap" style="min-width:5rem;width:5rem">{{ $t('expenses.actions') }}</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 bg-white">
                          <tr v-for="(row, index) in rows" :key="row.id" class="align-top">
                            <td class="px-2 py-2 text-center text-sm theme-text-secondary">{{ index + 1 }}</td>
                            <!-- Row Date (Editable per row) -->
                            <td class="expense-column-date px-2 py-2" style="min-width:8rem">
                              <DateField
                                v-model="row.date"
                                class="w-full min-w-[8rem] border border-gray-300 rounded-lg px-2 py-2 text-sm theme-input-focus"
                                :class="isRTL ? 'text-right' : 'text-left'"
                                @keydown.enter.prevent="handleFieldNavigation(index, 'date', $event)"
                                @keydown.tab="handleFieldNavigation(index, 'date', $event)"
                              />
                            </td>
                            <td class="expense-column-amount px-2 py-2" style="min-width:7rem">
                              <input
                                v-model="row.amount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                class="expense-amount-input w-full min-w-[7rem] border border-gray-300 rounded-lg px-2 py-2 text-sm font-semibold theme-input-focus"
                                :class="isRTL ? 'text-right' : 'text-left'"
                                @keydown.enter.prevent="handleFieldNavigation(index, 'amount', $event)"
                                @keydown.tab="handleFieldNavigation(index, 'amount', $event)"
                              />
                            </td>
                            <td class="px-2 py-2" style="min-width:9rem">
                              <input
                                v-model="row.description"
                                type="text"
                                :placeholder="$t('expenses.statementPlaceholder')"
                                class="w-full min-w-[9rem] border border-gray-300 rounded-lg px-2 py-2 text-sm theme-input-focus"
                                :class="isRTL ? 'text-right' : 'text-left'"
                                @keydown.enter.prevent="handleFieldNavigation(index, 'description', $event)"
                                @keydown.tab="handleFieldNavigation(index, 'description', $event)"
                              />
                            </td>
                            <td class="px-2 py-2" style="min-width:16rem">
                              <SearchDropdown
                                v-model="row.subCategorySearch"
                                :items="combinedSubcategoryItems"
                                :allItems="combinedSubcategoryItems"
                                :placeholder="$t('expenses.searchSubTerm')"
                                :inputClass="'w-full min-w-[16rem] px-2 py-2 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm ' + (isRTL ? 'text-right' : 'text-left')"
                                teleportTarget="body"
                                clearable
                                @select="(sel) => onSelectRowSubItem(row, sel)"
                                @clear="() => onClearRowContractor(row)"
                                @keydown.enter.prevent="handleFieldNavigation(index, 'subcategory', $event)"
                                @keydown.tab="handleFieldNavigation(index, 'subcategory', $event)"
                              />
                            </td>
                            <td class="px-2 py-2" style="min-width:14rem">
                              <SearchDropdown
                                v-model="row.categorySearch"
                                :items="getRowCategories(row)"
                                :allItems="getRowCategories(row)"
                                :placeholder="$t('expenses.searchMainTerm')"
                                :inputClass="'w-full min-w-[14rem] px-2 py-2 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm ' + (isRTL ? 'text-right' : 'text-left')"
                                teleportTarget="body"
                                clearable
                                @select="(sel) => onSelectRowCategory(row, sel)"
                                @clear="() => onClearRowCategory(row)"
                                @keydown.enter.prevent="handleFieldNavigation(index, 'category', $event)"
                                @keydown.tab="handleFieldNavigation(index, 'category', $event)"
                              />
                            </td>
                            <td class="px-2 py-2" style="min-width:9rem">
                              <SearchDropdown
                                v-model="row.locationSearch"
                                :items="locations"
                                :allItems="locations"
                                :placeholder="$t('expenses.searchLocation')"
                                :inputClass="'w-full min-w-[9rem] px-2 py-2 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm ' + (isRTL ? 'text-right' : 'text-left')"
                                teleportTarget="body"
                                clearable
                                @select="(sel) => { row.locationId = sel.id; row.locationSearch = sel.name }"
                                @clear="() => { row.locationId = null; row.locationSearch = '' }"
                                @keydown.enter.prevent="handleFieldNavigation(index, 'location', $event)"
                                @keydown.tab="handleFieldNavigation(index, 'location', $event)"
                              />
                            </td>
                            <td class="px-2 py-2" style="min-width:8rem">
                              <textarea
                                v-model="row.notes"
                                rows="1"
                                :placeholder="$t('expenses.notesPlaceholder')"
                                class="w-full min-w-[8rem] border border-gray-300 rounded-lg px-2 py-2 text-sm theme-input-focus"
                                :class="isRTL ? 'text-right' : 'text-left'"
                                @keydown.enter.prevent="handleFieldNavigation(index, 'notes', $event)"
                                @keydown.tab="handleFieldNavigation(index, 'notes', $event)"
                              ></textarea>
                            </td>
                            <!-- Settlement Date (Static from Step 1) -->
                            <td class="expense-column-settlement px-2 py-2 text-sm theme-text-secondary whitespace-nowrap align-middle" style="min-width:7.5rem">
                              {{ formatDate(form.settlementDate || form.date) }}
                            </td>
                            <td class="actions-col px-1 py-2 text-center" style="min-width:5rem;width:5rem">
                              <div class="flex justify-center gap-1">
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
                {{ $t('labels.cancel') }}
              </button>
              <button v-if="modalStep===2" type="button" @click="modalStep=1" class="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-100 font-medium theme-text-secondary transition text-sm">
                {{ $t('labels.back') }}
              </button>
              <button v-if="modalStep===1" type="button" @click="validateStep1() && (modalStep=2)" class="px-6 py-2.5 theme-button rounded-xl font-semibold shadow-md transition text-sm">
                {{ $t('labels.next') }}
              </button>
              <button v-else type="submit" form="expenseForm" :disabled="saving" class="px-6 py-2.5 theme-button rounded-xl font-semibold shadow-md disabled:opacity-50 transition text-sm flex items-center gap-2">
                <div v-if="saving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {{ saving ? $t('labels.saving') : (editing ? $t('labels.saveChanges') : $t('labels.save')) }}
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
                  {{ $t('labels.cancel') }}
                </button>
                <button 
                  @click="doDelete"
                  :disabled="deleting"
                  class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-md disabled:opacity-50 transition text-sm flex items-center gap-2"
                >
                  <div v-if="deleting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {{ deleting ? $t('labels.deleting') : $t('labels.delete') }}
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
} from '../../../api'
import AddFieldModal from '@/components/shared/AddFieldModal.vue'
import DateField from '@/components/shared/DateField.vue'
import SortIcon from '@/components/shared/SortIcon.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import { getTodayISO, formatToISODate, parseISODateToDate } from '@/utils/dateUtils'
import { realtimeService } from '@/services/realtimeService'
import { debounce } from '@/utils/debounce'

export default {
  emits: ["navigateReport", "navigateStatement"],
  name: 'ExpensesList',
  components: { AddFieldModal, DateField, PageHeader, SearchDropdown, SortIcon },
  data() {
    return {
      expenses: [],
      branches: [],
      locations: [],
      treasuries: [],
      contractors: [],
      // Hierarchical expense categories tree
      expenseCategories: [],
      loading: false,
      error: null,
      searchQuery: '',
      amountSearch: '',
      searchDebounceTimer: null,
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
      formDestinationTreasurySearch: '',
      formContractorSearch: '',
      filters: {
        startDate: '',
        endDate: '',
        settlementDateStart: '',
        settlementDateEnd: ''
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
      draftModalState: null,
      expenseContextMenu: {
        visible: false,
        top: 0,
        left: 0,
        expense: null
      },
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
        destinationTreasuryId: null,
        paymentMethod: 'CASH',
        settlementDate: null
      },
      deleteConfirm: { open: false, item: null },
      currentPage: 1,
      pageSize: 20,
      sortField: 'date',
      sortOrder: 'desc',
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

    selectedSourceTreasury() {
      return (this.treasuries || []).find(tr => Number(tr.id) === Number(this.form.treasuryId)) || null
    },

    isMainSourceTreasury() {
      return this.selectedSourceTreasury?.type === 'MAIN'
    },

    custodyTreasuryItems() {
      return (this.treasuries || [])
        .filter(tr => tr.type === 'CUSTODY' && Number(tr.id) !== Number(this.form.treasuryId))
        .map(tr => ({
          id: tr.id,
          name: `${tr.name} (عهدة)`
        }))
    },

    // Contractor items for the "credit contractor account" dropdown
    contractorItems() {
      return (this.contractors || []).map(c => ({
        id: c.id,
        name: c.name
      }))
    },

    // Combined البند الفرعي: contractors + all expense sub-categories
    combinedSubcategoryItems() {
      const contractors = (this.contractors || []).map(c => ({
        id: `contractor__${c.id}`,
        name: c.name,
        _type: 'contractor',
        _rawId: c.id
      }))

      const expenseSubs = []
      ;(this.expenseCategories || []).forEach(cat => {
        const subs = cat.subCategories || cat.subcategories || cat.children || []
        subs.forEach(sc => {
          expenseSubs.push({
            id: `expensesub__${sc.id}`,
            name: `${sc.name} (${cat.name})`,
            _type: 'expensesub',
            _rawId: sc.id,
            _categoryId: cat.id,
            _categoryName: cat.name,
            _subName: sc.name
          })
        })
      })

      return [...contractors, ...expenseSubs]
    },

    // System modules — used as البند الرئيسي options
    systemModuleItems() {
      return [
        { id: 'transport',  name: this.$t('navbar.transport')  || 'النقل' },
        { id: 'extracts',   name: this.$t('navbar.extracts')   || 'المستخلصات' },
        { id: 'supplies',   name: this.$t('navbar.supplies')   || 'التوريدات' },
        { id: 'equipment',  name: this.$t('dashboard.equipmentLog') || 'سجل المعدات' },
      ]
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

    // Subcategories for filter — all subcategories when no category selected, filtered otherwise
    filterSubcategories() {
      const list = this.flattenSubcategories(
        this.selectedCategoryId
          ? this.expenseCategories.filter(c => Number(c.id) === Number(this.selectedCategoryId))
          : this.expenseCategories
      )
      const seen = new Set()
      return list.filter(sub => {
        const key = this.normalizeTermName(sub?.name)
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })
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
      
      if (this.selectedCategoryId && !this.selectedSubcategoryId) {
        filtered = filtered.filter(expense => Number(expense.categoryId) === Number(this.selectedCategoryId))
      }
      if (this.selectedSubcategoryId) {
        const ids = this.sameNameSubcategoryIds(this.selectedSubcategoryId).map(Number)
        filtered = filtered.filter(expense => ids.includes(Number(expense.subCategoryId ?? expense.subCategoryId)))
      }
      if (this.selectedKind) {
        filtered = filtered.filter(expense => expense.kind === this.selectedKind)
      }
      if (this.amountSearch) {
        const cleanAmt = String(this.amountSearch).trim().replace(/,/g, '')
        const numAmt = parseFloat(cleanAmt)
        if (!isNaN(numAmt) && cleanAmt !== '') {
          filtered = filtered.filter(expense => Math.abs(Number(expense.amount) - numAmt) < 0.001)
        }
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
      clearTimeout(this.searchDebounceTimer)
      this.searchDebounceTimer = setTimeout(() => {
        this.loadExpenses()
      }, 250)
    },
    amountSearch() {
      this.currentPage = 1
      clearTimeout(this.searchDebounceTimer)
      this.searchDebounceTimer = setTimeout(() => {
        this.loadExpenses()
      }, 250)
    },
    selectedCategoryId() {
      this.selectedSubcategoryId = null
      this.filterSubcategorySearch = ''
      this.currentPage = 1
      this.loadExpenses()
    },
    selectedSubcategoryId() {
      this.currentPage = 1
      this.loadExpenses()
    },
    selectedLocationId() {
      this.currentPage = 1
      this.loadExpenses()
    },
    selectedTreasuryId() {
      this.currentPage = 1
      this.loadExpenses()
    },
    selectedPaymentMethod() {
      this.currentPage = 1
      this.loadExpenses()
    },
    selectedKind() {
      this.currentPage = 1
      this.loadExpenses()
    },
    'filters.startDate'() {
      this.currentPage = 1
      this.loadExpenses()
    },
    'filters.endDate'() {
      this.currentPage = 1
      this.loadExpenses()
    },
    'filters.settlementDateStart'() {
      this.currentPage = 1
      this.loadExpenses()
    },
    'filters.settlementDateEnd'() {
      this.currentPage = 1
      this.loadExpenses()
    },
    modalStep(newStep) {
      if (newStep === 2) {
        this.$nextTick(() => {
          const firstInput = this.$refs.tableRef?.querySelector('tbody tr td:nth-child(3) input')
          firstInput?.focus()
          if (firstInput?.select) firstInput.select()
        })
      }
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
    await this.fetchContractors()
    this.__realtimeUnsub = realtimeService.subscribe('expenses', ['expense_created', 'expense_updated', 'expense_deleted'], debounce(() => { this.loadExpenses() }, 300))
  },
  
  beforeUnmount() {
    if (this.__realtimeUnsub) { this.__realtimeUnsub(); this.__realtimeUnsub = null }
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

    async fetchContractors() {
      try {
        const { getContractors } = await import('@/api')
        const response = await getContractors({ pageSize: 500 })
        const data = response.data
        // Handle both array and paginated responses
        this.contractors = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.data)
              ? data.data
              : []
      } catch (e) {
        console.error('Failed to fetch contractors in ExpensesList:', e)
        this.contractors = []
      }
    },

    async loadExpenses() {
      this.loading = true
      this.error = null
      
      try {
        this.resolveSubcategoryFilterFromSearch()
        // Build params object with all filters (only non-empty values)
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          sortOrder: this.sortOrder
        }
        if (this.searchQuery) params.q = this.searchQuery
        if (this.amountSearch) params.amountSearch = String(this.amountSearch).trim()
        if (this.filters?.startDate) params.startDate = this.filters.startDate
        if (this.filters?.endDate) params.endDate = this.filters.endDate
        if (this.filters?.settlementDateStart) params.settlementDateStart = this.filters.settlementDateStart
        if (this.filters?.settlementDateEnd) params.settlementDateEnd = this.filters.settlementDateEnd
        if (this.selectedCategoryId !== null && this.selectedCategoryId !== undefined && !this.selectedSubcategoryId) {
          params.categoryId = this.selectedCategoryId
        }
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
        // if (error.response?.status === 500 || error.code === 'ERR_NETWORK') {
        //   console.log('Using demo data for expenses')
        //   console.warn('Backend server is not available. Using demo data for testing.')
        //   this.expenses = [
        //     {
        //       id: 1,
        //       date: '2025-01-15T00:00:00.000Z',
        //       category: 'Travel',
        //       description: 'Taxi from airport to hotel',
        //       amount: '42.5',
        //       notes: 'Paid in cash',
        //       createdAt: '2025-01-15T10:00:00.000Z',
        //       updatedAt: '2025-01-15T10:00:00.000Z'
        //     },
        //     {
        //       id: 2,
        //       date: '2025-01-14T00:00:00.000Z',
        //       category: 'Meals',
        //       description: 'Business lunch with client',
        //       amount: '85.0',
        //       notes: 'Company credit card',
        //       createdAt: '2025-01-14T14:30:00.000Z',
        //       updatedAt: '2025-01-14T14:30:00.000Z'
        //     },
        //     {
        //       id: 3,
        //       date: '2025-01-13T00:00:00.000Z',
        //       category: 'Office',
        //       description: 'Office supplies',
        //       amount: '25.75',
        //       notes: 'Stationery and paper',
        //       createdAt: '2025-01-13T09:15:00.000Z',
        //       updatedAt: '2025-01-13T09:15:00.000Z'
        //     }
        //   ]
        //   this.totalItems = this.expenses.length
        //   this.totalPages = 1
          
        //   // Show demo mode notification
        //   setTimeout(() => {
        //     this.showSuccess('Demo Mode: Backend server is not available. Using sample data for testing.')
        //   }, 1000)
        // } else {
        this.error = error.message || this.$t('expenses.loadError')
        // }
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

    sortBy(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc'
      } else {
        this.sortField = field
        this.sortOrder = 'desc'
      }
      this.currentPage = 1
      this.loadExpenses()
    },
    
    getEmptyExpenseForm() {
      return {
        id: null,
        date: getTodayISO(),
        categoryId: null,
        subCategoryId: null,
        kind: 'EXPENSE',
        description: '',
        amount: '',
        flow: 'OUT',
        branchId: null,
        locationId: null,
        treasuryId: null,
        destinationTreasuryId: null,
        paymentMethod: 'CASH',
        notes: '',
        settlementDate: getTodayISO(),
        contractorId: null,
        contractorAccountType: 'GENERAL'
      }
    },

    applyModalDraft(draft = null) {
      const baseForm = this.getEmptyExpenseForm()
      const currentDraft = draft || this.draftModalState

      this.form = {
        ...baseForm,
        ...(currentDraft?.form || {})
      }
      this.rows = (currentDraft?.rows || []).length
        ? (currentDraft.rows || []).map(row => ({ ...row }))
        : [this.createEmptyRow()]
      this.formLocationSearch = currentDraft?.formLocationSearch ?? ''
      this.formCategorySearch = currentDraft?.formCategorySearch ?? ''
      this.formSubcategorySearch = currentDraft?.formSubcategorySearch ?? ''
      this.formPaymentMethodSearch = currentDraft?.formPaymentMethodSearch ?? 'نقداً'
      this.formTreasurySearch = currentDraft?.formTreasurySearch ?? ''
      this.formDestinationTreasurySearch = currentDraft?.formDestinationTreasurySearch ?? ''
      this.formContractorSearch = currentDraft?.formContractorSearch ?? ''
    },

    saveModalDraft() {
      this.draftModalState = {
        form: { ...this.form },
        rows: this.rows.map(row => ({ ...row })),
        formLocationSearch: this.formLocationSearch,
        formCategorySearch: this.formCategorySearch,
        formSubcategorySearch: this.formSubcategorySearch,
        formPaymentMethodSearch: this.formPaymentMethodSearch,
        formTreasurySearch: this.formTreasurySearch,
        formDestinationTreasurySearch: this.formDestinationTreasurySearch,
        formContractorSearch: this.formContractorSearch
      }
    },

    openAddModal() {
      this.editing = false
      this.modalStep = 1
      this.applyModalDraft(this.draftModalState)
      this.modalOpen = true
    },
    
    openEditModal(expense) {
      this.editing = true
      const formattedDate = expense.date ? (typeof expense.date === 'string' && expense.date.includes('T') ? expense.date.split('T')[0] : expense.date) : new Date().toISOString().split('T')[0]
      const formattedSettlementDate = expense.settlementDate ? (typeof expense.settlementDate === 'string' && expense.settlementDate.includes('T') ? expense.settlementDate.split('T')[0] : expense.settlementDate) : formattedDate

      // 1. Resolve Category
      const catId = expense.categoryId || expense.categoryRef?.id || expense.category?.id || (typeof expense.category === 'object' ? expense.category.id : null)
      let parentCat = this.expenseCategories?.find(c => (catId && Number(c.id) === Number(catId)) || (expense.categoryRef?.name && c.name === expense.categoryRef.name) || (expense.category && c.name === (typeof expense.category === 'string' ? expense.category : expense.category?.name)))

      // 2. Resolve SubCategory
      const subCatId = expense.subCategoryId || expense.subCategoryRef?.id || expense.subCategory?.id || (typeof expense.subCategory === 'object' ? expense.subCategory.id : null)
      let subCat = null

      if (parentCat) {
        const subCats = parentCat.subCategories || parentCat.subcategories || parentCat.children || []
        subCat = subCats.find(sc => (subCatId && Number(sc.id) === Number(subCatId)) || (expense.subCategoryRef?.name && sc.name === expense.subCategoryRef.name) || (expense.classification && sc.name === expense.classification))
      }

      // If parentCat or subCat was not matched yet, search across all categories for the subcategory
      if (!subCat && (subCatId || expense.subCategoryRef?.name || expense.classification)) {
        for (const cat of (this.expenseCategories || [])) {
          const subCats = cat.subCategories || cat.subcategories || cat.children || []
          const found = subCats.find(sc => (subCatId && Number(sc.id) === Number(subCatId)) || (expense.subCategoryRef?.name && sc.name === expense.subCategoryRef.name) || (expense.classification && sc.name === expense.classification))
          if (found) {
            subCat = found
            if (!parentCat) parentCat = cat
            break
          }
        }
      }

      const finalCategoryId = parentCat ? parentCat.id : (catId ? Number(catId) : null)
      const finalSubCategoryId = subCat ? subCat.id : (subCatId ? Number(subCatId) : null)

      const categoryName = parentCat?.name || expense.categoryRef?.name || (typeof expense.category === 'string' ? expense.category : expense.category?.name) || ''
      const subCategoryName = subCat?.name || expense.subCategoryRef?.name || expense.classification || (typeof expense.subCategory === 'string' ? expense.subCategory : expense.subCategory?.name) || ''

      // 3. Resolve Treasury
      const targetTreasuryId = expense.treasuryId || expense.treasury?.id || null
      let treasurySearchName = ''
      if (targetTreasuryId) {
        const foundTr = this.treasuryItems?.find(t => Number(t.id) === Number(targetTreasuryId))
        if (foundTr) {
          treasurySearchName = foundTr.name
        }
      }
      if (!treasurySearchName && expense.treasury?.name) {
        const typeLabel = expense.treasury.type === 'CUSTODY' ? 'عهدة' : 'خزينة'
        treasurySearchName = `${expense.treasury.name} (${typeLabel})`
      }

      this.form = {
        id: expense.id,
        date: formattedSettlementDate,
        categoryId: finalCategoryId,
        subCategoryId: finalSubCategoryId,
        kind: expense.kind || 'EXPENSE',
        description: expense.description || '',
        amount: expense.amount || '',
        flow: expense.flow || 'OUT',
        branchId: expense.branchId || null,
        locationId: expense.locationId || expense.location?.id || null,
        treasuryId: targetTreasuryId,
        destinationTreasuryId: expense.destinationTreasuryId || expense.destinationTreasury?.id || null,
        paymentMethod: expense.paymentMethod || 'CASH',
        notes: expense.notes || '',
        settlementDate: formattedSettlementDate,
        contractorId: expense.contractorId || null,
        contractorAccountType: expense.contractorAccountType || 'GENERAL'
      }
      this.modalStep = 1

      const row = this.createEmptyRow()
      row.date = formattedDate
      row.categoryId = finalCategoryId
      row.categorySearch = categoryName
      row.subCategoryId = finalSubCategoryId
      row.subCategorySearch = subCategoryName
      // تحديد نوع البند الفرعي لما بنفتح للتعديل
      if (finalSubCategoryId && (this.contractors || []).some(c => Number(c.id) === Number(finalSubCategoryId))) {
        row._subItemType = 'contractor'
        row._contractorRawId = finalSubCategoryId
      } else if (finalSubCategoryId) {
        row._subItemType = 'expensesub'
        row._contractorRawId = null
      } else {
        row._subItemType = null
        row._contractorRawId = null
      }
      row.locationId = expense.locationId || expense.location?.id || null
      row.locationSearch = expense.location?.name || this.locations?.find(l => Number(l.id) === Number(expense.locationId))?.name || ''
      row.description = expense.description || ''
      row.amount = expense.amount || ''
      row.paymentMethod = expense.paymentMethod || 'CASH'
      row.paymentMethodSearch = this.paymentMethodItems?.find(p => p.id === row.paymentMethod)?.name || 'نقداً'
      row.settlementDate = formattedSettlementDate
      row.notes = expense.notes || ''
      this.rows = [row]

      this.formLocationSearch = expense.location?.name || this.locations?.find(l => Number(l.id) === Number(expense.locationId))?.name || ''
      this.formCategorySearch = categoryName
      this.formSubcategorySearch = subCategoryName
      this.formPaymentMethodSearch = this.paymentMethodItems?.find(p => p.id === expense.paymentMethod)?.name || 'نقداً'
      this.formTreasurySearch = treasurySearchName
      const destTreasury = expense.destinationTreasury
      const destId = expense.destinationTreasuryId || destTreasury?.id || null
      if (destId) {
        const foundDest = this.custodyTreasuryItems?.find(t => Number(t.id) === Number(destId))
        this.formDestinationTreasurySearch = foundDest?.name || (destTreasury ? `${destTreasury.name} (عهدة)` : '')
      } else {
        this.formDestinationTreasurySearch = ''
      }

      // Resolve contractor search text
      const contractorId = expense.contractorId || null
      if (contractorId) {
        const foundContractor = this.contractors?.find(c => Number(c.id) === Number(contractorId))
        this.formContractorSearch = foundContractor?.name
          || expense.contractorRef?.name
          || expense.contractor?.name
          || expense.contractorName
          || ''
      } else {
        this.formContractorSearch = ''
      }
      this.modalOpen = true
      this.hideExpenseContextMenu()
    },
    
    closeModal() {
      this.saveModalDraft()
      this.modalOpen = false
      this.modalStep = 1
    },

    createEmptyRow() {
      const prevRow = (this.rows && this.rows.length > 0) ? this.rows[this.rows.length - 1] : null
      // Keep the same expense date as the previous row (like location).
      const rowDate = prevRow?.date || this.form?.date || getTodayISO()
      const rowLocationId = prevRow?.locationId ?? (this.locations?.[0]?.id ?? null)
      const rowLocationSearch = prevRow?.locationSearch ?? (this.locations?.[0]?.name ?? '')
      const rowNotes = prevRow?.notes != null ? String(prevRow.notes) : ''

      return {
        id: Date.now() + Math.random(),
        categoryId: prevRow?.categoryId ?? null,
        subCategoryId: prevRow?.subCategoryId ?? null,
        _subItemType: prevRow?._subItemType ?? null,
        _contractorRawId: prevRow?._contractorRawId ?? null,
        categorySearch: prevRow?.categorySearch ?? '',
        subCategorySearch: prevRow?.subCategorySearch ?? '',
        locationId: rowLocationId,
        locationSearch: rowLocationSearch,
        description: '',
        amount: '',
        paymentMethod: 'CASH',
        paymentMethodSearch: 'نقداً',
        date: rowDate,
        notes: rowNotes
      }
    },

    addRow() {
      this.rows.push(this.createEmptyRow())
      this.$nextTick(() => {
        const rows = this.$refs.tableRef?.querySelectorAll('tbody tr') || []
        const lastRow = rows[this.rows.length - 1]
        const firstInput = lastRow?.querySelector('td:nth-child(3) input')
        firstInput?.focus()
      })
    },

    duplicateRow(index) {
      const source = this.rows[index]
      const clone = {
        ...source,
        id: Date.now() + Math.random()
      }
      this.rows.splice(index + 1, 0, clone)
    },

    removeRow(index) {
      if (this.rows.length === 1) {
        this.rows = [this.createEmptyRow()]
        return
      }
      this.rows.splice(index, 1)
    },

    normalizeTermName(value) {
      return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase()
    },

    flattenSubcategories(categories = this.expenseCategories) {
      const list = []
      ;(categories || []).forEach(cat => {
        const subCats = cat?.subCategories || cat?.subcategories || cat?.children || []
        subCats.forEach(sc => list.push(sc))
      })
      return list
    },

    resolveSubcategoryFilterFromSearch() {
      if (this.selectedSubcategoryId != null) return
      const query = this.normalizeTermName(this.filterSubcategorySearch)
      if (!query) return
      const match = this.flattenSubcategories().find(sc => this.normalizeTermName(sc?.name) === query)
        || this.flattenSubcategories().find(sc => this.normalizeTermName(sc?.name).includes(query))
      if (match?.id != null) {
        this.selectedSubcategoryId = match.id
        this.filterSubcategorySearch = match.name
      }
    },

    sameNameSubcategoryIds(subCategoryId) {
      if (subCategoryId == null) return []
      const all = this.flattenSubcategories()
      const selected = all.find(sc => Number(sc.id) === Number(subCategoryId))
      const key = this.normalizeTermName(selected?.name)
      if (!key) return [Number(subCategoryId)]
      const ids = all
        .filter(sc => this.normalizeTermName(sc.name) === key)
        .map(sc => Number(sc.id))
      return ids.length ? ids : [Number(subCategoryId)]
    },

    getRowSubcategories(row) {
      if (row.categoryId) {
        const cat = this.expenseCategories.find(c => Number(c.id) === Number(row.categoryId))
        const subCats = cat?.subCategories || cat?.subcategories || cat?.children || []
        return subCats.map(sc => ({ id: sc.id, name: sc.name }))
      } else {
        // Return unique subcategory names across all categories
        const names = new Set()
        const uniqueSubCats = []
        this.expenseCategories.forEach(cat => {
          const subCats = cat.subCategories || cat.subcategories || cat.children || []
          subCats.forEach(sc => {
            if (sc.name && !names.has(sc.name)) {
              names.add(sc.name)
              uniqueSubCats.push({ id: sc.name, name: sc.name })
            }
          })
        })
        return uniqueSubCats
      }
    },

    getRowCategories(row) {
      // لو اختار بند فرعي من المصروفات → البند الرئيسي = العنصر الواحد من expenseCategories (غير قابل للتغيير)
      if (row._subItemType === 'expensesub' && row.categoryId) {
        const cat = (this.expenseCategories || []).find(c => Number(c.id) === Number(row.categoryId))
        if (cat) return [{ id: cat.id, name: cat.name }]
      }

      // لو اختار مقاول → البند الرئيسي = system modules مفلترة حسب الـ flags
      if (row._subItemType === 'contractor' && row._contractorRawId) {
        const contractor = (this.contractors || []).find(c => Number(c.id) === Number(row._contractorRawId))
        if (contractor) {
          return this.systemModuleItems.filter(m => {
            if (m.id === 'transport')  return !!contractor.availableForTransports
            if (m.id === 'extracts')   return !!contractor.availableForExtracts || !!contractor.availableForExports
            if (m.id === 'supplies')   return !!contractor.availableForSupplies  || !!contractor.availableForExports
            if (m.id === 'equipment')  return !!contractor.availableForRentals   || !!contractor.availableForEquipmentRental
            if (m.id === 'payments')   return true
            if (m.id === 'expenses')   return true
            return true
          })
        }
      }

      return this.systemModuleItems
    },

    // ── Unified handler: contractor OR expense sub-category as البند الفرعي ──
    onSelectRowSubItem(row, sel) {
      if (sel._type === 'expensesub') {
        // ── بند فرعي من المصروفات ──
        row._subItemType = 'expensesub'
        row._contractorRawId = null
        row.subCategoryId = sel._rawId
        row.subCategorySearch = sel._subName  // الاسم بدون (اسم البند الرئيسي)
        // البند الرئيسي يتملى تلقائياً ولا يتغير
        row.categoryId = sel._categoryId
        row.categorySearch = sel._categoryName
      } else {
        // ── مقاول ──
        row._subItemType = 'contractor'
        row._contractorRawId = sel._rawId
        row.subCategoryId = sel._rawId
        row.subCategorySearch = sel.name
        // Auto-fill البند الرئيسي لو الـ module واحد بس
        const contractor = (this.contractors || []).find(c => Number(c.id) === Number(sel._rawId))
        if (contractor) {
          const available = this.systemModuleItems.filter(m => {
            if (m.id === 'transport')  return !!contractor.availableForTransports
            if (m.id === 'extracts')   return !!contractor.availableForExtracts || !!contractor.availableForExports
            if (m.id === 'supplies')   return !!contractor.availableForSupplies  || !!contractor.availableForExports
            if (m.id === 'equipment')  return !!contractor.availableForRentals   || !!contractor.availableForEquipmentRental
            if (m.id === 'payments')   return true
            if (m.id === 'expenses')   return true
            return false
          })
          if (available.length === 1) {
            row.categoryId = available[0].id
            row.categorySearch = available[0].name
          } else {
            row.categoryId = null
            row.categorySearch = ''
          }
        }
      }
    },

    onClearRowContractor(row) {
      row._subItemType = null
      row._contractorRawId = null
      row.subCategoryId = null
      row.subCategorySearch = ''
      row.categoryId = null
      row.categorySearch = ''
    },

    onSelectRowSubcategory(row, sel) {
      row.subCategorySearch = sel.name
      const matchingCats = []
      const matchingSubcategories = []

      this.expenseCategories.forEach(cat => {
        const subCats = cat.subCategories || cat.subcategories || cat.children || []
        const found = subCats.find(sc => sc.name && String(sc.name).trim().toLowerCase() === String(sel.name).trim().toLowerCase())
        if (found) {
          matchingCats.push(cat)
          matchingSubcategories.push(found)
        }
      })

      if (matchingCats.length === 1) {
        // Unique subcategory: auto-populate category and resolve subCategoryId
        row.categoryId = matchingCats[0].id
        row.categorySearch = matchingCats[0].name
        row.subCategoryId = matchingSubcategories[0].id
      } else if (matchingCats.length > 1) {
        // Duplicate subcategory names exist:
        // If current selected category is one of the matching ones, resolve subCategoryId
        if (row.categoryId && matchingCats.some(c => Number(c.id) === Number(row.categoryId))) {
          const matchedSub = matchingSubcategories.find(sc => Number(sc.categoryId) === Number(row.categoryId))
          row.subCategoryId = matchedSub ? matchedSub.id : null
        } else {
          // Reset category so user selects from the filtered categories
          row.categoryId = null
          row.categorySearch = ''
          row.subCategoryId = null
        }
      }
    },

    onSelectRowCategory(row, sel) {
      row.categoryId = sel.id
      row.categorySearch = sel.name
    },

    onClearRowCategory(row) {
      row.categoryId = null
      row.categorySearch = ''
    },

    onClearRowSubcategory(row) {
      row.subCategoryId = null
      row.subCategorySearch = ''
      row.categoryId = null
      row.categorySearch = ''
    },

    handleFieldNavigation(index, field, event) {
      if (!event) return
      if (event.shiftKey) return
      if (event.key !== 'Tab' && event.key !== 'Enter') return

      const isTab = event.key === 'Tab'
      const isLastField = field === 'notes'

      if (isLastField && (isTab || event.key === 'Enter')) {
        event.preventDefault()
        this.addRow()
        return
      }

      event.preventDefault()

      const nextFields = ['date', 'amount', 'description', 'subcategory', 'category', 'location', 'notes']
      const currentIndex = nextFields.indexOf(field)
      const nextField = nextFields[currentIndex + 1]
      if (!nextField) {
        this.addRow()
        return
      }

      const rows = this.$refs.tableRef?.querySelectorAll('tbody tr') || []
      const row = rows[index]
      if (!row) return

      const selectorMap = {
        date: 'td:nth-child(2) input',
        amount: 'td:nth-child(3) input',
        description: 'td:nth-child(4) input',
        subcategory: 'td:nth-child(5) input',
        category: 'td:nth-child(6) input',
        location: 'td:nth-child(7) input',
        notes: 'td:nth-child(8) textarea'
      }

      const target = row.querySelector(selectorMap[nextField])
      target?.focus()
      if (target?.select) target.select()
    },
    
    async saveExpense() {
      if (!this.validateStep1() || !this.validateRows()) return
      
      this.saving = true
      
      try {
        const payloads = this.rows
          .filter(row => String(row.description || '').trim() || row.amount || row.categoryId)
          .map(row => {
            const amount = parseFloat(String(row.amount || '').replace(/,/g, ''))
            const rowExpenseDate = row.date || getTodayISO()
            const rowSettlementDate = this.form.settlementDate || this.form.date || getTodayISO()
            // لو البند الفرعي مقاول → subCategoryId = undefined، contractorId = الـ ID الحقيقي
            // لو البند الفرعي من المصروفات → subCategoryId = الـ ID الحقيقي، contractorId من الـ form العلوي
            const isContractorRow = row._subItemType === 'contractor'
            const rowSubCategoryId = isContractorRow ? undefined : (row.subCategoryId || undefined)
            const rowContractorId = isContractorRow
              ? (row._contractorRawId || null)
              : ((this.form.contractorId && !this.form.destinationTreasuryId) ? this.form.contractorId : null)
            // لما المقاول هو البند الفرعي، categoryId بيكون string زي 'expenses' → البيك إند بيرفضه
            // فبنبعت category string بدل categoryId integer
            const rowCategoryId = isContractorRow ? null : (row.categoryId || null)
            const rowCategoryName = isContractorRow ? (row.categorySearch || undefined) : undefined
            return {
              date: rowExpenseDate,
              kind: this.form.kind || 'EXPENSE',
              categoryId: rowCategoryId,
              category: rowCategoryName,
              subCategoryId: rowSubCategoryId,
              description: String(row.description || '').trim(),
              amount: Number.isFinite(amount) ? amount : 0,
              flow: this.form.flow || 'OUT',
              branchId: this.form.branchId || null,
              locationId: row.locationId,
              treasuryId: this.form.treasuryId ?? null,
              destinationTreasuryId: this.isMainSourceTreasury ? (this.form.destinationTreasuryId ?? null) : null,
              paymentMethod: row.paymentMethod || 'CASH',
              notes: row.notes || '',
              settlementDate: new Date(rowSettlementDate + 'T00:00:00Z').toISOString(),
              contractorId: rowContractorId,
              contractorAccountType: this.form.contractorAccountType || 'GENERAL'
            }
          })

        if (payloads.length === 0) {
          this.showError(this.$t('expenses.validation.descriptionRequired'))
          this.saving = false
          return
        }

        if (this.editing) {
          const expenseData = {
            ...payloads[0]
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
            if (updateError.response?.status === 409) {
              const pendingMsg = updateError.response?.data?.message || 'This record already has a pending approval request. Please wait for it to be resolved before submitting another change.'
              this.modalOpen = false
              this.showError(pendingMsg)
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
        
        this.draftModalState = null
        this.modalOpen = false
        this.modalStep = 1
        this.showSuccess(this.editing ? 'expenses.success.updated' : 'expenses.success.created')
      } catch (error) {
        console.error('Error saving expense:', error)
        console.error('Error details:', error.response?.data)
        
        let errorMessage = this.$t('expenses.saveError')
        if (error.response?.status === 409) {
          errorMessage = error.response?.data?.message || 'This record already has a pending approval request. Please wait for it to be resolved before submitting another change.'
        } else if (error.response?.data?.message) {
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
      if (!this.form.settlementDate) {
        this.showError(this.$t('expenses.validation.settlementDateRequired') || 'تاريخ التسوية مطلوب')
        return false
      }
      if (!this.form.treasuryId) {
        this.showError(this.$t('expenses.validation.treasuryRequired') || 'الخزينة أو العهدة مطلوبة')
        return false
      }
      return true
    },

    onSelectSourceTreasury(sel) {
      this.form.treasuryId = sel.id
      this.formTreasurySearch = sel.name
      const selected = (this.treasuries || []).find(tr => Number(tr.id) === Number(sel.id))
      if (selected?.type !== 'MAIN') {
        this.form.destinationTreasuryId = null
        this.formDestinationTreasurySearch = ''
      }
    },

    onClearSourceTreasury() {
      this.form.treasuryId = null
      this.formTreasurySearch = ''
      this.form.destinationTreasuryId = null
      this.formDestinationTreasurySearch = ''
    },

    validateRows() {
      if (!this.rows.length) {
        this.showError(this.$t('expenses.validation.descriptionRequired'))
        return false
      }

      for (let index = 0; index < this.rows.length; index += 1) {
        const row = this.rows[index]
        // لما بند فرعي من المصروفات → categoryId رقم حقيقي (مطلوب)
        // لما مقاول → categoryId ممكن يكون string module id أو null (مقبول)
        if (!row.categoryId && row._subItemType !== 'contractor') {
          this.showError(this.$t('expenses.validation.categoryRequired'))
          return false
        }
        if (!String(row.description || '').trim()) {
          this.showError(this.$t('expenses.validation.descriptionRequired'))
          return false
        }
        if (row.locationId === null || row.locationId === undefined) {
          this.showError((this.$t('expenses.location') || 'Location') + ' ' + (this.$t('common.required') || 'is required'))
          return false
        }
        const amount = parseFloat(String(row.amount || '').replace(/,/g, ''))
        if (!Number.isFinite(amount) || amount <= 0) {
          this.showError(this.$t('expenses.validation.amountInvalid'))
          return false
        }
        if (!row.date && !this.form.date) {
          this.showError('تاريخ المصروف مطلوب')
          return false
        }
      }

      return true
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
        if (error.response?.status === 409) {
          const pendingMsg = error.response?.data?.message || 'This record already has a pending approval request. Please wait for it to be resolved before submitting another change.'
          this.cancelDelete()
          this.showError(pendingMsg)
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
          const msg = error.response?.data?.message || this.$t('expenses.deleteError')
          this.showError(msg)
        }
      } finally {
        this.deleting = false
      }
    },
    
    clearFilters() {
      this.searchQuery = ''
      this.amountSearch = ''
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
        endDate: '',
        settlementDateStart: '',
        settlementDateEnd: ''
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
      const subId = expense?.subCategoryId ?? expense?.subCategoryId
      if (subId != null && this.expenseCategories?.length) {
        const sub = this.flattenSubcategories().find(sc => Number(sc.id) === Number(subId))
        if (sub?.name) return sub.name
      }

      return expense?.subCategoryRef?.name || expense?.classification || '-'
    },
    
    formatDate(dateString) {
      if (!dateString) return '-';
      let d;
      if (typeof dateString === 'string') {
        const m = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) {
          d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
        } else {
          d = new Date(dateString);
        }
      } else if (dateString instanceof Date) {
        d = dateString;
      } else {
        d = new Date(dateString);
      }
      if (!d || Number.isNaN(d.getTime())) return '-';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
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
        if (this.amountSearch) params.amountSearch = String(this.amountSearch).trim()
        if (this.selectedCategoryId !== null && this.selectedCategoryId !== undefined) params.categoryId = this.selectedCategoryId
        if (this.selectedSubcategoryId !== null && this.selectedSubcategoryId !== undefined) params.subCategoryId = this.selectedSubcategoryId
        if (this.filters?.settlementDateStart) params.settlementDateStart = this.filters.settlementDateStart
        if (this.filters?.settlementDateEnd) params.settlementDateEnd = this.filters.settlementDateEnd
        if (this.selectedKind) params.kind = this.selectedKind
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

    showExpenseContextMenu(event, expense) {
      this.expenseContextMenu.top = event.clientY
      this.expenseContextMenu.left = event.clientX
      this.expenseContextMenu.expense = expense
      this.expenseContextMenu.visible = true
      
      // Hide context menu when clicking outside
      this.$nextTick(() => {
        document.addEventListener('click', this.hideExpenseContextMenu)
      })
    },

    hideExpenseContextMenu() {
      this.expenseContextMenu.visible = false
      document.removeEventListener('click', this.hideExpenseContextMenu)
    },

    confirmDelete(expense) {
      this.deleteConfirm.item = expense
      this.deleteConfirm.open = true
      this.hideExpenseContextMenu()
    },
    
    showSuccess(message) {
      if (window.$toast) {
        window.$toast(message, 'success')
      } else {
        console.log('Success:', message)
      }
    },
    
    showError(message) {
      if (window.$toast) {
        window.$toast(message, 'error')
      } else {
        alert(message)
      }
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

.expenses-list-card {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.expenses-list-table {
  width: 100% !important;
  max-width: 100%;
  min-width: 0 !important;
  table-layout: auto;
  border-collapse: collapse;
}

.expenses-list-card :deep(th),
.expenses-list-card :deep(td) {
  min-width: 0;
  padding: 0.5rem 0.28rem !important;
  white-space: normal !important;
  overflow-wrap: break-word;
  word-break: normal;
  vertical-align: top;
  font-size: 0.75rem;
  line-height: 1.35;
  overflow: visible;
}

.expenses-list-card :deep(th) {
  text-transform: none !important;
  letter-spacing: 0 !important;
  font-weight: 600;
  overflow-wrap: normal;
  word-break: keep-all;
}

.expenses-list-card :deep(.actions-col) {
  white-space: nowrap !important;
  overflow-wrap: normal !important;
  word-break: keep-all !important;
}

.expense-rows-table {
  width: 100%;
}

/* Column widths for the expense rows table */
.expense-rows-table :deep(.expense-column-date)        { width: 8rem;  min-width: 8rem; }
.expense-rows-table :deep(.expense-column-amount)      { width: 7rem;  min-width: 7rem; }
.expense-rows-table :deep(.expense-column-description) { width: 10rem; min-width: 9rem; }
.expense-rows-table :deep(.expense-column-category)    { width: 10rem; min-width: 9rem; }
.expense-rows-table :deep(.expense-column-notes)       { width: 8rem;  min-width: 7rem; }
.expense-rows-table :deep(.expense-column-settlement)  { width: 7.5rem; min-width: 7rem; }
.expense-rows-table :deep(.actions-col)                { width: 5rem;  min-width: 5rem; }

.expense-rows-table :deep(.date-field),
.expense-rows-table .expense-amount-input {
  min-width: 7.25rem;
  box-sizing: border-box;
}

.expense-amount-input {
  appearance: textfield;
  -moz-appearance: textfield;
}

.expense-amount-input::-webkit-outer-spin-button,
.expense-amount-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.expense-chip {
  display: inline;
  max-width: 100%;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 500;
  white-space: normal;
  overflow-wrap: anywhere;
}

.amount-cell {
  font-weight: 700;
  white-space: normal !important;
}

.empty-cell {
  text-align: center !important;
  padding: 3rem 1rem !important;
}

.rtl-modal,
.rtl-modal form,
.rtl-modal .modal-body-container {
  direction: rtl;
  text-align: right;
}

.rtl-modal input,
.rtl-modal select,
.rtl-modal textarea {
  text-align: right;
}

/* Custom scrollbar for better UX */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

/* Context Menu Styles */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 140px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.15s;
  color: #1f2937;
  font-size: 0.875rem;
}

.context-menu-item:hover {
  background-color: #f3f4f6;
}

.context-menu-item.delete-item {
  color: #dc2626;
}

.context-menu-item.delete-item:hover {
  background-color: #fee2e2;
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
