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

import React, { useCallback } from 'react'

import { Card, Tree } from 'antd'
import { TreeProps, AntTreeNodeCheckedEvent, AntTreeNode } from 'antd/lib/tree'
const { TreeNode } = Tree

import { IPortal, IDisplayFormed } from 'containers/Viz/types'
import { NodeKeyPrefix } from './constants'
import { splitNodeKeyWithPrefix } from './util'

interface IVizSelectTreeProps {
  title: string
  vizs: IPortal[] | IDisplayFormed[]

  vizIcon: JSX.Element
  vizKeyPrefix?: NodeKeyPrefix

  checkedKeys: string[]
  onLoadDetail: (
    id: number,
    prefix: NodeKeyPrefix
  ) => ReturnType<TreeProps['loadData']>
  onRenderVizItems: (id: number, prefix: NodeKeyPrefix) => JSX.Element[]
  onCheck: (
    id: number,
    prefix: NodeKeyPrefix,
    checked: boolean,
    dataRef: any
  ) => void
}

const VizSelectTree: React.FC<IVizSelectTreeProps> = (props) => {
  const {
    title,
    vizs,
    vizIcon,
    vizKeyPrefix,
    checkedKeys,
    onLoadDetail,
    onRenderVizItems,
    onCheck
  } = props

  const loadDetail = useCallback(
    (node: AntTreeNode) => {
      const nodeKey = node.props.eventKey
      const [nodePrefix, nodeId] = splitNodeKeyWithPrefix(nodeKey)
      return onLoadDetail(nodeId, nodePrefix)
    },
    [onLoadDetail]
  )

  const treeCheck = useCallback(
    (_, e: AntTreeNodeCheckedEvent) => {
      const { checked, node } = e
      const { eventKey, dataRef } = node.props
      const [nodePrefix, nodeId] = splitNodeKeyWithPrefix(eventKey)
      onCheck(nodeId, nodePrefix, checked, dataRef)
    },
    [onCheck]
  )

  return (
    <Card size="small" title={title}>
      <Tree
        checkable
        blockNode
        showIcon
        checkedKeys={checkedKeys}
        loadData={loadDetail}
        onCheck={treeCheck}
      >
        {Array.isArray(vizs) &&
          (vizs as Array<IPortal | IDisplayFormed>).map(({ id, name }) => (
            <TreeNode
              title={name}
              icon={vizIcon}
              key={`${vizKeyPrefix || ''}${id}`}
              isLeaf={false}
            >
              {onRenderVizItems(id, vizKeyPrefix)}
            </TreeNode>
          ))}
      </Tree>
    </Card>
  )
}

export default VizSelectTree
