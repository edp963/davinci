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
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'
import groupReducer from '../Group/reducer'
import groupSaga from '../Group/sagas'

import Container from 'components/Container'
import Box from 'components/Box'
import SearchFilterDropdown from 'components/SearchFilterDropdown'
import UserForm from './UserForm'
import UserPasswordForm from './UserPasswordForm'
import GroupForm from '../Group/GroupForm'
import { Modal, Row, Col, Table, Button, Tooltip, Icon, Popconfirm, Breadcrumb, message } from 'antd'
import { SortOrder } from 'antd/lib/table'
import { WrappedFormUtils } from 'antd/lib/form/Form'

import { loadUsers, addUser, deleteUser, loadUserGroups, editUserInfo, changeUserPassword } from './actions'
import { loadGroups, addGroup } from '../Group/actions'
import { makeSelectUsers, makeSelectTableLoading, makeSelectFormLoading } from './selectors'
import { makeSelectGroups } from '../Group/selectors'
const utilStyles = require('assets/less/util.less')

interface IUserProps {
  users: any[]
  groups: any[]
  tableLoading: boolean
  formLoading: boolean
  onLoadUsers: () => any
  onAddUser: (userData: object, resolve: any) => any
  onDeleteUser: (id: number) => any
  onLoadUserGroups: (id: number, resolve: any) => any
  onEditUserInfo: (userData: object, resolve: any) => any
  onChangeUserPassword: (formdata: any, resolve: any, reject: any) => any
  onLoadGroups: () => any
  onAddGroup: (group: any, resolve: any) => any
}

interface IUserStates {
  tableSource: any[]
  tableSortedInfo: {
    columnKey?: string,
    order?: SortOrder
  }
  formType: string
  groupTransfer: { id: string, targets: any[] }
  emailFilterValue: string
  emailFilterDropdownVisible: boolean
  nameFilterValue: string
  nameFilterDropdownVisible: boolean
  modalLoading: boolean
  userFormVisible: boolean
  passwordFormVisible: boolean
  groupFormVisible: boolean
  userFormStep: number
  screenWidth: number
}

export class User extends React.PureComponent<IUserProps, IUserStates> {
  constructor (props) {
    super(props)
    this.state = {
      tableSource: [],
      tableSortedInfo: {},

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

      userFormStep: 0,
      screenWidth: 0
    }
  }

  private userForm: WrappedFormUtils = null
  private userPasswordForm: WrappedFormUtils = null
  private groupForm: WrappedFormUtils = null

  public componentWillMount () {
    this.setState({ screenWidth: document.documentElement.clientWidth })
    this.props.onLoadGroups()
    this.props.onLoadUsers()
  }

  public componentWillReceiveProps (props) {
    window.onresize = () => this.setState({ screenWidth: document.documentElement.clientWidth })

    if (props.users) {
      this.setState({
        tableSource: props.users.map((g) => {
          g.key = g.id
          return g
        })
      })
    }
  }

  private showAdd = () => {
    this.setState({
      formType: 'add',
      userFormVisible: true
    })
  }

  private showInfo = (id) => () => {
    this.setState({
      formType: 'edit',
      userFormVisible: true
    }, () => {
      const { email, admin, name, title } = (this.props.users as any[]).find((u) => u.id === id)
      this.props.onLoadUserGroups(id, (groups) => {
        this.userForm.setFieldsValue({
          id,
          email,
          name,
          title,
          admin
        })
        this.setState({
          groupTransfer: {
            id,
            targets: groups ? groups.map((g) => g.group_id) : []
          }
        })
      })
    })
  }

  private showGroupForm = () => {
    this.setState({
      groupFormVisible: true
    })
  }

  private showPassword = (id) => () => {
    this.setState({
      passwordFormVisible: true
    }, () => {
      this.userPasswordForm.setFieldsValue({ id })
    })
  }

  private changeUserFormStep = (sign) => () => {
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

  private onUserModalOk = () => {
    const { formType, groupTransfer } = this.state
    this.userForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const userData = {
          ...values,
          ...{
            relUG: groupTransfer.targets.map((gid) => ({
              group_id: gid
            }))
          }
        }

        switch (formType) {
          case 'add':
            this.props.onAddUser(userData, () => {
              this.hideForm()
            })
            break
          case 'edit':
            this.props.onEditUserInfo(userData, () => {
              this.hideForm()
            })
            break
          default:
            break
        }
      }
    })
  }

  private onPasswordModalOk = () => {
    this.userPasswordForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.onChangeUserPassword(values, () => {
          this.hideForm()
        }, (msg) => {
          message.error(msg, 3)
        })
      }
    })
  }

  private onGroupTransferChange = (targets) => {
    this.setState({
      groupTransfer: {
        id: this.state.groupTransfer.id,
        targets
      }
    })
  }

  private onGroupAddModalOk = () => {
    this.groupForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ modalLoading: true })
        this.props.onAddGroup(values, () => {
          this.hideGroupForm()
        })
      }
    })
  }

  private hideForm = () => {
    this.setState({
      userFormVisible: false,
      passwordFormVisible: false,
      groupTransfer: {
        id: '',
        targets: []
      },
      userFormStep: 0
    })

    if (this.userForm) {
      this.userForm.resetFields()
    }

    if (this.userPasswordForm) {
      this.userPasswordForm.resetFields()
    }
  }

  private hideGroupForm = () => {
    this.setState({
      modalLoading: false,
      groupFormVisible: false
    })
    this.groupForm.resetFields()
  }

  private handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      tableSortedInfo: sorter
    })
  }

  private onEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ emailFilterValue: e.currentTarget.value })
  }

  private onNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ nameFilterValue: e.currentTarget.value })
  }

  private onNameSearch = () => {
    const val = this.state.nameFilterValue
    const reg = new RegExp(val, 'gi')

    this.setState({
      nameFilterDropdownVisible: false,
      tableSource: (this.props.users as any[]).map((record) => {
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

  private onEmailSearch = () => {
    const val = this.state.emailFilterValue
    const reg = new RegExp(val, 'gi')

    this.setState({
      emailFilterDropdownVisible: false,
      tableSource: (this.props.users as any[]).map((record) => {
        const match = record.email.match(reg)
        if (!match) {
          return null
        }
        return {
          ...record,
          email: (
            <span>
              {record.email.split(reg).map((text, i) => (
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
      formType,
      screenWidth
    } = this.state

    const {
      groups,
      onDeleteUser,
      tableLoading,
      formLoading
    } = this.props

    const columns = [{
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      filterDropdown: (
        <SearchFilterDropdown
          placeholder="email"
          value={emailFilterValue}
          onChange={this.onEmailInputChange}
          onSearch={this.onEmailSearch}
        />
      ),
      filterDropdownVisible: emailFilterDropdownVisible,
      onFilterDropdownVisibleChange: (visible) => this.setState({ emailFilterDropdownVisible: visible }),
      sorter: (a, b) => a.email > b.email ? -1 : 1,
      sortOrder: tableSortedInfo.columnKey === 'email' ? tableSortedInfo.order : void 0
    }, {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      filterDropdown: (
        <SearchFilterDropdown
          placeholder="name"
          value={nameFilterValue}
          onChange={this.onNameInputChange}
          onSearch={this.onNameSearch}
        />
      ),
      filterDropdownVisible: nameFilterDropdownVisible,
      onFilterDropdownVisibleChange: (visible) => this.setState({ nameFilterDropdownVisible: visible }),
      sorter: (a, b) => a.name > b.name ? -1 : 1,
      sortOrder: tableSortedInfo.columnKey === 'name' ? tableSortedInfo.order : void 0
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
      render: (text, record) => (
        <span className="ant-table-action-column">
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
      )
    }]

    const pagination = {
      simple: screenWidth < 768 || screenWidth === 768,
      defaultPageSize: 20,
      showSizeChanger: true
    }

    const userModalTitle = formType === 'add' ? '新增用户' : '修改基本信息'

    const addModalButtons = userFormStep
      ? [(
        <Button
          key="add"
          size="large"
          type="primary"
          className={utilStyles.modalLeftButton}
          onClick={this.showGroupForm}
        >
          新增用户组
        </Button>
      ), (
        <Button
          key="back"
          size="large"
          onClick={this.changeUserFormStep(0)}
        >
          上一步
        </Button>
      ), (
        <Button
          key="submit"
          size="large"
          type="primary"
          loading={formLoading}
          disabled={formLoading}   // 防多次提交
          onClick={this.onUserModalOk}
        >
          保 存
        </Button>
      )]
      : [(
        <Button
          key="forward"
          size="large"
          type="primary"
          onClick={this.changeUserFormStep(1)}
        >
          下一步
        </Button>
      )]

    const groupAddModalButtons = ([(
      <Button
        key="back"
        size="large"
        onClick={this.hideGroupForm}
      >
        取 消
      </Button>
    ), (
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={modalLoading}
        disabled={modalLoading}
        onClick={this.onGroupAddModalOk}
      >
        保 存
      </Button>
    )
    ])

    return (
      <Container>
        <Helmet title="User" />
        <Container.Title>
          <Row>
            <Col span={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link to="">User</Link>
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

const mapStateToProps = createStructuredSelector({
  users: makeSelectUsers(),
  groups: makeSelectGroups(),
  tableLoading: makeSelectTableLoading(),
  formLoading: makeSelectFormLoading()
})

function mapDispatchToProps (dispatch) {
  return {
    onLoadUsers: () => dispatch(loadUsers()),
    onAddUser: (user, resolve) => dispatch(addUser(user, resolve)),
    onDeleteUser: (id) => () => dispatch(deleteUser(id)),
    onLoadUserGroups: (id, resolve) => dispatch(loadUserGroups(id, resolve)),
    onEditUserInfo: (user, resolve) => dispatch(editUserInfo(user, resolve)),
    onChangeUserPassword: (user, resolve, reject) => dispatch(changeUserPassword(user, resolve, reject)),
    onLoadGroups: () => dispatch(loadGroups()),
    onAddGroup: (group, resolve) => dispatch(addGroup(group, resolve))
  }
}

const withConnect = connect<{}, {}, IUserProps>(mapStateToProps, mapDispatchToProps)

const withReducerUser = injectReducer({ key: 'user', reducer })
const withSagaUser = injectSaga({ key: 'user', saga })

const withReducerGroup = injectReducer({ key: 'group', reducer: groupReducer })
const withSagaGroup = injectSaga({ key: 'group', saga: groupSaga })

export default compose(
  withReducerUser,
  withReducerGroup,
  withSagaUser,
  withSagaGroup,
  withConnect
)(User)
