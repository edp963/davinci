/*-
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
  LOAD_WIDGET_DETAIL,
  LOAD_WIDGET_DETAIL_SUCCESS,
  EDIT_WIDGET,
  EDIT_WIDGET_SUCCESS
} from './constants'
import { fromJS } from 'immutable'

const initialState = fromJS({
  widgets: false
})

function widgetReducer (state = initialState, { type, payload }) {
  const widgets = state.get('widgets')
  switch (type) {
    case LOAD_WIDGETS:
      return state
    case LOAD_WIDGETS_SUCCESS:
      return state.set('widgets', payload.widgets)
    case ADD_WIDGET:
      return state
    case ADD_WIDGET_SUCCESS:
      if (widgets) {
        widgets.unshift(payload.result)
        return state.set('widgets', widgets.slice())
      } else {
        return state.set('widgets', [payload.result])
      }
    case DELETE_WIDGET:
      return state
    case DELETE_WIDGET_SUCCESS:
      return state.set('widgets', widgets.filter(g => g.id !== payload.id))
    case LOAD_WIDGET_DETAIL:
      return state
    case LOAD_WIDGET_DETAIL_SUCCESS:
      return state
    case EDIT_WIDGET:
      return state
    case EDIT_WIDGET_SUCCESS:
      widgets.splice(widgets.indexOf(widgets.find(g => g.id === payload.result.id)), 1, payload.result)
      return state.set('widgets', widgets.slice())
    default:
      return state
  }
}

export default widgetReducer
