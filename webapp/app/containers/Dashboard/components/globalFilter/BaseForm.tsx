import * as React from 'react'

import { WrappedFormUtils } from 'antd/lib/form/Form'
const Form = require('antd/lib/form')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Input = require('antd/lib/input')
const Select = require('antd/lib/select')
const FormItem = Form.Item
const Option = Select.Option

const styles = require('./GlobalFilter.less')
const utilStyles = require('../../../../assets/less/util.less')

interface IBaseFormProps {
  form: WrappedFormUtils
  filterTypes: Array<{ text: string, value: string }>
  bizlogics: any[]
  isCascadeSelect: boolean
  flatTableColumns: any[]
  onTypeSelectChange: () => any
  onFlatTableSelectChange: () => any
}

export interface IBaseForm {
  name: string
  key: string
  type: string
  flatTableId?: number
  cascadeColumn?: string
  parentColumn?: string
}

export class BaseForm extends React.PureComponent<IBaseFormProps, {}> {
  public render () {
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

    const filterTypeOptions = filterTypes.map((o) => (
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
                  bizlogics.map((b) => (
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
                  flatTableColumns.map((c) => (
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
                  flatTableColumns.map((c) => (
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

export default Form.create()(BaseForm)
