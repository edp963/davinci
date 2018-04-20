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

import styles from '../Dashboard.less'

let ReactQuill

export class TextChart extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      editorLoaded: false,
      content: ''
    }

    import('react-quill').then(rq => {
      ReactQuill = rq
      this.setState({
        editorLoaded: true
      })
    })
  }

  render () {
    const {
      // data,
      loading,
      editing,
      className,
      // chartParams,
      onTextEditorChange
    } = this.props

    const {
      editorLoaded,
      content
    } = this.state

    const editorContent = editorLoaded
      ? (
        <ReactQuill
          value={content}
          onChange={onTextEditorChange}
          className={styles.editor}
        />
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
              : (
                <div>显示编辑好的文本</div>
              )
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
  // id: PropTypes.string,
  // data: PropTypes.object,
  loading: PropTypes.bool,
  editing: PropTypes.bool,
  className: PropTypes.string,
  // chartParams: PropTypes.object,
  onTextEditorChange: PropTypes.func
}

TextChart.defaultProps = {
  chartParams: {}
}

export function mapDispatchToProps (dispatch) {
  return {

  }
}

export default connect(null, mapDispatchToProps)(TextChart)
