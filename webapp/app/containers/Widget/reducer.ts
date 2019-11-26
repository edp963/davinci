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

import produce from 'immer'
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

const initialState = {
  widgets: null,
  currentWidget: null,
  loading: false,
  dataLoading: false,
  columnValueLoading: false,
  distinctColumnValues: null
}

const widgetReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case LOAD_WIDGETS:
        draft.loading = true
        draft.widgets = null
        break

      case LOAD_WIDGETS_SUCCESS:
        draft.loading = false
        draft.widgets = action.payload.widgets
        break

      case LOAD_WIDGETS_FAILURE:
        draft.loading = false
        break

      case ADD_WIDGET:
        draft.loading = true
        break

      case ADD_WIDGET_SUCCESS:
        if (draft.widgets) {
          draft.widgets.push(action.payload.result)
          draft.loading = false
        } else {
          draft.loading = false
          draft.widgets = [action.payload.result]
        }
        break

      case ADD_WIDGET_FAILURE:
        draft.loading = false
        break

      case DELETE_WIDGET:
        draft.loading = true
        break

      case DELETE_WIDGET_SUCCESS:
        draft.widgets = draft.widgets.filter((g) => g.id !== action.payload.id)
        draft.loading = false
        break

      case DELETE_WIDGET_FAILURE:
        draft.loading = false
        break

      case LOAD_WIDGET_DETAIL:
        draft.loading = true
        draft.currentWidget = null
        break

      case LOAD_WIDGET_DETAIL_SUCCESS:
        draft.loading = false
        draft.currentWidget = action.payload.detail
        break

      case LOAD_WIDGET_DETAIL_FAILURE:
        draft.loading = false
        break

      case EDIT_WIDGET:
        draft.loading = true
        break

      case EDIT_WIDGET_SUCCESS:
        draft.loading = false
        break

      case EDIT_WIDGET_FAILURE:
        draft.loading = false
        break

      case ViewActionTypes.LOAD_VIEW_DATA:
        draft.dataLoading = true
        break

      case ViewActionTypes.LOAD_VIEW_DATA_SUCCESS:
        draft.dataLoading = false
        break

      case ViewActionTypes.LOAD_VIEW_DATA_FAILURE:
        draft.dataLoading = false
        break

      case LOAD_DASHBOARD_DETAIL_SUCCESS:
        draft.widgets = action.payload.widgets
        break

      case DisplayActionTypes.LOAD_DISPLAY_DETAIL_SUCCESS:
        draft.widgets = action.payload.widgets
        break

      case ViewActionTypes.LOAD_VIEW_DISTINCT_VALUE:
        draft.columnValueLoading = true
        draft.distinctColumnValues = null
        break

      case ViewActionTypes.LOAD_VIEW_DISTINCT_VALUE_SUCCESS:
        draft.columnValueLoading = false
        draft.distinctColumnValues = action.payload.data.slice(0, 100)
        break

      case ViewActionTypes.LOAD_VIEW_DISTINCT_VALUE_FAILURE:
        draft.columnValueLoading = false
        break

      case CLEAR_CURRENT_WIDGET:
        draft.currentWidget = null
        break
    }
  })

export default widgetReducer
