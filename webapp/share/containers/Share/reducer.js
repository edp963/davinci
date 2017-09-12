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

import { fromJS } from 'immutable'

import {
  LOAD_SHARE_DASHBOARD_SUCCESS,
  SET_INDIVIDUAL_DASHBOARD
} from './constants'

const initialState = fromJS({
  items: false
})

function shareReducer (state = initialState, { type, payload }) {
  switch (type) {
    case LOAD_SHARE_DASHBOARD_SUCCESS:
      return state.set('items', payload.dashboard.widgets)
    case SET_INDIVIDUAL_DASHBOARD:
      return state.set('items', [{
        id: 1,
        position_x: 0,
        position_y: 0,
        width: 12,
        length: 10,
        trigger_type: 'manual',
        trigger_params: '',
        widget_id: payload.widgetId,
        aesStr: payload.token
      }])
    default:
      return state
  }
}

export default shareReducer
