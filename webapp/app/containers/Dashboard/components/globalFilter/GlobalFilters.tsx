import * as React from 'react'

import NumberRange from '../../../../components/NumberRange'
import MultiDatePicker from '../../../../components/MultiDatePicker'
import { WrappedFormUtils } from 'antd/lib/form/Form'
const Form = require('antd/lib/form')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Input = require('antd/lib/input')
// const InputNumber = require('antd/lib/input-number')
const Select = require('antd/lib/select')
const DatePicker = require('antd/lib/date-picker')
const FormItem = Form.Item
const Option = Select.Option
const Search = Input.Search
const RangePicker = DatePicker.RangePicker

const styles = require('./GlobalFilter.less')
import { KEY_COLUMN } from '../../../../globalConstants'

interface IGlobalFiltersProps {
  form: WrappedFormUtils
  filters: any[]
  cascadeSources: object
  onChange: (filter: any) => (value: string) => void
  onCascadeSelectChange: (key: string, flatTableId: number, column: string, parents: any[]) => void
}

export class GlobalFilters extends React.PureComponent<IGlobalFiltersProps, {}> {
  private getCascadeChildrenControlId = (column, chilrenArr) => {
    const nearest = this.props.filters.find((c) => c.parentColumn === column.cascadeColumn)
    if (nearest) {
      return this.getCascadeChildrenControlId(nearest, chilrenArr.concat(nearest.key))
    } else {
      return chilrenArr
    }
  }

  private getCascadeParents = (column, parentsArr) => {
    if (column.parent) {
      const parent = this.props.filters.find((c) => c.cascadeColumn === column.parent)
      return this.getCascadeParents(parent, parentsArr.concat(parent.cascadeColumn))
    } else {
      return parentsArr
    }
  }

  public render () {
    const { form, filters, cascadeSources, onChange, onCascadeSelectChange } = this.props
    const { getFieldDecorator } = form

    const filterItems = filters.map((f) => {
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
          const mode = f.type === 'multiSelect'
            ? { mode: 'multiple' }
            : { allowClear: true }
          const selProperties = {
            ...mode,
            placeholder: f.name,
            onChange: onChange(f)
          }
          const options = f.options
            .filter((o) => o.status)
            .map((o) => (
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
        case 'cascadeSelect':
          const column = f.cascadeColumn
          const nearestChild = filters.find((fr) => fr.parentColumn === column)
          const dataSource = cascadeSources && cascadeSources[f.key]
          const cascadeOptions = dataSource
            ? dataSource.map((s) => (
              <Option key={s[KEY_COLUMN]} value={s[column]}>{s[column]}</Option>
            ))
            : ''

          const changeCallback = {
            onChange: (val) => {
              if (nearestChild) {
                // form.resetFields(this.getCascadeChildrenControlId(f, []))
                if (val) {
                  const childColumn = nearestChild.cascadeColumn
                  const parentColumns = this.getCascadeParents(f, [column])
                  const parents = parentColumns.length &&
                    Object.entries(form.getFieldsValue(parentColumns)).map((arr) => ({
                      fieldName: arr[0],
                      fieldValue: arr[0] === column ? val : arr[1]  // onChange未完成，不能获取到当前control的值
                    }))
                  onCascadeSelectChange(nearestChild.key, f.flatTableId, childColumn, parents)
                }
              }
              onChange(f)(val)
            }
          }

          const cascadeProperties = {
            placeholder: f.name,
            allowClear: true,
            ...changeCallback
          }

          return (
            <Col
              key={f.key}
              xl={3}
              lg={4}
              md={6}
              sm={12}
            >
              <FormItem className={styles.item}>
                {getFieldDecorator(f.key, {})(
                  <Select {...cascadeProperties}>
                    {cascadeOptions}
                  </Select>
                )}
              </FormItem>
            </Col>
          )
        case 'date':
        case 'datetime':
          const dateFormat = f.type === 'datetime'
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
          const dateProperties = {
            placeholder: f.name,
            className: styles.input,
            ...dateFormat
          }

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
          const rangeFormat = f.type === 'datetimeRange'
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
          const rangeProperties = {
            placeholder: [`${f.name}从`, '到'],
            className: styles.input,
            ...rangeFormat
          }

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

export default Form.create()(GlobalFilters)
