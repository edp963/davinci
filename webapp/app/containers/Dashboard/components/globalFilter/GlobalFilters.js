import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import Form from 'antd/lib/form'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Input from 'antd/lib/input'
// import InputNumber from 'antd/lib/input-number'
import NumberRange from '../../../../components/NumberRange'
import Select from 'antd/lib/select'
import DatePicker from 'antd/lib/date-picker'
import MultiDatePicker from '../../../../components/MultiDatePicker'
const FormItem = Form.Item
const Option = Select.Option
const Search = Input.Search
const RangePicker = DatePicker.RangePicker

import styles from './GlobalFilter.less'

export class GlobalFilters extends PureComponent {
  render () {
    const { form, filters, onChange } = this.props
    const { getFieldDecorator } = form

    const filterItems = filters.map(f => {
      switch (f.type) {
        // case 'inputNumber':
        //   return (
        //     <Col
        //       key={f.key}
        //       xl={3}
        //       lg={4}
        //       md={6}
        //       sm={12}
        //     >
        //       <FormItem className={styles.item}>
        //         {getFieldDecorator(`${f.key}`, {})(
        //           <InputNumber
        //             placeholder={f.name}
        //             className={styles.input}
        //           />
        //         )}
        //       </FormItem>
        //     </Col>
        //   )
        case 'numberRange':
          return (
            <Col
              key={f.key}
              xl={3}
              lg={4}
              md={6}
              sm={12}
            >
              <FormItem className={styles.item}>
                {getFieldDecorator(`${f.key}`, {})(
                  <NumberRange
                    placeholder={f.name}
                    onSearch={onChange(f)}
                  />
                )}
              </FormItem>
            </Col>
          )
        case 'select':
        case 'multiSelect':
          let mode = f.type === 'multiSelect'
            ? { mode: 'multiple' }
            : { allowClear: true }
          let selProperties = Object.assign({
            placeholder: f.name,
            onChange: onChange(f)
          }, mode)

          let options = f.options
            .filter(o => o.status)
            .map(o => (
              <Option key={o.id} value={o.value}>{o.text}</Option>
            ))

          return (
            <Col
              key={f.key}
              xl={3}
              lg={4}
              md={6}
              sm={12}
            >
              <FormItem className={styles.item}>
                {getFieldDecorator(`${f.key}`, {})(
                  <Select {...selProperties}>
                    {options}
                  </Select>
                )}
              </FormItem>
            </Col>
          )
        case 'date':
        case 'datetime':
          let dateFormat = f.type === 'datetime'
            ? {
              format: 'YYYY-MM-DD HH:mm:ss',
              showTime: true,
              onOk: onChange(f),
              onChange: (val) => {
                if (!val) {
                  onChange(f)(val)
                }
              }
            }
            : {
              format: 'YYYY-MM-DD',
              onChange: onChange(f)
            }
          let dateProperties = Object.assign({
            placeholder: f.name,
            className: styles.input
          }, dateFormat)

          return (
            <Col
              key={f.key}
              xl={3}
              lg={4}
              md={6}
              sm={12}
            >
              <FormItem className={styles.item}>
                {getFieldDecorator(`${f.key}`, {})(
                  <DatePicker {...dateProperties} />
                )}
              </FormItem>
            </Col>
          )
        case 'multiDate':
          return (
            <Col
              key={f.key}
              xl={6}
              lg={8}
              md={12}
            >
              <FormItem className={styles.item}>
                {getFieldDecorator(`${f.key}`, {})(
                  <MultiDatePicker
                    placeholder={f.name}
                    onChange={onChange(f)}
                  />
                )}
              </FormItem>
            </Col>
          )
        case 'dateRange':
        case 'datetimeRange':
          let rangeFormat = f.type === 'datetimeRange'
            ? {
              format: 'YYYY-MM-DD HH:mm:ss',
              showTime: true,
              onOk: onChange(f),
              onChange: (val) => {
                if (!val.length) {
                  onChange(f)(val)
                }
              }
            }
            : {
              format: 'YYYY-MM-DD',
              onChange: onChange(f)
            }
          let rangeProperties = Object.assign({
            placeholder: [`${f.name}从`, '到'],
            className: styles.input
          }, rangeFormat)

          return (
            <Col
              key={f.key}
              xl={6}
              lg={8}
              md={12}
            >
              <FormItem className={styles.item}>
                {getFieldDecorator(`${f.key}`, {})(
                  <RangePicker {...rangeProperties} />
                )}
              </FormItem>
            </Col>
          )
        default:
          return (
            <Col
              key={f.key}
              xl={3}
              lg={4}
              md={6}
              sm={12}
            >
              <FormItem className={styles.item}>
                {getFieldDecorator(`${f.key}`, {})(
                  <Search placeholder={f.name} onPressEnter={onChange(f)} />
                )}
              </FormItem>
            </Col>
          )
      }
    })

    return (
      <Form className={styles.filters}>
        <Row gutter={8}>
          {filterItems}
        </Row>
      </Form>
    )
  }
}

GlobalFilters.propTypes = {
  form: PropTypes.any,
  filters: PropTypes.array,
  onChange: PropTypes.func
}

export default Form.create()(GlobalFilters)
