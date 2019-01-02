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
import { connect } from 'react-redux'

import Form from 'antd/lib/form'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Input from 'antd/lib/input'
import Radio from 'antd/lib/radio/radio'
import Tabs from 'antd/lib/tabs'
import Tree from 'antd/lib/tree'
const TreeNode = Tree.TreeNode
const FormItem = Form.Item
const TextArea = Input.TextArea
const RadioGroup = Radio.Group
const TabPane = Tabs.TabPane

const utilStyles = require('../../../assets/less/util.less')
import { toListBF } from '../../Bizlogic/viewUtil'

interface IAuthControlProps {
  checkedKeys: any[]
  viewTeam: any[]
  initCheckNodes: (checkedKeys: any[]) => any
}

export class AuthControl extends React.PureComponent<IAuthControlProps, {}> {
  private onCheck = (checkedKeys) => {
    this.props.initCheckNodes(checkedKeys.checked.map(Number))
  }

  private renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.name} key={item.id} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        )
      }
      return <TreeNode title={item.name} key={item.id} />
  })}

  public render () {
    const {
      checkedKeys,
      viewTeam
    } = this.props

    return (
      <Tree
        checkStrictly
        checkable
        // onExpand={this.onExpand}
        // expandedKeys={expandedKeys}
        // defaultExpandParent={true}
        autoExpandParent={true}
        defaultExpandAll={true}
        onCheck={this.onCheck}
        checkedKeys={checkedKeys}
        // onSelect={this.onSelect}
        // selectedKeys={selectedKeys}
      >
        {this.renderTreeNodes(viewTeam)}
      </Tree>
    )
  }
}

export default AuthControl
