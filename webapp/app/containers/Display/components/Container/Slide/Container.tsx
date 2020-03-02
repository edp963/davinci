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

import React from 'react'
import { SlideContext } from './SlideContext'

import { ISlideParams } from 'containers/Viz/types'

interface ISlideContainerProps {
  slideId: number
  slideParams: ISlideParams
}

const SlideContainer: React.FC<ISlideContainerProps> = (props) => {
  const { slideId, slideParams } = props

  return (
    <SlideContext.Provider value={{ slideId, slideParams }}>
      {props.children}
    </SlideContext.Provider>
  )
}

export default SlideContainer
