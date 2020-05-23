import React from 'react'
import { Modal, Form, Input, Select, Checkbox, Button, Row, Col } from 'antd'
const FormItem = Form.Item
const TextArea = Input.TextArea
const { Option } = Select
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { FormComponentProps } from 'antd/lib/form/Form'
import ConditionValuesControl, { ConditionValueTypes } from 'components/ConditionValuesControl'
import {
  IViewVariable,
  IDacChannel, IDacTenant, IDacBiz
} from 'containers/View/types'
import OperatorTypes from 'utils/operatorTypes'
import { ViewVariableTypes, ViewVariableTypesLocale, ViewVariableValueTypes, ViewVariableValueTypesLocale } from 'containers/View/constants'

export interface IVariableModalProps {
  visible?: boolean
  variable?: IViewVariable

  channels: IDacChannel[]
  tenants: IDacTenant[]
  bizs: IDacBiz[]

  nameValidator?: (key: string, name: string, callback: (msg?: string) => void) => void
  onCancel?: () => void
  onSave?: (variable: IViewVariable) => void

  onLoadDacTenants: (channelName: string) => void
  onLoadDacBizs: (channelName: string, tenantId: number) => void
}

interface IVariableModalStates {
  operatorType: OperatorTypes
  selectedType: ViewVariableTypes
  selectedValueType: ViewVariableValueTypes
  defaultValues: ConditionValueTypes[]
  isUdf: boolean
  isFromService: boolean
}

const defaultVarible: IViewVariable = {
  key: '',
  name: '',
  alias: '',
  type: ViewVariableTypes.Query,
  valueType: ViewVariableValueTypes.String,
  defaultValues: [],
  udf: false,
  fromService: false
}

export class VariableModal extends React.Component<IVariableModalProps & FormComponentProps, IVariableModalStates> {

  private formItemStyle = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 }
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
    defaultValues: [],
    isUdf: false,
    isFromService: false
  }

  public componentDidUpdate (prevProps: IVariableModalProps & FormComponentProps) {
    const { form, variable, visible, channels } = this.props
    if (variable !== prevProps.variable || visible !== prevProps.visible) {
      const { type, valueType, defaultValues, udf, fromService, channel } = variable || defaultVarible
      if (channel && visible) {
        const { name: channelName, tenantId } = channel
        const { onLoadDacTenants, onLoadDacBizs } = this.props
        onLoadDacTenants(channelName)
        onLoadDacBizs(channelName, tenantId)
      }
      this.setState({
        selectedType: type,
        selectedValueType: valueType,
        defaultValues: defaultValues || [],
        isUdf: udf,
        isFromService: fromService && channels.length > 0
      }, () => {
        form.setFieldsValue(variable || defaultVarible)
      })
    }
  }

  private typeChange = (selectedType: ViewVariableTypes) => {
    this.setState(({ isUdf, isFromService }) => ({
      selectedType,
      isUdf: selectedType === ViewVariableTypes.Authorization ? false : isUdf,
      isFromService: selectedType === ViewVariableTypes.Query ? false : isFromService
    }))
  }

  private valueTypeChange = (selectedValueType: ViewVariableValueTypes) => {
    this.setState({
      selectedValueType,
      operatorType: selectedValueType === ViewVariableValueTypes.Boolean ? OperatorTypes.Equal : OperatorTypes.In,
      defaultValues: []
    })
  }

  private singleDefaultValuesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.defaultValueChange([e.target.value])
  }

  private defaultValueChange = (values: ConditionValueTypes[]) => {
    this.setState({ defaultValues: values })
  }

  private udfChange = (e: CheckboxChangeEvent) => {
    const udf = e.target.checked
    this.setState({ isUdf: udf })
    this.defaultValueChange([])
  }

  private fromServiceChange = (e: CheckboxChangeEvent) => {
    const fromService = e.target.checked
    this.setState({ isFromService: fromService })
  }

  private loadDacBizs = (tenantId: number) => {
    const { form, onLoadDacBizs } = this.props
    const channelName = form.getFieldValue('channel.name')
    onLoadDacBizs(channelName, tenantId)
  }

  private validateVariableName = (_: any, name: string, callback: (msg?: string) => void) => {
    const isValidName = /^[\w]+$/.test(name)
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
        console.log(updatedVariable)
        // return
        onSave(updatedVariable)
      }
    })
  }

  public render () {
    const {
      visible, variable, onCancel, form,
      channels, tenants, bizs,
      onLoadDacTenants
    } = this.props
    const { getFieldDecorator } = form
    const { operatorType, selectedType, selectedValueType, defaultValues, isUdf, isFromService } = this.state

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
                required: true,
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
          {selectedType === ViewVariableTypes.Query && selectedValueType !== ViewVariableValueTypes.SqlExpression && (
            <>
              <FormItem>
                <Row>
                  <Col span={this.formItemStyle.wrapperCol.span} offset={this.formItemStyle.labelCol.span}>
                    {getFieldDecorator<IViewVariable>('udf', {
                      valuePropName: 'checked',
                      initialValue: isUdf
                    })(
                      <Checkbox onChange={this.udfChange}>使用表达式</Checkbox>
                    )}
                  </Col>
                </Row>
              </FormItem>
              {!isUdf && <FormItem label="默认值" {...this.formItemStyle}>
                <ConditionValuesControl
                  visualType={selectedValueType}
                  operatorType={operatorType}
                  conditionValues={defaultValues}
                  onChange={this.defaultValueChange}
                />
              </FormItem>}
            </>
          )}
          {selectedType === ViewVariableTypes.Query && (isUdf || selectedValueType === ViewVariableValueTypes.SqlExpression) && (
            <FormItem label="表达式" {...this.formItemStyle}>
              <TextArea placeholder="请输入表达式" value={defaultValues[0] as string} onChange={this.singleDefaultValuesChange} rows={3} />
            </FormItem>
          )}
          {selectedType === ViewVariableTypes.Authorization && channels.length > 0 && (
            <FormItem>
              <Row>
                <Col span={this.formItemStyle.wrapperCol.span} offset={this.formItemStyle.labelCol.span}>
                  {getFieldDecorator<IViewVariable>('fromService', {
                    valuePropName: 'checked'
                  })(
                    <Checkbox onChange={this.fromServiceChange}>通过外部服务取值变量</Checkbox>)}
                </Col>
              </Row>
            </FormItem>
          )}
          {isFromService && (
            <>
              <FormItem label="服务" {...this.formItemStyle}>
                {getFieldDecorator('channel.name', {
                  rules: [{
                    required: true,
                    message: '服务不能为空'
                  }]
                })(
                <Select onChange={onLoadDacTenants}>
                  {channels.map((c) => <Option key={c} value={c}>{c}</Option>)}
                </Select>)}
              </FormItem>
              <FormItem label="租户" {...this.formItemStyle}>
                {getFieldDecorator('channel.tenantId', {
                  rules: [{
                    required: true,
                    message: '租户不能为空'
                  }]
                })(
                <Select onChange={this.loadDacBizs}>
                  {tenants.map(({ id, name }) => <Option key={id.toString()} value={id}>{name}</Option>)}
                </Select>)}
              </FormItem>
              <FormItem label="业务" {...this.formItemStyle}>
                {getFieldDecorator('channel.bizId', {
                  rules: [{
                    required: true,
                    message: '业务不能为空'
                  }]
                })(
                <Select>
                  {bizs.map(({ id, name }) => <Option key={id.toString()} value={id}>{name}</Option>)}
                </Select>)}
              </FormItem>
            </>
          )}
        </Form>
      </Modal>
    )
  }

}

export default Form.create<IVariableModalProps & FormComponentProps>()(VariableModal)
