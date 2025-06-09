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
      path: '/topup',
      label: 'Top Up Saldo'
    },
    {
      path: '/savings',
      label: 'Simpanan'
    },
    {
      path: '/tracking',
      label: 'Tracking Simpanan'
    }
  ]
  return {
    navigationLinks
  }
}