import React from 'react'
import memoizeOne from 'memoize-one'

import { Input, Select, Row, Col, Tree, Icon } from 'antd'
import { AntTreeNode, AntTreeNodeSelectedEvent, AntTreeNodeExpandedEvent } from 'antd/lib/tree/Tree'
const { Search } = Input
const { Option } = Select
const { TreeNode } = Tree
import { SelectProps } from 'antd/lib/select'

import { ISource, IColumn, ISchema } from 'containers/Source/types'
import { IView } from '../types'
import { SQL_DATE_TYPES, SQL_NUMBER_TYPES, SQL_STRING_TYPES } from 'app/globalConstants'

import utilStyles from 'assets/less/util.less'
import Styles from 'containers/View/View.less'

interface ISourceTableProps {
  view: IView
  sources: ISource[]
  schema: ISchema
  onViewChange: (propName: keyof(IView), value: string | number) => void
  onSourceSelect: (sourceId: number) => void
  onDatabaseSelect: (sourceId: number, databaseName: string) => void
  onTableSelect: (sourceId: number, databaseName: string, tableName: string) => void
}

interface ISourceTableStates {
  filterKeyword: string
  expandedNodeKeys: string[]
  autoExpandTable: boolean
}

export class SourceTable extends React.Component<ISourceTableProps, ISourceTableStates> {

  public state: ISourceTableStates = {
    filterKeyword: '',
    expandedNodeKeys: [],
    autoExpandTable: true
  }

  private inputChange = (propName: keyof IView) => (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onViewChange(propName, e.target.value)
  }

  private selectSource = (sourceId: number) => {
    const { onViewChange, onSourceSelect } = this.props
    this.setState({
      expandedNodeKeys: [],
      autoExpandTable: true
    })
    onViewChange('sourceId', sourceId)
    onSourceSelect(sourceId)
  }

  private filterSource: SelectProps['filterOption'] = (input, option) =>
    (option.props.children as string).toLowerCase().includes(input.toLowerCase())

  private iconDatabase = <Icon key="iconDatabase" title="数据库" type="database" />
  private iconTable = <Icon key="iconTable" title="数据表" type="table" />
  private iconDate = <Icon key="iconDate" title="日期" type="calendar" />
  private iconKey = <Icon key="iconKey" title="主键" type="key" />
  private iconText = <Icon key="iconText" title="文本" type="font-size" />
  private iconValue = <Icon key="iconValue" title="数值" type="calculator" />
  private getColumnIcons (col: IColumn, primaryKeys: string[]) {
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

  private renderTableColumns =  memoizeOne((
    sourceId: number, schema: ISchema, filterKeyword: string, onDatabaseSelect: ISourceTableProps['onDatabaseSelect']) => {
      const { mapDatabases, mapTables, mapColumns } = schema
      if (!sourceId) { return null }
      const databasesInfo = mapDatabases[sourceId]
      if (!databasesInfo) { return null }

      const filterReg = filterKeyword ? new RegExp(`(${filterKeyword})`, 'gi') : null

      const treeNodes = databasesInfo.reduce((databaseNodes, dbName) => {
        const tablesInfo = mapTables[`${sourceId}_${dbName}`]
        if (!tablesInfo) {
          if (Object.values(databasesInfo).length === 1) {
            onDatabaseSelect(sourceId, dbName)
            return databaseNodes
          }
          databaseNodes.push(<TreeNode icon={this.iconDatabase} title={dbName} key={dbName} isLeaf={false} dataRef={['database', dbName]} />)
          return databaseNodes
        }
        let filterTables = tablesInfo.tables
        if (filterReg) {
          filterTables = filterTables.filter(({ name: tableName }) => {
            if (filterReg.test(tableName)) { return true }

            const columnsInfo = mapColumns[[sourceId, dbName, tableName].join('_')]
            if (!columnsInfo) { return false }
            const hasFilterColumns = columnsInfo.columns.some((col) => filterReg.test(col.name))
            return hasFilterColumns
          })
        }

        const tableNodes = filterTables.map(({ name: tableName }) => {
          const columnsInfo = mapColumns[[sourceId, dbName, tableName].join('_')]

          const columnNodes = !columnsInfo ? null : columnsInfo.columns.reduce((nodes, col) => {
            if (filterReg && !filterReg.test(col.name)) { return nodes }

            const primaryKeysRemain = [...columnsInfo.primaryKeys]
            const icons = this.getColumnIcons(col, columnsInfo.primaryKeys)
            const columnTitle = this.highlightTitle(col.name, filterReg)
            const currentNode = (
              <TreeNode title={columnTitle} icon={icons} key={`${dbName}_${tableName}_${col.name}`} isLeaf={true} dataRef={['column']} />
            )
            if (primaryKeysRemain.includes(col.name)) {
              // make the primary key column be the top
              nodes.splice(columnsInfo.primaryKeys.length - primaryKeysRemain.length, 0, currentNode)
              primaryKeysRemain.splice(primaryKeysRemain.indexOf(col.name), 1)
            } else {
              nodes.push(currentNode)
            }
            return nodes
          }, [])

          return (<TreeNode icon={this.iconTable} title={tableName} key={`${dbName}_${tableName}`} isLeaf={false} dataRef={['table', dbName, tableName]}>{columnNodes}</TreeNode>)
        })

        const nodes = Object.values(databasesInfo).length === 1 ? tableNodes
          : (<TreeNode icon={this.iconDatabase} title={dbName} key={dbName} isLeaf={false} dataRef={['database']}>{tableNodes}</TreeNode>)
        databaseNodes.push(nodes)
        return databaseNodes
      }, [])

      return treeNodes
    }
  )

  private loadTreeData = (node: AntTreeNode) => new Promise((resolve) => {
    const { dataRef } = node.props
    if (dataRef === 'column') {
      resolve()
      return
    }

    const { schema, view, onDatabaseSelect, onTableSelect } = this.props
    const { sourceId } = view
    const { mapTables, mapColumns } = schema

    const [nodeType, dbName, tableName] = dataRef
    switch (nodeType) {
      case 'database':
        if (!mapTables[`${sourceId}_${dbName}`]) {
          onDatabaseSelect(sourceId, dbName)
        }
        break
      case 'table':
        if (!mapColumns[`${sourceId}_${dbName}_${tableName}`]) {
          onTableSelect(sourceId, dbName, tableName)
        }
        break
    }
    resolve()
  })

  private treeNodeSelect = (_: string[], { node }: AntTreeNodeSelectedEvent) => {
    const { dataRef, eventKey: nodeKey } = node.props
    const [nodeType] = dataRef
    if (nodeType === 'column') { return }

    const { expandedNodeKeys } = this.state
    if (expandedNodeKeys.includes(nodeKey)) { return }

    this.setState({
      expandedNodeKeys: [...expandedNodeKeys, nodeKey],
      autoExpandTable: false
    })
  }

  private treeNodeExpand = (expandedNodeKeys: string[]) => {
    this.setState({
      expandedNodeKeys,
      autoExpandTable: false
    })
  }

  private filterKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filterKeyword = e.target.value
    const { schema, view } = this.props
    const { mapTables, mapColumns } = schema
    const expandedNodeKeys = new Set<string>()
    if (filterKeyword) {
      const regex = new RegExp(`(${filterKeyword})`, 'gi')

      Object.values(mapTables).forEach((tablesInfo) => {
        if (!tablesInfo) { return }
        const { tables, dbName, sourceId } = tablesInfo
        if (sourceId !== view.sourceId) { return }
        const shouldExpand = regex.test(dbName) ||
          tables.some(({ name: tableName }) => regex.test(tableName))
        if (shouldExpand) {
          expandedNodeKeys.add(dbName)
        }
      })

      Object.values(mapColumns).forEach((columnsInfo) => {
        if (!columnsInfo) { return }
        const { columns, tableName, dbName, sourceId } = columnsInfo
        if (sourceId !== view.sourceId) { return }
        const shouldExpand = regex.test(tableName) ||
          columns.some(({ name: columnName }) => regex.test(columnName))
        if (shouldExpand) {
          expandedNodeKeys.add(`${dbName}_${tableName}`)
          expandedNodeKeys.add(`${dbName}`)
        }
      })
    }
    this.setState({
      filterKeyword,
      autoExpandTable: true,
      expandedNodeKeys: Array.from(expandedNodeKeys)
    })
  }

  public render () {
    const { view, sources, schema, onDatabaseSelect } = this.props
    const { filterKeyword, expandedNodeKeys } = this.state
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
              showSearch
              dropdownMatchSelectWidth={false}
              placeholder="数据源"
              style={{width: '100%'}}
              value={sourceId}
              onChange={this.selectSource}
              filterOption={this.filterSource}
            >
              {sources.map(({ id, name }) => (<Option key={id.toString()} value={id}>{name}</Option>))}
            </Select>
          </Col>
          <Col span={24}>
            <Search
              placeholder="搜索表/字段名称"
              value={filterKeyword}
              onChange={this.filterKeywordChange}
            />
          </Col>
        </Row>
        <div className={Styles.tree}>
          <Tree
            showIcon
            key={view.sourceId}
            loadData={this.loadTreeData}
            onSelect={this.treeNodeSelect}
            onExpand={this.treeNodeExpand}
            expandedKeys={expandedNodeKeys}
          >
            {this.renderTableColumns(sourceId, schema, filterKeyword, onDatabaseSelect)}
          </Tree>
        </div>
      </div>
    )
  }
}

export default SourceTable
