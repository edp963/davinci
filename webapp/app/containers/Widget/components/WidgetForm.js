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

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {checkNameAction} from '../../App/actions'
import Table from 'antd/lib/table'
import Form from 'antd/lib/form'
import Input from 'antd/lib/input'
import InputNumber from 'antd/lib/input-number'
import Select from 'antd/lib/select'
import Checkbox from 'antd/lib/checkbox'
import Radio from 'antd/lib/radio'
import Button from 'antd/lib/button'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Popover from 'antd/lib/popover'
import Icon from 'antd/lib/icon'
import Modal from 'antd/lib/modal'
const FormItem = Form.Item
const Option = Select.Option
const CheckboxGroup = Checkbox.Group
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

import { iconMapping } from './chartUtil'
import MarkConfigForm from './MarkConfigForm'

import utilStyles from '../../../assets/less/util.less'
import styles from '../Widget.less'
import {uuid} from '../../../utils/util'

export class WidgetForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      markConfigModalVisible: false,
      tableSource: [],
      isCanSaveForm: true
    }
  }
  checkNameUnique = (rule, value = '', callback) => {
    const { onCheckName, type } = this.props
    const { getFieldsValue } = this.props.form
    const { id } = getFieldsValue()
    let idName = type === 'add' ? '' : id
    let typeName = 'widget'
    onCheckName(idName, value, typeName,
      res => {
        callback()
      }, err => {
        callback(err)
      })
  }
  toggleMarkConfigTable = () => {
    let {markConfigModalVisible} = this.state
    this.setState({
      markConfigModalVisible: !markConfigModalVisible
    })
  }
  resetMarkConfigForm = () => {
    this.markConfigForm.resetFields()
    this.setState({
      tableSource: []
    })
  }
  onAddConfigValue = () => {
    const { tableSource } = this.state
    this.setState({
      tableSource: tableSource.concat({
        id: uuid(8, 16),
        text: '',
        value: '',
        status: 0
      })
    }, () => this.isCanSave())
  }
  onDeleteConfigValue = (id) => () => {
    const { tableSource } = this.state
    this.setState({
      tableSource: tableSource.filter(t => t.id !== id)
    }, () => this.isCanSave())
  }
  onUpdateConfigValue = (id) => () => {
    this.markConfigForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { tableSource } = this.state
        let config = tableSource.find(t => t.id === id)
        config.text = values[`${id}Text`]
        config.value = values[`${id}Value`]
        config.status = 1
        this.setState({
          tableSource: tableSource
        }, () => this.isCanSave())
      }
    })
  }
  onChangeConfigValueStatus = (id) => () => {
    const { tableSource } = this.state
    tableSource.find(t => t.id === id).status = 0
    this.setState({
      tableSource: tableSource
    }, () => this.isCanSave())
  }
  saveConfig = () => {
    this.markConfigForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log(this.state.tableSource)
      }
    })
  }
  isCanSave = () => {
    const {tableSource} = this.state
    let computed = tableSource.length
      ? tableSource.filter(table => table.status === 0).length
        ? 0
        : 1
      : 0
    this.setState({
      isCanSaveForm: !computed
    })
  }
  render () {
    const {
      markConfigModalVisible,
      tableSource,
      isCanSaveForm
    } = this.state
    const {
      form,
      bizlogics,
      widgetlibs,
      dataSource,
      chartInfo,
      queryParams,
      segmentControlActiveIndex,
      onBizlogicChange,
      onWidgetTypeChange,
      onFormItemChange,
      onFormInputItemChange,
      onSegmentControlChange,
      onShowVariableConfigTable,
      onDeleteControl
    } = this.props

    const { getFieldDecorator } = form

    const bizlogicOptions = bizlogics.map(b => (
      <Option key={b.id} value={`${b.id}`}>{b.name}</Option>
    ))

    const widgetlibOptions = widgetlibs.map(w => (
      <Option key={w.id} value={`${w.id}`}>
        {w.title}
        {
          `${w.id}` !== form.getFieldValue('widgetlib_id')
            ? (
              <i className={`iconfont ${iconMapping[w.name]} ${styles.chartSelectOption}`} />
            ) : ''
        }
      </Option>
    ))

    let chartConfigElements = ''
    if (chartInfo) {
      const columns = dataSource && dataSource.length ? Object.keys(dataSource[0]) : []

      chartConfigElements = chartInfo.params.map(info => {
        const formItems = info.items.map(item => {
          let formItem = ''

          switch (item.component) {
            case 'select':
              formItem = (
                <Col key={item.name} span={24}>
                  <FormItem label={item.title}>
                    {getFieldDecorator(item.name, {})(
                      <Select
                        placeholder={item.tip || item.placeholder || item.name}
                        onChange={onFormItemChange(item.name)}
                        allowClear
                      >
                        {
                          item && item.values && item.values.length > 0
                          ? item.values.map(c => (
                            <Option key={c.type} value={c.value}>{c.name}</Option>
                            ))
                          : columns
                              .filter(c => c !== 'antDesignTableId')
                              .map(c => (
                                <Option key={c} value={c}>{c}</Option>
                              ))
                        }
                      </Select>
                    )}
                  </FormItem>
                </Col>
              )
              break
            case 'multiSelect':
              formItem = (
                <Col key={item.name} span={24}>
                  <FormItem label={item.title}>
                    {getFieldDecorator(item.name, {})(
                      <Select
                        placeholder={item.tip || item.placeholder || item.name}
                        mode="multiple"
                        onChange={onFormItemChange(item.name)}
                      >
                        {
                          columns
                            .filter(c => c !== 'antDesignTableId')
                            .map(c => (<Option key={c} value={c}>{c}</Option>))
                        }
                      </Select>
                    )}
                  </FormItem>
                </Col>
              )
              break
            case 'checkbox':
              formItem = (
                <Col key={item.name} span={item.span || 12}>
                  <FormItem label="">
                    {getFieldDecorator(item.name, {
                      initialValue: []
                    })(
                      <CheckboxGroup
                        options={[{label: item.title, value: item.name}]}
                        onChange={onFormItemChange(item.name)}
                      />
                    )}
                  </FormItem>
                </Col>
              )
              break
            case 'inputnumber':
              formItem = (
                <Col key={item.name} span={item.span || 12}>
                  <FormItem label={item.title}>
                    {getFieldDecorator(item.name, {
                      initialValue: item.default || 0
                    })(
                      <InputNumber
                        placeholder={item.tip || item.placeholder || item.name}
                        min={item.min === undefined ? -1000000000000 : item.min}
                        max={item.max === undefined ? 1000000000000 : item.max}
                        onChange={onFormItemChange(item.name)}
                      />
                    )}
                  </FormItem>
                </Col>
              )
              break
            case 'input':
              formItem = (
                <Col key={item.name} span={item.span || 12}>
                  <FormItem label={item.title}>
                    {getFieldDecorator(item.name, {
                      initialValue: ''
                    })(
                      <Input
                        placeholder={item.tip || item.placeholder || item.name}
                        onChange={onFormInputItemChange(item.name)}
                      />
                    )}
                  </FormItem>
                </Col>
              )
              break
            case 'radio':
              formItem = (
                <Col key={item.name} span={item.span || 12}>
                  <FormItem label={item.title}>
                    {getFieldDecorator(item.name, {
                      initialValue: item.default || ''
                    })(
                      <RadioGroup
                        onChange={onFormInputItemChange(item.name)}
                      >
                        {
                          item.values.map(c => (
                            <Radio key={c.value} value={c.value}>{c.name}</Radio>
                          ))
                        }
                      </RadioGroup>
                    )}
                  </FormItem>
                </Col>
              )
              break
            case 'table':
              formItem = (
                <Col key={item.name} span={item.span || 12}>
                  <FormItem label={item.title}>
                    {getFieldDecorator(item.name, {
                      initialValue: ''
                    })(
                      <Input
                        className={utilStyles.hide}
                        placeholder={item.tip || item.placeholder || item.name}
                        onChange={onFormInputItemChange(item.name)}
                      />
                    )}
                  </FormItem>
                  <Popover placement="bottom" content={<p className={styles.descPanel}>点击配置</p>}>
                    <Icon className={styles.desc} type="question-circle-o" onClick={this.toggleMarkConfigTable} />
                  </Popover>
                  <Modal
                    title="标注器配置"
                    wrapClassName="ant-modal-large"
                    visible={markConfigModalVisible}
                    onCancel={this.toggleMarkConfigTable}
                    afterClose={this.resetMarkConfigForm}
                    footer={false}
                    maskClosable={false}
                  >
                    <MarkConfigForm
                      dataSource={tableSource}
                      configOptions={item.columns}
                      isCanSaveForm={isCanSaveForm}
                      onAddConfigValue={this.onAddConfigValue}
                      onChangeConfigValueStatus={this.onChangeConfigValueStatus}
                      onUpdateConfigValue={this.onUpdateConfigValue}
                      onDeleteConfigValue={this.onDeleteConfigValue}
                      onSaveConfigValue={this.saveConfig}
                      onCancel={this.toggleMarkConfigTable}
                      ref={f => { this.markConfigForm = f }}
                     />
                  </Modal>
                </Col>
              )
              break
            default:
              break
          }

          return formItem
        })

        return (
          <div className={styles.formUnit} key={info.name}>
            <h4 className={styles.unitTitle}>{info.title}</h4>
            <Row className={styles.unitContent} gutter={8}>
              {formItems}
            </Row>
          </div>
        )
      })
    }

    const controlTypes = [
      { text: '文本输入框', value: 'input' },
      { text: '数字输入框', value: 'inputNumber' },
      { text: '单选下拉菜单', value: 'select' },
      { text: '多选下拉菜单', value: 'multiSelect' },
      { text: '日期选择', value: 'date' },
      { text: '日期多选', value: 'multiDate' },
      { text: '日期时间选择', value: 'datetime' },
      { text: '日期范围选择', value: 'dateRange' },
      { text: '日期时间范围选择', value: 'datetimeRange' }
    ]

    // const controlTypeOptions = controlTypes.map(o => (
    //   <Option key={o.value} value={o.value}>{o.text}</Option>
    // ))

    const queryConfigColumns = [{
      title: '控件',
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => controlTypes.find(c => c.value === text).text
    }, {
      title: '关联',
      dataIndex: 'variables',
      key: 'variables',
      render: (text, record) => record.variables.join(',')
    }, {
      title: '操作',
      key: 'action',
      width: 100,
      className: `${utilStyles.textAlignCenter}`,
      render: (text, record) => (
        <span className="ant-table-action-column">
          <Button
            size="small"
            shape="circle"
            icon="edit"
            onClick={onShowVariableConfigTable(record.id)}
          />
          <Button
            size="small"
            shape="circle"
            icon="delete"
            onClick={onDeleteControl(record.id)}
          />
        </span>
      )
    }]

    const chartConfigClass = classnames({
      [utilStyles.hide]: !!segmentControlActiveIndex
    })

    const queryConfigClass = classnames({
      [utilStyles.hide]: !segmentControlActiveIndex
    })

    return (
      <Form className={styles.formView}>
        <Row>
          <Col span={24}>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('id', {})(
                <Input />
              )}
            </FormItem>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('create_by', {
                hidden: this.props.type === 'add'
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="Widget 名称">
              {getFieldDecorator('name', {
                rules: [{ required: true }, {validator: this.checkNameUnique}]
              })(
                <Input placeholder="Widget Name" />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="Widget 描述">
              {getFieldDecorator('desc', {
                initialValue: ''
              })(
                <Input placeholder="Widget Description" />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="View">
              {getFieldDecorator('flatTable_id', {
                rules: [{ required: true }]
              })(
                <Select
                  placeholder="请选择 View"
                  onChange={onBizlogicChange}
                >
                  {bizlogicOptions}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="Widget 类型">
              {getFieldDecorator('widgetlib_id', {
                rules: [{ required: true }]
              })(
                <Select
                  placeholder="Widget Type"
                  onChange={onWidgetTypeChange}
                >
                  {widgetlibOptions}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24} className={styles.scCol}>
            <RadioGroup
              defaultValue={segmentControlActiveIndex ? '2' : '1'}
              onChange={onSegmentControlChange}
            >
              <RadioButton value="1">Chart配置</RadioButton>
              <RadioButton value="2">变量配置</RadioButton>
            </RadioGroup>
          </Col>
        </Row>
        <div className={chartConfigClass}>
          {chartConfigElements}
          <div className={styles.formUnit} key="cache">
            <h4 className={styles.unitTitle}>缓存配置</h4>
            <Row className={styles.unitContent} gutter={8}>
              <Col span={12}>
                <FormItem label="开启缓存">
                  {getFieldDecorator('useCache', {
                    initialValue: 'true'
                  })(
                    <RadioGroup>
                      <Radio value="true">是</Radio>
                      <Radio value="false">否</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="失效时间">
                  {getFieldDecorator('expired', {
                    initialValue: 300
                  })(
                    <InputNumber
                      min={0}
                      disabled={form.getFieldValue('useCache') === 'false'}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </div>
        </div>
        <div className={queryConfigClass}>
          <Row>
            <Col span={24} className={styles.addCol}>
              <Button
                type="primary"
                icon="plus"
                onClick={onShowVariableConfigTable()}
              >
                新增
              </Button>
            </Col>
          </Row>
          <Table
            dataSource={queryParams}
            columns={queryConfigColumns}
            rowKey="id"
            pagination={false}
          />
        </div>
      </Form>
    )
  }
}

WidgetForm.propTypes = {
  type: PropTypes.string,
  form: PropTypes.any,
  bizlogics: PropTypes.array,
  widgetlibs: PropTypes.array,
  dataSource: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  chartInfo: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  queryParams: PropTypes.array,
  segmentControlActiveIndex: PropTypes.number,
  onBizlogicChange: PropTypes.func,
  onWidgetTypeChange: PropTypes.func,
  onFormItemChange: PropTypes.func,
  onFormInputItemChange: PropTypes.func,
  onSegmentControlChange: PropTypes.func,
  onShowVariableConfigTable: PropTypes.func,
  onDeleteControl: PropTypes.func,
  onCheckName: PropTypes.func
}

function mapDispatchToProps (dispatch) {
  return {
    onCheckName: (id, name, type, resolve, reject) => dispatch(checkNameAction(id, name, type, resolve, reject))
  }
}

export default Form.create()(connect(null, mapDispatchToProps)(WidgetForm))
