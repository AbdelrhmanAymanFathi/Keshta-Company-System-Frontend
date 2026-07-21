<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">
    <div class="app-page-header flex items-center justify-between rounded-2xl theme-page-header-bar p-3 sm:p-5 shadow-lg shadow-slate-200/50">
      <h2 class="text-2xl font-semibold">{{ $t('dashboard.suppliesList') }}</h2>

      <TableModal
        :showTriggerButton="true"
        :triggerButtonText="$t('dashboard.newSupply') + ' +'"
        triggerButtonClass="theme-button px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm text-xs sm:text-sm"
        @saved="onSupplySaved"
      />
    </div>

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

        

        <!-- Contractor -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.contractor') }}</label>
          <SearchDropdown
            v-model="filters.contractorSearch"
            :items="contractors"
            :allItems="contractors"
            :placeholder="$t('placeholders.searchContractor')"
            inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            @select="(sel) => { filters.contractorId = sel.id; filters.contractorSearch = sel.name }"
          />
        </div>

        <!-- Location -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.location') }}</label>
          <SearchDropdown
            v-model="filters.locationSearch"
            :items="locations"
            :allItems="locations"
            :placeholder="$t('placeholders.searchLocation')"
            inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            @select="(sel) => selectLocation(sel)"
          />
        </div>

        <!-- Area -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.area') }}</label>
          <SearchDropdown
            v-model="filters.areaSearch"
            :items="availableAreas"
            :allItems="availableAreas"
            :placeholder="$t('placeholders.searchArea')"
            inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            @select="(sel) => selectArea(sel)"
          />
        </div>

        <!-- Crusher -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.crusher') }}</label>
          <SearchDropdown
            v-model="filters.crusherSearch"
            :items="crushers"
            :allItems="crushers"
            :placeholder="$t('placeholders.searchCrusher')"
            inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            @select="(sel) => { filters.crusherId = sel.id; filters.crusherSearch = sel.name }"
          />
        </div>

        <!-- Item -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.item') }}</label>
          <SearchDropdown
            v-model="filters.itemSearch"
            :items="items"
            :allItems="items"
            :placeholder="$t('placeholders.searchItem')"
            inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            @select="(sel) => { filters.itemId = sel.id; filters.itemSearch = sel.name }"
          />
        </div>

        <!-- Vehicle -->
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.vehicle') }}</label>
          <SearchDropdown
            v-model="filters.vehicleSearch"
            :items="vehicles"
            :allItems="vehicles"
            :placeholder="$t('placeholders.searchVehicle')"
            :itemLabel="(v) => v.plateNumber || v.name"
            :filterFn="vehicleFilterFn"
            inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            @select="(sel) => { filters.vehicleId = sel.id; filters.vehicleSearch = sel.plateNumber || sel.name }"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <button @click="page = 1; loadSupplies()" :disabled="loading"
          class="px-3 py-1.5 sm:px-4 sm:py-2 theme-button rounded-xl transition-colors disabled:opacity-50 text-xs sm:text-sm font-medium shadow-sm ">
          {{ $t('labels.search') }}
        </button>
        <button @click="clearFilters"
          class="px-3 py-1.5 sm:px-4 sm:py-2 border border-slate-200 bg-white hover:bg-slate-50 theme-text-secondary rounded-xl transition-colors text-xs sm:text-sm font-medium">
          {{ $t('labels.clear') }}
        </button>
      </div>
    </div>

    <!-- table -->
    <div class="overflow-auto rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="theme-table-thead-gradient">
          <tr>
            <th
              class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              #</th>
            <th
              class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.date') }}</th>
            <th
              class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.item') }}</th>
             <th
               class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
               {{ $t('labels.contractor') }}</th>
             <th
               class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
               {{ $t('labels.status') || 'Status' }}</th>
             <th
               class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
               {{ $t('labels.crusher') }}</th>
            <th
              class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.location') }}</th>
            <th
              class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.area') }}</th>
            <th
              class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.vehicle') }}</th>
            <th
              class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.crusherTicket') }}</th>
            <th
              class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.companyTicket') }}</th>
            <th
              class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.companyCapacity') }}</th>
            <th
              class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.crusherCapacity') }}</th>
            <th
              class="px-3 py-2 sm:px-6 sm:py-3 min-w-[160px] text-start text-xs font-semibold theme-text-secondary uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.unitPrice') }}
            </th>
            <th
              class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.discount') }}</th>
            <th
              class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.total') }}</th>

            <th
              class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.notes') }}</th>
            <th
              class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              {{ $t('labels.actions') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="supplies.length > 0" style="display: none;"></tr>
          <tr v-for="(supply, idx) in supplies" :key="`supply-${supply.id}`" class="theme-table-row-hover" @contextmenu.prevent="onRowContextMenu($event, supply)">
            <td class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">{{ (page - 1) * pageSize + idx + 1 }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-accent-muted uppercase tracking-wider whitespace-nowrap">{{ formatDate(supply.date) }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">{{ supply.item?.name || '-' }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-primary uppercase tracking-wider whitespace-nowrap">
              {{ supply.contractor?.name || '-' }}
            </td>
            <td class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium uppercase tracking-wider whitespace-nowrap">
              <span v-if="supply.hasPendingApproval" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 block w-max">
                {{ $t('labels.pendingReview') || 'Pending Review' }}
              </span>
              <span v-else class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-800 border border-green-200 block w-max">
                {{ $t('labels.approved') || 'Approved' }}
              </span>
            </td>
            <td class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">{{ supply.crusher?.name || '-' }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-primary uppercase tracking-wider whitespace-nowrap">{{ supply.location?.name || '-' }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-primary uppercase tracking-wider whitespace-nowrap">{{ getAreaName(supply) }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">{{ supply.vehicle?.name || '-' }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-primary uppercase tracking-wider whitespace-nowrap">{{ supply.crusherTicket || '-' }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">{{ supply.companyTicket || '-' }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-primary uppercase tracking-wider whitespace-nowrap">{{ supply.companyCapacity ?? '-' }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium text-black uppercase tracking-wider whitespace-nowrap">{{ supply.crusherCapacity ?? '-' }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-3 min-w-[160px] text-start text-sm font-semibold theme-accent-muted whitespace-nowrap">{{ formatCurrency(computeUnitPrice(supply)) }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium text-red-600 uppercase tracking-wider whitespace-nowrap">{{ supply.discount ?? '-' }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-primary uppercase tracking-wider whitespace-nowrap">{{ formatCurrency(supply.total) }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-3 text-start text-xs font-medium theme-text-primary tracking-wider">
              <div class="max-w-xs truncate">{{ supply.notes || '-' }}</div>
            </td>

            <td class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap">
              <div class="flex items-center gap-2">
                <!-- Edit Button -->
                <button
                  @click.stop="openEdit(supply)"
                  :disabled="supply.hasPendingApproval"
                  :title="$t('labels.edit') || 'Edit'"
                  class="inline-flex items-center justify-center rounded-lg border theme-border-accent theme-dashboard-bg-soft p-2 theme-text-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <svg class="w-4 h-4 theme-text-secondary transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                <!-- Delete Button -->
                <button
                  @click.stop="openDeleteConfirm(supply)"
                  :disabled="supply.hasPendingApproval"
                  :title="$t('labels.delete')"
                  class="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-100 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <svg class="w-4 h-4 text-rose-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="supplies.length === 0">
            <td class="px-6 py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider whitespace-nowrap" :colspan="18">
              {{ $t('supply.noExportsFound') || 'No exports found' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Payment Modal removed -->
    <!--
    <PaymentModal :visible="showPaymentModal" :parentType="paymentTarget.type" :parentId="paymentTarget.id"
      @saved="handlePaymentSaved" @close="() => { showPaymentModal = false }" />
    -->

    <!-- Supply detail modal removed -->
    <!--
    <SupplyDetailModal :visible="showDetailModal" :exportId="detailExportId" @close="() => { showDetailModal = false; detailExportId = null }" />
    -->


    <Pagination v-if="totalPages > 1" :currentPage="page" :pageSize="pageSize" :total="total" :totalPages="totalPages"
      :pageSizeOptions="[10, 20, 50, 100]" @update:page="(p) => { page = p; loadSupplies() }"
      @update:pageSize="(size) => { pageSize = size; page = 1; loadSupplies() }" />

    <!-- Context menu for row actions -->
    <div v-if="contextMenu.visible" 
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      class="fixed z-50 rounded-2xl theme-card border theme-border-accent shadow-lg shadow-slate-200/60 min-w-56 overflow-hidden"
      @click.stop>
      <div class="divide-y divide-slate-100">
        <!-- Edit Option -->
        <button @click.stop="openEdit(contextMenu.item); closeContextMenu()"
          :disabled="contextMenu.item?.hasPendingApproval"
          class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium theme-text-primary hover:theme-dashboard-bg-soft transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left">
          <svg class="w-5 h-5 flex-shrink-0 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>{{ $t('labels.edit') || 'Edit' }}</span>
          <span v-if="contextMenu.item?.hasPendingApproval" class="text-[11px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full ml-auto">{{ isRTL ? 'قيد المراجعة' : 'Pending' }}</span>
        </button>
        
        <!-- Delete Option -->
        <button @click.stop="openDeleteConfirm(contextMenu.item); closeContextMenu()"
          :disabled="contextMenu.item?.hasPendingApproval"
          class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left">
          <svg class="w-5 h-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>{{ $t('labels.delete') || 'Delete' }}</span>
          <span v-if="contextMenu.item?.hasPendingApproval" class="text-[11px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full ml-auto">{{ isRTL ? 'قيد المراجعة' : 'Pending' }}</span>
        </button>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="deleteConfirmModal.show" class="fixed inset-0 bg-slate-950/20 backdrop-blur-sm flex items-center justify-center z-50" style="margin-top:0;">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 w-full max-w-sm">
        <h3 class="text-lg font-bold mb-3 theme-text-primary">{{ $t('labels.confirmDelete') || 'Confirm Delete' }}</h3>
        <p class="theme-text-secondary mb-6">{{ $t('supply.confirmDeleteExport') || 'Are you sure you want to delete this export?' }}</p>
        <div class="flex justify-end gap-3">
          <button @click="closeDeleteConfirm" class="px-4 py-2 border border-slate-200 rounded-xl theme-text-secondary hover:bg-slate-50">
            {{ $t('labels.cancel') || 'Cancel' }}
          </button>
          <button @click="handleDelete(deleteConfirmModal.id)" :disabled="deleting" class="px-4 py-2 bg-red-600 theme-text-light rounded-xl hover:bg-red-700 disabled:opacity-50">
            {{ deleting ? ($t('labels.deleting') || 'Deleting...') : ($t('labels.delete') || 'Delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-slate-950/45 backdrop-blur-sm" @click="closeModal"></div>
      <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl p-6 z-10 max-h-[90vh] overflow-y-auto" style="margin-top:0;">
        <h3 class="text-lg font-bold mb-4 theme-text-primary">{{ $t('dashboard.suppliesList') }} — {{ $t('labels.edit') }}</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <!-- Date -->
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('labels.date') }}</label>
            <DateField v-model="form.date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>

          <!-- Contractor -->
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('labels.contractor') }}</label>
            <SearchDropdown
              v-model="form.contractorSearch"
              :items="contractors"
              :allItems="contractors"
              placeholder=""
              inputClass="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              @select="(sel) => { form.contractorId = sel.id; form.contractorSearch = sel.name }"
            />
          </div>

          <!-- Location -->
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('labels.location') }}</label>
            <SearchDropdown
              v-model="form.locationSearch"
              :items="locations"
              :allItems="locations"
              placeholder=""
              inputClass="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              @select="(sel) => { form.locationId = sel.id; form.locationSearch = sel.name; form.areaId = ''; form.areaSearch = '' }"
            />
          </div>

          <!-- Area -->
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('labels.area') }}</label>
            <SearchDropdown
              v-model="form.areaSearch"
              :items="availableAreasForEdit"
              :allItems="availableAreasForEdit"
              placeholder=""
              inputClass="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              @select="(sel) => { form.areaId = sel.id; form.areaSearch = sel.name }"
            />
          </div>

          <!-- Crusher -->
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('labels.crusher') }}</label>
            <SearchDropdown
              v-model="form.crusherSearch"
              :items="crushers"
              :allItems="crushers"
              placeholder=""
              inputClass="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              @select="(sel) => { form.crusherId = sel.id; form.crusherSearch = sel.name }"
            />
          </div>

          <!-- Item -->
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('labels.item') }}</label>
            <SearchDropdown
              v-model="form.itemSearch"
              :items="items"
              :allItems="items"
              placeholder=""
              inputClass="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              @select="(sel) => { form.itemId = sel.id; form.itemSearch = sel.name }"
            />
          </div>

          <!-- Vehicle -->
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('labels.vehicle') || 'Vehicle' }}</label>
            <SearchDropdown
              v-model="form.vehicleSearch"
              :items="vehicles"
              :allItems="vehicles"
              :filterFn="vehicleFilterFn"
              placeholder=""
              inputClass="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              @select="(sel) => { form.vehicleId = sel.id; form.vehicleSearch = sel.name }"
            />
          </div>

          <!-- Crusher Ticket -->
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('supply.crusherTicket') || 'Crusher Ticket' }}</label>
            <input v-model="form.crusherTicket" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <!-- Company Ticket -->
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('supply.companyTicket') || 'Company Ticket' }}</label>
            <input v-model="form.companyTicket" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <!-- Company Capacity -->
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('supply.companyCapacity') || 'Company Capacity' }}</label>
            <input v-model.number="form.companyCapacity" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <!-- Crusher Capacity -->
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('supply.crusherCapacity') || 'Crusher Capacity' }}</label>
            <input v-model.number="form.crusherCapacity" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <!-- Unit Price -->
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('supply.unitPrice') || 'Unit Price' }}</label>
            <input v-model.number="form.unitPrice" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <!-- Discount -->
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('labels.discount') || 'Discount' }}</label>
            <input v-model.number="form.discount" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <!-- Notes -->
          <div class="col-span-2">
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('labels.notes') }}</label>
            <textarea v-model="form.notes" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
          </div>
        </div>
        
        <div class="mt-6 flex gap-2 justify-end">
          <button @click="closeModal" class="px-4 py-2 rounded-xl border border-gray-300 text-sm hover:bg-gray-50">{{ $t('labels.cancel') }}</button>
          <button @click="saveEdit" class="px-4 py-2 rounded-xl theme-text-light theme-button text-sm">{{ $t('labels.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDeliveries, deleteDelivery, getContractors, getLocations, getCrushers, getExportItems, getVehicles, updateExport } from '../../../api'
import normalizeItem from '@/utils/normalizeItem'
import TableModal from './SuppliesCreationModal.vue'
import Pagination from '../../shared/Pagination.vue'
import SearchDropdown from '../../shared/SearchDropdown.vue'
import DateField from '@/components/shared/DateField.vue'
// import PaymentModal from '../../shared/PaymentModal.vue'
// import SupplyDetailModal from '../../shared/SupplyDetailModal.vue'
import { buildQueryParams } from '../../../utils/buildQueryParams'
import { matchesVehicleName } from '@/utils/normalizeVehicleName'

export default {
  name: 'SuppliesList',

  components: {
    TableModal,
    Pagination,
    SearchDropdown,
    DateField
    // PaymentModal,
    // SupplyDetailModal
  },

  data() {
    return {
      supplies: [],
      modalOpen: false,
      form: {},
      page: 1,
      pageSize: 20,
      total: 0,
      loading: false,
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        item: null
      },
      contractors: [],
      locations: [],
      crushers: [],
      items: [],
      vehicles: [],
      deleting: false,
      deleteConfirmModal: {
        show: false,
        id: null
      },
      filters: {
        startDate: '',
        endDate: '',
        areaId: '',
        areaSearch: '',
        contractorId: '',
        contractorSearch: '',
        locationId: '',
        locationSearch: '',
        crusherId: '',
        crusherSearch: '',
        itemId: '',
        itemSearch: '',
        vehicleId: '',
        vehicleSearch: ''
      },
      /* payment modal state commented out
      showPaymentModal: false,
      paymentTarget: { type: null, id: null },
      */
      showDetailModal: false,
      detailExportId: null
    }
  },

  watch: {
    /* payment modal watcher commented out
    showPaymentModal(val) {
      // no-op: placeholder if needed
    }
    */
  },

  computed: {
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
    },
    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.page - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    },
    isRTL() {
      return this.$i18n?.locale === 'ar'
    },
    availableAreas() {
      if (!this.filters.locationId) return []
      const selected = this.locations.find(l => l.id === this.filters.locationId)
      if (selected && Array.isArray(selected.children) && selected.children.length) {
        return selected.children
      }
      return this.locations.filter(l => l.parentId === this.filters.locationId)
    },
    availableAreasForEdit() {
      if (!this.form.locationId) return []
      const selected = this.locations.find(l => l.id === this.form.locationId)
      if (selected && Array.isArray(selected.children) && selected.children.length) {
        return selected.children
      }
      return this.locations.filter(l => l.parentId === this.form.locationId)
    },
    
  },

  async mounted() {
    await this.loadFilterData()
    await this.loadSupplies()
    // ensure payments modal data is reactive
    /* paymentTarget watcher commented out
    this.$watch(() => this.paymentTarget, (nv) => {}, { deep: true })
    */
    document.addEventListener('click', this.closeContextMenu)
    document.addEventListener('contextmenu', (e) => {
      // Only close if clicking outside the context menu
      const menu = document.querySelector('[v-if="contextMenu.visible"]')
      if (menu && !menu.contains(e.target)) {
        this.closeContextMenu()
      }
    })
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closeContextMenu)
  },

  methods: {
    vehicleFilterFn(item, query) {
      return matchesVehicleName(item.plateNumber || item.name, query)
    },
    /**
     * Load filter data from API
     */
    async loadFilterData() {
      try {
        const contractorsRes = await getContractors({ pageSize: 1000, mode: 'supply' })
        const contractorsData = contractorsRes.data?.data || contractorsRes.data || []
        this.contractors = Array.isArray(contractorsData) ? contractorsData : []

        const locationsRes = await getLocations()
        const locationsData = locationsRes.data?.data || locationsRes.data || []
        this.locations = Array.isArray(locationsData) ? locationsData : []

        const crushersRes = await getCrushers({ pageSize: 1000 })
        const crushersData = crushersRes.data?.data || crushersRes.data || []
        this.crushers = Array.isArray(crushersData) ? crushersData : []

        const itemsRes = await getExportItems({ mode: 'supply' })
        const itemsData = itemsRes.data?.items || itemsRes.data?.data || itemsRes.data || []
        this.items = Array.isArray(itemsData) ? itemsData.map(normalizeItem) : []

        const vehiclesRes = await getVehicles({ pageSize: 1000 })
        const vehiclesData = vehiclesRes.data?.data || vehiclesRes.data || []
        this.vehicles = Array.isArray(vehiclesData) ? vehiclesData : []

        console.log('✓ Filter data loaded:', {
          contractors: this.contractors.length,
          locations: this.locations.length,
          crushers: this.crushers.length,
          items: this.items.length,
          vehicles: this.vehicles.length
        })
      } catch (err) {
        console.error('✗ Error loading filter data:', err)
      }
    },

    /**
     * Clear all filters
     */
    clearFilters() {
      this.filters = {
        startDate: '',
        endDate: '',
        areaId: '',
        areaSearch: '',
        contractorId: '',
        contractorSearch: '',
        locationId: '',
        locationSearch: '',
        crusherId: '',
        crusherSearch: '',
        itemId: '',
        itemSearch: '',
        vehicleId: '',
        vehicleSearch: ''
      }
      this.page = 1
      this.loadSupplies()
    },

    async loadSupplies() {
      try {
        this.loading = true

        const queryParams = {
          page: this.page,
          pageSize: this.pageSize,
          startDate: this.filters.startDate,
          endDate: this.filters.endDate,
          areaId: this.filters.areaId,
          contractorId: this.filters.contractorId,
          locationId: this.filters.locationId,
          crusherId: this.filters.crusherId,
          itemId: this.filters.itemId,
          vehicleId: this.filters.vehicleId
        }

        const cleanParams = buildQueryParams(queryParams)
        console.log('🔵 Loading supplies with params:', queryParams)
        console.log('🔵 Clean params sent to API:', cleanParams)
        const res = await getDeliveries(cleanParams)

        console.log('Response received:', res)
        console.log('Response data:', res.data)

        // Extract items from response
        const responseData = res.data
        if (responseData && responseData.items && Array.isArray(responseData.items)) {
          // Explicitly create new array and use splice to trigger reactivity
          const newItems = [...responseData.items]
          console.log('📊 New items to load:', newItems)
          console.log('📊 First 3 items:', newItems.slice(0, 3))
          console.log('📊 First item details:', {
            id: newItems[0]?.id,
            date: newItems[0]?.date,
            item: newItems[0]?.item?.name,
            contractor: newItems[0]?.contractor?.name
          })

          // Log comparison with old items
          console.log('🔄 Old supplies count:', this.supplies.length)
          console.log('🔄 New supplies count:', newItems.length)
          if (this.supplies.length > 0) {
            console.log('🔄 Old first item ID:', this.supplies[0].id)
            console.log('🔄 New first item ID:', newItems[0]?.id)
          }

          // Normalize nested `item` objects so templates can rely on canonical fields
          newItems.forEach(s => { if (s && s.item) s.item = normalizeItem(s.item) })
          // In Vue 3, directly assign the array
          this.supplies = newItems

          this.total = responseData.total || newItems.length
          this.pageSize = responseData.pageSize || this.pageSize

          console.log('✓ Supplies updated:', this.supplies.length, 'items')
          console.log('✓ Supplies array is now:', this.supplies)
          console.log('✓ Component supplies data:', this.$data.supplies)
        } else {
          console.warn('⚠ Unexpected response format:', responseData)
          this.supplies = []
          this.total = 0
        }
      } catch (e) {
        console.error('✗ Error loading supplies:', e)
        this.supplies = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    async onSupplySaved() {
      console.log('SUPPLY SAVED EVENT FIRED')
      this.page = 1
      await this.loadSupplies()
    },

    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.page = newPage
        this.loadSupplies()
      }
    },

    onPageSizeChange() {
      this.page = 1
      this.loadSupplies()
    },

    formatNumber(v) {
      return Number(v).toLocaleString(this.isRTL ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 })
    },

    formatCurrency(v) {
      if (v === undefined || v === null || v === '') return '-'
      const n = Number(v)
      if (Number.isNaN(n)) return v
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(n)
    },

    selectLocation(location) {
      this.filters.locationId = location.id
      this.filters.locationSearch = location.name
      this.filters.showLocationDropdown = false
      this.filters.areaId = ''
      this.filters.areaSearch = ''
    },

    selectArea(area) {
      this.filters.areaId = area.id
      this.filters.areaSearch = area.name
      this.filters.showAreaDropdown = false
    },

    getAreaName(supply) {
      if (supply?.area?.name) return supply.area.name
      if (typeof supply?.area === 'string') return supply.area
      const areaId = supply?.areaId || supply?.area?.id
      if (areaId && Array.isArray(supply?.location?.children)) {
        const match = supply.location.children.find(a => a.id === areaId)
        if (match?.name) return match.name
      }
      return '-'
    },

formatDate(dateString) {
  if (!dateString) return '-'
  try {
    return new Intl.DateTimeFormat('en-GB').format(new Date(dateString))
  } catch (e) {
    return dateString
  }
},

    calculateTotal(supply) {
      // Sum totals from exportLines when available, otherwise fallback to top-level fields
      try {
        if (supply && Array.isArray(supply.exportLines) && supply.exportLines.length) {
          return supply.exportLines.reduce((acc, l) => acc + (parseFloat(l.total || 0) || 0), 0)
        }
        const capacity = parseFloat(supply.companyCapacity || supply.crusherCapacity || 0)
        const unitPrice = parseFloat(supply.unitPrice || supply.item?.defaultSupplyPrice || supply.item?.defaultExportPrice || 0)
        const discount = parseFloat(supply.discount || 0)
        return (capacity * unitPrice) - discount
      } catch (e) {
        return 0
      }
    },

    openEdit(supply) {
      this.form = {
        id: supply.id,
        date: supply.date ? supply.date.substring(0, 10) : '',
        itemId: supply.itemId || supply.item?.id || '',
        itemSearch: supply.item?.name || '',
        contractorId: supply.contractorId || supply.contractor?.id || '',
        contractorSearch: supply.contractor?.name || '',
        locationId: supply.locationId || supply.location?.id || '',
        locationSearch: supply.location?.name || '',
        areaId: supply.areaId || supply.area?.id || '',
        areaSearch: this.getAreaName(supply) !== '-' ? this.getAreaName(supply) : '',
        crusherId: supply.crusherId || supply.crusher?.id || '',
        crusherSearch: supply.crusher?.name || '',
        vehicleId: supply.vehicleId || supply.vehicle?.id || '',
        vehicleSearch: supply.vehicle?.name || '',
        crusherTicket: supply.crusherTicket || '',
        companyTicket: supply.companyTicket || '',
        companyCapacity: supply.companyCapacity !== null && supply.companyCapacity !== undefined ? supply.companyCapacity : '',
        crusherCapacity: supply.crusherCapacity !== null && supply.crusherCapacity !== undefined ? supply.crusherCapacity : '',
        unitPrice: supply.unitPrice !== null && supply.unitPrice !== undefined ? supply.unitPrice : '',
        discount: supply.discount !== null && supply.discount !== undefined ? supply.discount : 0,
        notes: supply.notes || ''
      }
      this.modalOpen = true
    },

    closeModal() {
      this.modalOpen = false
    },

    onRowContextMenu(e, item) {
      e.preventDefault()
      this.contextMenu.visible = true
      // position relative to viewport
      this.contextMenu.x = e.clientX
      this.contextMenu.y = e.clientY
      // normalize: if an entry with { supply, line } was passed, store the supply object for actions
      this.contextMenu.item = (item && item.supply) ? item.supply : item
    },

    closeContextMenu() {
      this.contextMenu.visible = false
      this.contextMenu.item = null
    },

    openDetail(id) {
      this.detailExportId = id
      this.showDetailModal = true
    },

    openDeleteConfirm(item) {
      this.deleteConfirmModal = {
        show: true,
        id: item.id
      }
    },

    closeDeleteConfirm() {
      this.deleteConfirmModal = {
        show: false,
        id: null
      }
    },

    confirmDelete(item) {
      const confirmed = confirm(this.$t('supply.confirmDeleteExport') || 'Delete this export?')
      if (confirmed) {
        this.handleDelete(item.id)
      }
    },

    async handleDelete(id) {
      this.deleting = true
      try {
        await deleteDelivery(id)
        // backend may return 204; just reload
        await this.loadSupplies()
        this.closeDeleteConfirm()
      } catch (e) {
        console.error('Failed to delete export', e)
        alert(this.$t('common.deleteError') || 'Failed to delete')
      } finally {
        this.deleting = false
      }
    },

    computeUnitPrice(supply) {
      const p = (supply && (supply.unitPrice !== undefined && supply.unitPrice !== null)) ? Number(supply.unitPrice)
        : (supply?.item?.defaultSupplyPrice !== undefined ? Number(supply.item.defaultSupplyPrice) : (supply?.item?.defaultExportPrice !== undefined ? Number(supply.item.defaultExportPrice) : NaN))
      return Number.isNaN(p) ? 0 : p
    },

    /* payment methods commented out
    openPaymentModal(type, id) {
      this.paymentTarget = { type, id }
      this.showPaymentModal = true
    },
    async handlePaymentSaved(payment) {
      this.showPaymentModal = false
      await this.loadSupplies()
      this.$toast?.success(this.$t('labels.paymentSaved') || 'Payment saved')
    },
    */

    /**
     * Saves the edited supply and closes the modal.
     * If the edited supply already exists in the list, it will be updated.
     * Otherwise, a new supply will be added.
     * TODO: Call the API to save the changes in the backend.
     */
    async saveEdit() {
      try {
        const payload = {
          date: this.form.date,
          itemId: this.form.itemId ? Number(this.form.itemId) : undefined,
          contractorId: this.form.contractorId ? Number(this.form.contractorId) : undefined,
          locationId: this.form.locationId ? Number(this.form.locationId) : undefined,
          areaId: this.form.areaId ? Number(this.form.areaId) : null,
          crusherId: this.form.crusherId ? Number(this.form.crusherId) : undefined,
          vehicleId: this.form.vehicleId ? Number(this.form.vehicleId) : null,
          crusherTicket: this.form.crusherTicket || undefined,
          companyTicket: this.form.companyTicket || undefined,
          companyCapacity: this.form.companyCapacity !== '' ? Number(this.form.companyCapacity) : undefined,
          crusherCapacity: this.form.crusherCapacity !== '' ? Number(this.form.crusherCapacity) : undefined,
          unitPrice: this.form.unitPrice !== '' ? Number(this.form.unitPrice) : undefined,
          discount: this.form.discount !== '' ? Number(this.form.discount) : 0,
          notes: this.form.notes || ''
        }
        await updateExport(this.form.id, payload)
        this.$toast?.success(this.isRTL ? 'تم حفظ التعديل وإرساله للمراجعة بنجاح' : 'Edit request submitted for approval successfully')
        this.closeModal()
        await this.loadSupplies()
      } catch (e) {
        console.error(e)
        this.$toast?.error(e.response?.data?.message || e.message || 'Error updating supply')
      }
    }
  }
}
</script>

<style scoped>
.clickable-row { cursor: pointer; }
</style>
