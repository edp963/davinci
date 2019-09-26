// @TODO optimize ts type and refactor to Widget util
export function getColumnIconByType (type: string) {
  switch (type) {
    case 'number': return 'icon-values'
    case 'date': return `icon-calendar`
    case 'geoCountry':
    case 'geoProvince':
    case 'geoCity': return 'icon-map'
    default: return 'icon-categories'
  }
}
