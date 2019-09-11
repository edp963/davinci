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
  SIGNUP,
  SIGNUP_ERROR,
  SIGNUP_SUCCESS
} from './constants'

const initialState = {
  signupLoading: false
}

const signupReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case SIGNUP:
        draft.signupLoading = true
        break

      case SIGNUP_SUCCESS:
        draft.signupLoading = false
        break

      case SIGNUP_ERROR:
        draft.signupLoading = false
        break
    }
  })

export default signupReducer
