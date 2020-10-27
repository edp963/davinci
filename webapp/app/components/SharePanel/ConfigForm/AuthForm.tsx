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

import React, {
  useState,
  useCallback,
  useEffect,
  ReactElement,
  memo
} from 'react'
import { debounce } from 'lodash'
import BaseForm from './BaseForm'
import { Form, Row, Col, Select, Radio } from 'antd'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import { IProjectRoles } from 'containers/Organizations/component/ProjectRole'
import { IOrganizationMember } from 'containers/Organizations/types'
import { sliceLength } from './util'
import { TCopyType } from '../types'
import styles from '../SharePanel.less'
const FormItem = Form.Item
const SelectOption = Select.Option
const RadioGroup = Radio.Group

interface IAuthFormProps {
  form: WrappedFormUtils
  projectRoles: IProjectRoles[]
  organizationMembers: IOrganizationMember[]
  shareUrl: string
  loading: boolean
  onSetRoles: (roles: number[]) => void
  onSetViewers: (viewers: number[]) => void
  onCopy: (copytype: TCopyType) => () => void
  onGetToken: () => void
}

const AuthForm: React.FC<IAuthFormProps> = ({
  form,
  projectRoles,
  organizationMembers,
  shareUrl,
  loading,
  onSetRoles,
  onSetViewers,
  onGetToken,
  onCopy
}) => {
  const [authOptions, setAuthOptions] = useState<ReactElement[]>([])
  const { getFieldDecorator } = form

  const getRoleOptions = useCallback(
    (orgRoles: IProjectRoles[], searchValue: string) => {
      return orgRoles
        .filter((role: IProjectRoles) =>
          searchValue ? role.name.includes(searchValue.trim()) : role
        )
        .map(({ id, name }) => (
          <SelectOption key={id} value={`roles-${id}`}>
            <div className={styles.options}>
              <strong>角色</strong> -<span className={styles.name}>{name}</span>
            </div>
          </SelectOption>
        ))
    },
    []
  )

  const getOrgMemberOptions = useCallback(
    (orgMembers: IOrganizationMember[], searchValue: string) => {
      return orgMembers
        .filter((member: IOrganizationMember) =>
          searchValue
            ? member.user.username.includes(searchValue.trim())
            : member
        )
        .map(({ id, user }: IOrganizationMember) => (
          <SelectOption key={id} value={`viewers-${user.id}`}>
            <div className={styles.options}>
              <strong>用户</strong> -
              <span className={styles.name}>
                {user.username}
                {user.email}
              </span>
            </div>
          </SelectOption>
        ))
    },
    []
  )

  const getOptions = useCallback(
    (projectRoles, organizationMembers, searchValue) => {
      const roles = getRoleOptions(projectRoles, searchValue)
      const viewers = getOrgMemberOptions(organizationMembers, searchValue)
      return sliceLength(100, roles, viewers)()
    },
    []
  )

  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      setAuthOptions(getOptions(projectRoles, organizationMembers, searchValue))
    }, 500),
    [projectRoles, organizationMembers]
  )

  useEffect(() => {
    setAuthOptions(getOptions(projectRoles, organizationMembers, ''))
  }, [projectRoles, organizationMembers])

  const resetOptions = useCallback(() => {
    setAuthOptions(getOptions(projectRoles, organizationMembers, ''))
  }, [projectRoles, organizationMembers])

  const change = useCallback(
    (val: string[]) => {
      const wrapper: { viewers: number[]; roles: number[] } = val.reduce(
        (iteratee, target) => {
          const [key, value] = target.split('-')
          iteratee[key].push(Number(value))
          return iteratee
        },
        { viewers: [], roles: [] }
      )
      onSetRoles(wrapper.roles)
      onSetViewers(wrapper.viewers)
    },
    [onSetRoles, onSetViewers]
  )

  const itemStyle = { labelCol: { span: 6 }, wrapperCol: { span: 17 } }

  return (
    <>
      <Row gutter={8}>
        <Col span={24}>
          <FormItem label="数据权限" {...itemStyle}>
            {getFieldDecorator('permission', { initialValue: 'SHARER' })(
              <RadioGroup>
                <Radio key="SHARER" value="SHARER">
                  与分享者一致
                </Radio>
                <Radio key="VIEWER" value="VIEWER">
                  使用被分享者自身权限
                </Radio>
              </RadioGroup>
            )}
          </FormItem>
        </Col>
      </Row>
      <Row gutter={8}>
        <Col span={24}>
          <FormItem label="被授权人" {...itemStyle}>
            {getFieldDecorator('authorized', {
              rules: [{ required: true, message: '被授权人不能为空' }]
            })(
              <Select
                showSearch
                mode="multiple"
                onSearch={debouncedSearch}
                onBlur={resetOptions}
                onChange={change}
                placeholder="输入关键字查询角色或用户"
                filterOption={false}
              >
                {authOptions}
              </Select>
            )}
          </FormItem>
        </Col>
      </Row>
      <BaseForm
        form={form}
        shareUrl={shareUrl}
        loading={loading}
        onCopy={onCopy}
        onGetToken={onGetToken}
      />
    </>
  )
}

export default memo(AuthForm)
