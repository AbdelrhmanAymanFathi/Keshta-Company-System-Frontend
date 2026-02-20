<template>
  <!-- Modal (no internal trigger button anymore) -->
  <teleport to="body">
    <div
      v-if="isOpen"
      :dir="isRTL ? 'rtl' : 'ltr'"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4 overflow-hidden"
      @click.self="handleBackdropClick"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] max-h-[95vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 class="text-2xl font-bold text-indigo-800">
            {{ currentStep === 1 ? modalTitleComputed : ($t('transport.enterTransports') || 'إدخال النقل') }}
          </h2>
          <button
            @click="closeModal"
            class="text-gray-500 hover:text-gray-800 text-3xl leading-none focus:outline-none"
          >
            ×
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 modal-body-container relative">
          <!-- STEP 1 -->
          <div v-if="currentStep === 1" class="w-full">
            <h3 class="text-lg font-bold mb-8 text-center text-gray-800">
              {{ $t('transport.step1BasicData') || 'الخطوة 1: البيانات الأساسية' }}
            </h3>

            <div class="max-w-6xl mx-auto">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <!-- Date was moved to Step 2 -->

                <!-- Item -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    {{ $t('labels.item') }} <span class="text-red-600">*</span>
                  </label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <ArchiveBoxIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        v-model="filters.commonItemSearch"
                        @focus="filters.showCommonItemDropdown = true"
                        @blur="closeDropdownDelayed('showCommonItemDropdown')"
                        @keydown="onDropdownKeydown($event, 'highlightedCommonItemIndex', filteredCommonItems, selectCommonItem)"
                        type="text"
                        :placeholder="$t('labels.item')"
                        class="w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                      <div
                        v-if="filters.showCommonItemDropdown && filteredCommonItems.length"
                        class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg z-10 max-h-48 overflow-y-auto mt-0"
                      >
                        <div
                          v-for="(item, i) in filteredCommonItems"
                          :key="item.id"
                          @mousedown.prevent="selectCommonItem(item)"
                          :class="['px-3 py-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0', i === highlightedCommonItemIndex ? 'bg-indigo-100' : 'hover:bg-indigo-50']"
                        >
                          {{ item.name }}
                        </div>
                        <div
                          @click="showAddItemDialog = true; filters.showCommonItemDropdown = false"
                          style="color: #10b981;"
                          class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm font-medium border-t border-gray-100"
                        >
                          + {{ $t('labels.addNew') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- From Location -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                      {{ $t('transport.location') || $t('transport.fromLocation') }} <span class="text-red-600">*</span>
                    </label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <MapPinIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        v-model="filters.commonFromLocSearch"
                        @focus="filters.showCommonFromLocDropdown = true"
                        @blur="closeDropdownDelayed('showCommonFromLocDropdown')"
                        @keydown="onDropdownKeydown($event, 'highlightedCommonFromLocIndex', filteredCommonFromLocs, (sel) => { commonData.location = sel; commonData.area = null; filters.commonToLocSearch = ''; filters.commonFromLocSearch = sel.name + (sel.parentName ? ' (' + sel.parentName + ')' : ''); filters.showCommonFromLocDropdown = false })"
                        type="text"
                        :placeholder="$t('transport.fromLocation')"
                        class="w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                      <div
                        v-if="filters.showCommonFromLocDropdown && filteredCommonFromLocs.length"
                        class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg z-10 max-h-48 overflow-y-auto mt-0"
                      >
                        <div
                          v-for="(loc, i) in filteredCommonFromLocs"
                          :key="loc.id"
                          @mousedown.prevent="(function(){ commonData.location = loc; commonData.area = null; filters.commonToLocSearch = ''; filters.commonFromLocSearch = loc.name + (loc.parentName ? ' (' + loc.parentName + ')' : ''); filters.showCommonFromLocDropdown = false })()"
                          :class="['px-3 py-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0', i === highlightedCommonFromLocIndex ? 'bg-indigo-100' : 'hover:bg-indigo-50']"
                        >
                          {{ loc.name }}
                        </div>
                        <div
                          @click="pendingField = 'location'; showAddLocation = true; filters.showCommonFromLocDropdown = false"
                          style="color: #10b981;"
                          class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm font-medium border-t border-gray-100"
                        >
                          + {{ $t('supply.addSite') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- To Location -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                      {{ $t('transport.area') || $t('transport.toLocation') }} <span class="text-red-600">*</span>
                    </label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <MapPinIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        v-model="filters.commonToLocSearch"
                        @focus="filters.showCommonToLocDropdown = true"
                        @blur="closeDropdownDelayed('showCommonToLocDropdown')"
                        @keydown="onDropdownKeydown($event, 'highlightedCommonToLocIndex', filteredCommonToLocs, (sel) => { commonData.area = sel; filters.commonToLocSearch = sel.name ; filters.showCommonToLocDropdown = false; try{ saveCommonDataToStorage() }catch(e){} })"
                        type="text"
                        :placeholder="$t('transport.toLocation')"
                        class="w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                      <div
                        v-if="filters.showCommonToLocDropdown && filteredCommonToLocs.length"
                        class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg z-10 max-h-48 overflow-y-auto mt-0"
                      >
                        <div
                          v-for="(loc, i) in filteredCommonToLocs"
                          :key="loc.id"
                          @mousedown.prevent="(function(){ commonData.area = loc; filters.commonToLocSearch = loc.name; filters.showCommonToLocDropdown = false; try{ saveCommonDataToStorage() }catch(e){} })()"
                          :class="['px-3 py-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0', i === highlightedCommonToLocIndex ? 'bg-indigo-100' : 'hover:bg-indigo-50']"
                        >
                          {{ loc.name }}
                        </div>
                        <div
                          @click="pendingField = 'area'; showAddLocation = true; filters.showCommonToLocDropdown = false"
                          style="color: #10b981;"
                          class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm font-medium border-t border-gray-100"
                        >
                          + {{ $t('supply.addSite') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Contractor -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    {{ $t('transport.contractor') }} <span class="text-red-600">*</span>
                  </label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <UserGroupIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        v-model="filters.commonContractorSearch"
                        @focus="filters.showCommonContractorDropdown = true"
                        @blur="closeDropdownDelayed('showCommonContractorDropdown')"
                        @keydown="onDropdownKeydown($event, 'highlightedCommonContractorIndex', filteredCommonContractors, (sel) => { commonData.contractor = sel; filters.commonContractorSearch = sel.name; filters.showCommonContractorDropdown = false })"
                        type="text"
                        :placeholder="$t('transport.contractor')"
                        class="w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                      <div
                        v-if="filters.showCommonContractorDropdown && filteredCommonContractors.length"
                        class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg z-10 max-h-48 overflow-y-auto mt-0"
                      >
                        <div
                          v-for="(contractor, i) in filteredCommonContractors"
                          :key="contractor.id"
                          @mousedown.prevent="(function(){ commonData.contractor = contractor; filters.commonContractorSearch = contractor.name; filters.showCommonContractorDropdown = false })()"
                          :class="['px-3 py-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0', i === highlightedCommonContractorIndex ? 'bg-indigo-100' : 'hover:bg-indigo-50']"
                        >
                          {{ contractor.name }}
                        </div>
                        <div
                          @click="showAddContractorDialog = true; filters.showCommonContractorDropdown = false"
                          style="color: #10b981;"
                          class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm font-medium border-t border-gray-100"
                        >
                          + {{ $t('labels.addNew') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Distance moved to per-row inputs in Step 2 -->

                <!-- First Km Price -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    {{ $t('transport.firstKmPrice') }}
                  </label>
                  <div class="relative">
                    <CurrencyDollarIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="number"
                      v-model.number="commonData.firstKmPrice"
                      step="0.01"
                      min="0"
                      class="w-full border border-gray-300 rounded-lg px-4 py-2.5 ps-11 pe-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    />
                  </div>
                </div>

                <!-- Per Km Price -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    {{ $t('transport.perKmPrice') }}
                  </label>
                  <div class="relative">
                    <CurrencyDollarIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="number"
                      v-model.number="commonData.perKmPrice"
                      step="0.01"
                      min="0"
                      class="w-full border border-gray-300 rounded-lg px-4 py-2.5 ps-11 pe-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                    />
                  </div>
                </div>

                <!-- Notes (spans full row) -->
                <div class="col-span-full">
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    {{ $t('transport.notes') }}
                  </label>
                  <textarea
                    v-model="commonData.notes"
                    rows="3"
                    class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Next / Cancel Buttons -->
            <div class="mt-10 flex justify-end gap-6">
              <button
                @click="closeModal"
                class="px-10 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition"
              >
                {{ $t('common.cancel') || 'إلغاء' }}
              </button>
              <button
                @click="goToStep2"
                :disabled="!isStep1Valid()"
                class="px-10 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center gap-3"
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
                class="flex items-center gap-3 text-indigo-600 hover:text-indigo-800 font-medium transition"
              >
                <ArrowLeftIcon class="w-6 h-6 transition-transform rtl:rotate-180" />
                {{ $t('common.back') || 'عودة' }}
              </button>
              <h3 class="text-lg font-bold text-gray-800">{{ $t('transport.step2Data') || 'الخطوة 2: بيانات الرحلات' }}</h3>
              <div></div> <!-- Placeholder -->
            </div>

            <!-- Summary Card -->
            <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-5 mb-8">
              <h4 class="text-sm font-bold text-indigo-900 mb-4">{{ $t('labels.summary') || 'ملخص' }}</h4>
              <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                <!-- Date removed from summary (handled per-row) -->
                <div class="flex flex-col">
                  <dt class="font-semibold text-gray-700">{{ $t('labels.item') }}:</dt>
                  <dd class="text-gray-900 mt-1">{{ commonData.item?.name || '-' }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-semibold text-gray-700">{{ $t('transport.location') || $t('transport.fromLocation') }}:</dt>
                  <dd class="text-gray-900 mt-1">{{ commonData.location?.name || '-' }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-semibold text-gray-700">{{ $t('transport.area') || $t('transport.toLocation') }}:</dt>
                  <dd class="text-gray-900 mt-1">{{ commonData.area?.name || '-' }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-semibold text-gray-700">{{ $t('transport.contractor') }}:</dt>
                  <dd class="text-gray-900 mt-1">{{ commonData.contractor?.name || '-' }}</dd>
                </div>
                <!-- Distance is shown per-row now -->
                <div class="flex flex-col">
                  <dt class="font-semibold text-gray-700">{{ $t('transport.firstKmPrice') }}:</dt>
                  <dd class="text-gray-900 mt-1">{{ formatNumber(commonData.firstKmPrice) }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-semibold text-gray-700">{{ $t('transport.perKmPrice') }}:</dt>
                  <dd class="text-gray-900 mt-1">{{ formatNumber(commonData.perKmPrice) }}</dd>
                </div>
                <div class="flex flex-col col-span-full">
                  <dt class="font-semibold text-gray-700">{{ $t('transport.notes') }}:</dt>
                  <dd class="text-gray-900 mt-1">{{ commonData.notes || '-' }}</dd>
                </div>
              </dl>
            </div>

            <!-- Table for Variable Data (Trips) -->
            <div class="relative border border-gray-200 rounded-lg overflow-visible p-2">
              <div class="overflow-x-auto w-full">
                <table ref="tableRef" class="w-full divide-y divide-gray-200 border rounded-lg">
                  <thead class="bg-indigo-50 sticky top-0 z-10">
                    <tr>
                      <th class="px-4 py-3 text-center text-xs font-medium text-gray-700 w-12">{{ $t('#') }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium text-gray-700 whitespace-nowrap">
                        {{ $t('transport.date') || 'Date' }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium text-gray-700 whitespace-nowrap">
                        {{ $t('labels.vehicle') }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium text-gray-700 whitespace-nowrap">
                        {{ $t('labels.discount') }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium text-gray-700 whitespace-nowrap">
                        {{ $t('transport.vehicleCapacity') }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium text-gray-700 whitespace-nowrap">
                        {{ $t('transport.count') || 'Count' }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium text-gray-700 whitespace-nowrap">
                        {{ $t('transport.distanceKm') || 'Distance (Km)' }}</th>
                      <th class="px-4 py-3 text-start text-xs font-medium text-gray-700 whitespace-nowrap">
                        {{ $t('transport.total') }}</th>
                      <th class="px-4 py-3 text-center text-xs font-medium text-gray-700">{{ $t('labels.actions') }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="(row, index) in rows" :key="row.id">
                      <td class="px-4 py-3 text-center text-sm text-gray-600">{{ index + 1 }}</td>
                      <!-- Row Date -->
                      <td class="px-3 py-2">
                        <input type="date" v-model="row.date"
                          @keydown.enter.prevent="handleEnterKey(index)"
                          class="w-full border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm" />
                      </td>
                      <!-- Vehicle -->
                      <td class="px-3 py-2" :ref="el => row.vehicleCell = el">
                        <div class="relative">
                          <div
                            class="border border-gray-300 rounded px-2 py-1 flex items-center justify-between cursor-pointer focus-within:ring-1 focus-within:ring-indigo-500"
                            @mousedown.prevent="toggleVehicleDropdown(row)">
                            <input v-model="row.search" type="text"
                              :placeholder="row.vehicle?.name || $t('labels.vehicle')"
                              class="outline-none flex-1 text-sm bg-transparent"
                              @keydown.enter.prevent
                              @keydown.escape="row.open = false"
                              @keydown="onDropdownKeydown($event, row, filteredVehicles(row), (sel) => selectVehicle(row, sel))"
                              @mousedown.prevent=""
                              @focus="row.open = true"
                              @blur="handleVehicleBlur(row)" />
                            <span class="text-gray-400">▾</span>
                          </div>
                        </div>
                        <!-- Dropdown (Teleported to Modal) -->
                        <teleport to=".modal-body-container" v-if="row.open">
                          <div
                            class="absolute border border-gray-200 bg-white rounded-md max-h-40 overflow-y-auto shadow-2xl"
                            :class="getVehicleDropdownClasses(row)" :style="getVehicleDropdownStyle(row)" @click.stop>
                            <div v-for="(v, vi) in filteredVehicles(row)" :key="v.id" @mousedown.prevent="selectVehicle(row, v)"
                              @mousemove="row.highlightedVehicleIndex = vi"
                              :class="['px-3 py-2 cursor-pointer text-sm border-b border-gray-50 last:border-b-0 text-start', vi === row.highlightedVehicleIndex ? 'bg-indigo-100' : 'hover:bg-indigo-50']">
                              {{ v.name }} {{ v.company ? `- ${v.company}` : '' }} {{ v.crusherNumber ? `(${v.crusherNumber})` : '' }}
                            </div>
                            <div @click="showAddVehicleDialog = true; row.open = false"
                              class="px-3 py-2 text-green-600 hover:bg-green-50 cursor-pointer text-sm font-medium text-start">
                              + {{ $t('labels.addNew') }}
                            </div>
                          </div>
                        </teleport>
                      </td>
                      <!-- Discount -->
                      <td class="px-3 py-2">
                        <input type="number" v-model.number="row.discount" step="0.01"
                          @keydown.enter.prevent="handleEnterKey(index)"
                          class="w-full border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 no-spinner" />
                      </td>
                      <!-- Company Capacity -->
                      <td class="px-3 py-2">
                        <input type="number" v-model.number="row.companyCapacity" step="0.01"
                          @keydown.enter.prevent="handleEnterKey(index)"
                          class="w-full border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 no-spinner" />
                      </td>
                      <!-- Count -->
                      <td class="px-3 py-2">
                        <input type="number" v-model.number="row.count" min="1" step="1"
                          class="w-full border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 no-spinner" />
                      </td>
                      <!-- Distance per Row -->
                      <td class="px-3 py-2">
                        <input type="number" v-model.number="row.distanceKm" step="0.1" min="0"
                          @keydown.tab="onLastFieldTab(index, $event)"
                          class="w-full border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 no-spinner" />
                      </td>
                      <!-- Total per Row -->
                      <td class="px-3 py-2 text-sm font-semibold text-indigo-600">
                        {{ formatNumber(totalPerRow(row)) }}
                      </td>
                      <!-- Actions -->
                      <td class="px-4 py-3 text-center">
                        <div class="flex justify-center gap-3">
                          <button @click="duplicateRow(index)" class="text-blue-600 hover:text-blue-800 transition"
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
                <span class="text-gray-700">{{ $t('transport.subtotal') }}:</span>
                <span class="text-gray-900 min-w-32 text-end">{{ formatNumber(subtotal) }}</span>
              </div>
              <div class="flex items-center justify-end gap-3">
                <span class="text-gray-700">{{ $t('transport.totalDiscount') }}:</span>
                <span class="text-red-600 min-w-32 text-end">-{{ formatNumber(totalDiscount) }}</span>
              </div>
              <div
                class="flex items-center justify-end gap-3 text-lg text-indigo-700 border-s-4 border-indigo-700 ps-6">
                <span class="text-indigo-900">{{ $t('transport.grandTotal') }}:</span>
                <span class="text-indigo-900 min-w-40 text-end font-bold">{{ formatNumber(grandTotal) }}</span>
              </div>
            </div>
            <!-- Save / Back Buttons -->
            <div class="mt-10 flex justify-end gap-6">
              <button @click="goBackToStep1"
                class="px-10 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition flex items-center gap-3">
                <ArrowLeftIcon class="w-6 h-6 transition-transform rtl:rotate-180" />
                {{ $t('common.back') }}
              </button>
              <button @click="saveData" :disabled="isSaving"
                class="px-10 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center gap-3">
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
          class="bg-green-600 text-white px-3 py-1 rounded">
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
          class="bg-green-600 text-white px-3 py-1 rounded">
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
          class="bg-green-600 text-white px-3 py-1 rounded">
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
          class="bg-green-600 text-white px-3 py-1 rounded">
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
  getContractors,
  getContractorsWithVehicles,
  createContractor,
  createVehicle,
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
} from '@heroicons/vue/24/outline'

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
      contractorDialogError: '',
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
      filters: {
        commonItemSearch: '',
        showCommonItemDropdown: false,
        commonFromLocSearch: '',
        showCommonFromLocDropdown: false,
        commonToLocSearch: '',
        showCommonToLocDropdown: false,
        commonContractorSearch: '',
        showCommonContractorDropdown: false
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
    subtotal() {
      return this.rows.reduce((sum, row) => sum + this.perTripBeforeDiscount(row), 0)
    },
    totalDiscount() {
      return this.rows.reduce((sum, row) => sum + (Number(row.discount) || 0), 0)
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
        this.commonData.date = new Date().toISOString().split('T')[0]
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
            this.commonData.area = this.locations.find(l => l.id === data.area.id) || null
            if (this.commonData.area) this.filters.commonToLocSearch = this.commonData.area.name
          }
          if (data.contractor?.id) {
            this.commonData.contractor = this.contractors.find(c => c.id === data.contractor.id) || null
            if (this.commonData.contractor) this.filters.commonContractorSearch = this.commonData.contractor.name
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
        const data = {
          date: this.commonData.date,
          item: this.commonData.item ? { id: this.commonData.item.id, name: this.commonData.item.name } : null,
          location: this.commonData.location ? { id: this.commonData.location.id, name: this.commonData.location.name } : null,
          area: this.commonData.area ? { id: this.commonData.area.id, name: this.commonData.area.name } : null,
          contractor: this.commonData.contractor ? { id: this.commonData.contractor.id, name: this.commonData.contractor.name } : null,
          distanceKm: this.commonData.distanceKm,
          firstKmPrice: this.commonData.firstKmPrice,
          perKmPrice: this.commonData.perKmPrice,
          notes: this.commonData.notes
        }
        localStorage.setItem('transportCreationModalCommonData', JSON.stringify(data))
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
        date: this.commonData.date || new Date().toISOString().split('T')[0],
        highlightedVehicleIndex: -1
      }
      if (this.commonData.contractor?.id) {
        const cv = this.contractorsWithVehicles.find(c => c.id === this.commonData.contractor.id)
        row.availableVehicles = cv?.vehicles || this.vehicles.filter(v => v.contractorId === this.commonData.contractor.id)
      } else {
        row.availableVehicles = [...this.vehicles]
      }
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
      return row.availableVehicles.filter(v =>
        v.name.toLowerCase().includes(q)
      )
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
      // include the row count so subtotal reflects multiple trips
      return base * (row.companyCapacity || 0) * (row.count || 1)
    },
    totalPerRow(row) {
      return Math.max(0, this.perTripBeforeDiscount(row) - (row.discount || 0))
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
        const [cRes, cvRes] = await Promise.all([
          getContractors({ mode: 'transport' }),
          typeof getContractorsWithVehicles === 'function'
            ? getContractorsWithVehicles({ mode: 'transport' })
            : Promise.resolve(null)
        ])
        console.log('getContractors response:', cRes)
        console.log('getContractorsWithVehicles response:', cvRes)
        // Improved parsing
        const extractArray = (res) => Array.isArray(res?.data) ? res.data : (res?.data?.items || res?.data?.data || [])
        this.contractors = extractArray(cRes)
        this.contractorsWithVehicles = extractArray(cvRes)
        // Extract vehicles from contractorsWithVehicles
        this.vehicles = this.contractorsWithVehicles.reduce((acc, c) => {
          if (Array.isArray(c.vehicles)) acc.push(...c.vehicles)
          return acc
        }, [])
        console.log('Processed contractors:', this.contractors.length)
        console.log('Processed vehicles:', this.vehicles.length)
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
        const created = res?.data
        if (created?.id) {
          const newContractor = this.contractors.find(c => c.id === created.id)
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
      const toSave = this.rows.filter(r => r.vehicle && r.companyCapacity > 0)
      if (!toSave.length) {
        this.saveError = this.$t('common.noData') || 'No data to save'
        this.isSaving = false
        return
      }
      try {
        for (const r of toSave) {
          const tripCount = Number(r.count) || 1
          const tripDistance = Number(r.distanceKm || 0)

          // Backend expects `location` and `area` as strings — send IDs as strings and validate presence
          const locId = this.commonData.location?.id ?? null
          const areaId = this.commonData.area?.id ?? null
          if (!locId || !areaId) {
            this.saveError = this.$t('common.missingLocationOrArea') || 'Location and area are required'
            this.isSaving = false
            return
          }

          await createTransport({
            date: r.date || this.commonData.date,
            contractorId: this.commonData.contractor?.id || null,
            itemId: this.commonData.item?.id || null,
            // include both the legacy id fields and the string fields the API expects
            locationId: locId,
            areaId: areaId,
            location: String(locId),
            area: String(areaId),
            numTrips: tripCount,
            distanceKm: tripDistance,
            vehicleId: r.vehicle?.id || null,
            companyCapacity: r.companyCapacity || 0,
            notes: this.commonData.notes || '',
            pricing: {
              firstKm: 1,
              firstKmPrice: this.commonData.firstKmPrice || 0,
              perKmPrice: this.commonData.perKmPrice || 0
            },
            discount: r.discount || 0,
            // variable data for the second stage
            data: {
              count: tripCount,
              distanceKm: tripDistance
            }
          })
        }
        this.saveCommonDataToStorage()
        this.$emit('saved')
        this.closeModal()
      } catch (err) {
        this.saveError = err?.response?.data?.message || this.$t('common.saveError')
      } finally {
        this.isSaving = false
      }
    },
    populateForm() {
      // Adapt for multi-row if needed; for now, assume single row edit
      if (this.transport) {
        this.commonData.date = this.transport.date?.split('T')[0] || ''
        this.commonData.item = this.items.find(i => i.id === this.transport.itemId) || null
        this.commonData.location = this.locations.find(l => l.id === this.transport.fromLocId) || null
        this.commonData.area = this.locations.find(l => l.id === this.transport.toLocId) || null
        this.commonData.contractor = this.contractors.find(c => c.id === this.transport.contractorId) || null
        this.commonData.distanceKm = parseFloat(this.transport.distanceKm) || 0
        this.commonData.firstKmPrice = parseFloat(this.transport.pricing?.firstKmPrice) || 0
        this.commonData.perKmPrice = parseFloat(this.transport.pricing?.perKmPrice) || 0
        this.commonData.notes = this.transport.notes || ''
        // For edit: populate a single row containing the transport's counts/distance
        this.currentStep = 2
        const vehicle = this.vehicles.find(v => v.id === this.transport.vehicleId)
        const row = this.createEmptyRow()
        row.vehicle = vehicle
        row.search = vehicle?.name || ''
        row.discount = parseFloat(this.transport.discount) / (this.transport.numTrips || 1) || 0 // approximate per-row
        row.companyCapacity = vehicle?.companyCapacity || 0
        row.count = Number(this.transport.numTrips) || 1
        row.distanceKm = parseFloat(this.transport.distanceKm) || this.commonData.distanceKm || 0
        row.date = this.transport.date?.split('T')[0] || this.commonData.date || new Date().toISOString().split('T')[0]
        this.rows = [row]
      }
    },
    selectCommonItem(item) {
      this.commonData.item = item
      this.filters.commonItemSearch = item.name
      this.filters.showCommonItemDropdown = false
    }
  },
  mounted() {
    document.addEventListener('click', this.handleGlobalClick)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleGlobalClick)
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