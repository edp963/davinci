import * as React from 'react'
import { FormComponentProps } from 'antd/lib/form/Form'

const Form = require('antd/lib/form')
const FormItem = Form.Item
const Input = require('antd/lib/input')
const { TextArea } = Input
const Button = require('antd/lib/button')

const styles = require('./Workbench.less')

interface IFieldConfigFormProps {
  fieldInfo: {
    alias: string
    desc: string
  }
  onSave: (config) => void
  onCancel: () => void
}

export class FieldConfigForm extends React.PureComponent<IFieldConfigFormProps & FormComponentProps, {}> {

  private saveConfig = () => {
    const { onSave, form } = this.props
    const { alias, desc } = form.getFieldsValue() as IFieldConfigFormProps['fieldInfo']
    onSave({
      alias,
      desc
    })
  }

  public resetForm = () => {
    this.props.form.resetFields()
  }

  public render () {
    const { fieldInfo, form, onCancel } = this.props
    const { alias, desc } = fieldInfo
    const { getFieldDecorator } = form

    return (
      <div className={styles.fieldSettingForm}>
        <div>
          <Form>
            <FormItem label="字段别名">
              {getFieldDecorator('alias', {
                initialValue: alias,
                rules: [{ required: true }]
              })(<Input />)}
            </FormItem>
            <FormItem label="字段描述">
              {getFieldDecorator('desc', {
                initialValue: desc
              })(<TextArea rows={4} />)}
            </FormItem>
          </Form>
        </div>
        <div className={styles.footer}>
          <Button type="primary" onClick={this.saveConfig}>保存</Button>
          <Button onClick={onCancel}>取消</Button>
        </div>
      </div>
    )
  }
}

export default Form.create()(FieldConfigForm)
