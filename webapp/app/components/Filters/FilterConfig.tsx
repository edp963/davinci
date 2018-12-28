import * as React from 'react'
import * as classnames from 'classnames'
import { fromJS } from 'immutable'
import { uuid } from 'utils/util'
import { OnGetFilterControlOptions, MapFilterControlOptions, OnFilterValueChange } from './'
import { FilterTypes, FilterTypesViewSetting, FilterTypesOperatorSetting } from './filterTypes'

import FilterList from './FilterList'
import FilterForm from './FilterForm'
import FilterValuePreview from './FilterValuePreview'

const styles = require('./filter.less')

interface IFilterConfigProps {
  views: any[]
  widgets: any[]
  items: any[]
  filters: any[]
  saving: boolean
  onOk: (filters: any[]) => void
  onGetOptions: OnGetFilterControlOptions
  mapOptions: MapFilterControlOptions
}

interface IFilterConfigStates {
  localFilters: any[]
  selectedFilter: any,
  previewFilter: {
    key: string
    viewId: string
    fromModel: string
  }
}

export class FilterConfig extends React.Component<IFilterConfigProps, IFilterConfigStates> {

  private refHandlers: { filterForm: (ref: any) => void }
  private filterForm

  constructor (props) {
    super(props)
    this.state = {
      localFilters: [],
      selectedFilter: {},
      previewFilter: {
        key: '',
        viewId: '',
        fromModel: ''
      }
    }
    this.refHandlers = {
      filterForm: (ref) => this.filterForm = ref
    }
  }

  public componentWillMount () {
    this.initState()
  }

  public componentWillReceiveProps (nextProps: IFilterConfigProps) {
    const { filters, saving } = nextProps
    if (filters !== this.props.filters) {
      this.initState()
    }
    if (saving !== this.props.saving) {
      this.ok()
    }
  }

  private initState = () => {
    const { filters } = this.props
    const localFilters = fromJS(filters).toJS()
    const selectedFilter = localFilters.length > 0 ? localFilters[0] : {}
    this.setState({
      localFilters,
      selectedFilter
    }, () => {
      if (!selectedFilter.key) { return }
      this.filterForm.setFieldsValue(selectedFilter)
    })
  }

  private selectFilter = (key) => {
    const { localFilters } = this.state
    const selectedFilter = localFilters.find((f) => f.key === key)
    this.setState({
      selectedFilter,
      previewFilter: {
        key: '',
        viewId: '',
        fromModel: ''
      }
    }, () => {
      this.filterForm.setFieldsValue(selectedFilter)
    })
  }

  private addFilter = () => {
    const { localFilters } = this.state
    const newFilter = {
      key: uuid(8, 16),
      name: '新建全局筛选',
      type: FilterTypes.InputText,
      operator: FilterTypesOperatorSetting[FilterTypes.InputText][0],
      relatedViews: {}
    }
    this.setState({
      localFilters: [...localFilters, newFilter],
      selectedFilter: newFilter
    }, () => {
      this.filterForm.setFieldsValue(newFilter)
    })
  }

  private deleteFilter = (key) => {
    const { localFilters, selectedFilter } = this.state
    const newLocalFilters = localFilters.filter((f) => f.key !== key)
    const newSelectedFilter = (selectedFilter.key !== key) ?
      selectedFilter : (newLocalFilters.length > 0 ? newLocalFilters[0] : {})
    this.setState({
      localFilters: newLocalFilters,
      selectedFilter: newSelectedFilter
    }, () => {
      if (!newSelectedFilter.key) { return }
      this.filterForm.setFieldsValue(newSelectedFilter)
    })
  }

  private filterTypeChange = (filterType: FilterTypes) => {
    this.setState({

    })
  }

  private filterItemNameChange = (key, name) => {
    const { localFilters } = this.state
    const filterItem = localFilters.find((f) => f.key === key)
    filterItem.name = name
    this.setState({
      localFilters
    })
  }

  private filterItemSave = (filterItem) => {
    const { localFilters } = this.state
    const filterIdx = localFilters.findIndex((f) => f.key === filterItem.key)
    if (filterIdx < 0) { return }
    localFilters.splice(filterIdx, 1, filterItem)
    this.setState({
      localFilters
    })
  }

  private ok = () => {
    const { localFilters } = this.state
    const { onOk } = this.props
    if (localFilters.length > 0) {
      this.filterForm.saveFilterItem((err) => {
        if (err) { return }
        onOk([...localFilters])
      })
    } else {
      onOk([])
    }
  }

  private getPreviewData = (filterKey, viewId, fieldName, parents) => {
    const { onGetOptions } = this.props
    this.setState({
      previewFilter: {
        key: filterKey,
        viewId,
        fromModel: fieldName
      }
    }, () => {
      onGetOptions(filterKey, viewId, fieldName, parents)
    })
  }

  public render () {
    const { views, widgets, items, mapOptions, onGetOptions } = this.props
    const { localFilters, selectedFilter } = this.state
    const { previewFilter: { key, fromModel } } = this.state

    return (
      <div className={styles.filterConfig}>
        <div className={styles.content}>
          <div className={styles.left}>
            <FilterList
              list={localFilters}
              onSelectFilter={this.selectFilter}
              onAddFilter={this.addFilter}
              onDeleteFilter={this.deleteFilter}
              selectedFilterKey={selectedFilter.key}
            />
          </div>
          <div className={styles.center}>
            {
              !selectedFilter.key ? null : (
                <FilterForm
                  views={views}
                  widgets={widgets}
                  items={items}
                  filterItem={selectedFilter}
                  onFilterTypeChange={this.filterTypeChange}
                  onFilterItemNameChange={this.filterItemNameChange}
                  onFilterItemSave={this.filterItemSave}
                  onGetPreviewData={this.getPreviewData}
                  wrappedComponentRef={this.refHandlers.filterForm}
                />
              )
            }
            <div className={styles.bottom}>
              {
                !selectedFilter.key ? null : (
                  <FilterValuePreview
                    filter={selectedFilter}
                    currentOptions={mapOptions[selectedFilter.key] || {}}
                    onGetOptions={onGetOptions}
                  />
                )
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default FilterConfig
