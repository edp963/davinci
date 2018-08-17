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
  ADD_WIDGET,
  ADD_WIDGET_SUCCESS,
  DELETE_WIDGET,
  DELETE_WIDGET_SUCCESS,
  DELETE_WIDGET_FAILURE,
  // LOAD_WIDGET_DETAIL,
  // LOAD_WIDGET_DETAIL_SUCCESS,
  EDIT_WIDGET,
  EDIT_WIDGET_SUCCESS,
  EDIT_WIDGET_FAILURE,
  LOAD_WIDGETS_FAILURE,
  ADD_WIDGET_FAILURE
} from './constants'
import { LOAD_DASHBOARD_DETAIL_SUCCESS } from '../Dashboard/constants'
import {
  LOAD_DATA,
  LOAD_DATA_SUCCESS,
  LOAD_DATA_FAILURE,
  CLEAR_BIZDATAS
} from '../Bizlogic/constants'
import { fromJS } from 'immutable'
// import { STATUS_CODES } from 'http'

const initialState = fromJS({
  widgets: false,
  loading: false,
  dataLoading: false
})

function widgetReducer (state = initialState, action) {
  const { type, payload } = action
  const widgets = state.get('widgets')

  switch (type) {
    case LOAD_WIDGETS:
      return state.set('loading', true)
    case LOAD_WIDGETS_SUCCESS:
      return state
        .set('loading', false)
        .set('widgets', payload.widgets)
    case LOAD_WIDGETS_FAILURE:
      return state.set('loading', false)
    case ADD_WIDGET:
      return state.set('loading', true)
    case ADD_WIDGET_SUCCESS:
      return state.set('loading', false)
    case ADD_WIDGET_FAILURE:
      return state.set('loading', false)
    case DELETE_WIDGET:
      return state.set('loading', true)
    case DELETE_WIDGET_SUCCESS:
      return state
        .set('widgets', widgets.filter((g) => g.id !== payload.id))
        .set('loading', false)
    case DELETE_WIDGET_FAILURE:
      return state.set('loading', false)
    // case LOAD_WIDGET_DETAIL:
    //   return state
    // case LOAD_WIDGET_DETAIL_SUCCESS:
    //   return state
    case EDIT_WIDGET:
      return state.set('loading', true)
    case EDIT_WIDGET_SUCCESS:
      return state.set('loading', false)
    case EDIT_WIDGET_FAILURE:
      return state.set('loading', false)
    case LOAD_DATA:
      return state.set('dataLoading', true)
    case LOAD_DATA_SUCCESS:
      return state.set('dataLoading', false)
    case LOAD_DATA_FAILURE:
      return state.set('dataLoading', false)
    case CLEAR_BIZDATAS:
      return state.set('bizdatas', false)
    case LOAD_DASHBOARD_DETAIL_SUCCESS:
      return state.set('widgets', payload.widgets)
    default:
      return state
  }
}

export default widgetReducer
