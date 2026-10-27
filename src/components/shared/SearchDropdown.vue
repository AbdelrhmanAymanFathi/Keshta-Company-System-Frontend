<template>
  <div ref="rootRef" class="shadcn-ui relative w-full">
    <slot name="prefix"></slot>
    <Input
      :model-value="modelValue == null ? '' : modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="['min-w-0 bg-background text-foreground placeholder:text-muted-foreground', effectiveInputClass, isRTL ? 'text-right' : 'text-left', clearable && hasValue ? 'pe-8' : '']"
      :style="inputStyle"
      :dir="effectiveDir"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="isOpen"
      :aria-controls="listboxId"
      :aria-activedescendant="activeDescendantId"
      @update:model-value="handleModelUpdate"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />
    <Button
      v-if="clearable && hasValue && !disabled"
      type="button"
      variant="ghost"
      size="icon-xs"
      tabindex="-1"
      class="absolute end-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      :aria-label="clearAriaLabel"
      @mousedown.prevent
      @click="clearValue"
    >
      <svg class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </Button>
    <div
      v-if="isOpen && !teleportTarget"
      ref="options"
      :id="listboxId"
      role="listbox"
      :dir="effectiveDir"
      class="shadcn-ui absolute top-full inset-x-0 z-[var(--layout-z-popover,220)] mt-1 max-h-56 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
      @mousedown.prevent
    >
      <div v-if="filteredItems.length" class="space-y-0.5">
        <div
          v-for="(item, i) in filteredItems"
          :key="getKey(item, i)"
          ref="optionItems"
          :id="getOptionId(i)"
          role="option"
          :aria-selected="i === highlightedIndex"
          @mousedown.prevent="selectItem(item)"
          @pointerdown.prevent="selectItem(item)"
          @mouseenter="highlightedIndex = i"
          :class="[
            'cursor-pointer select-none rounded-md px-2.5 py-1.5 text-sm transition-colors',
            i === highlightedIndex ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent/50 text-foreground'
          ]"
        >
          {{ getLabel(item) }}
        </div>
      </div>
      <slot name="afterOptions"></slot>
    </div>

    <teleport v-else-if="isOpen && teleportTarget" :to="teleportTarget">
      <div
        ref="optionsRef"
        :id="listboxId"
        role="listbox"
        :dir="effectiveDir"
        class="shadcn-ui absolute z-[var(--layout-z-popover,220)] max-h-56 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl"
        :style="dropdownStyle"
        @mousedown.prevent
      >
        <div v-if="filteredItems.length" class="space-y-0.5">
          <div
            v-for="(item, index) in filteredItems"
            :key="getKey(item, index)"
            ref="optionItems"
            :id="getOptionId(index)"
            role="option"
            :aria-selected="index === highlightedIndex"
            :class="[
              'cursor-pointer select-none rounded-md px-2.5 py-1.5 text-sm transition-colors',
              index === highlightedIndex ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent/50 text-foreground'
            ]"
            @mousedown.prevent="selectItem(item)"
            @pointerdown.prevent="selectItem(item)"
            @mouseenter="highlightedIndex = index"
          >
            {{ getLabel(item) }}
          </div>
        </div>
        <slot name="afterOptions"></slot>
      </div>
    </teleport>
  </div>
</template>

<script>
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default {
  name: 'SearchDropdown',
  components: { Button, Input },
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
      default: ''
    },
    dir: {
      type: String,
      default: ''
    },
    teleportTarget: {
      type: String,
      default: 'body'
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
    },
    displayLabel: {
      type: [String, Function],
      default: null
    }
  },
  emits: ['update:modelValue', 'select', 'focus', 'blur', 'clear'],
  setup(props, { emit }) {
    const { locale } = useI18n()
    const instance = getCurrentInstance()
    const effectiveDir = computed(() => {
      if (props.dir) return props.dir
      return String(locale.value || '').toLowerCase().startsWith('ar') ? 'rtl' : 'ltr'
    })
    const isRTL = computed(() => effectiveDir.value.toLowerCase() === 'rtl')
    const rootRef = ref(null)
    const optionsRef = ref(null)
    const optionItems = ref([])
    const isOpen = ref(false)
    const highlightedIndex = ref(-1)
    const dropdownStyle = ref({})
    const listboxId = `search-dropdown-${instance?.uid ?? 'options'}`
    const activeDescendantId = computed(() => (
      isOpen.value && highlightedIndex.value >= 0
        ? getOptionId(highlightedIndex.value)
        : undefined
    ))
    const inputStyle = {
      height: 'var(--theme-control-min-height, 2.5rem)',
      minHeight: 'var(--theme-control-min-height, 2.5rem)',
      lineHeight: '1.25rem'
    }

    function getOptionId(index) {
      return `${listboxId}-option-${index}`
    }

    const effectiveInputClass = computed(() => {
      const base = ''
      const raw = props.inputClass || ''
      let list = []
      if (typeof raw === 'string') {
        list = raw.split(/\s+/).filter(Boolean)
      } else if (Array.isArray(raw)) {
        list = raw.flatMap(c => typeof c === 'string' ? c.split(/\s+/) : []).filter(Boolean)
      }

      const filtered = list.filter(token => {
        return !/^(border($|-gray-|-slate-)|rounded($|-md|-lg|-xl)|theme-input-focus|focus:(outline|ring)|focus-visible:)/.test(token)
      })

      return [base, ...filtered].join(' ')
    })

    const sourceItems = computed(() => {
      if (Array.isArray(props.items) && props.items.length) return props.items
      if (Array.isArray(props.allItems) && props.allItems.length) return props.allItems
      return []
    })

    const normalize = (value) => String(value ?? '').toLowerCase().trim()

    const getLabel = (item) => {
      if (!item) return ''
      if (typeof props.itemLabel === 'function') {
        return String(props.itemLabel(item) ?? '')
      }
      return String(item[props.itemLabel] ?? '')
    }

    const getDisplayLabel = (item) => {
      if (!item) return ''
      if (typeof props.displayLabel === 'function') {
        return String(props.displayLabel(item) ?? '')
      }
      if (typeof props.displayLabel === 'string' && props.displayLabel) {
        return String(item[props.displayLabel] ?? '')
      }
      return getLabel(item)
    }

    const getKey = (item, index) => {
      if (!item) return index
      if (typeof props.itemKey === 'function') {
        return props.itemKey(item) ?? index
      }
      return item[props.itemKey] ?? index
    }

    const filteredItems = computed(() => {
      const query = normalize(props.modelValue)
      const list = sourceItems.value
      if (!query) return list

      if (typeof props.filterFn === 'function') {
        return list.filter((item) => props.filterFn(item, query))
      }

      return list.filter((item) => {
        const primary = normalize(getLabel(item))
        const display = normalize(getDisplayLabel(item))
        return primary.includes(query) || display.includes(query)
      })
    })

    const hasValue = computed(() => {
      return props.modelValue !== null && props.modelValue !== undefined && String(props.modelValue).trim() !== ''
    })

    const updateDropdownPosition = async () => {
      if (!props.teleportTarget) return
      await nextTick()
      const inputEl = rootRef.value?.querySelector('[data-slot="input"]')
      const targetElement = document.querySelector(props.teleportTarget)
      if (!inputEl || !targetElement) return

      const inputRect = inputEl.getBoundingClientRect()
      const useFixed = targetElement === document.body

      if (useFixed) {
        const viewportPadding = 8
        const maxDropdownHeight = 224
        const viewportWidth = document.documentElement.clientWidth
        const viewportHeight = window.innerHeight
        const width = Math.min(inputRect.width, Math.max(0, viewportWidth - viewportPadding * 2))
        const left = Math.min(
          Math.max(viewportPadding, inputRect.left),
          Math.max(viewportPadding, viewportWidth - width - viewportPadding)
        )
        const spaceBelow = window.innerHeight - inputRect.bottom - viewportPadding
        const spaceAbove = inputRect.top - viewportPadding
        const openAbove = spaceBelow < Math.min(maxDropdownHeight, spaceAbove) && spaceAbove > spaceBelow
        const availableHeight = Math.min(maxDropdownHeight, Math.max(0, openAbove ? spaceAbove : spaceBelow))

        dropdownStyle.value = {
          position: 'fixed',
          top: openAbove ? 'auto' : `${inputRect.bottom + 4}px`,
          bottom: openAbove ? `${Math.max(viewportPadding, viewportHeight - inputRect.top + 4)}px` : 'auto',
          left: `${left}px`,
          width: `${width}px`,
          maxHeight: `${availableHeight}px`,
          visibility: availableHeight > 0 && inputRect.bottom > 0 && inputRect.top < viewportHeight ? 'visible' : 'hidden',
          zIndex: 'var(--layout-z-popover, 220)'
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
      if (!item) return
      const displayVal = getDisplayLabel(item) || getLabel(item)
      emit('update:modelValue', displayVal)
      emit('select', item)
      closeDropdown()
    }

    const clearValue = () => {
      emit('update:modelValue', '')
      emit('clear')
      closeDropdown()
    }

    const handleModelUpdate = (val) => {
      emit('update:modelValue', val)
      if (!isOpen.value) {
        openDropdown()
      } else {
        highlightedIndex.value = filteredItems.value.length ? 0 : -1
      }
    }

    const handleFocus = (event) => {
      emit('focus', event)
      openDropdown()
    }

    const handleBlur = (event) => {
      emit('blur', event)
    }

    const handleKeydown = (event) => {
      if (props.disabled) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        if (!isOpen.value) {
          openDropdown()
          return
        }
        if (!filteredItems.value.length) return
        highlightedIndex.value = (highlightedIndex.value + 1) % filteredItems.value.length
        scrollOptionIntoView()
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        if (!isOpen.value) {
          openDropdown()
          return
        }
        if (!filteredItems.value.length) return
        highlightedIndex.value =
          (highlightedIndex.value - 1 + filteredItems.value.length) % filteredItems.value.length
        scrollOptionIntoView()
        return
      }

      if (event.key === 'Enter') {
        if (!isOpen.value) return
        event.preventDefault()
        const selected = filteredItems.value[highlightedIndex.value]
        if (selected) {
          selectItem(selected)
        }
        return
      }

      if (event.key === 'Escape') {
        if (!isOpen.value) return
        event.preventDefault()
        closeDropdown()
      }
    }

    const handleDocumentPointerDown = (event) => {
      const root = rootRef.value
      const options = optionsRef.value
      if (!root) return

      const clickedInsideRoot = root.contains(event.target)
      const clickedInsideOptions = options && options.contains(event.target)

      if (!clickedInsideRoot && !clickedInsideOptions) {
        closeDropdown()
      }
    }

    watch(
      () => props.disabled,
      (disabled) => {
        if (disabled) closeDropdown()
      }
    )

    watch(
      () => [isOpen.value, filteredItems.value.length, props.teleportTarget],
      ([open]) => {
        if (open) updateDropdownPosition()
      },
      { flush: 'post' }
    )

    let resizeObserver

    onMounted(() => {
      document.addEventListener('pointerdown', handleDocumentPointerDown, true)
      window.addEventListener('resize', updateDropdownPosition)
      window.addEventListener('scroll', updateDropdownPosition, true)
      if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
        resizeObserver = new ResizeObserver(() => {
          if (isOpen.value) updateDropdownPosition()
        })
        resizeObserver.observe(rootRef.value)
      }
    })

    onBeforeUnmount(() => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown, true)
      window.removeEventListener('resize', updateDropdownPosition)
      window.removeEventListener('scroll', updateDropdownPosition, true)
      resizeObserver?.disconnect()
    })

    return {
      rootRef,
      optionsRef,
      optionItems,
      effectiveDir,
      isOpen,
      highlightedIndex,
      dropdownStyle,
      inputStyle,
      listboxId,
      activeDescendantId,
      filteredItems,
      hasValue,
      effectiveInputClass,
      getKey,
      getLabel,
      getDisplayLabel,
      getOptionId,
      handleModelUpdate,
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
