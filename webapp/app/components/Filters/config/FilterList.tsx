import React, { Component } from 'react'
import { fromJS } from 'immutable'

import {
  IGlobalControl,
  ILocalControl,
  IControlBase,
  IRenderTreeItem
} from '../types'
import {
  getControlRenderTree,
  getAllChildren
} from '../util'
import FilterListItem from './FilterListItem'

const styles = require('../filter.less')

import { Icon, Tree } from 'antd'
const { TreeNode } = Tree

interface IFilterListProps {
  list: IGlobalControl[] | ILocalControl[]
  selectedFilter: IControlBase
  onSelectFilter: (key: string) => void
  onAddFilter: () => void
  onDeleteFilter: (keys: string[], selectKey: string) => void
  onNameChange: (key: string) => (name: string) => void
  onParentChange: (key: string, parentKey: string, type: string, dropNextKey?: string) => void
}

interface IFilterListStates {
  renderTree: IRenderTreeItem[]
  flatTree: {
    [key: string]: IRenderTreeItem
  }
  selectedKeys: string[]
}

class FilterList extends Component<IFilterListProps, IFilterListStates> {
  constructor (props) {
    super(props)
    this.state = {
      renderTree: [],
      flatTree: {},
      selectedKeys: []
    }
  }

  public componentWillMount () {
    const { list, selectedFilter } = this.props
    this.getRenderTree(list)
    this.getSelectedKeys(selectedFilter)
  }

  public componentWillReceiveProps (nextProps: IFilterListProps) {
    const { list, selectedFilter } = nextProps
    if (list !== this.props.list) {
      this.getRenderTree(list)
    }
    if (selectedFilter !== this.props.selectedFilter) {
      this.getSelectedKeys(selectedFilter)
    }
  }

  private getRenderTree = (list: IGlobalControl[] | ILocalControl[]) => {
    const replica = fromJS(list).toJS()
    this.setState(getControlRenderTree<IControlBase, typeof replica>(replica))
  }

  private getSelectedKeys = (selectedFilter: IControlBase) => {
    this.setState({
      selectedKeys: selectedFilter ? [selectedFilter.key] : []
    })
  }

  private onAddFilterClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    const { onAddFilter } = this.props
    onAddFilter()
  }

  private deleteFilter = (key: string) => (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    const { selectedFilter } = this.props
    const { renderTree, flatTree } = this.state
    const delKeys = [key].concat(getAllChildren(key, flatTree))
    let selectedKey

    if (selectedFilter.key === key) {
      if (selectedFilter.parent) {
        const parentTree = flatTree[selectedFilter.parent]
        if (parentTree.children.length === 1) {
          selectedKey = parentTree.key
        } else {
          const delIndex = parentTree.children.findIndex((c) => c.key === key)
          selectedKey = delIndex ? parentTree.children[delIndex - 1] :  parentTree.children[delIndex + 1]
        }
      } else {
        if (renderTree.length !== 1) {
          const delIndex = renderTree.findIndex((n) => n.key === key)
          selectedKey = delIndex ? renderTree[delIndex - 1].key :  renderTree[delIndex + 1].key
        }
      }
    } else {
      selectedKey = selectedFilter.key
    }

    this.props.onDeleteFilter(delKeys, selectedKey)
  }

  private selectFilter = (selectedKeys: string[]) => {
    if (selectedKeys.length) {
      this.props.onSelectFilter(selectedKeys[0])
    }
  }

  private dragEnter = (info) => {
    // console.log(info)
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
      (info.node.props.children || []).length > 0
      && info.node.props.expanded
      && dropPosition === 1
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
        <FilterListItem
          title={name}
          onNameChange={this.props.onNameChange(key)}
          onDelete={this.deleteFilter(key)}
        />
      )
      if (children) {
        return (
          <TreeNode title={title} key={key} dataRef={node}>
            {this.renderTreeNodes(node.children)}
          </TreeNode>
        )
      }
      return (
        <TreeNode
          title={title}
          key={key}
          dataRef={node}
        />
      )
    })

  public render () {
    const { renderTree, selectedKeys } = this.state
    return (
      <div className={styles.filterList}>
        <div className={styles.title}>
          <h2>控制器列表</h2>
          <Icon type="plus" onClick={this.onAddFilterClick} />
        </div>
        <div className={styles.treeContainer}>
          <Tree
            className={styles.tree}
            selectedKeys={selectedKeys}
            onSelect={this.selectFilter}
            onDragEnter={this.dragEnter}
            onDrop={this.drop}
            defaultExpandAll
            draggable
            blockNode
          >
            {this.renderTreeNodes(renderTree)}
          </Tree>
        </div>
      </div>
    )
  }
}

export default FilterList
