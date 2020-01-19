import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { ISpecConfig } from '../types'

export const onSectionChange = (
  onChange: (
    value: string | number | boolean,
    propPath: string | string[]
  ) => void,
  propPath: keyof ISpecConfig
) => (e: CheckboxChangeEvent | string | number) => {
  const value: string | number | boolean = (e as CheckboxChangeEvent).target
    ? (e as CheckboxChangeEvent).target.checked
    : (e as string | number)

  onChange(value, [].concat(propPath as string | string[]))
}
