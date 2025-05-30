export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('token')
  const isLoggedIn = !!token.value
  
  if (!isLoggedIn && to.path !== '/auth/login') {
    return navigateTo('/auth/login')
  }
})