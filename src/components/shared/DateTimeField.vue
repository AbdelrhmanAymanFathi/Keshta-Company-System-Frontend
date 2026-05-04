<template>
  <input
    ref="inputEl"
    :placeholder="placeholder"
    :disabled="disabled"
    class="date-time-field"
    @input="onInput"
    :value="displayValue"
  />
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

function pad(n) { return String(n).padStart(2, '0') }
function toLocalDateTimeString(d) {
  if (!d) return ''
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function formatDateTimeDMY(v) {
  if (!v) return ''
  const d = new Date(v)
  if (isNaN(d.getTime())) return v
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default {
  name: 'DateTimeField',
  props: {
    modelValue: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    placeholder: { type: String, default: 'dd/MM/yyyy HH:mm' }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const inputEl = ref(null)
    let fp = null

    const displayValue = computed(() => formatDateTimeDMY(props.modelValue))

    onMounted(() => {
      if (!inputEl.value) return
      fp = flatpickr(inputEl.value, {
        enableTime: true,
        time_24hr: true,
        dateFormat: 'd/m/Y H:i',
        allowInput: true,
        defaultDate: props.modelValue ? new Date(props.modelValue) : null,
        onChange(selectedDates) {
          if (selectedDates && selectedDates.length) {
            emit('update:modelValue', toLocalDateTimeString(selectedDates[0]))
          } else {
            emit('update:modelValue', '')
          }
        }
      })
    })

    onBeforeUnmount(() => {
      if (fp) { fp.destroy(); fp = null }
    })

    watch(() => props.modelValue, (val) => {
      if (!fp) return
      try {
        fp.setDate(val ? new Date(val) : null, false)
      } catch (e) {
        // ignore
      }
    })

    function onInput(e) {
      const v = e.target.value
      // Support typed "dd/MM/yyyy HH:mm" -> convert to iso-local
      const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})/) || v.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
      if (m) {
        if (m[3] && m[4]) {
          // dd/mm/yyyy HH:mm
          const dd = m[1], mm = m[2], yyyy = m[3], hh = m[4], min = m[5]
          emit('update:modelValue', `${yyyy}-${mm}-${dd}T${pad(Number(hh))}:${min}`)
          return
        }
        // fallback for yyyy-mm-ddTHH:MM
        emit('update:modelValue', v)
        return
      }
      if (v === '') { emit('update:modelValue', '') } // clear
    }

    return { inputEl, displayValue, onInput }
  }
}
</script>

<style scoped>
.date-time-field { width: 100%; padding: 0.375rem 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }
</style>
