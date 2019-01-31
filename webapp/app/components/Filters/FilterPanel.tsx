import React from 'react'
import { FormComponentProps } from 'antd/lib/form/Form'
import {
  IFilterViewConfig,
  IFilterItem,
  IFilterValue,
  IMapItemFilterValue,
  OnGetFilterControlOptions,
  OnFilterValueChange,
  IMapFilterControlOptions,
  getVariableValue,
  getModelValue,
  getValidValue,
  getDefaultValue
} from './'
import { FilterTypes, CascadeFilterTypes, defaultFilterControlGridProps } from './filterTypes'
import { OperatorTypes } from 'utils/operatorTypes'
import { SQL_NUMBER_TYPES } from '../../globalConstants'
import FilterControl from './FilterControl'

import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Form from 'antd/lib/form'
import Button from 'antd/lib/button'

const styles = require('./filter.less')

interface IFilterPanelProps {
  filters: IFilterItem[]
  mapOptions: IMapFilterControlOptions
  onGetOptions: OnGetFilterControlOptions
  onChange: OnFilterValueChange
}

export class FilterPanel extends React.Component<IFilterPanelProps & FormComponentProps, null> {
  private filterValues: {
    [key: string]: any
  } = {}
  private filterValuesByItem: {
    [itemId: number]: {
      [filterKey: string]: IFilterValue
    }
  } = {}

  public componentWillReceiveProps (nextProps: IFilterPanelProps & FormComponentProps) {
    const { filters } = this.props
    if (nextProps.filters !== filters) {
      this.initFilterValues(nextProps.filters)
    }
  }

  private initFilterValues = (filters: IFilterItem[]) => {
    this.filterValues = {}
    this.filterValuesByItem = {}
    filters.forEach((f) => {
      const defaultFilterValue = getDefaultValue(f)
      if (defaultFilterValue) {
        this.setFilterValues(f, defaultFilterValue)
      }
    })
  }

  private setFilterValues = (filter: IFilterItem, val, callback?) => {
    const { key, relatedViews, operator } = filter

    this.filterValues = {
      ...this.filterValues,
      [key]: Array.isArray(val)
        ? val.map((v) => getValidValue(v, filter.fromSqlType))
        : getValidValue(val, filter.fromSqlType)
    }

    Object.entries(relatedViews).forEach(([_, config]) => {
      const { items, isVariable } = config
      if (items.length <= 0) { return }

      const filterValue = isVariable ? getVariableValue(filter, config, val) : getModelValue(filter, config, operator, val)

      items.forEach((itemId) => {
        if (callback) {
          callback(itemId)
        }
        if (!this.filterValuesByItem[itemId]) {
          this.filterValuesByItem[itemId] = {}
        }
        if (!this.filterValuesByItem[itemId][key]) {
          this.filterValuesByItem[itemId][key] = {
            variables: [],
            filters: []
          }
        }
        if (isVariable) {
          this.filterValuesByItem[itemId][key].variables = filterValue
        } else {
          this.filterValuesByItem[itemId][key].filters = filterValue
        }
      })
    })
  }

  private change = (filter: IFilterItem, val) => {
    const { key } = filter
    const relatedItemIds = []

    this.setFilterValues(filter, val, (itemId) => {
      relatedItemIds.push(itemId)
    })

    const mapItemFilterValue: IMapItemFilterValue = relatedItemIds.reduce((acc, itemId) => {
      acc[itemId] = Object.values(this.filterValuesByItem[itemId]).reduce((filterValue, val) => {
        filterValue.variables.push(...val.variables)
        filterValue.filters.push(...val.filters)
        return filterValue
      }, {
        variables: [],
        filters: []
      })
      return acc
    }, {})

    this.props.onChange(mapItemFilterValue, key)
  }

  private renderFilterControls = (filters: IFilterItem[], parents?: IFilterItem[]) => {
    const { onGetOptions, mapOptions, form } = this.props
    let controls = []
    filters.forEach((filter) => {
      const parentValues = parents
        ? parents.reduce((values, p) => {
            const parentSelectedValue = this.filterValues[p.key]
            if (parentSelectedValue
                && !(Array.isArray(parentSelectedValue) && !parentSelectedValue.length)
                && CascadeFilterTypes.includes(p.type)) {
              values = values.concat({
                column: p.fromModel,
                value: parentSelectedValue
              })
            }
            return values
          }, [])
        : null
      const controlGridProps = filter.width
          ? {
              lg: filter.width,
              md: filter.width < 8 ? 12 : 24
            }
          : defaultFilterControlGridProps
      controls = controls.concat(
        <Col
          key={filter.key}
          {...controlGridProps}
        >
          <FilterControl
            formToAppend={form}
            filter={filter}
            currentOptions={mapOptions[filter.key] || []}
            parentValues={parentValues}
            onGetOptions={onGetOptions}
            onChange={this.change}
          />
        </Col>
      )
      if (filter.children) {
        controls = controls.concat(
          this.renderFilterControls(filter.children, parents ? parents.concat(filter) : [filter])
        )
      }
    })
    return controls
  }

  public render () {
    const { filters } = this.props

    return (
      <Form className={styles.filterPanel}>
        <Row gutter={8}>
          {this.renderFilterControls(filters)}
          {/* <Col span={4}>
            <Button type="primary" size="small" icon="search">查询</Button>
            <Button size="small" icon="reload">重置</Button>
          </Col> */}
        </Row>
      </Form>
    )
  }

}

export default Form.create()(FilterPanel)
