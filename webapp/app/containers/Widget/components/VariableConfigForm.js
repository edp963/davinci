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

import React, { Component, PropTypes } from 'react'

import VariableConfigTable from './VariableConfigTable'
import Form from 'antd/lib/form'
import Input from 'antd/lib/input'
import Select from 'antd/lib/select'
import Radio from 'antd/lib/radio'
import Button from 'antd/lib/button'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
const FormItem = Form.Item
const Option = Select.Option
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

import { uuid } from '../../../utils/util'

import utilStyles from '../../../assets/less/util.less'
import styles from '../Widget.less'

export class VariableConfigForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      variableNumber: 1,
      chosenType: '',
      tableVisible: false,
      cascadeColumnVisible: false,
      hasRelatedComponent: 'yes',
      tableSource: []
    }

    this.WITH_TABLE = ['select', 'multiSelect']
    this.DOUBLE_VARIABLES = ['dateRange', 'datetimeRange']
    this.CASCADE = ['cascadeSelect']
  }

  componentWillMount () {
    this.formInit(this.props)
  }

  componentDidMount () {
    this.setFormValue(this.props)
  }

  componentWillUpdate (nextProps) {
    if (nextProps.control !== this.props.control) {
      this.formInit(nextProps)
    }
  }

  componentDidUpdate (prevProps) {
    if (prevProps.control !== this.props.control) {
      this.setFormValue(this.props)
    }
  }

  setFormValue = (props) => {
    const control = props.control

    if (Object.keys(control).length) {
      const variables = this.DOUBLE_VARIABLES.indexOf(control.type) >= 0
        ? {
          variableFirst: control.variables[0],
          variableSecond: control.variables[1]
        }
        : {
          variable: control.variables[0]
        }

      this.props.form.setFieldsValue(Object.assign({
        id: control.id,
        type: control.type,
        cascadeColumn: control.cascadeColumn,
        parentColumn: control.parentColumn
      }, variables))

      this.setState({
        variableNumber: this.DOUBLE_VARIABLES.indexOf(control.type) >= 0 ? 2 : 1,
        chosenType: control.type,
        tableVisible: this.WITH_TABLE.indexOf(control.type) >= 0,
        hasRelatedComponent: control.hasRelatedComponent,
        tableSource: control.sub
      })
    }
  }

  formInit = (props) => {
    this.state.variableNumber = props.control.variables
      ? props.control.variables.length
      : 1
    this.state.cascadeColumnVisible = !!props.control.cascadeColumn
  }

  addVariableConfig = () => {
    const { tableSource } = this.state
    this.setState({
      tableSource: tableSource.concat({
        id: uuid(8, 16),
        text: '',
        value: '',
        variables: [],
        variableType: undefined,
        status: 0
      })
    })
  }

  changeConfigValueStatus = (id) => () => {
    const { tableSource } = this.state
    tableSource.find(t => t.id === id).status = 0
    this.setState({
      tableSource: tableSource
    })
  }

  updateConfigValue = (id) => () => {
    this.variableConfigTable.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { tableSource } = this.state
        let config = tableSource.find(t => t.id === id)

        config.text = values[`${id}Text`]
        config.value = values[`${id}Value`]
        config.variables = values[`${id}Variables`]
        config.variableType = values[`${id}VariableType`]
        config.status = 1

        this.setState({
          tableSource: tableSource
        })
      }
    })
  }

  deleteConfigValue = (id) => () => {
    const { tableSource } = this.state

    this.setState({
      tableSource: tableSource.filter(t => t.id !== id)
    })
  }

  typeChange = (val) => {
    this.setState({
      chosenType: val,
      variableNumber: this.DOUBLE_VARIABLES.indexOf(val) >= 0 ? 2 : 1,
      tableVisible: this.WITH_TABLE.indexOf(val) >= 0,
      cascadeColumnVisible: this.CASCADE.indexOf(val) >= 0
    })
  }

  hasRelatedComponentChange = (e) => {
    this.setState({
      hasRelatedComponent: e.target.value
    })
  }

  saveConfig = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { variableNumber, tableSource } = this.state

        const id = values.id || uuid(8, 16)
        const type = values.type
        const variables = variableNumber === 1
          ? [values.variable]
          : [values.variableFirst, values.variableSecond]
        const sub = this.WITH_TABLE.indexOf(type) >= 0
          ? this.state.hasRelatedComponent === 'yes'
            ? tableSource
            : tableSource.map(s => {
              delete s.variableType
              return s
            })
          : []
        const cascadeColumn = values.cascadeColumn
        const parentColumn = values.parentColumn

        this.props.onSave({
          id,
          type,
          hasRelatedComponent: values.hasRelatedComponent,
          variables,
          sub,
          cascadeColumn,
          parentColumn
        })
        this.props.onClose()
      }
    })
  }

  resetForm = () => {
    this.props.form.resetFields()
    this.setState({
      variableNumber: 1,
      tableVisible: false,
      tableSource: []
    })
  }

  render () {
    const {
      form,
      queryInfo,
      columns,
      onClose
    } = this.props

    const {
      variableNumber,
      chosenType,
      tableVisible,
      cascadeColumnVisible,
      hasRelatedComponent,
      tableSource
    } = this.state

    const { getFieldDecorator } = form

    const controlTypeOptions = [
      { text: '文本输入框', value: 'input' },
      { text: '数字输入框', value: 'inputNumber' },
      { text: '单选下拉菜单', value: 'select' },
      { text: '多选下拉菜单', value: 'multiSelect' },
      { text: '级联下拉菜单', value: 'cascadeSelect' },
      { text: '日期选择', value: 'date' },
      { text: '日期多选', value: 'multiDate' },
      { text: '日期范围选择', value: 'dateRange' },
      { text: '日期时间选择', value: 'datetime' },
      { text: '日期时间范围选择', value: 'datetimeRange' }
    ].map(o => (
      <Option key={o.value} value={o.value}>{o.text}</Option>
    ))

    let variableOptions = null

    if (queryInfo) {
      variableOptions = queryInfo.map(q => (
        <Option key={q} value={q}>{q}</Option>
      ))
    }

    let variableSelectComponents

    if (variableNumber === 1) {
      variableSelectComponents = [(
        <Col span={8} key="variable">
          <FormItem>
            {getFieldDecorator('variable', {})(
              <Select placeholder="关联变量" allowClear>
                {variableOptions}
              </Select>
            )}
          </FormItem>
        </Col>
      )]

      if (chosenType === 'select') {
        variableSelectComponents.push((
          <Col span={8} key="hasRelatedComponent">
            <FormItem>
              {getFieldDecorator('hasRelatedComponent', {
                initialValue: hasRelatedComponent
              })(
                <RadioGroup onChange={this.hasRelatedComponentChange}>
                  <RadioButton value="yes">选项关联控件</RadioButton>
                  <RadioButton value="no">不关联控件</RadioButton>
                </RadioGroup>
              )}
            </FormItem>
          </Col>
        ))
      }
    } else {
      variableSelectComponents = [(
        <Col span={8} key="first">
          <FormItem>
            {getFieldDecorator('variableFirst', {})(
              <Select placeholder="关联变量1" allowClear>
                {variableOptions}
              </Select>
            )}
          </FormItem>
        </Col>
      ), (
        <Col span={8} key="second">
          <FormItem>
            {getFieldDecorator('variableSecond', {})(
              <Select placeholder="关联变量2" allowClear>
                {variableOptions}
              </Select>
            )}
          </FormItem>
        </Col>
      )]
    }

    let cascadeColumnSelect
    let parentColumnSelect

    if (cascadeColumnVisible) {
      cascadeColumnSelect = (
        <Col key="cascadeColumn" span={8}>
          <FormItem>
            {getFieldDecorator('cascadeColumn', {})(
              <Select placeholder="级联字段" allowClear>
                {columns.map(c => (
                  <Option key={c} value={c}>{c}</Option>
                ))}
              </Select>
            )}
          </FormItem>
        </Col>
      )
      parentColumnSelect = (
        <Col key="parentColumn" span={8}>
          <FormItem>
            {getFieldDecorator('parentColumn', {})(
              <Select placeholder="级联父字段" allowClear>
                {columns.map(c => (
                  <Option key={c} value={c}>{c}</Option>
                ))}
              </Select>
            )}
          </FormItem>
        </Col>
      )
    }

    return (
      <div className={styles.variableConfigForm}>
        <Form>
          <Row gutter={8}>
            <Col span={8}>
              <FormItem className={utilStyles.hide}>
                {getFieldDecorator('id', {})(
                  <Input />
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('type', {
                  rules: [{
                    required: true,
                    message: '控件类型不能为空'
                  }]
                })(
                  <Select placeholder="控件类型" onSelect={this.typeChange}>
                    {controlTypeOptions}
                  </Select>
                )}
              </FormItem>
            </Col>
            {variableSelectComponents}
            {cascadeColumnSelect}
            {parentColumnSelect}
          </Row>
        </Form>
        {
          tableVisible
            ? <VariableConfigTable
              dataSource={tableSource}
              variableSource={queryInfo || []}
              onAddConfigValue={this.addVariableConfig}
              hasRelatedComponent={hasRelatedComponent}
              onChangeConfigValueStatus={this.changeConfigValueStatus}
              onUpdateConfigValue={this.updateConfigValue}
              onDeleteConfigValue={this.deleteConfigValue}
              ref={f => { this.variableConfigTable = f }}
            />
            : ''
        }
        <div className={styles.footer}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={this.saveConfig}>保存</Button>
        </div>
      </div>
    )
  }
}

VariableConfigForm.propTypes = {
  form: PropTypes.any,
  queryInfo: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  control: PropTypes.object,
  columns: PropTypes.array,
  onSave: PropTypes.func,
  onClose: PropTypes.func
}

export default Form.create()(VariableConfigForm)
