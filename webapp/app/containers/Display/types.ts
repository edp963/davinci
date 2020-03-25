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
  IBaseline,
  LayersOperationInfo
} from './components/types'
import { ISlideFormed } from 'containers/Viz/types'

import { ActionTypes as VizActionTypes } from 'containers/Viz/constants'
import { ActionTypes } from './constants'

import { IQueryConditions } from 'containers/Dashboard/types'
import { RenderType } from 'containers/Widget/components/Widget'
import { IWidgetFormed } from 'containers/Widget/types'
import { ISharePanel, SharePanelType } from 'app/components/SharePanel/type'

export interface ILayerInfo {
  datasource: {
    pageNo?: number
    pageSize?: number
    resultList: any[]
    totalCount?: number
  }
  loading: boolean
  queryConditions?: IQueryConditions
  interactId?: string
  rendered?: boolean
  renderType?: RenderType
}

interface IDisplayLoading {
  shareToken: boolean
  slideLayers: boolean
}

export interface IDisplayState {
  currentDisplayShareToken: string
  currentDisplayAuthorizedShareToken: string
  currentDisplaySelectOptions: object

  currentSlideId: number

  currentDisplayWidgets: { [widgetId: number]: IWidgetFormed }

  slideLayers: { [slideId: number]: { [layerId: number]: ILayerFormed } }
  slideLayersInfo: { [slideId: number]: { [layerId: number]: ILayerInfo } }
  slideLayersOperationInfo: {
    [slideId: number]: LayersOperationInfo
  }

  clipboardSlides: ISlideFormed[]
  clipboardLayers: ILayerFormed[]

  lastOperationType: (keyof typeof ActionTypes) | (keyof typeof VizActionTypes)
  lastLayers: ILayerFormed[]

  editorBaselines: IBaseline[]

  sharePanel: IDisplaySharePanelState

  loading: IDisplayLoading
}

export interface IDisplaySharePanelState extends Pick<ISharePanel, 'id' | 'type' | 'title'> {
  visible: boolean
}

export { SharePanelType }
