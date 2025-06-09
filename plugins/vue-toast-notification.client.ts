import 'vue-toast-notification/dist/theme-sugar.css'
import { useToast } from 'vue-toast-notification'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const toast = useToast()
  nuxtApp.provide('toast', toast)
})
