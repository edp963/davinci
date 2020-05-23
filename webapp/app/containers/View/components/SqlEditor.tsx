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
import debounce from 'lodash/debounce'

import CodeMirror from 'codemirror/lib/codemirror'
import 'codemirror/lib/codemirror.css'
import 'assets/override/codemirror_theme.css'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/mode/sql/sql'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/sql-hint'
import 'codemirror/addon/display/placeholder'

import Styles from '../View.less'

interface ISqlEditorProps {
  hints: {
    [name: string]: []
  }
  value: string
  onSqlChange: (sql: string) => void
  onSqlEnter: () => void
}

export class SqlEditor extends React.PureComponent<ISqlEditorProps> {

  private sqlEditorContainer = React.createRef<HTMLTextAreaElement>()
  private sqlEditor
  private debouncedSqlChange = debounce((val: string) => { this.props.onSqlChange(val) }, 500)

  constructor (props) {
    super(props)
  }

  public componentDidMount () {
    this.initEditor(CodeMirror, this.props.value)
  }

  public componentDidUpdate () {
    if (this.sqlEditor) {
      const { value } = this.props
      const localValue = this.sqlEditor.doc.getValue()
      if (value !== localValue) {
        this.sqlEditor.doc.setValue(this.props.value)
      }
    }
  }

  private initEditor = (codeMirror, value: string) => {
    const { fromTextArea } = codeMirror
    const config = {
      mode: 'text/x-sql',
      theme: '3024-day',
      lineNumbers: true,
      lineWrapping: false,
      autoCloseBrackets: true,
      matchBrackets: true,
      foldGutter: true,
      extraKeys: {
        'Cmd-Enter': () => { this.props.onSqlEnter() },
        'Ctrl-Enter': () => { this.props.onSqlEnter() }
      }
    }
    this.sqlEditor = fromTextArea(this.sqlEditorContainer.current, config)
    this.sqlEditor.doc.setValue(value)
    this.sqlEditor.on('change', (_: CodeMirror.Editor, change: CodeMirror.EditorChange) => {
      this.debouncedSqlChange(_.getDoc().getValue())

      if (change.origin === '+input'
          && change.text[0] !== ';'
          && change.text[0].trim() !== ''
          && change.text[1] !== '') {
        this.sqlEditor.showHint({
          completeSingle: false,
          tables: this.props.hints
        })
      }
    })
  }

  public render () {
    return (
      <div className={Styles.sqlEditor}>
        <textarea ref={this.sqlEditorContainer} />
      </div>
    )
  }
}

export default SqlEditor
