<template>
  <!-- Button to open the Modal (you can remove or change it depending on the page) -->
  <ShadcnButton variant="outline" size="native" v-if="showTriggerButton" @click="openModal"
    :class="triggerButtonClass">
    {{ triggerText }}
  </ShadcnButton>

  <!-- Modal -->
  <teleport to="body">
    <transition name="kc-modal">
      <div v-if="isOpen" class="fixed inset-0 bg-black/60 flex items-center justify-center z-80 p-4 overflow-hidden"
        :dir="isRTL ? 'rtl' : 'ltr'" @click.self="requestClose">
        <div class="kc-modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] max-h-[95vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 class="text-2xl font-bold theme-heading">
            {{ currentStep === 1 ? modalTitleComputed : ($t('labels.enterSupplies') || 'إدخال التوريدات') }}
          </h2>
          <ShadcnButton variant="outline" size="native" @click="requestClose"
            class="theme-text-muted hover:theme-text-primary text-3xl leading-none focus:outline-none">
            ×
          </ShadcnButton>
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
                        @select="(sel) => { commonData.item = sel; filters.commonItemSearch = sel.name; onCommonItemSelect() }"
                        clearable
                        :clearAriaLabel="$t('labels.clear')"
                        @clear="() => { commonData.item = null; filters.commonItemSearch = '' }">
                        <template #prefix>
                          <ArchiveBoxIcon
                            class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                        </template>
                      </SearchDropdown>
                    </div>
                  </div>
                </div>

                <!-- Price (السعر) -->
                <div>
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                    {{ isPetroleum ? $t('labels.tonPrice') : $t('labels.price') }} <span class="text-red-600">*</span>
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
                        @select="(sel) => { commonData.site = sel; filters.commonSiteSearch = sel.name; onCommonSiteChange() }"
                        clearable
                        :clearAriaLabel="$t('labels.clear')"
                        @clear="() => { commonData.site = null; filters.commonSiteSearch = ''; commonData.area = null; filters.commonAreaSearch = '' }">
                        <template #prefix>
                          <MapPinIcon
                            class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
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
                        @select="(sel) => { commonData.area = sel; filters.commonAreaSearch = sel.name }"
                        clearable
                        :clearAriaLabel="$t('labels.clear')"
                        @clear="() => { commonData.area = null; filters.commonAreaSearch = '' }">
                        <template #prefix>
                          <MapIcon
                            class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                        </template>
                      </SearchDropdown>
                    </div>
                  </div>
                </div>

                <!-- Contractor (المقاول), the material supplier (المورد) for precast and petroleum items -->
                <div>
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                    {{ contractorLabel }} <span class="text-red-600">*</span>
                  </label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <SearchDropdown v-model="filters.commonContractorSearch" :items="contractors"
                        :allItems="contractors" :placeholder="$t('labels.contractor')"
                        :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                        @select="(sel) => { commonData.contractor = sel; filters.commonContractorSearch = sel.name; onCommonContractorChange() }"
                        clearable
                        :clearAriaLabel="$t('labels.clear')"
                        @clear="() => { commonData.contractor = null; filters.commonContractorSearch = ''; onCommonContractorChange() }">
                        <template #prefix>
                          <UserGroupIcon
                            class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
                        </template>
                      </SearchDropdown>
                    </div>
                  </div>
                </div>

                <!-- Crusher (الكسارة): aggregates only -->
                <div v-if="isAggregate">
                  <label class="block text-sm font-medium theme-text-secondary mb-1.5">
                    {{ $t('labels.crusher') }} <span class="text-red-600">*</span>
                  </label>
                  <div class="relative flex items-center gap-2">
                    <div class="flex-1 relative">
                      <SearchDropdown v-model="filters.commonCrusherSearch" :items="crushers" :allItems="crushers"
                        :placeholder="$t('labels.crusher')"
                        :inputClass="'w-full px-3 py-2.5 ps-11 border border-gray-300 rounded-lg focus:outline-none theme-input-focus text-sm'"
                        @select="(sel) => { commonData.crusher = sel; filters.commonCrusherSearch = sel.name; onCommonCrusherChange() }"
                        clearable
                        :clearAriaLabel="$t('labels.clear')"
                        @clear="() => { commonData.crusher = null; filters.commonCrusherSearch = '' }">
                        <template #prefix>
                          <WrenchScrewdriverIcon
                            class="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-caption pointer-events-none" />
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
              <ShadcnButton variant="outline" size="native" @click="requestClose"
                class="px-10 py-3 sm:px-2 md:px-3 lg:px-8  border border-gray-300 rounded-lg hover:bg-gray-50 font-medium theme-text-secondary transition">
                {{ $t('labels.cancel') }}
              </ShadcnButton>
              <ShadcnButton variant="outline" size="native" @click="goToStep2" :disabled="!isStep1Valid()"
                class="px-10 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed theme-text-light rounded-lg font-medium transition flex items-center gap-3">
                {{ $t('labels.next') }}
                <ArrowRightIcon class="w-6 h-6 transition-transform rtl:rotate-180" />
              </ShadcnButton>
            </div>
          </div>
          <!-- ============================================ STEP 2 ============================================ -->
          <div v-else class="w-full">
            <!-- Back Button and Title -->
            <div class="flex items-center justify-between mb-8">
              <ShadcnButton variant="outline" size="native" @click="goBackToStep1"
                class="flex items-center gap-3 theme-text hover:theme-accent-muted font-medium transition">
                <ArrowLeftIcon class="w-6 h-6 transition-transform rtl:rotate-180" />
                {{ $t('labels.back') }}
              </ShadcnButton>
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
                  <dt class="font-semibold theme-text-secondary">{{ isPetroleum ? $t('labels.tonPrice') : $t('labels.price') }}:</dt>
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
                  <dt class="font-semibold theme-text-secondary">{{ contractorLabel }}:</dt>
                  <dd class="theme-text-primary mt-1">{{ commonData.contractor?.name || '-' }}</dd>
                </div>
                <div v-if="isAggregate" class="flex flex-col">
                  <dt class="font-semibold theme-text-secondary">{{ $t('labels.crusher') }}:</dt>
                  <dd class="theme-text-primary mt-1">{{ commonData.crusher?.name || '-' }}</dd>
                </div>
                <div class="flex flex-col col-span-full">
                  <dt class="font-semibold theme-text-secondary">{{ $t('labels.notes') }}:</dt>
                  <dd class="theme-text-primary mt-1">{{ commonData.notes || '-' }}</dd>
                </div>
              </dl>
            </div>

            <!-- Table for Variable Data -->
            <div ref="rowsContainer" class="supply-rows-container mb-8 relative border border-gray-200 rounded-lg p-2">
                <table ref="tableRef" class="w-full divide-y divide-gray-200 border rounded-lg">
                  <thead class="theme-dashboard-bg-soft sticky top-0 z-10">
                    <tr>
                      <th class="px-4 py-3 text-center text-xs font-medium theme-text-secondary w-12">{{ $t('#') }}</th>
                      <template v-if="isAggregate">
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
                      </template>
                      <template v-else-if="isPrecast">
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                          $t('labels.supplyPermitNo') }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                          $t('labels.receiptNo') }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                          $t('labels.quantity') }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                          $t('labels.discount') }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                          $t('labels.total') }}</th>
                      </template>
                      <template v-else>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                          $t('labels.supplyPermitNo') }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                          $t('labels.vehicleNumber') }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                          $t('labels.loadTons') }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                          $t('labels.transportContractor') }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                          $t('labels.transportPricePerTon') }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                          $t('labels.supplierDue') }}</th>
                        <th class="px-4 py-3 text-start text-xs font-medium theme-text-secondary whitespace-nowrap">{{
                          $t('labels.transportTotal') }}</th>
                      </template>
                      <th class="px-4 py-3 text-center text-xs font-medium theme-text-secondary">{{ $t('labels.actions') }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="(row, index) in rows" :key="row.id">
                      <td class="px-4 py-3 text-center text-sm theme-text-secondary">{{ index + 1 }}</td>

                      <!-- ======================== first column
                     in step 2 ================ -->
                      <template v-if="isAggregate">
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
                          </div>
                          </teleport>
                        </div>
                      </td>

                      <!-- Crusher Ticket -->
                      <td class="px-3 py-2">
                        <input type="text" v-model="row.crusherTicket" @keydown.enter="handleEnterKey(index, $event)"
                          class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus" />
                      </td>

                      <!-- Company Ticket -->
                      <td class="px-3 py-2">
                        <input type="text" v-model="row.companyTicket" @keydown.enter="handleEnterKey(index, $event)"
                          class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus" />
                      </td>

                      <!-- Discount -->
                      <td class="px-3 py-2">
                        <input type="number" v-model.number="row.discount" step="0.01"
                          @keydown.enter="handleEnterKey(index, $event)"
                          class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus no-spinner" />
                      </td>

                      <!-- Company Cubic -->
                      <td class="px-3 py-2">
                        <input type="number" v-model.number="row.companyCapacity" step="0.01"
                          @keydown.enter="handleEnterKey(index, $event)"
                          class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus no-spinner" />
                      </td>

                      <!-- Crusher Cubic -->
                      <td class="px-3 py-2">
                        <input type="number" v-model.number="row.crusherCapacity" step="0.01"
                          @keydown.enter="handleEnterKey(index, $event)"
                          @keydown.tab="onLastFieldTab(index, $event)"
                          class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus no-spinner" />
                      </td>

                      <!-- Total per Row -->
                      <td class="px-3 py-2 text-sm font-semibold theme-text">
                        {{ formatNumber(totalPerRow(row)) }}
                      </td>
                      </template>

                      <!-- Precast (انترلوك / بردورة) -->
                      <template v-else-if="isPrecast">
                        <td class="px-3 py-2">
                          <input type="text" v-model="row.supplyPermitNo" @keydown.enter="handleEnterKey(index, $event)"
                            class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus" />
                        </td>
                        <td class="px-3 py-2">
                          <input type="text" v-model="row.receiptNo" @keydown.enter="handleEnterKey(index, $event)"
                            class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus" />
                        </td>
                        <td class="px-3 py-2">
                          <input type="number" v-model.number="row.companyCapacity" step="0.01"
                            @keydown.enter="handleEnterKey(index, $event)"
                            class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus no-spinner" />
                        </td>
                        <td class="px-3 py-2">
                          <input type="number" v-model.number="row.discount" step="0.01"
                            @keydown.enter="handleEnterKey(index, $event)"
                            @keydown.tab="onLastFieldTab(index, $event)"
                            class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus no-spinner" />
                        </td>
                        <td class="px-3 py-2 text-sm font-semibold theme-text">
                          {{ formatNumber(totalPerRow(row)) }}
                        </td>
                      </template>

                      <!-- Petroleum (بتومين / MC / RC) -->
                      <template v-else>
                        <td class="px-3 py-2">
                          <input type="text" v-model="row.supplyPermitNo" @keydown.enter="handleEnterKey(index, $event)"
                            class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus" />
                        </td>
                        <td class="px-3 py-2">
                          <input type="text" v-model="row.vehicleNumber" @keydown.enter="handleEnterKey(index, $event)"
                            class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus" />
                        </td>
                        <td class="px-3 py-2">
                          <input type="number" v-model.number="row.companyCapacity" step="0.01"
                            @keydown.enter="handleEnterKey(index, $event)"
                            class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus no-spinner" />
                        </td>
                        <!-- Transport is optional: the supplier may deliver the load itself -->
                        <td class="px-3 py-2">
                          <select v-model="row.transportContractorId" @change="onTransportContractorChange(row)"
                            class="w-full min-w-40 border border-gray-300 rounded px-2 py-1 bg-white text-sm theme-input-focus">
                            <option :value="null">{{ $t('labels.withoutTransport') }}</option>
                            <option v-for="c in transportContractors" :key="c.id" :value="c.id">{{ c.name }}</option>
                          </select>
                        </td>
                        <td class="px-3 py-2">
                          <input type="number" v-model.number="row.transportPrice" step="0.01" min="0"
                            :disabled="!row.transportContractorId"
                            @keydown.enter="handleEnterKey(index, $event)"
                            @keydown.tab="onLastFieldTab(index, $event)"
                            class="w-full border border-gray-300 rounded px-2 py-1  theme-input-focus no-spinner disabled:bg-gray-100 disabled:cursor-not-allowed" />
                        </td>
                        <td class="px-3 py-2 text-sm font-semibold theme-text">
                          {{ formatNumber(totalPerRow(row)) }}
                        </td>
                        <td class="px-3 py-2 text-sm font-semibold theme-text">
                          {{ formatNumber(transportPerRow(row)) }}
                        </td>
                      </template>

                      <!-- Actions -->
                      <td class="px-4 py-3 text-center">
                        <div class="flex justify-center gap-3">
                          <ShadcnButton variant="outline" size="native" @click="duplicateRow(index)" class="theme-text hover:theme-accent-muted transition"
                            title="Duplicate" tabindex="-1">
                            <DocumentDuplicateIcon class="w-5 h-5" />
                          </ShadcnButton>
                          <ShadcnButton variant="outline" size="native" @click="removeRow(index)" class="text-red-600 hover:text-red-800 transition"
                            title="Delete" tabindex="-1">
                            <TrashIcon class="w-5 h-5" />
                          </ShadcnButton>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
            </div>

            <!-- Totals -->
            <div
              class="sticky bottom-0 z-10 bg-gray-50 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-6 text-sm font-semibold">
              <template v-if="isPetroleum">
                <div class="flex items-center justify-end gap-3">
                  <span class="theme-text-secondary">{{ $t('labels.transportTotal') }}:</span>
                  <span class="theme-text-primary min-w-32 text-end">{{ formatNumber(transportGrandTotal) }}</span>
                </div>
                <div
                  class="flex items-center justify-end gap-3 text-lg theme-accent-strong border-s-4 theme-border-accent ps-6">
                  <span class="theme-accent-muted">{{ $t('labels.supplierDue') }}:</span>
                  <span class="theme-accent-muted min-w-40 text-end font-bold">{{ formatNumber(grandTotal) }}</span>
                </div>
              </template>
              <template v-else>
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
              </template>
            </div>

            <!-- Save / Back Buttons -->
            <div class="mt-10 flex justify-end gap-6">
              <ShadcnButton variant="outline" size="native" @click="goBackToStep1"
                class="px-10 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium theme-text-secondary transition flex items-center gap-3">
                <ArrowLeftIcon class="w-6 h-6 transition-transform rtl:rotate-180" />
                {{ $t('labels.back') }}
              </ShadcnButton>
              <ShadcnButton variant="outline" size="native" @click="saveData" :disabled="isSaving"
                class="px-10 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed theme-text-light rounded-lg font-medium transition flex items-center gap-3">
                {{ isSaving ? $t('labels.saving') : $t('labels.save') }}
                <CheckIcon class="w-6 h-6" />
              </ShadcnButton>
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

  <!-- Transport Modal (open after successful supply save when item supports transport) -->
  <TransportCreationModal :isOpen="showTransportModal"
    :modalTitle="$t('transport.addTransportFromSupply') || 'Create Transport'" :transport="transportModalPayload"
    @close="showTransportModal = false" @saved="onTransportSaved" />
</template>

<script>
import {
  getLocations,
  getContractors,
  getCrushers,
  getVehicles,
  getContractorsWithVehicles,
  createExport,
  getExportItems
} from '@/api'
import { matchesVehicleName } from '@/utils/normalizeVehicleName'
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
} from '@acme/icon-packs/legacy'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'
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
    SearchDropdown,
    TransportCreationModal,
    DateField
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
    triggerButtonClass: {
      type: String,
      default: 'theme-button px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm text-xs sm:text-sm'
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
      isRestoringDraft: false,

      // Lookups
      sites: [],
      allLocations: [],
      rows: [],
      contractors: [],
      transportContractors: [],
      contractorsWithVehicles: [],
      crushers: [],
      vehicles: [],
      exportItems: [],

      // Errors
      saveError: '',

      // Transport modal trigger/state (open after successful supply save)
      showTransportModal: false,
      transportModalPayload: null,

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
      rowsContainer: null,

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

    // AGGREGATE (سن/رمل/بودرة/تربة), PRECAST (انترلوك/بردورة) or PETROLEUM (بتومين/MC/RC)
    supplyType() {
      return this.commonData.item?.supplyType || 'AGGREGATE'
    },
    isAggregate() {
      return this.supplyType === 'AGGREGATE'
    },
    isPrecast() {
      return this.supplyType === 'PRECAST'
    },
    isPetroleum() {
      return this.supplyType === 'PETROLEUM'
    },
    contractorLabel() {
      return this.isAggregate ? this.$t('labels.contractor') : this.$t('labels.supplierName')
    },

    transportGrandTotal() {
      return this.rows.reduce((sum, row) => sum + this.transportPerRow(row), 0)
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

  watch: {
    commonData: {
      deep: true,
      handler() {
        this.persistSupplyDraft()
      }
    },
    rows: {
      deep: true,
      handler() {
        this.persistSupplyDraft()
      }
    }
  },

  async mounted() {
    this.loadLastEnteredDataFromStorage()
    document.addEventListener('click', this.handleGlobalClick)
    window.addEventListener('keydown', this.handleModalKeydown, true)
    window.addEventListener('beforeunload', this.handleBeforeUnload)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleGlobalClick)
    window.removeEventListener('keydown', this.handleModalKeydown, true)
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
  },

  methods: {
    handleModalKeydown(event) {
      if (!this.isOpen) return
      const target = event.target
      const isEditable = target instanceof HTMLElement &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

      if (event.key === 'Backspace' && !isEditable) {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      if (event.key === 'Escape' && !isEditable) {
        event.preventDefault()
        event.stopPropagation()
        this.requestClose()
      }
    },

    handleBeforeUnload(event) {
      if (!this.isOpen || !this.hasUnsavedData()) return
      this.persistSupplyDraft()
      event.preventDefault()
      event.returnValue = ''
    },

    hasUnsavedData() {
      const common = this.commonData
      const hasCommonData = Boolean(
        common.date || common.item?.id || Number(common.price) || common.site?.id ||
        common.area?.id || common.contractor?.id || common.crusher?.id || common.notes?.trim()
      )
      const rowFields = [
        'search', 'crusherTicket', 'companyTicket', 'supplyPermitNo', 'receiptNo',
        'vehicleNumber', 'companyCapacity', 'crusherCapacity', 'discount',
        'transportContractorId', 'transportPrice'
      ]
      return hasCommonData || this.rows.length > 1 || this.rows.some(row =>
        rowFields.some(field => {
          const value = row[field]
          return value !== null && value !== undefined && value !== '' && value !== 0
        }) || row.vehicle?.id
      )
    },

    requestClose() {
      if (this.hasUnsavedData()) {
        const message = this.isRTL
          ? 'لديك بيانات غير محفوظة. هل أنت متأكد أنك تريد الخروج؟'
          : 'You have unsaved data. Are you sure you want to leave?'
        if (!window.confirm(message)) return
      }
      this.closeModal()
    },

    getDraftCommonData() {
      const common = this.commonData
      const pick = value => value ? { id: value.id, name: value.name } : null
      return {
        date: common.date,
        item: pick(common.item),
        price: common.price,
        site: pick(common.site),
        area: pick(common.area),
        contractor: pick(common.contractor),
        crusher: pick(common.crusher),
        notes: common.notes
      }
    },

    persistSupplyDraft() {
      if (!this.isOpen || this.isRestoringDraft || this.isSaving) return
      try {
        if (!this.hasUnsavedData()) {
          localStorage.removeItem('suppliesCreationModalDraft')
          return
        }
        const rowFields = [
          'search', 'crusherTicket', 'companyTicket', 'supplyPermitNo', 'receiptNo',
          'vehicleNumber', 'companyCapacity', 'crusherCapacity', 'discount',
          'transportContractorId', 'transportPrice', 'unitPrice'
        ]
        const rows = this.rows.map(row => {
          const saved = {}
          rowFields.forEach(field => { saved[field] = row[field] })
          saved.vehicle = row.vehicle ? { id: row.vehicle.id, name: row.vehicle.name } : null
          return saved
        })
        localStorage.setItem('suppliesCreationModalDraft', JSON.stringify({
          currentStep: this.currentStep,
          commonData: this.getDraftCommonData(),
          rows
        }))
      } catch (err) {
        console.warn('Failed to save supplies draft:', err)
      }
    },

    async restoreSupplyDraft(draft) {
      const common = draft?.commonData || {}
      const findById = (list, id) => list.find(item => String(item.id) === String(id)) || null
      this.commonData.date = common.date || ''
      this.commonData.item = findById(this.exportItems, common.item?.id)
      this.commonData.price = common.price || 0
      this.commonData.site = findById(this.allLocations, common.site?.id)
      this.commonData.area = findById(this.commonData.site?.children || this.allLocations, common.area?.id)
      this.commonData.contractor = findById(this.contractors, common.contractor?.id)
      this.commonData.crusher = findById(this.crushers, common.crusher?.id)
      this.commonData.notes = common.notes || ''
      this.filters.commonItemSearch = this.commonData.item?.name || ''
      this.filters.commonSiteSearch = this.commonData.site?.name || ''
      this.filters.commonAreaSearch = this.commonData.area?.name || ''
      this.filters.commonContractorSearch = this.commonData.contractor?.name || ''
      this.filters.commonCrusherSearch = this.commonData.crusher?.name || ''

      const rowFields = [
        'search', 'crusherTicket', 'companyTicket', 'supplyPermitNo', 'receiptNo',
        'vehicleNumber', 'companyCapacity', 'crusherCapacity', 'discount',
        'transportContractorId', 'transportPrice', 'unitPrice'
      ]
      this.rows = (Array.isArray(draft.rows) ? draft.rows : []).map(saved => {
        const row = this.createEmptyRow()
        rowFields.forEach(field => {
          if (saved[field] !== undefined) row[field] = saved[field]
        })
        row.vehicle = findById(this.vehicles, saved.vehicle?.id)
        row.search = row.vehicle?.name || row.search || ''
        return row
      })
      if (!this.rows.length && draft.currentStep === 2) this.rows = [this.createEmptyRow()]
      this.currentStep = draft.currentStep === 2 ? 2 : 1
      this.rows.forEach(row => row.availableVehicles = this.getAvailableVehiclesForContractor(this.commonData.contractor?.id))
      await this.$nextTick()
      if (this.currentStep === 2) this.focusAndRevealRow(Math.max(0, this.rows.length - 1))
    },

    focusAndRevealRow(index) {
      this.$nextTick(() => {
        const row = this.rowsContainer?.querySelectorAll('tbody tr')[index]
        if (!row) return
        row.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        const firstInput = row.querySelector('input:not([type="hidden"]):not(:disabled)')
        firstInput?.focus({ preventScroll: true })
      })
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
    onLastFieldTab(index, event) {
      // Allow Shift+Tab for backwards navigation
      if (event.shiftKey) return;

      // Check if Tab key and this is the last row
      if (event.key === 'Tab' && index === this.rows.length - 1) {
        event.preventDefault();
        const newRowIndex = this.rows.length;
        this.addRow();

        this.focusAndRevealRow(newRowIndex)
      }
    },
    // ============ Step Control ============
    isStep1Valid() {
      const base = this.commonData.date &&
        this.commonData.item &&
        this.commonData.price > 0 &&
        this.commonData.site &&
        this.commonData.contractor
      if (!base) return false
      if (this.isAggregate) return !!this.commonData.crusher
      return true
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
      this.isRestoringDraft = true
      this.isOpen = true
      this.currentStep = 1
      this.commonData = { date: '', item: null, price: 0, site: null, area: null, contractor: null, crusher: null, notes: '' }
      this.rows = []
      this.saveError = ''
      try {
        await this.loadInitialData()
        const savedDraft = localStorage.getItem('suppliesCreationModalDraft')
        if (savedDraft) {
          try {
            const draft = JSON.parse(savedDraft)
            const message = this.isRTL
              ? 'توجد مسودة توريدات محفوظة. هل تريد استرجاعها؟'
              : 'A saved supplies draft was found. Would you like to restore it?'
            if (window.confirm(message)) {
              await this.restoreSupplyDraft(draft)
            } else {
              localStorage.removeItem('suppliesCreationModalDraft')
              this.loadCommonDataFromStorage()
            }
          } catch (err) {
            console.warn('Failed to restore supplies draft:', err)
            localStorage.removeItem('suppliesCreationModalDraft')
            this.loadCommonDataFromStorage()
          }
        } else {
          this.loadCommonDataFromStorage()
        }
      } finally {
        this.isRestoringDraft = false
      }
    },

    closeModal() {
      this.persistSupplyDraft()
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
          this.commonData.date = data.date || ''

          // Restore site
          if (data.site?.id) {
            this.commonData.site = this.allLocations.find(l => l.id === data.site.id) || null
            if (this.commonData.site) this.filters.commonSiteSearch = this.commonData.site.name
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

          // Restore item
          if (data.item?.id) {
            this.commonData.item = this.exportItems.find(i => i.id === data.item.id) || null
            if (this.commonData.item) this.filters.commonItemSearch = this.commonData.item.name
          }

          this.commonData.price = data.price || 0
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
      const prev = this.rows[this.rows.length - 1]
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
        supplyPermitNo: '',
        receiptNo: '',
        vehicleNumber: '',
        transportContractorId: prev?.transportContractorId ?? null,
        transportPrice: prev?.transportPrice ?? 0,
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
        !row.supplyPermitNo?.trim() &&
        !row.receiptNo?.trim() &&
        !row.vehicleNumber?.trim() &&
        !row.discount &&
        !row.companyCapacity &&
        !row.crusherCapacity &&
        !row.vehicle
    },

    getMissingRequiredFields(row) {
      const missing = []
      if (this.isAggregate) {
        if (!row.vehicle) missing.push(this.$t('labels.vehicle'))
        if (!row.crusherTicket?.trim()) missing.push(this.$t('labels.crusherTicket'))
        if (!row.companyTicket?.trim()) missing.push(this.$t('labels.companyTicket'))
      } else {
        if (!row.supplyPermitNo?.trim()) missing.push(this.$t('labels.supplyPermitNo'))
        if (this.isPrecast && !row.receiptNo?.trim()) missing.push(this.$t('labels.receiptNo'))
        if (this.isPetroleum && row.transportContractorId && !(Number(row.transportPrice) > 0)) {
          missing.push(this.$t('labels.transportPricePerTon') + ' (> 0)')
        }
      }

      const discount = Number(row.discount || 0)
      const companyCapacity = Number(row.companyCapacity || 0)
      const quantityLabel = this.isAggregate
        ? this.$t('vehicles.companyCapacity')
        : (this.isPetroleum ? this.$t('labels.loadTons') : this.$t('labels.quantity'))

      if (discount < 0) missing.push(this.$t('labels.discount') + ' (≥ 0)')
      if (companyCapacity <= 0) missing.push(quantityLabel + ' (> 0)')

      return missing
    },

    handleEnterKey(rowIndex, event) {
      const row = event.target.closest('tr')
      if (!row) return
      const fields = Array.from(row.querySelectorAll(
        'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled)'
      )).filter(field => field.getClientRects().length)
      const fieldIndex = fields.indexOf(event.target)
      if (fieldIndex < 0) return

      event.preventDefault()
      if (fieldIndex < fields.length - 1) {
        fields[fieldIndex + 1].focus()
        return
      }

      if (rowIndex < this.rows.length - 1) {
        this.focusAndRevealRow(rowIndex + 1)
        return
      }

      this.addRow()
      this.focusAndRevealRow(rowIndex + 1)
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
      copy.supplyPermitNo = ''
      copy.receiptNo = ''
      copy.vehicleNumber = ''
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
      // Only clear area if we actually selected a different real site
      if (this.commonData.site && this.commonData.site.id) {
        this.commonData.area = null
      }
    },

    onCommonContractorChange() {
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
      // no-op: crusher changes don't cascade anything today
    },

    onCommonItemSelect() {
      if (!this.commonData.item) return

      // Support multiple possible field names returned by the API
      const maybePrice = this.commonData.item.currentPrice ?? this.commonData.item.defaultSupplyPrice ?? this.commonData.item.defaultExportPrice ?? this.commonData.item.price ?? this.commonData.item.current_price
      const parsed = Number(maybePrice)
      if (!Number.isNaN(parsed)) {
        this.commonData.price = parsed
      }
    },

    // ============ Field Interactions (Step 2) ============
    filteredVehicles(row) {
      const q = row.search?.toLowerCase() || ''
      return (row.availableVehicles || []).filter(v =>
        matchesVehicleName(v.name, q)
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

    // Petroleum loads: transport contractor is paid per ton hauled
    transportPerRow(row) {
      if (!this.isPetroleum || !row.transportContractorId) return 0
      return Number(row.transportPrice || 0) * Number(row.companyCapacity || 0)
    },

    onTransportContractorChange(row) {
      if (!row.transportContractorId) row.transportPrice = 0
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
      } catch (err) {
        console.warn('Failed to refresh locations', err)
      }
    },

    // ============ Lookups Management ============
    async loadExportItems() {
      try {
        const res = await getExportItems({ mode: 'supply' })
        const raw = Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || [])
        this.exportItems = raw.map(normalizeItem)
      } catch (err) {
        console.warn('Failed to load export items', err)
      }
    },

    async loadLookups() {
      try {
        const [cRes, cvRes, crushRes, vRes, tRes] = await Promise.all([
          getContractors({ mode: 'supply', pageSize: 1000 }),
          typeof getContractorsWithVehicles === 'function'
            ? getContractorsWithVehicles({ mode: 'supply' })
            : Promise.resolve(null),
          getCrushers(),
          getVehicles({ mode: 'supply', pageSize: 1000 }),
          getContractors({ mode: 'transport', pageSize: 1000 })
        ])

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
        this.transportContractors = extractArray(tRes)
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

        this.rows.forEach(row => {
          row.availableVehicles = this.getAvailableVehiclesForContractor(this.commonData.contractor?.id)
        })
      } catch (err) {
        console.error('loadLookups failed:', err)
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
            crusherId: this.isAggregate && this.commonData.crusher?.id ? Number(this.commonData.crusher.id) : null,
            itemId: this.commonData.item?.id ? Number(this.commonData.item.id) : null,
            notes: this.commonData.notes || undefined,
            vehicleId: this.isAggregate && r.vehicle?.id ? Number(r.vehicle.id) : undefined,
            crusherTicket: r.crusherTicket?.trim() || undefined,
            companyTicket: r.companyTicket?.trim() || undefined,
            companyCapacity: r.companyCapacity !== undefined && r.companyCapacity !== null ? Number(r.companyCapacity) : undefined,
            crusherCapacity: r.crusherCapacity !== undefined && r.crusherCapacity !== null ? Number(r.crusherCapacity) : undefined,
            unitPrice: (r.unitPrice !== undefined && r.unitPrice !== null) ? Number(r.unitPrice) : (this.commonData.price !== undefined ? Number(this.commonData.price) : undefined),
            discount: r.discount !== undefined && r.discount !== null ? Number(r.discount) : undefined,
            supplyPermitNo: r.supplyPermitNo?.trim() || undefined,
            receiptNo: r.receiptNo?.trim() || undefined,
            vehicleNumber: r.vehicleNumber?.trim() || undefined,
            transportContractorId: this.isPetroleum && r.transportContractorId ? Number(r.transportContractorId) : undefined,
            transportPricePerTon: this.isPetroleum && r.transportContractorId ? Number(r.transportPrice || 0) : undefined
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

        localStorage.removeItem('suppliesCreationModalDraft')
        this.saveCommonDataToStorage()

        // capture the step-1 data so we can pass it to transport modal if needed
        const step1 = JSON.parse(JSON.stringify(this.commonData || {}))
        // Petroleum transport is entered with the supply itself
        const offerTransport = !this.isPetroleum

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
          if (offerTransport && step1 && itemObj && availableForTransport) {
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

.supply-rows-container {
  max-height: 55vh;
  overflow: auto;
  overscroll-behavior: contain;
  scroll-behavior: smooth;
}

.supply-rows-container table {
  min-width: max-content;
}

input:focus,
select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
</style>
