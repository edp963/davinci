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

import React, { useEffect, useState } from 'react'

interface IntersectionObserverState {
  inView: boolean
  triggered: boolean
  entry: object
}

const defaultState: IntersectionObserverState = {
  inView: false,
  triggered: false,
  entry: null
}

export const useIntersectionObserver = (ref, { threshold, root, rootMargin }) => {
  const [state, setState] = useState<IntersectionObserverState>(defaultState)

  const observeInstance = new IntersectionObserver(
    (entries, instance) => {
      if (entries[0].intersectionRatio > 0) {
        setState({
          inView: true,
          triggered: true,
          entry: instance
        })

        observeInstance.unobserve(ref.current)
      }
      return
    },
    {
      threshold: threshold || 0,
      root: root || null,
      rootMargin: rootMargin || '0%'
    }
  )

  useEffect(() => {
    if (ref.current && !state.triggered) {
      observeInstance.observe(ref.current)
    }
    return () => {
      if (ref.current) {
        observeInstance.disconnect()
      }
    }
  }, [ref, state])
  return [state.inView, state.entry]
}
