import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  formatCurrency as fc,
  formatNumber as fn,
  formatInteger as fi,
  formatPercent as fp,
  formatSigned as fs
} from '@/utils/formatting'

export function useFormatting() {
  const { locale } = useI18n()

  const formatCurrency = computed(() => (value, currency) => fc(value, locale.value, currency))
  const formatNumber = computed(() => (value, decimals) => fn(value, locale.value, decimals))
  const formatInteger = computed(() => (value) => fi(value, locale.value))
  const formatPercent = computed(() => (value, decimals) => fp(value, locale.value, decimals))
  const formatSigned = computed(() => (value, decimals) => fs(value, locale.value, decimals))

  return { formatCurrency, formatNumber, formatInteger, formatPercent, formatSigned }
}
