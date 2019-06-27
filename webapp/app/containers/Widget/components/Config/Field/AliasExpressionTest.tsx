import * as React from 'react'

import { Input, Button, Form, Modal } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
const FormItem = Form.Item
import { IQueryVariableMap } from 'app/containers/Dashboard/Grid'

interface IAliasExpressionTestProps extends FormComponentProps {
  visible: boolean
  queryVariableNames: string[]
  onClose: () => void
  onTest: (queryVariableMap: IQueryVariableMap) => void
}

export class AliasExpressionTest extends React.PureComponent<IAliasExpressionTestProps> {

  private labelCol = {span: 8}
  private wrapperCol = {span: 14}

  private renderQueryVarItem = (queryVariableName: string) => {
    const { form } = this.props
    const { getFieldDecorator } = form
    return (
      <FormItem key={queryVariableName} label={queryVariableName} labelCol={this.labelCol} wrapperCol={this.wrapperCol}>
        {getFieldDecorator(queryVariableName)(<Input />)}
      </FormItem>
    )
  }

  private ok = () => {
    const { form, onTest } = this.props
    let queryVariables = form.getFieldsValue() as { [key: string]: string }
    queryVariables = Object.entries(queryVariables).reduce((obj, [key, value]) => {
      obj[`$${key}$`] = value
      return obj
    }, {})
    onTest(queryVariables)
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
    const { visible, queryVariableNames } = this.props

    return (
      <Modal
        title="变量值输入"
        wrapClassName="ant-modal-small"
        footer={this.testModalFooter}
        visible={visible}
        onCancel={this.close}
      >
        <Form>
          {queryVariableNames.map((name) => this.renderQueryVarItem(name))}
        </Form>
      </Modal>
    )
  }

}

export default Form.create<IAliasExpressionTestProps>()(AliasExpressionTest)
