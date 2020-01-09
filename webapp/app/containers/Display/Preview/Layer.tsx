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

import React, { useContext, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { LayerContext, LayerSimple } from '../components/Layer'
import { SlideContext } from '../components/Container'
import { makeSelectSlideLayerContextValue } from '../selectors'

interface IPreviewLayerProps {
  id: number
}

const PreviewLayer: React.FC<IPreviewLayerProps> = (props) => {
  const { id } = props
  const { slideId } = useContext(SlideContext)

  const selectSlideLayerContextValue = useMemo(
    makeSelectSlideLayerContextValue,
    []
  )
  const layerContextValue = useSelector((state) =>
    selectSlideLayerContextValue(state, slideId, id, false)
  )

  return (
    <LayerContext.Provider value={layerContextValue}>
      <LayerSimple />
    </LayerContext.Provider>
  )
}

export default PreviewLayer
