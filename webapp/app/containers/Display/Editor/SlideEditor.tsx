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

import React, { useEffect, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import html2canvas from 'html2canvas'
import pick from 'lodash/pick'

import {
  makeSelectCurrentDisplay,
  makeSelectCurrentSlide
} from 'containers/Viz/selectors'
import {
  makeSelectCurrentLayerList,
  makeSelectCurrentLayersOperationInfo,
  makeSelectCurrentSelectedLayerList
} from '../selectors'

import { DisplayActions } from '../actions'

import SplitPane from 'components/SplitPane'
import {
  DisplayContainer,
  DisplayBottom,
  SlideContainer,
  SlideBackground,
  SlideContent
} from '../components/Container'

import LayerList from '../components/Layer/List'
import SlideLayerList from './SlideLayerList'
import SlideBaselines from './SlideBaselines'
import { LayerOperations } from '../components/constants'
import { DeltaPosition } from '../components/types'
import { DragTriggerTypes } from '../constants'
import { ILayerOperationInfo } from 'app/containers/Display/components/types'
import { SecondaryGraphTypes } from 'app/containers/Display/components/Setting'

const SlideEditor: React.FC = () => {
  const dispatch = useDispatch()
  const {
    id: displayId,
    config: { displayParams }
  } = useSelector(makeSelectCurrentDisplay())
  const currentSlide = useSelector(makeSelectCurrentSlide())
  const currentLayerList = useSelector(makeSelectCurrentLayerList())
  const layersOperationInfo = useSelector(
    makeSelectCurrentLayersOperationInfo()
  )
  const currentSelectedLayerList = useSelector(
    makeSelectCurrentSelectedLayerList()
  )
  const {
    id: slideId,
    config: { slideParams }
  } = currentSlide

  useEffect(() => {
    dispatch(DisplayActions.loadSlideDetail(displayId, slideId))
  }, [displayId, slideId])

  useEffect(() => {
    const selectLayerLabel = currentSelectedLayerList.some((item) => SecondaryGraphTypes.Label === item.subType)
    if (!selectLayerLabel && currentSelectedLayerList.length > 0) {
      refBackground.current.focus()
    }
  }, [layersOperationInfo])

  const refContent = React.useRef<HTMLDivElement>(null)
  const refBackground =  React.useRef() as React.MutableRefObject<HTMLInputElement>
  const doLayerOperation = useCallback(
    (operation: LayerOperations) => {
      switch (operation) {
        case LayerOperations.Copy:
          dispatch(DisplayActions.copySlideLayers())
          break
        case LayerOperations.Paste:
          dispatch(DisplayActions.pasteSlideLayers())
          break
        case LayerOperations.Delete:
          dispatch(DisplayActions.deleteSlideLayers(displayId, slideId))
          break
        case LayerOperations.Undo:
          // @TODO
          break
        case LayerOperations.Redo:
          // @TODO
          break
      }
    },
    [displayId, slideId]
  )
  const changeLayersPosition = useCallback(
    (
      deltaPosition: DeltaPosition,
      scale: number,
      eventTrigger: DragTriggerTypes
    ) => {
      dispatch(
        DisplayActions.dragLayer(
          pick(slideParams, 'width', 'height'),
          scale,
          deltaPosition,
          eventTrigger,
          false
        )
      )
    },
    [slideParams]
  )

  const commandLayers = useCallback((operation) => {
    dispatch(DisplayActions.changeLayersStack(operation))
  }, [])
  const selectionChange = useCallback(
    (layerId: number, checked: boolean, exclusive: boolean) => {
      refBackground.current.focus()
      dispatch(DisplayActions.selectLayer(layerId, checked, exclusive))
    },
    []
  )
  const onLayerOperationInfoChange = useCallback((changedInfo: Pick<Partial<ILayerOperationInfo>, 'selected'| 'editing'>) => {
    dispatch(DisplayActions.clearLayersOperationInfo(changedInfo))
  }, [])
  const createCover = useCallback(() => {
    const { transform, transition } = refContent.current.style
    refContent.current.style.transform = ''
    refContent.current.style.transition = 'none'
    html2canvas(refContent.current, { useCORS: true }).then((canvas) => {
      canvas.toBlob((blob) => {
        dispatch(DisplayActions.uploadCurrentSlideCover(blob, currentSlide))
        refContent.current.style.transform = transform
        refContent.current.style.transition = transition
      })
    })
  }, [refContent.current, currentSlide])

  const grid = useMemo(() => displayParams && displayParams.grid, [
    displayParams
  ])

  return (
    <SplitPane
      className="display-layout-content"
      type="horizontal"
      initialSize={240}
      minSize={160}
      maxSize={480}
      invert
    >
      <DisplayContainer grid={grid}>
        <SlideContainer slideId={slideId} slideParams={slideParams}>
          <SlideBackground
            parentRef={refBackground}
            autoFit
            className="display-slide-background-grid"
            onChangeLayersPosition={changeLayersPosition}
            onDoLayerOperation={doLayerOperation}
            onRemoveLayerOperationInfo={onLayerOperationInfoChange}
          >
            <SlideContent ref={refContent}>
              <SlideLayerList />
              <SlideBaselines />
            </SlideContent>
          </SlideBackground>
        </SlideContainer>
        <DisplayBottom onCreateCover={createCover} />
      </DisplayContainer>
      <LayerList
        layers={currentLayerList}
        selection={layersOperationInfo}
        onCommand={commandLayers}
        onSelectionChange={selectionChange}
      />
    </SplitPane>
  )
}

export default SlideEditor
