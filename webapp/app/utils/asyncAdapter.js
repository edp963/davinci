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

import { env, envName } from '../globalConfig'
import { apiConfig } from './api'

function getCurrentEnv (apiName) {
  if (apiName && apiConfig[apiName]) {
    return apiConfig[apiName].env
  }
  return env
}

export function readListAdapter (data, apiName) {
  switch (getCurrentEnv(apiName)) {
    case 'production':
      return data.payload
    default:
      return data
  }
}

export function readObjectAdapter (data, apiName) {
  switch (getCurrentEnv(apiName)) {
    case 'production':
      return data.payload[0]
    default:
      return data
  }
}

export function writeAdapter (data, apiName) {
  switch (getCurrentEnv(apiName)) {
    case 'production':
      return {
        payload: [data]
      }
    default:
      return data
  }
}
