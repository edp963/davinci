import { StackConfig } from '../../Config/Stack'
import { RichTextNode } from 'components/RichText'

export interface IRichTextConfig {
  content: string | RichTextNode[]
}

export interface IBarConfig {
  barChart: boolean
  border: {
    color: string
    width: number
    type: 'solid' | 'dashed' | 'dotted'
    radius: number
  }
  gap: number
  width: number
  stack: StackConfig
}

export interface IRadarConfig {
  shape: 'polygon' | 'circle'
  name: {
    show: boolean
    fontFamily: string
    fontSize: string
    color: string
  }
  nameGap: number
  splitNumber: number
}
