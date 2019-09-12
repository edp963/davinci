import { IStackConfig } from './types'
import { EmptyFontSetting } from 'components/StyleSetting/Font'

export const StackItemType = 'MetricCustomStack'

export const EmptyStack: IStackConfig = {
  on: false,
  percentage: false,
  group: [],
  sum: {
    show: false,
    font: { ...EmptyFontSetting }
  }
}
