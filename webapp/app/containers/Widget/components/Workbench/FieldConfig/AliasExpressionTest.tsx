import * as React from 'react'

import Input from 'antd/lib/input'
import Button from 'antd/lib/button'
import Form, { FormComponentProps } from 'antd/lib/form'
const FormItem = Form.Item
import Modal from 'antd/lib/modal'

interface IAliasExpressionTestProps extends FormComponentProps {
  visible: boolean
  queryVars: string[]
  onClose: () => void
  onTest: (queryVarsObj: { [key: string]: string }) => void
}

export class AliasExpressionTest extends React.PureComponent<IAliasExpressionTestProps> {

  private labelCol = {span: 8}
  private wrapperCol = {span: 14}

  private renderQueryVarItem = (queryVar: string) => {
    const { form } = this.props
    const { getFieldDecorator } = form
    return (
      <FormItem key={queryVar} label={queryVar} labelCol={this.labelCol} wrapperCol={this.wrapperCol}>
        {getFieldDecorator(queryVar)(<Input />)}
      </FormItem>
    )
  }

  private ok = () => {
    const { form, onTest } = this.props
    let queryVarsObj = form.getFieldsValue() as { [key: string]: string }
    queryVarsObj = Object.entries(queryVarsObj).reduce((obj, [key, value]) => {
      obj[`$${key}$`] = value
      return obj
    }, {})
    onTest(queryVarsObj)
  }

  private close = () => {
    this.props.onClose()
  }

  private testModalFooter = [(
    <Button
      key="cancel"
      size="large"
      onClick={this.close}
    >
      关 闭
    </Button>
  ), (
    <Button
      key="submit"
      size="large"
      type="primary"
      onClick={this.ok}
    >
      确 定
    </Button>
  )]

  public render () {
    const { visible, queryVars } = this.props

    return (
      <Modal
        title="变量值输入"
        wrapClassName="ant-modal-small"
        footer={this.testModalFooter}
        visible={visible}
        onCancel={this.close}
      >
        <Form>
          {queryVars.map((queryVar) => this.renderQueryVarItem(queryVar))}
        </Form>
      </Modal>
    )
  }

}

export default Form.create()(AliasExpressionTest)
