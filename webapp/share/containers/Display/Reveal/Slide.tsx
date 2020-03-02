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

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { makeSelectSlideLayers, makeSelectSlideLayersLoaded } from '../selectors'

import {
  SlideContainer,
  SlideContent,
  SlideBackground,
  DisplayContainer
} from 'containers/Display/components/Container'
import Layer from './Layer'
import HeadlessBrowserIdentifier from 'share/components/HeadlessBrowserIdentifier'

import 'containers/Display/Preview/Preview.less'

interface ISlideProps {
  slideNumber: number
}

const Slide: React.FC<ISlideProps> = (props) => {
  const { slideNumber } = props
  const slideLayers = useSelector((state) =>
    makeSelectSlideLayers()(state, slideNumber)
  )
  const layersLoaded = useSelector((state) =>
    makeSelectSlideLayersLoaded()(state, slideNumber)
  )
  const [renderSign, setRenderSign] = useState(false)
  useEffect(() => {
    if (layersLoaded) {
      const timer = setTimeout(() => {
        setRenderSign(true)
        clearTimeout(timer)
      }, 5000)
    }
  }, [layersLoaded])

  const {
    config: { slideParams },
    relations
  } = slideLayers

  const {
    transitionGlobal,
    transitionStyleIn,
    transitionStyleOut,
    transitionSpeed,
    autoSlideGlobal,
    autoSlide
  } = slideParams
  const sectionProps = {}
  if (transitionGlobal === false) {
    sectionProps[
      'data-transition'
    ] = `${transitionStyleIn} ${transitionStyleOut}`
    sectionProps['data-transition-speed'] = transitionSpeed
  }
  if (autoSlideGlobal === false) {
    sectionProps['data-autoslide'] = autoSlide * 1000
  }

  const refContent = React.useRef<HTMLDivElement>(null)

  return (
    <>
      <section {...sectionProps} className="display-preview-slide">
        <DisplayContainer>
          <SlideContainer slideId={slideNumber} slideParams={slideParams}>
            <SlideBackground padding={0} fullscreen>
              <SlideContent ref={refContent}>
                {relations.map(({ id }) => (
                  <Layer key={id} id={id} />
                ))}
              </SlideContent>
            </SlideBackground>
          </SlideContainer>
        </DisplayContainer>
      </section>
      <HeadlessBrowserIdentifier
        renderSign={renderSign}
        parentNode={refContent.current}
      />
    </>
  )
}

export default Slide
