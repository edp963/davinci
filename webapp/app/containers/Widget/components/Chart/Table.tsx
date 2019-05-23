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

import * as React from 'react'
import { findDOMNode } from 'react-dom'
import * as classnames from 'classnames'
import { IChartProps } from './'
import { IChartStyles } from '../Widget'
import { ITableHeaderConfig, ITableColumnConfig, ITableCellStyle, ITableConditionStyle } from '../Workbench/ConfigSections/TableSection'
import { DefaultTableCellStyle } from '../Workbench/ConfigSections/TableSection/HeaderConfigModal'
import { TableConditionStyleTypes } from '../Workbench/ConfigSections/TableSection/util'

import { Resizable } from 'libs/react-resizable'
import { IResizeCallbackData } from 'libs/react-resizable/lib/Resizable'
import PaginationWithoutTotal from '../../../../components/PaginationWithoutTotal'
import { Select, Tooltip, Table as AntTable } from 'antd'
import { TableProps, ColumnProps } from 'antd/lib/table'
import { PaginationConfig } from 'antd/lib/pagination/Pagination'
const Option = Select.Option
import SearchFilterDropdown from '../../../../components/SearchFilterDropdown/index'
import NumberFilterDropdown from '../../../../components/NumberFilterDropdown/index'
import DateFilterDropdown from '../../../../components/DateFilterDropdown/index'

import { uuid } from 'utils/util'
import { TABLE_PAGE_SIZES } from '../../../../globalConstants'
import { getTextWidth, decodeMetricName, getFieldAlias, getFormattedValue } from 'containers/Widget/components/util'
import { IFieldConfig } from '../Workbench/FieldConfig'
import { IFieldFormatConfig } from '../Workbench/FormatConfigModal'
import OperatorTypes from 'utils/operatorTypes'
import { AggregatorType } from '../Workbench/Dropbox'
const styles = require('./Chart.less')

interface IMetaConfig {
  name: string
  agg?: AggregatorType
  field: IFieldConfig
  format: IFieldFormatConfig
  expression?: string
}

interface IMapMetaConfig {
  [columnName: string]: IMetaConfig
}

interface ITableStates {
  columns: Array<ColumnProps<any>>
  pagination: {
    current: number
    pageSize: number
    simple: boolean
    total: number
  }
  selectedRow: object[]
  tableBodyHeight: number
}

const ResizableHeader = (props) => {
  const { onResize, width, ...rest } = props
  if (!width) {
    return <th {...rest} />
  }
  return (
    <Resizable width={width} height={0} onResize={onResize}>
      <th {...rest} />
    </Resizable>
  )
}
export class Table extends React.PureComponent<IChartProps, ITableStates> {

  private static HeaderSorterWidth = 0

  private table = React.createRef<AntTable<any>>()

  private components = {
    header: {
      cell: ResizableHeader
    }
  }

  private handleResize = (idx: number) => (_, { size }: IResizeCallbackData) => {
    const loop = (columns: Array<ColumnProps<any>>, ratio: number) => {
      columns.forEach((col) => {
        col.width = Math.floor(ratio * Number(col.width))
        if (Array.isArray(col.children) && col.children.length) {
          loop(col.children, ratio)
        }
      })
    }

    this.setState(({ columns }) => {
      const nextColumns = [...columns]
      const ratio = size.width / (+nextColumns[idx].width)
      nextColumns[idx] = {
        ...nextColumns[idx],
        width: size.width
      }
      if (nextColumns[idx].children) {
        loop(nextColumns[idx].children, ratio)
      }
      return { columns: nextColumns }
    })
  }

  private onPaginationChange = (current: number, pageSize: number) => {
    const { pagination } = this.state
    if (pageSize !== pagination.pageSize) {
      current = 1
    }
    const { onPaginationChange } = this.props
    onPaginationChange(current, pageSize)
  }

  private basePagination: PaginationConfig = {
    pageSizeOptions: TABLE_PAGE_SIZES.map((s) => s.toString()),
    showQuickJumper: true,
    showSizeChanger: true,
    showTotal: (total: number) => `共${total}条`,
    onChange: this.onPaginationChange,
    onShowSizeChange: this.onPaginationChange
  }

  constructor (props: IChartProps) {
    super(props)
    const { chartStyles } = props
    const columns = this.getTableColumns(props)
    this.setFixedColumns(columns, chartStyles)
    const pagination = this.getPaginationOptions(props)
    this.state = {
      columns,
      pagination,
      tableBodyHeight: 0,
      selectedRow: []
    }
  }

  public componentDidMount () {
    const { headerFixed, withPaging } = this.props.chartStyles.table
    this.adjustTableCell(headerFixed, withPaging)
  }

  public componentDidUpdate () {
    const { headerFixed, withPaging } = this.props.chartStyles.table
    this.adjustTableCell(headerFixed, withPaging, this.state.pagination.total)
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

  public componentWillReceiveProps (nextProps: IChartProps) {
    const { chartStyles, data, width } = nextProps
    let { columns, pagination } = this.state
    if (chartStyles !== this.props.chartStyles
      || data !== this.props.data
      || width !== this.props.width) {
      columns = this.getTableColumns(nextProps)
      this.setFixedColumns(columns, chartStyles)
    }
    pagination = this.getPaginationOptions(nextProps)
    this.setState({
      columns,
      pagination
    })
  }

  private getPaginationOptions (props: IChartProps) {
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

    const paginationOptions: ITableStates['pagination'] = {
      current: pageNo,
      pageSize: pageSize || +initialPageSize,
      total: totalCount,
      simple: width <= 768
    }
    return paginationOptions
  }

  private getMapMetaConfig (props: IChartProps) {
    const { cols, rows, metrics, chartStyles } = props
    const { withNoAggregators } = chartStyles.table
    const map: IMapMetaConfig = {}
    cols.concat(rows).forEach((item) => {
      const { name, format, field } = item
      map[name] = { name, format, field, expression: name }
    })
    metrics.forEach((item) => {
      const { name, agg, format, field } = item
      let expression = decodeMetricName(name)
      expression = withNoAggregators ? expression : `${agg}(${expression})`
      map[name] = { name, format, field, expression, agg }
    })
    return map
  }

  private setFixedColumns (columns: Array<ColumnProps<any>>, chartStyles: IChartStyles) {
    if (!columns.length) { return }

    const { leftFixedColumns, rightFixedColumns } = chartStyles.table
    columns.forEach((col) => {
      this.traverseFixedColumns(col, leftFixedColumns, rightFixedColumns)
    })
  }

  private traverseFixedColumns (
    cursorColumn: ColumnProps<any>,
    leftFixedColumns: string[],
    rightFixedColumns: string[]
  ) {
    if (!leftFixedColumns.length && !rightFixedColumns.length) { return }

    if (leftFixedColumns.includes(cursorColumn.dataIndex as string)) {
      cursorColumn.fixed = 'left'
    }
    if (rightFixedColumns.includes(cursorColumn.dataIndex as string)) {
      cursorColumn.fixed = 'right'
    }

    if (!cursorColumn.children) { return }

    cursorColumn.children.forEach((child) => {
      this.traverseFixedColumns(child, leftFixedColumns, rightFixedColumns)
    })
  }

  private getTableColumns (props: IChartProps) {
    const { chartStyles, width } = props
    const { table } = chartStyles
    if (!table) { return [] }
    const { headerConfig } = table
    const mapMetaConfig = this.getMapMetaConfig(props)

    let tableColumns = headerConfig.length
      ? this.getMergedColumns(props, mapMetaConfig)
      : this.getPlainColumns(props, mapMetaConfig)
    tableColumns = this.adjustTableColumns(tableColumns, width)
    return tableColumns
  }

  private getMaxCellWidth (
    expression: string,
    columnConfig: ITableColumnConfig,
    format: IFieldFormatConfig,
    data: any[]
  ) {
    const style = columnConfig ? columnConfig.style : DefaultTableCellStyle
    const maxCellWidth = data.reduce((w, row) => {
      const formattedValue = getFormattedValue(row[expression], format)
      const cellWidth = this.computeCellWidth(style, formattedValue)
      return Math.max(w, cellWidth)
    }, 0)
    return maxCellWidth
  }

  private computeCellWidth (style: ITableCellStyle, cellValue: number | string) {
    const { fontWeight, fontSize, fontFamily } = style
    const cellWidth = !cellValue ? 0 : getTextWidth(cellValue.toString(), fontWeight, `${fontSize}px`, fontFamily)
    return cellWidth + 16 + 2
  }

  private getHeaderText = (field: IFieldConfig, expression: string, queryVariables) => {
    let headerText = expression
    if (field) {
      headerText = getFieldAlias(field, queryVariables || {}) || headerText
    }
    return headerText
  }

  private getHeaderNode = (field: IFieldConfig, headerText: string) => {
    let headerNode: string | React.ReactElement<Tooltip> = headerText
    if (field && field.desc) {
      headerNode = (<Tooltip title={field.desc}>{headerNode}</Tooltip>)
    }
    return headerNode
  }

  private getPlainColumns (props: IChartProps, mapMetaConfig: IMapMetaConfig) {
    const { data, chartStyles, queryVariables } = props
    if (!data.length) { return [] }

    const { columnsConfig, autoMergeCell } = chartStyles.table
    const tableColumns = Object.values<IMetaConfig>(mapMetaConfig).map((metaConfig) => {
      const { name, field, format, expression, agg } = metaConfig
      const headerText = this.getHeaderText(field, expression, queryVariables)
      const headerNode = this.getHeaderNode(field, headerText)
      const columnConfig = columnsConfig.find((config) => config.columnName === name)
      const cellValRange = this.getTableCellValueRange(data, expression, columnConfig)
      const headerWidth = this.computeCellWidth(DefaultTableCellStyle, headerText) + Table.HeaderSorterWidth
      const maxCellWidth = this.getMaxCellWidth(expression, columnConfig, format, data)
      const width = Math.floor(Math.max(headerWidth, maxCellWidth))
      const column: ColumnProps<any> = {
        title: (<div className={styles.headerCell}>{headerNode}</div>),
        dataIndex: expression,
        width,
        key: expression,
        render: (val, _, idx) => {
          let span = 1
          if (autoMergeCell && !agg) {
            span = this.getMergedCellSpan(data, expression, idx)
          }
          const isMerged = span !== 1
          const cellJsx = this.getCellReactNode(val, cellValRange, format, columnConfig, isMerged)
          return !isMerged ? cellJsx : { children: cellJsx, props: { rowSpan: span } }
        }
      }
      return column
    })

    return tableColumns
  }

  private adjustTableColumns (tableColumns: Array<ColumnProps<any>>, containerWidth: number) {
    const totalWidth = tableColumns.reduce((acc, col) => acc + Number(col.width), 0)
    if (totalWidth < containerWidth) {
      const ratio = containerWidth / totalWidth
      const loop = (columns: Array<ColumnProps<any>>, ratio: number) => {
        columns.forEach((col) => {
          col.width = Math.floor(ratio * Number(col.width))
          if (Array.isArray(col.children) && col.children.length) {
            loop(col.children, ratio)
          }
        })
      }
      loop(tableColumns, ratio)
    }
    tableColumns.forEach((col, idx) => {
      col.onHeaderCell = (column) => ({
        width: column.width,
        onResize: this.handleResize(idx)
      })
    })
    return tableColumns
  }

  private getMergedColumns (props: IChartProps, mapMetaConfig: IMapMetaConfig) {
    const tableColumns: Array<ColumnProps<any>> = []
    const metaKeys = []

    const { data, chartStyles, queryVariables } = props
    const { headerConfig, columnsConfig, autoMergeCell } = chartStyles.table
    headerConfig.forEach((config) =>
      this.traverseHeaderConfig(config, props, mapMetaConfig, null, tableColumns, metaKeys))

    let dimensionIdx = 0
    Object.entries<IMetaConfig>(mapMetaConfig).forEach(([key, metaConfig]) => {
      if (metaKeys.includes(key)) { return }

      const { name, field, format, expression, agg } = metaConfig
      const columnConfig = columnsConfig.find((config) => config.columnName === name)
      const { fontColor: color, fontFamily, fontSize, fontStyle, fontWeight, backgroundColor, justifyContent } = DefaultTableCellStyle
      const headerStyle: React.CSSProperties = {
        color,
        fontFamily,
        fontSize: `${fontSize}px`,
        fontStyle,
        fontWeight: fontWeight as React.CSSProperties['fontWeight'],
        backgroundColor,
        justifyContent
      }
      const headerText = this.getHeaderText(field, expression, queryVariables)
      const headerNode = this.getHeaderNode(field, headerText)
      const headerWidth = this.computeCellWidth(DefaultTableCellStyle, headerText) + Table.HeaderSorterWidth
      const maxCellWidth = this.getMaxCellWidth(expression, columnConfig, format, data)
      const width = Math.floor(Math.max(headerWidth, maxCellWidth))
      const column: ColumnProps<any> = {
        key: uuid(5),
        dataIndex: name,
        width,
        title: (
          <div className={styles.headerCell} style={headerStyle}>{headerNode}</div>
        )
      }
      const cellValRange = this.getTableCellValueRange(data, expression)
      column.render = (_, record, idx) => {
        let span = 1
        if (autoMergeCell && !agg) {
          span = this.getMergedCellSpan(data, expression, idx)
        }
        const isMerged = span !== 1
        const cellVal = record[expression]
        const cellJsx = this.getCellReactNode(cellVal, cellValRange, format, columnConfig, isMerged)
        return !isMerged ? cellJsx : { children: cellJsx, props: { rowSpan: span } }
      }

      if (agg) {
        tableColumns.push(column)
      } else {
        tableColumns.splice(dimensionIdx++, 0, column)
      }
    })

    return tableColumns
  }

  private traverseHeaderConfig (
    currentConfig: ITableHeaderConfig,
    props: IChartProps,
    mapMetaConfig: IMapMetaConfig,
    parent: ColumnProps<any>,
    columns: Array<ColumnProps<any>>,
    metaKeys: string[]
  ) {
    const { data, chartStyles, queryVariables } = props
    const { columnsConfig, autoMergeCell } = chartStyles.table
    const { key, isGroup, headerName, style } = currentConfig
    const isValidHeader = isGroup || !!mapMetaConfig[headerName]
    if (!isValidHeader) { return }

    const header: ColumnProps<any> = {
      key,
      dataIndex: headerName
    }
    if (isGroup) {
      currentConfig.children.forEach((c) =>
        this.traverseHeaderConfig(c, props, mapMetaConfig, header, columns, metaKeys))
      header.width = Math.floor(Math.max(this.computeCellWidth(style, headerName) + Table.HeaderSorterWidth, +header.width))
    }

    const { fontColor: color, fontFamily, fontSize, fontStyle, fontWeight, backgroundColor, justifyContent } = style
    const headerStyle: React.CSSProperties = {
      color,
      fontFamily,
      fontSize: `${fontSize}px`,
      fontStyle,
      fontWeight: fontWeight as React.CSSProperties['fontWeight'],
      backgroundColor,
      justifyContent
    }

    let headerText
    if (isGroup) {
      headerText = headerName
    } else {
      metaKeys.push(headerName)
      const metaConfig = mapMetaConfig[headerName]
      const { name, field, format, expression, agg } = metaConfig
      const columnConfig = columnsConfig.find((config) => config.columnName === name)
      headerText = this.getHeaderText(field, expression, queryVariables)
      const headerWidth = this.computeCellWidth(style, headerText) + Table.HeaderSorterWidth
      const maxCellWidth = this.getMaxCellWidth(expression, columnConfig, format, data)
      header.width = Math.floor(Math.max(headerWidth, maxCellWidth))
      headerText = this.getHeaderNode(field, headerText)
      const cellValRange = this.getTableCellValueRange(data, expression, columnConfig)
      header.render = (_, record, idx) => {
        let span = 1
        if (autoMergeCell && !agg) {
          span = this.getMergedCellSpan(data, expression, idx)
        }
        const isMerged = span !== 1
        const cellVal = record[expression]
        const cellJsx = this.getCellReactNode(cellVal, cellValRange, format, columnConfig, isMerged)
        return !isMerged ? cellJsx : { children: cellJsx, props: { rowSpan: span } }
      }
      // header.sorter = (a, b) => {
      //   if (a[expression] === b[expression]) { return 0 }
      //   if (typeof a[expression] === 'number') {
      //     return a[expression] > b[expression] ? 1 : -1
      //   } else if (typeof a[expression] === 'string') {
      //     return (a[expression] as string).localeCompare(b[expression])
      //   }
      //   return 0
      // }
    }
    header.title = (
      <div className={styles.headerCell} style={headerStyle}>{headerText}</div>
    )
    // @FIXME need update columns order when drag items in OperatingPanel
    if (parent && !parent.children) {
      parent.children = []
    }
    const parentChildren = parent ? parent.children : columns
    parentChildren.push(header)
    if (parent) {
      parent.width = parent.children.reduce((acc,  child) => (acc + (+child.width)), 0)
    }
  }

  private getCellReactNode (
    cellVal: string | number,
    cellValRange: [number, number],
    format: IFieldFormatConfig,
    columnConfig: ITableColumnConfig,
    isMerged?: boolean
  ): React.ReactNode {
    const formattedValue = getFormattedValue(cellVal, format)
    const basicStyle = this.getBasicStyledCell(columnConfig)
    const conditionStyle = this.getMergedConditionStyledCell(cellVal, columnConfig, cellValRange)
    const cellCls = classnames({
      [styles.tableCell]: true,
      [styles.mergedCell]: isMerged
    })
    const cellStyle = { ...basicStyle, ...conditionStyle }
    if (!conditionStyle) {
      return (
        <div className={cellCls} style={basicStyle}>
          {formattedValue}
        </div>
      )
    }
    return (
      <div className={cellCls} style={basicStyle}>
        <div className={styles.valCell} style={conditionStyle}>{formattedValue}</div>
      </div>
    )
  }

  private getMergedCellSpan (data: any[], propName: string, idx: number) {
    const currentRecord = data[idx]
    const prevRecord = data[idx - 1]
    if (prevRecord && prevRecord[propName] === currentRecord[propName]) {
      return 0
    }
    let span = 1
    while (true) {
      const nextRecord = data[idx + span]
      if (nextRecord && nextRecord[propName] === currentRecord[propName]) {
        span++
      } else {
        break
      }
    }
    return span
  }

  private getTableCellValueRange (data: any[], propName: string, columnConfig?: ITableColumnConfig): [number, number] {
    if (data.length <= 0) { return [0, 0] }

    let minVal = Infinity
    let maxVal = -Infinity

    if (columnConfig) {
      const { conditionStyles } = columnConfig
      conditionStyles.forEach((style) => {
        if (!style.bar) { return }
        const { mode, min, max } = style.bar
        if (mode === 'auto') { return }
        if (typeof min === 'number') { minVal = min }
        if (typeof max === 'number') { maxVal = max }
      })
    }

    const validMinVal = minVal !== Infinity
    const validMaxVal = maxVal !== -Infinity

    if (validMinVal && validMaxVal) {
      return [minVal, maxVal]
    }

    data.forEach((item) => {
      const cellVal = item[propName]
      if (typeof cellVal !== 'number' && (typeof cellVal !== 'string' || isNaN(+cellVal))) { return }

      const cellNumVal = +cellVal
      if (!validMinVal && cellNumVal < minVal) { minVal = cellNumVal }
      if (!validMaxVal && cellNumVal > maxVal) { maxVal = cellNumVal }
    })
    return [minVal, maxVal]
  }

  private getMergedConditionStyledCell (
    cellVal: string | number,
    columnConfig: ITableColumnConfig,
    cellValRange?: [number, number]
  ): React.CSSProperties {
    if (!columnConfig) { return null }

    const { styleType, conditionStyles } = columnConfig
    let conditionCellStyle: React.CSSProperties
    if (conditionStyles.length > 0) {
      conditionCellStyle = conditionStyles.reduce((acc, c) => ({
        ...acc,
        ...this.getConditionStyledCell(cellVal, c, cellValRange)
      }), {})
    }
    return conditionCellStyle
  }

  private getBasicStyledCell (columnConfig: ITableColumnConfig) {
    const style = columnConfig ? columnConfig.style : DefaultTableCellStyle
    const { fontSize, fontFamily, fontWeight, fontColor, fontStyle, backgroundColor, justifyContent } = style
    const cssStyle: React.CSSProperties = {
      fontSize: `${fontSize}px`,
      fontFamily,
      fontWeight: fontWeight as React.CSSProperties['fontWeight'],
      color: fontColor,
      fontStyle,
      backgroundColor,
      alignItems: justifyContent
    }
    return cssStyle
  }

  private getConditionStyledCell (
    cellVal: string | number,
    conditionStyle: ITableConditionStyle,
    cellValRange?: [number, number]
  ) {
    const { operatorType, conditionValues, type } = conditionStyle
    const matchTheCondition = this.hasMatchedTheCondition(cellVal, operatorType, conditionValues)
    if (!matchTheCondition) { return null }

    let cssStyle: React.CSSProperties
    switch (type) {
      case TableConditionStyleTypes.BackgroundColor:
        cssStyle = this.getBackgroundConditionCellStyle(conditionStyle)
        break
      case TableConditionStyleTypes.TextColor:
        cssStyle = this.getTextConditionCellStyle(conditionStyle)
        break
      case TableConditionStyleTypes.NumericBar:
        const [minCellVal, maxCellVal] = cellValRange
        cssStyle = this.getNumericBarConditionCellStyle(conditionStyle, +cellVal, maxCellVal, minCellVal)
        break
      case TableConditionStyleTypes.Custom:
        // @TODO
        break
    }

    return cssStyle
  }

  private hasMatchedTheCondition (
    cellVal: string | number,
    operatorType: OperatorTypes,
    conditionValues: Array<string | number>
  ) {
    let matchTheCondition = false
    switch (operatorType) {
      case OperatorTypes.Between:
        const [minVal, maxVal] = conditionValues
        matchTheCondition = (cellVal >= minVal && cellVal <= maxVal)
        break
      case OperatorTypes.Contain:
        matchTheCondition = cellVal.toString().indexOf(conditionValues[0].toString()) >= 0
        break
      case OperatorTypes.Equal:
        matchTheCondition = (cellVal === conditionValues[0])
        break
      case OperatorTypes.GreaterThan:
        matchTheCondition = (cellVal > conditionValues[0])
        break
      case OperatorTypes.GreaterThanOrEqual:
        matchTheCondition = (cellVal >= conditionValues[0])
        break
      case OperatorTypes.In:
        matchTheCondition = conditionValues.findIndex((cVal) => cVal === cellVal) >= 0
        break
      case OperatorTypes.LessThan:
        matchTheCondition = (cellVal < conditionValues[0])
        break
      case OperatorTypes.LessThanOrEqual:
        matchTheCondition = (cellVal <= conditionValues[0])
        break
      case OperatorTypes.NotEqual:
        matchTheCondition = (cellVal !== conditionValues[0])
        break
    }
    return matchTheCondition
  }

  private getBackgroundConditionCellStyle (
    conditionStyle: ITableConditionStyle
  ): React.CSSProperties {
    const { colors } = conditionStyle
    const { fore, background } = colors
    const cssStyle: React.CSSProperties = {
      color: fore,
      backgroundColor: background
    }
    return cssStyle
  }

  private getTextConditionCellStyle (
    conditionStyle: ITableConditionStyle
  ): React.CSSProperties {
    const { colors } = conditionStyle
    const { fore } = colors
    const cssStyle: React.CSSProperties = {
      color: fore
    }
    return cssStyle
  }

  private getNumericBarConditionCellStyle (
    conditionStyle: ITableConditionStyle,
    cellVal: number,
    maxCellVal: number,
    minCellVal: number
  ): React.CSSProperties {
    const { zeroPosition, colors } = conditionStyle
    const { fore, positive, negative } = colors

    const valRange = (Math.max(maxCellVal, 0) - Math.min(0, minCellVal))
    let cellBarPercentage: number = void 0
    if (cellVal < minCellVal) {
      cellBarPercentage = 0
    } else if (cellVal > maxCellVal) {
      cellBarPercentage = 100
    }
    let barZeroPosition: number
    switch (zeroPosition) {
      case 'center':
        if (cellBarPercentage === void 0) {
          cellBarPercentage = Math.abs(cellVal) / Math.max(Math.abs(minCellVal), Math.abs(maxCellVal)) * 50
        }
        barZeroPosition = 50
        break
      case 'auto':
        if (cellBarPercentage === void 0) {
          cellBarPercentage = (Math.abs(cellVal) / valRange) * 100
        }
        barZeroPosition = Math.abs(Math.min(0, minCellVal)) / Math.max(Math.abs(minCellVal), Math.abs(maxCellVal)) * 100
        break
    }

    const divisions = ['transparent 0%']
    if (cellVal < 0) {
      divisions.push(`transparent ${barZeroPosition - cellBarPercentage}%`)
      divisions.push(`${negative} ${barZeroPosition - cellBarPercentage}%`)
      divisions.push(`${negative} ${barZeroPosition}%`)
      divisions.push(`transparent ${barZeroPosition}%`)
    } else {
      divisions.push(`transparent ${barZeroPosition}%`)
      divisions.push(`${positive} ${barZeroPosition}%`)
      divisions.push(`${positive} ${barZeroPosition + cellBarPercentage}%`)
      divisions.push(`transparent ${barZeroPosition + cellBarPercentage}%`)
    }
    divisions.push('transparent 100%')

    const cssStyle: React.CSSProperties = {
      background: `linear-gradient(90deg, ${divisions.join(',')})`
    }
    return cssStyle
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

  private rowClick = (record, row, event) => {
    const { getDataDrillDetail } = this.props
    const selectedRow = [...this.state.selectedRow]
    let filterObj = void 0
    if (event.target && event.target.innerHTML) {
      for (const attr in record) {
        if (record[attr].toString() === event.target.innerHTML) {
          const re = /\(\S+\)/
          const key = re.test(attr) ? attr.match(/\((\S+)\)/)[1] : attr
          filterObj = {
            key,
            value: event.target.innerHTML
          }
        }
      }
    }
    const recordConcatFilter = {
      ...record,
      ...filterObj
    }
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

    this.setState({
      selectedRow
    }, () => {
      const brushed = [{0: Object.values(this.state.selectedRow)}]
      const sourceData = Object.values(this.state.selectedRow)
      setTimeout(() => {
        getDataDrillDetail(JSON.stringify({filterObj, brushed, sourceData}))
      }, 500)
    })
  }

  private setRowClassName = (record, row) =>
   this.state.selectedRow.some((sr) => this.isSameObj(sr, record, true)) ? styles.selectedRow : styles.unSelectedRow


  private getTableStyle (
    headerFixed: boolean,
    tableBodyHeght: number
  ) {
    const tableStyle: React.CSSProperties = { }
    if (!headerFixed) {
      tableStyle.height = tableBodyHeght
      tableStyle.overflowY = 'scroll'
    }
    return tableStyle
  }

  public render () {
    const { data, chartStyles, width } = this.props
    const { headerFixed, bordered, withPaging } = chartStyles.table
    const { pagination, columns, tableBodyHeight } = this.state
    const paginationConfig: PaginationConfig = {
      ...this.basePagination,
      ...pagination
    }
    // const key = new Date().getTime() // FIXME force to rerender Table to avoid bug by setting changes
    const scroll = this.getTableScroll(columns, width, headerFixed, tableBodyHeight)
    const style = this.getTableStyle(headerFixed, tableBodyHeight)

    const paginationWithoutTotal = withPaging && pagination.total === -1 ? (
      <PaginationWithoutTotal
        dataLength={data.length}
        size="small"
        {...paginationConfig}
      />
    ) : null
    const tableCls = classnames({
      [styles.table]: true,
      [styles.noBorder]: bordered !== undefined && !bordered
    })

    return (
      <>
        <AntTable
          // key={key}
          style={style}
          className={tableCls}
          ref={this.table}
          dataSource={data}
          components={this.components}
          columns={columns}
          pagination={withPaging && pagination.total !== -1 ? paginationConfig : false}
          scroll={scroll}
          bordered={bordered}
          rowClassName={this.setRowClassName}
          onRowClick={this.rowClick}
        />
        {paginationWithoutTotal}
      </>
    )
  }
}

export default Table
