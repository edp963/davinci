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

export function loadDisplay (token, resolve, reject) {
  return {
    type: ActionTypes.LOAD_SHARE_DISPLAY,
    payload: {
      token,
      resolve,
      reject
    }
  }
}
export function displayLoaded (display, slide, widgets) {
  return {
    type: ActionTypes.LOAD_SHARE_DISPLAY_SUCCESS,
    payload: {
      display,
      slide,
      widgets
    }
  }
}
export function loadDisplayFail (error) {
  return {
    type: ActionTypes.LOAD_SHARE_DISPLAY_FAILURE,
    payload: {
      error
    }
  }
}

export function loadLayerData (renderType, layerId, dataToken, requestParams) {
  return {
    type: ActionTypes.LOAD_LAYER_DATA,
    payload: {
      renderType,
      layerId,
      dataToken,
      requestParams
    }
  }
}
export function layerDataLoaded (renderType, layerId, data) {
  return {
    type: ActionTypes.LOAD_LAYER_DATA_SUCCESS,
    payload: {
      renderType,
      layerId,
      data
    }
  }
}
export function loadLayerDataFail (error) {
  return {
    type: ActionTypes.LOAD_LAYER_DATA_FAILURE,
    payload: {
      error
    }
  }
}

