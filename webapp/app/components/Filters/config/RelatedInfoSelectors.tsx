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
import { Form, Row, Col, Checkbox, Select, Radio, Empty } from 'antd'
import { InteractionType, IControlRelatedField } from '../types'
import { RadioChangeEvent } from 'antd/lib/radio'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { IRelatedItemSource, IRelatedViewSource } from './FilterConfig'
import { IViewModelProps } from 'app/containers/View/types'
import FilterTypes from '../filterTypes'

const FormItem = Form.Item
const Option = Select.Option
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const styles = require('../filter.less')

interface IRelatedInfoSelectorsProps {
  itemSelectorSource: IRelatedItemSource[]
  viewSelectorSource: IRelatedViewSource[]
  interactionType: InteractionType
  controlType: FilterTypes
  onItemCheck: (id: number) => () => void
  onModelOrVariableSelect: (id: number) => (value: string | string[]) => void
  onOptionsFromColumnCheck: (id: number) => (e: CheckboxChangeEvent) => void
  onOptionsFromColumnSelect: (id: number) => (value: string) => void
  onToggleCheckAll: () => void
  onInteractionTypeChange: (e: RadioChangeEvent) => void
}

interface IRelatedInfoSelectorsStates {
  modelItems: IViewModelProps[]
}

export class RelatedInfoSelectors extends PureComponent<IRelatedInfoSelectorsProps, IRelatedInfoSelectorsStates> {

  constructor (props) {
    super(props)
    this.state = {
      modelItems: []
    }
  }

  public render () {
    const {
      itemSelectorSource,
      viewSelectorSource,
      interactionType,
      controlType,
      onItemCheck,
      onModelOrVariableSelect,
      onOptionsFromColumnCheck,
      onOptionsFromColumnSelect,
      onToggleCheckAll,
      onInteractionTypeChange
    } = this.props
    const checkAll = itemSelectorSource.every((i) => i.checked)

    const interactionTypeContent = interactionType === 'column' ? '字段' : '变量'
    const variableSelect = interactionType === 'variable' && controlType === FilterTypes.Select

    const widgetCheckboxes = itemSelectorSource.map((item) => (
      <li key={item.id}>
        <Checkbox
          className={styles.checkbox}
          checked={item.checked}
          onChange={onItemCheck(item.id)}
        >
          {item.name}
        </Checkbox>
      </li>
    ))

    let viewVariableSelects = []

    viewSelectorSource.forEach((v) => {
      let value
      let isMultiple
      let optionsFromColumn
      let column

      if (Array.isArray(v.fields)) {
        isMultiple = true
        value = v.fields.map((f) => f.name)
      } else {
        isMultiple = false
        if (v.fields) {
          value = v.fields.name
          optionsFromColumn = v.fields.optionsFromColumn
          column = v.fields.column
        }
      }

      const optionsFromColumnFormItemProps = optionsFromColumn && {
        labelCol: { span: 10 },
        wrapperCol: { span: 14 }
      }

      viewVariableSelects = viewVariableSelects.concat(
        <div key={v.id}>
          <h4 className={classnames({[styles.variableSelect]: variableSelect})}>
            {v.name}
            {
              variableSelect && (
                <Checkbox
                  className={styles.checkbox}
                  checked={optionsFromColumn}
                  onChange={onOptionsFromColumnCheck(v.id)}
                >
                  从字段取值
                </Checkbox>
              )
            }
          </h4>
          <Row gutter={4}>
            <Col span={24}>
              <FormItem
                className={styles.formItem}
                {...optionsFromColumn && { label: '变量' }}
                {...optionsFromColumnFormItemProps}
              >
                <Select
                  size="small"
                  placeholder="请选择"
                  className={styles.selector}
                  value={value}
                  onChange={onModelOrVariableSelect(v.id)}
                  dropdownMatchSelectWidth={false}
                  {...isMultiple && {mode: 'multiple'}}
                >
                  {
                    interactionType === 'column'
                      ? v.model.map((m: IViewModelProps) => (
                        <Option key={m.name} value={m.name}>{m.name}</Option>
                      ))
                      : v.variables.map((v) => (
                        <Option
                          key={v.name}
                          value={v.name}
                          disabled={
                            isMultiple
                            && value.length === 2
                            && !value.includes(v.name)
                          }
                        >
                          {v.name}
                        </Option>
                      ))
                  }
                </Select>
              </FormItem>
            </Col>
          </Row>
          {
            optionsFromColumn && (
              <Row gutter={4}>
                <Col span={24}>
                  <FormItem
                    className={styles.formItem}
                    {...optionsFromColumn && { label: '取值字段' }}
                    {...optionsFromColumnFormItemProps}
                  >
                    <Select
                      size="small"
                      placeholder="请选择"
                      className={styles.selector}
                      value={column}
                      onChange={onOptionsFromColumnSelect(v.id)}
                      dropdownMatchSelectWidth={false}
                    >
                      {
                        v.model.map((m: IViewModelProps) => (
                          <Option key={m.name} value={m.name}>{m.name}</Option>
                        ))
                      }
                    </Select>
                  </FormItem>
                </Col>
              </Row>
            )
          }
        </div>
      )
    })

    if (!viewVariableSelects.length) {
      viewVariableSelects = viewVariableSelects.concat(
        <Empty
          key="empty"
          className={styles.empty}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )
    }

    return (
      <div className={styles.itemSelector}>
        <div className={styles.title}>
          <h2>关联图表</h2>
          <Checkbox
            className={styles.checkAll}
            checked={checkAll}
            onChange={onToggleCheckAll}
          >
            全选
          </Checkbox>
        </div>
        <div className={styles.itemList}>
          <ul>{widgetCheckboxes}</ul>
        </div>
        <div className={`${styles.title} ${styles.subTitle}`}>
          <h2>类别</h2>
          <RadioGroup
            className={styles.interactionType}
            size="small"
            value={interactionType}
            onChange={onInteractionTypeChange}
          >
            <RadioButton value="column">字段</RadioButton>
            <RadioButton value="variable">变量</RadioButton>
          </RadioGroup>
        </div>
        <div className={`${styles.title} ${styles.subTitle}`}>
          <h2>关联{interactionTypeContent}</h2>
        </div>
        <div className={styles.viewSet}>
          <div className={styles.related}>
            {viewVariableSelects}
          </div>
        </div>
      </div>
    )
  }
}

export default RelatedInfoSelectors
