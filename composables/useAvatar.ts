export const useAvatar = () => {
  // Generate default avatar SVG
  const getDefaultAvatar = (user: any) => {
    const name = user?.name || 'User'
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    
    // Generate color based on name
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
      '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
    ]
    const colorIndex = name.length % colors.length
    const bgColor = colors[colorIndex]
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="${bgColor}"/>
        <text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">${initials}</text>
      </svg>
    `)}`
  }

  // Get user picture with fallback
  const getUserPicture = (user: any) => {
    if (!user?.picture) {
      return getDefaultAvatar(user)
    }
    
    // Check if it's a valid URL
    try {
      new URL(user.picture)
      return user.picture
    } catch {
      console.warn('Invalid picture URL:', user.picture)
      return getDefaultAvatar(user)
    }
  }

  // Handle image loading error
  const handleImageError = (event: Event, user: any) => {
    const img = event.target as HTMLImageElement
    console.log('Image failed to load:', img.src)
    // Fallback to generated avatar
    img.src = getDefaultAvatar(user)
  }

  return {
    getUserPicture,
    getDefaultAvatar,
    handleImageError
  }
}