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
  IPortal,
  IDisplayRaw,
  IDisplayParams,
  IDisplayFormed,
  Display,
  IDashboard,
  IDashboardNode,
  ISlideBase,
  SlideScaleMode,
  ISlideParams,
  ISlideFormed
} from './components/types'

export interface ISlideRaw extends ISlideBase {
  config: string
}

export type Slide = ISlideRaw & ISlideFormed

interface IVizState {
  portals: IPortal[]
  portalDashboards: {
    [portalId: number]: IDashboardNode[]
  }
  displaySlides: {
    [displayId: number]: ISlideFormed[]
  }
  currentPortalId: number
  currentDisplay: IDisplayFormed
  currentSlide: ISlideFormed
  displays: Display[]
  loading: {
    portal: boolean
    display: boolean
    editing: boolean
    dashboards: boolean
    slides: boolean
  }
}

export {
  IPortal,
  IDisplayRaw,
  IDisplayParams,
  IDisplayFormed,
  Display,
  IDashboard,
  IDashboardNode,
  SlideScaleMode,
  ISlideParams,
  ISlideFormed,
  IVizState
}
