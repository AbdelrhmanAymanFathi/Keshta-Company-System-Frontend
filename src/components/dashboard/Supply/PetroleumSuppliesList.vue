<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">
    <div class="app-page-header flex items-center justify-between gap-2 rounded-2xl theme-page-header-bar p-3 sm:p-5 shadow-lg shadow-slate-200/50">
      <div>
        <h2 class="text-2xl font-semibold">{{ $t('petroleum.title') }}</h2>
        <p class="text-xs theme-text-muted mt-1">{{ $t('petroleum.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="exportExcel" :disabled="exporting"
          class="px-3 py-1.5 sm:px-4 sm:py-2 border border-slate-200 bg-white hover:bg-slate-50 theme-text-secondary rounded-xl transition-colors text-xs sm:text-sm font-medium disabled:opacity-50">
          {{ $t('petroleum.exportExcel') }}
        </button>
        <button @click="openCreate"
          class="theme-button px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm text-xs sm:text-sm">
          {{ $t('petroleum.new') }} +
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="rounded-2xl border border-slate-200/80 bg-white/95 p-3 sm:p-5 space-y-4 shadow-lg shadow-slate-200/40">
      <h4 class="text-sm font-semibold theme-text-secondary">{{ $t('labels.filters') }}</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.startDate') }}</label>
          <DateField v-model="filters.startDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('labels.endDate') }}</label>
          <DateField v-model="filters.endDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('petroleum.product') }}</label>
          <input v-model="filters.productName" list="petroleum-products"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('petroleum.supplier') }}</label>
          <SearchDropdown
            v-model="filters.supplierSearch"
            :items="suppliers"
            :allItems="suppliers"
            :placeholder="$t('placeholders.searchContractor')"
            inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            @select="(sel) => { filters.supplierId = sel.id; filters.supplierSearch = sel.name }"
            @clear="filters.supplierId = ''"
          />
        </div>
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('petroleum.transportContractor') }}</label>
          <SearchDropdown
            v-model="filters.transporterSearch"
            :items="transporters"
            :allItems="transporters"
            :placeholder="$t('placeholders.searchContractor')"
            inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            @select="(sel) => { filters.transportContractorId = sel.id; filters.transporterSearch = sel.name }"
            @clear="filters.transportContractorId = ''"
          />
        </div>
        <div>
          <label class="block text-xs font-medium theme-text-secondary mb-1">{{ $t('petroleum.site') }}</label>
          <SearchDropdown
            v-model="filters.locationSearch"
            :items="locations"
            :allItems="locations"
            :placeholder="$t('placeholders.searchLocation')"
            inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            @select="(sel) => { filters.locationId = sel.id; filters.locationSearch = sel.name }"
            @clear="filters.locationId = ''"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <button @click="page = 1; loadRows()" :disabled="loading"
          class="px-3 py-1.5 sm:px-4 sm:py-2 theme-button rounded-xl transition-colors disabled:opacity-50 text-xs sm:text-sm font-medium shadow-sm">
          {{ $t('labels.search') }}
        </button>
        <button @click="clearFilters"
          class="px-3 py-1.5 sm:px-4 sm:py-2 border border-slate-200 bg-white hover:bg-slate-50 theme-text-secondary rounded-xl transition-colors text-xs sm:text-sm font-medium">
          {{ $t('labels.clear') }}
        </button>
      </div>
    </div>

    <!-- Totals across every page matching the filters -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm">
        <div class="text-xs theme-text-muted">{{ $t('petroleum.totalTons') }}</div>
        <div class="text-lg font-semibold theme-text-primary mt-1">{{ formatNumber(totals.loadTons) }}</div>
      </div>
      <div class="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm">
        <div class="text-xs theme-text-muted">{{ $t('petroleum.totalSupplierDue') }}</div>
        <div class="text-lg font-semibold theme-text-primary mt-1">{{ formatCurrency(totals.supplierDue) }}</div>
      </div>
      <div class="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm">
        <div class="text-xs theme-text-muted">{{ $t('petroleum.totalTransport') }}</div>
        <div class="text-lg font-semibold theme-text-primary mt-1">{{ formatCurrency(totals.transportTotal) }}</div>
      </div>
    </div>

    <!-- table -->
    <div class="app-table-card">
      <table v-app-table class="app-table divide-y divide-gray-200">
        <thead class="theme-table-thead-gradient">
          <tr>
            <th class="px-3 py-2 sm:px-4 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider">#</th>
            <th data-col="subtitle" class="px-3 py-2 sm:px-4 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('labels.date') }}</th>
            <th class="px-3 py-2 sm:px-4 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('petroleum.product') }}</th>
            <th data-col="title" class="px-3 py-2 sm:px-4 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('petroleum.supplier') }}</th>
            <th class="px-3 py-2 sm:px-4 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('petroleum.warehouse') }}</th>
            <th class="px-3 py-2 sm:px-4 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('petroleum.site') }}</th>
            <th class="px-3 py-2 sm:px-4 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('petroleum.permitNo') }}</th>
            <th class="px-3 py-2 sm:px-4 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('petroleum.vehicleNumber') }}</th>
            <th class="px-3 py-2 sm:px-4 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('petroleum.loadTons') }}</th>
            <th class="px-3 py-2 sm:px-4 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('petroleum.tonPrice') }}</th>
            <th data-col="amount" class="px-3 py-2 sm:px-4 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('petroleum.supplierDue') }}</th>
            <th class="px-3 py-2 sm:px-4 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('petroleum.transportContractor') }}</th>
            <th class="px-3 py-2 sm:px-4 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('petroleum.transportPricePerTon') }}</th>
            <th class="px-3 py-2 sm:px-4 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('petroleum.transportTotal') }}</th>
            <th class="px-3 py-2 sm:px-4 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('labels.notes') }}</th>
            <th class="px-3 py-2 sm:px-4 sm:py-3 text-start text-xs font-medium theme-text-muted uppercase tracking-wider">{{ $t('labels.actions') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(row, idx) in rows" :key="`petroleum-${row.id}`" :data-focus-id="row.id" class="theme-table-row-hover">
            <td class="px-3 py-2 sm:px-4 sm:py-3 text-xs font-medium text-black">{{ (page - 1) * pageSize + idx + 1 }}</td>
            <td class="px-3 py-2 sm:px-4 sm:py-3 text-xs font-medium theme-accent-muted">{{ formatDate(row.date) }}</td>
            <td class="px-3 py-2 sm:px-4 sm:py-3 text-xs font-medium text-black">{{ row.productName }}</td>
            <td class="px-3 py-2 sm:px-4 sm:py-3 text-xs font-medium theme-text-primary">{{ row.supplier?.name || '-' }}</td>
            <td class="px-3 py-2 sm:px-4 sm:py-3 text-xs font-medium theme-text-primary">{{ row.warehouse?.name || '-' }}</td>
            <td class="px-3 py-2 sm:px-4 sm:py-3 text-xs font-medium theme-text-primary">{{ row.location?.name || '-' }}</td>
            <td class="px-3 py-2 sm:px-4 sm:py-3 text-xs font-medium text-black">{{ row.supplyPermitNo || '-' }}</td>
            <td class="px-3 py-2 sm:px-4 sm:py-3 text-xs font-medium text-black">{{ row.vehicleNumber || '-' }}</td>
            <td class="px-3 py-2 sm:px-4 sm:py-3 text-xs font-medium theme-text-primary">{{ formatNumber(row.loadTons) }}</td>
            <td class="px-3 py-2 sm:px-4 sm:py-3 text-xs font-medium theme-text-primary">{{ formatCurrency(row.tonPrice) }}</td>
            <td class="px-3 py-2 sm:px-4 sm:py-3 text-sm font-semibold theme-accent-muted">{{ formatCurrency(row.supplierDue) }}</td>
            <td class="px-3 py-2 sm:px-4 sm:py-3 text-xs font-medium theme-text-primary">{{ row.transportContractor?.name || '-' }}</td>
            <td class="px-3 py-2 sm:px-4 sm:py-3 text-xs font-medium theme-text-primary">{{ formatCurrency(row.transportPricePerTon) }}</td>
            <td class="px-3 py-2 sm:px-4 sm:py-3 text-sm font-semibold theme-accent-muted">{{ formatCurrency(row.transportTotal) }}</td>
            <td class="px-3 py-2 sm:px-4 sm:py-3 text-xs font-medium theme-text-primary">{{ row.notes || '-' }}</td>
            <td class="px-3 py-2 sm:px-4 sm:py-3 text-xs whitespace-nowrap">
              <div class="flex items-center gap-2">
                <button @click.stop="openEdit(row)" :title="$t('labels.edit')"
                  class="inline-flex items-center justify-center rounded-lg border theme-border-accent theme-dashboard-bg-soft p-2 theme-text-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <svg class="w-4 h-4 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click.stop="deleteId = row.id" :title="$t('labels.delete')"
                  class="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-100 hover:shadow-md">
                  <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td class="px-6 py-3 text-start text-xs font-medium theme-text-muted" :colspan="16">
              {{ loading ? $t('labels.loading') : $t('petroleum.empty') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination v-if="totalPages > 1" :currentPage="page" :pageSize="pageSize" :total="total" :totalPages="totalPages"
      :pageSizeOptions="[10, 20, 50, 100]" @update:page="(p) => { page = p; loadRows() }"
      @update:pageSize="(size) => { pageSize = size; page = 1; loadRows() }" />

    <datalist id="petroleum-products">
      <option v-for="name in productOptions" :key="name" :value="name" />
    </datalist>

    <!-- Delete Confirm Modal -->
    <div v-if="deleteId" class="fixed inset-0 bg-slate-950/20 backdrop-blur-sm flex items-center justify-center z-50" style="margin-top:0;">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 class="text-lg font-bold mb-3 theme-text-primary">{{ $t('labels.confirmDelete') }}</h3>
        <p class="theme-text-secondary mb-6">{{ $t('petroleum.confirmDelete') }}</p>
        <div class="flex justify-end gap-3">
          <button @click="deleteId = null" class="px-4 py-2 border border-slate-200 rounded-xl theme-text-secondary hover:bg-slate-50">
            {{ $t('labels.cancel') }}
          </button>
          <button @click="handleDelete" :disabled="deleting" class="px-4 py-2 bg-red-600 theme-text-light rounded-xl hover:bg-red-700 disabled:opacity-50">
            {{ deleting ? $t('labels.deleting') : $t('labels.delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center" style="margin-top:0;">
      <div class="fixed inset-0 bg-slate-950/45 backdrop-blur-sm" @click="closeModal"></div>
      <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl p-4 sm:p-6 z-10 max-h-[90vh] overflow-y-auto mx-4">
        <h3 class="text-lg font-bold mb-4 theme-text-primary">
          {{ form.id ? $t('petroleum.edit') : $t('petroleum.new') }}
        </h3>

        <!-- The material: owed to the supplier -->
        <h4 class="text-sm font-semibold theme-text-secondary mb-2">{{ $t('petroleum.materialSection') }}</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('labels.date') }} *</label>
            <DateField v-model="form.date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('petroleum.product') }} *</label>
            <input v-model="form.productName" list="petroleum-products" :class="inputClass" />
          </div>
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('petroleum.supplier') }} *</label>
            <SearchDropdown
              v-model="form.supplierSearch"
              :items="suppliers"
              :allItems="suppliers"
              teleportTarget="body"
              :inputClass="inputClass"
              @select="(sel) => { form.supplierId = sel.id; form.supplierSearch = sel.name }"
              @clear="form.supplierId = ''"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('petroleum.warehouse') }} *</label>
            <SearchDropdown
              v-model="form.warehouseSearch"
              :items="locations"
              :allItems="locations"
              teleportTarget="body"
              :inputClass="inputClass"
              @select="(sel) => { form.warehouseId = sel.id; form.warehouseSearch = sel.name }"
              @clear="form.warehouseId = ''"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('petroleum.site') }}</label>
            <SearchDropdown
              v-model="form.locationSearch"
              :items="locations"
              :allItems="locations"
              teleportTarget="body"
              :inputClass="inputClass"
              @select="(sel) => { form.locationId = sel.id; form.locationSearch = sel.name }"
              @clear="form.locationId = ''"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('petroleum.permitNo') }}</label>
            <input v-model="form.supplyPermitNo" :class="inputClass" />
          </div>
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('petroleum.vehicleNumber') }}</label>
            <input v-model="form.vehicleNumber" :class="inputClass" />
          </div>
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('petroleum.loadTons') }} *</label>
            <input v-model="form.loadTons" type="number" step="any" min="0" :class="inputClass" />
          </div>
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('petroleum.tonPrice') }} *</label>
            <input v-model="form.tonPrice" type="number" step="any" min="0" :class="inputClass" />
          </div>
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('petroleum.supplierDue') }}</label>
            <div class="w-full px-3 py-2 rounded-lg text-sm font-semibold theme-dashboard-bg-soft theme-text-primary">{{ formatCurrency(formSupplierDue) }}</div>
          </div>
        </div>

        <!-- The haulage: owed to the transport contractor -->
        <h4 class="text-sm font-semibold theme-text-secondary mt-6 mb-2">{{ $t('petroleum.transportSection') }}</h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('petroleum.transportContractor') }}</label>
            <SearchDropdown
              v-model="form.transporterSearch"
              :items="transporters"
              :allItems="transporters"
              teleportTarget="body"
              :inputClass="inputClass"
              @select="(sel) => { form.transportContractorId = sel.id; form.transporterSearch = sel.name }"
              @clear="form.transportContractorId = ''"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('petroleum.transportPricePerTon') }}</label>
            <input v-model="form.transportPricePerTon" type="number" step="any" min="0" :class="inputClass" />
          </div>
          <div>
            <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('petroleum.transportTotal') }}</label>
            <div class="w-full px-3 py-2 rounded-lg text-sm font-semibold theme-dashboard-bg-soft theme-text-primary">{{ formatCurrency(formTransportTotal) }}</div>
          </div>
        </div>

        <div class="mt-4">
          <label class="block text-xs font-semibold theme-text-secondary mb-1">{{ $t('labels.notes') }}</label>
          <textarea v-model="form.notes" rows="2" :class="inputClass"></textarea>
        </div>

        <p class="mt-4 text-xs theme-text-muted">{{ $t('petroleum.ledgerHint') }}</p>

        <div class="mt-6 flex gap-2 justify-end">
          <button @click="closeModal" class="px-4 py-2 rounded-xl border border-gray-300 text-sm hover:bg-gray-50">{{ $t('labels.cancel') }}</button>
          <button @click="save" :disabled="saving" class="px-4 py-2 rounded-xl theme-text-light theme-button text-sm disabled:opacity-50">{{ $t('labels.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getPetroleumSupplies,
  getPetroleumSupply,
  createPetroleumSupply,
  updatePetroleumSupply,
  deletePetroleumSupply,
  getPetroleumSuppliesReport,
  getContractors,
  getLocations
} from '../../../api'
import Pagination from '../../shared/Pagination.vue'
import SearchDropdown from '../../shared/SearchDropdown.vue'
import DateField from '@/components/shared/DateField.vue'
import { buildQueryParams } from '../../../utils/buildQueryParams'
import { downloadBlobData, getFilenameFromResponse } from '@/utils/downloadFile'
import { realtimeService } from '@/services/realtimeService'
import { debounce } from '@/utils/debounce'
import { getFocusId, clearFocusQuery, highlightRow, notifyFocusMissing } from '@/utils/focusRecord'

const emptyFilters = () => ({
  startDate: '',
  endDate: '',
  productName: '',
  supplierId: '',
  supplierSearch: '',
  transportContractorId: '',
  transporterSearch: '',
  locationId: '',
  locationSearch: ''
})

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100

export default {
  name: 'PetroleumSuppliesList',

  components: { Pagination, SearchDropdown, DateField },

  data() {
    return {
      rows: [],
      totals: { loadTons: 0, supplierDue: 0, transportTotal: 0 },
      page: 1,
      pageSize: 20,
      total: 0,
      loading: false,
      saving: false,
      deleting: false,
      exporting: false,
      deleteId: null,
      modalOpen: false,
      form: {},
      suppliers: [],
      transporters: [],
      locations: [],
      filters: emptyFilters(),
      inputClass: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
    }
  },

  computed: {
    isRTL() {
      return this.$i18n?.locale === 'ar'
    },
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
    },
    productOptions() {
      return Array.from(new Set(['BTOMEN', 'MC', ...this.rows.map(r => r.productName).filter(Boolean)]))
    },
    formSupplierDue() {
      return round2((Number(this.form.loadTons) || 0) * (Number(this.form.tonPrice) || 0))
    },
    formTransportTotal() {
      if (!this.form.transportContractorId || this.form.transportPricePerTon === '') return 0
      return round2((Number(this.form.loadTons) || 0) * (Number(this.form.transportPricePerTon) || 0))
    }
  },

  watch: {
    '$route.query.focus'() {
      this.openFocused()
    }
  },

  async mounted() {
    await Promise.all([this.loadLookups(), this.loadRows()])
    this.openFocused()
    this.__realtimeUnsub = realtimeService.subscribe('petroleum-supply', ['supply_created', 'supply_updated', 'supply_deleted'], debounce(() => { this.loadRows() }, 300))
  },

  beforeUnmount() {
    if (this.__realtimeUnsub) { this.__realtimeUnsub(); this.__realtimeUnsub = null }
  },

  methods: {
    listOf(res) {
      const data = res?.data?.data || res?.data?.items || res?.data || []
      return Array.isArray(data) ? data : []
    },

    async loadLookups() {
      try {
        const [suppliersRes, transportersRes, locationsRes] = await Promise.all([
          getContractors({ pageSize: 1000, mode: 'supply' }),
          getContractors({ pageSize: 1000, mode: 'transport' }),
          getLocations()
        ])
        this.suppliers = this.listOf(suppliersRes)
        this.transporters = this.listOf(transportersRes)
        this.locations = this.listOf(locationsRes)
      } catch (err) {
        console.error('Error loading petroleum supply lookups:', err)
      }
    },

    queryParams() {
      return buildQueryParams({
        startDate: this.filters.startDate,
        endDate: this.filters.endDate,
        productName: this.filters.productName.trim(),
        supplierId: this.filters.supplierId,
        transportContractorId: this.filters.transportContractorId,
        locationId: this.filters.locationId
      })
    },

    async loadRows() {
      this.loading = true
      try {
        const { data } = await getPetroleumSupplies({ ...this.queryParams(), page: this.page, pageSize: this.pageSize })
        this.rows = Array.isArray(data?.items) ? data.items : []
        this.total = data?.total || 0
        this.totals = data?.totals || { loadTons: 0, supplierDue: 0, transportTotal: 0 }
      } catch (err) {
        console.error('Error loading petroleum supplies:', err)
        this.rows = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    clearFilters() {
      this.filters = emptyFilters()
      this.page = 1
      this.loadRows()
    },

    async exportExcel() {
      this.exporting = true
      try {
        const res = await getPetroleumSuppliesReport(this.queryParams(), 'xlsx')
        downloadBlobData(res.data, getFilenameFromResponse(res.headers, 'petroleum-supplies.xlsx'))
      } catch (err) {
        console.error(err)
        this.$toast?.error(this.$t('common.error'))
      } finally {
        this.exporting = false
      }
    },

    openCreate() {
      this.form = {
        id: null,
        date: new Date().toISOString().substring(0, 10),
        productName: '',
        supplierId: '',
        supplierSearch: '',
        warehouseId: '',
        warehouseSearch: '',
        locationId: '',
        locationSearch: '',
        supplyPermitNo: '',
        vehicleNumber: '',
        loadTons: '',
        tonPrice: '',
        transportContractorId: '',
        transporterSearch: '',
        transportPricePerTon: '',
        notes: ''
      }
      this.modalOpen = true
    },

    openEdit(row) {
      const num = (v) => (v === null || v === undefined ? '' : Number(v))
      this.form = {
        id: row.id,
        date: row.date ? String(row.date).substring(0, 10) : '',
        productName: row.productName || '',
        supplierId: row.supplierId || '',
        supplierSearch: row.supplier?.name || '',
        warehouseId: row.warehouseId || '',
        warehouseSearch: row.warehouse?.name || '',
        locationId: row.locationId || '',
        locationSearch: row.location?.name || '',
        supplyPermitNo: row.supplyPermitNo || '',
        vehicleNumber: row.vehicleNumber || '',
        loadTons: num(row.loadTons),
        tonPrice: num(row.tonPrice),
        transportContractorId: row.transportContractorId || '',
        transporterSearch: row.transportContractor?.name || '',
        transportPricePerTon: num(row.transportPricePerTon),
        notes: row.notes || ''
      }
      this.modalOpen = true
    },

    closeModal() {
      this.modalOpen = false
    },

    validate() {
      const f = this.form
      if (!f.date || !f.productName.trim() || !f.supplierId || !f.warehouseId) return this.$t('petroleum.requiredFields')
      if (!(Number(f.loadTons) > 0) || f.tonPrice === '' || Number(f.tonPrice) < 0) return this.$t('petroleum.requiredFields')
      if (f.transportPricePerTon !== '' && !f.transportContractorId) return this.$t('petroleum.transporterRequired')
      if (f.transportContractorId && f.transportPricePerTon === '') return this.$t('petroleum.transportPriceRequired')
      return null
    },

    async save() {
      const error = this.validate()
      if (error) {
        this.$toast?.error(error)
        return
      }
      const f = this.form
      const hasTransport = Boolean(f.transportContractorId)
      const payload = {
        date: f.date,
        productName: f.productName.trim(),
        supplierId: Number(f.supplierId),
        warehouseId: Number(f.warehouseId),
        locationId: f.locationId ? Number(f.locationId) : null,
        supplyPermitNo: f.supplyPermitNo.trim() || null,
        vehicleNumber: f.vehicleNumber.trim() || null,
        loadTons: Number(f.loadTons),
        tonPrice: Number(f.tonPrice),
        transportContractorId: hasTransport ? Number(f.transportContractorId) : null,
        transportPricePerTon: hasTransport ? Number(f.transportPricePerTon) : null,
        notes: f.notes.trim() || null
      }
      this.saving = true
      try {
        if (f.id) {
          await updatePetroleumSupply(f.id, payload)
        } else {
          await createPetroleumSupply(payload)
          this.page = 1
        }
        this.$toast?.success(this.$t('petroleum.saved'))
        this.closeModal()
        await this.loadRows()
      } catch (e) {
        console.error(e)
        this.$toast?.error(e.response?.data?.message || e.message)
      } finally {
        this.saving = false
      }
    },

    async handleDelete() {
      this.deleting = true
      try {
        await deletePetroleumSupply(this.deleteId)
        this.deleteId = null
        await this.loadRows()
      } catch (e) {
        console.error('Failed to delete petroleum supply', e)
        this.$toast?.error(this.$t('common.deleteError'))
      } finally {
        this.deleting = false
      }
    },

    // Opened from a notification: flash the row if it's on this page, otherwise open it for editing
    async openFocused() {
      const id = getFocusId(this.$route)
      if (!id) return
      clearFocusQuery(this.$router, this.$route)
      if (this.rows.some(r => Number(r.id) === id)) {
        this.$nextTick(() => highlightRow(id))
        return
      }
      try {
        const { data } = await getPetroleumSupply(id)
        if (!data?.id) return notifyFocusMissing()
        this.openEdit(data)
      } catch {
        notifyFocusMissing()
      }
    },

    formatNumber(v) {
      if (v === undefined || v === null || v === '') return '-'
      return Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 })
    },

    formatCurrency(v) {
      if (v === undefined || v === null || v === '') return '-'
      const n = Number(v)
      if (Number.isNaN(n)) return v
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(n)
    },

    formatDate(value) {
      if (!value) return '-'
      try {
        return new Intl.DateTimeFormat('en-GB').format(new Date(value))
      } catch (e) {
        return value
      }
    }
  }
}
</script>
