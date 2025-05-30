export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')

  url.searchParams.set('client_id', config.googleClientId)
  url.searchParams.set('redirect_uri', config.googleRedirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid email profile')
  url.searchParams.set('access_type', 'offline')

  sendRedirect(event, url.toString())
})
