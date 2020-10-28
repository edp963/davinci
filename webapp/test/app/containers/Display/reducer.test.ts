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

import produce from 'immer'
import reducer, { displayInitialState } from 'app/containers/Display/reducer'
import actions from 'app/containers/Display/actions'
import VizActions from 'app/containers/Viz/actions'
import { ActionTypes as VizActionTypes } from 'containers/Viz/constants'
import {
  mockDisplayId,
  mockSlideId,
  mockSlideList,
  mockHttpError,
  mockGraphLayerFormed,
  mockSlideLayersOperationInfo,
  mockWidgetFormed,
  mockPasswordToken,
  mockPassword,
  mockChangedOperationInfo,
  mockDeltaSize,
  mockFinish,
  mockSlideSize,
  mockDeltaPosition,
  mockSelected,
  mockExclusive,
  mockBaseLines,
  mockShareLinkParams,
  mockShareToken,
  mockAuthShareToken,
  mockDisplayTitle,
  mockFormedViews,
  mockCurrentDisplayWidgets,
  mockDefaultSlideLayersOperationGraphInfo,
  mockGraphLayerId,
  mockDisplayState,
  mockChartLayerId,
  mockSlideLayersInfoGraphSingle,
  mockSlideSingleGraphLayerFormed,
  defaultSharePanelState
} from './fixtures'
describe('displayReducer', () => {
  let state
  beforeEach(() => {
    state = mockDisplayState.display
  })

  it('should handle the editSlidesSuccess action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.lastOperationType = VizActionTypes.EDIT_SLIDES_SUCCESS
    })
    expect(
      reducer(state, VizActions.slidesEdited(mockDisplayId, mockSlideList))
    ).toEqual(expectedResult)
  })

  it('should handle the loadSlideDetail action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.loading.slideLayers = true
    })
    expect(
      reducer(state, actions.loadSlideDetail(mockDisplayId, mockSlideId))
    ).toEqual(expectedResult)
  })

  it('should handle the slideDetailLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.currentDisplayWidgets = mockCurrentDisplayWidgets
      draft.currentSlideId = mockSlideId
      draft.slideLayers[draft.currentSlideId] = mockSlideSingleGraphLayerFormed
      draft.slideLayersInfo = mockSlideLayersInfoGraphSingle
      draft.slideLayersOperationInfo[draft.currentSlideId] = mockDefaultSlideLayersOperationGraphInfo
    })
    expect(
      reducer(
        state,
        actions.slideDetailLoaded(
          mockSlideId,
          [mockGraphLayerFormed],
          [mockWidgetFormed],
          mockFormedViews
        )
      )
    ).toEqual(expectedResult)
  })

  it('should handle the loadSlideDetailFailure action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.loading.slideLayers = false
    })
    expect(reducer(state, actions.loadSlideDetailFail(mockHttpError))).toEqual(
      expectedResult
    )
  })

  it('should handle the slideLayersDeleted action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.lastOperationType = 'davinci/Display/DELETE_SLIDE_LAYERS_SUCCESS'
      draft.lastLayers = [draft.slideLayers[mockSlideId][mockGraphLayerId]]
      delete draft.slideLayers[mockSlideId][mockGraphLayerId]
      delete draft.slideLayersInfo[mockSlideId][mockGraphLayerId]
      delete draft.slideLayersOperationInfo[mockSlideId][mockGraphLayerId]
    })
    expect(
      reducer(
        state,
        actions.slideLayersDeleted(mockSlideId, [mockGraphLayerId])
      )
    ).toEqual(expectedResult)
  })

  it('should handle the displayPasswordShareLinkLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.currentDisplayPasswordShareToken = mockPasswordToken
      draft.currentDisplayPasswordPassword = mockPassword
      draft.loading.shareToken = false
    })
    expect(
      reducer(
        state,
        actions.displayPasswordShareLinkLoaded(mockPasswordToken, mockPassword)
      )
    ).toEqual(expectedResult)
  })

  it('should handle the slideLayersEdited action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.lastOperationType = 'davinci/Display/EDIT_SLIDE_LAYERS_SUCCESS'
      draft.lastLayers = [draft.slideLayers[mockSlideId][mockGraphLayerId]]
    })
    expect(
      reducer(
        state,
        actions.slideLayersEdited(mockSlideId, [mockGraphLayerFormed])
      )
    ).toEqual(expectedResult)
  })

  it('should handle the changeLayerOperationInfo action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.slideLayersOperationInfo = mockSlideLayersOperationInfo
    })
    expect(
      reducer(
        state,
        actions.changeLayerOperationInfo(mockGraphLayerId, mockChangedOperationInfo)
      )
    ).toEqual(expectedResult)
  })

  it('should handle the resizeLayerAdjusted action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.slideLayersOperationInfo[draft.currentSlideId][
        mockGraphLayerId
      ].resizing = false
    })
    expect(
      reducer(
        state,
        actions.resizeLayerAdjusted([mockGraphLayerId], mockDeltaSize, true)
      )
    ).toEqual(expectedResult)
  })

  it('should handle the dragLayerAdjusted action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.slideLayersOperationInfo[draft.currentSlideId][
        mockGraphLayerId
      ].dragging = false
    })
    expect(
      reducer(
        state,
        actions.dragLayerAdjusted(
          [mockChartLayerId],
          mockSlideSize,
          mockDeltaPosition,
          mockFinish
        )
      )
    ).toEqual(expectedResult)
  })

  it('should handle the selectLayer action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.slideLayersOperationInfo[draft.currentSlideId][mockGraphLayerId] = {
        dragging: false,
        editing: false,
        resizing: false,
        selected: true
      }
    })
    expect(
      reducer(
        state,
        actions.selectLayer(mockGraphLayerId, mockSelected, mockExclusive)
      )
    ).toEqual(expectedResult)
  })

  it('should handle the clearLayersOperationInfo action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.slideLayersOperationInfo = mockSlideLayersOperationInfo
    })
    expect(
      reducer(state, actions.clearLayersOperationInfo(mockChangedOperationInfo))
    ).toEqual(expectedResult)
  })

  it('should handle the clearEditorBaselines action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.editorBaselines = []
      draft.operateItemParams = []
      draft.slideLayersOperationInfo[draft.currentSlideId][
        mockGraphLayerId
      ].dragging = false
    })
    expect(reducer(state, actions.clearEditorBaselines())).toEqual(
      expectedResult
    )
  })

  it('should handle the showEditorBaselines action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.editorBaselines = [mockBaseLines]
    })
    expect(
      reducer(state, actions.showEditorBaselines([mockBaseLines]))
    ).toEqual(expectedResult)
  })

  it('should handle the slideLayersCopied action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.clipboardLayers = [mockGraphLayerFormed]
    })
    expect(
      reducer(state, actions.slideLayersCopied([mockGraphLayerFormed]))
    ).toEqual(expectedResult)
  })

  it('should handle the loadDisplayShareLink action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.loading.shareToken = true
      draft.currentDisplayAuthorizedShareToken = ''
    })
    expect(
      reducer(state, actions.loadDisplayShareLink(mockShareLinkParams))
    ).toEqual(expectedResult)
  })

  it('should handle the loadDisplayShareLink action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.loading.shareToken = true
      draft.currentDisplayAuthorizedShareToken = ''
    })
    expect(
      reducer(state, actions.loadDisplayShareLink(mockShareLinkParams))
    ).toEqual(expectedResult)
  })

  it('should handle the displayShareLinkLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.currentDisplayShareToken = mockShareToken
      draft.loading.shareToken = false
    })
    expect(
      reducer(state, actions.displayShareLinkLoaded(mockShareToken))
    ).toEqual(expectedResult)
  })
  it('should handle the displayAuthorizedShareLinkLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.currentDisplayAuthorizedShareToken = mockAuthShareToken
      draft.loading.shareToken = false
    })
    expect(
      reducer(
        state,
        actions.displayAuthorizedShareLinkLoaded(mockAuthShareToken)
      )
    ).toEqual(expectedResult)
  })

  it('should handle the loadDisplayShareLinkFail action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.loading.shareToken = false
    })
    expect(reducer(state, actions.loadDisplayShareLinkFail())).toEqual(
      expectedResult
    )
  })
  it('should handle the openSharePanel action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.sharePanel = {
        id: mockDisplayId,
        type: 'display',
        title: mockDisplayTitle,
        visible: true
      }
    })
    expect(
      reducer(state, actions.openSharePanel(mockDisplayId, mockDisplayTitle))
    ).toEqual(expectedResult)
  })
  it('should handle the closeSharePanel action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.sharePanel = defaultSharePanelState
    })
    expect(reducer(state, actions.closeSharePanel())).toEqual(expectedResult)
  })

  it('should handle the resetDisplayState action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      return displayInitialState
    })
    expect(reducer(state, actions.resetDisplayState())).toEqual(expectedResult)
  })
})
