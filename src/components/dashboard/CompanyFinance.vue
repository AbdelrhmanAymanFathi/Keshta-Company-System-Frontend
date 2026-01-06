<template>
  <div class="flex space-y-0">

    <transition name="slide-fade">
      <aside v-if="!sidebarCollapsed"
        :class="['bg-white rounded-lg shadow overflow-hidden p-3', isRTL ? 'direction-rtl' : '', isRTL ? 'text-end' : 'text-start']"
        style="min-width: 19%; max-width: 320px;">
        
      <!-- Sidebar header -->
      <div :class="['flex items-center justify-between mb-3']">
        <div class="flex items-center gap-2">
          <h3 :class="['text-sm font-semibold text-indigo-700', isRTL ? 'text-end' : 'text-start']">{{ $t('finance.wallets') }}</h3>
          <button
            @click="sidebarCollapsed = !sidebarCollapsed"
            class="sidebar-toggle-glow text-gray-500 hover:text-gray-700 transition-colors p-1 rounded"
            :title="sidebarCollapsed ? ($t('finance.showSidebar') || 'Show wallets') : ($t('finance.hideSidebar') || 'Hide wallets')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!sidebarCollapsed && !isRTL" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
              <path v-else-if="sidebarCollapsed && !isRTL" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
              <!-- RTL variants (flip directions) -->
              <path v-if="!sidebarCollapsed && isRTL" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
              <path v-else-if="sidebarCollapsed && isRTL" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            </svg>
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button v-if="previousOrders.length" @click="undoOrder" title="Undo"
            class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-xs">Undo</button>
          <span v-if="savingOrder" class="text-xs text-gray-400">Saving...</span>
        </div>
      </div>

      <!-- Main Treasury (drop target) -->
      <div class="mb-3">
        <button @click="selectBranch(null)" @dragover.prevent="onDragOverMain" @dragleave="dragOverMain = false"
          @drop.prevent="onDropOnMain"
          :class="[selectedBranch === null ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700', 'w-full px-3 py-2 rounded transition border', dragOverMain ? 'border-dashed border-2 border-indigo-300' : '']">
          <div class="flex items-center justify-between">
            <span class="font-semibold">{{ $t('finance.companyWallet') }}</span>
            <svg v-if="dragOverMain" class="w-4 h-4 text-indigo-200" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </div>
        </button>
      </div>

      <!-- Sub-wallets header -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <button @click="sublistOpen = !sublistOpen"
            class="text-xs text-gray-600 px-2 py-1 rounded hover:bg-gray-50">{{ sublistOpen ? '▼' : '▶' }}</button>
          <span class="text-xs text-gray-600">{{ $t('finance.subWallets') || 'Sub-wallets' }}</span>
        </div>
        <div class="text-xs text-gray-400">{{ branches.length }}</div>
      </div>

      <transition name="fade">
        <ul v-show="sublistOpen" class="space-y-2">
          <li v-if="branches.length === 0" class="text-xs text-gray-500 px-3 py-2">{{ $t('finance.noBranches') || 'لا توجد خزائن فرعية' }}</li>
          <li v-for="(branch, index) in branches" :key="branch.id" tabindex="0" draggable="true"
            @dragstart="onDragStart(index, $event)" @dragenter="onDragEnter(index, $event)" @dragover.prevent
            @drop.prevent="onDropAt(index, $event)" @dragend="onDragEnd"
            :class="['flex items-center justify-between px-3 py-2 rounded transition border', branch._dropped ? 'animate-flash' : '', selectedBranch && selectedBranch.id === branch.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100']">

            <div class="flex items-center gap-2 w-full" @click="selectBranch(branch)">
              <div class="drag-handle mr-2 text-gray-400 cursor-grab" aria-hidden>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M4 12h16M4 17h16">
                  </path>
                </svg>
              </div>
              <div class="flex-1 text-xs text-gray-800 truncate">
                <div class="flex items-center gap-2">
                  <span class="truncate">{{ branch.name }}</span>
                  <span v-if="branch.pinned" class="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Pinned</span>
                </div>
                <div class="text-xs text-gray-400">{{ branch.description || '' }}</div>
              </div>
            </div>

            <div class="flex items-center gap-2 ml-3">
              <button @click.stop="openEditBranch(branch)" title="Edit"
                class="px-2 py-1 rounded hover:bg-gray-50 text-xs">✏️</button>
              <button @click.stop="togglePin(index)" title="Pin"
                class="px-2 py-1 rounded hover:bg-gray-50 text-xs">📌</button>
              <button @click.stop="promoteToTop(index)" title="Promote"
                class="px-2 py-1 rounded hover:bg-gray-50 text-xs">⬆️</button>
            </div>
          </li>
        </ul>
      </transition>
      </aside>
    </transition>

    <!-- Floating Show Sidebar button when collapsed -->
    <div v-if="sidebarCollapsed" :class="['fixed top-20 right-6 z-40', isRTL ? 'left-6 right-auto' : '']">
      <button
        @click="sidebarCollapsed = false"
        class="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl transition-all duration-200 flex items-center justify-center"
        :title="$t('finance.showSidebar') || 'Show wallets'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
    </div>
    <!-- Main Content -->
    <div :class="['flex-1 p-6 space-y-6', isRTL ? 'text-end' : 'text-start']">
      <!-- Balance Card -->

      <!-- <div class="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg shadow-lg p-6 text-white">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 class="text-sm font-medium text-indigo-100 mb-1">{{ $t('finance.balance') }}</h3>
          <p class="text-xl font-bold">{{ financeStore.formattedBalance }}</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="openDepositModal"
            class="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            {{ $t('finance.deposit') }}
          </button>
          <button
            @click="openWithdrawModal"
            class="px-4 py-2 bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-600 transition flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>

            </svg>
            {{ $t('finance.withdraw') }}
          </button>
        </div>
      </div>
    </div> -->

      <!-- Summary Stats Bar -->
      <div :class="['flex items-center justify-end gap-3', isRTL ? 'text-end' : 'text-start']">
        <button @click="openTransferModal"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
          </svg>
          {{ $t('finance.transfer') || 'Transfer' }}
        </button>
        <button @click="openExpenseModal"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          {{ $t('expenses.addExpense') || 'Add Expense' }}
        </button>
      </div>
      <div :class="['grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 my-4', isRTL ? 'text-end' : 'text-start']">
        <div class="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-600">
          <p class="text-xs text-gray-600">{{ $t('expenses.totalAll') || 'Total Expenses (All)' }}</p>
          <p class="text-sm font-semibold text-gray-900 mt-1">{{ formatCurrency(expensesSummary.totalAll) }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ expensesSummary.countAll }} {{ $t('labels.results') || 'records' }}</p>
        </div>

        <div class="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p class="text-xs text-gray-600">{{ $t('expenses.totalMasrouf') || 'Immediate (Masrouf)' }}</p>
          <p class="text-sm font-semibold text-gray-900 mt-1">{{ formatCurrency(expensesSummary.totalMasrouf) }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ expensesSummary.countMasrouf }} {{ $t('labels.results') || 'records' }}</p>
        </div>

        <div class="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-400">
          <p class="text-xs text-gray-600">{{ $t('expenses.totalAhd') || 'Deferred (Ahd)' }}</p>
          <p class="text-sm font-semibold text-gray-900 mt-1">{{ formatCurrency(expensesSummary.totalAhd) }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ expensesSummary.countAhd }} {{ $t('labels.results') || 'records' }}</p>
        </div>

        <div class="bg-white rounded-lg shadow p-4 border-l-4 border-red-600">
          <p class="text-xs text-gray-600">{{ $t('expenses.totalOut') || 'Total Out' }}</p>
          <p class="text-sm font-semibold text-red-600 mt-1">{{ formatCurrency(expensesSummary.totalOut) }}</p>
        </div>

        <div class="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
          <p class="text-xs text-gray-600">{{ $t('expenses.totalIn') || 'Total In' }}</p>
          <p class="text-sm font-semibold text-green-600 mt-1">{{ formatCurrency(expensesSummary.totalIn) }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-4 border-l-4 border-purple-600">
          <p class="text-xs text-gray-600">{{ $t('expenses.netBalance') || 'Net Balance' }}</p>
          <p class="text-sm font-semibold" :class="{'text-green-600': expensesSummary.net >= 0, 'text-red-600': expensesSummary.net < 0}">
            {{ formatCurrency(expensesSummary.net || 0) }}
          </p>
        </div>
      </div>

      <!-- Expenses Stats Bar -->
      <div :class="['bg-gray-50 rounded-lg p-4', isRTL ? 'text-end' : 'text-start']">
        <!-- Filters row -->
        <div :class="['flex flex-col md:flex-row gap-3 items-center mb-3', isRTL ? 'text-end' : 'text-start']">
          <div :class="['flex-1 w-full', isRTL ? 'text-start' : 'text-start']">
            <!-- ✅ Updated grid to accommodate new filters (Category + Branch) -->
            <!-- When Branch filter is visible (selectedBranch === null): 7 filters -->
            <!-- When Branch filter is hidden: 6 filters -->
            <div :class="['grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-7 gap-3 items-end']">
              <!-- Search -->
              <div>
                <label :class="['block text-xs font-medium text-gray-600 mb-1', isRTL ? 'text-start' : 'text-start']">{{ $t('labels.search') || 'Search' }}</label>
                <input
                  v-model="expensesFilters.q"
                  @keyup.enter="expenses.page = 1; fetchExpenses()"
                  :placeholder="$t('labels.search') || 'Search'"
                  :disabled="loading"
                    :class="['w-full px-3 py-2 border border-gray-300 rounded-lg text-xs', isRTL ? 'text-right' : 'text-left']"
                />
              </div>

              <!-- From Date -->
              <div>
                <label :class="['block text-xs font-medium text-gray-600 mb-1', isRTL ? 'text-start' : 'text-start']">{{ $t('labels.fromDate') || $t('labels.startDate') || 'From Date' }}</label>
                <input
                  v-model="expensesFilters.startDate"
                  type="date"
                  :disabled="loading"
                  :class="['w-full px-3 py-2 border border-gray-300 rounded-lg text-xs', isRTL ? 'text-right' : 'text-left']"
                />
              </div>

              <!-- To Date -->
              <div>
                <label :class="['block text-xs font-medium text-gray-600 mb-1', isRTL ? 'text-start' : 'text-start']">{{ $t('labels.toDate') || $t('labels.endDate') || 'To Date' }}</label>
                <input
                  v-model="expensesFilters.endDate"
                  type="date"
                  :disabled="loading"
                  :class="['w-full px-3 py-2 border border-gray-300 rounded-lg text-xs', isRTL ? 'text-right' : 'text-left']"
                />
              </div>

              <!-- Location -->
              <div>
                <label :class="['block text-xs font-medium text-gray-600 mb-1', isRTL ? 'text-start' : 'text-start']">{{ $t('expenses.location') || 'Location' }}</label>
                <select v-model.number="expensesFilters.locationId" :disabled="loading" :class="['w-full px-3 py-2 border border-gray-300 rounded-lg text-xs', isRTL ? 'text-right' : 'text-left']">
                  <option :value="null">{{ $t('expenses.location') || 'Location' }}</option>
                  <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
                </select>
              </div>

              <!-- Category Filter - ✅ NEW: Combobox with inline add support -->
              <div class="relative">
                <label :class="['block text-xs font-medium text-gray-600 mb-1', isRTL ? 'text-start' : 'text-start']">{{ $t('expenses.category') || 'Category' }}</label>
                <div class="relative">
                  <input
                    v-model="categoryInput"
                    @input="handleCategoryInput"
                    @focus="handleCategoryInput"
                    @blur="handleCategoryBlur"
                    @keydown="handleCategoryKeydown"
                    :disabled="loading"
                    :placeholder="$t('expenses.category') || 'Category'"
                    :class="['w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', isRTL ? 'text-right direction-rtl' : 'text-left']"
                  />
                  <!-- Dropdown -->
                  <div
                    v-if="showCategoryDropdown && (filteredCategoryOptions.length > 0 || canAddNewCategory)"
                    class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                    :class="isRTL ? 'text-right direction-rtl' : 'text-left'"
                  >
                    <!-- Existing categories -->
                    <div
                      v-for="(option, index) in filteredCategoryOptions"
                      :key="option.value"
                      @mousedown.prevent="selectCategory(option.value)"
                      :class="['px-3 py-2 cursor-pointer hover:bg-indigo-50 transition-colors', selectedCategoryIndex === index ? 'bg-indigo-100' : '']"
                    >
                      {{ option.label }}
                    </div>
                    <!-- Add new category option -->
                    <div
                      v-if="canAddNewCategory"
                      @mousedown.prevent="addNewCategory(categoryInput.trim())"
                      class="px-3 py-2 cursor-pointer hover:bg-green-50 bg-green-50/50 border-t border-gray-200 font-medium text-green-700"
                    >
                      {{ $t('expenses.addNewCategory') || 'Add new category' }}: "{{ categoryInput.trim() }}"
                    </div>
                  </div>
                </div>
              </div>

              <!-- Subcategory Filter - shows when a categoryId is selected -->
              <div v-if="expensesFilters.categoryId">
                <label :class="['block text-xs font-medium text-gray-600 mb-1', isRTL ? 'text-start' : 'text-start']">{{ $t('expenses.subcategory') || 'Subcategory' }}</label>
                <select v-model.number="expensesFilters.subCategoryId" :disabled="loading" :class="['w-full px-3 py-2 border border-gray-300 rounded-lg text-xs', isRTL ? 'text-right' : 'text-left']">
                  <option :value="null">{{ $t('expenses.subcategory') || 'Subcategory' }}</option>
                  <option v-for="sc in (expenseCategories.find(c=>c.id===expensesFilters.categoryId)?.subCategories || [])" :key="sc.id" :value="sc.id">{{ sc.name }}</option>
                </select>
              </div>

              <!-- Kind Filter (EXPENSE / ADVANCE) -->
              <div>
                <label :class="['block text-xs font-medium text-gray-600 mb-1', isRTL ? 'text-start' : 'text-start']">{{ $t('expenses.kindLabel') || 'Type' }}</label>
                <select v-model="expensesFilters.kind" :disabled="loading" :class="['w-full px-3 py-2 border border-gray-300 rounded-lg text-xs', isRTL ? 'text-right' : 'text-left']">
                  <option :value="null">{{ $t('expenses.typeAll') || 'All Types' }}</option>
                  <option value="EXPENSE">{{ $t('expenses.kind.expense') || 'مصروف' }}</option>
                  <option value="ADVANCE">{{ $t('expenses.kind.advance') || 'عهدة' }}</option>
                </select>
              </div>

              <!-- Branch Filter - ✅ NEW: Only shown when selectedBranch is null -->
              <div v-if="selectedBranch === null">
                <label :class="['block text-xs font-medium text-gray-600 mb-1', isRTL ? 'text-start' : 'text-start']">{{ $t('expenses.branch') || 'Branch' }}</label>
                <select v-model.number="expensesFilters.branchId" :disabled="loading" :class="['w-full px-3 py-2 border border-gray-300 rounded-lg text-xs', isRTL ? 'text-right' : 'text-left']">
                  <option :value="null">{{ $t('expenses.branch') || 'Branch' }}</option>
                  <option v-for="branch in branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
                </select>
              </div>

              <!-- Classification -->
              <div>
                <label :class="['block text-xs font-medium text-gray-600 mb-1', isRTL ? 'text-start' : 'text-start']">{{ $t('expenses.classification') || 'Classification' }}</label>
                <input
                  v-model="expensesFilters.classification"
                  type="text"
                  :placeholder="$t('expenses.classification') || 'Classification'"
                  :disabled="loading"
                  :class="['w-full px-3 py-2 border border-gray-300 rounded-lg text-xs', isRTL ? 'text-right' : 'text-left']"
                />
              </div>
            </div>
          </div>

          <AddFieldModal
            :open="fieldModal.open"
            :type="fieldModal.type"
            :name="fieldModal.name"
            :branch-category="fieldModal.category"
            @close="closeFieldModal"
            @save="handleFieldSave"
          />

          <div class="flex gap-2 items-center">
            <button type="button" @click="clearExpensesFilters" :disabled="loading"
              class="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-xs">
              {{ $t('labels.clear') || 'Clear' }}
            </button>
            <div v-if="loading" class="ml-2">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div :class="['text-xs text-gray-600', isRTL ? 'text-end' : 'text-start']">
            {{ $t('expenses.totalExpenses') || 'Total Expenses' }}: <span class="font-semibold">{{ expenses.total }}</span>
          </div>
          <div :class="['flex items-center gap-2 text-xs text-gray-600', isRTL ? 'justify-end' : 'justify-start']">
            <label>{{ $t('finance.pageSize') || 'Page Size' }}:</label>
            <select v-model.number="expenses.pageSize" @change="onPageSizeChange"
              class="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading/Error/Main Content Switch -->
      <template v-if="loading">
        <div :class="['flex justify-center py-8', isRTL ? 'text-end' : 'text-start']">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </template>
      <template v-else-if="error">
        <div :class="['bg-red-50 border border-red-200 rounded-lg p-4', isRTL ? 'text-end' : 'text-start']">
          <div :class="['flex items-center', isRTL ? 'justify-end' : 'justify-start']">
            <svg class="w-6 h-6 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span>{{ error }}</span>
          </div>
        </div>
      </template>
      <template v-else>
        <!-- Expenses Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <!-- No Results Message -->
          <div v-if="expenses.items.length === 0" :class="['text-center py-12', isRTL ? 'text-end' : 'text-start']">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
              </path>
            </svg>
            <h3 class="mt-2 text-xs font-medium text-gray-900">{{ $t('expenses.noResults') || 'No expenses found' }}</h3>
            <p class="mt-1 text-xs text-gray-500">
              {{ $t('expenses.searchBy') || 'Start by adding a new expense' }}
            </p>
          </div>
          <!-- Table -->
          <div v-else class="overflow-x-auto">
            <table :class="['min-w-full divide-y divide-gray-200', isRTL ? 'text-end' : 'text-start']">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">
                    {{ $t('expenses.date') || 'Date' }}
                  </th>
                  <th
                    :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">
                    {{ $t('expenses.type') || 'Type' }}
                  </th>
                  <th
                    :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">
                    {{ $t('expenses.category') || 'Category' }}
                  </th>
                  <th
                    :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">
                    {{ $t('expenses.description') || 'Description' }}
                  </th>
                  <!-- Branch column (before Amount) -->
                  <th :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">
                    {{ $t('expenses.branch') || 'Branch' }}
                  </th>
                  <th
                    :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">
                    {{ $t('expenses.amount') || 'Amount' }}
                  </th>
                  <!-- Flow column (after Amount) -->
                  <th :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">
                    {{ $t('expenses.flow') || 'Flow' }}
                  </th>
                  <th
                    :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">
                    {{ $t('expenses.notes') || 'Notes' }}
                  </th>
                  <!-- New columns: Location, Signed, Classification -->
                  <th
                    :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">
                    {{ $t('labels.location') || 'Location' }}
                  </th>
                  <th
                    :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">
                    {{ $t('expenses.classification') || 'Classification' }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="expense in expenses.items" :key="expense.id" class="hover:bg-gray-50">
                  <td :class="['px-6 py-4 whitespace-nowrap text-xs text-gray-900', isRTL ? 'text-end' : 'text-start']">
                    {{ formatDate(expense.date) }}
                  </td>
                  <td :class="['px-6 py-4 whitespace-nowrap text-xs text-gray-900', isRTL ? 'text-end' : 'text-start']">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="expense.kind === 'ADVANCE' ? 'bg-yellow-100 text-yellow-800' : 'bg-indigo-100 text-indigo-800'">
                      {{ expense.kind === 'ADVANCE' ? ($t('expenses.kind.advance') || 'عهدة') : ($t('expenses.kind.expense') || 'مصروف') }}
                    </span>
                  </td>
                  <td :class="['px-6 py-4 whitespace-nowrap text-xs', isRTL ? 'text-end' : 'text-start']">
                    <BadgeComponent variant="warning">
                      {{ expense.category || '-' }}
                    </BadgeComponent>
                  </td>
                  <td :class="['px-6 py-4 text-xs text-gray-900', isRTL ? 'text-end' : 'text-start']">
                    {{ expense.description || '-' }}
                  </td>
                  <td :class="['px-6 py-4 text-xs', isRTL ? 'text-end' : 'text-start']">
                    <span v-if="expense.branch && (expense.branch.name || expense.branch)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ expense.branch?.name || expense.branch }}
                    </span>
                    <span v-else class="text-gray-400">{{ $t('finance.companyWallet') || 'Main Treasury' }}</span>
                  </td>
                  <td :class="['px-6 py-4 whitespace-nowrap text-xs font-semibold text-red-600', isRTL ? 'text-end' : 'text-start']">
                    {{ formatCurrency(expense.amount) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[{ 'bg-green-100 text-green-800': expense.flow === 'IN', 'bg-red-100 text-red-800': expense.flow !== 'IN' }, 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium']">
                      {{ expense.flow === 'IN' ? $t('expenses.flowIn') || 'Income' : $t('expenses.flowOut') || 'Expense' }}
                    </span>
                  </td>
                  <td :class="['px-6 py-4 text-xs text-gray-500', isRTL ? 'text-end' : 'text-start']">
                    {{ expense.notes || '-' }}
                  </td>
                  <!-- Location -->
                  <td :class="['px-6 py-4 text-xs text-gray-900', isRTL ? 'text-end' : 'text-start']">
                    <span v-if="expense.location && (expense.location.name || expense.location)" class="inline-flex items-center gap-1">
                      {{ expense.location?.name || expense.location }}
                    </span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <!-- Signed column removed per request -->
                  <!-- Classification -->
                  <td :class="['px-6 py-4 text-xs text-gray-900', isRTL ? 'text-end' : 'text-start']">
                    {{ expense.classification || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div v-if="expenses.totalPages > 1"
            :class="['bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6', isRTL ? 'flex-row-reverse' : '']">
            <div :class="['flex-1 flex justify-between sm:hidden', isRTL ? 'flex-row-reverse' : '']">
              <button @click="changePage(expenses.page - 1)" :disabled="expenses.page <= 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ $t('labels.previous') }}
              </button>
              <span :class="['text-xs text-gray-700 self-center', isRTL ? 'order-2' : '']">
                {{ expenses.page }} / {{ expenses.totalPages }}
              </span>
              <button @click="changePage(expenses.page + 1)"
                :disabled="expenses.page >= expenses.totalPages"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ $t('labels.next') }}
              </button>
            </div>
            <div
              :class="['hidden sm:flex-1 sm:flex sm:items-center sm:justify-between', isRTL ? 'flex-row-reverse' : '']">
              <div>
                <p :class="['text-xs text-gray-700', isRTL ? 'text-end' : 'text-start']">
                  {{ $t('labels.showing') }}
                  <span class="font-medium">{{ ((expenses.page - 1) * expenses.pageSize) + 1 }}</span>
                  {{ $t('labels.to') }}
                  <span class="font-medium">{{ Math.min(expenses.page * expenses.pageSize, expenses.total)
                  }}</span>
                  {{ $t('labels.of') }}
                  <span class="font-medium">{{ expenses.total }}</span>
                  {{ $t('labels.results') }}
                </p>
              </div>
              <div>
                <nav
                  :class="['relative z-0 inline-flex rounded-md shadow-sm -space-x-px', isRTL ? 'flex-row-reverse' : '']">
                  <template v-if="!isRTL">
                    <!-- Previous Button (LTR: left) -->
                    <button @click="changePage(expenses.page - 1)" :disabled="expenses.page <= 1"
                      class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md">
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clip-rule="evenodd" />
                      </svg>
                    </button>
                    <!-- Next Button (LTR: right) -->
                    <button @click="changePage(expenses.page + 1)"
                      :disabled="expenses.page >= expenses.totalPages"
                      class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md">
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clip-rule="evenodd" />
                      </svg>
                    </button>
                  </template>
                  <template v-else>
                    <!-- Next Button (RTL: left, visually first) -->
                    <button @click="changePage(expenses.page + 1)"
                      :disabled="expenses.page >= expenses.totalPages"
                      class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md">
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clip-rule="evenodd" />
                      </svg>
                    </button>
                    <!-- Previous Button (RTL: right, visually last) -->
                    <button @click="changePage(expenses.page - 1)" :disabled="expenses.page <= 1"
                      class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md">
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clip-rule="evenodd" />
                      </svg>
                    </button>
                  </template>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Add Expense Modal -->
      <div v-if="showExpenseModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeExpenseModal"></div>
        <div :class="['bg-white rounded-lg shadow-xl w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto', isRTL ? 'direction-rtl' : '']">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 :class="['text-sm font-semibold text-gray-900', isRTL ? 'text-start' : 'text-start']">
                {{ $t('expenses.addExpense') || 'Add Expense' }}
              </h3>
              <button @click="closeExpenseModal" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form @submit.prevent="handleCreateExpense" class="grid gap-4 grid-cols-1 md:grid-cols-2">
              <!-- Date - Column 1 -->
              <div>
                <label :class="['block text-xs font-medium text-gray-700 mb-1', isRTL ? 'text-start' : 'text-start']">
                  {{ $t('expenses.date') || 'Date' }} <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="expenseForm.date" 
                  type="date" 
                  required
                  :class="['w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', isRTL ? 'text-start' : 'text-start']"
                />
              </div>

              <!-- Category - Column 2 -->
              <div>
                <label :class="['block text-xs font-medium text-gray-700 mb-1', isRTL ? 'text-start' : 'text-start']">
                  {{ $t('expenses.category') || 'Category' }} <span class="text-red-500">*</span>
                </label>
                <div :class="[isRTL ? 'flex-row-reverse' : '', 'flex gap-2']">
                  <select
                    v-model.number="expenseForm.categoryId"
                    required
                    :class="['flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', isRTL ? 'text-start' : 'text-start']"
                  >
                    <option :value="null">{{ $t('expenses.category') || 'Category' }}</option>
                    <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                  </select>
                  <button type="button" @click="addCategoryPrompt" class="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">+</button>
                </div>
              </div>

              <!-- Subcategory (optional) - Column 2 -->
              <div v-if="expenseForm.categoryId">
                <label :class="['block text-xs font-medium text-gray-700 mb-1', isRTL ? 'text-start' : 'text-start']">
                  {{ $t('expenses.subcategory') || 'Subcategory' }}
                </label>
                <select v-model.number="expenseForm.subCategoryId" :class="['w-full px-3 py-2 border border-gray-300 rounded-lg', isRTL ? 'text-start' : 'text-start']">
                  <option :value="null">{{ $t('expenses.subcategory') || 'Subcategory' }}</option>
                  <option v-for="sc in filteredSubcategoriesForForm" :key="sc.id" :value="sc.id">{{ sc.name }}</option>
                </select>
              </div>

              <!-- Kind (EXPENSE / ADVANCE) - Column 1 -->
              <div>
                <label :class="['block text-xs font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">{{ $t('expenses.kindLabel') || 'Type' }}</label>
                <select v-model="expenseForm.kind" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="EXPENSE">{{ $t('expenses.kind.expense') || 'مصروف' }}</option>
                  <option value="ADVANCE">{{ $t('expenses.kind.advance') || 'عهدة' }}</option>
                </select>
              </div>

              <!-- Description - Full Width -->
              <div class="col-span-1 md:col-span-2">
                <label :class="['block text-xs font-medium text-gray-700 mb-1', isRTL ? 'text-start' : 'text-start']">
                  {{ $t('expenses.description') || 'Description' }} <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="expenseForm.description" 
                  type="text" 
                  required
                  :placeholder="$t('expenses.description') || 'Description'"
                  :class="['w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', isRTL ? 'text-start' : 'text-start']"
                />
              </div>

              <!-- Flow Type - Column 1 -->
              <div>
                <label :class="['block text-xs font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
                  {{ $t('expenses.flow') || 'Flow' }} <span class="text-red-500">*</span>
                </label>
                <div class="flex gap-2">
                  <button 
                    type="button"
                    @click="expenseForm.flow = 'OUT'; expenseForm.settlementDate = null"
                    :class="[
                      'flex-1 px-3 py-2 rounded-lg font-medium transition',
                      expenseForm.flow === 'OUT' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    ]"
                  >
                    {{ $t('expenses.flowOut') || 'Expense' }}
                  </button>
                  <button 
                    type="button"
                    @click="expenseForm.flow = 'IN'"
                    :class="[
                      'flex-1 px-3 py-2 rounded-lg font-medium transition',
                      expenseForm.flow === 'IN' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    ]"
                  >
                    {{ $t('expenses.flowIn') || 'Income' }}
                  </button>
                </div>
              </div>

              <!-- Settlement Date (only for IN/Income) - Column 2 -->
              <div v-if="expenseForm.flow === 'IN'">
                <label :class="['block text-xs font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
                  {{ $t('expenses.settlementDate') || 'Settlement Date' }}
                </label>
                <input 
                  v-model="expenseForm.settlementDate" 
                  type="date" 
                  :placeholder="$t('expenses.settlementDatePlaceholder') || 'Settlement date (optional)'"
                  :class="['w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', isRTL ? 'text-right' : 'text-left']"
                />
                <p :class="['text-xs text-gray-500 mt-1', isRTL ? 'text-right' : 'text-left']">{{ $t('expenses.settlementDateHint') || 'Date when this income will be settled' }}</p>
              </div>

              <!-- Branch - Column 1 -->
              <div>
                <label :class="['block text-xs font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
                  {{ $t('expenses.branch') || 'Branch' }}
                </label>
                <div :class="[isRTL ? 'flex-row-reverse' : '', 'flex gap-2']">
                  <select 
                    v-model.number="expenseForm.branchId" 
                    :class="['flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', isRTL ? 'text-right' : 'text-left']"
                  >
                    <option :value="null">{{ $t('finance.companyWallet') || 'Main Treasury' }}</option>
                    <option v-for="branch in branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
                  </select>
                  <button type="button" @click="addBranchPrompt" class="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">+</button>
                </div>
              </div>

              <!-- Location - Column 2 (required) -->
              <div>
                <label :class="['block text-xs font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
                  {{ $t('expenses.location') || 'Location' }} <span class="text-red-500">*</span>
                </label>
                <div :class="[isRTL ? 'flex-row-reverse' : '', 'flex gap-2']">
                  <select 
                    v-model.number="expenseForm.locationId"
                    required
                    :class="['flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', isRTL ? 'text-right' : 'text-left']"
                  >
                    <option :value="null">{{ $t('expenses.location') || 'Location' }}</option>
                    <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
                  </select>
                  <button type="button" @click="addLocationPrompt" class="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">+</button>
                </div>
              </div>

              <!-- Classification - optional -->
              <div>
                <label :class="['block text-xs font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
                  {{ $t('expenses.classification') || 'Classification' }}
                </label>
                <input
                  v-model="expenseForm.classification"
                  type="text"
                  :placeholder="$t('expenses.classification') || 'Classification'"
                  :class="['w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', isRTL ? 'text-right' : 'text-left']"
                />
              </div>

              <!-- Amount - Column 2 -->
              <div>
                <label :class="['block text-xs font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
                  {{ $t('expenses.amount') || 'Amount' }} <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model.number="expenseForm.amount" 
                  type="number" 
                  step="0.01"
                  min="0"
                  required
                  :placeholder="$t('expenses.amount') || 'Amount'"
                  :class="['w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', isRTL ? 'text-right' : 'text-left']"
                />
              </div>

              <!-- Notes - Full Width -->
              <div class="col-span-1 md:col-span-2">
                <label :class="['block text-xs font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
                  {{ $t('expenses.notes') || 'Notes' }}
                </label>
                <textarea 
                  v-model="expenseForm.notes" 
                  rows="2"
                  :placeholder="$t('expenses.notes') || 'Notes'"
                  :class="['w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', isRTL ? 'text-right' : 'text-left']"
                ></textarea>
              </div>

              <!-- Buttons - Full Width -->
              <div :class="['col-span-1 md:col-span-2 flex gap-3 pt-4', isRTL ? 'flex-row-reverse' : '']">
                <button 
                  type="button" 
                  @click="closeExpenseModal"
                  class="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {{ $t('labels.cancel') || 'Cancel' }}
                </button>
                <button 
                  type="submit" 
                  :disabled="expenseProcessing"
                  class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <div v-if="expenseProcessing" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {{ expenseProcessing ? ($t('labels.processing') || 'Processing...') : ($t('expenses.addExpense') || 'Add Expense') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    <!-- Edit Branch Modal -->
    <div v-if="showEditBranchModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeEditBranchModal">
      <div
        :class="['relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white', isRTL ? 'text-end' : 'text-start']">
        <div class="mt-3">
          <h3 :class="['text-sm font-medium text-gray-900 mb-4', isRTL ? 'text-end' : 'text-start']">
            {{ $t('finance.editBranch') || 'Edit Branch' }}
          </h3>
          <form @submit.prevent="handleEditBranch" :class="['space-y-4', isRTL ? 'text-end' : 'text-start']">
            <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                {{ $t('finance.branchName') || 'Branch Name' }} *
              </label>
              <input v-model.trim="editBranchForm.name" type="text" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="closeEditBranchModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
                {{ $t('labels.cancel') || 'Cancel' }}
              </button>
              <button type="submit" :disabled="editBranchProcessing"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition">
                {{ editBranchProcessing ? ($t('labels.processing') || 'Processing...') : ($t('labels.save') || 'Save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>


      <!-- Transfer Modal -->
      <div   v-if="showTransferModal"
  class="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50 px-4"
  @click.self="closeTransferModal" style="margin-top: 0px;">
        <div
          :class="[
    'relative w-full max-w-2xl bg-white rounded-md shadow-lg p-5 max-h-[90vh] overflow-y-auto',
    isRTL ? 'text-end' : 'text-start'
  ]" >
          <div class="mt-3">
            <h3 :class="['text-sm font-medium text-gray-900 mb-4', isRTL ? 'text-end' : 'text-start']">
              <span v-if="!selectedBranch">{{ $t('finance.transferToBranch') || 'Transfer to Branch' }}</span>
              <span v-else-if="transferForm.transferType === 'toCompany'">{{ $t('finance.transferToCompany') || 'Transfer to Company' }}</span>
              <span v-else>{{ $t('finance.transferToBranch') || 'Transfer to Branch' }}</span>
            </h3>
            <form @submit.prevent="handleTransfer" :class="['grid gap-4 grid-cols-1 md:grid-cols-2', isRTL ? 'text-end' : 'text-start']">
              <!-- Transfer Type Selection (only when a branch is selected) - Full Width -->
              <div v-if="selectedBranch" class="col-span-1 md:col-span-2">
                <label :class="['block text-xs font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
                  {{ $t('finance.transferType') }} *
                </label>
                <div class="flex gap-2">
                  <button 
                    type="button"
                    @click="transferForm.transferType = 'toCompany'"
                    :class="[
                      'flex-1 px-3 py-2 rounded-lg font-medium transition text-xs',
                      transferForm.transferType === 'toCompany' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    ]"
                  >
                    {{ $t('finance.transferToCompany') }}
                  </button>
                  <button 
                    type="button"
                    @click="transferForm.transferType = 'toBranch'"
                    :class="[
                      'flex-1 px-3 py-2 rounded-lg font-medium transition text-xs',
                      transferForm.transferType === 'toBranch' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    ]"
                  >
                    {{ $t('finance.transferToBranch') }}
                  </button>
                </div>
              </div>

              <!-- From Branch (read-only when branch is selected) - Full Width -->
              <div v-if="selectedBranch" class="col-span-1 md:col-span-2 p-3 bg-gray-50 rounded-md">
                <p :class="['text-xs text-gray-700', isRTL ? 'text-right' : 'text-left']">
                  <strong>{{ $t('finance.fromBranch') }}:</strong> {{ selectedBranch.name }}
                </p>
              </div>

              <!-- To Branch Selection - Column 1 -->
              <div v-if="!selectedBranch || transferForm.transferType === 'toBranch'" class="col-span-1 md:col-span-1">
                <label :class="['block text-xs font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
                  {{ $t('finance.selectBranch') }} *
                </label>
                <select 
                  v-model.number="transferForm.toBranchId" 
                  required
                  :class="['w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500', isRTL ? 'text-right' : 'text-left']"
                >
                  <option :value="null">{{ $t('finance.selectBranch') }}</option>
                  <option 
                    v-for="branch in availableBranchesForTransfer" 
                    :key="branch.id" 
                    :value="branch.id"
                  >
                    {{ branch.name }}
                  </option>
                </select>
              </div>

              <!-- To Company (read-only when transfer type is toCompany) - Column 1 -->
              <div v-if="selectedBranch && transferForm.transferType === 'toCompany'" class="col-span-1 md:col-span-1 p-3 bg-indigo-50 rounded-md flex items-center">
                <p :class="['text-xs text-indigo-700', isRTL ? 'text-right' : 'text-left']">
                  <strong>{{ $t('finance.to') }}:</strong> {{ $t('finance.companyWallet') }}
                </p>
              </div>

              <!-- Amount - Column 2 -->
              <div class="col-span-1 md:col-span-1">
                <label :class="['block text-xs font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
                  {{ $t('finance.amount') }} *
                </label>
                <input 
                  v-model.number="transferForm.amount" 
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  required
                  :class="['w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500', isRTL ? 'text-right' : 'text-left']"
                >
              </div>

              <!-- Description - Full Width -->
              <div class="col-span-1 md:col-span-2">
                <label :class="['block text-xs font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
                  {{ $t('finance.description') }}
                </label>
                <input 
                  v-model="transferForm.description" 
                  type="text"
                  :class="['w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500', isRTL ? 'text-right' : 'text-left']"
                >
              </div>

              <!-- Date - Column 1 -->
              <div class="col-span-1 md:col-span-1">
                <label :class="['block text-xs font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
                  {{ $t('finance.date') }} *
                </label>
                <input 
                  v-model="transferForm.date" 
                  type="date" 
                  required
                  :class="['w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500', isRTL ? 'text-right' : 'text-left']"
                >
              </div>

              <!-- Buttons - Full Width -->
              <div :class="['col-span-1 md:col-span-2 flex gap-3 pt-4', isRTL ? 'flex-row-reverse' : 'justify-end']">
                <button 
                  type="button" 
                  @click="closeTransferModal"
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  {{ $t('labels.cancel') || 'Cancel' }}
                </button>
                <button 
                  type="submit" 
                  :disabled="processing"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {{ processing ? ($t('labels.processing') || 'Processing...') : ($t('finance.transfer') || 'Transfer') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>

import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getBranches, getBranchWalletSummary, getBranchExpenses, getCompanyExpenses, getExpenses, getExpensesSummary, getLocations, getExpenseCategories, createExpense, createBranch, createLocation, saveBranchesOrder, updateBranch, transferFromCompanyToBranch, transferFromBranchToCompany, transferFromBranchToBranch } from '@/api'
import { useCompanyFinanceStore } from '@/stores/useCompanyFinanceStore'
import BadgeComponent from '../shared/Badge.vue'
import AddFieldModal from '@/components/shared/AddFieldModal.vue'

export default {
  name: 'CompanyFinance',
  components: { BadgeComponent, AddFieldModal },
  setup() {
    const financeStore = useCompanyFinanceStore()
    const showTransferModal = ref(false)
    const showEditBranchModal = ref(false)
    const processing = ref(false)
    const editBranchProcessing = ref(false)
    // Sidebar / branches list state
    const branches = ref([])
    const sublistOpen = ref(true)
    const dragIndex = ref(null)
    const dragOverIndex = ref(null)
    const dragOverMain = ref(false)
    const savingOrder = ref(false)
    const previousOrders = ref([])
    const audioCtxRef = ref(null)
    const selectedBranch = ref(null)
    // Sidebar collapsed state (persisted to localStorage)
    const sidebarCollapsed = ref(false)
    const summary = ref({ balance: 0, last30dIn: 0, last30dOut: 0 })
    const expenses = ref({ items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 })
    const loading = ref(false)
    const error = ref(null)

    const expenseForm = ref({ 
      date: new Date().toISOString().split('T')[0], 
      category: '', 
      description: '', 
      amount: 0,
      notes: '',
      branchId: null,
      flow: 'OUT',
      settlementDate: null,
      locationId: null,
      classification: ''
    })
    // Locations for the location select
    const locations = ref([])

    // Filters used when fetching expenses and the summary (kept simple for now)
    // ✅ Updated to support Expenses v2: categoryId, subCategoryId, kind
    const expensesFilters = ref({ q: '', categoryId: null, subCategoryId: null, kind: null, startDate: '', endDate: '', classification: '', locationId: null, branchId: null })

    // Categories + inline add modal (mirrors ExpensesList.vue UX)
    const extraCategories = ref({})
    // Known categories discovered from backend responses (persistent across refreshes)
    const knownCategories = ref([])
    const fieldModal = ref({ open: false, type: '', name: '', category: '' })
    // Expense categories tree (ExpenseCategory with nested subCategories)
    const expenseCategories = ref([])

    const filteredSubcategoriesForForm = computed(() => {
      const catId = expenseForm.value.categoryId
      if (!catId) return []
      const cat = expenseCategories.value.find(c => c.id === catId)
      return Array.isArray(cat?.subCategories) ? cat.subCategories : []
    })
    const { t, tm, locale } = useI18n()

    // ✅ Category combobox state
    const categoryInput = ref('')
    const showCategoryDropdown = ref(false)
    const selectedCategoryIndex = ref(-1)

    const categories = computed(() => {
      const base = (tm && tm('expenses.categories')) || {}
      return { ...base, ...extraCategories.value }
    })

    const categoryOptions = computed(() => {
      const backend = knownCategories.value.map(c => ({ value: c, label: c }))
      const extra = Object.keys(extraCategories.value).map(k => ({ value: k, label: k }))
      const all = [...backend, ...extra]
      const seen = new Set()
      return all.filter(item => !seen.has(item.value) && seen.add(item.value))
    })

    // ✅ Filtered category options based on input
    const filteredCategoryOptions = computed(() => {
      if (!categoryInput.value.trim()) {
        return categoryOptions.value
      }
      const query = categoryInput.value.toLowerCase().trim()
      return categoryOptions.value.filter(opt => 
        opt.label.toLowerCase().includes(query) || opt.value.toLowerCase().includes(query)
      )
    })

    // ✅ Check if we can add new category (input doesn't match any existing)
    const canAddNewCategory = computed(() => {
      const trimmed = categoryInput.value.trim()
      if (!trimmed) return false
      // Check if input exactly matches any existing category
      const exists = categoryOptions.value.some(opt => 
        opt.value.toLowerCase() === trimmed.toLowerCase() || 
        opt.label.toLowerCase() === trimmed.toLowerCase()
      )
      return !exists
    })

    const addCategoryPrompt = () => { fieldModal.value = { open: true, type: 'category', name: '', category: '' } }
    const addBranchPrompt = () => { fieldModal.value = { open: true, type: 'branch', name: '', category: '' } }
    const addLocationPrompt = () => { fieldModal.value = { open: true, type: 'location', name: '', category: '' } }
    const closeFieldModal = () => { fieldModal.value = { open: false, type: '', name: '', category: '' } }
    const saveFieldModal = async () => {
      if (!fieldModal.value.name) {
        if (window.$toast) window.$toast(t('expenses.enterCategoryName') || 'Please enter a category name', 'error')
        return
      }
      if (fieldModal.value.type === 'category') {
        extraCategories.value = { ...extraCategories.value, [fieldModal.value.name]: fieldModal.value.name }
        // ✅ Auto-select the newly created category in both expense form and filter
        // When creating a free-text category (local), we cannot resolve an ID, so keep it in extraCategories
        // and clear any categoryId selections until the user chooses a real category from the tree.
        expenseForm.value.categoryId = null
        expensesFilters.value.categoryId = null
        // Persist extra categories locally so they survive refreshes
        try { localStorage.setItem('extraExpenseCategories', JSON.stringify(extraCategories.value)) } catch (e) { }
        if (window.$toast) window.$toast(t('expenses.success.categoryAdded') || 'Category added', 'success')
        closeFieldModal()
        return
      }
      // Handle branch creation (calls API or simulates on failure), mirroring ExpensesList behavior
      if (fieldModal.value.type === 'branch') {
        try {
          const payload = { name: fieldModal.value.name, category: fieldModal.value.category }
          const res = await createBranch(payload)
          const newBranch = res.data
          branches.value.unshift(newBranch)
          // Set the expense form to the new branch
          expenseForm.value.branchId = newBranch.id
          if (window.$toast) window.$toast(t('expenses.success.branchAdded') || 'Branch added', 'success')
        } catch (error) {
          console.error('Error creating branch, simulating:', error)
          const newBranch = { id: Date.now(), name: fieldModal.value.name, category: fieldModal.value.category }
          branches.value.unshift(newBranch)
          expenseForm.value.branchId = newBranch.id
          if (window.$toast) window.$toast('Branch added (simulated)')
        }
        closeFieldModal()
        return
      }

      // Handle location creation
      if (fieldModal.value.type === 'location') {
        try {
          const payload = { name: fieldModal.value.name }
          const res = await createLocation(payload)
          const newLocation = res.data
          locations.value.unshift(newLocation)
          expenseForm.value.locationId = newLocation.id
          if (window.$toast) window.$toast(t('expenses.success.locationAdded') || 'Location added', 'success')
        } catch (error) {
          console.error('Error creating location, simulating:', error)
          const newLocation = { id: Date.now(), name: fieldModal.value.name }
          locations.value.unshift(newLocation)
          expenseForm.value.locationId = newLocation.id
          if (window.$toast) window.$toast('Location added (simulated)')
        }
        closeFieldModal()
        return
      }

      closeFieldModal()
    }

    const handleFieldSave = async (payload) => {
      fieldModal.value.name = payload.name
      fieldModal.value.category = payload.category || ''
      await saveFieldModal()
    }

    // ✅ Category combobox methods
    const handleCategoryInput = () => {
      showCategoryDropdown.value = true
      selectedCategoryIndex.value = -1
      // Don't update expensesFilters.category here - only update on selection
    }

    const handleCategoryBlur = () => {
      // Delay to allow click events on dropdown items (mousedown fires before blur)
      setTimeout(() => {
        if (!showCategoryDropdown.value) return // Already handled by click
        showCategoryDropdown.value = false
        // If a categoryId is selected, show its name; otherwise clear the input
        if (expensesFilters.value.categoryId) {
          const cat = expenseCategories.value.find(c => c.id === expensesFilters.value.categoryId)
          if (cat) categoryInput.value = cat.name
          else categoryInput.value = ''
        } else {
          categoryInput.value = ''
        }
        selectedCategoryIndex.value = -1
      }, 200)
    }

    const selectCategory = (categoryValue) => {
      const option = categoryOptions.value.find(opt => opt.value === categoryValue)
      if (option) {
        categoryInput.value = option.label
        // Try to map the chosen string category to a real categoryId (if exists)
        const found = expenseCategories.value.find(cat => cat.name.toLowerCase() === option.label.toLowerCase())
        expensesFilters.value.categoryId = found ? found.id : null
        showCategoryDropdown.value = false
        selectedCategoryIndex.value = -1
      }
    }

    const addNewCategory = (categoryName) => {
      if (!categoryName || !categoryName.trim()) {
        if (window.$toast) window.$toast(t('expenses.enterCategoryName') || 'Please enter a category name', 'error')
        return
      }
      const trimmed = categoryName.trim()
      // Add to extraCategories
      extraCategories.value = { ...extraCategories.value, [trimmed]: trimmed }
      // Select it immediately
      categoryInput.value = trimmed
      // We can't resolve an ID for a locally added free-text category; clear any ID filter
      expensesFilters.value.categoryId = null
      showCategoryDropdown.value = false
      selectedCategoryIndex.value = -1
      // Persist extra categories locally
      try { localStorage.setItem('extraExpenseCategories', JSON.stringify(extraCategories.value)) } catch (e) { }
      if (window.$toast) window.$toast(t('expenses.success.categoryAdded') || 'Category added', 'success')
    }

    const handleCategoryKeydown = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        if (canAddNewCategory.value && categoryInput.value.trim()) {
          addNewCategory(categoryInput.value.trim())
        } else if (filteredCategoryOptions.value.length > 0 && selectedCategoryIndex.value >= 0) {
          const option = filteredCategoryOptions.value[selectedCategoryIndex.value]
          selectCategory(option.value)
        } else if (filteredCategoryOptions.value.length === 1) {
          selectCategory(filteredCategoryOptions.value[0].value)
        }
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        if (showCategoryDropdown.value) {
          selectedCategoryIndex.value = Math.min(
            selectedCategoryIndex.value + 1,
            filteredCategoryOptions.value.length - 1 + (canAddNewCategory.value ? 1 : 0)
          )
        } else {
          showCategoryDropdown.value = true
          selectedCategoryIndex.value = 0
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        if (showCategoryDropdown.value) {
          selectedCategoryIndex.value = Math.max(selectedCategoryIndex.value - 1, -1)
        }
      } else if (event.key === 'Escape') {
        showCategoryDropdown.value = false
        selectedCategoryIndex.value = -1
      }
    }

    const expensesSummary = ref({
      countAll: 0,
      countMasrouf: 0,
      countAhd: 0,
      totalAll: '0.00',
      totalMasrouf: '0.00',
      totalAhd: '0.00',
      totalOut: '0.00',
      totalIn: '0.00',
      net: '0.00'
    })
    const showExpenseModal = ref(false)
    const expenseProcessing = ref(false)
    const transferForm = ref({ branchId: null, amount: 0, description: '', date: new Date().toISOString().split('T')[0] })
    const editBranchForm = ref({ name: '' })
    const editBranchTarget = ref(null)

    const fetchBranches = async () => {
      try {
        const res = await getBranches()
        // normalize branch objects with pinned flag and _dropped visual flag
        branches.value = (res.data || []).map(b => ({ ...b, pinned: !!b.pinned, _dropped: false }))
      } catch (e) { branches.value = [] }
    }

    const fetchLocations = async () => {
      try {
        const res = await getLocations()
        locations.value = res.data || []
      } catch (e) {
        locations.value = []
      }
    }

    const fetchSummary = async () => {
      if (!selectedBranch.value) {
        await financeStore.fetchSummary()
        summary.value = {
          balance: financeStore.summary.balance,
          last30dIn: financeStore.summary.last30dIn,
          last30dOut: financeStore.summary.last30dOut
        }
      } else {
        const res = await getBranchWalletSummary(selectedBranch.value.id)
        summary.value = res.data
      }
    }

    const fetchExpenses = async () => {
      loading.value = true
      error.value = null
      try {
        // ✅ Updated cleanParams: remove empty strings and null values (backend rejects empty strings)
        // Returns object with only defined, non-empty values
        const cleanParams = (obj) => {
          const cleaned = {}
          Object.entries(obj || {}).forEach(([k, v]) => {
            // Only include if value is not empty string, not null, and not undefined
            if (v !== '' && v !== null && v !== undefined) {
              cleaned[k] = v
            }
          })
          return cleaned
        }

        // ✅ Build params for list (paginated) - includes all filters and includeSummary
        const listParams = cleanParams({
          page: expenses.value.page,
          pageSize: expenses.value.pageSize,
          q: expensesFilters.value.q,
          categoryId: expensesFilters.value.categoryId,
          subCategoryId: expensesFilters.value.subCategoryId,
          kind: expensesFilters.value.kind,
          startDate: expensesFilters.value.startDate,
          endDate: expensesFilters.value.endDate,
          classification: expensesFilters.value.classification,
          locationId: expensesFilters.value.locationId,
          // ✅ Added branchId filter (only when selectedBranch is null, to filter within company expenses)
          branchId: !selectedBranch.value ? expensesFilters.value.branchId : undefined,
          includeSummary: true // Request summary in the same call
        })

        let res
        if (!selectedBranch.value) {
          // Main Treasury view: use the generic /api/expenses endpoint so the
          // filter's branchId is respected (users can filter company-wide
          // expenses by a specific branch without switching to that branch view).
          // Note: getCompanyExpenses may not honor branchId the same way.
          res = await getExpenses(listParams);
        } else {
          // Branch-specific expenses (endpoint uses branch in URL); do not
          // include branchId in params in this mode.
          res = await getBranchExpenses(selectedBranch.value.id, listParams);
        }
        expenses.value = {
          items: res.data.items || res.data.rows || [],
          total: res.data.total || 0,
          page: res.data.page || expenses.value.page,
          pageSize: res.data.pageSize || expenses.value.pageSize,
          totalPages: Math.ceil((res.data.total || 0) / (res.data.pageSize || expenses.value.pageSize))
        };
        // Extract unique categories from backend data and keep for combobox
        try {
          const uniqueCats = new Set()
          expenses.value.items.forEach(exp => {
            if (exp.category?.trim()) uniqueCats.add(exp.category.trim())
          })
          knownCategories.value = Array.from(uniqueCats).sort()
        } catch (e) {
          knownCategories.value = []
        }
        // ✅ Use summary from response if available, otherwise fetch separately
        if (res.data.summary) {
          expensesSummary.value = {
            countAll: res.data.summary.countAll || 0,
            countMasrouf: res.data.summary.countMasrouf || 0,
            countAhd: res.data.summary.countAhd || 0,
            totalAll: res.data.summary.totalAll || '0.00',
            totalMasrouf: res.data.summary.totalMasrouf || '0.00',
            totalAhd: res.data.summary.totalAhd || '0.00',
            totalOut: res.data.summary.totalOut || '0.00',
            totalIn: res.data.summary.totalIn || '0.00',
            net: res.data.summary.net || '0.00'
          }
        } else {
          // Fallback: fetch summary separately if not included in response
          try {
            const rawSummary = {
              q: expensesFilters.value.q,
              categoryId: expensesFilters.value.categoryId,
              subCategoryId: expensesFilters.value.subCategoryId,
              kind: expensesFilters.value.kind,
              startDate: expensesFilters.value.startDate,
              endDate: expensesFilters.value.endDate,
              locationId: expensesFilters.value.locationId
            }
            // ✅ If branch is selected, use its ID; otherwise use branchId filter (if set)
            if (selectedBranch.value && selectedBranch.value.id) {
              rawSummary.branchId = selectedBranch.value.id
            } else if (!selectedBranch.value && expensesFilters.value.branchId) {
              rawSummary.branchId = expensesFilters.value.branchId
            }
            const summaryParams = cleanParams(rawSummary)
            const s = await getExpensesSummary(summaryParams)
            // s may be either the summary object or an axios response; be defensive when reading net
            const netVal = s?.net ?? s?.data?.net ?? s?.data?.summary?.net ?? '0.00'
            expensesSummary.value = { ...expensesSummary.value, ...(s || {}), net: netVal }
          } catch (err2) {
            console.error('Error fetching expenses summary:', err2)
          }
        }
      } catch (err) {
        console.error('Error fetching expenses:', err)
        error.value = err.response?.data?.message || 'Failed to load expenses'
        expenses.value = { items: [], total: 0, page: 1, pageSize: expenses.value.pageSize, totalPages: 1 }
      } finally {
        loading.value = false
      }
    }

    const selectBranch = async (branch) => {
      // set the selected branch (null = main company)
      selectedBranch.value = branch
      expenses.value.page = 1
      await fetchSummary()
      await fetchExpenses()
    }

    // Undo snapshot helper
    const pushSnapshot = () => {
      previousOrders.value.push(branches.value.map(b => ({ id: b.id, pinned: !!b.pinned })))
      if (previousOrders.value.length > 10) previousOrders.value.shift()
    }

    // Drag & Drop handlers (copy/pasted from prompt)
    const onDragStart = (index, event) => {
      pushSnapshot()
      dragIndex.value = index
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', String(index))
      event.currentTarget.classList.add('opacity-70')
      dragOverMain.value = false
    }

    const onDragEnter = (index, event) => { dragOverIndex.value = index }

    const onDropAt = async (index, event) => {
      event.preventDefault()
      const from = dragIndex.value != null ? dragIndex.value : parseInt(event.dataTransfer.getData('text/plain'))
      const to = index
      if (from == null || from === to) return onDragEnd()
      const item = branches.value.splice(from, 1)[0]
      branches.value.splice(to, 0, item)
      triggerDropFeedback(to)
      await saveOrder()
      onDragEnd()
    }

    const onDropOnMain = async (event) => {
      event.preventDefault()
      dragOverMain.value = false
      const from = dragIndex.value != null ? dragIndex.value : parseInt(event.dataTransfer.getData('text/plain'))
      if (from == null) return onDragEnd()
      pushSnapshot()
      const branch = branches.value.splice(from, 1)[0]
      branches.value.unshift(branch)
      await selectBranch(branch)
      triggerDropFeedback(0)
      await saveOrder()
      onDragEnd()
    }

    const onDragOverMain = (event) => { event.preventDefault(); dragOverMain.value = true }
    const onDragEnd = (event) => {
      dragIndex.value = null
      dragOverIndex.value = null
      dragOverMain.value = false
      const els = document.querySelectorAll('[draggable="true"]')
      els.forEach(el => el.classList.remove('opacity-70'))
    }

    const promoteToTop = async (index) => {
      pushSnapshot()
      if (index === 0) return
      const item = branches.value.splice(index, 1)[0]
      branches.value.unshift(item)
      triggerDropFeedback(0)
      await saveOrder()
    }

    const togglePin = async (index) => {
      pushSnapshot()
      const b = branches.value[index]
      if (!b) return
      b.pinned = !b.pinned
      if (b.pinned) {
        branches.value.splice(index, 1)
        branches.value.unshift(b)
      }
      await saveOrder()
    }

    const undoOrder = async () => {
      const snap = previousOrders.value.pop()
      if (!snap) {
        if (window.$toast) window.$toast('Nothing to undo', 'info')
        return
      }
      const idToBranch = Object.fromEntries(branches.value.map(b => [b.id, b]))
      branches.value = snap.map(s => ({ ...idToBranch[s.id], pinned: !!s.pinned }))
      await saveOrder()
    }

    // saveOrder: call API saveBranchesOrder(payload) to persist order and pinned state
    const saveOrder = async () => {
      savingOrder.value = true
      try {
        const payload = branches.value.map((b, idx) => ({ id: b.id, order: idx, pinned: !!b.pinned }))
        await saveBranchesOrder({ items: payload })
        if (window.$toast) window.$toast('Order saved', 'success')
      } catch (err) {
        if (window.$toast) window.$toast(err.response?.data?.message || 'Failed to save order', 'error')
      } finally {
        savingOrder.value = false
      }
    }

    // Visual + audio feedback on drops
    const triggerDropFeedback = (index) => {
      nextTick(() => {
        if (branches.value[index]) {
          branches.value[index]._dropped = true
          setTimeout(() => {
            if (branches.value[index]) branches.value[index]._dropped = false
          }, 700)
        }
      })
      playDropSound()
    }

    const playDropSound = () => {
      try {
        if (!audioCtxRef.value) audioCtxRef.value = new (window.AudioContext || window.webkitAudioContext)()
        const ctx = audioCtxRef.value
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = 'sine'
        o.frequency.value = 880
        g.gain.value = 0.0001
        o.connect(g)
        g.connect(ctx.destination)
        const now = ctx.currentTime
        g.gain.linearRampToValueAtTime(0.06, now + 0.01)
        o.start(now)
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
        o.stop(now + 0.19)
      } catch (e) { }
    }

    const openTransferModal = () => {
      transferForm.value = { 
        branchId: null, 
        toBranchId: null,
        transferType: selectedBranch.value ? 'toCompany' : null,
        amount: 0, 
        description: '', 
        date: new Date().toISOString().split('T')[0] 
      }
      showTransferModal.value = true
    }
    const closeTransferModal = () => {
      showTransferModal.value = false
      transferForm.value = {
        branchId: null,
        toBranchId: null,
        transferType: selectedBranch.value ? 'toCompany' : null,
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0]
      }
    }

    const openEditBranch = (branch) => {
      if (!branch) {
        console.error('No branch provided to openEditBranch')
        return
      }
      console.log('Opening edit modal for branch:', branch)
      if (!branch.id) {
        console.error('Branch missing ID:', branch)
        if (window.$toast) window.$toast('Branch ID is missing', 'error')
        return
      }
      editBranchTarget.value = branch
      editBranchForm.value = { name: branch.name || '' }
      showEditBranchModal.value = true
    }
    const closeEditBranchModal = () => {
      showEditBranchModal.value = false
      editBranchTarget.value = null
    }

    const handleEditBranch = async () => {
      if (!editBranchTarget.value) return
      const name = (editBranchForm.value.name || '').trim()
      if (!name) {
        if (window.$toast) window.$toast('Please enter a branch name', 'error')
        return
      }
      const branchId = editBranchTarget.value.id
      if (!branchId) {
        if (window.$toast) window.$toast('Invalid branch ID', 'error')
        console.error('Branch ID is missing:', editBranchTarget.value)
        return
      }
      editBranchProcessing.value = true
      try {
        console.log('Updating branch:', branchId, 'with name:', name)
        const res = await updateBranch(branchId, { name })
        const updated = res?.data || { ...editBranchTarget.value, name }
        const idx = branches.value.findIndex(b => b.id === branchId)
        if (idx !== -1) {
          branches.value[idx] = { ...branches.value[idx], ...updated }
        }
        if (selectedBranch.value && selectedBranch.value.id === branchId) {
          selectedBranch.value = { ...selectedBranch.value, ...updated }
        }
        closeEditBranchModal()
        if (window.$toast) window.$toast('Branch updated', 'success')
      } catch (error) {
        console.error('Error updating branch:', error)
        console.error('Branch ID:', branchId)
        console.error('Error response:', error.response)
        if (window.$toast) {
          const errorMsg = error.response?.data?.message || error.message || 'Failed to update branch'
          window.$toast(errorMsg, 'error')
        }
      } finally {
        editBranchProcessing.value = false
      }
    }


    const handleTransfer = async () => {
      if (!transferForm.value.amount || transferForm.value.amount <= 0) {
        if (window.$toast) window.$toast('Please enter a valid amount', 'error')
        return
      }

      // Validation based on transfer type
      if (!selectedBranch.value) {
        // Company -> Branch transfer
        if (!transferForm.value.branchId) {
          if (window.$toast) window.$toast('Please select a branch', 'error')
          return
        }
      } else {
        // Branch transfers
        if (transferForm.value.transferType === 'toBranch') {
          if (!transferForm.value.toBranchId) {
            if (window.$toast) window.$toast('Please select a destination branch', 'error')
            return
          }
          if (transferForm.value.toBranchId === selectedBranch.value.id) {
            if (window.$toast) window.$toast('Cannot transfer to the same branch', 'error')
            return
          }
        }
        // toCompany doesn't need additional validation
      }

      processing.value = true
      try {
        if (!selectedBranch.value) {
          // Transfer from company to branch
          await transferFromCompanyToBranch({
            branchId: transferForm.value.branchId,
            amount: transferForm.value.amount,
            description: transferForm.value.description,
            date: transferForm.value.date
          });
        } else if (transferForm.value.transferType === 'toCompany') {
          // Transfer from branch to company
          await transferFromBranchToCompany(selectedBranch.value.id, {
            amount: transferForm.value.amount,
            description: transferForm.value.description,
            date: transferForm.value.date
          });
        } else {
          // Transfer from branch to branch
          await transferFromBranchToBranch(selectedBranch.value.id, {
            toBranchId: transferForm.value.toBranchId,
            amount: transferForm.value.amount,
            description: transferForm.value.description,
            date: transferForm.value.date
          });
        }
        await fetchSummary()
        // Refresh expenses as well to reflect any related changes and update knownCategories
        await fetchExpenses()
        closeTransferModal()
        if (window.$toast) window.$toast('Transfer successful', 'success')
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to transfer'
        if (window.$toast) window.$toast(errorMessage, 'error')
      } finally { 
        processing.value = false 
      }
    }

    const changePage = async (page) => {
      if (page >= 1 && page <= expenses.value.totalPages) {
        expenses.value.page = page
        await fetchExpenses()
      }
    }
    const onPageSizeChange = async () => {
      expenses.value.page = 1
      await fetchExpenses()
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }
    const formatCurrency = (amount) => {
      const numAmount = parseFloat(amount)
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP', minimumFractionDigits: 2 }).format(numAmount)
    }

    // Expense modal handlers
    const openExpenseModal = () => {
      // Use new fields: categoryId, subCategoryId, kind
      expenseForm.value = { 
        date: new Date().toISOString().split('T')[0], 
        categoryId: null,
        subCategoryId: null,
        kind: 'EXPENSE', // default as per spec
        description: '', 
        amount: 0,
        notes: '',
        branchId: selectedBranch.value ? selectedBranch.value.id : null,
        locationId: null,
        flow: 'OUT',
        settlementDate: null
      }
      showExpenseModal.value = true
    }
    const closeExpenseModal = () => {
      showExpenseModal.value = false
      expenseForm.value = {
        date: new Date().toISOString().split('T')[0],
        categoryId: null,
        subCategoryId: null,
        kind: 'EXPENSE',
        description: '',
        amount: 0,
        notes: '',
        branchId: null,
        locationId: null,
        flow: 'OUT',
        settlementDate: null
      }
    }
    const handleCreateExpense = async () => {
      if (!expenseForm.value.amount || expenseForm.value.amount <= 0) {
        if (window.$toast) window.$toast('Please enter a valid amount', 'error')
        return
      }
      if (!expenseForm.value.categoryId) {
        if (window.$toast) window.$toast('Please select a category', 'error')
        return
      }
      if (!expenseForm.value.description || !String(expenseForm.value.description).trim()) {
        if (window.$toast) window.$toast('Please enter a description', 'error')
        return
      }
      if (!expenseForm.value.date) {
        if (window.$toast) window.$toast('Please select a date', 'error')
        return
      }
      if (expenseForm.value.locationId === null) {
        if (window.$toast) window.$toast('Please select a location', 'error')
        return
      }
      expenseProcessing.value = true
      try {
        // Send new payload using IDs and kind (do NOT send old string category/classification)
        const expenseData = {
          date: expenseForm.value.date,
          kind: expenseForm.value.kind || 'EXPENSE',
          categoryId: expenseForm.value.categoryId,
          subCategoryId: expenseForm.value.subCategoryId || undefined,
          description: expenseForm.value.description,
          amount: expenseForm.value.amount,
          flow: expenseForm.value.flow || 'OUT',
          notes: expenseForm.value.notes || undefined
        }
        // Include branchId only if a branch is selected (not null)
        // If branchId is null, don't include it (will be NULL for company expenses)
        if (expenseForm.value.branchId !== null) {
          expenseData.branchId = expenseForm.value.branchId
        }
        // Include locationId (required for backend)
        if (expenseForm.value.locationId !== null) {
          expenseData.locationId = expenseForm.value.locationId
        }
        // Include settlementDate only for IN flow and when provided
        if (expenseForm.value.flow === 'IN' && expenseForm.value.settlementDate) {
          expenseData.settlementDate = expenseForm.value.settlementDate
        }
        await createExpense(expenseData)
        await fetchExpenses()
        await fetchSummary()
        closeExpenseModal()
        if (window.$toast) window.$toast('Expense created successfully', 'success')
      } catch (error) {
        if (window.$toast) window.$toast(error.response?.data?.message || 'Failed to create expense', 'error')
      } finally {
        expenseProcessing.value = false
      }
    }

    onMounted(async () => {
      // Load persisted extra categories from localStorage
      try {
        const saved = localStorage.getItem('extraExpenseCategories')
        if (saved) extraCategories.value = JSON.parse(saved)
      } catch (e) { }
      // Load persisted sidebar collapsed state
      try {
        const savedSidebar = localStorage.getItem('companyFinanceSidebarCollapsed')
        if (savedSidebar !== null) sidebarCollapsed.value = savedSidebar === 'true'
      } catch (e) { }
      await fetchBranches()
      await fetchSummary()
      await fetchLocations()
      // Load hierarchical expense categories (ExpenseCategory + subCategories)
      try {
        const r = await getExpenseCategories()
        expenseCategories.value = r.data || []
      } catch (e) {
        expenseCategories.value = []
      }
      await fetchExpenses()
    })

    // Persist sidebar state
    watch(sidebarCollapsed, (val) => {
      try { localStorage.setItem('companyFinanceSidebarCollapsed', String(val)) } catch (e) { }
    })

    // Add isRTL computed property
    const isRTL = computed(() => {
      if (typeof window !== 'undefined' && window.__VUE_I18N__ && window.__VUE_I18N__.global) {
        return window.__VUE_I18N__.global.locale.value === 'ar'
      }
      if (typeof window !== 'undefined' && window.$i18n) {
        return window.$i18n.locale === 'ar'
      }
      return false
    })

    // Available branches for transfer (exclude current branch)
    const availableBranchesForTransfer = computed(() => {
      if (!selectedBranch.value) {
        // If no branch selected, return all branches (for company -> branch transfer)
        return branches.value
      }
      // Exclude current branch from the list
      return branches.value.filter(branch => branch.id !== selectedBranch.value.id)
    })

    // Re-fetch expenses when filters change
    watch(expensesFilters, async () => {
      expenses.value.page = 1
      await fetchExpenses()
    }, { deep: true })

    // ✅ Sync categoryInput label with selected categoryId (if any)
    watch(() => expensesFilters.value.categoryId, (newValue) => {
      if (newValue) {
        const cat = expenseCategories.value.find(c => c.id === newValue)
        if (cat) {
          categoryInput.value = cat.name
        } else {
          categoryInput.value = ''
        }
      } else {
        categoryInput.value = ''
      }
    }, { immediate: true })

    // ✅ Updated clearExpensesFilters to include category and branchId
    const clearExpensesFilters = async () => {
      expensesFilters.value = { q: '', categoryId: null, subCategoryId: null, kind: null, startDate: '', endDate: '', classification: '', locationId: null, branchId: null }
      expenses.value.page = 1
      await fetchExpenses()
    }

      return {
      branches,
      sublistOpen,
      selectedBranch,
      summary,
      expenses,
      editBranchForm,
      expenseForm,
      showExpenseModal,
      expenseProcessing,
      openExpenseModal,
      closeExpenseModal,
      handleCreateExpense,
      openTransferModal,
      closeTransferModal,
      openEditBranch,
      closeEditBranchModal,
      handleTransfer,
      handleEditBranch,
      transferForm,
      showTransferModal,
      processing,
      // drag & drop / sidebar helpers
      onDragStart,
      onDragEnter,
      onDropAt,
      onDropOnMain,
      onDragOverMain,
      dragOverMain,
      dragIndex,
      dragOverIndex,
      onDragEnd,
      togglePin,
      promoteToTop,
      undoOrder,
      previousOrders,
      savingOrder,
      changePage,
      onPageSizeChange,
      formatDate,
      formatCurrency,
      selectBranch,
      isRTL,
      availableBranchesForTransfer,
      // Expose loading and error for template
      loading,
      error,
      locations,
      expensesSummary,
      expensesFilters,
      clearExpensesFilters,
      showEditBranchModal,
      editBranchProcessing,
      fetchExpenses
      ,
      // Category helpers and inline-add modal
      extraCategories,
      fieldModal,
      expenseCategories,
      categories,
      categoryOptions,
      addCategoryPrompt,
      addBranchPrompt,
      addLocationPrompt,
      saveFieldModal,
      closeFieldModal,
      handleFieldSave,
      // Sidebar collapsed state
      sidebarCollapsed,
      // ✅ Category combobox exports
      categoryInput,
      showCategoryDropdown,
      selectedCategoryIndex,
      filteredCategoryOptions,
      canAddNewCategory,
      handleCategoryInput,
      handleCategoryBlur,
      selectCategory,
      addNewCategory,
      handleCategoryKeydown
    }
  }
}


</script>

<style scoped>
.direction-rtl {
  direction: rtl;
}

.direction-rtl input,
.direction-rtl select,
.direction-rtl textarea {
  direction: rtl;
  text-align: right;
}

.fade-enter-active,
.fade-leave-active {
  transition: all .15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@keyframes flash {
  0% {
    background-color: rgba(99, 102, 241, 0.12);
    transform: scale(1.01);
  }

  50% {
    background-color: rgba(99, 102, 241, 0.06);
    transform: scale(1);
  }

  100% {
    background-color: transparent;
    transform: scale(1);
  }
}

.animate-flash {
  animation: flash 0.7s ease;
}

[draggable="true"].opacity-70 {
  opacity: 0.6;
}

li:focus-within {
  outline: 2px solid rgba(99, 102, 241, 0.12);
}

/* ✅ Category combobox dropdown styles */
.direction-rtl .relative input {
  direction: rtl;
  text-align: right;
}

/* Ensure dropdown scrolls properly */
.max-h-60 {
  max-height: 15rem;
}

/* Custom scrollbar for dropdown */
.overflow-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Slide + fade transition for sidebar */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateX(-12px);
  opacity: 0;
}

/* Ensure floating button is visible above other elements */
.fixed.top-20.right-6 { z-index: 40; }

/* Strong pulsing orange flash for sidebar toggle button */
.sidebar-toggle-glow {
  position: relative;
  animation: pulse-color 1.8s infinite ease-in-out;
}

/* Glow halo that expands and intensifies */
.sidebar-toggle-glow::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(251, 146, 60, 0.8) 0%, transparent 60%);
  animation: pulse-glow-strong 1.8s infinite ease-in-out;
  pointer-events: none;
  z-index: -1;
}

@keyframes pulse-glow-strong {
  0% {
    transform: scale(0.9);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.35);
    opacity: 0.3;
  }
  100% {
    transform: scale(0.9);
    opacity: 0.7;
  }
}

/* Color pulse: gray → bright orange → gray */
@keyframes pulse-color {
  0% {
    color: #6b7280; /* gray-500 (اللون الأصلي للـ button) */
  }
  50% {
    color: #fb923c; /* orange-400 قوي */
  }
  100% {
    color: #6b7280;
  }
}

/* SVG stroke follows the button color for perfect sync */
.sidebar-toggle-glow svg {
  stroke: currentColor !important; /* مهم جدًا عشان يلغي أي لون ثابت */
}
</style>
