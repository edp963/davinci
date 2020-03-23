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

import React, { useContext, useMemo, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import pick from 'lodash/pick'

import {
  makeSelectCurrentLayerIds,
  makeSelectCurrentDisplayWidgets
} from '../selectors'

import {
  LayerListContext,
  LayerListContextValue,
  LayerItem
} from '../components/Layer'

import ViewActions from '../../View/actions'
import DisplayActions from '../actions'
import { RenderType } from '../../Widget/components/Widget'
import { IQueryConditions } from '../../Dashboard/types'
import { getRequestParamsByWidgetConfig } from 'containers/Viz/util'
import { makeSelectFormedViews } from '../../View/selectors'
import {
  makeSelectCurrentSlide,
  makeSelectCurrentDisplay
} from '../../Viz/selectors'

import SlideLayer from './SlideLayer'
import { ContainerContext } from '../components/Container'
import { makeSelectCurrentProject } from '../../Projects/selectors'
import { DEFAULT_SPLITER } from 'app/globalConstants'
import { IWidgetFormed } from '../../Widget/types'
import { DeltaPosition } from '../components/types'

const SlideLayerList: React.FC = (props) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { id: projectId } = useSelector(makeSelectCurrentProject())
  const { id: displayId } = useSelector(makeSelectCurrentDisplay())
  const {
    config: { slideParams }
  } = useSelector(makeSelectCurrentSlide())
  const currentLayerIds = useSelector(makeSelectCurrentLayerIds())

  const currentDisplayWidgets = useSelector(makeSelectCurrentDisplayWidgets())
  const formedViews = useSelector(makeSelectFormedViews())

  const { scale } = useContext(ContainerContext)

  const editWidget = useCallback(
    (widgetId: number) => {
      const editSign = [projectId, displayId].join(DEFAULT_SPLITER)
      sessionStorage.setItem('editWidgetFromDisplay', editSign)
      history.push(`/project/${projectId}/widget/${widgetId}`)
    },
    [projectId, displayId]
  )

  const onDrag = useCallback(
    (layerId, deltaPosition: DeltaPosition, finish = false) => {
      if (!deltaPosition.deltaX && !deltaPosition.deltaY) {
        return
      }
      dispatch(
        DisplayActions.dragLayer(
          pick(slideParams, 'width', 'height'),
          scale[0],
          deltaPosition,
          finish,
          layerId
        )
      )
    },
    [slideParams, scale]
  )

  const onResize = useCallback(
    (layerId, deltaSize, finish = false) => {
      dispatch(
        DisplayActions.resizeLayer(
          pick(slideParams, 'width', 'height'),
          scale[0],
          layerId,
          deltaSize,
          finish
        )
      )
    },
    [slideParams, scale]
  )

  const onSelectionChange = useCallback((layerId, selected, exclusive) => {
    dispatch(DisplayActions.selectLayer(layerId, selected, exclusive))
  }, [])

  const getWidgetViewModel = useCallback(
    (viewId: number) => {
      const viewModel = formedViews[viewId].model
      return viewModel
    },
    [formedViews]
  )

  const getChartData = useCallback(
    (
      renderType: RenderType,
      slideId: number,
      layerId: number,
      widget: IWidgetFormed,
      prevQueryConditions: IQueryConditions,
      queryConditions?: IQueryConditions
    ) => {
      const requestParams = getRequestParamsByWidgetConfig(
        renderType,
        widget.config,
        prevQueryConditions,
        queryConditions
      )
      dispatch(
        ViewActions.loadViewDataFromVizItem(
          renderType,
          [slideId, layerId],
          widget.viewId,
          requestParams,
          'display',
          null
        )
      )
    },
    []
  )

  const layerListContextValue = useMemo<LayerListContextValue>(
    () => ({
      currentDisplayWidgets,
      editWidget,
      onDrag,
      onSelectionChange,
      onResize,
      getWidgetViewModel,
      getChartData
    }),
    [
      currentDisplayWidgets,
      editWidget,
      onDrag,
      onSelectionChange,
      onResize,
      getWidgetViewModel,
      getChartData
    ]
  )

  return (
    <LayerListContext.Provider value={layerListContextValue}>
      {currentLayerIds.map((id) => (
        <SlideLayer key={id} id={id}>
          <LayerItem />
        </SlideLayer>
      ))}
    </LayerListContext.Provider>
  )
}

export default React.memo(SlideLayerList)
