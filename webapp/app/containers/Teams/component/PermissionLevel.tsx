import * as React from 'react'
const Form = require('antd/lib/form')
const FormItem = Form.Item
const Radio = require('antd/lib/radio/radio')
const RadioButton = Radio.Button
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Input = require('antd/lib/input')
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
  form: any
  param: any
  selectChanged: (val:any) => any
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
      vizPermisstion,
      viewPermisstion,
      sharePermisstion,
      sourcePermisstion,
      widgetPermisstion,
      downloadPermisstion,
      schedulePermisstion
    } = param
    this.props.form.setFieldsValue({
      id,
      vizPermisstion,
      viewPermisstion,
      sharePermisstion,
      sourcePermisstion,
      widgetPermisstion,
      downloadPermisstion,
      schedulePermisstion
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
                {getFieldDecorator(`${per}Permisstion`, {
                  rules: [],
                  initialValue: false
                })(
                  <Radio.Group size="small" onChange={this.handleSelectChange}>
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
                {getFieldDecorator(`${per}Permisstion`, {
                  rules: []
                })(
                  <Radio.Group size="small" onChange={this.handleSelectChange}>
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
