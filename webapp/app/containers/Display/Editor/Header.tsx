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

import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import widgetReducer from 'containers/Widget/reducer'
import widgetSaga from 'containers/Widget/sagas'
import { useInjectReducer } from 'utils/injectReducer'
import { useInjectSaga } from 'utils/injectSaga'

import { VizActions } from 'containers/Viz/actions'
import { WidgetActions } from 'containers/Widget/actions'
import {
  makeSelectCurrentDisplay,
  makeSelectCurrentSlide
} from 'containers/Viz/selectors'
import { makeSelectWidgets } from 'containers/Widget/selectors'
import { makeSelectCurrentProject } from 'containers/Projects/selectors'

import { GRID_ITEM_MARGIN } from 'app/globalConstants'
import { uuid } from 'utils/util'
import { IWidgetRaw, IWidgetFormed } from 'containers/Widget/types'
import { GraphTypes, SecondaryGraphTypes, LayerOperations } from '../components/constants'
import { getDefaultLayerSetting } from '../components/util'
import { PollingSetting } from 'containers/Viz/components/PollingConfig'

import Toolbar, {
  Slide,
  Setting,
  Chart,
  OperationBar,
  Preview,
  Share
} from '../components/Toolbar'
import { DisplaySettingModal } from '../components/Setting'
import WidgetSelectModal from 'containers/Viz/components/WidgetSelectModal'

import useProjectPermission from 'containers/Projects/hooks/projectPermission'
import {
  makeSelectCurrentLayersMaxIndex,
  makeSelectDisplayLoading,
  makeSelectCurrentDisplayShareInfo,
  makeSelectCurrentDisplaySecretInfo
} from '../selectors'
import { ILayerFormed } from '../components/types'
import { slideSettings } from '../components/constants'
import DisplayActions from '../actions'
import { LocationDescriptorObject } from 'history'
import SharePanel from 'components/SharePanel'

const Header: React.FC = () => {
  const dispatch = useDispatch()
  useInjectReducer({ key: 'widget', reducer: widgetReducer })
  useInjectSaga({ key: 'widget', saga: widgetSaga })

  const currentDisplay = useSelector(makeSelectCurrentDisplay())
  const {
    id: currentDisplayId,
    config: { displayParams }
  } = currentDisplay
  const {
    id: slideId,
    config: {
      slideParams: { width: slideWidth, height: slideHeight }
    }
  } = useSelector(makeSelectCurrentSlide())
  const maxLayerIndex = useSelector(makeSelectCurrentLayersMaxIndex())

  const widgets = useSelector(makeSelectWidgets())
  const { id: projectId } = useSelector(makeSelectCurrentProject())

  const [widgetSelectModalVisible, setWidgetSelectModalVisible] = useState(
    false
  )
  const closeWidgetSelectModal = useCallback(() => {
    setWidgetSelectModalVisible(false)
  }, [])

  const [displaySettingModalVisible, setDisplaySettingModalVisible] = useState(
    false
  )
  const saveDisplayParams = useCallback((params) => {
    dispatch(
      VizActions.editDisplay({
        ...currentDisplay,
        config: {
          ...currentDisplay.config,
          displayParams: params
        }
      }, () => {
        setDisplaySettingModalVisible(false)
      })
    )
  }, [])
  const openDisplaySettingModal = useCallback(() => {
    setDisplaySettingModalVisible(true)
  }, [])
  const closeDisplaySettingModal = useCallback(() => {
    setDisplaySettingModalVisible(false)
  }, [])

  const [
    AuthorizedSlide,
    AuthorizedSetting,
    AuthorizedChart,
    AuthorizedPreview
  ] = useProjectPermission([Slide, Setting, Chart, Preview], 'vizPermission')
  const AuthorizedOperationBar = useProjectPermission(
    OperationBar,
    'vizPermission',
    true
  )
  const AuthorizedShare = useProjectPermission(Share, 'sharePermission')

  const addGraph = useCallback(
    (type: GraphTypes, subType?: SecondaryGraphTypes) => {
      switch (type) {
        case GraphTypes.Slide:
          dispatch(VizActions.addSlide())
          break
        case GraphTypes.Chart:
          dispatch(WidgetActions.loadWidgets(projectId))
          setWidgetSelectModalVisible(true)
          break
        case GraphTypes.Secondary:
          dispatch(
            DisplayActions.addSlideLayers(currentDisplayId, slideId, [
              {
                displaySlideId: slideId,
                index: maxLayerIndex + 1,
                name: `${slideSettings[subType].title}_${uuid(5)}`,
                type: GraphTypes.Secondary,
                subType,
                params: {
                  ...getDefaultLayerSetting(GraphTypes.Secondary, subType),
                  positionX: GRID_ITEM_MARGIN,
                  positionY: GRID_ITEM_MARGIN
                }
              }
            ])
          )
          break
      }
    },
    [projectId, currentDisplayId, slideId, maxLayerIndex, widgets]
  )

  const addWidgetGraph = (
    selectedWidgets: IWidgetRaw[],
    pollingSetting: PollingSetting
  ) => {
    const { polling, frequency } = pollingSetting
    const newLayers = selectedWidgets.map<Omit<ILayerFormed, 'id'>>(
      ({ id, name }, idx) => ({
        displaySlideId: slideId,
        index: maxLayerIndex + idx + 1,
        widgetId: id,
        name,
        type: GraphTypes.Chart,
        params: {
          ...getDefaultLayerSetting(GraphTypes.Chart),
          width: (slideWidth - GRID_ITEM_MARGIN * 5) / 4,
          height: (slideHeight - GRID_ITEM_MARGIN * 5) / 4,
          positionX: Math.min(GRID_ITEM_MARGIN * (idx + 1), slideWidth),
          positionY: Math.min(GRID_ITEM_MARGIN * (idx + 1), slideHeight),
          polling,
          frequency
        }
      })
    )
    const widgets = selectedWidgets.map<IWidgetFormed>((w) => ({
      ...w,
      config: JSON.parse(w.config)
    }))
    dispatch(
      DisplayActions.addSlideLayers(
        currentDisplayId,
        slideId,
        newLayers,
        widgets
      )
    )
    setWidgetSelectModalVisible(false)
  }

  const operateLayers = useCallback((operation: LayerOperations) => {
    switch(operation) {
      case LayerOperations.Copy:
        dispatch(DisplayActions.copySlideLayers())
        break
      case LayerOperations.Paste:
        dispatch(DisplayActions.pasteSlideLayers())
        break
    }
  }, [])

  const history = useHistory()
  const preview = useCallback(() => {
    const location: LocationDescriptorObject = {
      pathname: `/project/${projectId}/display/${currentDisplayId}/preview/slide/${slideId}`
    }

    const link = document.createElement('a')
    link.href = history.createHref(location)
    link.target = '_blank'
    link.click()
  }, [projectId, currentDisplayId, slideId])

  const shareInfo = useSelector(makeSelectCurrentDisplayShareInfo())
  const secretInfo = useSelector(makeSelectCurrentDisplaySecretInfo())
  const { shareInfo: shareInfoLoading } = useSelector(
    makeSelectDisplayLoading()
  )
  const [hasAuthorized, setHasAuthorized] = useState(false)
  const afterAuthorization = useCallback(() => {
    setHasAuthorized(true)
  }, [])
  const loadDisplayShareLink = useCallback((id: number, authName: string) => {
    dispatch(DisplayActions.loadDisplayShareLink(id, authName))
  }, [])

  return (
    <>
      <Toolbar>
        <AuthorizedSlide onAdd={addGraph} />
        <AuthorizedSetting onSetting={openDisplaySettingModal} />
        <AuthorizedChart onAdd={addGraph} />
        <AuthorizedOperationBar onOperate={operateLayers} />
        <AuthorizedPreview onPreview={preview} />
        <AuthorizedShare
          panel={
            <SharePanel
              id={currentDisplayId}
              type="display"
              shareInfo={shareInfo}
              secretInfo={secretInfo}
              shareInfoLoading={shareInfoLoading}
              authorized={hasAuthorized}
              afterAuthorization={afterAuthorization}
              onLoadDisplayShareLink={loadDisplayShareLink}
            />
          }
        />
      </Toolbar>
      <DisplaySettingModal
        visible={displaySettingModalVisible}
        displayParams={displayParams}
        onOk={saveDisplayParams}
        onCancel={closeDisplaySettingModal}
      />
      <WidgetSelectModal
        visible={widgetSelectModalVisible}
        multiple
        loading={false}
        widgets={widgets}
        onOk={addWidgetGraph}
        onCancel={closeWidgetSelectModal}
      />
    </>
  )
}

export default Header
