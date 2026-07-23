<template>
  <div class="space-y-6" :class="{ 'direction-rtl': isRTL }">
    <PageHeader :title="$t('expenses.termsManagement')" :subtitle="$t('expenses.termsManagementSubtitle')">
      <button 
        @click="openAddCategoryModal"
        class="theme-button px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm text-xs sm:text-sm"
      >
        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        {{ $t('expenses.addMainTerm') }}
      </button>
    </PageHeader>

    <!-- Search & Tree Controls bar -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div class="relative flex-1 w-full">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('expenses.searchTermsPlaceholder')"
          class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl theme-input-focus text-sm transition-all"
          :class="isRTL ? 'text-right pr-10 pl-4' : 'text-left pl-10 pr-4'"
        />
        <svg class="w-5 h-5 text-slate-400 absolute top-3" :class="isRTL ? 'right-3' : 'left-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button 
          @click="expandAll" 
          class="px-3 py-1.5 text-xs font-semibold theme-text-secondary bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
          توسيع الكل
        </button>
        <button 
          @click="collapseAll" 
          class="px-3 py-1.5 text-xs font-semibold theme-text-secondary bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
          </svg>
          طي الكل
        </button>
        <div class="text-xs theme-text-muted font-medium px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
          {{ $t('expenses.totalMainTerms', { count: categories.length }) }}
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-16 bg-white rounded-2xl border border-slate-200">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredCategories.length === 0" class="text-center py-16 bg-white rounded-2xl border border-slate-200">
      <svg class="w-16 h-16 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
      </svg>
      <h3 class="text-lg font-semibold text-slate-700 mb-1">{{ $t('expenses.noMatchingTerms') }}</h3>
      <p class="text-sm text-slate-500">{{ $t('expenses.addMainTermHint') }}</p>
    </div>

    <!-- Main Terms Tree View Hierarchy -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6 space-y-3">
      <div 
        v-for="cat in filteredCategories" 
        :key="cat.id" 
        class="border border-slate-200/80 rounded-xl overflow-hidden transition-all duration-200"
      >
        <!-- Main Term Node Header -->
        <div 
          class="p-4 flex items-center justify-between bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer transition-colors select-none"
          @click="toggleExpand(cat.id)"
        >
          <div class="flex items-center gap-3">
            <!-- Expand / Collapse Chevron Icon -->
            <button 
              type="button"
              class="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-transform duration-200 shadow-2xs"
              :class="{ 'rotate-90': isExpanded(cat.id) }"
            >
              <svg class="w-4 h-4" :class="isRTL ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>

            <!-- Folder Icon & Category Title -->
            <span class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shadow-2xs border border-emerald-200/60">
              <svg class="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
              </svg>
            </span>
            <div>
              <h3 class="text-base font-bold theme-text-primary flex items-center gap-2">
                {{ cat.name }}
                <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                  {{ cat.subCategories ? cat.subCategories.length : 0 }} {{ $t('expenses.subcategoryCount') }}
                </span>
              </h3>
            </div>
          </div>

          <!-- Actions (Add Sub, Edit, Delete) -->
          <div class="flex items-center gap-2" @click.stop>
            <button 
              @click="openAddSubCategoryModal(cat)"
              class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              {{ $t('expenses.addSubcategory') }}
            </button>

            <button 
              @click="openEditCategoryModal(cat)"
              class="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              :title="$t('expenses.editMainTerm')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>

            <button 
              @click="confirmDeleteCategory(cat)"
              class="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              :title="$t('expenses.deleteMainTerm')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Subcategories Tree Branch View -->
        <div v-show="isExpanded(cat.id)" class="bg-slate-50/40 p-4 border-t border-slate-200/60">
          <div v-if="!cat.subCategories || cat.subCategories.length === 0" class="text-xs text-slate-400 italic py-3 px-6">
            {{ $t('expenses.noSubcategories') }}
          </div>

          <div v-else class="relative space-y-2" :class="isRTL ? 'pr-6 border-r-2 border-emerald-300/60' : 'pl-6 border-l-2 border-emerald-300/60'">
            <div 
              v-for="subCat in cat.subCategories" 
              :key="subCat.id"
              class="relative bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between hover:border-emerald-300 hover:shadow-xs transition-all"
            >
              <!-- Branch Line Bullet -->
              <div 
                class="absolute w-3 h-0.5 bg-emerald-300/80 top-1/2"
                :class="isRTL ? '-right-3' : '-left-3'"
              ></div>

              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                </svg>
                <span class="text-sm font-semibold text-slate-800">{{ subCat.name }}</span>
              </div>

              <div class="flex items-center gap-1">
                <button 
                  @click="openEditSubCategoryModal(cat, subCat)" 
                  class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  :title="$t('expenses.editSubcategory')"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                </button>
                <button 
                  @click="confirmDeleteSubCategory(subCat)" 
                  class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  :title="$t('expenses.deleteSubcategory')"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Modal (Add / Edit Main Term) -->
    <div v-if="categoryModal.open" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in duration-200">
        <div class="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white flex justify-between items-center">
          <h3 class="font-bold text-lg">{{ categoryModal.isEdit ? $t('expenses.editMainTerm') : $t('expenses.addMainTerm') }}</h3>
          <button @click="categoryModal.open = false" class="text-white/80 hover:text-white">&times;</button>
        </div>
        <form @submit.prevent="saveCategory" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium theme-text-secondary mb-1">{{ $t('expenses.mainTermName') }} <span class="text-red-500">*</span></label>
            <input 
              v-model="categoryModal.name" 
              type="text" 
              required 
              placeholder="مثال: محروقات، صيانة سيارات..."
              class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl theme-input-focus"
            />
          </div>
          <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              @click="categoryModal.open = false" 
              class="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium"
            >
              {{ $t('labels.cancel') }}
            </button>
            <button 
              type="submit" 
              :disabled="saving"
              class="px-4 py-2 text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {{ saving ? $t('labels.saving') : $t('labels.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- SubCategory Modal (Add / Edit Secondary Term) -->
    <div v-if="subCategoryModal.open" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in duration-200">
        <div class="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white flex justify-between items-center">
          <h3 class="font-bold text-lg">{{ subCategoryModal.isEdit ? $t('expenses.editSubcategory') : $t('expenses.addSubcategory') }}</h3>
          <button @click="subCategoryModal.open = false" class="text-white/80 hover:text-white">&times;</button>
        </div>
        <form @submit.prevent="saveSubCategory" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium theme-text-secondary mb-1">{{ $t('expenses.parentCategoryLabel') }}</label>
            <input 
              :value="subCategoryModal.parentCategoryName" 
              disabled 
              type="text" 
              class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold"
            />
          </div>
          <div>
            <label class="block text-sm font-medium theme-text-secondary mb-1">{{ $t('expenses.subcategoryName') }} <span class="text-red-500">*</span></label>
            <input 
              v-model="subCategoryModal.name" 
              type="text" 
              required 
              placeholder="مثال: ديميكس دبل أبيض، هراس GCB..."
              class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl theme-input-focus"
            />
          </div>
          <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              @click="subCategoryModal.open = false" 
              class="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium"
            >
              {{ $t('labels.cancel') }}
            </button>
            <button 
              type="submit" 
              :disabled="saving"
              class="px-4 py-2 text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {{ saving ? $t('labels.saving') : $t('labels.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  createExpenseSubCategory,
  updateExpenseSubCategory,
  deleteExpenseSubCategory
} from '../../../api'
import PageHeader from '@/components/shared/PageHeader.vue'

export default {
  name: 'TermsManagement',
  components: { PageHeader },
  data() {
    return {
      categories: [],
      expandedCategoryIds: [],
      loading: false,
      saving: false,
      searchQuery: '',
      categoryModal: {
        open: false,
        isEdit: false,
        id: null,
        name: ''
      },
      subCategoryModal: {
        open: false,
        isEdit: false,
        id: null,
        categoryId: null,
        parentCategoryName: '',
        name: ''
      }
    }
  },
  computed: {
    isRTL() {
      return this.$i18n && this.$i18n.locale === 'ar'
    },
    filteredCategories() {
      if (!this.searchQuery || !this.searchQuery.trim()) return this.categories
      const q = this.searchQuery.toLowerCase().trim()
      return this.categories.filter(cat => {
        const catMatch = cat.name && cat.name.toLowerCase().includes(q)
        const subMatch = cat.subCategories && cat.subCategories.some(sc => sc.name && sc.name.toLowerCase().includes(q))
        return catMatch || subMatch
      })
    }
  },
  watch: {
    searchQuery(newVal) {
      if (newVal && newVal.trim()) {
        // Auto-expand all categories during active search
        this.expandAll()
      }
    }
  },
  async mounted() {
    await this.loadCategories()
  },
  methods: {
    async loadCategories() {
      this.loading = true
      try {
        const response = await getExpenseCategories()
        this.categories = response.data || []
        // By default expand top 5 categories
        if (this.categories.length > 0) {
          this.expandedCategoryIds = this.categories.slice(0, 5).map(c => c.id)
        }
      } catch (err) {
        console.error('Failed to load terms:', err)
      } finally {
        this.loading = false
      }
    },

    isExpanded(catId) {
      return this.expandedCategoryIds.includes(catId)
    },

    toggleExpand(catId) {
      if (this.isExpanded(catId)) {
        this.expandedCategoryIds = this.expandedCategoryIds.filter(id => id !== catId)
      } else {
        this.expandedCategoryIds.push(catId)
      }
    },

    expandAll() {
      this.expandedCategoryIds = this.categories.map(c => c.id)
    },

    collapseAll() {
      this.expandedCategoryIds = []
    },

    openAddCategoryModal() {
      this.categoryModal = { open: true, isEdit: false, id: null, name: '' }
    },
    openEditCategoryModal(cat) {
      this.categoryModal = { open: true, isEdit: true, id: cat.id, name: cat.name }
    },
    async saveCategory() {
      if (!this.categoryModal.name.trim()) return
      this.saving = true
      try {
        if (this.categoryModal.isEdit) {
          await updateExpenseCategory(this.categoryModal.id, { name: this.categoryModal.name.trim() })
        } else {
          await createExpenseCategory({ name: this.categoryModal.name.trim() })
        }
        this.categoryModal.open = false
        await this.loadCategories()
      } catch (err) {
        alert(err.response?.data?.message || 'حدث خطأ أثناء حفظ البند الرئيسي')
      } finally {
        this.saving = false
      }
    },
    async confirmDeleteCategory(cat) {
      if (!confirm(`هل أنت تأكد من حذف البند الرئيسي "${cat.name}"؟`)) return
      try {
        await deleteExpenseCategory(cat.id)
        await this.loadCategories()
      } catch (err) {
        alert(err.response?.data?.message || 'تعذر حذف البند الرئيسي')
      }
    },
    openAddSubCategoryModal(parentCat) {
      this.subCategoryModal = {
        open: true,
        isEdit: false,
        id: null,
        categoryId: parentCat.id,
        parentCategoryName: parentCat.name,
        name: ''
      }
    },
    openEditSubCategoryModal(parentCat, subCat) {
      this.subCategoryModal = {
        open: true,
        isEdit: true,
        id: subCat.id,
        categoryId: parentCat.id,
        parentCategoryName: parentCat.name,
        name: subCat.name
      }
    },
    async saveSubCategory() {
      if (!this.subCategoryModal.name.trim()) return
      this.saving = true
      try {
        if (this.subCategoryModal.isEdit) {
          await updateExpenseSubCategory(this.subCategoryModal.id, { name: this.subCategoryModal.name.trim() })
        } else {
          await createExpenseSubCategory(this.subCategoryModal.categoryId, { name: this.subCategoryModal.name.trim() })
        }
        this.subCategoryModal.open = false
        await this.loadCategories()
      } catch (err) {
        alert(err.response?.data?.message || 'حدث خطأ أثناء حفظ البند الفرعي')
      } finally {
        this.saving = false
      }
    },
    async confirmDeleteSubCategory(subCat) {
      if (!confirm(`هل أنت تأكد من حذف البند الفرعي "${subCat.name}"؟`)) return
      try {
        await deleteExpenseSubCategory(subCat.id)
        await this.loadCategories()
      } catch (err) {
        alert(err.response?.data?.message || 'تعذر حذف البند الفرعي')
      }
    }
  }
}
</script>
