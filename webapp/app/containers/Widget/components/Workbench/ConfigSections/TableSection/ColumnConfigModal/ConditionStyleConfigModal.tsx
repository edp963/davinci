import * as React from 'react'
import { fromJS } from 'immutable'
import * as classnames from 'classnames'
import moment from 'moment'

import Icon from 'antd/lib/icon'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Modal from 'antd/lib/modal'
import Input from 'antd/lib/input'
import InputNumber from 'antd/lib/input-number'
import DatePicker from 'antd/lib/date-picker'
const Search = Input.Search
import Button from 'antd/lib/button'
import Radio from 'antd/lib/radio'
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
import Checkbox from 'antd/lib/checkbox'
import Select from 'antd/lib/select'
const Option = Select.Option
import Tag from 'antd/lib/tag'
import Table from 'antd/lib/table'
import Message from 'antd/lib/message'

import ColorPicker from 'components/ColorPicker'
import ConditionValuesControl from './ConditionValuesControl'

import OperatorTypes, { TableCellConditionOperatorTypes } from 'utils/operatorTypes'
import { ITableConditionStyle } from '../'
import { TableConditionStyleTypes } from '../util'

const styles = require('../TableSection.less')

export const AvailableTableConditionStyleTypes = {
  [TableConditionStyleTypes.BackgroundColor]: '背景颜色',
  [TableConditionStyleTypes.NumericBar]: '条形图',
  [TableConditionStyleTypes.Custom]: '自定义'
}

const TableConditionStyleTypesSetting = {
  [TableConditionStyleTypes.BackgroundColor]: ['string', 'geoCountry', 'geoProvince', 'geoCity', 'number', 'date'],
  [TableConditionStyleTypes.NumericBar]: ['number'],
  [TableConditionStyleTypes.Custom]: ['string', 'geoCountry', 'geoProvince', 'geoCity', 'number', 'date']
}

export const defaultConditionStyle: ITableConditionStyle = {
  key: '',
  type: TableConditionStyleTypes.BackgroundColor,
  operatorType: OperatorTypes.Equal,
  conditionValues: [],
  colors: {
    background: '#000',
    fore: '#fff',
    positive: '#008fff',
    negative: '#5cc504'
  },
  zeroPosition: 'auto',
  customTemplate: ''
}

interface IConditionStyleConfigModalProps {
  visible: boolean
  visualType: string
  style: ITableConditionStyle
  onCancel: () => void
  onSave: (style: ITableConditionStyle) => void
}

interface IConditionStyleConfigModalStates {
  localStyle: ITableConditionStyle
}

export class ConditionStyleConfigModal extends React.PureComponent<IConditionStyleConfigModalProps, IConditionStyleConfigModalStates> {

  public constructor (props) {
    super(props)
    this.state = {
      localStyle: null
    }
  }

  public componentWillReceiveProps (props) {
    const { style } = props
    const localStyle: ITableConditionStyle = style && fromJS(style).toJS()
    this.setState({
      localStyle
    })
  }

  private propChange = (propName: 'operatorType' | 'zeroPosition' | 'type') => (e) => {
    const { localStyle } = this.state
    const value = e.target ? e.target.value : e
    this.setState({
      localStyle: {
        ...localStyle,
        [propName]: value
      }
    })
  }

  private colorChange = (colorName: string) => (e) => {
    const { localStyle } = this.state
    const value = e.target ? e.target.value : e
    this.setState({
      localStyle: {
        ...localStyle,
        colors: {
          ...localStyle.colors,
          [colorName]: value
        }
      }
    })
  }

  private getOperatorTypeOptions (visualType: string) {
    const options = Object.entries(TableCellConditionOperatorTypes)
      .filter(([_, values]) => ~values.indexOf(visualType))
      .map(([type]) => (
        <Option key={type} value={type}>{type}</Option>
      ))
    return options
  }

  private renderConfigItems = () => {
    const { localStyle } = this.state
    const { type } = localStyle
    switch (type) {
      case TableConditionStyleTypes.BackgroundColor:
        return this.renderBackgroundColor()
      case TableConditionStyleTypes.NumericBar:
        return this.renderNumericBar()
      case TableConditionStyleTypes.Custom:
        return this.renderCustom()
      default:
        return null
    }
  }

  private renderBackgroundColor = () => {
    const { localStyle } = this.state
    const { colors } = localStyle
    const { background, fore } = colors
    return (
      <Row gutter={8} type="flex" align="middle" className={styles.rowBlock}>
        <Col span={6}>颜色：</Col>
        <Col span={6} className={styles.colColor}>
          <ColorPicker
            className={styles.color}
            value={background}
            onChange={this.colorChange('background')}
          /><label>背景</label>
        </Col>
        <Col span={6} className={styles.colColor}>
          <ColorPicker
            className={styles.color}
            value={fore}
            onChange={this.colorChange('fore')}
          /><label>文字</label>
        </Col>
      </Row>
    )
  }

  private zeroPositionOptions = [{ label: '自动', value: 'auto' }, { label: '中部', value: 'center' }]

  private renderNumericBar = () => {
    const { localStyle } = this.state
    const { zeroPosition, colors } = localStyle
    const { positive, negative, fore } = colors
    return [(
      <Row key="zeroPosition" gutter={8} type="flex" align="middle" className={styles.rowBlock}>
        <Col span={8}>坐标轴位置：</Col>
        <Col span={16}>
          <RadioGroup options={this.zeroPositionOptions} onChange={this.propChange('zeroPosition')} value={zeroPosition} />
        </Col>
      </Row>
    ), (
      <Row key="zeroPositionValues" gutter={8} type="flex" align="middle" className={styles.rowBlock}>
        <Col span={6}>颜色：</Col>
        <Col span={6} className={styles.colColor}>
          <ColorPicker
            className={styles.color}
            value={positive}
            onChange={this.colorChange('positive')}
          /><label>正值</label>
        </Col>
        <Col span={6} className={styles.colColor}>
          <ColorPicker
            className={styles.color}
            value={negative}
            onChange={this.colorChange('negative')}
          /><label>负值</label>
        </Col>
        <Col span={6} className={styles.colColor}>
          <ColorPicker
            className={styles.color}
            value={fore}
            onChange={this.colorChange('fore')}
          /><label>文字</label>
        </Col>
      </Row>
    )]
  }

  private renderCustom = () => {
    return (
      <Row gutter={8} type="flex" align="middle" className={styles.rowBlock}>
        <Col span={6}>编辑文本：</Col>
        <Col span={3}>
          <Icon type="edit" />
        </Col>
      </Row>
    )
  }

  private cancel = () => {
    this.props.onCancel()
  }

  private save = () => {
    this.props.onSave(this.state.localStyle)
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

  private getConditionTypeOptions (visualType: string) {
    const options = Object.entries(AvailableTableConditionStyleTypes)
      .filter(([type]) => ~TableConditionStyleTypesSetting[type].indexOf(visualType))
      .map(([type, name]) => (
        <Option key={type} value={type}>{name}</Option>
      ))
    return options
  }

  private conditionValuesChange = (values) => {
    this.setState({
      localStyle: {
        ...this.state.localStyle,
        conditionValues: values
      }
    })
  }

  public render () {
    const { visible, visualType } = this.props
    const { localStyle } = this.state
    if (!localStyle) { return (<div />) }

    const { type, operatorType, conditionValues } = localStyle

    return (
      <Modal
        title="条件格式"
        wrapClassName="ant-modal-small"
        maskClosable={false}
        footer={this.modalFooter}
        visible={visible}
        onCancel={this.cancel}
        onOk={this.save}
      >
        <div className={styles.rows}>
          <Row gutter={8} type="flex" align="middle" className={styles.rowBlock}>
            <Col span={6}>样式类型：</Col>
            <Col span={18}>
              <Select
                size="small"
                className={styles.colControl}
                value={type}
                onChange={this.propChange('type')}
              >
                {this.getConditionTypeOptions(visualType)}
              </Select>
            </Col>
          </Row>
          <Row key="operatorType" gutter={8} type="flex" align="middle" className={styles.rowBlock}>
            <Col span={6}>关系：</Col>
            <Col span={18}>
              <Select
                size="small"
                className={styles.colControl}
                value={operatorType}
                onChange={this.propChange('operatorType')}
              >
                {this.getOperatorTypeOptions(visualType)}
              </Select>
            </Col>
          </Row>
          <ConditionValuesControl
            visualType={visualType}
            operatorType={operatorType}
            conditionValues={conditionValues}
            onChange={this.conditionValuesChange}
          />
          {this.renderConfigItems()}
        </div>
      </Modal>
    )
  }
}

export default ConditionStyleConfigModal
