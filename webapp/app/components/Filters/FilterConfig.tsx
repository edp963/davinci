import * as React from 'react'
import * as classnames from 'classnames'
import { fromJS } from 'immutable'
import { uuid } from 'utils/util'
import { FilterTypes, FilterTypesViewSetting, FilterTypesOperatorSetting } from './filterTypes'
import FilterList from './FilterList'
import FilterForm from './FilterForm'
import FilterValuePreview from './FilterValuePreview'

const utilStyles = require('../../assets/less/util.less')
const styles = require('./filter.less')

interface IFilterConfigProps {
  views: any[]
  widgets: any[]
  items: any[]
  filters: any[]
  saving: boolean
  onOk: (filters: any[]) => void
  onGetPreviewData: (
    filterKey: string,
    fromViewId: string,
    fromModel: string,
    parents: Array<{ column: string, value: string }>
  ) => void
  previewData: object
}

interface IFilterConfigStates {
  localFilters: any[]
  selectedFilter: any,
  showPreview: boolean,
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
      showPreview: false,
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
      selectedFilter,
      showPreview: FilterTypesViewSetting[selectedFilter.type]
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
      selectedFilter: newFilter,
      showPreview: false
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
      selectedFilter: newSelectedFilter,
      showPreview: FilterTypesViewSetting[newSelectedFilter.type]
    }, () => {
      if (!newSelectedFilter.key) { return }
      this.filterForm.setFieldsValue(newSelectedFilter)
    })
  }

  private filterTypeChange = (filterType: FilterTypes) => {
    this.setState({
      showPreview: FilterTypesViewSetting[filterType]
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
    const { onGetPreviewData } = this.props
    this.setState({
      previewFilter: {
        key: filterKey,
        viewId,
        fromModel: fieldName
      }
    }, () => {
      onGetPreviewData(filterKey, viewId, fieldName, parents)
    })
  }

  public render () {
    const { views, widgets, items, previewData } = this.props
    const { localFilters, selectedFilter, showPreview } = this.state
    const { previewFilter: { key, fromModel } } = this.state
    const currentPreviewData = previewData[key] ? (previewData[key][fromModel] || []) : []

    const previewClass = classnames({
      [styles.right]: true,
      [utilStyles.hide]: !showPreview
    })

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
          </div>
          <div className={previewClass}>
            {
              !selectedFilter.key ? null : (
                <FilterValuePreview currentPreviewData={currentPreviewData} />
              )
            }
          </div>
        </div>
      </div>
    )
  }
}

export default FilterConfig
