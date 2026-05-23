<template>
  <!-- Button to open the Modal (you can remove or change it depending on the page) -->
  <button v-if="showTriggerButton" @click="openModal"
    class="theme-button px-6 py-3 rounded-lg  font-medium shadow-md transition">
    {{ triggerText }}
  </button>

  <!-- Modal -->
  <teleport to="body">
    <transition name="kc-modal">
      <div v-if="isOpen" class="fixed inset-0 bg-black/60 flex items-center justify-center z-80 p-4 overflow-hidden"
        :dir="isRTL ? 'rtl' : 'ltr'" @click.self="closeModal">
        <div class="kc-modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] max-h-[95vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 class="text-2xl font-bold theme-heading">
            {{ currentStep === 1 ? modalTitleComputed : ($t('labels.enterSupplies') || 'إدخال التوريدات') }}
          </h2>
          <button @click="closeModal"
            class="theme-text-muted hover:theme-text-primary text-3xl leading-none focus:outline-none">
            ×
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 modal-body-container relative">

          <!-- ============================================ STEP 1 ============================================ -->
          <div v-if="currentStep === 1" class="w-full">
            <h3 class="text-lg font-bold mb-8 text-center theme-text-primary">
              {{ $t('labels.step1BasicData') }}
            </h3>

            <div class="max-w-6xl mx-auto">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <!-- Date -->
                <div>
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                    {{ $t('labels.date') }} <span class="text-red-600">*</span>
                  </label>
                  <div class="relative">
                    <CalendarDaysIcon
                      class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                    <DateField v-model="commonData.date" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 ps-11 pe-4 text-sm theme-input-focus transition" />
                  </div>
                </div>

                <!-- Item (صنف) -->
                <div>
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                    {{ $t('labels.item') }} <span class="text-red-600">*</span>
                  </label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <SearchDropdown v-model="filters.commonItemSearch" :items="exportItems" :allItems="exportItems"
                        :placeholder="$t('labels.item')"
                        :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                        @select="(sel) => { commonData.item = sel; filters.commonItemSearch = sel.name; onCommonItemSelect() }">
                        <template #prefix>
                          <ArchiveBoxIcon
                            class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                        </template>
                        <template #afterOptions>
                          <div @click="showAddExportItemDialog = true" style="color: #10b981;"
                            class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100">
                            + {{ $t('labels.addNew') }}
                          </div>
                        </template>
                      </SearchDropdown>
                    </div>
                  </div>
                </div>

                <!-- Price (السعر) -->
                <div>
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                    {{ $t('labels.price') }} <span class="text-red-600">*</span>
                  </label>
                  <div class="relative">
                    <CurrencyDollarIcon
                      class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                    <input type="number" v-model.number="commonData.price" step="0.01"
                      class="w-full border border-gray-300 rounded-lg px-4 py-2.5 ps-11 pe-4 text-sm theme-input-focus transition" />
                  </div>
                </div>

                <!-- Site (الموقع) -->
                <div>
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                    {{ $t('labels.site') }} <span class="text-red-600">*</span>
                  </label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <SearchDropdown v-model="filters.commonSiteSearch" :items="sites" :allItems="sites"
                        :placeholder="$t('labels.site')"
                        :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                        @select="(sel) => { commonData.site = sel; filters.commonSiteSearch = sel.name; onCommonSiteChange() }">
                        <template #prefix>
                          <MapPinIcon
                            class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                        </template>
                        <template #afterOptions>
                          <div @click="showAddSite = true; pendingRow = null" style="color: #10b981;"
                            class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100">
                            + {{ $t('supply.addNewSite') }}
                          </div>
                        </template>
                      </SearchDropdown>
                    </div>
                  </div>
                </div>

                <!-- Area (المنطقة) -->
                <div>
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                    {{ $t('labels.area') }}
                  </label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <SearchDropdown v-model="filters.commonAreaSearch" :items="commonAvailableAreas"
                        :allItems="commonAvailableAreas" :placeholder="$t('labels.area')" :disabled="!commonData.site"
                        :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm disabled:bg-gray-100 disabled:cursor-not-allowed'"
                        @select="(sel) => { commonData.area = sel; filters.commonAreaSearch = sel.name }">
                        <template #prefix>
                          <MapIcon
                            class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                        </template>
                        <template #afterOptions>
                          <div v-if="commonData.site" @click="showAddArea = true; pendingRow = null"
                            style="color: #10b981;"
                            class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100">
                            + {{ $t('supply.addNewArea') }}
                          </div>
                        </template>
                      </SearchDropdown>
                    </div>
                  </div>
                </div>

                <!-- Contractor (المقاول) -->
                <div>
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                    {{ $t('labels.contractor') }} <span class="text-red-600">*</span>
                  </label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <SearchDropdown v-model="filters.commonContractorSearch" :items="contractors"
                        :allItems="contractors" :placeholder="$t('labels.contractor')"
                        :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                        @select="(sel) => { commonData.contractor = sel; filters.commonContractorSearch = sel.name; onCommonContractorChange() }">
                        <template #prefix>
                          <UserGroupIcon
                            class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                        </template>
                        <template #afterOptions>
                          <div @click="showAddContractorDialog = true" style="color: #10b981;"
                            class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100">
                            + {{ $t('labels.addNew') }}
                          </div>
                        </template>
                      </SearchDropdown>
                    </div>
                  </div>
                </div>

                <!-- Crusher (الكسارة) -->
                <div>
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                    {{ $t('labels.crusher') }} <span class="text-red-600">*</span>
                  </label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <SearchDropdown v-model="filters.commonCrusherSearch" :items="crushers" :allItems="crushers"
                        :placeholder="$t('labels.crusher')"
                        :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                        @select="(sel) => { commonData.crusher = sel; filters.commonCrusherSearch = sel.name; onCommonCrusherChange() }">
                        <template #prefix>
                          <WrenchScrewdriverIcon
                            class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                        </template>
                        <template #afterOptions>
                          <div @click="showAddCrusherDialog = true" style="color: #10b981;"
                            class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100">
                            + {{ $t('labels.addNew') }}
                          </div>
                        </template>
                      </SearchDropdown>
                    </div>
                  </div>
                </div>

                <div class="col-span-full">
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                    {{ $t('labels.notes') }}
                  </label>
                  <textarea
                    v-model="commonData.notes"
                    rows="3"
                    class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm theme-input-focus transition"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Next / Cancel Buttons -->
            <div class="mt-10 flex justify-end gap-6">
              <button @click="closeModal"
                class="px-10 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium theme-text-secondary transition">
                {{ $t('labels.cancel') }}
              </button>
              <button @click="goToStep2" :disabled="!isStep1Valid()"
                class="px-10 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed theme-text-light rounded-lg font-medium transition flex items-center gap-3">
                {{ $t('labels.next') }}
                <ArrowRightIcon class="w-6 h-6 transition-transform rtl:rotate-180" />
              </button>
            </div>
          </div>
          <!-- ============================================ STEP 2 ============================================ -->
          <div v-else class="w-full">
            <!-- Back Button and Title -->
            <div class="flex items-center justify-between mb-8">
              <button @click="goBackToStep1"
                class="flex items-center gap-3 theme-text hover:theme-accent-muted font-medium transition">
                <ArrowLeftIcon class="w-6 h-6 transition-transform rtl:rotate-180" />
                {{ $t('labels.back') }}
              </button>
              <h3 class="text-lg font-bold theme-text-primary">{{ $t('labels.step2Data') }}</h3>
              <div></div> <!-- Placeholder to balance flex -->
            </div>

            <!-- Summary Card of Common Data -->
            <div class="theme-dashboard-bg-soft border theme-border rounded-lg p-5 mb-8">
              <h4 class="text-sm font-bold theme-accent-muted mb-4">{{ $t('labels.summary') }}</h4>
              <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                <div class="flex flex-col">
                  <dt class="font-semibold theme-text-secondary">{{ $t('labels.date') }}:</dt>
                  <dd class="theme-text-primary mt-1">{{ commonData.date || '-' }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-semibold theme-text-secondary">{{ $t('labels.item') }}:</dt>
                  <dd class="theme-text-primary mt-1">{{ commonData.item?.name || '-' }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-semibold theme-text-secondary">{{ $t('labels.price') }}:</dt>
                  <dd class="theme-text-primary mt-1">{{ formatNumber(commonData.price) }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-semibold theme-text-secondary">{{ $t('labels.site') }}:</dt>
                  <dd class="theme-text-primary mt-1">{{ commonData.site?.name || '-' }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-semibold theme-text-secondary">{{ $t('labels.area') }}:</dt>
                  <dd class="theme-text-primary mt-1">{{ commonData.area?.name || '-' }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-semibold theme-text-secondary">{{ $t('labels.contractor') }}:</dt>
                  <dd class="theme-text-primary mt-1">{{ commonData.contractor?.name || '-' }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-semibold theme-text-secondary">{{ $t('labels.crusher') }}:</dt>
                  <dd class="theme-text-primary mt-1">{{ commonData.crusher?.name || '-' }}</dd>
                </div>
                <div class="flex flex-col col-span-full">
                  <dt class="font-semibold theme-text-secondary">{{ $t('labels.notes') }}:</dt>
                  <dd class="theme-text-primary mt-1">{{ commonData.notes || '-' }}</dd>
                </div>
              </dl>
            </div>

            <!-- Add New Vehicle Button -->
            <div class="mb-6" >
              <button @click="showAddVehicleDialog = true"
                class="bg-green-600 theme-text-light px-4 py-2 rounded-lg hover:bg-green-700 font-medium shadow-md transition">
                + {{ $t('vehicles.addVehicle') || 'Add New Vehicle' }}
              </button>
            </div>

            <!-- Table for Variable Data -->
            <div class="    mb-8
              relative
              border border-gray-200 rounded-lg
              overflow-visible
              p-2">
              <div class="overflow-x-auto overflow-y-visible w-full">
                <table ref="tableRef" class="w-full  divide-y divide-gray-200 border rounded-lg">
                  <thead class="theme-dashboard-bg-soft sticky top-0 z-10">
                    <tr>
                      <th class="px-4 py-3 text-center text-xs font-medium theme-text-secondary w-12">{{ $t('#') }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                        $t('labels.vehicle') }}</th>
                      <!-- <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{ $t('labels.price') }}</th> -->
                      <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                        $t('labels.crusherTicket') }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                        $t('labels.companyTicket') }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                        $t('labels.discount') }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                        $t('labels.companyCapacity') }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                        $t('labels.crusherCapacity') }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                        $t('labels.total') }}</th>
                      <th class="px-4 py-3 text-center text-xs font-medium theme-text-secondary">{{ $t('labels.actions') }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="(row, index) in rows" :key="row.id">
                      <td class="px-4 py-3 text-center text-sm theme-text-secondary">{{ index + 1 }}</td>

                      <!-- ======================== first column 
                     in step 2 ================ -->
                      <!-- Vehicle -->
                      <td class="px-3 py-2" :ref="el => row.vehicleCell = el">
                        <div class="relative">
                          <!-- Field -->
                          <div
                            class="border border-gray-300 rounded px-2 py-1 flex items-center justify-between cursor-pointer focus-within:theme-input-focus"
                            @mousedown.prevent="toggleVehicleDropdown(row)">
                            <input v-model="row.search" type="text"
                              :placeholder="row.vehicle?.name || $t('labels.vehicle')"
                              class="outline-none flex-1 text-sm bg-transparent" @keydown.enter.prevent
                              @keydown.escape="row.open = false"
                              @keydown="onDropdownKeydown($event, row, filteredVehicles(row), (sel) => selectVehicle(row, sel))"
                              @mousedown.prevent="" @focus="row.open = true" @blur="row.open = false" />
                            <span class="theme-caption">▾</span>
                          </div>

                          <!-- Dropdown -->
                          <teleport to=".modal-body-container" v-if="row.open">
                          <div
                            class="vehicle-dropdown absolute border border-gray-200 bg-white rounded-md max-h-40 overflow-y-auto shadow-2xl"
                            :class="getVehicleDropdownClasses(row)" :style="getVehicleDropdownStyle(row)" @click.stop>
                            <div v-if="filteredVehicles(row).length === 0"
                              class="px-3 py-2 text-sm theme-text-muted text-start">
                              {{ $t('vehicles.noResults') || 'No vehicles found' }}
                            </div>
                            <div v-for="(v, vi) in filteredVehicles(row)" :key="v.id"
                              @mousedown.prevent="selectVehicle(row, v)" @mousemove="row.highlightedVehicleIndex = vi"
                              :class="['px-3 py-2 cursor-pointer text-sm border-b border-gray-50 last:border-b-0 text-start', vi === row.highlightedVehicleIndex ? 'theme-icon-bg' : 'theme-hover-soft']">
                              {{ v.name }}
                            </div>

                            <!-- Add new -->
                            <!-- <div @click.stop="onAddVehicleClicked(row)"
                            class="px-3 py-2 text-green-600 hover:bg-green-50 cursor-pointer text-sm font-medium text-start">
                            + {{ $t('labels.addNew') }}
                          </div> -->
                          </div>
                          </teleport>
                        </div>
                      </td>

                      <!-- Crusher Ticket -->
                      <td class="px-3 py-2">
                        <input type="text" v-model="row.crusherTicket" @keydown.enter.prevent="handleEnterKey(index)"
                          class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus" />
                      </td>

                      <!-- Company Ticket -->
                      <td class="px-3 py-2">
                        <input type="text" v-model="row.companyTicket" @keydown.enter.prevent="handleEnterKey(index)"
                          class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus" />
                      </td>

                      <!-- Discount -->
                      <td class="px-3 py-2">
                        <input type="number" v-model.number="row.discount" step="0.01"
                          @keydown.enter.prevent="handleEnterKey(index)"
                          class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus no-spinner" />
                      </td>

                      <!-- Company Cubic -->
                      <td class="px-3 py-2">
                        <input type="number" v-model.number="row.companyCapacity" step="0.01"
                          @keydown.enter.prevent="handleEnterKey(index)"
                          class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus no-spinner" />
                      </td>

                      <!-- Crusher Cubic -->
                      <td class="px-3 py-2">
                        <input type="number" v-model.number="row.crusherCapacity" step="0.01"
                          @keydown.enter.prevent="handleEnterKey(index)"
                          @keydown.tab="onCrusherCapacityTab(index, $event)"
                          class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus no-spinner" />
                      </td>

                      <!-- Total per Row -->
                      <td class="px-3 py-2 text-sm font-semibold theme-text">
                        {{ formatNumber(totalPerRow(row)) }}
                      </td>

                      <!-- Actions -->
                      <td class="px-4 py-3 text-center">
                        <div class="flex justify-center gap-3">
                          <button @click="duplicateRow(index)" class="theme-text hover:theme-accent-muted transition"
                            title="Duplicate" tabindex="-1">
                            <DocumentDuplicateIcon class="w-5 h-5" />
                          </button>
                          <button @click="removeRow(index)" class="text-red-600 hover:text-red-800 transition"
                            title="Delete" tabindex="-1">
                            <TrashIcon class="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Totals -->
            <div
              class="bg-gray-50 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-6 text-sm font-semibold">
              <div class="flex items-center justify-end gap-3">
                <span class="theme-text-secondary">{{ $t('labels.subtotal') }}:</span>
                <span class="theme-text-primary min-w-32 text-end">{{ formatNumber(subtotal) }}</span>
              </div>
              <div class="flex items-center justify-end gap-3">
                <span class="theme-text-secondary">{{ $t('labels.totalDiscount') }}:</span>
                <span class="text-red-600 min-w-32 text-end">-{{ formatNumber(totalDiscount) }}</span>
              </div>
              <div
                class="flex items-center justify-end gap-3 text-lg theme-accent-strong border-s-4 theme-border-accent ps-6">
                <span class="theme-accent-muted">{{ $t('labels.grandTotal') }}:</span>
                <span class="theme-accent-muted min-w-40 text-end font-bold">{{ formatNumber(grandTotal) }}</span>
              </div>
            </div>

            <!-- Save / Back Buttons -->
            <div class="mt-10 flex justify-end gap-6">
              <button @click="goBackToStep1"
                class="px-10 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium theme-text-secondary transition flex items-center gap-3">
                <ArrowLeftIcon class="w-6 h-6 transition-transform rtl:rotate-180" />
                {{ $t('labels.back') }}
              </button>
              <button @click="saveData" :disabled="isSaving"
                class="px-10 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed theme-text-light rounded-lg font-medium transition flex items-center gap-3">
                {{ isSaving ? $t('labels.saving') : $t('labels.save') }}
                <CheckIcon class="w-6 h-6" />
              </button>
            </div>

            <p v-if="saveError" class="mt-6 text-center text-red-600 font-medium text-lg">
              {{ saveError }}
            </p>
          </div>
        </div>
        </div>
      </div>
    </transition>
  </teleport>

  <!-- Dialog: Add Site -->
  <div v-if="showAddSite" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
    <div class="bg-white p-6 rounded shadow w-96">
      <h3 class="text-lg font-bold mb-2">{{ $t('supply.addSite') }}</h3>
      <input v-model="newSiteName" class="w-full border rounded px-2 py-1 mb-3" :placeholder="$t('supply.siteName')" />
      <div class="flex gap-2 justify-end">
        <button @click="showAddSite = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel') }}</button>
        <button @click="addSite" :disabled="!newSiteName || addingLocation"
          class="bg-green-600 theme-text-light px-3 py-1 rounded">
          {{ addingLocation ? $t('supply.adding') : $t('labels.add') }}
        </button>
      </div>
      <div v-if="locationError" class="text-red-600 text-sm mt-2">{{ locationError }}</div>
    </div>
  </div>

  <!-- Dialog: Add Area -->
  <div v-if="showAddArea" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
    <div class="bg-white p-6 rounded shadow w-96">
      <h3 class="text-lg font-bold mb-2">{{ $t('supply.addArea') }}</h3>
      <input v-model="newAreaName" class="w-full border rounded px-2 py-1 mb-3" :placeholder="$t('supply.areaName')" />
      <div class="flex gap-2 justify-end">
        <button @click="showAddArea = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel') }}</button>
        <button @click="addArea" :disabled="!newAreaName || addingLocation"
          class="bg-green-600 theme-text-light px-3 py-1 rounded">
          {{ addingLocation ? $t('supply.adding') : $t('labels.add') }}
        </button>
      </div>
      <div v-if="locationError" class="text-red-600 text-sm mt-2">{{ locationError }}</div>
    </div>
  </div>

  <!-- Dialog: Add Contractor -->
  <div v-if="showAddContractorDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
    <div class="bg-white p-6 rounded shadow w-96">
      <h3 class="text-lg font-bold mb-2">{{ $t('contractors.addContractor') }}</h3>
      <input v-model="newContractorName" class="w-full border rounded px-2 py-1 mb-3"
        :placeholder="$t('contractors.name')" />
      <div class="flex gap-2 justify-end">
        <button @click="showAddContractorDialog = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel')
        }}</button>
        <button @click="createNewContractor" :disabled="!newContractorName || creatingContractor"
          class="bg-green-600 theme-text-light px-3 py-1 rounded">
          {{ creatingContractor ? $t('supply.adding') : $t('labels.add') }}
        </button>
      </div>
      <div v-if="contractorDialogError" class="text-red-600 text-sm mt-2">{{ contractorDialogError }}</div>
    </div>
  </div>

  <!-- Dialog: Add Crusher -->
  <div v-if="showAddCrusherDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
    <div class="bg-white p-6 rounded shadow w-96">
      <h3 class="text-lg font-bold mb-2">{{ $t('crushers.addCrusher') }}</h3>
      <input v-model="newCrusherName" class="w-full border rounded px-2 py-1 mb-3" :placeholder="$t('crushers.name')" />
      <div class="flex gap-2 justify-end">
        <button @click="showAddCrusherDialog = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel')
        }}</button>
        <button @click="createNewCrusher" :disabled="!newCrusherName || creatingCrusher"
          class="bg-green-600 theme-text-light px-3 py-1 rounded">
          {{ creatingCrusher ? $t('supply.adding') : $t('labels.add') }}
        </button>
      </div>
      <div v-if="crusherDialogError" class="text-red-600 text-sm mt-2">{{ crusherDialogError }}</div>
    </div>
  </div>

  <!-- Dialog: Add Vehicle (use shared CreateVehicle modal) -->
  <div v-if="showAddVehicleDialog" class="fixed inset-0 z-100 flex items-center justify-center px-4">
    <div class="fixed inset-0 bg-black bg-opacity-40" @click="showAddVehicleDialog = false"></div>
    <div class="relative w-full max-w-3xl z-[1002] mx-auto">
      <div class="bg-white rounded-lg shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between px-4 py-3 border-b">
          <h3 class="text-lg font-semibold theme-text-primary">{{ $t('vehicles.createVehicle') }}</h3>
          <button class="theme-text-muted hover:theme-text-secondary" @click="showAddVehicleDialog = false">✕</button>
        </div>
        <div class="p-4 overflow-y-auto">
          <CreateVehicle :mode="'supply'" @created="onCreatedFromVehicleModal" :prefilledContractorId="commonData.contractor?.id"
            :prefilledCrusherName="commonData.crusher?.name" />
        </div>
      </div>
    </div>
  </div>

  <!-- Dialog: Add Export Item -->
  <div v-if="showAddExportItemDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
    <div class="bg-white p-6 rounded shadow w-96">
      <h3 class="text-lg font-bold mb-3">{{ $t('labels.addExportItem') || 'Add Export Item' }}</h3>
      <input v-model="newExportItemForm.name" :placeholder="$t('labels.itemName') || 'Item Name'"
        class="w-full border rounded px-2 py-1 mb-3" />
      <input v-model.number="newExportItemForm.currentPrice" type="number" step="0.01" :placeholder="$t('labels.price')"
        class="w-full border rounded px-2 py-1 mb-3" />
      <div class="flex gap-2 justify-end">
        <button @click="showAddExportItemDialog = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel')
        }}</button>
        <button @click="createNewExportItem"
          :disabled="!newExportItemForm.name || !newExportItemForm.currentPrice || creatingExportItem"
          class="bg-green-600 theme-text-light px-3 py-1 rounded">
          {{ creatingExportItem ? $t('supply.adding') : $t('labels.add') }}
        </button>
      </div>
      <div v-if="exportItemDialogError" class="text-red-600 text-sm mt-2">{{ exportItemDialogError }}</div>
    </div>
  </div>
  <!-- Transport Modal (open after successful supply save when item supports transport) -->
  <TransportCreationModal :isOpen="showTransportModal"
    :modalTitle="$t('transport.addTransportFromSupply') || 'Create Transport'" :transport="transportModalPayload"
    @close="showTransportModal = false" @saved="onTransportSaved" />
</template>

<script>
import {
  createLocation,
  getLocations,
  getContractors,
  getCrushers,
  getVehicles,
  getContractorsWithVehicles,
  createExport,
  createContractor,
  createCrusher,
  createVehicle,
  getExportItems,
  createExportItem
} from '@/api'
import {
  CalendarDaysIcon,
  ArchiveBoxIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  MapIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ArrowLeftIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  CheckIcon,
  ArrowRightIcon
} from '@/theme/icons/legacy'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import CreateVehicle from '@/components/dashboard/Vehicles/CreateVehicle.vue'
import TransportCreationModal from '@/components/dashboard/Transport/TransportCreationModal.vue'
import normalizeItem from '@/utils/normalizeItem'
import DateField from '@/components/shared/DateField.vue'

export default {
  emits: ['saved'],
  name: 'TableModal',
  components: {
    CalendarDaysIcon,
    ArchiveBoxIcon,
    CurrencyDollarIcon,
    MapPinIcon,
    MapIcon,
    UserGroupIcon,
    WrenchScrewdriverIcon,
    ArrowLeftIcon,
    DocumentDuplicateIcon,
    TrashIcon,
    CheckIcon,
    ArrowRightIcon,
    SearchDropdown
    , CreateVehicle
    , TransportCreationModal
    , DateField
  },
  props: {
    showTriggerButton: {
      type: Boolean,
      default: true
    },
    triggerButtonText: {
      type: String,
      default: ''
    },
    modalTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // Step control
      currentStep: 1,

      // Common data (Step 1)
      commonData: {
        date: '',
        item: null,
        price: 0,
        site: null,
        area: null,
        contractor: null,
        crusher: null,
        notes: ''
      },

      // Modal state
      isOpen: false,
      isSaving: false,

      // Lookups
      sites: [],
      allLocations: [],
      rows: [],
      contractors: [],
      contractorsWithVehicles: [],
      crushers: [],
      vehicles: [],
      exportItems: [],

      // Errors
      saveError: '',
      locationError: '',
      contractorDialogError: '',
      crusherDialogError: '',
      vehicleDialogError: '',
      exportItemDialogError: '',

      // Dialog states
      showAddSite: false,
      newSiteName: '',
      showAddArea: false,
      newAreaName: '',
      addingLocation: false,
      pendingRow: null,
      showAddContractorDialog: false,
      newContractorName: '',
      creatingContractor: false,
      showAddCrusherDialog: false,
      newCrusherName: '',
      creatingCrusher: false,
      showAddVehicleDialog: false,
      newVehicleForm: {
        name: '',
        contractorId: '',
        companyCapacity: '',
        crusherCapacity: ''
      },
      // Transport modal trigger/state (open after successful supply save)
      showTransportModal: false,
      transportModalPayload: null,
      creatingVehicle: false,
      showAddExportItemDialog: false,
      newExportItemForm: {
        name: '',
        currentPrice: ''
      },
      creatingExportItem: false,

      // Search filters for Step 1
      filters: {
        commonItemSearch: '',
        commonSiteSearch: '',
        commonAreaSearch: '',
        commonContractorSearch: '',
        commonCrusherSearch: ''
      },

      // References
      tableRef: null,

      // Last entered data for localStorage
      lastEnteredData: {
        date: '',
        contractor: null,
        area: null,
        item: null,
        price: 0,
        crusher: null,
        site: null
      }
    }
  },

  computed: {
    // Use computed helpers for props that rely on i18n so we don't
    // call `this.$t` during prop default evaluation (instance not ready).
    triggerText() {
      return this.triggerButtonText || (this.$t ? this.$t('dashboard.newSupply') + ' +' : 'New Supply +')
    },

    modalTitleComputed() {
      return this.modalTitle || (this.$t ? this.$t('dashboard.newSupply') : 'New Supply')
    },
    commonAvailableAreas() {
      // Prefer the `children` attribute on the selected site when available
      if (!this.commonData.site?.id) return []
      // If the site object contains `children` (from the API include), use it
      if (Array.isArray(this.commonData.site.children) && this.commonData.site.children.length) {
        return this.commonData.site.children
      }
      // Fallback: filter flat `allLocations` by parentId
      return this.allLocations.filter(l => l.parentId === this.commonData.site.id)
    },


    subtotal() {
      return this.rows.reduce((sum, row) => {
        const p = Number(this.commonData.price || 0)
        const c = Number(row.companyCapacity || 0)
        return sum + (p * c)
      }, 0)
    },

    totalDiscount() {
      return this.rows.reduce((sum, row) => {
        const d = Number(row.discount || 0)
        const p = Number(this.commonData.price || 0)
        return sum + (d * p)
      }, 0)
    },

    grandTotal() {
      return Math.max(0, this.subtotal - this.totalDiscount)
    },

    isRTL() {
      return this.$i18n.locale === 'ar'
    }
  },

  async mounted() {
    this.loadLastEnteredDataFromStorage()
    document.addEventListener('click', this.handleGlobalClick)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleGlobalClick)
  },

  methods: {
    async onCreatedFromVehicleModal() {
      try {
        await this.loadLookups()
      } catch (e) {
        console.error('Failed to reload lookups after vehicle creation', e)
      } finally {
        this.showAddVehicleDialog = false
      }
    },

    onAddVehicleClicked(row) {
      console.log('SuppliesCreationModal: Add Vehicle clicked for row', row && row.id)
      try {
        // Open the vehicle creation modal directly (same as the button above table)
        this.showAddVehicleDialog = true
        if (row) row.open = false
      } catch (e) {
        console.error('Error handling add vehicle click', e)
      }
    },

    handleGlobalClick(e) {
      // Close vehicle dropdowns when clicking outside the table area
      const isClickInTable = e.target.closest('table') || e.target.closest('thead') || e.target.closest('tbody')
      const isClickInDropdown = e.target.closest('.vehicle-dropdown')
      const isClickInVehicleCell = e.target.closest('td')?.querySelector('input[type="text"]') === e.target

      if (!isClickInTable && !isClickInDropdown && !isClickInVehicleCell) {
        this.rows.forEach(row => {
          row.open = false
        })
      }
    },

    toggleVehicleDropdown(row) {
      row.open = !row.open
      if (row.open) {
        this.$nextTick(() => {
          const input = row.vehicleCell.querySelector('input')
          if (input) input.focus()
        })
      }
    },

    // Add new row when Tab is pressed on last field
    onCrusherCapacityTab(index, event) {
      // Allow Shift+Tab for backwards navigation
      if (event.shiftKey) return;

      // Check if Tab key and this is the last row
      if (event.key === 'Tab' && index === this.rows.length - 1) {
        event.preventDefault();
        const newRowIndex = this.rows.length;
        this.addRow();

        // Focus on vehicle input in the new row with a small timeout
        setTimeout(() => {
          this.$nextTick(() => {
            if (!this.tableRef) return;
            const allRows = this.tableRef.querySelectorAll('tbody tr');
            const newRow = allRows[newRowIndex];
            if (newRow) {
              const vehicleInput = newRow.querySelector('input[type="text"]');
              if (vehicleInput) {
                vehicleInput.focus();
              }
            }
          });
        }, 10);
      }
    },
    // ============ Step Control ============
    isStep1Valid() {
      return this.commonData.date &&
        this.commonData.item &&
        this.commonData.price > 0 &&
        this.commonData.site &&
        this.commonData.contractor &&
        this.commonData.crusher
    },

    async goToStep2() {
      if (!this.isStep1Valid()) return
      this.currentStep = 2
      this.rows = [this.createEmptyRow()]
      this.saveCommonDataToStorage()
    },

    goBackToStep1() {
      this.currentStep = 1
    },

    // ============ Modal Management ============
    async openModal() {
      this.isOpen = true
      this.currentStep = 1
      this.rows = []
      this.saveError = ''
      console.log('🔄 Opening modal...')
      await this.loadInitialData()
      console.log('✅ Initial data loaded')
      this.loadCommonDataFromStorage()
      console.log('✅ Common data restored from storage:', this.commonData)
    },

    closeModal() {
      this.isOpen = false
      this.saveError = ''
      this.currentStep = 1
      this.saveCommonDataToStorage()
    },

    async loadInitialData() {
      try {
        await Promise.all([
          this.refreshLocations(),
          this.loadLookups(),
          this.loadExportItems()
        ])
      } catch (err) {
        console.error('Failed to load initial data:', err)
      }
    },

    // ============ Data Loading & Storage ============
    loadLastEnteredDataFromStorage() {
      try {
        const saved = localStorage.getItem('suppliesCreationModalLastData')
        if (saved) {
          this.lastEnteredData = JSON.parse(saved)
        }
      } catch (err) {
        console.warn('Failed to load last entered data:', err)
      }
    },

    loadCommonDataFromStorage() {
      try {
        const saved = localStorage.getItem('suppliesCreationModalCommonData')
        if (saved) {
          const data = JSON.parse(saved)
          console.log('📦 Loaded from storage:', data)
          this.commonData.date = data.date || ''

          // Restore site
          if (data.site?.id) {
            this.commonData.site = this.allLocations.find(l => l.id === data.site.id) || null
            if (this.commonData.site) this.filters.commonSiteSearch = this.commonData.site.name
            console.log('✅ Restored site:', this.commonData.site)
          }

          // Restore area — prefer searching the site's `children` if present
          if (data.area?.id && this.commonData.site) {
            let found = null
            if (Array.isArray(this.commonData.site.children) && this.commonData.site.children.length) {
              found = this.commonData.site.children.find(c => c.id === data.area.id) || null
            }
            // fallback to global lookup
            if (!found) found = this.allLocations.find(l => l.id === data.area.id) || null
            this.commonData.area = found
            if (this.commonData.area) this.filters.commonAreaSearch = this.commonData.area.name
            console.log('✅ Restored area:', this.commonData.area)
          }

          // Restore contractor
          if (data.contractor?.id) {
            this.commonData.contractor = this.contractors.find(c => c.id === data.contractor.id) || null
            if (this.commonData.contractor) this.filters.commonContractorSearch = this.commonData.contractor.name
            console.log('✅ Restored contractor:', this.commonData.contractor)
          }

          // Restore crusher
          if (data.crusher?.id) {
            this.commonData.crusher = this.crushers.find(c => c.id === data.crusher.id) || null
            if (this.commonData.crusher) this.filters.commonCrusherSearch = this.commonData.crusher.name
            console.log('✅ Restored crusher:', this.commonData.crusher)
          }

          // Restore item
          if (data.item?.id) {
            this.commonData.item = this.exportItems.find(i => i.id === data.item.id) || null
            if (this.commonData.item) this.filters.commonItemSearch = this.commonData.item.name
            console.log('✅ Restored item:', this.commonData.item)
          }

          this.commonData.price = data.price || 0
          this.commonData.notes = data.notes || ''
          console.log('📦 Final commonData:', this.commonData)
        }
      } catch (err) {
        console.warn('Failed to load common data:', err)
      }
    },

    saveCommonDataToStorage() {
      try {
        const data = {
          date: this.commonData.date,
          site: this.commonData.site ? { id: this.commonData.site.id, name: this.commonData.site.name } : null,
          area: this.commonData.area ? { id: this.commonData.area.id, name: this.commonData.area.name } : null,
          contractor: this.commonData.contractor ? { id: this.commonData.contractor.id, name: this.commonData.contractor.name } : null,
          crusher: this.commonData.crusher ? { id: this.commonData.crusher.id, name: this.commonData.crusher.name } : null,
          item: this.commonData.item ? { id: this.commonData.item.id, name: this.commonData.item.name } : null,
          price: this.commonData.price,
          notes: this.commonData.notes
        }
        localStorage.setItem('suppliesCreationModalCommonData', JSON.stringify(data))
      } catch (err) {
        console.warn('Failed to save common data:', err)
      }
    },

    // ============ Row Management ============
    createEmptyRow() {
      const row = {
        id: Date.now() + Math.random(),
        date: this.commonData.date,
        site: this.commonData.site,
        location: this.commonData.site,
        area: this.commonData.area,
        // Prefer the site's `children` array if available, otherwise fallback to filtering allLocations
        availableAreas: this.commonData.site
          ? (Array.isArray(this.commonData.site.children) && this.commonData.site.children.length
            ? [...this.commonData.site.children]
            : this.allLocations.filter(l => l.parentId === this.commonData.site.id))
          : [],
        contractor: this.commonData.contractor,
        crusher: this.commonData.crusher,
        vehicle: null,
        search: '',
        open: false,
        item: this.commonData.item,
        crusherTicket: '',
        companyTicket: '',
        discount: 0,
        price: this.commonData.price,
        companyCapacity: 0,
        crusherCapacity: '',
        availableVehicles: []
        ,
        highlightedVehicleIndex: -1
      }

      row.availableVehicles = this.getAvailableVehiclesForContractor(this.commonData.contractor?.id)

      return row
    },

    isRowEmpty(row) {
      return !row.crusherTicket?.trim() &&
        !row.companyTicket?.trim() &&
        !row.discount &&
        !row.companyCapacity &&
        !row.crusherCapacity &&
        !row.vehicle
    },

    getMissingRequiredFields(row) {
      const missing = []
      if (!row.vehicle) missing.push(this.$t('labels.vehicle'))
      if (!row.crusherTicket?.trim()) missing.push(this.$t('labels.crusherTicket'))
      if (!row.companyTicket?.trim()) missing.push(this.$t('labels.companyTicket'))

      const discount = Number(row.discount || 0)
      const companyCapacity = Number(row.companyCapacity || 0)

      if (discount < 0) missing.push(this.$t('labels.discount') + ' (≥ 0)')
      if (companyCapacity <= 0) missing.push(this.$t('vehicles.companyCapacity') + ' (> 0)')

      return missing
    },

    handleEnterKey(rowIndex) {
      const currentRow = this.rows[rowIndex]
      if (!currentRow) return

      const newRow = this.createEmptyRow()
      this.rows.push(newRow)

      this.$nextTick(() => {
        if (!this.tableRef) return
        const allRows = this.tableRef.querySelectorAll('tbody tr')
        const newRowEl = allRows[rowIndex + 1]
        if (newRowEl) {
          const firstInput = newRowEl.querySelector('input[type="text"]')
          firstInput?.focus()
        }
      })
    },

    addRow() {
      this.rows.push(this.createEmptyRow())
    },

    duplicateRow(index) {
      const src = this.rows[index]
      if (!src) return
      const copy = JSON.parse(JSON.stringify(src))
      copy.id = Date.now() + Math.random()
      copy.vehicle = null
      copy.search = ''
      copy.open = false
      copy.crusherTicket = ''
      copy.companyTicket = ''
      copy.discount = 0
      copy.companyCapacity = 0
      copy.crusherCapacity = ''
      this.rows.splice(index + 1, 0, copy)
    },

    removeRow(index) {
      this.rows.splice(index, 1)
      if (this.rows.length === 0) this.addRow()
    },

    // ============ Field Interactions (Step 1) ============
    onCommonSiteChange() {
      if (this.commonData.site === '__new__') {
        this.showAddSite = true
        this.commonData.site = null
        this.commonData.area = null
        return
      }
      // Only clear area if we actually selected a different real site
      if (this.commonData.site && this.commonData.site.id) {
        this.commonData.area = null
      }
    },

    onCommonContractorChange() {
      if (this.commonData.contractor === '__new__') {
        this.showAddContractorDialog = true
        return
      }
      const availableVehicles = this.getAvailableVehiclesForContractor(this.commonData.contractor?.id)
      this.rows.forEach(row => {
        row.availableVehicles = availableVehicles
        row.vehicle = null
        row.search = ''
        row.companyCapacity = 0
        row.crusherCapacity = ''
      })
    },

    onCommonCrusherChange() {
      if (this.commonData.crusher === '__new__') {
        this.showAddCrusherDialog = true
        return
      }
    },

    onCommonItemSelect() {
      if (this.commonData.item === '__new__') {
        // Keep it as __new__ so the dialog stays open
        return
      }

      if (!this.commonData.item) return

      // Support multiple possible field names returned by the API
      const maybePrice = this.commonData.item.currentPrice ?? this.commonData.item.defaultSupplyPrice ?? this.commonData.item.defaultExportPrice ?? this.commonData.item.price ?? this.commonData.item.current_price
      const parsed = Number(maybePrice)
      if (!Number.isNaN(parsed)) {
        this.commonData.price = parsed
        console.log('✅ Auto-filled price from item:', this.commonData.price)
      }
    },

    // ============ Field Interactions (Step 2) ============
    filteredVehicles(row) {
      const q = row.search?.toLowerCase() || ''
      return (row.availableVehicles || []).filter(v =>
        (v.name || '').toLowerCase().includes(q)
      )
    },

    getVehicleContractorId(vehicle, fallbackContractorId = null) {
      return vehicle?.contractorId ??
        vehicle?.contractor_id ??
        vehicle?.contractor?.id ??
        vehicle?.ownerId ??
        vehicle?.owner_id ??
        fallbackContractorId
    },

    normalizeVehicle(vehicle, fallbackContractorId = null) {
      const contractorId = this.getVehicleContractorId(vehicle, fallbackContractorId)
      return {
        ...vehicle,
        contractorId: contractorId !== null && contractorId !== undefined && contractorId !== ''
          ? Number(contractorId)
          : null
      }
    },

    getAvailableVehiclesForContractor(contractorId) {
      if (!contractorId) return [...this.vehicles]

      const currentContractorId = Number(contractorId)
      const contractorWithVehicles = this.contractorsWithVehicles.find(c => Number(c.id) === currentContractorId)

      if (Array.isArray(contractorWithVehicles?.vehicles) && contractorWithVehicles.vehicles.length) {
        return contractorWithVehicles.vehicles.map(v => ({
          ...this.normalizeVehicle(v, contractorWithVehicles.id)
        }))
      }

      return this.vehicles.filter(v => Number(v.contractorId) === currentContractorId)
    },

    getVehicleDropdownStyle(row) {
      if (!row.vehicleCell) return {}

      const rect = row.vehicleCell.getBoundingClientRect()
      const container = document.querySelector('.modal-body-container')
      const containerRect = container?.getBoundingClientRect()

      if (!container || !containerRect) return {}

      const top = rect.bottom - containerRect.top + container.scrollTop + 4
      const left = rect.left - containerRect.left + container.scrollLeft

      return {
        top: `${top}px`,
        left: `${left}px`,
        width: `${rect.width}px`,
        zIndex: '9999'
      }
    },

    getVehicleDropdownClasses() {
      return 'z-[9999]'
    },

    selectVehicle(row, vehicle) {
      console.log('✅ Vehicle selected:', vehicle)
      row.vehicle = vehicle
      row.search = vehicle.name
      row.open = false
      row.highlightedVehicleIndex = -1
      this.onVehicleSelect(row)
    },

    // Dropdown keyboard navigation helper
    onDropdownKeydown(e, keyRef, list, onConfirm) {
      const getIndex = () => {
        if (typeof keyRef === 'string') return this[keyRef] ?? -1
        if (typeof keyRef === 'object') return keyRef.highlightedVehicleIndex ?? -1
        return -1
      }
      const setIndex = (i) => {
        if (typeof keyRef === 'string') this[keyRef] = i
        else if (typeof keyRef === 'object') this.$set ? this.$set(keyRef, 'highlightedVehicleIndex', i) : (keyRef.highlightedVehicleIndex = i)
      }

      const listArr = Array.isArray(list) ? list : []
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const idx = getIndex()
        const next = (idx >= 0) ? Math.min(idx + 1, listArr.length - 1) : 0
        setIndex(next)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        const idx = getIndex()
        const prev = (idx > 0) ? idx - 1 : 0
        setIndex(prev)
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const idx = getIndex()
        if (idx >= 0 && idx < listArr.length) {
          onConfirm(listArr[idx])
        }
        return
      }
      if (e.key === 'Escape') {
        this.rows.forEach(r => { r.open = false })
        return
      }
    },

    onVehicleSelect(row) {
      if (!row.vehicle || row.vehicle === '__new__') {
        row.companyCapacity = ''
        row.crusherCapacity = ''
        return
      }

      let vehicle = row.vehicle
      if (vehicle.companyCapacity === undefined || vehicle.crusherCapacity === undefined) {
        const fullVehicle = this.vehicles.find(v => v.id === vehicle.id)
        if (fullVehicle) vehicle = fullVehicle
      }

      const companyCapacity = parseFloat(vehicle.companyCapacity || 0)
      const crusherCapacity = parseFloat(vehicle.crusherCapacity || 0)

      row.companyCapacity = isNaN(companyCapacity) ? '' : companyCapacity
      row.crusherCapacity = isNaN(crusherCapacity) ? '' : crusherCapacity
    },

    totalPerRow(row) {
      const p = Number(this.commonData.price || 0)
      const c = Number(row.companyCapacity || 0)
      const d = Number(row.discount || 0)
      const subtotal = p * c
      const discountAmount = d * p
      const total = Math.max(0, subtotal - discountAmount)
      return total
    },

    formatNumber(v) {
      // Always show numbers in English
      return Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })
    },

    // ============ Locations Management ============
    async refreshLocations() {
      try {
        const res = await getLocations()
        this.allLocations = Array.isArray(res.data) ? res.data : []
        this.sites = this.allLocations.filter(l => !l.parentId)
        console.log('✅ Locations refreshed. Sites:', this.sites, 'All locations:', this.allLocations)
      } catch (err) {
        console.warn('Failed to refresh locations', err)
      }
    },

    async addSite() {
      if (!this.newSiteName?.trim()) return
      this.addingLocation = true
      try {
        const res = await createLocation({ name: this.newSiteName.trim(), parentId: null })
        await this.refreshLocations()
        const created = res?.data
        if (created?.id) {
          const newSite = this.allLocations.find(l => l.id === created.id)
          if (newSite) {
            console.log('✅ Created and found site:', newSite)
            // If called from Step 1
            if (this.currentStep === 1 && !this.pendingRow) {
              this.commonData.site = newSite
              console.log('✅ Set commonData.site:', newSite)
            }
            // If called from Step 2 row (via pendingRow)
            if (this.pendingRow) {
              this.pendingRow.site = newSite
              console.log('✅ Set pendingRow.site:', newSite)
            }
          }
        }
        this.showAddSite = false
        this.newSiteName = ''
        this.pendingRow = null
      } catch (err) {
        this.locationError = err?.response?.data?.message || 'فشل إضافة الموقع'
        console.error('❌ addSite error:', err)
      } finally {
        this.addingLocation = false
      }
    },

    async addArea() {
      if (!this.newAreaName?.trim()) return

      const siteId = this.currentStep === 1 ? this.commonData.site?.id : this.pendingRow?.site?.id
      if (!siteId) return

      this.addingLocation = true
      try {
        const res = await createLocation({
          name: this.newAreaName.trim(),
          parentId: siteId
        })
        await this.refreshLocations()
        const created = res?.data
        if (created?.id) {
          const newArea = this.allLocations.find(l => l.id === created.id)
          if (newArea) {
            console.log('✅ Created and found area:', newArea)
            if (this.currentStep === 1 && !this.pendingRow) {
              this.commonData.area = newArea
              console.log('✅ Set commonData.area:', newArea)
            }
            if (this.pendingRow) {
              this.pendingRow.area = newArea
              console.log('✅ Set pendingRow.area:', newArea)
            }
          }
        }
        this.showAddArea = false
        this.newAreaName = ''
        this.pendingRow = null
      } catch (err) {
        this.locationError = err?.response?.data?.message || 'فشل إضافة المنطقة'
        console.error('❌ addArea error:', err)
      } finally {
        this.addingLocation = false
      }
    },

    // ============ Lookups Management ============
    async loadExportItems() {
      try {
        const res = await getExportItems({ mode: 'supply' })
        const raw = Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || [])
        this.exportItems = raw.map(normalizeItem)
        console.log('✅ Export items loaded (normalized):', this.exportItems)
      } catch (err) {
        console.warn('Failed to load export items', err)
      }
    },

    async loadLookups() {
      try {
        const [cRes, cvRes, crushRes, vRes] = await Promise.all([
          getContractors({ mode: 'supply' }),
          typeof getContractorsWithVehicles === 'function'
            ? getContractorsWithVehicles({ mode: 'supply' })
            : Promise.resolve(null),
          getCrushers(),
          getVehicles({ mode: 'supply', pageSize: 1000 })
        ])

        const extractArray = (res) => {
          console.log('🔍 Raw response:', res)
          const payload = res?.data ?? res
          if (Array.isArray(payload)) return payload
          if (Array.isArray(payload?.items)) return payload.items
          if (Array.isArray(payload?.data)) return payload.data
          if (Array.isArray(payload?.data?.items)) return payload.data.items
          if (Array.isArray(payload?.data?.data)) return payload.data.data
          return []
        }

        this.contractors = extractArray(cRes)
        this.contractorsWithVehicles = extractArray(cvRes)
        this.crushers = extractArray(crushRes)
        const vehiclesFromList = extractArray(vRes).map(vehicle => this.normalizeVehicle(vehicle))
        const vehiclesFromContractors = this.contractorsWithVehicles.flatMap(contractor =>
          Array.isArray(contractor.vehicles)
            ? contractor.vehicles.map(vehicle => this.normalizeVehicle(vehicle, contractor.id))
            : []
        )
        const vehiclesById = new Map()
        ;[...vehiclesFromList, ...vehiclesFromContractors].forEach(vehicle => {
          if (vehicle?.id) vehiclesById.set(Number(vehicle.id), vehicle)
        })
        this.vehicles = Array.from(vehiclesById.values())

        console.log('✅ Loaded contractors:', this.contractors)
        console.log('✅ Loaded crushers:', this.crushers)
        console.log('✅ Loaded vehicles:', this.vehicles)

        this.rows.forEach(row => {
          row.availableVehicles = this.getAvailableVehiclesForContractor(this.commonData.contractor?.id)
        })
      } catch (err) {
        console.error('loadLookups failed:', err)
      }
    },

    // ============ Create New Items ============
    async createNewContractor() {
      const name = this.newContractorName.trim()
      if (!name) return
      this.creatingContractor = true
      this.contractorDialogError = ''
      try {
        const res = await createContractor({ name })
        const createdList = res.normalized || (Array.isArray(res.data) ? res.data : [res.data])
        if (!createdList || createdList.length === 0) throw new Error('Invalid response')

        console.log('✅ Created contractor(s):', createdList)

        // Reload all lookups to get fresh data
        await this.loadLookups()

        // Choose exporter-capable contractor when available
        const chosen = createdList.find(c => c.availableForSupplies) || createdList.find(c => c.availableForExports) || createdList[0]
        const updatedContractor = this.contractors.find(c => c.id === chosen.id)
        if (updatedContractor && this.currentStep === 1) {
          this.commonData.contractor = updatedContractor
          console.log('✅ Set commonData.contractor:', updatedContractor)
        }

        this.newContractorName = ''
        this.showAddContractorDialog = false
      } catch (e) {
        this.contractorDialogError = e?.response?.data?.message || e.message || 'Error'
        console.error('❌ createNewContractor error:', e)
      } finally {
        this.creatingContractor = false
      }
    },

    async createNewCrusher() {
      const name = this.newCrusherName.trim()
      if (!name) return
      this.creatingCrusher = true
      this.crusherDialogError = ''
      try {
        const res = await createCrusher({ name })
        const nc = res?.data
        if (!nc || !nc.id) throw new Error('Invalid response')

        console.log('✅ Created crusher:', nc)

        // Reload all lookups to get fresh data
        await this.loadLookups()

        // After reload, find and set the new crusher
        const updatedCrusher = this.crushers.find(c => c.id === nc.id)
        if (updatedCrusher && this.currentStep === 1) {
          this.commonData.crusher = updatedCrusher
          console.log('✅ Set commonData.crusher:', updatedCrusher)
        }

        this.newCrusherName = ''
        this.showAddCrusherDialog = false
      } catch (e) {
        this.crusherDialogError = e?.response?.data?.message || e.message || 'Error'
        console.error('❌ createNewCrusher error:', e)
      } finally {
        this.creatingCrusher = false
      }
    },

    async createNewVehicle() {
      const { name, contractorId, companyCapacity, crusherCapacity } = this.newVehicleForm
      if (!name.trim() || !companyCapacity || !crusherCapacity) {
        this.vehicleDialogError = 'All fields required'
        return
      }
      this.creatingVehicle = true
      this.vehicleDialogError = ''
      try {
        const res = await createVehicle({
          name: name.trim(),
          contractorId: contractorId ? Number(contractorId) : null,
          companyCapacity: Number(companyCapacity),
          crusherCapacity: Number(crusherCapacity)
        })
        const nv = res?.data
        if (!nv || !nv.id) throw new Error('Invalid response')

        console.log('✅ Created vehicle:', nv)

        // Reload all lookups to get fresh data
        await this.loadLookups()
        console.log('✅ Vehicles after reload:', this.vehicles)

        this.newVehicleForm = { name: '', contractorId: '', companyCapacity: '', crusherCapacity: '' }
        this.showAddVehicleDialog = false
      } catch (e) {
        this.vehicleDialogError = e?.response?.data?.message || e.message || 'Error'
        console.error('❌ createNewVehicle error:', e)
      } finally {
        this.creatingVehicle = false
      }
    },

    async createNewExportItem() {
      const { name, currentPrice } = this.newExportItemForm
      if (!name.trim() || !currentPrice) {
        this.exportItemDialogError = 'All fields required'
        return
      }
      this.creatingExportItem = true
      this.exportItemDialogError = ''
      try {
        const res = await createExportItem({
          name: name.trim(),
          currentPrice: Number(currentPrice)
        })
        const newItem = res?.data
        if (!newItem || !newItem.id) throw new Error('Invalid response')

        console.log('✅ Created export item:', newItem)

        // Reload export items to get fresh data
        await this.loadExportItems()
        console.log('✅ Export items after reload:', this.exportItems)

        // After reload, find and set the new item if in Step 1
        if (this.currentStep === 1) {
          const updatedItem = this.exportItems.find(i => i.id === newItem.id)
          if (updatedItem) {
            this.commonData.item = updatedItem
            this.onCommonItemSelect()
            console.log('✅ Set commonData.item:', updatedItem)
          }
        }

        this.newExportItemForm = { name: '', currentPrice: '' }
        this.showAddExportItemDialog = false
      } catch (e) {
        this.exportItemDialogError = e?.response?.data?.message || e.message || 'Error'
        console.error('❌ createNewExportItem error:', e)
      } finally {
        this.creatingExportItem = false
      }
    },

    // ============ Save Data ============
    async saveData() {
      this.saveError = ''
      this.isSaving = true
      const toSave = this.rows.filter(r => !this.isRowEmpty(r))

      if (!toSave.length) {
        this.saveError = this.$t('labels.noData') || 'No data'
        this.isSaving = false
        return
      }

      // Check required fields
      for (const [i, r] of toSave.entries()) {
        const missing = this.getMissingRequiredFields(r)
        if (missing.length > 0) {
          this.saveError = `Row ${i + 1}: ${missing.join(', ')}`
          this.isSaving = false
          return
        }
      }

      try {
        // Create one flat Export per non-empty row (server computes `total`)
        const createdIds = []
        for (const r of toSave) {
          const payload = {
            date: this.commonData.date,
            locationId: this.commonData.site?.id || (this.commonData.location?.id || null),
            areaId: this.commonData.area?.id || null,
            contractorId: this.commonData.contractor?.id ? Number(this.commonData.contractor.id) : null,
            crusherId: this.commonData.crusher?.id ? Number(this.commonData.crusher.id) : null,
            itemId: this.commonData.item?.id ? Number(this.commonData.item.id) : null,
            notes: this.commonData.notes || undefined,
            vehicleId: r.vehicle?.id ? Number(r.vehicle.id) : undefined,
            crusherTicket: r.crusherTicket?.trim() || undefined,
            companyTicket: r.companyTicket?.trim() || undefined,
            companyCapacity: r.companyCapacity !== undefined && r.companyCapacity !== null ? Number(r.companyCapacity) : undefined,
            crusherCapacity: r.crusherCapacity !== undefined && r.crusherCapacity !== null ? Number(r.crusherCapacity) : undefined,
            unitPrice: (r.unitPrice !== undefined && r.unitPrice !== null) ? Number(r.unitPrice) : (this.commonData.price !== undefined ? Number(this.commonData.price) : undefined),
            discount: r.discount !== undefined && r.discount !== null ? Number(r.discount) : undefined
          }

          // If editing a single export (modal opened for edit), prefer update for that specific export id
          if (this.export && this.export.id && toSave.length === 1) {
            // await updateExport(this.export.id, payload)
          } else {
            // mark record for supplies and keep legacy exports flag for compatibility
            payload.availableForSupplies = true
            payload.availableForExports = true
            const res = await createExport(payload)
            if (res && res.data && res.data.id) createdIds.push(res.data.id)
          }
        }

        this.saveCommonDataToStorage()

        // capture the step-1 data so we can pass it to transport modal if needed
        const step1 = JSON.parse(JSON.stringify(this.commonData || {}))

        // Reset
        this.currentStep = 1
        this.commonData = { date: '', item: null, price: 0, site: null, area: null, contractor: null, crusher: null, notes: '' }
        this.rows = []

        this.closeModal()
        this.$emit('saved')

        // If the saved item's config indicates it can be transported, open transport modal
        try {
          const itemObj = step1 && step1.item && (typeof step1.item === 'object') ? step1.item : (this.exportItems || []).find(i => i.id === step1.item)
          const availableForTransport = itemObj && (itemObj.availableForTransport === true || itemObj.availableForTransports === true || itemObj.availableForTransports === 1 || itemObj.availableForTransport === 1)
          if (step1 && itemObj && availableForTransport) {
            // Map supply step-1 fields to a transport draft payload
            this.transportModalPayload = {
              // location/area naming in transport modal uses `location`/`area`
              location: step1.site || step1.location || null,
              area: step1.area || null,
              contractor: step1.contractor || null,
              item: itemObj || null,
              date: step1.date || null,
              // prefer backend field `defaultTransportPrice`, then `defaultTransferPrice`, then supply price
              firstKmPrice: itemObj?.defaultTransportPrice ?? itemObj?.defaultTransferPrice ?? itemObj?.transferPrice ?? step1.price ?? null,
              notes: step1.notes || ''
            }
            this.showTransportModal = true
          }
        } catch (e) {
          console.warn('Failed to auto-open transport modal:', e)
        }
      } catch (err) {
        console.error('saveData error:', err)
        this.saveError = err?.response?.data?.message || this.$t('common.saveError') || 'Error saving'
      } finally {
        this.isSaving = false
      }
    },
    onTransportSaved(payload) {
      // Close the transport modal and re-emit if parent needs to react
      this.showTransportModal = false
      this.transportModalPayload = null
      try {
        this.$emit('transportSaved', payload)
      } catch (e) {
        // ignore
      }
    }
  }
}
</script>

<style scoped>
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spinner {
  appearance: textfield;
  -moz-appearance: textfield;
}

input:focus,
select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
</style>
