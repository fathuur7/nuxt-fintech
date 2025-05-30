// plugins/socket.client.ts
export default defineNuxtPlugin(() => {
  // Only run on client side
  // if (process.client) {
  //   const config = useRuntimeConfig()
    
  //   // Use dynamic import to avoid server-side issues
  //   let socket: any = null
    
  //   const initSocket = async () => {
  //     if (!socket) {
  //       const { io } = await import('socket.io-client')
  //       socket = io(config.public.wsUrl, {
  //         autoConnect: false
  //       })
  //     }
  //     return socket
  //   }

  //   return {
  //     provide: {
  //       socket: {
  //         getInstance: initSocket,
  //         get: () => socket
  //       }
  //     }
  //   }
  // }
  
  // // Return empty object for server side
  // return {
  //   provide: {
  //     socket: {
  //       getInstance: async () => null,
  //       get: () => null
  //     }
  //   }
  // }
})