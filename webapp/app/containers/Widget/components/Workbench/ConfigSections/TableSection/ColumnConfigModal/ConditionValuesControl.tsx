import * as React from 'react'
import * as classnames from 'classnames'
import moment, { Moment } from 'moment'
import OperatorTypes from 'utils/operatorTypes'

import { Row, Col, Input, InputNumber, DatePicker, Button, Tag } from 'antd'

const styles = require('../TableSection.less')

interface IConditionValuesControlProps {
  visualType: string
  operatorType: OperatorTypes
  conditionValues: Array<string | number>
  onChange: (values: Array<string | number | Moment>) => void
}

interface IConditionValuesControlStates {
  localValues: Array<string | number>
  tagInputting: boolean
  tagInputValue: string | number | Moment
}

export class ConditionValuesControl extends React.PureComponent<IConditionValuesControlProps, IConditionValuesControlStates> {

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
    conditionValues: Array<string | number>
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

  private getInitValueByVisualType (visualType: string) {
    switch (visualType) {
      case 'string':
      case 'geoCountry':
      case 'geoProvince':
      case 'geoCity':
        return ''
      case 'number':
        return 0
      case 'date':
        return moment()
      default:
        return null
    }
  }

  private localValuesChange = (idx: number) => (e) => {
    const value = e.target ? e.target.value : e
    const { onChange } = this.props
    const { localValues } = this.state
    const values = [...localValues]
    values.splice(idx, 1, value)
    onChange(values)
  }

  private renderControl = (idx: number) => {
    const { visualType } = this.props
    const { localValues } = this.state

    let control
    switch (visualType) {
      case 'string':
      case 'geoCountry':
      case 'geoProvince':
      case 'geoCity':
        control = (<Input className={styles.colControl} size="small" value={localValues[idx]} onChange={this.localValuesChange(idx)}/>)
        break
      case 'number':
        control = (<InputNumber className={styles.colControl} size="small" value={(localValues[idx] as number)} onChange={this.localValuesChange(idx)} />)
        break
      case 'date':
        control = (<DatePicker className={styles.colControl} size="small" value={moment(localValues[idx])} onChange={this.localValuesChange(idx)} />)
        break
    }

    return control
  }

  private renderRow = () => {
    const { operatorType } = this.props

    let controls
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
          <Row key="between" type="flex" align="middle" className={styles.rowBlock}>
            <Col span={11}>
              {this.renderControl(0)}
            </Col>
            <Col span={2} className={styles.colDivider}>-</Col>
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

    return (
      <Row key="valueControls" gutter={8} type="flex" align="middle" className={styles.rowBlock}>
        <Col span={8}>值：</Col>
        <Col span={16}>
          {controls}
        </Col>
      </Row>
    )
  }

  private renderTags = () => {
    const { visualType } = this.props
    const { localValues, tagInputting, tagInputValue } = this.state

    const tagList = localValues.map((val) => (
      <Tag key={val} className={styles.tag} closable afterClose={this.removeTag(val)}>{val}</Tag>
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
              className={styles.tagInput}
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
              className={styles.tagInput}
              value={(tagInputValue as number)}
              onChange={this.tagInputValueChange}
            />
          )
          break
        case 'date':
          tagInputControl.push(
            <DatePicker
              key="datePicker"
              size="small"
              className={styles.tagInput}
              value={(tagInputValue as Moment)}
              onChange={this.tagInputValueChange}
            />
          )
          break
      }
      tagInputControl.push(
        <Button
          key="saveTag"
          className={styles.tagBtn}
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
          className={styles.tagBtn}
          size="small"
          type="dashed"
          onClick={this.showTagInput}
        >
          + 添加
        </Button>)
    }

    const rowCls = classnames({
      [styles.rowBlock]: true,
      [styles.tagList]: true
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
    const { localValues } = this.state
    this.setState({
      localValues: localValues.filter((val) => val !== tag)
    })
  }

  private tagInputValueChange = (e) => {
    this.setState({
      tagInputValue: e.target ? e.target.value : e
    })
  }

  public render () {
    return this.renderRow()
  }
}

export default ConditionValuesControl
