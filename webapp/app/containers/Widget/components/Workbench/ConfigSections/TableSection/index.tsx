import * as React from 'react'
import { uuid } from 'utils/util'
import OperatorTypes from 'utils/operatorTypes'
import { IDataParams } from '../../OperatingPanel'
import { ViewModelType, IDataParamSource } from '../../Dropbox'
import { decodeMetricName } from 'containers/Widget/components/util'
import { TableCellStyleTypes, TableConditionStyleTypes, TableConditionStyleFieldTypes } from './util'

const Icon = require('antd/lib/icon')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Select = require('antd/lib/select')
const { Option } = Select
const Button = require('antd/lib/button')
const Radio = require('antd/lib/radio')
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const Modal = require('antd/lib/modal')


const styles = require('../../Workbench.less')

export interface ITableCellStyle {
  fontSize: string
  fontFamily: string
  fontWeight: string
  fontColor: string
  fontStyle: 'normal' | 'oblique'
  backgroundColor: string
  justifyContent: 'flex-start' | 'center' | 'flex-end'
}

export interface ITableHeaderConfig {
  key: string
  headerName: string
  alias: string
  visualType: ViewModelType
  isGroup: boolean
  style: ITableCellStyle
  children: ITableHeaderConfig[]
}

export interface ITableConditionStyle {
  key: string
  type: TableConditionStyleTypes,
  operatorType: OperatorTypes
  conditionValues: Array<string | number>
  colors: {
    background?: string
    fore: string
    positive?: string
    negative?: string
  },
  zeroPosition?: 'auto' | 'center'
  customTemplate?: string
}

export interface ITableColumnConfig {
  columnName: string
  alias: string
  visualType: ViewModelType
  styleType: TableCellStyleTypes
  style: ITableCellStyle
  conditionStyles: ITableConditionStyle[]
}

export interface ITableConfig {
  headerConfig: ITableHeaderConfig[]
  columnsConfig: ITableColumnConfig[]
  leftFixedColumns: string[]
  rightFixedColumns: string[]
  autoMergeCell: boolean
  withPaging: boolean
  pageSize: string
  withNoAggregators: boolean
}

export const PageSizes = [10, 20, 40, 50, 100]

interface ITableSectionProps {
  commonParams: IDataParams
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

import HeaderConfigModal, { DefaultTableCellStyle } from './HeaderConfigModal'
import ColumnConfigModal from './ColumnConfigModal'

export class TableSection extends React.PureComponent<ITableSectionProps, ITableSectionStates> {

  private pageSizeOptions = PageSizes.map((size) => (
    <Option key={size} value={size.toString()}>{size}条/页</Option>
  ))

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
    const { commonParams } = props
    const keyNames = ['cols', 'metrics', 'rows']
    const validColumns: IDataParamSource[] = Object.entries(commonParams).reduce((acc, [key, value]) => {
      if (!~keyNames.indexOf(key)) { return acc }
      if (key !== 'metrics') { return acc.concat(value.items) }

      return acc.concat(value.items.map((item) => ({
        ...item,
        alias: (item.field && item.field.alias) || decodeMetricName(item.name)
      })))
    }, [])
    return validColumns
  }

  private getValidHeaderConfig = (props: ITableSectionProps, validColumns: IDataParamSource[]) => {
    const { config } = props
    const columns = [...validColumns]

    const localHeaderConfig: ITableHeaderConfig[] = config.headerConfig
    localHeaderConfig.forEach((c) => {
      this.traverseHeaderConfig(c, null, columns)
    })

    columns.forEach((c) => {
      localHeaderConfig.push({
        key: uuid(5),
        headerName: c.name,
        alias: c.field && c.field.alias || decodeMetricName(c.name),
        visualType: c.visualType,
        isGroup: false,
        style: { ...DefaultTableCellStyle },
        children: null
      })
    })

    return localHeaderConfig
  }

  private getValidColumnConfig = (props: ITableSectionProps, validColumns: IDataParamSource[]) => {
    const { config } = props
    const validColumnConfig: ITableColumnConfig[] = []

    validColumns.forEach((column) => {
      const existedConfig = config.columnsConfig.find((item) => item.columnName === column.name)
      if (existedConfig) {
        validColumnConfig.push(existedConfig)
      } else {
        validColumnConfig.push({
          columnName: column.name,
          alias: column.field && column.field.alias || decodeMetricName(column.name),
          visualType: column.visualType,
          styleType: TableCellStyleTypes.Column,
          style: { ...DefaultTableCellStyle },
          conditionStyles: []
        })
      }
    })

    return validColumnConfig
  }

  private traverseHeaderConfig = (
    cursorConfig: ITableHeaderConfig,
    parent: ITableHeaderConfig,
    validColumns: IDataParamSource[]
  ) => {
    const { isGroup, headerName } = cursorConfig
    if (!isGroup) {
      const idx = validColumns.findIndex((c) => c.name === headerName)
      if (idx < 0) {
        if (parent) {
          parent.children.splice(parent.children.findIndex((c) => c.headerName === headerName), 1)
        }
      } else {
        validColumns.splice(idx, 1)
      }
      return
    }
    cursorConfig.children.forEach((c) => {
      this.traverseHeaderConfig(c, cursorConfig, validColumns)
    })
  }

  private selectChange = (prop) => (value) => {
    this.props.onChange(prop, value)
  }

  private switchChange = (name) => (e) => {
    this.props.onChange(name, e.target.value)
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

  private getValidFixedColumns (headerConfig: ITableHeaderConfig[], columns: IDataParamSource[]) {
    let options: JSX.Element[]
    if (!headerConfig.length) {
      options = columns.map((c) => {
        const displayName = (c.field && c.field.alias) || c.name
        return (<Option key={c.name} value={c.name}>{displayName}</Option>)
      })
    } else {
      options = headerConfig.map((c) => {
        let displayName
        if (c.isGroup) {
          displayName = c.headerName
        } else {
          const column = columns.find((column) => column.name === c.headerName)
          displayName = (column.field && column.field.alias) || column.name
        }
        return (<Option key={c.headerName} value={c.headerName}>{displayName}</Option>)
      })
    }
    return options
  }

  public render () {
    const { config } = this.props
    const {
      leftFixedColumns, rightFixedColumns,
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
            <Icon type="edit" onClick={this.showHeaderConfig} />
          </h4>
        </div>
        <div className={styles.paneBlock}>
          <h4>
            <span>单元格样式与条件</span>
            <Icon type="edit" onClick={this.showColumnConfig} />
          </h4>
        </div>
        <div className={styles.paneBlock}>
          <h4>左固定列</h4>
          <div className={styles.blockBody}>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
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
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
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
              <Col span={14}>
                <RadioGroup size="small" value={withPaging} onChange={this.switchChange('withPaging')}>
                  <RadioButton value={true}>开启</RadioButton>
                  <RadioButton value={false}>关闭</RadioButton>
                </RadioGroup>
              </Col>
              {!withPaging ? null :
                <Col span={10}>
                  <Select
                    className={styles.blockElm}
                    value={pageSize}
                    onChange={this.selectChange('pageSize')}
                  >
                    {this.pageSizeOptions}
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
      </div>
    )
  }
}

export default TableSection
