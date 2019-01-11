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
import {connect} from 'react-redux'

const Form = require('antd/lib/form')
const Tree = require('antd/lib/tree').default
const TreeNode = Tree.TreeNode

interface ICompanyFormProps {
  teamSelectData: any
}

export class CompanyForm extends React.PureComponent<ICompanyFormProps, {}> {
  private renderParamsTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode key={item.key} title={item.title} dataRef={item}>
            {this.renderParamsTreeNodes(item.children)}
          </TreeNode>
        )
      }
      return <TreeNode key={item.key} title={item.title} />
    })
  }

  public render () {
    const { teamSelectData } = this.props

    return (
      <Tree
        checkable
        // onExpand={this.onExpand}
        // expandedKeys={this.state.expandedKeys}
        // autoExpandParent={this.state.autoExpandParent}
        // onCheck={this.onCheck}
        // checkedKeys={this.state.checkedKeys}
        // onSelect={this.onSelect}
        // selectedKeys={this.state.selectedKeys}
      >
        {this.renderParamsTreeNodes(teamSelectData)}
      </Tree>
    )
  }
}

export default Form.create()(CompanyForm)

