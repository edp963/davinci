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

import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import Container from 'components/Container'
import Box from 'components/Box'
import SearchFilterDropdown from 'components/SearchFilterDropdown'
import GroupForm from './GroupForm'
import { Modal, Row, Col, Table, Button, Tooltip, Icon, Popconfirm, Breadcrumb } from 'antd'

import { PaginationProps } from 'antd/lib/pagination'

import { loadGroups, addGroup, deleteGroup, editGroup } from './actions'
import { makeSelectGroups, makeSelectTableLoading, makeSelectFormLoading } from './selectors'
const utilStyles = require('assets/less/util.less')

interface IGroupProps {
  groups: boolean | any[]
  tableLoading: boolean
  formLoading: boolean
  onLoadGroups: () => any
  onAddGroup: (values: object, resolve: any) => any
  onDeleteGroup: (id: number) => any
  onEditGroup: (values: object, resolve: any) => any
}

interface IGroupStates {
  tableSource: any[]
  tableSortedInfo: { columnKey?: string, order?: string }
  nameFilterValue: string
  nameFilterDropdownVisible: boolean
  formVisible: boolean
  formType: string
  screenWidth: number
}

export class Group extends React.PureComponent<IGroupProps, IGroupStates> {
  constructor (props) {
    super(props)
    this.state = {
      tableSource: [],
      tableSortedInfo: {},

      nameFilterValue: '',
      nameFilterDropdownVisible: false,

      formVisible: false,
      formType: 'add',
      screenWidth: 0
    }
  }

  private groupForm: {
    validateFieldsAndScroll: (cb: (err: any, values: object) => void) => void
    setFieldsValue: (values: { id: number, name: string, desc: string }) => void
    resetFields: () => void
  } = null

  public componentWillMount () {
    this.setState({ screenWidth: document.documentElement.clientWidth })
    this.props.onLoadGroups()
  }

  public componentWillReceiveProps (props) {
    window.onresize = () => this.setState({ screenWidth: document.documentElement.clientWidth })

    if (props.groups) {
      this.setState({
        tableSource: props.groups.map((g) => {
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

  private showDetail = (groupId) => () => {
    this.setState({
      formVisible: true,
      formType: 'edit'
    }, () => {
      const { id, name, desc } = (this.props.groups as any[]).find((g) => g.id === groupId)
      this.groupForm.setFieldsValue({ id, name, desc })
    })
    // FIXME 确认业务后删除 loadDetail 相关代码
    // this.props.onLoadGroupDetail(id)
    //   .then((detail) => {
    //     this.groupForm.setFieldsValue(detail)
    //   })
  }

  private onModalOk = () => {
    this.groupForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (this.state.formType === 'add') {
          this.props.onAddGroup(values, () => {
            this.hideForm()
          })
        } else {
          this.props.onEditGroup(values, () => {
            this.hideForm()
          })
        }
      }
    })
  }

  private hideForm = () => {
    this.setState({
      formVisible: false
    })
    this.groupForm.resetFields()
  }

  private handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      tableSortedInfo: sorter
    })
  }

  private onSearchInputChange = (e) => {
    this.setState({ nameFilterValue: e.target.value })
  }

  private onSearch = () => {
    const val = this.state.nameFilterValue
    const reg = new RegExp(val, 'gi')

    this.setState({
      nameFilterDropdownVisible: false,
      tableSource: (this.props.groups as any[]).map((record) => {
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

  public render () {
    const {
      tableSource,
      tableSortedInfo,
      nameFilterValue,
      nameFilterDropdownVisible,
      formVisible,
      formType,
      screenWidth
    } = this.state

    const {
      onDeleteGroup,
      tableLoading,
      formLoading
    } = this.props

    const columns: any = [{
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
      onFilterDropdownVisibleChange: (visible) => this.setState({ nameFilterDropdownVisible: visible }),
      sorter: (a, b) => a.name > b.name ? -1 : 1,
      sortOrder: tableSortedInfo.columnKey === 'name' && tableSortedInfo.order
    }, {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc'
    }, {
      title: '操作',
      key: 'action',
      width: 120,
      className: `${utilStyles.textAlignCenter}`,
      render: (text, record) => (
        <span className="ant-table-action-column">
          <Tooltip title="修改">
            <Button icon="edit" shape="circle" type="ghost" onClick={this.showDetail(record.id)} />
          </Tooltip>
          <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={onDeleteGroup(record.id)}
          >
            <Tooltip title="删除">
              <Button icon="delete" shape="circle" type="ghost" />
            </Tooltip>
          </Popconfirm>
        </span>
      )
    }]

    const pagination: PaginationProps = {
      simple: screenWidth < 768 || screenWidth === 768,
      defaultPageSize: 20,
      showSizeChanger: true,
      total: tableSource.length
    }

    const modalButtons = ([(
      <Button
        key="back"
        size="large"
        onClick={this.hideForm}
      >
        取 消
      </Button>
    ), (
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={formLoading}
        disabled={formLoading}
        onClick={this.onModalOk}
      >
        保 存
      </Button>
    )])

    return (
      <Container>
        <Helmet title="Group" />
        <Container.Title>
          <Row>
            <Col span={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  {/* <Link>Group</Link> */}
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
        </Container.Title>
        <Container.Body>
          <Box>
            <Box.Header>
              <Box.Title>
                <Icon type="bars" />Group List
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
                    loading={tableLoading}
                    onChange={this.handleTableChange}
                    bordered
                  />
                </Col>
              </Row>
              <Modal
                title={`${formType === 'add' ? '新增' : '修改'}用户组`}
                wrapClassName="ant-modal-small"
                visible={formVisible}
                footer={modalButtons}
                onCancel={this.hideForm}
              >
                <GroupForm
                  type={formType}
                  ref={(f: any) => { this.groupForm = f }}
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
    onLoadGroups: () => dispatch(loadGroups()),
    onAddGroup: (group, resolve) => dispatch(addGroup(group, resolve)),
    onDeleteGroup: (id) => () => dispatch(deleteGroup(id)),
    onEditGroup: (group, resolve) => dispatch(editGroup(group, resolve))
  }
}

const mapStateToProps = createStructuredSelector({
  groups: makeSelectGroups(),
  tableLoading: makeSelectTableLoading(),
  formLoading: makeSelectFormLoading()
})

const withConnect = connect<{}, {}, IGroupProps>(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'group', reducer })
const withSaga = injectSaga({ key: 'group', saga })

export default compose(
  withReducer,
  withSaga,
  withConnect
)(Group)
