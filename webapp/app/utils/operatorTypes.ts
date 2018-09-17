export enum OperatorTypes {
  Equal = '=',
  NotEqual = '!=',
  Contain = 'like',
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

export default OperatorTypes
