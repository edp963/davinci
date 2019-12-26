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

import {
  useRef,
  useState,
  useCallback,
  RefObject,
  useLayoutEffect
} from 'react'
import debounce from 'lodash/debounce'

export const CLIENT_RECT_DEBOUNCE_INTERVAL = 200

function useClientRect<T extends HTMLElement>(
  debounceInterval: number = CLIENT_RECT_DEBOUNCE_INTERVAL,
  realtime: boolean = false
): [DOMRect, RefObject<T>] {
  const ref = useRef<T>(null)
  const [rect, setRect] = useState<DOMRect>(null)

  const resize = useCallback(
    debounce(() => {
      if (ref.current) {
        setRect(ref.current.getBoundingClientRect())
      }
    }, debounceInterval),
    [ref.current, realtime]
  )

  useLayoutEffect(() => {
    if (!ref.current) {
      return
    }
    resize()
    if (typeof ResizeObserver === 'function') {
      let resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(ref.current)
      return () => {
        resizeObserver.disconnect()
        resizeObserver = null
      }
    } else {
      window.addEventListener('resize', resize)
      return () => {
        window.removeEventListener('resize', resize)
      }
    }
  }, [ref.current])

  return [rect, ref]
}

export default useClientRect

// refs: https://github.com/rehooks/component-size/blob/master/index.js
