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

import { Element, Transforms } from 'slate'
import { ReactEditor } from 'slate-react'
import { ElementTypes } from '../Element/constants'
import { parseHtml } from '../util'

const withHtml = (editor: ReactEditor) => {
  const { insertData, isInline, isVoid } = editor

  editor.isInline = (element: Element) => {
    return element.type === ElementTypes.Link ? true : isInline(element)
  }
  editor.isVoid = (element: Element) => {
    return element.type === ElementTypes.Image ? true : isVoid(element)
  }

  editor.insertData = (data) => {
    const html = data.getData('text/html')
    if (html) {
      const fragment = parseHtml(html)
      Transforms.insertFragment(editor, fragment)
      return
    }
    insertData(data)
  }

  return editor
}

export default withHtml
