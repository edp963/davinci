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

import { createTypes } from 'utils/redux'

enum Types {
  LOAD_SHARE_DISPLAY = 'davinci/Share/LOAD_SHARE_DISPLAY',
  LOAD_SHARE_DISPLAY_SUCCESS = 'davinci/Share/LOAD_SHARE_DISPLAY_SUCCESS',
  LOAD_SHARE_DISPLAY_FAILURE = 'davinci/Share/LOAD_SHARE_DISPLAY_FAILURE',

  LOAD_LAYER_DATA = 'davinci/Share/LOAD_LAYER_DATA',
  LOAD_LAYER_DATA_SUCCESS = 'davinci/Share/LOAD_LAYER_DATA_SUCCESS',
  LOAD_LAYER_DATA_FAILURE = 'davinci/Share/LOAD_LAYER_DATA_FAILURE'
}

export const ActionTypes = createTypes(Types)
