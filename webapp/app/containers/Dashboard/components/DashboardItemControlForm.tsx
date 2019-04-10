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

import React, { Suspense } from 'react'

import { WrappedFormUtils } from 'antd/lib/form/Form'
import { Form, Input, InputNumber, Select, DatePicker, Button, Row, Col } from 'antd'
const FormItem = Form.Item
const Option = Select.Option
const RangePicker = DatePicker.RangePicker

import { KEY_COLUMN } from '../../../globalConstants'
import { QueryVariable } from '../Grid'
const styles = require('../Dashboard.less')
const MultiDatePicker = React.lazy(() => import('../../../components/MultiDatePicker'))

interface IDashboardItemControlFormProps {
  form: WrappedFormUtils
  controls: any[]
  onSearch: (queayConditions: { variables: QueryVariable }) => void
  onHide: () => void
}

interface IDashboardItemControlFormStates {
  parentSelValues: object
}

export class DashboardItemControlForm extends React.PureComponent<IDashboardItemControlFormProps, IDashboardItemControlFormStates> {
  constructor (props) {
    super(props)
    this.state = {
      parentSelValues: null
    }
  }

  public componentWillMount () {
    this.getStateValues(this.props.controls)
  }

  public componentWillReceiveProps (nextProps) {
    if (nextProps.controls.map((c) => c.id).join(',') !==
        this.props.controls.map((c) => c.id).join(',')) {
      this.getStateValues(nextProps.controls)
    }
  }

  private getStateValues = (controls) => {
    this.setState({
      parentSelValues: controls
        .filter((c) => c.sub.length)
        .reduce((acc, c) => {
          acc[c.id] = 0
          return acc
        }, {})
    })
  }

// {
// 	"id": "96F6258E",
// 	"type": "multiSelect",
// 	"variables": ["city"],
// 	"sub": [{
// 		"id": "FB0DF8A8",
// 		"text": "北京",
// 		"value": "beijing",
// 		"variables": ["city"],
// 		"status": 1
// 	}, {
// 		"id": "57940A50",
// 		"text": "上海",
// 		"value": "shanghai",
// 		"variables": ["city"],
// 		"status": 1
// 	}]
// }
  private generateFormComponent = (c) => {
    const {
      form,
      controls
    } = this.props

    const { getFieldDecorator } = form

    switch (c.type) {
      case 'inputNumber':
        return (
          <Col
            key={c.id}
            xl={8}
            md={12}
          >
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`${c.id}`, {})(
                <InputNumber placeholder={c.variables[0]} />
              )}
            </FormItem>
          </Col>
        )
      case 'select':
   //   case 'multiSelect':
        const options = []
        let followComponents = []

        c.sub.forEach((sub, index) => {
          options.push(
            <Option key={sub.id} value={sub.value}>{sub.text}</Option>
          )

          if (c.type === 'select' &&
              c.hasRelatedComponent === true &&
              sub.variableType &&
              this.state.parentSelValues[c.id] === index) {   // todo 变量关联控件
            followComponents = followComponents.concat(this.generateFormComponent({
              ...sub,
              id: `sub_${c.id}_${sub.id}`,
              type: sub.variableType
            }))
          }
        })

        const mode = c.multiple === true
          ? {
            mode: 'multiple'
          }
          : {
            allowClear: true
          }
        const selProperties = {
          placeholder: c.variables[0] || '请选择',
          onChange: this.parentSelectChange(c),
          ...mode
        }

        followComponents.unshift(
          <Col
            key={c.id}
            xl={8}
            md={12}
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
        const dateProperties = {...dateFormat}
        if (c.type === 'date' && c.multiple === true) {
          return (
            <Col
              key={c.id}
              xl={12}
            >
              <FormItem className={styles.formItem}>
                {getFieldDecorator(`${c.id}`, {})(
                  <MultiDatePicker />
                )}
              </FormItem>
            </Col>
          )
        }
        return (
          <Col
            key={c.id}
            xl={8}
            md={12}
          >
            <FormItem className={styles.formItem}>
              {getFieldDecorator(`${c.id}`, {})(
                <DatePicker {...dateProperties} />
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
        const rangeProperties = {
          placeholder: c.variables[0],
          ...rangeFormat
        }

        return (
          <Col
            key={c.id}
            xl={8}
            md={12}
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
            xl={8}
            md={12}
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

  private parentSelectChange = (control) => (val) => {
    const { parentSelValues } = this.state

    if (Object.prototype.toString.call(val) !== '[object Array]') { // 下拉多选
      let selIndex = -1

      if (val) {
        selIndex = control.sub.findIndex((c) => c.value === val)
        parentSelValues[control.id] = selIndex
      } else {
        selIndex = parentSelValues[control.id]
        parentSelValues[control.id] = 0
      }

      this.setState({
        parentSelValues
      }, () => {
        // FIXME 当未关联控件时控制台报错
        this.props.form.setFieldsValue({
          [`sub_${control.id}_${control.sub[selIndex].id}`]: ''
        })
      })
    }
  }

  private onControlSearch = () => {
    const { controls, onSearch, onHide } = this.props

    const formValues = this.props.form.getFieldsValue()

    const variables = Object.keys(formValues).reduce((arr, key) => {
      let val = formValues[key]

      let valControl

      if (key.indexOf('sub') >= 0) {
        const idArr = key.split('_')
        valControl = controls.find((c) => c.id === idArr[1]).sub.find((s) => s.id === idArr[2])
      } else {
        valControl = controls.find((c) => c.id === key)
      }

      valControl.type = valControl.variableType || valControl.type
      if (Object.prototype.toString.call(val) === '[object Array]') {
        switch (valControl.type) {
          case 'dateRange':
            val = val.map((v) => v.format('YYYY-MM-DD'))
            arr = arr.concat({
              name: valControl.variables[0],
              value: `'${val[0]}'`
            }).concat({
              name: valControl.variables[1],
              value: `'${val[1]}'`
            })
            break
          case 'datetimeRange':
            val = val.map((v) => v.format('YYYY-MM-DD HH:mm:ss'))
            arr = arr.concat({
              name: valControl.variables[0],
              value: `'${val[0]}'`
            }).concat({
              name: valControl.variables[1],
              value: `'${val[1]}'`
            })
            break
          // case 'multiSelect':
          //   if (val.length) {
          //     arr = arr.concat({
          //       name: valControl.variables[0],
          //       value: val.map((v) => `${v}`).join(',')
          //     })
          //   }
            case 'select':
            if (valControl.multiple === true) { // 适配下拉多选
              if (val.length) {
                arr = arr.concat({
                  name: valControl.variables[0],
                  value: val.map((v) => `'${v}'`).join(',')
                })
              }
            }
            break
          default:
            break
        }
      } else {
        if (val) {
          if (valControl.variables[0]) {
            switch (valControl.type) {
              case 'date':
                if (valControl.multiple === false) {
                  val = val.format('YYYY-MM-DD')
                  arr = arr.concat({
                    name: valControl.variables[0],
                    value: `'${val}'`
                  })
                } else {
                  arr = arr.concat({
                    name: valControl.variables[0],
                    value: val.split(',').map((v) => `'${v}'`).join(',')
                  })
                }
                break
              case 'datetime':
                val = val.format('YYYY-MM-DD HH:mm:ss')
                arr = arr.concat({
                  name: valControl.variables[0],
                  value: `'${val}'`
                })
                break
              case 'select':
                if (valControl.multiple === false) {
                  arr = arr.concat({
                    name: valControl.variables[0],
                    value: `${val}`
                  })
                }
                break
              default:
                arr = arr.concat({
                  name: valControl.variables[0],
                  value: `'${val}'`
                })
                break
            }
          } else {
            if (valControl.type === 'select') {
              if (valControl.hasRelatedComponent === false) {
                const chosenSub = valControl.sub.find((s) => s.value === val)

                if (chosenSub.variables[0]) {
                  arr = arr.concat({
                    name: chosenSub.variables[0],
                    value: `'${val}'`
                  })
                }
              }
            }
          }
        }
      }

      return arr
    }, [])

    onSearch({ variables })

    onHide()
  }

  public render () {
    const {
      controls
    } = this.props
    const controlItems = controls
      .map((c) => this.generateFormComponent(c))

    return (
      <Form className={styles.controlForm}>
        <Row gutter={10}>
          <Suspense fallback={null}>
            {controlItems}
          </Suspense>
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

export default Form.create()(DashboardItemControlForm)
