<template>
  <div class="relative">
    <slot name="prefix"></slot>
    <input
      :value="modelValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputClass"
      :dir="dir"
    />
    <div
      v-if="isOpen"
      ref="options"
      class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg z-10 max-h-48 overflow-y-auto mt-0"
      @mousedown.prevent
    >
      <div v-if="filteredItems.length">
        <div
          v-for="(item, i) in filteredItems"
          :key="getKey(item, i)"
          ref="optionItems"
          @mousedown.prevent="selectItem(item)"
          @mouseenter="highlightedIndex = i"
          :class="[
            'px-3 py-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0',
            i === highlightedIndex ? 'theme-icon-bg' : 'theme-hover-soft'
          ]"
        >
          {{ getLabel(item) }}
        </div>
      </div>
      <!-- removed afterOptions slot to prevent inline create/add actions -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchDropdown',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    items: {
      type: Array,
      default: () => []
    },
    allItems: {
      type: Array,
      default: null
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    itemKey: {
      type: String,
      default: 'id'
    },
    itemLabel: {
      type: [String, Function],
      default: 'name'
    },
    inputClass: {
      type: String,
      default:
        'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm'
    },
    dir: {
      type: String,
      default: undefined
    }
  },
  emits: ['update:modelValue', 'select'],
  data() {
    return {
      isOpen: false,
      highlightedIndex: -1
    }
  },
  computed: {
    filteredItems() {
      const items = Array.isArray(this.items) ? this.items : []
      const q = String(this.modelValue || '').trim().toLowerCase()
      if (!q) return items
      return items.filter(item => this.getLabel(item).toLowerCase().includes(q))
    },
    exactMatchSource() {
      if (Array.isArray(this.allItems)) return this.allItems
      return Array.isArray(this.items) ? this.items : []
    }
  },
  methods: {
    getLabel(item) {
      if (typeof this.itemLabel === 'function') return this.itemLabel(item) || ''
      if (typeof this.itemLabel === 'string') return String(item?.[this.itemLabel] ?? '')
      return ''
    },
    getKey(item, index) {
      if (item && this.itemKey in item) return item[this.itemKey]
      return index
    },
    handleFocus() {
      if (this.disabled) return
      this.isOpen = true
      this.highlightedIndex = -1
    },
    handleBlur() {
      setTimeout(() => {
        this.isOpen = false
      }, 200)
    },
    handleInput(e) {
      const value = e.target.value
      this.$emit('update:modelValue', value)
      if (this.disabled) return
      this.isOpen = true
      this.highlightedIndex = -1

      const needle = String(value || '').trim().toLowerCase()
      if (!needle) return
      const match = this.exactMatchSource.find(item => this.getLabel(item).trim().toLowerCase() === needle)
      if (match) this.selectItem(match)
    },
    handleKeydown(e) {
      if (!this.isOpen && ['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
        this.isOpen = true
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const next = this.highlightedIndex >= 0
          ? Math.min(this.highlightedIndex + 1, this.filteredItems.length - 1)
          : 0
        this.highlightedIndex = next
        this.scrollToHighlighted()
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prev = this.highlightedIndex > 0 ? this.highlightedIndex - 1 : 0
        this.highlightedIndex = prev
        this.scrollToHighlighted()
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (this.filteredItems.length) {
          const pick = this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredItems.length
            ? this.highlightedIndex
            : 0
          this.selectItem(this.filteredItems[pick])
        }
        return
      }
      if (e.key === 'Escape') {
        this.isOpen = false
      }
    },
    selectItem(item) {
      const label = this.getLabel(item)
      this.$emit('update:modelValue', label)
      this.$emit('select', item)
      this.isOpen = false
      this.highlightedIndex = -1
    }
    ,
    scrollToHighlighted() {
      this.$nextTick(() => {
        const container = this.$refs.options
        const items = this.$refs.optionItems
        if (!container || !items) return
        const list = Array.isArray(items) ? items : [items]
        const idx = this.highlightedIndex
        if (idx < 0 || idx >= list.length) return
        const el = list[idx]
        if (!el) return
        const containerTop = container.scrollTop
        const containerHeight = container.clientHeight
        const elTop = el.offsetTop
        const elHeight = el.offsetHeight
        if (elTop < containerTop) {
          container.scrollTop = elTop
        } else if (elTop + elHeight > containerTop + containerHeight) {
          container.scrollTop = elTop + elHeight - containerHeight
        }
      })
    }
  }
}
</script>

<style scoped></style>
