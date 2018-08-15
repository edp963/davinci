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

import * as React from 'react'
const Icon = require('antd/lib/icon')
const Col = require('antd/lib/col')

const styles = require('../Dashboard.less')

let ReactQuill

interface ITextChartProps {
  data: any
  loading: boolean
  editing: boolean
  className: string
  chartParams: any
  onTextEditorChange: (content: any) => void
}

interface ITextChartStates {
  editorLoaded: boolean
  popClass: string
  sizeWhiteList: any[]
}

export class TextChart extends React.PureComponent<ITextChartProps, ITextChartStates> {
  constructor (props) {
    super(props)

    this.state = {
      editorLoaded: false,
      popClass: styles.popHide,
      sizeWhiteList: []
    }

    import('react-quill').then((rq) => {
      ReactQuill = rq

      const size = ReactQuill.Quill.import('attributors/style/size')
      size.whitelist = ['10px', '11px', '12px', '13px', '14px', '16px', '18px', '20px', '24px', '28px']
      ReactQuill.Quill.register(size, true)

      this.setState({
        sizeWhiteList: size.whitelist,
        editorLoaded: true
      })
    })
  }

  public static defaultProps = {
    chartParams: {}
  }

  public static spliterSelectCallback: (item: string) => void = null

  private modules = {
    toolbar: {
      container: '#toolbar',
      handlers: {
        insertTitle () {
          TextChart.spliterSelectCallback = (item) => {
            const cursorPosition = this.quill.getSelection().index
            this.quill.insertText(cursorPosition, `〖@dv_${item}_dv@〗`)
            this.quill.setSelection(cursorPosition + 1)
          }
        }
      }
    }
  }

  private formats = [
    'header', 'font', 'size', 'align',
    'bold', 'italic', 'underline', 'strike',
    'color', 'link', 'clean'
  ]

  private showSelectDiv = () => {
    this.setState({
      popClass: this.state.popClass === styles.popShow ? styles.popHide : styles.popShow
    })
  }

  private onSelectItem = (c) => () => {
    this.setState({
      popClass: styles.popHide
    })
    TextChart.spliterSelectCallback(c)
  }

  private selHeaderChange = (e) => e.persist()

  public render () {
    const {
      data,
      loading,
      editing,
      className,
      onTextEditorChange,
      chartParams
    } = this.props

    const {
      editorLoaded,
      popClass,
      sizeWhiteList
    } = this.state

    let content = chartParams.richTextEdited
    if (content) {
      const keys = data.keys || []

      const dataValue = {}
      keys.forEach((key) => {
        dataValue[key] = data.dataSource.map((item) => item[key])
      })

      content.replace(/〖@dv_(.+?)_dv@〗/g, function (match, p1) {
        if (dataValue.hasOwnProperty(p1)) {
          content = content.replace(match, dataValue[p1])
        }
      })
    }

    const editorContent = editorLoaded
      ? (
        <div className={`text-editor ${styles.textEditor}`}>
          <div id="toolbar">
            <select className="ql-header" onChange={this.selHeaderChange} />
            <select className="ql-font" />
            <select className={`ql-size ${styles.size}`} defaultValue="13px">
              {sizeWhiteList.map((i) => <option value={i} key={i}>{i}</option>)}
            </select>
            <select className="ql-align" />
            <button className="ql-bold" />
            <button className="ql-italic" />
            <button className="ql-underline" />
            <button className="ql-strike" />
            <select className="ql-color" />
            <button className="ql-link" />
            <button className="ql-clean" />

            <button
              className={`ql-insertTitle ${styles.selectBtn}`}
              onClick={this.showSelectDiv}
            >
              <Icon type="select" className={styles.selectIcon} />
              <div className={popClass}>
                {
                  data.keys
                    ? data.keys.map((c) => (
                      <Col key={c}>
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
            modules={this.modules}
            formats={this.formats}
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

export default TextChart
