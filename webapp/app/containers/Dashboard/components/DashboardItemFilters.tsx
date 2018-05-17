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
import * as classnames from 'classnames'

import { WrappedFormUtils } from 'antd/lib/form/Form'
const Form = require('antd/lib/form')
const Input = require('antd/lib/input')
const InputNumber = require('antd/lib/input-number')
const DatePicker = require('antd/lib/date-picker')
const Select = require('antd/lib/select')
const Radio = require('antd/lib/radio')
const Button = require('antd/lib/button')
const Icon = require('antd/lib/icon')
const Option = Select.Option
const FormItem = Form.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button

import { uuid } from '../../../utils/util'
import { SQL_NUMBER_TYPES, SQL_DATE_TYPES } from '../../../globalConstants'

const styles = require('../Dashboard.less')

interface IDashboardItemFiltersProps {
  form: WrappedFormUtils
  keys: any[]
  types: any[]
  loginUser: { id: number }
  itemId: number
  onQuery: (sql: string) => void
}

interface IDashboardItemFiltersStates {
  filterTree: object
  flattenTree: object
}

export class DashboardItemFilters extends React.PureComponent<IDashboardItemFiltersProps, IDashboardItemFiltersStates> {
  constructor (props) {
    super(props)
    this.state = {
      filterTree: {},
      flattenTree: null
    }
  }

  public componentWillMount () {
    this.initTree(this.props)
  }

  public componentWillReceiveProps (nextProps) {
    if (nextProps.itemId && nextProps.itemId !== this.props.itemId) {
      this.initTree(nextProps)
    }
  }

  private initTree = (props) => {
    const { loginUser, itemId } = props
    if (loginUser) {
      const filterTreeStr = localStorage.getItem(`${loginUser.id}_${itemId}_filterTree`)
      if (filterTreeStr) {
        const filterTree = JSON.parse(filterTreeStr)
        this.setState({
          filterTree,
          flattenTree: this.initFlattenTree(filterTree, {})
        })
      }
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
                <RadioGroup onChange={this.changeLinkRel(filter)}>
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
    const {
      form,
      keys,
      types
    } = this.props

    const { getFieldDecorator } = form

    const itemClass = classnames({
      [styles.filterItem]: true,
      [styles.root]: filter.root
    })

    const forkButton = filter.root || (
      <Button shape="circle" icon="fork" type="primary" onClick={this.forkNode(filter.id)} />
    )

    const keySelectOptions = keys.map((k, index) => (
      <Option key={k} value={`${k}:${types[index]}`}>{k}</Option>
    ))

    const operatorSelectOptions = this.generateFilterOperatorOptions(filter.filterType)

    const valueInput = this.generateFilterValueInput(filter)

    return (
      <div className={itemClass} key={filter.id}>
        <FormItem className={`${styles.filterFormItem} ${styles.filterFormKey}`}>
          {getFieldDecorator(`${filter.id}KeySelect`, {
            rules: [{
              required: true,
              message: 'Column 不能为空'
            }],
            initialValue: filter.filterKey
          })(
            <Select placeholder="Column" onSelect={this.changeFilterKey(filter)}>
              {keySelectOptions}
            </Select>
          )}
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
        <FormItem className={styles.filterFormItem}>
          {getFieldDecorator(`${filter.id}Input${filter.inputUuid}`, {
            rules: [{
              required: true,
              message: 'Value 不能为空'
            }],
            initialValue: filter.filterValue || null
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
        <div className={styles.empty} onClick={this.addTreeRoot}>
          <h3>
            <Icon type="plus" /> 点击添加查询条件
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

    if (SQL_NUMBER_TYPES.indexOf(type) >= 0 || SQL_DATE_TYPES.indexOf(type) >= 0) {
      return numbersAndDateOptions
    } else {
      return stringOptions
    }
  }

  private generateFilterValueInput = (filter) => {
    const stringInput = (
      <Input onChange={this.changeStringFilterValue(filter)} />
    )

    const numberInput = (
      <InputNumber className={styles.inputNumber} onChange={this.changeNumberFilterValue(filter)} />
    )

    const dateInput = (
      <DatePicker format="YYYY-MM-DD" onChange={this.changeDateFilterValue(filter)} />
    )

    const datetimeInput = (
      <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" onOk={this.changeDateFilterValue(filter)} />
    )

    if (SQL_NUMBER_TYPES.indexOf(filter.filterType) >= 0) {
      return numberInput
    } else if (filter.filterType === 'DATE') {
      return dateInput
    } else if (filter.filterType === 'DATETIME') {
      return datetimeInput
    } else {
      return stringInput
    }
  }

  private addTreeRoot = () => {
    const rootId = uuid(8, 16)
    const root = {
      id: rootId,
      root: true,
      type: 'node'
    }
    this.setState({
      filterTree: root,
      flattenTree: {
        [rootId]: root
      }
    })
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
        filterTree: parent,
        flattenTree: {...flattenTree}
      })
    }
  }

  private forkNode = (nodeId) => () => {
    const { flattenTree } = this.state

    let currentNode = flattenTree[nodeId]
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

    currentNode = {
      ...currentNode,
      type: 'link',
      rel: 'and',
      children: [cloneNode, newNode]
    }

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
      let parent = flattenTree[currentNode.parent]
      parent.children = parent.children.filter((c) => c.id !== nodeId)

      if (parent.children.length === 1) {
        const onlyChild = parent.children[0]
        this.refreshTreeId(onlyChild)

        parent = {
          ...parent,
          id: onlyChild.id,
          type: onlyChild.type,
          rel: onlyChild.rel,
          filterKey: onlyChild.filterKey,
          filterType: onlyChild.filterType,
          filterOperator: onlyChild.filterOperator,
          filterValue: onlyChild.filterValue,
          children: onlyChild.children
        }

        delete flattenTree[parent.id]
        flattenTree[onlyChild.id] = parent
      }

      this.setState({
        flattenTree: {...flattenTree}
      })
    } else {
      this.setState({
        filterTree: {},
        flattenTree: {}
      })
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

  private changeFilterKey = (filter) => (val) => {
    const keyAndType = val.split(':')
    filter.filterKey = keyAndType[0]
    filter.filterType = keyAndType[1]
    filter.filterValue = ''
    filter.inputUuid = uuid(8, 16)
  }

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

  private doQuery = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { loginUser, itemId, onQuery } = this.props
        const { filterTree } = this.state

        if (loginUser) {
          localStorage.setItem(`${loginUser.id}_${itemId}_filterTree`, JSON.stringify(filterTree))
        }

        onQuery(this.getSqlExpresstions(filterTree))
        this.resetTree()
      }
    })
  }

  private resetTree = () => {
    this.setState({
      filterTree: {},
      flattenTree: null
    })
  }

  private getSqlExpresstions = (tree) => {
    if (Object.keys(tree).length) {
      if (tree.type === 'link') {
        const partials = tree.children.map((c) => {
          if (c.type === 'link') {
            return this.getSqlExpresstions(c)
          } else {
            return `${c.filterKey} ${c.filterOperator} ${this.getFilterValue(c.filterValue, c.filterType)}`
          }
        })
        const expressions = partials.join(` ${tree.rel} `)
        return `(${expressions})`
      } else {
        return `${tree.filterKey} ${tree.filterOperator} ${this.getFilterValue(tree.filterValue, tree.filterType)}`
      }
    } else {
      return ''
    }
  }

  private getFilterValue = (val, type) => {
    if (typeof val === 'object') {
      return type === 'DATE'
        ? `'${val.format('YYYY-MM-DD')}'`
        : `'${val.format('YYYY-MM-DD HH:mm:ss')}'`
    } else {
      if (type === 'VARCHAR') {
        return `'${val}'`
      } else {
        return val
      }
    }
  }

  public render () {
    const {
      filterTree
    } = this.state

    return (
      <div className={styles.filters}>
        <Form className={styles.filterForm}>
          {this.renderFilters(filterTree)}
        </Form>
        <div className={styles.buttons}>
          <Button size="large" type="primary" onClick={this.doQuery}>查询</Button>
        </div>
      </div>
    )
  }
}

export default Form.create()(DashboardItemFilters)
