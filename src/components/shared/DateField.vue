<template>
  <input
    ref="inputEl"
    :placeholder="placeholder"
    :disabled="disabled"
    class="date-field"
    @input="onInput"
    @blur="onBlur"
    @focus="onFocus"
    @keydown="onKeyDown"
    :value="internalValue"
  />
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import {
  formatDateDMY,
  parseDateDMY,
  formatToISODate,
  parseISODateToDate
} from '../../utils/dateUtils'

export default {
  name: 'DateField',
  props: {
    modelValue: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: 'dd/MM/yyyy' }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const inputEl = ref(null)
    let fp = null
    const internalValue = ref('')
    const isFocused = ref(false)

    function formatDigitsToDisplay(digits) {
      const d = digits.slice(0, 8)
      const dd = d.slice(0, 2)
      const mm = d.slice(2, 4)
      const yyyy = d.slice(4, 8)
      if (d.length <= 2) return dd
      if (d.length <= 4) return `${dd}/${mm}`
      return `${dd}/${mm}/${yyyy}`
    }

    function setInternalFromModel() {
      internalValue.value = formatDateDMY(props.modelValue)
    }

    onMounted(() => {
      setInternalFromModel()
      if (!inputEl.value) return
      fp = flatpickr(inputEl.value, {
        dateFormat: 'd/m/Y',
        allowInput: true,
        defaultDate: props.modelValue ? parseISODateToDate(props.modelValue) : null,
        onChange(selectedDates) {
          if (selectedDates && selectedDates.length) {
            const iso = formatToISODate(selectedDates[0])
            if (iso) {
              internalValue.value = formatDateDMY(iso)
              emit('update:modelValue', iso)
            }
          } else {
            internalValue.value = ''
            emit('update:modelValue', '')
          }
        }
      })
    })

    onBeforeUnmount(() => {
      if (fp) {
        fp.destroy()
        fp = null
      }
    })

    watch(() => props.modelValue, (val) => {
      // If input is focused, don't override user's typing
      if (isFocused.value) return
      try {
        if (fp) fp.setDate(val ? parseISODateToDate(val) : null, false)
      } catch (e) {
        // ignore
      }
      internalValue.value = formatDateDMY(val)
    })

    function onInput(e) {
      const v = e.target.value || ''
      if (v === '') {
        internalValue.value = ''
        emit('update:modelValue', '')
        return
      }

      // Try dd/MM/yyyy
      const isoFromDMY = parseDateDMY(v)
      if (isoFromDMY) {
        internalValue.value = formatDateDMY(isoFromDMY)
        emit('update:modelValue', isoFromDMY)
        return
      }

      // Try ISO yyyy-mm-dd pasted
      const matchISO = v.match(/^(\d{4})-(\d{2})-(\d{2})/)
      if (matchISO) {
        const iso = `${matchISO[1]}-${matchISO[2]}-${matchISO[3]}`
        internalValue.value = formatDateDMY(iso)
        emit('update:modelValue', iso)
        return
      }

      // Digit-only typing: auto-insert slashes for display but do not emit until complete
      const digits = v.replace(/\D/g, '').slice(0, 8)
      internalValue.value = formatDigitsToDisplay(digits)
    }

    function onFocus() {
      isFocused.value = true
    }

    function addDays(date, n) {
      const d = new Date(date)
      d.setDate(d.getDate() + n)
      return d
    }

    function onKeyDown(e) {
      if (!fp) return
      const key = e.key
      const map = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -7,
        ArrowDown: 7,
        PageUp: -30,
        PageDown: 30
      }
      if (!(key in map)) return
      e.preventDefault()
      try {
        // open calendar so user sees changes
        fp.open()
        let base = null
        if (fp.selectedDates && fp.selectedDates.length) base = fp.selectedDates[0]
        else base = parseISODateToDate(props.modelValue) || new Date()

        const next = addDays(base, map[key])
        // setDate with trigger to update picker's selected date and call onChange
        fp.setDate(next, true)
        const iso = formatToISODate(next)
        internalValue.value = formatDateDMY(iso)
        emit('update:modelValue', iso)
      } catch (err) {
        // ignore
      }
    }

    function onBlur() {
      isFocused.value = false
      const v = internalValue.value || ''
      if (v === '') {
        emit('update:modelValue', '')
        return
      }
      const iso = parseDateDMY(v)
      if (iso) {
        internalValue.value = formatDateDMY(iso)
        emit('update:modelValue', iso)
      } else {
        // Revert to the last valid modelValue
        internalValue.value = formatDateDMY(props.modelValue)
      }
    }

    return {
      inputEl,
      internalValue,
      onInput,
      onBlur,
      onFocus,
      onKeyDown
    }
  }
}
</script>

<style scoped>
:where(.date-field) {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
