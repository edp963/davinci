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
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router'

import { compose } from 'redux'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import Container from '../../components/Container'
import Box from '../../components/Box'
import SearchFilterDropdown from '../../components/SearchFilterDropdown'
import SourceForm from './SourceForm'
import UploadCsvForm from './UploadCsvForm'

import { message, Row, Col, Table, Button, Tooltip, Icon, Popconfirm, Breadcrumb } from 'antd'
import { ButtonProps } from 'antd/lib/button/button'
import { SortOrder } from 'antd/lib/table'
import AntdFormType from 'antd/lib/form/Form'

import {
  loadSources,
  addSource,
  deleteSource,
  editSource,
  testSourceConnection,
  getCsvMetaId,
  setSourceFormValue,
  setUploadFormValue
} from './actions'
import {
  makeSelectSources,
  makeSelectListLoading,
  makeSelectFormLoading,
  makeSelectTestLoading
} from './selectors'
const utilStyles = require('../../assets/less/util.less')
import api from '../../utils/api'
import { uuid } from '../../utils/util'
import { checkNameUniqueAction } from '../App/actions'
import {makeSelectCurrentProject} from '../Organizations/containers/Projects/selectors'
import ModulePermission from '../Account/components/checkModulePermission'
import { initializePermission } from '../Account/components/checkUtilPermission'
import {IProject} from '../Organizations/containers/Projects'

export type SourceType = 'csv' | 'jdbc'

interface ISourceCommon {
  id: number
  name: string
  type: SourceType
  username: string
  password: string
  jdbcUrl: string
  description: string
}

export interface ISource extends ISourceCommon {
  config: string
}

export interface ISourcePersist extends ISourceCommon {
  config: {
    parameters: string
    password: string
    url: string
    username: string
  }
}

export interface ICSVMetaInfo {
  sourceId: number
  tableName: string
  replaceMode: number
  primaryKeys: string
  indexKeys: string
}

interface ISourceProps {
  params: any
  sources: ISourcePersist[]
  listLoading: boolean
  formLoading: boolean
  testLoading: boolean
  currentProject: IProject
  onLoadSources: (projectId: number) => any
  onAddSource: (sourceData: any, resolve: any) => any
  onDeleteSource: (id: number) => any
  onEditSource: (sourceData: any, resolve: any) => any
  onTestSourceConnection: (testSource: any) => any
  onGetCsvMetaId: (csvMeta: ICSVMetaInfo, resolve: () => void) => void
  onCheckUniqueName: (pathname: string, data: any, resolve: () => any, reject: (error: string) => any) => any
  onSetSourceFormValue: (changedValues: ISource) => void
  onSetUploadFormValue: (changedValues: Partial<ICSVMetaInfo>) => void
}

interface ISourceStates {
  tableSource: any[]
  tableSortedInfo: {
    columnKey?: string,
    order?: SortOrder
  }
  nameFilterValue: string
  nameFilterDropdownVisible: boolean
  sourceFormVisible: boolean
  sourceFormType: string
  uploadFormVisible: boolean
  formStep: number
  metaObj: ICSVMetaInfo | null
  isUploadDisabled: boolean
  uploadFormKey: string
  screenWidth: number
}

interface ISourceObject {
  username: string
  password: string
  jdbcUrl: string
}

export class Source extends React.PureComponent<ISourceProps, ISourceStates> {
  constructor (props) {
    super(props)
    this.state = {
      tableSource: [],
      tableSortedInfo: {},

      nameFilterValue: '',
      nameFilterDropdownVisible: false,

      sourceFormVisible: false,
      sourceFormType: 'add',

      uploadFormVisible: false,
      formStep: 0,
      metaObj: null,
      isUploadDisabled: false,

      uploadFormKey: '1',
      screenWidth: 0
    }
  }

  private sourceForm = React.createRef<AntdFormType>()
  private uploadForm = React.createRef<AntdFormType>()

  public componentWillMount () {
    this.props.onLoadSources(this.props.params.pid)
    this.props.onSetSourceFormValue(this.getSourceFormInitialValues())
    this.props.onSetUploadFormValue(this.getUploadFormInitialValues())
    this.setState({ screenWidth: document.documentElement.clientWidth })
  }

  public componentWillReceiveProps (props: ISourceProps) {
    window.onresize = () => this.setState({ screenWidth: document.documentElement.clientWidth })

    if (props.sources) {
      this.setState({
        tableSource: props.sources.slice()
      })
    }
  }

  private getSourceFormInitialValues = (): ISource => {
    return {
      id: 0,
      name: '',
      type: 'jdbc',
      username: '',
      password: '',
      jdbcUrl: '',
      description: '',
      config: ''
    }
  }

  private getUploadFormInitialValues = (): ICSVMetaInfo => {
    return {
      sourceId: 0,
      tableName: '',
      replaceMode: 0,
      primaryKeys: '',
      indexKeys: ''
    }
  }

  private showAdd = () => {
    this.setState({
      sourceFormVisible: true,
      sourceFormType: 'add'
    })
  }

  private showDetail = (sourceId) => () => {
    const originSource = this.props.sources.find((g) => g.id === sourceId) as ISourcePersist

    this.props.onSetSourceFormValue({
      ...originSource,
      config: originSource.config.parameters
    })
    this.setState({
      sourceFormVisible: true,
      sourceFormType: 'edit'
    })
  }

  private showUpload = (sourceId) => () => {
    this.setState({
      uploadFormVisible: true
    })
    this.props.onSetUploadFormValue({ sourceId })
  }

  private saveSourceForm = (values) => {
    const { params } = this.props
    const { id, name, type, jdbcUrl, username, password, description, config } = values
    const requestValue = {
      config: {
        parameters: config,
        password,
        url: jdbcUrl,
        username
      },
      description,
      name,
      type,
      projectId: Number(params.pid)
    }

    if (this.state.sourceFormType === 'add') {
      this.props.onAddSource({...requestValue}, () => {
        this.closeSourceForm()
      })
    } else {
      this.props.onEditSource({ ...requestValue, id }, () => {
        this.closeSourceForm()
      })
    }
  }

  private changeUploadFormStep = (step: number, values?: ICSVMetaInfo) => {
    if (values) {
      const { onGetCsvMetaId } = this.props
      onGetCsvMetaId(values, () => {
        this.setState({
          metaObj: { ...values }
        })
      })
    }

    this.setState({
      formStep: step
    })
  }

  private closeSourceForm = () => {
    this.setState({
      sourceFormVisible: false
    })
  }

  private afterSourceFormClose = () => {
    this.props.onSetSourceFormValue(this.getSourceFormInitialValues())
  }

  private uploadFile = () => {
    this.closeUploadForm()
    this.setState({
      isUploadDisabled: false
    })
  }

  private closeUploadForm = () => {
    this.setState({
      uploadFormVisible: false
    })
  }

  private afterUploadFormClose = () => {
    this.setState({
      formStep: 0,
      uploadFormKey: uuid(6, 10)
    })
  }

  private handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      tableSortedInfo: sorter
    })
  }

  private onSearchInputChange = (e) => {
    this.setState({
      nameFilterValue: e.target.value
    })
  }

  private onSearch = () => {
    const val = this.state.nameFilterValue
    const reg = new RegExp(val, 'gi')

    this.setState({
      nameFilterDropdownVisible: false,
      tableSource: (this.props.sources as any[]).map((record) => {
        const match = record.name.match(reg)
        if (!match) {
          return null
        }
        return {
          ...record,
          name: (
            <span>
              {record.name.split(reg).map((text, i) => (
                i > 0 ? [<span key={i} className={utilStyles.highlight}>{match[0]}</span>, text] : text
              ))}
            </span>
          )
        }
      }).filter((record) => !!record)
    })
  }

  private testSourceConnection = (username, password, jdbcUrl) => {
    if (jdbcUrl) {
      this.props.onTestSourceConnection({
        username,
        password,
        url: jdbcUrl
      })
    } else {
      message.error('连接 Url 都不能为空')
    }
  }

  private uploadOnchange = (info) => {
    if (info.file.status !== 'uploading') {
      const fileLength = info.fileList.length
      if (fileLength === 0) {
        this.setState({
          isUploadDisabled: false
        })
      }
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 文件上传成功`)
      this.setState({
        formStep: 2,
        isUploadDisabled: true
      })
    } else if (info.file.status === 'error') {
      message.error(info.file.response.header.msg)
    }
  }

  public render () {
    const {
      tableSource,
      tableSortedInfo,
      nameFilterValue,
      nameFilterDropdownVisible,
      sourceFormType,
      sourceFormVisible,
      uploadFormVisible,
      formStep,
      metaObj,
      isUploadDisabled,
      uploadFormKey,
      screenWidth
    } = this.state

    const {
      params,
      listLoading,
      formLoading,
      testLoading,
      onDeleteSource,
      currentProject,
      onCheckUniqueName
    } = this.props

    const AdminButton = ModulePermission<ButtonProps>(currentProject, 'source', true)(Button)
    const EditButton = ModulePermission<ButtonProps>(currentProject, 'source', false)(Button)

    let sourceId
    let tableName
    let replaceMode
    let primaryKeys
    let indexKeys
    if (metaObj) {
      sourceId = metaObj.sourceId
      tableName = metaObj.tableName
      replaceMode = metaObj.replaceMode
      primaryKeys = metaObj.primaryKeys || ''
      indexKeys = metaObj.indexKeys || ''
    }

    let uploadUrl = `${api.source}/${sourceId}/uploadcsv?tableName=${tableName}&mode=${replaceMode}`
    if (primaryKeys) {
      uploadUrl = `${uploadUrl}&primaryKeys=${primaryKeys}`
    }
    if (indexKeys) {
      uploadUrl = `${uploadUrl}&indexKeys=${indexKeys}`
    }


    const uploadProps = {
      name: 'file',
      disabled: isUploadDisabled,
      action: uploadUrl,
      onChange: this.uploadOnchange,
      headers: {
        authorization: `Bearer ${localStorage.getItem('TOKEN')}`
      }
      // onRemove: this.uploadOnRemove
    }

    const columns = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      filterDropdown: (
        <SearchFilterDropdown
          placeholder="name"
          value={nameFilterValue}
          onChange={this.onSearchInputChange}
          onSearch={this.onSearch}
        />
      ),
      filterDropdownVisible: nameFilterDropdownVisible,
      onFilterDropdownVisibleChange: (visible) => this.setState({
        nameFilterDropdownVisible: visible
      }),
      sorter: (a, b) => a.name > b.name ? -1 : 1,
      sortOrder: tableSortedInfo.columnKey === 'name' ? tableSortedInfo.order : void 0
    }, {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    }, {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      filters: [{
        text: 'JDBC',
        value: 'jdbc'
      }, {
        text: 'CSV',
        value: 'csv'
      }],
      filterMultiple: false,
      onFilter: (val, record) => record.type === val,
      render: (text, record) => {
        const type = record.type
        switch (type) {
          case 'jdbc':
            return 'JDBC'
          case 'csv':
            return 'CSV'
          default:
            break
        }
      }
    }, {
      title: '操作',
      key: 'action',
      width: 150,
      className: `${initializePermission(currentProject, 'sourcePermission') ? utilStyles.textAlignLeft : utilStyles.hide}`,
      render: (text, record) => (
        <span className="ant-table-action-column">
          <Tooltip title="修改">
            <EditButton icon="edit" shape="circle" type="ghost" onClick={this.showDetail(record.id)} />
          </Tooltip>
          <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={onDeleteSource(record.id)}
          >
            <Tooltip title="删除">
              <AdminButton icon="delete" shape="circle" type="ghost" />
            </Tooltip>
          </Popconfirm>
          {
            record && record.type === 'csv' ? <Tooltip title="上传">
              <EditButton icon="upload" shape="circle" type="ghost" onClick={this.showUpload(record.id)} />
            </Tooltip> : ''
          }
        </span>
      )
    }]

    const pagination = {
      simple: screenWidth < 768 || screenWidth === 768,
      defaultPageSize: 20,
      showSizeChanger: true
    }

    return (
      <Container>
        <Helmet title="Source" />
        <Container.Title>
          <Row>
            <Col span={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link to="">Source</Link>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
        </Container.Title>
        <Container.Body>
          <Box>
            <Box.Header>
              <Box.Title>
                <Icon type="bars" />Source List
              </Box.Title>
              <Box.Tools>
                <Tooltip placement="bottom" title="新增">
                  <AdminButton type="primary" icon="plus" onClick={this.showAdd} />
                </Tooltip>
              </Box.Tools>
            </Box.Header>
            <Box.Body>
              <Row>
                <Col span={24}>
                  <Table
                    dataSource={tableSource}
                    rowKey="id"
                    columns={columns}
                    pagination={pagination}
                    loading={listLoading}
                    onChange={this.handleTableChange}
                    bordered
                  />
                </Col>
              </Row>
              <SourceForm
                projectId={params.pid}
                type={sourceFormType}
                visible={sourceFormVisible}
                formLoading={formLoading}
                testLoading={testLoading}
                onSave={this.saveSourceForm}
                onClose={this.closeSourceForm}
                onAfterClose={this.afterSourceFormClose}
                onTestSourceConnection={this.testSourceConnection}
                onCheckUniqueName={onCheckUniqueName}
                wrappedComponentRef={this.sourceForm}
              />
              <UploadCsvForm
                formKey={uploadFormKey}
                visible={uploadFormVisible}
                step={formStep}
                uploadProps={uploadProps}
                onStepChange={this.changeUploadFormStep}
                onUpload={this.uploadFile}
                onClose={this.closeUploadForm}
                onAfterClose={this.afterUploadFormClose}
                wrappedComponentRef={this.uploadForm}
              />
            </Box.Body>
          </Box>
        </Container.Body>
      </Container>
    )
  }
}

export function mapDispatchToProps (dispatch) {
  return {
    onLoadSources: (projectId) => dispatch(loadSources(projectId)),
    onAddSource: (source, resolve) => dispatch(addSource(source, resolve)),
    onDeleteSource: (id) => () => dispatch(deleteSource(id)),
    onEditSource: (source, resolve) => dispatch(editSource(source, resolve)),
    onTestSourceConnection: (url) => dispatch(testSourceConnection(url)),
    onGetCsvMetaId: (csvMeta, resolve) => dispatch(getCsvMetaId(csvMeta, resolve)),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject)),
    onSetSourceFormValue: (values) => dispatch(setSourceFormValue(values)),
    onSetUploadFormValue: (values) => dispatch(setUploadFormValue(values))
  }
}

const mapStateToProps = createStructuredSelector({
  sources: makeSelectSources(),
  listLoading: makeSelectListLoading(),
  formLoading: makeSelectFormLoading(),
  testLoading: makeSelectTestLoading(),
  currentProject: makeSelectCurrentProject()
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'source', reducer })
const withSaga = injectSaga({ key: 'source', saga })

export default compose(
  withReducer,
  withSaga,
  withConnect
)(Source)
