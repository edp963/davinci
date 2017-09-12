/*-
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

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router'

import Container from '../../components/Container'
import Box from '../../components/Box'
import SearchFilterDropdown from '../../components/SearchFilterDropdown'
import SourceForm from './SourceForm'
import Modal from 'antd/lib/modal'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Table from 'antd/lib/table'
import Button from 'antd/lib/button'
import Tooltip from 'antd/lib/tooltip'
import Icon from 'antd/lib/icon'
import Popconfirm from 'antd/lib/popconfirm'
import Breadcrumb from 'antd/lib/breadcrumb'

import { promiseDispatcher } from '../../utils/reduxPromisation'
import { loadSources, addSource, deleteSource, editSource } from './actions'
import { makeSelectSources } from './selectors'
import utilStyles from '../../assets/less/util.less'

export class Source extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      tableSource: [],
      tableSortedInfo: {},
      tableLoading: false,

      nameFilterValue: '',
      nameFilterDropdownVisible: false,

      modalLoading: false,

      formVisible: false,
      formType: 'add'
    }
  }

  componentWillMount () {
    this.setState({ tableLoading: true })
    this.props.onLoadSources()
      .then(() => { this.setState({ tableLoading: false }) })
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
      const { id, name, type, connection_url, desc, config } = this.props.sources.find(g => g.id === sourceId)
      this.sourceForm.setFieldsValue({ id, name, type, connection_url, desc, config })
    })
    // FIXME 确认业务后删除 loadDetail 相关代码
    // this.props.onLoadSourceDetail(id)
    //   .then(detail => {
    //     this.sourceForm.setFieldsValue(detail)
    //   })
  }

  onModalOk = () => {
    this.sourceForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ modalLoading: true })
        if (this.state.formType === 'add') {
          this.props.onAddSource(values)
            .then(() => { this.hideForm() })
        } else {
          this.props.onEditSource(values)
            .then(() => { this.hideForm() })
        }
      }
    })
  }

  hideForm = () => {
    this.setState({
      modalLoading: false,
      formVisible: false
    })
    this.sourceForm.resetFields()
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      tableSortedInfo: sorter
    })
  }

  onSearchInputChange = (columnName) => (e) => {
    this.setState({ [`${columnName}FilterValue`]: e.target.value })
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

  render () {
    const {
      tableSource,
      tableSortedInfo,
      tableLoading,
      nameFilterValue,
      nameFilterDropdownVisible,
      modalLoading,
      formVisible,
      formType
    } = this.state

    const {
      onDeleteSource
    } = this.props

    const columns = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      filterDropdown: (
        <SearchFilterDropdown
          columnName="name"
          filterValue={nameFilterValue}
          onSearchInputChange={this.onSearchInputChange('name')}
          onSearch={this.onSearch('name')}
        />
      ),
      filterDropdownVisible: nameFilterDropdownVisible,
      onFilterDropdownVisibleChange: visible => this.setState({ nameFilterDropdownVisible: visible }),
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
        text: 'Moonbox',
        value: 'moonbox'
      }, {
        text: 'JDBC',
        value: 'jdbc'
      }],
      filterMultiple: false,
      onFilter: (val, record) => record.type === val,
      render: (text, record) => record.type === 'moonbox' ? 'Moonbox' : 'JDBC'
    }, {
      title: '操作',
      key: 'action',
      width: 120,
      className: `${utilStyles.textAlignCenter}`,
      render: (text, record) => (
        <span className="ant-table-action-column">
          <Tooltip title="修改">
            <Button icon="edit" shape="circle" type="ghost" onClick={this.showDetail(record.id)}></Button>
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
        loading={modalLoading}
        disabled={modalLoading}
        onClick={this.onModalOk}>
        保 存
      </Button>
    ])

    return (
      <Container>
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
                <Button type="primary" icon="plus" onClick={this.showAdd}>新增</Button>
              </Box.Tools>
            </Box.Header>
            <Box.Body>
              <Row>
                <Col span={24}>
                  <Table
                    dataSource={tableSource}
                    columns={columns}
                    pagination={pagination}
                    loading={tableLoading}
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
                  ref={(f) => { this.sourceForm = f }}
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
  onLoadSources: PropTypes.func,
  onAddSource: PropTypes.func,
  onDeleteSource: PropTypes.func,
  onEditSource: PropTypes.func
}

export function mapDispatchToProps (dispatch) {
  return {
    onLoadSources: () => promiseDispatcher(dispatch, loadSources),
    onAddSource: (source) => promiseDispatcher(dispatch, addSource, source),
    onDeleteSource: (id) => () => promiseDispatcher(dispatch, deleteSource, id),
    onEditSource: (source) => promiseDispatcher(dispatch, editSource, source)
  }
}

const mapStateToProps = createStructuredSelector({
  sources: makeSelectSources()
})

export default connect(mapStateToProps, mapDispatchToProps)(Source)
