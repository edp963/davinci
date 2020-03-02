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

import React, { useMemo } from 'react'
import { Tree, TreeSelect, Icon } from 'antd'

import { IDashboardNode, DashboardTypes } from '../types'

const dashboardNodeKeyPrefix = 'dashboard_'

const renderTreeNodes = (
  nodes: IDashboardNode[],
  folderOnly: boolean,
  treeSelect: boolean
) => {
  if (!nodes || !nodes.length) {
    return null
  }

  let filterNodes = folderOnly
    ? nodes.filter(({ type }) => type === DashboardTypes.Folder)
    : nodes
  if (!filterNodes.length) {
    return null
  }

  const { TreeNode } = treeSelect ? TreeSelect : Tree
  return filterNodes.map((node) => (
    <TreeNode
      key={`${dashboardNodeKeyPrefix}${node.id}`}
      title={node.name}
      icon={!node.children && <Icon type="dot-chart" />}
      isLeaf={!node.children}
    >
      {renderTreeNodes(node.children, folderOnly, treeSelect)}
    </TreeNode>
  ))
}

const findFirstLeaf = (nodes: IDashboardNode[], folderOnly: boolean): string[] => {
  if (!nodes || !nodes.length) {
    return []
  }

  let filterNodes = folderOnly
    ? nodes.filter(({ type }) => type === DashboardTypes.Folder)
    : nodes
  if (!filterNodes.length) {
    return []
  }

  if (folderOnly) {
    return [`${dashboardNodeKeyPrefix}${filterNodes[0].id}`]
  }

  let firstDashboardNodeKey: string[] = []
  filterNodes.some((node) => {
    if (node.type === DashboardTypes.Dashboard) {
      firstDashboardNodeKey = [`${dashboardNodeKeyPrefix}${node.id}`]
      return true
    }
    firstDashboardNodeKey = findFirstLeaf(node.children, folderOnly)
    return firstDashboardNodeKey.length
  })
  return firstDashboardNodeKey
}

const useDashboardTreeNodes = (
  nodes: IDashboardNode[],
  folderOnly: boolean = false,
  treeSelect: boolean = false
): [JSX.Element[], string[]] => {
  const treeNodes = useMemo(
    () => renderTreeNodes(nodes, folderOnly, treeSelect),
    [nodes]
  )
  const firstDashboardNodeKey = useMemo(
    () => findFirstLeaf(nodes, folderOnly),
    [nodes, folderOnly]
  )
  return [treeNodes, firstDashboardNodeKey]
}

export default useDashboardTreeNodes
