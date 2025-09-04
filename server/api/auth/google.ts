// This endpoint is no longer needed with Supabase Auth
// Supabase handles OAuth flows automatically
export default defineEventHandler((event) => {
  throw createError({
    statusCode: 404,
    statusMessage: 'This endpoint has been replaced by Supabase Auth. Use the client-side authentication instead.'
  })
})