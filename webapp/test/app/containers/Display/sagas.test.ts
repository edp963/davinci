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

import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import request from 'app/utils/request'
import actions from 'app/containers/Display/actions'
import VizActions from 'app/containers/Viz/actions'
import {
  getSlideDetail,
  uploadCurrentSlideCover,
  addSlideLayers,
  editSlideLayers,
  editSlideLayerParams,
  deleteSlideLayers,
  resizeLayer,
  copySlideLayers,
  pasteSlideLayers,
  changeLayersStack,
  updateLayersAlignment,
  getDisplayShareLink
} from 'app/containers/Display/sagas'
import {
  mockDisplayId,
  mockSlideId,
  mockSlideDetail,
  mockGraphLayerFormed,
  mockWidgetFormed,
  mockCover,
  mockSlide,
  mockSlideCoverUploadImgSrc,
  mockGraphLayerId,
  mockViewItem,
  mockLayerParamsUnChanged,
  mockChangedParams,
  mockSlideSize,
  mockLayerScale,
  mockDeltaPosition,
  mockEventTrigger,
  mockFinish,
  mockDeltaSize,
  mockOperation,
  mockAlignmentType,
  mockAuthShareToken,
  mockShareLinkParams,
  mockShareTokenReq,
  mockDisplayDefaultState,
  mockDisplayState,
  mockVizState,
  mockViewState
} from './fixtures'
import { getMockResponse } from 'test/utils/fixtures'

describe('getSlideDetail Saga', () => {
  it('should dispatch the slideDetailLoaded action if it requests the data successfully', () => {
    return expectSaga(
      getSlideDetail,
      actions.loadSlideDetail(mockDisplayId, mockSlideId)
    )
      .withState(mockDisplayState)
      .provide([[matchers.call.fn(request), getMockResponse(mockSlideDetail)]])
      .dispatch(
        actions.slideDetailLoaded(
          mockSlideId,
          [mockGraphLayerFormed],
          [mockWidgetFormed],
          {[mockWidgetFormed.viewId]: {
            ...mockViewItem,
            model: {},
            variable: []
          }}
        )
      )
      .run()
  })

  it('should call the loadSlideDetailFail action if the response errors', () => {
    const errors = new Error('error')
    return expectSaga(
      getSlideDetail,
      actions.loadSlideDetail(mockDisplayId, mockSlideId)
    )
      .withState(mockDisplayState)
      .provide([[matchers.call.fn(request), throwError(errors)]])
      .dispatch(actions.loadSlideDetailFail(errors))
      .run()
  })
})

describe('uploadCurrentSlideCover saga', () => {
  it('should call the currentSlideCoverUploaded action if it requests the data successfully', () => {
    return expectSaga(
      uploadCurrentSlideCover,
      actions.uploadCurrentSlideCover(mockCover, mockSlide)
    )
      .provide([
        [matchers.call.fn(request), getMockResponse(mockSlideCoverUploadImgSrc)]
      ])
      .dispatch(actions.currentSlideCoverUploaded(mockSlideCoverUploadImgSrc))
      .dispatch(VizActions.editSlides([mockSlide]))
      .run()
  })

  it('should call the uploadCurrentSlideCoverFail action if the response errors', () => {
    const errors = new Error('error')
    return expectSaga(
      uploadCurrentSlideCover,
      actions.uploadCurrentSlideCover(mockCover, mockSlide)
    )
      .provide([[matchers.call.fn(request), throwError(errors)]])
      .dispatch(actions.uploadCurrentSlideCoverFail(errors))
      .run()
  })
})

describe('addSlideLayers saga', () => {
  it('should call the slideLayersAdded action if it requests the data successfully', () => {
    return expectSaga(
      addSlideLayers,
      actions.addSlideLayers(
        mockDisplayId,
        mockSlideId,
        [mockGraphLayerFormed],
        [mockWidgetFormed]
      )
    )
      .withState(mockViewState)
      .provide([
        [matchers.call.fn(request), getMockResponse([mockGraphLayerFormed])]
      ])
      .dispatch(
        actions.slideLayersAdded(
          mockSlideId,
          [mockGraphLayerFormed],
          [mockWidgetFormed]
        )
      )
      .run()
  })

  it('should call the addSlideLayersFail action if the response errors', () => {
    const errors = new Error('error')
    return expectSaga(
      addSlideLayers,
      actions.addSlideLayers(
        mockDisplayId,
        mockSlideId,
        [mockGraphLayerFormed],
        [mockWidgetFormed]
      )
    )
      .withState(mockViewState)
      .provide([[matchers.call.fn(request), throwError(errors)]])
      .dispatch(actions.addSlideLayersFail())
      .run()
  })
})

describe('editSlideLayers saga', () => {
  it('should call the slideLayersEdited action if it requests the data successfully', () => {
    return expectSaga(
      editSlideLayers,
      actions.editSlideLayers(
        mockDisplayId,
        mockSlideId,
        [mockGraphLayerFormed],
        mockLayerParamsUnChanged
      )
    )
      .dispatch(actions.slideLayersEdited(mockSlideId, [mockGraphLayerFormed]))
      .run()
  })

  it('should call the editSlideLayersFail action if the response errors', () => {
    return expectSaga(
      editSlideLayers,
      actions.editSlideLayers(
        mockDisplayId,
        mockSlideId,
        [mockGraphLayerFormed],
        mockLayerParamsUnChanged
      )
    )
      .dispatch(actions.editSlideLayersFail())
      .run()
  })
})

describe('editSlideLayerParams saga', () => {
  it('should call the editSlideLayers action if it requests the data successfully', () => {
    return expectSaga(
      editSlideLayerParams,
      actions.editSlideLayerParams(mockGraphLayerId, mockChangedParams)
    )
      .withState(mockDisplayState)
      .withState(mockVizState)
      .dispatch(
        actions.editSlideLayers(
          mockDisplayId,
          mockSlideId,
          [mockGraphLayerFormed],
          mockLayerParamsUnChanged
        )
      )
      .run()
  })
})

describe('deleteSlideLayers saga', () => {
  it('should call the slideLayersDeleted action if it requests the data successfully', () => {
    return expectSaga(
      deleteSlideLayers,
      actions.deleteSlideLayers(mockDisplayId, mockSlideId)
    )
      .withState(mockDisplayState)
      .provide([[matchers.call.fn(request), getMockResponse({})]])
      .dispatch(actions.slideLayersDeleted(mockSlideId, [mockGraphLayerId]))
      .run()
  })

  it('should call the slideLayersDeleted action if the response errors', () => {
    const errors = new Error('error')
    return expectSaga(
      deleteSlideLayers,
      actions.deleteSlideLayers(mockDisplayId, mockSlideId)
    )
      .withState(mockDisplayState)
      .provide([[matchers.call.fn(request), throwError(errors)]])
      .dispatch(actions.deleteSlideLayersFail())
      .run()
  })
})

describe('resizeLayer saga', () => {
  it('should call the resizeLayerAdjusted action if it requests the data successfully', () => {
    return expectSaga(
      resizeLayer,
      actions.dragLayer(
        mockSlideSize,
        mockLayerScale,
        mockDeltaPosition,
        mockEventTrigger,
        mockFinish,
        mockGraphLayerId
      )
    )
    .withState(mockDisplayState)
      .dispatch(
        actions.resizeLayerAdjusted([mockGraphLayerId], mockDeltaSize, mockFinish)
      )
      .run()
  })
})

describe('copySlideLayers saga', () => {
  it('should call the slideLayersCopied action if it requests the data successfully', () => {
    return expectSaga(copySlideLayers, actions.copySlideLayers())
      .withState(mockDisplayState)
      .dispatch(actions.slideLayersCopied([mockGraphLayerFormed]))
      .run()
  })
})

describe('pasteSlideLayers saga', () => {
  it('should call the addSlideLayers action if it requests the data successfully', () => {
    return expectSaga(pasteSlideLayers, actions.pasteSlideLayers())
      .withState(mockDisplayState)
      .dispatch(
        actions.addSlideLayers(mockDisplayId, mockSlideId, [mockGraphLayerFormed])
      )
      .run()
  })
})

describe('changeLayersStack saga', () => {
  it('should call the editSlideLayers action if it requests the data successfully', () => {
    return expectSaga(
      changeLayersStack,
      actions.changeLayersStack(mockOperation)
    )
      .withState(mockDisplayState)
      .dispatch(
        actions.editSlideLayers(mockDisplayId, mockSlideId, [mockGraphLayerFormed])
      )
      .run()
  })
})

describe('updateLayersAlignment saga', () => {
  it('should call the editSlideLayers action if it requests the data successfully', () => {
    return expectSaga(
      updateLayersAlignment,
      actions.setLayersAlignment(mockAlignmentType)
    )
      .withState(mockDisplayState)
      .dispatch(
        actions.editSlideLayers(
          mockDisplayId,
          mockSlideId,
          [mockGraphLayerFormed],
          mockLayerParamsUnChanged
        )
      )
      .run()
  })
})

describe('getDisplayShareLink saga', () => {
  it('should call the displayAuthorizedShareLinkLoaded action if it requests the data successfully', () => {
    return expectSaga(
      getDisplayShareLink,
      actions.loadDisplayShareLink(mockShareLinkParams)
    )
      .provide([
        [matchers.call.fn(request), getMockResponse(mockShareTokenReq)]
      ])
      .dispatch(actions.displayAuthorizedShareLinkLoaded(mockAuthShareToken))
      .run()
  })

  it('should call the loadDisplayShareLinkFail action if the response errors', () => {
    const errors = new Error('error')
    return expectSaga(
      getDisplayShareLink,
      actions.loadDisplayShareLink(mockShareLinkParams)
    )
      .provide([[matchers.call.fn(request), throwError(errors)]])
      .put(actions.loadDisplayShareLinkFail())
      .run()
  })
})
