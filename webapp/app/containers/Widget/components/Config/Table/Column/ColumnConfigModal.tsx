import React from 'react'
import classnames from 'classnames'
import produce from 'immer'
import set from 'lodash/set'
import { uuid } from 'utils/util'
import { fontWeightOptions, fontStyleOptions, fontFamilyOptions, fontSizeOptions } from '../constants'
import { defaultConditionStyle, AvailableTableConditionStyleTypes } from './constants'
import { getColumnIconByType } from './util'
import { ITableColumnConfig, ITableConditionStyle } from './types'
import ColorPicker from 'components/ColorPicker'
import ConditionStyleConfigModal from './ConditionStyleConfigModal'

import { Row, Col, Tooltip, Select, Button, Radio, Checkbox, Table, Modal } from 'antd'
const RadioGroup = Radio.Group
const RadioButton = Radio.Button

import styles from './styles.less'
import stylesConfig from '../styles.less'

interface IColumnStyleConfigProps {
  visible: boolean
  config: ITableColumnConfig[]
  onCancel: () => void
  onSave: (config: ITableColumnConfig[]) => void
}

interface IColumnStyleConfigStates {
  localConfig: ITableColumnConfig[]
  selectedColumnName: string
  conditionStyleConfigModalVisible: boolean
  currentConditionStyle: ITableConditionStyle
}

export class ColumnStyleConfig extends React.PureComponent<IColumnStyleConfigProps, IColumnStyleConfigStates> {

  public constructor (props: IColumnStyleConfigProps) {
    super(props)
    const localConfig = props.config
    this.state = {
      localConfig,
      selectedColumnName: localConfig.length > 0 ? localConfig[0].columnName : '',
      conditionStyleConfigModalVisible: false,
      currentConditionStyle: null
    }
  }

  public componentWillReceiveProps (nextProps: IColumnStyleConfigProps) {
    if (nextProps.config === this.props.config) { return }
    const localConfig = nextProps.config
    this.setState({
      localConfig,
      selectedColumnName: localConfig.length > 0 ? localConfig[0].columnName : '',
      conditionStyleConfigModalVisible: false,
      currentConditionStyle: null
    })
  }

  private renderColumn (item: ITableColumnConfig) {
    const { selectedColumnName } = this.state
    const { columnName, alias, visualType } = item
    const displayName = alias || columnName
    const itemCls = classnames({
      [styles.selected]: selectedColumnName === columnName
    })
    return (
      <li className={itemCls} key={columnName} onClick={this.selectColumn(columnName)}>
        <i className={`iconfont ${getColumnIconByType(visualType)}`} />
        <Tooltip title={displayName} mouseEnterDelay={0.8}>
          <label>{displayName}</label>
        </Tooltip>
      </li>
    )
  }

  private selectColumn = (columnName: string) => () => {
    this.setState({
      selectedColumnName: columnName
    })
  }

  private propChange = (
    propPath: Exclude<keyof(ITableColumnConfig), 'style'> | ['style', keyof ITableColumnConfig['style']]
  ) => (e) => {
    const value = e.target ? (e.target.value || e.target.checked) : e
    const { localConfig, selectedColumnName } = this.state
    const nextLocalConfig = produce(localConfig, (draft) => {
      const selectedColumn = draft.find(({ columnName }) => columnName === selectedColumnName)
      set(selectedColumn, propPath, value)
      return draft
    })
    this.setState({
      localConfig: nextLocalConfig
    })
  }

  private cancel = () => {
    this.props.onCancel()
  }

  private save = () => {
    this.props.onSave(this.state.localConfig)
  }

  private columns = [{
    title: '',
    dataIndex: 'idx',
    width: 30,
    render: (_, __, index) => (index + 1)
  }, {
    title: '样式类型',
    dataIndex: 'type',
    width: 50,
    render: (type) => AvailableTableConditionStyleTypes[type]
  }, {
    title: '操作',
    dataIndex: 'operation',
    width: 60,
    render: (_, record) => (
      <div className={styles.btns}>
        <Button onClick={this.editConditionStyle(record)} icon="edit" shape="circle" size="small" />
        <Button onClick={this.deleteConditionStyle(record.key)} icon="delete" shape="circle" size="small" />
      </div>
    )
  }]

  private addConditionStyle = () => {
    this.setState({
      conditionStyleConfigModalVisible: true,
      currentConditionStyle: {
        ...defaultConditionStyle
      }
    })
  }

  private editConditionStyle = (record) => () => {
    this.setState({
      currentConditionStyle: record,
      conditionStyleConfigModalVisible: true
    })
  }

  private deleteConditionStyle = (deletedKey: string) => () => {
    const { localConfig, selectedColumnName } = this.state
    const nextLocalConfig = produce(localConfig, (draft) => {
      const selectedColumn = draft.find(({ columnName }) => columnName === selectedColumnName)
      const idx = selectedColumn.conditionStyles.findIndex(({ key }) => key === deletedKey)
      selectedColumn.conditionStyles.splice(idx, 1)
    })
    this.setState({ localConfig: nextLocalConfig })
  }

  private closeConditionStyleConfig = () => {
    this.setState({
      conditionStyleConfigModalVisible: false,
      currentConditionStyle: null
    })
  }

  private saveConditionStyleConfig = (conditionStyle: ITableConditionStyle) => {
    const { localConfig, selectedColumnName } = this.state
    const nextLocalConfig = produce(localConfig, (draft) => {
      const selectedColumn = draft.find(({ columnName }) => columnName === selectedColumnName)
      if (conditionStyle.key) {
        const idx = selectedColumn.conditionStyles.findIndex(({ key }) => key === conditionStyle.key)
        selectedColumn.conditionStyles.splice(idx, 1, conditionStyle)
      } else {
        selectedColumn.conditionStyles.push({ ...conditionStyle, key: uuid(5) })
      }
    })
    this.setState({
      localConfig: nextLocalConfig,
      conditionStyleConfigModalVisible: false,
      currentConditionStyle: null
    })
  }

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

  public render () {
    const { visible } = this.props
    const {
      localConfig, selectedColumnName,
      conditionStyleConfigModalVisible, currentConditionStyle } = this.state
    if (localConfig.length <= 0) {
      return (<div />)
    }

    const { style, visualType, sort, conditionStyles } = localConfig.find((c) => c.columnName === selectedColumnName)
    const { fontSize, fontFamily, fontWeight, fontColor, fontStyle, backgroundColor, justifyContent } = style

    return (
      <Modal
        title="数据列设置"
        wrapClassName="ant-modal-large"
        maskClosable={false}
        footer={this.modalFooter}
        visible={visible}
        onCancel={this.cancel}
        onOk={this.save}
      >
        <div className={styles.columnStyleConfig}>
          <div className={styles.left}>
            <div className={styles.title}>
              <h2>字段列表</h2>
            </div>
            <div className={styles.list}>
              <ul>
                {localConfig.map((item) => this.renderColumn(item))}
              </ul>
            </div>
          </div>
          <div className={styles.right}>
              <div className={styles.title}><h2>排序与过滤</h2></div>
              <div className={stylesConfig.rows}>
                <Row gutter={8} type="flex" align="middle" className={stylesConfig.rowBlock}>
                  <Col span={12}>
                    <Checkbox checked={sort} onChange={this.propChange('sort')}>开启列排序</Checkbox>
                  </Col>
                </Row>
              </div>
              <div className={styles.title}><h2>基础样式</h2></div>
              <div className={stylesConfig.rows}>
                <Row gutter={8} type="flex" align="middle" className={stylesConfig.rowBlock}>
                  <Col span={4}>背景色</Col>
                  <Col span={2}>
                    <ColorPicker
                      className={stylesConfig.color}
                      value={backgroundColor}
                      onChange={this.propChange(['style', 'backgroundColor'])}
                    />
                  </Col>
                </Row>
                <Row gutter={8} type="flex" align="middle" className={stylesConfig.rowBlock}>
                  <Col span={4}>对齐</Col>
                  <Col span={20}>
                    <RadioGroup size="small" value={justifyContent} onChange={this.propChange(['style', 'justifyContent'])}>
                      <RadioButton value="flex-start">左对齐</RadioButton>
                      <RadioButton value="center">居中</RadioButton>
                      <RadioButton value="flex-end">右对齐</RadioButton>
                    </RadioGroup>
                  </Col>
                </Row>
                <Row gutter={8} type="flex" align="middle" className={stylesConfig.rowBlock}>
                  <Col span={4}>字体</Col>
                  <Col span={12}>
                    <Select
                      size="small"
                      className={stylesConfig.colControl}
                      placeholder="字体"
                      value={fontFamily}
                      onChange={this.propChange(['style', 'fontFamily'])}
                    >
                      {fontFamilyOptions}
                    </Select>
                  </Col>
                  <Col span={5}>
                    <Select
                      size="small"
                      className={stylesConfig.colControl}
                      placeholder="文字大小"
                      value={fontSize}
                      onChange={this.propChange(['style', 'fontSize'])}
                    >
                      {fontSizeOptions}
                    </Select>
                  </Col>
                  <Col span={3}>
                    <ColorPicker
                      className={stylesConfig.color}
                      value={fontColor}
                      onChange={this.propChange(['style', 'fontColor'])}
                    />
                  </Col>
                </Row>
                <Row gutter={8} type="flex" align="middle" className={stylesConfig.rowBlock}>
                  <Col span={4}>样式</Col>
                  <Col span={6}>
                    <Select
                      size="small"
                      className={stylesConfig.colControl}
                      value={fontStyle}
                      onChange={this.propChange(['style', 'fontStyle'])}
                    >
                      {fontStyleOptions}
                    </Select>
                  </Col>
                  <Col span={13}>
                    <Select
                      size="small"
                      className={stylesConfig.colControl}
                      value={fontWeight}
                      onChange={this.propChange(['style', 'fontWeight'])}
                    >
                      {fontWeightOptions}
                    </Select>
                  </Col>
                </Row>
              </div>
              <div className={styles.title}>
                <h2>条件样式</h2>
                <Button type="primary" onClick={this.addConditionStyle} shape="circle" icon="plus" size="small" />
              </div>
              <div className={styles.table}>
                <Table
                  bordered={true}
                  pagination={false}
                  columns={this.columns}
                  dataSource={conditionStyles}
                />
              </div>
            </div>
        </div>
        <ConditionStyleConfigModal
          visible={conditionStyleConfigModalVisible}
          visualType={visualType}
          style={currentConditionStyle}
          onCancel={this.closeConditionStyleConfig}
          onSave={this.saveConditionStyleConfig}
        />
      </Modal>
    )
  }
}

export default ColumnStyleConfig
