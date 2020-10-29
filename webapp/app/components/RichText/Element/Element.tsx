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
import { RenderElementProps } from 'slate-react'
import { ElementTypes, BlockProperties } from './constants'

import ImageElement from './ImageElement'
import MarqueeElement from './MarqueeElement'

const ElementPropertyList = [BlockProperties.TextAlign]

const Element: React.FC<RenderElementProps> = (props) => {
  const { attributes, children, element } = props
  const cssStyle: React.CSSProperties = ElementPropertyList.reduce(
    (obj, propertyName) => {
      if (element[propertyName]) {
        obj[propertyName] = element[propertyName]
      }
      return obj
    },
    {}
  )

  switch (element.type) {
    case ElementTypes.BlockQuote:
      return (
        <blockquote {...attributes} style={cssStyle}>
          {children}
        </blockquote>
      )
    case ElementTypes.Code:
      return (
        <pre style={cssStyle}>
          <code {...attributes}>{children}</code>
        </pre>
      )

    // List Elements
    case ElementTypes.BulletedList:
      return (
        <ul {...attributes} style={cssStyle}>
          {children}
        </ul>
      )
    case ElementTypes.NumberedList:
      return (
        <ol {...attributes} style={cssStyle}>
          {children}
        </ol>
      )
    case ElementTypes.ListItem:
      return (
        <li {...attributes} style={cssStyle}>
          {children}
        </li>
      )

    // Headings Elements
    case ElementTypes.HeadingOne:
      return (
        <h1 {...attributes} style={cssStyle}>
          {children}
        </h1>
      )
    case ElementTypes.HeadingTwo:
      return (
        <h2 {...attributes} style={cssStyle}>
          {children}
        </h2>
      )
    case ElementTypes.HeadingThree:
      return (
        <h3 {...attributes} style={cssStyle}>
          {children}
        </h3>
      )
    case ElementTypes.HeadingFour:
      return (
        <h4 {...attributes} style={cssStyle}>
          {children}
        </h4>
      )
    case ElementTypes.HeadingFive:
      return (
        <h5 {...attributes} style={cssStyle}>
          {children}
        </h5>
      )
    case ElementTypes.HeadingSix:
      return (
        <h6 {...attributes} style={cssStyle}>
          {children}
        </h6>
      )

    case ElementTypes.Link:
      return (
        <a href={element.url} target="_blank" {...attributes}>
          {children}
        </a>
      )
    case ElementTypes.Image:
      return <ImageElement {...props} />

    // Table Elements
    case ElementTypes.Table:
      return (
        <table>
          <tbody {...attributes}>{children}</tbody>
        </table>
      )
    case ElementTypes.TableRow:
      return (
        <tr {...attributes} style={cssStyle}>
          {children}
        </tr>
      )
    case ElementTypes.TableCell:
      return (
        <td {...attributes} style={cssStyle}>
          {children}
        </td>
      )

    case ElementTypes.Marquee:
      return <MarqueeElement {...props} />

    default:
      return (
        <p {...attributes} style={cssStyle}>
          {children}
        </p>
      )
  }
}

export default Element
