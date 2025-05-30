export function useAuth() {
  const token = useCookie('token')
  const isLoggedIn = computed(() => !!token.value)

  const loginWithGoogle = () => {
    window.location.href = '/api/auth/google'
  }

  return { isLoggedIn, loginWithGoogle }
}
