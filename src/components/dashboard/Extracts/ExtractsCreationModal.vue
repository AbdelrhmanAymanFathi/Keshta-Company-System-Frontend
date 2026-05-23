<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'">
    <button
      v-if="showTriggerButton"
      @click="openModal"
      class="theme-button px-3 py-2 text-sm rounded-lg  font-medium shadow-md transition sm:px-6 sm:py-3"
    >
      {{ triggerText }}
    </button>

    <teleport to="body">
      <transition name="kc-modal">
        <div
          v-if="isOpen"
          class="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4 overflow-hidden"
          :dir="isRTL ? 'rtl' : 'ltr'"
          @click.self="closeModal"
        >
          <div class="kc-modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] max-h-[95vh] flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <h2 class="text-2xl font-bold theme-heading">
              {{ currentStep === 1 ? modalTitleComputed : ($t('labels.enterDetails') || 'Enter Details') }}
            </h2>
            <button
              @click="closeModal"
              class="theme-text-muted hover:theme-text-primary text-3xl leading-none focus:outline-none"
            >
              ×
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 modal-body-container relative">
            <div v-if="currentStep === 1" class="w-full">
              <h3 class="text-lg font-bold mb-8 text-center theme-text-primary">{{ $t('labels.step1BasicData') }}</h3>

              <div class="max-w-6xl mx-auto">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  <div>
                    <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                      {{ $t('labels.dateFrom') || 'Date From' }} <span class="text-red-600">*</span>
                    </label>
                    <div class="relative">
                      <CalendarDaysIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                      <DateField
                        v-model="commonData.dateFrom"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2.5 ps-11 pe-4 text-sm theme-input-focus transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                      {{ $t('labels.dateTo') || 'Date To' }} <span class="text-red-600">*</span>
                    </label>
                    <div class="relative">
                      <CalendarDaysIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                      <DateField
                        v-model="commonData.dateTo"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2.5 ps-11 pe-4 text-sm theme-input-focus transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                      {{ $t('labels.site') }} <span class="text-red-600">*</span>
                    </label>
                    <div class="relative flex items-center gap-2">
                      <div class="flex-1 relative">
                        <SearchDropdown
                          v-model="filters.commonSiteSearch"
                          :items="sites"
                          :allItems="sites"
                          :placeholder="$t('labels.site')"
                          :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                          @select="selectSite"
                        >
                          <template #prefix>
                            <MapPinIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                          </template>
                          <template #afterOptions>
                            <div
                              @click="showAddSite = true"
                              style="color: #10b981;"
                              class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100"
                            >
                              + {{ $t('supply.addNewSite') }}
                            </div>
                          </template>
                        </SearchDropdown>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium theme-text-secondary mb-1.5">{{ $t('labels.area') }}</label>
                    <div class="relative flex items-center gap-2">
                      <div class="flex-1 relative">
                        <SearchDropdown
                          v-model="filters.commonAreaSearch"
                          :items="commonAvailableAreas"
                          :allItems="commonAvailableAreas"
                          :placeholder="$t('labels.area')"
                          :disabled="!commonData.site"
                          :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm disabled:bg-gray-100 disabled:cursor-not-allowed'"
                          @select="selectArea"
                        >
                          <template #prefix>
                            <MapIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                          </template>
                          <template #afterOptions>
                            <div
                              v-if="commonData.site"
                              @click="showAddArea = true"
                              style="color: #10b981;"
                              class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100"
                            >
                              + {{ $t('supply.addNewArea') }}
                            </div>
                          </template>
                        </SearchDropdown>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                      {{ $t('labels.contractor') }} <span class="text-red-600">*</span>
                    </label>
                    <div class="relative flex items-center gap-2">
                      <div class="flex-1 relative">
                        <SearchDropdown
                          v-model="filters.commonContractorSearch"
                          :items="contractors"
                          :allItems="contractors"
                          :placeholder="$t('labels.contractor')"
                          :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                          @select="selectContractor"
                        >
                          <template #prefix>
                            <UserGroupIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                          </template>
                          <template #afterOptions>
                            <div
                              @click="showAddContractorDialog = true"
                              style="color: #10b981;"
                              class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100"
                            >
                              + {{ $t('labels.addNew') }}
                            </div>
                          </template>
                        </SearchDropdown>
                      </div>
                    </div>
                  </div>

                  <!-- <div>
                    <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                      {{ $t('labels.crusher') }} <span class="text-red-600">*</span>
                    </label>
                    <div class="relative flex items-center gap-2">
                      <div class="flex-1 relative">
                        <SearchDropdown
                          v-model="filters.commonCrusherSearch"
                          :items="crushers"
                          :allItems="crushers"
                          :placeholder="$t('labels.crusher')"
                          :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                          @select="selectCrusher"
                        >
                          <template #prefix>
                            <WrenchScrewdriverIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                          </template>
                          <template #afterOptions>
                            <div
                              @click="showAddCrusherDialog = true"
                              style="color: #10b981;"
                              class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100"
                            >
                              + {{ $t('labels.addNew') }}
                            </div>
                          </template>
                        </SearchDropdown>
                      </div>
                    </div>
                  </div> -->

                  <div class="col-span-full">
                    <label class="block text-sm font-medium theme-text-secondary mb-1.5">{{ $t('labels.notes') }}</label>
                    <textarea
                      v-model="commonData.notes"
                      rows="3"
                      class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm theme-input-focus transition"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div class="mt-10 flex justify-end gap-6">
                <button
                  @click="closeModal"
                  class="px-10 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium theme-text-secondary transition"
                >
                  {{ $t('labels.cancel') }}
                </button>
                <button
                  @click="goToStep2"
                  :disabled="!isStep1Valid()"
                  class="px-10 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed theme-text-light rounded-lg font-medium transition flex items-center gap-3"
                >
                  {{ $t('labels.next') }}
                  <ArrowRightIcon class="w-6 h-6 transition-transform rtl:rotate-180" />
                </button>
              </div>
            </div>

            <div v-else class="w-full">
              <div class="flex items-center justify-between mb-8">
                <button
                  @click="goBackToStep1"
                  class="flex items-center gap-3 theme-text hover:theme-accent-muted font-medium transition"
                >
                  <ArrowLeftIcon class="w-6 h-6 transition-transform rtl:rotate-180" />
                  {{ $t('labels.back') }}
                </button>
                <h3 class="text-lg font-bold theme-text-primary">{{ $t('labels.step2Data') }}</h3>
                <div></div>
              </div>

              <div class="theme-dashboard-bg-soft border theme-border rounded-lg p-5 mb-8">
                <h4 class="text-sm font-bold theme-accent-muted mb-4">{{ $t('labels.summary') }}</h4>
                <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                  <div class="flex flex-col">
                    <dt class="font-semibold theme-text-secondary">{{ $t('labels.dateFrom') || 'Date From' }}:</dt>
                    <dd class="theme-text-primary mt-1">{{ commonData.dateFrom || '-' }}</dd>
                  </div>
                  <div class="flex flex-col">
                    <dt class="font-semibold theme-text-secondary">{{ $t('labels.dateTo') || 'Date To' }}:</dt>
                    <dd class="theme-text-primary mt-1">{{ commonData.dateTo || '-' }}</dd>
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
                  <!-- <div class="flex flex-col">
                    <dt class="font-semibold theme-text-secondary">{{ $t('labels.crusher') }}:</dt>
                    <dd class="theme-text-primary mt-1">{{ commonData.crusher?.name || '-' }}</dd>
                  </div> -->
                  <div class="flex flex-col col-span-full">
                    <dt class="font-semibold theme-text-secondary">{{ $t('labels.notes') }}:</dt>
                    <dd class="theme-text-primary mt-1">{{ commonData.notes || '-' }}</dd>
                  </div>
                </dl>
              </div>

              <div class="mb-6">
                <button
                  @click="addRow"
                  class="bg-green-600 theme-text-light px-4 py-2 rounded-lg hover:bg-green-700 font-medium shadow-md transition"
                >
                  + {{ $t('labels.addRow') }}
                </button>
              </div>

              <div class="mb-8 relative border border-gray-200 rounded-lg overflow-visible p-2">
                <div class="overflow-x-auto overflow-y-visible w-full">
                  <table ref="tableRef" class="w-full divide-y divide-gray-200 border rounded-lg">
                    <thead class="theme-dashboard-bg-soft sticky top-0 z-10">
                      <tr>
                        <th class="px-4 py-3 text-center text-xs font-medium theme-text-secondary w-12">{{ $t('#') }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{ $t('labels.item') }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{ $t('labels.quantity') || 'Quantity' }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{ $t('labels.price') }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{ $t('labels.discount') || 'Discount' }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{ $t('labels.total') }}</th>
                        <th class="px-4 py-3 text-center text-xs font-medium theme-text-secondary">{{ $t('labels.actions') }}</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr v-for="(row, index) in rows" :key="row.id">
                        <td class="px-4 py-3 text-center text-sm theme-text-secondary">{{ index + 1 }}</td>
                        <td class="px-3 py-2" :ref="el => row.itemCell = el">
                          <div class="relative">
                            <div
                              class="border border-gray-300 rounded px-2 py-1 flex items-center justify-between cursor-pointer focus-within:theme-input-focus"
                              @mousedown.prevent="toggleItemDropdown(row)"
                            >
                              <input
                                v-model="row.itemSearch"
                                type="text"
                                :placeholder="row.item?.name || $t('labels.item')"
                                class="outline-none flex-1 text-sm bg-transparent"
                                @keydown.enter.prevent
                                @keydown.escape="row.itemOpen = false"
                                @keydown="onItemDropdownKeydown($event, row)"
                                @mousedown.prevent=""
                                @focus="row.itemOpen = true"
                                @blur="row.itemOpen = false"
                              />
                              <span class="theme-caption">▾</span>
                            </div>

                            <teleport to=".modal-body-container" v-if="row.itemOpen">
                              <div
                                class="extract-item-dropdown absolute border border-gray-200 bg-white rounded-md max-h-40 overflow-y-auto shadow-2xl z-[9999]"
                                :style="getItemDropdownStyle(row)"
                                @click.stop
                              >
                                <div
                                  v-if="filteredExtractItems(row).length === 0"
                                  class="px-3 py-2 text-sm theme-text-muted text-start"
                                >
                                  {{ $t('labels.noResults') || 'No items found' }}
                                </div>

                                <div
                                  v-for="(item, itemIndex) in filteredExtractItems(row)"
                                  :key="item.id"
                                  @mousedown.prevent="selectRowItem(row, item)"
                                  @mousemove="row.highlightedItemIndex = itemIndex"
                                  :class="[
                                    'px-3 py-2 cursor-pointer text-sm border-b border-gray-50 last:border-b-0 text-start',
                                    itemIndex === row.highlightedItemIndex ? 'theme-icon-bg' : 'theme-hover-soft'
                                  ]"
                                >
                                  {{ item.name }}
                                </div>

                                <!-- <div
                                  @mousedown.prevent="pendingItemRow = row; row.itemOpen = false; showAddExportItemDialog = true"
                                  class="px-3 py-2 text-green-600 hover:bg-green-50 cursor-pointer text-sm font-medium text-start"
                                >
                                  + {{ $t('labels.addNew') }}
                                </div> -->
                              </div>
                            </teleport>
                          </div>
                        </td>
                        <td class="px-3 py-2">
                          <input
                            :ref="el => row.quantityInput = el"
                            v-model="row.quantity"
                            type="number"
                            step="1"
                            @input="syncRowTotal(row)"
                            @keydown.enter.prevent="handleEnterKey(index)"
                            class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus no-spinner"
                          />
                        </td>
                        
                        <td class="px-3 py-2">
                          <input
                            v-model.number="row.price"
                            type="number"
                            min="0"
                            step="0.01"
                            @input="syncRowTotal(row)"
                            @keydown.enter.prevent="handleEnterKey(index)"
                            class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus no-spinner"
                          />
                        </td>
                        <td class="px-3 py-2">
                          <input
                            v-model.number="row.discount"
                            type="number"
                            min="0"
                            step="0.01"
                            @input="syncRowTotal(row)"
                            @keydown.tab="onLastFieldTab(index, $event)"
                            @keydown.enter.prevent="handleEnterKey(index)"
                            class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus no-spinner"
                          />
                        </td>
                        <td class="px-3 py-2 text-sm font-semibold theme-text">
                          {{ formatCurrency(totalPerRow(row)) }}
                        </td>
                        <td class="px-4 py-3 text-center">
                          <div class="flex justify-center gap-3">
                            <button @click="duplicateRow(index)" class="theme-text hover:theme-accent-muted transition" title="Duplicate" tabindex="-1">
                              <DocumentDuplicateIcon class="w-5 h-5" />
                            </button>
                            <button @click="removeRow(index)" class="text-red-600 hover:text-red-800 transition" title="Delete" tabindex="-1">
                              <TrashIcon class="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-6 text-sm font-semibold">
                <div class="flex items-center justify-end gap-3">
                  <span class="theme-text-secondary">{{ $t('labels.subtotal') }}:</span>
                  <span class="theme-text-primary min-w-32 text-end">{{ formatCurrency(subtotal) }}</span>
                </div>
              </div>

              <div class="mt-10 flex justify-end gap-6">
                <button
                  @click="goBackToStep1"
                  class="px-10 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium theme-text-secondary transition flex items-center gap-3"
                >
                  <ArrowLeftIcon class="w-6 h-6 transition-transform rtl:rotate-180" />
                  {{ $t('labels.back') }}
                </button>
                <button
                  @click="saveData"
                  :disabled="isSaving"
                  class="px-10 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed theme-text-light rounded-lg font-medium transition flex items-center gap-3"
                >
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

    <div v-if="showAddSite" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
      <div class="bg-white p-6 rounded shadow w-96">
        <h3 class="text-lg font-bold mb-2">{{ $t('supply.addSite') }}</h3>
        <input v-model="newSiteName" class="w-full border rounded px-2 py-1 mb-3" :placeholder="$t('supply.siteName')" />
        <div class="flex gap-2 justify-end">
          <button @click="showAddSite = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel') }}</button>
          <button @click="addSite" :disabled="!newSiteName || addingLocation" class="bg-green-600 theme-text-light px-3 py-1 rounded">
            {{ addingLocation ? $t('supply.adding') : $t('labels.add') }}
          </button>
        </div>
        <div v-if="locationError" class="text-red-600 text-sm mt-2">{{ locationError }}</div>
      </div>
    </div>

    <div v-if="showAddArea" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
      <div class="bg-white p-6 rounded shadow w-96">
        <h3 class="text-lg font-bold mb-2">{{ $t('supply.addArea') }}</h3>
        <input v-model="newAreaName" class="w-full border rounded px-2 py-1 mb-3" :placeholder="$t('supply.areaName')" />
        <div class="flex gap-2 justify-end">
          <button @click="showAddArea = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel') }}</button>
          <button @click="addArea" :disabled="!newAreaName || addingLocation" class="bg-green-600 theme-text-light px-3 py-1 rounded">
            {{ addingLocation ? $t('supply.adding') : $t('labels.add') }}
          </button>
        </div>
        <div v-if="locationError" class="text-red-600 text-sm mt-2">{{ locationError }}</div>
      </div>
    </div>

    <div v-if="showAddContractorDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
      <div class="bg-white p-6 rounded shadow w-96">
        <h3 class="text-lg font-bold mb-2">{{ $t('contractors.addContractor') }}</h3>
        <input v-model="newContractorName" class="w-full border rounded px-2 py-1 mb-3" :placeholder="$t('contractors.name')" />
        <div class="flex gap-2 justify-end">
          <button @click="showAddContractorDialog = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel') }}</button>
          <button @click="createNewContractor" :disabled="!newContractorName || creatingContractor" class="bg-green-600 theme-text-light px-3 py-1 rounded">
            {{ creatingContractor ? $t('supply.adding') : $t('labels.add') }}
          </button>
        </div>
        <div v-if="contractorDialogError" class="text-red-600 text-sm mt-2">{{ contractorDialogError }}</div>
      </div>
    </div>

    <div v-if="showAddCrusherDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
      <div class="bg-white p-6 rounded shadow w-96">
        <h3 class="text-lg font-bold mb-2">{{ $t('crushers.addCrusher') }}</h3>
        <input v-model="newCrusherName" class="w-full border rounded px-2 py-1 mb-3" :placeholder="$t('crushers.name')" />
        <div class="flex gap-2 justify-end">
          <button @click="showAddCrusherDialog = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel') }}</button>
          <button @click="createNewCrusher" :disabled="!newCrusherName || creatingCrusher" class="bg-green-600 theme-text-light px-3 py-1 rounded">
            {{ creatingCrusher ? $t('supply.adding') : $t('labels.add') }}
          </button>
        </div>
        <div v-if="crusherDialogError" class="text-red-600 text-sm mt-2">{{ crusherDialogError }}</div>
      </div>
    </div>

    <div v-if="showAddExportItemDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[2000]">
      <div class="bg-white p-6 rounded shadow w-96">
        <h3 class="text-lg font-bold mb-3">{{ $t('labels.addExportItem') || 'Add Export Item' }}</h3>
        <input v-model="newExportItemForm.name" :placeholder="$t('labels.itemName') || 'Item Name'" class="w-full border rounded px-2 py-1 mb-3" />
        <input v-model.number="newExportItemForm.currentPrice" type="number" step="0.01" :placeholder="$t('labels.price')" class="w-full border rounded px-2 py-1 mb-3" />
        <div class="flex gap-2 justify-end">
          <button @click="showAddExportItemDialog = false" class="px-3 py-1 border rounded">{{ $t('labels.cancel') }}</button>
          <button
            @click="createNewExportItem"
            :disabled="!newExportItemForm.name || !newExportItemForm.currentPrice || creatingExportItem"
            class="bg-green-600 theme-text-light px-3 py-1 rounded"
          >
            {{ creatingExportItem ? $t('supply.adding') : $t('labels.add') }}
          </button>
        </div>
        <div v-if="exportItemDialogError" class="text-red-600 text-sm mt-2">{{ exportItemDialogError }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  CalendarDaysIcon,
  MapPinIcon,
  MapIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
import DateField from '@/components/shared/DateField.vue'
import normalizeItem from '@/utils/normalizeItem'
import { parseCreateExtract } from '@/validators/extracts'
import { createExtract } from '@/services/extracts'
import {
  getContractors,
  getLocations,
  getCrushers,
  getExportItems,
  createLocation,
  createContractor,
  createCrusher,
  createExportItem
} from '@/api'

export default {
  name: 'ExtractsCreationModal',
  components: {
    SearchDropdown,
    DateField,
    CalendarDaysIcon,
    MapPinIcon,
    MapIcon,
    UserGroupIcon,
    WrenchScrewdriverIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckIcon,
    DocumentDuplicateIcon,
    TrashIcon
  },
  emits: ['saved'],
  props: {
    showTriggerButton: { type: Boolean, default: true },
    triggerButtonText: { type: String, default: '' },
    modalTitle: { type: String, default: '' }
  },
  data() {
    return {
      isOpen: false,
      currentStep: 1,
      isSaving: false,
      saveError: '',
      locationError: '',
      contractorDialogError: '',
      crusherDialogError: '',
      exportItemDialogError: '',
      addingLocation: false,
      creatingContractor: false,
      creatingCrusher: false,
      creatingExportItem: false,
      tableRef: null,
      commonData: this.getDefaultCommonData(),
      rows: [],
      items: [],
      contractors: [],
      locations: [],
      crushers: [],
      sites: [],
      allLocations: [],
      filters: {
        commonSiteSearch: '',
        commonAreaSearch: '',
        commonContractorSearch: '',
        commonCrusherSearch: ''
      },
      showAddSite: false,
      newSiteName: '',
      showAddArea: false,
      newAreaName: '',
      showAddContractorDialog: false,
      newContractorName: '',
      showAddCrusherDialog: false,
      newCrusherName: '',
      showAddExportItemDialog: false,
      pendingItemRow: null,
      newExportItemForm: {
        name: '',
        currentPrice: ''
      }
    }
  },
  computed: {
    triggerText() {
      return this.triggerButtonText || (this.$t ? this.$t('dashboard.newExtract') + ' +' : 'New Extract +')
    },
    modalTitleComputed() {
      return this.modalTitle || (this.$t ? this.$t('dashboard.newExtract') : 'New Extract')
    },
    isRTL() {
      return this.$i18n?.locale === 'ar'
    },
    extractItems() {
      return this.items.filter(item => item && (item.availableForExtracts === true || item.availableForExports === true))
    },
    commonAvailableAreas() {
      if (!this.commonData.site) return []
      if (Array.isArray(this.commonData.site.children) && this.commonData.site.children.length) {
        return this.commonData.site.children
      }
      return this.allLocations.filter(location => location.parentId === this.commonData.site.id)
    },
    subtotal() {
      return this.rows.reduce((sum, row) => sum + this.totalPerRow(row), 0)
    }
  },
  watch: {
    '$i18n.locale'() {
      if (this.isOpen || this.items.length) this.loadExportItems()
    }
  },
  mounted() {
    document.addEventListener('click', this.handleGlobalClick)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleGlobalClick)
  },
  methods: {
    handleGlobalClick(e) {
      const isClickInDropdown = e.target.closest('.extract-item-dropdown')
      const isClickInTable = e.target.closest('table')

      if (!isClickInDropdown && !isClickInTable) {
        this.rows.forEach(row => {
          row.itemOpen = false
        })
      }
    },

    toggleItemDropdown(row) {
      this.rows.forEach(r => {
        if (r !== row) r.itemOpen = false
      })

      row.itemOpen = !row.itemOpen

      if (row.itemOpen) {
        this.$nextTick(() => {
          const input = row.itemCell?.querySelector('input')
          if (input) input.focus()
        })
      }
    },

    filteredExtractItems(row) {
      const q = (row.itemSearch || '').toLowerCase().trim()

      if (!q) return this.extractItems

      return this.extractItems.filter(item =>
        (item.name || '').toLowerCase().includes(q)
      )
    },

    getItemDropdownStyle(row) {
      if (!row.itemCell) return {}

      const rect = row.itemCell.getBoundingClientRect()
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

    onItemDropdownKeydown(event, row) {
      const items = this.filteredExtractItems(row)

      if (!items.length) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        row.highlightedItemIndex = Math.min(
          (row.highlightedItemIndex || 0) + 1,
          items.length - 1
        )
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        row.highlightedItemIndex = Math.max(
          (row.highlightedItemIndex || 0) - 1,
          0
        )
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        const selected = items[row.highlightedItemIndex || 0]
        if (selected) this.selectRowItem(row, selected)
      }
    },
    getDefaultCommonData() {
      return {
        dateFrom: '',
        dateTo: '',
        site: null,
        area: null,
        contractor: null,
        crusher: null,
        notes: '',
        idempotencyKey: ''
      }
    },
    getDefaultRow() {
      return {
        id: Date.now() + Math.random(),
        itemId: '',
        item: null,
        itemSearch: '',
        itemOpen: false,
        highlightedItemIndex: 0,
        itemCell: null,
        quantity: '',
        price: '',
        discount: 0,
        total: 0,
        quantityInput: null
      }
    },
    resetState() {
      this.currentStep = 1
      this.isSaving = false
      this.saveError = ''
      this.locationError = ''
      this.contractorDialogError = ''
      this.crusherDialogError = ''
      this.exportItemDialogError = ''
      this.commonData = this.getDefaultCommonData()
      this.rows = []
      this.filters = {
        commonSiteSearch: '',
        commonAreaSearch: '',
        commonContractorSearch: '',
        commonCrusherSearch: ''
      }
      this.newSiteName = ''
      this.newAreaName = ''
      this.newContractorName = ''
      this.newCrusherName = ''
      this.newExportItemForm = { name: '', currentPrice: '' }
      this.pendingItemRow = null
    },
    async openModal() {
      this.resetState()
      this.isOpen = true
      await this.loadInitialData()
      this.loadCommonDataFromStorage()
    },
    closeModal() {
      this.saveCommonDataToStorage()
      this.isOpen = false
      this.resetState()
    },
    async loadInitialData() {
      try {
        await Promise.all([
          this.refreshLocations(),
          this.loadLookups(),
          this.loadExportItems()
        ])
      } catch (error) {
        console.error('Failed to load initial data:', error)
      }
    },
    async refreshLocations() {
      try {
        const res = await getLocations()
        this.allLocations = Array.isArray(res.data) ? res.data : []
        this.sites = this.allLocations.filter(location => !location.parentId)
      } catch (error) {
        console.warn('Failed to refresh locations', error)
      }
    },
    async loadLookups() {
      try {
        const [contractorsRes, crushersRes] = await Promise.all([
          getContractors({ mode: 'extracts' }),
          getCrushers()
        ])

        const extractArray = (res) => {
          if (res?.data?.items) return Array.isArray(res.data.items) ? res.data.items : []
          if (Array.isArray(res?.data)) return res.data
          if (res?.data && typeof res.data === 'object') {
            const firstValue = Object.values(res.data)[0]
            return Array.isArray(firstValue) ? firstValue : []
          }
          return []
        }

        this.contractors = extractArray(contractorsRes)
        this.crushers = extractArray(crushersRes)
      } catch (error) {
        console.error('loadLookups failed:', error)
      }
    },
    async loadExportItems() {
      try {
        const res = await getExportItems({ mode: 'extracts' })
        const raw = Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || [])
        this.items = raw.map(normalizeItem)
      } catch (error) {
        console.warn('Failed to load export items', error)
      }
    },
    selectRowItem(row, item) {
      if (!row || !item) return

      row.item = item
      row.itemId = item.id
      row.itemSearch = item.name
      row.itemOpen = false
      row.highlightedItemIndex = 0

      const maybePrice =
        item.currentPrice ??
        item.defaultExtractPrice ??
        item.defaultExportPrice ??
        item.price ??
        item.current_price

      const parsedPrice = Number(maybePrice)

      if (!Number.isNaN(parsedPrice)) {
        row.price = parsedPrice
      }

      this.syncRowTotal(row)

      this.$nextTick(() => {
        row.quantityInput?.focus?.()
      })
    },
    selectSite(site) {
      this.commonData.site = site
      this.filters.commonSiteSearch = site?.name || ''
      this.commonData.area = null
      this.filters.commonAreaSearch = ''
    },
    selectArea(area) {
      this.commonData.area = area
      this.filters.commonAreaSearch = area?.name || ''
    },
    selectContractor(contractor) {
      this.commonData.contractor = contractor
      this.filters.commonContractorSearch = contractor?.name || ''
    },
    selectCrusher(crusher) {
      this.commonData.crusher = crusher
      this.filters.commonCrusherSearch = crusher?.name || ''
    },
    isStep1Valid() {
      return Boolean(
        this.commonData.dateFrom &&
        this.commonData.dateTo &&
        this.commonData.dateTo >= this.commonData.dateFrom &&
        this.commonData.site &&
        this.commonData.contractor
      )
    },
    goToStep2() {
      if (!this.isStep1Valid()) return
      this.currentStep = 2
      if (!this.rows.length) {
        this.rows = [this.getDefaultRow()]
      }
    },
    goBackToStep1() {
      this.currentStep = 1
    },
    syncRowTotal(row) {
      // const price = Number(row.price || 0)
      // const quantity = Math.max(1, Number(row.quantity || 0))
      // row.quantity = quantity
      row.total = this.totalPerRow(row)
    },
    totalPerRow(row) {
      const quantity = row.quantity === '' || row.quantity === null || row.quantity === undefined
        ? 0
        : Number(row.quantity)

      const price = row.price === '' || row.price === null || row.price === undefined
        ? 0
        : Number(row.price)

      const discount = row.discount === '' || row.discount === null || row.discount === undefined
        ? 0
        : Number(row.discount)

      return Math.max(0, (quantity * price) - Math.max(0, discount))
    },
    addRow() {
      this.rows.push(this.getDefaultRow())
    },
    duplicateRow(index) {
      const source = this.rows[index]
      if (!source) return
      const copy = {
        ...JSON.parse(JSON.stringify(source)),
        id: Date.now() + Math.random(),
        quantityInput: null
      }
      this.rows.splice(index + 1, 0, copy)
    },
    removeRow(index) {
      this.rows.splice(index, 1)
      if (!this.rows.length) this.addRow()
    },
    handleEnterKey(index) {
      const newRowIndex = this.rows.length
      this.addRow()
      this.$nextTick(() => {
        if (!this.tableRef) return
        const allRows = this.tableRef.querySelectorAll('tbody tr')
        const newRow = allRows[newRowIndex]
        const firstInput = newRow?.querySelector('input[type="number"]')
        firstInput?.focus()
      })
    },
    onLastFieldTab(index, event) {
      if (event.shiftKey) return
      if (event.key === 'Tab' && index === this.rows.length - 1) {
        event.preventDefault()
        const newRowIndex = this.rows.length
        this.addRow()
        this.$nextTick(() => {
          if (!this.tableRef) return
          const allRows = this.tableRef.querySelectorAll('tbody tr')
          const newRow = allRows[newRowIndex]
          const firstInput = newRow?.querySelector('input[type="number"]')
          firstInput?.focus()
        })
      }
    },
    formatCurrency(value) {
      if (value === undefined || value === null || value === '') return '-'
      const number = Number(value)
      if (Number.isNaN(number)) return value
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(number)
    },
    toNumericId(value) {
      if (value === '' || value === null || value === undefined) return undefined
      const numericValue = Number(value)
      return Number.isFinite(numericValue) ? numericValue : undefined
    },
    genIdempotencyKey() {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
      return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    },
    async saveData() {
      this.saveError = ''
      this.isSaving = true

      try {

        
        // const lines = this.rows
        //   .map(row => {
        //     const quantity = Number(row.quantity)
        //     const rawPrice = row.price === '' || row.price === null || row.price === undefined ? null : Number(row.price)
        //     const price = rawPrice !== null && !Number.isNaN(rawPrice) ? rawPrice : undefined

        //     if (!row.quantity || Number.isNaN(quantity) || quantity <= 0) {
        //       throw new Error('Quantity is required')
        //     }

        //     const line = {
        //       itemId: this.toNumericId(row.itemId),
        //       quantity
        //     }
        //     if (price !== undefined) {
        //       line.price = price
        //       line.total = Number((price * quantity).toFixed(2))
        //     }
        //     return line
        //   })
        //   .filter(line => line.itemId && line.quantity > 0)

        // if (!lines.length) {
        //   this.saveError = this.$t('labels.noData') || 'No data'
        //   this.isSaving = false
        //   return
        // }

        const payload = {
          dateFrom: this.commonData.dateFrom,
          dateTo: this.commonData.dateTo,
          contractorId: this.toNumericId(this.commonData.contractor?.id),
          locationId: this.toNumericId(this.commonData.site?.id),
          areaId: this.toNumericId(this.commonData.area?.id),
          notes: this.commonData.notes || '',
          total: Number(this.subtotal.toFixed(2)),
          lines: this.rows.map(row => ({
            itemId: Number(row.itemId),
            quantity: Number(row.quantity),
            price: Number(row.price),
            discount: Math.max(0, Number(row.discount || 0)),
            total: Number(Math.max(0, Number(row.price) * Number(row.quantity)).toFixed(2))
          })),
          idempotencyKey: this.commonData.idempotencyKey || this.genIdempotencyKey()
        }

        parseCreateExtract(payload)

        const res = await createExtract(payload)
        this.$emit('saved', res)
        this.closeModal()
      } catch (error) {
        console.error('Failed to create extract', error)
        this.saveError = error?.response?.data?.message || error?.message || 'Save failed'
      } finally {
        this.isSaving = false
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
          const newSite = this.allLocations.find(location => location.id === created.id)
          if (newSite) {
            this.commonData.site = newSite
            this.filters.commonSiteSearch = newSite.name
          }
        }
        this.showAddSite = false
        this.newSiteName = ''
      } catch (error) {
        this.locationError = error?.response?.data?.message || 'Failed to add site'
      } finally {
        this.addingLocation = false
      }
    },
    async addArea() {
      if (!this.newAreaName?.trim() || !this.commonData.site?.id) return
      this.addingLocation = true
      try {
        const res = await createLocation({ name: this.newAreaName.trim(), parentId: this.commonData.site.id })
        await this.refreshLocations()
        const created = res?.data
        if (created?.id) {
          const newArea = this.allLocations.find(location => location.id === created.id)
          if (newArea) {
            this.commonData.area = newArea
            this.filters.commonAreaSearch = newArea.name
          }
        }
        this.showAddArea = false
        this.newAreaName = ''
      } catch (error) {
        this.locationError = error?.response?.data?.message || 'Failed to add area'
      } finally {
        this.addingLocation = false
      }
    },
    async createNewContractor() {
      const name = this.newContractorName.trim()
      if (!name) return
      this.creatingContractor = true
      this.contractorDialogError = ''
      try {
        const res = await createContractor({ name })
        const createdList = res.normalized || (Array.isArray(res.data) ? res.data : [res.data])
        await this.loadLookups()
        const chosen = createdList.find(item => item.availableForExtracts) || createdList.find(item => item.availableForExports) || createdList[0]
        const contractor = this.contractors.find(item => item.id === chosen?.id)
        if (contractor) {
          this.commonData.contractor = contractor
          this.filters.commonContractorSearch = contractor.name
        }
        this.newContractorName = ''
        this.showAddContractorDialog = false
      } catch (error) {
        this.contractorDialogError = error?.response?.data?.message || error?.message || 'Error'
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
        await this.loadLookups()
        const crusher = this.crushers.find(item => item.id === res?.data?.id)
        if (crusher) {
          this.commonData.crusher = crusher
          this.filters.commonCrusherSearch = crusher.name
        }
        this.newCrusherName = ''
        this.showAddCrusherDialog = false
      } catch (error) {
        this.crusherDialogError = error?.response?.data?.message || error?.message || 'Error'
      } finally {
        this.creatingCrusher = false
      }
    },
    async createNewExportItem() {
      const name = this.newExportItemForm.name?.trim()
      const currentPrice = this.newExportItemForm.currentPrice
      if (!name || !currentPrice) {
        this.exportItemDialogError = 'All fields required'
        return
      }

      this.creatingExportItem = true
      this.exportItemDialogError = ''

      try {
        const payload = {
          name,
          currentPrice: Number(currentPrice),
          defaultExtractPrice: Number(currentPrice),
          availableForExports: true,
          availableForExtracts: true
        }
        const res = await createExportItem(payload)
        const newItem = res?.data
        await this.loadExportItems()
        const updatedItem = this.extractItems.find(item => item.id === newItem?.id)
        if (updatedItem && this.pendingItemRow) this.selectRowItem(this.pendingItemRow, updatedItem)
        this.newExportItemForm = { name: '', currentPrice: '' }
        this.pendingItemRow = null
        this.showAddExportItemDialog = false
      } catch (error) {
        this.exportItemDialogError = error?.response?.data?.message || error?.message || 'Error'
      } finally {
        this.creatingExportItem = false
      }
    },
    saveCommonDataToStorage() {
      try {
        const data = {
          dateFrom: this.commonData.dateFrom,
          dateTo: this.commonData.dateTo,
          site: this.commonData.site ? { id: this.commonData.site.id, name: this.commonData.site.name } : null,
          area: this.commonData.area ? { id: this.commonData.area.id, name: this.commonData.area.name } : null,
          contractor: this.commonData.contractor ? { id: this.commonData.contractor.id, name: this.commonData.contractor.name } : null,
          crusher: this.commonData.crusher ? { id: this.commonData.crusher.id, name: this.commonData.crusher.name } : null,
          notes: this.commonData.notes
        }
        localStorage.setItem('extractsCreationModalCommonData', JSON.stringify(data))
      } catch (err) {
        console.warn('Failed to save extracts data:', err)
      }
    },
    loadCommonDataFromStorage() {
      try {
        const saved = localStorage.getItem('extractsCreationModalCommonData')
        if (saved) {
          const data = JSON.parse(saved)
          console.log('📦 Loaded extracts data from storage:', data)
          this.commonData.dateFrom = data.dateFrom || ''
          this.commonData.dateTo = data.dateTo || ''
          this.commonData.notes = data.notes || ''
          
          // Restore site
          if (data.site?.id) {
            this.commonData.site = this.allLocations.find(l => l.id === data.site.id) || null
            if (this.commonData.site) this.filters.commonSiteSearch = this.commonData.site.name
          }
          
          // Restore area
          if (data.area?.id && this.commonData.site) {
            let found = null
            if (Array.isArray(this.commonData.site.children) && this.commonData.site.children.length) {
              found = this.commonData.site.children.find(c => c.id === data.area.id) || null
            }
            if (!found) found = this.allLocations.find(l => l.id === data.area.id) || null
            this.commonData.area = found
            if (this.commonData.area) this.filters.commonAreaSearch = this.commonData.area.name
          }
          
          // Restore contractor
          if (data.contractor?.id) {
            this.commonData.contractor = this.contractors.find(c => c.id === data.contractor.id) || null
            if (this.commonData.contractor) this.filters.commonContractorSearch = this.commonData.contractor.name
          }
          
          // Restore crusher
          if (data.crusher?.id) {
            this.commonData.crusher = this.crushers.find(c => c.id === data.crusher.id) || null
            if (this.commonData.crusher) this.filters.commonCrusherSearch = this.commonData.crusher.name
          }
        }
      } catch (err) {
        console.warn('Failed to load extracts data:', err)
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

.modal-body-container {
  max-height: 70vh;
}

</style>
