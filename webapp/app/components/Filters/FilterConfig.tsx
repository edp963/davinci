import React from 'react'
import { fromJS } from 'immutable'
import {
  getDefaultFilterItem, traverseFilters,
  OnGetFilterControlOptions, IMapFilterControlOptions, IFilterItem } from './'
import { FilterTypes} from './filterTypes'

import FilterList from './FilterList'
import FilterForm from './FilterForm'
import FilterValuePreview from './FilterValuePreview'
import DatePickerFormats from './datePickerFormats'

const styles = require('./filter.less')

interface IFilterConfigProps {
  views: any[]
  widgets: any[]
  items: any[]
  filters: any[]
  saving: boolean
  onOk: (filters: any[]) => void
  onGetOptions: OnGetFilterControlOptions
  mapOptions: IMapFilterControlOptions
}

interface IFilterConfigStates {
  localFilters: IFilterItem[]
  selectedFilter: IFilterItem,
  previewFilter: IFilterItem
}

export class FilterConfig extends React.Component<IFilterConfigProps, IFilterConfigStates> {

  private refHandlers: { filterForm: (ref: any) => void }
  private filterForm

  constructor (props) {
    super(props)
    this.state = {
      localFilters: [],
      selectedFilter: null,
      previewFilter: null
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
    const selectedFilter = localFilters[0]
    this.setState({
      localFilters,
      selectedFilter
    }, () => {
      if (selectedFilter) {
        this.filterForm.setFieldsValue(selectedFilter)
      }
    })
  }

  private selectFilter = (key: string) => {
    const { localFilters } = this.state
    traverseFilters(localFilters, key, (selectedFilter) => {
      this.setState({
        selectedFilter
      }, () => {
        this.filterForm.setFieldsValue(selectedFilter)
      })
    })
  }

  private addFilter = () => {
    const { localFilters } = this.state
    const newFilter: IFilterItem = getDefaultFilterItem()
    this.setState({
      localFilters: [...localFilters, newFilter],
      selectedFilter: newFilter
    }, () => {
      this.filterForm.setFieldsValue(newFilter)
    })
  }

  private deleteFilter = (key: string) => {
    const { localFilters, selectedFilter } = this.state
    // const newLocalFilters = localFilters.filter((f) => f.key !== key)

    traverseFilters(localFilters, key, (filterItem, idx, filterArr, parent) => {
      filterArr.splice(idx, 1)
      const newSelectedFilter = selectedFilter && (selectedFilter.key !== key)
        ? selectedFilter
        : parent
          ? filterArr.length
            ? filterArr[idx - 1]
            : parent
          : localFilters[idx - 1]

      this.setState({
        localFilters,
        selectedFilter: newSelectedFilter
      }, () => {
        if (newSelectedFilter) {
          this.filterForm.setFieldsValue(newSelectedFilter)
        }
      })
    })
  }

  private filtersChange = (filters: IFilterItem[]) => {
    this.setState({
      localFilters: filters
    })
  }

  private filterTypeChange = (key, filterType: FilterTypes) => {
    const { localFilters } = this.state
    traverseFilters(localFilters, key, (filterItem) => {
      filterItem.type = filterType
      if ([FilterTypes.Date, FilterTypes.DateRange].includes(filterType)) {
        filterItem.dateFormat = DatePickerFormats.Date
      }
      this.setState({
        localFilters
      })
    })
  }

  private filterItemNameChange = (key, name) => {
    const { localFilters } = this.state
    traverseFilters(localFilters, key, (filterItem) => {
      filterItem.name = name
      this.setState({
        localFilters
      })
    })
  }

  private filterMultipleSelectChange = (key, multiple) => {
    const { localFilters } = this.state
    traverseFilters(localFilters, key, (filterItem) => {
      filterItem.multiple = multiple
      this.setState({
        localFilters
      })
    })
  }

  private filterDateFormatChange = (key, dateFormat) => {
    const { localFilters } = this.state
    traverseFilters(localFilters, key, (filterItem) => {
      filterItem.dateFormat = dateFormat
      this.setState({
        localFilters
      })
    })
  }

  private filterItemSave = (filterItem) => {
    const { localFilters } = this.state
    traverseFilters(localFilters, filterItem.key, (originItem, idx, originFilterArr) => {
      originFilterArr.splice(idx, 1, {
        ...filterItem,
        ...originItem.children && {
          children: originItem.children
        }
      })
      this.setState({
        localFilters
      })
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

  private previewControl = (filter: IFilterItem) => {
    this.setState({
      previewFilter: filter
    })
  }

  public render () {
    const { views, widgets, items, mapOptions, onGetOptions } = this.props
    const { localFilters, selectedFilter, previewFilter } = this.state

    return (
      <div className={styles.filterConfig}>
        <div className={styles.left}>
          <FilterList
            list={localFilters}
            selectedFilter={selectedFilter}
            onSelectFilter={this.selectFilter}
            onAddFilter={this.addFilter}
            onDeleteFilter={this.deleteFilter}
            onFiltersChange={this.filtersChange}
          />
        </div>
        <div className={styles.center}>
          {
            selectedFilter && (
              <FilterForm
                views={views}
                widgets={widgets}
                items={items}
                filterItem={selectedFilter}
                onFilterTypeChange={this.filterTypeChange}
                onFilterItemNameChange={this.filterItemNameChange}
                onFilterMultipleSelectChange={this.filterMultipleSelectChange}
                onFilterDateFormatChange={this.filterDateFormatChange}
                onFilterItemSave={this.filterItemSave}
                onPreviewControl={this.previewControl}
                wrappedComponentRef={this.refHandlers.filterForm}
              />
            )
          }
          {/* <div className={styles.bottom}>
            {
              !previewFilter ? null : (
                <FilterValuePreview
                  filter={previewFilter}
                  currentOptions={mapOptions[previewFilter.key] || []}
                  onGetOptions={onGetOptions}
                />
              )
            }
          </div> */}
        </div>
      </div>
    )
  }
}

export default FilterConfig
