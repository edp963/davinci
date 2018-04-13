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

import isEmpty from 'lodash/isEmpty'
import invariant from 'invariant'

export const promiseDispatcher = (dispatch, action, ...params) =>
  new Promise((resolve, reject) => {
    dispatch(action(resolve, reject, ...params))
  })

export const promiseActionCreator = (type, payload = []) =>
  (resolve, reject, ...params) => {
    const paramArr = [...params]

    invariant(
      !isEmpty(type),
      `(app/utils/reduxPromisation...) promiseActionCreator: Received an empty action type.
       action type 不能为空`
    )

    invariant(
      payload.length === paramArr.length,
      `(app/utils/reduxPromisation...) promiseActionCreator: Expected ${payload.length} payloads but got ${paramArr.length}.
       预期有 ${payload.length} 个 payloads 但确拿到了 ${paramArr.length} 个`
    )
    return {
      type: type,
      payload: payload.reduce((obj, name, index) => {
        obj[name] = paramArr[index]
        return obj
      }, {
        resolve,
        reject
      })
    }
  }

export const promiseSagaCreator = (resolve, reject) =>
  function* ({ payload }) {
    try {
      const result = yield resolve(payload)
      payload.resolve(result)
    } catch (err) {
      reject(err)
      payload.reject(err)
    }
  }

