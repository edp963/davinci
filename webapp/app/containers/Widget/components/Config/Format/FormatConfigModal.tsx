import React from 'react'
import { fromJS } from 'immutable'
import { IFieldFormatConfig } from './types'
import { getDefaultFieldFormatConfig } from './util'
import { ViewModelVisualTypes } from 'containers/View/constants'
import { NumericUnitList, FieldFormatTypes, FieldFormatTypesLocale, FieldFormatTypesSetting, defaultFormatConfig } from './constants'

import { FormComponentProps } from 'antd/lib/form/Form'
import { Form, Input, InputNumber, Radio, Checkbox, Select, Button, Modal } from 'antd'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const { Option } = Select

interface IFormatConfigFormProps extends FormComponentProps {
  visible: boolean
  visualType: ViewModelVisualTypes
  formatConfig: IFieldFormatConfig
  onCancel: () => void
  onSave: (config: IFieldFormatConfig) => void
}

interface IFormatConfigFormStates {
  localConfig: IFieldFormatConfig
}

class FormatConfigForm extends React.PureComponent<IFormatConfigFormProps, IFormatConfigFormStates> {

  private numericUnitOptions = NumericUnitList.map((item) => (
    <Option key={item} value={item}>{item}</Option>
  ))

  public constructor (props: IFormatConfigFormProps) {
    super(props)
    const { formatConfig } = props
    this.state = {
      localConfig: formatConfig ? fromJS(formatConfig).toJS() : getDefaultFieldFormatConfig()
    }
  }

  public componentDidMount () {
    this.props.form.setFieldsValue(this.state.localConfig)
  }

  public componentWillReceiveProps (nextProps: IFormatConfigFormProps) {
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
      // @ts-ignore
      nextLocalConfig[selectedFormatType] = { ...defaultFormatConfig[selectedFormatType] }
    }
    this.setState({
      localConfig: nextLocalConfig
    })
  }

  private renderFormatTypes () {
    const { form, visualType } = this.props
    const { getFieldDecorator } = form
    const { localConfig } = this.state
    const formatTypesGroup = FieldFormatTypesSetting[visualType] && (
      <FormItem>
        {getFieldDecorator('formatType', {
          initialValue: localConfig.formatType
        })(
          <RadioGroup onChange={this.onFormatTypeChange}>
            {FieldFormatTypesSetting[visualType].map((formatType) => (
              <Radio key={formatType} value={formatType}>{FieldFormatTypesLocale[formatType]}</Radio>
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

export default Form.create<IFormatConfigFormProps>()(FormatConfigForm)
