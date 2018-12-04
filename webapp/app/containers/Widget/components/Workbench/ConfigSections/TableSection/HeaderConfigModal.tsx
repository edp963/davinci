import * as React from 'react'
import { TableRowSelection } from 'antd/lib/table/Table'
import { fontWeightOptions, fontStyleOptions, fontFamilyOptions, fontSizeOptions } from './util'
import TableSection, { ITableHeaderConfig, ITableCellStyle } from './'

const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Modal = require('antd/lib/modal')
const Input = require('antd/lib/input')
const Search = Input.Search
const Button = require('antd/lib/button')
const Radio = require('antd/lib/radio')
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const Checkbox = require('antd/lib/checkbox')
const Select = require('antd/lib/select')
const Option = Select.Option
const Table = require('antd/lib/table')
const Message = require('antd/lib/message')

import ColorPicker from 'components/ColorPicker'
import { fromJS } from 'immutable'

const styles = require('./TableSection.less')

interface IHeaderConfigModalProps {
  visible: boolean
  config: ITableHeaderConfig[]
  onCancel: () => void
  onSave: (config: ITableHeaderConfig[]) => void
}

interface IHeaderConfigModalStates {
  localConfig: ITableHeaderConfig[],
  currentSelectedHeaderNames: string[]
}

export class HeaderConfigModal extends React.PureComponent<IHeaderConfigModalProps, IHeaderConfigModalStates> {

  public constructor (props: IHeaderConfigModalProps) {
    super(props)
    this.state = {
      localConfig: fromJS(props.config).toJS(),
      currentSelectedHeaderNames: []
    }
  }

  public componentWillReceiveProps (props) {
    this.setState({
      localConfig: fromJS(props.config).toJS()
    })
  }

  private mergeColumns = () => {
    const { localConfig, currentSelectedHeaderNames } = this.state
    if (currentSelectedHeaderNames.length <= 0) {
      Message.warning('请勾选要合并的列')
      return
    }
  }

  private cancel = () => {
    this.props.onCancel()
  }

  private save = () => {
    this.props.onSave(this.state.localConfig)
  }

  private traverseHeaderConfig = (config: ITableHeaderConfig, headerName: string, propName: string, value) => {
    if (headerName === config.headerName) {
      config.style[propName] = value
      return true
    }
    const updated = Array.isArray(config.children) &&
      config.children.some((c) => this.traverseHeaderConfig(c, headerName, propName, value))
    return updated
  }

  private propChange = (record: ITableHeaderConfig, propName) => (e) => {
    const value = e.target ? e.target.value : e
    const { localConfig } = this.state
    const { headerName } = record
    localConfig.some((config) => this.traverseHeaderConfig(config, headerName, propName, value))
    this.setState({
      localConfig: [...localConfig]
    })
  }

  private columns = [{
    title: '表格列',
    dataIndex: 'headerName',
    key: 'headerName',
    render: (_, record: ITableHeaderConfig) => {
      const { headerName, alias } = record
      return alias || headerName
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
      const { fontSize, fontFamily, fontColor } = style
      return (
        <Row gutter={8}>
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
      )
    }
  }, {
    title: '字体样式',
    dataIndex: 'style',
    key: 'style',
    render: (_, record: ITableHeaderConfig) => {
      const { style } = record
      const { fontStyle, fontWeight } = style
      return (
        <Row gutter={8}>
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
      )
    }
  }, {
    title: '对齐',
    dataIndex: 'textAlign',
    key: 'textAlign',
    width: 215,
    render: (_, record: ITableHeaderConfig) => {
      const { style } = record
      const { textAlign } = style
      return (
        <RadioGroup value={textAlign} onChange={this.propChange(record, 'textAlign')}>
          <RadioButton value="left">左对齐</RadioButton>
          <RadioButton value="center">居中</RadioButton>
          <RadioButton value="right">右对齐</RadioButton>
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
      console.log(selectedRows)
      this.setState({
        currentSelectedHeaderNames: selectedRowKeys
      })
    }
  }

  public render () {
    const { visible } = this.props
    const { localConfig } = this.state

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
        <Row gutter={8}>
          <Col span={24}>
            <Button type="primary" onClick={this.mergeColumns}>合并</Button>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={24}>
            <Table
              bordered={true}
              pagination={false}
              columns={this.columns}
              rowKey="headerName"
              dataSource={localConfig}
              rowSelection={this.rowSelection}
            />
          </Col>
        </Row>
      </Modal>
    )
  }
}

export default HeaderConfigModal
