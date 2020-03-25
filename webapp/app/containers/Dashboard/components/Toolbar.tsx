import React from 'react'

import { Button, Tooltip, Col, Popconfirm } from 'antd'
import { ButtonProps } from 'antd/lib/button/button'

import { IProject } from 'containers/Projects/types'
import { ICurrentDashboard } from '..'

import ModulePermission from 'containers/Account/components/checkModulePermission'
import ShareDownloadPermission from 'containers/Account/components/checkShareDownloadPermission'

const utilStyles = require('assets/less/util.less')

interface IToolbarProps {
  currentProject: IProject
  currentDashboard: ICurrentDashboard
  showAddDashboardItem: () => void
  onOpenSharePanel: () => void
  onToggleLinkageVisibility: (visible: boolean) => () => void
  onToggleGlobalFilterVisibility: (visible: boolean) => () => void
  onDownloadDashboard: () => void
}

export class Toolbar extends React.PureComponent<IToolbarProps> {

  public render () {
    const { currentDashboard } = this.props
    if (!currentDashboard) { return null }

    const {
      currentProject,
      showAddDashboardItem,
      onOpenSharePanel,
      onToggleLinkageVisibility,
      onToggleGlobalFilterVisibility,
      onDownloadDashboard
    } = this.props

    const AddButton = ModulePermission<ButtonProps>(currentProject, 'viz', true)(Button)
    const ShareButton = ShareDownloadPermission<ButtonProps>(currentProject, 'share')(Button)
    const DownloadButton = ShareDownloadPermission<ButtonProps>(currentProject, 'download')(Button)
    const LinkageButton = ModulePermission<ButtonProps>(currentProject, 'viz', false)(Button)
    const GlobalFilterButton = ModulePermission<ButtonProps>(currentProject, 'viz', false)(Button)

    let addButton
    let shareButton
    let downloadButton
    let linkageButton
    let globalFilterButton

    addButton = (
      <Tooltip placement="bottom" title="新增">
        <AddButton
          type="primary"
          icon="plus"
          style={{marginLeft: '8px'}}
          onClick={showAddDashboardItem}
        />
      </Tooltip>
    )
    shareButton = (
      <Tooltip placement="bottom" title="分享">
        <ShareButton
          type="primary"
          icon="share-alt"
          style={{marginLeft: '8px'}}
          onClick={onOpenSharePanel}
        />
      </Tooltip>
    )
    downloadButton = (
      <Tooltip placement="bottom" title="下载">
        <Popconfirm
          title="点击开始下载"
          placement="bottom"
          onConfirm={onDownloadDashboard}
        >
          <DownloadButton
            type="primary"
            icon="download"
            style={{marginLeft: '8px'}}
          />
        </Popconfirm>
      </Tooltip>
    )
    linkageButton = (
      <Tooltip placement="bottom" title="联动关系配置">
        <LinkageButton
          type="primary"
          icon="link"
          style={{marginLeft: '8px'}}
          onClick={onToggleLinkageVisibility(true)}
        />
      </Tooltip>
    )
    globalFilterButton = (
      <Tooltip placement="bottomRight" title="全局控制器配置">
        <GlobalFilterButton
          type="primary"
          icon="filter"
          style={{marginLeft: '8px'}}
          onClick={onToggleGlobalFilterVisibility(true)}
        />
      </Tooltip>
    )

    return (
      <Col sm={12} className={utilStyles.textAlignRight}>
        {addButton}
        {shareButton}
        {downloadButton}
        {linkageButton}
        {globalFilterButton}
      </Col>
    )
  }
}

export default Toolbar
