import { defineNuxtRouteMiddleware } from "nuxt/app";

// middleware/domain-router.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // if (process.client) {
  //   const host = window.location.host
    
  //   // Handle domain-based routing on client side
  //   if (host.includes('admin.') && !to.path.startsWith('/admin')) {
  //     return navigateTo('/admin' + to.path)
  //   }
    
  //   if (host.includes('api.') && !to.path.startsWith('/api')) {
  //     return navigateTo('/api' + to.path)
  //   }
  // }
})