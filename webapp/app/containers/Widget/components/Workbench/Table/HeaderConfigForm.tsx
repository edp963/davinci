import * as React from 'react'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
import { FormComponentProps } from 'antd/lib/form/Form'

const Form = require('antd/lib/form')
const FormItem = Form.Item
const Input = require('antd/lib/input')
const InputNumber = require('antd/lib/input-number')
const Radio = require('antd/lib/radio/radio')
const RadioGroup = Radio.Group
const Checkbox = require('antd/lib/checkbox')
const Select = require('antd/lib/select')
const { Option } = Select
const Tree = require('antd/lib/tree')
const Button = require('antd/lib/button')

interface IHeaderConfigFormStates {
  headerTreeData: {}
}

export class HeaderConfigForm extends React.PureComponent<{}, IHeaderConfigFormStates> {

  private convertToTreeNodes = (treeData) => {
    return null
  }

  public render () {
    const { headerTreeData } = this.state
    const treeNodes = this.convertToTreeNodes(headerTreeData)

    return (
      <Row gutter={8}>
        <Col span={12}>
          <Input />
        </Col>
        <Col>
          <Button>合并</Button>
        </Col>
        <Col span={24}>
          <Tree>{treeNodes}</Tree>
        </Col>
      </Row>
    )
  }
}
