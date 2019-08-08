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

import { ISlideParams } from './components/types'

export { ISlideParams } from './components/types'

export interface IDisplay {
  id: number
  name: string
  avatar: string
  description: string
  projectId: number
  publish: boolean
}

interface ISlideBase {
  id: number
  displayId: number
  index: number
}

export interface ISlideRaw extends ISlideBase {
  config: string
}

export interface ISlide extends ISlideBase {
  config: {
    slideParams: ISlideParams
  }
}
