<template>
  <Sonner
    v-if="host"
    class="shadcn-ui"
    position="top-right"
    :rich-colors="true"
    :dir="direction"
  />
</template>

<script>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import Sonner from '@/components/ui/sonner/Sonner.vue'

export default {
  name: 'ToastComponent',
  components: { Sonner },
  props: {
    host: { type: Boolean, default: false }
  },
  setup(props) {
    const { locale } = useI18n()
    const direction = computed(() => locale.value === 'ar' ? 'rtl' : 'ltr')

    function showToast(message, type = 'info', duration = 3000) {
      const options = { duration: duration === 0 ? Infinity : duration }
      const variant = ['success', 'error', 'warning', 'info'].includes(type) ? type : 'info'
      return toast[variant](message, options)
    }

    onMounted(() => {
      if (props.host) window.$toast = showToast
    })

    onBeforeUnmount(() => {
      if (props.host && window.$toast === showToast) delete window.$toast
    })

    return { direction }
  }
}
</script>
