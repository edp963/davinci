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

import React, { PureComponent, PropTypes } from 'react'
import { connect } from 'react-redux'

import ShareForm from './ShareForm'
import Icon from 'antd/lib/icon'
import Input from 'antd/lib/input'
import Button from 'antd/lib/button'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Radio from 'antd/lib/radio'
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

import { loadDashboardShareLink, loadWidgetShareLink } from '../../containers/Dashboard/actions'

import styles from './SharePanel.less'

export class SharePanel extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      active: this.props.active,
      authName: ''
    }
  }

  componentWillMount () {
    if (!this.props.shareInfo) {
      this.getShareInfo('')
    }
  }
  componentWillReceiveProps () {
    this.setState({
      authName: ''
    })
  }
  getShareInfo = (authName) => {
    const {
      id,
      type,
      itemId,
      onLoadDashboardShareLink,
      onLoadWidgetShareLink
    } = this.props

    switch (type) {
      case 'dashboard':
        onLoadDashboardShareLink(id, authName)
        break
      case 'widget':
        onLoadWidgetShareLink(id, itemId, authName)
        break
      default:
        break
    }
  }

  radioChange = (e) => {
    this.setState({
      active: e.target.value
    })
  }

  downloadCsv = () => {
    this.props.onDownloadCsv(this.props.shareInfo)
  }
  creditShare = () => {
    const { authName } = this.state
    const { isResetSharePanel } = this.props
    this.getShareInfo(authName)
    isResetSharePanel('close')
  }
  handleChange = (event) => {
    this.setState({authName: event.target.value})
  }
  render () {
    const {
      type,
      shareInfo,
      secretInfo,
      shareInfoLoading,
      downloadCsvLoading,
      resetSharePanel
    } = this.props

    const {
      active
    } = this.state

    const segmentControl = (
      <div className={styles.panelHead}>
        <RadioGroup defaultValue={active} onChange={this.radioChange}>
          <RadioButton value="normal">普通分享</RadioButton>
          <RadioButton value="secret">授权分享</RadioButton>
        </RadioGroup>
      </div>
      )

    let content = ''
    let secretContent = ''

    if (shareInfo) {
      content = (
        <ShareForm
          type={type}
          shareInfo={shareInfo}
          downloadCsvLoading={downloadCsvLoading}
          onHandleInputSelect={this.handleInputSelect}
          onDownloadCsv={this.downloadCsv}
        />
      )
    } else {
      if (shareInfoLoading) {
        content = (<Icon type="loading" />)
      } else {
        content = (<Button size="small" onClick={this.getShareInfo}>点击重新加载</Button>)
      }
    }

    if (secretInfo && !resetSharePanel) {
      secretContent = (
        <ShareForm
          type={type}
          shareInfo={secretInfo}
          downloadCsvLoading={downloadCsvLoading}
          onHandleInputSelect={this.handleInputSelect}
          onDownloadCsv={this.downloadCsv}
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
                onChange={this.handleChange}
                value={this.state.authName}
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

SharePanel.propTypes = {
  id: PropTypes.number,
  type: PropTypes.string,
  itemId: PropTypes.number,
  active: PropTypes.string,
  shareInfo: PropTypes.string,
  secretInfo: PropTypes.string,
  shareInfoLoading: PropTypes.bool,
  downloadCsvLoading: PropTypes.bool,
  onLoadDashboardShareLink: PropTypes.func,
  onLoadWidgetShareLink: PropTypes.func,
  onDownloadCsv: PropTypes.func,
  resetSharePanel: PropTypes.bool,
  isResetSharePanel: PropTypes.func
}

SharePanel.defaultProps = {
  active: 'normal'
}

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboardShareLink: (id, authName) => dispatch(loadDashboardShareLink(id, authName)),
    onLoadWidgetShareLink: (id, itemId, authName) => dispatch(loadWidgetShareLink(id, itemId, authName))
  }
}

export default connect(null, mapDispatchToProps)(SharePanel)
