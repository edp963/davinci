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

import React, { useCallback, useState, useMemo, createRef } from 'react'
import moment from 'moment'
import ConfigForm from './ConfigForm'
import { Modal } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import Ctrl from './Ctrl'
import { Tmode, TShareVizsType, IShareTokenParams } from './types'
import { IProjectRoles } from 'containers/Organizations/component/ProjectRole'
import { IOrganizationMember } from 'containers/Organizations/types'
import { DEFAULT_DATETIME_FORMAT, SHARE_HOST } from 'app/globalConstants'
import styles from './SharePanel.less'

interface ISharePanelProps {
  visible: boolean
  id: number
  itemId?: number
  type: TShareVizsType
  title: string
  shareToken: string
  passwordShareToken: string
  password: string
  authorizedShareToken: string
  loading: boolean
  projectRoles: IProjectRoles[]
  organizationMembers: IOrganizationMember[]
  onLoadDashboardShareLink?: (params: IShareTokenParams) => void
  onLoadWidgetShareLink?: (params: IShareTokenParams) => void
  onLoadDisplayShareLink?: (params: IShareTokenParams) => void
  onClose: () => void
}

const SharePanel: React.FC<ISharePanelProps> = (props) => {
  const {
    id,
    type,
    title,
    itemId,
    loading,
    onClose,
    visible,
    passwordShareToken,
    password,
    shareToken,
    projectRoles,
    organizationMembers,
    authorizedShareToken,
    onLoadWidgetShareLink,
    onLoadDisplayShareLink,
    onLoadDashboardShareLink
  } = props
  const [mode, setMode] = useState<Tmode>('NORMAL')
  const [viewers, setViewers] = useState<number[]>()
  const [roles, setRoles] = useState<number[]>()
  const configForm = createRef<FormComponentProps>()

  const getShareToken = useCallback(() => {
    configForm.current.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { permission } = values
        const expired = moment(values.expired).format(DEFAULT_DATETIME_FORMAT)
        const params = { id, itemId, mode, expired, permission, roles, viewers }
        switch (type) {
          case 'dashboard':
            onLoadDashboardShareLink(params)
            break
          case 'widget':
            onLoadWidgetShareLink(params)
            break
          case 'display':
            onLoadDisplayShareLink(params)
          default:
            break
        }
      }
    })
  }, [id, itemId, mode, type, roles, viewers, configForm])

  const afterModalClose = () => {
    setMode('NORMAL')
  }

  const modeChange = useCallback((val: Tmode) => {
    if (val === 'AUTH') {
      setViewers([])
      setRoles([])
    }
    setMode(val)
  }, [])

  const shareUrl = useMemo(() => {
    let token = ''
    switch (mode) {
      case 'NORMAL':
        token = shareToken
        break
      case 'PASSWORD':
        token = passwordShareToken
        break
      case 'AUTH':
        token = authorizedShareToken
        break
    }

    if (token) {
      switch (type) {
        case 'dashboard':
          return `${SHARE_HOST}?shareToken=${encodeURI(token)}#share/dashboard`
        case 'widget':
          return `${SHARE_HOST}?shareToken=${encodeURI(token)}#share/dashboard`
        case 'display':
          return `${SHARE_HOST}?shareToken=${encodeURI(token)}#share/display`
      }
    } else {
      return ''
    }
  }, [mode, type, shareToken, passwordShareToken, authorizedShareToken])

  return (
    <Modal
      title={`分享-${title}`}
      visible={visible}
      wrapClassName="ant-modal-small"
      footer={false}
      onCancel={onClose}
      afterClose={afterModalClose}
      destroyOnClose
    >
      <div className={styles.sharePanel}>
        <Ctrl mode={mode} onModeChange={modeChange} />
        <ConfigForm
          mode={mode}
          shareUrl={shareUrl}
          password={password}
          loading={loading}
          projectRoles={projectRoles}
          organizationMembers={organizationMembers}
          onSetRoles={setRoles}
          onSetViewers={setViewers}
          onGetToken={getShareToken}
          wrappedComponentRef={configForm}
        />
      </div>
    </Modal>
  )
}

export default SharePanel
