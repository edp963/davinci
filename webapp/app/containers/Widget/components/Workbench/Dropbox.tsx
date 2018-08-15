import * as React from 'react'
import * as classnames from 'classnames'
import { decodeMetricName } from '../util'

import DropboxItem from './DropboxItem'
const Icon = require('antd/lib/icon')
const styles = require('./Workbench.less')

export type DragType = 'category' | 'value'
export type DropboxType = DragType | 'all'
export type DropboxItemType = DragType | 'add'
export type ViewModelType = DragType | 'date' | 'geo'
export type DropboxSize = 'normal' | 'large'
export type DropType = 'outside' | 'inside' | 'unmoved'
export type SortType = 'asc' | 'desc'
export type AggregatorType = 'sum' | 'avg' | 'count' | 'distinct' | 'max' | 'min' | 'median' | 'var' | 'dev'

interface IDataColumn {
  name: string
  from?: string
  sort?: SortType
  agg?: AggregatorType
}

export interface IDataParamSource extends IDataColumn {
  type: DragType
  icon: ViewModelType
}

export interface IDataParamSourceInBox extends IDataColumn {
  type: DropboxItemType
  icon?: ViewModelType
}

interface IDropboxProps {
  name: string
  title: string
  placeholder: React.ReactNode
  size: DropboxSize
  type: DropboxType
  items: IDataParamSource[]
  dragged: IDataParamSource
  onItemDragStart: (name: string, type: DragType, icon: ViewModelType, agg: AggregatorType, sort: SortType, e: React.DragEvent<HTMLLIElement | HTMLParagraphElement>) => void
  onItemDragEnd: (dropType: DropType) => void
  onItemRemove: (name: string) => (e) => void
  onItemSort: (item: IDataParamSource) => (sort: SortType) => void
  onItemChangeAgg: (item: IDataParamSource) => (agg: AggregatorType) => void
  onDrop: (name: string, dropIndex: number, dropType: DropType, changedItems: IDataParamSource[]) => void
}

interface IDropboxStates {
  entering: boolean
  items: IDataParamSourceInBox[]
  dropIndex: number
  dropType: DropType
}

export class Dropbox extends React.PureComponent<IDropboxProps, IDropboxStates> {
  constructor (props) {
    super(props)
    this.state = {
      entering: false,
      items: [],
      dropIndex: -1,
      dropType: void 0
    }
  }

  private container: HTMLDivElement = null
  private width: number = 0
  private x: number = 0
  private y: number = 0
  private PADDING = 5
  private BOX_MIN_HEIGHT = 54
  private ITEM_HEIGHT = 28

  public componentWillMount () {
    this.getItems(this.props)
  }

  public componentWillReceiveProps (nextProps) {
    if (nextProps.items !== this.props.items) {
      this.getItems(nextProps)
    }
  }

  private getItems = (props) => {
    this.setState({
      items: [...props.items]
    })
  }

  private getBoxRect = () => {
    const rect = this.container.getBoundingClientRect() as DOMRect
    this.width = rect.width
    this.x = rect.x
    this.y = rect.y
  }

  private dragEnter = () => {
    this.getBoxRect()
    this.setState({
      dropIndex: 0,
      entering: true
    })
  }

  private dragOver = (e) => {
    e.preventDefault()
    const { items, dragged } = this.props
    if (!(dragged.type === 'category'
          && !dragged.from
          && items.find((i) => i.name === dragged.name))) {
      if (this.props.size === 'large') {
        const { clientX, clientY } = e
        const physicalDropIndex = this.calcPhysicalDropIndex(clientX, clientY)
        this.previewDropPosition(physicalDropIndex)
      } else {
        if (this.state.dropIndex === -1) {
          this.setState({
            dropIndex: 0
          })
        }
      }
    }
  }

  private dragLeave = () => {
    this.setState({
      items: this.state.items.filter((i) => i.type !== 'add'),
      entering: false,
      dropIndex: -1,
      dropType: void 0
    })
  }

  private drop = () => {
    const { name, items, dragged, onDrop } = this.props
    const { items: itemsState, dropIndex, dropType } = this.state

    if (dropIndex >= 0) {
      const alreadyHaveIndex = items.findIndex((i) => i.name === dragged.name)
      if (!(dragged.type === 'category'
            && alreadyHaveIndex >= 0
            && dragged.from !== name)) {
        onDrop(name, dropIndex, dropType, itemsState as IDataParamSource[])
      }
    }
    this.setState({
      entering: false,
      dropIndex: -1,
      dropType: dropType === 'outside'
        ? void 0
        : dropType === void 0
          ? 'unmoved'
          : dropType
    })
  }

  private itemDragEnd = () => {
    this.props.onItemDragEnd(this.state.dropType)
    this.setState({
      dropType: void 0
    })
  }

  private calcPhysicalDropIndex = (dragX, dragY): number => {
    const relX = dragX - this.x
    const relY = dragY - this.y
    const limitX = this.width - this.PADDING
    const limitY = Math.max(this.BOX_MIN_HEIGHT - this.PADDING, this.state.items.length * this.ITEM_HEIGHT + this.PADDING)

    if (relX > this.PADDING && relY > this.PADDING && relX < limitX && relY < limitY) {
      // const row = Math.floor((relX - this.PADDING) / this.ITEM_WIDTH)
      // const col = Math.floor((relY - this.PADDING) / this.ITEM_HEIGHT)
      // return col * 2 + row
      return Math.floor((relY - this.PADDING) / this.ITEM_HEIGHT)
    }
  }

  private previewDropPosition = (physicalDropIndex) => {
    const { items, dragged } = this.props
    const { items: itemsState } = this.state
    const draggedItemIndex = items.findIndex((i) => i.name === dragged.name)
    const draggedItemLocalIndex = itemsState.findIndex((is) => is.name === dragged.name)

    let itemLength = items.length

    if (draggedItemIndex >= 0) {
      itemLength -= 1
    }

    const realDropIndex = physicalDropIndex !== void 0
      ? Math.min(itemLength, physicalDropIndex)
      : itemLength

    if (draggedItemIndex < 0) {
      if (draggedItemLocalIndex < 0 || draggedItemLocalIndex !== realDropIndex) {
        this.setState({
          items: [
            ...items.slice(0, realDropIndex),
            {
              name: dragged.type === 'category' ? dragged.name : decodeMetricName(dragged.name),
              type: 'add'
            },
            ...items.slice(realDropIndex)
          ],
          dropIndex: realDropIndex,
          dropType: 'outside'
        })
      }
    } else {
      if (draggedItemLocalIndex !== realDropIndex) {
        const temp = itemsState.filter((i, index) => index !== draggedItemLocalIndex)
        temp.splice(realDropIndex, 0, dragged)
        this.setState({
          items: temp,
          dropIndex: realDropIndex,
          dropType: 'inside'
        })
      }
    }
  }

  public render () {
    const {
      title,
      placeholder,
      size,
      type,
      dragged,
      onItemDragStart,
      onItemSort,
      onItemChangeAgg,
      onItemRemove
    } = this.props

    const { entering, items } = this.state

    let shouldResponse = false
    let shouleEnter = false
    let dragType = ''

    if (dragged) {
      dragType = dragged.type
      if (type === 'all' || type === dragType) {
        shouldResponse = true
        shouleEnter = entering
      }
    }

    const containerClass = classnames({
      [styles.dropContainer]: true,
      [styles.large]: size === 'large',
      [styles.dragOver]: shouldResponse
    })

    const maskClass = classnames({
      [styles.mask]: true,
      [styles.onTop]: shouldResponse,
      [styles.enter]: shouleEnter,
      [styles.category]: dragType === 'category',
      [styles.value]: dragType === 'value'
    })

    const itemContent = items.length
      ? items.map((item) => (
        <DropboxItem
          key={item.name}
          text={item.name}
          type={item.type}
          icon={item.icon}
          sort={item.sort}
          agg={item.agg}
          onDragStart={onItemDragStart}
          onDragEnd={this.itemDragEnd}
          onSort={onItemSort(item as IDataParamSource)}
          onChangAgg={onItemChangeAgg(item as IDataParamSource)}
          onRemove={onItemRemove(item.name)}
        />
      ))
      : (
        <p className={styles.placeholder}>
          <Icon type="arrow-right" />
          {placeholder}
        </p>
      )

    return (
      <div className={styles.dropbox}>
        <p className={styles.title}>{title}</p>
        <div
          className={containerClass}
          ref={(f) => this.container = f}
        >
          {itemContent}
          <div
            className={maskClass}
            onDragEnter={this.dragEnter}
            onDragOver={this.dragOver}
            onDragLeave={this.dragLeave}
            onDrop={this.drop}
          />
        </div>
      </div>
    )
  }
}

export default Dropbox
