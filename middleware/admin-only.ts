import { defineNuxtRouteMiddleware, useNuxtApp } from "nuxt/app"

export default defineNuxtRouteMiddleware((to, from) => {
  // const { $auth } = useNuxtApp()

  // if (!($auth as any).user?.roles?.includes('admin')) {
  //   throw createError({
  //     statusCode: 403,
  //     statusMessage: 'Access Denied'
  //   })
  // }
})
