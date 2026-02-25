<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-6 space-y-6">

    <!-- Header -->
    <div class="flex items-center" :class="isRTL ? 'justify-between' : 'justify-between'">
      <h2 class="text-2xl font-semibold mb-6 text-gray-800">{{ $t('crushers.title') }}</h2>
      <button
        @click="openAdd"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ $t('crushers.add') }}
      </button>
    </div>

    <!-- Search -->
    <div class="max-w-md">
      <input
        v-model="q"
        @input="onSearchInput"
        type="search"
        :placeholder="$t('crushers.searchPlaceholder')"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>

    <!-- Desktop Table -->
    <div class="hidden sm:block bg-white rounded-lg shadow-sm border overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-indigo-50">
          <tr>
            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="textAlign">
              {{ $t('labels.#') }}
            </th>
            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="textAlign">
              {{ $t('crushers.name') }}
            </th>
            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" :class="textAlign">
              {{ $t('labels.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(crusher, idx) in filtered"
            :key="crusher.id"
            class="hover:bg-gray-50 cursor-pointer transition-colors"
            @click="openContextMenu($event, crusher)"
            @contextmenu.prevent="openContextMenu($event, crusher)"
          >
            <td class="px-6 py-4 text-sm text-gray-900" :class="textAlign">{{ idx + 1 }}</td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-4" :class="isRTL ? 'flex-row-reverse justify-end' : 'flex-row justify-start'">
                
                <div :class="isRTL ? 'text-right' : 'text-left'">
                  <div class="text-sm font-medium text-gray-900">{{ crusher.name }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex gap-4" :class="isRTL ? 'justify-start' : 'justify-end'">
                <button @click.stop="openEdit(crusher)" class="text-yellow-600 hover:text-yellow-800">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click.stop="confirmDelete(crusher)" class="text-red-600 hover:text-red-800">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="3" class="px-6 py-2 text-start text-gray-500">
              {{ $t('crushers.noResults') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="sm:hidden space-y-4">
      <div
        v-for="crusher in filtered"
        :key="crusher.id"
        class="bg-white rounded-lg shadow-sm border p-4 cursor-pointer"
        @click="openContextMenu($event, crusher)"
        @contextmenu.prevent="openContextMenu($event, crusher)"
      >
        <div class="flex items-center justify-between" :class="isRTL ? 'flex-row-reverse' : ''">
          <div class="flex items-center gap-4" :class="isRTL ? 'flex-row-reverse' : 'flex-row'">
            <div class="flex-shrink-0 h-12 w-12">
              <div class="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
                <!-- Same modern icon for mobile -->
                <svg class="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div :class="isRTL ? 'text-right' : 'text-left'">
              <div class="font-semibold text-gray-900">{{ crusher.name }}</div>
              <div class="text-sm text-gray-500">ID: {{ crusher.id }}</div>
            </div>
          </div>
          <div class="flex gap-4">
            <button @click.stop="openEdit(crusher)" class="text-yellow-600 hover:text-yellow-800">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click.stop="confirmDelete(crusher)" class="text-red-600 hover:text-red-800">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="totalPages > 1"
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      :total-pages="totalPages"
      @update:page="changePage"
      @update:pageSize="onPageSizeChange"
    />

    <!-- Context Menu -->
    <div
      v-if="contextMenu.open"
      class="fixed bg-white rounded-lg shadow-lg py-2 z-50 border min-w-[140px]"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @click.stop
      @contextmenu.prevent
    >
      <button
        @click="contextAction('edit')"
        class="w-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
        :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        {{ $t('labels.edit') }}
      </button>
      <button
        @click="contextAction('delete')"
        class="w-full px-4 py-2 text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
        :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {{ $t('labels.delete') }}
      </button>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">
            {{ editing ? $t('crushers.editCrusher') : $t('crushers.addCrusher') }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('crushers.name') }} <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.name"
            class="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            :placeholder="$t('crushers.namePlaceholder')"
          />
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button @click="closeModal" class="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">
            {{ $t('labels.cancel') }}
          </button>
          <button
            @click="saveCrusher"
            :disabled="loading"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ loading ? $t('labels.saving') : $t('labels.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="deleteConfirm.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
        <div class="text-center">
          <div class="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p class="text-gray-900 mb-6">
            {{ $t('crushers.deleteConfirm') }} "<strong>{{ deleteConfirm.item.name }}</strong>"?
          </p>
          <div class="flex justify-center gap-3">
            <button @click="cancelDelete" class="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">
              {{ $t('labels.cancel') }}
            </button>
            <button @click="doDelete" :disabled="loading" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">
              {{ loading ? $t('labels.deleting') : $t('labels.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCrushers, createCrusher, deleteCrusher, updateCrusher } from '../../api'
import Pagination from '@/components/shared/Pagination.vue'

export default {
  name: 'CrushersList',
  components: { Pagination },
  data() {
    return {
      q: '',
      modalOpen: false,
      editing: false,
      loading: false,
      form: { id: null, name: '' },
      crushers: [],
      deleteConfirm: { open: false, item: null },
      contextMenu: { open: false, x: 0, y: 0, item: null },
      page: 1,
      pageSize: 20,
      total: 0,
      searchTimeout: null
    }
  },
  computed: {
    isRTL() {
      return this.$i18n?.locale === 'ar'
    },
    textAlign() {
      return this.isRTL ? 'text-right' : 'text-left'
    },
    filtered() {
      if (!this.q) return this.crushers
      const s = this.q.toLowerCase()
      return this.crushers.filter(c => c.name.toLowerCase().includes(s))
    },
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
    }
  },
  mounted() {
    this.loadCrushers()
    document.addEventListener('click', this.closeContextMenu)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeContextMenu)
  },
  methods: {
    async loadCrushers() {
      try {
        const res = await getCrushers({ page: this.page, pageSize: this.pageSize, q: this.q })
        const payload = res.data || {}
        this.crushers = Array.isArray(payload.items) ? payload.items :
                         Array.isArray(payload.data) ? payload.data :
                         Array.isArray(payload) ? payload : []
        const meta = payload.meta || {}
        this.total = meta.total ?? payload.total ?? this.crushers.length
      } catch (e) {
        console.error(e)
        this.crushers = []
        this.total = 0
      }
    },
    changePage(p) {
      if (p >= 1 && p <= this.totalPages && p !== this.page) {
        this.page = p
        this.loadCrushers()
      }
    },
    onPageSizeChange(size) {
      this.pageSize = size
      this.page = 1
      this.loadCrushers()
    },
    onSearchInput() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.page = 1
        this.loadCrushers()
      }, 500)
    },
    openAdd() {
      this.editing = false
      this.form = { id: null, name: '' }
      this.modalOpen = true
    },
    openEdit(crusher) {
      this.editing = true
      this.form = { ...crusher }
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
    if (this.editing && this.form.id) {
      // استخدم updateCrusher الجديد
      const res = await updateCrusher(this.form.id, { name })
      const idx = this.crushers.findIndex(c => c.id === this.form.id)
      if (idx !== -1) {
        this.crushers.splice(idx, 1, res.data)
      }
    } else {
      const res = await createCrusher({ name })
      this.crushers.push(res.data)
      this.total++
    }
    this.closeModal()
    // اختياري: reload عشان الـ pagination تبقى دقيقة
    await this.loadCrushers()
  } catch (e) {
    console.error('Error saving crusher:', e)
    alert(this.$t('crushers.saveError') || 'حدث خطأ أثناء الحفظ')
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
    async doDelete() {
  this.loading = true
  try {
    await deleteCrusher(this.deleteConfirm.item.id)
    await this.loadCrushers() // reload عشان الـ pagination والـ total يتحدثوا
    this.cancelDelete()
  } catch (e) {
    console.error('Error deleting crusher:', e)
    alert(this.$t('crushers.deleteError') || 'حدث خطأ أثناء الحذف')
  } finally {
    this.loading = false
  }
},
    openContextMenu(e, crusher) {
      this.contextMenu = {
        open: true,
        x: e.clientX,
        y: e.clientY,
        item: crusher
      }
    },
    closeContextMenu() {
      this.contextMenu.open = false
    },
    contextAction(action) {
      if (action === 'edit') this.openEdit(this.contextMenu.item)
      if (action === 'delete') this.confirmDelete(this.contextMenu.item)
      this.closeContextMenu()
    }
  }
}
</script>

<style scoped>
/* RTL table alignment */
[dir="rtl"] table th,
[dir="rtl"] table td {
  text-align: right;
}
</style>