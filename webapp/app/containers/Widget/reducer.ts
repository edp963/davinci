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
  LOAD_WIDGET_DETAIL,
  LOAD_WIDGET_DETAIL_SUCCESS,
  LOAD_WIDGET_DETAIL_FAILURE,
  EDIT_WIDGET,
  EDIT_WIDGET_SUCCESS,
  EDIT_WIDGET_FAILURE,
  LOAD_WIDGETS_FAILURE,
  ADD_WIDGET_FAILURE,
  CLEAR_CURRENT_WIDGET
} from './constants'
import { LOAD_DASHBOARD_DETAIL_SUCCESS } from '../Dashboard/constants'
import { ActionTypes as DisplayActionTypes } from '../Display/constants'
import { ActionTypes as ViewActionTypes } from '../View/constants'
import { fromJS } from 'immutable'

const initialState = fromJS({
  widgets: null,
  currentWidget: null,
  loading: false,
  dataLoading: false,
  columnValueLoading: false,
  distinctColumnValues: null
})

function widgetReducer (state = initialState, action) {
  const { type, payload } = action
  const widgets = state.get('widgets')

  switch (type) {
    case LOAD_WIDGETS:
      return state
        .set('loading', true)
        .set('widgets', null)
    case LOAD_WIDGETS_SUCCESS:
      return state
        .set('loading', false)
        .set('widgets', payload.widgets)
    case LOAD_WIDGETS_FAILURE:
      return state.set('loading', false)
    case ADD_WIDGET:
      return state.set('loading', true)
    case ADD_WIDGET_SUCCESS:
      if (widgets) {
        widgets.push(payload.result)
        return state
          .set('loading', false)
          .set('widgets', widgets.slice())
      } else {
        return state
          .set('loading', false)
          .set('widgets', [payload.result])
      }
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
    case LOAD_WIDGET_DETAIL:
      return state
        .set('loading', true)
        .set('currentWidget', null)
    case LOAD_WIDGET_DETAIL_SUCCESS:
      return state
        .set('loading', false)
        .set('currentWidget', payload.detail)
    case LOAD_WIDGET_DETAIL_FAILURE:
      return state.set('loading', false)
    case EDIT_WIDGET:
      return state.set('loading', true)
    case EDIT_WIDGET_SUCCESS:
      return state.set('loading', false)
    case EDIT_WIDGET_FAILURE:
      return state.set('loading', false)
    case ViewActionTypes.LOAD_VIEW_DATA:
      return state.set('dataLoading', true)
    case ViewActionTypes.LOAD_VIEW_DATA_SUCCESS:
      return state.set('dataLoading', false)
    case ViewActionTypes.LOAD_VIEW_DATA_FAILURE:
      return state.set('dataLoading', false)
    case LOAD_DASHBOARD_DETAIL_SUCCESS:
      return state.set('widgets', payload.widgets)
    case DisplayActionTypes.LOAD_DISPLAY_DETAIL_SUCCESS:
      return state.set('widgets', payload.widgets)
    case ViewActionTypes.LOAD_VIEW_DISTINCT_VALUE:
      return state
        .set('columnValueLoading', true)
        .set('distinctColumnValues', null)
    case ViewActionTypes.LOAD_VIEW_DISTINCT_VALUE_SUCCESS:
      return state
        .set('columnValueLoading', false)
        .set('distinctColumnValues', payload.data.slice(0, 100))
    case ViewActionTypes.LOAD_VIEW_DISTINCT_VALUE_FAILURE:
      return state.set('columnValueLoading', false)
    case CLEAR_CURRENT_WIDGET:
      return state.set('currentWidget', null)
    default:
      return state
  }
}

export default widgetReducer
