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
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'
import { InjectedRouter } from 'react-router/lib/Router'

import { compose } from 'redux'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'
import reducer from '../App/reducer'
import saga from '../App/sagas'
import bizlogicReducer from './reducer'
import bizlogicSaga from './sagas'
import sourceReducer from '../Source/reducer'
import sourceSaga from '../Source/sagas'

import 'codemirror/lib/codemirror.css'
import '../../assets/override/codemirror_theme.css'
import 'codemirror/addon/hint/show-hint.css'
const codeMirror = require('codemirror/lib/codemirror')
require('codemirror/addon/edit/matchbrackets')
require('codemirror/mode/sql/sql')
require('codemirror/addon/hint/show-hint')
require('codemirror/addon/hint/sql-hint')
require('codemirror/addon/display/placeholder')

const Form = require('antd/lib/form')
const Checkbox = require('antd/lib/checkbox')
const Radio = require('antd/lib/radio')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Input = require('antd/lib/input')
const Select = require('antd/lib/select')
const Button = require('antd/lib/button')
const Icon = require('antd/lib/icon')
const Tabs = require('antd/lib/tabs')
const Table = require('antd/lib/table')
const Alert = require('antd/lib/alert')
const Tree = require('antd/lib/tree').default
const message = require('antd/lib/message')
const Tooltip = require('antd/lib/tooltip')

const TreeNode = Tree.TreeNode
const Search = Input.Search
const FormItem = Form.Item
const Option = Select.Option
const TabPane = Tabs.TabPane
const RadioGroup = Radio.Group
const RadioButton = Radio.Button

const utilStyles = require('../../assets/less/util.less')
const styles = require('./Bizlogic.less')
import { uuid, generateData } from '../../utils/util'
import { SQL_NUMBER_TYPES, SQL_FIELD_TYPES } from '../../globalConstants'

import {
  makeSelectSqlValidateCode,
  makeSelectSqlValidateMsg,
  makeSelectExecuteLoading,
  makeSelectModalLoading,
  makeSelectBizlogics
 } from './selectors'
import { projectsCheckName, hideNavigator } from '../App/actions'
import { loadSchema, executeSql, addBizlogic, editBizlogic } from './actions'
import { makeSelectSources } from '../Source/selectors'
import { loadSources } from '../Source/actions'

interface IBizlogicFormProps {
  router: InjectedRouter
  type: string
  sources: boolean | any[]
  onInitExecuteSql: (sourceId: number) => any
  onModelChange: (record: string, item: string, value: string) => any
  onTmplCodeMirrorChange: (queryTextarea: any) => any
  onCodeMirrorPrompt: (generateData: any) => any
  sqlValidateCode: boolean | number
  sqlValidateMessage: boolean | string
  form: any
  route: any
  params: any
  onCheckName: (
    projectId: number,
    id: number,
    name: string,
    type: string,
    resolve: (res: any) => void,
    reject: (err: any) => void
  ) => any
  onLoadSchema: (sourceId: number, resolve: any) => any
  bizlogics: boolean | any[]
  executeLoading: boolean
  modalLoading: boolean
  onExecuteSql: (sourceId: number, sql: any, resolve: any) => any
  onAddBizlogic: (values: object, resolve: any) => any
  onEditBizlogic: (values: object, resolve: any) => any
  onHideNavigator: () => void
  onLoadSources: (projectId: number) => any
}

interface IBizlogicFormState {
  expandedKeys: any[]
  searchValue: string
  autoExpandParent: boolean
  modelType: string
  dataList: any[]
  sourceIdGeted: number
  isDeclarate: string
  isShowSqlValidateAlert: boolean
  executeResultset: any[]
  executeColumns: any[]
  schemaData: any[]
}

declare interface IObjectConstructor {
  assign (...objects: object[]): object
}

export class Bizlogic extends React.Component<IBizlogicFormProps, IBizlogicFormState> {
  private codeMirrorInstanceOfDeclaration: any
  private codeMirrorInstanceOfQuerySQL: any
  private asyncValidateResult: any
  constructor (props) {
    super(props)
    this.state = {
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
      modelType: '',
      dataList: [],
      sourceIdGeted: 0,
      isDeclarate: 'no',
      isShowSqlValidateAlert: false,
      executeResultset: [],
      executeColumns: [],
      schemaData: []
    }
    this.codeMirrorInstanceOfDeclaration = false
    this.codeMirrorInstanceOfQuerySQL = false
  }

  public componentWillMount () {
    this.props.onLoadSources(this.props.params.pid)
  }

  public componentWillReceiveProps (nextProps) {
    const { route, onLoadSchema } = this.props
    const { sources } = nextProps
    if ((sources as any[]).length) {
      onLoadSchema(sources[0].id, (result) => {
        this.setState({
          schemaData: result,
          sourceIdGeted: sources[0].id
        }, () => {
          this.promptCodeMirror(generateData(this.state.schemaData))
        })
      })
    } else {
      return
    }
  }

  public componentDidMount () {
    const { params, sources, bizlogics } = this.props
    const { isDeclarate, schemaData } = this.state

    this.props.onHideNavigator()

    this.generateList(generateData(schemaData))
    const queryTextarea = document.querySelector('#sql_tmpl')
    this.handleTmplCodeMirror(queryTextarea)

    if (params.bid) {
      const {
        name,
        description,
        sourceId,
        sql,
        model,
        config
      } = (this.props.bizlogics as any[]).find((b) => b.id === Number(params.bid))
      const dec = (sql.includes('{') && sql.substring(0, sql.lastIndexOf('{')) !== '')

      if (model) {
        const modelObj = JSON.parse(model)
        const modelArr = []
        for (const o in modelObj) {
          if (modelObj.hasOwnProperty(o)) {
            modelArr.push((Object as IObjectConstructor).assign({}, { name: o }, modelObj[o]))
          }
        }
        this.setState({ executeColumns : modelArr })
      } else {
        this.setState({ executeColumns : [] })
      }

      this.props.onExecuteSql(sourceId, sql, (result) => {
        this.setState({
          executeResultset: result.resultset
        })
      })

      this.props.form.setFieldsValue({
        id: Number(params.bid),
        name,
        desc: description,
        source_id: `${sourceId}`,
        isDeclarate: dec ? 'yes' : 'no'
      })

      if (dec) {
        this.setState({
          isDeclarate: 'yes'
        }, () => {
          const declareTextarea = document.querySelector('#declaration')
          this.handleDelareCodeMirror(declareTextarea)
          this.codeMirrorInstanceOfDeclaration.doc.setValue(sql.includes('{') ? sql.substring(0, sql.lastIndexOf('{')) : sql)
        })
      } else {
        this.codeMirrorInstanceOfDeclaration = false
      }

      this.codeMirrorInstanceOfQuerySQL.doc.setValue(sql.includes('{') ? sql.substring(sql.indexOf('{') + 1, sql.lastIndexOf('}')) : '')
    }
  }

  private checkNameUnique = (rule, value = '', callback) => {
    const { onCheckName, type, route, params } = this.props
    const { getFieldsValue } = this.props.form
    const { id } = getFieldsValue()
    const idName = route.path === '/project/:pid/bizlogic' ? '' : id
    const typeName = 'view'
    onCheckName(params.pid, idName, value, typeName,
      () => {
        callback()
      }, (err) => {
        callback(err)
      })
  }

  private changeIsDeclarate  = (e) => {
    this.setState({
      isDeclarate: e.target.value
    }, () => {
      const declareTextarea = document.querySelector('#declaration')
      this.handleDelareCodeMirror(declareTextarea)
    })
  }

  private handleDelareCodeMirror = (declareWrapperDom) => {
    if (!this.codeMirrorInstanceOfDeclaration) {
      this.codeMirrorInstanceOfDeclaration = codeMirror.fromTextArea(declareWrapperDom, {
        mode: 'text/x-sql',
        theme: '3024-day',
        // width: '100%',
        // height: '100%',
        lineNumbers: true,
        lineWrapping: true
      })
      this.codeMirrorInstanceOfDeclaration.setSize('100%', 100)
    }
  }

  private handleTmplCodeMirror = (queryWrapperDOM) => {
    if (!this.codeMirrorInstanceOfQuerySQL) {
      this.codeMirrorInstanceOfQuerySQL = codeMirror.fromTextArea(queryWrapperDOM, {
        mode: 'text/x-sql',
        theme: '3024-day',
        lineNumbers: true,
        // width: '100%',
        // height: '100%',
        lineWrapping: true
      })
      this.codeMirrorInstanceOfQuerySQL.setSize('100%', 181)
    }
  }

  private promptCodeMirror = (data) => {
    this.codeMirrorInstanceOfQuerySQL.on('change', (editor, change) => {
      const tableDatas = {}
      if (data) {
        data.forEach((i) => {
          const { children, title } = i
          const childArr = []
          children.forEach((j) => {
            childArr.push(j.title)
          })
          tableDatas[title] = childArr
        })
      }

      let obj = {}
      if (this.codeMirrorInstanceOfDeclaration) {
        const declareValue = this.codeMirrorInstanceOfDeclaration.getValue()
        const declareParams = (declareValue.match(/query@var\s\$\w+\$/g) || [])
          .map((qv) => qv.substring(qv.indexOf('$'), qv.lastIndexOf('$') + 1))

        declareParams.forEach((d) => {
          obj[d] = []
        })
      } else {
        obj = {}
      }

      this.codeMirrorInstanceOfQuerySQL.on('change', (editor, change) => {
        if (change.origin === '+input') {
          this.codeMirrorInstanceOfQuerySQL.showHint({
            completeSingle: false,
            tables: (Object as IObjectConstructor).assign({}, obj, tableDatas)
          })
        }
      })
    })
  }

  private generateList = (data) => {
    data.forEach((i) => {
      const key = i.key
      this.state.dataList.push({ key, title: key })
      if (i.children) {
        // this.generateList(node.children, node.key)
      }
    })
  }

  private getParentKey = (key, tree) => {
    let parentKey
    tree.forEach((i) => {
      if (i.children) {
        if (i.children.some((item) => item.key === key)) {
          parentKey = i.key
        } else if (this.getParentKey(key, i.children)) {
          parentKey = this.getParentKey(key, i.children)
        }
      }
    })
    return parentKey
  }

  private selectSource = (sourceId) => {
    this.props.onLoadSchema(Number(sourceId), (result) => {
      this.setState({
        schemaData: result,
        sourceIdGeted: Number(sourceId)
      })
    })
  }

  private onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false
    })
  }

  private searchSchema = (e) => {
    const { dataList, schemaData } = this.state
    const value = e.target.value
    const expandedKeys = dataList.map((item) => {
      if (item.key.indexOf(value) > -1) {
        return this.getParentKey(item.key, generateData(schemaData))
      }
      return null
    }).filter((item, i, self) => item && self.indexOf(item) === i)
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true
    })
  }

  private executeSql = () => {
    const { getFieldValue } = this.props.form
    const { sourceIdGeted } = this.state

    const sqlTmpl = this.codeMirrorInstanceOfQuerySQL.getValue()
    const sql = this.codeMirrorInstanceOfDeclaration
      ? `${this.codeMirrorInstanceOfDeclaration.getValue()}{${sqlTmpl}}`
      : `{${sqlTmpl}}`
    this.props.onExecuteSql(sourceIdGeted, sql, (result) => {
      if (result) {
        const { resultset, columns } = result

        // todo: fieldType判断
        columns.map((i) => {
          i.fieldType = SQL_FIELD_TYPES.indexOf(i.type) < 0 ? 'type3' : 'type2'
          i.modelType = SQL_NUMBER_TYPES.indexOf(i.type) < 0 ? '维度' : '度量'
          i.isLocationInfo = false
          return i
        })
        this.setState({
          executeResultset: resultset,
          executeColumns: columns
        })
      }
    })
    this.asyncValidateResult = setTimeout(() => {
      this.setState({isShowSqlValidateAlert: true})
    }, 100)
  }

  private selectModelItem = (record, item) => (val) => {
    const { executeColumns } = this.state
    const obj = {
      name: record.name,
      type: record.type,
      key: record.key,
      fieldType: item === 'filedType' ? val : record.fieldType,
      modelType: item === 'modelType' ? val.target.value : record.modelType,
      isLocationInfo: item === 'isLocationInfo' ? !record.isLocationInfo : record.isLocationInfo
    }
    executeColumns.splice(executeColumns.findIndex((c) => c.name === record.name), 1, obj)
    this.setState({
      executeColumns: executeColumns.slice()
    })
  }

  private onModalOk = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { executeColumns, isDeclarate } = this.state
        const { sqlValidateCode, route, params } = this.props

        const { id, name, desc, source_id } = values
        const sqlTmpl = this.codeMirrorInstanceOfQuerySQL.doc.getValue()
        let querySql = ''
        if (this.codeMirrorInstanceOfDeclaration) {
          const declaration = this.codeMirrorInstanceOfDeclaration.doc.getValue()
          querySql = sqlTmpl ? `${declaration}{${sqlTmpl}}` : declaration
        } else {
          querySql = sqlTmpl ? `{${sqlTmpl}}` : ''
        }

        if (querySql && !executeColumns.length) {
          message.warning('请先 Execute sql！', 3)
        } else {
          const modelObj = {}
          executeColumns.forEach((m) => {
            const { name, type, fieldType, modelType, isLocationInfo  } = m
            modelObj[name] = {
              type,
              fieldType,
              modelType,
              isLocationInfo
            }
          })

          const requestValue = {
            name,
            description: desc,
            sourceId: Number(source_id),
            sql: querySql,
            model: sqlValidateCode === 200 ? JSON.stringify(modelObj) : '',
            config: ''
          }

          if (route.path === '/project/:pid/bizlogic') {
            this.props.onAddBizlogic((Object as IObjectConstructor).assign({}, requestValue, { projectId: params.pid }), () => {
              this.hideForm()
            })
          } else {
            this.props.onEditBizlogic((Object as IObjectConstructor).assign({}, requestValue, { id }), () => {
              this.hideForm()
            })
          }
        }
      }
    })
  }

  private hideForm = () => {
    this.setState({
      executeResultset: [],
      executeColumns: [],
      isDeclarate: 'no'
    }, () => {
      this.codeMirrorInstanceOfDeclaration = false
      // this.codeMirrorInstanceOfQuerySQL = false
      this.setState({
        isShowSqlValidateAlert: false
      })
    })

    this.props.form.resetFields()
    this.props.router.push(`/project/${this.props.params.pid}/bizlogics`)
  }

  public componentWillUnmount () {
    clearTimeout(this.asyncValidateResult)
  }

  public render () {
    const {
      form,
      sources,
      sqlValidateCode,
      sqlValidateMessage,
      executeLoading,
      modalLoading,
      route
    } = this.props
    const { getFieldDecorator } = form
    const {
      searchValue,
      expandedKeys,
      autoExpandParent,
      isDeclarate,
      isShowSqlValidateAlert,
      executeResultset,
      executeColumns,
      schemaData
    } = this.state

    const itemStyle = {
      labelCol: { span: 2 },
      wrapperCol: { span: 22 }
    }

    const tableData = executeResultset
      ? executeResultset.map((i) => {
        // i.key = uuid()
        return i
      })
      : []
    const modelData = executeColumns
      ? executeColumns.map((i) => {
        // i.key = uuid()
        return i
      })
      : []

    console.log('source', sources)
    let sourceOptions = []
    if (sources) {
      sourceOptions = (sources as any[]).map((s) => (
        <Option key={`${s.id}`} value={`${s.id}`}>{s.name}</Option>
      ))
    }

    const tableDataKey = []
    for (const key in tableData[0]) {
      if (tableData[0].hasOwnProperty(key)) {
        tableDataKey.push(key)
      }
    }
    const tableColumns = []
    tableDataKey.forEach((k, index) => {
      // if (k !== 'key') {
        tableColumns.push({
          title: k,
          dataIndex: k,
          // key: k,
          className: `${utilStyles.textAlignLeft}`,
          width: 80
        } as any)
      // }
    })

    const optionSource = SQL_FIELD_TYPES.map((opt) => <Option key={opt} value={opt}>{opt}</Option>)

    const modelColumns = [{
      title: '表名',
      dataIndex: 'name',
      className: `${utilStyles.textAlignLeft}`,
      key: 'name',
      width: '25%'
    }, {
      title: '字段类型',
      dataIndex: 'filedType',
      className: `${utilStyles.textAlignLeft}`,
      key: 'filedType',
      width: '25%',
      render: (text, record) => {
        return (
          <Select
            size="small"
            style={{ width: '50%' }}
            value={record.fieldType}
            onChange={this.selectModelItem(record, 'filedType')}
          >
            {optionSource}
          </Select>
        )
      }
    }, {
      title: '类型',
      dataIndex: 'modelType',
      key: 'tmodelTypeype',
      className: `${utilStyles.textAlignLeft}`,
      width: '25%',
      render: (text, record) => (
        <RadioGroup
          options={['维度', '度量']}
          value={record.modelType}
          onChange={this.selectModelItem(record, 'modelType')}
        />)
    }, {
      title: '是否为地理位置信息',
      dataIndex: 'isLocationInfo',
      key: 'isLocationInfo',
      className: `${utilStyles.textAlignLeft}`,
      render: (text, record) => (
        <Checkbox
          onChange={this.selectModelItem(record, 'isLocationInfo')}
          checked={record.isLocationInfo}
        />
      )
    }]

    let sqlValidatePanel
    if (isShowSqlValidateAlert) {
      if (sqlValidateCode) {
        sqlValidatePanel = (
          <Col span={21} offset={2} className={styles.fromSqlAlert}>
            <Alert
              message={`syntax check ${sqlValidateCode === 200 ? 'success' : 'error'}`}
              description={`${sqlValidateMessage || ''}`}
              type={`${sqlValidateCode === 200 ? 'success' : 'error'}`}
              showIcon
            />
          </Col>)
      } else {
        sqlValidatePanel = ''
      }
    } else {
      sqlValidatePanel = ''
    }

    const data = []
    generateData(schemaData).forEach((item) => {
      const index = item.key.search(searchValue)

      if (index >= 0) {
        data.push(item)
      } else {
        if (item.children) {
          const child = []
          item.children.forEach((c) => {
            const cIndex = c.key.search(searchValue)
            if (cIndex >= 0) {
              child.push(c)

              const obj = {
                title: item.title,
                key: item.key,
                children: child
              }
              if (child.length > 1) {
                return
              } else {
                data.push(obj)
              }
            }
          })
        }
      }
    })

    const loop = (data) => data.map((item) => {
      if (item.children) {
        return (
          <TreeNode key={item.key} title={item.key}>
            {loop(item.children)}
          </TreeNode>
        )
      }
      return <TreeNode key={item.key} title={item.key} />
    })

    return (
      <div className={styles.bizlogic}>
        <div className={styles.header}>
          <span className={styles.historyBack}>
            <Tooltip placement="bottom" title="返回">
              <Icon type="left-circle-o" className={styles.backIcon} onClick={this.hideForm} />
            </Tooltip>
          </span>
          <span className={styles.title}>
              {`${route.path === '/project/:pid/bizlogic' ? '新增' : '修改'} View`}
          </span>
        </div>
        <Form className={styles.formView}>
        <Row className={`${styles.formLeft} no-item-margin`}>
          <Col span={24} className={styles.leftInput}>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('id', {
                hidden: this.props.type === 'add'
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="名称" >
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  message: 'Name 不能为空'
                }, {
                  validator: this.checkNameUnique
                }]
              })(
                <Input placeholder="Name" />
              )}
            </FormItem>
            <FormItem label="描述" >
              {getFieldDecorator('desc', {
                initialValue: ''
              })(
                <Input placeholder="Description" />
              )}
            </FormItem>
            <FormItem label="Source" >
              {getFieldDecorator('source_id', {
                initialValue: (sources as any[]).length ? `${sources[0].id}` : ''
              })(
                <Select onChange={this.selectSource}>
                  {sourceOptions}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={24} className={styles.treeSearch}>
            <Search
              placeholder="Search"
              onChange={this.searchSchema}
            />
          </Col>
          <Col span={24} className={styles.sourceTree}>
            <Tree
              showLine
              onExpand={this.onExpand}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
            >
            {loop(data || [])}
            </Tree>
          </Col>
        </Row>
        <Row className={styles.formRight}>
          <Row className={`${styles.formTop} small-item-margin`}>
            <Col span={24}>
              <FormItem label="声明变量" {...itemStyle}>
                {getFieldDecorator('isDeclarate', {
                  initialValue: 'no'
                })(
                  <RadioGroup size="default" onChange={this.changeIsDeclarate}>
                    <RadioButton value="yes">是</RadioButton>
                    <RadioButton value="no">否</RadioButton>
                  </RadioGroup>
                )}
              </FormItem>
            </Col>
            <Col span={24} className={isDeclarate === 'no' ? styles.noDeclaration : ''}>
              <FormItem label="">
                {getFieldDecorator('declaration', {
                  initialValue: ''
                })(
                  <Input
                    placeholder="Declare Variables"
                    type="textarea"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={24} className="no-item-margin">
              <FormItem label="">
                {getFieldDecorator('sql_tmpl', {
                  initialValue: ''
                })(
                  <Input
                    placeholder="QUERY SQL Template"
                    type="textarea"
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          {sqlValidatePanel}
          <Row className={styles.fromBtn}>
            <Button
              key="forward"
              size="default"
              type="primary"
              loading={executeLoading}
              onClick={this.executeSql}
            >
              <Icon type="caret-right" />Execute
            </Button>
          </Row>
          <Row className={styles.formBottom}>
            <Col span={23}>
              <Tabs defaultActiveKey="data">
                <TabPane tab="Data" key="data">
                  <Table
                    dataSource={tableData}
                    columns={tableColumns}
                    pagination={false}
                    // scroll={{ y:  }}
                  />
                </TabPane>
                <TabPane tab="Model" key="model">
                  <Table
                    dataSource={modelData}
                    columns={modelColumns}
                    pagination={false}
                    // scroll={{y: }}
                  />
                </TabPane>
              </Tabs>
            </Col>
          </Row>
        </Row>
      </Form>
        <Button
          className={styles.footBtn}
          size="large"
          type="primary"
          loading={modalLoading}
          onClick={this.onModalOk}
        >
          保存
        </Button>
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  sqlValidateCode: makeSelectSqlValidateCode(),
  sqlValidateMessage: makeSelectSqlValidateMsg(),
  executeLoading: makeSelectExecuteLoading(),
  sources: makeSelectSources(),
  modalLoading: makeSelectModalLoading(),
  bizlogics: makeSelectBizlogics()
})

function mapDispatchToProps (dispatch) {
  return {
    onCheckName: (projectId, id, name, type, resolve, reject) => dispatch(projectsCheckName(projectId, id, name, type, resolve, reject)),
    onLoadSchema: (sourceId, resolve) => dispatch(loadSchema(sourceId, resolve)),
    onExecuteSql: (sourceId, sql, resolve) => dispatch(executeSql(sourceId, sql, resolve)),
    onAddBizlogic: (bizlogic, resolve) => dispatch(addBizlogic(bizlogic, resolve)),
    onEditBizlogic: (bizlogic, resolve) => dispatch(editBizlogic(bizlogic, resolve)),
    onHideNavigator: () => dispatch(hideNavigator()),
    onLoadSources: (projectId) => dispatch(loadSources(projectId))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'global', reducer })
const withSaga = injectSaga({ key: 'global', saga })

const withReducerBizlogic = injectReducer({ key: 'bizlogic', reducer: bizlogicReducer })
const withSagaBizlogic = injectSaga({ key: 'bizlogic', saga: bizlogicSaga })

const withReducerSource = injectReducer({ key: 'source', reducer: sourceReducer })
const withSagaSource = injectSaga({ key: 'source', saga: sourceSaga })

export default compose(
  withReducer,
  withReducerBizlogic,
  withReducerSource,
  withSaga,
  withSagaBizlogic,
  withSagaSource,
  withConnect
)(Form.create()(Bizlogic))
