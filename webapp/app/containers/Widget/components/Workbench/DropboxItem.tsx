import * as React from 'react'
import * as classnames from 'classnames'
import { SortType, AggregatorType, IDataParamSource, IDataParamSourceInBox } from './Dropbox'
import ChartSelector from './ChartSelector'
import { getAggregatorLocale, decodeMetricName } from '../util'
import { IChartInfo } from '../Pivot/Chart'

const Icon = require('antd/lib/icon')
const Menu = require('antd/lib/menu')
const { Item: MenuItem, SubMenu, Divider: MenuDivider } = Menu
const Dropdown = require('antd/lib/dropdown')
const styles = require('./Workbench.less')

interface IDropboxItemProps {
  container: string
  item: IDataParamSourceInBox
  dimetionsCount: number
  metricsCount: number
  onDragStart: (item: IDataParamSource, e: React.DragEvent<HTMLLIElement | HTMLParagraphElement>) => void
  onDragEnd: () => void
  onSort: (item: IDataParamSource, sort: SortType) => void
  onChangAgg: (item: IDataParamSource, agg: AggregatorType) => void
  onChangeColorConfig: (item: IDataParamSource) => void
  onChangeChart: (item: IDataParamSource) => (chart: IChartInfo) => void
  onRemove: (e) => void
}

interface IDropdownItem {
  subs?: IDropdownItem[]
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

  private categoryDropdownList = this.props.container === 'color'
    ? [{
      color: '配置颜色'
    }, {
      sort: {
        name: '排序',
        subs: [{
          default: '默认顺序',
          asc: '升序',
          desc: '降序'
        }]
      }
    }]
    : [{
      default: '默认顺序',
      asc: '升序',
      desc: '降序'
    }]

  private valueDropdownList = [{
    sum: getAggregatorLocale('sum'),
    avg: getAggregatorLocale('avg'),
    count: getAggregatorLocale('count'),
    distinct: getAggregatorLocale('distinct'),
    max: getAggregatorLocale('max'),
    min: getAggregatorLocale('min')
  }, {
    sort: {
      name: '排序',
      subs: [{
        default: '默认顺序',
        asc: '升序',
        desc: '降序'
      }]
    }
  }]

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

  private getDropdownList = (source: IDropdownItem[]) => {
    return source.reduce((menuItems, group, index) => {
      menuItems = menuItems.concat(Object.entries(group).map(([k, v]) => {
        if (v.subs) {
          const subItems = this.getDropdownList(v.subs)
          return (<SubMenu key={k} title={v.name}>{subItems}</SubMenu>)
        } else {
          return (<MenuItem key={k}>{v}</MenuItem>)
        }
      }))
      if (index !== source.length - 1) {
        menuItems = menuItems.concat(<MenuDivider key={index} />)
      }
      return menuItems
    }, [])
  }

  private dropdownMenuClick = ({key}) => {
    const { item, onSort, onChangAgg, onChangeColorConfig } = this.props
    if (['default', 'asc', 'desc'].indexOf(key) >= 0) {
      onSort(item as IDataParamSource, key)
    } else if (key === 'color') {
      onChangeColorConfig(item as IDataParamSource)
    } else {
      onChangAgg(item as IDataParamSource, key)
    }
  }

  public render () {
    const { container, item, dimetionsCount, metricsCount, onChangeChart, onRemove } = this.props
    const { name: originalName, type, sort, agg } = item
    const { dragging } = this.state

    const name = type === 'value' ? decodeMetricName(originalName) : originalName

    let chartSelector
    if (container === 'metrics' && item.type !== 'add') {
      chartSelector = (
        <ChartSelector
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
      'icon-sortascending': sort === 'asc',
      'icon-sortdescending': sort === 'desc'
    })

    const content = (
      <p>
        <Icon type="down" />
        {agg ? ` [${getAggregatorLocale(agg)}] ${name} ` : ` ${name} `}
        {sort && <i className={sortClass} />}
      </p>
    )

    let contentWithDropdownList
    if (type === 'add') {
      contentWithDropdownList = content
    } else {
      let dropdownListSource
      let menuClass = ''
      switch (type) {
        case 'category':
          dropdownListSource = this.categoryDropdownList
          break
        case 'value':
          dropdownListSource = this.valueDropdownList
          menuClass = styles.valueDropDown
          break
      }
      contentWithDropdownList = (
        <Dropdown
          overlay={(
            <Menu className={menuClass} onClick={this.dropdownMenuClick}>
              {this.getDropdownList(dropdownListSource)}
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
          {chartSelector}
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
