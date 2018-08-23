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
const Icon = require('antd/lib/icon')
const Tooltip = require('antd/lib/tooltip')
const Popover = require('antd/lib/popover')
const Popconfirm = require('antd/lib/popconfirm')
const styles = require('../Dashboard.less')
import {IProject} from '../../Projects'

interface IDashboardActionProps {
  currentProject: IProject
  depth: number
  item: {
    id: number,
    type: number,
    name: string
  }
  actionItemVisible: boolean
  onHandleVisibleChange: (visible: boolean) => any
  onInitOperateMore: (id: number, type: string) => any
  initChangeDashboard: (id: number) => any
}

export class DashboardAction extends React.PureComponent<IDashboardActionProps, {}> {
  public render () {
    const {
      currentProject,
      depth,
      item,
      actionItemVisible,
      onHandleVisibleChange,
      onInitOperateMore,
      initChangeDashboard
    } = this.props

    const ulActionAll = (
      <ul className={styles.menu}>
        <li onClick={onInitOperateMore(item.id, 'edit')}>
          <Icon type="edit" /> 编辑
        </li>
        <li onClick={onInitOperateMore(item.id, 'copy')} className={item.type === 0 ? styles.popHide : ''}>
          <Icon type="copy" /> 复制
        </li>
        <li onClick={onInitOperateMore(item.id, 'move')}>
          <Icon type="swap" className={styles.swap} /> 移动
        </li>
        <li onClick={onInitOperateMore(item.id, 'delete')}>
          <Icon type="delete" /> 删除
        </li>
      </ul>
    )

    const ulActionPart = (
      <ul className={styles.menu}>
        <li onClick={onInitOperateMore(item.id, 'edit')}>
          <Icon type="edit" /> 编辑
        </li>
        <li onClick={onInitOperateMore(item.id, 'move')}>
          <Icon type="swap" className={styles.swap} /> 移动
        </li>
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
      if (currentPermission === 0 || currentPermission === 1) {
        ulPopover = null
      } else {
        ulPopover = (
          <Popover
            placement="bottomRight"
            content={currentPermission === 2 ? ulActionPart : ulActionAll}
            trigger="click"
            visible={actionItemVisible}
            onVisibleChange={onHandleVisibleChange}
          >
            {icon}
          </Popover>)
      }
    }

    const titleWidth = `${130 - 18 * depth}px`

    return (
      <span className={styles.portalTreeItem}>
        <Tooltip placement="right" title={`名称：${item.name}`}>
          {
            item.type === 0
              ? <h4 className={styles.protalTitle} style={{ width: titleWidth }}>{item.name}</h4>
              : <span style={{width: titleWidth}} onClick={initChangeDashboard(item.id)} className={styles.dashboardTitle}>
                  <Icon type="dot-chart" />
                  <span className={styles.itemName}>{item.name}</span>
                </span>
          }
          {ulPopover}
        </Tooltip>
      </span>
    )
  }
}

export default DashboardAction
