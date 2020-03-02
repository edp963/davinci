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

import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { makeSelectCurrentSlide } from 'containers/Viz/selectors'
import { makeSelectCurrentSelectedLayerList } from '../selectors'

import {
  SlideSettingForm,
  LayerSettingForm,
  LayerAlignment
} from '../components/Setting'
import { ISlideParams } from 'containers/Viz/types'
import DisplayActions from '../actions'
import VizActions from 'containers/Viz/actions'
import { ILayerParams } from '../components/types'
import { LayerAlignmentTypes } from '../components/constants'

const Setting: React.FC = () => {
  const dispatch = useDispatch()
  const currentSlide = useSelector(makeSelectCurrentSlide())
  const currentSelectedLayerList = useSelector(
    makeSelectCurrentSelectedLayerList()
  )

  const slideParamsChange = useCallback(
    (changedValues: Partial<ISlideParams>) => {
      if (changedValues && Object.keys(changedValues).length) {
        dispatch(VizActions.editCurrentSlideParams(changedValues))
      }
    },
    []
  )

  const layerParamsChange = useCallback(
    (layerId: number, changedValues: Partial<ILayerParams>) => {
      if (changedValues && Object.keys(changedValues).length) {
        dispatch(DisplayActions.editSlideLayerParams(layerId, changedValues))
      }
    },
    []
  )

  const setAlignment = useCallback((alignmentType: LayerAlignmentTypes) => {
    dispatch(DisplayActions.setLayersAlignment(alignmentType))
  }, [])

  const { id: slideId, config: { slideParams } } = currentSlide
  const selectedLayersLength = currentSelectedLayerList.length
  switch (selectedLayersLength) {
    case 0:
      return (
        <SlideSettingForm
          slideId={slideId}
          slideParams={slideParams}
          onChange={slideParamsChange}
        />
      )
    case 1:
      const { id, subType, type, params } = currentSelectedLayerList[0]
      const layerType = subType || type
      return (
        <LayerSettingForm
          type={layerType}
          slideId={slideId}
          layerId={id}
          layerParams={params}
          onChange={layerParamsChange}
        />
      )
    default:
      return <LayerAlignment onChange={setAlignment} />
  }
}

export default Setting
