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
import axios, { AxiosRequestConfig, AxiosPromise } from 'axios'

import { compose } from 'redux'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'
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
const Popover = require('antd/lib/popover')
const Dropdown = require('antd/lib/dropdown')

const Menu = require('antd/lib/menu')
const MenuItem = Menu.Item

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
  makeSelectBizlogics,
  makeSelectViewTeam
 } from './selectors'
import { checkNameUniqueAction, hideNavigator } from '../App/actions'
import { loadSchema, executeSql, addBizlogic, editBizlogic, loadBizlogics, loadViewTeam } from './actions'
import { makeSelectSources } from '../Source/selectors'
import { loadSources } from '../Source/actions'
import TeamTreeAction from './TeamTreeAction'
import { toListBF, SQL_FIELD_TYPES } from './viewUtil'
import { ITeamParams } from '../Bizlogic'
import EditorHeader from '../../components/EditorHeader'

interface IBizlogicFormProps {
  router: InjectedRouter
  type: string
  sources: boolean | any[]
  sqlValidateCode: boolean | number
  sqlValidateMessage: boolean | string
  form: any
  route: any
  params: any
  bizlogics: boolean | any[]
  executeLoading: boolean
  modalLoading: boolean
  viewTeam: IViewTeams[]
  onHideNavigator: () => void
  onCheckUniqueName: (pathname: string, data: any, resolve: () => any, reject: (error: string) => any) => any
  onLoadSchema: (sourceId: number, resolve: any) => any
  onExecuteSql: (sourceId: number, sql: any, resolve: any) => any
  onAddBizlogic: (values: object, resolve: any) => any
  onEditBizlogic: (values: object, resolve: any) => any
  onLoadSources: (projectId: number) => any
  onLoadBizlogics: (id: number, resolve?: any) => any
  onLoadViewTeam: (projectId: number) => any
}

interface IBizlogicFormState {
  expandedKeys: string[]
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
  teamExpandedKeys: string[]
  teamAutoExpandParent: boolean
  teamCheckedKeys: any[]
  selectedKeys: any[]
  teamParams: [ITeamParams]
  configTeam: any[]
  alertVisible: boolean
  screenWidth: number
  isFold: boolean

  name: string
  description: string
  isNameExited: boolean
  selectedSourceName: string
  sqlExecuteCode: boolean | number
}

interface IViewTeams {
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
      isFold: true,
      name: '',
      description: '',
      isNameExited: false,
      selectedSourceName: '',
      sqlExecuteCode: false
    }
    this.codeMirrorInstanceOfDeclaration = false
    this.codeMirrorInstanceOfQuerySQL = false
  }

  private placeholder = {
    name: '请输入View名称',
    description: '请输入描述…'
  }

  public componentWillMount () {
    const {
      params,
      route,
      bizlogics,
      onLoadSources,
      onLoadSchema,
      onLoadBizlogics,
      onLoadViewTeam
    } = this.props
    const { selectedSourceName, schemaData } = this.state

    this.setState({
      screenWidth: document.documentElement.clientWidth,
      isFold: route.path === '/project/:pid/bizlogic' ? false : true
    })

    if (!bizlogics) {
      onLoadBizlogics(params.pid)
    }

    onLoadSources(params.pid)
    onLoadViewTeam(params.pid)
  }

  public componentWillReceiveProps (nextProps) {
    const { viewTeam, sqlValidateCode } =  nextProps
    const { listData, teamParams, teamCheckedKeys, schemaData } = this.state
    const { route, params, bizlogics } = this.props

    window.onresize = () => this.setState({ screenWidth: document.documentElement.clientWidth })

    let listDataFinal
    if (listData.length === 0) {
      listDataFinal = toListBF(viewTeam).map((td) => {
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
      treeData: viewTeam,
      listData: listDataFinal,
      teamCheckedKeys: teamKeyArr,
      sqlExecuteCode: sqlValidateCode
    })
   }

  public componentDidMount () {
    const { params, bizlogics, onLoadBizlogics } = this.props
    const { schemaData, listData, teamParams } = this.state

    this.props.onHideNavigator()

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
    const { params, onLoadSchema } = this.props
    const { listData, teamParams } = this.state

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

    onLoadSchema(sourceId, (res) => {
      this.setState({
        schemaData: res,
        sourceIdGeted: sourceId
      }, () => {
        this.promptCodeMirror(generateData(this.state.schemaData))
      })
    })

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
      selectedSourceName: source.name,
      name,
      description,
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
        this.codeMirrorInstanceOfDeclaration.doc.setValue(sql.includes('{') ? sql.substring(0, sql.indexOf('{')) : sql)
      })
    } else {
      this.codeMirrorInstanceOfDeclaration = false
    }
    this.codeMirrorInstanceOfQuerySQL.doc.setValue(sql.includes('{') ? sql.substring(sql.indexOf('{') + 1, sql.lastIndexOf('}')) : '')
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
        width: '100%',
        height: '100%',
        lineNumbers: true,
        lineWrapping: true
      })
      // this.codeMirrorInstanceOfDeclaration.setSize('100%', 160)
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
      const filedDatas = {}
      if (data) {
        data.forEach((i) => {
          const { children, title } = i
          const childArr = []
          children.forEach((j) => {
            childArr.push(j.title)
          })

          childArr.forEach((ca) => {
            filedDatas[ca] = []
          })

          tableDatas[title] = []
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

      if (change.origin === '+input') {
        this.codeMirrorInstanceOfQuerySQL.showHint({
          completeSingle: false,
          tables: {...obj, ...tableDatas, ...filedDatas}
        })
      }
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

  private selectSource = (source) => {
    const { sources, onLoadSchema } = this.props
    const currentSource = (sources as any[]).find((s) => s.id === Number(source.key))
    this.setState({
      selectedSourceName: currentSource.name
    })
    this.props.form.setFieldsValue({
      source_id: Number(currentSource.id),
      source_name: currentSource.name
    })
    onLoadSchema(Number(source.key), (result) => {
      this.setState({
        schemaData: result,
        sourceIdGeted: Number(source.key)
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

    this.setState({
      isFold: true,
      alertVisible: true
    })

    const sqlTmpl = this.codeMirrorInstanceOfQuerySQL.getValue()

    let sql = ''
    if (isDeclarate === 'yes' && this.codeMirrorInstanceOfDeclaration) {
      const declaration = this.codeMirrorInstanceOfDeclaration.getValue()
      sql = `${declaration}{${sqlTmpl}}`
      this.getTeamTreeData(sql)
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
          i.sqlType = i.type
          return i
        })
        this.setState({
          executeResultset: resultset,
          executeColumns: columns
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
      sqlType: record.sqlType,
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
        const { executeColumns, configTeam, listData, isDeclarate, name, description, isNameExited, sqlExecuteCode } = this.state
        const { route, params } = this.props
        const { id, source_id, source_name } = values
        if (!name.trim()) {
          message.error('View名称不能为空')
          return
        }
        if (isNameExited) {
          message.error('View名称已存在')
          return
        }
        if (!source_id || !source_name) {
          message.error('请选择一个Source')
          return
        }

        switch (sqlExecuteCode) {
          case 200:
            const sqlTmpl = this.codeMirrorInstanceOfQuerySQL.doc.getValue()
            let querySql = ''
            if (isDeclarate === 'yes' && this.codeMirrorInstanceOfDeclaration) {
              const declaration = this.codeMirrorInstanceOfDeclaration.doc.getValue()
              querySql = sqlTmpl ? `${declaration}{${sqlTmpl}}` : declaration
            } else {
              querySql = sqlTmpl ? `{${sqlTmpl}}` : ''
            }

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
              description,
              sql: querySql,
              model: JSON.stringify(modelObj),
              config: configTeamStr.length !== 0 ? JSON.stringify({team: configTeamStr}) : '',
              projectId: params.pid
            }

            if (route.path === '/project/:pid/bizlogic') {
              this.props.onAddBizlogic({
                ...requestValue,
                sourceId: Number(source_id)
              }, () => {
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
            break
          default:
            message.error('请检查SQL语句是否正确！', 3)
            break
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

  private changeName = (e) => {
    const { onCheckUniqueName, route, params, form } = this.props
    const { id } = form.getFieldsValue()

    const data = {
      projectId: params.pid,
      id: route.path === '/project/:pid/bizlogic' ? '' : id,
      name: e.currentTarget.value
    }
    this.setState({
      name: e.currentTarget.value
    })
    onCheckUniqueName('view', data, () => {
      this.setState({
        isNameExited: false
      })
      }, (err) => {
        this.setState({
          isNameExited: true
        })
      })
  }

  private changeDesc = (e) => {
    this.setState({
      description: e.currentTarget.value
    })
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

  private renderTreeNodes = (data, depth = 0) => {
    return data.map((item) => {
      const { listData, teamParams } = this.state
      const currentItem = listData.find((ld) => ld.id === item.id)
      const treeTitle = (
        <TeamTreeAction
          depth={depth}
          onTeamParamChange={this.onTeamParamChange}
          teamParams={teamParams}
          currentItem={currentItem}
        />
      )
      if (item.children) {
        return (
          <TreeNode key={item.id} title={treeTitle} dataRef={item}>
            {this.renderTreeNodes(item.children, depth + 1)}
          </TreeNode>
        )
      }
      return <TreeNode key={item.id} title={treeTitle} className={styles.test} />
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

  private cancel = () => {
    this.props.router.goBack()
  }

  private changeTabs = (value) => {
    const { teamParams } = this.state
    const { params, bizlogics } = this.props
    if (!teamParams.length) {
      const sqlVal = params.bid
        ? (bizlogics as any[]).find((b) => b.id === Number(params.bid)).sql
        : bizlogics[0].sql
      this.getTeamTreeData(sqlVal)
    }
  }

  private getTeamTreeData (sql) {
    const { listData } = this.state

    const sqlTeamVariables = sql.match(/team@var\s+\$\w+\$/g)
    const teamParamsTemp = sqlTeamVariables
      ? sqlTeamVariables.map((gv) => gv.substring(gv.indexOf('$') + 1, gv.lastIndexOf('$')))
      : []
    const paramsTemp = teamParamsTemp.map((gp) => {
      return {
        k: gp,
        v: ''
      }
    })

    const listDataFinal = listData.map((ld) => {
      const originParams = ld.params

      ld.params = teamParamsTemp.map((tp) => {
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
      teamParams: paramsTemp,
      listData: listDataFinal.slice()
    })
  }

  private handleTree = (clickKey, obj) => {
    const { expandedKeys } = this.state

    this.setState({
      autoExpandParent: false
    })

    if (obj.selected) {
      if (expandedKeys.indexOf(clickKey[0]) < 0) {
        expandedKeys.push(clickKey[0])
        this.setState({
          expandedKeys
        })
      } else {
        this.setState({
          expandedKeys: expandedKeys.filter((e) => e !== clickKey[0])
        })
      }
    } else {
      let currentKey = []
      if (expandedKeys.length === 0) {
        expandedKeys.push(obj.node.props.title)
        currentKey = expandedKeys
      } else {
        currentKey = expandedKeys.filter((e) => e !== obj.node.props.title)
      }
      this.setState({
        expandedKeys: currentKey
      })
    }
  }

  public render () {
    const {
      form,
      sources,
      sqlValidateMessage,
      executeLoading,
      modalLoading,
      route,
      viewTeam
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
      isFold,
      name,
      description,
      selectedSourceName,
      sqlExecuteCode
    } = this.state

    const itemStyle = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 }
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

    let sourceSelectMenu
    if (sources) {
      sourceSelectMenu = (
        <Menu onClick={this.selectSource}>
          {((sources as any[]) || []).map((v) => (
            <MenuItem key={v.id}>{v.name}</MenuItem>
          ))}
        </Menu>
      )
    } else {
      sourceSelectMenu = (
        <Menu />
      )
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
      title: '字段名称',
      dataIndex: 'name',
      className: `${utilStyles.textAlignLeft}`,
      key: 'name',
      width: '25%'
    }, {
      title: '数据类型',
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
      title: '可视化类型',
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
    }, {
      title: '类型',
      dataIndex: 'sqlType',
      className: `${utilStyles.hide}`,
      key: 'sqlType',
      render: (text, record) => {
        return (
          <Input />
        )
      }
    }]

    let sqlValidatePanel
    if (isShowSqlValidateAlert) {
      if (sqlExecuteCode) {
        sqlValidatePanel = alertVisible
          ? (
            <Alert
              className={styles.sqlAlertText}
              message={`syntax check ${sqlExecuteCode === 200 ? 'success' : 'error'}`}
              description={`${sqlValidateMessage || ''}`}
              type={`${sqlExecuteCode === 200 ? 'success' : 'error'}`}
              showIcon
              closable
              onClose={this.handleClose}
            />
            )
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
      showSizeChanger: true,
      pageSizeOptions: ['100', '200', '300', '400']
    }

    const operations = (
      <Icon
        className={`${isFold ? styles.foldIcon : styles.noFoldIcon}`}
        type={`${isFold ? 'down-circle-o' : 'left-circle-o'}`}
        onClick={this.foldBoard}
      />
    )

    const declareMsg = (
      <span>
        声明变量
        <Tooltip title="帮助">
          <Popover
            placement="left"
            content={
              <div className={styles.declareMsg}>
                <p className={styles.textMsg}>查询变量：query@var $变量名称$</p>
                <p className={styles.exampleMsg}>query@var $age$ = '29'; </p>
                <p className={styles.textMsg}>团队权限变量：team@var $变量名称$</p>
                <p className={styles.exampleMsg}>team@var $city$ = '北京'; </p>
              </div>}
            title={<h5>示例：</h5>}
            trigger="click"
          >
            <Icon type="question-circle-o" className={styles.questionClass} />
          </Popover>
        </Tooltip>
      </span>
    )

    return (
      <div className={styles.bizlogic}>
        <EditorHeader
          currentType="view"
          className={styles.header}
          name={name}
          description={description}
          placeholder={this.placeholder}
          onNameChange={this.changeName}
          onDescriptionChange={this.changeDesc}
          onSave={this.onModalOk}
          onCancel={this.cancel}
          loading={modalLoading}
        />
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
              <FormItem label="" className={utilStyles.hide}>
                {getFieldDecorator('source_id', {})(
                  <Input />
                )}
              </FormItem>
              <FormItem label="" className={utilStyles.hide}>
                {getFieldDecorator('source_name', {})(
                  <Input />
                )}
              </FormItem>
              <div className={styles.sourceSelect}>
                <Dropdown overlay={sourceSelectMenu} trigger={['click']} placement="bottomLeft">
                  <a>{selectedSourceName || '选择一个Source'}</a>
                </Dropdown>
              </div>
            </Col>
            <Col span={24} className={`${schemaData.length !== 0 ? styles.treeSearch : utilStyles.hide}`}>
              <Search
                placeholder="Search the Schema"
                onChange={this.searchSchema}
              />
            </Col>
            <Col span={24} className={`${schemaData.length !== 0 ? styles.sourceTree : utilStyles.hide}`}>
              <Tree
                onExpand={this.onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onSelect={this.handleTree}
              >
              {loop(data || [])}
              </Tree>
            </Col>
          </Row>
          <Row className={styles.formRight}>
            <Col span={24} className={`small-item-margin ${styles.declareSelect}`}>
              <FormItem label={declareMsg} {...itemStyle}>
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
            <Row className={styles.formTop}>
              <Col span={24} className={`${isDeclarate === 'no' ? styles.noDeclaration : ''} ${styles.declareText}`}>
                <FormItem label="" className={styles.declareForm}>
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

            <Row className={styles.fromBtn}>
              <span className={styles.sqlAlert}>
                {sqlValidatePanel}
              </span>
              <Button
                className={styles.executeBtn}
                key="forward"
                size="large"
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
                    <Tabs defaultActiveKey="data" tabBarExtraContent={operations} className={styles.viewTab} onChange={this.changeTabs}>
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
                          defaultExpandAll={true}
                          onCheck={this.onCheck}
                          checkedKeys={this.state.teamCheckedKeys}
                          onSelect={this.onSelect}
                          selectedKeys={this.state.selectedKeys}
                        >
                          {this.renderTreeNodes(viewTeam || [])}
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
  viewTeam: makeSelectViewTeam()
})

function mapDispatchToProps (dispatch) {
  return {
    onHideNavigator: () => dispatch(hideNavigator()),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject)),
    onLoadSchema: (sourceId, resolve) => dispatch(loadSchema(sourceId, resolve)),
    onExecuteSql: (sourceId, sql, resolve) => dispatch(executeSql(sourceId, sql, resolve)),
    onAddBizlogic: (bizlogic, resolve) => dispatch(addBizlogic(bizlogic, resolve)),
    onEditBizlogic: (bizlogic, resolve) => dispatch(editBizlogic(bizlogic, resolve)),
    onLoadSources: (projectId) => dispatch(loadSources(projectId)),
    onLoadBizlogics: (projectId, resolve) => dispatch(loadBizlogics(projectId, resolve)),
    onLoadViewTeam: (projectId) => dispatch(loadViewTeam(projectId))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducerBizlogic = injectReducer({ key: 'bizlogic', reducer: bizlogicReducer })
const withSagaBizlogic = injectSaga({ key: 'bizlogic', saga: bizlogicSaga })

const withReducerSource = injectReducer({ key: 'source', reducer: sourceReducer })
const withSagaSource = injectSaga({ key: 'source', saga: sourceSaga })

export default compose(
  withReducerBizlogic,
  withReducerSource,
  withSagaBizlogic,
  withSagaSource,
  withConnect
)(Form.create()(Bizlogic))
