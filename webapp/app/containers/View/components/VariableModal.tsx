import React from 'react'
import { Modal, Form, Input, InputNumber, Select, Checkbox, Button, Row, Col } from 'antd'
const FormItem = Form.Item
const { Option } = Select
import { FormComponentProps } from 'antd/lib/form/Form'
import ConditionValuesControl, { ConditionValueTypes } from 'components/ConditionValuesControl'
import { IViewVariable } from 'containers/View/types'
import OperatorTypes from 'utils/operatorTypes'
import { ViewVariableTypes, ViewVariableTypesLocale, ViewVariableValueTypes, ViewVariableValueTypesLocale } from 'containers/View/constants'

interface IVariableModalProps {
  visible: boolean
  variable: IViewVariable
  nameValidator?: (key: string, name: string, callback: (msg?: string) => void) => void
  onCancel: () => void
  onSave: (variable: IViewVariable) => void
}

interface IVariableModalStates {
  operatorType: OperatorTypes
  selectedType: ViewVariableTypes
  selectedValueType: ViewVariableValueTypes
  defaultValues: ConditionValueTypes[]
}

const defaultVarible: IViewVariable = {
  key: '',
  name: '',
  alias: '',
  type: ViewVariableTypes.Query,
  valueType: ViewVariableValueTypes.String,
  defaultValues: [],
  fromService: false
}

export class VariableModal extends React.Component<IVariableModalProps & FormComponentProps, IVariableModalStates> {

  private formItemStyle = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 }
  }

  private viewVariableTypeOptions = Object.entries(ViewVariableTypesLocale).map(([variableType, text]) => (
    <Option key={variableType} value={variableType}>{text}</Option>
  ))

  private viewVariableValueTypeOptions = Object.entries(ViewVariableValueTypesLocale).map(([valueType, text]) => (
    <Option key={valueType} value={valueType}>{text}</Option>
  ))

  public state: Readonly<IVariableModalStates> = {
    operatorType: OperatorTypes.In,
    selectedType: ViewVariableTypes.Query,
    selectedValueType: ViewVariableValueTypes.String,
    defaultValues: []
  }

  public componentDidUpdate (prevProps: IVariableModalProps & FormComponentProps) {
    const { form, variable, visible } = this.props
    if (variable !== prevProps.variable || visible !== prevProps.visible) {
      form.setFieldsValue(variable || defaultVarible)
      const { type, valueType, defaultValues } = variable || defaultVarible
      this.setState({
        selectedType: type,
        selectedValueType: valueType,
        defaultValues: [...defaultValues]
      })
    }
  }

  private typeChange = (selectedType: ViewVariableTypes) => {
    this.setState({ selectedType })
  }

  private valueTypeChange = (selectedValueType: ViewVariableValueTypes) => {
    this.setState({
      selectedValueType,
      operatorType: selectedValueType === ViewVariableValueTypes.Boolean ? OperatorTypes.Equal : OperatorTypes.In,
      defaultValues: []
    })
  }

  private defaultValueChange = (values: ConditionValueTypes[]) => {
    this.setState({ defaultValues: values })
  }

  private validateVariableName = (_: any, name: string, callback: (msg?: string) => void) => {
    const isValidName = /[\w]+/.test(name)
    if (!isValidName) {
      callback('变量名称由字母、数字及下划线组成')
      return
    }
    const { nameValidator } = this.props
    if (!nameValidator) {
      callback()
      return
    }
    const { variable } = this.props
    const key = variable ? variable.key : ''
    nameValidator(key, name, callback)
  }

  private clearFieldsValue = () => {
    this.props.form.resetFields()
  }

  private save = () => {
    const { form, variable, onSave } = this.props
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (!err) {
        const updatedVariable = fieldsValue as IViewVariable
        if (variable) {
          updatedVariable.key = variable.key
        }
        if (updatedVariable.type === ViewVariableTypes.Query) {
          updatedVariable.defaultValues = this.state.defaultValues
        }
        onSave(updatedVariable)
      }
    })
  }

  public render () {
    const { visible, variable, onCancel, form } = this.props
    const { getFieldDecorator } = form
    const { operatorType, selectedType, selectedValueType, defaultValues } = this.state

    const modalButtons = [(
      <Button
        key="back"
        size="large"
        onClick={onCancel}
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

    return (
      <Modal
        title={`${variable && variable.key ? '修改' : '新增'}变量`}
        wrapClassName="ant-modal-small"
        maskClosable={false}
        visible={visible}
        footer={modalButtons}
        onCancel={onCancel}
        afterClose={this.clearFieldsValue}
      >
        <Form>
          <FormItem label="名称" {...this.formItemStyle}>
            {getFieldDecorator<IViewVariable>('name', {
              rules: [{
                validator: this.validateVariableName
              }]
            })(<Input />)}
          </FormItem>
          <FormItem label="别名" {...this.formItemStyle}>
            {getFieldDecorator<IViewVariable>('alias')(<Input />)}
          </FormItem>
          <FormItem label="类型" {...this.formItemStyle}>
            {getFieldDecorator<IViewVariable>('type', {
              rules: [{
                required: true,
                message: '请选择类型'
              }]
            })(<Select onChange={this.typeChange}>{this.viewVariableTypeOptions}</Select>)}
          </FormItem>
          <FormItem label="值类型" {...this.formItemStyle}>
            {getFieldDecorator<IViewVariable>('valueType', {
              rules: [{
                required: true,
                message: '请选择值类型'
              }]
            })(<Select onChange={this.valueTypeChange}>{this.viewVariableValueTypeOptions}</Select>)}
          </FormItem>
          {selectedType === ViewVariableTypes.Query && (
            <FormItem label="默认值" {...this.formItemStyle}>
              <ConditionValuesControl
                visualType={selectedValueType}
                operatorType={operatorType}
                conditionValues={defaultValues}
                onChange={this.defaultValueChange}
              />
            </FormItem>)}
          <FormItem>
            <Row>
              <Col span={this.formItemStyle.wrapperCol.span} offset={this.formItemStyle.labelCol.span}>
                {getFieldDecorator<IViewVariable>('fromService')(
                  <Checkbox>通过外部服务取值变量</Checkbox>)}
              </Col>
            </Row>
          </FormItem>
        </Form>
      </Modal>
    )
  }

}

export default Form.create<IVariableModalProps>()(VariableModal)
