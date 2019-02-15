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
import Form from 'antd/lib/form'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Input from 'antd/lib/input'
import Dropdown from 'antd/lib/dropdown'
import Tree from 'antd/lib/tree'
import Menu from 'antd/lib/menu'
const Search = Input.Search
const FormItem = Form.Item
const TreeNode = Tree.TreeNode
const MenuItem = Menu.Item
const styles = require('../Bizlogic.less')
const utilStyles = require('../../../assets/less/util.less')
import { generateData } from '../../../utils/util'

interface ISourceSchemaProps {
  form: any
  selectedSourceName: string
  dataList: any[]
  schemaData: any[]
  sources: any
  initSelectSource: (source: any) => any
  onLoadTableColumn: (tableName: string) => any
}

interface ISourceSchemaStates {
  expandedKeys: string[]
  searchValue: string
  autoExpandParent: boolean
}

export class SourceSchema extends React.PureComponent<ISourceSchemaProps, ISourceSchemaStates> {
  constructor (props) {
    super(props)
    this.state = {
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true
    }
  }

  private onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false
    })
  }

  private getParentKey = (key, tree) => {
    let parentKey
    tree.forEach((i) => {
      if (i.children) {
        if (i.children.some((item) => item.key === key)) {
          parentKey = i.key
        } else if (this.getParentKey(key, i.children)) {
          parentKey = this.getParentKey(key, i.children)
        }
      }
    })
    return parentKey
  }

  private searchSchema = (e) => {
    const { dataList, schemaData } = this.props
    const value = e.target.value
    const expandedKeys = dataList.map((item) => {
      if (item.key.indexOf(value) > -1) {
        return this.getParentKey(item.key, generateData(schemaData))
      }
      return null
    }).filter((item, i, self) => item && self.indexOf(item) === i)
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true
    })
  }

  private selectSource = (source) => {
    this.props.initSelectSource(source)
  }

  private handleTree = (clickKey, obj) => {
    const { expandedKeys } = this.state
    const { onLoadTableColumn } = this.props
    onLoadTableColumn(clickKey[0])
    this.setState({
      autoExpandParent: false
    })

    if (obj.selected) {
      if (expandedKeys.indexOf(clickKey[0]) < 0) {
        expandedKeys.push(clickKey[0])
        this.setState({
          expandedKeys
        })
      } else {
        this.setState({
          expandedKeys: expandedKeys.filter((e) => e !== clickKey[0])
        })
      }
    } else {
      let currentKey = []
      if (expandedKeys.length === 0) {
        expandedKeys.push(obj.node.props.title)
        currentKey = expandedKeys
      } else {
        currentKey = expandedKeys.filter((e) => e !== obj.node.props.title)
      }
      this.setState({
        expandedKeys: currentKey
      })
    }
  }

  public render () {
    const {
      form,
      selectedSourceName,
      schemaData,
      sources
    } = this.props
    const {
      searchValue,
      expandedKeys,
      autoExpandParent
    } = this.state
    const { getFieldDecorator } = form
    const data = []
    generateData(schemaData).forEach((item) => {
      const index = item.key.search(searchValue)

      if (index >= 0) {
        data.push(item)
      } else {
        if (item.children) {
          const child = []
          item.children.forEach((c) => {
            const cIndex = c.key.search(searchValue)
            if (cIndex >= 0) {
              child.push(c)

              const obj = {
                title: item.title,
                key: item.key,
                children: child
              }
              if (child.length > 1) {
                return
              } else {
                data.push(obj)
              }
            }
          })
        }
      }
    })

    const loop = (data) => data.map((item) => {
      if (item.children) {
        return (
          <TreeNode key={item.key} title={item.key}>
            {loop(item.children)}
          </TreeNode>
        )
      }
      return <TreeNode key={item.key} title={item.key} />
    })

    let sourceSelectMenu
    if (sources) {
      sourceSelectMenu = (
        <Menu onClick={this.selectSource}>
          {((sources as any[]) || []).map((v) => (
            <MenuItem key={v.id}>{v.name}</MenuItem>
          ))}
        </Menu>
      )
    } else {
      sourceSelectMenu = (
        <Menu />
      )
    }

    return (
      <div className={styles.formView}>
        <Row className={`${styles.formLeft} no-item-margin`}>
        <Col span={24} className={styles.leftInput}>
          <FormItem label="" className={utilStyles.hide}>
            {getFieldDecorator('source_id', {})(
              <Input />
            )}
          </FormItem>
          <FormItem label="" className={utilStyles.hide}>
            {getFieldDecorator('source_name', {})(
              <Input />
            )}
          </FormItem>
          <div className={styles.sourceSelect}>
            <Dropdown overlay={sourceSelectMenu} trigger={['click']} placement="bottomLeft">
              <a>{selectedSourceName || '选择一个Source'}</a>
            </Dropdown>
          </div>
        </Col>
        <Col span={24} className={`${schemaData.length !== 0 ? styles.treeSearch : utilStyles.hide}`}>
          <Search
            placeholder="Search the Schema"
            onChange={this.searchSchema}
          />
        </Col>
        <Col span={24} className={`${schemaData.length !== 0 ? styles.sourceTree : utilStyles.hide}`}>
          <Tree
            className={styles.tree}
            onExpand={this.onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            onSelect={this.handleTree}
          >
          {loop(data || [])}
          </Tree>
        </Col>
      </Row>
      </div>
    )
  }
}

export default SourceSchema
