import { IFontSetting } from 'components/StyleSetting/Font'

export type StackGroup = string[][]
export interface IStackMetrics {
  [id: string]: string
}

export interface IStackConfig {
  on: boolean
  percentage: boolean
  group: StackGroup
  sum: {
    show: boolean
    font: IFontSetting
  }
}
