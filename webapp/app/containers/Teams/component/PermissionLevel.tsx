import * as React from 'react'
const Form = require('antd/lib/form')
const FormItem = Form.Item
const Radio = require('antd/lib/radio/radio')


const permissions = [
  'schedulePermisstion',
  'sourcePermisstion',
  'viewPermisstion',
  'widgetPermisstion',
  'vizPermisstion',
  'sharePermisstion',
  'downloadPermisstion'
]
interface IPermissionLevelProps {
  form: any
}

export class PermissionLevel extends React.PureComponent <IPermissionLevelProps, {}> {
  public render () {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12, offset: 2 }
      }
    }
    const { getFieldDecorator } = this.props.form
    const permission = permissions.map((per) => {
      return (
        <FormItem
          key={per}
          label={per}
          {...formItemLayout}
        >
          {
            getFieldDecorator(per)(
              <Radio.Group>
                <Radio value="0">隐藏</Radio>
                <Radio value="1">只读</Radio>
                <Radio value="2">修改</Radio>
                <Radio value="3">删除</Radio>
              </Radio.Group>
            )
          }
        </FormItem>
      )
    })
    return (
        <div>
          <Form>
            {permission}
          </Form>
        </div>
    )
  }
}

export default Form.create()(PermissionLevel)
