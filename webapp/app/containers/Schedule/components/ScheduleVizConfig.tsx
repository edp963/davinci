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

import { Row, Col, Card, Tree, Checkbox, Button, Icon, Popconfirm } from 'antd'
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

const getDashboardChildNodes = (
  portalId: number,
  mapDashboards: { [parentId: number]: IDashboard[] },
  ancestorIds: number[] = [0]
): [JSX.Element[], number[]] => {
  const currentDashboardId = ancestorIds[ancestorIds.length - 1]
  const childDashboards = mapDashboards[currentDashboardId]
  if (!Array.isArray(childDashboards)) {
    return [null, [currentDashboardId]]
  }
  let descendantIds = []
  const descendantNodes = childDashboards.map((child) => {
    const [childNodes, childIds] = getDashboardChildNodes(
      portalId,
      mapDashboards,
      ancestorIds.concat(child.id)
    )
    descendantIds = descendantIds.concat(child.id).concat(childIds)
    return (
      <TreeNode
        title={child.name}
        icon={
          <Icon type={mapDashboards[child.id] ? 'folder-open' : 'dot-chart'} />
        }
        key={`${dashboardNodeKeyPrefix}${child.id}`}
        isLeaf={!childNodes}
        dataRef={[portalId, ancestorIds, childIds]}
      >
        {childNodes}
      </TreeNode>
    )
  })
  return [descendantNodes, descendantIds]
}

const renderPortalDashboardsTreeNodes = (
  portalId: number,
  dashboards: IDashboard[]
) => {
  if (!dashboards) {
    return null
  }
  const mapDashboards = dashboards.reduce<{ [parentId: number]: IDashboard[] }>(
    (map, dashboard) => {
      if (!map[dashboard.parentId]) {
        map[dashboard.parentId] = []
      }
      map[dashboard.parentId].push(dashboard)
      return map
    },
    {}
  )
  const [dashboardNodes] = getDashboardChildNodes(portalId, mapDashboards)
  return dashboardNodes
}

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
              // checked all Dashboards under this Portal
              if (!Array.isArray(items)) {
                // check the Portal's validity
                if (~portals.findIndex((portal) => portal.id === id)) {
                  acc.push(`${portalNodeKeyPrefix}${id}`)
                }
              } else {
                // check the partial Dashboards under this Portal
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
      const nodeKey = portalTreeNode.props.eventKey
      const portalId = +nodeKey.slice(portalNodeKeyPrefix.length)
      if (
        nodeKey.includes(portalNodeKeyPrefix) &&
        !portalDashboards[portalId]
      ) {
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

      // Portal Node
      if (eventKey.includes(portalNodeKeyPrefix)) {
        const portalId = +eventKey.slice(portalNodeKeyPrefix.length)
        // remove this Portal value first
        newValue = newValue.filter(({ id }) => id !== portalId)
        if (checked) {
          newValue.push({
            contentType: 'portal',
            id: portalId,
            items: undefined // undefined stands for dynamic check all dashboards
          })
          if (!portalDashboards[portalId]) {
            onLoadPortalDashboards(portalId)
          }
        }
      }
      // Dashboard Node
      else if (eventKey.includes(dashboardNodeKeyPrefix)) {
        const [portalId, ancestorIds, descendantIds] = dataRef
        const dashboardId = +eventKey.slice(dashboardNodeKeyPrefix.length)
        const portalIdx = newValue.findIndex(
          ({ id, contentType }) => id === portalId && contentType === 'portal'
        )
        if (~portalIdx) {
          const portal = newValue[portalIdx]
          const childDashboards = portalDashboards[portal.id]
          if (checked) {
            portal.items = portal.items
              .filter((item) => !descendantIds.includes(item))
              .concat(dashboardId)
          } else {
            portal.items = (
              portal.items || childDashboards.map(({ id }) => id)
            ).filter(
              (id) =>
                id !== dashboardId &&
                !ancestorIds.includes(id) &&
                !descendantIds.includes(id)
            )
            if (!portal.items.length) {
              newValue.splice(portalIdx, 1)
            }
          }
        } else {
          // new checked true
          newValue.push({
            contentType: 'portal',
            id: portalId,
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

  return (
    <Row gutter={8}>
      <Col span={12}>
        <Card
          size="small"
          title="Dashboard"
        >
          <Tree
            checkable
            blockNode
            showIcon
            checkedKeys={vizConfig.portalKeys}
            loadData={loadPortalDashboards}
            onCheck={checkPortalDashboards}
          >
            {(portals || []).map(({ id, name }) => (
              <TreeNode
                title={name}
                icon={<Icon type="layout" />}
                key={`${portalNodeKeyPrefix}${id}`}
                isLeaf={false}
              >
                {renderPortalDashboardsTreeNodes(id, portalDashboards[id])}
              </TreeNode>
            ))}
          </Tree>
        </Card>
      </Col>
      <Col span={12}>
        <Card
          size="small"
          title="Display"
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
