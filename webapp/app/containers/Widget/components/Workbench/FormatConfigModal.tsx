import * as React from 'react'
import { fromJS } from 'immutable'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import { FormComponentProps } from 'antd/lib/form/Form'
import { NumericUnit, FieldFormatTypes, AvailableFieldFormatTypes } from '../util'

import Form from 'antd/lib/form'
const FormItem = Form.Item
import Input from 'antd/lib/input'
import InputNumber from 'antd/lib/input-number'
import Radio from 'antd/lib/radio/radio'
const RadioGroup = Radio.Group
import Checkbox from 'antd/lib/checkbox'
import Select from 'antd/lib/select'
const { Option } = Select
import Button from 'antd/lib/button'
import Modal from 'antd/lib/modal'

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
  [FieldFormatTypes.Numeric]?: {
    decimalPlaces: number
    unit: NumericUnit
    useThousandSeparator: boolean
  }
  [FieldFormatTypes.Currency]?: {
    decimalPlaces: number
    unit: NumericUnit
    useThousandSeparator: boolean
    prefix: string
    suffix: string
  }
  [FieldFormatTypes.Percentage]?: {
    decimalPlaces: number
  }
  [FieldFormatTypes.ScientificNotation]?: {
    decimalPlaces: number
  }
  [FieldFormatTypes.Date]?: {
    format: string
  }
  [FieldFormatTypes.Custom]?: {
    format: string
  }
}

const defaultFormatConfig: IFieldFormatConfig = {
  formatType: FieldFormatTypes.Default,
  [FieldFormatTypes.Numeric]: {
    decimalPlaces: 2,
    unit: NumericUnit.None,
    useThousandSeparator: true
  },
  [FieldFormatTypes.Currency]: {
    decimalPlaces: 2,
    unit: NumericUnit.None,
    useThousandSeparator: true,
    prefix: '',
    suffix: ''
  },
  [FieldFormatTypes.Percentage]: {
    decimalPlaces: 2
  },
  [FieldFormatTypes.ScientificNotation]: {
    decimalPlaces: 2
  },
  [FieldFormatTypes.Date]: {
    format: 'YYYY-MM-DD'
  },
  [FieldFormatTypes.Custom]: {
    format: ''
  }
}

interface IFormatConfigFormProps {
  visible: boolean
  visualType: string
  formatConfig: IFieldFormatConfig
  onCancel: () => void
  onSave: (config: IFieldFormatConfig) => void
}

interface IFormatConfigFormStates {
  localConfig: IFieldFormatConfig
}

export class FormatConfigForm extends React.PureComponent<IFormatConfigFormProps & FormComponentProps, IFormatConfigFormStates> {

  private numericUnitOptions = NumericUnitList.map((item) => (
    <Option key={item} value={item}>{item}</Option>
  ))

  public constructor (props: IFormatConfigFormProps & FormComponentProps) {
    super(props)
    const { formatConfig } = props
    this.state = {
      localConfig: formatConfig ? fromJS(formatConfig).toJS() : getDefaultFieldFormatConfig()
    }
  }

  public componentDidMount () {
    this.props.form.setFieldsValue(this.state.localConfig)
  }

  public componentWillReceiveProps (nextProps: IFormatConfigFormProps & FormComponentProps) {
    const { formatConfig, form } = nextProps
    if (formatConfig === this.props.formatConfig) { return }
    this.setState({
      localConfig: formatConfig ? fromJS(formatConfig).toJS() : getDefaultFieldFormatConfig()
    }, () => {
      form.setFieldsValue(this.state.localConfig)
    })
  }

  private onFormatTypeChange = (e) => {
    const { localConfig } = this.state
    const selectedFormatType = e.target.value as FieldFormatTypes
    const previousValues = this.props.form.getFieldsValue() as IFieldFormatConfig

    const nextLocalConfig: IFieldFormatConfig = {
      ...localConfig,
      ...previousValues,
      formatType: selectedFormatType
    }
    if (selectedFormatType !== FieldFormatTypes.Default && !localConfig[selectedFormatType]) {
      nextLocalConfig[selectedFormatType] = { ...defaultFormatConfig[selectedFormatType] }
    }
    this.setState({
      localConfig: nextLocalConfig
    })
  }

  private renderFormatTypes () {
    const { form } = this.props
    const { getFieldDecorator } = form
    const { localConfig } = this.state
    const formatTypesGroup = (
      <FormItem>
        {getFieldDecorator('formatType', {
          initialValue: localConfig.formatType
        })(
          <RadioGroup onChange={this.onFormatTypeChange}>
            {Object.entries(AvailableFieldFormatTypes).map(([key, value]) => (
              <Radio key={key} value={key}>{value}</Radio>
            ))}
          </RadioGroup>
        )}
      </FormItem>
    )
    return formatTypesGroup
  }

  private formItemLayout = {
    labelCol: {
      sm: { span: 6 }
    },
    wrapperCol: {
      sm: { span: 14 }
    }
  }

  private renderNumeric () {
    const { form } = this.props
    const { localConfig } = this.state
    const config = localConfig[FieldFormatTypes.Numeric]
    const { decimalPlaces, unit, useThousandSeparator } = config
    const { getFieldDecorator } = form
    const formItems = [(
      <FormItem key={`${FieldFormatTypes.Numeric}.decimalPlaces`} label="小数位数：" {...this.formItemLayout}>
        {getFieldDecorator(`${FieldFormatTypes.Numeric}.decimalPlaces`, {
          initialValue: decimalPlaces,
          rules: [{ required: true, message: '不能为空' }]
        })(
          <InputNumber min={0} max={6} />
        )}
      </FormItem>
    ), (
      <FormItem key={`${FieldFormatTypes.Numeric}.unit`} label="单位：" {...this.formItemLayout}>
        {getFieldDecorator(`${FieldFormatTypes.Numeric}.unit`, {
          initialValue: unit
        })(
          <Select>{this.numericUnitOptions}</Select>
        )}
      </FormItem>
    ), (
      <FormItem key={`${FieldFormatTypes.Numeric}.useThousandSeparator`} label=" " colon={false} {...this.formItemLayout}>
        {getFieldDecorator(`${FieldFormatTypes.Numeric}.useThousandSeparator`, {
          initialValue: useThousandSeparator,
          valuePropName: 'checked'
        })(
          <Checkbox>使用千分位分隔符</Checkbox>
        )}
      </FormItem>
    )]
    return formItems
  }

  private renderCurrency () {
    const { form } = this.props
    const { localConfig } = this.state
    const config = localConfig[FieldFormatTypes.Currency]
    const { decimalPlaces, unit, useThousandSeparator, prefix, suffix } = config
    const { getFieldDecorator } = form
    const formItems = [(
      <FormItem key={`${FieldFormatTypes.Currency}.decimalPlaces`} label="小数位数：" {...this.formItemLayout}>
        {getFieldDecorator(`${FieldFormatTypes.Currency}.decimalPlaces`, {
          initialValue: decimalPlaces,
          rules: [{ required: true, message: '不能为空' }]
        })(
          <InputNumber min={0} max={6} />
        )}
      </FormItem>
    ), (
      <FormItem key={`${FieldFormatTypes.Currency}.unit`} label="单位：" {...this.formItemLayout}>
        {getFieldDecorator(`${FieldFormatTypes.Currency}.unit`, {
          initialValue: unit
        })(
          <Select>{this.numericUnitOptions}</Select>
        )}
      </FormItem>
    ), (
      <FormItem key={`${FieldFormatTypes.Currency}.useThousandSeparator`} label=" " colon={false} {...this.formItemLayout}>
        {getFieldDecorator(`${FieldFormatTypes.Currency}.useThousandSeparator`, {
          initialValue: useThousandSeparator,
          valuePropName: 'checked'
        })(
          <Checkbox>使用千分位分隔符</Checkbox>
        )}
      </FormItem>
    ), (
      <FormItem key={`${FieldFormatTypes.Currency}.prefix`} label="前缀" {...this.formItemLayout}>
        {getFieldDecorator(`${FieldFormatTypes.Currency}.prefix`, {
          initialValue: prefix
        })(
          <Input />
        )}
      </FormItem>
    ), (
      <FormItem key={`${FieldFormatTypes.Currency}.suffix`} label="后缀" {...this.formItemLayout}>
        {getFieldDecorator(`${FieldFormatTypes.Currency}.suffix`, {
          initialValue: suffix
        })(
          <Input />
        )}
      </FormItem>
    )]
    return formItems
  }

  private renderPercentage () {
    const { form } = this.props
    const { localConfig } = this.state
    const config = localConfig[FieldFormatTypes.Percentage]
    const { decimalPlaces } = config
    const { getFieldDecorator } = form
    const formItem = (
      <FormItem label="小数位数：" {...this.formItemLayout}>
        {getFieldDecorator(`${FieldFormatTypes.Percentage}.decimalPlaces`, {
          initialValue: decimalPlaces,
          rules: [{ required: true, message: '不能为空' }]
        })(
          <InputNumber min={0} max={6} />
        )}
      </FormItem>
    )
    return formItem
  }

  private renderScientificNotation () {
    const { form } = this.props
    const { localConfig } = this.state
    const config = localConfig[FieldFormatTypes.ScientificNotation]
    const { decimalPlaces } = config
    const { getFieldDecorator } = form
    const formItem = (
      <FormItem label="小数位数：" {...this.formItemLayout}>
        {getFieldDecorator(`${FieldFormatTypes.ScientificNotation}.decimalPlaces`, {
          initialValue: decimalPlaces,
          rules: [{ required: true, message: '不能为空' }]
        })(
          <InputNumber min={0} max={6} />
        )}
      </FormItem>
    )
    return formItem
  }

  private renderCustom () {
    const { form } = this.props
    const { localConfig } = this.state
    const config = localConfig[FieldFormatTypes.Custom]
    const { format } = config
    const { getFieldDecorator } = form
    const formItem = (
      <FormItem label="格式：" {...this.formItemLayout}>
        {getFieldDecorator(`${FieldFormatTypes.Custom}.format`, {
          initialValue: format
        })(
          <Input />
        )}
      </FormItem>
    )
    return formItem
  }

  private renderDate () {
    const { form } = this.props
    const { localConfig } = this.state
    const config = localConfig[FieldFormatTypes.Date]
    const { format } = config
    const { getFieldDecorator } = form
    const formItem = (
      <FormItem label="格式：" {...this.formItemLayout}>
        {getFieldDecorator(`${FieldFormatTypes.Date}.format`, {
          initialValue: format,
          rules: [{ required: true, message: '不能为空' }]
        })(
          <Input />
        )}
      </FormItem>
    )
    return formItem
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
    const { form } = this.props
    form.validateFieldsAndScroll((err, fieldsValues) => {
      if (err) { return }

      const formatType = fieldsValues['formatType']
      const config: IFieldFormatConfig = {
        formatType
      }
      if (formatType !== FieldFormatTypes.Default) {
        config[formatType] = fieldsValues[formatType]
      }
      this.props.onSave(config)
    })
  }

  private cancel = () => {
    this.props.onCancel()
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
    const { localConfig } = this.state
    const { formatType } = localConfig
    const config = this.renderConfig(formatType)
    return (
      <Modal
        title="设置数值格式"
        wrapClassName="ant-modal-small"
        footer={this.modalFooter}
        visible={visible}
        onCancel={this.cancel}
        onOk={this.save}
      >
        <Form>
          {this.renderFormatTypes()}
          {config}
        </Form>
      </Modal>
    )
  }
}

export function getDefaultFieldFormatConfig (): IFieldFormatConfig {
  return {
    formatType: FieldFormatTypes.Default
  }
}

export default Form.create()(FormatConfigForm)
