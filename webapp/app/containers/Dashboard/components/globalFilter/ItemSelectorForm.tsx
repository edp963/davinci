import * as React from 'react'

import { WrappedFormUtils } from 'antd/lib/form/Form'
const Form = require('antd/lib/form')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Select = require('antd/lib/select')
const FormItem = Form.Item
const Option = Select.Option

import { DEFAULT_SPLITER } from '../../../../globalConstants'
const styles = require('./GlobalFilter.less')

interface IItemSelectorFormProps {
  form: WrappedFormUtils
  items: any[]
}

export class ItemSelectorForm extends React.PureComponent<IItemSelectorFormProps, {}> {
  public render () {
    const { form, items } = this.props
    const { getFieldDecorator } = form

    const itemSelectors = items.map((i) => {
      const Options = i.keys
        .map((k, index) => {
          const itemType = i.types[index]
          return (<Option key={k} value={`${k}${DEFAULT_SPLITER}${itemType}`}>{k}</Option>)
        })
        .concat(i.params.map((v) => (
          <Option key={v} value={`${v}${DEFAULT_SPLITER}`}>{`${v}[变量]`}</Option>
        )))

      return (
        <Col key={i.id} span={6}>
          <FormItem
            label={i.name}
            className={styles.formItem}
          >
            {getFieldDecorator(`${i.id}`, {})(
              <Select placeholder="请选择参数或变量" allowClear>
                {Options}
              </Select>
            )}
          </FormItem>
        </Col>
      )
    })

    return (
      <Form>
        <Row gutter={8}>{itemSelectors}</Row>
      </Form>
    )
  }
}

export default Form.create()(ItemSelectorForm)
