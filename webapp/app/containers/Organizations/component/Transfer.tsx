/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */
import * as React from 'react'
import { Form, Row, Col, Transfer } from 'antd'

interface ICommonTransferProps {
  form: any
  groupSource?: any[]
  groupTarget?: any[]
  onGroupChange?: (targets) => any
  dataSource?: any[]
  optionTitle: () => any
  filterOption: (inputValut: string, option: any[]) => any
  targetKeys: any[]
  setTargetKeys: (newTargetKeys: any) => any
  rowKeys: () => any
}

interface ICommonTransferState {
  dataSource: any[]
  targetKeys: any[]
}

export class CommonTransfer extends React.PureComponent<ICommonTransferProps, ICommonTransferState> {

  constructor (props) {
    super(props)
    this.state = {
      dataSource: [],
      targetKeys: []
    }
  }

  public componentDidMount () {
    const {dataSource} = this.props
    this.setState({
      dataSource: this.addKeyInDatasource(dataSource as any[])
    })
  }

  private addKeyInDatasource (dataSource) {
    return dataSource.map((o, index) => ({...o, ...{key: `dataSource${index}`}}))
  }

  public componentWillReceiveProps (nextProps) {
    const {dataSource} = nextProps
    if (dataSource !== this.props.dataSource) {
      this.setState({
        dataSource: this.addKeyInDatasource(dataSource as any[])
      })
    }
  }

  private handleChange = (targetKeys) => {
    this.props.setTargetKeys(targetKeys)
  }

  public render () {
    return (
        <Row>
          <Col span={24}>
            <Transfer
              showSearch
              titles={['列表', '已选']}
              listStyle={{width: '210px'}}
              rowKey={this.props.rowKeys}
              dataSource={this.state.dataSource}
              filterOption={this.props.filterOption}
              targetKeys={this.props.targetKeys}
              onChange={this.handleChange}
             // onSearch={this.handleSearch}
              render={this.props.optionTitle}
            />
          </Col>
        </Row>
    )
  }
}


export default Form.create()(CommonTransfer)






