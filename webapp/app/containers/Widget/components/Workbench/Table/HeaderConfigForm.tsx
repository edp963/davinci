import * as React from 'react'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import { FormComponentProps } from 'antd/lib/form/Form'

import Form from 'antd/lib/form'
const FormItem = Form.Item
import Input from 'antd/lib/input'
import InputNumber from 'antd/lib/input-number'
import Radio from 'antd/lib/radio/radio'
const RadioGroup = Radio.Group
import Checkbox from 'antd/lib/checkbox'
import Select from 'antd/lib/select'
const { Option } = Select
import Tree from 'antd/lib/tree'
import Button from 'antd/lib/button'

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
