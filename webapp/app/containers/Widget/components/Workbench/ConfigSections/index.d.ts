export interface IRichTextConfig {
  content: string
}

export interface IBarConfig {
  border: {
    color: string
    width: number
    type: 'solid' | 'dashed' | 'dotted'
    radius: number
  }
  gap: number
  width: number
}
