/*-
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

import Radio from 'antd/lib/radio'
import Input from 'antd/lib/input'
import Icon from 'antd/lib/icon'
import Button from 'antd/lib/button'
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

import { promiseDispatcher } from '../../utils/reduxPromisation'
import { loadDashboardShareLink, loadWidgetShareLink } from '../../containers/Dashboard/actions'
import config, { env } from '../../globalConfig'
const apiHost = config[env].host
const shareHost = config[env].shareHost

import styles from './SharePanel.less'

export class SharePanel extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      shareInfo: '',
      active: this.props.active
    }
  }

  componentWillMount () {
    this.getShareInfo()
  }

  getShareInfo = () => {
    const {
      id,
      type,
      onLoadDashboardShareLink,
      onLoadWidgetShareLink
    } = this.props

    switch (type) {
      case 'dashboard':
        onLoadDashboardShareLink(id)
          .then(shareInfo => {
            this.setState({
              shareInfo
            })
          })
        break
      case 'widget':
        onLoadWidgetShareLink(id)
          .then(shareInfo => {
            this.setState({
              shareInfo
            })
          })
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

  handleInputSelect = (inputRefName) => () => {
    this.refs[inputRefName].refs.input.select()
    document.execCommand('copy')
  }

  downloadCsv = () => {
    location.href = `${apiHost}/shares/csv/${this.state.shareInfo}`
  }

  render () {
    const {
      type
    } = this.props

    const {
      shareInfo,
      active
    } = this.state

    let segmentControl = ''
    let content = ''

    if (type === 'widget') {
      segmentControl = (
        <div className={styles.panelHead}>
          <RadioGroup defaultValue={active} onChange={this.radioChange}>
            <RadioButton value="link">链接</RadioButton>
            <RadioButton value="csv">CSV文件</RadioButton>
            <RadioButton value="html">HTML</RadioButton>
          </RadioGroup>
        </div>
      )
    }

    switch (active) {
      case 'link':
        if (shareInfo) {
          let linkValue = ''

          switch (type) {
            case 'dashboard':
              linkValue = `${shareHost}/#share?shareInfo=${encodeURI(shareInfo)}&type=dashboard`
              break
            case 'widget':
              linkValue = `${shareHost}/#share?shareInfo=${encodeURI(shareInfo)}&type=widget`
              break
            default:
              break
          }

          content = (
            <Input
              className={styles.shareInput}
              ref="shareLinkInput"
              value={linkValue}
              addonAfter={
                <span
                  style={{cursor: 'pointer'}}
                  onClick={this.handleInputSelect('shareLinkInput')}
                >
                  复制
                </span>
              }
              readOnly
            />
          )
        } else {
          content = (<Icon type="loading" />)
        }
        break
      case 'csv':
        content = (
          <Button
            type="primary"
            onClick={this.downloadCsv}
            disabled={!shareInfo}
          >
            点击下载
          </Button>
        )
        break
      case 'html':
        if (shareInfo) {
          content = (
            <Input
              className={styles.shareInput}
              ref="shareHtmlInput"
              value={`${apiHost}/shares/html/${encodeURI(shareInfo)}`}
              addonAfter={
                <span
                  style={{cursor: 'pointer'}}
                  onClick={this.handleInputSelect('shareHtmlInput')}
                >
                  复制
                </span>
              }
              readOnly
            />
          )
        } else {
          content = (<Icon type="loading" />)
        }
        break
      default:
        break
    }

    return (
      <div className={styles.sharePanel}>
        {segmentControl}
        <div className={styles.panelContent}>
          {content}
        </div>
      </div>
    )
  }
}

SharePanel.propTypes = {
  id: PropTypes.number,
  type: PropTypes.string,
  active: PropTypes.string,
  onLoadDashboardShareLink: PropTypes.func,
  onLoadWidgetShareLink: PropTypes.func
}

SharePanel.defaultProps = {
  active: 'link'
}

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboardShareLink: (id) => promiseDispatcher(dispatch, loadDashboardShareLink, id),
    onLoadWidgetShareLink: (id) => promiseDispatcher(dispatch, loadWidgetShareLink, id)
  }
}

export default connect(null, mapDispatchToProps)(SharePanel)
