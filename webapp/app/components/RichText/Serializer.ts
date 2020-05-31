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

import escapeHtml from 'escape-html'
import { Node, Text } from 'slate'
import { jsx } from 'slate-hyperscript'
import { ElementTags, TextStyles, TextTags } from './Element'
import { TextProperties, ElementTypes } from './Element/constants'

const serializeNode = (node: Node) => {
  if (Text.isText(node)) {
    let text = escapeHtml(node.text)
    if (node[TextStyles.Bold]) {
      text = `<strong>${text}</strong>`
    }
    if (node[TextStyles.Italic]) {
      text = `<em>${text}</em>`
    }
    if (node[TextStyles.Underline]) {
      text = `<u>${text}</u>`
    }
    if (node[TextStyles.StrikeThrough]) {
      text = `<s>${text}</s>`
    }
    if (node[TextStyles.Code]) {
      text = `<code>${text}</code>`
    }

    TextProperties

    var span = document.createElement('span')
    if (node[TextProperties.BackgroundColor]) {
      span.style.backgroundColor = node[TextProperties.BackgroundColor]
    }
    if (node[TextProperties.Color]) {
      span.style.color = node[TextProperties.Color]
    }
    if (node[TextProperties.FontFamily]) {
      span.style.fontFamily = node[TextProperties.FontFamily]
    }
    if (node[TextProperties.FontSize]) {
      span.style.fontSize = `${node[TextProperties.FontSize]}px`
    }
    span.innerHTML = text
    text = span.outerHTML
    return text
  }
  const children = node.children.map((n) => serializeNode(n)).join('')

  switch (node.type) {
    case ElementTypes.Paragraph:
      return `<p>${children}</p>`
    case ElementTypes.BlockQuote:
      return `<blockquote>${children}</blockquote>`
    case ElementTypes.Code:
      return `<pre><code>${children}</code></pre>`

    case ElementTypes.BulletedList:
      return `<ul>${children}</ul>`
    case ElementTypes.NumberedList:
      return `<ol>${children}</ol>`
    case ElementTypes.ListItem:
      return `<li>${children}</li>`

    case ElementTypes.HeadingOne:
      return `<h1>${children}</h1>`
    case ElementTypes.HeadingTwo:
      return `<h2>${children}</h2>`
    case ElementTypes.HeadingThree:
      return `<h3>${children}</h3>`
    case ElementTypes.HeadingFour:
      return `<h4>${children}</h4>`
    case ElementTypes.HeadingFive:
      return `<h5>${children}</h5>`
    case ElementTypes.HeadingSix:
      return `<h6>${children}</h6>`

    case ElementTypes.Link:
      return `<a href="${node.url}" target="_blank">${children}</a>`
    case ElementTypes.Image:
      return `<div>${children}<img src="${node.url}" ${node.width ? `width="${node.width}"` : ''}/></div>`

    case ElementTypes.Table:
      return `<table><tbody>${children}</tbody></table>`
    case ElementTypes.TableRow:
      return `<tr>${children}</tr>`
    case ElementTypes.TableCell:
      return `<td>${children}</td>`

    case ElementTypes.Marquee:
      throw new Error(
        'Marquee Element can not be serialized as simple html tag!'
      )
    default:
      return children
  }
}

export const serialize = (nodes: Node[]) => {
  const html = nodes.map((n) => serializeNode(n)).join('')
  return html
}

export const deserialize = (el: HTMLElement): Node[] => {
  if (el.nodeType === 3) {
    const textElement = [{ text: el.textContent }]
    if (el.parentElement.nodeName === 'BODY') {
      return [jsx('element', ElementTags['P'](null), textElement)]
    }
    return textElement
  }
  if (el.nodeType !== 1) {
    return null
  }
  if (el.nodeName === 'BR') {
    return [{ text: '\n' }]
  }

  const { nodeName, childNodes } = el
  let parent: HTMLElement | ChildNode = el

  if (
    nodeName === 'PRE' &&
    childNodes[0] &&
    childNodes[0].nodeName === 'CODE'
  ) {
    parent = el.childNodes[0]
  }

  const children: any[] = Array.from(parent.childNodes).map(deserialize).flat()

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children)
  }

  if (ElementTags[nodeName]) {
    const attrs = ElementTags[nodeName](el)

    ALIGN_CLASS_SUFFIXES.some((suffix) => {
      if (el.classList.contains(`${ALIGN_CLASS_PREFIX}${suffix}`)) {
        attrs.textAlign = suffix
        return true
      }
    })
    return [jsx('element', attrs, children.length ? children : [{ text: '' }])]
  }
  if (TextTags[nodeName]) {
    const attrs = TextTags[nodeName]()
    if (el.style) {
      const { fontSize, color, backgroundColor } = el.style
      if (fontSize) {
        attrs.fontSize = +fontSize.substring(0, fontSize.length - 2)
      }
      if (color) {
        attrs.color = color
      }
      if (backgroundColor) {
        attrs.backgroundColor = backgroundColor
      }
    }
    return children.map((child) => jsx('text', attrs, child))
  }

  return children
}

const ALIGN_CLASS_PREFIX = 'ql-align-'
const ALIGN_CLASS_SUFFIXES = ['left', 'center', 'right']
