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
import { WrappedFormUtils } from 'antd/lib/form/Form'

const message = require('antd/lib/message')
const Modal = require('antd/lib/modal')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Table = require('antd/lib/table')
const Button = require('antd/lib/button')
const Tooltip = require('antd/lib/tooltip')
const Icon = require('antd/lib/icon')
const Popconfirm = require('antd/lib/popconfirm')
const Breadcrumb = require('antd/lib/breadcrumb')

import {
  loadSources,
  addSource,
  deleteSource,
  editSource,
  testSourceConnection,
  getCsvMetaId
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

interface ISourceProps {
  sources: boolean | any[]
  listLoading: boolean
  formLoading: boolean
  testLoading: boolean
  onLoadSources: () => any
  onAddSource: (sourceData: any, resolve: any) => any
  onDeleteSource: (id: number) => any
  onEditSource: (sourceData: any, resolve: any) => any
  onTestSourceConnection: (testSource: any) => any
  onGetCsvMetaId: (
    csvMeta: any,
    resolve: any,
    reject: any) => any
}

interface ISourceStates {
  tableSource: any[]
  tableSortedInfo: {columnKey?: string, order?: string}
  nameFilterValue: string
  nameFilterDropdownVisible: boolean
  formVisible: boolean
  formType: string
  uploadFormVisible: boolean
  formStep: number
  metaId: any
  isUploadDisabled: boolean
  newUploadModalKey: string
  screenWidth: number
}

interface ISourceObject {
  user: string
  password: string
  url: string
}

export class Source extends React.PureComponent<ISourceProps, ISourceStates> {
  constructor (props) {
    super(props)
    this.state = {
      tableSource: [],
      tableSortedInfo: {},

      nameFilterValue: '',
      nameFilterDropdownVisible: false,

      formVisible: false,
      formType: 'add',

      uploadFormVisible: false,
      formStep: 0,
      metaId: false,
      isUploadDisabled: false,

      newUploadModalKey: '1',
      screenWidth: 0
    }
  }

  private sourceForm: WrappedFormUtils = null
  private uploadForm: WrappedFormUtils = null

  public componentWillMount () {
    this.props.onLoadSources()
    this.setState({ screenWidth: document.documentElement.clientWidth })
  }

  public componentWillReceiveProps (props) {
    window.onresize = () => this.setState({ screenWidth: document.documentElement.clientWidth })

    if (props.sources) {
      this.setState({
        tableSource: props.sources.map((g) => {
          g.key = g.id
          return g
        })
      })
    }
  }

  private showAdd = () => {
    this.setState({
      formVisible: true,
      formType: 'add'
    })
  }

  private showDetail = (sourceId) => () => {
    this.setState({
      formVisible: true,
      formType: 'edit'
    }, () => {
      const {
        id,
        name,
        type,
        connection_url,
        desc,
        config
      } = (this.props.sources as any[]).find((g) => g.id === sourceId)
      const connectionUrl = JSON.parse(connection_url)
      this.sourceForm.setFieldsValue({
        id,
        name,
        type,
        user: connectionUrl.user,
        password: connectionUrl.password,
        url: connectionUrl.url,
        desc,
        config
      })
    })
  }

  private showUpload = (sourceId) => () => {
    const redrawKey = uuid(6, 10)
    this.setState({
      newUploadModalKey: redrawKey,
      uploadFormVisible: true
    }, () => {
      this.uploadForm.setFieldsValue({
        source_id: sourceId
      })
    })
  }

  private onModalOk = () => {
    this.sourceForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { id, name, type, url, user, password, desc, config } = values
        if (this.state.formType === 'add') {
          this.props.onAddSource({
            name,
            type,
            connection_url: JSON.stringify({
              url,
              user,
              password
            }),
            desc,
            config
          }, () => {
            this.hideForm()
          })
        } else {
          this.props.onEditSource({
            id,
            name,
            type,
            connection_url: JSON.stringify({
              url,
              user,
              password
            }),
            desc,
            config
          }, () => {
            this.hideForm()
          })
        }
      }
    })
  }

  private changeFormStep = (step) => () => {
    const { onGetCsvMetaId } = this.props
    if (step) {
      this.uploadForm.validateFieldsAndScroll((err, values) => {
        if (!err) {
          const { table_name, source_id, primary_keys, index_keys, replace_mode } = values
          const csvMeta = {
            table_name,
            source_id,
            primary_keys,
            index_keys,
            replace_mode
          }
          onGetCsvMetaId(csvMeta, (res) => {
            this.setState({
              metaId: res && res.payload,
              formStep: step
            })
          }, (error) => {
            message.error(error)
          })
        }
      })
    } else {
      this.setState({
        formStep: step
      })
    }
  }

  private hideForm = () => {
    this.setState({
      formVisible: false
    })
    this.sourceForm.resetFields()
  }

  private hideUploadForm = () => {
    this.setState({
      uploadFormVisible: false
    }, () => {
      this.setState({formStep: 0})
      this.uploadForm.resetFields()
    })
  }

  private onUploadFile = () => {
    this.hideUploadForm()
    this.setState({
      isUploadDisabled: false
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

  private testSourceConnection = () => {
    const formValues = this.sourceForm.getFieldsValue() as ISourceObject
    const { user, password, url } = formValues

    if (user && password && url) {
      this.props.onTestSourceConnection({
        user,
        password,
        url
      })
    } else {
      message.error('用户名，密码和连接Url都不能为空')
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
      message.success(`${info.file.name} file uploaded successfully`)
      this.setState({
        formStep: 2,
        isUploadDisabled: true
      })
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`)
    }
  }

  public render () {
    const {
      tableSource,
      tableSortedInfo,
      nameFilterValue,
      nameFilterDropdownVisible,
      formVisible,
      uploadFormVisible,
      formType,
      formStep,
      metaId,
      isUploadDisabled,
      newUploadModalKey,
      screenWidth
    } = this.state

    const {
      listLoading,
      formLoading,
      testLoading,
      onDeleteSource
    } = this.props

    const uploadProps = {
      name: 'csv',
      disabled: isUploadDisabled,
      action: `${api.uploads}/csv/${metaId}`,
      onChange: this.uploadOnchange
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
      sortOrder: tableSortedInfo.columnKey === 'name' && tableSortedInfo.order
    }, {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc'
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
      width: 135,
      className: `${utilStyles.textAlignLeft}`,
      render: (text, record) => (
        <span className="ant-table-action-column">
          <Tooltip title="修改">
            <Button icon="edit" shape="circle" type="ghost" onClick={this.showDetail(record.id)} />
          </Tooltip>
          <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={onDeleteSource(record.id)}
          >
            <Tooltip title="删除">
              <Button icon="delete" shape="circle" type="ghost" />
            </Tooltip>
          </Popconfirm>
          {
            record && record.type === 'csv' ? <Tooltip title="上传">
              <Button icon="upload" shape="circle" type="ghost" onClick={this.showUpload(record.id)} />
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

    const modalButtons = ([(
      <Button
        key="back"
        size="large"
        onClick={this.hideForm}
      >
        取 消
      </Button>),
      (
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={formLoading}
        disabled={formLoading}
        onClick={this.onModalOk}
      >
        保 存
      </Button>)
    ])
    const uploadFormButtons = formStep
      ? [(
      <Button
          key="submit"
          size="large"
          type="primary"
          onClick={this.onUploadFile}
      >
          保 存
      </Button>)
      ]
      : [(
      <Button
          key="forward"
          size="large"
          type="primary"
          onClick={this.changeFormStep(1)}
      >
          下一步
      </Button>)
      ]

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
                  <Button type="primary" icon="plus" onClick={this.showAdd} />
                </Tooltip>
              </Box.Tools>
            </Box.Header>
            <Box.Body>
              <Row>
                <Col span={24}>
                  <Table
                    dataSource={tableSource}
                    columns={columns}
                    pagination={pagination}
                    loading={listLoading}
                    onChange={this.handleTableChange}
                    bordered
                  />
                </Col>
              </Row>
              <Modal
                title={`${formType === 'add' ? '新增' : '修改'} Source`}
                wrapClassName="ant-modal-small"
                visible={formVisible}
                footer={modalButtons}
                onCancel={this.hideForm}
              >
                <SourceForm
                  type={formType}
                  testLoading={testLoading}
                  onTestSourceConnection={this.testSourceConnection}
                  ref={(f) => { this.sourceForm = f }}
                />
              </Modal>
              <Modal
                title="上传CSV"
                key={newUploadModalKey}
                visible={uploadFormVisible}
                wrapClassName="ant-modal-small"
                footer={uploadFormButtons}
                onCancel={this.hideUploadForm}
              >
                <UploadCsvForm
                  step={formStep}
                  uploadProps={uploadProps}
                  ref={(f) => { this.uploadForm = f }}
                />
              </Modal>
            </Box.Body>
          </Box>
        </Container.Body>
      </Container>
    )
  }
}

export function mapDispatchToProps (dispatch) {
  return {
    onLoadSources: () => dispatch(loadSources()),
    onAddSource: (source, resolve) => dispatch(addSource(source, resolve)),
    onDeleteSource: (id) => () => dispatch(deleteSource(id)),
    onEditSource: (source, resolve) => dispatch(editSource(source, resolve)),
    onTestSourceConnection: (url) => dispatch(testSourceConnection(url)),
    onGetCsvMetaId: (csvMeta, resolve, reject) => dispatch(getCsvMetaId(csvMeta, resolve, reject))
  }
}

const mapStateToProps = createStructuredSelector({
  sources: makeSelectSources(),
  listLoading: makeSelectListLoading(),
  formLoading: makeSelectFormLoading(),
  testLoading: makeSelectTestLoading()
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'source', reducer })
const withSaga = injectSaga({ key: 'source', saga })

export default compose(
  withReducer,
  withSaga,
  withConnect
)(Source)
