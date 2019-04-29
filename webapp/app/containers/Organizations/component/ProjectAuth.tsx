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
import * as classnames from 'classnames'
import { Icon, Button, Row, Col, Input, Select, Popconfirm, Table, Modal, Form, Radio } from 'antd'
const FormItem = Form.Item
const InputGroup = Input.Group
const RadioGroup = Radio.Group
const Option = Select.Option
const styles = require('../containers/Projects/Project.less')
const utilStyles =  require('../../../assets/less/util.less')

interface IAuthProps {
  form?: any
  currentProjectRole?: object
  onChangePermission?: (event: any, record: object) => any
}

export class Auth extends React.PureComponent <IAuthProps, {}> {
  constructor (props) {
    super(props)
  }
  public render () {
    const role = 1
    const authModules = [ 'viz', 'view', 'source', 'widget', 'schedule', 'share', 'download']
    const organizationMembers = authModules.map((auth, index) => {
      return {
        user: auth,
        permission: this.props.currentProjectRole ? this.props.currentProjectRole['permission'][`${auth}Permission`] : void 0
      }
    })
    const columns = [
      {
        title: 'role',
        dataIndex: 'user',
        key: 'userKey'
      },
      {
          title: 'settings',
          dataIndex: 'permission',
         // className: isHidden ? utilStyles.hide : '',
          key: 'settings',
          width: '59%',
          render: (text, record) => {
            switch (record.user) {
              case 'share':
              case 'download':
                return (
                  <Radio.Group size="small" disabled={!role} value={text} onChange={this.props.onChangePermission.bind(this, record)}>
                    <Radio value={false}>禁止</Radio>
                    <Radio value={true}>允许</Radio>
                  </Radio.Group>
                )
              default:
                return (
                  <Radio.Group size="small" disabled={!role} value={text} onChange={this.props.onChangePermission.bind(this, record)}>
                    <Radio value={0}>隐藏</Radio>
                    <Radio value={1}>只读</Radio>
                    <Radio value={2}>修改</Radio>
                    <Radio value={3}>删除</Radio>
                  </Radio.Group>
                )
            }
          }
      }]

    const dvColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Auth',
      dataIndex: 'name',
      key: 'auth',
      width: '59%',
      render: (text) => {
        return (
          <Radio.Group size="small" disabled={!role}>
            <Radio value={0}>隐藏</Radio>
            <Radio value={1}>只读</Radio>
            <Radio value={2}>修改</Radio>
            <Radio value={3}>删除</Radio>
          </Radio.Group>
        )
      }
    }
  ]

    const dvData = [{
      key: 1,
      name: 'John Brown sr.',
      age: 60,
      address: 'New York No. 1 Lake Park',
      children: [{
        key: 11,
        name: 'John Brown',
        age: 42,
        address: 'New York No. 2 Lake Park',
      }, {
        key: 12,
        name: 'John Brown jr.',
        age: 30,
        address: 'New York No. 3 Lake Park',
        children: [{
          key: 121,
          name: 'Jimmy Brown',
          age: 16,
          address: 'New York No. 3 Lake Park',
        }],
      }, {
        key: 13,
        name: 'Jim Green sr.',
        age: 72,
        address: 'London No. 1 Lake Park',
        children: [{
          key: 131,
          name: 'Jim Green',
          age: 42,
          address: 'London No. 2 Lake Park',
          children: [{
            key: 1311,
            name: 'Jim Green jr.',
            age: 25,
            address: 'London No. 3 Lake Park',
          }, {
            key: 1312,
            name: 'Jimmy Green sr.',
            age: 18,
            address: 'London No. 4 Lake Park',
          }]
        }]
      }]
    }, {
      key: 2,
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    }]
    return (
      <div className={styles.auth}>
        <div className={styles.module}>
          <div className={styles.title}>
            模块
          </div>
          <Table
              bordered
              columns={columns}
              pagination={false}
              dataSource={organizationMembers}
          />
        </div>
        <div className={styles.dv}>
          <div className={styles.title}>
            可视化
          </div>
          <Table
              bordered
              columns={dvColumns}
              dataSource={dvData}
              pagination={false}
          />
        </div>
      </div>
    )
  }
}

export default Auth





