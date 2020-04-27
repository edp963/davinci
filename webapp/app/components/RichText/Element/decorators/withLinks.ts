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

import { Transforms, Editor, Range, Element } from 'slate'
import { ReactEditor } from 'slate-react'
import { isUrl } from 'utils/util'
import { ElementTypes } from '../constants'

const unwrapLink = (editor: Editor) => {
  Transforms.unwrapNodes(editor, { match: (n) => n.type === ElementTypes.Link })
}

const wrapLink = (editor: ReactEditor, url: string) => {
  const [existedLink] = Editor.nodes(editor, {
    match: (n) => n.type === ElementTypes.Link
  })
  if (existedLink) {
    unwrapLink(editor)
  }

  const { selection } = editor
  const isCollapsed = selection && Range.isCollapsed(selection)
  const link: Element = {
    type: ElementTypes.Link,
    url,
    children: isCollapsed ? [{ text: url }] : []
  }

  if (isCollapsed) {
    Transforms.insertNodes(editor, link)
  } else {
    Transforms.wrapNodes(editor, link, { split: true })
    Transforms.collapse(editor, { edge: 'end' })
  }
}

const withLinks = (editor: ReactEditor) => {
  const { insertData, insertText, isInline } = editor

  editor.isInline = (element) => {
    return element.type === ElementTypes.Link ? true : isInline(element)
  }

  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      wrapLink(editor, text)
    } else {
      insertText(text)
    }
  }

  editor.insertData = (data) => {
    const text = data.getData('text/plain')
    if (text && isUrl(text)) {
      wrapLink(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}

export default withLinks
