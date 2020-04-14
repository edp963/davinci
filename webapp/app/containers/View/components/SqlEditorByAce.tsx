import React, { useRef, useEffect, useCallback } from 'react'
import AceEditor from 'react-ace'

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
  | 'javascript'
  | 'typescript'
  | 'json'
  | 'python'
  | 'html'
  | 'java'
  | 'xml'
  | 'golang'
  | 'markdown'

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

export interface ISqlEditorProps {
  hints: { [name: string]: string[] }
  value: string
  mode?: TMode
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

  // useEffect(() => {
  //   import(`ace-builds/src-min-noconflict/theme-${theme}`)
  //   import(`ace-builds/src-min-noconflict/mode-${mode}`)
  //   if (editorConfig && editorConfig.enableSnippets) {
  //     import(`ace-builds/src-min-noconflict/snippets/${mode}`)
  //   }
  // }, [mode, theme])

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
        enableLiveAutocompletion={true}
        setOptions={{ useWorker: false }}
        onChange={change}
        {...editorConfig}
      />
    </div>
  )
}


interface ICompleters {
  value: string
  caption?: string
  meta?: string
  type?: string
  score?: number
}

function setHintsPopover (hints: ISqlEditorProps['hints']) {
  const {
    textCompleter,
    keyWordCompleter,
    snippetCompleter,
    setCompleters
  } = languageTools
  const customHints = formatCompleterFromHints(hints)
  const customHintsCompleter = {
    getCompletions: (editor, session, pos, prefix, callback) => {
      callback(null, customHints)
    }
  }
  const completers = [
    textCompleter,
    keyWordCompleter,
    snippetCompleter,
    customHintsCompleter
  ]
  setCompleters(completers)
}

function formatCompleterFromHints (hints: ISqlEditorProps['hints']): ICompleters[] {
  const hintList = []
  const basis = { score: 100 }
  Object.keys(hints).forEach((key) => {
    Object.assign(basis, { value: key })
    const meta: EHintMeta = isVariable(key)
    if (!meta) {
      if (hints[key].length > 0) {
        hints[key].forEach((columnVal) => {
          hintList.push({ ...basis, value: columnVal, meta: isColumn() })
        })
      }
      hintList.push({ ...basis, meta: isTable() })
    } else {
      hintList.push({ ...basis, meta })
    }
  })
  return hintList
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
