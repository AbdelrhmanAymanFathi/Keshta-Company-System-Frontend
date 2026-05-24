<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">

    <!-- Header -->
    <div class="app-page-header flex items-center rounded-2xl theme-page-header-bar p-3 sm:p-5 shadow-lg shadow-slate-200/50" :class="isRTL ? 'justify-between' : 'justify-between'">
      <h2 class="text-2xl font-semibold mb-6 theme-text-primary">{{ $t('crushers.title') }}</h2>
      <button
        @click="openAdd"
        class="theme-button px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm text-xs sm:text-sm"
      >
        <PlusIcon class="w-5 h-5" />
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
        class="w-full px-3 py-2 border border-gray-300 rounded-lg theme-input-focus"
      />
    </div>

    <!-- Desktop Table -->
    <div class="hidden sm:block bg-white rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-200/80 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="theme-table-thead-gradient">
          <tr>
            <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium theme-text-muted uppercase tracking-wider text-start">
              {{ $t('labels.#') }}
            </th>
            <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium theme-text-muted uppercase tracking-wider text-start">
              {{ $t('crushers.name') }}
            </th>
            <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium theme-text-muted uppercase tracking-wider text-start">
              {{ $t('labels.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(crusher, idx) in filtered"
            :key="crusher.id"
            class="theme-table-row-hover cursor-pointer transition-colors"
            @click="openContextMenu($event, crusher)"
            @contextmenu.prevent="openContextMenu($event, crusher)"
          >
            <td class="px-3 py-2 sm:px-6 sm:py-4 text-sm theme-text-primary text-start">{{ idx + 1 }}</td>
            <td class="px-3 py-2 sm:px-6 sm:py-4">
              <div class="flex items-center gap-4" :class="isRTL ? 'flex-row-reverse justify-end' : 'flex-row justify-start'">
                
                <div :class="isRTL ? 'text-right' : 'text-left'">
                  <div class="text-sm font-medium theme-text-primary">{{ crusher.name }}</div>
                </div>
              </div>
            </td>
            <td class="px-3 py-2 sm:px-6 sm:py-4">
              <div class="flex gap-4" :class="isRTL ? 'justify-start' : 'justify-end'">
                <button @click.stop="openEdit(crusher)" class="rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-700 hover:bg-amber-100">
                  <PencilSquareIcon class="h-5 w-5" />
                </button>
                <button @click.stop="confirmDelete(crusher)" class="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100">
                  <TrashIcon class="h-5 w-5" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="3" class="px-3 py-2 sm:px-6 sm:py-3 text-start theme-text-muted">
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
        class="bg-white rounded-2xl shadow-lg shadow-slate-200/30 border border-slate-200/80 p-3 sm:p-4 cursor-pointer"
        @click="openContextMenu($event, crusher)"
        @contextmenu.prevent="openContextMenu($event, crusher)"
      >
        <div class="flex items-center justify-between" :class="isRTL ? 'flex-row-reverse' : ''">
          <div class="flex items-center gap-4" :class="isRTL ? 'flex-row-reverse' : 'flex-row'">
            <div class="flex-shrink-0 h-12 w-12">
              <div class="h-12 w-12 rounded-full bg-gradient-to-br theme-icon-bg flex items-center justify-center">
                <CubeIcon class="h-7 w-7 theme-text-light" />
              </div>
            </div>
            <div :class="isRTL ? 'text-right' : 'text-left'">
              <div class="font-semibold theme-text-primary">{{ crusher.name }}</div>
              <div class="text-sm theme-text-muted">ID: {{ crusher.id }}</div>
            </div>
          </div>
          <div class="flex gap-4">
            <button @click.stop="openEdit(crusher)" class="rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-700 hover:bg-amber-100">
              <PencilSquareIcon class="h-5 w-5" />
            </button>
            <button @click.stop="confirmDelete(crusher)" class="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100">
              <TrashIcon class="h-5 w-5" />
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
      class="fixed bg-white rounded-xl shadow-lg py-2 z-50 border border-slate-200 min-w-[140px]"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @click.stop
      @contextmenu.prevent
    >
      <button
        @click="contextAction('edit')"
        class="w-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
        :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'"
      >
        <PencilSquareIcon class="h-4 w-4" />
        {{ $t('labels.edit') }}
      </button>
      <button
        @click="contextAction('delete')"
        class="w-full px-4 py-2 text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
        :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'"
      >
        <TrashIcon class="h-4 w-4" />
        {{ $t('labels.delete') }}
      </button>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm" style="margin-top: 0; ">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-4 sm:p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">
            {{ editing ? $t('crushers.editCrusher') : $t('crushers.addCrusher') }}
          </h3>
          <button @click="closeModal" class="theme-caption hover:theme-text-secondary">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        <div>
          <label class="block text-sm font-medium theme-text-secondary mb-1">
            {{ $t('crushers.name') }} <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.name"
            class="w-full px-3 py-2 border rounded-md theme-input-focus "
            :placeholder="$t('crushers.namePlaceholder')"
          />
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button @click="closeModal" class="px-4 py-2 border rounded-md theme-text-secondary hover:bg-gray-50">
            {{ $t('labels.cancel') }}
          </button>
          <button
            @click="saveCrusher"
            :disabled="loading"
            class="px-4 py-2 theme-button rounded-md disabled:opacity-50"
          >
            {{ loading ? $t('labels.saving') : $t('labels.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="deleteConfirm.open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-4 sm:p-6">
        <div class="text-center">
          <div class="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ExclamationTriangleIcon class="w-6 h-6 text-red-600" />
          </div>
          <p class="theme-text-primary mb-6">
            {{ $t('crushers.deleteConfirm') }} "<strong>{{ deleteConfirm.item.name }}</strong>"?
          </p>
          <div class="flex justify-center gap-3">
            <button @click="cancelDelete" class="px-4 py-2 border rounded-md theme-text-secondary hover:bg-gray-50">
              {{ $t('labels.cancel') }}
            </button>
            <button @click="doDelete" :disabled="loading" class="px-4 py-2 bg-red-600 theme-text-light rounded-md hover:bg-red-700 disabled:opacity-50">
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
import { CubeIcon, ExclamationTriangleIcon, PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon } from '@acme/icon-packs/legacy'

export default {
  name: 'CrushersList',
  components: { Pagination, CubeIcon, ExclamationTriangleIcon, PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon },
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
