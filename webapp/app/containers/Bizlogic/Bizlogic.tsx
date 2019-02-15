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

import Form from 'antd/lib/form'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Input from 'antd/lib/input'
import Select from 'antd/lib/select'
import message from 'antd/lib/message'
const FormItem = Form.Item

const utilStyles = require('../../assets/less/util.less')
const styles = require('./Bizlogic.less')
import { generateData } from '../../utils/util'

import {
  makeSelectSqlValidateCode,
  makeSelectSqlValidateMsg,
  makeSelectExecuteLoading,
  makeSelectModalLoading,
  makeSelectBizlogics,
  makeSelectViewTeam
 } from './selectors'
import { checkNameUniqueAction, hideNavigator } from '../App/actions'
import { loadSchema, executeSql, addBizlogic, editBizlogic, loadBizlogics, loadViewTeam, resetViewState, loadSourceTable, loadSourceTableColumn } from './actions'
import { makeSelectSources } from '../Source/selectors'
import { loadSources } from '../Source/actions'
import { toListBF, getColumns } from './components/viewUtil'
import { ITeamParams, IViewTeams } from '../Bizlogic'
import EditorHeader from '../../components/EditorHeader'
import PaginationWithoutTotal from '../../components/PaginationWithoutTotal'
import SourcerSchema from './components/SourceSchema'
import ExecuteSql from './components/ExecuteSql'
import table from '../Widget/config/chart/table';

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
  onLoadSourceTable: (sourceId: number, resolve: (result: any) => any) => any
  onLoadSourceTableColumn: (sourceId: number, tableName: string, resolve: (result: any) => any) => any
  onExecuteSql: (requestObj: any, resolve: any) => any
  onAddBizlogic: (values: object, resolve: any) => any
  onEditBizlogic: (values: object, resolve: any) => any
  onLoadSources: (projectId: number) => any
  onLoadBizlogics: (id: number, resolve?: any) => any
  onLoadViewTeam: (projectId: number, resolve?: any) => any
  onResetViewState: () => void
}

interface IBizlogicFormState {
  modelType: string
  dataList: any[]
  sourceIdGeted: number
  isDeclarate: string
  isShowSqlValidateAlert: boolean
  executeResultList: any[]
  executeColumns: any[]
  schemaData: any[]

  treeData: any[]
  listData: any[]
  teamCheckedKeys: any[]
  teamParams: [ITeamParams]
  configTeam: any[]
  screenWidth: number

  name: string
  description: string
  isNameExited: boolean
  selectedSourceName: string
  sqlExecuteCode: boolean | number
  limit: number
  sql: string
  totalCount: number
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
      modelType: '',
      dataList: [],
      sourceIdGeted: 0,
      isDeclarate: 'no',
      isShowSqlValidateAlert: false,
      executeResultList: [],
      executeColumns: [],
      schemaData: [],

      treeData: [],
      listData: [],
      teamCheckedKeys: [],
      teamParams: [{
        k: '',
        v: ''
      }],
      configTeam: [],
      screenWidth: 0,
      name: '',
      description: '',
      isNameExited: false,
      selectedSourceName: '',
      sqlExecuteCode: false,
      limit: 500,
      sql: '',
      totalCount: 0
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
      screenWidth: document.documentElement.clientWidth
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
    const { listData, limit } = this.state

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

    this.sqlGetSchema(sourceId)

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

    const configTeam = config ? JSON.parse(config).team : ''
    const requestObj = {
      sourceIdGeted: sourceId,
      sql,
      pageNo: 0,
      pageSize: 0,
      limit
    }

    this.props.onExecuteSql(requestObj, (result) => {
      const { resultList, totalCount } = result
      this.setState({
        executeResultList: resultList,
        totalCount
      })
    })

    const listDataFinal = listData.map((ld) => {
      const currentparam = configTeam.find((ct) => ld.id === ct.id)

      ld.params = currentparam.params
      return ld
    })

    this.setState({
      sourceIdGeted: sourceId,
      sql,
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

  private initChangeIsDeclarate  = (e) => {
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
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        foldGutter: true
      })
      // this.codeMirrorInstanceOfDeclaration.setSize('100%', 160)
    }
  }

  private handleTmplCodeMirror = (queryWrapperDOM) => {
    if (!this.codeMirrorInstanceOfQuerySQL) {
      this.codeMirrorInstanceOfQuerySQL = codeMirror.fromTextArea(queryWrapperDOM, {
        mode: 'text/x-sql',
        theme: '3024-day',
        width: '100%',
        height: '100%',
        lineNumbers: true,
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        foldGutter: true
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

      if (change.origin === '+input'
          && change.text[0] !== ';'
          && change.text[0].trim() !== ''
          && change.text[1] !== '') {
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

  private initSelectSource = (source) => {
    const { sources } = this.props
    const currentSource = (sources as any[]).find((s) => s.id === Number(source.key))
    this.setState({
      selectedSourceName: currentSource.name,
      sourceIdGeted: Number(source.key)
    })
    this.props.form.setFieldsValue({
      source_id: Number(currentSource.id),
      source_name: currentSource.name
    })
    this.sqlGetSchema(Number(source.key))
  }

  private sqlGetSchema (sourceId) {
    this.promptCodeMirror([])
    this.props.onLoadSourceTable(sourceId, (result) => {
      const data = result.map((re) => ({tableName: re, columns: [], primaryKeys: []}))
      this.setState({
        schemaData: data
      }, () => {
        this.promptCodeMirror(generateData(this.state.schemaData))
      })
    })
  }

  private loadTableColumn = (tableName) => {
    const { sourceIdGeted, schemaData } = this.state
    if (tableName && tableName.length && !this.isTableHasColumn(tableName)) {
      this.props.onLoadSourceTableColumn(sourceIdGeted, tableName, (result) => {
        const data = schemaData.map((schema) => schema.tableName === result[0]['tableName'] ? result[0] : schema)
        this.setState({schemaData: data}, () => {
          this.promptCodeMirror(generateData(this.state.schemaData))
        })
      })
    }
  }

  private isTableHasColumn = (tableName) => {
    const {schemaData} = this.state
    const schema = schemaData.find((schema) => schema.tableName === tableName)
    return schema.columns && schema.columns.length > 0 ? true : false
  }

  private initExecuteSql = () => {
    const { sourceIdGeted, listData, isDeclarate, limit } = this.state

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

    this.setState({ sql })

    const requestObj = {
      sourceIdGeted,
      sql,
      pageNo: 0,
      pageSize: 0,
      limit
    }

    this.props.onExecuteSql(requestObj, (result) => {
      if (result) {
        const { resultList, columns, totalCount } = result
        this.setState({
          executeResultList: resultList,
          executeColumns: getColumns(columns),
          totalCount
        })
      }
    })
    this.asyncValidateResult = setTimeout(() => {
      this.setState({
        isShowSqlValidateAlert: true
      })
    }, 100)
  }

  private initSelectModelItem = (record, item) => (val) => {
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
        const { executeColumns, configTeam, listData, isDeclarate, name, description, isNameExited, sqlExecuteCode, limit } = this.state
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
              config: configTeamStr.length !== 0
                ? JSON.stringify({
                    team: configTeamStr
                  })
                : '',
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
      executeResultList: [],
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
    this.props.onResetViewState()
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

  private limitChange = (val) => {
    this.setState({ limit: val })
  }

  private onChangeDataTable = (current: number, pageSize: number) => {
    const { sourceIdGeted, sql } = this.state

    this.props.onExecuteSql({
      sourceIdGeted,
      sql,
      pageNo: current,
      pageSize
    }, (result) => {
      if (result) {
        const { resultList, columns, totalCount } = result
        this.setState({
          executeResultList: resultList,
          executeColumns: getColumns(columns),
          totalCount
        })
      }
    })
  }

  public render () {
    const {
      form,
      type,
      sources,
      sqlValidateMessage,
      executeLoading,
      modalLoading,
      route,
      viewTeam
    } = this.props
    const { getFieldDecorator } = form
    const {
      isDeclarate,
      isShowSqlValidateAlert,
      executeResultList,
      executeColumns,
      schemaData,
      treeData,
      screenWidth,
      name,
      description,
      selectedSourceName,
      sqlExecuteCode,
      totalCount,
      limit,
      dataList,
      teamParams,
      listData,
      teamCheckedKeys
    } = this.state

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
                  hidden: type === 'add'
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
            <SourcerSchema
              form={form}
              selectedSourceName={selectedSourceName}
              dataList={dataList}
              schemaData={schemaData}
              onLoadTableColumn={this.loadTableColumn}
              sources={sources}
              initSelectSource={this.initSelectSource}
            />
          </Row>
          <ExecuteSql
            form={form}
            route={route}
            executeResultList={executeResultList}
            executeColumns={executeColumns}
            screenWidth={screenWidth}
            isShowSqlValidateAlert={isShowSqlValidateAlert}
            sqlExecuteCode={sqlExecuteCode}
            sqlValidateMessage={sqlValidateMessage}
            totalCount={totalCount}
            isDeclarate={isDeclarate}
            limit={limit}
            executeLoading={executeLoading}
            teamParams={teamParams}
            listData={listData}
            viewTeam={viewTeam}
            teamCheckedKeys={teamCheckedKeys}
            initSelectModelItem={this.initSelectModelItem}
            initExecuteSql={this.initExecuteSql}
            initChangeIsDeclarate={this.initChangeIsDeclarate}
            limitChange={this.limitChange}
            onTeamParamChange={this.onTeamParamChange}
            onCheck={this.onCheck}
            changeTabs={this.changeTabs}
          />
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
    onLoadSourceTable: (sourceId, resolve) => dispatch(loadSourceTable(sourceId, resolve)),
    onLoadSourceTableColumn: (sourceId, tableName, resolve) => dispatch(loadSourceTableColumn(sourceId, tableName, resolve)),
    onExecuteSql: (requestObj, resolve) => dispatch(executeSql(requestObj, resolve)),
    onAddBizlogic: (bizlogic, resolve) => dispatch(addBizlogic(bizlogic, resolve)),
    onEditBizlogic: (bizlogic, resolve) => dispatch(editBizlogic(bizlogic, resolve)),
    onLoadSources: (projectId) => dispatch(loadSources(projectId)),
    onLoadBizlogics: (projectId, resolve) => dispatch(loadBizlogics(projectId, resolve)),
    onLoadViewTeam: (projectId, resolve) => dispatch(loadViewTeam(projectId, resolve)),
    onResetViewState: () => dispatch(resetViewState())
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
