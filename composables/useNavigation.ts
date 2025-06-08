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
  ]
  return {
    navigationLinks
  }
}