/*-
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
import Button from 'antd/lib/button'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
const FormItem = Form.Item
const Option = Select.Option

import { uuid } from '../../utils/util'

import utilStyles from '../../assets/less/util.less'
import styles from './Widget.less'

export class VariableConfigForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      variableNumber: 1,
      tableVisible: false,
      tableSource: []
    }

    this.WITH_TBALE = ['select', 'multiSelect']
    this.DOUBLE_VARIABLES = ['dateRange', 'datetimeRange']
  }

  componentWillMount () {
    this.getVariableNumber(this.props)
  }

  componentDidMount () {
    this.setFormValue(this.props)
  }

  componentWillUpdate (nextProps) {
    if (nextProps.control !== this.props.control) {
      this.getVariableNumber(nextProps)
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
        type: control.type
      }, variables))

      this.setState({
        variableNumber: this.DOUBLE_VARIABLES.indexOf(control.type) >= 0 ? 2 : 1,
        tableVisible: this.WITH_TBALE.indexOf(control.type) >= 0,
        tableSource: control.sub
      })
    }
  }

  getVariableNumber = (props) => {
    this.state.variableNumber = props.control.variables
      ? props.control.variables.length
      : 1
  }

  addVariableConfig = () => {
    const { tableSource } = this.state
    this.setState({
      tableSource: tableSource.concat({
        id: uuid(8, 16),
        text: '',
        value: '',
        variables: [],
        variableType: '',
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
      variableNumber: this.DOUBLE_VARIABLES.indexOf(val) >= 0 ? 2 : 1,
      tableVisible: this.WITH_TBALE.indexOf(val) >= 0
    })
  }

  saveConfig = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const id = values.id || uuid(8, 16)
        const type = values.type
        const variables = this.state.variableNumber === 1
          ? [values.variable]
          : [values.variableFirst, values.variableSecond]
        const sub = this.WITH_TBALE.indexOf(type) >= 0
          ? this.state.tableSource
          : []

        this.props.onSave({
          id,
          type,
          variables,
          sub
        })
        this.resetForm()
      }
    })
  }

  resetForm = () => {
    this.props.form.resetFields()
    this.setState({
      variableNumber: 1,
      tableVisible: false,
      tableSource: []
    }, () => {
      this.props.onClose()
    })
  }

  render () {
    const {
      form,
      queryInfo
    } = this.props

    const {
      variableNumber,
      tableVisible,
      tableSource
    } = this.state

    const { getFieldDecorator } = form

    const controlTypeOptions = [
      { text: '文本输入框', value: 'input' },
      { text: '数字输入框', value: 'inputNumber' },
      { text: '单选下拉菜单', value: 'select' },
      { text: '多选下拉菜单', value: 'multiSelect' },
      { text: '日期选择', value: 'date' },
      { text: '日期时间选择', value: 'datetime' },
      { text: '日期范围选择', value: 'dateRange' },
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

    const variableSelectComponents = variableNumber === 1
      ? (
        <Col span={8}>
          <FormItem>
            {getFieldDecorator('variable', {})(
              <Select placeholder="关联变量">
                {variableOptions}
              </Select>
            )}
          </FormItem>
        </Col>
      )
      : Array.from(Array(variableNumber), (item, index) => (
        <Col span={8} key={!index ? 'first' : 'second'}>
          <FormItem>
            {getFieldDecorator(`variable${!index ? 'First' : 'Second'}`, {})(
              <Select placeholder={`关联变量${index + 1}`}>
                {variableOptions}
              </Select>
            )}
          </FormItem>
        </Col>
      ))

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
          </Row>
        </Form>
        {
          tableVisible
            ? <VariableConfigTable
              dataSource={tableSource}
              variableSource={queryInfo || []}
              onAddConfigValue={this.addVariableConfig}
              onChangeConfigValueStatus={this.changeConfigValueStatus}
              onUpdateConfigValue={this.updateConfigValue}
              onDeleteConfigValue={this.deleteConfigValue}
              ref={f => { this.variableConfigTable = f }}
            />
            : ''
        }
        <div className={styles.footer}>
          <Button onClick={this.resetForm}>取消</Button>
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
  onSave: PropTypes.func,
  onClose: PropTypes.func
}

export default Form.create({withRef: true})(VariableConfigForm)
