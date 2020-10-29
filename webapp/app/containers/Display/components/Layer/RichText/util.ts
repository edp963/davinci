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
import { ElementTypes } from 'components/RichText/Element'
import { RichTextNode } from 'components/RichText'
import { EDITOR_DEFAULT_FONT_WEIGHT_BOLD } from './contants'
import { ILayerParams } from '../../types'
import {
  IEditorSelection,
  IElementFontStyles,
  IElementTextStyles,
  IEditorBoxStyle
} from './types'

export const buildLabelBoxStyles = (params: ILayerParams) => {
  const {
    fontWeight,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    textIndent,
    lineHeight
  } = params

  const boxStyles: Partial<IEditorBoxStyle> = {
    paddingTop: `${paddingTop}px`,
    paddingRight: `${paddingRight}px`,
    paddingBottom: `${paddingBottom}px`,
    paddingLeft: `${paddingLeft}px`
  }
  if (fontWeight) {
    boxStyles.fontWeight = fontWeight
  }
  if (textIndent) {
    boxStyles.textIndent = `${textIndent}px`
  }
  if (lineHeight) {
    boxStyles.lineHeight = `${lineHeight}px`
  }
  return {
    boxStyles
  }
}

export const migrationLabelRichTextStyles = (params: ILayerParams) => {
  const {
    fontWeight,
    fontFamily,
    fontColor,
    fontSize,
    textAlign,
    textStyle
  } = params

  const fontStyles: Partial<IElementFontStyles> = {
    fontSize: Number(`${fontSize}`),
    color: `rgba(${fontColor.join()})`
  }

  const textStyles: Partial<IElementTextStyles> = {
    textAlign: `${textAlign}`
  }

  fontStyles.bold = fontWeight === EDITOR_DEFAULT_FONT_WEIGHT_BOLD

  if (textStyle.includes('italic')) {
    fontStyles.italic = textStyle.indexOf('italic') > -1
  }

  if (textStyle.includes('underline')) {
    fontStyles.underline = textStyle.indexOf('underline') > -1
  }

  if (fontFamily) {
    fontStyles.fontFamily = `${fontFamily}`
  }
  return {
    fontStyles,
    textStyles
  }
}

export const migrationLabelRichTextContent = (
  text?: string,
  fontStyles?: Partial<IElementFontStyles>,
  textStyles?: Partial<IElementTextStyles>
) => {
  return {
    content: [
      {
        type: ElementTypes.Paragraph,
        children: [{ text: text || '', ...fontStyles }],
        ...textStyles
      }
    ]
  }
}

export const onLabelEditorStylesChange = (
  propPath: string[],
  value: string | RichTextNode[]
) => {
  const unitRange = {}
  propPath.reduce((subObj, propName, idx) => {
    if (idx === propPath.length - 1) {
      return (subObj[propName] = value)
    }
    return (subObj[propName] = {})
  }, unitRange)
  return unitRange
}

export const onLabelEditorSelectedRange = () => {
  const { anchorNode } = window.getSelection() as IEditorSelection
  if (!anchorNode || !anchorNode.parentNode) {
    return false
  }
  if (anchorNode.parentNode as Node) {
    return anchorNode.parentElement.hasAttribute('data-slate-string')
  }
}
