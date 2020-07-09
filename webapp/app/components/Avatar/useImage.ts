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

import React, { useState, useEffect, useCallback } from 'react'

interface ImageState {
  image: string | boolean
  status: 'loading' | 'loaded' | 'loadFail'
}

const defaultState: ImageState = {
  image: false,
  status: 'loading'
}

const cache: {
  [key: string]: Promise<void>
} = {}

export const useImage = (url: string, crossOrigin?: string) => {
  const [state, setState] = useState<ImageState>(defaultState)
  const [error, setError] = useState<string>()
  const { image, status } = state

  useEffect(() => {
    if (!cache[url]) {
      cache[url] = loadImage(url)
    }
    cache[url]
      .then(() => {
        setState({ image: url, status: 'loaded' })
      })
      .catch((err) => {
        setError(err)
        setState({ image: false, status: 'loadFail' })
      })
  }, [url, crossOrigin])

  return {
    image,
    status,
    error
  }
}

function loadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image: HTMLImageElement = new Image()
    image.onload = () => resolve()
    image.onerror = reject
    image.src = src
  })
}
