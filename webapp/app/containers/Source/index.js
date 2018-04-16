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
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import {
  connect
} from 'react-redux'
import {
  createStructuredSelector
} from 'reselect'
import {
  Link
} from 'react-router'

import Container from '../../components/Container'
import Box from '../../components/Box'
import SearchFilterDropdown from '../../components/SearchFilterDropdown'
import SourceForm from './SourceForm'
import UploadCsvForm from './UploadCsvForm'
import Modal from 'antd/lib/modal'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Table from 'antd/lib/table'
import Button from 'antd/lib/button'
import Tooltip from 'antd/lib/tooltip'
import Icon from 'antd/lib/icon'
import Popconfirm from 'antd/lib/popconfirm'
import Breadcrumb from 'antd/lib/breadcrumb'
import message from 'antd/lib/message'

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
import utilStyles from '../../assets/less/util.less'
import api from '../../utils/api'
import { uuid } from '../../utils/util'

export class Source extends React.PureComponent {
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

      newUploadModalKey: '1'
    }
  }

  componentWillMount () {
    this.props.onLoadSources()
  }

  componentWillReceiveProps (props) {
    if (props.sources) {
      this.state.tableSource = props.sources.map(g => {
        g.key = g.id
        return g
      })
    }
  }

  showAdd = () => {
    this.setState({
      formVisible: true,
      formType: 'add'
    })
  }

  showDetail = (sourceId) => () => {
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
      } = this.props.sources.find(g => g.id === sourceId)
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
  showUpload = (sourceId) => () => {
    const redrawKey = uuid(6, 10)
    this.setState({
      newUploadModalKey: redrawKey,
      uploadFormVisible: true
    }, () => {
      this.uploadForm.setFieldsValue({
        'source_id': sourceId
      })
    })
  }

  onModalOk = () => {
    this.sourceForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {
          id,
          name,
          type,
          url,
          user,
          password,
          desc,
          config
        } = values
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
  changeFormStep = (step) => () => {
    const {onGetCsvMetaId} = this.props
    if (step) {
      this.uploadForm.validateFieldsAndScroll((err, values) => {
        if (!err) {
          const {table_name, source_id, primary_keys, index_keys, replace_mode} = values
          onGetCsvMetaId(table_name, source_id, primary_keys, index_keys, replace_mode, res => {
            let metaId = res && res.payload
            this.setState({
              metaId: metaId,
              formStep: step
            })
          }, error => {
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

  hideForm = () => {
    this.setState({
      formVisible: false
    })
    this.sourceForm.resetFields()
  }

  hideUploadForm = () => {
    this.setState({
      uploadFormVisible: false
    }, () => {
      this.setState({formStep: 0})
      this.uploadForm.resetFields()
    })
  }
  onUploadFile = () => {
    this.hideUploadForm()
    this.setState({
      isUploadDisabled: false
    })
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      tableSortedInfo: sorter
    })
  }

  onSearchInputChange = (columnName) => (e) => {
    this.setState({
      [`${columnName}FilterValue`]: e.target.value
    })
  }

  onSearch = (columnName) => () => {
    const val = this.state[`${columnName}FilterValue`]
    const reg = new RegExp(val, 'gi')

    this.setState({
      [`${columnName}FilterDropdownVisible`]: false,
      tableSource: this.props.sources.map(record => {
        const match = record[columnName].match(reg)
        if (!match) {
          return null
        }
        return {
          ...record,
          [columnName]: (
            <span>
              {record[columnName].split(reg).map((text, i) => (
                i > 0 ? [<span className={utilStyles.highlight}>{match[0]}</span>, text] : text
              ))}
            </span>
          )
        }
      }).filter(record => !!record)
    })
  }

  testSourceConnection = () => {
    const formValues = this.sourceForm.getFieldsValue()
    const {
      user,
      password,
      url
    } = formValues

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

  uploadOnchange = info => {
    if (info.file.status !== 'uploading') {
      let fileLength = info.fileList.length
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
  render () {
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
      newUploadModalKey
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
      onChange: this.uploadOnchange,
      onRemove: this.uploadOnRemove
    }

    const columns = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      filterDropdown: (
        <SearchFilterDropdown
          placeholder="name"
          value={nameFilterValue}
          onChange={this.onSearchInputChange('name')}
          onSearch={this.onSearch('name')}
        />
      ),
      filterDropdownVisible: nameFilterDropdownVisible,
      onFilterDropdownVisibleChange: visible => this.setState({
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
        let type = record.type
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
      defaultPageSize: 20,
      showSizeChanger: true
    }

    const modalButtons = ([
      <Button
        key="back"
        size="large"
        onClick={this.hideForm}>
        取 消
      </Button>,
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={formLoading}
        disabled={formLoading}
        onClick={this.onModalOk}>
        保 存
      </Button>
    ])
    const uploadFormButtons = formStep
      ? [
        <Button
          key="submit"
          size="large"
          type="primary"
          onClick={this.onUploadFile}>
          保 存
        </Button>
      ]
      : [
        <Button
          key="forward"
          size="large"
          type="primary"
          onClick={this.changeFormStep(1)}>
          下一步
        </Button>
      ]

    return (
      <Container>
        <Helmet title="Source" />
        <Container.Title>
          <Row>
            <Col span={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link>Source</Link>
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

Source.propTypes = {
  sources: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  listLoading: PropTypes.bool,
  formLoading: PropTypes.bool,
  testLoading: PropTypes.bool,
  onLoadSources: PropTypes.func,
  onAddSource: PropTypes.func,
  onDeleteSource: PropTypes.func,
  onEditSource: PropTypes.func,
  onTestSourceConnection: PropTypes.func,
  onGetCsvMetaId: PropTypes.func
}

export function mapDispatchToProps (dispatch) {
  return {
    onLoadSources: () => dispatch(loadSources()),
    onAddSource: (source, resolve) => dispatch(addSource(source, resolve)),
    onDeleteSource: (id) => () => dispatch(deleteSource(id)),
    onEditSource: (source, resolve) => dispatch(editSource(source, resolve)),
    onTestSourceConnection: (url) => dispatch(testSourceConnection(url)),
    onGetCsvMetaId: (...args) => dispatch(getCsvMetaId(...args))
  }
}

const mapStateToProps = createStructuredSelector({
  sources: makeSelectSources(),
  listLoading: makeSelectListLoading(),
  formLoading: makeSelectFormLoading(),
  testLoading: makeSelectTestLoading()
})

export default connect(mapStateToProps, mapDispatchToProps)(Source)
