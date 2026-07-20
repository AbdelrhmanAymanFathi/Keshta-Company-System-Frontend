<template>
  <!-- Modal (no internal trigger button anymore) -->
  <teleport to="body">
    <transition name="kc-modal">
      <div
        v-if="isOpen"
        :dir="isRTL ? 'rtl' : 'ltr'"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4 overflow-hidden"
        @click.self="handleBackdropClick"
      >
        <div class="kc-modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] max-h-[95vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 class="text-2xl font-bold theme-heading">
            {{ currentStep === 1 ? modalTitleComputed : ($t('transport.enterTransports') || 'إدخال النقل') }}
          </h2>
          <button
            @click="closeModal"
            class="theme-text-muted hover:theme-text-primary text-3xl leading-none focus:outline-none"
          >
            ×
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 modal-body-container relative">
          <!-- STEP 1 -->
          <div v-if="currentStep === 1" class="w-full">
            <h3 class="text-lg font-bold mb-8 text-center theme-text-primary">
              {{ $t('transport.step1BasicData') || 'الخطوة 1: البيانات الأساسية' }}
            </h3>

            <div class="max-w-6xl mx-auto">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <!-- Date was moved to Step 2 -->

                <!-- Item -->
                <div>
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                    {{ $t('labels.item') }} <span class="text-red-600">*</span>
                  </label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <SearchDropdown v-model:modelValue="filters.commonItemSearch" :items="items" :all-items="items"
                        :placeholder="$t('labels.item')" :itemKey="'id'" :itemLabel="'name'"
                        :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                        @select="selectCommonItem"
                        clearable
                        :clearAriaLabel="$t('labels.clear')"
                        @clear="() => { commonData.item = null; filters.commonItemSearch = '' }">
                        <template #prefix>
                          <ArchiveBoxIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                        </template>
                        <template #afterOptions>
                          <div @mousedown.prevent="showAddItemDialog = true"
                            class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100 text-green-600">
                            + {{ $t('labels.addNew') }}
                          </div>
                        </template>
                      </SearchDropdown>
                    </div>
                  </div>
                </div>

                <!-- From Location -->
                <div>
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                      {{ $t('transport.location') || $t('transport.fromLocation') }} <span class="text-red-600">*</span>
                    </label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <SearchDropdown v-model:modelValue="filters.commonFromLocSearch" :items="locations"
                        :placeholder="$t('transport.location')" :itemKey="'id'" :itemLabel="locLabel"
                        :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                        @select="(sel) => { commonData.location = sel; commonData.area = null; filters.commonToLocSearch = ''; filters.commonFromLocSearch = sel.name + (sel.parentName ? ' (' + sel.parentName + ')' : ''); }"
                        clearable
                        :clearAriaLabel="$t('labels.clear')"
                        @clear="() => { commonData.location = null; commonData.area = null; filters.commonFromLocSearch = ''; filters.commonToLocSearch = '' }">
                        <template #prefix>
                          <MapPinIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                        </template>
                        <template #afterOptions>
                          <div @mousedown.prevent="(function(){ pendingField = 'location'; showAddLocation = true })()"
                            class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100 text-green-600">
                            + {{ $t('supply.addSite') }}
                          </div>
                        </template>
                      </SearchDropdown>
                    </div>
                  </div>
                </div>

                <!-- To Location -->
                <div>
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                      {{ $t('transport.area') || $t('transport.toLocation') }} <span class="text-red-600">*</span>
                    </label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <SearchDropdown v-model:modelValue="filters.commonToLocSearch" :items="(commonData.location?.children && Array.isArray(commonData.location.children)) ? commonData.location.children : []"
                        :placeholder="$t('transport.area')" :itemKey="'id'" :itemLabel="'name'"
                        :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                        @select="(sel) => { commonData.area = sel; filters.commonToLocSearch = sel.name; try{ saveCommonDataToStorage() }catch(e){} }"
                        clearable
                        :clearAriaLabel="$t('labels.clear')"
                        @clear="() => { commonData.area = null; filters.commonToLocSearch = '' }">
                        <template #prefix>
                          <MapPinIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                        </template>
                        <template #afterOptions>
                          <div @mousedown.prevent="(function(){ pendingField = 'area'; showAddLocation = true })()"
                            class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100 text-green-600">
                            + {{ $t('supply.addSite') }}
                          </div>
                        </template>
                      </SearchDropdown>
                    </div>
                  </div>
                </div>

                <!-- Contractor -->
                <div>
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                    {{ $t('transport.contractor') }} <span class="text-red-600">*</span>
                  </label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <SearchDropdown v-model:modelValue="filters.commonContractorSearch" :items="contractors"
                        :placeholder="$t('transport.contractor')" :itemKey="'id'" :itemLabel="'name'"
                        :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                        @select="selectCommonContractor"
                        clearable
                        :clearAriaLabel="$t('labels.clear')"
                        @clear="() => { commonData.contractor = null; filters.commonContractorSearch = ''; commonData.vehicle = null; filters.commonVehicleSearch = ''; vehicleCompanyCapacity = 0; }">
                        <template #prefix>
                          <UserGroupIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                        </template>
                        <template #afterOptions>
                          <div @mousedown.prevent="showAddContractorDialog = true"
                            class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100 text-green-600">
                            + {{ $t('labels.addNew') }}
                          </div>
                        </template>
                      </SearchDropdown>
                    </div>
                  </div>
                </div>

                <!-- Vehicle (moved to header) -->
                <div>
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                    {{ $t('labels.vehicle') }} <span class="text-red-600">*</span>
                  </label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <SearchDropdown v-model:modelValue="filters.commonVehicleSearch" :items="filteredCommonVehicles"
                        :all-items="filteredCommonVehicles" :placeholder="$t('labels.vehicle')" :itemKey="'id'" :itemLabel="'name'"
                        :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                        @select="selectCommonVehicle"
                        clearable
                        :clearAriaLabel="$t('labels.clear')"
                        @clear="() => { commonData.vehicle = null; filters.commonVehicleSearch = ''; vehicleCompanyCapacity = 0; rows.forEach(r => { r.vehicle = null }) }">
                        <template #prefix>
                          <ArchiveBoxIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                        </template>
                        <template #afterOptions>
                          <div @mousedown.prevent="showAddVehicleDialog = true"
                            class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100 text-green-600">
                            + {{ $t('labels.addNew') }}
                          </div>
                        </template>
                      </SearchDropdown>
                    </div>
                  </div>
                </div>

                <!-- Vehicle Company Capacity (header) -->
                <div>
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                    {{ $t('transport.vehicleCapacity') }}
                  </label>
                  <div class="relative">
                    <ArchiveBoxIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                    <input
                      type="number"
                      v-model.number="vehicleCompanyCapacity"
                      step="0.01"
                      min="0"
                      class="w-full border border-gray-300 rounded-lg px-4 py-2.5 ps-11 pe-4 text-sm theme-input-focus transition"
                    />
                  </div>
                </div>

                <!-- Distance moved to per-row inputs in Step 2 -->

                <!-- First Km Price -->
                <div>
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                    {{ $t('transport.firstKmPrice') }}
                  </label>
                  <div class="relative">
                    <CurrencyDollarIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                    <input
                      type="number"
                      v-model.number="commonData.firstKmPrice"
                      step="0.01"
                      min="0"
                      class="w-full border border-gray-300 rounded-lg px-4 py-2.5 ps-11 pe-4 text-sm theme-input-focus transition"
                    />
                  </div>
                </div>

                <!-- Per Km Price -->
                <div>
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                    {{ $t('transport.perKmPrice') }}
                  </label>
                  <div class="relative">
                    <CurrencyDollarIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                    <input
                      type="number"
                      v-model.number="commonData.perKmPrice"
                      step="0.01"
                      min="0"
                      class="w-full border border-gray-300 rounded-lg px-4 py-2.5 ps-11 pe-4 text-sm theme-input-focus transition"
                    />
                  </div>
                </div>

                <!-- Notes (spans full row) -->
                <div class="col-span-full">
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                    {{ $t('transport.notes') }}
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
              <button
                @click="closeModal"
                class="px-10 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium theme-text-secondary transition"
              >
                {{ $t('common.cancel') || 'إلغاء' }}
              </button>
              <button
                @click="goToStep2"
                :disabled="!isStep1Valid()"
                class="px-10 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed theme-text-light rounded-lg font-medium transition flex items-center gap-3"
              >
                {{ $t('common.next') || 'التالي' }}
                <ArrowRightIcon class="w-6 h-6 transition-transform rtl:rotate-180" />
              </button>
            </div>
          </div>

          <!-- STEP 2 -->
          <div v-else class="w-full">
            <!-- Back Button and Title -->
            <div class="flex items-center justify-between mb-8">
              <button
                @click="goBackToStep1"
                class="flex items-center gap-3 theme-text hover:theme-accent-muted font-medium transition"
              >
                <ArrowLeftIcon class="w-6 h-6 transition-transform rtl:rotate-180" />
                {{ $t('common.back') || 'عودة' }}
              </button>
              <h3 class="text-lg font-bold theme-text-primary">{{ $t('transport.step2Data') || 'الخطوة 2: بيانات الرحلات' }}</h3>
              <div></div> <!-- Placeholder -->
            </div>

            <!-- Summary Card -->
            <div class="theme-dashboard-bg-soft border theme-border rounded-lg p-5 mb-8">
              <h4 class="text-sm font-bold theme-accent-muted mb-4">{{ $t('labels.summary') || 'ملخص' }}</h4>
              <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                <!-- Date removed from summary (handled per-row) -->
                <div class="flex flex-col">
                  <dt class="font-semibold theme-text-secondary">{{ $t('labels.item') }}:</dt>
                  <dd class="theme-text-primary mt-1">{{ commonData.item?.name || '-' }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-semibold theme-text-secondary">{{ $t('transport.location') || $t('transport.fromLocation') }}:</dt>
                  <dd class="theme-text-primary mt-1">{{ commonData.location?.name || '-' }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-semibold theme-text-secondary">{{ $t('transport.area') || $t('transport.toLocation') }}:</dt>
                  <dd class="theme-text-primary mt-1">{{ commonData.area?.name || '-' }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-semibold theme-text-secondary">{{ $t('transport.contractor') }}:</dt>
                  <dd class="theme-text-primary mt-1">{{ commonData.contractor?.name || '-' }}</dd>
                </div>
                  <div class="flex flex-col">
                    <dt class="font-semibold theme-text-secondary">{{ $t('labels.vehicle') }}:</dt>
                    <dd class="theme-text-primary mt-1">{{ commonData.vehicle?.name || '-' }}</dd>
                  </div>
                  <div class="flex flex-col">
                    <dt class="font-semibold theme-text-secondary">{{ $t('transport.vehicleCapacity') }}:</dt>
                    <dd class="theme-text-primary mt-1">{{ formatNumber(vehicleCompanyCapacity || commonData.vehicle?.companyCapacity) }}</dd>
                  </div>
                <!-- Distance is shown per-row now -->
                <div class="flex flex-col">
                  <dt class="font-semibold theme-text-secondary">{{ $t('transport.firstKmPrice') }}:</dt>
                  <dd class="theme-text-primary mt-1">{{ formatNumber(commonData.firstKmPrice) }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-semibold theme-text-secondary">{{ $t('transport.perKmPrice') }}:</dt>
                  <dd class="theme-text-primary mt-1">{{ formatNumber(commonData.perKmPrice) }}</dd>
                </div>
                <div class="flex flex-col col-span-full">
                  <dt class="font-semibold theme-text-secondary">{{ $t('transport.notes') }}:</dt>
                  <dd class="theme-text-primary mt-1">{{ commonData.notes || '-' }}</dd>
                </div>
              </dl>
            </div>

            <!-- Table for Variable Data (Trips) -->
            <div class="relative border border-gray-200 rounded-lg overflow-visible p-2">
              <div class="overflow-x-auto w-full">
                <table ref="tableRef" class="w-full divide-y divide-gray-200 border rounded-lg">
                  <thead class="theme-dashboard-bg-soft sticky top-0 z-10">
                    <tr>
                      <th class="px-4 py-3 text-center text-xs font-medium theme-text-secondary w-12">{{ $t('#') }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">
                        {{ $t('transport.date') || 'Date' }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">
                          {{ $t('labels.discount') }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">
                          {{ $t('transport.count') || 'Count' }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">
                        {{ $t('transport.distanceKm') || 'Distance (Km)' }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">
                        {{ $t('transport.total') }}</th>
                      <th class="px-4 py-3 text-center text-xs font-medium theme-text-secondary">{{ $t('labels.actions') }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="(row, index) in rows" :key="row.id">
                      <td class="px-4 py-3 text-center text-sm theme-text-secondary">{{ index + 1 }}</td>
                      <!-- Row Date -->
                      <td class="px-3 py-2">
                        <DateField v-model="row.date"
                          @keydown.enter.prevent="handleEnterKey(index)"
                          class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus text-sm" />
                      </td>
                      <!-- Discount -->
                      <td class="px-3 py-2">
                        <input type="number" v-model.number="row.discount" step="0.01"
                          @keydown.enter.prevent="handleEnterKey(index)"
                          class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus no-spinner" />
                      </td>
                      <!-- Count -->
                      <td class="px-3 py-2">
                        <input type="number" v-model.number="row.count" min="1" step="1"
                          class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus no-spinner" />
                      </td>
                      <!-- Distance per Row -->
                      <td class="px-3 py-2">
                        <input type="number" v-model.number="row.distanceKm" step="0.1" min="0"
                          @keydown.tab="onLastFieldTab(index, $event)"
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
              class="bg-gray-50 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-6 text-sm font-semibold mt-8">
              <div class="flex items-center justify-end gap-3">
                <span class="theme-text-secondary">{{ $t('transport.subtotal') }}:</span>
                <span class="theme-text-primary min-w-32 text-end">{{ formatNumber(subtotal) }}</span>
              </div>
              <div class="flex items-center justify-end gap-3">
                <span class="theme-text-secondary">{{ $t('transport.totalDiscount') }}:</span>
                <span class="text-red-600 min-w-32 text-end">-{{ formatNumber(totalDiscount) }}</span>
              </div>
              <div
                class="flex items-center justify-end gap-3 text-lg theme-accent-strong border-s-4 theme-border-accent ps-6">
                <span class="theme-accent-muted">{{ $t('transport.grandTotal') }}:</span>
                <span class="theme-accent-muted min-w-40 text-end font-bold">{{ formatNumber(grandTotal) }}</span>
              </div>
            </div>
            <!-- Save / Back Buttons -->
            <div class="mt-10 flex justify-end gap-6">
              <button @click="goBackToStep1"
                class="px-10 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium theme-text-secondary transition flex items-center gap-3">
                <ArrowLeftIcon class="w-6 h-6 transition-transform rtl:rotate-180" />
                {{ $t('common.back') }}
              </button>
              <button @click="saveData" :disabled="isSaving"
                class="px-10 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed theme-text-light rounded-lg font-medium transition flex items-center gap-3">
                {{ isSaving ? $t('common.saving') : $t('common.save') }}
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

  <!-- Dialog: Add Location -->
  <div v-if="showAddLocation" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
    <div class="bg-white p-6 rounded shadow w-96">
      <h3 class="text-lg font-bold mb-2">{{ $t('supply.addSite') }}</h3>
      <label class="block text-sm mb-1">{{ $t('supply.name') }}</label>
      <input v-model="newLocationName" :placeholder="$t('supply.siteName')" class="w-full border rounded px-2 py-1 mb-3" />
      <label class="block text-sm mb-1">{{ $t('supply.under') }}</label>
      <select v-model="newLocationParentId" class="w-full border rounded px-2 py-1 mb-3">
        <option :value="null">{{ $t('common.select') }}</option>
        <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
      </select>
      <div class="flex gap-2 justify-end">
        <button @click="showAddLocation = false; pendingField = null" class="px-3 py-1 border rounded">{{ $t('common.cancel') }}</button>
        <button @click="addLocation" :disabled="!newLocationName || addingLocation"
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
      <input v-model="newContractorPhone" class="w-full border rounded px-2 py-1 mb-3"
        :placeholder="$t('contractors.phone')" />
      <div class="flex gap-2 justify-end">
        <button @click="showAddContractorDialog = false" class="px-3 py-1 border rounded">{{ $t('common.cancel') }}</button>
        <button @click="addContractor" :disabled="!newContractorName || creatingContractor"
          class="bg-green-600 theme-text-light px-3 py-1 rounded">
          {{ creatingContractor ? $t('supply.adding') : $t('labels.add') }}
        </button>
      </div>
      <div v-if="contractorDialogError" class="text-red-600 text-sm mt-2">{{ contractorDialogError }}</div>
    </div>
  </div>

  <!-- Dialog: Add Vehicle -->
  <div v-if="showAddVehicleDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
    <div class="bg-white p-6 rounded shadow w-full max-w-md">
      <h3 class="text-lg font-bold mb-3">{{ $t('vehicles.addVehicle') }}</h3>
      <input v-model="newVehicleForm.name" :placeholder="$t('vehicles.name')"
        class="w-full border rounded px-2 py-1 mb-3" />
      <select v-model="newVehicleForm.contractorId" class="w-full border rounded px-2 py-1 mb-3">
        <option value="">{{ $t('labels.contractor') }} —</option>
        <option v-for="c in contractors" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <input v-model="newVehicleForm.crusherNumber" :placeholder="$t('vehicles.crusherNumber')"
        class="w-full border rounded px-2 py-1 mb-3" />
      <input v-model.number="newVehicleForm.companyCapacity" type="number" step="0.01"
        :placeholder="$t('vehicles.companyCapacity')" class="w-full border rounded px-2 py-1 mb-3" />
      <div class="flex gap-2 justify-end">
        <button @click="showAddVehicleDialog = false" class="px-3 py-1 border rounded">{{ $t('common.cancel') }}</button>
        <button @click="addVehicle"
          :disabled="!newVehicleForm.name || !newVehicleForm.companyCapacity || creatingVehicle"
          class="bg-green-600 theme-text-light px-3 py-1 rounded">
          {{ creatingVehicle ? $t('supply.adding') : $t('labels.add') }}
        </button>
      </div>
      <div v-if="vehicleDialogError" class="text-red-600 text-sm mt-2">{{ vehicleDialogError }}</div>
    </div>
  </div>

  <!-- Dialog: Add Item -->
  <div v-if="showAddItemDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
    <div class="bg-white p-6 rounded shadow w-96">
      <h3 class="text-lg font-bold mb-3">{{ $t('transport.addItem') || 'Add Item' }}</h3>
      <input v-model="newItemForm.name" :placeholder="$t('labels.itemName') || 'Item Name'"
        class="w-full border rounded px-2 py-1 mb-3" />
      <div class="flex gap-2 justify-end">
        <button @click="showAddItemDialog = false" class="px-3 py-1 border rounded">{{ $t('common.cancel') }}</button>
        <button @click="addItem" :disabled="!newItemForm.name || creatingItem"
          class="bg-green-600 theme-text-light px-3 py-1 rounded">
          {{ creatingItem ? $t('supply.adding') : $t('labels.add') }}
        </button>
      </div>
      <div v-if="itemDialogError" class="text-red-600 text-sm mt-2">{{ itemDialogError }}</div>
    </div>
  </div>
</template>

<script>
import {
  createTransport,
  updateTransport,
  getContractors,
  getContractorsWithVehicles,
  createContractor,
  createVehicle,
  getVehicles,
  getLocations,
  createLocation,
  getItems
} from '@/api'
import {
  ArchiveBoxIcon,
  MapPinIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  CheckIcon,
  ArrowRightIcon
} from '@acme/icon-packs/legacy'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import DateField from '@/components/shared/DateField.vue'
import { getTodayISO, formatToISODate } from '@/utils/dateUtils'
import useModalMemory from '@/composables/useModalMemory'

export default {
  name: 'TransportModal',
  components: {
    ArchiveBoxIcon,
    MapPinIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    ArrowLeftIcon,
    DocumentDuplicateIcon,
    TrashIcon,
    CheckIcon,
    ArrowRightIcon
    ,SearchDropdown,
    DateField
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    modalTitle: {
      type: String,
      default: ''
    },
    transport: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'saved'],
  data() {
    return {
      currentStep: 1,
      commonData: {
        date: '',
        item: null,
        location: null,
        vehicle: null,
        area: null,
        contractor: null,
        distanceKm: 0,
        firstKmPrice: 0,
        perKmPrice: 0,
        notes: ''
      },
      isSaving: false,
      locations: [],
      contractors: [],
      contractorsWithVehicles: [],
      items: [],
      vehicles: [],
      saveError: '',
      locationError: '',
        vehicleCompanyCapacity: 0,
      vehicleDialogError: '',
      itemDialogError: '',
      showAddLocation: false,
      newLocationName: '',
      newLocationParentId: null,
      addingLocation: false,
      pendingField: null,
      showAddContractorDialog: false,
      newContractorName: '',
      newContractorPhone: '',
      creatingContractor: false,
      showAddVehicleDialog: false,
      newVehicleForm: {
        name: '',
        contractorId: '',
        crusherNumber: '',
        companyCapacity: ''
      },
      creatingVehicle: false,
      showAddItemDialog: false,
      newItemForm: {
        name: ''
      },
      creatingItem: false,
      rows: [],
      // highlighted indexes for common dropdowns
      highlightedCommonItemIndex: -1,
      highlightedCommonFromLocIndex: -1,
      highlightedCommonToLocIndex: -1,
      highlightedCommonContractorIndex: -1,
      highlightedCommonVehicleIndex: -1,
      filters: {
        commonItemSearch: '',
        showCommonItemDropdown: false,
        commonFromLocSearch: '',
        showCommonFromLocDropdown: false,
        commonToLocSearch: '',
        showCommonToLocDropdown: false,
        commonContractorSearch: '',
        showCommonContractorDropdown: false
        ,commonVehicleSearch: '',
        showCommonVehicleDropdown: false
      }
    }
  },
  computed: {
    modalTitleComputed() {
      return this.modalTitle || (this.$t ? this.$t('transport.addTransport') : 'Add Transport')
    },
    filteredCommonItems() {
      if (!this.filters.showCommonItemDropdown) return []
      if (!this.filters.commonItemSearch) return this.items
      return this.items.filter(i =>
        i.name.toLowerCase().includes(this.filters.commonItemSearch.toLowerCase())
      )
    },
    filteredCommonFromLocs() {
      if (!this.filters.showCommonFromLocDropdown) return []
      if (!this.filters.commonFromLocSearch) return this.locations
      return this.locations.filter(l =>
        (l.name).toLowerCase().includes(this.filters.commonFromLocSearch.toLowerCase())
      )
    },
    filteredCommonToLocs() {
      if (!this.filters.showCommonToLocDropdown) return []
      // Use only the `children` array from the selected location as areas.
      // If `children` is missing or empty, return an empty list (do not fallback to parentId filtering).
      let base = []
      if (this.commonData.location?.children && Array.isArray(this.commonData.location.children) && this.commonData.location.children.length) {
        base = this.commonData.location.children.map(c => ({ ...c, parentName: this.commonData.location.name }))
      } else {
        base = []
      }
      if (!this.filters.commonToLocSearch) return base
      return base.filter(l =>
        (l.name).toLowerCase().includes(this.filters.commonToLocSearch.toLowerCase())
      )
    },
    filteredCommonContractors() {
      if (!this.filters.showCommonContractorDropdown) return []
      if (!this.filters.commonContractorSearch) return this.contractors
      return this.contractors.filter(c =>
        c.name.toLowerCase().includes(this.filters.commonContractorSearch.toLowerCase())
      )
    },
    filteredCommonVehicles() {
      const q = (this.filters.commonVehicleSearch || '').toLowerCase()
      if (!this.commonData.contractor?.id) return []
      let list = this.getAvailableVehiclesForContractor(this.commonData.contractor.id)
      if (!q) return list
      return list.filter(v => (v.name || '').toLowerCase().includes(q))
    },
    subtotal() {
      return this.rows.reduce((sum, row) => sum + this.perTripBeforeDiscount(row), 0)
    },
    totalDiscount() {
      // `discount` is measured in meters (reduces vehicle capacity).
      // Compute monetary discount by removing `appliedMeters` from capacity,
      // so it affects the whole base (firstKmPrice + perKmPrice*(distance-1)).
      return this.rows.reduce((sum, row) => {
        const distance = Number(row.distanceKm || 0)
        const base = this.commonData.firstKmPrice + Math.max(0, (distance - 1)) * this.commonData.perKmPrice
        const discountMeters = Number(row.discount) || 0
        const capacity = Number(row.companyCapacity || this.vehicleCompanyCapacity || this.commonData.vehicle?.companyCapacity || 0)
        const appliedMeters = Math.min(discountMeters, Math.max(0, capacity))
        const count = Number(row.count || 1)
        return sum + base * appliedMeters * count
      }, 0)
    },
    grandTotal() {
      return Math.max(0, this.subtotal - this.totalDiscount)
    },
    isRTL() {
      return this.$i18n.locale === 'ar'
    }
  },
  watch: {
    isOpen: {
      immediate: true,
      async handler(newVal) {
        if (newVal) {
          await this.openModal()
        } else {
          this.currentStep = 1
          this.rows = []
          this.saveError = ''
          // persisted via modalMemory watcher
        }
      }
    },
    transport(newVal) {
      if (newVal && this.isOpen) {
        this.populateForm()
      }
    }
    ,
    'commonData.area'() {
      // auto-save selected area to localStorage whenever it changes
      try {
        this.saveCommonDataToStorage()
      } catch (err) {
        console.warn('Failed to auto-save area to storage', err)
      }
    }
  },
  methods: {
    locLabel(loc) {
      if (!loc) return ''
      return loc.name + (loc.parentName ? ` (${loc.parentName})` : '')
    },
    handleGlobalClick(e) {
      const isClickInTable = e.target.closest('table') || e.target.closest('thead') || e.target.closest('tbody')
      const isClickInDropdown = e.target.closest('.dropdown-container') // add class="dropdown-container" to your dropdown div
      const isClickInVehicleCell = e.target.closest('td')?.querySelector('input[type="text"]') === e.target
      if (!isClickInTable && !isClickInDropdown && !isClickInVehicleCell) {
        this.rows.forEach(row => { row.open = false })
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
    handleVehicleBlur(row) {
      setTimeout(() => {
        if (!row.vehicleCell.contains(document.activeElement)) {
          row.open = false
        }
      }, 100)
    },
    onLastFieldTab(index, event) {
      if (event.shiftKey) return
      if (event.key === 'Tab' && index === this.rows.length - 1) {
        event.preventDefault()
        const newRowIndex = this.rows.length
        this.addRow()
        setTimeout(() => {
          this.$nextTick(() => {
            if (!this.tableRef) return
            const allRows = this.tableRef.querySelectorAll('tbody tr')
            const newRow = allRows[newRowIndex]
            if (newRow) {
              const vehicleInput = newRow.querySelector('input[type="text"]')
              if (vehicleInput) vehicleInput.focus()
            }
          })
        }, 10)
      }
    },
    isStep1Valid() {
      return this.commonData.item &&
        this.commonData.location &&
        this.commonData.area &&
        this.commonData.vehicle &&
        this.commonData.contractor &&
        (this.commonData.firstKmPrice > 0 || this.commonData.perKmPrice > 0)
    },
    goToStep2() {
      if (!this.isStep1Valid()) return
      this.currentStep = 2
      this.rows = [this.createEmptyRow()]
      this.saveCommonDataToStorage()
    },
    goBackToStep1() {
      this.currentStep = 1
    },
    async openModal() {
      console.log('openModal triggered')
      this.currentStep = 1
      this.rows = []
      this.saveError = ''
      await this.loadInitialData()
      this.loadCommonDataFromStorage()
      if (this.transport) {
        this.populateForm()
      } else {
        this.commonData.date = getTodayISO()
      }
    },
    closeModal() {
      this.$emit('close')
    },
    handleBackdropClick() {
      this.closeModal()
    },
    async loadInitialData() {
      await Promise.all([
        this.refreshLocations(),
        this.loadLookups(),
        this.loadItems()
      ])
    },
    loadCommonDataFromStorage() {
      try {
        const saved = localStorage.getItem('transportCreationModalCommonData')
        if (saved) {
          const data = JSON.parse(saved)
          this.commonData.date = data.date || ''
          if (data.item?.id) {
            this.commonData.item = this.items.find(i => i.id === data.item.id) || null
            if (this.commonData.item) this.filters.commonItemSearch = this.commonData.item.name
          }
          if (data.location?.id) {
            this.commonData.location = this.locations.find(l => l.id === data.location.id) || null
            if (this.commonData.location) this.filters.commonFromLocSearch = this.commonData.location.name
          }
          if (data.area?.id) {
            // Prefer searching within the selected location's children, fallback to global lookup
            let found = null
            if (this.commonData.location) {
              if (Array.isArray(this.commonData.location.children) && this.commonData.location.children.length) {
                found = this.commonData.location.children.find(c => c.id === data.area.id) || null
              }
            }
            if (!found) {
              found = this.locations.find(l => l.id === data.area.id) || null
            }
            this.commonData.area = found
            console.log('Loaded area from storage:', data.area, 'Matched area:', this.commonData.area)
            if (this.commonData.area) this.filters.commonToLocSearch = this.commonData.area.name
          }
          if (data.contractor?.id) {
            this.commonData.contractor = this.contractors.find(c => c.id === data.contractor.id) || null
            if (this.commonData.contractor) this.filters.commonContractorSearch = this.commonData.contractor.name
          }
          if (data.vehicle?.id) {
            this.commonData.vehicle = this.vehicles.find(v => v.id === data.vehicle.id) || null
            if (this.commonData.vehicle) this.filters.commonVehicleSearch = this.commonData.vehicle.name
          }
          // load persisted vehicle company capacity if present
          if (typeof data.vehicleCompanyCapacity !== 'undefined') {
            this.vehicleCompanyCapacity = Number(data.vehicleCompanyCapacity || 0)
          }
          this.commonData.distanceKm = data.distanceKm || 0
          this.commonData.firstKmPrice = data.firstKmPrice || 0
          this.commonData.perKmPrice = data.perKmPrice || 0
          this.commonData.notes = data.notes || ''
        }
      } catch (err) {
        console.warn('Failed to load common data:', err)
      }
    },
    saveCommonDataToStorage() {
      try {
        const payload = {
          commonData: {
            date: this.commonData.date,
            item: this.commonData.item ? { id: this.commonData.item.id, name: this.commonData.item.name } : null,
            location: this.commonData.location ? { id: this.commonData.location.id, name: this.commonData.location.name } : null,
            area: this.commonData.area ? { id: this.commonData.area.id, name: this.commonData.area.name } : null,
            contractor: this.commonData.contractor ? { id: this.commonData.contractor.id, name: this.commonData.contractor.name } : null,
            vehicle: this.commonData.vehicle ? { id: this.commonData.vehicle.id, name: this.commonData.vehicle.name } : null,
            distanceKm: this.commonData.distanceKm,
            firstKmPrice: this.commonData.firstKmPrice,
            perKmPrice: this.commonData.perKmPrice,
            notes: this.commonData.notes,
            vehicleCompanyCapacity: this.vehicleCompanyCapacity
          },
          rows: this.rows
        }
        if (this.modalMemory) {
          this.modalMemory.save(payload)
          return
        }
        localStorage.setItem('transportCreationModalCommonData', JSON.stringify(payload.commonData))
      } catch (err) {
        console.warn('Failed to save common data:', err)
      }
    },
    closeDropdownDelayed(dropdownName) {
      setTimeout(() => {
        this.filters[dropdownName] = false
      }, 200)
    },
    createEmptyRow() {
      const row = {
        id: Date.now() + Math.random(),
        search: '',
        open: false,
        discount: 0,
        companyCapacity: 0,
        vehicle: null,
        availableVehicles: [],
        // per-row variable fields
        count: 1,
        distanceKm: 0,
        date: this.commonData.date ? formatToISODate(this.commonData.date) : getTodayISO(),
        highlightedVehicleIndex: -1
      }
      // rows inherit the header-selected vehicle by default
      row.vehicle = this.commonData.vehicle || null
      // default companyCapacity for row comes from selected header vehicle capacity
      row.companyCapacity = Number(this.vehicleCompanyCapacity || this.commonData.vehicle?.companyCapacity || 0)
      row.availableVehicles = this.getAvailableVehiclesForContractor(this.commonData.contractor?.id)
      return row
    },
    addRow() {
      this.rows.push(this.createEmptyRow())
    },
    duplicateRow(index) {
      const src = this.rows[index]
      if (!src) return
      const copy = { ...src, id: Date.now() + Math.random(), search: '', open: false }
      this.rows.splice(index + 1, 0, copy)
    },
    removeRow(index) {
      this.rows.splice(index, 1)
      if (this.rows.length === 0) this.addRow()
    },
    handleEnterKey(index) {
      const newRow = this.createEmptyRow()
      this.rows.push(newRow)
      this.$nextTick(() => {
        if (!this.tableRef) return
        const allRows = this.tableRef.querySelectorAll('tbody tr')
        const newRowEl = allRows[index + 1]
        if (newRowEl) {
          const firstInput = newRowEl.querySelector('input[type="text"]')
          firstInput?.focus()
        }
      })
    },
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
        return contractorWithVehicles.vehicles.map(vehicle => this.normalizeVehicle(vehicle, contractorWithVehicles.id))
      }

      return this.vehicles.filter(v => Number(v.contractorId) === currentContractorId)
    },

    // Dropdown keyboard navigation helper
    onDropdownKeydown(e, keyRef, list, onConfirm) {
      // keyRef: either a string property name on this (e.g. 'highlightedCommonItemIndex')
      // or an object representing a row which uses row.highlightedVehicleIndex
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
        // close dropdowns
        this.rows.forEach(r => { r.open = false })
        return
      }
    },
    getVehicleDropdownStyle(row) {
      if (!row.vehicleCell) return {}
      const rect = row.vehicleCell.getBoundingClientRect()
      const containerRect = document.querySelector('.modal-body-container')?.getBoundingClientRect()
      if (!containerRect) return {}
      const relativeTop = rect.top - containerRect.top
      const relativeLeft = rect.left - containerRect.left
      return {
        top: `${relativeTop + rect.height + 4}px`,
        left: `${relativeLeft}px`,
        width: `${rect.width}px`,
        zIndex: '50'
      }
    },
    getVehicleDropdownClasses() {
      return 'z-50 dropdown-container' // added class for global click detection
    },
    selectVehicle(row, vehicle) {
      console.log('Vehicle selected:', vehicle)
      row.vehicle = vehicle
      row.search = vehicle.name
      row.open = false
      row.companyCapacity = parseFloat(vehicle.companyCapacity || 0)
      row.highlightedVehicleIndex = -1
    },
    perTripBeforeDiscount(row) {
      const distance = Number(row.distanceKm || 0)
      const base = this.commonData.firstKmPrice + Math.max(0, (distance - 1)) * this.commonData.perKmPrice
      // Prefer per-row companyCapacity, otherwise fall back to header vehicleCompanyCapacity or the selected vehicle's capacity
      const capacity = Number(row.companyCapacity || this.vehicleCompanyCapacity || this.commonData.vehicle?.companyCapacity || 0)
      // include the row count so subtotal reflects multiple trips
      return base * capacity * (row.count || 1)
    },
    totalPerRow(row) {
      // Calculate total after reducing vehicle capacity by discount meters.
      const distance = Number(row.distanceKm || 0)
      const base = this.commonData.firstKmPrice + Math.max(0, (distance - 1)) * this.commonData.perKmPrice
      const capacity = Number(row.companyCapacity || this.vehicleCompanyCapacity || this.commonData.vehicle?.companyCapacity || 0)
      const discountMeters = Number(row.discount) || 0
      const appliedMeters = Math.min(discountMeters, Math.max(0, capacity))
      const effectiveCapacity = Math.max(0, capacity - appliedMeters)
      const count = Number(row.count || 1)
      return Math.max(0, base * effectiveCapacity * count)
    },
    formatNumber(v) {
      return Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })
    },
    async refreshLocations() {
      console.log('Starting refreshLocations...');
      try {
        const res = await getLocations()
        console.log('getLocations raw response:', res);
        const payload = res.data || []
        const list = Array.isArray(payload) ? payload : (Array.isArray(payload.items) ? payload.items : [])
        console.log('Processed locations list length:', list.length);
        const byId = {}
        list.forEach(l => { if (l && l.id) byId[l.id] = l.name })
        this.locations = list.map(l => ({ ...l, parentName: l && l.parentId ? byId[l.parentId] : null }))
      } catch (err) {
        console.warn('Failed to refresh locations', err)
      }
    },
    async addLocation() {
      if (!this.newLocationName?.trim()) return
      this.addingLocation = true
      try {
        const payload = { name: this.newLocationName.trim(), parentId: this.newLocationParentId || null }
        const res = await createLocation(payload)
        await this.refreshLocations()
        const created = res?.data
        if (created?.id) {
          const newLoc = this.locations.find(l => l.id === created.id)
          if (newLoc && this.pendingField) {
            if (this.pendingField === 'location') {
              this.commonData.location = newLoc
              this.commonData.area = null
              this.filters.commonFromLocSearch = newLoc.name
              this.filters.commonToLocSearch = ''
            } else if (this.pendingField === 'area') {
              this.commonData.area = newLoc
              this.filters.commonToLocSearch = newLoc.name
              try { this.saveCommonDataToStorage() } catch (e) {console.warn('Failed to save common data after adding area', e) }
            } else {
              this.commonData[this.pendingField] = newLoc
            }
          }
        }
        this.showAddLocation = false
        this.newLocationName = ''
        this.newLocationParentId = null
        this.pendingField = null
      } catch (err) {
        this.locationError = err?.response?.data?.message || 'Failed to add location'
      } finally {
        this.addingLocation = false
      }
    },
    async loadLookups() {
      console.log('Starting loadLookups...');
      try {
        const [cRes, cvRes, vRes] = await Promise.all([
          getContractors({ mode: 'transport' }),
          typeof getContractorsWithVehicles === 'function'
            ? getContractorsWithVehicles({ mode: 'transport' })
            : Promise.resolve(null),
          getVehicles({ mode: 'transport', pageSize: 1000 })
        ])
        console.log('getContractors response:', cRes)
        console.log('getContractorsWithVehicles response:', cvRes)
        // Improved parsing
        const extractArray = (res) => {
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
        console.log('Processed contractors:', this.contractors.length)
        console.log('Processed vehicles:', this.vehicles.length)
        // update rows' available vehicles if any
        this.rows.forEach(r => {
          r.availableVehicles = this.getAvailableVehiclesForContractor(this.commonData.contractor?.id)
        })
      } catch (err) {
        console.error('loadLookups failed:', err)
      }
    },
    async loadItems() {
      console.log('Starting loadItems...');
      try {
        const res = await getItems({ mode: 'transport', pageSize: 1000 })
        console.log('getItems raw response:', res)
        this.items = Array.isArray(res.data.items) ? res.data.items : (Array.isArray(res.data) ? res.data : [])
        console.log('Processed items length:', this.items.length)
      } catch (err) {
        console.error('loadItems failed:', err)
      }
    },
    async addContractor() {
      if (!this.newContractorName?.trim()) return
      this.creatingContractor = true
      try {
        const payload = { name: this.newContractorName.trim(), phone: this.newContractorPhone?.trim() || '' }
        const res = await createContractor(payload)
        await this.loadLookups()
        // backend may return single or multiple contractors; pick the one appropriate for transport
        const createdList = res.normalized || (Array.isArray(res.data) ? res.data : [res.data])
        let chosen = createdList.find(c => c.availableForTransports) || createdList[0]
        if (chosen && chosen.id) {
          const newContractor = this.contractors.find(c => c.id === chosen.id)
          if (newContractor) {
            this.commonData.contractor = newContractor
            this.filters.commonContractorSearch = newContractor.name
          }
        }
        this.showAddContractorDialog = false
        this.newContractorName = ''
        this.newContractorPhone = ''
      } catch (err) {
        this.contractorDialogError = err?.response?.data?.message || 'Failed to add contractor'
      } finally {
        this.creatingContractor = false
      }
    },
    async addVehicle() {
      const { name, contractorId, crusherNumber, companyCapacity } = this.newVehicleForm
      if (!name?.trim() || companyCapacity <= 0) return
      this.creatingVehicle = true
      try {
        const payload = {
          name: name.trim(),
          contractorId: contractorId ? Number(contractorId) : null,
          crusherNumber: crusherNumber?.trim() || '',
          companyCapacity: Number(companyCapacity)
        }
        const res = await createVehicle(payload)
        if (res?.data?.id) {
          console.log('Vehicle created with ID:', res.data.id)
        }
        await this.loadLookups()
        this.showAddVehicleDialog = false
        this.newVehicleForm = { name: '', contractorId: '', crusherNumber: '', companyCapacity: '' }
      } catch (err) {
        this.vehicleDialogError = err?.response?.data?.message || 'Failed to add vehicle'
      } finally {
        this.creatingVehicle = false
      }
    },
    async addItem() {
      const { name } = this.newItemForm
      if (!name?.trim()) return
      this.creatingItem = true
      try {
        // Assuming createItem API exists; adjust as needed
        // const res = await createItem({ name: name.trim(), mode: 'transport' })
        // For demo, mock
        const mockId = Date.now()
        const newItem = { id: mockId, name: name.trim() }
        this.items.push(newItem)
        this.commonData.item = newItem
        this.filters.commonItemSearch = newItem.name
        this.showAddItemDialog = false
        this.newItemForm = { name: '' }
      } catch (err) {
        this.itemDialogError = err?.response?.data?.message || 'Failed to add item'
      } finally {
        this.creatingItem = false
      }
    },
    async saveData() {
      this.saveError = ''
      this.isSaving = true
      const toSave = this.rows.filter(r => (Number(r.count) > 0 || Number(r.distanceKm) > 0))
      const totalTrips = toSave.reduce((s, r) => s + (Number(r.count) || 0), 0)
      if (!toSave.length || totalTrips <= 0) {
        this.saveError = this.$t('common.noData') || 'No data to save'
        this.isSaving = false
        return
      }

      // validate parent location/area
      const locId = this.commonData.location?.id ?? null
      const areaId = this.commonData.area?.id ?? null
      if (!locId || !areaId) {
        this.saveError = this.$t('common.missingLocationOrArea') || 'Location and area are required'
        this.isSaving = false
        return
      }

      try {
          // Aggregate rows into single payload matching current API format
          const totalDiscount = toSave.reduce((s, r) => s + (Number(r.discount) || 0), 0)
          // weighted average distance per trip
          const weightedDistSum = toSave.reduce((s, r) => s + (Number(r.distanceKm || 0) * (Number(r.count) || 1)), 0)
          const distanceKm = totalTrips > 0 ? (weightedDistSum / totalTrips) : 0
          // const computedRate = Number((Number(this.commonData.firstKmPrice || 0) + Math.max(0, Number(distanceKm || 0) - 1) * Number(this.commonData.perKmPrice || 0)).toFixed(3))
          const capacityForPayload = Number(this.vehicleCompanyCapacity || this.commonData.vehicle?.companyCapacity || 0)

          const payload = {
            date: toSave[0]?.date || this.commonData.date,
            contractorId: this.commonData.contractor?.id || null,
            numTrips: totalTrips,
            distanceKm: Number(distanceKm.toFixed(3)),
            discount: Number(totalDiscount || 0),
            // Backward compatibility for backend schemas that still require `rate`.
            // UI/business logic uses firstKmPrice + perKmPrice as the source of truth.
            // rate: computedRate,
            pricing: {
              firstKm: 1,
              firstKmPrice: Number(this.commonData.firstKmPrice || 0),
              perKmPrice: Number(this.commonData.perKmPrice || 0)
            },
            vehicleId: this.commonData.vehicle?.id || null,
            locationId: locId,
            areaId: areaId,
            itemId: this.commonData.item?.id || null,
            notes: this.commonData.notes || '',
            vehicleCompanyCapacity: Number(capacityForPayload || 0)
          }

          if (this.transport && this.transport.id) {
            await updateTransport(this.transport.id, payload)
          } else {
            await createTransport(payload)
          }

        // persist saved state
        try { if (this.modalMemory) this.modalMemory.clear() } catch (e) {}
        try { this.saveCommonDataToStorage() } catch (e) {}
        this.$emit('saved')
        this.closeModal()
      } catch (err) {
        console.error('Transport save error', err)
        this.saveError = err?.response?.data?.message || this.$t('common.saveError')
      } finally {
        this.isSaving = false
      }
    },
    populateForm() {
      // Adapt for multi-row if needed; for now, assume single row edit or draft
      if (!this.transport) return

      // Always populate header/common fields from the provided transport draft/object
      this.commonData.date = this.transport.date?.split('T')[0] || ''
      this.commonData.item = this.items.find(i => i.id === this.transport.itemId) || this.transport.item || null
      this.commonData.location = this.locations.find(l => l.id === this.transport.fromLocId) || this.transport.location || null
      this.commonData.area = this.locations.find(l => l.id === this.transport.toLocId) || this.transport.area || null
      this.commonData.contractor = this.contractors.find(c => c.id === this.transport.contractorId) || this.transport.contractor || null
      this.commonData.distanceKm = parseFloat(this.transport.distanceKm) || 0
      this.commonData.firstKmPrice = parseFloat(this.transport.pricing?.firstKmPrice) || parseFloat(this.transport.firstKmPrice) || 0
      this.commonData.perKmPrice = parseFloat(this.transport.pricing?.perKmPrice) || parseFloat(this.transport.perKmPrice) || 0
      this.commonData.notes = this.transport.notes || ''

      // If this is an existing transport (has id), populate the editable row and switch to Step 2
      if (this.transport.id) {
        this.currentStep = 2
        const vehicle = this.vehicles.find(v => v.id === this.transport.vehicleId)
        this.commonData.vehicle = vehicle || null
        this.filters.commonVehicleSearch = vehicle?.name || ''
        // set header-level vehicle capacity for editing
        this.vehicleCompanyCapacity = Number(vehicle?.companyCapacity || 0)
        const row = this.createEmptyRow()
        row.vehicle = vehicle
        row.search = vehicle?.name || ''
        row.discount = parseFloat(this.transport.discount) / (this.transport.numTrips || 1) || 0 // approximate per-row
        row.companyCapacity = vehicle?.companyCapacity || 0
        row.count = Number(this.transport.numTrips) || 1
        row.distanceKm = parseFloat(this.transport.distanceKm) || this.commonData.distanceKm || 0
        row.date = this.transport.date?.split('T')[0] || this.commonData.date || new Date().toISOString().split('T')[0]
        this.rows = [row]
      } else {
        // Draft: ensure the modal stays on Step 1 so user can confirm header data first
        this.currentStep = 1
      }
    },
    selectCommonItem(item) {
      this.commonData.item = item
      this.filters.commonItemSearch = item.name
      this.filters.showCommonItemDropdown = false
    }
    ,
    selectCommonContractor(sel) {
      this.commonData.contractor = sel
      this.filters.commonContractorSearch = sel?.name || ''
      // clear vehicle selection when contractor changes
      this.commonData.vehicle = null
      this.filters.commonVehicleSearch = ''
      // clear header vehicle capacity when contractor changes
      this.vehicleCompanyCapacity = 0
      // update available vehicles for each row and clear row vehicle
      const availableVehicles = this.getAvailableVehiclesForContractor(sel?.id)
      this.rows.forEach(r => {
        r.availableVehicles = availableVehicles
        r.vehicle = null
      })
      this.filters.showCommonContractorDropdown = false
    }
    ,
    selectCommonVehicle(item) {
      this.commonData.vehicle = item
      this.filters.commonVehicleSearch = item?.name || ''
      this.filters.showCommonVehicleDropdown = false
      // ensure existing rows reflect the selected vehicle
      // set header-level company capacity and propagate to rows
      this.vehicleCompanyCapacity = Number(item?.companyCapacity || 0)
      this.rows.forEach(r => {
        r.vehicle = item
        r.companyCapacity = Number(this.vehicleCompanyCapacity || item?.companyCapacity || 0)
      })
      try { this.saveCommonDataToStorage() } catch (e) { console.warn(e) }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleGlobalClick)
    // modal memory
    try {
      this.modalMemory = useModalMemory('transport.create')
      this._modalWatcher = this.$watch(
        () => ({ commonData: this.commonData, rows: this.rows, currentStep: this.currentStep, isOpen: this.isOpen }),
        (val) => {
          if (!this.isOpen) return
          try { this.modalMemory.save({ commonData: val.commonData, rows: val.rows, currentStep: val.currentStep }) } catch (e) {}
        },
        { deep: true }
      )
    } catch (e) {
      console.warn('transport modal memory init failed', e)
    }
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleGlobalClick)
    if (this._modalWatcher) this._modalWatcher()
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
select:focus,
textarea:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
</style>
