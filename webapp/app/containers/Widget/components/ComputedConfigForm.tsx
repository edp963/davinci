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
import { FormComponentProps } from 'antd/lib/form'
import { Form, Input, Select, Button, Row, Col, Menu, Tabs } from 'antd'
const FormItem = Form.Item
const Option = Select.Option
const Search = Input.Search
const TabPane = Tabs.TabPane

import { uuid } from 'utils/util'
const codeMirror = require('codemirror/lib/codemirror')
const utilStyles = require('assets/less/util.less')
import sqlFunctions from 'assets/sqlFunctionName/sqlFns'
import 'codemirror/lib/codemirror.css'
import 'assets/override/codemirror_theme.css'
require('codemirror/mode/javascript/javascript')
import 'codemirror/addon/lint/lint.css'
require('codemirror/addon/hint/javascript-hint')
require('codemirror/addon/lint/json-lint')
require('codemirror/addon/lint/css-lint')
require('codemirror/addon/lint/lint')
require('codemirror/addon/lint/javascript-lint')
require('codemirror/addon/lint/json-lint')
require('codemirror/addon/lint/css-lint')
const styles = require('../Widget.less')

interface IComputedConfigFormProps {
  form: any,
  onSave: (obj: any) => void,
  onClose: () => void,
  categories: any,
  queryInfo: any
  selectedComputed: object
}

interface IComputedConfigFormStates {
  variableNumber: number
  categories: any
  filterFunction: string
  queryInfo: string[]
}
export class ComputedConfigForm extends React.Component<IComputedConfigFormProps & FormComponentProps, IComputedConfigFormStates> {
  private Editor: any
  constructor(props) {
    super(props)
    this.state = {
      variableNumber: 1,
      queryInfo: [],
      categories: [],
      filterFunction: ''
    }
    this.Editor = false
  }

  public componentWillMount() {
    const { queryInfo, categories } = this.props
    this.setState({
      queryInfo,
      categories
    })
  }

  public componentDidMount() {
    const queryTextarea = document.querySelector('#sql_tmpl')
    this.handleTmplCodeMirror(queryTextarea)
  }

  public componentWillReceiveProps(nextProps) {
    const { selectedComputed } = nextProps
    if (selectedComputed && selectedComputed.sqlExpression) {
      this.Editor.doc.setValue(selectedComputed.sqlExpression)
    } else {
      this.Editor.doc.setValue('')
    }
  }

  private customDvSqlMode = () => {
    const { categories, queryInfo } = this.props
    const highLightFields = categories.map((cate) => `${cate.name}`)
    const hightLightQuery = [...queryInfo]
    codeMirror.defineMode('dvSqlMode', (e, t) => {
      function r(t, r) {
        const o = t.next()
        if (p[o]) {
          const i = p[o](t, r, '{' === o ? hightLightQuery : highLightFields)
          if (i !== !1) {
            return i
          }
        }
        if ((1 == m.nCharCast && ("n" == o || "N" == o) || 1 == m.charsetCast && "_" == o && t.match(/[a-z][a-z0-9]*/i)) && ("'" == t.peek() || '"' == t.peek()))
          return "keyword";
        if (/^[\(\),\;\[\]\{\}]/.test(o))
          return null;
        if ("." != o) {
          if (d.test(o))
            return t.eatWhile(d),
              "operator";
          if ("{" == o && (t.match(/^( )*(d|D|t|T|ts|TS)( )*'[^']*'( )*}/) || t.match(/^( )*(d|D|t|T|ts|TS)( )*"[^"]*"( )*}/)))
            return "number";
          t.eatWhile(/^[_\w\d]/);
          const h = t.current().toLowerCase();
          return f.hasOwnProperty(h) && (t.match(/^( )+'[^']*'/) || t.match(/^( )+"[^"]*"/)) ? "number" : l.hasOwnProperty(h) ? "atom" : u.hasOwnProperty(h) ? "keyword" : c.hasOwnProperty(h) ? "builtin" : s.hasOwnProperty(h) ? "string-2" : null
        }
      }
      function o(e, t, r) {
        t.context = {
          prev: t.context,
          indent: e.indentation(),
          col: e.column(),
          type: r
        }
      }
      function i(e) {
        e.indent = e.context.indent,
          e.context = e.context.prev
      }
      const s = t.client || {}
      const l = t.atoms || {
        false: !0,
        true: !0,
        null: !0
      }
      const c = t.builtin || {}
      const u = t.keywords || {}
      const d = t.operatorChars || /^[\/\*\+\-%<>!=&|~^]/
      const m = t.support || {}
      const p = t.hooks || {}
      const f = t.dateSQL || {
        date: !0,
        time: !0,
        timestamp: !0
      }
      return {
        startState: () => {
          return {
            tokenize: r,
            context: null
          }
        },
        token: (e, t) => {
          if (e.sol() && t.context && null == t.context.align && (t.context.align = !1),
            e.eatSpace()) {
            return null
          }
          const r = t.tokenize(e, t)
          if ('comment' === r) {
            return r
          }
          t.context && null == t.context.align && (t.context.align = !0)
          const n = e.current()
          return "(" == n ? o(e, t, ")") : "[" == n ? o(e, t, "]") : t.context && t.context.type == n && i(t),
            r
        }
      }
    })
    function n(e, t, r) {
      for (var n, a = ""; null != (n = e.next());) {
        if ("]" == n && !e.eat("]"))
          return r && r.indexOf(a) < 0 ? "error" : "variable-2";
        a += n
      }
      return null
    }
    function a(e, t, r) {
      for (var n, a = ""; null != (n = e.next());) {
        if ("}" == n && !e.eat("}"))
          return r && r.indexOf(a) < 0 ? "error" : "variable-2";
        a += n
      }
      return null
    }
    function s(e) {
      for (var t = {}, r = e.split(" "), n = 0; n < r.length; ++n)
        t[r[n]] = !0;
      return t
    }
    const l = 'sum avg count max min median stddev stdev_pop stddev_samp var_pop var_samp variance percentiles percentile_cont percentile_disc'
    codeMirror.defineMIME('text/x-dv-sql-mode', {
      name: 'dvSqlMode',
      keywords: s(l),
      hooks: {
        '[': n,
        '{': a
      }
    })
    const hintList = sqlFunctions.map((fn) => fn.name).concat(categories.map((cate) => cate.name)).concat(queryInfo)
    codeMirror.registerHelper('hint', 'dvSqlMode', (cm) => {
      const cur = cm.getCursor()
      const token = cm.getTokenAt(cur)
      const start = token.start
      const end = cur.ch
      const str = token.string
      const list = hintList.filter((item) => {
        return item.indexOf(str) === 0
      })
      if (list.length) {
        return {
          list,
          from: codeMirror.Pos(cur.line, start),
          to: codeMirror.Pos(cur.line, end)
        }
      }
    })
  }


  private handleTmplCodeMirror = (queryWrapperDOM) => {
    this.customDvSqlMode()
    if (!this.Editor) {
      this.Editor = codeMirror.fromTextArea(queryWrapperDOM, {
        mode: 'text/x-dv-sql-mode',
        theme: '3024-day',
        width: '100%',
        height: '80px',
        lineNumbers: true,
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        foldGutter: true,
        gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter']
      })

      this.Editor.addKeyMap({
        'name': 'autoInsertParentheses',
        "'('": (cm) => {
          const cur = cm.getCursor()

          cm.replaceRange('()', cur, cur, '+insert')
          cm.doc.setCursor({ line: cur.line, ch: cur.ch + 1 })
        },
        "'['": (cm) => {
          const cur = cm.getCursor()

          cm.replaceRange('[]', cur, cur, '+insert')
          cm.doc.setCursor({ line: cur.line, ch: cur.ch + 1 })
        },
        "'{'": (cm) => {
          const cur = cm.getCursor()

          cm.replaceRange('{}', cur, cur, '+insert')
          cm.doc.setCursor({ line: cur.line, ch: cur.ch + 1 })
        }
      })
      this.Editor.on('change', function (editor, change) {
        if (change.origin === '+input') {
          const text = change.text
          setTimeout(function () { editor.execCommand('autocomplete') }, 50)
        }
      })
    }
  }


  private saveComputed = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { selectedComputed } = this.props
        const sqlExpression = this.Editor.doc.getValue()
        const { id, name, visualType } = this.props.form.getFieldsValue()
        console.log({ id })
        console.log({ selectedComputed })
        this.props.onSave({
          id: id ? id : uuid(8, 16),
          name,
          visualType,
          sqlExpression,
          title: 'computedField',
          from: selectedComputed ? selectedComputed['from'] : ''
        })
        this.closePanel()
      }
    })
  }

  private closePanel = () => {
    this.resetForm()
    this.props.onClose()
  }

  private resetForm = () => {
    this.Editor.doc.setValue('')
    this.props.form.resetFields()
  }

  private filterFunction = (value) => {
    this.setState({
      filterFunction: value
    })
  }

  private filterModel = (value) => {
    this.setState({
      categories: this.props.categories.filter((cate) => {
        return cate.name.indexOf(value) >= 0
      })
    })
  }

  private filterQuery = (value) => {
    this.setState({
      queryInfo: this.props.queryInfo.filter((query) => {
        return query.indexOf(value) >= 0
      })
    })
  }

  private triggerMenuItem = (params) => ({ item, key, keyPath }) => {
    const defaultValue = this.Editor.doc.getValue()
    let currentValue = ''
    switch (params) {
      case 'fn':
        currentValue = `${defaultValue}${key}()`
        break
      case 'category':
        currentValue = `${defaultValue}[${key}]`
        break
      case 'query':
        currentValue = `${defaultValue}{${key}}`
        break
      default:
        break
    }
    this.Editor.doc.setValue(currentValue)
  }

  public render() {
    const {
      form
    } = this.props
    const {
      queryInfo,
      categories,
      variableNumber,
      filterFunction
    } = this.state

    const { getFieldDecorator } = form

    const controlTypeOptions = [
      { text: '文本', value: 'string' },
      { text: '数值', value: 'number' },
      { text: '日期', value: 'date' }
    ].map((o) => (
      <Option key={o.value} value={o.value}>{o.text}</Option>
    ))
    const functions = sqlFunctions.filter((func) => {
      return func.name.indexOf(filterFunction.toUpperCase()) >= 0
    })
    const functionSelectMenu = (
      <Menu onClick={this.triggerMenuItem('fn')}>
        {functions && functions.length ? functions.map((d, index) =>
          <Menu.Item key={`${d.name}`}>
            <a target="_blank" rel="noopener noreferrer" href="javascript:;">{d.name}</a>
          </Menu.Item>
        ) : []}
      </Menu>
    )
    const modelSelectMenu = (
      <Menu onClick={this.triggerMenuItem('category')}>
        {categories && categories.length ? categories.map((d, index) =>
          <Menu.Item key={`${d.name}`}>
            <a target="_blank" rel="noopener noreferrer" href="javascript:;">{d.name}</a>
          </Menu.Item>
        ) : []}
      </Menu>
    )

    const querySelectMenu = (
      <Menu onClick={this.triggerMenuItem('query')}>
        {queryInfo && queryInfo.length ? queryInfo.map((query, index) =>
          <Menu.Item key={`${query}`}>
            <a target="_blank" rel="noopener noreferrer" href="javascript:;">{query}</a>
          </Menu.Item>
        ) : []}
      </Menu>
    )
    return (
      <div className={styles.variableConfigForm}>
        <div className={styles.body}>
          <div className={styles.fields}>
            <div className={styles.fieldName}>
              <Form>
                <Row gutter={8}>
                  <Col span={12}>
                    <FormItem className={utilStyles.hide}>
                      {getFieldDecorator('id', {})(
                        <Input />
                      )}
                    </FormItem>
                    <FormItem>
                      {getFieldDecorator('name', {
                        rules: [{
                          required: true,
                          message: '计算字段名称不能为空'
                        }]
                      })(
                        <Input placeholder="计算字段名称" />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12} key="visualType">
                    <FormItem>
                      {getFieldDecorator('visualType', {
                        rules: [{
                          required: true,
                          message: '计算字段类型不能为空'
                        }]
                      })(
                        <Select placeholder="计算字段类型">
                          {controlTypeOptions}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </div>
            <div className={styles.tmplWrapper}>
              <textarea id="sql_tmpl" placeholder="输入SQL语句" />
            </div>
          </div>
          <div className={styles.options}>
            <div className={styles.cardContainer}>
              <Tabs defaultActiveKey="functions" size="small" tabPosition="right">
                <TabPane tab="函数" key="functions">
                  <div className={styles.menuWrapper}>
                    <Search
                      placeholder="Search the function"
                      onSearch={this.filterFunction}
                    />
                    {functionSelectMenu}
                  </div>
                </TabPane>
                <TabPane tab="字段" key="model">
                  <div className={styles.menuWrapper}>
                    <Search
                      placeholder="Search the function"
                      onSearch={this.filterModel}
                    />
                    {modelSelectMenu}
                  </div>
                </TabPane>
                <TabPane tab="变量" key="query">
                  <div className={styles.menuWrapper}>
                    <Search
                      placeholder="Search the function"
                      onSearch={this.filterQuery}
                    />
                    {querySelectMenu}
                  </div>
                </TabPane>
              </Tabs>
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <div className={styles.foot}>
            <Button onClick={this.closePanel}>取消</Button>
            <Button type="primary" onClick={this.saveComputed}>保存</Button>
          </div>
        </div>
      </div>
    )
  }
}

export default Form.create<IComputedConfigFormProps & FormComponentProps>()(ComputedConfigForm)

