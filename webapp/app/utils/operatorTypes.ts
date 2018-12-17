export enum OperatorTypes {
  Equal = '=',
  NotEqual = '!=',
  Contain = 'like',
  Between = 'between',
  In = 'in',
  LessThan = '<',
  GreaterThan = '>',
  LessThanOrEqual = '<=',
  GreaterThanOrEqual = '>='
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
