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
  getParamValue,
  getModelValue,
  getValidValue
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

interface IFilterPanelStates {
  filterValues: {
    [key: string]: any
  }
}

export class FilterPanel extends React.Component<IFilterPanelProps & FormComponentProps, IFilterPanelStates> {
  constructor (props) {
    super(props)
    this.state = {
      filterValues: {}
    }
  }

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

      const filterValue = isParam ? getParamValue(filter, config, val) : getModelValue(filter, config, operator, val)

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

    const mapItemFilterValue: IMapItemFilterValue = relatedItemIds.reduce((acc, itemId) => {
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

    this.props.onChange(mapItemFilterValue, key)
    this.setState({
      filterValues: {
        ...this.state.filterValues,
        [key]: Array.isArray(val)
          ? val.map((v) => getValidValue(v, filter.fromSqlType))
          : getValidValue(val, filter.fromSqlType)
      }
    })
  }

  private renderFilterControls = (filters: IFilterItem[], parents?: IFilterItem[]) => {
    const { onGetOptions, mapOptions, form } = this.props
    const { filterValues } = this.state
    let controls = []
    filters.forEach((filter) => {
      const parentValues = parents
        ? parents.reduce((values, p) => {
            const parentSelectedValue = filterValues[p.key]
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
