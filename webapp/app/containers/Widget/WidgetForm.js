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

import React, { PropTypes } from 'react'
import classnames from 'classnames'

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
const FormItem = Form.Item
const Option = Select.Option
const CheckboxGroup = Checkbox.Group
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

import chartIconMapping from './chartIconMapping'

import utilStyles from '../../assets/less/util.less'
import styles from './Widget.less'

export class WidgetForm extends React.Component {
  render () {
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
              <i className={`iconfont ${chartIconMapping[w.name]} ${styles.chartSelectOption}`} />
            ) : ''
        }
      </Option>
    ))

    let chartConfigElements = ''

    if (chartInfo) {
      const columns = dataSource && dataSource.length ? Object.keys(dataSource[0]) : []
      // FIXME table widget 硬编码
      if (chartInfo.name !== 'table') {
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
                          placeholder={item.tip || item.name}
                          onChange={onFormItemChange(item.name)}
                        >
                          {
                            columns
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
                          placeholder={item.tip || item.name}
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
                  <Col key={item.name} span={12}>
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
                  <Col key={item.name} span={12}>
                    <FormItem label={item.title}>
                      {getFieldDecorator(item.name, {
                        initialValue: 0
                      })(
                        <InputNumber
                          placeholder={item.tip || item.name}
                          min={item.min || -1000000000000}
                          max={item.max || 1000000000000}
                          onChange={onFormItemChange(item.name)}
                        />
                      )}
                    </FormItem>
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
              <Row className={styles.unitContent}>
                {formItems}
              </Row>
            </div>
          )
        })
      } else {
        chartConfigElements = (
          <div className={styles.formUnit}>
            <h4 className={styles.unitTitle}>Column Config</h4>
            <Row className={styles.unitContent}>
              <Col span={24}>
                <FormItem label="维度列">
                  {getFieldDecorator('dimensionColumns', {})(
                    <Select
                      placeholder="Dimensions"
                      mode="multiple"
                      onChange={onFormItemChange('dimensionColumns')}
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
              <Col span={24}>
                <FormItem label="指标列">
                  {getFieldDecorator('metricColumns', {})(
                    <Select
                      placeholder="Metrics"
                      mode="multiple"
                      onChange={onFormItemChange('metricColumns')}
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
            </Row>
          </div>
        )
      }
    }

    const controlTypes = [
      { text: '文本输入框', value: 'input' },
      { text: '数字输入框', value: 'inputNumber' },
      { text: '单选下拉菜单', value: 'select' },
      { text: '多选下拉菜单', value: 'multiSelect' },
      { text: '日期选择', value: 'date' },
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
            <FormItem label="Widget 名称">
              {getFieldDecorator('name', {
                rules: [{ required: true }]
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
          <Col lg={24}>
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
  onSegmentControlChange: PropTypes.func,
  onShowVariableConfigTable: PropTypes.func,
  onDeleteControl: PropTypes.func
}

export default Form.create({withRef: true})(WidgetForm)
