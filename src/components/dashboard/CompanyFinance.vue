<template>
  <div class="flex space-y-0">

    <aside
      :class="['bg-white rounded-lg shadow overflow-hidden p-3', isRTL ? 'direction-rtl' : '', isRTL ? 'text-end' : 'text-start']"
      style="min-width: 19%; max-width: 320px;">
      <!-- Sidebar header -->
      <div :class="['flex items-center justify-between mb-3']">
        <h3 :class="['text-lg font-semibold text-indigo-700', isRTL ? 'text-end' : 'text-start']">{{
          $t('finance.wallets') }}</h3>
        <div class="flex items-center gap-2">
          <button v-if="previousOrders.length" @click="undoOrder" title="Undo"
            class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm">Undo</button>
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
            class="text-sm text-gray-600 px-2 py-1 rounded hover:bg-gray-50">{{ sublistOpen ? '▼' : '▶' }}</button>
          <span class="text-sm text-gray-600">{{ $t('finance.subWallets') || 'Sub-wallets' }}</span>
        </div>
        <div class="text-sm text-gray-400">{{ branches.length }}</div>
      </div>

      <transition name="fade">
        <ul v-show="sublistOpen" class="space-y-2">
          <li v-if="branches.length === 0" class="text-sm text-gray-500 px-3 py-2">{{ $t('finance.noBranches') || 'لا توجد خزائن فرعية' }}</li>
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
              <div class="flex-1 text-sm text-gray-800 truncate">
                <div class="flex items-center gap-2">
                  <span class="truncate">{{ branch.name }}</span>
                  <span v-if="branch.pinned" class="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Pinned</span>
                </div>
                <div class="text-xs text-gray-400">{{ branch.description || '' }}</div>
              </div>
            </div>

            <div class="flex items-center gap-2 ml-3">
              <button @click.stop="openEditBranch(branch)" title="Edit"
                class="px-2 py-1 rounded hover:bg-gray-50 text-sm">✏️</button>
              <button @click.stop="togglePin(index)" title="Pin"
                class="px-2 py-1 rounded hover:bg-gray-50 text-sm">📌</button>
              <button @click.stop="promoteToTop(index)" title="Promote"
                class="px-2 py-1 rounded hover:bg-gray-50 text-sm">⬆️</button>
            </div>
          </li>
        </ul>
      </transition>
    </aside>
    <!-- Main Content -->
    <div :class="['flex-1 p-6 space-y-6', isRTL ? 'text-end' : 'text-start']">
      <!-- Balance Card -->

      <!-- <div class="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg shadow-lg p-6 text-white">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 class="text-lg font-medium text-indigo-100 mb-1">{{ $t('finance.balance') }}</h3>
          <p class="text-3xl font-bold">{{ financeStore.formattedBalance }}</p>
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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          :class="['bg-white rounded-lg shadow p-4 border-l-4 border-indigo-600', isRTL ? 'text-end' : 'text-start']">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ $t('finance.currentBalance') }}</p>
              <p class="text-2xl font-bold text-indigo-600 mt-1">{{ formatCurrency(summary.balance) }}</p>
            </div>
            <svg class="w-10 h-10 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
              </path>
            </svg>
          </div>
        </div>
        <div :class="['bg-white rounded-lg shadow p-4 border-l-4 border-green-600', isRTL ? 'text-end' : 'text-start']">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ $t('finance.last30dIn') }}</p>
              <p class="text-2xl font-bold text-green-600 mt-1">{{ formatCurrency(summary.last30dIn) }}</p>
            </div>
            <svg class="w-10 h-10 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
              </path>
            </svg>
          </div>
        </div>
        <div :class="['bg-white rounded-lg shadow p-4 border-l-4 border-red-600', isRTL ? 'text-end' : 'text-start']">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ $t('finance.last30dOut') }}</p>
              <p class="text-2xl font-bold text-red-600 mt-1">{{ formatCurrency(summary.last30dOut) }}</p>
            </div>
            <svg class="w-10 h-10 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
              </path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Expenses Stats Bar -->
      <div :class="['bg-gray-50 rounded-lg p-4', isRTL ? 'text-end' : 'text-start']">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div :class="['text-sm text-gray-600', isRTL ? 'text-end' : 'text-start']">
            {{ $t('expenses.totalExpenses') || 'Total Expenses' }}: <span class="font-semibold">{{ expenses.total }}</span>
          </div>
          <div :class="['flex items-center gap-2 text-sm text-gray-600', isRTL ? 'justify-end' : 'justify-start']">
            <label>{{ $t('finance.pageSize') || 'Page Size' }}:</label>
            <select v-model.number="expenses.pageSize" @change="onPageSizeChange"
              class="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
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
            <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('expenses.noResults') || 'No expenses found' }}</h3>
            <p class="mt-1 text-sm text-gray-500">
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
                    {{ $t('expenses.category') || 'Category' }}
                  </th>
                  <th
                    :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">
                    {{ $t('expenses.description') || 'Description' }}
                  </th>
                  <th
                    :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">
                    {{ $t('expenses.amount') || 'Amount' }}
                  </th>
                  <th
                    :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', isRTL ? 'text-end' : 'text-start']">
                    {{ $t('expenses.notes') || 'Notes' }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="expense in expenses.items" :key="expense.id" class="hover:bg-gray-50">
                  <td :class="['px-6 py-4 whitespace-nowrap text-sm text-gray-900', isRTL ? 'text-end' : 'text-start']">
                    {{ formatDate(expense.date) }}
                  </td>
                  <td :class="['px-6 py-4 whitespace-nowrap text-sm', isRTL ? 'text-end' : 'text-start']">
                    <BadgeComponent variant="warning">
                      {{ expense.category || '-' }}
                    </BadgeComponent>
                  </td>
                  <td :class="['px-6 py-4 text-sm text-gray-900', isRTL ? 'text-end' : 'text-start']">
                    {{ expense.description || '-' }}
                  </td>
                  <td :class="['px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600', isRTL ? 'text-end' : 'text-start']">
                    {{ formatCurrency(expense.amount) }}
                  </td>
                  <td :class="['px-6 py-4 text-sm text-gray-500', isRTL ? 'text-end' : 'text-start']">
                    {{ expense.notes || '-' }}
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
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ $t('labels.previous') }}
              </button>
              <span :class="['text-sm text-gray-700 self-center', isRTL ? 'order-2' : '']">
                {{ expenses.page }} / {{ expenses.totalPages }}
              </span>
              <button @click="changePage(expenses.page + 1)"
                :disabled="expenses.page >= expenses.totalPages"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ $t('labels.next') }}
              </button>
            </div>
            <div
              :class="['hidden sm:flex-1 sm:flex sm:items-center sm:justify-between', isRTL ? 'flex-row-reverse' : '']">
              <div>
                <p :class="['text-sm text-gray-700', isRTL ? 'text-end' : 'text-start']">
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
                      class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md">
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clip-rule="evenodd" />
                      </svg>
                    </button>
                    <!-- Next Button (LTR: right) -->
                    <button @click="changePage(expenses.page + 1)"
                      :disabled="expenses.page >= expenses.totalPages"
                      class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md">
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
                      class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md">
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clip-rule="evenodd" />
                      </svg>
                    </button>
                    <!-- Previous Button (RTL: right, visually last) -->
                    <button @click="changePage(expenses.page - 1)" :disabled="expenses.page <= 1"
                      class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md">
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
              <h3 :class="['text-lg font-semibold text-gray-900', isRTL ? 'text-right' : 'text-left']">
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
                <label :class="['block text-sm font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
                  {{ $t('expenses.date') || 'Date' }} <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="expenseForm.date" 
                  type="date" 
                  required
                  :class="['w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', isRTL ? 'text-right' : 'text-left']"
                />
              </div>

              <!-- Category - Column 2 -->
              <div>
                <label :class="['block text-sm font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
                  {{ $t('expenses.category') || 'Category' }} <span class="text-red-500">*</span>
                </label>
                <select 
                  v-model="expenseForm.category" 
                  required
                  :class="['w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', isRTL ? 'text-right' : 'text-left']"
                >
                  <option value="">{{ $t('expenses.category') || 'Category' }}</option>
                  <option value="Travel">{{ $t('expenses.categories.Travel') || 'Travel' }}</option>
                  <option value="Meals">{{ $t('expenses.categories.Meals') || 'Meals' }}</option>
                  <option value="Office">{{ $t('expenses.categories.Office') || 'Office' }}</option>
                  <option value="Equipment">{{ $t('expenses.categories.Equipment') || 'Equipment' }}</option>
                  <option value="Maintenance">{{ $t('expenses.categories.Maintenance') || 'Maintenance' }}</option>
                  <option value="Utilities">{{ $t('expenses.categories.Utilities') || 'Utilities' }}</option>
                  <option value="Marketing">{{ $t('expenses.categories.Marketing') || 'Marketing' }}</option>
                  <option value="Fuel">{{ $t('expenses.categories.Fuel') || 'Fuel' }}</option>
                  <option value="Other">{{ $t('expenses.categories.Other') || 'Other' }}</option>
                </select>
              </div>

              <!-- Description - Full Width -->
              <div class="col-span-1 md:col-span-2">
                <label :class="['block text-sm font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
                  {{ $t('expenses.description') || 'Description' }} <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="expenseForm.description" 
                  type="text" 
                  required
                  :placeholder="$t('expenses.description') || 'Description'"
                  :class="['w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', isRTL ? 'text-right' : 'text-left']"
                />
              </div>

              <!-- Flow Type - Column 1 -->
              <div>
                <label :class="['block text-sm font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
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
                <label :class="['block text-sm font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
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
                <label :class="['block text-sm font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
                  {{ $t('expenses.branch') || 'Branch' }}
                </label>
                <select 
                  v-model.number="expenseForm.branchId" 
                  :class="['w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500', isRTL ? 'text-right' : 'text-left']"
                >
                  <option :value="null">{{ $t('finance.companyWallet') || 'Main Treasury' }}</option>
                  <option v-for="branch in branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
                </select>
              </div>

              <!-- Amount - Column 2 -->
              <div>
                <label :class="['block text-sm font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
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
                <label :class="['block text-sm font-medium text-gray-700 mb-1', isRTL ? 'text-right' : 'text-left']">
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
          <h3 :class="['text-lg font-medium text-gray-900 mb-4', isRTL ? 'text-end' : 'text-start']">
            {{ $t('finance.editBranch') || 'Edit Branch' }}
          </h3>
          <form @submit.prevent="handleEditBranch" :class="['space-y-4', isRTL ? 'text-end' : 'text-start']">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
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
      <div v-if="showTransferModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click.self="closeTransferModal">
        <div
          :class="['relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white', isRTL ? 'text-end' : 'text-start']">
          <div class="mt-3">
            <h3 :class="['text-lg font-medium text-gray-900 mb-4', isRTL ? 'text-end' : 'text-start']">
              {{ !selectedBranch ? $t('finance.transferToBranch') : $t('finance.transferToCompany') }}
            </h3>
            <form @submit.prevent="handleTransfer" :class="['space-y-4', isRTL ? 'text-end' : 'text-start']">
              <div v-if="!selectedBranch">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('finance.selectBranch') }} *
                </label>
                <select v-model.number="transferForm.branchId" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option :value="null">{{ $t('finance.selectBranch') }}</option>
                  <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                    {{ branch.name }}
                  </option>
                </select>
              </div>
              <div v-else class="p-3 bg-indigo-50 rounded-md">
                <p class="text-sm text-indigo-700">
                  {{ $t('finance.transferToCompany') }}: <strong>{{ selectedBranch.name }}</strong> → {{ $t('finance.companyWallet') }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('finance.amount') }} *
                </label>
                <input v-model.number="transferForm.amount" type="number" min="0.01" step="0.01" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('finance.description') }}
                </label>
                <input v-model="transferForm.description" type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ $t('finance.date') }} *
                </label>
                <input v-model="transferForm.date" type="date" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div class="flex justify-end gap-3 pt-4">
                <button type="button" @click="closeTransferModal"
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
                  {{ $t('labels.cancel') }}
                </button>
                <button type="submit" :disabled="processing"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition">
                  {{ processing ? $t('labels.processing') : $t('finance.transfer') }}
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

import { ref, onMounted, computed, nextTick } from 'vue'
import { getBranches, getBranchWalletSummary, getBranchExpenses, getCompanyExpenses, createExpense, saveBranchesOrder, updateBranch, transferFromCompanyToBranch, transferFromBranchToCompany } from '@/api'
import { useCompanyFinanceStore } from '@/stores/useCompanyFinanceStore'
import BadgeComponent from '../shared/Badge.vue'

export default {
  name: 'CompanyFinance',
  components: { BadgeComponent },
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
      settlementDate: null
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
        let res
        if (!selectedBranch.value) {
          // Main company expenses (branchId = NULL)
          res = await getCompanyExpenses({
            page: expenses.value.page,
            pageSize: expenses.value.pageSize
          });
        } else {
          // Branch expenses
          res = await getBranchExpenses(selectedBranch.value.id, {
            page: expenses.value.page,
            pageSize: expenses.value.pageSize
          });
        }
        expenses.value = {
          items: res.data.items || res.data.rows || [],
          total: res.data.total || 0,
          page: res.data.page || expenses.value.page,
          pageSize: res.data.pageSize || expenses.value.pageSize,
          totalPages: Math.ceil((res.data.total || 0) / (res.data.pageSize || expenses.value.pageSize))
        };
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
      transferForm.value = { branchId: null, amount: 0, description: '', date: new Date().toISOString().split('T')[0] }
      showTransferModal.value = true
    }
    const closeTransferModal = () => { showTransferModal.value = false }

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
      if (!selectedBranch.value && !transferForm.value.branchId) {
        if (window.$toast) window.$toast('Please select a branch', 'error')
        return
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
        } else {
          // Transfer from branch to company
          await transferFromBranchToCompany(selectedBranch.value.id, {
            amount: transferForm.value.amount,
            description: transferForm.value.description,
            date: transferForm.value.date
          });
        }
        await fetchSummary()
        // Note: Transfer is for wallet, expenses are separate, so we don't fetch expenses here
        closeTransferModal()
        if (window.$toast) window.$toast('Transfer successful', 'success')
      } catch (error) {
        if (window.$toast) window.$toast(error.response?.data?.message || 'Failed to transfer', 'error')
      } finally { processing.value = false }
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
      expenseForm.value = { 
        date: new Date().toISOString().split('T')[0], 
        category: '', 
        description: '', 
        amount: 0,
        notes: '',
        branchId: selectedBranch.value ? selectedBranch.value.id : null,
        flow: 'OUT',
        settlementDate: null
      }
      showExpenseModal.value = true
    }
    const closeExpenseModal = () => {
      showExpenseModal.value = false
      expenseForm.value = {
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
        amount: 0,
        notes: '',
        branchId: null,
        flow: 'OUT',
        settlementDate: null
      }
    }
    const handleCreateExpense = async () => {
      if (!expenseForm.value.amount || expenseForm.value.amount <= 0) {
        if (window.$toast) window.$toast('Please enter a valid amount', 'error')
        return
      }
      if (!expenseForm.value.category) {
        if (window.$toast) window.$toast('Please select a category', 'error')
        return
      }
      expenseProcessing.value = true
      try {
        const expenseData = {
          date: expenseForm.value.date,
          category: expenseForm.value.category,
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
      await fetchBranches()
      await fetchSummary()
      await fetchExpenses()
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
      // Expose loading and error for template
      loading,
      error,
      showEditBranchModal,
      editBranchProcessing,
      fetchExpenses
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
</style>
