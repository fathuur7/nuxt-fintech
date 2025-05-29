import { defineNuxtRouteMiddleware, navigateTo, useNuxtApp } from "nuxt/app"


export default defineNuxtRouteMiddleware((to, from) => {
  // This should only run on client-side for route protection
  if (process.client) {
    const { $auth } = useNuxtApp()
    
    if (!$auth || !($auth as any).loggedIn) {
      return navigateTo('/login')
    }
  }
})

