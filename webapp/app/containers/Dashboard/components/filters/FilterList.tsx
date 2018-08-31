import * as React from 'react'
import * as classnames from 'classnames'

import { FilterTypesLocale } from './filterTypes'

const styles = require('./filter.less')

const Icon = require('antd/lib/icon')
const Tooltip = require('antd/lib/tooltip')

interface IFilterListProps {
  list: any[]
  selectedFilterKey: string
  onSelectFilter: (id: string) => void
  onAddFilter: () => void
  onDeleteFilter: (id) => void
}

export class FilterList extends React.Component<IFilterListProps, {}> {

  constructor (props) {
    super(props)
  }

  public componentWillMount () {
    const { selectedFilterKey, onSelectFilter } = this.props
    if (selectedFilterKey) {
      onSelectFilter(selectedFilterKey)
    }
  }

  public componentWillReceiveProps (nextProps: IFilterListProps) {
    const { selectedFilterKey, onSelectFilter } = nextProps
    if (selectedFilterKey !== this.props.selectedFilterKey) {
      onSelectFilter(selectedFilterKey)
    }
  }

  private onAddFilterClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    const { onAddFilter } = this.props
    onAddFilter()
  }

  private onDeleteFilterClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    const { onDeleteFilter, selectedFilterKey } = this.props
    if (!selectedFilterKey) { return }
    onDeleteFilter(selectedFilterKey)
  }

  private onSelectFilter = (e: React.MouseEvent<HTMLUListElement>) => {
    const { list, onSelectFilter } = this.props
    Array.prototype.slice.call(e.currentTarget.children).some((elem: HTMLElement, idx) => {
      if (elem.contains(e.target as HTMLElement)) {
        onSelectFilter(list[idx].key)
        return true
      }
    })
  }

  private renderFilter (item) {
    const { selectedFilterKey } = this.props
    const itemClass = classnames({
      [styles.selected]: selectedFilterKey === item.key
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

  public render () {
    const { list } = this.props
    return (
      <div className={styles.filterList}>
        <div className={styles.title}>
          <h2>全局筛选列表</h2>
          <ul className={styles.cmds}>
            <li onClick={this.onAddFilterClick}><Icon type="plus" /></li>
            <li onClick={this.onDeleteFilterClick}><Icon type="delete" /></li>
          </ul>
        </div>
        <ul className={styles.list} onClick={this.onSelectFilter}>
          {list.map((item) => this.renderFilter(item))}
        </ul>
      </div>
    )
  }
}

export default FilterList
