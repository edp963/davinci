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
import React from 'react'
import { ElementTypes } from 'components/RichText/Element'
import { ElementStylesType, Selection } from './types'
import { RichTextNode } from 'components/RichText'
import { ILayerParams } from '../../types'

export const buildLabelRichTextContent = () => {
  return {
    content: []
  }
}

export const buildLabelRichTextStyles = (params: ILayerParams) => {
  const {
    fontWeight,
    fontFamily,
    fontColor,
    fontSize,
    textAlign,
    textStyle,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight
  } = params

  const innerStyles: ElementStylesType = {
    fontFamily,
    fontWeight,
    color: `rgba(${fontColor.join()})`,
    fontSize: Number(`${fontSize}`)
  }

  const wrapStyles: ElementStylesType = {
    textAlign: textAlign as React.CSSProperties['textAlign'],
    // lineHeight: `${lineHeight}px`,
    // textIndent: `${textIndent}px`,
  }

  const boxStyles: React.CSSProperties  = {
    paddingTop: `${paddingTop}px`,
    paddingRight: `${paddingRight}px`,
    paddingBottom: `${paddingBottom}px`,
    paddingLeft: `${paddingLeft}px`
  }
  
  if(fontWeight){
    innerStyles.bold = fontWeight == 'bold' || fontWeight == 700
  }
  if (textStyle) {
    innerStyles.italic = textStyle.indexOf('italic') > -1
    innerStyles.underline = textStyle.indexOf('underline') > -1
  }

  return { 
    innerStyles,
    wrapStyles,
    boxStyles
  }
}

export const buildLabelRichTextConetntChildren = (sectionInnerStyle?: Partial<ElementStylesType>, text?: string, sectionWrapStyle?:Partial<ElementStylesType>,) => [
  {
    type: ElementTypes.Paragraph,
    children: [{ text: text || '', ...sectionInnerStyle }],
    ...sectionWrapStyle
  }
]

export const onLabelEditorStylesChange = (propPath: string[], value: string | RichTextNode[]) => {
  const unitRange = {}
  propPath.reduce((subObj, propName, idx) => {
    if (idx === propPath.length -1) {
      return subObj[propName] = value
    }
    return subObj[propName] = {}
  }, unitRange)
  return unitRange
  }

export const onLabelEditorSelectedRange = () => {
  const { anchorNode } = window.getSelection() as Selection
  if(!anchorNode || !anchorNode.parentNode){
    return false
  }
  if(anchorNode.parentNode as Node){
    return anchorNode.parentElement.hasAttribute('data-slate-string')
  }
}

