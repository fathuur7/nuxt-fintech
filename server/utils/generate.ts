export const generateAccountNumber = (): string => {
  return 'SAV' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase()
}