import {
  IDashboardRaw,
  IDashboardItem,
  IDashboard,
  IDashboardItemInfo
} from 'app/containers/Dashboard/types'
import { DashboardItemStatus } from './constants'
import { IWidgetRaw, IWidgetFormed } from 'app/containers/Widget/types'
import { IFormedView } from 'app/containers/View/types'
import { IDownloadRecord } from 'app/containers/App/types'

export interface IShareWidgetRaw extends IWidgetRaw {
  dataToken: string
  model: string
  variable: string
}

export interface IShareDashboardDetailRaw extends IDashboardRaw {
  widgets: IShareWidgetRaw[]
  relations: IDashboardItem[]
}

export interface IShareDashboardItemInfo
  extends Omit<
    IDashboardItemInfo,
    'shareToken' | 'authorizedShareToken' | 'shareLoading' | 'rendered'
  > {
  status: DashboardItemStatus
}

export interface IShareDashboardState {
  dashboard: IDashboard
  title: string
  widgets: IWidgetFormed[]
  formedViews: {
    [viewId: number]: Pick<IFormedView, 'model'>
  }
  items: IDashboardItem[]
  itemsInfo: {
    [itemId: string]: IShareDashboardItemInfo
  }
  downloadListLoading: boolean
  downloadList: IDownloadRecord[]
  downloadListInfo: {
    [itemId: number]: {
      loading: boolean
    }
  }
  shareParams: object
  fullScreenPanelItemId: number
}
