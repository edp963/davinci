import React from 'react'
import classnames from 'classnames'
import { ViewModelVisualTypes } from 'containers/View/constants'

import DropboxItem from './DropboxItem'
import DropboxContent from './DropboxContent'
import ColorPanel from '../ColorPanel'
import SizePanel from '../SizePanel'
import { IChartInfo, WidgetMode } from '../../Widget'
import { IFieldConfig } from '../../Config/Field'
import { IFieldFormatConfig } from '../../Config/Format'
import { IFieldSortConfig, FieldSortTypes } from '../../Config/Sort'
import { decodeMetricName } from '../../util'
import { Popover, Icon } from 'antd'
import { IFilters } from 'app/components/Filters/types'

const styles = require('../Workbench.less')

export type DragType = 'category' | 'value'
export type DropboxType = DragType | 'all'
export type DropboxItemType = DragType | 'add'
export type DropType = 'outside' | 'inside' | 'unmoved'
export type AggregatorType = 'sum' | 'avg' | 'count' | 'COUNTDISTINCT' | 'max' | 'min' | 'median' | 'var' | 'dev'

interface IDataColumn {
  name: string
  from?: string
  sort?: IFieldSortConfig
  agg?: AggregatorType
  field?: IFieldConfig
  format?: IFieldFormatConfig
}

export interface IDataParamSource extends IDataColumn {
  type: DragType
  visualType: ViewModelVisualTypes
  title?: string
  chart?: IChartInfo
  config?: IDataParamConfig
}

export interface IDragItem extends IDataParamSource {
  checked?: boolean
}

export interface IDataParamConfig {
  actOn?: string
  values?: {
    [key: string]: string
  },
  sql?: string
  sqlModel?: IFilters[]
  filterSource?: any
  field?: {
    alias: string,
    desc: string
  }
}

export interface IDataParamSourceInBox extends IDataColumn {
  type: DropboxItemType
  visualType?: ViewModelVisualTypes
  chart?: IChartInfo
  config?: IDataParamConfig
}

interface IDropboxProps {
  name: string
  title: string
  type: DropboxType
  value: object
  items: IDataParamSource[]
  mode: WidgetMode
  selectedChartId: number
  dragged: IDataParamSource
  panelList: IDataParamSource[]
  dimetionsCount: number
  metricsCount: number
  onValueChange: (key: string, value: string) => void
  onItemDragStart: (item: IDataParamSource, e: React.DragEvent<HTMLLIElement | HTMLParagraphElement>) => void
  onItemDragEnd: (dropType: DropType) => void
  onItemRemove: (name: string) => (e) => void
  onItemSort: (item: IDataParamSource, sort: FieldSortTypes) => void
  onItemChangeAgg: (item: IDataParamSource, agg: AggregatorType) => void
  onItemChangeColorConfig: (item: IDataParamSource) => void
  onItemChangeFilterConfig: (item: IDataParamSource) => void
  onItemChangeFieldConfig: (item: IDataParamSource) => void
  onItemChangeFormatConfig: (item: IDataParamSource) => void
  onItemChangeChart: (item: IDataParamSource) => (chart: IChartInfo) => void
  beforeDrop: (name: string, cachedItem: IDataParamSource, resolve: (next: boolean) => void) => void
  onDrop: (name: string, dropIndex: number, dropType: DropType, changedItems: IDataParamSource[], config?: IDataParamConfig) => void
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
      // if (this.props.size === 'large') {
      const { clientX, clientY } = e
      const physicalDropIndex = this.calcPhysicalDropIndex(clientX, clientY)
      this.previewDropPosition(physicalDropIndex)
      // } else {
      //   if (this.state.dropIndex === -1) {
      //     this.setState({
      //       dropIndex: 0
      //     })
      //   }
      // }
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
    const { name, items, dragged, beforeDrop, onDrop } = this.props
    const { items: itemsState, dropIndex, dropType } = this.state

    if (dropIndex >= 0) {
      const alreadyHaveIndex = items.findIndex((i) => i.name === dragged.name)
      if (!(dragged.type === 'category' && alreadyHaveIndex >= 0 && dragged.from !== name)) {
        beforeDrop(name, dragged, (data: boolean | IDataParamConfig) => {
          if (data) {
            onDrop(name, dropIndex, dropType, itemsState as IDataParamSource[], data as IDataParamConfig)
          } else {
            this.dragLeave()
          }
        })
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
      name,
      title,
      type,
      value,
      panelList,
      mode,
      selectedChartId,
      dragged,
      dimetionsCount,
      metricsCount,
      onValueChange,
      onItemDragStart,
      onItemSort,
      onItemChangeAgg,
      onItemChangeColorConfig,
      onItemChangeFilterConfig,
      onItemChangeFieldConfig,
      onItemChangeFormatConfig,
      onItemChangeChart,
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
      [styles.dragOver]: shouldResponse
    })

    const maskClass = classnames({
      [styles.mask]: true,
      [styles.onTop]: shouldResponse,
      [styles.enter]: shouleEnter,
      [styles.category]: dragType === 'category',
      [styles.value]: dragType === 'value'
    })

    let setting
    if (['color', 'size'].includes(name)) {
      let panel
      switch (name) {
        case 'color':
          panel = (
            <ColorPanel
              list={panelList}
              value={value}
              showAll={mode === 'pivot'}
              onValueChange={onValueChange}
            />
          )
          break
        case 'size':
          panel = (
            <SizePanel
              list={panelList}
              value={value}
              hasTabs={mode === 'pivot'}
              onValueChange={onValueChange}
            />
          )
          break
      }
      setting = (
        <Popover
          content={panel}
          trigger="click"
          placement="right"
        >
          <span className={styles.setting}>
            <Icon type="setting" /> 设置
          </span>
        </Popover>
      )
    }

    const itemContent = items.length
      ? items.map((item) => (
        <DropboxItem
          key={item.name}
          container={name}
          item={item}
          dimetionsCount={dimetionsCount}
          metricsCount={metricsCount}
          onDragStart={onItemDragStart}
          onDragEnd={this.itemDragEnd}
          onSort={onItemSort}
          onChangeAgg={onItemChangeAgg}
          onChangeFieldConfig={onItemChangeFieldConfig}
          onChangeFormatConfig={onItemChangeFormatConfig}
          onChangeColorConfig={onItemChangeColorConfig}
          onChangeFilterConfig={onItemChangeFilterConfig}
          onChangeChart={onItemChangeChart}
          onRemove={onItemRemove(item.name)}
        />
      ))
      : (
        <DropboxContent
          title={title}
          type={type}
        />
      )

    return (
      <div className={styles.dropbox}>
        <p className={styles.title}>
          {title}
          {setting}
        </p>
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
