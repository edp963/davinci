import React from 'react'
import produce from 'immer'
import { uuid } from 'utils/util'
import { IDataParams } from '../../OperatingPanel'
import { IDataParamSource } from '../../Dropbox'
import { getFieldAlias } from 'containers/Widget/components/Config/Field'
import { decodeMetricName, getAggregatorLocale } from 'containers/Widget/components/util'

import {
  ITableConfig, ITableHeaderConfig, ITableColumnConfig,
  TableCellStyleTypes, DefaultTableCellStyle } from 'containers/Widget/components/Config/Table'
import { pageSizeOptions } from './constants'

import { Icon, Row, Col, Select, Radio, Checkbox, Modal } from 'antd'
const { Option } = Select
const RadioGroup = Radio.Group
const RadioButton = Radio.Button

const HeaderConfigModal = React.lazy(() => import('containers/Widget/components/Config/Table/Header/HeaderConfigModal'))
const ColumnConfigModal = React.lazy(() => import('containers/Widget/components/Config/Table/Column/ColumnConfigModal'))

const styles = require('../../Workbench.less')

interface ITableSectionProps {
  dataParams: IDataParams
  config: ITableConfig
  onChange: (prop: string, value: any) => void
}

interface ITableSectionStates {
  headerConfigModalVisible: boolean
  columnConfigModalVisible: boolean
  validColumns: IDataParamSource[]
  validHeaderConfig: ITableHeaderConfig[]
  validColumnConfig: ITableColumnConfig[]
}

export class TableSection extends React.PureComponent<ITableSectionProps, ITableSectionStates> {

  public constructor (props) {
    super(props)
    const validColumns = this.getCurrentTableColumns(props)
    const validHeaderConfig = this.getValidHeaderConfig(props, validColumns)
    const validColumnConfig = this.getValidColumnConfig(props, validColumns)
    this.state = {
      headerConfigModalVisible: false,
      columnConfigModalVisible: false,
      validColumns,
      validHeaderConfig,
      validColumnConfig
    }
  }

  public componentWillReceiveProps (nextProps: ITableSectionProps) {
    const validColumns = this.getCurrentTableColumns(nextProps)
    const validHeaderConfig = this.getValidHeaderConfig(nextProps, validColumns)
    const validColumnConfig = this.getValidColumnConfig(nextProps, validColumns)
    this.setState({
      validColumns,
      validHeaderConfig,
      validColumnConfig
    })
  }

  private getCurrentTableColumns (props: ITableSectionProps) {
    const { dataParams } = props
    const keyNames = ['cols', 'metrics', 'rows']

    const validColumns: IDataParamSource[] = produce(dataParams, (draft) => {
      const columns = Object.entries(draft).reduce((acc, [key, value]) => {
        if (!~keyNames.indexOf(key)) { return acc }
        if (key !== 'metrics') { return acc.concat(value.items) }

        return acc.concat(value.items.map((item) => ({
          ...item,
          alias: this.getColumnDisplayName(item)
        })))
      }, [])
      return columns
    })
    return validColumns
  }

  private getValidHeaderConfig = (props: ITableSectionProps, validColumns: IDataParamSource[]) => {
    const { config } = props
    const columns = [...validColumns]

    const localHeaderConfig = produce(config.headerConfig, (draft) => {
      this.traverseHeaderConfig(draft, columns)

      let dimensionIdx = 0
      columns.forEach((c) => {
        const cfg = {
          key: uuid(5),
          headerName: c.name,
          alias: this.getColumnDisplayName(c),
          visualType: c.visualType,
          isGroup: false,
          style: { ...DefaultTableCellStyle },
          children: null
        }

        if (c.agg) {
          draft.push(cfg)
        } else {
          draft.splice(dimensionIdx++, 0, cfg)
        }
      })

    })
    return localHeaderConfig
  }

  private getValidColumnConfig = (props: ITableSectionProps, validColumns: IDataParamSource[]) => {
    const { config } = props

    const validColumnConfig = produce(config.columnsConfig, (draft) => {
      const config: ITableColumnConfig[] = []

      validColumns.forEach((column) => {
        const existedConfig = draft.find((item) => item.columnName === column.name)
        if (existedConfig) {
          config.push({
            ...existedConfig,
            alias: this.getColumnDisplayName(column),
            visualType: column.visualType
          })
        } else {
          config.push({
            columnName: column.name,
            alias: this.getColumnDisplayName(column),
            visualType: column.visualType,
            styleType: TableCellStyleTypes.Column,
            style: { ...DefaultTableCellStyle },
            conditionStyles: []
          })
        }
      })

      return config
    })
    return validColumnConfig
  }

  private traverseHeaderConfig = (
    cursorConfig: ITableHeaderConfig[],
    validColumns: IDataParamSource[]
  ) => {
    cursorConfig.sort((cfg1, cfg2) => {
      if (cfg1.isGroup || cfg2.isGroup) { return 0 }
      const cfg1Idx = validColumns.findIndex((column) => column.name === cfg1.headerName)
      const cfg2Idx = validColumns.findIndex((column) => column.name === cfg2.headerName)
      return cfg1Idx - cfg2Idx
    })

    for (let idx = cursorConfig.length - 1; idx >= 0; idx--) {
      const currentConfig = cursorConfig[idx]
      const { isGroup, headerName } = currentConfig
      if (!isGroup) {
        const columnIdx = validColumns.findIndex((c) => c.name === headerName)
        if (columnIdx < 0) {
          cursorConfig.splice(idx, 1)
        } else {
          const column = validColumns[columnIdx]
          currentConfig.alias = this.getColumnDisplayName(column)
          currentConfig.visualType = column.visualType
          validColumns.splice(columnIdx, 1)
        }
      }
      if (Array.isArray(currentConfig.children) && currentConfig.children.length) {
        this.traverseHeaderConfig(currentConfig.children, validColumns)
      }
    }
  }

  private selectChange = (prop) => (value) => {
    this.props.onChange(prop, value)
  }

  private switchChange = (name) => (e) => {
    this.props.onChange(name, e.target.value)
  }

  private checkboxChange = (name) => (e) => {
    this.props.onChange(name, e.target.checked)
  }

  private deleteHeaderConfig = () => {
    const { onChange } = this.props
    Modal.confirm({
      title: '确认删除表头样式与分组？',
      onOk: () => {
        onChange('headerConfig', [])
      }
    })
  }

  private showHeaderConfig = () => {
    this.setState({
      headerConfigModalVisible: true
    })
  }

  private closeHeaderConfig = () => {
    this.setState({
      headerConfigModalVisible: false
    })
  }

  private saveHeaderConfig = (config: ITableHeaderConfig[]) => {
    const { onChange } = this.props
    onChange('headerConfig', config)
    const validFixedColumns = config.map((c) => c.headerName)
    const { config: tableConfig } = this.props
    let { leftFixedColumns, rightFixedColumns } = tableConfig
    leftFixedColumns = leftFixedColumns.filter((col) => ~validFixedColumns.indexOf(col))
    rightFixedColumns = rightFixedColumns.filter((col) => ~validFixedColumns.indexOf(col))
    this.selectChange('leftFixedColumns')(leftFixedColumns)
    this.selectChange('rightFixedColumns')(rightFixedColumns)
    this.setState({
      headerConfigModalVisible: false
    })
  }

  private deleteColumnConfig = () => {
    const { onChange } = this.props
    Modal.confirm({
      title: '确认删除表格数据列设置？',
      onOk: () => {
        onChange('columnsConfig', [])
      }
    })
  }

  private showColumnConfig = () => {
    this.setState({
      columnConfigModalVisible: true
    })
  }

  private closeColumnConfig = () => {
    this.setState({
      columnConfigModalVisible: false
    })
  }

  private saveColumnConfig = (config: ITableColumnConfig[]) => {
    const { onChange } = this.props
    onChange('columnsConfig', config)
    this.setState({
      columnConfigModalVisible: false
    })
  }

  private getColumnDisplayName (column: IDataParamSource) {
    let displayName = `${decodeMetricName(column.name)}`
    if (column.agg) {
      displayName = `[${getAggregatorLocale(column.agg)}]${displayName}`
    }
    const alias = getFieldAlias(column.field, {})
    if (alias) {
      displayName = `${displayName}[${alias}]`
    }
    return displayName
  }

  private getValidFixedColumns (headerConfig: ITableHeaderConfig[], columns: IDataParamSource[]) {
    let options: JSX.Element[]
    if (!headerConfig.length) {
      options = columns.map((c) => {
        const displayName = this.getColumnDisplayName(c)
        return (<Option key={c.name} value={c.name}>{displayName}</Option>)
      })
    } else {
      options = headerConfig
        .filter((c) => c.isGroup || ~columns.findIndex((column) => column.name === c.headerName))
        .map((c) => {
          let displayName
          if (c.isGroup) {
            displayName = c.headerName
          } else {
            const column = columns.find((column) => column.name === c.headerName)
            displayName = this.getColumnDisplayName(column)
          }
          return (<Option key={c.headerName} value={c.headerName}>{displayName}</Option>)
        })
    }
    return options
  }

  public render () {
    const { config } = this.props
    const {
      leftFixedColumns, rightFixedColumns, headerFixed, bordered, size,
      autoMergeCell, withPaging, pageSize, withNoAggregators } = config
    const {
      validColumns, validHeaderConfig, validColumnConfig,
      headerConfigModalVisible, columnConfigModalVisible } = this.state
    const fixedColumnOptions = this.getValidFixedColumns(validHeaderConfig, validColumns)


    return (
      <div>
        <div className={styles.paneBlock}>
          <h4>
            <span>表头样式与分组</span>
            <Icon type="delete" onClick={this.deleteHeaderConfig} />
            <Icon type="edit" onClick={this.showHeaderConfig} />
          </h4>
        </div>
        <div className={styles.paneBlock}>
          <h4>
            <span>表格数据列</span>
            <Icon type="delete" onClick={this.deleteColumnConfig} />
            <Icon type="edit" onClick={this.showColumnConfig} />
          </h4>
        </div>
        <div className={styles.paneBlock}>
          <div className={styles.blockBody}>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={12}>
                <Checkbox checked={headerFixed} onChange={this.checkboxChange('headerFixed')}>固定表头</Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox checked={bordered} onChange={this.checkboxChange('bordered')}>边框</Checkbox>
              </Col>
            </Row>
          </div>
        </div>
        <div className={styles.paneBlock}>
          <h4>左固定列</h4>
          <div className={styles.blockBody}>
            <Row gutter={8} type="flex" align="middle" className={styles.rowBlock}>
              <Col span={24}>
                <Select
                  className={styles.blockElm}
                  mode="tags"
                  value={leftFixedColumns}
                  onChange={this.selectChange('leftFixedColumns')}
                >
                  {fixedColumnOptions}
                </Select>
              </Col>
            </Row>
          </div>
        </div>
        <div className={styles.paneBlock}>
          <h4>右固定列</h4>
          <div className={styles.blockBody}>
            <Row gutter={8} type="flex" align="middle" className={styles.rowBlock}>
              <Col span={24}>
                <Select
                  className={styles.blockElm}
                  mode="tags"
                  value={rightFixedColumns}
                  onChange={this.selectChange('rightFixedColumns')}
                >
                  {fixedColumnOptions}
                </Select>
              </Col>
            </Row>
          </div>
        </div>
        <div className={styles.paneBlock}>
          <h4>大小</h4>
          <div className={styles.blockBody}>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={24}>
                <RadioGroup size="small" value={size} onChange={this.switchChange('size')}>
                  <RadioButton value="small">小</RadioButton>
                  <RadioButton value="middle">中</RadioButton>
                  <RadioButton value="default">大</RadioButton>
                </RadioGroup>
              </Col>
            </Row>
          </div>
        </div>
        <div className={styles.paneBlock}>
          <h4>自动合并相同内容</h4>
          <div className={styles.blockBody}>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={24}>
                <RadioGroup size="small" value={autoMergeCell} onChange={this.switchChange('autoMergeCell')}>
                  <RadioButton value={true}>开启</RadioButton>
                  <RadioButton value={false}>关闭</RadioButton>
                </RadioGroup>
              </Col>
            </Row>
          </div>
        </div>
        <div className={styles.paneBlock}>
          <h4>分页</h4>
          <div className={styles.blockBody}>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={12}>
                <RadioGroup size="small" value={withPaging} onChange={this.switchChange('withPaging')}>
                  <RadioButton value={true}>开启</RadioButton>
                  <RadioButton value={false}>关闭</RadioButton>
                </RadioGroup>
              </Col>
              {!withPaging ? null :
                <Col span={12}>
                  <Select
                    size="small"
                    className={styles.blockElm}
                    value={pageSize}
                    onChange={this.selectChange('pageSize')}
                  >
                    {pageSizeOptions}
                  </Select>
                </Col>}
            </Row>
          </div>
        </div>
        <div className={styles.paneBlock}>
          <h4>使用原始数据</h4>
          <div className={styles.blockBody}>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
              <Col span={24}>
                <RadioGroup size="small" value={withNoAggregators} onChange={this.switchChange('withNoAggregators')}>
                  <RadioButton value={true}>开启</RadioButton>
                  <RadioButton value={false}>关闭</RadioButton>
                </RadioGroup>
              </Col>
            </Row>
          </div>
        </div>
        <React.Suspense fallback={null}>
          <HeaderConfigModal
            visible={headerConfigModalVisible}
            config={validHeaderConfig}
            onCancel={this.closeHeaderConfig}
            onSave={this.saveHeaderConfig}
          />
          <ColumnConfigModal
            visible={columnConfigModalVisible}
            config={validColumnConfig}
            onCancel={this.closeColumnConfig}
            onSave={this.saveColumnConfig}
          />
        </React.Suspense>
      </div>
    )
  }
}

export default TableSection
