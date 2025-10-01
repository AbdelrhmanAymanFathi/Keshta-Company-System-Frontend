<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" :class="isRTL ? 'direction-rtl p-6' : 'p-6'">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4" :class="isRTL ? 'sm:flex-row-reverse' : ''">
      <h1 class="text-2xl font-semibold" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('crushers.title') }}</h1>

      <div class="flex items-center gap-2" :class="isRTL ? 'flex-row-reverse' : ''">
        <button @click="openAdd()" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2" :class="isRTL ? 'flex-row-reverse' : ''">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14M5 12h14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ $t('crushers.add') }}
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="mb-4">
      <input v-model="q" type="search" :placeholder="$t('crushers.searchPlaceholder')"
             class="w-full sm:w-1/2 px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
             :class="isRTL ? 'text-right' : 'text-left'" />
    </div>

    <!-- Desktop table -->
    <div class="hidden sm:block">
      <div class="overflow-auto bg-white rounded-lg shadow-sm border">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gradient-to-r from-indigo-50 to-indigo-100">
            <tr>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('labels.#') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('crushers.name') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('crushers.createdAt') }}
              </th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">
                {{ $t('labels.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(crusher, idx) in filtered" :key="crusher.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" :class="isRTL ? 'text-right' : 'text-left'">
                {{ idx + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center" :class="isRTL ? 'flex-row-reverse' : ''">
                  <div class="flex-shrink-0 h-10 w-10" :class="isRTL ? 'ml-4' : 'mr-4'">
                    <div class="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                      <svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 7h18M3 12h18M3 17h18" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900" :class="isRTL ? 'text-right' : 'text-left'">{{ crusher.name }}</div>
                    <div class="text-sm text-gray-500" :class="isRTL ? 'text-right' : 'text-left'">ID: {{ crusher.id }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" :class="isRTL ? 'text-right' : 'text-left'">
                {{ formatDate(crusher.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div :class="['flex gap-2', isRTL ? 'flex-row-reverse' : '']">
                  <button @click="openEdit(crusher)" 
                          class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                          :class="isRTL ? 'flex-row-reverse' : ''">
                    <svg class="w-3 h-3" :class="isRTL ? 'ml-1' : 'mr-1'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    {{ $t('labels.edit') }}
                  </button>
                  <button @click="confirmDelete(crusher)" 
                          class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                          :class="isRTL ? 'flex-row-reverse' : ''">
                    <svg class="w-3 h-3" :class="isRTL ? 'ml-1' : 'mr-1'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    {{ $t('labels.delete') }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td class="px-6 py-4 text-center text-gray-500" colspan="4">
                <div class="flex flex-col items-center py-8">
                  <svg class="w-12 h-12 text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 7h18M3 12h18M3 17h18" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                  {{ $t('crushers.noResults') }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile cards -->
    <div class="sm:hidden grid gap-3">
      <div v-for="crusher in filtered" :key="crusher.id" 
           :class="['p-4 bg-white rounded-lg shadow-sm border flex justify-between items-start', isRTL ? 'flex-row-reverse' : '']">
        <div :class="isRTL ? 'text-right' : ''">
          <div class="flex items-center mb-2" :class="isRTL ? 'flex-row-reverse' : ''">
            <div class="flex-shrink-0 h-8 w-8" :class="isRTL ? 'ml-3 mr-0' : 'mr-3'">
              <div class="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 7h18M3 12h18M3 17h18" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
            <div>
              <div class="font-semibold text-gray-900" :class="isRTL ? 'text-right' : 'text-left'">{{ crusher.name }}</div>
              <div class="text-sm text-gray-500" :class="isRTL ? 'text-right' : 'text-left'">ID: {{ crusher.id }}</div>
            </div>
          </div>
          <div class="text-sm text-gray-500" :class="isRTL ? 'text-right' : 'text-left'">
            {{ $t('crushers.createdAt') }}: {{ formatDate(crusher.createdAt) }}
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <button @click="openEdit(crusher)" 
                  class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-yellow-500 hover:bg-yellow-600"
                  :class="isRTL ? 'flex-row-reverse' : ''">
            <svg class="w-3 h-3" :class="isRTL ? 'ml-1' : 'mr-1'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ $t('labels.edit') }}
          </button>
          <button @click="confirmDelete(crusher)" 
                  class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-500 hover:bg-red-600"
                  :class="isRTL ? 'flex-row-reverse' : ''">
            <svg class="w-3 h-3" :class="isRTL ? 'ml-1' : 'mr-1'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ $t('labels.delete') }}
          </button>
        </div>
      </div>
      <div v-if="filtered.length === 0" class="text-center text-gray-500 py-8">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 7h18M3 12h18M3 17h18" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        {{ $t('crushers.noResults') }}
      </div>
    </div>

    <!-- Modal: Add / Edit crusher -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black opacity-40" @click="closeModal"></div>
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-10 mx-4">
        <div class="flex items-center justify-between mb-4" :class="isRTL ? 'flex-row-reverse' : ''">
          <h3 class="text-lg font-semibold text-gray-900" :class="isRTL ? 'text-right' : ''">
            {{ editing ? $t('crushers.editCrusher') : $t('crushers.addCrusher') }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2" :class="isRTL ? 'text-right' : ''">
              {{ $t('crushers.name') }} <span class="text-red-500">*</span>
            </label>
            <input v-model="form.name" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                   :class="isRTL ? 'text-right' : ''"
                   :placeholder="$t('crushers.namePlaceholder')" />
          </div>
        </div>

        <div class="mt-6 flex gap-3 justify-end" :class="isRTL ? 'flex-row-reverse' : ''">
          <button @click="closeModal" 
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            {{ $t('labels.cancel') }}
          </button>
          <button @click="saveCrusher" 
                  :disabled="loading"
                  :class="['px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors', 
                          editing ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
                          loading ? 'opacity-50 cursor-not-allowed' : '']">
            <span v-if="loading" class="flex items-center" :class="isRTL ? 'flex-row-reverse' : ''">
              <svg class="animate-spin h-4 w-4 text-white" :class="isRTL ? 'ml-2 -mr-1' : '-ml-1 mr-2'" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ $t('labels.saving') }}
            </span>
            <span v-else>{{ $t('labels.save') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm delete modal -->
    <div v-if="deleteConfirm.open" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black opacity-40" @click="cancelDelete"></div>
      <div class="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 z-10 mx-4">
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <p class="text-center text-gray-900 mb-4" :class="isRTL ? 'text-right' : ''">
          {{ $t('crushers.deleteConfirm') }} "<strong>{{ deleteConfirm.item.name }}</strong>"?
        </p>
        <div class="flex gap-3 justify-end" :class="isRTL ? 'flex-row-reverse' : ''">
          <button @click="cancelDelete" 
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            {{ $t('labels.cancel') }}
          </button>
          <button @click="doDelete" 
                  :disabled="loading"
                  :class="['px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors',
                          loading ? 'opacity-50 cursor-not-allowed' : '']">
            <span v-if="loading" class="flex items-center" :class="isRTL ? 'flex-row-reverse' : ''">
              <svg class="animate-spin h-4 w-4 text-white" :class="isRTL ? 'ml-2 -mr-1' : '-ml-1 mr-2'" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ $t('labels.deleting') }}
            </span>
            <span v-else>{{ $t('labels.delete') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCrushers, createCrusher, deleteCrusher } from '../../api'

export default {
  name: 'CrushersList',
  data() {
    return {
      q: '',
      modalOpen: false,
      editing: false,
      loading: false,
      form: { id: null, name: '' },
      crushers: [],
      deleteConfirm: { open: false, item: null }
    }
  },
  computed: {
    isRTL() { return this.$i18n && this.$i18n.locale === 'ar' },
    filtered() {
      if (!this.q) return this.crushers
      const s = this.q.toLowerCase()
      return this.crushers.filter(crusher =>
        (crusher.name || '').toLowerCase().includes(s)
      )
    }
  },
  async mounted() {
    await this.loadCrushers()
  },
  methods: {
    async loadCrushers() {
      try {
        const res = await getCrushers()
        this.crushers = Array.isArray(res.data) ? res.data : []
      } catch (e) {
        console.error('Error loading crushers:', e)
        this.crushers = []
      }
    },
    
    openAdd() {
      this.editing = false
      this.form = { id: null, name: '' }
      this.modalOpen = true
    },
    
    openEdit(crusher) {
      this.editing = true
      this.form = Object.assign({}, crusher)
      this.modalOpen = true
    },
    
    closeModal() {
      this.modalOpen = false
    },
    
    async saveCrusher() {
      const name = (this.form.name || '').trim()
      if (!name) {
        alert(this.$t('crushers.validationName'))
        return
      }
      
      this.loading = true
      
      try {
        if (this.editing) {
          // For now, just update locally since there's no update API
          const idx = this.crushers.findIndex(x => x.id === this.form.id)
          if (idx !== -1) {
            this.crushers.splice(idx, 1, Object.assign({}, this.form))
          }
        } else {
          const res = await createCrusher({ name })
          this.crushers.push(res.data)
        }
        this.modalOpen = false
      } catch (e) {
        console.error('Error saving crusher:', e)
        alert(this.$t('crushers.saveError'))
      } finally {
        this.loading = false
      }
    },
    
    async doDelete() {
      const id = this.deleteConfirm.item.id
      this.loading = true
      
      try {
        await deleteCrusher(id)
        this.crushers = this.crushers.filter(crusher => crusher.id !== id)
        this.cancelDelete()
      } catch (e) {
        console.error('Error deleting crusher:', e)
        alert(this.$t('crushers.deleteError'))
      } finally {
        this.loading = false
      }
    },
    
    confirmDelete(crusher) {
      this.deleteConfirm = { open: true, item: crusher }
    },
    
    cancelDelete() {
      this.deleteConfirm = { open: false, item: null }
    },
    
    formatDate(dateString) {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString(this.$i18n.locale === 'ar' ? 'ar-EG' : 'en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch (e) {
        return dateString
      }
    }
  }
}
</script>

<style scoped>
/* RTL support */
.direction-rtl input,
.direction-rtl select,
.direction-rtl textarea {
  direction: rtl;
  text-align: right;
}

.direction-rtl table th,
.direction-rtl table td {
  text-align: right;
}

/* RTL specific adjustments */
.direction-rtl .flex-row-reverse {
  flex-direction: row-reverse !important;
}

.direction-rtl .text-right {
  text-align: right !important;
}

.direction-rtl .text-left {
  text-align: left !important;
}

.direction-rtl .ml-4 {
  margin-left: 0 !important;
  margin-right: 1rem !important;
}

.direction-rtl .mr-4 {
  margin-right: 0 !important;
  margin-left: 1rem !important;
}

.direction-rtl .ml-3 {
  margin-left: 0 !important;
  margin-right: 0.75rem !important;
}

.direction-rtl .mr-3 {
  margin-right: 0 !important;
  margin-left: 0.75rem !important;
}

.direction-rtl .ml-2 {
  margin-left: 0 !important;
  margin-right: 0.5rem !important;
}

.direction-rtl .mr-2 {
  margin-right: 0 !important;
  margin-left: 0.5rem !important;
}

.direction-rtl .ml-1 {
  margin-left: 0 !important;
  margin-right: 0.25rem !important;
}

.direction-rtl .mr-1 {
  margin-right: 0 !important;
  margin-left: 0.25rem !important;
}

/* Force RTL layout for specific elements */
.direction-rtl button {
  text-align: right !important;
}

.direction-rtl input {
  text-align: right !important;
}

.direction-rtl table th,
.direction-rtl table td {
  text-align: right !important;
}

.direction-rtl .sm\:flex-row-reverse {
  flex-direction: row-reverse !important;
}

/* Custom scrollbar for table */
.overflow-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Smooth transitions */
.transition-colors {
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}

/* Focus styles */
.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
}

.focus\:ring-yellow-500:focus {
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.5);
}

.focus\:ring-red-500:focus {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.5);
}
</style>