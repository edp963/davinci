import * as React from 'react'
const styles = require('../Organization.less')
const Button = require('antd/lib/Button')
const Input = require('antd/lib/input')
const Form = require('antd/lib/form')
const FormItem = Form.Item
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Checkbox = require('antd/lib/checkbox')
import UploadAvatar from '../../../components/UploadAvatar'
const utilStyles = require('../../../assets/less/util.less')

interface ISettingProps {
  form: any
}

export class Setting extends React.PureComponent <ISettingProps> {
  public render () {
    const { getFieldDecorator } = this.props.form
    const commonFormItemStyle = {
      labelCol: { span: 2 },
      wrapperCol: { span: 18 }
    }
    return (
      <div className={styles.listWrapper}>
        <div className={styles.container}>
          <UploadAvatar/>
          <hr/>
          <div className={styles.form}>
            <Form>
              <Row>
                <Col>
                  <FormItem className={utilStyles.hide}>
                    {getFieldDecorator('id', {})(
                      <Input />
                    )}
                  </FormItem>
                  <FormItem
                    {...commonFormItemStyle}
                    hasFeedback
                    label="姓名"
                  >
                    {getFieldDecorator('name', {
                      initialValue: '',
                      rules: [{ required: true }, {
                       // validator: this.checkNameUnique
                      }]
                    })(
                      <Input size="large" placeholder="Name"/>
                    )}
                  </FormItem>
                </Col>
                <Col>
                  <FormItem
                    {...commonFormItemStyle}
                    hasFeedback
                    label="描述"
                  >
                    {getFieldDecorator('description', {
                      rules: [{
                        required: true,
                        message: 'description 不能为空'
                      }, {
                        //  validator: this.checkNameUnique
                      }]
                    })(
                      <Input placeholder="description" />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row className={styles.permissionZone}>
                <Col>
                  <FormItem>
                    {getFieldDecorator('allowCreateProject', {
                      valuePropName: 'checked',
                      initialValue: true
                    })(
                      <Checkbox>allowCreateProject</Checkbox>
                    )}
                  </FormItem>
                </Col>
                <Col>
                  <FormItem>
                    {getFieldDecorator('allowDeleteOrTransferProject', {
                      valuePropName: 'checked',
                      initialValue: true
                    })(
                      <Checkbox>allowDeleteOrTransferProject</Checkbox>
                    )}
                  </FormItem>
                </Col>
                <Col>
                  <FormItem>
                    {getFieldDecorator('allowChangeVisibility', {
                      valuePropName: 'checked',
                      initialValue: true
                    })(
                      <Checkbox>allowChangeVisibility</Checkbox>
                    )}
                  </FormItem>
                </Col>
                <Col>
                  <FormItem>
                    {getFieldDecorator('memberPermission', {
                      valuePropName: 'checked',
                      initialValue: true
                    })(
                      <Checkbox>memberPermission</Checkbox>
                    )}
                  </FormItem>
                </Col>
                <Col>
                  <Button size="large">保存修改</Button>
                </Col>
              </Row>
              <Row className={styles.dangerZone}>
                <div className={styles.title}>
                   删除组织
                </div>
                <div className={styles.titleDesc}>
                  <p className={styles.desc}>删除后无法恢复，请确定此次操作</p>
                  <p className={styles.button}>
                    <Button size="large" type="danger">删除{}</Button>
                  </p>
                </div>
              </Row>
            </Form>
          </div>
        </div>
      </div>
    )
  }
}

export default Form.create()(Setting)



