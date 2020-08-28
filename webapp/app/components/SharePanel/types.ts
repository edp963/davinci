export interface ISharePanel {
  id: number
  itemId?: number
  type: SharePanelType
  title: string
  shareToken: string
  authorizedShareToken: string
  loading: boolean
}

export type SharePanelType = 'dashboard' | 'display' | 'widget'
