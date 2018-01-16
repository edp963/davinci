import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import Form from 'antd/lib/form'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Input from 'antd/lib/input'
import Select from 'antd/lib/select'
const FormItem = Form.Item
const Option = Select.Option

import styles from './GlobalFilter.less'
import utilStyles from '../../../../assets/less/util.less'

export class BaseForm extends PureComponent {
  render () {
    const { form, filterTypes, onTypeSelect } = this.props
    const { getFieldDecorator } = form

    const filterTypeOptions = filterTypes.map(o => (
      <Option key={o.value} value={o.value}>{o.text}</Option>
    ))

    return (
      <Form>
        <Row gutter={8}>
          <Col span={8}>
            <FormItem
              label="名称"
              labelCol={{span: 6}}
              wrapperCol={{span: 18}}
              className={styles.formItem}
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  message: '不能为空'
                }]
              })(
                <Input placeholder="筛选项名称" />
              )}
            </FormItem>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('key', {})(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label="类型"
              labelCol={{span: 6}}
              wrapperCol={{span: 18}}
              className={styles.formItem}
            >
              {getFieldDecorator('type', {
                rules: [{
                  required: true,
                  message: '不能为空'
                }]
              })(
                <Select
                  placeholder="控件类型"
                  onChange={onTypeSelect}
                  allowClear
                >
                  {filterTypeOptions}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}

BaseForm.propTypes = {
  form: PropTypes.any,
  filterTypes: PropTypes.array,
  onTypeSelect: PropTypes.func
}

export default Form.create()(BaseForm)
