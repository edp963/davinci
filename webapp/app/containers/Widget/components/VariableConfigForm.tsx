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

import VariableConfigTable from './VariableConfigTable'
import { Form, Input, Select, Radio, Button, Row, Col, Checkbox } from 'antd'
const FormItem = Form.Item
const Option = Select.Option
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

import { uuid } from 'utils/util'

const utilStyles = require('assets/less/util.less')
const styles = require('../Widget.less')

interface IVariableConfigFormProps  {
  form: any,
  queryInfo: any[],
  control: object,
  onSave: (obj: any) => void,
  onClose: () => void
}

interface IVariableConfigFormStates {
  variableNumber: number,
  chosenType: string,
  tableVisible: boolean,
  hasRelatedComponent: boolean,
  tableSource: any[]
  isMultiple: boolean
}

export class VariableConfigForm extends React.Component<IVariableConfigFormProps, IVariableConfigFormStates> {

  private WITH_TABLE = ['select', 'multiSelect']
  private DOUBLE_VARIABLES = ['dateRange', 'datetimeRange']

  private variableConfigTable: any

  constructor (props) {
    super(props)
    this.state = {
      variableNumber: 1,
      chosenType: '',
      tableVisible: false,
      hasRelatedComponent: false,
      tableSource: [],
      isMultiple: false
    }
  }

  public componentWillMount () {
    this.formInit(this.props)
  }

  public componentDidMount () {
    this.setFormValue(this.props)
  }

  public componentWillReceiveProps (nextProps) {
    if (nextProps.control !== this.props.control) {
      this.formInit(nextProps)
      if (nextProps.control.id === void 0) {
        this.setState({
          chosenType: '',
          isMultiple: false,
          hasRelatedComponent: false
        })
      }
    }
  }

  public componentDidUpdate (prevProps) {
    if (prevProps.control !== this.props.control) {
      this.setFormValue(this.props)
    }
  }

  private setFormValue = (props) => {
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

      // WITH_TABLE = ['select', 'multiSelect']
      // DOUBLE_VARIABLES = ['dateRange', 'datetimeRange']

      this.setState({
        variableNumber: this.DOUBLE_VARIABLES.indexOf(control.type) >= 0 ? 2 : 1,
        chosenType: control.type,
        tableVisible: this.WITH_TABLE.indexOf(control.type) >= 0,  // 只有下拉菜单时，才显示表格
        hasRelatedComponent: control.hasRelatedComponent,
        tableSource: control.sub,
        isMultiple: control.multiple === void 0 ? false : control.multiple
      }, () => {
        this.props.form.setFieldsValue({
          id: control.id,
          type: control.type,
          name: control.name,
          ...variables
        })
      })
    }
  }

  private formInit = (props) => {
    this.setState({
      variableNumber: props.control.variables
        ? props.control.variables.length
        : 1
    })
  }

  private addVariableConfig = () => {
    const { tableSource } = this.state
    this.setState({
      tableSource: tableSource.concat({
        id: uuid(8, 16),
        text: '',
        value: '',
        variables: [],
        variableType: undefined,  // todo init
        status: 0
      })
    })
  }

  private changeConfigValueStatus = (id) => () => {
    const { tableSource } = this.state
    tableSource.find((t) => t.id === id).status = 0
    this.setState({
      tableSource
    })
  }

  private updateConfigValue = (id) => () => {
    this.variableConfigTable.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { tableSource } = this.state
        const config = tableSource.find((t) => t.id === id)

        config.text = values[`${id}Text`]
        config.value = values[`${id}Value`]
        config.variables = values[`${id}Variables`]
        config.variableType = values[`${id}VariableType`]
        config.status = 1

        this.setState({
          tableSource
        })
      }
    })
  }

  private deleteConfigValue = (id) => () => {
    const { tableSource } = this.state

    this.setState({
      tableSource: tableSource.filter((t) => t.id !== id)
    })
  }

  private typeChange = (val) => {
    this.setState({
      chosenType: val,
      variableNumber: this.DOUBLE_VARIABLES.indexOf(val) >= 0 ? 2 : 1,
      tableVisible: this.WITH_TABLE.indexOf(val) >= 0
    })
  }

  private hasRelatedComponentChange = (status) => {
    this.setState({
      hasRelatedComponent: status
    })
  }

  private saveConfig = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { variableNumber, tableSource } = this.state
        const id = values.id || uuid(8, 16)
        const {name, type, multiple, width} = values
        const variables = variableNumber === 1    // todo  variables
          ? [values.variable]
          : [values.variableFirst, values.variableSecond]
        const sub = this.WITH_TABLE.indexOf(type) >= 0  // WITH_TABLE = ['select', 'multiSelect']
          ? this.state.hasRelatedComponent === true
            ? tableSource
            : tableSource.map((s) => {
              delete s.variableType
              return s
            })
          : []

        this.props.onSave({
          id,
          name,
          type,
          width,
          multiple,
          hasRelatedComponent: this.state.hasRelatedComponent,
          variables,
          sub
        })
        this.props.onClose()
      }
    })
  }

  private resetForm = () => {
    this.props.form.resetFields()
    this.setState({
      variableNumber: 1,
      tableVisible: false,
      tableSource: []
    })
  }

  private multipleSelectChange = () => {
    this.setState({
      isMultiple: !this.state.isMultiple
    })
  }

  public render () {
    const {
      form,
      queryInfo,
      onClose
    } = this.props

    const {
      variableNumber,
      chosenType,
      tableVisible,
      hasRelatedComponent,
      tableSource
    } = this.state

    const { getFieldDecorator } = form

    const controlTypeOptions = [
      { text: '文本输入框', value: 'input' },
      { text: '数字输入框', value: 'inputNumber' },
      { text: '下拉菜单', value: 'select' },
      { text: '日期选择', value: 'date' },
      // { text: '单选下拉菜单', value: 'select' },
      // { text: '多选下拉菜单', value: 'multiSelect' },
      // { text: '日期选择', value: 'date' },
      // { text: '日期多选', value: 'multiDate' },
      { text: '日期范围选择', value: 'dateRange' },
      { text: '日期时间选择', value: 'datetime' },
      { text: '日期时间范围选择', value: 'datetimeRange' }
    ].map((o) => (
      <Option key={o.value} value={o.value}>{o.text}</Option>
    ))

    let variableOptions = null

    if (queryInfo) {
      variableOptions = queryInfo.map((q) => (
        <Option key={q} value={q}>{q}</Option>
      ))
    }

    let variableSelectComponents = []
    if (variableNumber === 1) {
      if (chosenType && chosenType.length) {
        if (!(chosenType === 'select' && this.state.isMultiple === false)) {
          variableSelectComponents = [(
            <Col span={6} key="variable">
              <FormItem label="关联变量">
                {getFieldDecorator('variable', {
                   rules: [{
                    required: true,
                    message: '关联变量不能为空'
                  }]
                })(
                  <Select placeholder="关联变量" allowClear size="small">
                    {variableOptions}
                  </Select>
                )}
              </FormItem>
            </Col>
          )]
        }
      }

      if (chosenType === 'select' || chosenType === 'date') {
        variableSelectComponents.push((
          <Col key="multiple" span={3}>
            <FormItem label="是否支持多选">
              {getFieldDecorator('multiple', {
                initialValue: this.state.isMultiple,
                valuePropName: 'checked'
              })(
                <Checkbox onChange={this.multipleSelectChange}>多选</Checkbox>
              )}
            </FormItem>
          </Col>
        ))
      }

      // if (chosenType === 'select') {
      //   variableSelectComponents.push((
      //     <Col span={6} key="hasRelatedComponent">
      //       <FormItem label="关联控件">
      //         {getFieldDecorator('hasRelatedComponent', {
      //           initialValue: hasRelatedComponent
      //         })(
      //           <RadioGroup size="small" onChange={this.hasRelatedComponentChange}>
      //             <RadioButton value="yes">选项关联控件</RadioButton>
      //             <RadioButton value="no">不关联控件</RadioButton>
      //           </RadioGroup>
      //         )}
      //       </FormItem>
      //     </Col>
      //   ))
      // }

    } else {
      variableSelectComponents = [(
        <Col span={3} key="first">
          <FormItem label="关联变量名称">
            {getFieldDecorator('variableFirst', {})(
              <Select placeholder="关联变量1" allowClear size="small">
                {variableOptions}
              </Select>
            )}
          </FormItem>
        </Col>
      ), (
        <Col span={3} key="second">
          <FormItem label="关联变量名称">
            {getFieldDecorator('variableSecond', {})(
              <Select placeholder="关联变量2" allowClear size="small">
                {variableOptions}
              </Select>
            )}
          </FormItem>
        </Col>
      )]
    }
    return (
      <div className={styles.variableConfigForm}>
        <Form className={styles.wrapperForm}>
          <Row gutter={8}>
            <Col span={6}>
              <FormItem className={utilStyles.hide}>
                {getFieldDecorator('id', {})(
                  <Input />
                )}
              </FormItem>
              <FormItem label="名称">
                {getFieldDecorator('name', {
                  rules: [{
                    required: true,
                    message: '不能为空'
                  }]
                })(
                  <Input size="small" placeholder="控制器名称" />
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="控件类型">
                {getFieldDecorator('type', {
                  rules: [{
                    required: true,
                    message: '控件类型不能为空'
                  }]
                })(
                  <Select size="small" placeholder="控件类型" onSelect={this.typeChange}>
                    {controlTypeOptions}
                  </Select>
                )}
              </FormItem>
            </Col>
            {variableSelectComponents}
            {/* <Col span={3}>
              <FormItem label="控件宽度">
                {getFieldDecorator('width', {
                  initialValue: 0
                })(
                  <Select size="small">
                    <Option value={0}>自动适应</Option>
                    <Option value={24}>100%</Option>
                    <Option value={12}>50%</Option>
                    <Option value={8}>33.33% (1/3)</Option>
                    <Option value={6}>25%</Option>
                    <Option value={4}>16.67% (1/6)</Option>
                    <Option value={3}>12.5% (1/8)</Option>
                    <Option value={2}>8.33% (1/12)</Option>
                  </Select>
                )}
              </FormItem>
            </Col> */}
          </Row>
          </Form>

        {
          tableVisible
            ? <VariableConfigTable
              dataSource={tableSource}
              variableSource={queryInfo}
              chosenType={this.state.chosenType}
              isMultiple={this.state.isMultiple}
              onAddConfigValue={this.addVariableConfig}
              hasRelatedComponent={hasRelatedComponent}
              onChangeRelatedComponent={this.hasRelatedComponentChange}
              onChangeConfigValueStatus={this.changeConfigValueStatus}
              onUpdateConfigValue={this.updateConfigValue}
              onDeleteConfigValue={this.deleteConfigValue}
              ref={(f) => { this.variableConfigTable = f }}
            />
            : ''
        }
        <div className={styles.footer}>
          <div className={styles.foot}>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" onClick={this.saveConfig}>保存</Button>
          </div>
        </div>
      </div>
    )
  }
}

export default Form.create()(VariableConfigForm)
