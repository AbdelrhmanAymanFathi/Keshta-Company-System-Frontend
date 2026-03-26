<template>
  <div class="space-y-6">
    <!-- Header with Search, Filter and Add Button -->
    <div class="flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div class="flex-1 w-full sm:w-auto">
          <h2 class="text-2xl font-semibold mb-6 text-gray-800">{{ $t('equipmentLog.list') }}</h2>
          <!-- Search Bar -->
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input :value="rentalsStore.filters.q" @input="onSearchInput" type="text"
              :placeholder="$t('equipmentLog.searchPlaceholder')"
              class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
            <div v-if="rentalsStore.filters.q" class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button @click="clearSearch" class="text-gray-400 hover:text-gray-600" aria-label="Clear search">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ $t('equipmentLog.searchBy') }}</p>
        </div>

        <div class="flex gap-2">
          <button @click="openAddModal"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition whitespace-nowrap">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            {{ $t('equipmentLog.addEntry') }}
          </button>

          <button @click="$emit('navigate-report')"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition whitespace-nowrap">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4v12m0 0l-3-3m3 3l3-3M5 20h14" />
            </svg>
            {{ $t('equipmentLog.report') }}
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="flex flex-wrap items-center gap-3 bg-gray-50 rounded-lg p-3">
        <span class="text-sm font-medium text-gray-700">{{ $t('equipmentLog.filterBy') }}:</span>
        <div class="flex gap-2">
          <button @click="setCompanyOwnedFilter(null)" :class="[
            'px-3 py-1 rounded-md text-sm font-medium transition',
            rentalsStore.filters.isCompanyOwned === null
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          ]">
            {{ $t('equipmentLog.all') }}
          </button>
          <button @click="setCompanyOwnedFilter(true)" :class="[
            'px-3 py-1 rounded-md text-sm font-medium transition',
            rentalsStore.filters.isCompanyOwned === true
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          ]">
            {{ $t('equipmentLog.companyOwned') }}
          </button>
          <button @click="setCompanyOwnedFilter(false)" :class="[
            'px-3 py-1 rounded-md text-sm font-medium transition',
            rentalsStore.filters.isCompanyOwned === false
              ? 'bg-gray-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          ]">
            {{ $t('equipmentLog.external') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="bg-gray-50 rounded-lg p-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="flex flex-col gap-2 text-sm text-gray-600">
          <div>
            {{ $t('equipmentLog.totalCount') }}: <span class="font-semibold">{{ filteredItems.length }}</span>
          </div>
          <div>
            {{ $t('equipmentLog.totalSum') }}: <span class="font-semibold">{{ formatCurrency(totalSum) }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <label>{{ $t('equipmentLog.pageSize') }}:</label>
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
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="text-red-800">{{ rentalsStore.error }}</span>
      </div>
    </div>

    <!-- Rentals Table -->
    <!-- Rentals Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <!-- No Results Message -->
      <div v-if="rentalsStore.items.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4">
          </path>
        </svg>
        <p class="mt-4 text-lg text-gray-500">{{ $t('equipmentLog.noResults') }}</p>
      </div>

      <!-- Table with Scroll Controls -->
      <div v-else class="relative">
        <!-- Left Scroll Arrow - Visual indicator only -->
        <div v-if="showLeftScroll" class="absolute top-1/2 -translate-y-1/2 z-10 pointer-events-none"
          :class="isRTL ? 'right-0' : 'left-0'">
          <svg class="w-6 h-6 text-indigo-400 opacity-60 animate-pulse" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              :d="isRTL ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'"></path>
          </svg>
        </div>

        <!-- Table Container with keyboard focus -->
        <div ref="tableContainer"
          class="overflow-x-auto scroll-smooth focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset rounded"
          tabindex="0" @keydown="handleTableKeydown" :title="$t('equipmentLog.useArrowKeys')">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50" :class="{ 'direction-rtl': isRTL }">
              <tr>
                <th
                  class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  :class="{ 'text-right': isRTL }">
                  {{ $t('equipmentLog.date') }}
                </th>
                <th
                  class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  :class="{ 'text-right': isRTL }">
                  {{ $t('equipmentLog.equipment') }}
                </th>
                <th
                  class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  :class="{ 'text-right': isRTL }">
                  {{ $t('equipmentLog.type') }}
                </th>
                <th
                  class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  :class="{ 'text-right': isRTL }">
                  {{ $t('equipmentLog.hours') }}
                </th>
                <th
                  class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  :class="{ 'text-right': isRTL }">
                  {{ $t('equipmentLog.hourlyRate') }}
                </th>
                <th
                  class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  :class="{ 'text-right': isRTL }">
                  {{ $t('equipmentLog.total') }}
                </th>
                <th
                  class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {{ $t('equipmentLog.notes') }}
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('labels.actions') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="rental in filteredItems" :key="rental.id" class="hover:bg-gray-50"
                @contextmenu.prevent="openContextMenu($event, rental)">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(rental.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ rental.equipment.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge :variant="!rental.isRental ? 'company' : 'external'">
                    {{ !rental.isRental ? $t('equipmentLog.companyOwned') : $t('equipmentLog.external') }}
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
                  {{ rental.note || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex gap-3 items-center">
                    <!-- <button @click="openDetailModal(rental)"
                      class="text-blue-600 hover:text-blue-900 transition font-medium text-xs sm:text-sm whitespace-nowrap">
                      {{ $t('equipmentLog.viewDetails') }}
                    </button>
                    <button @click="openPayoutsModal(rental)"
                      class="text-green-600 hover:text-green-900 transition font-medium text-xs sm:text-sm whitespace-nowrap">
                      {{ $t('equipmentLog.payouts') }}
                    </button> -->
                    <!-- <button @click="openEditModal(rental)"
                      class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      :title="$t('labels.edit')">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                        </path>
                      </svg>
                    </button> -->
                    <button @click="confirmDelete(rental)"
                      class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      :title="$t('labels.delete')">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                        </path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Right Scroll Arrow - Visual indicator only -->
        <div v-if="showRightScroll" class="absolute top-1/2 -translate-y-1/2 z-10 pointer-events-none"
          :class="isRTL ? 'left-0' : 'right-0'">
          <svg class="w-6 h-6 text-indigo-400 opacity-60 animate-pulse" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              :d="isRTL ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'"></path>
          </svg>
        </div>
      </div>

      <!-- Enhanced Pagination -->
      <div v-if="rentalsStore.totalPages > 1"
        class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <!-- Mobile Pagination -->
        <div class="flex-1 flex justify-between sm:hidden">
          <button @click="changePage(rentalsStore.page - 1)" :disabled="rentalsStore.page <= 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ $t('labels.previous') }}
          </button>
          <span class="text-sm text-gray-700 self-center">
            {{ rentalsStore.page }} / {{ rentalsStore.totalPages }}
          </span>
          <button @click="changePage(rentalsStore.page + 1)" :disabled="rentalsStore.page >= rentalsStore.totalPages"
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
              <span class="font-medium">{{ Math.min(rentalsStore.page * rentalsStore.pageSize, rentalsStore.total)
                }}</span>
              {{ $t('labels.of') }}
              <span class="font-medium">{{ rentalsStore.total }}</span>
              {{ $t('labels.results') }}
            </p>
          </div>

          <!-- Page Numbers -->
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button @click="changePage(1)" :disabled="rentalsStore.page <= 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                    clip-rule="evenodd" />
                </svg>
              </button>

              <button @click="changePage(rentalsStore.page - 1)" :disabled="rentalsStore.page <= 1"
                class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clip-rule="evenodd" />
                </svg>
              </button>

              <template v-for="page in visiblePages" :key="page">
                <button @click="changePage(page)" :class="[
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
                  <path fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd" />
                </svg>
              </button>

              <button @click="changePage(rentalsStore.totalPages)"
                :disabled="rentalsStore.page >= rentalsStore.totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414zm6 0a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal (uses EquipmentLogCreationModal) -->
      <EquipmentLogCreationModal
        :isOpen="showModal"
        :modalTitle="isEditing ? $t('equipmentLog.editEntry') : $t('equipmentLog.addEntry')"
        :equipments="equipments"
        :drivers="drivers"
        :modelValue="form"
        :loading="saving"
        :isEditing="isEditing"
        @close="closeModal"
        @saved="saveRental"
      />

      <!-- Delete Confirmation Modal -->
      <ConfirmDialog :show="showDeleteModal" :title="$t('equipmentLog.deleteEntry')" :message="$t('equipmentLog.deleteConfirmation')"
        :loading="deleting" type="danger" :prevent-backdrop-close="true" @confirm="deleteRental"
        @cancel="showDeleteModal = false" />

      <!-- Rental Detail Modal -->
      <div v-if="showDetailModal && selectedRentalForDetail"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
        style="margin-top: 0%;" @click.self="closeDetailModal">
        <div class="relative bg-white rounded-md shadow-lg border w-full max-w-4xl max-h-[90vh] overflow-y-auto p-5">
          <EquipmentLogDetail :rental-id="selectedRentalForDetail.id" @close="closeDetailModal" />
        </div>
      </div>

      <!-- Context Menu -->
      <div v-if="contextMenu.open" ref="contextMenuElement"
        class="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[180px]"
        :style="{ top: contextMenu.y + 'px', [isRTL ? 'right' : 'left']: contextMenu.x + 'px' }" @click.stop
        @contextmenu.prevent>
        <button @click="handleContextMenuAction('viewDetails')"
          class="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
          :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z">
            </path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
            </path>
          </svg>
          {{ $t('equipmentLog.viewDetails') }}
        </button>
        <button @click="handleContextMenuAction('payouts')"
          class="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
          :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'">
          <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
            </path>
          </svg>
          {{ $t('equipmentLog.payouts') }}
        </button>
        <button @click="handleContextMenuAction('edit')"
          class="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
          :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'">
          <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
            </path>
          </svg>
          {{ $t('labels.edit') }}
        </button>
        <div class="border-t border-gray-200 my-1"></div>
        <button @click="handleContextMenuAction('delete')"
          class="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
          :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
            </path>
          </svg>
          {{ $t('labels.delete') }}
        </button>
      </div>

      <!-- Payouts Modal -->
      <div v-if="showPayoutsModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
        style="margin-top: 0%;" @click.self="triggerPayoutsShake">
        <div
          class="relative bg-white rounded-md shadow-lg border w-full max-w-2xl max-h-[90vh] overflow-y-auto payouts-modal-inner"
          :class="{ 'animate-shake': showPayoutsShake }" tabindex="-1">
          <div class="sticky top-0 bg-white border-b p-5 flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">
              {{ $t('equipmentLog.payouts') }} - {{ selectedRentalForPayouts?.name }}
            </h3>
            <button @click="closePayoutsModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div class="p-5 space-y-6">
            <!-- Add Payout Form -->
            <div class="pb-6 border-b">
              <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('equipmentLog.addPayout') }}</h4>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input v-model="payoutForm.amount" type="number" placeholder="Amount"
                  class="border border-gray-300 rounded px-3 py-2 text-sm" />
                <input v-model="payoutForm.date" type="date" class="border border-gray-300 rounded px-3 py-2 text-sm" />
                <input v-model="payoutForm.notes" type="text" placeholder="Notes (optional)"
                  class="border border-gray-300 rounded px-3 py-2 text-sm" />
              </div>
              <button @click="savePayout" :disabled="!payoutForm.amount || rentalsStore.payoutsLoading"
                class="mt-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm">
                {{ rentalsStore.payoutsLoading ? $t('labels.saving') : $t('labels.add') }}
              </button>
            </div>

            <!-- Payouts List -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('equipmentLog.payoutsList') }}</h4>
              <div v-if="rentalsStore.payouts.length === 0" class="text-center py-4 text-gray-500">
                {{ $t('equipmentLog.noPayouts') }}
              </div>
              <div v-else class="space-y-2">
                <div v-for="payout in rentalsStore.payouts" :key="payout.id"
                  class="flex items-center justify-between bg-gray-50 p-3 rounded border">
                  <div>
                    <div class="text-sm font-medium">{{ formatCurrency(payout.amount) }}</div>
                    <div class="text-xs text-gray-500">{{ formatDate(payout.date) }}</div>
                    <div v-if="payout.notes" class="text-xs text-gray-600">{{ payout.notes }}</div>
                  </div>
                  <button @click="deletePayout(payout.id)" :disabled="rentalsStore.payoutsLoading"
                    class="text-red-600 hover:text-red-900 text-sm">
                    {{ $t('labels.delete') }}
                  </button>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-2 border-t pt-6">
              <button @click="closePayoutsModal"
                class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                {{ $t('labels.close') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, getCurrentInstance, nextTick } from 'vue'
import { useRentalsStore } from '@/stores/useRentalsStore'
import EquipmentLogForm from './EquipmentLogForm.vue'
import EquipmentLogDetail from './EquipmentLogDetail.vue'
import Badge from '../../shared/Badge.vue'
import ConfirmDialog from '../../shared/ConfirmDialog.vue'
import { getEquipments, createEquipmentLog, updateEquipmentLog, deleteEquipmentLog, getDrivers } from '@/api'
import EquipmentLogCreationModal from './EquipmentLogCreationModal.vue'

export default {
  name: 'EquipmentLogList',
  components: { EquipmentLogForm, EquipmentLogDetail, Badge, ConfirmDialog },
    components: { EquipmentLogForm, EquipmentLogDetail, Badge, ConfirmDialog, EquipmentLogCreationModal },
  setup() {
    const instance = getCurrentInstance()
    const rentalsStore = useRentalsStore()
    const showModal = ref(false)
    const showDeleteModal = ref(false)
    const isEditing = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const rentalToDelete = ref(null)
    const searchTimeout = ref(null)
    const tableContainer = ref(null)
    const contextMenuElement = ref(null)
    const showLeftScroll = ref(false)
    const showRightScroll = ref(false)
    const canScrollLeft = ref(false)
    const canScrollRight = ref(false)

    const form = ref({
      id: null,
      date: new Date().toISOString().split('T')[0],
      equipmentLog: '',
      name: '',
      hourlyRate: 0,
      notes: '',
      isCompanyOwned: true
    })
    const equipments = ref([])

    const loadEquipments = async () => {
      try {
        const res = await getEquipments()
        const payload = res.data || {}
        equipments.value = Array.isArray(payload.items) ? payload.items : (Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []))
      } catch (e) {
        equipments.value = []
      }
    }

    const showDetailModal = ref(false)
    const selectedRentalForDetail = ref(null)
    const drivers = ref([])

        const loadDrivers = async () => {
          try {
            const res = await getDrivers({ page: 1, pageSize: 1000 })
            const payload = res.data || {}
            drivers.value = Array.isArray(payload.items) ? payload.items : (Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []))
          } catch (e) {
            drivers.value = []
          }
        }
    const showPayoutsModal = ref(false)
    const showModalShake = ref(false)
    const showPayoutsShake = ref(false)
    const selectedRentalForPayouts = ref(null)
    const payoutForm = ref({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    })
    const contextMenu = ref({
      open: false,
      x: 0,
      y: 0,
      rental: null
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

    // Client-side filtered items based on ownership filter
    const filteredItems = computed(() => {
      const filter = rentalsStore.filters.isCompanyOwned
      if (filter === null || filter === undefined) return rentalsStore.items
      return rentalsStore.items.filter(item => {
        // Primary: explicit boolean field
        if (Object.prototype.hasOwnProperty.call(item, 'isCompanyOwned')) {
          const val = item.isCompanyOwned
          if (typeof val === 'boolean') return val === filter
          if (typeof val === 'string') {
            const s = val.toLowerCase()
            if (s === 'true' || s === '1') return filter === true
            if (s === 'false' || s === '0') return filter === false
          }
          if (typeof val === 'number') return (val === 1) === filter
          return Boolean(val) === Boolean(filter)
        }
        // Fallbacks: some APIs use different fields
        const candidates = [item.ownerType, item.type, item.rentalType, item.owner, item.ownership]
        for (const c of candidates) {
          if (!c && c !== 0) continue  // Skip if null/undefined but allow 0
          const s = String(c).toLowerCase()
          if (s.includes('company') || s.includes('owned') || s === 'company') {
            return filter === true
          }
          if (s.includes('external') || s.includes('third') || s.includes('vendor') || s === 'external') {
            return filter === false
          }
          if (s === '1' || s === 'true') return filter === true
          if (s === '0' || s === 'false') return filter === false
        }
        // Default: if no matching field found, EXCLUDE when a filter is applied
        return false
      })
    })

    // Calculate total sum of all visible filtered items
    const totalSum = computed(() => {
      return filteredItems.value.reduce((sum, item) => {
        const itemTotal = parseFloat(String(item.total || 0).replace(/,/g, '')) || 0
        return sum + itemTotal
      }, 0)
    })

    const isRTL = computed(() => {
      return instance && instance.proxy && instance.proxy.$i18n && instance.proxy.$i18n.locale === 'ar'
    })

    // Short helper for i18n inside setup
    const t = (key, ...args) => {
      try {
        return instance.proxy.$t(key, ...args)
      } catch (e) {
        return key
      }
    }

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
        equipmentLog: '',
        name: '',
        hourlyRate: 0,
        notes: '',
        isCompanyOwned: true
      }
      showModal.value = true
    }

    const openEditModal = async (rental) => {
      isEditing.value = true
      try {
        // Fetch latest rental from API/store to ensure we have full/clean data
        const data = await rentalsStore.fetchRental(rental.id)
        form.value = {
          id: data.id,
          date: data.date ? data.date.split('T')[0] : new Date().toISOString().split('T')[0],
          equipmentLog: data.equipmentLog || data.equipment || '',
          name: data.name || '',
          hourlyRate: parseFloat(data.hourlyRate) || 0,
          notes: data.notes || '',
          isCompanyOwned: data.isCompanyOwned !== undefined ? data.isCompanyOwned : true
        }
      } catch (error) {
        console.error('Failed to load rental for edit:', error)
        // Fallback to given object
        form.value = {
          id: rental.id,
          date: rental.date ? rental.date.split('T')[0] : new Date().toISOString().split('T')[0],
          equipmentLog: rental.equipmentLog || rental.equipment || '',
          name: rental.name || '',
          hourlyRate: parseFloat(rental.hourlyRate) || 0,
          notes: rental.notes || '',
          isCompanyOwned: rental.isCompanyOwned !== undefined ? rental.isCompanyOwned : true
        }
      }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      form.value = {
        id: null,
        date: new Date().toISOString().split('T')[0],
        equipmentLog: '',
        name: '',
        hourlyRate: 0,
        notes: '',
        isCompanyOwned: true
      }
    }

    // updateForm removed — RentalForm no longer emits update:model-value

    const saveRental = async (rentalData) => {
      // Persist this entry as an equipment-log using the new API
      saving.value = true
      try {
        // If rows are provided (multi-row creation), create one entry per row
        if (!isEditing.value && rentalData.rows && Array.isArray(rentalData.rows) && rentalData.rows.length) {
          const creates = rentalData.rows.map(row => {
            const payloadRow = {
              date: rentalData.date,
              equipmentId: rentalData.equipmentId,
              driverId: row.driverId != null ? row.driverId : (rentalData.driverId != null ? rentalData.driverId : null),
              total: row.total != null ? row.total : Number(((row.hours || 0) * (row.hourlyRate != null ? row.hourlyRate : rentalData.hourlyRate || 0)).toFixed(2)),
              hours: row.hours != null ? row.hours : (rentalData.hours || 0),
              hourlyRate: row.hourlyRate != null ? row.hourlyRate : (rentalData.hourlyRate || 0),
              note: row.notes || rentalData.notes || '',
              isRental: rentalData.isRental !== undefined ? rentalData.isRental : false
            }
            return createEquipmentLog(payloadRow)
          })
          await Promise.all(creates)
          if (window.$toast) window.$toast('Equipment logs created successfully', 'success')
        } else {
          const payload = {
            date: rentalData.date,
            equipmentId: rentalData.equipmentId,
            driverId: rentalData.driverId,
            total: rentalData.total,
            hours: rentalData.hours,
            hourlyRate: rentalData.hourlyRate,
            note: rentalData.notes || rentalData.note || '',
            isRental: rentalData.isRental !== undefined ? rentalData.isRental : false
          }

          if (isEditing.value && form.value && form.value.id) {
            await updateEquipmentLog(form.value.id, payload)
            if (window.$toast) window.$toast('Equipment log updated successfully', 'success')
          } else {
            await createEquipmentLog(payload)
            if (window.$toast) window.$toast('Equipment log created successfully', 'success')
          }
        }

        closeModal()
        // Refresh store listing if available
        if (typeof rentalsStore.fetchRentals === 'function') rentalsStore.fetchRentals()
      } catch (error) {
        console.error('Error saving equipment log:', error)
        if (window.$toast) {
          const msg = error.response?.data?.message || (Array.isArray(error.response?.data?.issues) ? error.response.data.issues.map(i => i.message).join('; ') : 'Failed to save equipment log')
          window.$toast(msg, 'error')
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
        if (!rentalToDelete.value) return
        await deleteEquipmentLog(rentalToDelete.value.id)
        showDeleteModal.value = false
        rentalToDelete.value = null
        if (window.$toast) window.$toast(t('equipmentLog.deletedSuccessfully') || 'Equipment log deleted', 'success')
        if (typeof rentalsStore.fetchRentals === 'function') rentalsStore.fetchRentals()
      } catch (error) {
        console.error('Error deleting equipment log:', error)
        if (window.$toast) {
          window.$toast(error.response?.data?.message || 'Failed to delete equipment log', 'error')
        }
      } finally {
        deleting.value = false
      }
    }
    const formatDate = (dateString) => {
      if (!dateString) return '-'

      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString

      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date)
    }


    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 2
      }).format(amount)
    }

    const openDetailModal = (rental) => {
      selectedRentalForDetail.value = rental
      showDetailModal.value = true
    }

    const closeDetailModal = () => {
      showDetailModal.value = false
      selectedRentalForDetail.value = null
    }

    const openPayoutsModal = async (rental) => {
      selectedRentalForPayouts.value = rental
      showPayoutsModal.value = true
      try {
        await rentalsStore.fetchRentalPayouts(rental.id)
      } catch (error) {
        console.error('Failed to load payouts:', error)
        if (window.$toast) {
          window.$toast('Failed to load payouts', 'error')
        }
      }
    }

    const triggerModalShake = () => {
      if (showModalShake.value) return
      showModalShake.value = true
      setTimeout(() => {
        showModalShake.value = false
        // try to return focus to inner modal
        if (tableContainer.value && tableContainer.value.querySelector) {
          const modalEl = document.querySelector('.rental-modal-inner')
          if (modalEl && typeof modalEl.focus === 'function') modalEl.focus()
        }
      }, 500)
    }

    const triggerPayoutsShake = () => {
      if (showPayoutsShake.value) return
      showPayoutsShake.value = true
      setTimeout(() => {
        showPayoutsShake.value = false
        const modalEl = document.querySelector('.payouts-modal-inner')
        if (modalEl && typeof modalEl.focus === 'function') modalEl.focus()
      }, 500)
    }

    const closePayoutsModal = () => {
      showPayoutsModal.value = false
      selectedRentalForPayouts.value = null
      payoutForm.value = {
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      }
    }

    const savePayout = async () => {
      if (!payoutForm.value.amount || payoutForm.value.amount <= 0) {
        if (window.$toast) {
          window.$toast('Please enter a valid amount', 'error')
        }
        return
      }

      try {
        await rentalsStore.createRentalPayout(selectedRentalForPayouts.value.id, {
          amount: parseFloat(payoutForm.value.amount),
          date: payoutForm.value.date,
          notes: payoutForm.value.notes
        })
        // Refresh rental to get updated paid/remaining values
        await rentalsStore.fetchRental(selectedRentalForPayouts.value.id)
        await rentalsStore.fetchRentals()
        if (window.$toast) {
          window.$toast('Payout created successfully', 'success')
        }
        payoutForm.value = {
          amount: '',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        }
      } catch (error) {
        console.error('Error creating payout:', error)
        if (window.$toast) {
          window.$toast(error.response?.data?.message || 'Failed to create payout', 'error')
        }
      }
    }

    const deletePayout = async (payoutId) => {
      try {
        const result = await rentalsStore.deleteRentalPayout(selectedRentalForPayouts.value.id, payoutId)
        // Refresh rental to get updated paid/remaining values
        await rentalsStore.fetchRental(selectedRentalForPayouts.value.id)
        await rentalsStore.fetchRentals()
        if (window.$toast) {
          if (result && result.alreadyDeleted) {
            window.$toast(t('rental.payoutAlreadyDeleted'), 'info')
          } else {
            window.$toast(t('rental.payoutDeletedSuccessfully'), 'success')
          }
        }
      } catch (error) {
        console.error('Error deleting payout:', error)
        if (window.$toast) {
          window.$toast(error.response?.data?.message || 'Failed to delete payout', 'error')
        }
      }
    }

    const openContextMenu = (event, rental) => {
      event.stopPropagation()
      contextMenu.value.rental = rental

      // Get viewport dimensions
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Approximate menu dimensions
      const menuWidth = 180
      const menuHeight = 220

      let x, y

      // Calculate horizontal position
      if (isRTL.value) {
        // For RTL, we use 'right' positioning
        // event.clientX is distance from left, we need distance from right
        const rightPos = viewportWidth - event.clientX

        // Check if menu would overflow to the left
        if (rightPos + menuWidth > viewportWidth) {
          // Menu would overflow, position it from the right edge
          x = viewportWidth - menuWidth - 10
        } else {
          // Use the click position (convert to right positioning)
          x = viewportWidth - event.clientX
        }

        // Ensure minimum distance from edges
        if (x < 10) x = 10
        if (x > viewportWidth - menuWidth - 10) x = viewportWidth - menuWidth - 10
      } else {
        // For LTR, we use 'left' positioning
        x = event.clientX

        // Check if menu would overflow to the right
        if (x + menuWidth > viewportWidth) {
          x = viewportWidth - menuWidth - 10
        }

        // Ensure minimum distance from edges
        if (x < 10) x = 10
      }

      // Calculate vertical position
      y = event.clientY

      // Check if menu would overflow bottom
      if (y + menuHeight > viewportHeight) {
        // Show menu above the click point
        y = Math.max(10, event.clientY - menuHeight - 5)
      } else if (y < 0) {
        y = 10
      }

      contextMenu.value.x = x
      contextMenu.value.y = y
      contextMenu.value.open = true

      // Fine-tune position after menu is rendered using actual dimensions
      nextTick(() => {
        if (contextMenuElement.value) {
          const rect = contextMenuElement.value.getBoundingClientRect()
          const actualWidth = rect.width
          const actualHeight = rect.height

          let newX = contextMenu.value.x
          let newY = contextMenu.value.y
          let needsAdjustment = false

          // Horizontal adjustment
          if (isRTL.value) {
            // For RTL, check right positioning
            if (newX + actualWidth > viewportWidth) {
              newX = Math.max(10, viewportWidth - actualWidth - 10)
              needsAdjustment = true
            } else if (newX < 10) {
              newX = 10
              needsAdjustment = true
            }
          } else {
            // For LTR, check left positioning
            if (newX + actualWidth > viewportWidth) {
              newX = Math.max(10, viewportWidth - actualWidth - 10)
              needsAdjustment = true
            } else if (newX < 10) {
              newX = 10
              needsAdjustment = true
            }
          }

          // Vertical adjustment
          if (newY + actualHeight > viewportHeight) {
            newY = Math.max(10, event.clientY - actualHeight - 5)
            needsAdjustment = true
          } else if (newY < 10) {
            newY = 10
            needsAdjustment = true
          }

          if (needsAdjustment) {
            contextMenu.value.x = newX
            contextMenu.value.y = newY
          }
        }
      })
    }

    const closeContextMenu = () => {
      contextMenu.value.open = false
    }

    const handleContextMenuAction = (action) => {
      if (!contextMenu.value.rental) return

      const rental = contextMenu.value.rental
      closeContextMenu()

      switch (action) {
        case 'viewDetails':
          openDetailModal(rental)
          break
        case 'payouts':
          openPayoutsModal(rental)
          break
        case 'edit':
          openEditModal(rental)
          break
        case 'delete':
          confirmDelete(rental)
          break
      }
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

    const updateTableScrollVisibility = () => {
      if (!tableContainer.value) return
      const container = tableContainer.value
      const hasHorizontalScroll = container.scrollWidth > container.clientWidth

      if (isRTL.value) {
        // In RTL, scrollLeft behavior is inverted
        // When scrollLeft is 0, we're at the rightmost position (start in RTL)
        // When scrollLeft is max, we're at the leftmost position (end in RTL)
        const maxScroll = container.scrollWidth - container.clientWidth
        showLeftScroll.value = hasHorizontalScroll && container.scrollLeft < maxScroll - 10
        showRightScroll.value = hasHorizontalScroll && container.scrollLeft > 10
        canScrollLeft.value = container.scrollLeft < maxScroll - 10
        canScrollRight.value = container.scrollLeft > 10
      } else {
        // In LTR, normal behavior
        showLeftScroll.value = hasHorizontalScroll && container.scrollLeft > 10
        showRightScroll.value = hasHorizontalScroll && container.scrollLeft < (container.scrollWidth - container.clientWidth - 10)
        canScrollLeft.value = container.scrollLeft > 0
        canScrollRight.value = container.scrollLeft < (container.scrollWidth - container.clientWidth - 10)
      }
    }

    const scrollTableLeft = () => {
      if (tableContainer.value) {
        tableContainer.value.scrollBy({
          left: isRTL.value ? 300 : -300,
          behavior: 'smooth'
        })
        setTimeout(updateTableScrollVisibility, 100)
      }
    }

    const scrollTableRight = () => {
      if (tableContainer.value) {
        tableContainer.value.scrollBy({
          left: isRTL.value ? -300 : 300,
          behavior: 'smooth'
        })
        setTimeout(updateTableScrollVisibility, 100)
      }
    }

    const handleTableKeydown = (event) => {
      if (!tableContainer.value) return

      // Left arrow or A key
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        event.preventDefault()
        tableContainer.value.scrollBy({
          left: isRTL.value ? 100 : -100,
          behavior: 'smooth'
        })
        setTimeout(updateTableScrollVisibility, 50)
      }

      // Right arrow or D key
      if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        event.preventDefault()
        tableContainer.value.scrollBy({
          left: isRTL.value ? -100 : 100,
          behavior: 'smooth'
        })
        setTimeout(updateTableScrollVisibility, 50)
      }
    }

    onMounted(() => {
      rentalsStore.fetchRentals()
      updateTableScrollVisibility()
      window.addEventListener('resize', updateTableScrollVisibility)
      document.addEventListener('click', closeContextMenu)
      if (tableContainer.value) {
        tableContainer.value.addEventListener('scroll', updateTableScrollVisibility)
        tableContainer.value.addEventListener('keydown', handleTableKeydown)
        // Make table focusable
        tableContainer.value.setAttribute('tabindex', '0')
      }
      loadEquipments()
      loadDrivers()
    })

    onUnmounted(() => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }
      window.removeEventListener('resize', updateTableScrollVisibility)
      document.removeEventListener('click', closeContextMenu)
      if (tableContainer.value) {
        tableContainer.value.removeEventListener('scroll', updateTableScrollVisibility)
        tableContainer.value.removeEventListener('keydown', handleTableKeydown)
      }
      loadDrivers()
    })

    return {
      rentalsStore,
      showModal,
      showDetailModal,
      selectedRentalForDetail,
      showDeleteModal,
      showPayoutsModal,
      selectedRentalForPayouts,
      payoutForm,
      isEditing,
      saving,
      deleting,
      form,
      visiblePages,
      filteredItems,
      totalSum,
      isRTL,
      tableContainer,
      showLeftScroll,
      showRightScroll,
      canScrollLeft,
      canScrollRight,
      scrollTableLeft,
      scrollTableRight,
      handleTableKeydown,
      onSearchInput,
      clearSearch,
      setCompanyOwnedFilter,
      changePage,
      onPageSizeChange,
      openAddModal,
      openEditModal,
      openDetailModal,
      closeDetailModal,
      saveRental,
      closeModal,
      openPayoutsModal,
      closePayoutsModal,
      showModalShake,
      showPayoutsShake,
      triggerModalShake,
      triggerPayoutsShake,
      savePayout,
      deletePayout,
      confirmDelete,
      deleteRental,
      formatDate,
      formatCurrency,
      openContextMenu,
      closeContextMenu,
      handleContextMenuAction,
      contextMenu,
      equipments,
      drivers
    }
  }
}
</script>

<style scoped>
/* shake animation (shared with Transport component) */
@keyframes shake {
  0% {
    transform: translateX(0);
  }

  10% {
    transform: translateX(-8px);
  }

  20% {
    transform: translateX(8px);
  }

  30% {
    transform: translateX(-6px);
  }

  40% {
    transform: translateX(6px);
  }

  50% {
    transform: translateX(-4px);
  }

  60% {
    transform: translateX(4px);
  }

  70% {
    transform: translateX(-2px);
  }

  80% {
    transform: translateX(2px);
  }

  90% {
    transform: translateX(-1px);
  }

  100% {
    transform: translateX(0);
  }
}

.animate-shake {
  animation: shake 0.5s ease;
  will-change: transform;
}
</style>
