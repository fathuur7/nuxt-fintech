export const debugEnv = () => {
  const config = useRuntimeConfig()
  console.groupCollapsed('Debugging Environment Variables:')
  console.log(`client_id: ${config.googleClientId}`)
  console.log(`client_secret: ${config.googleClientSecret}`)
  console.log(`redirect_uri: ${config.googleRedirectUri}`)
  console.log(`mongoUri: ${config.mongoUri}`)
  console.log(`jwtSecret: ${config.jwtSecret}`)
  console.groupEnd()
}
