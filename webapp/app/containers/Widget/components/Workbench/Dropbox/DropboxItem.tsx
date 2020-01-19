import * as React from 'react'
import * as classnames from 'classnames'
import { AggregatorType, IDataParamSource, IDataParamSourceInBox } from '../Dropbox'
import PivotChartSelector from '../PivotChartSelector'
import { getFieldAlias } from '../../Config/Field'
import { FieldSortTypes } from '../../Config/Sort'
import { getAggregatorLocale, decodeMetricName } from '../../util'
import { IChartInfo } from '../../Widget'
import { getAvailableSettings, getSettingsDropdownList, getSettingKeyByDropItem, MapSettingTypes, MapItemTypes, MapItemValueTypes } from './settings'

import { Icon, Menu, Dropdown, Tooltip } from 'antd'
const { Item: MenuItem, SubMenu, Divider: MenuDivider } = Menu
const styles = require('../Workbench.less')

interface IDropboxItemProps {
  container: string
  item: IDataParamSourceInBox
  dimetionsCount: number
  metricsCount: number
  onDragStart: (item: IDataParamSource, e: React.DragEvent<HTMLLIElement | HTMLParagraphElement>) => void
  onDragEnd: () => void
  onSort: (item: IDataParamSource, sort: FieldSortTypes) => void
  onChangeAgg: (item: IDataParamSource, agg: AggregatorType) => void
  onChangeFieldConfig: (item: IDataParamSource) => void
  onChangeFormatConfig: (item: IDataParamSource) => void
  onChangeColorConfig: (item: IDataParamSource) => void
  onChangeFilterConfig: (item: IDataParamSource) => void
  onChangeChart: (item: IDataParamSource) => (chart: IChartInfo) => void
  onRemove: (e) => void
}

interface IDropboxItemStates {
  dragging: boolean
}

export class DropboxItem extends React.PureComponent<IDropboxItemProps, IDropboxItemStates> {
  constructor (props) {
    super(props)
    this.state = {
      dragging: false
    }
  }

  private dragStart = (e) => {
    const { item, onDragStart } = this.props
    // hack firefox trigger dragEnd
    e.persist()
    if (item.type !== 'add') {
      this.setState({
        dragging: true
      }, () => {
        onDragStart(item as IDataParamSource, e)
      })
      setTimeout(() => {
        e.target.classList.add(styles.dragged)
      })
    }
  }

  private dragEnd = () => {
    this.props.onDragEnd()
    this.setState({
      dragging: false
    })
  }

  private dropdownMenuClick = ({ key }: { key: string }) => {
    const {
      item,
      onChangeAgg,
      onChangeFieldConfig,
      onChangeFormatConfig,
      onSort,
      onChangeColorConfig,
      onChangeFilterConfig } = this.props
    const settingKey = getSettingKeyByDropItem(key)

    switch (settingKey) {
      case 'aggregator':
        onChangeAgg(item as IDataParamSource, key as AggregatorType)
        break
      case 'color':
        onChangeColorConfig(item as IDataParamSource)
        break
      case 'field':
        onChangeFieldConfig(item as IDataParamSource)
        break
      case 'filters':
        onChangeFilterConfig(item as IDataParamSource)
        break
      case 'format':
        onChangeFormatConfig(item as IDataParamSource)
        break
      case 'sort':
        onSort(item as IDataParamSource, key as FieldSortTypes)
        break
    }
  }

  public render () {
    const { container, item, dimetionsCount, metricsCount, onChangeChart, onRemove } = this.props
    const { name: originalName, type, sort, agg, field } = item
    const { dragging } = this.state

    const name = type === 'value' ? decodeMetricName(originalName) : originalName

    let pivotChartSelector
    if (container === 'metrics' && item.type !== 'add') {
      pivotChartSelector = (
        <PivotChartSelector
          chart={item.chart}
          dimetionsCount={dimetionsCount}
          metricsCount={metricsCount}
          onChangeChart={onChangeChart(item as IDataParamSource)}
        />
      )
    }

    const itemClass = classnames({
      [styles.dropItemContent]: true,
      [styles.category]: type === 'category',
      [styles.value]: type === 'value',
      [styles.add]: type === 'add',
      [styles.dragging]: dragging
    })
    const sortClass = classnames({
      'iconfont': true,
      [styles.sort]: true,
      'icon-sortascending': sort && sort.sortType === FieldSortTypes.Asc,
      'icon-sortdescending': sort && sort.sortType === FieldSortTypes.Desc
    })

    const desc = field ? field.desc : ''
    const aliasText = getFieldAlias(field, {})
    const content = (
      <p>
        <Icon type="down" />
        {agg ? ` [${getAggregatorLocale(agg)}] ${name} ` : ` ${name} `}
        {aliasText && (
          <Tooltip title={desc} placement="right">
            {`[${aliasText}]`}
          </Tooltip>
        )}
        {sort && <i className={sortClass} />}
      </p>
    )

    let contentWithDropdownList
    if (type === 'add') {
      contentWithDropdownList = content
    } else {
      const availableSettings =  getAvailableSettings(MapSettingTypes[container], MapItemTypes[item.type], MapItemValueTypes[item.visualType])
      const dropdownList = getSettingsDropdownList(availableSettings)
      let menuClass = ''
      if (type === 'value') {
        menuClass = styles.valueDropDown
      }
      contentWithDropdownList = (
        <Dropdown
          overlay={(
            <Menu className={menuClass} onClick={this.dropdownMenuClick}>
              {dropdownList}
            </Menu>
          )}
          trigger={['click']}
        >
          {content}
        </Dropdown>
      )
    }

    return (
      <div className={styles.dropItem}>
        <div
          className={itemClass}
          onDragStart={this.dragStart}
          onDragEnd={this.dragEnd}
          draggable
        >
          {pivotChartSelector}
          {contentWithDropdownList}
          <Icon
            type="close-square-o"
            className={styles.remove}
            onClick={onRemove}
          />
        </div>
      </div>
    )
  }
}

export default DropboxItem
