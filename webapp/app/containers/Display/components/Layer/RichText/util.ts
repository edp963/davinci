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
import { ElementStylesType } from './types'
import { RichTextNode } from 'components/RichText'

export const getDefaultContent = (sectionStyle?: Partial<ElementStylesType>, text?: string) => [
  {
    type: ElementTypes.Paragraph,
    children: [{ text: text || '', ...sectionStyle }]
  }
]

export const editorStylesChange = (propPath: string[], value: string | RichTextNode[]) => {
  const unitRange = {}
  propPath.reduce((subObj, propName, idx) => {
    if (idx === propPath.length -1) {
      return subObj[propName] = value
    }
    return subObj[propName] = {}
  }, unitRange)
  return unitRange
  }