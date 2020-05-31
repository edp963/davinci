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

import { RichText, RichTextNode } from 'components/RichText'

interface IRichTextPreviewProps {
  content: string | RichTextNode[]
  onFormatText: (text: string) => string
}

const RichTextPreview: React.FC<IRichTextPreviewProps> = (props) => {
  const { content, onFormatText } = props

  return (
    <RichText
      readOnly
      value={content}
      toolbar={false}
      onFormatText={onFormatText}
    />
  )
}

export default RichTextPreview
