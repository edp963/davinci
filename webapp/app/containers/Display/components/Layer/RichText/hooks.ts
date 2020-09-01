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
import { ILayerParams } from '../../types'
import { ElementStylesType } from './types'
export const useRecorderLabelStyle = (params: ILayerParams) => {
  const labelStyle = useMemo(() => {
    debugger
    const {
      fontWeight,
      fontFamily,
      fontColor,
      fontSize,
      textAlign,
      textStyle,
      lineHeight,
      textIndent
    } = params

    const innerStyles: ElementStylesType = {
      fontFamily,
      fontWeight,
      color: `rgba(${fontColor.join()})`,
      fontSize: `${fontSize}px`
    }
    const wrapStyles: ElementStylesType = {
      textAlign: textAlign as React.CSSProperties['textAlign'],
      lineHeight: `${lineHeight}px`,
      textIndent: `${textIndent}px`,
    }
    if(fontWeight){
      innerStyles.bold = ['bold','normal'].indexOf(fontWeight) > -1
    }
    if (textStyle) {
      innerStyles.italic = textStyle.indexOf('italic') > -1
      innerStyles.underline = textStyle.indexOf('underline') > -1
    }
    return { 
      innerStyles,
      wrapStyles
    }
  }, [params])

  return labelStyle
}
