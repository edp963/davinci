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

import ShareForm from './ShareForm'
import { Icon, Input, Button, Row, Col, Radio } from 'antd'
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

const styles = require('./SharePanel.less')

interface ISharePanelProps {
  id?: number
  type: string
  itemId?: number
  active?: string
  shareInfo: string
  secretInfo: string
  shareInfoLoading: boolean
  authorized: boolean
  afterAuthorization: () => void
  onLoadDashboardShareLink?: (id: number, authName: string) => void
  onLoadWidgetShareLink?: (id: number, itemId: number, authName: string) => void
  onLoadDisplayShareLink?: (id: number, authName: string) => void
}

interface ISharePanelStates {
  active: string
  authName: string
}

export class SharePanel extends React.PureComponent<ISharePanelProps, ISharePanelStates> {
  constructor (props) {
    super(props)
    this.state = {
      active: this.props.active,
      authName: ''
    }
  }

  public static defaultProps = {
    active: 'normal'
  }

  public componentWillMount () {
    if (!this.props.shareInfo) {
      this.getShareInfo('')
    }
  }

  public componentWillReceiveProps () {
    this.setState({
      authName: ''
    })
  }

  public componentDidUpdate () {
    const { shareInfo, shareInfoLoading } = this.props
    if (!shareInfo && !shareInfoLoading) {
      this.getShareInfo('')
    }
  }

  private getShareInfo = (authName) => {
    const {
      id,
      type,
      itemId,
      onLoadDashboardShareLink,
      onLoadWidgetShareLink,
      onLoadDisplayShareLink
    } = this.props

    const name = authName.target
      ? authName.target.value
      : authName

    switch (type) {
      case 'dashboard':
        onLoadDashboardShareLink(id, name)
        break
      case 'widget':
        onLoadWidgetShareLink(id, itemId, name)
        break
      case 'display':
        onLoadDisplayShareLink(id, name)
      default:
        break
    }
  }

  private radioChange = (e) => {
    this.setState({
      active: e.target.value
    })
  }

  private creditShare = () => {
    this.getShareInfo(this.state.authName)
    this.props.afterAuthorization()
  }

  private authNameChange = (event) => {
    this.setState({authName: event.target.value})
  }

  public render () {
    const {
      type,
      shareInfo,
      secretInfo,
      shareInfoLoading,
      authorized
    } = this.props

    const {
      active,
      authName
    } = this.state

    const segmentControl = (
      <div className={styles.panelHead}>
        <RadioGroup defaultValue={active} onChange={this.radioChange}>
          <RadioButton value="normal">普通分享</RadioButton>
          <RadioButton value="secret">授权分享</RadioButton>
        </RadioGroup>
      </div>
      )

    let content
    let secretContent

    if (shareInfo) {
      content = (
        <ShareForm
          type={type}
          shareInfo={shareInfo}
        />
      )
    } else {
      if (shareInfoLoading) {
        content = (<Icon type="loading" />)
      } else {
        content = (<Button size="small" onClick={this.getShareInfo}>点击重新加载</Button>)
      }
    }

    if (secretInfo && authorized) {
      secretContent = (
        <ShareForm
          type={type}
          shareInfo={secretInfo}
        />
      )
    } else {
      if (shareInfoLoading) {
        secretContent = (<Icon type="loading" />)
      } else {
        secretContent = (
          <Row gutter={8} className={styles.shareRow}>
            <Col span={24}>
              <Input
                className={styles.shareInput}
                placeholder="请输入要分享的用户名"
                onChange={this.authNameChange}
                value={authName}
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
      <div className={styles.sharePanel}>
        {segmentControl}
        <div className={styles.panelContent}>
          {
            active === 'normal' ? content : secretContent
          }
        </div>
      </div>
    )
  }
}

export default SharePanel
