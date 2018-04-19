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

import React, { PureComponent } from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import Icon from 'antd/lib/icon'
import Col from 'antd/lib/col'

import styles from '../Dashboard.less'

let ReactQuill

import Quill from 'quill'
let Size = Quill.import('attributors/style/size')
Size.whitelist = ['10px', '11px', '12px', '13px', '14px', '16px', '18px', '20px', '24px', '28px']
Quill.register(Size, true)

export class TextChart extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      editorLoaded: false,
      popClass: styles.popHide
    }

    import('react-quill').then(rq => {
      ReactQuill = rq
      this.setState({
        editorLoaded: true
      })
    })

    this.spliterSelectCallback = null
  }

  showSelectDiv = () => {
    const { popClass } = this.state
    this.setState({
      popClass: popClass === styles.popShow ? styles.popHide : styles.popShow
    })
  }

  onSelectItem = (c) => () => {
    this.setState({
      popClass: styles.popHide
    })
    TextChart.spliterSelectCallback(c)
  }

  render () {
    const {
      data,
      loading,
      editing,
      className,
      onTextEditorChange,
      chartParams
    } = this.props

    const { editorLoaded } = this.state

    let content = chartParams.richTextEdited
    if (content) {
      const keys = data.keys || []

      let dataValue = {}
      keys.forEach(key => {
        dataValue[key] = data.dataSource.map(item => item[key])
      })

      content.replace(/〖@dv_(.+?)_dv@〗/g, function (match, p1, p2) {
        if (dataValue.hasOwnProperty(p1)) {
          content = content.replace(match, dataValue[p1])
        }
      })
    }

    const editorContent = editorLoaded
    ? (
      <div className={`text-editor ${styles.textEditor}`}>
        <div id="toolbar">
          <select className="ql-header" onChange={e => e.persist()}>
            <option value="1" />
            <option value="2" />
            <option value="3" />
          </select>
          <select className="ql-font" />
          <select className={`ql-size ${styles.size}`} defaultValue="13px">
            <option value="10px">10px</option>
            <option value="11px">11px</option>
            <option value="12px">12px</option>
            <option value="13px">13px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="28px">28px</option>
          </select>
          <select className="ql-align" />
          <button className="ql-bold" />
          <button className="ql-italic" />
          <button className="ql-underline" />
          <button className="ql-strike" />
          <select className="ql-color" />
          <button className="ql-link" />
          <button className="ql-clean" />

          <button className={`ql-insertTitle ${styles.selectBtn}`} onClick={this.showSelectDiv}>
            <Icon type="select" className={styles.selectIcon} />
            <div className={this.state.popClass}>
              { data.keys
                ? data.keys.map(c => (<Col key={c}>
                  <ul onClick={this.onSelectItem(c)}>
                    <li key={c} className={styles.selectItem}>{c}</li>
                  </ul>
                </Col>))
                : ''
              }
            </div>
          </button>
        </div>
        <ReactQuill
          value={chartParams.richTextEdited}
          onChange={onTextEditorChange}
          className={styles.editor}
          modules={TextChart.modules}
          formats={TextChart.formats}
          theme={'snow'}
        />
      </div>
      )
      : (
        <p>编辑器加载中……</p>
      )

    const chartContent = loading
      ? (
        <div className={styles.scorecard}>
          <div className={styles.scorecardContainer}>
            <Icon type="loading" />
          </div>
        </div>
      )
      : (
        <div className={styles.textEditorContainer}>
          {
          editing
            ? editorContent
            : (<div className="ql-editor" dangerouslySetInnerHTML={{__html: content}} />)
          }
        </div>
      )

    return (
      <div className={className}>
        {chartContent}
      </div>
    )
  }
}

TextChart.propTypes = {
  data: PropTypes.object,
  loading: PropTypes.bool,
  editing: PropTypes.bool,
  className: PropTypes.string,
  chartParams: PropTypes.object,
  onTextEditorChange: PropTypes.func
}

TextChart.defaultProps = {
  chartParams: {}
}

TextChart.modules = {
  toolbar: {
    container: '#toolbar',
    handlers: {
      insertTitle: function () {
        TextChart.spliterSelectCallback = (item) => {
          const cursorPosition = this.quill.getSelection().index
          this.quill.insertText(cursorPosition, `〖@dv_${item}_dv@〗`)
          this.quill.setSelection(cursorPosition + 1)
        }
      }
    }
  },
  clipboard: {
    matchVisual: false
  }
}

TextChart.formats = [
  'header', 'font', 'size', 'align',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent', 'ordered',
  'link', 'image', 'color'
]

export function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(null, mapDispatchToProps)(TextChart)
