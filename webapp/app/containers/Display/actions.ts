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
  ActionTypes,
  SecondaryGraphTypes
} from './constants'

export function loadDisplays () {
  return {
    type: ActionTypes.LOAD_DISPLAYS
  }
}

export function displaysLoaded (displays) {
  return {
    type: ActionTypes.LOAD_DISPLAYS_SUCCESS,
    payload: {
      displays
    }
  }
}

export function loadDisplaysFail (error) {
  return {
    type: ActionTypes.LOAD_DISPLAYS_FAILURE,
    payload: {
      error
    }
  }
}

export function addDisplay (display) {
  return {
    type: ActionTypes.ADD_DISPLAY,
    payload: {
      display
    }
  }
}

export function displayAdded (result) {
  return {
    type: ActionTypes.ADD_DISPLAY_SUCCESS,
    payload: {
      result
    }
  }
}

export function loadDisplayDetail (id) {
  return {
    type: ActionTypes.LOAD_DISPLAY_DETAIL,
    payload: {
      id
    }
  }
}

export function displayDetailLoaded (display) {
  return {
    type: ActionTypes.LOAD_DISPLAY_DETAIL_SUCCESS,
    payload: {
      display
    }
  }
}

export function editDisplay (display) {
  return {
    type: ActionTypes.EDIT_DISPLAY,
    payload: {
      display
    }
  }
}

export function displayEdited (result) {
  return {
    type: ActionTypes.EDIT_DISPLAY_SUCCESS,
    payload: {
      result
    }
  }
}

export function editDisplayFail (error) {
  return {
    type: ActionTypes.EDIT_DISPLAY_FAILURE,
    payload: {
      error
    }
  }
}

export function deleteDisplay (id) {
  return {
    type: ActionTypes.DELETE_DISPLAY,
    payload: {
      id
    }
  }
}

export function displayDeleted (result) {
  return {
    type: ActionTypes.DELETE_DISPLAY_SUCCESS,
    payload: {
      result
    }
  }
}

export function selectWidgetLayers (widgetLayers) {
  return {
    type: ActionTypes.SELECT_WIDGET_LAYERS,
    payload: {
      layers: widgetLayers
    }
  }
}

export function addSecondaryGraphLayer (layer) {
  return {
    type: ActionTypes.ADD_SECONDARY_GRAPH_LAYER,
    payload: {
      layer
    }
  }
}

export function deleteLayers (ids) {
  return {
    type: ActionTypes.DELETE_LAYERS,
    payload: {
      ids
    }
  }
}

export function updateLayerStatus ({ id, selected }) {
  return {
    type: ActionTypes.UPDATE_LAYER_SELECTION_STATUS,
    payload: {
      id,
      selected
    }
  }
}
