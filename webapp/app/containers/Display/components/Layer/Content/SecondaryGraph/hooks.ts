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
import { ILayerParams } from '../../../types'

export const useLabelStyle = (params: ILayerParams) => {
  const labelStyle = useMemo(() => {
    const {
      fontWeight,
      fontFamily,
      fontColor,
      fontSize,
      textAlign,
      textStyle,
      lineHeight,
      textIndent,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight
    } = params

    const style: React.CSSProperties = {
      wordBreak: 'break-all',
      overflow: 'hidden',
      fontWeight,
      fontFamily,
      color: `rgba(${fontColor.join()})`,
      fontSize: `${fontSize}px`,
      textAlign: textAlign as React.CSSProperties['textAlign'],
      lineHeight: `${lineHeight}px`,
      textIndent: `${textIndent}px`,
      paddingTop: `${paddingTop}px`,
      paddingRight: `${paddingRight}px`,
      paddingBottom: `${paddingBottom}px`,
      paddingLeft: `${paddingLeft}px`
    }
    if (textStyle) {
      style.fontStyle = textStyle.indexOf('italic') > -1 ? 'italic' : 'normal'
      style.textDecoration =
        textStyle.indexOf('underline') > -1 ? 'underline' : 'none'
    }
    return style
  }, [params])

  return labelStyle
}
