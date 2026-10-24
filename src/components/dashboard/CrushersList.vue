<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">

    <PageHeader :title="$t('crushers.title')">
      <Button class="gap-2" @click="openAdd">
        <PlusIcon class="w-5 h-5" />
        {{ $t('crushers.add') }}
      </Button>
    </PageHeader>

    <!-- Search -->
    <div class="max-w-md">
      <Input
        v-model="q"
        @input="onSearchInput"
        type="search"
        :placeholder="$t('crushers.searchPlaceholder')"
        class="w-full"
      />
    </div>

    <!-- Table (stacked rows on phones, see "App tables" in main.css) -->
    <div class="app-table-card">
      <table v-app-table class="app-table divide-y divide-gray-200">
        <thead class="theme-table-thead-gradient">
          <tr>
            <th class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium theme-text-muted uppercase tracking-wider text-start">
              {{ $t('labels.#') }}
            </th>
            <th data-col="title" class="px-3 py-2 sm:px-6 sm:py-3 text-xs font-medium theme-text-muted uppercase tracking-wider text-start">
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
              <RowActions :actions="rowActions(crusher)" />
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
      <ShadcnButton variant="outline" size="native"
        @click="contextAction('edit')"
        class="w-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
        :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'"
      >
        <PencilSquareIcon class="h-4 w-4" />
        {{ $t('labels.edit') }}
      </ShadcnButton>
      <ShadcnButton variant="outline" size="native"
        @click="contextAction('delete')"
        class="w-full px-4 py-2 text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
        :class="isRTL ? 'text-right flex-row-reverse' : 'text-left'"
      >
        <TrashIcon class="h-4 w-4" />
        {{ $t('labels.delete') }}
      </ShadcnButton>
    </div>

    <!-- Add/Edit Modal -->
    <Modal
      :visible="modalOpen"
      :title="editing ? $t('crushers.editCrusher') : $t('crushers.addCrusher')"
      size="sm"
      @update:visible="modalOpen = $event"
    >
      <div>
        <Label class="block text-sm font-medium theme-text-secondary mb-1">
          {{ $t('crushers.name') }} <span class="text-red-500">*</span>
        </Label>
        <Input
          v-model="form.name"
          class="w-full"
          :placeholder="$t('crushers.namePlaceholder')"
        />
      </div>
      <template #footer>
        <Button variant="outline" @click="closeModal">{{ $t('labels.cancel') }}</Button>
        <Button @click="saveCrusher" :disabled="loading">{{ loading ? $t('labels.saving') : $t('labels.save') }}</Button>
      </template>
    </Modal>

    <!-- Delete Confirm Modal -->
    <ConfirmDialog
      :show="deleteConfirm.open"
      :title="$t('labels.confirmDelete') || 'Confirm Delete'"
      :message="deleteConfirm.item ? ($t('labels.confirmDelete') + ' ' + deleteConfirm.item.name) : ''"
      :loading="loading"
      type="danger"
      @confirm="doDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script>
import { ref } from 'vue'
import { getCrushers, createCrusher, deleteCrusher, updateCrusher } from '../../api'
import { usePagination } from '@/composables/usePagination'
import PageHeader from '@/components/shared/PageHeader.vue'
import Pagination from '@/components/shared/Pagination.vue'
import RowActions from '@/components/shared/RowActions.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Modal from '@/components/shared/Modal.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import { ExclamationTriangleIcon, PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon } from '@acme/icon-packs/legacy'

export default {
  name: 'CrushersList',
  components: {
    Modal,
    ConfirmDialog,
    PageHeader, Label, Pagination, RowActions, Button, Input, ExclamationTriangleIcon, PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon },
  setup() {
    const q = ref('')
    const searchTimeout = ref(null)

    const { items: crushers, page, pageSize, total, totalPages, loading, load, setPage, setPageSize } = usePagination(
      (p, ps, extra) => getCrushers({ page: p, pageSize: ps, q: extra.q ?? q.value }),
      { initialPageSize: 20, resourceName: 'crushers' }
    )

    const loadCrushers = () => load({ q: q.value })

    return { q, searchTimeout, crushers, page, pageSize, total, totalPages, loading, loadCrushers, setPage, setPageSize }
  },
  data() {
    return {
      modalOpen: false,
      editing: false,
      form: { id: null, name: '' },
      deleteConfirm: { open: false, item: null },
      contextMenu: { open: false, x: 0, y: 0, item: null }
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
    changePage(p) {
      if (p >= 1 && p <= this.totalPages && p !== this.page) {
        this.setPage(p)
        this.loadCrushers()
      }
    },
    onPageSizeChange(size) {
      this.setPageSize(size)
      this.loadCrushers()
    },
    onSearchInput() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.setPage(1)
        this.loadCrushers()
      }, 500)
    },
    rowActions(crusher) {
      return [
        { key: 'edit', icon: PencilSquareIcon, label: this.$t('labels.edit'), tone: 'edit', onClick: () => this.openEdit(crusher) },
        { key: 'delete', icon: TrashIcon, label: this.$t('labels.delete'), tone: 'delete', onClick: () => this.confirmDelete(crusher) },
      ]
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
    void(window.$toast ? window.$toast(this.$t('crushers.validationName'), 'error') : alert(this.$t('crushers.validationName')))
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
    void(window.$toast ? window.$toast(this.$t('crushers.saveError') || 'حدث خطأ أثناء الحفظ', 'error') : alert(this.$t('crushers.saveError') || 'حدث خطأ أثناء الحفظ'))
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
    void(window.$toast ? window.$toast(this.$t('crushers.deleteError') || 'حدث خطأ أثناء الحذف', 'error') : alert(this.$t('crushers.deleteError') || 'حدث خطأ أثناء الحذف'))
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
