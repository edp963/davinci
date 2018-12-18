import * as React from 'react'
import { TableRowSelection } from 'antd/lib/table/Table'
import {
  PIVOT_DEFAULT_FONT_COLOR,
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_CHART_FONT_SIZES,
  PIVOT_CHART_FONT_WEIGHTS,
  PIVOT_CHART_FONT_STYLE,
  DEFAULT_FONT_STYLE,
  PIVOT_DEFAULT_HEADER_BACKGROUND_COLOR } from '../../../../../../../app/globalConstants'
import { uuid } from 'utils/util'
import { fontWeightOptions, fontStyleOptions, fontFamilyOptions, fontSizeOptions } from './util'
import TableSection, { ITableHeaderConfig, ITableCellStyle } from './'

import Icon from 'antd/lib/icon'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Modal from 'antd/lib/modal'
import Input from 'antd/lib/input'
const Search = Input.Search
import Button from 'antd/lib/button'
import Radio from 'antd/lib/radio'
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
import Checkbox from 'antd/lib/checkbox'
import Select from 'antd/lib/select'
const Option = Select.Option
import Table from 'antd/lib/table'
import Message from 'antd/lib/message'

import ColorPicker from 'components/ColorPicker'
import { fromJS } from 'immutable'

const styles = require('./TableSection.less')

export const DefaultTableCellStyle: ITableCellStyle = {
  fontSize: '12',
  fontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
  fontWeight: PIVOT_CHART_FONT_WEIGHTS[0],
  fontColor: PIVOT_DEFAULT_FONT_COLOR,
  fontStyle: DEFAULT_FONT_STYLE,
  backgroundColor: PIVOT_DEFAULT_HEADER_BACKGROUND_COLOR,
  justifyContent: 'flex-start'
}

interface IHeaderConfigModalProps {
  visible: boolean
  config: ITableHeaderConfig[]
  onCancel: () => void
  onSave: (config: ITableHeaderConfig[]) => void
}

interface IHeaderConfigModalStates {
  localConfig: ITableHeaderConfig[]
  currentEditingConfig: ITableHeaderConfig
  expandedRowKeys: string[]
  currentSelectedKeys: string[]
  mapHeader: { [key: string]: ITableHeaderConfig }
  mapHeaderParent: { [key: string]: ITableHeaderConfig }
}

export class HeaderConfigModal extends React.PureComponent<IHeaderConfigModalProps, IHeaderConfigModalStates> {

  public constructor (props: IHeaderConfigModalProps) {
    super(props)
    const localConfig = fromJS(props.config).toJS()
    const [mapHeader, mapHeaderParent] = this.getMapHeaderKeyAndConfig(localConfig)
    this.state = {
      localConfig,
      currentEditingConfig: null,
      expandedRowKeys: [],
      mapHeader,
      mapHeaderParent,
      currentSelectedKeys: []
    }
  }

  public componentWillReceiveProps (nextProps: IHeaderConfigModalProps) {
    if (nextProps.config === this.props.config) { return }
    const localConfig = fromJS(nextProps.config).toJS()
    const [mapHeader, mapHeaderParent] = this.getMapHeaderKeyAndConfig(localConfig)
    this.setState({
      localConfig,
      mapHeader,
      mapHeaderParent,
      currentSelectedKeys: []
    })
  }

  private getMapHeaderKeyAndConfig (config: ITableHeaderConfig[]): [{ [key: string]: ITableHeaderConfig }, { [key: string]: ITableHeaderConfig }] {
    const map: { [key: string]: ITableHeaderConfig } = {}
    const mapParent: { [key: string]: ITableHeaderConfig } = {}
    config.forEach((c) => this.traverseHeaderConfig(c, null, (cursorConfig, parentConfig) => {
      map[cursorConfig.key] = cursorConfig
      mapParent[cursorConfig.key] = parentConfig
      return false
    }))
    return [map, mapParent]
  }

  private mergeColumns = () => {
    const { localConfig, mapHeader, mapHeaderParent, currentSelectedKeys } = this.state
    if (currentSelectedKeys.length <= 0) {
      Message.warning('请勾选要合并的列')
      return
    }
    const ancestors = []
    currentSelectedKeys.forEach((key) => {
      let cursorConfig = mapHeader[key]
      while (true) {
        if (~currentSelectedKeys.indexOf(cursorConfig.key)) {
          const parent = mapHeaderParent[cursorConfig.key]
          if (!parent) { break }
          cursorConfig = parent
        } else {
          break
        }
      }
      if (!~ancestors.findIndex((c) => c.key === cursorConfig.key)) {
        ancestors.push(cursorConfig)
      }
    })

    const isTop = ancestors.every((config) => !mapHeaderParent[config.key])
    if (!isTop) {
      Message.warning('勾选的列应是当前最上级列')
      return
    }

    const insertConfig: ITableHeaderConfig = {
      key: uuid(5),
      headerName: `新建合并列`,
      alias: null,
      visualType: null,
      isGroup: true,
      style: { ...DefaultTableCellStyle },
      children: ancestors
    }

    let minIdx = localConfig.length - ancestors.length - 1
    minIdx = ancestors.reduce((min, config) => Math.min(min,
      localConfig.findIndex((c) => c.key === config.key)), minIdx)
    const ancestorKeys = ancestors.map((c) => c.key)
    const newLocalConfig = localConfig.filter((c) => !~ancestorKeys.indexOf(c.key))
    newLocalConfig.splice(minIdx, 0, insertConfig)
    const [newMapHeader, newMapHeaderParent] = this.getMapHeaderKeyAndConfig(newLocalConfig)

    this.setState({
      localConfig: newLocalConfig,
      mapHeader: newMapHeader,
      mapHeaderParent: newMapHeaderParent,
      currentEditingConfig: insertConfig,
      expandedRowKeys: [insertConfig.key]
    })
  }

  private cancel = () => {
    this.props.onCancel()
  }

  private save = () => {
    this.props.onSave(this.state.localConfig)
  }

  private traverseHeaderConfig (
    config: ITableHeaderConfig,
    parentConfig: ITableHeaderConfig,
    cb: (cursorConfig: ITableHeaderConfig, parentConfig?: ITableHeaderConfig) => boolean
  ) {
    let hasFound = cb(config, parentConfig)
    if (hasFound) { return hasFound }
    hasFound = Array.isArray(config.children) &&
      config.children.some((c) => this.traverseHeaderConfig(c, config, cb))
    return hasFound
  }

  private propChange = (record: ITableHeaderConfig, propName) => (e) => {
    const value = e.target ? e.target.value : e
    const { localConfig } = this.state
    const { key } = record
    const cb = (cursorConfig: ITableHeaderConfig) => {
      const isTarget = key === cursorConfig.key
      if (isTarget) {
        cursorConfig.style[propName] = value
      }
      return isTarget
    }
    localConfig.some((config) => this.traverseHeaderConfig(config, null, cb))
    this.setState({
      localConfig: [...localConfig]
    })
  }

  private editHeaderName = (key: string) => () => {
    const { localConfig } = this.state
    localConfig.some((config) => (
      this.traverseHeaderConfig(config, null, (cursorConfig) => {
        const hasFound = cursorConfig.key === key
        if (hasFound) {
          this.setState({
            currentEditingConfig: cursorConfig
          })
        }
        return hasFound
      })
    ))
  }

  private deleteHeader = (key: string) => () => {
    const { localConfig, mapHeader, mapHeaderParent } = this.state
    localConfig.some((config) => (
      this.traverseHeaderConfig(config, null, (cursorConfig) => {
        const hasFound = cursorConfig.key === key
        if (hasFound) {
          const parent = mapHeaderParent[cursorConfig.key]
          let idx
          if (parent) {
            idx = parent.children.findIndex((c) => c.key === cursorConfig.key)
            parent.children.splice(idx, 1, ...cursorConfig.children)
          } else {
            idx = localConfig.findIndex((c) => c.key === cursorConfig.key)
            localConfig.splice(idx, 1, ...cursorConfig.children)
          }
        }
        return hasFound
      })
    ))
    const [newMapHeader, newMapHeaderParent] = this.getMapHeaderKeyAndConfig(localConfig)
    this.setState({
      mapHeader: newMapHeader,
      mapHeaderParent: newMapHeaderParent,
      localConfig
    })
  }

  private saveEditingHeaderName = (e) => {
    const value = e.target.value
    if (!value) {
      Message.warning('请输入和并列名称')
      return
    }
    const { localConfig, currentEditingConfig } = this.state
    localConfig.some((config) => (
      this.traverseHeaderConfig(config, null, (cursorConfig) => {
        const hasFound = cursorConfig.key === currentEditingConfig.key
        if (hasFound) {
          cursorConfig.headerName = value
        }
        return hasFound
      })
    ))
    this.setState({
      localConfig: [...localConfig],
      currentEditingConfig: null
    })
  }

  private columns = [{
    title: '表格列',
    dataIndex: 'headerName',
    key: 'headerName',
    render: (_, record: ITableHeaderConfig) => {
      const { currentEditingConfig } = this.state
      const { key, headerName, alias, isGroup } = record
      if (!currentEditingConfig || currentEditingConfig.key !== key) {
        return isGroup ? (
          <span className={styles.tableEditCell}>
            <label>{alias || headerName}</label>
            <Icon type="edit" onClick={this.editHeaderName(key)} />
            <Icon type="delete" onClick={this.deleteHeader(key)} />
          </span>
        ) : (<label>{alias || headerName}</label>)
      }
      const { headerName: currentEditingHeaderName } = currentEditingConfig
      return (
        <Input
          className={styles.tableInput}
          defaultValue={currentEditingHeaderName}
          onPressEnter={this.saveEditingHeaderName}
        />
      )
    }
  }, {
    title: '背景色',
    dataIndex: 'backgroundColor',
    key: 'backgroundColor',
    width: 55,
    render: (_, record: ITableHeaderConfig) => {
      const { style } = record
      const { backgroundColor } = style
      return (
        <ColorPicker
          className={styles.color}
          value={backgroundColor}
          onChange={this.propChange(record, 'backgroundColor')}
        />
      )
    }
  }, {
    title: '字体',
    dataIndex: 'font',
    key: 'font',
    width: 250,
    render: (_, record: ITableHeaderConfig) => {
      const { style } = record
      const { fontSize, fontFamily, fontColor, fontStyle, fontWeight } = style
      return (
        <div className={styles.rows}>
          <Row gutter={8} type="flex" align="middle" className={styles.rowBlock}>
            <Col span={14}>
              <Select
                className={styles.colControl}
                placeholder="字体"
                value={fontFamily}
                onChange={this.propChange(record, 'fontFamily')}
              >
                {fontFamilyOptions}
              </Select>
            </Col>
            <Col span={6}>
              <Select
                className={styles.colControl}
                placeholder="文字大小"
                value={fontSize}
                onChange={this.propChange(record, 'fontSize')}
              >
                {fontSizeOptions}
              </Select>
            </Col>
            <Col span={4}>
              <ColorPicker
                className={styles.color}
                value={fontColor}
                onChange={this.propChange(record, 'fontColor')}
              />
            </Col>
          </Row>
          <Row gutter={8} type="flex" align="middle" className={styles.rowBlock}>
            <Col span={12}>
              <Select
                className={styles.colControl}
                value={fontStyle}
                onChange={this.propChange(record, 'fontStyle')}
              >
                {fontStyleOptions}
              </Select>
            </Col>
            <Col span={12}>
              <Select
                className={styles.colControl}
                value={fontWeight}
                onChange={this.propChange(record, 'fontWeight')}
              >
                {fontWeightOptions}
              </Select>
            </Col>
          </Row>
        </div>
      )
    }
  }, {
    title: '对齐',
    dataIndex: 'justifyContent',
    key: 'justifyContent',
    width: 215,
    render: (_, record: ITableHeaderConfig) => {
      const { style } = record
      const { justifyContent } = style
      return (
        <RadioGroup value={justifyContent} onChange={this.propChange(record, 'justifyContent')}>
          <RadioButton value="flex-start">左对齐</RadioButton>
          <RadioButton value="center">居中</RadioButton>
          <RadioButton value="flex-end">右对齐</RadioButton>
        </RadioGroup>
      )
    }
  }]

  private modalFooter = [(
    <Button
      key="cancel"
      size="large"
      onClick={this.cancel}
    >
      取 消
    </Button>
  ), (
    <Button
      key="submit"
      size="large"
      type="primary"
      onClick={this.save}
    >
      保 存
    </Button>
  )]

  private rowSelection: TableRowSelection<ITableHeaderConfig> = {
    hideDefaultSelections: true,
    onChange: (selectedRowKeys: string[], selectedRows) => {
      console.log(selectedRowKeys)
      console.log(selectedRows)
      this.setState({
        currentSelectedKeys: selectedRowKeys
      })
    }
  }

  public render () {
    const { visible } = this.props
    const { localConfig, expandedRowKeys } = this.state

    return (
      <Modal
        title="表头样式与分组"
        width={1000}
        maskClosable={false}
        footer={this.modalFooter}
        visible={visible}
        onCancel={this.cancel}
        onOk={this.save}
      >
        <div className={styles.rows}>
          <Row gutter={8} className={styles.rowBlock}>
            <Col span={24}>
              <Button type="primary" onClick={this.mergeColumns}>合并</Button>
            </Col>
          </Row>
          <Row gutter={8} className={styles.rowBlock}>
            <Col span={24}>
              <Table
                bordered={true}
                pagination={false}
                columns={this.columns}
                dataSource={localConfig}
                rowSelection={this.rowSelection}
              />
            </Col>
          </Row>
        </div>
      </Modal>
    )
  }
}

export default HeaderConfigModal
