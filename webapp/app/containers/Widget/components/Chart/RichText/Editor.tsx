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
import { Icon, Dropdown, Menu, Row, Col, Button, Modal } from 'antd'
const MenuItem = Menu.Item
import ReactQuill, { Quill } from 'react-quill'
import ImageResize from 'quill-image-resize-module'
import 'react-quill/dist/quill.core.css'
import 'react-quill/dist/quill.snow.css'
import Preview from './Preview'
const Styles = require('./RichText.less')

interface IRichTextEditorProps {
  content: string
  fontSizes: number[]
  mapFields: object
  data: any[]
  fieldBoundaries: [string, string]
  onChange: (value: string) => void
}

interface IRichTextEditorStates {
  previewVisible: boolean
}

export class RichTextEditor extends React.Component<IRichTextEditorProps, IRichTextEditorStates> {

  private reactQuill = React.createRef<ReactQuill>()

  public state: Readonly<IRichTextEditorStates> = {
    previewVisible: false
  }

  public constructor (props: IRichTextEditorProps) {
    super(props)
    const size = Quill.import('attributors/style/size')
    size.whitelist = props.fontSizes.map((fontSize) => `${fontSize}px`)
    Quill.register(size, true)
    Quill.register('modules/imageResize', ImageResize)
  }

  private toolbarId = `react_quill_${new Date().getTime()}`

  private modules = {
    toolbar: {
      container: `#${this.toolbarId}`
    },
    imageResize: {
      displaySize: true
    }
  }

  private headerChange = (e: React.ChangeEvent<HTMLSelectElement>) => { e.persist() }

  private selectField = (field: string) => () => {
    const [ prefix, suffix ] = this.props.fieldBoundaries
    const editor = this.reactQuill.current.getEditor()
    const selection = editor.getSelection()
    const cursorPosition = selection ? selection.index : 0
    const placeholderText = `${prefix}${field}${suffix}`
    editor.insertText(cursorPosition, placeholderText)
    editor.setSelection(cursorPosition, placeholderText.length)
  }

  private openPreview = () => {
    this.setState({ previewVisible: true })
  }

  private closePreview = () => {
    this.setState({ previewVisible: false })
  }

  public render () {
    const { content, onChange, fontSizes, mapFields, data, fieldBoundaries } = this.props
    const { previewVisible } = this.state

    const fieldItems = Object.keys(mapFields).length ? (
      <Menu>
        {Object.keys(mapFields).map((fieldName) => (
          <MenuItem key={fieldName}>
            <a href="javascript:void(0)" onClick={this.selectField(fieldName)}>{fieldName}</a>
          </MenuItem>
        ))}
      </Menu>
    ) : (
      <Menu><MenuItem>暂无可用字段</MenuItem></Menu>
    )

    return (
      <div className={Styles.editor}>
        <div id={this.toolbarId}>
          <select className="ql-header" onChange={this.headerChange} />
          <select className="ql-font" />
          <select className="ql-size" defaultValue="13px">
            {fontSizes.map((size) => <option value={`${size}px`} key={size}>{`${size}px`}</option>)}
          </select>
          <button className="ql-bold" />
          <button className="ql-italic" />
          <button className="ql-underline" />
          <button className="ql-strike" />
          <select className="ql-color" />
          <select className="ql-background" />

          <button className="ql-list" value="ordered" />
          <button className="ql-list" value="bullet" />
          <select className="ql-align" />
          <button className="ql-link" />
          <button className="ql-image" />
          <button className="ql-clean" />

          <Dropdown overlay={fieldItems}>
            <a className={Styles.selectLink}>
              <Icon type="select" />
            </a>
          </Dropdown>
        </div>
        <ReactQuill
          ref={this.reactQuill}
          className={Styles.quill}
          value={content}
          modules={this.modules}
          theme="snow"
          onChange={onChange}
        />
        <Row type="flex" align="middle" justify="end" style={{ paddingTop: 16 }}>
          <Button onClick={this.openPreview} type="primary">预览</Button>
        </Row>
        <Modal
          title="富文本预览"
          wrapClassName="ant-modal-large"
          visible={previewVisible}
          footer={null}
          onCancel={this.closePreview}
        >
          <Preview content={content} fieldBoundaries={fieldBoundaries} data={data} mapFields={mapFields} />
        </Modal>
      </div>
    )
  }
}

export default RichTextEditor
