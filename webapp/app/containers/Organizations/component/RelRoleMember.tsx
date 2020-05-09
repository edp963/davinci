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
import { Form, Row, Col, Input, Radio, Steps, Transfer } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'

interface IRoleFormProps {
  form: any
  groupSource?: any[]
  groupTarget?: any[]
  onGroupChange?: (targets) => any
  organizationMembers?: any[]
}

export class RelRoleMember extends React.PureComponent<IRoleFormProps & FormComponentProps, {}> {

  private getTransferRowKey = (g) => g.user.id
  private transferRender = (item) => item.user.username
  private onTransferChange = (cb) => (nextTargetKeys, direction, moveKeys) => {
    cb(nextTargetKeys)
  }

  public render () {
    const {
      organizationMembers,
      groupTarget,
      onGroupChange
    } = this.props

    const groupTransfer =
    (
        <Transfer
          showSearch
          titles={['列表', '已选']}
          listStyle={{width: '210px'}}
          dataSource={organizationMembers}
          rowKey={this.getTransferRowKey}
          targetKeys={groupTarget}
          render={this.transferRender}
          onChange={this.onTransferChange(onGroupChange)}
        />
    )

    return (
      <Row>
        <Col span={24}>
          {groupTransfer}
        </Col>
      </Row>
    )
  }
}

export default Form.create<IRoleFormProps & FormComponentProps>()(RelRoleMember)






