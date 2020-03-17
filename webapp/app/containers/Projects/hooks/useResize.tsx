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


import React, {
  useState,
  useLayoutEffect
} from 'react'

import { debounce } from 'lodash'


export const useResize = (): number => {
  const [documentWidth, setDocumentWidth] = useState(document.body.clientWidth)

  useLayoutEffect(() => {
    function updateClientWidth () {
      setDocumentWidth(document.body.clientWidth)
    }
    window.addEventListener('resize',  debounce(updateClientWidth, 300))
    return () => {
      window.removeEventListener('resize', updateClientWidth)
    }
  }, [documentWidth])

  return documentWidth
}

