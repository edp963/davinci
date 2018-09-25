import * as React from 'react'
import moment from 'moment'
import { FormComponentProps, WrappedFormUtils } from 'antd/lib/form/Form'
import { IFilterViewConfig, IFilterItem, IFilterValue, IFilterChangeParam } from './'
import { FilterTypes } from './filterTypes'
import { OperatorTypes } from 'utils/operatorTypes'
import { SQL_NUMBER_TYPES } from '../../globalConstants'
import FilterControl from './FilterControl'

const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Form = require('antd/lib/form')

const styles = require('./filter.less')

interface IFilterPanelProps {
  filters: IFilterItem[]
  onGetOptions: (
    filterKey: string,
    fromViewId: string,
    fromModel: string,
    parents: Array<{ column: string, value: string }>
  ) => void
  filterOptions: {
    [filterKey: string]: {
      [key: string]: Array<number | string>
    }
  },
  onChange: (
    queryParams: IFilterChangeParam,
    filterKey: string
  ) => void
}

export class FilterPanel extends React.Component<IFilterPanelProps & FormComponentProps> {

  private itemsFilterValues: {
    [itemId: number]: {
      [filterKey: string]: IFilterValue
    }
  } = {}

  private change = (filter: IFilterItem, val) => {
    const { key, type, relatedViews, operator } = filter
    const relatedItemIds = []
    Object.entries(relatedViews).forEach(([_, config]) => {
      const { items, isParam } = config
      if (items.length <= 0) { return }

      const filterValue = isParam ?
        this.getParamValue(type, config, val) : this.getModelValue(type, config, operator, val)

      items.forEach((itemId) => {
        relatedItemIds.push(itemId)
        if (!this.itemsFilterValues[itemId]) {
          this.itemsFilterValues[itemId] = {}
        }
        if (!this.itemsFilterValues[itemId][key]) {
          this.itemsFilterValues[itemId][key] = {
            params: [],
            filters: []
          }
        }
        if (isParam) {
          this.itemsFilterValues[itemId][key].params = filterValue
        } else {
          this.itemsFilterValues[itemId][key].filters = filterValue
        }
      })
    })

    const filterChangeParam: IFilterChangeParam = relatedItemIds.reduce((acc, itemId) => {
      acc[itemId] = Object.values(this.itemsFilterValues[itemId]).reduce((filterValue, val) => {
        filterValue.params.push(...val.params)
        filterValue.filters.push(...val.filters)
        return filterValue
      }, {
        params: [],
        filters: []
      })
      return acc
    }, {})

    const { onChange } = this.props
    onChange(filterChangeParam, key)
  }

  private getParamValue = (type: FilterTypes, config: IFilterViewConfig, value) => {
    const { key, sqlType } = config
    let param = []

    switch (type) {
      case FilterTypes.InputText:
      case FilterTypes.InputNumber:
      case FilterTypes.Select:
        if (value !== undefined) { param.push({ name: key, value: this.getValidValue(value, sqlType) }) }
        break
      case FilterTypes.NumberRange:
        param = value.filter((val) => val !== '').map((val) => ({ name: key, value: this.getValidValue(val, sqlType) }))
        break
      case FilterTypes.MultiSelect:
        if (value.length && value.length > 0) {
          param.push({ name: key, value: value.map((val) => this.getValidValue(val, sqlType)).join(',') })
        }
        break
      case FilterTypes.CascadeSelect: // TODO
        break
      case FilterTypes.InputDate:
        if (value) {
          param.push({ name: key, value: `'${moment(value).format('YYYY-MM-DD')}'` })
        }
        break
      case FilterTypes.MultiDate:
        if (value) {
          param.push({ name: key, value: value.split(',').map((v) => `'${v}'`).join(',') })
        }
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
          param.push({ name: key, value: this.getValidValue(val, sqlType) })
        }
        break
    }
    return param
  }

  private getModelValue = (type: FilterTypes, config: IFilterViewConfig, operator: OperatorTypes, value) => {
    const { key, sqlType } = config
    const filters = []

    switch (type) {
      case FilterTypes.InputText:
      case FilterTypes.InputNumber:
      case FilterTypes.Select:
        if (value !== undefined) { filters.push(`${key} ${operator} ${this.getValidValue(value, sqlType)}`) }
        break
      case FilterTypes.NumberRange:
        if (value[0] !== '' && !isNaN(value[0])) {
          filters.push(`${key} >= ${this.getValidValue(value[0], sqlType)}`)
        }
        if (value[1] !== '' && !isNaN(value[1])) {
          filters.push(`${key} <= ${this.getValidValue(value[1], sqlType)}`)
        }
        break
      case FilterTypes.MultiSelect:
        if (value.length && value.length > 0) {
          filters.push(`${key} ${operator} (${value.map((val) => this.getValidValue(val, sqlType)).join(',')})`)
        }
        break
      case FilterTypes.CascadeSelect: // @TODO
        break
      case FilterTypes.InputDate:
        if (value) {
          filters.push(`${key} ${operator} ${this.getValidValue(moment(value).format('YYYY-MM-DD'), sqlType)}`)
        }
        break
      case FilterTypes.MultiDate:
        if (value) {
          filters.push(`${key} ${operator} (${value.split(',').map((val) => this.getValidValue(val, sqlType)).join(',')})`)
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
          filters.push(`${key} ${operator} ${this.getValidValue(moment(value).format('YYYY-MM-DD HH:mm:ss'), sqlType)}`)
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
          filters.push(`${key} ${operator} ${this.getValidValue(inputValue, sqlType)}`)
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
                currentOptions={filterOptions[f.key] || {}}
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
