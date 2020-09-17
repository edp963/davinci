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

import { GraphTypes, SecondaryGraphTypes } from './constants'

import { RichTextNode } from 'components/RichText'

export * from './Layer/List/types'
export * from './Layer/types'
export * from './Container/types'

export type LayerBase = {
  id: number
  displaySlideId: number
  index: number
  name: string
  type: GraphTypes
  subType?: SecondaryGraphTypes
  widgetId?: number
}

export interface ILayerRaw extends LayerBase {
  params: string
}

export interface ILayerParams {
  backgroundColor: [number, number, number]
  backgroundRepeat: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat'
  backgroundSize: 'auto' | 'contain' | 'cover'
  backgroundImage: string
  borderColor: [number, number, number]
  borderRadius: number
  borderStyle: string
  borderWidth: number
  frequency: number
  height: number
  polling: 'true' | 'false'
  positionX: number
  positionY: number
  width: number
  fontWeight: React.CSSProperties['fontWeight']
  fontFamily: string
  fontColor: [number, number, number]
  fontSize: number
  textAlign: string
  textStyle: string
  lineHeight: number
  textIndent: number
  paddingTop: number
  paddingBottom: number
  paddingLeft: number
  paddingRight: number
  richText: IRichTextConfig
  contentText: string,
  
  src: string
  controlSetting: string[]
  start?: number
  end?: number

  timeFormat: string
  timeDuration: number

}

export interface ILayerOperationInfo {
  dragging: boolean,
  resizing: boolean,
  selected: boolean,
  editing: boolean
}

export interface IRichTextConfig {
  content: string | RichTextNode[]
} 

export type ILayerFormed = LayerBase & {
  params: ILayerParams
}

export type Layer = ILayerRaw | ILayerFormed
