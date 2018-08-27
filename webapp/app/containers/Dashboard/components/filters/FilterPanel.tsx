import * as React from 'react'
import { FormComponentProps } from 'antd/lib/form/Form'
import { FilterTypes } from './filterTypes'
import FilterControl from './FilterControl'

const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Input = require('antd/lib/input')
const InputNumber = require('antd/lib/input-number')
const Form = require('antd/lib/form')
const FormItem = Form.Item

const styles = require('./filter.less')

interface IFilterPanelProps {
  filters: any[]
  onGetOptions: (fromViewId, fromFieldName, filterKey) => void
  filterOptions: object
}

export class FilterPanel extends React.Component<IFilterPanelProps & FormComponentProps, {}> {



  public render () {
    const { filters, onGetOptions, filterOptions, form } = this.props
    return (
      <Form className={styles.filterPanel}>
        <Row>
          {filters.map((f) => (
            <FilterControl
              key={f.key}
              filter={f}
              onGetOptions={onGetOptions}
              currentOptions={filterOptions[f.key] || []}
              formToAppend={form}
            />
          ))}
        </Row>
      </Form>
    )
  }

}

export default Form.create()(FilterPanel)
