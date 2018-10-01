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
import * as classnames from 'classnames'
import * as moment from 'moment'

const AntTable = require('antd/lib/table')
const Select = require('antd/lib/select')
const Message = require('antd/lib/message')
const Option = Select.Option
import SearchFilterDropdown from '../../../../components/SearchFilterDropdown/index'
import NumberFilterDropdown from '../../../../components/NumberFilterDropdown/index'
import DateFilterDropdown from '../../../../components/DateFilterDropdown/index'

import { COLUMN_WIDTH, DEFAULT_TABLE_PAGE, DEFAULT_TABLE_PAGE_SIZE, SQL_NUMBER_TYPES, SQL_DATE_TYPES, KEY_COLUMN } from '../../../../globalConstants'
const styles = require('../../../Dashboard/Dashboard.less')

interface ITableProps {
  id?: string
  data: any[]
  // loading: boolean
  className?: string
  filterable?: boolean
  sortable?: boolean
  width: number
  height: number
  interactId?: string,
  onCheckInteract?: (itemId: number) => boolean
  onDoInteract?: (itemId: number, linkagers: any, value: any) => void
}

interface ITableStates {
  data: any[]
  sortedInfo: object
  filterDropdownVisibles: object
  filterValues: object
  pagination: object
}

export class Table extends React.PureComponent<ITableProps, ITableStates> {
  constructor (props) {
    super(props)
    this.state = {
      data: props.data,
      sortedInfo: {},
      filterDropdownVisibles: {},
      filterValues: {},
      pagination: {}
    }
  }

  public static defaultProps = {
    filterable: true,
    sortable: true
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
    // const { data, chartParams } = this.props
    // const { filterValues } = this.state
    // const { enumerationColumns } = chartParams

    // if (data.keys && data.keys.length && !Object.keys(filterValues).length) {
    //   this.setState({
    //     filterValues: this.initialFilterValues(data.keys, enumerationColumns)
    //   })
    // }

    this.setState({
      pagination: this.props.width <= 768
        ? this.pageAutoAdapted('mobile')
        : this.pageAutoAdapted('pc')
    })
  }

  public componentWillReceiveProps (nextProps) {
    if (this.props.data !== nextProps.data) {
      this.setState({
        data: nextProps.data,
        filterValues: {}
      })
    }

    this.setState({
      pagination: nextProps.width <= 768
        ? this.pageAutoAdapted('mobile')
        : this.pageAutoAdapted('pc')
    })
  }

  private initialFilterValues = (keys, enumColumns) => {
    if (enumColumns) {
      return keys.reduce((rdc, k) => {
        rdc[k] = enumColumns.indexOf(k) >= 0 ? [] : ['', '']
        return rdc
      }, {})
    } else {
      return keys.reduce((rdc, k) => {
        rdc[k] = ['', '']
        return rdc
      }, {})
    }
  }

  private handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      pagination,
      sortedInfo: sorter
    }, () => {
      this.onLoadData()
    })
  }

  private onSearchInputChange = (columnName) => (e) => {
    const filterValues = this.state.filterValues
    this.setState({
      filterValues: {
        ...filterValues,
        [columnName]: [e.target.value]
      }
    })
  }

  private onNumberInputChange = (columnName) => (newValue) => {
    const filterValues = this.state.filterValues

    this.setState({
      filterValues: {
        ...filterValues,
        [columnName]: [
          isNaN(newValue[0]) ? filterValues[columnName][0] : newValue[0],
          isNaN(newValue[1]) ? filterValues[columnName][1] : newValue[1]
        ]
      }
    })
  }

  private onRangePickerChange = (columnName) => (dates, dateStrings) => {
    this.setState({
      filterValues: {
        ...this.state.filterValues,
        [columnName]: [dateStrings[0], dateStrings[1]]
      }
    })
    this.onLoadData()
  }

  private onLoadData = () => {
    // const { data } = this.props
    // const { filterValues } = this.state

    // const { keys, types, dataSource } = data

    // let filteredSource = dataSource.slice()

    // Object.keys(filterValues).forEach((fkey) => {
    //   const filterValue = filterValues[fkey]

    //   const keyIndex = keys.findIndex((k) => k === fkey)
    //   const columnType = types[keyIndex]

    //   if (SQL_NUMBER_TYPES.indexOf(columnType) >= 0) {
    //     if (filterValue[0]) {
    //       filteredSource = filteredSource.filter((s) => s[fkey] >= Number(filterValue[0]))
    //     }
    //     if (filterValue[1]) {
    //       filteredSource = filteredSource.filter((s) => s[fkey] <= Number(filterValue[1]))
    //     }
    //   } else if (SQL_DATE_TYPES.indexOf(columnType) >= 0) {
    //     if (filterValue[0]) {
    //       filteredSource = filteredSource.filter((s) => moment(s[fkey]) >= moment(filterValue[0]))
    //     }
    //     if (filterValue[1]) {
    //       filteredSource = filteredSource.filter((s) => moment(s[fkey]) <= moment(filterValue[1]))
    //     }
    //   } else {
    //     if (filterValue[0]) {
    //       filteredSource = filteredSource.filter((s) => s[fkey].includes(filterValue[0]))
    //     }
    //   }
    // })

    // this.setState({
    //   data: {
    //     ...this.state.data,
    //     dataSource: filteredSource
    //   }
    // })
  }

  private rowClick = (record, index, event) => {
    const target = event.target
    const targetName = target.tagName
    const targetClassName = target.classList[0]
    const re = /select/g

    if (targetName === 'DIV' && re.test(targetClassName)) {
      event.stopPropagation()
      return
    }

    const { id, onCheckInteract, onDoInteract } = this.props
    const { data } = this.state

    if (onCheckInteract && onDoInteract) {
      const linkagers = onCheckInteract(Number(id))

      if (Object.keys(linkagers).length) {
        data.forEach((ds) => {
          if (ds[KEY_COLUMN] === record[KEY_COLUMN]) {
            onDoInteract(Number(id), linkagers, record[KEY_COLUMN])
          }
        })

        this.setState({
          data: {...data}
        })
      }
    }
  }

  private rowClassFilter = (record, index) =>
    this.props.interactId === record[KEY_COLUMN] ? styles.selectedRow : ''

  public render () {
    const {
      // loading,
      className,
      filterable,
      sortable,
      width,
      height
    } = this.props
    const {
      data,
      filterDropdownVisibles,
      filterValues,
      pagination
    } = this.state

    // let enums = {}
    // let columnKeys = null
    // let columnTypes = null

    // if (enumerationColumns.length) {
    //   enums = enumerationColumns.reduce((rlt, ec) => {
    //     rlt[ec] = {}
    //     return rlt
    //   }, {})

    //   dataSource.forEach((ds) => {
    //     enumerationColumns.forEach((enumColumn) => {
    //       if (!enums[enumColumn][ds[enumColumn]]) {
    //         enums[enumColumn][ds[enumColumn]] = 1
    //       }
    //     })
    //   })
    // }

    let columns = []

    if (data.length) {
      columns = Object.keys(data[0]).map((k, index) => {
        // let filterDropdown = void 0
        // let filters = null

        // const columnType = columnTypes[index]

        // if (filterable) {
        //   if (enums[k]) {
        //     filters = {
        //       filters: Object.keys(enums[k]).map((en) => ({ text: en, value: en })),
        //       onFilter: (value, record) => record[k] === value
        //     }
        //   } else {
        //     const filterValue = filterValues[k] || []

        //     if (SQL_NUMBER_TYPES.indexOf(columnType) >= 0) {
        //       filterDropdown = (
        //         <NumberFilterDropdown
        //           value={filterValue}
        //           onChange={this.onNumberInputChange(k)}
        //           onSearch={this.onLoadData}
        //         />
        //       )
        //     } else if (SQL_DATE_TYPES.indexOf(columnType) >= 0) {
        //       filterDropdown = (
        //         <DateFilterDropdown
        //           value={filterValue}
        //           onChange={this.onRangePickerChange(k)}
        //         />
        //       )
        //     } else {
        //       filterDropdown = (
        //         <SearchFilterDropdown
        //           placeholder={k}
        //           value={filterValue[0]}
        //           onChange={this.onSearchInputChange(k)}
        //           onSearch={this.onLoadData}
        //         />
        //       )
        //     }

        //     filters = {
        //       filterDropdown,
        //       filterDropdownVisible: filterDropdownVisibles[k] === undefined ? false : filterDropdownVisibles[k],
        //       onFilterDropdownVisibleChange: (visible) => {
        //         this.setState({
        //           filterDropdownVisibles: {
        //             ...filterDropdownVisibles,
        //             [k]: visible
        //           }
        //         })
        //       }
        //     }
        //   }
        // }

        // let sorters = null

        // if (sortable) {
        //   sorters = {
        //     sorter: (a, b) => {
        //       if (SQL_NUMBER_TYPES.indexOf(columnType) >= 0) {
        //         return Number(a[k]) - Number(b[k])
        //       } else {
        //         return a[k].trim() > b[k].trim() ? 1 : -1
        //       }
        //     }
        //   }
        // }

        const plainColumn = {
          title: k.toUpperCase(),
          dataIndex: k,
          key: k,
          width: COLUMN_WIDTH
        }

        return {
          ...plainColumn
          // ...filters,
          // ...sorters
        }
      })
    }

    const predictColumnsWidth = (data.length ? Object.keys(data[0]).length : 1) * COLUMN_WIDTH
    const tableWidthObj = predictColumnsWidth > width
      ? { x: predictColumnsWidth }
      : null
    const tableSize = { ...tableWidthObj, y: height - 40 - 60 }

    return (
      <AntTable
        className={className}
        // rowKey={KEY_COLUMN}
        dataSource={data}
        columns={columns}
        pagination={pagination}
        // loading={loading}
        scroll={tableSize}
        onChange={this.handleTableChange}
        onRowClick={this.rowClick}
        rowClassName={this.rowClassFilter}
        bordered
      />
    )
  }
}

export default Table
