import * as React from 'react'
import { fromJS, List, Map, Record } from 'immutable'
import * as classnames from 'classnames'

import { IFilterItem } from '.'
import { FilterTypesLocale } from './filterTypes'

const styles = require('./filter.less')

import { Icon, Tooltip, Tree } from 'antd'
const { TreeNode } = Tree

interface IFilterListProps {
  list: any[]
  selectedFilter: IFilterItem
  onSelectFilter: (id: string) => void
  onAddFilter: () => void
  onDeleteFilter: (id) => void
  onFiltersChange: (filters: IFilterItem[]) => void
}

interface IFilterListStates {
  selectedKeys: string[]
}

export class FilterList extends React.Component<IFilterListProps, IFilterListStates> {

  constructor (props) {
    super(props)
    this.state = {
      selectedKeys: []
    }
  }

  public componentWillMount () {
    this.setSelectedKeys(this.props.selectedFilter)
  }

  public componentWillReceiveProps (nextProps: IFilterListProps) {
    if (nextProps.selectedFilter !== this.props.selectedFilter) {
      this.setSelectedKeys(nextProps.selectedFilter)
    }
  }

  private setSelectedKeys = (selectedFilter: IFilterItem) => {
    this.setState({
      selectedKeys: selectedFilter ? [selectedFilter.key] : []
    })
  }

  private onAddFilterClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    const { onAddFilter } = this.props
    onAddFilter()
  }

  private onDeleteFilterClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    const { onDeleteFilter, selectedFilter } = this.props
    if (selectedFilter) {
      onDeleteFilter(selectedFilter.key)
    }
  }

  // private selectFilter = (e: React.MouseEvent<HTMLUListElement>) => {
  //   const { list, onSelectFilter } = this.props
  //   Array.prototype.slice.call(e.currentTarget.children).some((elem: HTMLElement, idx) => {
  //     if (elem.contains(e.target as HTMLElement)) {
  //       onSelectFilter(list[idx].key)
  //       return true
  //     }
  //   })
  // }

  private selectFilter = (selectedKeys: string[]) => {
    const { onSelectFilter } = this.props
    onSelectFilter(selectedKeys[0])
  }

  private renderFilter (item) {
    const { selectedFilter } = this.props
    const itemClass = classnames({
      [styles.selected]: selectedFilter ? selectedFilter.key === item.key : false
    })
    return (
      <li className={itemClass} key={item.key}>
        <Tooltip title={FilterTypesLocale[item.type]} placement="right">
          <Icon type="filter" />
        </Tooltip>
        <Tooltip title={item.name} mouseEnterDelay={0.8}>
          <label>{item.name}</label>
        </Tooltip>
      </li>
    )
  }

  private renderTreeNodeIcon = (treeNode) => {
    const { type } = treeNode.dataRef as IFilterItem
    return (
      <Tooltip title={FilterTypesLocale[type]}>
        <Icon type="filter" />
      </Tooltip>
    )
  }

  private dragEnter = (info) => {
    // console.log(info)
  }

  private drop = (info) => {
    const dropKey = info.node.props.eventKey
    const dragKey = info.dragNode.props.eventKey
    const dropPos = info.node.props.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

    const { list, onFiltersChange } = this.props

    const filters: IFilterItem[] = fromJS(list).toJS()
    let dragFilter: IFilterItem
    this.traverseFilter(filters, dragKey, (filter: IFilterItem, idx: number, arr: IFilterItem[]) => {
      arr.splice(idx, 1)
      dragFilter = filter
    })

    if (!info.dropToGap) {
      this.traverseFilter(filters, dropKey, (filter: IFilterItem) => {
        filter.children = filter.children || []
        filter.children.push(dragFilter)
      })
    } else if (
      (info.node.props.children || []).length > 0
      && info.node.props.expanded
      && dropPosition === 1
    ) {
      this.traverseFilter(filters, dropKey, (filter: IFilterItem) => {
        filter.children = filter.children || []
        filter.children.unshift(dragFilter)
      })
    } else {
      let partitionFilterChildren: IFilterItem[]
      let dropIdxInPartition: number
      this.traverseFilter(filters, dropKey, (_: IFilterItem, idx: number, arr: IFilterItem[]) => {
        partitionFilterChildren = arr
        dropIdxInPartition = idx
      })
      if (dropPosition === -1) {
        partitionFilterChildren.splice(dropIdxInPartition, 0, dragFilter)
      } else {
        partitionFilterChildren.splice(dropIdxInPartition + 1, 0, dragFilter)
      }
    }

    onFiltersChange(filters)
  }

  private traverseFilter = (
    filters: IFilterItem[],
    key: string,
    cb
  ) => {
    filters.forEach((filter, idx, arr) => {
      if (filter.key === key) {
        return cb(filter, idx, arr)
      }
      if (filter.children) {
        return this.traverseFilter(filter.children, key, cb)
      }
    })
  }

  private renderTreeNodes = (filters: IFilterItem[]) => filters.map((filter) => {
    const { key, name, children } = filter
    if (children) {
      return (
        <TreeNode title={name} key={key} dataRef={filter}>
          {this.renderTreeNodes(filter.children)}
        </TreeNode>
      )
    }
    return <TreeNode title={name} key={key} dataRef={filter} />
  })

  public render () {
    const { list } = this.props
    const { selectedKeys } = this.state
    return (
      <div className={styles.filterList}>
        <div className={styles.title}>
          <h2>筛选项列表</h2>
          <Icon type="plus" onClick={this.onAddFilterClick} />
          <Icon type="delete" onClick={this.onDeleteFilterClick} />
        </div>
        {/* <ul className={styles.list} onClick={this.selectFilter}>
          {list.map((item) => this.renderFilter(item))}
        </ul> */}
        <div className={styles.treeContainer}>
          <Tree
            className={styles.tree}
            selectedKeys={selectedKeys}
            onSelect={this.selectFilter}
            onDragEnter={this.dragEnter}
            onDrop={this.drop}
            draggable
            defaultExpandAll
          >
            {this.renderTreeNodes(list)}
          </Tree>
        </div>
      </div>
    )
  }
}

export default FilterList
