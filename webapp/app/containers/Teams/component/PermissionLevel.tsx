import * as React from 'react'
import { Form, Radio, Row, Col, Input } from 'antd'
const FormItem = Form.Item
const RadioButton = Radio.Button
const utilStyles = require('../../../assets/less/util.less')

const permissions = [
  'widget',
  'viz',
  'source',
  'view',
  'schedule',
  'share',
  'download'
]

interface IPermissionLevelProps {
  role: number
  form: any
  param: any
  selectChanged: (val: any) => any
}

export class PermissionLevel extends React.PureComponent <IPermissionLevelProps, {}> {
  private handleSelectChange = (val) => {
    const {selectChanged} = this.props
    if (selectChanged) {
      this.props.selectChanged(val)
    }
  }
  public componentDidMount () {
    const {param} = this.props
    const {
      id,
      vizPermission,
      viewPermission,
      sharePermission,
      sourcePermission,
      widgetPermission,
      downloadPermission,
      schedulePermission
    } = param
    this.props.form.setFieldsValue({
      id,
      vizPermission,
      viewPermission,
      sharePermission,
      sourcePermission,
      widgetPermission,
      downloadPermission,
      schedulePermission
    })
  }
  public render () {
    const formItemLayout = {
      labelCol: {
        span: 5
      },
      wrapperCol: {
        span: 18,
        offset: 1
      }
    }
    const { role } = this.props
    const { getFieldDecorator } = this.props.form
    const permission = permissions.map((per) => {
      switch (per) {
        case 'share':
        case 'download':
          return (
            <Col key={`col${per}`} span={12}>
              <FormItem
                key={per}
                label={per}
                {...formItemLayout}
              >
                {getFieldDecorator(`${per}Permission`, {
                  rules: [],
                  initialValue: false
                })(
                  <Radio.Group size="small" disabled={!role} onChange={this.handleSelectChange}>
                    <RadioButton value={false}>禁止</RadioButton>
                    <RadioButton value={true}>允许</RadioButton>
                  </Radio.Group>
                )}
              </FormItem>
            </Col>
          )
        default:
          return (
            <Col key={`col${per}`} span={12}>
              <FormItem
                key={per}
                label={per}
                {...formItemLayout}
              >
                {getFieldDecorator(`${per}Permission`, {
                  rules: []
                })(
                  <Radio.Group size="small" disabled={!role} onChange={this.handleSelectChange}>
                    <RadioButton value={0}>隐藏</RadioButton>
                    <RadioButton value={1}>只读</RadioButton>
                    <RadioButton value={2}>修改</RadioButton>
                    <RadioButton value={3}>删除</RadioButton>
                  </Radio.Group>
                )}
              </FormItem>
            </Col>
          )
      }
    })
    return (
        <div>
          <Form>
            <Row gutter={6}>
              <Col className={utilStyles.hide}>
                <FormItem
                  key="relationId"
                >
                  {getFieldDecorator('id', {
                    rules: [],
                    initialValue: false
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Col>
              {permission}
            </Row>
          </Form>
        </div>
    )
  }
}

export default Form.create()(PermissionLevel)
