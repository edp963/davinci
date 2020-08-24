import { tuple } from 'utils/util'
export const shareVizsType = tuple('dashboard', 'display', 'widget')
export const shareType = tuple('NORMAL', 'AUTH', 'PASSWORD', '')
export const permission = tuple('SHARER', 'VIEWER')
export const copyType = tuple('link', 'linkPwd')

export type TShareVizsType = typeof shareVizsType[number]
export type TPermission = typeof permission[number]
export type TShareType = typeof shareType[number]
export type TCopyType = typeof copyType[number]
export type TsType = (sType: TShareType) => void

export interface ISharePanel {
  id: number
  itemId?: number
  type: TShareVizsType
  title: string
  shareToken: string
  authorizedShareToken: string
  loading: boolean
}

export interface ICtrl {
  shareType: TShareType
  setSType: TsType
}

export interface IContent {
  vizType: TShareVizsType
  loading: boolean
  shareType: TShareType
  shareToken: string
  loadToken: () => void
  authorizedShareToken: string
}


export interface IRegularContent extends IContent {
  token: string
  vizType: TShareVizsType
}

export interface IAuthContent extends IContent {
  authUser: string
  vizType: TShareVizsType
  authorized: boolean
  token: string
}

export interface ISignalContent extends IContent {
  authUser: string
  vizType: TShareVizsType
}








