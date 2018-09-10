import * as React from 'react'

const Button = require('antd/lib/button')
const Tooltip = require('antd/lib/tooltip')
const Popover = require('antd/lib/popover')
const Col = require('antd/lib/col')

import { ButtonProps } from 'antd/lib/button/button'
import { IProject } from '../../Projects'
import { ICurrentDashboard } from '../'

import ModulePermission from '../../Account/components/checkModulePermission'
import ShareDownloadPermission from '../../Account/components/checkShareDownloadPermission'

import SharePanel from 'components/SharePanel'

const utilStyles = require('assets/less/util.less')

interface IDashboardToolbarProps {
  currentProject: IProject
  currentDashboard: ICurrentDashboard
  currentDashboardShareInfo: string
  currentDashboardSecretInfo: string
  currentDashboardShareInfoLoading: boolean
  dashboardSharePanelAuthorized: boolean
  showAddDashboardItem: () => void
  onChangeDashboardAuthorize: (authorized: boolean) => () => void
  onLoadDashboardShareLink: (id: number, authName: string) => void
  onToggleLinkageVisibility: (visible: boolean) => () => void
  onToggleGlobalFilterVisibility: (visible: boolean) => () => void
}

export class DashboardToolbar extends React.PureComponent<IDashboardToolbarProps> {

  public render () {
    const { currentDashboard } = this.props
    if (!currentDashboard) { return null }

    const {
      currentProject,
      currentDashboardShareInfo,
      currentDashboardSecretInfo,
      currentDashboardShareInfoLoading,
      dashboardSharePanelAuthorized,
      onChangeDashboardAuthorize,
      showAddDashboardItem,
      onLoadDashboardShareLink,
      onToggleLinkageVisibility,
      onToggleGlobalFilterVisibility } = this.props

    const AddButton = ModulePermission<ButtonProps>(currentProject, 'viz', true)(Button)
    const ShareButton = ShareDownloadPermission<ButtonProps>(currentProject, 'share')(Button)
    const LinkageButton = ModulePermission<ButtonProps>(currentProject, 'viz', false)(Button)
    const GlobalFilterButton = ModulePermission<ButtonProps>(currentProject, 'viz', false)(Button)

    let addButton
    let shareButton
    let linkageButton
    let globalFilterButton

    addButton = (
      <Tooltip placement="bottom" title="新增">
        <AddButton
          size="large"
          type="primary"
          icon="plus"
          style={{marginLeft: '8px'}}
          onClick={showAddDashboardItem}
        />
      </Tooltip>
    )
    shareButton = (
      <Popover
        placement="bottomRight"
        content={
          <SharePanel
            id={currentDashboard.id}
            type="dashboard"
            shareInfo={currentDashboardShareInfo}
            secretInfo={currentDashboardSecretInfo}
            shareInfoLoading={currentDashboardShareInfoLoading}
            authorized={dashboardSharePanelAuthorized}
            afterAuthorization={onChangeDashboardAuthorize(true)}
            onLoadDashboardShareLink={onLoadDashboardShareLink}
          />
        }
        trigger="click"
      >
        <Tooltip placement="bottom" title="分享">
          <ShareButton
            size="large"
            type="primary"
            icon="share-alt"
            style={{marginLeft: '8px'}}
            onClick={onChangeDashboardAuthorize(false)}
          />
        </Tooltip>
      </Popover>
    )
    linkageButton = (
      <Tooltip placement="bottom" title="联动关系配置">
        <LinkageButton
          size="large"
          type="primary"
          icon="link"
          style={{marginLeft: '8px'}}
          onClick={onToggleLinkageVisibility(true)}
        />
      </Tooltip>
    )
    globalFilterButton = (
      <Tooltip placement="bottomRight" title="全局筛选器配置">
        <GlobalFilterButton
          size="large"
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
        {linkageButton}
        {globalFilterButton}
      </Col>
    )
  }
}

export default DashboardToolbar
