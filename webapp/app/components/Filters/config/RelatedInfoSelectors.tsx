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
import { Row, Col, Checkbox, Select, Radio, Empty } from 'antd'
import { InteractionType, IGlobalControlRelatedField } from '..'
import { RadioChangeEvent } from 'antd/lib/radio'
import { IRelatedItemSource, IRelatedViewSource } from './FilterConfig'
import { IViewModelProps } from 'app/containers/View/types'

const Option = Select.Option
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const styles = require('../filter.less')

interface IRelatedInfoSelectorsProps {
  itemSelectorSource: IRelatedItemSource[]
  viewSelectorSource: IRelatedViewSource[]
  interactionType: InteractionType
  onItemCheck: (id: number) => () => void
  onModelOrVariableSelect: (id: number) => (value: string | string[]) => void
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
      onItemCheck,
      onModelOrVariableSelect,
      onToggleCheckAll,
      onInteractionTypeChange
    } = this.props
    const checkAll = itemSelectorSource.every((i) => i.checked)

    const interactionTypeContent = interactionType === 'column' ? '字段' : '变量'

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

      if (Array.isArray(v.fields)) {
        value = v.fields.map((f) => f.name)
        isMultiple = true
      } else {
        value = v.fields && v.fields.name
        isMultiple = false
      }

      viewVariableSelects = viewVariableSelects.concat(
        <Row key={v.id}>
          <Col span={24}>
            <h4>{v.name}</h4>
          </Col>
          <Col span={24}>
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
                interactionType === 'column' ? (
                  v.model.map((m: IViewModelProps) => (
                    <Option key={m.name} value={m.name}>{m.name}</Option>
                  ))
                ) : (
                  v.variables.map((v) => (
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
                )
              }
            </Select>
          </Col>
        </Row>
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
        <div className={styles.itemList}>
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
          <ul>{widgetCheckboxes}</ul>
        </div>
        <div className={styles.viewSet}>
          <div className={styles.title}>
            <h2>类别</h2>
            <RadioGroup
              size="small"
              value={interactionType}
              onChange={onInteractionTypeChange}
            >
              <RadioButton value="column">字段</RadioButton>
              <RadioButton value="variable">变量</RadioButton>
            </RadioGroup>
          </div>
        </div>
        <div className={styles.viewSet}>
          <div className={styles.title}>
            <h2>关联{interactionTypeContent}</h2>
          </div>
          <div className={styles.related}>
            {viewVariableSelects}
          </div>
        </div>
      </div>
    )
  }
}

export default RelatedInfoSelectors
