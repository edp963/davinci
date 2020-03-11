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

import React from 'react'
import { findDOMNode } from 'react-dom'
import classnames from 'classnames'
import { IChartProps } from '../'
import { IChartStyles, IPaginationParams } from '../../Widget'
import { ITableHeaderConfig } from 'containers/Widget/components/Config/Table'

import { ResizeCallbackData } from 'libs/react-resizable'
import { Table as AntTable, Tooltip, Icon } from 'antd'
import { TableProps, ColumnProps, SorterResult } from 'antd/lib/table'
import { PaginationConfig } from 'antd/lib/pagination/Pagination'
import PaginationWithoutTotal from 'components/PaginationWithoutTotal'
import SearchFilterDropdown from 'components/SearchFilterDropdown/index'
import NumberFilterDropdown from 'components/NumberFilterDropdown/index'
import DateFilterDropdown from 'components/DateFilterDropdown/index'
import {ViewModelTypes} from 'containers/View/constants'
import { TABLE_PAGE_SIZES } from 'app/globalConstants'
import { getFieldAlias } from 'containers/Widget/components/Config/Field'
import { decodeMetricName } from 'containers/Widget/components/util'
import Styles from './Table.less'
import { hasProperty } from 'components/DataDrill/util'
import {
  findChildConfig, traverseConfig,
  computeCellWidth, getDataColumnWidth, getMergedCellSpan, getTableCellValueRange } from './util'
import { MapAntSortOrder } from './constants'
import { FieldSortTypes } from '../../Config/Sort'
import { tableComponents } from './components'
import { resizeTableColumns } from './components/HeadCell'

interface IMapTableHeaderConfig {
  [key: string]: ITableHeaderConfig
}
interface TSelectItemCellProps {
  index: number
  value: string
  key: string
}
type ISelectItemsCell = {[propName: string] : Array<TSelectItemCellProps>}
type ISelectItems =  {
  group: string[]
  cell: ISelectItemsCell
}


interface ITableStates {
  chartStyles: IChartStyles
  data: object[]
  width: number
  pagination: IPaginationParams
  currentSorter: { column: string, direction: FieldSortTypes }

  tableColumns: Array<ColumnProps<any>>
  mapTableHeaderConfig: IMapTableHeaderConfig
  containerWidthRatio: number
  tablePagination: {
    current: number
    pageSize: number
    simple: boolean
    total: number
  }
  selectedRow: object[]
  tableBodyHeight: number
  selectItems: ISelectItems
}

export class Table extends React.PureComponent<IChartProps, ITableStates> {

  private static HeaderSorterWidth = 0

  public state: Readonly<ITableStates> = {
    chartStyles: null,
    data: null,
    width: 0,
    pagination: null,
    currentSorter: null,

    tableColumns: [],
    mapTableHeaderConfig: {},
    containerWidthRatio: 1,
    tablePagination: {
      current: void 0,
      pageSize: void 0,
      simple: false,
      total: void 0
    },
    tableBodyHeight: 0,
    selectedRow: [],
    selectItems: {
      group: [],
      cell: {}
    }
  }

  private table = React.createRef<AntTable<any>>()

  private handleResize = (idx: number, containerWidthRatio: number) => (_, { size }: ResizeCallbackData) => {
    const nextColumns = resizeTableColumns(this.state.tableColumns, idx, size.width, containerWidthRatio)
    this.setState({ tableColumns: nextColumns })
  }

  private paginationChange = (current: number, pageSize: number) => {
    const { currentSorter } = this.state
    this.refreshTable(current, pageSize, currentSorter)
  }

  private tableChange = (pagination: PaginationConfig, _, sorter: SorterResult<object>) => {
    const nextCurrentSorter: ITableStates['currentSorter'] = sorter.field
      ? { column: sorter.field, direction: MapAntSortOrder[sorter.order] }
      : null
    this.setState({ currentSorter: nextCurrentSorter })
    const { current, pageSize } = pagination
    this.refreshTable(current, pageSize, nextCurrentSorter)
  }

  private refreshTable = (current: number, pageSize: number, sorter?: ITableStates['currentSorter']) => {
    const { tablePagination } = this.state
    if (pageSize !== tablePagination.pageSize) {
      current = 1
    }
    const { onPaginationChange } = this.props
    onPaginationChange(current, pageSize, sorter)
  }

  private basePagination: PaginationConfig = {
    pageSizeOptions: TABLE_PAGE_SIZES.map((s) => s.toString()),
    showQuickJumper: true,
    showSizeChanger: true,
    showTotal: (total: number) => `共${total}条`,
    onChange: this.paginationChange,
    onShowSizeChange: this.paginationChange
  }

  public componentDidMount () {
    const { headerFixed, withPaging } = this.props.chartStyles.table
    this.adjustTableCell(headerFixed, withPaging)
  }

  public componentDidUpdate () {
    const { headerFixed, withPaging } = this.props.chartStyles.table
    this.adjustTableCell(headerFixed, withPaging, this.state.tablePagination.total)
  }

  private adjustTableCell (headerFixed: boolean, withPaging: boolean, dataTotal?: number) {
    const tableDom = findDOMNode(this.table.current) as Element
    const excludeElems = []
    let paginationMargin = 0
    let paginationWithoutTotalHeight = 0
    if (headerFixed) {
      excludeElems.push('.ant-table-thead')
    }
    if (withPaging) {
      excludeElems.push('.ant-pagination.ant-table-pagination')
      paginationMargin = 32

      if (dataTotal === -1) {
        paginationWithoutTotalHeight = 45
      }
    }
    const excludeElemsHeight = excludeElems.reduce((acc, exp) => {
      const elem = tableDom.querySelector(exp)
      return acc + (elem ? elem.getBoundingClientRect().height : 0)
    }, paginationMargin)
    const tableBodyHeight = this.props.height - excludeElemsHeight - paginationWithoutTotalHeight
    this.setState({
      tableBodyHeight
    })
  }

  public static getDerivedStateFromProps (nextProps: IChartProps, prevState: ITableStates) {
    const { chartStyles, data, width } = nextProps
    if (chartStyles !== prevState.chartStyles
      || data !== prevState.data
      || width !== prevState.width
    ) {
      const { tableColumns, mapTableHeaderConfig, containerWidthRatio } = getTableColumns(nextProps)
      const tablePagination = getPaginationOptions(nextProps)
      return { tableColumns, mapTableHeaderConfig, containerWidthRatio, tablePagination, chartStyles, data, width }
    }

    return { chartStyles, data, width }
  }

  private adjustTableColumns (
    tableColumns: Array<ColumnProps<any>>,
    mapTableHeaderConfig: IMapTableHeaderConfig,
    containerWidthRatio: number
  ) {
    traverseConfig<ColumnProps<any>>(tableColumns, 'children', (column, idx, siblings) => {
      const canResize = siblings === tableColumns
      column.onHeaderCell = (col) => ({
        width: col.width,
        onResize: canResize && this.handleResize(idx, containerWidthRatio),
        config: mapTableHeaderConfig[column.key]
      })
    })
    return tableColumns
  }

  private getRowKey = (record: object, idx: number) => {
    return Object.values(record).join('_' + idx)
  }

  private getTableScroll (
    columns: Array<ColumnProps<any>>,
    containerWidth: number,
    headerFixed: boolean,
    tableBodyHeght: number
  ) {
    const scroll: TableProps<any>['scroll'] = {}
    const columnsTotalWidth = columns.reduce((acc, c) => acc + (c.width as number), 0)
    if (columnsTotalWidth > containerWidth) {
      scroll.x = Math.max(columnsTotalWidth, containerWidth)
    }
    if (headerFixed) {
      scroll.y = tableBodyHeght
    }
    return scroll
  }

  private isSameObj (
    prevObj: object,
    nextObj: object,
    isSourceData?: boolean
  ): boolean {
    let isb = void 0
    const clonePrevObj = {...prevObj}
    const cloneNextObj = {...nextObj}
    if (isSourceData === true) {
      delete clonePrevObj['key']
      delete clonePrevObj['value']
      delete cloneNextObj['key']
      delete cloneNextObj['value']
    }
    for (const attr in clonePrevObj) {
      if (clonePrevObj[attr] !== undefined && clonePrevObj[attr] === cloneNextObj[attr]) {
        isb = true
      } else {
        isb = false
        break
      }
    }
    return isb
  }

  private matchAttrInBrackets(attr: string) {
    const re = /\(\S+\)/
    const key = re.test(attr) ? attr.match(/\((\S+)\)/)[1] : attr
    return key
  }

  private rowClick = (record, row, event) => {
    const { getDataDrillDetail, onCheckTableInteract, onDoInteract } = this.props
    let selectedRow = [...this.state.selectedRow]
    let filterObj = void 0
    if (event.target && event.target.innerHTML) {
      for (const attr in record) {
        if (record[attr].toString() === event.target.innerText) {
          const key = this.matchAttrInBrackets(attr)
          filterObj = {
            key,
            value: event.target.innerText
          }
        }
      }
    }
    const recordConcatFilter = {
      ...record,
      ...filterObj
    }
    const isInteractiveChart = onCheckTableInteract && onCheckTableInteract()
    if (isInteractiveChart && onDoInteract) {
      selectedRow = [recordConcatFilter]
    } else {
      if (selectedRow.length === 0) {
        selectedRow.push(recordConcatFilter)
      } else {
        const isb = selectedRow.some((sr) => this.isSameObj(sr, recordConcatFilter, true))
        if (isb) {
          for (let index = 0, l = selectedRow.length; index < l; index++) {
              if (this.isSameObj(selectedRow[index], recordConcatFilter, true)) {
                selectedRow.splice(index, 1)
                break
              }
          }
        } else  {
          selectedRow.push(recordConcatFilter)
        }
      }
    }

    this.setState({
      selectedRow
    }, () => {
      const sourceData = Object.values(this.state.selectedRow)
      const isInteractiveChart = onCheckTableInteract && onCheckTableInteract()
      if (isInteractiveChart && onDoInteract) {
        const triggerData = sourceData
        onDoInteract(triggerData)
      }
    })
  }

  private asyncEmitDrillDetail() {
    const { getDataDrillDetail } = this.props
    setTimeout(() => {
      if (this.props.getDataDrillDetail) {
        const sourceData = this.combineFilter()
        const sourceGroup = this.combineGroups()
        const brushed = [{0: Object.values(sourceData)}]
        getDataDrillDetail(JSON.stringify({filterObj: sourceData, brushed, sourceData, sourceGroup}))
      }
    }, 500)
  }

  private combineGroups() {
    const {group} = this.state.selectItems
    return group
  }

  private combineFilter() {
    const {cell} = this.state.selectItems
    return Object.keys(cell).reduce((iteratee, target) => {
      iteratee = iteratee.concat(cell[target])
      return iteratee
    }, [])
  }

  private getTableStyle (
    headerFixed: boolean,
    tableBodyHeght: number
  ) {
    const tableStyle: React.CSSProperties = { }
    if (!headerFixed) {
      tableStyle.height = tableBodyHeght
      tableStyle.overflowY = 'auto'
    }
    return tableStyle
  }

  private filterSameNeighbourSibings = (arr, targetIndex ) => {
    let s = targetIndex, e = targetIndex;
    let flag = -1;
    let orgIndex = targetIndex;
  
    do {
        let target = arr[targetIndex];
        if (flag=== -1&&targetIndex > 0 && arr[targetIndex - 1] === target) {
            s = targetIndex -= 1;
       
        }else if (flag===1&& arr[targetIndex + 1] === target) {
            e = (targetIndex += 1);
        
        } else if (flag===-1) {
          flag = 1;
          targetIndex=orgIndex;
        }
        else {
            break;
        }
  
    } while (targetIndex > -1 && targetIndex < arr.length);
    return { s, e }
  }

  private coustomFilter(array, column, index,) {
    const nativeIndex = array.reduce((a , b, c) => {return b.index === index ? c : a}, 0)
    const columns = array.map((a) => a[column])
    const {s: start, e: end} = this.filterSameNeighbourSibings(columns, nativeIndex)
    return array.filter((arr) => (arr['index'] < array[start]['index'] || arr.index > array[end]['index']))
  }

  private collectCell = (target, index,dataIndex: string) => (event) => {
    let {group, cell} = this.state.selectItems
    const { data} = this.props
    const groupName = this.matchAttrInBrackets(dataIndex)
    if (this.isValueModelType(groupName)) {
      return
    }
   
    if (group.includes(dataIndex)) {
      group.forEach((g, i) => g === dataIndex ? group.splice(i, 1) : void 0)
      const setKeyArray = data.map((obj: {key: number}, index) => ({
        ...obj,
        index: obj.key || index,
        key: groupName,
        value: obj[dataIndex]
      }))
      cell[dataIndex] = this.coustomFilter(setKeyArray, groupName, index)
    } else {
      let sourceCol = cell[dataIndex]
      const currentValue = {
        ...target,
        index,
        key: groupName,
        value: target[dataIndex]
      }
      
      if (sourceCol && sourceCol.length) {
        const isb = sourceCol.some((col) => col.index === index)
        if(isb) {
          cell[dataIndex] = this.coustomFilter(cell[dataIndex], groupName, index)
        } else {
          sourceCol.push(currentValue)
        }
      } else {
        cell[dataIndex] = [currentValue]
      }
    }
    
    this.setState({
      selectItems: {...this.state.selectItems}
    }, () => {
      this.asyncEmitDrillDetail()
    })
  }



  private collectGroups = (target, dataIndex) => (event) => {
    const groupName = this.matchAttrInBrackets(dataIndex)
    if (this.isValueModelType(groupName)) {
      return
    }
    const {group, cell} = this.state.selectItems
    if (group.includes(dataIndex)) {
      group.forEach((a, index) => {if (a === dataIndex) group.splice(index, 1)})
    } else {
      group.push(dataIndex)
    }
    delete cell[dataIndex]
    this.setState({
      selectItems: {...this.state.selectItems}
    },() => {
      this.asyncEmitDrillDetail()
    })
  }

  private onCellClassName = (target, index, dataIndex) => {
    const { group, cell } = this.state.selectItems
    let result = ''
    Object.keys(cell).forEach((key) => {
      if (dataIndex === key){
        cell[key].forEach(ck => {
          if(index === ck.index) {
            result = Styles.select
          }
        })
      }
    })
    if (group && group.includes(dataIndex)) {
      result = Styles.select
    }
    return result
  }

  private isValueModelType = (modelName) => {
    const target = this.getModelTypecollectByModel()
    return hasProperty(target, modelName) === ViewModelTypes.Value
  }

 

  private getModelTypecollectByModel = () => {
    const {model} = this.props
    return Object.keys(model).reduce((iteratee, target) => {
       iteratee[target] = hasProperty(model[target], 'modelType')
       return iteratee
    }, {})
  }

  private onHeadCellClassName = (target, dataIndex) => {
    const {group} = this.state.selectItems
    if(group && group.includes(dataIndex)){
      return Styles.select
    }
    return ''
  }

  private loop = (col) => {
    if (col && col.dataIndex) {
      return {
        ...col,
        onHeaderCell: (target) => {
          return {
            ...col.onHeaderCell(target),
            className: this.onHeadCellClassName(target, col.dataIndex),
            onClick: this.collectGroups(target, col.dataIndex)
          }
        },
        onCell: (target, index) => { // fix index in pagination
          return {
            ...col.onCell(target, index),
            className: this.onCellClassName(target, index, col.dataIndex),
            onClick: this.collectCell(target, index, col.dataIndex)
          }
        }
      }
    } else {
      return {...col}
    }
  }

  private enhancerColumns = (column) => {
    const columns = column.map((col) => {
      if (col.children && col.children.length) {
        return {
          ...this.loop(col),
          children: this.enhancerColumns(col.children)
        }
      }
      return this.loop(col)
    })
    return columns
  }

  private getEnhancerColumn = (column) => {
    return this.enhancerColumns(column)
  }

  public render () {

    const { data, chartStyles, width } = this.props
    const { headerFixed, bordered, withPaging, size } = chartStyles.table
    const { tablePagination, tableColumns, tableBodyHeight, mapTableHeaderConfig, containerWidthRatio } = this.state
    const adjustedTableColumns = this.adjustTableColumns(tableColumns, mapTableHeaderConfig, containerWidthRatio)
    const getEnhancerColumn = this.getEnhancerColumn(adjustedTableColumns)
    const paginationConfig: PaginationConfig = {
      ...this.basePagination,
      ...tablePagination
    }
    const scroll = this.getTableScroll(adjustedTableColumns, width, headerFixed, tableBodyHeight)
    const style = this.getTableStyle(headerFixed, tableBodyHeight)

    const paginationWithoutTotal = withPaging && tablePagination.total === -1 ? (
      <PaginationWithoutTotal
        dataLength={data.length}
        size="small"
        {...paginationConfig}
      />
    ) : null
    const tableCls = classnames({
      [Styles.table]: true,
      [Styles.noBorder]: bordered !== undefined && !bordered
    })

    return (
      <>
        <AntTable
          style={style}
          className={tableCls}
          ref={this.table}
          size={size}
          dataSource={data}
          rowKey={this.getRowKey}
          components={tableComponents}
          columns={getEnhancerColumn}
          // columns={adjustedTableColumns}
          pagination={withPaging && tablePagination.total !== -1 ? paginationConfig : false}
          scroll={scroll}
          bordered={bordered}
          onRowClick={this.rowClick}
          onChange={this.tableChange}
        />
        {paginationWithoutTotal}
      </>
    )
  }
}

export default Table


function getTableColumns (props: IChartProps) {
  const { chartStyles, width } = props
  if (!chartStyles.table) {
    return {
      tableColumns: [],
      mapTableHeaderConfig: {}
    }
  }
  const { cols, rows, metrics, data, queryVariables } = props
  const { headerConfig, columnsConfig, autoMergeCell, leftFixedColumns, rightFixedColumns, withNoAggregators } = chartStyles.table
  const tableColumns: Array<ColumnProps<any>> = []
  const mapTableHeaderConfig: IMapTableHeaderConfig = {}
  const fixedColumnInfo: {[key: string]: number} = {}
  let calculatedTotalWidth = 0
  let fixedTotalWidth = 0

  cols.concat(rows).forEach((dimension) => {
    const { name, field, format } = dimension
    const headerText = getFieldAlias(field, queryVariables || {}) || name
    const column: ColumnProps<any> = {
      key: name,
      title: (field && field.desc) ? (
        <>
          {headerText}
          <Tooltip
            title={field.desc}
            placement="top"
          >
            <Icon className={Styles.headerIcon} type="info-circle" />
          </Tooltip>
        </>
      ) : headerText,
      dataIndex: name
    }
    if (autoMergeCell) {
      column.render = (text, _, idx) => {
        // dimension cells needs merge
        const rowSpan = getMergedCellSpan(data, name, idx)
        return rowSpan === 1 ? text : { children: text, props: { rowSpan } }
      }
    }
    let headerConfigItem: ITableHeaderConfig = null
    findChildConfig(headerConfig, 'headerName', 'children', name, (config) => {
      headerConfigItem = config
    })
    const columnConfigItem = columnsConfig.find((cfg) => cfg.columnName === name)
    const isFixed = columnConfigItem
      && columnConfigItem.style
      && columnConfigItem.style.inflexible
    if (isFixed) {
      column.width = fixedColumnInfo[column.key] = columnConfigItem.style.width
      fixedTotalWidth += column.width
    } else {
      column.width = getDataColumnWidth(name, columnConfigItem, format, data)
      column.width = Math.max(+column.width, computeCellWidth(headerConfigItem && headerConfigItem.style, headerText))
    }
    calculatedTotalWidth += column.width
    if (columnConfigItem) {
      column.sorter = columnConfigItem.sort
    }
    mapTableHeaderConfig[name] = headerConfigItem
    column.onCell = (record) => ({
      config: columnConfigItem,
      format,
      cellVal: record[name],
      cellValRange: null
    })
    tableColumns.push(column)
  })
  metrics.forEach((metric) => {
    const { name, field, format, agg } = metric
    let expression = decodeMetricName(name)
    if (!withNoAggregators) {
      expression = `${agg}(${expression})`
    }
    const headerText = getFieldAlias(field, queryVariables || {}) || expression
    const column: ColumnProps<any> = {
      key: name,
      title: (field && field.desc) ? (
        <>
          {headerText}
          <Tooltip
            title={field.desc}
            placement="top"
          >
            <Icon className={Styles.headerIcon} type="info-circle" />
          </Tooltip>
        </>
      ) : headerText,
      dataIndex: expression
    }
    let headerConfigItem: ITableHeaderConfig = null
    findChildConfig(headerConfig, 'headerName', 'children', name, (config) => {
      headerConfigItem = config
    })
    const columnConfigItem = columnsConfig.find((cfg) => cfg.columnName === name)
    const isFixed = columnConfigItem
      && columnConfigItem.style
      && columnConfigItem.style.inflexible
    if (isFixed) {
      column.width = fixedColumnInfo[column.key] = columnConfigItem.style.width
      fixedTotalWidth += column.width
    } else {
      column.width = getDataColumnWidth(expression, columnConfigItem, format, data)
      column.width = Math.max(+column.width, computeCellWidth(headerConfigItem && headerConfigItem.style, headerText))
    }
    calculatedTotalWidth += column.width
    if (columnConfigItem) {
      column.sorter = columnConfigItem.sort
    }
    mapTableHeaderConfig[name] = headerConfigItem
    column.onCell = (record) => ({
      config: columnConfigItem,
      format,
      cellVal: record[expression],
      cellValRange: getTableCellValueRange(data, expression, columnConfigItem)
    })
    tableColumns.push(column)
  })

  // adjust column width
  const flexibleTotalWidth = calculatedTotalWidth - fixedTotalWidth
  const flexibleContainerWidth = width - fixedTotalWidth
  const containerWidthRatio = flexibleTotalWidth < flexibleContainerWidth
    ? flexibleContainerWidth / flexibleTotalWidth
    : 1
  tableColumns.forEach((column) => {
    if (fixedColumnInfo[column.key] === void 0) {
      // Math.floor to avoid creating float column width value and scrollbar showing
      // not use Math.ceil because it will exceed the container width in total
      column.width = Math.floor(containerWidthRatio * Number(column.width))
    }
  })

  const groupedColumns: Array<ColumnProps<any>> = []
  traverseConfig<ITableHeaderConfig>(headerConfig, 'children', (currentConfig) => {
    const { key, isGroup, headerName, style } = currentConfig
    if (!isGroup) { return }

    const childrenConfig = currentConfig.children.filter(({ isGroup, key, headerName }) =>
      (!isGroup && tableColumns.findIndex((col) => col.key === headerName) >= 0) ||
      (isGroup && groupedColumns.findIndex((col) => col.key === key) >= 0)
    )
    if (!childrenConfig.length) { return }

    const groupedColumn: ColumnProps<any> = {
      key,
      title: headerName,
      width: 0,
      children: []
    }

    mapTableHeaderConfig[key] = currentConfig

    childrenConfig.sort((cfg1, cfg2) => {
      if (cfg1.isGroup || cfg2.isGroup) { return 0 }
      const cfg1Idx = tableColumns.findIndex((column) => column.key === cfg1.headerName)
      const cfg2Idx = tableColumns.findIndex((column) => column.key === cfg2.headerName)
      return cfg1Idx - cfg2Idx
    })

    let insertIdx = Infinity
    childrenConfig.forEach(({ isGroup, key, headerName }) => {
      const columnIdx = tableColumns.findIndex((column) => column.children ? column.key === key : column.key === headerName)
      insertIdx = Math.min(insertIdx, columnIdx)
      groupedColumn.children.push(tableColumns[columnIdx])
      groupedColumn.width = +groupedColumn.width + (+tableColumns[columnIdx].width)
      tableColumns.splice(columnIdx, 1)
    })
    tableColumns.splice(insertIdx, 0, groupedColumn)
    groupedColumns.push(groupedColumn)
  })

  tableColumns.forEach((column) => {
    const name = (column.children && column.children.length ? column.title : column.dataIndex) as string
    if (leftFixedColumns.includes(name)) {
      column.fixed = 'left'
    }
    if (rightFixedColumns.includes(name)) {
      column.fixed = 'right'
    }
  })

  return { tableColumns, mapTableHeaderConfig, containerWidthRatio }
}

function getPaginationOptions (props: IChartProps) {
  const { chartStyles, width, pagination } = props
  // fixme
  let pageNo = void 0
  let pageSize = void 0
  let totalCount = void 0
  if (pagination) {
    pageNo = pagination.pageNo
    pageSize =  pagination.pageSize
    totalCount = pagination.totalCount
  }
  // const { pageNo, pageSize, totalCount } = pagination
  const { pageSize: initialPageSize } = chartStyles.table

  const paginationOptions: ITableStates['tablePagination'] = {
    current: pageNo,
    pageSize: pageSize || +initialPageSize,
    total: totalCount,
    simple: width <= 768
  }
  return paginationOptions
}
