export interface ISpecConfig {
  smooth?: boolean
  stack?: boolean
  barChart?: boolean
  percentage?: boolean
  step?: boolean
  roseType?: boolean
  circle?: boolean
  sortMode?: string
  alignmentMode?: string
  gapNumber?: number
  shape?: 'polygon' | 'circle'
  roam?: boolean
  layerType?: string
  linesSpeed: number
  symbolType: string
  layout?: 'horizontal' | 'vertical'

  // for sankey
  nodeWidth: number
  nodeGap: number,
  orient: 'horizontal' | 'vertical'
  draggable: boolean
  symbol?: boolean
  label?: boolean
}
