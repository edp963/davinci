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

import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { makeSelectDisplay, makeSelectSlidesCount } from '../selectors'

import Reveal from 'reveal.js'
import 'reveal.js/css/reveal.css'

import { DefaultDisplayParams } from 'containers/Display/constants'
import Display from './Display'

const ShareDisplayReveal: React.FC = () => {
  const {
    config: { displayParams }
  } = useSelector(makeSelectDisplay())
  const { autoPlay, autoSlide, transitionStyle, transitionSpeed } =
    displayParams || DefaultDisplayParams

  const slidesCount = useSelector(makeSelectSlidesCount())
  const slideNumberParam = new URLSearchParams(window.location.search).get('p')
  const slideNumber = +slideNumberParam
  useEffect(() => {
    Reveal.initialize({
      hash: false,
      history: false,

      controls: true,
      controlsLayout: 'edges',
      controlsTutorial: false,
      progress: false,
      loop: true,

      width: '100%',
      height: '100%',
      margin: 0,
      minScale: 1,
      maxScale: 1,

      autoSlide:
        (slideNumber > 0 && slideNumber < slidesCount) || autoPlay === false
          ? 0
          : autoSlide * 1000,
      transition: transitionStyle,
      transitionSpeed,

      viewDistance: 100,

      dependencies: [
        {
          src: 'plugin/zoom-js/zoom.js',
          async: true
        }
      ]
    })
  }, [])

  return (
    <div className="reveal">
      <div className="slides">
        <Display targetSlideNumber={slideNumber} />
      </div>
    </div>
  )
}

export default ShareDisplayReveal
