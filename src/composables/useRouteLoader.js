import { computed, ref } from 'vue'

const routeLoading = ref(false)

export function startRouteLoading() {
  routeLoading.value = true
}

export function stopRouteLoading() {
  routeLoading.value = false
}

export function useRouteLoader() {
  return {
    isRouteLoading: computed(() => routeLoading.value),
    startRouteLoading,
    stopRouteLoading
  }
}
