// Vue 3 Composition API composable for authentication
import { ref, computed, onMounted, onUnmounted } from 'vue'
import authManager from '../auth'

export function useAuth() {
  const isAuthenticated = ref(false)
  const user = ref(null)
  const loading = ref(true)

  // Update local state when auth state changes
  const handleAuthStateChange = (event, data) => {
    if (event === 'auth:stateChanged') {
      isAuthenticated.value = data.isAuthenticated
      user.value = data.user
      loading.value = false
    } else if (event === 'auth:logout') {
      isAuthenticated.value = false
      user.value = null
      loading.value = false
    }
  }

  // Computed properties
  const isLoggedIn = computed(() => isAuthenticated.value)
  const currentUser = computed(() => user.value)
  const isLoading = computed(() => loading.value)

  // Methods
  const login = async (credentials) => {
    loading.value = true
    try {
      const result = await authManager.login(credentials)
      return result
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      await authManager.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      loading.value = false
    }
  }

  const refreshToken = async () => {
    try {
      await authManager.refreshToken()
    } catch (error) {
      console.error('Token refresh error:', error)
      throw error
    }
  }

  // Lifecycle
  onMounted(() => {
    // Initialize auth state
    const authState = authManager.getAuthState()
    isAuthenticated.value = authState.isAuthenticated
    user.value = authState.user
    loading.value = false

    // Listen for auth state changes
    authManager.addListener(handleAuthStateChange)
  })

  onUnmounted(() => {
    // Remove listener when component unmounts
    authManager.removeListener(handleAuthStateChange)
  })

  return {
    // State
    isAuthenticated,
    user,
    loading,
    
    // Computed
    isLoggedIn,
    currentUser,
    isLoading,
    
    // Methods
    login,
    logout,
    refreshToken
  }
}
