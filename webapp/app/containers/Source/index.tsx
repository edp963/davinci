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
import memoizeOne from 'memoize-one'
import { Link } from 'react-router-dom'
import { RouteComponentWithParams } from 'utils/types'

import { compose, Dispatch } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import Container, { ContainerTitle, ContainerBody } from 'components/Container'
import Box from 'components/Box'
import SearchFilterDropdown from 'components/SearchFilterDropdown'
import SourceConfigModal from './components/SourceConfigModal'
import UploadCsvModal from './components/UploadCsvModal'
import ResetConnectionModal from './components/ResetConnectionModal'

import {
  message,
  Row,
  Col,
  Table,
  Button,
  Tooltip,
  Icon,
  Popconfirm,
  Breadcrumb
} from 'antd'
import { ButtonProps } from 'antd/lib/button/button'
import { ColumnProps, PaginationConfig, SorterResult } from 'antd/lib/table'

import { SourceActions, SourceActionType } from './actions'
import {
  makeSelectSources,
  makeSelectListLoading,
  makeSelectFormLoading,
  makeSelectTestLoading,
  makeSelectResetLoading,
  makeSelectDatasourcesInfo
} from './selectors'
import { checkNameUniqueAction } from '../App/actions'
import { makeSelectCurrentProject } from '../Projects/selectors'
import ModulePermission from '../Account/components/checkModulePermission'
import { initializePermission } from '../Account/components/checkUtilPermission'
import { IProject } from 'containers/Projects/types'
import {
  ISourceBase,
  ISource,
  ICSVMetaInfo,
  ISourceFormValues,
  SourceResetConnectionProperties
} from './types'

import utilStyles from 'assets/less/util.less'

type ISourceListProps = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  RouteComponentWithParams

interface ISourceListStates {
  screenWidth: number
  tempFilterSourceName: string
  filterSourceName: string
  filterDropdownVisible: boolean
  tableSorter: SorterResult<ISource>
  sourceModalVisible: boolean
  uploadModalVisible: boolean
  csvUploading: boolean
  resetModalVisible: boolean
  resetSource: ISource
  editingSource: ISourceFormValues
  csvSourceId: number
}

const emptySource: ISourceFormValues = {
  id: 0,
  name: '',
  type: 'jdbc',
  description: '',
  projectId: 0,
  datasourceInfo: [],
  config: {
    username: '',
    password: '',
    url: '',
    properties: []
  }
}

export class SourceList extends React.PureComponent<
  ISourceListProps,
  ISourceListStates
> {
  public state: Readonly<ISourceListStates> = {
    screenWidth: document.documentElement.clientWidth,
    tempFilterSourceName: '',
    tableSorter: null,

    filterSourceName: '',
    filterDropdownVisible: false,

    sourceModalVisible: false,

    uploadModalVisible: false,
    csvUploading: false,
    resetModalVisible: false,
    resetSource: null,

    editingSource: { ...emptySource },
    csvSourceId: null
  }

  private basePagination: PaginationConfig = {
    defaultPageSize: 20,
    showSizeChanger: true
  }

  public componentWillMount() {
    const { onLoadSources, onLoadDatasourcesInfo, match } = this.props
    const projectId = +match.params.projectId
    onLoadSources(projectId)
    onLoadDatasourcesInfo()
    window.addEventListener('resize', this.setScreenWidth, false)
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.setScreenWidth, false)
  }

  private setScreenWidth = () => {
    this.setState({ screenWidth: document.documentElement.clientWidth })
  }

  private getFilterSources = memoizeOne(
    (sourceName: string, sources: ISourceBase[]) => {
      if (!Array.isArray(sources) || !sources.length) {
        return []
      }
      const regex = new RegExp(sourceName, 'gi')
      const filterSources = sources.filter(
        (v) => v.name.match(regex) || v.description.match(regex)
      )
      return filterSources
    }
  )

  private static getSourcePermission = memoizeOne((project: IProject) => ({
    sourcePermission: initializePermission(project, 'sourcePermission'),
    AdminButton: ModulePermission<ButtonProps>(project, 'source', true)(Button),
    EditButton: ModulePermission<ButtonProps>(project, 'source', false)(Button)
  }))

  private getTableColumns = ({
    sourcePermission,
    AdminButton,
    EditButton
  }: ReturnType<typeof SourceList.getSourcePermission>) => {
    const {
      tempFilterSourceName,
      filterSourceName,
      filterDropdownVisible,
      tableSorter
    } = this.state
    const { resetLoading } = this.props

    const columns: Array<ColumnProps<ISource>> = [
      {
        title: '名称',
        dataIndex: 'name',
        filterDropdown: (
          <SearchFilterDropdown
            placeholder="名称"
            value={tempFilterSourceName}
            onChange={this.filterSourceNameChange}
            onSearch={this.searchSource}
          />
        ),
        filterDropdownVisible,
        onFilterDropdownVisibleChange: (visible: boolean) =>
          this.setState({
            filterDropdownVisible: visible
          }),
        sorter: (a, b) => (a.name > b.name ? -1 : 1),
        sortOrder:
          tableSorter && tableSorter.columnKey === 'name'
            ? tableSorter.order
            : void 0
      },
      {
        title: '描述',
        dataIndex: 'description'
      },
      {
        title: '类型',
        dataIndex: 'type',
        filters: [
          {
            text: 'JDBC',
            value: 'jdbc'
          },
          {
            text: 'CSV',
            value: 'csv'
          }
        ],
        filterMultiple: false,
        onFilter: (val, record) => record.type === val,
        render: (_, record) => {
          const type = record.type
          return type && type.toUpperCase()
        }
      }
    ]

    if (filterSourceName) {
      const regex = new RegExp(`(${filterSourceName})`, 'gi')
      columns[0].render = (text: string) => (
        <span
          dangerouslySetInnerHTML={{
            __html: text.replace(
              regex,
              `<span class="${utilStyles.highlight}">$1</span>`
            )
          }}
        />
      )
    }

    if (sourcePermission) {
      columns.push({
        title: '操作',
        key: 'action',
        width: 180,
        render: (_, record) => (
          <span className="ant-table-action-column">
            <Tooltip title="重置连接">
              <EditButton
                icon="reload"
                shape="circle"
                type="ghost"
                disabled={resetLoading}
                onClick={this.openResetSource(record)}
              />
            </Tooltip>
            <Tooltip title="修改">
              <EditButton
                icon="edit"
                shape="circle"
                type="ghost"
                onClick={this.editSource(record.id)}
              />
            </Tooltip>
            <Popconfirm
              title="确定删除？"
              placement="bottom"
              onConfirm={this.deleteSource(record.id)}
            >
              <Tooltip title="删除">
                <AdminButton icon="delete" shape="circle" type="ghost" />
              </Tooltip>
            </Popconfirm>
            {record && record.type === 'csv' ? (
              <Tooltip title="上传">
                <EditButton
                  icon="upload"
                  shape="circle"
                  type="ghost"
                  onClick={this.showUploadModal(record.id)}
                />
              </Tooltip>
            ) : (
              ''
            )}
          </span>
        )
      })
    }

    return columns
  }

  private addSource = () => {
    this.setState({
      editingSource: {
        ...emptySource,
        projectId: +this.props.match.params.projectId
      },
      sourceModalVisible: true
    })
  }

  private openResetSource = (source: ISource) => () => {
    this.setState({
      resetModalVisible: true,
      resetSource: source
    })
  }

  private resetConnection = (properties: SourceResetConnectionProperties) => {
    this.props.onResetSourceConnection(properties, () => {
      this.closeResetConnectionModal()
    })
  }

  private closeResetConnectionModal = () => {
    this.setState({ resetModalVisible: false })
  }

  private editSource = (sourceId: number) => () => {
    this.props.onLoadSourceDetail(sourceId, (editingSource) => {
      this.setState({
        editingSource: {
          ...editingSource,
          datasourceInfo: this.getDatasourceInfo(editingSource)
        },
        sourceModalVisible: true
      })
    })
  }

  private getDatasourceInfo = (source: ISource): string[] => {
    const { datasourcesInfo } = this.props
    const { url, version } = source.config
    const matchResult = url.match(/^jdbc\:(\w+)\:/)

    if (matchResult) {
      const datasource = datasourcesInfo.find(
        (info) => info.name === matchResult[1]
      )
      return datasource
        ? datasource.versions.length
          ? [datasource.name, version || 'Default']
          : [datasource.name]
        : []
    } else {
      return []
    }
  }

  private deleteSource = (sourceId: number) => () => {
    const { onDeleteSource } = this.props
    onDeleteSource(sourceId)
  }

  private showUploadModal = (sourceId: number) => () => {
    this.setState({
      csvSourceId: sourceId,
      uploadModalVisible: true
    })
  }

  private saveSourceForm = (values: ISourceFormValues) => {
    const { match } = this.props
    const { datasourceInfo, config, ...rest } = values
    const version =
      datasourceInfo[1] === 'Default' ? '' : datasourceInfo[1] || ''
    const requestValue = {
      ...rest,
      config: {
        ...config,
        ext: !!version,
        version
      },
      projectId: Number(match.params.projectId)
    }

    if (!values.id) {
      this.props.onAddSource({ ...requestValue }, () => {
        this.closeSourceForm()
      })
    } else {
      this.props.onEditSource({ ...requestValue }, () => {
        this.closeSourceForm()
      })
    }
  }

  private closeSourceForm = () => {
    this.setState({
      sourceModalVisible: false
    })
  }

  private closeUploadModal = () => {
    this.setState({
      uploadModalVisible: false
    })
  }

  private uploadCsv = (csvMetaInfo: ICSVMetaInfo) => {
    this.setState({ csvUploading: true }, () => {
      this.props.onUploadCsvFile(
        csvMetaInfo,
        () => {
          this.closeUploadModal()
          message.info('csv 文件上传成功！')
          this.setState({ csvUploading: false })
        },
        () => {
          this.setState({ csvUploading: false })
        }
      )
    })
  }

  private tableChange = (_1, _2, sorter: SorterResult<ISource>) => {
    this.setState({
      tableSorter: sorter
    })
  }

  private filterSourceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      tempFilterSourceName: e.target.value,
      filterSourceName: ''
    })
  }

  private searchSource = (value: string) => {
    this.setState({
      filterSourceName: value,
      filterDropdownVisible: false
    })
  }

  private testSourceConnection = (
    username,
    password,
    jdbcUrl,
    ext,
    version
  ) => {
    if (jdbcUrl) {
      this.props.onTestSourceConnection({
        username,
        password,
        url: jdbcUrl,
        ext,
        version
      })
    } else {
      message.error('连接 Url 都不能为空')
    }
  }

  public render() {
    const {
      filterSourceName,
      sourceModalVisible,
      uploadModalVisible,
      resetModalVisible,
      resetSource,
      csvUploading,
      csvSourceId,
      screenWidth,
      editingSource
    } = this.state

    const {
      sources,
      listLoading,
      formLoading,
      testLoading,
      currentProject,
      datasourcesInfo,
      onValidateCsvTableName,
      onCheckUniqueName
    } = this.props

    const {
      sourcePermission,
      AdminButton,
      EditButton
    } = SourceList.getSourcePermission(currentProject)
    const tableColumns = this.getTableColumns({
      sourcePermission,
      AdminButton,
      EditButton
    })
    const tablePagination: PaginationConfig = {
      ...this.basePagination,
      simple: screenWidth <= 768
    }
    const filterSources = this.getFilterSources(filterSourceName, sources)

    return (
      <Container>
        <Helmet title="Source" />
        <ContainerTitle>
          <Row>
            <Col span={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link to="">Source</Link>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
        </ContainerTitle>
        <ContainerBody>
          <Box>
            <Box.Header>
              <Box.Title>
                <Icon type="bars" />
                Source List
              </Box.Title>
              <Box.Tools>
                <Tooltip placement="bottom" title="新增">
                  <AdminButton
                    type="primary"
                    icon="plus"
                    onClick={this.addSource}
                  />
                </Tooltip>
              </Box.Tools>
            </Box.Header>
            <Box.Body>
              <Row>
                <Col span={24}>
                  <Table
                    bordered
                    rowKey="id"
                    loading={listLoading}
                    dataSource={filterSources}
                    columns={tableColumns}
                    pagination={tablePagination}
                    onChange={this.tableChange}
                  />
                </Col>
              </Row>
              <SourceConfigModal
                source={editingSource}
                datasourcesInfo={datasourcesInfo}
                visible={sourceModalVisible}
                formLoading={formLoading}
                testLoading={testLoading}
                onSave={this.saveSourceForm}
                onClose={this.closeSourceForm}
                onTestSourceConnection={this.testSourceConnection}
                onCheckUniqueName={onCheckUniqueName}
              />
              <UploadCsvModal
                visible={uploadModalVisible}
                uploading={csvUploading}
                sourceId={csvSourceId}
                onValidate={onValidateCsvTableName}
                onCancel={this.closeUploadModal}
                onOk={this.uploadCsv}
              />
              <ResetConnectionModal
                visible={resetModalVisible}
                source={resetSource}
                onConfirm={this.resetConnection}
                onCancel={this.closeResetConnectionModal}
              />
            </Box.Body>
          </Box>
        </ContainerBody>
      </Container>
    )
  }
}

const mapDispatchToProps = (dispatch: Dispatch<SourceActionType>) => ({
  onLoadSources: (projectId: number) =>
    dispatch(SourceActions.loadSources(projectId)),
  onLoadSourceDetail: (sourceId: number, resolve: (source: ISource) => void) =>
    dispatch(SourceActions.loadSourceDetail(sourceId, resolve)),
  onAddSource: (source: ISource, resolve: () => any) =>
    dispatch(SourceActions.addSource(source, resolve)),
  onDeleteSource: (id: number) => dispatch(SourceActions.deleteSource(id)),
  onEditSource: (source: ISource, resolve: () => void) =>
    dispatch(SourceActions.editSource(source, resolve)),
  onTestSourceConnection: (testSource: Omit<ISource['config'], 'properties'>) =>
    dispatch(SourceActions.testSourceConnection(testSource)),
  onResetSourceConnection: (
    properties: SourceResetConnectionProperties,
    resolve: () => void
  ) => dispatch(SourceActions.resetSourceConnection(properties, resolve)),
  onValidateCsvTableName: (
    csvMeta: ICSVMetaInfo,
    callback: (errMsg?: string) => void
  ) => dispatch(SourceActions.validateCsvTableName(csvMeta, callback)),
  onUploadCsvFile: (
    csvMeta: ICSVMetaInfo,
    resolve: () => void,
    reject: () => void
  ) => dispatch(SourceActions.uploadCsvFile(csvMeta, resolve, reject)),
  onCheckUniqueName: (
    pathname: string,
    data: any,
    resolve: () => void,
    reject: (err: string) => void
  ) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject)),
  onLoadDatasourcesInfo: () => dispatch(SourceActions.loadDatasourcesInfo())
})

const mapStateToProps = createStructuredSelector({
  sources: makeSelectSources(),
  listLoading: makeSelectListLoading(),
  formLoading: makeSelectFormLoading(),
  testLoading: makeSelectTestLoading(),
  resetLoading: makeSelectResetLoading(),
  currentProject: makeSelectCurrentProject(),
  datasourcesInfo: makeSelectDatasourcesInfo()
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'source', reducer })
const withSaga = injectSaga({ key: 'source', saga })

export default compose(withReducer, withSaga, withConnect)(SourceList)
