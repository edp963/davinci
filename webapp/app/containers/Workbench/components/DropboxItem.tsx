import * as React from 'react'
import * as classnames from 'classnames'
import { DragType, DropboxItemType, ViewModelType, SortType, AggregatorType } from './Dropbox'
import { getAggregatorLocale, decodeMetricName } from './util'

const Icon = require('antd/lib/icon')
const Menu = require('antd/lib/menu')
const { Item: MenuItem, SubMenu, Divider: MenuDivider } = Menu
const Dropdown = require('antd/lib/dropdown')
const styles = require('../Workbench.less')

interface IDropboxItemProps {
  text: string
  type: DropboxItemType
  sort: SortType
  icon: ViewModelType
  agg: AggregatorType
  onDragStart: (name: string, type: DragType, icon: ViewModelType, agg: AggregatorType, sort: SortType, e: React.DragEvent<HTMLLIElement | HTMLParagraphElement>) => void
  onDragEnd: () => void
  onSort: (sort: SortType) => void
  onChangAgg: (agg: AggregatorType) => void
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

  private categoryDropdownList = [{
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
    const { text, type, icon, sort, agg, onDragStart } = this.props
    // hack firefox trigger dragEnd
    e.persist()
    if (type !== 'add') {
      this.setState({
        dragging: true
      }, () => {
        onDragStart(text, type, icon, agg, sort, e)
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
    const { onSort, onChangAgg } = this.props
    if (['default', 'asc', 'desc'].indexOf(key) >= 0) {
      onSort(key)
    } else {
      onChangAgg(key)
    }
  }

  public render () {
    const { text: originalText, type, sort, agg, onRemove } = this.props
    const { dragging } = this.state

    const text = type === 'value' ? decodeMetricName(originalText) : originalText

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
      <p
        className={itemClass}
        onDragStart={this.dragStart}
        onDragEnd={this.dragEnd}
        draggable
      >
        <Icon type="down" />
        {agg ? ` [${getAggregatorLocale(agg)}] ${text} ` : ` ${text} `}
        {sort && <i className={sortClass} />}
        <Icon
          type="close-square-o"
          className={styles.remove}
          onClick={onRemove}
        />
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
        {contentWithDropdownList}
      </div>
    )
  }
}

export default DropboxItem
