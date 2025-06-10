// composables/useNotification.js
import { useToast } from 'vue-toast-notification'

export const useNotification = () => {
  const toast = useToast()
  
interface NotificationMethods {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
}

return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message),
    warning: (message: string) => toast.warning(message)
} as NotificationMethods;
}