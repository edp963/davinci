import React from 'react'
import memoizeOne from 'memoize-one'

import { Input, Select, Row, Col, Divider, Tree, Icon, Form } from 'antd'
import { AntTreeNode, AntTreeNodeSelectedEvent, AntTreeNodeExpandedEvent } from 'antd/lib/tree/Tree'
const { Search } = Input
const { Option } = Select
const { TreeNode } = Tree
const FormItem = Form.Item

import { ISource, ISourceTable, IMapTableColumns, ISourceColumn, ISourceTableColumns } from 'containers/Source/types'
import { IView } from '../types'
import { SQL_DATE_TYPES, SQL_NUMBER_TYPES, SQL_STRING_TYPES } from 'app/globalConstants'

import utilStyles from 'assets/less/util.less'
import Styles from 'containers/View/View.less'

interface ISourceTableProps {
  view: IView
  sources: ISource[]
  tables: ISourceTable[]
  mapTableColumns: IMapTableColumns
  onViewChange: (propName: keyof(IView), value: string | number) => void
  onSourceSelect: (sourceId: number) => void
  onTableSelect: (sourceId: number, tableName: string) => void
}

interface ISourceTableStates {
  filterTableColumnName: string
  expandedTables: string[]
  autoExpandTable: boolean
}

export class SourceTable extends React.Component<ISourceTableProps, ISourceTableStates> {

  public state: ISourceTableStates = {
    filterTableColumnName: '',
    expandedTables: [],
    autoExpandTable: true
  }

  private inputChange = (propName: keyof IView) => (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onViewChange(propName, e.target.value)
  }

  private selectSource = (sourceId: number) => {
    const { onSourceSelect } = this.props
    onSourceSelect(sourceId)
  }

  private iconTable = <Icon key="iconTable" title="数据表" type="table" />
  private iconDate = <Icon key="iconDate" title="日期" type="calendar" />
  private iconKey = <Icon key="iconKey" title="主键" type="key" />
  private iconText = <Icon key="iconText" title="文本" type="font-size" />
  private iconValue = <Icon key="iconValue" title="数值" type="calculator" />
  private getColumnIcons (col: ISourceColumn, primaryKeys: string[]) {
    const { type: sqlType, name } = col
    if (primaryKeys.includes(name)) { return this.iconKey }
    if (SQL_STRING_TYPES.includes(sqlType)) { return this.iconText }
    if (SQL_NUMBER_TYPES.includes(sqlType)) { return this.iconValue }
    if (SQL_DATE_TYPES.includes(sqlType)) { return this.iconDate }
  }

  private highlightTitle (title: string, regex: RegExp) {
    if (!title || !regex) { return title }
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: title.replace(regex, `<span class="${utilStyles.highlight}">$1</span>`)
        }}
      />
    )
  }

  private renderTableColumns =  memoizeOne(
    (sourceId: number, tables: ISourceTable[], map: IMapTableColumns, filterTableColumnName: string) => {
      if (!sourceId) { return [] }

      let regex: RegExp = null
      let filterTables = tables || []
      if (filterTableColumnName) {
        regex = new RegExp(`(${filterTableColumnName})`, 'gi')
        filterTables = filterTables.filter((table) =>
          regex.test(table) ||
            (map[table] && map[table].columns.some((col) => regex.test(col.name))))
      }

      const treeNodes = filterTables.map((table) => {
        const tableColumns = map[table]
        const tableTitle = this.highlightTitle(table, regex)
        if (!tableColumns) {
          return (<TreeNode icon={this.iconTable} title={tableTitle} key={table} isLeaf={false} />)
        }

        const { primaryKeys } = tableColumns
        const primaryKeysRemain = [...primaryKeys]
        let columns = tableColumns.columns
        if (regex) {
          columns = columns.filter((col) => regex.test(col.name))
        }
        return (
          <TreeNode icon={this.iconTable} title={tableTitle} key={table} isLeaf={false}>
            {
              columns.reduce((nodes, col) => {
                const icons = this.getColumnIcons(col, primaryKeys)
                const columnTitle = this.highlightTitle(col.name, regex)
                const currentNode = (
                  // make the key unique to avoid same column name under different tables
                  <TreeNode title={columnTitle} icon={icons} key={`${table}_${col.name}`} isLeaf={true} dataRef={col} />
                )
                if (primaryKeysRemain.includes(col.name)) {
                  // make the primary key column be the top
                  nodes.splice(primaryKeys.length - primaryKeysRemain.length, 0, currentNode)
                  primaryKeysRemain.splice(primaryKeysRemain.indexOf(col.name), 1)
                } else {
                  nodes.push(currentNode)
                }
                return nodes
              }, [])
            }
          </TreeNode>
        )
      })
      return treeNodes
    }
  )

  private loadTableColumns = (node: AntTreeNode) => new Promise((resolve) => {
    const { isLeaf: isColumn } = node.props
    if (isColumn) {
      resolve()
      return
    }

    const { eventKey: tableName } = node.props
    const { mapTableColumns } = this.props
    if (mapTableColumns[tableName]) { return }
    const { view, onTableSelect } = this.props
    onTableSelect(view.sourceId, tableName)
    resolve()
  })

  private tableNodeSelect = (_: string[], { node }: AntTreeNodeSelectedEvent) => {
    const { expandedTables } = this.state
    const { isLeaf: isColumn, eventKey: nodeKey } = node.props
    const { mapTableColumns } = this.props
    if (!isColumn && !mapTableColumns[nodeKey]) {
      this.setState({
        expandedTables: [...expandedTables, nodeKey],
        autoExpandTable: false
      })
    }
  }

  private tableNodeExpand = (expandedTables: string[], { node }: AntTreeNodeExpandedEvent) => {
    this.setState({
      expandedTables,
      autoExpandTable: false
    })
  }

  private filterTableColumnNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filterTableColumnName = e.target.value
    const { mapTableColumns } = this.props
    const expandedTables = []
    if (filterTableColumnName) {
      const regex = new RegExp(`(${filterTableColumnName})`, 'gi')
      Object.entries(mapTableColumns).forEach(([table, tableColumns]) => {
        if (!tableColumns) { return }
        const shouldExpand = tableColumns.columns.some((col) => regex.test(col.name))
        if (shouldExpand) {
          expandedTables.push(table)
        }
      })
    }
    this.setState({
      filterTableColumnName,
      autoExpandTable: true,
      expandedTables
    })
  }

  public render () {
    const { view, sources, tables, mapTableColumns } = this.props
    const { filterTableColumnName, expandedTables } = this.state
    const { name: viewName, description: viewDesc, sourceId } = view

    return (
      <div className={Styles.sourceTable}>
        <Row gutter={16}>
          <Col span={24}>
            <Input placeholder="名称" value={viewName} onChange={this.inputChange('name')} />
          </Col>
          <Col span={24}>
            <Input placeholder="描述" value={viewDesc} onChange={this.inputChange('description')} />
          </Col>
          <Col span={24}>
            <Select
              placeholder="数据源"
              style={{width: '100%'}}
              value={sourceId}
              onChange={this.selectSource}
            >
              {sources.map(({ id, name }) => (<Option key={id.toString()} value={id}>{name}</Option>))}
            </Select>
          </Col>
          <Col span={24}>
            <Search
              placeholder="搜索表/字段名称"
              value={filterTableColumnName}
              onChange={this.filterTableColumnNameChange}
            />
          </Col>
        </Row>
        <div className={Styles.tree}>
          <Tree
            showIcon
            loadData={this.loadTableColumns}
            onSelect={this.tableNodeSelect}
            onExpand={this.tableNodeExpand}
            expandedKeys={expandedTables}
          >
            {this.renderTableColumns(sourceId, tables, mapTableColumns, filterTableColumnName)}
          </Tree>
        </div>
      </div>
    )
  }
}

export default SourceTable
