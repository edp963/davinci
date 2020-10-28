/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import {
  ILayerFormed,
  ILayerParams
} from 'app/containers/Display/components/types'

import { IFormedViews, IView } from 'app/containers/View/types'
import {
  IDisplayState,
  IDisplaySharePanelState,
  ILayerInfo
} from 'app/containers/Display/types'
import { ISlideParams } from 'app/containers/Viz/components/types'
import { DragTriggerTypes } from 'app/containers/Display/constants'
import { IBaseline } from 'app/containers/Display/components/Container/Slide/types'
import { IWidgetFormed } from 'app/containers/Widget/types'
import { displayInitialState } from 'app/containers/Display/reducer'
import { appInitialState } from 'app/containers/App/reducer'
import { viewInitialState } from 'app/containers/View/reducer'
import { IVizState } from 'app/containers/Viz/types'
import { IShareTokenParams } from 'app/components/SharePanel/types'
import {
  ViewModelTypes,
  ViewModelVisualTypes
} from 'app/containers/View/constants'
export const mockDisplayId: number = 72

export const mockSlideId: number = 627

export const mockGraphLayerId: number = 1968
export const mockChartLayerId: number = 1972

export const mockWidgetId = 324

export const mockOperation = 117

export const mockAlignmentType = 2

export const mockLayerScale = 0.55

export const mockSelected = true

export const mockExclusive = true

export const mockLayerParamsUnChanged = true

export const mockEditing = false

export const mockFinish = false

export const mockEventTrigger = 'keydown' as DragTriggerTypes

export const mockDisplayTitle = 'display'

export const mockSlideCoverUploadImgSrc =
  '/image/display/1600412404463_edb4c219-9206-4da0-a88a-2a47f801d153.png'

export const Req =
  'eNoNybkBwDAIBLCVAGM4Ssyz_0hJpUKWAJbOLV_TyBpRM0c6Nscbr9jHmlmzrNEjTLtZOOYVI61sTwr0opc0wZO0NEJT_q8QXVylZvP4jbMmRYuRKsgHZMwdFA'

export const mockAuthShareToken =
  'eNoVjskRBDEIxFIazoYnBpN_SOv9Syp5RcR-Yo11zerL6o4oxNbFFKxCSAyUPTr57W5Ysto0nSSXM0pfqt4RhWJSM4UT7PjzT8uKV9DnJt_tSEJKfK--eZs0LilMittsZe5UvL7nW3C7x-EF7uMn4nlRxnyMqPV8mmu4B2BzNmQ8alU6dBy0_gM8rDKA'

export const mockPasswordToken =
  'eNoVzrkBAzEIBMCWED8hQmz_JZ0dTD7emQkSm4Br9Syre2RHojcepwomni3LC6adhRz48ZGT8ISk0S3fjEzCUB9G14z5ueEGU9C03eSWcCe-oPjJwpOunaOg'

export const mockHttpError = new Error('Request failed with status code 403')

export const mockSlideSize = {
  width: 1924,
  height: 1080
}

export const mockDeltaPosition = {
  deltaX: 10,
  deltaY: 10
}

export const mockDeltaSize = {
  deltaWidth: 0,
  deltaHeight: 0
}

export const mockCover = new Blob([''], {
  type: 'image/png'
})
export const mockShareToken =
  'eNoNybkBwDAIBLCVAGM4Ssyz_0hJpUKWAJbOLV_TyBpRM0c6Nscbr9jHmlmzrNEjTLtZOOYVI61sTwr0opc0wZO0NEJT_q8QXVylZvP4jbMmRYuRKsgHZMwdFA'
export const mockPassword = 'RYO92FBC'
export const mockShareTokenReq = {
  password: '',
  token:
    'eNoNybkBwDAIBLCVAGM4Ssyz_0hJpUKWAJbOLV_TyBpRM0c6Nscbr9jHmlmzrNEjTLtZOOYVI61sTwr0opc0wZO0NEJT_q8QXVylZvP4jbMmRYuRKsgHZMwdFA'
}
export const defaultSharePanelState: IDisplaySharePanelState = {
  id: 0,
  type: 'display',
  title: '',
  visible: false
}
export const mockShareLinkParams: IShareTokenParams = {
  id: 72,
  mode: 'AUTH',
  expired: '2030-01-01',
  permission: 'SHARER',
  roles: null,
  viewers: null
}

export const mockBaseLines: IBaseline = {
  adjustType: 'position',
  bottom: 301,
  left: 183,
  right: 1257,
  top: 779,
  adjust: [0, 0]
}

export const mockFormedViews: IFormedViews = {
  127: {
    id: 127,
    roles: [],
    name: '渠道信息',
    projectId: 41,
    sourceId: 53,
    sql: 'SELECT * from dad',
    variable: [],
    config: '',
    description: '',
    model: {
      name_level1: {
        sqlType: 'VARCHAR',
        visualType: ViewModelVisualTypes.String,
        modelType: ViewModelTypes.Category
      },
      总停留时间: {
        sqlType: 'DECIMAL',
        visualType: ViewModelVisualTypes.Number,
        modelType: ViewModelTypes.Value
      }
    }
  }
}

export const mockSlideParams: ISlideParams = {
  autoPlay: true,
  autoSlide: 10,
  autoSlideGlobal: true,
  backgroundColor: [255, 255, 255, 50],
  height: 1080,
  scaleMode: 'scaleWidth',
  transitionGlobal: true,
  transitionSpeed: 'default',
  transitionStyleIn: 'none',
  transitionStyleOut: 'none',
  width: 1924,
  avatar:
    '/image/display/1600424919897_060715b4-b8f3-48ea-8fed-fc82a9a19f83.png',
  backgroundImage: ''
}

export const mockSlide = {
  id: 623,
  index: 1,
  displayId: 72,
  config: {
    slideParams: mockSlideParams
  }
}

export const mockSlideList = [
  {
    id: 624,
    index: 1,
    displayId: 72,
    config: {
      slideParams: mockSlideParams
    }
  },
  {
    id: 625,
    index: 2,
    displayId: 72,
    config: {
      slideParams: mockSlideParams
    }
  }
]

export const mockWidgetFormed: IWidgetFormed = {
  description: '',
  id: mockWidgetId,
  name: '系统变量测试',
  projectId: 41,
  publish: true,
  type: 1,
  viewId: 269,
  config: {
    controls: [],
    limit: 100,
    cache: false,
    expired: 1000,
    autoLoadData: false,
    queryMode: 1,
    chartStyles: {},
    cols: [],
    data: [],
    rows: [],
    metrics: [],
    filters: [],
    selectedChart: 1,
    orders: [],
    mode: 'chart',
    model: {}
  }
}
export const mockCurrentDisplayWidgets = {
  [mockWidgetId]: mockWidgetFormed
}

export const mockGraphLayerInfo: ILayerInfo = {
  datasource: {
    // pageNo: 1,
    // pageSize: 20,
    resultList: []
    // totalCount: 210
  },
  loading: false
}
export const mockChartLayerInfo: ILayerInfo = {
  datasource: {
    pageNo: 1,
    pageSize: 20,
    resultList: [],
    totalCount: 210
  },
  interactId: '',
  loading: false,
  queryConditions: {
    globalFilters: [],
    globalVariables: [],
    linkageFilters: [],
    linkageVariables: [],
    tempFilters: [],
    variables: []
  },
  renderType: 'clear',
  rendered: false
}
export const mockSlideLayersInfoGraphSingle = {
  [mockSlideId]: {
    [mockGraphLayerId]: mockGraphLayerInfo
  }
}
export const mockDefaultSlideLayersInfo = {
  [mockGraphLayerId]: mockGraphLayerInfo,
  [mockChartLayerId]: mockChartLayerInfo
}
export const mockSlideLayersInfo = {
  [mockSlideId]: mockDefaultSlideLayersInfo
}

export const mockChangedParams: ILayerParams = {
  backgroundColor: [255, 255, 255],
  borderColor: [199, 204, 212],
  backgroundRepeat: 'repeat',
  backgroundSize: 'auto',
  backgroundImage: '',
  borderRadius: 6,
  borderStyle: 'dashed',
  borderWidth: 0,
  fontColor: [160, 17, 17],
  frequency: 10,
  polling: 'true',
  fontFamily: 'Verdana',
  contentText: '',
  timeDuration: 1000,
  timeFormat: '',
  controlSetting: [],
  fontSize: 40,
  src: '',
  fontWeight: 'bold',
  height: 120,
  lineHeight: 44,
  paddingBottom: 10,
  paddingLeft: 15,
  paddingRight: 13,
  paddingTop: 20,
  positionX: 215,
  positionY: 106,
  richText: {
    content: []
  },
  textAlign: 'right',
  textIndent: 6,
  textStyle: '',
  width: 953
}
export const mockChartLayerFormed: ILayerFormed = {
  displaySlideId: mockSlideId,
  id: 1972,
  index: 2,
  name: '系统变量测试',
  params: mockChangedParams,
  type: 1,
  widgetId: mockWidgetId
}
export const mockGraphLayerFormed: ILayerFormed = {
  displaySlideId: mockSlideId,
  id: 1968,
  index: 2,
  name: '矩形_QTpkc',
  params: mockChangedParams,
  subType: 20,
  type: 2,
  widgetId: 111
}
export const mockSlideLayersFormedGraphSingle = {
  mockSlideId: {
    [mockGraphLayerId]: mockGraphLayerFormed
  }
}
export const mockSlideSingleGraphLayerFormed = {
  [mockGraphLayerId]: mockGraphLayerFormed
}
export const mockDefaultSlideLayers = {
  [mockGraphLayerId]: mockGraphLayerFormed,
  [mockChartLayerId]: mockChartLayerFormed
}

export const mockChangedOperationInfo = {
  editing: false,
  selected: false
}
export const mockDefaultSlideLayersOperationGraphInfo = {
  [mockGraphLayerId]: {
    dragging: false,
    editing: false,
    resizing: false,
    selected: false
  }
}
export const mockDefaultSlideLayersOperationChartInfo = {
  [mockChartLayerId]: {
    dragging: false,
    editing: false,
    resizing: false,
    selected: false
  }
}
export const mockDefaultSlideLayersOperationInfo = {
  ...mockDefaultSlideLayersOperationGraphInfo,
  ...mockDefaultSlideLayersOperationChartInfo
}
export const mockSlideLayersOperationInfo = {
  [mockSlideId]: mockDefaultSlideLayersOperationInfo
}

export const mockDefaultWidgetFormed: IWidgetFormed = {
  description: '',
  id: mockWidgetId,
  name: '系统变量测试',
  projectId: 41,
  publish: true,
  type: 1,
  viewId: 269,
  config: {
    controls: [],
    limit: 100,
    cache: false,
    expired: 1000,
    autoLoadData: false,
    queryMode: 1,
    chartStyles: {},
    cols: [],
    data: [],
    rows: [],
    metrics: [],
    filters: [],
    selectedChart: 1,
    orders: [],
    mode: 'chart',
    model: {}
  }
}

export const mockViewItem = {
  config: '',
  description: '演示-人员信息',
  id: 84,
  model: '{}',
  name: '人员信息',
  projectId: 41,
  sourceId: 53,
  sql:
    'SELECT * from personinfo where 1=1↵$if(name)$↵	and name = $name$↵$endif$↵$if(nation)$↵	and nation = $nation$↵$endif$↵$if(education)$↵	and education in ($education$)↵$endif$↵$if(city)$↵	and city in ($city$)↵$endif$',
  variable: '[]',
  roles: []
}

export const mockSlideDetail = {
  config: '',
  displayId: mockDisplayId,
  id: mockSlideId,
  index: 4,
  items: [mockGraphLayerFormed],
  views: [mockViewItem],
  widgets: [mockWidgetFormed]
}

const displayState: IDisplayState = {
  currentDisplayShareToken: '',
  currentDisplayAuthorizedShareToken: '',
  currentDisplayPasswordShareToken: '',
  currentDisplayPasswordPassword: '',
  sharePanel: defaultSharePanelState,
  currentDisplaySelectOptions: {},

  currentSlideId: mockSlideId,

  currentDisplayWidgets: {
    [mockWidgetId]: mockDefaultWidgetFormed
  },

  slideLayers: {
    [mockSlideId]: mockDefaultSlideLayers
  },
  slideLayersInfo: mockSlideLayersInfo,
  slideLayersOperationInfo: mockSlideLayersOperationInfo,

  clipboardSlides: [],
  clipboardLayers: [],

  lastOperationType: null,
  lastLayers: [],

  editorBaselines: [],
  operateItemParams: [mockGraphLayerFormed],

  loading: {
    shareToken: false,
    slideLayers: false
  }
}
const mockDisplayForm = {
  config: {
    displayParams: {
      autoPlay: false,
      autoSlide: 1,
      transitionStyle: 'zoom',
      transitionSpeed: 'default',
      grid: [10, 10]
    }
  },
  roleIds: [1],
  id: 788,
  name: 'display',
  avatar: '',
  description: '',
  projectId: 100,
  publish: false
}
const vizState: IVizState = {
  portals: [],
  displays: [],
  portalDashboards: {},
  displaySlides: {},
  currentPortalId: 0,
  currentDisplay: {
    config: {
      displayParams: {
        autoPlay: false,
        autoSlide: 1,
        transitionStyle: 'zoom',
        transitionSpeed: 'default',
        grid: [10, 10]
      }
    },
    roleIds: [1],
    id: 788,
    name: 'display',
    avatar: '',
    description: '',
    projectId: 100,
    publish: false
  },
  currentSlide: null,
  loading: {
    portal: false,
    display: false,
    editing: false,
    dashboards: false,
    slides: false
  }
}
export const mockDisplayState = {
  display: displayState
}

export const mockVizState = {
  viz: vizState
}

export const mockDisplayDefaultState = {
  display: displayInitialState
}

export const mockAppState = appInitialState

export const mockViewState = {
  view: viewInitialState
}
