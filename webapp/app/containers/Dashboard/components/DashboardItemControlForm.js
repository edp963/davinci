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

import React, { PropTypes, PureComponent } from 'react'

import Form from 'antd/lib/form'
import Input from 'antd/lib/input'
import InputNumber from 'antd/lib/input-number'
import Select from 'antd/lib/select'
import DatePicker from 'antd/lib/date-picker'
import MultiDatePicker from '../../../components/MultiDatePicker'
import Button from 'antd/lib/button'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
const FormItem = Form.Item
const Option = Select.Option
const RangePicker = DatePicker.RangePicker

import { KEY_COLUMN } from '../../../globalConstants'
import styles from '../Dashboard.less'

export class DashboardItemControlForm extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      parentSelValues: null
    }
  }

  componentWillMount () {
    this.getStateValues(this.props.controls)
  }

  componentWillUpdate (nextProps) {
    if (nextProps.controls.map(c => c.id).join(',') !==
        this.props.controls.map(c => c.id).join(',')) {
      this.getStateValues(nextProps.controls)
    }
  }

  getStateValues = (controls) => {
    this.state.parentSelValues = controls
      .filter(c => c.sub.length)
      .reduce((acc, c) => {
        acc[c.id] = 0
        return acc
      }, {})
  }

  getCascadeChildrenControlId = (column, chilrenArr) => {
    const nearest = this.props.controls.find(c => c.parentColumn === column.cascadeColumn)
    if (nearest) {
      return this.getCascadeChildrenControlId(nearest, chilrenArr.concat(nearest.id))
    } else {
      return chilrenArr
    }
  }

  getCascadeParents = (column, parentsArr) => {
    if (column.parent) {
      const parent = this.props.controls.find(c => c.cascadeColumn === column.parent)
      return this.getCascadeParents(parent, parentsArr.concat(parent.cascadeColumn))
    } else {
      return parentsArr
    }
  }

  generateFormComponent = (c) => {
    const {
      form,
      controls,
      cascadeSources,
      onCascadeSelectChange
    } = this.props

    const { getFieldDecorator } = form

    switch (c.type) {
      case 'inputNumber':
        return (
          <Col
            key={c.id}
            lg={6}
            md={8}
            sm={12}
          >
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`${c.id}`, {})(
                <InputNumber placeholder={c.variables[0]} />
              )}
            </FormItem>
          </Col>
        )
      case 'select':
      case 'multiSelect':
        let options = []
        let followComponents = []

        c.sub.forEach((sub, index) => {
          options.push(
            <Option key={sub.id} value={sub.value}>{sub.text}</Option>
          )

          if (c.type === 'select' &&
              c.hasRelatedComponent === 'yes' &&
              sub.variableType &&
              this.state.parentSelValues[c.id] === index) {
            followComponents = followComponents.concat(this.generateFormComponent(Object.assign({}, sub, {
              id: `sub_${c.id}_${sub.id}`,
              type: sub.variableType
            })))
          }
        })

        const mode = c.type === 'multiSelect'
          ? {
            mode: 'multiple'
          }
          : {
            allowClear: true
          }
        const selProperties = Object.assign({
          placeholder: c.variables[0] || '请选择',
          onChange: this.parentSelectChange(c)
        }, mode)

        followComponents.unshift(
          <Col
            key={c.id}
            lg={6}
            md={8}
            sm={12}
          >
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`${c.id}`, {})(
                <Select {...selProperties}>
                  {options}
                </Select>
              )}
            </FormItem>
          </Col>
        )

        return followComponents
      case 'cascadeSelect':
        const column = c.cascadeColumn
        const nearestChild = controls.find(cl => cl.parentColumn === column)
        const dataSource = cascadeSources && cascadeSources[c.id]
        const cascadeOptions = dataSource
          ? dataSource.map(s => (
            <Option key={s[KEY_COLUMN]} value={s[column]}>{s[column]}</Option>
          ))
          : ''

        const changeCallback = nearestChild && {
          onChange: (val) => {
            if (val) {
              const childColumn = nearestChild.cascadeColumn
              const parentColumns = this.getCascadeParents(c, [column])
              const parents = parentColumns.length &&
                Object.entries(form.getFieldsValue(parentColumns)).map(arr => ({
                  fieldName: arr[0],
                  fieldValue: arr[0] === column ? val : arr[1]  // onChange未完成，不能获取到当前control的值
                }))
              onCascadeSelectChange(nearestChild.id, childColumn, parents)
            }
            form.resetFields(this.getCascadeChildrenControlId(c, []))
          }
        }

        const cascadeProperties = Object.assign({
          placeholder: column,
          allowClear: true
        }, changeCallback)

        return (
          <Col
            key={c.id}
            lg={6}
            md={8}
            sm={12}
          >
            <FormItem className={styles.formItem}>
              {getFieldDecorator(c.id, {})(
                <Select {...cascadeProperties}>
                  {cascadeOptions}
                </Select>
              )}
            </FormItem>
          </Col>
        )
      case 'date':
      case 'datetime':
        const dateFormat = c.type === 'datetime'
          ? {
            format: 'YYYY-MM-DD HH:mm:ss',
            showTime: true
          }
          : {
            format: 'YYYY-MM-DD'
          }
        const dateProperties = Object.assign({}, dateFormat)

        return (
          <Col
            key={c.id}
            lg={6}
            md={8}
            sm={12}
          >
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`${c.id}`, {})(
                <DatePicker {...dateProperties} />
              )}
            </FormItem>
          </Col>
        )
      case 'multiDate':
        return (
          <Col
            key={c.id}
            lg={12}
          >
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`${c.id}`, {})(
                <MultiDatePicker />
              )}
            </FormItem>
          </Col>
        )
      case 'dateRange':
      case 'datetimeRange':
        const rangeFormat = c.type === 'datetimeRange'
          ? {
            format: 'YYYY-MM-DD HH:mm:ss',
            showTime: true
          }
          : {
            format: 'YYYY-MM-DD'
          }
        const rangeProperties = Object.assign({
          placeholder: c.variables[0]
        }, rangeFormat)

        return (
          <Col
            key={c.id}
            lg={6}
            md={8}
            sm={12}
          >
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`${c.id}`, {})(
                <RangePicker {...rangeProperties} />
              )}
            </FormItem>
          </Col>
        )
      default:
        return (
          <Col
            key={c.id}
            lg={6}
            md={8}
            sm={12}
          >
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`${c.id}`, {})(
                <Input placeholder={c.variables[0]} />
              )}
            </FormItem>
          </Col>
        )
    }
  }

  parentSelectChange = (control) => (val) => {
    const { parentSelValues } = this.state

    if (Object.prototype.toString.call(val) !== '[object Array]') {
      let selIndex = -1

      if (val) {
        selIndex = control.sub.findIndex(c => c.value === val)
        parentSelValues[control.id] = selIndex
      } else {
        selIndex = parentSelValues[control.id]
        parentSelValues[control.id] = 0
      }

      this.setState({
        parentSelValues: parentSelValues
      }, () => {
        // FIXME 当未关联控件时控制台报错
        this.props.form.setFieldsValue({
          [`sub_${control.id}_${control.sub[selIndex].id}`]: ''
        })
      })
    }
  }

  onControlSearch = () => {
    const { controls, onSearch, onHide } = this.props

    const formValues = this.props.form.getFieldsValue()

    const params = Object.keys(formValues).reduce((arr, key) => {
      let val = formValues[key]

      let valControl

      if (key.indexOf('sub') >= 0) {
        const idArr = key.split('_')
        valControl = controls.find(c => c.id === idArr[1]).sub.find(s => s.id === idArr[2])
      } else {
        valControl = controls.find(c => c.id === key)
      }

      valControl.type = valControl.variableType || valControl.type

      if (Object.prototype.toString.call(val) === '[object Array]') {
        switch (valControl.type) {
          case 'dateRange':
            val = val.map(v => v.format('YYYY-MM-DD'))
            arr = arr.concat({
              k: valControl.variables[0],
              v: `'${val[0]}'`
            }).concat({
              k: valControl.variables[1],
              v: `'${val[1]}'`
            })
            break
          case 'datetimeRange':
            val = val.map(v => v.format('YYYY-MM-DD HH:mm:ss'))
            arr = arr.concat({
              k: valControl.variables[0],
              v: `'${val[0]}'`
            }).concat({
              k: valControl.variables[1],
              v: `'${val[1]}'`
            })
            break
          case 'multiSelect':
            val.forEach(v => {
              arr = arr.concat({
                k: valControl.variables[0],
                v: `${v}`
              })
            })
            break
          default:
            break
        }
      } else {
        if (val) {
          if (valControl.variables[0]) {
            switch (valControl.type) {
              case 'date':
                val = val.format('YYYY-MM-DD')
                arr = arr.concat({
                  k: valControl.variables[0],
                  v: `'${val}'`
                })
                break
              case 'datetime':
                val = val.format('YYYY-MM-DD HH:mm:ss')
                arr = arr.concat({
                  k: valControl.variables[0],
                  v: `'${val}'`
                })
                break
              case 'multiDate':
                arr = arr.concat({
                  k: valControl.variables[0],
                  v: val.split(',').map(v => `'${v}'`).join(',')
                })
                break
              case 'select':
                arr = arr.concat({
                  k: valControl.variables[0],
                  v: `${val}`
                })
                break
              default:
                arr = arr.concat({
                  k: valControl.variables[0],
                  v: `'${val}'`
                })
                break
            }
          } else {
            if (valControl.type === 'select') {
              if (valControl.hasRelatedComponent === 'no') {
                const chosenSub = valControl.sub.find(s => s.value === val)

                if (chosenSub.variables[0]) {
                  arr = arr.concat({
                    k: chosenSub.variables[0],
                    v: `'${val}'`
                  })
                }
              }
            }
          }
        }
      }

      return arr
    }, [])

    onSearch({
      params
    })

    onHide()
  }

  render () {
    const {
      controls
    } = this.props

    const controlItems = controls
      .map(c => this.generateFormComponent(c))

    return (
      <Form className={styles.controlForm}>
        <Row gutter={10}>
          {controlItems}
        </Row>
        <Row className={styles.buttonRow}>
          <Col span={24}>
            <Button type="primary" onClick={this.onControlSearch}>查询</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}

DashboardItemControlForm.propTypes = {
  form: PropTypes.any,
  controls: PropTypes.array,
  cascadeSources: PropTypes.object,
  onSearch: PropTypes.func,
  onHide: PropTypes.func,
  onCascadeSelectChange: PropTypes.func
}

export default Form.create()(DashboardItemControlForm)
