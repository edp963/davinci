import * as React from 'react'
const styles = require('../Team.less')
const Button = require('antd/lib/Button')
const Form = require('antd/lib/form')
const FormItem = Form.Item
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Checkbox = require('antd/lib/checkbox')
import UploadAvatar from '../../../components/UploadAvatar'

interface ISettingProps {
  form: any
}

export class Setting extends React.PureComponent <ISettingProps> {
  public render () {
    const { getFieldDecorator } = this.props.form
    return (
      <div className={styles.listWrapper}>
        <div className={styles.container}>
          <UploadAvatar/>
          <div className={styles.form}>
            <Row>
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
                  {getFieldDecorator('remember', {
                    valuePropName: 'checked',
                    initialValue: true
                  })(
                    <Checkbox>Remember me</Checkbox>
                  )}
                </FormItem>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    )
  }
}

export default Form.create()(Setting)



