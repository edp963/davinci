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
import * as moment from 'moment'
import { IChartProps } from './'
import { IChartStyles } from '../Widget'
import { ITableHeaderConfig, ITableColumnConfig, ITableCellStyle, ITableConditionStyle } from '../Workbench/ConfigSections/TableSection'
import { TableConditionStyleTypes } from '../Workbench/ConfigSections/TableSection/util'

const AntTable = require('antd/lib/table')
const Select = require('antd/lib/select')
const Message = require('antd/lib/message')
const Option = Select.Option
import SearchFilterDropdown from '../../../../components/SearchFilterDropdown/index'
import NumberFilterDropdown from '../../../../components/NumberFilterDropdown/index'
import DateFilterDropdown from '../../../../components/DateFilterDropdown/index'

import { COLUMN_WIDTH, DEFAULT_TABLE_PAGE, DEFAULT_TABLE_PAGE_SIZE, SQL_NUMBER_TYPES, SQL_DATE_TYPES, KEY_COLUMN } from '../../../../globalConstants'
import { decodeMetricName, FieldFormatTypes, getFormattedValue, getTextWidth } from 'containers/Widget/components/util'
import { IFieldConfig } from '../Workbench/FieldConfigModal'
import { IFieldFormatConfig } from '../Workbench/FormatConfigModal'
import OperatorTypes from 'utils/operatorTypes'
const styles = require('./Chart.less')

interface IMetaConfig {
  name: string
  field: IFieldConfig
  format: IFieldFormatConfig
  expression?: string
}

interface IMapMetaConfig {
  [columnName: string]: IMetaConfig
}

interface ITableStates {
  columns: any[]
  pagination: object
  mapMetaConfig: object
  headerHeight: number
}

export class Table extends React.PureComponent<IChartProps, ITableStates> {

  private table
  private defaultColumnWidth = 500

  constructor (props: IChartProps) {
    super(props)
    const { chartStyles, data } = props
    const mapMetaConfig = this.getMapMetaConfig(props)
    const columns = this.getTableColumns(chartStyles, data, mapMetaConfig)
    this.setFixedColumns(columns, chartStyles)
    this.state = {
      columns,
      pagination: {},
      mapMetaConfig,
      headerHeight: 0
    }
  }

  public componentDidMount () {
    this.adjustTableCell()
  }

  public componentDidUpdate () {
    this.adjustTableCell()
  }

  private adjustTableCell () {
    const tableDom = findDOMNode(this.table)
    const cells = tableDom.querySelectorAll(`.${styles.tableCell}.${styles.mergedCell}`)
    Array.prototype.forEach.call(cells, (cell: HTMLDivElement) => {
      let td = cell.parentElement
      if (td.nodeName.toLowerCase() !== 'td') {
        td = td.parentElement
      }
      cell.style.height = `${td.getBoundingClientRect().height - 2}px`
    })
    const excludeElems = ['.ant-table-thead', '.ant-pagination.ant-table-pagination']
    const excludeElemsHeight = excludeElems.reduce((acc, exp) =>
      acc + tableDom.querySelector(exp).getBoundingClientRect().height, 0)
    const headerHeight = this.props.height - excludeElemsHeight - 32
    this.setState({
      headerHeight
    })
  }

  private pageAutoAdapted = (value) => {
    const paginationState = value === 'pc'
      ? {
        simple: false,
        pageSize: DEFAULT_TABLE_PAGE_SIZE,
        current: DEFAULT_TABLE_PAGE,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`,
        pageSizeOptions: ['10', '20', '30', '40', '50', '100']
      }
      : {
        simple: true,
        pageSize: DEFAULT_TABLE_PAGE_SIZE,
        current: DEFAULT_TABLE_PAGE,
        showSizeChanger: true
      }
    return paginationState
  }

  public componentWillMount () {
    this.setState({
      pagination: this.props.width <= 768
        ? this.pageAutoAdapted('mobile')
        : this.pageAutoAdapted('pc')
    })
  }

  public componentWillReceiveProps (nextProps: IChartProps) {
    const { chartStyles, width, data } = nextProps
    let { columns, pagination } = this.state
    const mapMetaConfig = this.getMapMetaConfig(nextProps)
    if (chartStyles !== this.props.chartStyles) {
      columns = this.getTableColumns(chartStyles, data, mapMetaConfig)
      this.setFixedColumns(columns, chartStyles)
    }
    if (width !== this.props.width) {
      pagination = nextProps.width <= 768
        ? this.pageAutoAdapted('mobile')
        : this.pageAutoAdapted('pc')
    }
    this.setState({
      mapMetaConfig,
      columns,
      pagination
    })
  }

  private getMapMetaConfig (props: IChartProps) {
    const { cols, rows, metrics } = props
    const map: IMapMetaConfig = {}
    cols.concat(rows).forEach((item) => {
      const { name, format, field } = item
      map[name] = { name, format, field }
    })
    metrics.forEach((item) => {
      const { name, agg, format, field } = item
      const expression = `${agg}(${decodeMetricName(name)})`
      map[name] = { name, format, field, expression }
    })
    return map
  }

  private setFixedColumns (columns: any[], chartStyles: IChartStyles) {
    if (!columns.length) { return }

    const { leftFixedColumns, rightFixedColumns } = chartStyles.table
    columns.forEach((col) => {
      this.traverseFixedColumns(col, leftFixedColumns, rightFixedColumns)
    })
  }

  private traverseFixedColumns (cursorColumn, leftFixedColumns: string[], rightFixedColumns: string[]) {
    if (!leftFixedColumns.length && !rightFixedColumns.length) { return }

    if (~leftFixedColumns.indexOf(cursorColumn.dataIndex)) {
      cursorColumn.width = this.defaultColumnWidth
      cursorColumn.fixed = 'left'
    }
    if (~rightFixedColumns.indexOf(cursorColumn.dataIndex)) {
      cursorColumn.width = this.defaultColumnWidth
      cursorColumn.fixed = 'right'
    }
    if (!cursorColumn.children) { return }
    cursorColumn.children.forEach((child) => {
      this.traverseFixedColumns(child, leftFixedColumns, rightFixedColumns)
    })
  }

  private getTableColumns (
    chartStyles: IChartStyles,
    data: any[],
    mapMetaConfig: IMapMetaConfig
  ) {
    const { table } = chartStyles
    if (!table) { return [] }
    const { headerConfig, columnsConfig, autoMergeCell } = table
    const tableColumns = headerConfig.length
      ? this.getMergedColumns(data, autoMergeCell, headerConfig, columnsConfig, mapMetaConfig)
      : this.getPlainColumns(data, autoMergeCell, columnsConfig, mapMetaConfig)
    return tableColumns
  }

  private findMetaConfigByExpression = (expression: string, mapMetaConfig: IMapMetaConfig) => {
    if (!expression) { return null }

    let metaConfig: IMetaConfig
    Object.keys(mapMetaConfig).some((key) => {
      const config = mapMetaConfig[key]
      if (config.expression === expression) {
        metaConfig = config
        return true
      }
    })
    return metaConfig
  }

  private getPlainColumns (
    data: any[],
    autoMergeCell: boolean,
    columnsConfig: ITableColumnConfig[],
    mapMetaConfig: IMapMetaConfig
  ) {
    if (!data.length) { return [] }

    const tableColumns = Object.keys(data[0]).map((key) => {
      const { name, field, format } = mapMetaConfig[key] || this.findMetaConfigByExpression(key, mapMetaConfig)
      const titleText = field ? field.alias : key.toUpperCase()
      const columnConfig = columnsConfig.find((config) => config.columnName === name)
      const cellValRange = this.getTableCellValueRange(data, key)

      return {
        title: (<div className={styles.headerCell}>{titleText}</div>),
        dataIndex: key,
        width: this.defaultColumnWidth,
        key,
        render: (val, _, idx) => {
          let span = 1
          if (autoMergeCell) {
            span = this.getMergedCellSpan(data, key, idx)
          }
          const isMerged = span !== 1
          const cellJsx = this.getCellReactNode(val, cellValRange, format, columnConfig, isMerged)
          return !isMerged ? cellJsx : { children: cellJsx, props: { rowSpan: span } }
        }
      }
    })
    return tableColumns
  }

  private getMergedColumns (
    data: any[],
    autoMergeCell: boolean,
    headerConfig: ITableHeaderConfig[],
    columnsConfig: ITableColumnConfig[],
    mapMetaConfig: IMapMetaConfig
  ) {
    const tableColumns = []
    headerConfig.forEach((config) => this.traverseHeaderConfig(data, autoMergeCell, config, columnsConfig, mapMetaConfig, null, tableColumns))
    return tableColumns
  }

  private traverseHeaderConfig (
    data: any[],
    autoMergeCell: boolean,
    headerConfig: ITableHeaderConfig,
    columnsConfig: ITableColumnConfig[],
    mapMetaConfig: IMapMetaConfig,
    parent, columns
  ) {
    const { key, isGroup, headerName, style } = headerConfig
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

    const header: any = {}
    header.dataIndex = headerName
    let titleText
    if (isGroup) {
      titleText = headerName
      header.children = []
    } else {
      header.width = this.defaultColumnWidth
      const metaConfig = mapMetaConfig[headerName]
      const { name, field, format, expression } = metaConfig
      titleText = field ? field.alias : (expression || headerName)
      header.key = key
      const propName = expression || headerName
      const cellValRange = this.getTableCellValueRange(data, propName)
      const columnConfig = columnsConfig.find((config) => config.columnName === name)
      header.render = (_, record, idx) => {
        let span = 1
        if (autoMergeCell) {
          span = this.getMergedCellSpan(data, propName, idx)
        }
        const isMerged = span !== 1
        const cellVal = record[propName]
        const cellJsx = this.getCellReactNode(cellVal, cellValRange, format, columnConfig, isMerged)
        return !isMerged ? cellJsx : { children: cellJsx, props: { rowSpan: span } }
      }
    }
    header.title = (
      <div className={styles.headerCell} style={headerStyle}>{titleText}</div>
    )
    parent ? parent.children.push(header) : columns.push(header)
    if (isGroup) {
      headerConfig.children.forEach((c) =>
        this.traverseHeaderConfig(data, autoMergeCell, c, columnsConfig, mapMetaConfig, header, columns))
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
    return (
      <div className={cellCls}>
        <div className={styles.valCell} style={cellStyle}>{formattedValue}</div>
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

  private getTableCellValueRange (data: any[], propName: string): [number, number] {
    if (data.length <= 0) { return [0, 0] }

    let minVal = Infinity
    let maxVal = -Infinity

    data.forEach((item) => {
      const cellVal = item[propName]
      if (typeof cellVal !== 'number' && (typeof cellVal !== 'string' || isNaN(+cellVal))) { return }

      const cellNumVal = +cellVal
      if (cellNumVal < minVal) { minVal = cellNumVal }
      if (cellNumVal > maxVal) { maxVal = cellNumVal }
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
    if (!columnConfig) { return {} }
    const { style } = columnConfig
    const { fontSize, fontFamily, fontWeight, fontColor, fontStyle, backgroundColor, justifyContent } = style
    const cssStyle: React.CSSProperties = {
      fontSize: `${fontSize}px`,
      fontFamily,
      fontWeight: fontWeight as React.CSSProperties['fontWeight'],
      color: fontColor,
      fontStyle,
      backgroundColor,
      justifyContent
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

  private getNumericBarConditionCellStyle (
    conditionStyle: ITableConditionStyle,
    cellVal: number,
    maxCellVal: number,
    minCellVal: number
  ): React.CSSProperties {
    const { zeroPosition, colors } = conditionStyle
    const { fore, positive, negative } = colors

    const valRange = (Math.max(maxCellVal, 0) - Math.min(0, minCellVal))
    let cellBarPercentage
    let barZeroPosition
    switch (zeroPosition) {
      case 'center':
        cellBarPercentage = Math.abs(cellVal) / Math.max(Math.abs(minCellVal), Math.abs(maxCellVal)) * 50
        barZeroPosition = 50
        break
      case 'auto':
        cellBarPercentage = (Math.abs(cellVal) / valRange) * 100
        barZeroPosition = Math.abs(Math.min(0, minCellVal)) / Math.max(Math.abs(minCellVal), Math.abs(maxCellVal)) * 100
        break
    }

    const cssStyle: React.CSSProperties = {
      color: fore,
      position: 'absolute',
      top: 4,
      bottom: 4,
      left: `${barZeroPosition}%`,
      width: `${cellBarPercentage}%`
    }
    if (cellBarPercentage > 0) {
      cssStyle.minWidth = '1px'
    }
    if (cellVal < 0) {
      cssStyle.backgroundColor = negative
      cssStyle.transform = `translateX(-100%)`
    } else {
      cssStyle.backgroundColor = positive
    }
    return cssStyle
  }

  public render () {
    const { data } = this.props
    const { pagination, columns, headerHeight } = this.state
    const key = new Date().getTime() // FIXME force to rerender Table to avoid bug by setting changes
    const scroll = { x: 1300, y: headerHeight }

    return (
      <AntTable
        key={key}
        className={styles.table}
        ref={(f) => this.table = f}
        dataSource={data}
        columns={columns}
        pagination={pagination}
        scroll={scroll}
        bordered
      />
    )
  }
}

export default Table
