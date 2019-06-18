import React from 'react'
import { findDOMNode } from 'react-dom'
import memoizeOne from 'memoize-one'

import { Table } from 'antd'
import { ColumnProps, TableProps } from 'antd/lib/table'
import { PaginationConfig } from 'antd/lib/pagination'
import Styles from '../View.less'

import { IExecuteSqlResponse, ISqlColumn } from '../types'
import { DEFAULT_SQL_PREVIEW_PAGE_SIZE, SQL_PREVIEW_PAGE_SIZE_OPTIONS } from '../constants'
import { getTextWidth } from 'utils/util'

export interface ISqlPreviewProps {
  loading: boolean
  response: IExecuteSqlResponse
  height?: number
  size: TableProps<any>['size']
}

interface ISqlPreviewStates {
  tableBodyHeight: number
}

export class SqlPreview extends React.PureComponent<ISqlPreviewProps, ISqlPreviewStates> {

  private static readonly TableCellPaddingWidth = 8
  private static readonly TableCellMaxWidth = 300

  private static ExcludeElems = ['.ant-table-thead', '.ant-pagination.ant-table-pagination']

  private static basePagination: PaginationConfig = {
    pageSize: DEFAULT_SQL_PREVIEW_PAGE_SIZE,
    pageSizeOptions: SQL_PREVIEW_PAGE_SIZE_OPTIONS.map((size) => size.toString()),
    showQuickJumper: true,
    showSizeChanger: true
  }

  private prepareTable = memoizeOne((columns: ISqlColumn[], resultList: any[]) => {
    const rowKey = `rowKey_${new Date().getTime()}`
    resultList.forEach((record, idx) => record[rowKey] = Object.values(record).join('_') + idx)

    const tableColumns = columns.map<ColumnProps<any>>((col) => {
      const width = SqlPreview.computeColumnWidth(resultList, col.name)
      return {
        title: col.name,
        dataIndex: col.name,
        width
      }
    })
    return { tableColumns, rowKey }
  })

  private static computeColumnWidth = (resultList: any[], columnName: string) => {
    let textList = resultList.map((item) => item[columnName])
    textList = textList.filter((text, idx) => textList.indexOf(text) === idx)
    const contentMaxWidth = textList.reduce((maxWidth, text) =>
      Math.max(maxWidth, getTextWidth(text, '700', '14px')), -Infinity)
    const titleWidth = getTextWidth(columnName, '500', '14px')
    let maxWidth = Math.max(contentMaxWidth, titleWidth) + (2 * SqlPreview.TableCellPaddingWidth) + 2
    maxWidth = Math.min(maxWidth, SqlPreview.TableCellMaxWidth)
    return maxWidth
  }

  private table = React.createRef<Table<any>>()
  public state: Readonly<ISqlPreviewStates> = { tableBodyHeight: 0 }

  public componentDidMount () {
    const tableBodyHeight = this.computeTableBody()
    this.setState({ tableBodyHeight })
  }

  public componentDidUpdate () {
    const newTableBodyHeight = this.computeTableBody()
    if (Math.abs(newTableBodyHeight - this.state.tableBodyHeight) > 5) { // FIXED table body compute vibration
      this.setState({ tableBodyHeight: newTableBodyHeight })
    }
  }

  private computeTableBody = () => {
    const tableDom = findDOMNode(this.table.current) as Element
    if (!tableDom) { return 0 }
    const excludeElemsHeight = SqlPreview.ExcludeElems.reduce((acc, exp) => {
      const elem = tableDom.querySelector(exp)
      if (!elem) { return acc }
      const style = window.getComputedStyle(elem)
      const { marginTop, marginBottom } = style
      const height = elem.clientHeight + parseInt(marginTop, 10) + parseInt(marginBottom, 10)
      return acc + height
    }, 0)
    const tableBodyHeight = this.props.height - excludeElemsHeight
    return tableBodyHeight
  }

  public render () {
    const { loading, response, size } = this.props
    const { totalCount, columns, resultList } = response
    const paginationConfig: PaginationConfig = {
      ...SqlPreview.basePagination,
      total: totalCount

    }
    const { tableColumns, rowKey } = this.prepareTable(columns, resultList)
    const scroll: TableProps<any>['scroll'] = {
      x: tableColumns.reduce((acc, col) => (col.width as number + acc), 0),
      y: this.state.tableBodyHeight
    }

    return (
      <Table
        ref={this.table}
        className={Styles.sqlPreview}
        bordered
        size={size}
        pagination={paginationConfig}
        dataSource={resultList}
        columns={tableColumns}
        scroll={scroll}
        loading={loading}
        rowKey={rowKey}
      />
    )
  }

}

export default SqlPreview
