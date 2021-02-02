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

import React, { useContext } from 'react'

import { LayerContext } from '../../util'

import { VIDEO_REG, IFRAME_REG, MEDIA_SRC_REG } from './constants'

const Video: React.FC = () => {
  const {
    layer: { params }
  } = useContext(LayerContext)
  const { src, controlSetting, start, end } = params
  const setting = controlSetting.reduce((acc, key) => {
    let dataKey = key
    if (key === 'autoplay') {
      // support revealjs data-autoplay
      dataKey = 'data-autoplay'
    }
    return {
      ...acc,
      [dataKey]: true
    }
  }, {})

  let srcWithParams = src

  const videoRegExp = src && VIDEO_REG.test(src)
  const iframeRegExp = src && IFRAME_REG.test(src)

  if(src && videoRegExp){
    const startParams = `#t=${start ? start : 0}`
    const endParams = end ? `,${end}` : ''
    srcWithParams = start ? `${srcWithParams}${startParams}` : `${srcWithParams}${endParams}`
  }

  if(src && iframeRegExp){
    const iframeSrc = src.match(MEDIA_SRC_REG)
    srcWithParams = iframeRegExp ? iframeSrc[0] + '&autoplay=true' : src
  }
  
  const mediaType = videoRegExp ? 'video' : 'iframe'

  switch (mediaType) {
    case 'video':
      return (
        <video src={srcWithParams} preload="auto" {...setting}>
          你的浏览器不支持 <code>video</code> 标签.
        </video>
      )
    default:
      return <iframe src={srcWithParams} frameBorder="0" allow="autoplay" />
  }
}

export default Video
