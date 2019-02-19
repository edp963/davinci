import * as React from 'react'
import { Row, Col, Input, Button, Tree } from 'antd'

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
