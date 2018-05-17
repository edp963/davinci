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
  LOAD_WIDGETS,
  LOAD_WIDGETS_SUCCESS,
  LOAD_WIDGETS_FAILURE,
  ADD_WIDGET,
  ADD_WIDGET_SUCCESS,
  ADD_WIDGET_FAILURE,
  // LOAD_WIDGET_DETAIL,
  // LOAD_WIDGET_DETAIL_SUCCESS,
  EDIT_WIDGET,
  EDIT_WIDGET_SUCCESS,
  EDIT_WIDGET_FAILURE,
  DELETE_WIDGET,
  DELETE_WIDGET_SUCCESS,
  DELETE_WIDGET_FAILURE
} from './constants'

import {
  LOAD_BIZLOGICS,
  LOAD_BIZLOGICS_SUCCESS,
  LOAD_BIZLOGICS_FAILURE,
  LOAD_BIZDATAS,
  LOAD_BIZDATAS_SUCCESS,
  LOAD_BIZDATAS_FAILURE,
  CLEAR_BIZDATAS
} from '../Bizlogic/constants'

// import { promiseActionCreator } from '../../utils/reduxPromisation'

// export const loadWidgetDetail = promiseActionCreator(LOAD_WIDGET_DETAIL, ['id'])

export function loadWidgets () {
  return {
    type: LOAD_WIDGETS
  }
}

export function widgetsLoaded (widgets) {
  return {
    type: LOAD_WIDGETS_SUCCESS,
    payload: {
      widgets
    }
  }
}

export function widgetsLoadedFail () {
  return {
    type: LOAD_WIDGETS_FAILURE
  }
}

export function addWidget (widget, resolve) {
  return {
    type: ADD_WIDGET,
    payload: {
      widget,
      resolve
    }
  }
}

export function widgetAdded (result) {
  return {
    type: ADD_WIDGET_SUCCESS,
    payload: {
      result
    }
  }
}

export function addWidgetFail () {
  return {
    type: ADD_WIDGET_FAILURE
  }
}

// export function widgetDetailLoaded (widget) {
//   return {
//     type: LOAD_WIDGET_DETAIL_SUCCESS,
//     payload: {
//       widget
//     }
//   }
// }

export function editWidget (widget, resolve) {
  return {
    type: EDIT_WIDGET,
    payload: {
      widget,
      resolve
    }
  }
}

export function widgetEdited (result) {
  return {
    type: EDIT_WIDGET_SUCCESS,
    payload: {
      result
    }
  }
}

export function editWidgetFail () {
  return {
    type: EDIT_WIDGET_FAILURE
  }
}

export function deleteWidget (id) {
  return {
    type: DELETE_WIDGET,
    payload: {
      id
    }
  }
}

export function widgetDeleted (id) {
  return {
    type: DELETE_WIDGET_SUCCESS,
    payload: {
      id
    }
  }
}

export function deleteWidgetFail () {
  return {
    type: DELETE_WIDGET_FAILURE
  }
}

// Bizlogic
export function loadBizlogics () {
  return {
    type: LOAD_BIZLOGICS
  }
}

export function bizlogicsLoaded (bizlogics) {
  return {
    type: LOAD_BIZLOGICS_SUCCESS,
    payload: {
      bizlogics
    }
  }
}

export function loadBizlogicsFail () {
  return {
    type: LOAD_BIZLOGICS_FAILURE
  }
}

export function loadBizdatas (id, sql, sorts, offset, limit) {
  return {
    type: LOAD_BIZDATAS,
    payload: {
      id,
      sql,
      sorts,
      offset,
      limit
    }
  }
}

export function bizdatasLoaded (bizdatas) {
  return {
    type: LOAD_BIZDATAS_SUCCESS,
    payload: {
      bizdatas
    }
  }
}

export function loadBizdatasFail (error) {
  return {
    type: LOAD_BIZDATAS_FAILURE,
    payload: {
      error
    }
  }
}

export function clearBizdatas () {
  return {
    type: CLEAR_BIZDATAS
  }
}
