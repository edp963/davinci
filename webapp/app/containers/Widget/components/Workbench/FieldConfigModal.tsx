import * as React from 'react'
import { FormComponentProps } from 'antd/lib/form/Form'

const Form = require('antd/lib/form')
const FormItem = Form.Item
const Input = require('antd/lib/input')
const { TextArea } = Input
const Button = require('antd/lib/button')
const Modal = require('antd/lib/modal')

const styles = require('./Workbench.less')

export interface IFieldConfig {
  alias: string
  desc: string
}

interface IFieldConfigModalProps extends FormComponentProps {
  visible: boolean
  fieldConfig: IFieldConfig
  onSave: (config) => void
  onCancel: () => void
}

interface IFieldConfigModalStates {
  localConfig: IFieldConfig
}

export class FieldConfigModal extends React.PureComponent<IFieldConfigModalProps, IFieldConfigModalStates> {

  public constructor (props: IFieldConfigModalProps) {
    super(props)
    const { fieldConfig } = this.props
    this.state = {
      localConfig: fieldConfig ? { ...fieldConfig } : { alias: '', desc: '' }
    }
  }

  public componentDidMount () {
    this.props.form.setFieldsValue(this.state.localConfig)
  }

  public componentWillReceiveProps (nextProps: IFieldConfigModalProps) {
    const { fieldConfig, form } = nextProps
    if (fieldConfig !== this.props.fieldConfig) {
      form.resetFields()
      this.setState({
        localConfig: fieldConfig ? { ...fieldConfig } : { alias: '', desc: '' }
      }, () => {
        form.setFieldsValue(this.state.localConfig)
      })
    }
  }

  private save = () => {
    const { form, onSave } = this.props
    form.validateFieldsAndScroll((err, fieldValues) => {
      if (err) { return }

      const config = fieldValues as IFieldConfig
      onSave(config)
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
    const { visible, form } = this.props
    const { getFieldDecorator } = form
    const { alias, desc } = this.state.localConfig

    return (
      <Modal
        title="字段设置"
        wrapClassName="ant-modal-small"
        footer={this.modalFooter}
        visible={visible}
        onCancel={this.cancel}
      >
        <Form>
          <FormItem label="字段别名">
            {getFieldDecorator('alias', {
              initialValue: alias,
              rules: [{ required: true, message: '不能为空' }]
            })(<Input />)}
          </FormItem>
          <FormItem label="字段描述">
            {getFieldDecorator('desc', {
              initialValue: desc
            })(<TextArea rows={4} />)}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(FieldConfigModal)
