// plugins/toast.client.js
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'

export default defineNuxtPlugin(() => {
  const toast = useToast()
  
  return {
    provide: {
      toast: toast
    }
  }
})