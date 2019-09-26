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
import { Form, Row, Col, Input, Button, Select } from 'antd'
const FormItem = Form.Item
const TextArea = Input.TextArea
const Option = Select.Option
import Avatar from 'components/Avatar'
const styles = require('../Organization.less')
import { ITeam } from './TeamList'



interface IProjectsFormProps {
  listType: string
  type: string
  form: any
  orgId: number
  teams: ITeam[]
  modalLoading: boolean
  onModalOk: () => any
  onWidgetTypeChange: () => any
  onOrganizationTypeChange: () => any
  onCheckUniqueName: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
}

export class ProjectsForm extends React.PureComponent<IProjectsFormProps, {}> {
  private filterTeamsByOrg = (teams) => {
    if (teams) {
      const { orgId } = this.props
      const result =  teams.filter((team) => {
        if (team.organization.id === orgId) {
          return team
        }
      })
      return result
    }
  }
  public render () {
    const { onOrganizationTypeChange, modalLoading, teams, listType } = this.props
    const { getFieldDecorator } = this.props.form

    const filterTeams = this.filterTeamsByOrg(teams)
    const teamsOptions = filterTeams ? filterTeams.map((o) => (
      <Option key={o.id} value={`${o.id}`} className={styles.selectOption}>
        <div className={styles.title}>
          <span className={styles.owner}>{o.name}</span>
        </div>
        {`${o.id}` !== this.props.form.getFieldValue('parentTeamId')
          ? (<Avatar size="small" path={o.avatar}/>)
          : ''}
      </Option>
    )) : ''

    const commonFormItemStyle = {
      labelCol: { span: 3 },
      wrapperCol: { span: 24 }
    }

    const modalButtons = [(
      <Button
        key="submit"
        type="primary"
        loading={modalLoading}
        disabled={modalLoading}
        onClick={this.props.onModalOk}
      >
        保 存
      </Button>
    )]
    return (
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <div className={styles.title}>
            创建团队
          </div>
          <div className={styles.desc}>
            团队隶属于组织，可以在团队中指定项目的模块权限
          </div>
        </div>
        <div className={styles.body}>
          <Form>
            <Row gutter={8}>
              <Col span={24}>
                <FormItem label="名称" {...commonFormItemStyle}>
                  {getFieldDecorator('name', {
                    rules: [{
                      required: true,
                      message: 'Name 不能为空'
                    }, {
                      validator: this.props.onCheckUniqueName
                    }]
                  })(
                    <Input placeholder="Name" />
                  )}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem label="描述" {...commonFormItemStyle}>
                  {getFieldDecorator('description', {
                    initialValue: ''
                  })(
                    <TextArea
                      placeholder="Description"
                      autosize={{minRows: 2, maxRows: 6}}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem label="上级" {...commonFormItemStyle}>
                  {getFieldDecorator('parentTeamId', {
                    initialValue: ''
                  })(
                    <Select
                      placeholder="Please select a team"
                      onChange={onOrganizationTypeChange}
                      disabled={listType === 'teamTeamList' ? true : false}
                    >
                      {teamsOptions}
                    </Select>
                  )}
                </FormItem>
              </Col>
              {/* <Col span={24}>
                <FormItem label="" {...commonFormItemStyle}>
                  {getFieldDecorator('visibility', {
                    initialValue: ''
                  })(
                    <RadioGroup>
                      <Radio value="0" className={styles.radioStyle}>授权（只对该团队成员可见）</Radio>
                      <Radio value="1" className={styles.radioStyle}>公开 <Tag>推荐</Tag>（对该组织内所有成员可见）</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </Col> */}
            </Row>
          </Form>
        </div>
        <div className={styles.footer}>
          {modalButtons}
        </div>
      </div>
    )
  }
}

export default Form.create()(ProjectsForm)
