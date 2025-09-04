// This endpoint is no longer needed with Supabase Auth
// Supabase handles OAuth callbacks automatically
export default defineEventHandler((event) => {
  throw createError({
    statusCode: 404,
    statusMessage: 'This endpoint has been replaced by Supabase Auth. OAuth callbacks are handled automatically.'
  })
})