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
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router'
import classnames from 'classnames'

import {
  makeSelectLoginUser,
  makeSelectDownloadList,
  makeSelectDownloadListLoading
} from '../../containers/App/selectors'
import {
  loadDownloadList,
  downloadFile
} from '../../containers/App/actions'
import { Dropdown, Menu, Icon, Empty, Popover, Tag, Badge } from 'antd'
import { IDownloadRecord, DownloadStatus } from 'app/containers/App/types'
import { DOWNLOAD_STATUS_COLORS, DOWNLOAD_STATUS_LOCALE } from 'app/containers/App/constants'

const styles = require('./Navigator.less')

const goGithub = () => window.open('https://github.com/edp963/davinci')
const goDoc = () => window.open('https://edp963.github.io/davinci/')

interface INavigatorProps {
  show: boolean
  loginUser: object
  downloadList: IDownloadRecord[]
  onLoadDownloadList: () => void
  onDownloadFile: (id) => void
  onLogout: () => void
}

export function Navigator (props: INavigatorProps) {
  const {
    show,
    downloadList,
    onLogout
  } = props
  const headerClass = classnames({
    [styles.header]: true,
    [styles.hide]: !show
  })
  const menu = (
    <Menu>
      <Menu.Item key="0">
        <Link to="/account" >
          用户设置
        </Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="3">
        <a href="javascript:;" onClick={onLogout}>
          退出登录
        </a>
      </Menu.Item>
    </Menu>
  )

  let listContent
  let downloadable = 0

  if (downloadList && downloadList.length) {
    downloadable = downloadList.filter((d) => d.status === DownloadStatus.Success).length
    const downloadListItems = downloadList.map((record) => {
      const { id, name, status } = record
      const titleClass = classnames({
        [styles.success]: status === DownloadStatus.Success
      })
      return (
        <li key={id} className={styles.item}>
          {/* <Icon type="loading" /> */}
          <p
            className={titleClass}
            onClick={download(props, record)}
          >
            {name}
          </p>
          <Tag color={DOWNLOAD_STATUS_COLORS[status]}>
            {DOWNLOAD_STATUS_LOCALE[status]}
          </Tag>
        </li>
      )
    })
    listContent = (
      <ul className={styles.downloadList}>
        {downloadListItems}
      </ul>
    )
  } else {
    listContent = (
      <Empty
        key="empty"
        className={styles.empty}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    )
  }

  return (
    <nav className={headerClass}>
      <div className={styles.logoPc}>
        <div className={styles.logo}>
          <Link to="/projects">
            <img src={require('../../assets/images/logo.svg')} />
          </Link>
        </div>
      </div>
      <div className={styles.logoMobile}>
        <div className={styles.logo}>
          <Link to="/projects">
            <img src={require('../../assets/images/logo_mobile.svg')} />
          </Link>
        </div>
      </div>
      <ul className={styles.tools}>
        <li>
          <Popover
            content={listContent}
            trigger="click"
            placement="bottom"
            onVisibleChange={downloadListPanelVisibleChange}
          >
            <Badge count={downloadable}>
              <Icon type="cloud-download" onClick={getDownloadList(props)} />
            </Badge>
          </Popover>
        </li>
        <li>
          <Icon type="file-text" onClick={goDoc} />
        </li>
        <li>
          <Icon type="github" onClick={goGithub}/>
        </li>
        <li>
          <Dropdown overlay={menu} trigger={['click']} placement="bottomCenter">
            <Icon type="user" />
          </Dropdown>
        </li>
      </ul>
    </nav>
  )
}

let downloadListPanelVisibleRecorder = false

function downloadListPanelVisibleChange (visible) {
  downloadListPanelVisibleRecorder = visible
}

function getDownloadList (props: INavigatorProps) {
  return function () {
    if (!downloadListPanelVisibleRecorder) {
      props.onLoadDownloadList()
    }
  }
}

function download (props: INavigatorProps, record: IDownloadRecord) {
  return function () {
    const { id, status } = record
    if (status === DownloadStatus.Success) {
      props.onDownloadFile(id)
    }
  }
}

const mapStateToProps = createStructuredSelector({
  loginUser: makeSelectLoginUser(),
  downloadList: makeSelectDownloadList()
})

function mapDispatchToProps (dispatch) {
  return {
    onLoadDownloadList: () => dispatch(loadDownloadList()),
    onDownloadFile: (id) => dispatch(downloadFile(id))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Navigator)
