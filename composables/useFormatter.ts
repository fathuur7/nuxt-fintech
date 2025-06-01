export const useFormatter = () => {
  // Format balance
  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(balance)
  }

  // Format date
  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  // Format number
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat('id-ID', options).format(number)
  }

  return {
    formatBalance,
    formatDate,
    formatNumber
  }
}