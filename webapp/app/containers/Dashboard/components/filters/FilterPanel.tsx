import * as React from 'react'
import moment from 'moment'
import { FormComponentProps } from 'antd/lib/form/Form'
import { IFilterViewConfig, IFilterItem } from './'
import { FilterTypes } from './filterTypes'
import { SQL_NUMBER_TYPES } from '../../../../globalConstants'
import FilterControl from './FilterControl'

const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Input = require('antd/lib/input')
const InputNumber = require('antd/lib/input-number')
const Form = require('antd/lib/form')
const FormItem = Form.Item

const styles = require('./filter.less')

interface IFilterPanelProps {
  filters: IFilterItem[]
  onGetOptions: (fromViewId, fromModelName, filterKey) => void
  filterOptions: {
    [filterKey: string]: string[]
  },
  onChange: (
    queryParams: {
      [itemId: number]: {
        params: Array<{ name: string, value: object }>
        filtes: string[]
      }
    }
  ) => void
}

export class FilterPanel extends React.Component<IFilterPanelProps & FormComponentProps, {}> {

  private change = (filter: IFilterItem, val) => {
    const queryParam = {}

    const { type, relatedViews } = filter
    Object.entries(relatedViews).forEach(([_, config]) => {
      const { items, isParam } = config
      if (items.length <= 0) { return }

      if (isParam) {
        const paramValue = this.getParamValue(type, config, val)
        items.forEach((itemId) => {
          if (!queryParam[itemId]) {
            queryParam[itemId] = {
              filters: [],
              params: []
            }
          }
          queryParam[itemId].params.push(paramValue)
        })
      } else {
        const filterValue = this.getModelValue(type, config, val)
        items.forEach((itemId) => {
          if (!queryParam[itemId]) {
            queryParam[itemId] = {
              filters: [],
              params: []
            }
          }
          queryParam[itemId].filters.push(filterValue)
        })
      }
    })

    const { onChange } = this.props
    onChange(queryParam)
  }

  private getParamValue = (type: FilterTypes, config: IFilterViewConfig, value) => {
    const { key } = config
    let param = []

    // FIXME 是否 wrap '' 的判断
    switch (type) {
      case FilterTypes.InputText:
      case FilterTypes.InputNumber:
      case FilterTypes.Select:
        param.push({ name: key, value })
        break
      case FilterTypes.NumberRange:
        if (value[0] || value[1]) {
          param = value.map((val) => ({ name: key, value: val }))
        }
        break
      case FilterTypes.MultiSelect:
        if (value.length) {
          param.push({ name: key, value: value.join(',') })
        }
        break
      case FilterTypes.CascadeSelect: // TODO
        break
      case FilterTypes.InputDate:
        param.push({ name: key, value: `'${moment(value).format('YYYY-MM-DD')}'` })
        break
      case FilterTypes.MultiDate:
        param.push({ name: key, value: value.split(',').map((v) => `'${v}'`).join(',') })
        break
      case FilterTypes.DateRange:
        if (value.length) {
          param.push(...value.map((v) => ({ name: key, value: `'${moment(v).format('YYYY-MM-DD')}'` })))
        }
        break
      case FilterTypes.Datetime:
        if (value) {
          param.push({ name: key, value: `'${moment(value).format('YYYY-MM-DD HH:mm:ss')}'` })
        }
        break
      case FilterTypes.DatetimeRange:
        if (value.length) {
          param.push(...value.map((v) => ({ name: key, value: `'${moment(v).format('YYYY-MM-DD HH:mm:ss')}'` })))
        }
        break
      default:
        const val = value.target.value.trim()
        if (val) {
          param.push({ name: key, value: `${val}` })
        }
        break
    }
    return param
  }

  private getModelValue = (type: FilterTypes, config: IFilterViewConfig, value) => {
    const { key, sqlType } = config
    const filters = []

    // @TODO Operators Feature
    switch (type) {
      case FilterTypes.InputText:
      case FilterTypes.InputNumber:
      case FilterTypes.Select:
        filters.push(`${key} = ${this.getValidValue(value, sqlType)}`)
        break
      case FilterTypes.NumberRange:
        if (!isNaN(value[0])) {
          filters.push(`${key} >= ${this.getValidValue(value[0], sqlType)}`)
        }
        if (!isNaN(value[1])) {
          filters.push(`${key} <= ${this.getValidValue(value[1], sqlType)}`)
        }
        break
      case FilterTypes.MultiSelect:
        if (value.length) {
          filters.push(`${key} in (${value.join(',')})`)
        }
        break
      case FilterTypes.CascadeSelect: // @TODO
        break
      case FilterTypes.InputDate:
        if (value) {
          filters.push(`${key} = ${this.getValidValue(moment(value).format('YYYY-MM-DD'), sqlType)}`)
        }
        break
      case FilterTypes.MultiDate:
        if (value) {
          filters.push(`${key} in (${value.split(',').map((val) => this.getValidValue(val, sqlType)).join(',')})`)
        }
        break
      case FilterTypes.DateRange:
        if (value.length) {
          filters.push(`${key} >= ${this.getValidValue(moment(value[0]).format('YYYY-MM-DD'), sqlType)}`)
          filters.push(`${key} <= ${this.getValidValue(moment(value[1]).format('YYYY-MM-DD'), sqlType)}`)
        }
        break
      case FilterTypes.Datetime:
        if (value) {
          filters.push(`${key} = ${this.getValidValue(moment(value).format('YYYY-MM-DD HH:mm:ss'), sqlType)}`)
        }
        break
      case FilterTypes.DatetimeRange:
        if (value.length) {
          filters.push(`${key} >= ${this.getValidValue(moment(value[0]).format('YYYY-MM-DD HH:mm:ss'), sqlType)}`)
          filters.push(`${key} <= ${this.getValidValue(moment(value[1]).format('YYYY-MM-DD HH:mm:ss'), sqlType)}`)
        }
        break
      default:
        const inputValue = value.target.value.trim()
        if (inputValue) {
          filters.push(`${key} = ${this.getValidValue(inputValue, sqlType)}`)
        }
        break
    }

    return filters
  }

  private getValidValue = (value, sqlType) => {
    return SQL_NUMBER_TYPES.indexOf(sqlType) >= 0 ? value : `'${value}'`
  }

  public render () {
    const { filters, onGetOptions, filterOptions, form } = this.props
    return (
      <Form className={styles.filterPanel}>
        <Row gutter={8}>
          {filters.map((f) => (
            <Col
              xl={3}
              lg={4}
              md={6}
              sm={12}
              key={f.key}
            >
              <FilterControl
                filter={f}
                onGetOptions={onGetOptions}
                currentOptions={filterOptions[f.key] || []}
                formToAppend={form}
                onChange={this.change}
              />
            </Col>
          ))}
        </Row>
      </Form>
    )
  }

}

export default Form.create()(FilterPanel)
