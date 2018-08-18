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
import projectReducer from '../Projects/reducer'
import projectSaga from '../Projects/sagas'
import organizationReducer from '../Organizations/reducer'
import organizationSaga from '../Organizations/sagas'

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
import { SQL_NUMBER_TYPES } from '../../globalConstants'

import {
  makeSelectSqlValidateCode,
  makeSelectSqlValidateMsg,
  makeSelectExecuteLoading,
  makeSelectModalLoading,
  makeSelectBizlogics
 } from './selectors'
import { makeSelectProjects } from '../Projects/selectors'
import { makeSelectCurrentOrganizationTeams } from '../Organizations/selectors'
import { checkNameUniqueAction, hideNavigator } from '../App/actions'
import { loadSchema, executeSql, addBizlogic, editBizlogic, loadBizlogics } from './actions'
import { makeSelectSources } from '../Source/selectors'
import { loadSources } from '../Source/actions'
import { loadOrganizationTeams } from '../Organizations/actions'
import { loadProjects } from '../Projects/actions'
import TeamTreeAction from './TeamTreeAction'
import { toListBF, SQL_FIELD_TYPES } from './viewUtil'

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
  onCheckUniqueName: (pathname: string, data: any, resolve: () => any, reject: (error: string) => any) => any
  onLoadSchema: (sourceId: number, resolve: any) => any
  bizlogics: boolean | any[]
  executeLoading: boolean
  modalLoading: boolean
  onExecuteSql: (sourceId: number, sql: any, resolve: any) => any
  onAddBizlogic: (values: object, resolve: any) => any
  onEditBizlogic: (values: object, resolve: any) => any
  onHideNavigator: () => void
  onLoadSources: (projectId: number, resolve: any) => any
  onLoadProjects: (resolve?: any) => any
  onLoadOrganizationTeams: (id: number) => any
  onLoadBizlogics: (id: number, resolve?: any) => any
  projects: any[]
  currentOrganizationTeams: IOrganizationTeams[]
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

  treeData: any[]
  listData: any[]
  teamExpandedKeys: any[]
  teamAutoExpandParent: boolean
  teamCheckedKeys: any[]
  selectedKeys: any[]
  teamParams: [ITeamParams]
  configTeam: any[]
  alertVisible: boolean
  screenWidth: number
  isFold: boolean
}

interface ITeamParams {
  k: string,
  v: string
}

interface IOrganizationTeams {
  id: number
  orgId: number
  name: string,
  description: string,
  parentTeamId: number,
  visibility: boolean
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
      schemaData: [],

      treeData: [],
      listData: [],
      teamExpandedKeys: [],
      teamAutoExpandParent: true,
      teamCheckedKeys: [],
      selectedKeys: [],
      teamParams: [{
        k: '',
        v: ''
      }],
      configTeam: [],
      alertVisible: true,
      screenWidth: 0,
      isFold: true
    }
    this.codeMirrorInstanceOfDeclaration = false
    this.codeMirrorInstanceOfQuerySQL = false
  }

  public componentWillMount () {
    const {
      projects,
      params,
      route,
      bizlogics,
      onLoadSources,
      onLoadSchema,
      onLoadProjects,
      onLoadOrganizationTeams,
      onLoadBizlogics
    } = this.props

    this.setState({
      screenWidth: document.documentElement.clientWidth,
      isFold: route.path === '/project/:pid/bizlogic' ? false : true
    })

    if (!bizlogics) {
      onLoadBizlogics(params.pid)
    }

    new Promise((resolve) => {
      onLoadSources(params.pid, (result) => {
        resolve(result)
      })
    }).then((result) => {
      if ((result as any[]).length) {
        onLoadSchema(result[0].id, (res) => {
          this.setState({
            schemaData: res,
            sourceIdGeted: result[0].id
          }, () => {
            this.promptCodeMirror(generateData(this.state.schemaData))
          })
        })
      } else {
        return
      }
    })

    if (projects) {
      const currentProject = projects.find((p) => p.id === Number(params.pid))
      onLoadOrganizationTeams(currentProject.orgId)
    } else {
      new Promise((resolve) => {
        onLoadProjects((result) => {
          resolve(result)
        })
      }).then((result) => {
        const currentProject = (result as any[]).find((r) => r.id === Number(params.pid))
        onLoadOrganizationTeams(currentProject.orgId)
      })
    }
  }

  public componentWillReceiveProps (nextProps) {
    const { currentOrganizationTeams } =  nextProps
    const { listData, teamParams, teamCheckedKeys } = this.state
    const { route, params, bizlogics, projects } = this.props

    const { schemaData } = this.state

    window.onresize = () => this.setState({ screenWidth: document.documentElement.clientWidth })

    let listDataFinal
    if (listData.length === 0) {

      listDataFinal = toListBF(currentOrganizationTeams).map((td) => {
        const arr = [{
          k: '',
          v: ''
        }]
        let paramsTemp
        let checkedTemp
        if (bizlogics) {
          if (route.path === '/project/:pid/bizlogic') {
            // 新增
            paramsTemp = arr
            checkedTemp = teamCheckedKeys.indexOf(`${td.id}`) >= 0
          } else {
            // 修改
            const currentView = (bizlogics as any[]).find((v) => v.id === Number(params.bid))
            if (currentView.config) {
              const teamArr = JSON.parse(currentView.config).team
              const currentTeam = teamArr.find((ta) => ta.id === td.id)
              paramsTemp = currentTeam ? currentTeam.params : []
              checkedTemp = currentTeam ? true : false
            } else {
              paramsTemp = arr
            }
          }
        } else {
          paramsTemp = arr
        }

        const listItem = {
          ...td,
          checked: checkedTemp,
          params: paramsTemp
        }
        return listItem
      })
    } else {
      listDataFinal = this.state.listData.map((td) => {
        const listItem = {
          ...td,
          checked: teamCheckedKeys.indexOf(`${td.id}`) >= 0,
          params: td.params
        }
        return listItem
      })
    }

    const teamKeyArr = listDataFinal.filter((ldf) => ldf.checked).map((arr) => `${arr.id}`)

    this.setState({
      treeData: currentOrganizationTeams,
      listData: listDataFinal,
      teamCheckedKeys: teamKeyArr
    })
   }

  public componentDidMount () {
    const { params, bizlogics, onHideNavigator, onLoadBizlogics } = this.props
    const { schemaData, listData, teamParams } = this.state

    onHideNavigator()

    this.generateList(generateData(schemaData))
    const queryTextarea = document.querySelector('#sql_tmpl')
    this.handleTmplCodeMirror(queryTextarea)

    if (params.bid) {
      if (bizlogics) {
        this.showViewInfo(bizlogics)
      } else {
        onLoadBizlogics(params.pid, (result) => {
          this.showViewInfo(result)
        })
      }
    }
  }

  private showViewInfo (bizlogics) {
    const { params } = this.props
    const { schemaData, listData, teamParams } = this.state

    const {
      name,
      description,
      source,
      sourceId,
      sql,
      model,
      config
    } = (bizlogics as any[]).find((b) => b.id === Number(params.bid))
    const dec = (sql.includes('{') && sql.substring(0, sql.lastIndexOf('{')) !== '')

    if (model) {
      const modelObj = JSON.parse(model)
      const modelArr = []
      for (const o in modelObj) {
        if (modelObj.hasOwnProperty(o)) {
          modelArr.push({ name: o, ...modelObj[o]})
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

    const configTeam = config ? JSON.parse(config).team : ''

    const listDataFinal = listData.map((ld) => {
      const currentparam = configTeam.find((ct) => ld.id === ct.id)

      ld.params = currentparam.params
      return ld
    })

    this.setState({
      listData: listDataFinal,
      teamParams: configTeam ? (configTeam[0].params).map((o) => {
        return {
          k: o.k,
          v: o.v
        }
      }) : []
    })

    this.props.form.setFieldsValue({
      id: Number(params.bid),
      name,
      desc: description,
      source_id: `${sourceId}`,
      source_name: source.name,
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

  private checkNameUnique = (rule, value = '', callback) => {
    const { onCheckUniqueName, route, params, form } = this.props
    const { id } = form.getFieldsValue()

    const data = {
      projectId: params.pid,
      id: route.path === '/project/:pid/bizlogic' ? '' : id,
      name: value
    }
    onCheckUniqueName('view', data,
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
      this.codeMirrorInstanceOfDeclaration.setSize('100%', 180)
    }
  }

  private handleTmplCodeMirror = (queryWrapperDOM) => {
    if (!this.codeMirrorInstanceOfQuerySQL) {
      this.codeMirrorInstanceOfQuerySQL = codeMirror.fromTextArea(queryWrapperDOM, {
        mode: 'text/x-sql',
        theme: '3024-day',
        lineNumbers: true,
        width: '100%',
        height: '100%',
        lineWrapping: true
      })
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
        const declareParams = (declareValue.match(/query@var\s+\$\w+\$/g) || [])
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
            tables: {...obj, ...tableDatas}
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
      }, () => {
        this.promptCodeMirror(generateData(this.state.schemaData))
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
    const { sourceIdGeted, listData, isDeclarate } = this.state

    const sqlTmpl = this.codeMirrorInstanceOfQuerySQL.getValue()

    let sql = ''
    if (isDeclarate === 'yes' && this.codeMirrorInstanceOfDeclaration) {
      const declaration = this.codeMirrorInstanceOfDeclaration.getValue()
      sql = `${declaration}{${sqlTmpl}}`

      const sqlTeamVariables = declaration.match(/team@var\s+\$\w+\$/g)
      const teamParams = sqlTeamVariables
      ? sqlTeamVariables.map((gv) => gv.substring(gv.indexOf('$') + 1, gv.lastIndexOf('$')))
      : []
      const params = teamParams.map((gp) => {
        return {
          k: gp,
          v: ''
        }
      })

      this.setState({
        teamParams: params
      }, () => {
        const listDataFinal = listData.map((ld) => {
          const originParams = ld.params

          ld.params = teamParams.map((tp) => {
            const alreadyInUseParam = originParams.find((o) => o.k === tp)

            if (alreadyInUseParam) {
              return (Object as IObjectConstructor).assign({}, alreadyInUseParam)
            } else {
              return {
                k: tp,
                v: ''
              }
            }
          })
          return ld
        })
        this.setState({
          listData: listDataFinal.slice()
        })
      })
    } else {
      sql = `{${sqlTmpl}}`
      const listDataFinal = listData.map((ld) => {
        ld.params = []
        return ld
      })
      this.setState({
        teamParams: [{
          k: '',
          v: ''
        }],
        listData: listDataFinal
      }, () => {
        this.setState({
          teamCheckedKeys: []
        })
      })
    }

    this.props.onExecuteSql(sourceIdGeted, sql, (result) => {
      this.setState({
        alertVisible: true
      })
      if (result) {
        const { resultset, columns } = result

        columns.map((i) => {
          const { date } = SQL_FIELD_TYPES
          let iVisualType
          for (const item in SQL_FIELD_TYPES) {
            if (SQL_FIELD_TYPES.hasOwnProperty(item)) {
              if (SQL_FIELD_TYPES[item].indexOf(i.type) >= 0) {
                iVisualType = item
              }
            }
          }

          i.visualType = iVisualType || 'string'
          i.modelType = SQL_NUMBER_TYPES.indexOf(i.type) < 0 ? 'category' : 'value'
          return i
        })
        this.setState({
          executeResultset: resultset,
          executeColumns: columns,
          alertVisible: true
        })
      }
    })
    this.asyncValidateResult = setTimeout(() => {
      this.setState({
        isShowSqlValidateAlert: true
      })
    }, 100)
  }

  private selectModelItem = (record, item) => (val) => {
    const { executeColumns } = this.state
    const obj = {
      name: record.name,
      sqlType: record.type,
      key: record.key,
      visualType: item === 'visualType' ? val : record.visualType,
      modelType: item === 'modelType'
        ? val.target.value === '维度' ? 'category' : 'value'
        : record.modelType
    }
    executeColumns.splice(executeColumns.findIndex((c) => c.name === record.name), 1, obj)
    this.setState({
      executeColumns: executeColumns.slice()
    })
  }

  private onTeamParamChange = (id, paramIndex) => (e) => {
    const { configTeam, teamParams, listData } = this.state

    const changed = listData.find((i) => i.id === id)
    changed.params[paramIndex].v = e.target.value
    this.setState({
      listData: listData.slice()
    })
  }

  private onModalOk = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { executeColumns, configTeam, listData, isDeclarate } = this.state
        const { sqlValidateCode, route, params } = this.props

        const { id, name, desc, source_id, source_name } = values
        const sqlTmpl = this.codeMirrorInstanceOfQuerySQL.doc.getValue()
        let querySql = ''
        if (isDeclarate === 'yes' && this.codeMirrorInstanceOfDeclaration) {
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
            const { name, sqlType, visualType, modelType  } = m
            modelObj[name] = {
              sqlType,
              visualType,
              modelType
            }
          })

          const configTeamStr = listData
          .filter((ld) => ld.checked)
          .map((ld) => ({
            id: ld.id,
            params: ld.params
          }))

          const requestValue = {
            name,
            description: desc,
            sql: querySql,
            model: sqlValidateCode === 200 ? JSON.stringify(modelObj) : '',
            config: configTeamStr.length !== 0 ? JSON.stringify({team: configTeamStr}) : '',
            projectId: params.pid
          }

          if (route.path === '/project/:pid/bizlogic') {
            this.props.onAddBizlogic({ ...requestValue, sourceId: Number(source_id) }, () => {
              this.hideForm()
            })
          } else {
            this.props.onEditBizlogic({
              ...requestValue,
              id,
              source: {
                id: Number(source_id),
                name: source_name
              }
            }, () => {
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

  private onTeamExpand = (expandedKeys) => {
    this.setState({
      teamExpandedKeys: expandedKeys,
      teamAutoExpandParent: false
    })
  }

  private getListData (checkedKeys) {
    const { listData, teamParams } = this.state
    const listDataFinal = listData.map((td) => {
      const noParams = teamParams.map((teamParam) => {
        return {
          k: teamParam.k,
          v: ''
        }
      })
      const listItem = {
        ...td,
        checked: checkedKeys.indexOf(`${td.id}`) >= 0,
        params: td.params.length ? td.params : noParams
      }
      return listItem
    })
    return listDataFinal
  }

  private onCheck = (checkedKeys) => {
    this.setState({
      listData: this.getListData(checkedKeys.checked),
      teamCheckedKeys: checkedKeys.checked
    })
  }

  private onSelect = (selectedKeys, info) => {
    this.setState({ selectedKeys })
  }

  private renderTreeNodes = (data) => {
    return data.map((item) => {
      const { listData, teamParams } = this.state
      const currentItem = listData.find((ld) => ld.id === item.id)
      const treeTitle = (
        <TeamTreeAction
          onTeamParamChange={this.onTeamParamChange}
          teamParams={teamParams}
          currentItem={currentItem}
        />
      )
      if (item.children) {
        return (
          <TreeNode key={item.id} title={treeTitle} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        )
      }
      return <TreeNode key={item.id} title={treeTitle} />
    })
  }

  private handleClose = () => {
    this.setState({
      alertVisible: false
    })
  }

  private foldBoard = () => {
    this.setState({
      isFold: !this.state.isFold
    })
  }

  public render () {
    const {
      form,
      sources,
      sqlValidateCode,
      sqlValidateMessage,
      executeLoading,
      modalLoading,
      route,
      currentOrganizationTeams
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
      schemaData,
      treeData,
      alertVisible,
      screenWidth,
      isFold
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

    const sqlVisualTypes = []
    for (const item in SQL_FIELD_TYPES) {
      if (SQL_FIELD_TYPES.hasOwnProperty(item)) {
        sqlVisualTypes.push(item)
      }
    }
    const optionSource = sqlVisualTypes.map((opt) => <Option key={opt} value={opt}>{opt}</Option>)

    const modelColumns = [{
      title: '表名',
      dataIndex: 'name',
      className: `${utilStyles.textAlignLeft}`,
      key: 'name',
      width: '25%'
    }, {
      title: '类型',
      dataIndex: 'modelType',
      key: 'modelType',
      className: `${utilStyles.textAlignLeft}`,
      width: '25%',
      render: (text, record) => {
        return (
        <RadioGroup
          options={['维度', '指标']}
          value={record.modelType === 'category' ? '维度' : '指标'}
          onChange={this.selectModelItem(record, 'modelType')}
        />)}
    }, {
      title: '字段类型',
      dataIndex: 'visualType',
      className: `${utilStyles.textAlignLeft}`,
      key: 'visualType',
      width: '25%',
      render: (text, record) => {
        return (
          <Select
            size="small"
            style={{ width: '50%' }}
            value={record.visualType}
            onChange={this.selectModelItem(record, 'visualType')}
          >
            {optionSource}
          </Select>
        )
      }
    }]

    let sqlValidatePanel
    if (isShowSqlValidateAlert) {
      if (sqlValidateCode) {
        sqlValidatePanel = alertVisible
          ? (
            <Col span={21} offset={2} className={styles.fromSqlAlert}>
              <Alert
                className={styles.sqlAlertText}
                message={`syntax check ${sqlValidateCode === 200 ? 'success' : 'error'}`}
                description={`${sqlValidateMessage || ''}`}
                type={`${sqlValidateCode === 200 ? 'success' : 'error'}`}
                showIcon
                closable
                onClose={this.handleClose}
              />
            </Col>)
          : null
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

    const pagination = {
      simple: screenWidth < 768 || screenWidth === 768,
      defaultPageSize: 100,
      showSizeChanger: true
    }

    const operations = (
      <Icon
        className={`${isFold ? styles.foldIcon : styles.noFoldIcon}`}
        type={`${isFold ? 'down-circle-o' : 'left-circle-o'}`}
        onClick={this.foldBoard}
      />
    )

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
            <FormItem label="名称" hasFeedback >
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
            <FormItem label="" className={utilStyles.hide}>
              {getFieldDecorator('source_name', {})(
                <Input />
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
              // showLine
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
            <Col span={24} className={`no-item-margin ${styles.sqlText}`}>
              <FormItem label="" className={styles.sqlForm}>
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
          {
            isFold
              ? (
              <Row className={`${isFold ? styles.formBottom : styles.formBottomNone}`}>
                <Col span={24} className={styles.tabCol}>
                  <Tabs defaultActiveKey="data" tabBarExtraContent={operations} className={styles.viewTab}>
                    <TabPane tab="Data" key="data">
                      <Table
                        className={styles.viewTabPane}
                        dataSource={tableData}
                        columns={tableColumns}
                        pagination={pagination}
                        // scroll={{ y:  }}
                      />
                    </TabPane>
                    <TabPane tab="Model" key="model">
                      <Table
                        className={styles.viewTabPane}
                        dataSource={modelData}
                        columns={modelColumns}
                        pagination={pagination}
                        // scroll={{y: }}
                      />
                    </TabPane>
                    <TabPane tab="Team" key="team">
                      <Tree
                        className={styles.viewTabPane}
                        checkStrictly
                        checkable
                        onExpand={this.onTeamExpand}
                        expandedKeys={this.state.teamExpandedKeys}
                        autoExpandParent={this.state.teamAutoExpandParent}
                        onCheck={this.onCheck}
                        checkedKeys={this.state.teamCheckedKeys}
                        onSelect={this.onSelect}
                        selectedKeys={this.state.selectedKeys}
                      >
                        {this.renderTreeNodes(currentOrganizationTeams)}
                      </Tree>
                    </TabPane>
                  </Tabs>
                </Col>
              </Row>
              )
              : operations
          }
        </Row>
      </Form>
        <div className={styles.footBtn}>
          <Button
            className={styles.btn}
            size="large"
            type="primary"
            loading={modalLoading}
            onClick={this.onModalOk}
          >
            保存
          </Button>
        </div>
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
  bizlogics: makeSelectBizlogics(),
  projects: makeSelectProjects(),
  currentOrganizationTeams: makeSelectCurrentOrganizationTeams()
})

function mapDispatchToProps (dispatch) {
  return {
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject)),
    onLoadSchema: (sourceId, resolve) => dispatch(loadSchema(sourceId, resolve)),
    onExecuteSql: (sourceId, sql, resolve) => dispatch(executeSql(sourceId, sql, resolve)),
    onAddBizlogic: (bizlogic, resolve) => dispatch(addBizlogic(bizlogic, resolve)),
    onEditBizlogic: (bizlogic, resolve) => dispatch(editBizlogic(bizlogic, resolve)),
    onHideNavigator: () => dispatch(hideNavigator()),
    onLoadSources: (projectId, resolve) => dispatch(loadSources(projectId, resolve)),
    onLoadProjects: (resolve) => dispatch(loadProjects(resolve)),
    onLoadOrganizationTeams: (id) => dispatch(loadOrganizationTeams(id)),
    onLoadBizlogics: (projectId, resolve) => dispatch(loadBizlogics(projectId, resolve))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'global', reducer })
const withSaga = injectSaga({ key: 'global', saga })

const withReducerBizlogic = injectReducer({ key: 'bizlogic', reducer: bizlogicReducer })
const withSagaBizlogic = injectSaga({ key: 'bizlogic', saga: bizlogicSaga })

const withReducerSource = injectReducer({ key: 'source', reducer: sourceReducer })
const withSagaSource = injectSaga({ key: 'source', saga: sourceSaga })

const withReducerProject = injectReducer({ key: 'project', reducer: projectReducer })
const withSagaProject = injectSaga({ key: 'project', saga: projectSaga })

const withReducerOrganization = injectReducer({ key: 'organization', reducer: organizationReducer })
const withSagaOrganization = injectSaga({ key: 'organization', saga: organizationSaga })

export default compose(
  withReducer,
  withReducerBizlogic,
  withReducerSource,
  withReducerProject,
  withReducerOrganization,
  withSaga,
  withSagaBizlogic,
  withSagaSource,
  withSagaProject,
  withSagaOrganization,
  withConnect
)(Form.create()(Bizlogic))
