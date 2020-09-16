import React from 'react'
import { Col, Row, Input, Button, Form } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
const FormItem = Form.Item
const styles = require('../Profile/profile.less')



interface IResetPasswordProps {
  submit: () => any
}


export class ResetPasswordForm extends React.PureComponent<IResetPasswordProps & FormComponentProps, {}> {
  public componentDidMount () {
    this.props.form.validateFields()
  }
  private checkPasswordConfirm = (rule, value, callback) => {
    if (value && value !== this.props.form.getFieldValue('password')) {
      callback('两次输入的密码不一致')
    } else {
      callback()
    }
  }

  private forceCheckConfirm = (rule, value, callback) => {
    const { form } = this.props
    if (form.getFieldValue('confirmPassword')) {
      form.validateFields(['confirmPassword'], { force: true })
    }
    callback()
  }
  private hasErrors = (fieldsError) => {
    return Object.keys(fieldsError).some((field) => fieldsError[field])
  }
  public render () {
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form
    const commonFormItemStyle = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 }
    }
    const oldPassError = isFieldTouched('oldPassword') && getFieldError('oldPassword')
    const newPassError = isFieldTouched('password') && getFieldError('password')
    const confirmPasswordError = isFieldTouched('confirmPassword') && getFieldError('confirmPassword')
    const isSubmit = this.hasErrors(getFieldsError())
    return (
      <Form className={styles.formView}>
        <Row>
          <Col>
            <FormItem
              {...commonFormItemStyle}
              className={styles.hide}
            >
              {getFieldDecorator('id', {})(
                <Input />
              )}
            </FormItem>

            <FormItem
              label="旧密码"
              {...commonFormItemStyle}
              validateStatus={oldPassError ? 'error' : 'success'}
              help={oldPassError || ''}
            >
              {getFieldDecorator('oldPassword', {
                rules: [{
                  required: true,
                  message: '旧密码不能为空'
                }]
              })(
                <Input type="password" placeholder="Your Password" />
              )}
            </FormItem>
          </Col>
          <Col>
            <FormItem
              label="新密码"
              {...commonFormItemStyle}
              validateStatus={newPassError ? 'error' : 'success'}
              help={newPassError || ''}
            >
              {getFieldDecorator('password', {
                rules: [{
                  required: true,
                  message: '新密码不能为空'
                }, {
                  min: 6,
                  max: 20,
                  message: '密码长度为6-20位'
                }, {
                  validator: this.forceCheckConfirm
                }]
              })(
                <Input type="password" placeholder="New Password" />
              )}
            </FormItem>
          </Col>
          <Col>
            <FormItem
              label="确认新密码"
              {...commonFormItemStyle}
              validateStatus={confirmPasswordError ? 'error' : 'success'}
              help={confirmPasswordError || ''}
            >
              {getFieldDecorator('confirmPassword', {
                rules: [{
                  required: true,
                  message: '请确认密码'
                }, {
                  validator: this.checkPasswordConfirm
                }]
              })(
                <Input type="password" placeholder="Confirm Password" />
              )}
            </FormItem>
          </Col>
          <Col offset={4}>
            <Button size="large" type="primary" disabled={isSubmit} onClick={this.props.submit}>确认修改</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create<IResetPasswordProps & FormComponentProps>()(ResetPasswordForm)











