import * as React from 'react'
const Icon = require('antd/lib/icon')
import { Link } from 'react-router'
import Box from '../../components/Box'
const Col = require('antd/lib/col')
const Row = require('antd/lib/row')
const Input = require('antd/lib/input')
const Form = require('antd/lib/Form')
const FormItem = Form.Item
const styles = require('../Profile/profile.less')
const Button = require('antd/lib/button')
const utilStyles = require('../../assets/less/util.less')
const Breadcrumb = require('antd/lib/breadcrumb')


interface IResetPasswordProps {
  form: any
  type: string
}


export class ResetPassword extends React.PureComponent<IResetPasswordProps> {
  private checkPasswordConfirm = (rule, value, callback) => {
    if (value && value !== this.props.form.getFieldValue('newPass')) {
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
  private submit = () => {
    console.log('submit')
  }
  public render () {
    const { getFieldDecorator } = this.props.form
    const commonFormItemStyle = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 }
    }
    return (
      <Box>
        <Box.Header>
          <Box.Title>
            <Breadcrumb className={utilStyles.breadcrumb}>
              <Breadcrumb.Item>
                <Link to="/account/resetPassword">
                  <Icon type="bars" />修改密码
                </Link>
              </Breadcrumb.Item>
            </Breadcrumb>
          </Box.Title>
        </Box.Header>
        <Box.Body>
          <div className={styles.container}>
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

                    <FormItem label="旧密码" {...commonFormItemStyle}>
                      {getFieldDecorator('oldPass', {
                        rules: [{
                          required: true,
                          message: '旧密码不能为空'
                        }, {
                          min: 6,
                          max: 20,
                          message: '密码长度为6-20位'
                        }]
                      })(
                        <Input type="password" placeholder="Your Password" />
                      )}
                    </FormItem>
                  </Col>
                  <Col>
                    <FormItem label="新密码" {...commonFormItemStyle}>
                      {getFieldDecorator('newPass', {
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
                    <FormItem label="确认新密码" {...commonFormItemStyle}>
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
                    <Button size="large" type="primary" onClick={this.submit}>确认修改</Button>
                  </Col>
                </Row>
              </Form>
          </div>
        </Box.Body>
      </Box>
    )
  }
}

export default Form.create()(ResetPassword)











