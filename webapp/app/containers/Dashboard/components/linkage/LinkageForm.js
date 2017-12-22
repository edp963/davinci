import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import Form from 'antd/lib/form'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Cascader from 'antd/lib/cascader'
import Select from 'antd/lib/select'
const FormItem = Form.Item
const Option = Select.Option

import {DEFAULT_SPLITER} from '../../../../globalConstants'
import styles from './Linkage.less'

export class LinkageForm extends PureComponent {
  // FIXME 解决循环联动问题
  checkRepeatAndType = (rule, value, callback) => {
    const form = this.props.form
    const linkagerValue = form.getFieldValue('linkager')

    if (value && linkagerValue && value.length && linkagerValue.length) {
      let triggerValueArr = value[1].split(DEFAULT_SPLITER)
      let linkagerValueArr = linkagerValue[1].split(DEFAULT_SPLITER)
      let triggerColumnType = triggerValueArr[1]
      let linkagerColumnType = linkagerValueArr[1]

      if (value[0] === linkagerValue[0]) {
        callback('不能联动自身')
      }

      if (triggerColumnType !== 'variable' && linkagerColumnType !== 'variable') {
        if (triggerColumnType !== linkagerColumnType) {
          callback('参数类型不一致')
        } else {
          callback()
        }
      } else {
        callback()
      }
    } else {
      callback()
    }
  }

  confirmCheck = (rule, value, callback) => {
    if (value) {
      this.props.form.validateFields(['trigger'], { force: true })
    }
    callback()
  }

  render () {
    const { form, cascaderSource } = this.props
    const { getFieldDecorator } = form

    const relations = ['=', 'like', '>', '<', '>=', '<=', '!=']
    const relationOptions = relations.map(r => (
      <Option key={r} value={r}>{r}</Option>
    ))

    const commonFormItemStyle = {
      labelCol: { span: 8 },
      wrapperCol: { span: 12 }
    }

    return (
      <Form className={styles.linkageForm}>
        <Row gutter={8}>
          <Col md={24}>
            <FormItem
              label="触发器"
              className={styles.linkageFormItem}
              {...commonFormItemStyle}
            >
              {getFieldDecorator('trigger', {
                rules: [{
                  required: true,
                  message: '不能为空'
                }, {
                  validator: this.checkRepeatAndType
                }]
              })(
                <Cascader
                  placeholder="请选择"
                  options={cascaderSource}
                  expandTrigger="hover"
                  displayRender={(labels) => labels.join(' - ')}
                />
              )}
            </FormItem>
          </Col>
          <Col md={24}>
            <FormItem
              label="联动图表"
              className={styles.linkageFormItem}
              {...commonFormItemStyle}
            >
              {getFieldDecorator('linkager', {
                rules: [{
                  required: true,
                  message: '不能为空'
                }, {
                  validator: this.confirmCheck
                }]
              })(
                <Cascader
                  placeholder="请选择"
                  options={cascaderSource}
                  expandTrigger="hover"
                  displayRender={(labels) => labels.join(' - ')}
                />
              )}
            </FormItem>
          </Col>
          <Col md={24}>
            <FormItem
              label="关系"
              className={styles.linkageFormItem}
              {...commonFormItemStyle}
            >
              {getFieldDecorator('relation', {
                initialValue: '='
              })(
                <Select>{relationOptions}</Select>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}

LinkageForm.propTypes = {
  form: PropTypes.any,
  cascaderSource: PropTypes.array
}

export default Form.create()(LinkageForm)
