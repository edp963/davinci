import * as React from 'react'
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

import {
  PIVOT_DEFAULT_FONT_COLOR,
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_CHART_FONT_SIZES,
  PIVOT_CHART_FONT_WEIGHTS,
  PIVOT_CHART_FONT_STYLE,
  DEFAULT_FONT_STYLE,
  PIVOT_DEFAULT_HEADER_BACKGROUND_COLOR } from '../../../../../../../app/globalConstants'

const styles = require('../../Workbench.less')

export interface ITableCellStyle {
  fontSize: string
  fontFamily: string
  fontWeight: string
  fontColor: string
  fontStyle: 'normal' | 'oblique'
  backgroundColor: string
  textAlign: 'left' | 'center' | 'right'
}

export interface ITableHeaderConfig {
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
  headerConfigModalVisible: boolean,
  columnConfigModalVisible: boolean,
  validHeaderConfig: ITableHeaderConfig[]
  validColumnConfig: ITableColumnConfig[]
}

import HeaderConfigModal from './HeaderConfigModal'
import ColumnConfigModal from './ColumnConfigModal'

export class TableSection extends React.PureComponent<ITableSectionProps, ITableSectionStates> {

  private defaultTableCellStyle: ITableCellStyle = {
    fontSize: '12',
    fontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
    fontWeight: PIVOT_CHART_FONT_WEIGHTS[0],
    fontColor: PIVOT_DEFAULT_FONT_COLOR,
    fontStyle: DEFAULT_FONT_STYLE,
    backgroundColor: PIVOT_DEFAULT_HEADER_BACKGROUND_COLOR,
    textAlign: 'left'
  }

  private pageSizeOptions = PageSizes.map((size) => (
    <Option key={size} value={size.toString()}>{size}条/页</Option>
  ))

  public constructor (props) {
    super(props)
    this.state = {
      headerConfigModalVisible: false,
      columnConfigModalVisible: false,
      validHeaderConfig: [],
      validColumnConfig: []
    }
  }

  private getCurrentTableColumns = () => {
    const { commonParams } = this.props
    const keyNames = ['cols', 'metrics', 'rows']
    const validColumns: IDataParamSource[] = Object.entries(commonParams).reduce((acc, [key, value]) => {
      if (!~keyNames.indexOf(key)) { return acc }
      if (key !== 'metrics') { return acc.concat(value.items) }

      return acc.concat(value.items.map((item) => ({
        ...item,
        alias: item.alias || decodeMetricName(item.name)
      })))
    }, [])
    return validColumns
  }

  private getValidHeaderConfig = (cb: () => void) => {
    const { config } = this.props
    const validColumns = this.getCurrentTableColumns()

    const localHeaderConfig: ITableHeaderConfig[] = config.headerConfig
    localHeaderConfig.forEach((c) => {
      this.traverseHeaderConfig(c, null, validColumns)
    })

    validColumns.forEach((c) => {
      localHeaderConfig.push({
        headerName: c.name,
        alias: c.alias,
        visualType: c.visualType,
        isGroup: false,
        style: { ...this.defaultTableCellStyle },
        children: null
      })
    })

    this.setState({
      validHeaderConfig: localHeaderConfig
    }, cb)
  }

  private getValidColumnConfig = (cb: () => void) => {
    const { config } = this.props
    const validColumns = this.getCurrentTableColumns()
    const validColumnConfig: ITableColumnConfig[] = []

    validColumns.forEach((column) => {
      const existedConfig = config.columnsConfig.find((item) => item.columnName === column.name)
      if (existedConfig) {
        validColumnConfig.push(existedConfig)
      } else {
        validColumnConfig.push({
          columnName: column.name,
          alias: column.alias,
          visualType: column.visualType,
          styleType: TableCellStyleTypes.Column,
          style: { ...this.defaultTableCellStyle },
          conditionStyles: []
        })
      }
    })

    this.setState({
      validColumnConfig
    }, cb)
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
    this.getValidHeaderConfig(() => {
      this.setState({
        headerConfigModalVisible: true
      })
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
    this.setState({
      headerConfigModalVisible: false
    })
  }

  private showColumnConfig = () => {
    this.getValidColumnConfig(() => {
      this.setState({
        columnConfigModalVisible: true
      })
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

  public render () {
    const { config } = this.props
    const validColumns = this.getCurrentTableColumns()
    const {
      leftFixedColumns, rightFixedColumns,
      autoMergeCell, withPaging, pageSize, withNoAggregators } = config
    const {
      validHeaderConfig, validColumnConfig,
      headerConfigModalVisible, columnConfigModalVisible } = this.state

    const fixedColumnOptions = validColumns.map((c) => {
      const displayName = c.alias || c.name
      return (<Option key={c.name} value={c.name}>{displayName}</Option>)
    })

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
                <RadioGroup value={autoMergeCell} onChange={this.switchChange('autoMergeCell')}>
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
                <RadioGroup value={withPaging} onChange={this.switchChange('withPaging')}>
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
                <RadioGroup value={withNoAggregators} onChange={this.switchChange('withNoAggregators')}>
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
