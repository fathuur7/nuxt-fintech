export default defineEventHandler(async (event) => {
  try {
    // Clear the token cookie
    setCookie(event, 'token', '', {
      httpOnly: false,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immediately
    })

    return {
      success: true,
      message: 'Logout berhasil'
    }
  } catch (error) {
    console.error('Logout API Error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})