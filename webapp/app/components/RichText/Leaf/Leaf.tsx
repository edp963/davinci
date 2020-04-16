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
import { RenderLeafProps } from 'slate-react'

import { TextStyles } from '../Element/constants'
import { ElementPropertyList } from './constants'

interface ILeafProps extends RenderLeafProps {
  onFormatText?: (text: string) => string
}

const Leaf: React.FC<ILeafProps> = (props) => {
  const { attributes, children, leaf, onFormatText } = props
  let wrappedChildren = children
  if (leaf.text && onFormatText) {
    leaf.text = onFormatText(leaf.text)
  }
  const cssStyle: React.CSSProperties = ElementPropertyList.reduce(
    (obj, propertyName) => {
      if (leaf[propertyName]) {
        obj[propertyName] = leaf[propertyName]
      }
      return obj
    },
    {}
  )

  if (leaf[TextStyles.Bold]) {
    wrappedChildren = <strong>{wrappedChildren}</strong>
  }
  if (leaf[TextStyles.Italic]) {
    wrappedChildren = <em>{wrappedChildren}</em>
  }
  if (leaf[TextStyles.Underline]) {
    wrappedChildren = <u>{wrappedChildren}</u>
  }
  if (leaf[TextStyles.StrikeThrough]) {
    wrappedChildren = <s>{wrappedChildren}</s>
  }
  if (leaf[TextStyles.Code]) {
    wrappedChildren = <code>{wrappedChildren}</code>
  }

  return (
    <span {...attributes} style={cssStyle}>
      {wrappedChildren}
    </span>
  )
}

export default Leaf
