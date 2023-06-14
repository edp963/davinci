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
import 'reveal.js/dist/reveal.css'
import RevealZoom from 'reveal.js/plugin/zoom/plugin'

import { DefaultDisplayParams } from 'containers/Display/constants'
import Display from './Display'

const ShareDisplayReveal: React.FC = () => {
  const {
    config: { displayParams }
  } = useSelector(makeSelectDisplay())
  const { autoPlay, autoSlide, transitionStyle, transitionSpeed, needScroll, scrollWaitTime } =
    displayParams || DefaultDisplayParams

  let timer = null;
  if (window.timerList) {
    for (let i = 0; i < window.timerList.length; i++) {
      clearInterval(window.timerList[i])
    }
  }
  window.timerList = [];
  

  const taskScroll = (i) => {
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
  }, 5000)

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

      plugins: [RevealZoom]
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
