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

import { ActionTypes } from './constants'
import { returnType } from 'utils/redux'
import { IDisplayFormed } from 'app/containers/Viz/types'

export const ShareDisplayActions = {
  loadDisplay(token: string, resolve, reject) {
    return {
      type: ActionTypes.LOAD_SHARE_DISPLAY,
      payload: {
        token,
        resolve,
        reject
      }
    }
  },
  displayLoaded(display: IDisplayFormed, slides, widgets) {
    return {
      type: ActionTypes.LOAD_SHARE_DISPLAY_SUCCESS,
      payload: {
        display,
        slides,
        widgets
      }
    }
  },
  loadDisplayFail(error) {
    return {
      type: ActionTypes.LOAD_SHARE_DISPLAY_FAILURE,
      payload: {
        error
      }
    }
  },

  loadLayerData(renderType, slideNumber, layerId, dataToken, requestParams) {
    return {
      type: ActionTypes.LOAD_LAYER_DATA,
      payload: {
        renderType,
        slideNumber,
        layerId,
        dataToken,
        requestParams
      }
    }
  },
  layerDataLoaded(renderType, slideNumber, layerId, data, requestParams) {
    return {
      type: ActionTypes.LOAD_LAYER_DATA_SUCCESS,
      payload: {
        renderType,
        slideNumber,
        layerId,
        data,
        requestParams
      }
    }
  },
  loadLayerDataFail(slideNumber, layerId, error) {
    return {
      type: ActionTypes.LOAD_LAYER_DATA_FAILURE,
      payload: {
        slideNumber,
        layerId,
        error
      }
    }
  }
}

const mockAction = returnType(ShareDisplayActions)
export type ShareDisplayActionType = typeof mockAction

export default ShareDisplayActions
