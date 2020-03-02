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

import React, { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { makeSelectLayerIdsBySlide } from '../selectors'

import {
  SlideContainer,
  SlideContent,
  SlideBackground,
  DisplayContainer
} from '../components/Container'
import { ISlideParams } from '../../Viz/types'
import PreviewLayer from './Layer'

interface ISlideProps {
  slideId: number
  slideParams: ISlideParams
}

const Slide: React.FC<ISlideProps> = (props) => {
  const { slideId, slideParams } = props
  const selectLayerIdsBySlide = useMemo(makeSelectLayerIdsBySlide, [])
  const layerIds = useSelector((state) => selectLayerIdsBySlide(state, slideId))
  const {
    transitionGlobal,
    transitionStyleIn,
    transitionStyleOut,
    transitionSpeed,
    autoSlideGlobal,
    autoPlay,
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
    sectionProps['data-autoslide'] = autoPlay !== false ? autoSlide * 1000 : 0
  }

  return (
    <section {...sectionProps} className="display-preview-slide">
      <DisplayContainer>
        <SlideContainer slideId={slideId} slideParams={slideParams}>
          <SlideBackground padding={0} fullscreen>
            <SlideContent>
              {layerIds.map((id) => (
                <PreviewLayer key={id} id={id} />
              ))}
            </SlideContent>
          </SlideBackground>
        </SlideContainer>
      </DisplayContainer>
    </section>
  )
}

export default Slide
