import * as React from 'react'
import { fromJS } from 'immutable'
import { uuid } from 'utils/util'
import { FilterTypes } from './filterTypes'
import FilterList from './FilterList'
import FilterForm from './FilterForm'
import FilterValuePreview from './FilterValuePreview'

const Button = require('antd/lib/button')
const Modal = require('antd/lib/modal')

const styles = require('./filter.less')

interface IFilterConfigProps {
  views: any[]
  widgets: any[]
  items: any[]
  filters: any[]
  onCancel: () => void
  onOk: (filters: any[]) => void
  onGetPreviewData: (viewId, fieldName, filterKey) => void
  previewData: object
}

interface IFilterConfigStates {
  hasEdited: boolean
  localFilters: any[]
  selectedFilter: any
}

export class FilterConfig extends React.Component<IFilterConfigProps, IFilterConfigStates> {

  private refHandlers: { filterForm: (ref: any) => void }
  private filterForm: any

  constructor (props) {
    super(props)
    this.state = {
      hasEdited: false,
      localFilters: [],
      selectedFilter: {}
    }
    this.refHandlers = {
      filterForm: (ref) => this.filterForm = ref
    }
  }

  public componentWillMount () {
    this.initState()
  }

  public componentWillReceiveProps (nextProps: IFilterConfigProps) {
    const { filters } = nextProps
    if (filters !== this.props.filters) {
      this.initState()
    }
  }

  private initState = () => {
    const { filters } = this.props
    const localFilters = fromJS(filters).toJS()
    this.setState({
      localFilters,
      selectedFilter: localFilters.length > 0 ? localFilters[0] : {}
    })
  }

  private selectFilter = (key) => {
    const { localFilters } = this.state
    const selectedFilter = localFilters.find((f) => f.key === key)
    this.setState({
      selectedFilter
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
      relatedViews: {}
    }
    this.setState({
      hasEdited: true,
      localFilters: [...localFilters, newFilter],
      selectedFilter: newFilter
    }, () => {
      this.filterForm.setFieldsValue(newFilter)
    })
  }

  private deleteFilter = (key) => {
    const { localFilters, selectedFilter } = this.state
    localFilters.splice(localFilters.findIndex((f) => f.key === key), 1)
    this.setState({
      hasEdited: true,
      localFilters,
      selectedFilter: (selectedFilter.key !== key) ?
        selectedFilter :
        (localFilters.length > 0 ? localFilters[0] : {})
    })
  }

  private filterTypeChange = () => {
    console.log('@TODO')
  }

  private filterItemNameChange = (key, name) => {
    const { localFilters } = this.state
    const filterItem = localFilters.find((f) => f.key === key)
    filterItem.name = name
    this.setState({
      hasEdited: true,
      localFilters
    })
  }

  private filterItemSave = (filterItem) => {
    const { localFilters } = this.state
    localFilters.splice(localFilters.findIndex((f) => f.key === filterItem.key), 1, filterItem)
    this.setState({
      localFilters
    })
  }

  private cancel = () => {
    const { onCancel } = this.props
    const { hasEdited } = this.state
    if (!hasEdited) {
      onCancel()
      return
    }
    Modal.confirm({
      content: '确认不保存当前全局筛选配置吗？',
      onOk: onCancel,
      onCancel: void 0
    })
  }

  private ok = () => {
    const { localFilters } = this.state
    if (localFilters.length > 0) {
      this.filterForm.saveFilterItem()
    }
    const { onOk } = this.props
    onOk([...localFilters])
  }

  public render () {
    const { views, widgets, items, onCancel, onGetPreviewData, previewData } = this.props
    const { localFilters, selectedFilter } = this.state
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
                  onGetPreviewData={onGetPreviewData}
                  wrappedComponentRef={this.refHandlers.filterForm}
                />
              )
            }
          </div>
          <div className={styles.right}>
            {
              !selectedFilter.key ? null : (
                <FilterValuePreview currentPreviewData={previewData[selectedFilter.key] || []} />
              )
            }
          </div>
        </div>
        <div className={`${styles.bottom} ant-modal-footer`}>
          <Button
            size="large"
            onClick={this.cancel}
          >
            取消
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={this.ok}
          >
            确认
          </Button>
        </div>
      </div>
    )
  }
}

export default FilterConfig
