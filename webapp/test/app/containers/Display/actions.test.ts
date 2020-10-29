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

import { ActionTypes } from 'app/containers/Display/constants'
import actions from 'app/containers/Display/actions'
import {
  mockDisplayId,
  mockSlideId,
  mockGraphLayerFormed,
  mockWidgetFormed,
  mockFormedViews,
  mockHttpError,
  mockCover,
  mockSlide,
  mockSlideCoverUploadImgSrc,
  mockSlideSize,
  mockLayerScale,
  mockGraphLayerId,
  mockDeltaSize,
  mockFinish,
  mockDeltaPosition,
  mockEventTrigger,
  mockOperation,
  mockAlignmentType,
  mockSelected,
  mockExclusive,
  mockChangedOperationInfo,
  mockBaseLines,
  mockLayerParamsUnChanged,
  mockChangedParams,
  mockShareLinkParams,
  mockShareToken,
  mockAuthShareToken,
  mockPasswordToken,
  mockPassword,
  mockDisplayTitle
} from './fixtures'

describe('Display Actions', () => {
  describe('loadSlideDetail', () => {
    it('should return the correct type and passed displayId', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_SLIDE_DETAIL,
        payload: {
          displayId: mockDisplayId,
          slideId: mockSlideId
        }
      }
      expect(actions.loadSlideDetail(mockDisplayId, mockSlideId)).toEqual(
        expectedResult
      )
    })
  })

  describe('slideDetailLoaded', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_SLIDE_DETAIL_SUCCESS,
        payload: {
          slideId: mockSlideId,
          layers: [mockGraphLayerFormed],
          widgets: [mockWidgetFormed],
          formedViews: mockFormedViews
        }
      }
      expect(
        actions.slideDetailLoaded(
          mockSlideId,
          [mockGraphLayerFormed],
          [mockWidgetFormed],
          mockFormedViews
        )
      ).toEqual(expectedResult)
    })
  })

  describe('loadSlideDetailFail', () => {
    it('should return the correct type and error', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_SLIDE_DETAIL_FAILURE,
        payload: {
          err: mockHttpError
        }
      }
      expect(actions.loadSlideDetailFail(mockHttpError)).toEqual(expectedResult)
    })
  })

  describe('uploadCurrentSlideCover', () => {
    it('should return the correct type and right cover, slide', () => {
      const expectedResult = {
        type: ActionTypes.UPLOAD_CURRENT_SLIDE_COVER,
        payload: {
          cover: mockCover,
          slide: mockSlide
        }
      }
      expect(actions.uploadCurrentSlideCover(mockCover, mockSlide)).toEqual(
        expectedResult
      )
    })
  })

  describe('currentSlideCoverUploaded', () => {
    it('should return the correct type and passed result', () => {
      const expectedResult = {
        type: ActionTypes.UPLOAD_CURRENT_SLIDE_COVER_SUCCESS,
        payload: {
          result: mockSlideCoverUploadImgSrc
        }
      }
      expect(
        actions.currentSlideCoverUploaded(mockSlideCoverUploadImgSrc)
      ).toEqual(expectedResult)
    })
  })

  describe('uploadCurrentSlideCoverFail', () => {
    it('should return the correct type and throw err', () => {
      const expectedResult = {
        type: ActionTypes.UPLOAD_CURRENT_SLIDE_COVER_FAILURE,
        payload: {
          error: mockHttpError
        }
      }
      expect(actions.uploadCurrentSlideCoverFail(mockHttpError)).toEqual(
        expectedResult
      )
    })
  })

  describe('resizeLayer', () => {
    it('should return the correct type and resize params', () => {
      const expectedResult = {
        type: ActionTypes.RESIZE_LAYER,
        payload: {
          slideSize: mockSlideSize,
          scale: mockLayerScale,
          layerId: mockGraphLayerId,
          deltaSize: mockDeltaSize,
          finish: mockFinish
        }
      }
      expect(
        actions.resizeLayer(
          mockSlideSize,
          mockLayerScale,
          mockGraphLayerId,
          mockDeltaSize,
          mockFinish
        )
      ).toEqual(expectedResult)
    })
  })

  describe('resizeLayerAdjusted', () => {
    it('should return the correct type and passed deltaSize', () => {
      const expectedResult = {
        type: ActionTypes.RESIZE_LAYER_ADJUSTED,
        payload: {
          layerIds: [mockGraphLayerId],
          deltaSize: mockDeltaSize,
          finish: mockFinish
        }
      }
      expect(
        actions.resizeLayerAdjusted([mockGraphLayerId], mockDeltaSize, mockFinish)
      ).toEqual(expectedResult)
    })
  })

  describe('dragLayer', () => {
    it('should return the correct type and drag params', () => {
      const expectedResult = {
        type: ActionTypes.DRAG_LAYER,
        payload: {
          slideSize: mockSlideSize,
          scale: mockLayerScale,
          layerId: mockGraphLayerId,
          deltaPosition: mockDeltaPosition,
          eventTrigger: mockEventTrigger,
          finish: mockFinish
        }
      }
      expect(
        actions.dragLayer(
          mockSlideSize,
          mockLayerScale,
          mockDeltaPosition,
          mockEventTrigger,
          mockFinish,
          mockGraphLayerId
        )
      ).toEqual(expectedResult)
    })
  })

  describe('dragLayerAdjusted', () => {
    it('should return the correct type and drag params', () => {
      const expectedResult = {
        type: ActionTypes.DRAG_LAYER_ADJUSTED,
        payload: {
          layerIds: [mockGraphLayerId],
          slideSize: mockSlideSize,
          deltaPosition: mockDeltaPosition,
          finish: mockFinish
        }
      }
      expect(
        actions.dragLayerAdjusted(
          [mockGraphLayerId],
          mockSlideSize,
          mockDeltaPosition,
          mockFinish
        )
      ).toEqual(expectedResult)
    })
  })

  describe('changeLayersStack', () => {
    it('should return the correct type and passed operation', () => {
      const expectedResult = {
        type: ActionTypes.CHANGE_LAYERS_STACK,
        payload: {
          operation: mockOperation
        }
      }
      expect(actions.changeLayersStack(mockOperation)).toEqual(expectedResult)
    })
  })

  describe('setLayersAlignment', () => {
    it('should return the correct type and passed alignmentType', () => {
      const expectedResult = {
        type: ActionTypes.SET_LAYERS_ALIGNMENT,
        payload: {
          alignmentType: mockAlignmentType
        }
      }
      expect(actions.setLayersAlignment(mockAlignmentType)).toEqual(
        expectedResult
      )
    })
  })

  describe('selectLayer', () => {
    it('should return the correct type and passed layer status', () => {
      const expectedResult = {
        type: ActionTypes.SELECT_LAYER,
        payload: {
          layerId: mockGraphLayerId,
          selected: mockSelected,
          exclusive: mockExclusive
        }
      }
      expect(
        actions.selectLayer(mockGraphLayerId, mockSelected, mockExclusive)
      ).toEqual(expectedResult)
    })
  })

  describe('clearLayersOperationInfo', () => {
    it('should return the correct type and passed changedInfo', () => {
      const expectedResult = {
        type: ActionTypes.CLEAR_LAYERS_OPERATION_INFO,
        payload: {
          changedInfo: mockChangedOperationInfo
        }
      }
      expect(actions.clearLayersOperationInfo(mockChangedOperationInfo)).toEqual(
        expectedResult
      )
    })
  })

  describe('clearEditorBaselines', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.CLEAR_EDITOR_BASELINES,
        payload: {}
      }
      expect(actions.clearEditorBaselines()).toEqual(expectedResult)
    })
  })

  describe('showEditorBaselines', () => {
    it('should return the correct type and baselines', () => {
      const expectedResult = {
        type: ActionTypes.SHOW_EDITOR_BASELINES,
        payload: {
          baselines: [mockBaseLines]
        }
      }
      expect(actions.showEditorBaselines([mockBaseLines])).toEqual(expectedResult)
    })
  })

  describe('copySlideLayers', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.COPY_SLIDE_LAYERS,
        payload: {}
      }
      expect(actions.copySlideLayers()).toEqual(expectedResult)
    })
  })

  describe('slideLayersCopied', () => {
    it('should return the correct type and layer', () => {
      const expectedResult = {
        type: ActionTypes.COPY_SLIDE_LAYERS_SUCCESS,
        payload: {
          layers: [mockGraphLayerFormed]
        }
      }
      expect(actions.slideLayersCopied([mockGraphLayerFormed])).toEqual(expectedResult)
    })
  })

  describe('pasteSlideLayers', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.PASTE_SLIDE_LAYERS,
        payload: {}
      }
      expect(actions.pasteSlideLayers()).toEqual(expectedResult)
    })
  })

  describe('addSlideLayers', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_SLIDE_LAYERS,
        payload: {
          displayId: mockDisplayId,
          slideId: mockSlideId,
          layers: [mockGraphLayerFormed],
          widgets: [mockWidgetFormed]
        }
      }
      expect(
        actions.addSlideLayers(
          mockDisplayId,
          mockSlideId,
          [mockGraphLayerFormed],
          [mockWidgetFormed]
        )
      ).toEqual(expectedResult)
    })
  })

  describe('slideLayersAdded', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_SLIDE_LAYERS_SUCCESS,
        payload: {
          slideId: mockSlideId,
          layers: [mockGraphLayerFormed],
          widgets: [mockWidgetFormed]
        }
      }
      expect(
        actions.slideLayersAdded(mockSlideId, [mockGraphLayerFormed], [mockWidgetFormed])
      ).toEqual(expectedResult)
    })
  })

  describe('addSlideLayersFail', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_SLIDE_LAYERS_FAILURE,
        payload: {}
      }
      expect(actions.addSlideLayersFail()).toEqual(expectedResult)
    })
  })

  describe('editSlideLayers', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EDIT_SLIDE_LAYERS,
        payload: {
          displayId: mockDisplayId,
          slideId: mockSlideId,
          layers: [mockGraphLayerFormed],
          layerParamsUnChanged: mockLayerParamsUnChanged
        }
      }
      expect(
        actions.editSlideLayers(
          mockDisplayId,
          mockSlideId,
          [mockGraphLayerFormed],
          mockLayerParamsUnChanged
        )
      ).toEqual(expectedResult)
    })
  })

  describe('slideLayersEdited', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EDIT_SLIDE_LAYERS_SUCCESS,
        payload: {
          slideId: mockSlideId,
          layers: [mockGraphLayerFormed]
        }
      }
      expect(actions.slideLayersEdited(mockSlideId, [mockGraphLayerFormed])).toEqual(
        expectedResult
      )
    })
  })

  describe('editSlideLayersFail', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EDIT_SLIDE_LAYERS_FAILURE,
        payload: {}
      }
      expect(actions.editSlideLayersFail()).toEqual(expectedResult)
    })
  })

  describe('editSlideLayerParams', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EDIT_SLIDE_LAYER_PARAMS,
        payload: {
          layerId: mockGraphLayerId,
          changedParams: mockChangedParams
        }
      }
      expect(
        actions.editSlideLayerParams(mockGraphLayerId, mockChangedParams)
      ).toEqual(expectedResult)
    })
  })

  describe('deleteSlideLayers', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_SLIDE_LAYERS,
        payload: {
          displayId: mockDisplayId,
          slideId: mockSlideId
        }
      }
      expect(actions.deleteSlideLayers(mockDisplayId, mockSlideId)).toEqual(
        expectedResult
      )
    })
  })

  describe('changeLayerOperationInfo', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.CHANGE_LAYER_OPERATION_INFO,
        payload: {
          layerId: mockGraphLayerId,
          changedInfo: mockChangedOperationInfo
        }
      }
      expect(
        actions.changeLayerOperationInfo(mockGraphLayerId, mockChangedOperationInfo)
      ).toEqual(expectedResult)
    })
  })

  describe('slideLayersDeleted', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_SLIDE_LAYERS_SUCCESS,
        payload: {
          slideId: mockSlideId,
          layerIds: [mockGraphLayerId]
        }
      }
      expect(actions.slideLayersDeleted(mockSlideId, [mockGraphLayerId])).toEqual(
        expectedResult
      )
    })
  })

  describe('deleteSlideLayersFail', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_SLIDE_LAYERS_FAILURE,
        payload: {}
      }
      expect(actions.deleteSlideLayersFail()).toEqual(expectedResult)
    })
  })

  describe('loadDisplayShareLink', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_DISPLAY_SHARE_LINK,
        payload: {
          params: mockShareLinkParams
        }
      }
      expect(actions.loadDisplayShareLink(mockShareLinkParams)).toEqual(
        expectedResult
      )
    })
  })

  describe('displayShareLinkLoaded', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_DISPLAY_SHARE_LINK_SUCCESS,
        payload: {
          shareToken: mockShareToken
        }
      }
      expect(actions.displayShareLinkLoaded(mockShareToken)).toEqual(
        expectedResult
      )
    })
  })

  describe('displayAuthorizedShareLinkLoaded', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_DISPLAY_AUTHORIZED_SHARE_LINK_SUCCESS,
        payload: {
          authorizedShareToken: mockAuthShareToken
        }
      }
      expect(
        actions.displayAuthorizedShareLinkLoaded(mockAuthShareToken)
      ).toEqual(expectedResult)
    })
  })

  describe('displayPasswordShareLinkLoaded', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_DISPLAY_PASSWORD_SHARE_LINK_SUCCESS,
        payload: {
          passwordShareToken: mockPasswordToken,
          password: mockPassword
        }
      }
      expect(
        actions.displayPasswordShareLinkLoaded(mockPasswordToken, mockPassword)
      ).toEqual(expectedResult)
    })
  })

  describe('loadDisplayShareLinkFail', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_DISPLAY_SHARE_LINK_FAILURE,
        payload: {}
      }
      expect(actions.loadDisplayShareLinkFail()).toEqual(expectedResult)
    })
  })

  describe('openSharePanel', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.OPEN_SHARE_PANEL,
        payload: {
          id: mockDisplayId,
          title: mockDisplayTitle
        }
      }
      expect(actions.openSharePanel(mockDisplayId, mockDisplayTitle)).toEqual(
        expectedResult
      )
    })
  })

  describe('closeSharePanel', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.CLOSE_SHARE_PANEL
      }
      expect(actions.closeSharePanel()).toEqual(expectedResult)
    })
  })

  describe('resetDisplayState', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.RESET_DISPLAY_STATE,
        payload: {}
      }
      expect(actions.resetDisplayState()).toEqual(expectedResult)
    })
  })

  describe('monitoredSyncDataAction', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.MONITORED_SYNC_DATA_ACTION,
        payload: {}
      }
      expect(actions.monitoredSyncDataAction()).toEqual(expectedResult)
    })
  })

  describe('monitoredSearchDataAction', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.MONITORED_SEARCH_DATA_ACTION,
        payload: {}
      }
      expect(actions.monitoredSearchDataAction()).toEqual(expectedResult)
    })
  })

  describe('monitoredLinkageDataAction', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.MONITORED_LINKAGE_DATA_ACTION,
        payload: {}
      }
      expect(actions.monitoredLinkageDataAction()).toEqual(expectedResult)
    })
  })
})
