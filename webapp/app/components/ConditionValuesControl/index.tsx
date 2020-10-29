import React from 'react'
import classnames from 'classnames'
import moment, { Moment } from 'moment'
import OperatorTypes from 'utils/operatorTypes'

import { Row, Col, Input, InputNumber, DatePicker, Button, Tag, Switch } from 'antd'
import { DEFAULT_DATETIME_FORMAT } from 'app/globalConstants'
import Styles from './ConditionValuesControl.less'

export type ConditionValueTypes = string | number | boolean

interface IConditionValuesControlProps {
  className?: string
  size: 'small' | 'default'
  visualType: string
  operatorType: OperatorTypes
  conditionValues: ConditionValueTypes[]
  onChange: (values: ConditionValueTypes[]) => void
}


interface IConditionValuesControlStates {
  localValues: ConditionValueTypes[]
  tagInputting: boolean
  tagInputValue: ConditionValueTypes
}

export class ConditionValuesControl extends React.PureComponent<IConditionValuesControlProps, IConditionValuesControlStates> {

  public static defaultProps: Partial<IConditionValuesControlProps> = { size: 'default' }

  private controlStyle: React.CSSProperties = { width: '100%' }

  public constructor (props: IConditionValuesControlProps) {
    super(props)
    this.state = {
      localValues: [],
      tagInputting: false,
      tagInputValue: ''
    }
  }

  public componentDidMount () {
    const { operatorType, visualType, conditionValues } = this.props
    this.initLocalValues(operatorType, visualType, conditionValues)
  }

  public componentWillReceiveProps (nextProps: IConditionValuesControlProps) {
    const { visualType, operatorType, conditionValues } = nextProps
    this.initLocalValues(operatorType, visualType, conditionValues)
  }

  private initLocalValues (
    operatorType: OperatorTypes,
    visualType: string,
    conditionValues: ConditionValueTypes[]
  ) {
    const values = []
    const initValue = this.getInitValueByVisualType(visualType)
    let valuesCount = 0
    switch (operatorType) {
      case OperatorTypes.Contain:
      case OperatorTypes.Equal:
      case OperatorTypes.GreaterThan:
      case OperatorTypes.GreaterThanOrEqual:
      case OperatorTypes.LessThan:
      case OperatorTypes.LessThanOrEqual:
      case OperatorTypes.NotEqual:
        valuesCount = 1
        break
      case OperatorTypes.Between:
        valuesCount = 2
      case OperatorTypes.In:
        valuesCount = conditionValues.length
        break
    }

    for (let idx = 0; idx < valuesCount; idx++) {
      if (conditionValues[idx] && typeof conditionValues[idx] === typeof initValue) {
        values.push(conditionValues[idx])
      } else {
        values.push(initValue)
      }
    }

    this.setState({ localValues: values })
  }

  private getInitValueByVisualType (visualType: string): ConditionValueTypes {
    switch (visualType) {
      case 'string':
      case 'geoCountry':
      case 'geoProvince':
      case 'geoCity':
        return ''
      case 'number':
        return 0
      case 'date':
        return moment().format('YYYY-MM-DD')
      case 'boolean':
        return false
      default:
        return null
    }
  }

  private getControlValueByVisualType (visualType: string, args: any[]) {
    let value: ConditionValueTypes
    switch (visualType) {
      case 'string':
      case 'geoCountry':
      case 'geoProvince':
      case 'geoCity':
        value = (args[0] as React.ChangeEvent<HTMLInputElement>).target.value
        break
      case 'number':
      case 'boolean':
        value = args[0]
        break
      case 'date':
        value = args[1]
        break
    }
    return value
  }

  private localValuesChange = (idx: number) => (...args: any[]) => {
    const { onChange, visualType } = this.props
    const value = this.getControlValueByVisualType(visualType, args)
    const { localValues } = this.state
    const values = [...localValues]
    values.splice(idx, 1, value)
    onChange(values)
  }

  private renderControl = (idx: number) => {
    const { visualType, size } = this.props
    const { localValues } = this.state

    let control: React.ReactNode
    switch (visualType) {
      case 'string':
      case 'geoCountry':
      case 'geoProvince':
      case 'geoCity':
        const stringValue = localValues[idx] as string
        control = (
          <Input
            style={this.controlStyle}
            size={size}
            value={stringValue}
            onChange={this.localValuesChange(idx)}
          />
        )
        break
      case 'number':
        const numberValue = localValues[idx] as number
        control = (
          <InputNumber
            style={this.controlStyle}
            size={size}
            value={numberValue}
            onChange={this.localValuesChange(idx)}
          />
        )
        break
      case 'date':
        const dateValue = moment(localValues[idx] as string)
        control = (
          <DatePicker
            style={this.controlStyle}
            size={size}
            format={DEFAULT_DATETIME_FORMAT}
            showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
            value={dateValue}
            onChange={this.localValuesChange(idx)}
          />
        )
        break
      case 'boolean':
        const booleanValue = localValues[idx] as boolean
        control = (
          <Switch
            size={size}
            checkedChildren="是"
            unCheckedChildren="否"
            checked={booleanValue}
            onChange={this.localValuesChange(idx)}
          />
        )
    }

    return control
  }

  private renderRow = () => {
    const { operatorType } = this.props

    let controls: React.ReactNode
    switch (operatorType) {
      case OperatorTypes.Contain:
      case OperatorTypes.Equal:
      case OperatorTypes.GreaterThan:
      case OperatorTypes.GreaterThanOrEqual:
      case OperatorTypes.LessThan:
      case OperatorTypes.LessThanOrEqual:
      case OperatorTypes.NotEqual:
        controls = this.renderControl(0)
        break
      case OperatorTypes.Between:
        controls = (
          <Row key="between" type="flex" align="middle" className={Styles.rowBlock}>
            <Col span={11}>
              {this.renderControl(0)}
            </Col>
            <Col span={2} className={Styles.colDivider}>-</Col>
            <Col span={11}>
              {this.renderControl(1)}
            </Col>
          </Row>
        )
        break
      case OperatorTypes.In:
        controls = this.renderTags()
        break
    }

    return controls
  }

  private renderTags = () => {
    const { visualType, size } = this.props
    const { localValues, tagInputting, tagInputValue } = this.state

    const tagList = localValues.map((val) => (
      <Tag key={val.toString()} className={Styles.tag} closable onClose={this.removeTag(val)}>{val}</Tag>
    ))

    const tagInputControl = []
    if (tagInputting) {
      switch (visualType) {
        case 'string':
        case 'geoCountry':
        case 'geoProvince':
        case 'geoCity':
          tagInputControl.push(
            <Input
              key="input"
              type="text"
              size="small"
              className={Styles.tagInput}
              value={(tagInputValue as string)}
              onChange={this.tagInputValueChange}
              onBlur={this.addTag}
              onPressEnter={this.addTag}
            />
          )
          break
        case 'number':
          tagInputControl.push(
            <InputNumber
              key="inputNumber"
              size="small"
              className={Styles.tagInput}
              value={(tagInputValue as number)}
              onChange={this.tagInputValueChange}
            />
          )
          break
        case 'date':
          const dateValue = moment((tagInputValue || moment().format('YYYY-MM-DD')) as string)
          tagInputControl.push(
            <DatePicker
              key="datePicker"
              size="small"
              className={Styles.tagInput}
              value={dateValue}
              onChange={this.tagInputValueChange}
            />
          )
          break
      }
      tagInputControl.push(
        <Button
          key="saveTag"
          className={Styles.tagBtn}
          size="small"
          type="dashed"
          onClick={this.addTag}
        >
          确定
        </Button>)
    } else {
      tagInputControl.push(
        <Button
          key="addTag"
          className={Styles.tagBtn}
          size="small"
          type="dashed"
          onClick={this.showTagInput}
        >
          + 添加
        </Button>)
    }

    const rowCls = classnames({
      [Styles.rowBlock]: true,
      [Styles.tagList]: true
    })

    return (
      <Row key="tag" type="flex" align="middle" className={rowCls}>
        {tagList}{tagInputControl}
      </Row>
    )
  }

  private showTagInput = () => {
    this.setState({
      tagInputting: true
    })
  }

  private addTag = () => {
    const { tagInputValue, localValues } = this.state
    if (tagInputValue) {
      const { onChange, visualType, operatorType } = this.props
      onChange([...localValues.filter((val) => val !== tagInputValue), tagInputValue])
      this.setState({
        tagInputting: false,
        tagInputValue: this.getInitValueByVisualType(visualType)
      })
    }
  }

  private removeTag = (tag) => () => {
    const { onChange } = this.props
    const { localValues } = this.state
    onChange(localValues.filter((val) => val !== tag))
  }

  private tagInputValueChange = (...args: any[]) => {
    const { visualType } = this.props
    const tagInputValue = this.getControlValueByVisualType(visualType, args)
    this.setState({ tagInputValue })
  }

  public render () {
    const { className } = this.props
    return (
      <div className={className}>
        {this.renderRow()}
      </div>
    )
  }
}

export default ConditionValuesControl
