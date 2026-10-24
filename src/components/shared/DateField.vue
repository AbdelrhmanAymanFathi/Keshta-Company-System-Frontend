<template>
  <div :class="['shadcn-ui relative', parsedClasses.wrapper]" :style="$attrs.style">
    <Input
      :id="$attrs.id"
      :name="$attrs.name"
      :value="internalValue"
      :placeholder="placeholder"
      :disabled="disabled"
      type="text"
      :class="['date-field pe-8', parsedClasses.input]"
      @input="onInput"
      @blur="onBlur"
      @focus="onFocus"
      @keydown="onKeyDown"
    />

    <Popover v-model:open="calendarOpen">
      <PopoverTrigger as-child>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          class="absolute end-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-transparent"
          :disabled="disabled"
          aria-label="Open calendar"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="16" rx="2" />
            <path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" />
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" class="shadcn-ui w-auto p-0" :dir="direction">
        <Calendar
          :model-value="selectedDate"
          :locale="locale"
          :dir="direction"
          :week-starts-on="0"
          :initial-focus="true"
          @update:model-value="onCalendarSelect"
        />
      </PopoverContent>
    </Popover>
  </div>
</template>

<script>
import { CalendarDate } from '@internationalized/date'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  formatDateDMY,
  parseDateDMY,
  formatToISODate,
  parseISODateToDate
} from '../../utils/dateUtils'

export default {
  name: 'DateField',
  inheritAttrs: false,
  components: { Button, Calendar, Input, Popover, PopoverContent, PopoverTrigger },
  props: {
    modelValue: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: 'dd/MM/yyyy' }
  },
  emits: ['update:modelValue'],
  setup(props, { emit, attrs }) {
    const { locale } = useI18n()
    const internalValue = ref('')
    const calendarOpen = ref(false)
    const isFocused = ref(false)
    const direction = computed(() => locale.value === 'ar' ? 'rtl' : 'ltr')

    const parsedClasses = computed(() => {
      const raw = attrs.class
      if (!raw) return { wrapper: 'w-full', input: '' }
      let list = []
      if (typeof raw === 'string') {
        list = raw.split(/\s+/).filter(Boolean)
      } else if (Array.isArray(raw)) {
        list = raw.flatMap(c => typeof c === 'string' ? c.split(/\s+/) : []).filter(Boolean)
      } else if (typeof raw === 'object' && raw !== null) {
        list = Object.keys(raw).filter(k => raw[k]).flatMap(c => c.split(/\s+/)).filter(Boolean)
      }

      const wrapperTokens = []
      const inputTokens = []

      for (const token of list) {
        // Discard legacy classes that cause double-borders, padding, or focus outline conflicts
        if (/^(border($|-)|rounded($|-)|p($|[xytbrse]-)|bg-|theme-input-focus|focus($|:|-)|outline-)/.test(token)) {
          continue
        }
        // Layout and positioning belong to the wrapper
        if (/^(w-|max-w-|min-w-|col-|row-|flex|grid|m($|[xytbrse]-)|hidden|inline|block)/.test(token)) {
          wrapperTokens.push(token)
        } else {
          // e.g. text-sm, h-9, etc.
          inputTokens.push(token)
        }
      }

      const hasWidth = wrapperTokens.some(t => /^w-/.test(t))
      if (!hasWidth) {
        wrapperTokens.unshift('w-full')
      }

      return {
        wrapper: wrapperTokens.join(' '),
        input: inputTokens.join(' ')
      }
    })

    const selectedDate = computed(() => {
      const iso = formatToISODate(props.modelValue)
      const date = parseISODateToDate(iso)
      if (!date || formatToISODate(date) !== iso) return undefined
      return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
    })

    function formatDigitsToDisplay(digits) {
      const value = digits.slice(0, 8)
      const day = value.slice(0, 2)
      const month = value.slice(2, 4)
      const year = value.slice(4, 8)
      if (value.length <= 2) return day
      if (value.length <= 4) return `${day}/${month}`
      return `${day}/${month}/${year}`
    }

    function onInput(event) {
      const value = String(event.target.value || '')
      if (value === '') {
        internalValue.value = ''
        emit('update:modelValue', '')
        return
      }

      const isoFromDMY = parseDateDMY(value)
      if (isoFromDMY) {
        internalValue.value = formatDateDMY(isoFromDMY)
        emit('update:modelValue', isoFromDMY)
        return
      }

      const matchISO = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
      if (matchISO) {
        const iso = `${matchISO[1]}-${matchISO[2]}-${matchISO[3]}`
        internalValue.value = formatDateDMY(iso)
        emit('update:modelValue', iso)
        return
      }

      const digits = value.replace(/\D/g, '').slice(0, 8)
      internalValue.value = formatDigitsToDisplay(digits)
      if (digits.length === 8) {
        const iso = parseDateDMY(formatDigitsToDisplay(digits))
        if (iso) {
          emit('update:modelValue', iso)
        }
      }
    }

    function onFocus() {
      isFocused.value = true
    }

    function onBlur() {
      isFocused.value = false
      const value = internalValue.value || ''
      if (value === '') {
        emit('update:modelValue', '')
        return
      }
      const iso = parseDateDMY(value)
      if (iso) {
        internalValue.value = formatDateDMY(iso)
        emit('update:modelValue', iso)
      } else {
        internalValue.value = formatDateDMY(props.modelValue)
      }
    }

    function onKeyDown(event) {
      const dayOffsets = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -7,
        ArrowDown: 7,
        PageUp: -30,
        PageDown: 30
      }
      const offset = dayOffsets[event.key]
      if (!offset) return

      event.preventDefault()
      const baseDate = parseISODateToDate(props.modelValue) || new Date()
      baseDate.setDate(baseDate.getDate() + offset)
      const iso = formatToISODate(baseDate)
      internalValue.value = formatDateDMY(iso)
      emit('update:modelValue', iso)
      calendarOpen.value = true
    }

    function onCalendarSelect(value) {
      if (!value) return
      const iso = value.toString()
      internalValue.value = formatDateDMY(iso)
      emit('update:modelValue', iso)
      calendarOpen.value = false
    }

    watch(
      () => props.modelValue,
      (value) => {
        if (!isFocused.value) {
          internalValue.value = formatDateDMY(value)
        }
      },
      { immediate: true }
    )

    return {
      locale,
      direction,
      internalValue,
      calendarOpen,
      selectedDate,
      parsedClasses,
      onInput,
      onBlur,
      onFocus,
      onKeyDown,
      onCalendarSelect
    }
  }
}
</script>
