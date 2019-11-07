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

import React, { useMemo, useCallback } from 'react'
import { IDisplay } from 'containers/Display/types'
import { IPortal } from 'containers/Portal'

import { Row, Col, Card, Tree, Checkbox, Button, Popconfirm } from 'antd'
const CheckboxGroup = Checkbox.Group
const { TreeNode } = Tree
import { CheckboxOptionType } from 'antd/lib/checkbox'
import { AntTreeNode, AntTreeNodeCheckedEvent } from 'antd/lib/tree'

import { IDashboard } from 'containers/Dashboard'
import { IScheduleVizItem } from './types'

interface IScheduleVizConfigProps {
  displays: IDisplay[]
  portals: IPortal[]
  value: IScheduleVizItem[]
  portalDashboards: { [portalId: number]: IDashboard[] }
  onLoadPortalDashboards: (portalId: number) => void
  onChange: (value: IScheduleVizItem[]) => void
}

const portalNodeKeyPrefix = 'portal_'
const dashboardNodeKeyPrefix = 'dashboard_'

const ScheduleVizConfig: React.FC<IScheduleVizConfigProps> = (props) => {
  const {
    displays,
    portals,
    value,
    portalDashboards,
    onLoadPortalDashboards,
    onChange
  } = props

  const displayOptions = useMemo(
    () =>
      // @FIXME immutable initial value is empty List object
      !displays.length
        ? []
        : displays.map<CheckboxOptionType>(({ id, name }) => ({
            label: name,
            value: id
          })),
    [displays]
  )

  const vizConfig = useMemo(
    () => {
      const portalKeys = !Array.isArray(portals)
        ? []
        : value
            .filter(({ contentType }) => contentType === 'portal')
            .reduce<string[]>((acc, { id, items }) => {
              if (!Array.isArray(items)) {
                if (~portals.findIndex((portal) => portal.id === id)) {
                  acc.push(`${portalNodeKeyPrefix}${id}`)
                } else {
                  acc.push(`${dashboardNodeKeyPrefix}${id}`)
                }
              } else {
                items.map((dashboardId) => {
                  acc.push(`${dashboardNodeKeyPrefix}${dashboardId}`)
                })
              }
              return acc
            }, [])
      const displayKeys = value
        .filter(({ contentType }) => contentType === 'display')
        .map(({ id }) => id)
      return { portalKeys, displayKeys }
    },
    [value, portals]
  )

  const loadPortalDashboards = useCallback(
    (portalTreeNode: AntTreeNode) => {
      const portalId = +portalTreeNode.props.eventKey.slice(
        portalNodeKeyPrefix.length
      )
      if (!portalDashboards[portalId]) {
        onLoadPortalDashboards(portalId)
      }
      return new Promise((resolve) => {
        resolve()
      })
    },
    [portalDashboards, onLoadPortalDashboards]
  )

  const checkPortalDashboards = useCallback(
    (_, e: AntTreeNodeCheckedEvent) => {
      let newValue = [...value]
      const { checked, node } = e
      const { eventKey, dataRef } = node.props
      if (eventKey.includes(portalNodeKeyPrefix)) {
        const portalId = +eventKey.slice(portalNodeKeyPrefix.length)
        newValue = newValue.filter(({ id }) => id !== portalId)
        if (checked) {
          newValue.push({
            contentType: 'portal',
            id: portalId,
            items: undefined
          })
          if (!portalDashboards[portalId]) {
            onLoadPortalDashboards(portalId)
          }
        }
      } else if (eventKey.includes(dashboardNodeKeyPrefix)) {
        const dashboardId = +eventKey.slice(dashboardNodeKeyPrefix.length)
        const portalIdx = newValue.findIndex(
          ({ id, contentType }) => id === dataRef && contentType === 'portal'
        )
        if (~portalIdx) {
          const portal = newValue[portalIdx]
          if (checked) {
            portal.items = [...portal.items, dashboardId]
          } else {
            portal.items = (
              portal.items || portalDashboards[portal.id].map(({ id }) => id)
            ).filter((id) => id !== dashboardId)
            if (!portal.items.length) {
              newValue.splice(portalIdx, 1)
            }
          }
        } else {
          // new checked true
          newValue.push({
            contentType: 'portal',
            id: dataRef,
            items: [dashboardId]
          })
        }
      }
      onChange(newValue)
    },
    [value, portalDashboards, onLoadPortalDashboards, onChange]
  )

  const displayKeysChange = useCallback(
    (displayKeys: number[]) => {
      const newValue = value
        .filter(({ contentType }) => contentType === 'portal')
        .concat(
          displayKeys.map<IScheduleVizItem>((key) => ({
            contentType: 'display',
            id: key,
            items: undefined // @TODO items id from display slides
          }))
        )
      onChange(newValue)
    },
    [value, onChange]
  )

  const clearSelection = useCallback(
    (clearContentType: IScheduleVizItem['contentType']) => () => {
      const newValue = value.filter(
        ({ contentType }) => contentType !== clearContentType
      )
      onChange(newValue)
    },
    [value, onChange]
  )

  return (
    <Row gutter={8}>
      <Col span={12}>
        <Card
          size="small"
          title={
            <Row type="flex" justify="space-between">
              <span>Dashboard</span>
              <Popconfirm
                title="确认清除所有勾选项？"
                onConfirm={clearSelection('portal')}
              >
                <Button size="small" type="primary">重置</Button>
              </Popconfirm>
            </Row>
          }
        >
          <Tree
            checkable
            blockNode
            checkedKeys={vizConfig.portalKeys}
            loadData={loadPortalDashboards}
            onCheck={checkPortalDashboards}
          >
            {(portals || []).map(({ id, name }) => (
              <TreeNode
                title={name}
                key={`${portalNodeKeyPrefix}${id}`}
                isLeaf={false}
              >
                {portalDashboards[id] &&
                  portalDashboards[id].map((dashboard) => (
                    <TreeNode
                      title={dashboard.name}
                      key={`${dashboardNodeKeyPrefix}${dashboard.id}`}
                      isLeaf={true}
                      dataRef={id}
                    />
                  ))}
              </TreeNode>
            ))}
          </Tree>
        </Card>
      </Col>
      <Col span={12}>
        <Card
          size="small"
          title={
            <Row type="flex" justify="space-between">
              <span>Display</span>
              <Popconfirm
                title="确认清除所有勾选项？"
                onConfirm={clearSelection('display')}
              >
                <Button size="small" type="primary">重置</Button>
              </Popconfirm>
            </Row>
          }
        >
          {/* @TODO make it to tree select when has Display Slide feature */}
          <CheckboxGroup
            options={displayOptions}
            value={vizConfig.displayKeys}
            onChange={displayKeysChange}
          />
        </Card>
      </Col>
    </Row>
  )
}

export default ScheduleVizConfig
