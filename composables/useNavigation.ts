export const useNavigation = () => {
  const navigationLinks = [
    {
      path: '/loan',
      label: 'Pinjaman'
    },
    {
      path: '/transactions',
      label: 'Transaksi'
    },
    {
      path: '/portfolio',
      label: 'Portfolio'
    },
    {
      path: '/analytics',
      label: 'Analytics'
    }
  ]

  return {
    navigationLinks
  }
}