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
  nameValidator?: (name: string, callback: (msg?: string) => void) => void
  onCancel: () => void
  onSave: (variable: IViewVariable) => void
}

interface IVariableModalStates {
  variableName: string,
  editType: 'add' | 'edit'
  operatorType: OperatorTypes
  selectedType: ViewVariableTypes
  selectedValueType: ViewVariableValueTypes
  defaultValues: ConditionValueTypes[]
}

export class VariableModal extends React.Component<IVariableModalProps & FormComponentProps, IVariableModalStates> {

  private static DefaultType = ViewVariableTypes.Query
  private static DefaultValueType = ViewVariableValueTypes.String

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
    variableName: '',
    editType: 'add',
    operatorType: OperatorTypes.In,
    selectedType: ViewVariableTypes.Query,
    selectedValueType: ViewVariableValueTypes.String,
    defaultValues: []
  }

  // public componentDidMount () {
  //   const { form, variable } = this.props
  //   form.setFieldsValue({ ...variable })
  // }

  public static getDerivedStateFromProps:
    React.GetDerivedStateFromProps<IVariableModalProps & FormComponentProps, IVariableModalStates>
  = (props, state) => {
    const { variable, form } = props
    if (!variable) {
      return {
        variableName: '',
        editType: 'add',
        operatorType: OperatorTypes.In,
        selectedType: VariableModal.DefaultType,
        selectedValueType: VariableModal.DefaultValueType,
        defaultValues: []
      }
    }
    if (variable.name !== state.variableName) {
      form.setFieldsValue({ ...variable })
      return {
        variableName: variable.name,
        editType: variable.name ? 'edit' : 'add',
        operatorType: variable.valueType === ViewVariableValueTypes.Boolean ? OperatorTypes.Equal : OperatorTypes.In,
        selectedType: variable.type,
        selectedValueType: variable.valueType,
        defaultValues: variable.defaultValues
      }
    }
    return null
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
    nameValidator(name, callback)
  }

  private clearFieldsValue = () => {
    this.props.form.resetFields()
  }

  private save = () => {
    const { form, onSave } = this.props
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (!err) {
        const variable = fieldsValue as IViewVariable
        if (variable.type === ViewVariableTypes.Query) {
          variable.defaultValues = this.state.defaultValues
        }
        onSave(variable)
      }
    })
  }

  public render () {
    const { visible, onCancel, form } = this.props
    const { getFieldDecorator } = form
    const { editType, operatorType, selectedType, selectedValueType, defaultValues } = this.state

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
        // loading={loading}
        // disabled={loading}
        onClick={this.save}
      >
        保 存
      </Button>
    )]

    return (
      <Modal
        title={`${editType === 'add' ? '新增' : '修改'}变量`}
        wrapClassName="ant-modal-small"
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
          <FormItem label="类型" {...this.formItemStyle}>
            {getFieldDecorator<IViewVariable>('type', {
              rules: [{
                required: true,
                message: '请选择类型'
              }],
              initialValue: ViewVariableTypes.Query
            })(<Select onChange={this.typeChange}>{this.viewVariableTypeOptions}</Select>)}
          </FormItem>
          <FormItem label="值类型" {...this.formItemStyle}>
            {getFieldDecorator<IViewVariable>('valueType', {
              rules: [{
                required: true,
                message: '请选择值类型'
              }],
              initialValue: VariableModal.DefaultValueType
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
