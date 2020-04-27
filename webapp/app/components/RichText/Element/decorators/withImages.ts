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

import { Transforms } from 'slate'
import { ReactEditor } from 'slate-react'
import { isUrl, isImagePath } from 'utils/util'
import { ElementTypes } from '../constants'

const insertImage = (editor: ReactEditor, url: string | ArrayBuffer) => {
  const text = { text: '' }
  const image = { type: ElementTypes.Image, url, children: [text] }
  Transforms.insertNodes(editor, image)
}

const isImageUrl = (url: string) => {
  if (!url) {
    return false
  }
  if (!isUrl(url)) {
    return false
  }
  const { pathname } = new URL(url)
  return isImagePath(pathname)
}

const withImages = (editor: ReactEditor) => {
  const { insertData } = editor

  editor.insertData = (data) => {
    const text = data.getData('text/plain')
    const { files } = data

    if (files && files.length) {
      for (let idx = 0; idx < files.length; idx++) {
        const reader = new FileReader()
        const file = files[idx]
        const [mine] = file.type.split('/')
        if (mine === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result
            insertImage(editor, url)
          })
          reader.readAsDataURL(file)
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}

export default withImages
