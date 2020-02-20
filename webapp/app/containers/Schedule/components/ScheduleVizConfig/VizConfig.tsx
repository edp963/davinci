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

import { Row, Col, Icon } from 'antd'

import {
  IPortal,
  IDashboard,
  IDisplayFormed,
  ISlideFormed
} from 'containers/Viz/types'
import { IScheduleVizConfigItem } from './types'

import { NodeKeyPrefix } from './constants'
import {
  getCheckedVizKeys,
  renderPortalDashboardsTreeNodes,
  renderDisplaySlidesTreeNodes
} from './util'

import VizSelectTree from './VizSelectTree'

interface IScheduleVizConfigProps {
  portals: IPortal[]
  displays: IDisplayFormed[]
  value: IScheduleVizConfigItem[]
  portalDashboards: { [portalId: number]: IDashboard[] }
  displaySlides: { [displayId: number]: ISlideFormed[] }
  onLoadPortalDashboards: (portalId: number) => void
  onLoadDisplaySlides: (displayId: number) => void
  onChange: (value: IScheduleVizConfigItem[]) => void
}

const ScheduleVizConfig: React.FC<IScheduleVizConfigProps> = (props) => {
  const {
    portals,
    displays,
    value,
    portalDashboards,
    displaySlides,
    onLoadPortalDashboards,
    onLoadDisplaySlides,
    onChange
  } = props

  const checkedPortalKeys = useMemo(
    () =>
      getCheckedVizKeys(
        value,
        'portal',
        portals,
        NodeKeyPrefix.Portal,
        NodeKeyPrefix.Dashboard
      ),
    [value, portals]
  )

  const checkedDisplayKeys = useMemo(
    () =>
      getCheckedVizKeys(
        value,
        'display',
        displays,
        NodeKeyPrefix.Display,
        NodeKeyPrefix.Slide
      ),
    [value, displays]
  )

  const loadVizItems = useCallback(
    (vizId: number, prefix: NodeKeyPrefix) => {
      switch (prefix) {
        case NodeKeyPrefix.Portal:
          if (!portalDashboards[vizId]) {
            onLoadPortalDashboards(vizId)
          }
          break
        case NodeKeyPrefix.Display:
          if (!displaySlides[vizId]) {
            onLoadDisplaySlides(vizId)
          }
          break
      }
      return new Promise<void>((resolve) => {
        resolve()
      })
    },
    [
      portalDashboards,
      displaySlides,
      onLoadPortalDashboards,
      onLoadDisplaySlides
    ]
  )

  const renderVizItems = useCallback(
    (nodeId: number, prefix: NodeKeyPrefix) => {
      switch (prefix) {
        case NodeKeyPrefix.Portal:
          return renderPortalDashboardsTreeNodes(
            nodeId,
            portalDashboards[nodeId]
          )
        case NodeKeyPrefix.Display:
          return renderDisplaySlidesTreeNodes(nodeId, displaySlides[nodeId])
      }
    },
    [portalDashboards, displaySlides]
  )

  const checkViz = useCallback(
    (
      type: IScheduleVizConfigItem['contentType'],
      vizId: number,
      checked: boolean
    ) => {
      // remove this Viz value first
      const newValue = value.filter(
        ({ id, contentType }) =>
          contentType !== type || (contentType === type && id !== vizId)
      )
      if (checked) {
        newValue.push({
          contentType: type,
          id: vizId,
          items: undefined // undefined stands for dynamic check all dashboards
        })
      }
      switch (type) {
        case 'portal':
          if (!portalDashboards[vizId]) {
            onLoadPortalDashboards(vizId)
          }
          break
        case 'display':
          if (!displaySlides[vizId]) {
            onLoadDisplaySlides(vizId)
          }
          break
      }
      onChange(newValue)
    },
    [value, onLoadPortalDashboards, onLoadDisplaySlides, onChange]
  )

  const checkVizItem = useCallback(
    (
      type: IScheduleVizConfigItem['contentType'],
      vizItemId: number,
      checked: boolean,
      dataRef: [number, number[]?, number[]?]
    ) => {
      const newValue = [...value]
      const [vizId, ancestorIds, descendantIds] = dataRef
      const removeAncestor = (itemId: number) =>
        !Array.isArray(ancestorIds) || !ancestorIds.includes(itemId)
      const removeDescendant = (itemId: number) =>
        !Array.isArray(descendantIds) || !descendantIds.includes(itemId)

      const vizConfigIdx = newValue.findIndex(
        ({ id, contentType }) => id === vizId && contentType === type
      )
      if (~vizConfigIdx) {
        const vizConfig = newValue[vizConfigIdx]
        const vizItems =
          type === 'portal'
            ? portalDashboards[vizId]
            : type === 'display'
            ? displaySlides[vizId]
            : []
        if (checked) {
          vizConfig.items = vizConfig.items
            .filter(removeDescendant)
            .concat(vizItemId)
        } else {
          vizConfig.items = (
            vizConfig.items ||
            (vizItems as Array<IDashboard | ISlideFormed>).map(({ id }) => id)
          ).filter(
            (id) =>
              id !== vizItemId && removeAncestor(id) && removeDescendant(id)
          )
          if (!vizConfig.items.length) {
            newValue.splice(vizConfigIdx, 1)
          }
        }
      } else {
        // new checked true
        newValue.push({
          contentType: type,
          id: vizId,
          items: [vizItemId]
        })
      }

      onChange(newValue)
    },
    [value, portalDashboards, displaySlides, onChange]
  )

  const checkVizTree = useCallback(
    (nodeId: number, prefix: NodeKeyPrefix, checked: boolean, dataRef: any) => {
      switch (prefix) {
        case NodeKeyPrefix.Portal:
          checkViz('portal', nodeId, checked)
          break
        case NodeKeyPrefix.Display:
          checkViz('display', nodeId, checked)
          break
        case NodeKeyPrefix.Dashboard:
          checkVizItem('portal', nodeId, checked, dataRef)
          break
        case NodeKeyPrefix.Slide:
          checkVizItem('display', nodeId, checked, dataRef)
          break
      }
    },
    [checkViz, checkVizItem]
  )

  return (
    <Row gutter={8}>
      <Col span={12}>
        <VizSelectTree
          title="Dashboard"
          vizs={portals}
          vizIcon={<Icon type="layout" />}
          vizKeyPrefix={NodeKeyPrefix.Portal}
          checkedKeys={checkedPortalKeys}
          onLoadDetail={loadVizItems}
          onRenderVizItems={renderVizItems}
          onCheck={checkVizTree}
        />
      </Col>
      <Col span={12}>
        <VizSelectTree
          title="Display"
          vizs={displays}
          vizIcon={<Icon type="layout" />}
          vizKeyPrefix={NodeKeyPrefix.Display}
          checkedKeys={checkedDisplayKeys}
          onLoadDetail={loadVizItems}
          onRenderVizItems={renderVizItems}
          onCheck={checkVizTree}
        />
      </Col>
    </Row>
  )
}

export default ScheduleVizConfig
