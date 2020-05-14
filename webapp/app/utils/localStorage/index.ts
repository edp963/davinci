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

import { localStorageItemMap, TstorageItemKey } from './types'
import { OperateObjectAbstract } from 'utils/abstract/OperateObjectAbstract'

const getPropery = OperateObjectAbstract.getPropsByPropery
const workbenchsettingsRe = /(\d{1}_workbench_settings)/
function enhancerStorage(fn) {
  return function (key: TstorageItemKey, value?) {
    if (workbenchsettingsRe.test(key)) {
      return fn.call(this, key, value)
    }

    if (!getPropery(localStorageItemMap, key)) {
      console.error(
        `The ${key} needs to be defined as propery of localStorageItemMap in "utils/localStorage/index.tsx" first`
      )
      return
    }

    return fn.call(this, key, value)
  }
}

localStorage.setItem = enhancerStorage(localStorage.setItem)
localStorage.getItem = enhancerStorage(localStorage.getItem)


