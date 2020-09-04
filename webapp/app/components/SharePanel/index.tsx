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
  useCallback,
  useState,
  useMemo,
  useEffect,
  ReactElement
} from 'react'
import { compose } from 'redux'
import { Icon, Button, Row, Col, Modal, Select, Radio } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import Ctrl from './Ctrl'
const SelectOption = Select.Option
const RadioGroup = Radio.Group
import { uuid } from 'utils/util'
import ShareForm from './ShareForm'
import styles from './SharePanel.less'
import { Tmode, TShareVizsType, TPermission, IGetTokenParams } from './types'
import { IProjectRoles } from 'containers/Organizations/component/ProjectRole'
import { IOrganizationMember } from 'containers/Organizations/types'
import { debounce } from 'lodash'
interface ISharePanelProps {
  visible: boolean
  id: number
  itemId?: number
  type: TShareVizsType
  title: string
  shareToken: string
  pwdToken: string
  pwd: string
  authorizedShareToken: string
  loading: boolean
  projectRoles: IProjectRoles[]
  organizationMembers: IOrganizationMember[]
  onLoadDashboardShareLink?: (params: IGetTokenParams) => void
  onLoadWidgetShareLink?: (params: IGetTokenParams) => void
  onLoadDisplayShareLink?: (params: IGetTokenParams) => void
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
    pwdToken,
    pwd,
    shareToken,
    projectRoles,
    organizationMembers,
    authorizedShareToken,
    onLoadWidgetShareLink,
    onLoadDisplayShareLink,
    onLoadDashboardShareLink
  } = props
  const [mode, setShareType] = useState<Tmode>('NORMAL')
  const [permission, setPermission] = useState<TPermission>('SHARER')
  const [searchValue, setSearchValue] = useState<string>('')
  const [viewerIds, setViewerIds] = useState<number[]>()
  const [roles, setRoles] = useState<number[]>()

  useEffect(() => {
    if (id && visible && !shareToken) {
      getShareToken(type, {
        id,
        itemId,
        mode,
        permission,
        roles,
        viewerIds
      })
    }
  }, [
    id,
    type,
    visible,
    shareToken,
    itemId,
    mode,
    permission,
    roles,
    viewerIds
  ])

  useEffect(() => {
    if (id && visible && !pwdToken && mode === 'PASSWORD') {
      getShareToken(type, {
        id,
        itemId,
        mode,
        permission,
        roles,
        viewerIds
      })
    }
  }, [
    pwdToken,
    type,
    pwd,
    id,
    visible,
    mode,
    itemId,
    permission,
    roles,
    viewerIds
  ])

  const getShareToken = (type: TShareVizsType, params: IGetTokenParams) => {
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

  const reloadShareToken = () => {
    getShareToken(type, { id, itemId, mode, permission, roles, viewerIds })
  }

  const afterModalClose = () => {
    setShareType('NORMAL')
  }

  const requestToken = () => {
    getShareToken(type, { id, itemId, mode, permission, roles, viewerIds })
  }

  const Regular: ReactElement = useMemo(() => {
    return shareToken ? (
      <ShareForm type={type} shareToken={shareToken} />
    ) : (
      <Button size="small" onClick={reloadShareToken}>
        点击重新加载
      </Button>
    )
  }, [id, itemId, type, shareToken])

  const Pwd: ReactElement = useMemo(() => {
    return pwdToken ? (
      <ShareForm type={type} shareToken={pwdToken} pwd={pwd} />
    ) : (
      <Button size="small" onClick={reloadShareToken}>
        点击重新加载
      </Button>
    )
  }, [id, itemId, type, pwd, pwdToken])

  const AuthOptions = useMemo(() => {
    const roles = compose(
      setRoleOptions,
      getOrgRoleBySearch
    )(projectRoles || [])
    const viewerIds = compose(
      setMemberOptions,
      getOrgMembersBysearch
    )(organizationMembers || [])

    return sliceLength(100, roles, viewerIds)()

    function sliceLength<T, U>(length: number, arr1: T[], arr2: U[]) {
      let loop = true
      return () => {
        return new Array(length)
          .fill(0)
          .map(() => {
            if (loop) {
              loop = false
              return arr1.length ? arr1.shift() : arr2.shift()
            } else {
              loop = true
              return arr2.length ? arr2.shift() : arr1.shift()
            }
          })
          .filter((unEmpty) => unEmpty)
      }
    }

    function getOrgMembersBysearch(
      orgMembers: IOrganizationMember[]
    ): IOrganizationMember[] {
      return orgMembers.filter((member: IOrganizationMember) => {
        return searchValue && searchValue.length
          ? member?.user?.username?.indexOf(searchValue.trim()) > -1
          : member
      })
    }

    function getOrgRoleBySearch(orgRoles: IProjectRoles[]): IProjectRoles[] {
      return orgRoles.filter((role: IProjectRoles) => {
        return searchValue && searchValue.length
          ? role && role.name.indexOf(searchValue.trim()) > -1
          : role
      })
    }

    function setRoleOptions(orgRoles: IProjectRoles[]): ReactElement[] {
      return orgRoles && orgRoles.length
        ? orgRoles.map((role: IProjectRoles) => (
            <SelectOption
              key={`${uuid}${role.name}`}
              value={`roles-${role.id}`}
            >
              <div className={styles.options}>
                <strong>角色</strong> -
                <span className={styles.name}>{role.name}</span>
              </div>
            </SelectOption>
          ))
        : []
    }

    function setMemberOptions(
      orgMembers: IOrganizationMember[]
    ): ReactElement[] {
      return orgMembers && orgMembers.length
        ? orgMembers.map((member: IOrganizationMember) => (
            <SelectOption
              key={`${uuid}${member.user.username}`}
              value={`viewerIds-${member.user.id}`}
            >
              <div className={styles.options}>
                <strong>用户</strong> -
                <span className={styles.name}>
                  {member.user.username}
                  {member.user.email}
                </span>
              </div>
            </SelectOption>
          ))
        : []
    }
  }, [searchValue, projectRoles, organizationMembers])

  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      setSearchValue(searchValue)
    }, 500),
    [searchValue]
  )

  const save = useCallback(
    (vals: string[]) => {
      const wrapper: { viewerIds: number[]; roles: number[] } = vals.reduce(
        (iteratee, target) => {
          const [key, value] = target.split('-')
          iteratee[key].push(Number(value))
          return iteratee
        },
        { viewerIds: [], roles: [] }
      )
      setViewerIds(wrapper.viewerIds)
      setRoles(wrapper.roles)
    },
    [viewerIds, roles]
  )

  const change = useCallback(
    (val) => {
      save(val)
    },
    [viewerIds, roles]
  )

  const changePermission = (event: RadioChangeEvent) => {
    setPermission(event.target.value)
  }

  const authButton = useMemo(() => {
    const isAuthorizedCanSend: boolean = !(roles?.length || viewerIds?.length)
    return (
      <Button
        type="primary"
        disabled={isAuthorizedCanSend}
        className={styles.authButton}
        onClick={requestToken}
      >
        确定
      </Button>
    )
  }, [id, itemId, mode, permission, roles, viewerIds, type])

  const Auth: ReactElement = useMemo(() => {
    if (authorizedShareToken) {
      return <ShareForm type={type} shareToken={authorizedShareToken} />
    } else {
      return (
        <>
          <Row gutter={8} className={styles.shareRow}>
            <Col span={24}>
              <Select
                key={`${uuid}select`}
                style={{ width: '100%' }}
                showSearch
                mode="multiple"
                onSearch={debouncedSearch}
                onChange={change}
                placeholder="输入关键字查询角色或用户"
                filterOption={false}
              >
                {AuthOptions}
              </Select>
            </Col>
          </Row>
          <Row type="flex" justify="space-between">
            <Col span={20}>
              <RadioGroup
                defaultValue={permission}
                onChange={changePermission}
                className={styles.authRadio}
              >
                <Radio key="SHARER" value="SHARER">
                  分享者权限
                </Radio>
                <Radio key="VIEWER" value="VIEWER">
                  被分享者权限
                </Radio>
              </RadioGroup>
            </Col>
            <Col span={4}>{authButton}</Col>
          </Row>
        </>
      )
    }
  }, [
    id,
    itemId,
    shareToken,
    type,
    permission,
    mode,
    roles,
    viewerIds,
    AuthOptions,
    authorizedShareToken
  ])

  const Content = useMemo(() => {
    if (loading) {
      return <Icon type="loading" />
    }
    switch (mode) {
      case 'NORMAL':
        return Regular
      case 'AUTH':
        return Auth
      case 'PASSWORD':
        return Pwd
      default:
        return Regular
    }
  }, [
    id,
    itemId,
    permission,
    type,
    loading,
    mode,
    roles,
    viewerIds,
    AuthOptions
  ])

  const setSType = useCallback(
    (val: Tmode) => {
      if (val === 'AUTH') {
        setViewerIds([])
        setRoles([])
      }
      setShareType(val)
    },
    [setShareType, mode, roles, type, viewerIds]
  )

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
        <Ctrl mode={mode} setSType={setSType} />
        <div className={styles.panelContent}>{Content}</div>
      </div>
    </Modal>
  )
}

export default SharePanel
