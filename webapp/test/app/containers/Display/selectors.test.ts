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

import {
  selectDisplay,
  makeSelectCurrentLayersOperationInfo,
  makeSelectLayersBySlide,
  makeSelectLayerIdsBySlide,
  makeSelectCurrentLayerList,
  selectCurrentLayers,
  makeSelectCurrentLayerIds,
  makeSelectSlideLayerContextValue,
  makeSelectCurrentLayersMaxIndex,
  makeSelectCurrentSelectedLayerList,
  makeSelectCurrentEditLayerOperationInfo,
  makeSelectCurrentSelectedLayerIds,
  makeSelectCurrentOperatingLayerList,
  makeSelectCurrentOtherLayerList,
  makeSelectCurrentOperateItemParams,
  makeSelectCurrentDisplayWidgets,
  makeSelectClipboardLayers,
  makeSelectCurrentDisplayShareToken,
  makeSelectCurrentDisplayPasswordShareToken,
  makeSelectCurrentDisplayPasswordSharePassword,
  makeSelectCurrentDisplayAuthorizedShareToken,
  makeSelectSharePanel,
  makeSelectDisplayLoading,
  makeSelectEditorBaselines
} from 'app/containers/Display/selectors'
import { displayInitialState } from 'app/containers/Display/reducer'
import {
  mockGraphLayerId,
  mockSlideId,
  mockEditing,
  mockDisplayState,
  mockGraphLayerFormed,
  mockGraphLayerInfo
} from './fixtures'
describe('displaySelector', () => {
  let state
  beforeEach(() => {
    state = {
      display: displayInitialState
    }
  })
  describe('selectDisplay', () => {
    it('should select the display state', () => {
      expect(selectDisplay(state)).toEqual(state.display)
    })
  })

  describe('makeSelectCurrentLayersOperationInfo', () => {
    let selectCurrentLayersOperationInfo = makeSelectCurrentLayersOperationInfo()
    it('should select the current layer operation info', () => {
      expect(selectCurrentLayersOperationInfo(mockDisplayState)).toEqual(
        mockDisplayState.display.slideLayersOperationInfo[
          mockDisplayState.display.currentSlideId
        ]
      )
    })
  })

  describe('makeSelectLayersBySlide', () => {
    let selectLayersBySlide
    beforeEach(() => {
      selectLayersBySlide = makeSelectLayersBySlide()
      selectLayersBySlide.resetRecomputations()
    })

    test('should return bizTable state', () => {
      expect(selectLayersBySlide(state, mockSlideId)).toEqual(
        state.display.slideLayers[mockSlideId]
      )
    })

  })

  describe('makeSelectLayerIdsBySlide', () => {
    let selectLayerIdsBySlide
    beforeEach(() => {
      selectLayerIdsBySlide = makeSelectLayerIdsBySlide()
      selectLayerIdsBySlide.resetRecomputations()
    })

    test('should return select layer ids by slide', () => {
      expect(selectLayerIdsBySlide(mockDisplayState, mockSlideId)).toEqual(
        Object.keys(mockDisplayState.display.slideLayers[mockSlideId]).map(
          (id) => +id
        )
      )
    })

  })

  describe('makeSelectCurrentLayerList', () => {
    const selectCurrentLayerList = makeSelectCurrentLayerList()

    test('should return select current layer list', () => {
      expect(selectCurrentLayerList(mockDisplayState)).toEqual(
        Object.values(
          mockDisplayState.display.slideLayers[
            mockDisplayState.display.currentSlideId
          ]
        ).sort((l1, l2) => l2.index - l1.index)
      )
    })
  })

  describe('makeSelectCurrentLayerIds', () => {
    const selectCurrentLayerIds = makeSelectCurrentLayerIds()

    test('should return select current layer ids', () => {
      expect(selectCurrentLayerIds(mockDisplayState)).toEqual(
        Object.keys(
          mockDisplayState.display.slideLayers[
            mockDisplayState.display.currentSlideId
          ]
        ).map((id) => +id)
      )
    })
  })

  describe('makeSelectSlideLayerContextValue', () => {
    const selectSlideLayerContextValue = makeSelectSlideLayerContextValue()

    test('should return select slide layer context value', () => {
      expect(
        selectSlideLayerContextValue(
          mockDisplayState,
          mockSlideId,
          mockGraphLayerId,
          mockEditing
        )
      ).toEqual({
        layer: mockGraphLayerFormed,
        layerInfo: mockGraphLayerInfo
      })
    })
  })

  describe('makeSelectCurrentLayersMaxIndex', () => {
    const selectCurrentLayersMaxIndex = makeSelectCurrentLayersMaxIndex()
    const currentLayers =
      mockDisplayState.display.slideLayers[
        mockDisplayState.display.currentSlideId
      ]
    const currentLayerList = Object.values(currentLayers).sort(
      (l1, l2) => l2.index - l1.index
    )
    test('should return select current layer max index', () => {
      expect(selectCurrentLayersMaxIndex(mockDisplayState)).toEqual(
        currentLayerList[currentLayerList.length - 1].index
      )
    })
  })

  describe('makeSelectCurrentSelectedLayerList', () => {
    const selectCurrentSelectedLayerList = makeSelectCurrentSelectedLayerList()
    const currentLayers =
      mockDisplayState.display.slideLayers[
        mockDisplayState.display.currentSlideId
      ]
    const currentLayerList = Object.values(currentLayers).sort(
      (l1, l2) => l2.index - l1.index
    )
    const currentLayersOperationInfo =
      mockDisplayState.display.slideLayersOperationInfo[
        mockDisplayState.display.currentSlideId
      ]
    test('should return select current select layer list', () => {
      expect(selectCurrentSelectedLayerList(mockDisplayState)).toEqual(
        currentLayerList.filter(
          ({ id }) => currentLayersOperationInfo[id].selected
        )
      )
    })
  })

  describe('makeSelectCurrentEditLayerOperationInfo', () => {
    const selectCurrentEditLayerOperationInfo = makeSelectCurrentEditLayerOperationInfo()
    const currentEditOperationInfo =
      mockDisplayState.display.slideLayersOperationInfo[
        mockDisplayState.display.currentSlideId
      ]

    test('should return select current edit layer operation info', () => {
      expect(selectCurrentEditLayerOperationInfo(mockDisplayState)).toEqual(
        Object.values(currentEditOperationInfo).filter(
          (layerInfo) => layerInfo.editing
        )
      )
    })
  })

  describe('makeSelectCurrentSelectedLayerIds', () => {
    const selectCurrentSelectedLayerIds = makeSelectCurrentSelectedLayerIds()
    const currentLayersOperationInfo =
      mockDisplayState.display.slideLayersOperationInfo[
        mockDisplayState.display.currentSlideId
      ]
    test('should return select current select layer ids', () => {
      expect(selectCurrentSelectedLayerIds(mockDisplayState)).toEqual(
        Object.keys(currentLayersOperationInfo)
          .filter((id) => currentLayersOperationInfo[+id].selected)
          .map((id) => +id)
      )
    })
  })

  describe('makeSelectCurrentOperatingLayerList', () => {
    const selectCurrentOperatingLayerList = makeSelectCurrentOperatingLayerList()
    const currentLayers =
      mockDisplayState.display.slideLayers[
        mockDisplayState.display.currentSlideId
      ]
    test('should return select current operating layer list', () => {
      expect(
        selectCurrentOperatingLayerList(mockDisplayState, mockGraphLayerId)
      ).toEqual([currentLayers[mockGraphLayerId]])
    })
  })

  describe('makeSelectCurrentOtherLayerList', () => {
    const selectCurrentOtherLayerList = makeSelectCurrentOtherLayerList()
    const currentLayers =
      mockDisplayState.display.slideLayers[
        mockDisplayState.display.currentSlideId
      ]
    test('should return select current other layer list', () => {
      expect(
        selectCurrentOtherLayerList(mockDisplayState, mockGraphLayerId)
      ).toEqual([currentLayers[mockGraphLayerId]])
    })
  })

  describe('makeSelectCurrentOperateItemParams', () => {
    const selectCurrentOperateItemParams = makeSelectCurrentOperateItemParams()

    test('should return select current operate item params', () => {
      expect(selectCurrentOperateItemParams(state)).toEqual(
        state.display.operateItemParams
      )
    })
  })

  describe('makeSelectCurrentDisplayWidgets', () => {
    const selectCurrentDisplayWidgets = makeSelectCurrentDisplayWidgets()

    test('should return select current display widgets', () => {
      expect(selectCurrentDisplayWidgets(state)).toEqual(
        state.display.currentDisplayWidgets
      )
    })
  })

  describe('makeSelectClipboardLayers', () => {
    const selectClipboardLayers = makeSelectClipboardLayers()

    test('should return select clipboard layer list', () => {
      expect(selectClipboardLayers(state)).toEqual(
        state.display.clipboardLayers
      )
    })
  })

  describe('makeSelectCurrentDisplayShareToken', () => {
    const selectCurrentDisplayShareToken = makeSelectCurrentDisplayShareToken()

    test('should return select current display share token', () => {
      expect(selectCurrentDisplayShareToken(state)).toEqual(
        state.display.currentDisplayShareToken
      )
    })
  })

  describe('makeSelectCurrentDisplayPasswordShareToken', () => {
    const selectCurrentDisplayPasswordShareToken = makeSelectCurrentDisplayPasswordShareToken()

    test('should return select current display password share token', () => {
      expect(selectCurrentDisplayPasswordShareToken(state)).toEqual(
        state.display.currentDisplayPasswordShareToken
      )
    })
  })

  describe('makeSelectCurrentDisplayPasswordSharePassword', () => {
    const selectCurrentDisplayPasswordSharePassword = makeSelectCurrentDisplayPasswordSharePassword()

    test('should return select current display password share password', () => {
      expect(selectCurrentDisplayPasswordSharePassword(state)).toEqual(
        state.display.currentDisplayPasswordPassword
      )
    })
  })

  describe('makeSelectCurrentDisplayAuthorizedShareToken', () => {
    const selectCurrentDisplayAuthorizedShareToken = makeSelectCurrentDisplayAuthorizedShareToken()

    test('should return select current display authorized share token', () => {
      expect(selectCurrentDisplayAuthorizedShareToken(state)).toEqual(
        state.display.currentDisplayAuthorizedShareToken
      )
    })
  })

  describe('makeSelectSharePanel', () => {
    const selectSharePanel = makeSelectSharePanel()

    test('should return select share panel', () => {
      expect(selectSharePanel(state)).toEqual(state.display.sharePanel)
    })
  })

  describe('makeSelectDisplayLoading', () => {
    const selectDisplayLoading = makeSelectDisplayLoading()

    test('should return select display loading', () => {
      expect(selectDisplayLoading(state)).toEqual(state.display.loading)
    })
  })

  describe('makeSelectEditorBaselines', () => {
    const selectEditorBaselines = makeSelectEditorBaselines()

    test('should return select editor baselines', () => {
      expect(selectEditorBaselines(state)).toEqual(
        state.display.editorBaselines
      )
    })
  })

  describe('selectCurrentLayers', () => {
    test('should return select current layers', () => {
      expect(selectCurrentLayers(mockDisplayState)).toEqual(
        mockDisplayState.display.slideLayers[
          mockDisplayState.display.currentSlideId
        ]
      )
    })
  })
})
