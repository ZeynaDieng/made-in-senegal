export function useFormatPrice() {
  return (price: number) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(price) + ' FCFA'
}
