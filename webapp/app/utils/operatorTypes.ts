export enum OperatorTypes {
  Equal = '=',
  NotEqual = '!=',
  Contain = 'like',
  NotContain = 'not like',
  Between = 'between',
  In = 'in',
  NotIn = 'not in',
  LessThan = '<',
  GreaterThan = '>',
  LessThanOrEqual = '<=',
  GreaterThanOrEqual = '>='
}

export const OperatorTypesLocale = {
  [OperatorTypes.Equal]: '等于',
  [OperatorTypes.NotEqual]: '不等于',
  [OperatorTypes.Contain]: '包含',
  [OperatorTypes.NotContain]: '不包含',
  [OperatorTypes.Between]: '在……之间',
  [OperatorTypes.In]: '在……范围内',
  [OperatorTypes.NotIn]: '不在……范围内',
  [OperatorTypes.LessThan]: '小于',
  [OperatorTypes.GreaterThan]: '大于',
  [OperatorTypes.LessThanOrEqual]: '小于等于',
  [OperatorTypes.GreaterThanOrEqual]: '大于等于'
}

export const LinkageOperatorTypes = [
  OperatorTypes.Equal,
  OperatorTypes.NotEqual,
  OperatorTypes.Contain,
  OperatorTypes.LessThan,
  OperatorTypes.GreaterThan,
  OperatorTypes.LessThanOrEqual,
  OperatorTypes.GreaterThanOrEqual
]

export const TableCellConditionOperatorTypes = {
  [OperatorTypes.Equal]: ['string', 'geoCountry', 'geoProvince', 'geoCity', 'number', 'date'],
  [OperatorTypes.NotEqual]: ['string', 'geoCountry', 'geoProvince', 'geoCity', 'number', 'date'],
  [OperatorTypes.LessThan]: ['number', 'date'],
  [OperatorTypes.GreaterThan]: ['number', 'date'],
  [OperatorTypes.LessThanOrEqual]: ['number', 'date'],
  [OperatorTypes.GreaterThanOrEqual]: ['number', 'date'],
  [OperatorTypes.Contain]: ['string', 'geoCountry', 'geoProvince', 'geoCity'],
  [OperatorTypes.Between]: ['number', 'date'],
  [OperatorTypes.In]: ['string', 'geoCountry', 'geoProvince', 'geoCity', 'number', 'date']
}

export default OperatorTypes
