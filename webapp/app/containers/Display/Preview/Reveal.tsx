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
import 'reveal.js/dist/reveal.css'
import RevealZoom from 'reveal.js/plugin/zoom/plugin'

import Display from './Display'
import { DefaultDisplayParams } from '../components/Setting/constants'

import { useStatistic } from './hooks'

const DisplayReveal: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const currentProject = useSelector(makeSelectCurrentProject())
  const currentDisplay = useSelector(makeSelectCurrentDisplay())

  useStatistic(currentProject, currentDisplay)
  const { autoPlay, autoSlide, transitionStyle, transitionSpeed, needScroll, scrollWaitTime } =
  currentDisplay.config.displayParams || DefaultDisplayParams

  let timer = null;
  if (window.timerList) {
    for (let i = 0; i < window.timerList.length; i++) {
      clearInterval(window.timerList[i])
    }
  }
  window.timerList = [];


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

      plugins: [RevealZoom]
    })
  }, [])

  const taskScroll = (i) => {
    console.log('scrollTop ', document.querySelectorAll('.ant-table-body')[i].scrollTop );
    console.log('offsetHeight ', document.querySelectorAll('.ant-table-body')[i].offsetHeight );
    console.log('clientHeight ', document.querySelectorAll('.ant-table-body')[i].clientHeight );
    if (document.querySelectorAll('.ant-table-body')[i].scrollTop 
    >= document.querySelectorAll('.ant-table-tbody')[i].offsetHeight 
    - document.querySelectorAll('.ant-table-body')[i].clientHeight) {
      document.querySelectorAll('.ant-table-body')[i].scrollTop = 0;
    }
    else {
      document.querySelectorAll('.ant-table-body')[i].scrollTop += 50;
    }
  }

  setTimeout(() => {
    const len = document.querySelectorAll('.ant-table-body').length
    if (needScroll) {
      for (let i = 0; i < len; i++) {
        timer = setInterval(() => taskScroll(i), scrollWaitTime * 1000);
        window.timerList.push(timer)
      }
    }
    console.log('window.timerList', window.timerList)
  }, 5000)


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
