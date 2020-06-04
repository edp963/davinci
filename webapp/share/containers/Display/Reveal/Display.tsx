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
import { useDispatch, useSelector } from 'react-redux'

import { makeSelectSlidesCount, makeSelectWidgets } from '../selectors'

import { getRequestParamsByWidgetConfig } from 'containers/Viz/util'
import {
  LayerListContext,
  LayerListContextValue
} from 'containers/Display/components/Layer'

import Slide from './Slide'
import ShareDisplayActions from '../actions'

interface IDisplayProps {
  targetSlideNumber?: number
}

const Display: React.FC<IDisplayProps> = (props) => {
  const { targetSlideNumber } = props
  const dispatch = useDispatch()
  const slidesCount = useSelector(makeSelectSlidesCount())
  const widgets = useSelector(makeSelectWidgets())

  const layerListContextValue: LayerListContextValue = {
    currentDisplayWidgets: widgets,
    getWidgetViewModel: (_, widgetId: number) => widgets[widgetId].model,
    getChartData: (
      renderType,
      slideNumber,
      layerId,
      widget,
      prevQueryConditions,
      queryConditions?
    ) => {
      const requestParams = getRequestParamsByWidgetConfig(
        renderType,
        widget.config,
        prevQueryConditions,
        queryConditions
      )
      dispatch(
        ShareDisplayActions.loadLayerData(
          renderType,
          slideNumber,
          layerId,
          widget.dataToken,
          requestParams
        )
      )
    }
  }

  const onlyOneSlide =
    targetSlideNumber &&
    targetSlideNumber > 0 &&
    targetSlideNumber <= slidesCount

  return (
    <LayerListContext.Provider value={layerListContextValue}>
      {onlyOneSlide ? (
        <Slide slideNumber={targetSlideNumber} />
      ) : (
        [...Array(slidesCount).keys()].map((idx) => (
          <Slide key={idx} slideNumber={idx + 1} />
        ))
      )}
    </LayerListContext.Provider>
  )
}

export default Display
