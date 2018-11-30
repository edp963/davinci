import * as React from 'react'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
import { FormComponentProps } from 'antd/lib/form/Form'
import { FieldFormatTypes, AvailableFieldFormatTypes } from '../util'

const Form = require('antd/lib/form')
const FormItem = Form.Item
const Input = require('antd/lib/input')
const InputNumber = require('antd/lib/input-number')
const Radio = require('antd/lib/radio/radio')
const RadioGroup = Radio.Group
const Checkbox = require('antd/lib/checkbox')
const Select = require('antd/lib/select')
const { Option } = Select
const Button = require('antd/lib/button')

export enum NumericUnit {
  None = 'none',
  TenThousand = '万',
  OneHundredMillion = '亿',
  Thousand = 'k',
  Million = 'M',
  Giga = 'G'
}

export const NumericUnitList = [
  NumericUnit.None,
  NumericUnit.TenThousand,
  NumericUnit.OneHundredMillion,
  NumericUnit.Thousand,
  NumericUnit.Million,
  NumericUnit.Giga
]

export interface IFieldFormatConfig {
  formatType: FieldFormatTypes
  [FieldFormatTypes.Numeric]: {
    decimalPlaces: number
    unit: NumericUnit
    useThousandSeparator: boolean
  }
  [FieldFormatTypes.Currency]: {
    decimalPlaces: number
    unit: NumericUnit
    useThousandSeparator: boolean
    prefix: string
    suffix: string
  }
  [FieldFormatTypes.Percentage]: {
    decimalPlaces: number
  }
  [FieldFormatTypes.ScientificNotation]: {
    decimalPlaces: number
  }
  [FieldFormatTypes.Date]: {
    format: string
  }
  [FieldFormatTypes.Custom]: {
    format: string
  }
}

interface IFormatConfigFormProps {
  formatConfig: IFieldFormatConfig
  onCancel: () => void
}

interface IFormatConfigFormStates {
  selectedFormatType: FieldFormatTypes
}

export class FormatConfigForm extends React.PureComponent<IFormatConfigFormProps & FormComponentProps, IFormatConfigFormStates> {

  private static NumericUnitOptions = NumericUnitList.map((item) => (<Option key={item}>{item}</Option>))

  public constructor (props: IFormatConfigFormProps & FormComponentProps) {
    super(props)
    const { formatConfig } = props
    this.state = {
      selectedFormatType: formatConfig.formatType
        || Object.keys(AvailableFieldFormatTypes[0])[0] as FieldFormatTypes
    }
  }

  private onFormatTypeChange = (e) => {
    this.setState({
      selectedFormatType: e.target.value
    })
  }

  private renderFormatTypes () {
    const { selectedFormatType } = this.state
    const formatTypesGroup = (
      <Row gutter={8}>
        <Col span={24}>
          <RadioGroup onChange={this.onFormatTypeChange} value={selectedFormatType}>
            {Object.entries(AvailableFieldFormatTypes).map(([key, value]) => (
              <Radio value={key}>{value}</Radio>
            ))}
          </RadioGroup>
        </Col>
      </Row>
    )
    return formatTypesGroup
  }

  private renderNumeric () {
    const { form, formatConfig } = this.props
    const config = formatConfig[FieldFormatTypes.Numeric]
    const { decimalPlaces, unit, useThousandSeparator } = config
    const { getFieldDecorator } = form
    const row = (
      <Row gutter={8}>
        <Col span={12}>
          <FormItem label="小数位数：">
            {getFieldDecorator('decimalPlaces', {
              initialValue: decimalPlaces
            })(
              <InputNumber min={0}/>
            )}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label="单位：">
            {getFieldDecorator('unit', {
              initialValue: unit
            })(
              <Select>{FormatConfigForm.NumericUnitOptions}</Select>
            )}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label="">
            {getFieldDecorator('useThousandSeparator', {
              initialValue: useThousandSeparator
            })(
              <Checkbox>使用千分位分隔符</Checkbox>
            )}
          </FormItem>
        </Col>
      </Row>
    )
    return row
  }

  private renderCurrency () {
    const { form, formatConfig } = this.props
    const config = formatConfig[FieldFormatTypes.Currency]
    const { decimalPlaces, unit, useThousandSeparator, prefix, suffix } = config
    const { getFieldDecorator } = form
    const row = (
      <Row gutter={8}>
        <Col span={12}>
          <FormItem label="小数位数：">
            {getFieldDecorator('decimalPlaces', {
              initialValue: decimalPlaces
            })(
              <InputNumber min={0}/>
            )}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label="单位：">
            {getFieldDecorator('unit', {
              initialValue: unit
            })(
              <Select>{FormatConfigForm.NumericUnitOptions}</Select>
            )}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label="">
            {getFieldDecorator('useThousandSeparator', {
              initialValue: useThousandSeparator
            })(
              <Checkbox>使用千分位分隔符</Checkbox>
            )}
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem label="前缀">
            {getFieldDecorator('prefix', {
              initialValue: prefix
            })(
              <Input />
            )}
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem label="后缀">
            {getFieldDecorator('suffix', {
              initialValue: suffix
            })(
              <Input />
            )}
          </FormItem>
        </Col>
      </Row>
    )
    return row
  }

  private renderPercentage () {
    const { form, formatConfig } = this.props
    const config = formatConfig[FieldFormatTypes.Percentage]
    const { decimalPlaces } = config
    const { getFieldDecorator } = form
    const row = (
      <Row gutter={8}>
        <Col span={12}>
          <FormItem label="小数位数：">
            {getFieldDecorator('decimalPlaces', {
              initialValue: decimalPlaces
            })(
              <InputNumber min={0}/>
            )}
          </FormItem>
        </Col>
      </Row>
    )
    return row
  }

  private renderScientificNotation () {
    const { form, formatConfig } = this.props
    const config = formatConfig[FieldFormatTypes.ScientificNotation]
    const { decimalPlaces } = config
    const { getFieldDecorator } = form
    const row = (
      <Row gutter={8}>
        <Col span={12}>
          <FormItem label="小数位数：">
            {getFieldDecorator('decimalPlaces', {
              initialValue: decimalPlaces
            })(
              <InputNumber min={0}/>
            )}
          </FormItem>
        </Col>
      </Row>
    )
    return row
  }

  private renderCustom () {
    const { form, formatConfig } = this.props
    const config = formatConfig[FieldFormatTypes.Custom]
    const { format } = config
    const { getFieldDecorator } = form
    const row = (
      <Row gutter={8}>
        <Col span={12}>
          <FormItem label="格式：">
            {getFieldDecorator('format', {
              initialValue: format
            })(
              <Input />
            )}
          </FormItem>
        </Col>
      </Row>
    )
    return row
  }

  private renderDate () {
    const { form, formatConfig } = this.props
    const config = formatConfig[FieldFormatTypes.Date]
    const { format } = config
    const { getFieldDecorator } = form
    const row = (
      <Row gutter={8}>
        <Col span={12}>
          <FormItem label="格式：">
            {getFieldDecorator('format', {
              initialValue: format
            })(
              <Input />
            )}
          </FormItem>
        </Col>
      </Row>
    )
    return row
  }

  private renderConfig = (formatType: FieldFormatTypes) => {
    switch (formatType) {
      case FieldFormatTypes.Numeric:
        return this.renderNumeric()
      case FieldFormatTypes.Currency:
        return this.renderCurrency()
      case FieldFormatTypes.Percentage:
        return this.renderPercentage()
      case FieldFormatTypes.ScientificNotation:
        return this.renderScientificNotation()
      case FieldFormatTypes.Custom:
        return this.renderCustom()
      case FieldFormatTypes.Date:
        return this.renderDate()
      default:
        return null
    }
  }

  private save = () => {

  }

  public render () {
    const { onCancel } = this.props
    const { selectedFormatType } = this.state
    const config = this.renderConfig(selectedFormatType)
    return (
      <div>
        <Form>
          {this.renderFormatTypes()}
          {config}
          <Row gutter={8}>
            <Col span={24}>
              <FormItem>
                <Button type="primary" onClick={this.save}>保存</Button>
                <Button onClick={onCancel}>取消</Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    )
  }
}

export default Form.create()(FormatConfigForm)
