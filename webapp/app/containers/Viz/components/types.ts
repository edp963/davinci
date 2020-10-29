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

import { DashboardTypes } from '../constants'

export interface IPortal {
  projectId?: number
  id?: number
  name?: string
  avatar?: string
  publish?: boolean
  description?: string
}

interface IDisplayBase {
  id: number
  name: string
  avatar: string
  description: string
  projectId: number
  publish: boolean
}

export interface IDisplayRaw extends IDisplayBase {
  config: string
}

export interface IDisplayParams {
  autoPlay: boolean
  autoSlide: number
  transitionStyle: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom'
  transitionSpeed: 'default' | 'fast' | 'slow'
  grid: [number, number]
}

export interface IDisplayFormed extends IDisplayBase {
  config: {
    displayParams: IDisplayParams
  }
  roleIds?: number[]
}

export type Display = IDisplayRaw | IDisplayFormed

export interface IDashboardBase {
  id: number
  name: string
  parentId: number
  index: number
  dashboardPortalId: number
  type: DashboardTypes
}

export interface IDashboardRaw extends IDashboardBase {
  config: string
}

export interface IDashboardWithRole extends IDashboardRaw {
  roleIds: number[]
}

export interface IDashboardNode extends IDashboardRaw {
  children?: IDashboardNode[]
}

export interface ISlideBase {
  id: number
  displayId: number
  index: number
}

export type SlideScaleMode = 'noScale' | 'scaleWidth' | 'scaleHeight' | 'scaleFull'

export interface ISlideParams {
  width: number
  height: number
  scaleMode: SlideScaleMode
  avatar: string
  backgroundColor: [number, number, number, number]
  backgroundImage: string
  autoSlideGlobal: boolean
  autoPlay: boolean
  autoSlide: number
  transitionGlobal: boolean
  transitionStyleIn: 'none' | 'fade-in' | 'slide-in' | 'convex-in' | 'concave-in' | 'zoom-in'
  transitionStyleOut: 'none' | 'fade-out' | 'slide-out' | 'convex-out' | 'concave-out' | 'zoom-out'
  transitionSpeed: 'default' | 'slow' | 'fast'
}

export interface ISlideFormed extends ISlideBase {
  config: {
    slideParams: ISlideParams
  }
}

export type DisplayFormType = 'add' | 'edit' | 'copy'
