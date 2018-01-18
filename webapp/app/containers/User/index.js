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
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router'

import Container from '../../components/Container'
import Box from '../../components/Box'
import SearchFilterDropdown from '../../components/SearchFilterDropdown'
import UserForm from './UserForm'
import UserPasswordForm from './UserPasswordForm'
import GroupForm from '../Group/GroupForm'
import Modal from 'antd/lib/modal'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Table from 'antd/lib/table'
import Button from 'antd/lib/button'
import Tooltip from 'antd/lib/tooltip'
import Icon from 'antd/lib/icon'
import Popconfirm from 'antd/lib/popconfirm'
import Breadcrumb from 'antd/lib/breadcrumb'

import { loadUsers, addUser, deleteUser, loadUserGroups, editUserInfo, changeUserPassword } from './actions'
import { loadGroups, addGroup } from '../Group/actions'
import { makeSelectUsers } from './selectors'
import { makeSelectGroups } from '../Group/selectors'
import { promiseDispatcher } from '../../utils/reduxPromisation'
import utilStyles from '../../assets/less/util.less'

export class User extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      tableSource: [],
      tableSortedInfo: {},
      tableLoading: false,

      formType: '',
      groupTransfer: {
        id: '',
        targets: []
      },

      emailFilterValue: '',
      emailFilterDropdownVisible: false,
      nameFilterValue: '',
      nameFilterDropdownVisible: false,

      modalLoading: false,

      userFormVisible: false,
      passwordFormVisible: false,
      groupFormVisible: false,

      userFormStep: 0
    }
  }

  componentWillMount () {
    this.setState({ tableLoading: true })
    this.props.onLoadGroups()
    this.props.onLoadUsers()
      .then(() => { this.setState({ tableLoading: false }) })
  }

  componentWillReceiveProps (props) {
    if (props.users) {
      this.state.tableSource = props.users.map(g => {
        g.key = g.id
        return g
      })
    }
  }

  showAdd = () => {
    this.setState({
      formType: 'add',
      userFormVisible: true
    })
  }

  showInfo = (id) => () => {
    this.setState({
      formType: 'edit',
      userFormVisible: true
    }, () => {
      const { email, admin, name, title } = this.props.users.find(u => u.id === id)
      this.props.onLoadUserGroups(id)
        .then(groups => {
          this.userForm.setFieldsValue({
            id,
            email,
            name,
            title,
            admin
          })
          this.setState({
            groupTransfer: {
              id: id,
              targets: groups ? groups.map(g => g.group_id) : []
            }
          })
        })
    })
  }

  showGroupForm = () => {
    this.setState({
      groupFormVisible: true
    })
  }

  showPassword = (id) => () => {
    this.setState({
      passwordFormVisible: true
    }, () => {
      this.userPasswordForm.setFieldsValue({ id })
    })
  }

  changeUserFormStep = (sign) => () => {
    if (sign) {
      this.userForm.validateFieldsAndScroll((err) => {
        if (!err) {
          this.setState({
            userFormStep: sign
          })
        }
      })
    } else {
      this.setState({
        userFormStep: sign
      })
    }
  }

  onUserModalOk = () => {
    const { formType, groupTransfer } = this.state
    this.userForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const userData = Object.assign({}, values, {
          relUG: groupTransfer.targets.map(gid => ({
            group_id: gid
          }))
        })
        this.setState({ modalLoading: true })
        switch (formType) {
          case 'add':
            this.props.onAddUser(userData)
              .then(() => { this.hideForm() })
            break
          case 'edit':
            this.props.onEditUserInfo(userData)
              .then(() => { this.hideForm() })
            break
          default:
            break
        }
      }
    })
  }

  onPasswordModalOk = () => {
    this.userPasswordForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.onChangeUserPassword(values)
          .then(() => { this.hideForm() })
      }
    })
  }

  onGroupTransferChange = (targets) => {
    this.setState({
      groupTransfer: {
        id: this.state.groupTransfer.id,
        targets: targets
      }
    })
  }

  onGroupAddModalOk = () => {
    this.groupForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ modalLoading: true })
        this.props.onAddGroup(values)
          .then(() => { this.hideGroupForm() })
      }
    })
  }

  hideForm = () => {
    this.setState({
      modalLoading: false,
      userFormVisible: false,
      passwordFormVisible: false,
      groupTransfer: {
        id: '',
        targets: []
      },
      userFormStep: 0
    })
    this.userForm && this.userForm.resetFields()
    this.userPasswordForm && this.userPasswordForm.resetFields()
  }

  hideGroupForm = () => {
    this.setState({
      modalLoading: false,
      groupFormVisible: false
    })
    this.groupForm.resetFields()
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
      tableSource: this.props.users.map(record => {
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
      emailFilterValue,
      emailFilterDropdownVisible,
      nameFilterValue,
      nameFilterDropdownVisible,
      modalLoading,
      userFormVisible,
      passwordFormVisible,
      groupTransfer,
      groupFormVisible,
      userFormStep,
      formType
    } = this.state

    const {
      groups,
      onDeleteUser
    } = this.props

    const columns = [{
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      filterDropdown: (
        <SearchFilterDropdown
          placeholder="email"
          value={emailFilterValue}
          onChange={this.onSearchInputChange('email')}
          onSearch={this.onSearch('email')}
        />
      ),
      filterDropdownVisible: emailFilterDropdownVisible,
      onFilterDropdownVisibleChange: visible => this.setState({ emailFilterDropdownVisible: visible }),
      sorter: (a, b) => a.email > b.email ? -1 : 1,
      sortOrder: tableSortedInfo.columnKey === 'email' && tableSortedInfo.order
    }, {
      title: '姓名',
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
      onFilterDropdownVisibleChange: visible => this.setState({ nameFilterDropdownVisible: visible }),
      sorter: (a, b) => a.name > b.name ? -1 : 1,
      sortOrder: tableSortedInfo.columnKey === 'name' && tableSortedInfo.order
    }, {
      title: '职位',
      dataIndex: 'title',
      key: 'title'
    }, {
      title: '用户类型',
      dataIndex: 'admin',
      key: 'admin',
      filters: [{
        text: '管理员',
        value: true
      }, {
        text: '普通用户',
        value: false
      }],
      filterMultiple: false,
      onFilter: (val, record) => `${record.admin}` === val,
      render: (text, record) => record.admin ? '管理员' : '普通用户'
    }, {
      title: '操作',
      key: 'action',
      width: 180,
      className: `${utilStyles.textAlignCenter}`,
      render: (text, record) => <span className="ant-table-action-column">
        <Tooltip title="基本信息">
          <Button icon="user" shape="circle" type="ghost" onClick={this.showInfo(record.id)} />
        </Tooltip>
        <Tooltip title="修改密码">
          <Button icon="edit" shape="circle" type="ghost" onClick={this.showPassword(record.id)} />
        </Tooltip>
        <Popconfirm
          title="确定删除？"
          placement="bottom"
          onConfirm={onDeleteUser(record.id)}
            >
          <Tooltip title="删除">
            <Button icon="delete" shape="circle" type="ghost" />
          </Tooltip>
        </Popconfirm>
      </span>
    }]

    const pagination = {
      defaultPageSize: 20,
      showSizeChanger: true
    }

    const userModalTitle = formType === 'add' ? '新增用户' : '修改基本信息'

    const addModalButtons = userFormStep
      ? [
        <Button
          key="add"
          size="large"
          type="primary"
          className={utilStyles.modalLeftButton}
          onClick={this.showGroupForm}
        >
          新增用户组
        </Button>,
        <Button
          key="back"
          size="large"
          onClick={this.changeUserFormStep(0)}>
          上一步
        </Button>,
        <Button
          key="submit"
          size="large"
          type="primary"
          loading={modalLoading}
          disabled={modalLoading}   // 防多次提交
          onClick={this.onUserModalOk}>
          保 存
        </Button>
      ]
      : [
        <Button
          key="forward"
          size="large"
          type="primary"
          onClick={this.changeUserFormStep(1)}>
          下一步
        </Button>
      ]

    const groupAddModalButtons = ([
      <Button
        key="back"
        size="large"
        onClick={this.hideGroupForm}>
        取 消
      </Button>,
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={modalLoading}
        disabled={modalLoading}
        onClick={this.onGroupAddModalOk}>
        保 存
      </Button>
    ])

    return (
      <Container>
        <Helmet title="User" />
        <Container.Title>
          <Row>
            <Col span={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link>User</Link>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
        </Container.Title>
        <Container.Body>
          <Box>
            <Box.Header>
              <Box.Title>
                <Icon type="bars" />User List
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
                title={userModalTitle}
                visible={userFormVisible}
                footer={addModalButtons}
                onCancel={this.hideForm}
                maskClosable={false}
              >
                <UserForm
                  type={formType}
                  step={userFormStep}
                  groupSource={groups || []}
                  groupTarget={groupTransfer.targets}
                  onGroupChange={this.onGroupTransferChange}
                  ref={(f) => { this.userForm = f }}
                />
              </Modal>
              <Modal
                title="修改密码"
                okText="保存"
                wrapClassName="ant-modal-small"
                visible={passwordFormVisible}
                onOk={this.onPasswordModalOk}
                onCancel={this.hideForm}
              >
                <UserPasswordForm
                  ref={(f) => { this.userPasswordForm = f }}
                />
              </Modal>
              <Modal
                title="新增用户组"
                wrapClassName="ant-modal-small"
                visible={groupFormVisible}
                footer={groupAddModalButtons}
                onCancel={this.hideGroupForm}
              >
                <GroupForm ref={(f) => { this.groupForm = f }} />
              </Modal>
            </Box.Body>
          </Box>
        </Container.Body>
      </Container>
    )
  }
}

User.propTypes = {
  users: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  groups: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  onLoadUsers: PropTypes.func,
  onAddUser: PropTypes.func,
  onDeleteUser: PropTypes.func,
  onLoadUserGroups: PropTypes.func,
  onEditUserInfo: PropTypes.func,
  onChangeUserPassword: PropTypes.func, // eslint-disable-line
  onLoadGroups: PropTypes.func,
  onAddGroup: PropTypes.func
}

const mapStateToProps = createStructuredSelector({
  users: makeSelectUsers(),
  groups: makeSelectGroups()
})

function mapDispatchToProps (dispatch) {
  return {
    onLoadUsers: () => promiseDispatcher(dispatch, loadUsers),
    onAddUser: (user) => promiseDispatcher(dispatch, addUser, user),
    onDeleteUser: (id) => () => promiseDispatcher(dispatch, deleteUser, id),
    onLoadUserGroups: (id) => promiseDispatcher(dispatch, loadUserGroups, id),
    onEditUserInfo: (user) => promiseDispatcher(dispatch, editUserInfo, user),
    onChangeUserPassword: (user) => promiseDispatcher(dispatch, changeUserPassword, user),
    onLoadGroups: () => promiseDispatcher(dispatch, loadGroups),
    onAddGroup: (group) => promiseDispatcher(dispatch, addGroup, group)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(User)
