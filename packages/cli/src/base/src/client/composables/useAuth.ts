import { ref, computed } from 'vue'

interface User {
  id: string
  email: string
  name: string
}

const currentUser = ref<User | null>(null)
const isAuthenticated = computed(() => !!currentUser.value)

export function useAuth() {
  const initializeAuth = () => {
    const token = localStorage.getItem('authToken')
    const userStr = localStorage.getItem('user')

    if (token && userStr) {
      try {
        currentUser.value = JSON.parse(userStr)
      } catch (err) {
        console.error('Failed to parse user data:', err)
        logout()
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    currentUser.value = null
  }

  const getToken = () => {
    return localStorage.getItem('authToken')
  }

  return {
    currentUser,
    isAuthenticated,
    initializeAuth,
    logout,
    getToken,
  }
}
