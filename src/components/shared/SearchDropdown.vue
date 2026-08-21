<template>
  <div ref="rootRef" class="relative">
    <slot name="prefix"></slot>
    <input
      ref="inputRef"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[inputClass, isRTL ? 'text-right' : 'text-left', clearable && hasValue ? 'pe-9' : '']"
      :dir="dir"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />
    <button
      v-if="clearable && hasValue && !disabled"
      type="button"
      tabindex="-1"
      class="absolute end-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-lg leading-none text-gray-400 hover:text-gray-600 focus:outline-none"
      :aria-label="clearAriaLabel"
      @mousedown.prevent
      @click="clearValue"
    >
      ×
    </button>
    <div
      v-if="isOpen && !teleportTarget"
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
            i === highlightedIndex ? 'theme-icon-bg theme-text font-semibold' : 'theme-hover-soft theme-text-primary'
          ]"
        >
          {{ getLabel(item) }}
        </div>
      </div>
    </div>

    <teleport v-else-if="isOpen && teleportTarget" :to="teleportTarget">
      <div
        ref="optionsRef"
        class="absolute z-[9999] max-h-48 overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-xl"
        :style="dropdownStyle"
        @mousedown.prevent
      >
        <div v-if="filteredItems.length">
          <div
            v-for="(item, index) in filteredItems"
            :key="getKey(item, index)"
            ref="optionItems"
            :class="[
              'cursor-pointer border-b border-gray-100 px-3 py-2 text-sm last:border-b-0',
              index === highlightedIndex ? 'theme-icon-bg theme-text font-semibold' : 'theme-hover-soft theme-text-primary'
            ]"
            @mousedown.prevent="selectItem(item)"
            @mouseenter="highlightedIndex = index"
          >
            {{ getLabel(item) }}
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import { computed, onBeforeUnmount, onMounted, nextTick, ref, watch } from 'vue'

export default {
  name: 'SearchDropdown',
  props: {
    modelValue: {
      type: [String, Number, Object, null],
      default: ''
    },
    items: {
      type: Array,
      default: () => []
    },
    allItems: {
      type: Array,
      default: () => []
    },
    itemKey: {
      type: [String, Function],
      default: 'id'
    },
    itemLabel: {
      type: [String, Function],
      default: 'name'
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    inputClass: {
      type: String,
      default:
        'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none theme-input-focus text-sm'
    },
    dir: {
      type: String,
      default: 'ltr'
    },
    teleportTarget: {
      type: String,
      default: ''
    },
    clearable: {
      type: Boolean,
      default: false
    },
    clearAriaLabel: {
      type: String,
      default: 'Clear'
    },
    filterFn: {
      type: Function,
      default: null
    }
  },
  emits: ['update:modelValue', 'select', 'focus', 'blur', 'clear'],
  setup(props, { emit }) {
    const isRTL = computed(() => (props.dir || '').toLowerCase() === 'rtl')
    const rootRef = ref(null)
    const inputRef = ref(null)
    const optionsRef = ref(null)
    const optionItems = ref([])
    const isOpen = ref(false)
    const highlightedIndex = ref(-1)
    const dropdownStyle = ref({})

    const sourceItems = computed(() => {
      if (Array.isArray(props.items) && props.items.length) return props.items
      if (Array.isArray(props.allItems) && props.allItems.length) return props.allItems
      return []
    })

    const normalize = (value) => String(value ?? '').toLowerCase().trim()

    const getLabel = (item) => {
      if (item == null) return ''
      if (typeof props.itemLabel === 'function') return props.itemLabel(item)
      if (typeof item === 'object') return item?.[props.itemLabel] ?? item?.label ?? item?.name ?? String(item)
      return String(item)
    }

    const getKey = (item, index) => {
      if (typeof props.itemKey === 'function') return props.itemKey(item, index)
      if (item && typeof item === 'object' && item[props.itemKey] != null) return item[props.itemKey]
      return `${getLabel(item)}-${index}`
    }

    const filteredItems = computed(() => {
      const query = normalize(props.modelValue)
      if (!query) return sourceItems.value
      if (typeof props.filterFn === 'function') {
        return sourceItems.value.filter((item) => props.filterFn(item, query))
      }
      return sourceItems.value.filter((item) => normalize(getLabel(item)).includes(query))
    })

    const hasValue = computed(() => normalize(props.modelValue).length > 0)

    const clearValue = () => {
      emit('update:modelValue', '')
      emit('clear')
      openDropdown()
      inputRef.value?.focus()
    }

    const updateDropdownPosition = async () => {
      if (!props.teleportTarget) return
      await nextTick()
      const inputEl = inputRef.value
      const targetElement = document.querySelector(props.teleportTarget)
      if (!inputEl || !targetElement) return

      const inputRect = inputEl.getBoundingClientRect()
      const useFixed = props.teleportTarget === 'body'

      if (useFixed) {
        const viewportPadding = 8
        const maxDropdownHeight = 192
        const spaceBelow = window.innerHeight - inputRect.bottom - viewportPadding
        const spaceAbove = inputRect.top - viewportPadding
        const openAbove = spaceBelow < Math.min(maxDropdownHeight, spaceAbove) && spaceAbove > spaceBelow
        const availableHeight = Math.max(
          0,
          Math.min(maxDropdownHeight, openAbove ? spaceAbove : spaceBelow)
        )

        dropdownStyle.value = {
          position: 'fixed',
          top: `${openAbove ? Math.max(viewportPadding, inputRect.top - availableHeight) : inputRect.bottom}px`,
          left: `${inputRect.left}px`,
          width: `${inputRect.width}px`,
          maxHeight: `${availableHeight}px`
        }
        return
      }

      const containerRect = targetElement.getBoundingClientRect()
      dropdownStyle.value = {
        position: 'absolute',
        top: `${inputRect.bottom - containerRect.top + targetElement.scrollTop}px`,
        left: `${inputRect.left - containerRect.left + targetElement.scrollLeft}px`,
        width: `${inputRect.width}px`
      }
    }

    const scrollOptionIntoView = async () => {
      await nextTick()
      if (highlightedIndex.value < 0) return
      const container = optionsRef.value || rootRef.value?.querySelector('.overflow-y-auto')
      const items = container?.querySelectorAll('div > div > div') || optionItems.value
      const target = items?.[highlightedIndex.value]
      if (target && target.scrollIntoView) {
        target.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }

    const openDropdown = async () => {
      if (props.disabled) return
      isOpen.value = true
      highlightedIndex.value = filteredItems.value.length ? 0 : -1
      await updateDropdownPosition()
    }

    const closeDropdown = () => {
      isOpen.value = false
      highlightedIndex.value = -1
    }

    const selectItem = (item) => {
      emit('select', item)
      emit('update:modelValue', getLabel(item))
      closeDropdown()
    }

    const handleInput = (event) => {
      emit('update:modelValue', event.target.value)
      if (!isOpen.value) {
        openDropdown()
      } else {
        highlightedIndex.value = filteredItems.value.length ? 0 : -1
        updateDropdownPosition()
      }
    }

    const handleFocus = () => {
      emit('focus')
      openDropdown()
    }

    const handleBlur = () => {
      emit('blur')
      window.setTimeout(() => {
        closeDropdown()
      }, 150)
    }

    const handleKeydown = (event) => {
      if (props.clearable && event.key === 'Delete' && hasValue.value) {
        event.preventDefault()
        clearValue()
        return
      }

      if (event.key === 'Escape') {
        if (isOpen.value) {
          event.preventDefault()
          event.stopPropagation()
          closeDropdown()
        }
        return
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (!isOpen.value) {
          event.preventDefault()
          openDropdown()
          return
        }
        if (!filteredItems.value.length) return
        event.preventDefault()
        event.stopPropagation()
        if (event.key === 'ArrowDown') {
          highlightedIndex.value = highlightedIndex.value === -1
            ? 0
            : (highlightedIndex.value + 1) % filteredItems.value.length
        } else {
          highlightedIndex.value = highlightedIndex.value <= 0
            ? filteredItems.value.length - 1
            : highlightedIndex.value - 1
        }
        scrollOptionIntoView()
        return
      }

      if (event.key === 'Enter') {
        if (isOpen.value) {
          event.preventDefault()
          event.stopPropagation()
          if (highlightedIndex.value >= 0 && filteredItems.value.length) {
            const item = filteredItems.value[highlightedIndex.value]
            if (item) selectItem(item)
          } else {
            closeDropdown()
          }
        }
        return
      }

      if (event.key === 'Tab' && isOpen.value) {
        if (highlightedIndex.value >= 0 && filteredItems.value.length) {
          const item = filteredItems.value[highlightedIndex.value]
          if (item) selectItem(item)
        } else {
          closeDropdown()
        }
        return
      }
    }

    const handleDocumentPointerDown = (event) => {
      if (!isOpen.value) return
      const rootEl = rootRef.value
      const optionsEl = optionsRef.value
      if (rootEl && rootEl.contains(event.target)) return
      if (optionsEl && optionsEl.contains(event.target)) return
      closeDropdown()
    }

    watch(
      () => props.teleportTarget,
      async () => {
        if (isOpen.value) await updateDropdownPosition()
      }
    )

    watch(
      () => filteredItems.value.length,
      async () => {
        if (isOpen.value) await updateDropdownPosition()
      }
    )

    watch(
      () => props.modelValue,
      async () => {
        if (isOpen.value) await updateDropdownPosition()
      }
    )

    onMounted(() => {
      document.addEventListener('mousedown', handleDocumentPointerDown, true)
      window.addEventListener('resize', updateDropdownPosition)
      window.addEventListener('scroll', updateDropdownPosition, true)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('mousedown', handleDocumentPointerDown, true)
      window.removeEventListener('resize', updateDropdownPosition)
      window.removeEventListener('scroll', updateDropdownPosition, true)
    })

      return {
      rootRef,
      inputRef,
      optionsRef,
      optionItems,
      isOpen,
      highlightedIndex,
      dropdownStyle,
      filteredItems,
      hasValue,
      getKey,
      getLabel,
      handleInput,
      handleFocus,
      handleBlur,
      handleKeydown,
      selectItem,
      clearValue,
      isRTL
    }
  }
}
</script>
