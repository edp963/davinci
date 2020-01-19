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

import React, { PureComponent } from 'react'
import classnames from 'classnames'
import { uuid } from 'utils/util'

import { FormComponentProps } from 'antd/lib/form/Form'
import { Form, Input, InputNumber, Select, Radio, Button, Icon } from 'antd'
const Option = Select.Option
const FormItem = Form.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button

const styles = require('./Workbench.less')

interface IConditionalFilterPanelProps {
  filterTree: object
  name: string
  type: string
  onAddRoot: () => void
  onAddTreeNode: (tree) => void
  onDeleteTreeNode: () => void
}

interface IConditionalFilterPanelStates {
  flattenTree: object
}

export class ConditionalFilterPanel extends PureComponent<IConditionalFilterPanelProps & FormComponentProps, IConditionalFilterPanelStates> {
  constructor (props) {
    super(props)
    this.state = {
      flattenTree: null
    }
  }

  public componentWillMount () {
    const { filterTree } = this.props
    if (Object.keys(filterTree).length > 0) {
      this.setState({
        flattenTree: this.initFlattenTree(filterTree, {})
      })
    }
  }

  public componentWillReceiveProps (nextProps) {
    const { filterTree } = nextProps
    const { flattenTree } = this.state
    if (Object.keys(filterTree).length > 0 && !flattenTree) {
      this.setState({
        flattenTree: this.initFlattenTree(filterTree, {})
      })
    }
  }

  private initFlattenTree = (tree, flatten) => {
    flatten[tree.id] = tree
    if (tree.children) {
      tree.children.forEach((c) => {
        this.initFlattenTree(c, flatten)
      })
    }
    return flatten
  }

  private renderFilterList = (filter, items) => {
    const { getFieldDecorator } = this.props.form
    const itemClass = classnames({
      [styles.filterItem]: true,
      [styles.noPadding]: true,
      [styles.root]: filter.root
    })

    return (
      <div key={filter.id} className={itemClass}>
        <div className={styles.filterBlock}>
          <div className={styles.filterRel}>
            <FormItem className={styles.filterFormItem}>
              {getFieldDecorator(`${filter.id}Rel`, {
                initialValue: filter.rel
              })(
                <RadioGroup onChange={this.changeLinkRel(filter)} size="small">
                  <RadioButton value="and">And</RadioButton>
                  <RadioButton value="or">Or</RadioButton>
                </RadioGroup>
              )}
            </FormItem>
          </div>
          <div className={styles.filterList}>
            {items}
          </div>
        </div>
      </div>
    )
  }

  private renderFilterItem = (filter) => {
    const { form, name, type } = this.props
    const { getFieldDecorator } = form

    const itemClass = classnames({
      [styles.filterItem]: true,
      [styles.root]: filter.root
    })

    const forkButton = filter.root || (
      <Button shape="circle" icon="fork" type="primary" onClick={this.forkNode(filter.id)} />
    )

    const operatorSelectOptions = this.generateFilterOperatorOptions(type)

    const valueInput = this.generateFilterValueInput(filter)

    return (
      <div className={itemClass} key={filter.id}>
        <FormItem className={`${styles.filterFormItem} ${styles.filterFormKey}`}>
          <p>{name}</p>
        </FormItem>
        <FormItem className={`${styles.filterFormItem} ${styles.filterFormOperator}`}>
          {getFieldDecorator(`${filter.id}OperatorSelect`, {
            rules: [{
              required: true,
              message: 'Operator 不能为空'
            }],
            initialValue: filter.filterOperator
          })(
            <Select onSelect={this.changeFilterOperator(filter)}>
              {operatorSelectOptions}
            </Select>
          )}
        </FormItem>
        <FormItem className={`${styles.filterFormItem} ${styles.filterFormInput}`}>
          {getFieldDecorator(`${filter.id}Input`, {
            rules: [{
              required: true,
              message: 'Value 不能为空'
            }],
            initialValue: filter.filterValue
          })(
            valueInput
          )}
        </FormItem>
        <Button shape="circle" icon="plus" type="primary" onClick={this.addParallelNode(filter.id)} />
        {forkButton}
        <Button shape="circle" icon="minus" onClick={this.deleteNode(filter.id)} />
      </div>
    )
  }

  private renderFilters (filter) {
    if (filter.type === 'link') {
      const items = filter.children.map((c) => this.renderFilters(c))
      return this.renderFilterList(filter, items)
    } else if (filter.type === 'node') {
      return this.renderFilterItem(filter)
    } else {
      return (
        <div className={styles.empty} onClick={this.props.onAddRoot}>
          <h3>
            <Icon type="plus" /> 点击添加
          </h3>
        </div>
      )
    }
  }

  private generateFilterOperatorOptions = (type) => {
    const operators = [
      ['=', 'like', '>', '<', '>=', '<=', '!='],
      ['=', '>', '<', '>=', '<=', '!=']
    ]

    const stringOptions = operators[0].slice().map((o) => (
      <Option key={o} value={o}>{o}</Option>
    ))

    const numbersAndDateOptions = operators[1].slice().map((o) => (
      <Option key={o} value={o}>{o}</Option>
    ))

    if (type === 'number' || type === 'date') {
      return numbersAndDateOptions
    } else {
      return stringOptions
    }
  }

  private generateFilterValueInput = (filter) => {
    const { type } = this.props

    const stringInput = (
      <Input onChange={this.changeStringFilterValue(filter)} />
    )

    const numberInput = (
      <InputNumber className={styles.inputNumber} onChange={this.changeNumberFilterValue(filter)} />
    )

    if (type === 'number') {
      return numberInput
    } else {
      return stringInput
    }
  }

  private addParallelNode = (nodeId) => () => {
    const { flattenTree } = this.state

    const currentNode = flattenTree[nodeId]
    const newNode = {
      id: uuid(8, 16),
      type: 'node',
      parent: void 0
    }

    if (currentNode.parent) {
      const parent = flattenTree[currentNode.parent]
      newNode.parent = parent.id
      parent.children.push(newNode)
      flattenTree[newNode.id] = newNode

      this.setState({
        flattenTree: {...flattenTree}
      })
    } else {
      const parent = {
        id: uuid(8, 16),
        root: true,
        type: 'link',
        rel: 'and',
        children: []
      }

      newNode.parent = parent.id
      parent.children.push(currentNode)
      parent.children.push(newNode)

      delete currentNode.root
      delete flattenTree[currentNode.id]
      currentNode.id = uuid(8, 16)
      currentNode.parent = parent.id

      flattenTree[currentNode.id] = currentNode
      flattenTree[parent.id] = parent
      flattenTree[newNode.id] = newNode

      this.setState({
        flattenTree: {...flattenTree}
      })
      this.props.onAddTreeNode(parent)
    }
  }

  private forkNode = (nodeId) => () => {
    const { flattenTree } = this.state
    const currentNode = flattenTree[nodeId]
    const cloneNode = {
      ...currentNode,
      id: uuid(8, 16),
      parent: currentNode.id
    }
    const newNode = {
      id: uuid(8, 16),
      type: 'node',
      parent: currentNode.id
    }

    currentNode.type = 'link'
    currentNode.rel = 'and'
    currentNode.children = [cloneNode, newNode]

    flattenTree[cloneNode.id] = cloneNode
    flattenTree[newNode.id] = newNode

    this.setState({
      flattenTree: {...flattenTree}
    })
  }

  private deleteNode = (nodeId) => () => {
    const { flattenTree } = this.state

    const currentNode = flattenTree[nodeId]
    delete flattenTree[nodeId]

    if (currentNode.parent) {
      const parent = flattenTree[currentNode.parent]
      parent.children = parent.children.filter((c) => c.id !== nodeId)

      if (parent.children.length === 1) {
        const onlyChild = parent.children[0]
        this.refreshTreeId(onlyChild)

        const originParentId = parent.id
        parent.id = onlyChild.id
        parent.type = onlyChild.type
        parent.rel = onlyChild.rel
        parent.filterKey = onlyChild.filterKey
        parent.filterOperator = onlyChild.filterOperator
        parent.filterValue = onlyChild.filterValue
        parent.children = onlyChild.children

        delete flattenTree[originParentId]
        flattenTree[onlyChild.id] = parent
      }

      this.setState({
        flattenTree: {...flattenTree}
      })
    } else {
      this.setState({
        flattenTree: null
      })
      this.props.onDeleteTreeNode()
    }
  }

  private refreshTreeId = (treeNode) => {
    const { flattenTree } = this.state
    const oldId = treeNode.id
    delete flattenTree[oldId]

    treeNode.id = uuid(8, 16)
    flattenTree[treeNode.id] = treeNode

    if (treeNode.children) {
      treeNode.children.forEach((c) => {
        c.parent = treeNode.id
        this.refreshTreeId(c)
      })
    }
  }

  private changeLinkRel = (filter) => (e) => {
    filter.rel = e.target.value
  }

  // private changeFilterKey = (filter) => (val) => {
  //   const keyAndType = val.split(':')
  //   filter.filterKey = keyAndType[0]
  //   filter.filterType = keyAndType[1]
  //   filter.filterValue = ''
  //   filter.inputUuid = uuid(8, 16)
  // }

  private changeFilterOperator = (filter) => (val) => {
    filter.filterOperator = val
  }

  private changeStringFilterValue = (filter) => (event) => {
    filter.filterValue = event.target.value
  }

  private changeNumberFilterValue = (filter) => (val) => {
    filter.filterValue = val
  }

  private changeDateFilterValue = (filter) => (date) => {
    filter.filterValue = date
  }

  public resetTree = () => {
    this.setState({
      flattenTree: null
    })
  }

  public render () {
    const { filterTree } = this.props

    return (
      <div className={styles.conditionalFilterPanel}>
        <Form className={styles.conditionalFilterForm}>
          {this.renderFilters(filterTree)}
        </Form>
      </div>
    )
  }
}

export default Form.create<IConditionalFilterPanelProps & FormComponentProps>()(ConditionalFilterPanel)
