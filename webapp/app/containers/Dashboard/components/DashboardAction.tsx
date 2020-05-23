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
import { Icon, Tooltip, Popover } from 'antd'
const styles = require('../Dashboard.less')
import { IProject } from 'containers/Projects/types'
import ShareDownloadPermission from 'containers/Account/components/checkShareDownloadPermission'
import ModulePermission from 'containers/Account/components/checkModulePermission'
import { getTextWidth } from 'utils/util'
interface IDashboardActionProps {
  currentProject: IProject
  depth: number
  item: {
    id: number,
    type: number,
    name: string
  }
  splitWidth: number
  onInitOperateMore: (item: any, type: string) => any
  initChangeDashboard: (id: number) => any
}

interface IDashboardActionState {
  popoverVisible: boolean
}

export class DashboardAction extends React.PureComponent<IDashboardActionProps, IDashboardActionState> {
  constructor (props) {
    super(props)
    this.state = {
      popoverVisible: false
    }
  }

  private handleVisibleChange = (visible) => {
    this.setState({
      popoverVisible: visible
    })
  }

  private operateMore = (item, type) => (e) => {
    const { popoverVisible } = this.state
    const { onInitOperateMore } = this.props

    if (this.state.popoverVisible) {
      this.setState({
        popoverVisible: false
      })
    }
    onInitOperateMore(item, type)
  }

  private computeTitleWidth (text: string, wrapperWidth: number) {
    const textWidth = getTextWidth(text)
    const textLength = text.length
    return text
  }

  public render () {
    const {
      currentProject,
      depth,
      item,
      initChangeDashboard,
      splitWidth
    } = this.props
    const { popoverVisible } = this.state

    const EditActionButton = ModulePermission<React.DetailedHTMLProps<React.HTMLAttributes<HTMLLIElement>, HTMLLIElement>>(currentProject, 'viz')(Li)
    const editAction = (
      <EditActionButton onClick={this.operateMore(item, 'edit')}>
        <Icon type="edit" /> 编辑
      </EditActionButton>
    )

    const DownloadButton = ShareDownloadPermission<React.DetailedHTMLProps<React.HTMLAttributes<HTMLLIElement>, HTMLLIElement>>(currentProject, 'download')(Li)

    const downloadAction = (
      <DownloadButton style={{cursor: 'pointer'}} onClick={this.operateMore(item, 'download')}>
        <Icon type="download" className={styles.swap} /> 下载
      </DownloadButton>
    )



    const moveAction = (
      <EditActionButton onClick={this.operateMore(item, 'move')}>
        <Icon type="swap" className={styles.swap} /> 移动
      </EditActionButton>
    )

    const DeleteActionButton = ModulePermission<React.DetailedHTMLProps<React.HTMLAttributes<HTMLLIElement>, HTMLLIElement>>(currentProject, 'viz', true)(Li)
    const deleteAction = (
      <DeleteActionButton onClick={this.operateMore(item, 'delete')}>
        <Icon type="delete" /> 删除
      </DeleteActionButton>
    )

    const ulActionAll = (
      <ul className={styles.menu}>
        <li>{editAction}</li>
        {/* <li>{downloadAction}</li> */}
        <li>{moveAction}</li>
        <li>{deleteAction}</li>
      </ul>
    )

    const ulActionPart = (
      <ul className={styles.menu}>
        <li>{editAction}</li>
        {/* <li>{downloadAction}</li> */}
        <li>{moveAction}</li>
      </ul>
    )

    const icon = (
      <Icon
        type="ellipsis"
        className={styles.itemAction}
        title="More"
      />
    )

    let ulPopover
    if (currentProject && currentProject.permission) {
      const currentPermission = currentProject.permission.vizPermission
      if (currentPermission === 0) {
        ulPopover = null
      } else {
        ulPopover = (
          <Popover
            placement="bottomRight"
            content={currentPermission === 2 ? ulActionPart : ulActionAll}
            trigger="click"
            visible={popoverVisible}
            onVisibleChange={this.handleVisibleChange}
          >
            {icon}
          </Popover>)
      }
    }

    const computeWidth: number = splitWidth - 60 - 18 * depth - 6
    const titleWidth: string = `${computeWidth}px`

    const computeTitleWidth = this.computeTitleWidth
    return (
      <span className={styles.portalTreeItem}>
        <Tooltip placement="right" title={`名称：${item.name}`}>
          {
            item.type === 0
              ? <h4 className={styles.dashboardTitle} style={{ width: titleWidth }}>{computeTitleWidth(item.name, computeWidth)}</h4>
              : <span className={styles.dashboardTitle} style={{width: titleWidth}} onClick={initChangeDashboard(item.id)}>
                  <Icon type={`${item.type === 2 ? 'table' : 'dot-chart'}`} />
                  <span className={styles.itemName}>{computeTitleWidth(item.name, computeWidth)}</span>
                </span>
          }
          {ulPopover}
        </Tooltip>
      </span>
    )
  }
}

function Li (props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLLIElement>, HTMLLIElement>) {
  return (
    <span {...props} >{props.children}</span>
  )
}

export default DashboardAction
