<template>
  <div ref="rootRef" class="relative">
    <slot name="prefix"></slot>
    <input
      ref="inputRef"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[inputClass, isRTL ? 'text-right' : 'text-left']"
      :dir="dir"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
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
    </div>

    <teleport v-else-if="isOpen" :to="teleportTarget">
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
              index === highlightedIndex ? 'bg-indigo-100' : 'hover:bg-indigo-50'
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
    }
  },
  emits: ['update:modelValue', 'select', 'focus', 'blur'],
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
      return sourceItems.value.filter((item) => normalize(getLabel(item)).includes(query))
    })

    const updateDropdownPosition = async () => {
      if (!props.teleportTarget) return
      await nextTick()
      const inputEl = inputRef.value
      const container = document.querySelector(props.teleportTarget)
      if (!inputEl || !container) return

      const inputRect = inputEl.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      dropdownStyle.value = {
        top: `${inputRect.bottom - containerRect.top + container.scrollTop}px`,
        left: `${inputRect.left - containerRect.left + container.scrollLeft}px`,
        width: `${inputRect.width}px`
      }
    }

    const openDropdown = async () => {
      if (props.disabled) return
      isOpen.value = true
      highlightedIndex.value = -1
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
      if (!isOpen.value) openDropdown()
      else updateDropdownPosition()
    }

    const handleFocus = () => {
      emit('focus')
      openDropdown()
    }

    const handleBlur = () => {
      emit('blur')
      window.setTimeout(() => {
        closeDropdown()
      }, 120)
    }

    const handleKeydown = (event) => {
      if (!isOpen.value && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault()
        openDropdown()
        return
      }

      if (event.key === 'Escape') {
        closeDropdown()
        return
      }

      if (!filteredItems.value.length) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        highlightedIndex.value = (highlightedIndex.value + 1) % filteredItems.value.length
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        highlightedIndex.value = highlightedIndex.value <= 0
          ? filteredItems.value.length - 1
          : highlightedIndex.value - 1
      }

      if (event.key === 'Enter' && highlightedIndex.value >= 0) {
        event.preventDefault()
        selectItem(filteredItems.value[highlightedIndex.value])
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
      getKey,
      getLabel,
      handleInput,
      handleFocus,
      handleBlur,
      handleKeydown,
      selectItem,
      isRTL
    }
  }
}
</script>
