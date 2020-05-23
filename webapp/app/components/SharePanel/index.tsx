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

import ShareForm from './ShareForm'
import { Icon, Input, Button, Row, Col, Radio, Modal } from 'antd'
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

const styles = require('./SharePanel.less')

interface ISharePanelProps {
  visible: boolean
  id: number
  itemId?: number
  type: string
  title: string
  shareToken: string
  authorizedShareToken: string
  loading: boolean
  onLoadDashboardShareLink?: (id: number, authUser?: string) => void
  onLoadWidgetShareLink?: (id: number, itemId: number, authUser?: string) => void
  onLoadDisplayShareLink?: (id: number, authUser?: string) => void
  onClose: () => void
}

interface ISharePanelStates {
  activeTab: 'regular' | 'auth'
  authUser: string
  authorized: boolean
}

export class SharePanel extends React.PureComponent<ISharePanelProps, ISharePanelStates> {
  constructor (props) {
    super(props)
    this.state = {
      activeTab: 'regular',
      authUser: '',
      authorized: false
    }
  }

  public componentWillReceiveProps (nextProps: ISharePanelProps) {
    const { id, visible, shareToken } = nextProps
    if (id
      && visible
      && !shareToken
      && id !== this.props.id) {
      this.getShareToken(nextProps)
    }
  }

  private getShareToken = (props: ISharePanelProps, authUser?: string) => {
    const {
      id,
      type,
      itemId,
      onLoadDashboardShareLink,
      onLoadWidgetShareLink,
      onLoadDisplayShareLink
    } = props

    switch (type) {
      case 'dashboard':
        onLoadDashboardShareLink(id, authUser)
        break
      case 'widget':
        onLoadWidgetShareLink(id, itemId, authUser)
        break
      case 'display':
        onLoadDisplayShareLink(id, authUser)
      default:
        break
    }
  }

  private radioChange = (e) => {
    this.setState({
      activeTab: e.target.value
    })
  }

  private creditShare = () => {
    this.getShareToken(this.props, this.state.authUser)
    this.setState({ authorized: true })
  }

  private authUserChange = (event) => {
    this.setState({authUser: event.target.value})
  }

  private reloadShareToken = () => {
    this.getShareToken(this.props)
  }

  private afterModalClose = () => {
    this.setState({
      activeTab: 'regular',
      authUser: '',
      authorized: false
    })
  }

  public render () {
    const {
      visible,
      type,
      title,
      shareToken,
      authorizedShareToken,
      loading,
      onClose
    } = this.props

    const {
      activeTab,
      authUser,
      authorized
    } = this.state

    const segmentControl = (
      <div className={styles.panelHead}>
        <RadioGroup defaultValue={activeTab} onChange={this.radioChange}>
          <RadioButton value="regular">普通分享</RadioButton>
          <RadioButton value="auth">授权分享</RadioButton>
        </RadioGroup>
      </div>
      )

    let content
    let authorizedShareContent

    if (shareToken) {
      content = (
        <ShareForm
          type={type}
          shareToken={shareToken}
        />
      )
    } else {
      if (loading) {
        content = (<Icon type="loading" />)
      } else {
        content = (<Button size="small" onClick={this.reloadShareToken}>点击重新加载</Button>)
      }
    }

    if (authorizedShareToken && authorized) {
      authorizedShareContent = (
        <ShareForm
          type={type}
          shareToken={authorizedShareToken}
        />
      )
    } else {
      if (loading) {
        authorizedShareContent = (<Icon type="loading" />)
      } else {
        authorizedShareContent = (
          <Row gutter={8} className={styles.shareRow}>
            <Col span={24}>
              <Input
                className={styles.shareInput}
                placeholder="请输入要分享的用户名"
                onChange={this.authUserChange}
                value={authUser}
                addonAfter={
                  <span
                    style={{cursor: 'pointer'}}
                    onClick={this.creditShare}
                  >
                    确定
                  </span>
                }
              />
            </Col>
          </Row>
        )
      }
    }

    return (
      <Modal
        title={`分享-${title}`}
        visible={visible}
        wrapClassName="ant-modal-small"
        footer={false}
        onCancel={onClose}
        afterClose={this.afterModalClose}
        destroyOnClose
      >
        <div className={styles.sharePanel}>
          {segmentControl}
          <div className={styles.panelContent}>
            {activeTab === 'regular' ? content : authorizedShareContent}
          </div>
        </div>
      </Modal>
    )
  }
}

export default SharePanel
