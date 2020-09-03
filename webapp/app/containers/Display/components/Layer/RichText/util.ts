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
import { RichTextNode } from 'components/RichText'
import { EDITOR_DEFAULT_TEXT_ALIGN, EDITOR_DEFAULT_FONT_WEIGHT, EDITOR_DEFAULT_FONT_COLOR, EDITOR_DEFAULT_FONT_WEIGHT_BOLD } from './contants'
import { ILayerParams } from '../../types'
import { ElementStylesType, Selection } from './types'

export const buildLabelRichTextContent = (content: string | RichTextNode[]) => {
  return {
    content
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
    paddingRight,
    textIndent,
    lineHeight
  } = params

  const fontStyles: ElementStylesType = {
    fontSize: Number(`${fontSize}`)
  }

  const textStyles: ElementStylesType = {}

  const boxStyles: React.CSSProperties  = {
    paddingTop: `${paddingTop}px`,
    paddingRight: `${paddingRight}px`,
    paddingBottom: `${paddingBottom}px`,
    paddingLeft: `${paddingLeft}px`,
    textIndent: `${textIndent}px`,
    lineHeight: `${lineHeight}px`
  }
  if(fontColor.toString() !== EDITOR_DEFAULT_FONT_COLOR){
    fontStyles.color = `rgba(${fontColor.join()})`
  }
  if(fontFamily){
    fontStyles.fontFamily = fontFamily
  }
  if(fontWeight !== EDITOR_DEFAULT_FONT_WEIGHT) {
    fontStyles.fontWeight = fontWeight
    fontStyles.bold = fontWeight == EDITOR_DEFAULT_FONT_WEIGHT_BOLD
  }
  if (textStyle.includes('italic')) {
    fontStyles.italic = textStyle.indexOf('italic') > -1
  }
  if(textStyle.includes('underline')){
    fontStyles.underline = textStyle.indexOf('underline') > -1
  }

  if(textAlign !== EDITOR_DEFAULT_TEXT_ALIGN){
    textStyles.textAlign = textAlign
  }
  return { 
    fontStyles,
    textStyles,
    boxStyles
  }
}

export const buildLabelRichTextContentChildren = (sectionInnerStyle?: Partial<ElementStylesType>, text?: string, sectionWrapStyle?:Partial<ElementStylesType>,) => [
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

