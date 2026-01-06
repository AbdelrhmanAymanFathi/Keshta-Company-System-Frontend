<template>
  <!-- Modal for add category/branch/location -->
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="z-index:1050;">
    <div class="fixed inset-0 bg-black bg-opacity-50 z-40" @click="handleClose"></div>
    <div class="bg-white rounded-lg shadow-xl w-full max-w-sm relative z-50" style="z-index:1060;">
      <div class="p-6">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            <span v-if="type === 'category'">{{ $t('expenses.addCategory') || 'Add Category' }}</span>
            <span v-else-if="type === 'subcategory'">{{ $t('expenses.addSubcategory') || 'Add Subcategory' }}</span>
            <span v-else-if="type === 'branch'">{{ $t('expenses.addBranch') || 'Add Branch' }}</span>
            <span v-else-if="type === 'location'">{{ $t('expenses.addLocation') || 'Add Location' }}</span>
          </h3>
          <p v-if="type === 'subcategory' && parentCategoryName" class="text-sm text-gray-500 mt-1">
            <!-- Use a simple label: "Under {parent}" -->
            {{ $t('expenses.parentCategoryLabel') || 'Under' }}: <strong>{{ parentCategoryName }}</strong>
          </p>
        </div>
        <form @submit.prevent="handleSave">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <span v-if="type === 'category'">{{ $t('expenses.enterCategoryName') || 'Category Name' }}</span>
              <span v-else-if="type === 'subcategory'">{{ $t('expenses.enterSubcategoryName') || 'Subcategory Name' }}</span>
              <span v-else-if="type === 'branch'">{{ $t('expenses.enterBranchName') || 'Branch Name' }}</span>
              <span v-else-if="type === 'location'">{{ $t('expenses.enterLocationName') || 'Location Name' }}</span>
            </label>
            <input v-model="localName" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div v-if="type === 'branch'" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('expenses.enterBranchCategory') || 'Branch Category (optional)' }}</label>
            <input v-model="localBranchCategory" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div class="flex gap-2 mt-6">
            <button type="button" @click="handleClose" class="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">{{ $t('labels.cancel') }}</button>
            <button type="submit" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{{ $t('labels.save') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddFieldModal',
  props: {
    open: { type: Boolean, required: true },
    // `type` may be empty when modal is closed; make it optional and allow empty string
    type: { type: String, required: false, default: '', validator: (v) => v === '' || ['category', 'subcategory', 'branch', 'location'].includes(v) },
    name: { type: String, default: '' },
    branchCategory: { type: String, default: '' },
    parentCategoryName: { type: String, default: '' }
  },
  emits: ['close', 'save'],
  data() {
    return {
      localName: this.name || '',
      localBranchCategory: this.branchCategory || ''
    }
  },
  watch: {
    name(val) { this.localName = val || '' },
    branchCategory(val) { this.localBranchCategory = val || '' },
    open(val) {
      if (val) {
        // sync when opened
        this.localName = this.name || ''
        this.localBranchCategory = this.branchCategory || ''
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    handleSave() {
      const payload = { name: (this.localName || '').trim() }
      if (this.type === 'branch') {
        const cat = (this.localBranchCategory || '').trim()
        if (cat) payload.category = cat
      }
      this.$emit('save', payload)
    }
  }
}
</script>

<style scoped>
/* No custom styles — component uses classes from template to match original markup exactly */
</style>
