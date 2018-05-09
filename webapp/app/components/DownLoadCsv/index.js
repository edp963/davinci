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
import Button from 'antd/lib/button'

import { loadDashboardShareLink, loadWidgetShareLink } from '../../containers/Dashboard/actions'

export class DownLoadCsv extends PureComponent {
  componentWillMount () {
    if (!this.props.shareInfo) {
      this.getShareInfo('')
    }
  }

  componentDidUpdate () {
    const { shareInfo, shareInfoLoading } = this.props
    if (!shareInfo && !shareInfoLoading) {
      this.getShareInfo('')
    }
  }

  getShareInfo = (authName) => {
    const {
      id,
      type,
      itemId,
      onLoadDashboardShareLink,
      onLoadWidgetShareLink
    } = this.props

    let name = authName.target
      ? authName.target.value
      : authName

    switch (type) {
      case 'dashboard':
        onLoadDashboardShareLink(id, name)
        break
      case 'widget':
        onLoadWidgetShareLink(id, itemId, name)
        break
      default:
        break
    }
  }

  render () {
    const { shareInfoLoading } = this.props
    return (
      <div>
        <Button type="primary" disabled={shareInfoLoading} icon="download" size="default" onClick={() => this.props.onDownloadCsv()}>Download CSV</Button>
      </div>
    )
  }
}

DownLoadCsv.propTypes = {
  id: PropTypes.number,
  type: PropTypes.string,
  itemId: PropTypes.number,
  shareInfo: PropTypes.string,
  shareInfoLoading: PropTypes.bool,
  onLoadDashboardShareLink: PropTypes.func,
  onLoadWidgetShareLink: PropTypes.func,
  onDownloadCsv: PropTypes.func
}

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboardShareLink: (id, authName) => dispatch(loadDashboardShareLink(id, authName)),
    onLoadWidgetShareLink: (id, itemId, authName) => dispatch(loadWidgetShareLink(id, itemId, authName))
  }
}

export default connect(null, mapDispatchToProps)(DownLoadCsv)
