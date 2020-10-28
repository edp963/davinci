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

import React, { useCallback, forwardRef, useImperativeHandle } from 'react'
import { Form, message } from 'antd'
import BaseForm from './BaseForm'
import AuthForm from './AuthForm'
import { copyTextToClipboard } from '../utils'
import { TCopyType, Tmode } from '../types'
import { IProjectRoles } from 'containers/Organizations/component/ProjectRole'
import { IOrganizationMember } from 'containers/Organizations/types'
import { FormComponentProps } from 'antd/lib/form'
import styles from '../SharePanel.less'

interface IConfigFormProps extends FormComponentProps {
  mode: Tmode
  shareUrl: string
  password: string
  loading: boolean
  projectRoles: IProjectRoles[]
  organizationMembers: IOrganizationMember[]
  onSetRoles: (roles: number[]) => void
  onSetViewers: (viewers: number[]) => void
  onGetToken: () => void
}

const ConfigForm: React.FC<IConfigFormProps> = (
  {
    form,
    mode,
    shareUrl,
    loading,
    password,
    projectRoles,
    organizationMembers,
    onSetRoles,
    onSetViewers,
    onGetToken
  },
  ref
) => {
  useImperativeHandle(ref, () => ({ form }))

  const copy = useCallback(
    (copytype: TCopyType) => () => {
      const text =
        copytype === 'link' ? shareUrl : `链接：${shareUrl} 口令：${password}`
      copyTextToClipboard(
        text,
        () => message.success('复制链接成功'),
        () => message.warning('复制链接失败，请稍后重试')
      )
    },
    [shareUrl, password]
  )

  let content

  switch (mode) {
    case 'NORMAL':
      content = (
        <BaseForm
          form={form}
          shareUrl={shareUrl}
          loading={loading}
          onCopy={copy}
          onGetToken={onGetToken}
        />
      )
      break
    case 'PASSWORD':
      content = (
        <BaseForm
          form={form}
          shareUrl={shareUrl}
          password={password}
          loading={loading}
          onCopy={copy}
          onGetToken={onGetToken}
        />
      )
      break
    case 'AUTH':
      content = (
        <AuthForm
          form={form}
          projectRoles={projectRoles}
          organizationMembers={organizationMembers}
          shareUrl={shareUrl}
          loading={loading}
          onSetRoles={onSetRoles}
          onSetViewers={onSetViewers}
          onGetToken={onGetToken}
          onCopy={copy}
        />
      )
      break
  }

  return <Form className={styles.panelContent}>{content}</Form>
}

export default Form.create<IConfigFormProps>()(forwardRef(ConfigForm))
