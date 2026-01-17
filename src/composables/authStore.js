import { ref } from 'vue'

export const isAuthenticated = ref(false)
export const user = ref(null)
export const loading = ref(true)

// Initialize loading state immediately if we have a stored user or token
export function initializeAuthStore() {
  const storedUser = localStorage.getItem('user')
  const storedToken = localStorage.getItem('accessToken')
  
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
      isAuthenticated.value = true
    } catch (e) {
      console.error('Error parsing stored user:', e)
    }
  }
  
  if (storedToken || storedUser) {
    loading.value = false
  }
}