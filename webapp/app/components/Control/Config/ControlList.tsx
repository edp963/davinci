import React, { PureComponent, GetDerivedStateFromProps } from 'react'
import { fromJS } from 'immutable'

import { IControl, IRenderTreeItem } from '../types'
import { getControlRenderTree, getAllChildren } from '../util'
import { ListItem } from 'components/ListFormLayout'

import styles from '../Control.less'

import { Icon, Tree } from 'antd'
const { TreeNode } = Tree

interface IControlListProps {
  list: IControl[]
  selected: Omit<IControl, 'relatedItems' | 'relatedViews'>
  onSelect: (key: string) => void
  onDelete: (keys: string[], selectKey: string) => void
  onNameChange: (key: string, name: string) => void
  onParentChange: (
    key: string,
    parentKey: string,
    type: string,
    dropNextKey?: string
  ) => void
}

interface IControlListStates {
  renderTree: IRenderTreeItem[]
  flatTree: {
    [key: string]: IRenderTreeItem
  }
  selectedKeys: string[]
  prevList: IControl[]
  prevSelected: Omit<IControl, 'relatedItems' | 'relatedViews'>
}

class ControlList extends PureComponent<IControlListProps, IControlListStates> {
  constructor(props) {
    super(props)
    this.state = {
      renderTree: [],
      flatTree: {},
      selectedKeys: [],
      prevList: [],
      prevSelected: null
    }
  }

  public static getDerivedStateFromProps: GetDerivedStateFromProps<
    IControlListProps,
    IControlListStates
  > = (props, state) => {
    let nextState: Partial<IControlListStates> = {}
    if (props.list !== state.prevList) {
      const replica = fromJS(props.list).toJS()
      nextState = {
        ...getControlRenderTree(replica),
        prevList: props.list
      }
    }
    if (props.selected !== state.prevSelected) {
      nextState.selectedKeys = props.selected ? [props.selected.key] : []
      nextState.prevSelected = props.selected
    }
    return nextState
  }

  private delete = (key: string) => {
    const { selected } = this.props
    const { renderTree, flatTree } = this.state
    const delKeys = [key].concat(getAllChildren(key, flatTree))
    let selectedKey: string

    if (selected.key === key) {
      if (selected.parent) {
        const parentTree = flatTree[selected.parent]
        if (parentTree.children.length === 1) {
          selectedKey = parentTree.key
        } else {
          const delIndex = parentTree.children.findIndex((c) => c.key === key)
          selectedKey =
            delIndex === parentTree.children.length - 1
              ? parentTree.children[delIndex - 1].key
              : parentTree.children[delIndex + 1].key
        }
      } else {
        if (renderTree.length !== 1) {
          const delIndex = renderTree.findIndex((n) => n.key === key)
          selectedKey =
            delIndex === renderTree.length - 1
              ? renderTree[delIndex - 1].key
              : renderTree[delIndex + 1].key
        }
      }
    } else {
      selectedKey = selected.key
    }

    this.props.onDelete(delKeys, selectedKey)
  }

  private select = (selectedKeys: string[]) => {
    if (selectedKeys.length) {
      this.props.onSelect(selectedKeys[0])
    }
  }

  private dragEnter = (info) => {

  }

  private drop = (info) => {
    const dropKey = info.node.props.eventKey
    const dragKey = info.dragNode.props.eventKey
    const dropPos = info.node.props.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

    const { onParentChange } = this.props
    const { flatTree } = this.state

    let parentKey
    let type
    let dropNextKey

    if (!info.dropToGap) {
      parentKey = dropKey
      type = 'append'
    } else if (
      (info.node.props.children || []).length > 0 &&
      info.node.props.expanded &&
      dropPosition === 1
    ) {
      parentKey = dropKey
      type = 'prepend'
    } else {
      const dropped = flatTree[dropKey]
      parentKey = dropped.parent
      dropNextKey = dropKey
      type = dropPosition === -1 ? 'prepend' : 'append'
    }
    onParentChange(dragKey, parentKey, type, dropNextKey)
  }

  private renderTreeNodes = (renderTree: IRenderTreeItem[]) =>
    renderTree.map((node) => {
      const { key, name, children } = node
      const title = (
        <ListItem
          id={key}
          name={name}
          onChange={this.props.onNameChange}
          onDelete={this.delete}
        />
      )
      if (children) {
        return (
          <TreeNode title={title} key={key} dataRef={node}>
            {this.renderTreeNodes(node.children)}
          </TreeNode>
        )
      }
      return <TreeNode title={title} key={key} dataRef={node} />
    })

  public render() {
    const { renderTree, selectedKeys } = this.state
    return (
      <Tree
        className={styles.tree}
        selectedKeys={selectedKeys}
        onSelect={this.select}
        onDragEnter={this.dragEnter}
        onDrop={this.drop}
        defaultExpandAll
        draggable
        blockNode
      >
        {this.renderTreeNodes(renderTree)}
      </Tree>
    )
  }
}

export default ControlList
