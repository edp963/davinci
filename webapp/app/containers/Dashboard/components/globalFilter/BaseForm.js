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
    const {
      form,
      filterTypes,
      bizlogics,
      isCascadeSelect,
      flatTableColumns,
      onTypeSelectChange,
      onFlatTableSelectChange
    } = this.props

    const { getFieldDecorator } = form

    const filterTypeOptions = filterTypes.map(o => (
      <Option key={o.value} value={o.value}>{o.text}</Option>
    ))

    let cascadeSelects

    if (isCascadeSelect) {
      cascadeSelects = [(
        <Col key="flatTableId" span={8}>
          <FormItem
            label="View"
            labelCol={{span: 8}}
            wrapperCol={{span: 16}}
            className={styles.formItem}
          >
            {getFieldDecorator('flatTableId', {
              rules: [{
                required: true,
                message: '不能为空'
              }]
            })(
              <Select
                placeholder="请选择"
                onChange={onFlatTableSelectChange}
                allowClear
              >
                {
                  bizlogics.map(b => (
                    <Option key={b.id} value={`${b.id}`}>{b.name}</Option>
                  ))
                }
              </Select>
            )}
          </FormItem>
        </Col>
      ), (
        <Col key="cascadeColumn" span={8}>
          <FormItem
            label="级联字段"
            labelCol={{span: 8}}
            wrapperCol={{span: 16}}
            className={styles.formItem}
          >
            {getFieldDecorator('cascadeColumn', {
              rules: [{
                required: true,
                message: '不能为空'
              }]
            })(
              <Select
                placeholder="请选择"
                allowClear
              >
                {
                  flatTableColumns.map(c => (
                    <Option key={c} value={c}>{c}</Option>
                  ))
                }
              </Select>
            )}
          </FormItem>
        </Col>
      ), (
        <Col key="parentColumn" span={8}>
          <FormItem
            label="级联父字段"
            labelCol={{span: 8}}
            wrapperCol={{span: 16}}
            className={styles.formItem}
          >
            {getFieldDecorator('parentColumn', {})(
              <Select
                placeholder="请选择"
                allowClear
              >
                {
                  flatTableColumns.map(c => (
                    <Option key={c} value={c}>{c}</Option>
                  ))
                }
              </Select>
            )}
          </FormItem>
        </Col>
      )]
    }

    return (
      <Form>
        <Row gutter={8}>
          <Col span={8}>
            <FormItem
              label="名称"
              labelCol={{span: 8}}
              wrapperCol={{span: 16}}
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
              labelCol={{span: 8}}
              wrapperCol={{span: 16}}
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
                  onChange={onTypeSelectChange}
                  allowClear
                >
                  {filterTypeOptions}
                </Select>
              )}
            </FormItem>
          </Col>
          {cascadeSelects}
        </Row>
      </Form>
    )
  }
}

BaseForm.propTypes = {
  form: PropTypes.any,
  filterTypes: PropTypes.array,
  bizlogics: PropTypes.array,
  isCascadeSelect: PropTypes.bool,
  flatTableColumns: PropTypes.array,
  onTypeSelectChange: PropTypes.func,
  onFlatTableSelectChange: PropTypes.func
}

export default Form.create()(BaseForm)
