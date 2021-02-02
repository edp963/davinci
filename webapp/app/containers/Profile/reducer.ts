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
  GET_USER_PROFILE,
  GET_USER_PROFILE_SUCCESS
} from './constants'


export const initialState = {
  userProfile: false,
  loading: false
}

const profileReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case GET_USER_PROFILE:
        draft.loading = true
        break

      case GET_USER_PROFILE_SUCCESS:
        draft.loading = false
        draft.userProfile = action.payload.result
        break
    }
  })

export default profileReducer
