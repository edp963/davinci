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

import React, { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { makeSelectCurrentProject } from 'containers/Projects/selectors'
import { makeSelectCurrentDisplay } from 'containers/Viz/selectors'

import Reveal from 'reveal.js'
import 'reveal.js/css/reveal.css'

import Display from './Display'
import { DefaultDisplayParams } from '../components/Setting/constants'

import { useStatistic } from './hooks'

const DisplayReveal: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const currentProject = useSelector(makeSelectCurrentProject())
  const currentDisplay = useSelector(makeSelectCurrentDisplay())

  useStatistic(currentProject, currentDisplay)

  const { autoPlay, autoSlide, transitionStyle, transitionSpeed } =
    currentDisplay.config.displayParams || DefaultDisplayParams

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

      autoSlide: autoPlay !== false ? autoSlide * 1000 : 0,
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

  const slideChanged = useCallback((e) => {
    const { indexh: slideIdx } = e
    setCurrentSlideIndex(slideIdx)
  }, [])

  useEffect(() => {
    Reveal.addEventListener('slidechanged', slideChanged)

    return () => {
      Reveal.removeEventListener('slidechanged', slideChanged)
    }
  }, [])

  return (
    <div className="reveal">
      <div className="slides">
        <Display slideIndex={currentSlideIndex} />
      </div>
    </div>
  )
}

export default DisplayReveal
