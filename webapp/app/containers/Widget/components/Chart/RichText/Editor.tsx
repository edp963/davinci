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

import React, { useState, useCallback } from 'react'
import cloneDeep from 'lodash/cloneDeep'

import { Row, Button, Modal } from 'antd'
import { RichText, RichTextNode } from 'components/RichText'
import Toolbar from 'components/RichText/Toolbar'
import Preview from './Preview'

import Styles from './RichText.less'

interface IRichTextEditorProps {
  content: string | RichTextNode[]
  mapFields: object
  fieldBoundaries: [string, string]
  onChange: (value: RichTextNode[]) => void
  onFormatText: (text: string) => string
}

const RichTextEditor: React.FC<IRichTextEditorProps> = (props) => {
  const { content, mapFields, fieldBoundaries, onChange, onFormatText } = props
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewContent, setPreviewContent] = useState(null)

  const openPreview = useCallback(() => {
    // @REFACTOR temporarily resolve range selection error in Editor
    // caused by same content value reference in Editor & Preview
    const clonedContent = cloneDeep(content)
    setPreviewContent(clonedContent)
    setPreviewVisible(true)
  }, [content])
  const closePreview = useCallback(() => {
    setPreviewVisible(false)
  }, [])

  return (
    <div className={Styles.richText}>
      <RichText
        className={Styles.editor}
        value={content}
        toolbar={
          <Toolbar.Toolbar>
            <Toolbar.Font />
            <Toolbar.Heading />
            <Toolbar.Format />
            <Toolbar.Alignment />
            <Toolbar.Link />
            <Toolbar.Image />
            <Toolbar.Marquee />
            <Toolbar.Field
              mapFields={mapFields}
              fieldBoundaries={fieldBoundaries}
            />
            <Toolbar.Reset />
          </Toolbar.Toolbar>
        }
        onChange={onChange}
      />
      <Row type="flex" align="middle" justify="end" style={{ paddingTop: 16 }}>
        <Button onClick={openPreview} type="primary">
          预览
        </Button>
      </Row>
      <Modal
        title="富文本预览"
        wrapClassName="ant-modal-large"
        visible={previewVisible}
        footer={null}
        onCancel={closePreview}
      >
        <Preview content={previewContent} onFormatText={onFormatText} />
      </Modal>
    </div>
  )
}

export default RichTextEditor
