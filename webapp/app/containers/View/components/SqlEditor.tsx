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

import Styles from '../View.less'

interface ISqlEditorProps {
  // hintItems: string[]
  onSqlChange: (sql: string) => void
}

export class SqlEditor extends React.Component<ISqlEditorProps> {

  private sqlEditor = React.createRef<HTMLTextAreaElement>()

  constructor (props) {
    super(props)

    require([
      'codemirror/lib/codemirror',
      'codemirror/lib/codemirror.css',
      'assets/override/codemirror_theme.css',
      'codemirror/addon/hint/show-hint.css',
      'codemirror/addon/edit/matchbrackets',
      'codemirror/mode/sql/sql',
      'codemirror/addon/hint/show-hint',
      'codemirror/addon/hint/sql-hint',
      'codemirror/addon/display/placeholder'
    ], (CodeMirror) => {
      console.log(CodeMirror)
      this.initEditor(CodeMirror)
    })
  }

  private initEditor = (codeMirror) => {
    const { fromTextArea } = codeMirror
    const config = {
      mode: 'text/x-sql',
      theme: '3024-day',
      lineNumbers: true,
      lineWrapping: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      foldGutter: true
    }
    const editor = fromTextArea(this.sqlEditor.current, config)
    editor.on('change', (_: CodeMirror.Editor, change: CodeMirror.EditorChange) => {
      this.props.onSqlChange(_.getDoc().getValue())
    //   if (change.origin )

    //   editor.showHint({
    //     completeSingle: false,
    //     hint: () => ({
    //       from:
    //       list: [{ }, {}]
    //     })
    //   })
    })
  }

  public render () {
    return (
      <div className={Styles.sqlEditor}>
        <textarea ref={this.sqlEditor} />
      </div>
    )
  }
}

export default SqlEditor
