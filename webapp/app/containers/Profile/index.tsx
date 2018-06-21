import * as React from 'react'
import { Link } from 'react-router'
const Icon = require('antd/lib/icon')
const Col = require('antd/lib/col')
const Row = require('antd/lib/row')
const Input = require('antd/lib/input')
const Form = require('antd/lib/Form')
const FormItem = Form.Item
const styles = require('./profile.less')
const Button = require('antd/lib/button')
import Box from '../../components/Box'
import UploadAvatar from '../../components/UploadAvatar'
const utilStyles = require('../../assets/less/util.less')
const Breadcrumb = require('antd/lib/breadcrumb')

interface IProfileProps {
  form: any
  type: string
}

export class Profile extends React.PureComponent<IProfileProps> {
  private checkNameUnique = () => {
    console.log('checkNameUnique')
  }
  private submit = () => {
    console.log('submit')
  }
  public render () {
    const {getFieldDecorator} = this.props.form
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
                <Link to="/account/profile">
                  <Icon type="bars" />个人信息
                </Link>
              </Breadcrumb.Item>
            </Breadcrumb>
          </Box.Title>
        </Box.Header>
        <Box.Body>
          <div className={styles.container}>
            <UploadAvatar/>
            <hr/>
            <div className={styles.form}>
              <Form className={styles.formView}>
                <Row>
                  <Col>
                    <FormItem
                      className={styles.hide}
                      {...commonFormItemStyle}
                    >
                      {getFieldDecorator('id', {})(
                        <Input />
                      )}
                    </FormItem>
                    <FormItem
                      {...commonFormItemStyle}
                      label="姓名"
                    >
                      {getFieldDecorator('name', {
                        initialValue: '',
                        rules: [{ required: true }, {validator: this.checkNameUnique}]
                      })(
                        <Input size="large"/>
                      )}
                    </FormItem>
                  </Col>
                  <Col>
                    <FormItem
                      {...commonFormItemStyle}
                      label="描述"
                    >
                      {getFieldDecorator('description', {
                        initialValue: ''
                      })(
                        <Input />
                      )}
                    </FormItem>
                  </Col>
                  <Col>
                    <FormItem
                      {...commonFormItemStyle}
                      label="部门"
                    >
                      {getFieldDecorator('department', {
                        initialValue: ''
                      })(
                        <Input size="large"/>
                      )}
                    </FormItem>
                  </Col>
                  <Col offset={4}>
                    <Button size="large" type="primary" onClick={this.submit}>保存设置</Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
        </Box.Body>
      </Box>
    )
  }
}

export default Form.create()(Profile)


