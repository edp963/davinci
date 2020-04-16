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

import React, { useRef, useEffect, useCallback } from 'react'
import AceEditor, { IAceOptions } from 'react-ace'

import languageTools from 'ace-builds/src-min-noconflict/ext-language_tools'
import 'ace-builds/src-min-noconflict/ext-searchbox'
import 'ace-builds/src-min-noconflict/theme-textmate'
import 'ace-builds/src-min-noconflict/mode-sql'
import ReactAce, { IAceEditorProps } from 'react-ace/lib/ace'

import Styles from '../View.less'
import { debounce } from 'lodash'

type TMode =
  | 'sql'
  | 'mysql'
  | 'sqlserver'

type TTheme =
  | 'ambiance'
  | 'chaos'
  | 'chrome'
  | 'clouds'
  | 'dawn'
  | 'eclipse'
  | 'github'
  | 'kuroir'
  | 'terminal'
  | 'textmate'
  | 'tomorrow'
  | 'twilight'
  | 'xcode'

enum EHintMeta {
  table = 'table',
  variable = 'variable',
  column = 'column'
}
const THEME_DEFAULT = 'textmate'
const MODE_DEFAULT = 'sql'
const EDITOR_OPTIONS: IAceOptions = {
  behavioursEnabled: true,
  enableSnippets: false,
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: true,
  autoScrollEditorIntoView: true,
  wrap: true,
  useWorker: false,

}
export interface ISqlEditorProps {
  hints: { [name: string]: string[] }
  value: string
  /**
   * 需引入对应的包 'ace-builds/src-min-noconflict/mode-${mode}'
   */
  mode?: TMode
  /**
   * 需引入对应的包 'ace-builds/src-min-noconflict/theme-${theme}'
   */
  theme?: TTheme
  editorConfig?: IAceEditorProps
  sizeChanged?: number
  onSqlChange: (sql: string) => void
}

/**
 * Editor Component
 * @param props ISqlEditorProps
 */
function SqlEditor (props: ISqlEditorProps) {

  const refEditor = useRef<ReactAce>()

  const {
    hints,
    value,
    mode = MODE_DEFAULT,
    theme = THEME_DEFAULT,
    sizeChanged,
    editorConfig,
    onSqlChange
  } = props

  const resize = useCallback(debounce(() => {
    refEditor.current.editor.resize()
  }, 300), [])

  const change = useCallback(debounce((sql: string) => {
    onSqlChange(sql)
  }, 300), [])

  useEffect(() => {
    resize()
  }, [sizeChanged])

  useEffect(() => {
    setHintsPopover(hints)
  }, [hints])

  return (
    <div className={Styles.sqlEditor}>
      <AceEditor
        ref={refEditor}
        name="aceEditor"
        width="100%"
        height="100%"
        fontSize={14}
        placeholder={`Placeholder ${mode}`}
        mode={mode}
        theme={theme}
        value={value}
        showPrintMargin={false}
        highlightActiveLine={true}
        setOptions={EDITOR_OPTIONS}
        onChange={change}
        {...editorConfig}
      />
    </div>
  )
}


interface ICompleters {
  value: string
  name?: string
  caption?: string
  meta?: string
  type?: string
  score?: number
}

function setHintsPopover (hints: ISqlEditorProps['hints']) {
  const {
    textCompleter,
    keyWordCompleter,
    // snippetCompleter,
    setCompleters
  } = languageTools
  const customHintsCompleter = {
    identifierRegexps: [/[a-zA-Z_0-9.\-\u00A2-\uFFFF]/],
    getCompletions: (editor, session, pos, prefix, callback) => {
      const { tableKeywords, tableColumnKeywords, variableKeywords, columns } = formatCompleterFromHints(hints)
      if (prefix[prefix.length - 1] === '.') {
        const tableName = prefix.substring(0, prefix.length - 1)
        const AliasTableColumnKeywords = genAliasTableColumnKeywords(editor, tableName, hints)
        const hintList = tableKeywords.concat(variableKeywords, AliasTableColumnKeywords, tableColumnKeywords[tableName] || [])
        return callback(null, hintList)
      }
      callback(null, tableKeywords.concat(variableKeywords, columns))
    }
  }
  const completers = [
    textCompleter,
    keyWordCompleter,
    // snippetCompleter,
    customHintsCompleter
  ]
  setCompleters(completers)
}

function formatCompleterFromHints (hints: ISqlEditorProps['hints']) {
  const variableKeywords: ICompleters[] = []
  const tableKeywords: ICompleters[] = []
  const tableColumnKeywords: { [tableName: string]: ICompleters[] } = {}
  const columns: ICompleters[] = []
  let score = 1000
  Object.keys(hints).forEach((key) => {
    const meta: EHintMeta = isVariable(key)
    if (!meta) {
      const { columnWithTableName, column } = genTableColumnKeywords(hints[key], key)
      tableColumnKeywords[key] = columnWithTableName
      columns.push(...column)
      tableKeywords.push({ name: key, value: key, score: score--, meta: isTable() })
    } else {
      variableKeywords.push({ score: score--, value: key, meta })
    }
  })

  return { tableKeywords, tableColumnKeywords, variableKeywords, columns }
}

function genTableColumnKeywords (table: string[], tableName: string) {
  let score = 100
  const columnWithTableName: ICompleters[] = []
  const column: ICompleters[] = []
  table.forEach((columnVal) => {
    const basis = { score: score--, meta: isColumn() }
    columnWithTableName.push({
      caption: `${tableName}.${columnVal}`,
      name: `${tableName}.${columnVal}`,
      value: `${tableName}.${columnVal}`,
      ...basis
    })
    column.push({ value: columnVal, name: columnVal, ...basis })
  })
  return { columnWithTableName, column }
}

function genAliasTableColumnKeywords (editor, aliasTableName: string, hints: ISqlEditorProps['hints']) {
  const content = editor.getSession().getValue()
  const tableName = Object.keys(hints).find((tableName) => {
    const reg = new RegExp(`select.*from\\s+${tableName}(\\s+(as)|(AS))?(?=\\s+${aliasTableName}\\s+)`, 'igm')
    return reg.test(content)
  })
  if (!tableName) { return [] }
  const { columnWithTableName } = genTableColumnKeywords(hints[tableName], aliasTableName)
  return columnWithTableName
}

function isVariable (key: string) {
  return key.startsWith('$') && key.endsWith('$') && EHintMeta.variable
}

function isTable (key?: string) {
  return EHintMeta.table
}

function isColumn (key?: string) {
  return EHintMeta.column
}

export default SqlEditor
