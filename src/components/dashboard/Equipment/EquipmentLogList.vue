<template>
    <div class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">
    <!-- Header with Search, Filter and Add Button -->
    <div class="flex flex-col gap-4">
      <div class="app-page-header flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center rounded-2xl theme-page-header-bar p-5 shadow-lg shadow-slate-200/50">
        <div class="flex-1 w-full sm:w-auto">
          <h2 class="text-2xl font-semibold mb-6 text-gray-800">{{ $t('equipmentLog.list') }}</h2>
          <!-- Search bar removed -->
        </div>

        <div class="flex gap-2">
          <button @click="openAddModal"
            class="theme-button px-4 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap shadow-sm ">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            {{ $t('equipmentLog.addEntry') }}
          </button>

          <!-- <button @click="$emit('navigate-report')"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition whitespace-nowrap">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4v12m0 0l-3-3m3 3l3-3M5 20h14" />
            </svg>
            {{ $t('equipmentLog.report') }}
          </button> -->
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-lg shadow-slate-200/40">
        <h4 class="text-sm font-semibold text-gray-700 mb-3">{{ $t('equipmentLog.filters') || 'Filters' }}</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.startDate') }}</label>
            <DateField v-model="filters.startDate" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.endDate') }}</label>
            <DateField v-model="filters.endDate" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('equipmentLog.equipment') }}</label>
            <SearchDropdown v-model="filters.equipmentSearch" :items="equipments" :allItems="equipments" :placeholder="$t('placeholders.searchEquipment')" inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" @select="(sel) => { filters.equipmentId = sel.id; filters.equipmentSearch = sel.name }" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.driver') }}</label>
            <SearchDropdown v-model="filters.driverSearch" :items="drivers" :allItems="drivers" :placeholder="$t('placeholders.searchDriver')" inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" @select="(sel) => { filters.driverId = sel.id; filters.driverSearch = sel.name }" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.location') }}</label>
            <SearchDropdown v-model="filters.locationSearch" :items="topLocations" :allItems="topLocations" :placeholder="$t('placeholders.searchLocation')" inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" @select="(sel) => { filters.locationId = sel.id; filters.locationSearch = sel.name; filters.areaId = ''; filters.areaSearch = '' }" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">{{ $t('labels.area') }}</label>
            <SearchDropdown v-model="filters.areaSearch" :items="availableAreas" :allItems="availableAreas" :placeholder="$t('placeholders.searchArea')" inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" @select="(sel) => { filters.areaId = sel.id; filters.areaSearch = sel.name }" />
          </div>

          <div class="flex gap-2 items-center">
            <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button @click="setCompanyOwnedFilter(null)" :class="['px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap flex-1 sm:flex-none', localIsCompanyOwned === null ? 'theme-button shadow-sm ' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200']">{{ $t('equipmentLog.all') }}</button>
              <button @click="setCompanyOwnedFilter(true)" :class="['px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap flex-1 sm:flex-none', localIsCompanyOwned === true ? 'theme-dashboard-bg-soft0 text-white shadow-sm ' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200']">{{ $t('equipmentLog.companyOwned') }}</button>
              <button @click="setCompanyOwnedFilter(false)" :class="['px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap flex-1 sm:flex-none', localIsCompanyOwned === false ? 'bg-slate-600 text-white shadow-sm shadow-slate-200' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200']">{{ $t('equipmentLog.external') }}</button>
            </div>
          </div>

          <div class="col-span-full flex gap-2">
            <button @click="applyFilters" class="px-4 py-2 theme-button rounded-xl text-sm shadow-sm ">{{ $t('labels.search') }}</button>
            <button @click="clearFilters" class="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm">{{ $t('labels.clear') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <!-- <div class="bg-gray-50 rounded-lg p-4">
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
          <select :value="equipmentLogsStore.pageSize" @change="onPageSizeChange"
            class="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none theme-input-focus">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div> -->

    <!-- Loading State -->
    <div v-if="equipmentLogsStore.loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 theme-border-accent"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="equipmentLogsStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="text-red-800">{{ equipmentLogsStore.error }}</span>
      </div>
    </div>

    <!-- Rentals Table -->
    <!-- Rentals Table -->
    <div v-else class="bg-white rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/40 overflow-hidden">
      <!-- No Results Message -->
      <div v-if="equipmentLogsStore.items.length === 0" class="text-center py-12">
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
          <svg class="w-6 h-6 theme-text opacity-60 opacity-60 animate-pulse" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              :d="isRTL ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'"></path>
          </svg>
        </div>

        <!-- Table Container with keyboard focus -->
        <div ref="tableContainer"
          class="overflow-x-auto scroll-smooth focus:outline-none theme-input-focus focus:ring-inset rounded-xl"
          tabindex="0" @keydown="handleTableKeydown" :title="$t('equipmentLog.useArrowKeys')">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="theme-table-thead-gradient" :class="{ 'direction-rtl': isRTL }">
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
                  {{ $t('labels.location') || 'Location' }}
                </th>
                
                <th
                  class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  :class="{ 'text-right': isRTL }">
                  {{ $t('labels.area') || 'Area' }}
                </th>
                <th
                  class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  :class="{ 'text-right': isRTL }">
                  {{ $t('labels.contractor') || 'Contractor' }}
                </th>
                <th
                  class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  :class="{ 'text-right': isRTL }">
                  {{ $t('labels.driver') || 'Driver' }}
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
                  {{ $t('labels.discount') || 'Discount' }}
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
              <tr v-for="rental in filteredItems" :key="rental.id" class="theme-table-row-hover"
                @contextmenu.prevent="openContextMenu($event, rental)">
                <td class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
                  {{ formatDate(rental.date) }}
                </td>
                <td class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
                  {{ rental.equipment.name }}
                </td>
                <td class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
                  <div class="truncate max-w-xs">{{ rental.location?.name || '-' }}</div>
                </td>
                
                <td class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
                  <div class="truncate max-w-xs">{{ rental.area?.name || '-' }}</div>
                </td>
                <td class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
                  <div class="truncate max-w-xs">{{ rental.contractor?.name || rental.contractorName || rental.equipment?.contractor?.name || rental.equipment?.contractorName || '-' }}</div>
                </td>
                <td class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
                  <div class="truncate max-w-xs">{{ rental.driver?.name || rental.driverName || rental.driverLabel || '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge :variant="!rental.isRental ? 'company' : 'external'">
                    {{ !rental.isRental ? $t('equipmentLog.companyOwned') : $t('equipmentLog.external') }}
                  </Badge>
                </td>
                <td class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
                  {{ rental.hours }}
                </td>
                <td class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
                  {{ formatCurrency(rental.hourlyRate) }}
                </td>
                <td class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
                  {{ formatCurrency(rental.discount || 0) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {{ formatCurrency(rental.total ?? Math.max(0, (Number(rental.hours || 0) * Number(rental.hourlyRate || 0)) - Number(rental.discount || 0))) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {{ rental.notes || rental.note || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex gap-3 items-center">
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
          <svg class="w-6 h-6 theme-text opacity-60 opacity-60 animate-pulse" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              :d="isRTL ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'"></path>
          </svg>
        </div>
      </div>

      <!-- Enhanced Pagination -->
      <div v-if="equipmentLogsStore.totalPages > 1"
        class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <!-- Mobile Pagination -->
        <div class="flex-1 flex justify-between sm:hidden">
          <button @click="changePage(equipmentLogsStore.page - 1)" :disabled="equipmentLogsStore.page <= 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ $t('labels.previous') }}
          </button>
          <span class="text-sm text-gray-700 self-center">
            {{ equipmentLogsStore.page }} / {{ equipmentLogsStore.totalPages }}
          </span>
          <button @click="changePage(equipmentLogsStore.page + 1)" :disabled="equipmentLogsStore.page >= equipmentLogsStore.totalPages"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ $t('labels.next') }}
          </button>
        </div>

        <!-- Desktop Pagination -->
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <p class="text-sm text-gray-700">
              {{ $t('labels.showing') }}
              <span class="font-medium">{{ ((equipmentLogsStore.page - 1) * equipmentLogsStore.pageSize) + 1 }}</span>
              {{ $t('labels.to') }}
              <span class="font-medium">{{ Math.min(equipmentLogsStore.page * equipmentLogsStore.pageSize, equipmentLogsStore.total)
                }}</span>
              {{ $t('labels.of') }}
              <span class="font-medium">{{ equipmentLogsStore.total }}</span>
              {{ $t('labels.results') }}
            </p>
          </div>

          <!-- Page Numbers -->
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button @click="changePage(1)" :disabled="equipmentLogsStore.page <= 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                    clip-rule="evenodd" />
                </svg>
              </button>

              <button @click="changePage(equipmentLogsStore.page - 1)" :disabled="equipmentLogsStore.page <= 1"
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
                  page === equipmentLogsStore.page
                    ? 'z-10 theme-dashboard-bg-soft theme-pagination-active'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                ]">
                  {{ page }}
                </button>
              </template>

              <button @click="changePage(equipmentLogsStore.page + 1)"
                :disabled="equipmentLogsStore.page >= equipmentLogsStore.totalPages"
                class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd" />
                </svg>
              </button>

              <button @click="changePage(equipmentLogsStore.totalPages)"
                :disabled="equipmentLogsStore.page >= equipmentLogsStore.totalPages"
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
        :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }" @click.stop
        @contextmenu.prevent>
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
                <DateField v-model="payoutForm.date" class="border border-gray-300 rounded px-3 py-2 text-sm" />
                <input v-model="payoutForm.notes" type="text" placeholder="Notes (optional)"
                  class="border border-gray-300 rounded px-3 py-2 text-sm" />
              </div>
              <button @click="savePayout" :disabled="!payoutForm.amount || equipmentLogsStore.payoutsLoading"
                class="mt-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm">
                {{ equipmentLogsStore.payoutsLoading ? $t('labels.saving') : $t('labels.add') }}
              </button>
            </div>

            <!-- Payouts List -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('equipmentLog.payoutsList') }}</h4>
              <div v-if="equipmentLogsStore.payouts.length === 0" class="text-center py-4 text-gray-500">
                {{ $t('equipmentLog.noPayouts') }}
              </div>
              <div v-else class="space-y-2">
                <div v-for="payout in equipmentLogsStore.payouts" :key="payout.id"
                  class="flex items-center justify-between bg-gray-50 p-3 rounded border">
                  <div>
                    <div class="text-sm font-medium">{{ formatCurrency(payout.amount) }}</div>
                    <div class="text-xs text-gray-500">{{ formatDate(payout.date) }}</div>
                    <div v-if="payout.notes" class="text-xs text-gray-600">{{ payout.notes }}</div>
                  </div>
                  <button @click="deletePayout(payout.id)" :disabled="equipmentLogsStore.payoutsLoading"
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
import { useEquipmentLogsStore } from '@/stores/useEquipmentLogsStore'
import EquipmentLogDetail from './EquipmentLogDetail.vue'
import Badge from '../../shared/Badge.vue'
import ConfirmDialog from '../../shared/ConfirmDialog.vue'
import { getEquipments, createEquipmentLog, updateEquipmentLog, deleteEquipmentLog, getDrivers, getLocations } from '@/api'
import EquipmentLogCreationModal from './EquipmentLogCreationModal.vue'
import SearchDropdown from '../../shared/SearchDropdown.vue'
import DateField from '../../shared/DateField.vue'
import { formatToISODate, getTodayISO } from '@/utils/dateUtils'

export default {
  name: 'EquipmentLogList',
  components: { EquipmentLogDetail, Badge, ConfirmDialog, EquipmentLogCreationModal, SearchDropdown, DateField },
  setup() {
    const instance = getCurrentInstance()
    const equipmentLogsStore = useEquipmentLogsStore()
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
      date: getTodayISO(),
      equipmentLog: '',
      name: '',
      hourlyRate: 0,
      notes: '',
      isCompanyOwned: true
    })
    const equipments = ref([])
    const locations = ref([])
    const topLocations = ref([])
    const loadEquipments = async () => {
      try {
        const res = await getEquipments()
        const payload = res.data || {}
        equipments.value = Array.isArray(payload.items) ? payload.items : (Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []))
      } catch (e) {
        equipments.value = []
      }
    }

    // Local UI filters (copied from SuppliesList pattern, adapted for equipment logs)
    const filters = ref({
      startDate: '',
      endDate: '',
      equipmentId: '',
      equipmentSearch: '',
      driverId: '',
      driverSearch: '',
      locationId: '',
      locationSearch: '',
      areaId: '',
      areaSearch: ''
    })

    // Local client-side ownership filter (keeps UI state). Initialize from
    // server `isRental` filter if present (server uses `isRental`: true => external)
    const localIsCompanyOwned = ref(
      (typeof equipmentLogsStore.filters.isRental !== 'undefined' && equipmentLogsStore.filters.isRental !== null)
        ? !equipmentLogsStore.filters.isRental
        : (equipmentLogsStore.filters.isCompanyOwned ?? null)
    )

    const applyFilters = () => {
      // Try to infer selected IDs from typed search values when the user didn't select
      if ((!filters.value.equipmentId || filters.value.equipmentId === '') && filters.value.equipmentSearch) {
        const match = equipments.value.find(e => String(e.id) === String(filters.value.equipmentSearch) || (e.name && e.name.toLowerCase() === String(filters.value.equipmentSearch).toLowerCase()))
        if (match) filters.value.equipmentId = match.id
      }
      if ((!filters.value.driverId || filters.value.driverId === '') && filters.value.driverSearch) {
        const match = drivers.value.find(d => String(d.id) === String(filters.value.driverSearch) || (d.name && d.name.toLowerCase() === String(filters.value.driverSearch).toLowerCase()))
        if (match) filters.value.driverId = match.id
      }
      if ((!filters.value.locationId || filters.value.locationId === '') && filters.value.locationSearch) {
        const match = topLocations.value.find(l => String(l.id) === String(filters.value.locationSearch) || (l.name && l.name.toLowerCase() === String(filters.value.locationSearch).toLowerCase()))
        if (match) filters.value.locationId = match.id
      }
      if ((!filters.value.areaId || filters.value.areaId === '') && filters.value.areaSearch && filters.value.locationId) {
        const match = availableAreas.value.find(a => String(a.id) === String(filters.value.areaSearch) || (a.name && a.name.toLowerCase() === String(filters.value.areaSearch).toLowerCase()))
        if (match) filters.value.areaId = match.id
      }

      // copy local filters into the store and refresh
      try { console.log('[component] applyFilters local filters BEFORE copy:', JSON.parse(JSON.stringify(filters.value))) } catch(e) { console.log('[component] applyFilters local filters BEFORE copy:', filters.value) }
      equipmentLogsStore.filters.startDate = filters.value.startDate || ''
      equipmentLogsStore.filters.endDate = filters.value.endDate || ''
      equipmentLogsStore.filters.equipmentId = filters.value.equipmentId || ''
      equipmentLogsStore.filters.driverId = filters.value.driverId || ''
      equipmentLogsStore.filters.locationId = filters.value.locationId || ''
      equipmentLogsStore.filters.areaId = filters.value.areaId || ''
      try { console.log('[component] applyFilters store filters AFTER copy:', JSON.parse(JSON.stringify(equipmentLogsStore.filters))) } catch(e) { console.log('[component] applyFilters store filters AFTER copy:', equipmentLogsStore.filters) }
      equipmentLogsStore.setPage(1)
      if (typeof equipmentLogsStore.fetchRentals === 'function') equipmentLogsStore.fetchRentals()
    }

    const clearFilters = () => {
      filters.value = {
        startDate: '', endDate: '', equipmentId: '', equipmentSearch: '', driverId: '', driverSearch: '', locationId: '', locationSearch: '', areaId: '', areaSearch: ''
      }
      // reset local ownership filter as well
      localIsCompanyOwned.value = null
      // clear server-side ownership filter as well
      equipmentLogsStore.filters.isRental = null
      applyFilters()
    }

    const loadLocations = async () => {
      try {
        const res = await getLocations()
        const all = Array.isArray(res.data) ? res.data : []
        locations.value = all
        topLocations.value = all.filter(l => !l.parentId)
      } catch (e) {
        locations.value = []
        topLocations.value = []
      }
    }

    const availableAreas = computed(() => {
      if (!filters.value.locationId) return []
      const selected = locations.value.find(l => l.id === filters.value.locationId)
      if (selected && Array.isArray(selected.children) && selected.children.length) return selected.children
      return locations.value.filter(l => l.parentId === filters.value.locationId)
    })

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
      const current = equipmentLogsStore.page
      const total = equipmentLogsStore.totalPages
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
      const filter = localIsCompanyOwned.value
      if (filter === null || filter === undefined) return equipmentLogsStore.items

      return equipmentLogsStore.items.filter(item => {
        if (!item) return false

        // Primary source of truth: log-level isRental
        // (this is also what the table badge uses: !isRental => company-owned).
        if (Object.prototype.hasOwnProperty.call(item, 'isRental')) {
          const v = item.isRental
          let isRental = false
          if (typeof v === 'boolean') isRental = v
          else if (typeof v === 'number') isRental = v === 1
          else if (typeof v === 'string') {
            const s = v.toLowerCase()
            isRental = (s === 'true' || s === '1' || s === 'yes' || s === 'y')
          } else {
            isRental = Boolean(v)
          }
          return (!isRental) === filter
        }

        // Prefer explicit nested equipment ownership flag: equipment.isCompanyOwned
        const equipment = item.equipment || (item.equipmentLog && item.equipmentLog.equipment) || null

        if (equipment && Object.prototype.hasOwnProperty.call(equipment, 'isCompanyOwned')) {
          const val = equipment.isCompanyOwned
          if (typeof val === 'boolean') return val === filter
          if (typeof val === 'string') {
            const s = val.toLowerCase()
            if (s === 'true' || s === '1') return filter === true
            if (s === 'false' || s === '0') return filter === false
          }
          if (typeof val === 'number') return (val === 1) === filter
          return Boolean(val) === Boolean(filter)
        }

        // If equipment has contractorId: null => company-owned
        if (equipment && Object.prototype.hasOwnProperty.call(equipment, 'contractorId')) {
          const cid = equipment.contractorId
          const isCompany = cid === null || cid === undefined
          return isCompany === filter
        }

        // Fall back to top-level isCompanyOwned if present
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

        // Fallbacks: check a set of descriptive fields on both item and equipment
        const candidates = [item.ownerType, item.type, item.rentalType, item.owner, item.ownership,
          equipment && equipment.ownerType, equipment && equipment.owner, equipment && equipment.ownership]
        for (const c of candidates) {
          if (c === null || typeof c === 'undefined') continue
          const s = String(c).toLowerCase()
          if (s.includes('company') || s.includes('owned') || s === 'company') return filter === true
          if (s.includes('external') || s.includes('third') || s.includes('vendor') || s === 'external') return filter === false
          if (s === '1' || s === 'true') return filter === true
          if (s === '0' || s === 'false') return filter === false
        }

        // Default: exclude when a filter is applied and no info available
        return false
      })
    })

    // Debug: log ownership filter changes and filtered count
    try {
      watch(localIsCompanyOwned, (v) => {
        try { console.log('[component] localIsCompanyOwned changed:', v, 'filtered length:', filteredItems.value.length) } catch(e) { void 0 }
      })
    } catch (e) { void 0 }

    // Calculate total sum of all visible filtered items
    const resolveRentalTotal = (item) => {
      if (item && Object.prototype.hasOwnProperty.call(item, 'total')) {
        const backendTotal = parseFloat(String(item?.total || 0).replace(/,/g, ''))
        if (!Number.isNaN(backendTotal)) return backendTotal
      }
      const hours = Number(item?.hours || 0)
      const hourlyRate = Number(item?.hourlyRate || 0)
      const discount = Number(item?.discount || 0)
      return Math.max(0, (hours * hourlyRate) - discount)
    }

    const totalSum = computed(() => {
      return filteredItems.value.reduce((sum, item) => {
        return sum + resolveRentalTotal(item)
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
        equipmentLogsStore.setSearchQuery(event.target.value)
      }, 500)
    }

    const clearSearch = () => {
      // update filter only; watcher will fetch results
      equipmentLogsStore.setSearchQuery('')
    }

    const setCompanyOwnedFilter = (value) => {
      try { console.log('[component] setCompanyOwnedFilter called, value:', value, 'current:', localIsCompanyOwned.value) } catch(e) { void 0 }
      // update local UI state
      localIsCompanyOwned.value = value

      // Map to server filter `isRental`: companyOwned(true) -> isRental=false, external(false) -> isRental=true
      let isRentalValue = null
      if (value === true) isRentalValue = false
      else if (value === false) isRentalValue = true
      else isRentalValue = null

      // update store and reset to first page; watcher will trigger fetch
      equipmentLogsStore.filters.isRental = isRentalValue
      equipmentLogsStore.setPage(1)

      try { console.log('[component] setCompanyOwnedFilter updated localIsCompanyOwned to:', localIsCompanyOwned.value, 'and equipmentLogsStore.filters.isRental to:', equipmentLogsStore.filters.isRental) } catch(e) { void 0 }
    }

    const changePage = (page) => {
      if (page >= 1 && page <= equipmentLogsStore.totalPages) {
        equipmentLogsStore.setPage(page)
        equipmentLogsStore.fetchRentals()
      }
    }

    const onPageSizeChange = (event) => {
      equipmentLogsStore.setPageSize(parseInt(event.target.value))
      equipmentLogsStore.fetchRentals()
    }

    const openAddModal = () => {
      isEditing.value = false
      form.value = {
        id: null,
        date: new Date().toISOString().split('T')[0],
        equipmentLog: '',
        name: '',
        hourlyRate: 0,
        discount: 0,
        notes: '',
        isCompanyOwned: true
      }
      showModal.value = true
    }

    const openEditModal = async (rental) => {
      isEditing.value = true
      try {
        // Fetch latest rental from API/store to ensure we have full/clean data
        const data = await equipmentLogsStore.fetchRental(rental.id)
          form.value = {
            id: data.id,
            date: data.date ? formatToISODate(data.date) : getTodayISO(),
            equipmentLog: data.equipmentLog || data.equipment || '',
            name: data.name || '',
            hourlyRate: parseFloat(data.hourlyRate) || 0,
            discount: parseFloat(data.discount) || 0,
            notes: data.note ?? data.notes ?? '',
            isCompanyOwned: data.isCompanyOwned !== undefined ? data.isCompanyOwned : true
          }
      } catch (error) {
        console.error('Failed to load rental for edit:', error)
        // Fallback to given object
        form.value = {
          id: rental.id,
          date: rental.date ? formatToISODate(rental.date) : getTodayISO(),
          equipmentLog: rental.equipmentLog || rental.equipment || '',
          name: rental.name || '',
          hourlyRate: parseFloat(rental.hourlyRate) || 0,
          discount: parseFloat(rental.discount) || 0,
          notes: rental.note ?? rental.notes ?? '',
          isCompanyOwned: rental.isCompanyOwned !== undefined ? rental.isCompanyOwned : true
        }
      }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
        form.value = {
          id: null,
          date: getTodayISO(),
          equipmentLog: '',
          name: '',
          hourlyRate: 0,
          discount: 0,
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
              date: row.date || rentalData.date,
              equipmentId: rentalData.equipmentId,
              driverId: row.driverId != null ? row.driverId : (rentalData.driverId != null ? rentalData.driverId : null),
              total: row.total != null ? row.total : Number(Math.max(0, ((row.hours || 0) * (row.hourlyRate != null ? row.hourlyRate : rentalData.hourlyRate || 0)) - (row.discount != null ? row.discount : (rentalData.discount || 0))).toFixed(2)),
              hours: row.hours != null ? row.hours : (rentalData.hours || 0),
              hourlyRate: row.hourlyRate != null ? row.hourlyRate : (rentalData.hourlyRate || 0),
              discount: row.discount != null ? row.discount : (rentalData.discount || 0),
              note: row.note ?? rentalData.note ?? rentalData.notes ?? '',
              isRental: rentalData.isRental !== undefined ? rentalData.isRental : false,
              ...(rentalData.locationId != null && rentalData.locationId !== '' ? { locationId: rentalData.locationId } : {}),
              ...(rentalData.areaId != null && rentalData.areaId !== '' ? { areaId: rentalData.areaId } : {})
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
            total: rentalData.total != null ? rentalData.total : Number(Math.max(0, (Number(rentalData.hours || 0) * Number(rentalData.hourlyRate || 0)) - Number(rentalData.discount || 0)).toFixed(2)),
            hours: rentalData.hours,
            hourlyRate: rentalData.hourlyRate,
            discount: rentalData.discount || 0,
            note: rentalData.note ?? rentalData.notes ?? '',
            isRental: rentalData.isRental !== undefined ? rentalData.isRental : false,
            ...(rentalData.locationId != null && rentalData.locationId !== '' ? { locationId: rentalData.locationId } : {}),
            ...(rentalData.areaId != null && rentalData.areaId !== '' ? { areaId: rentalData.areaId } : {})
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
        if (typeof equipmentLogsStore.fetchRentals === 'function') equipmentLogsStore.fetchRentals()
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
        if (typeof equipmentLogsStore.fetchRentals === 'function') equipmentLogsStore.fetchRentals()
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
        await equipmentLogsStore.fetchRentalPayouts(rental.id)
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
        await equipmentLogsStore.createRentalPayout(selectedRentalForPayouts.value.id, {
          amount: parseFloat(payoutForm.value.amount),
          date: payoutForm.value.date,
          notes: payoutForm.value.notes
        })
        // Refresh rental to get updated paid/remaining values
        await equipmentLogsStore.fetchRental(selectedRentalForPayouts.value.id)
        await equipmentLogsStore.fetchRentals()
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
        const result = await equipmentLogsStore.deleteRentalPayout(selectedRentalForPayouts.value.id, payoutId)
        // Refresh rental to get updated paid/remaining values
        await equipmentLogsStore.fetchRental(selectedRentalForPayouts.value.id)
        await equipmentLogsStore.fetchRentals()
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

      // Open exactly at the mouse pointer.
      contextMenu.value.x = event.clientX
      contextMenu.value.y = event.clientY
      contextMenu.value.open = true

      // Fine-tune position after menu is rendered using actual dimensions
      nextTick(() => {
        if (contextMenuElement.value) {
          const viewportWidth = window.innerWidth
          const viewportHeight = window.innerHeight
          const rect = contextMenuElement.value.getBoundingClientRect()
          const actualWidth = rect.width
          const actualHeight = rect.height

          let newX = contextMenu.value.x
          let newY = contextMenu.value.y
          let needsAdjustment = false

          // Clamp to viewport only when needed.
          if (newX + actualWidth > viewportWidth) {
            newX = Math.max(10, viewportWidth - actualWidth - 10)
            needsAdjustment = true
          } else if (newX < 10) {
            newX = 10
            needsAdjustment = true
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

      if (action === 'delete') {
        confirmDelete(rental)
      }
    }

    // Watch only the specific filter properties we care about and reload.
    // Watching the entire filters object with deep: true could re-run when
    // unrelated reactive changes occur; this can lead to recursive updates
    // if fetchRentals (or other actions) indirectly change reactive state.
    watch(
      () => [equipmentLogsStore.filters.q, equipmentLogsStore.filters.isRental],
      () => {
        equipmentLogsStore.fetchRentals()
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
      equipmentLogsStore.fetchRentals()
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
      loadLocations()
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
      equipmentLogsStore,
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
      drivers,
      locations, topLocations, availableAreas,
      filters,
      applyFilters,
      clearFilters,
      localIsCompanyOwned
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
