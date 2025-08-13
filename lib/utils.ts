export const formatMoney = (n: number, locale = 'es-MX', currency='MXN') =>
  new Intl.NumberFormat(locale, { style:'currency', currency }).format(n)
