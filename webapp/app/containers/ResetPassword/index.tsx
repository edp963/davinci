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
  private checkNameUnique = () => {
    console.log('checkNameUnique')
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
                    <FormItem
                      {...commonFormItemStyle}
                      label="旧密码"
                    >
                      {getFieldDecorator('password', {
                        initialValue: '',
                        rules: [{ required: true }, {validator: this.checkNameUnique}]
                      })(
                        <Input/>
                      )}
                    </FormItem>
                  </Col>
                  <Col>
                    <FormItem
                      {...commonFormItemStyle}
                      label="新密码"
                    >
                      {getFieldDecorator('newPassword', {
                        initialValue: '',
                        rules: [{ required: true }]
                      })(
                        <Input/>
                      )}
                    </FormItem>
                  </Col>
                  <Col>
                    <FormItem
                      {...commonFormItemStyle}
                      label="确认密码"
                    >
                      {getFieldDecorator('newPassword2', {
                        initialValue: '',
                        rules: [{ required: true }]
                      })(
                        <Input/>
                      )}
                    </FormItem>
                  </Col>
                  <Col offset={4}>
                    <Button size="large" onClick={this.submit}>确认修改</Button>
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











