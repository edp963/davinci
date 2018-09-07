import * as React from 'react'
import * as classnames from 'classnames'
import { fromJS } from 'immutable'
import { uuid } from 'utils/util'
import { FilterTypes, FilterTypesViewSetting } from './filterTypes'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import FilterList from './FilterList'
import FilterForm from './FilterForm'
import FilterValuePreview from './FilterValuePreview'

const Button = require('antd/lib/button')
const Modal = require('antd/lib/modal')

const utilStyles = require('../../assets/less/util.less')
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
      hasEdited: false,
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
    const { filters } = nextProps
    if (filters !== this.props.filters) {
      this.initState()
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
      relatedViews: {}
    }
    this.setState({
      hasEdited: true,
      localFilters: [...localFilters, newFilter],
      selectedFilter: newFilter,
      showPreview: false
    }, () => {
      this.filterForm.setFieldsValue(newFilter)
    })
  }

  private deleteFilter = (key) => {
    const { localFilters, selectedFilter } = this.state
    localFilters.splice(localFilters.findIndex((f) => f.key === key), 1)
    const newSelectedFilter = (selectedFilter.key !== key) ?
      selectedFilter : (localFilters.length > 0 ? localFilters[0] : {})
    this.setState({
      hasEdited: true,
      localFilters,
      selectedFilter: newSelectedFilter,
      showPreview: FilterTypesViewSetting[newSelectedFilter.type]
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

  private getPreviewData = (viewId, fieldName, filterKey) => {
    const { onGetPreviewData } = this.props
    this.setState({
      previewFilter: {
        key: filterKey,
        viewId,
        fromModel: fieldName
      }
    }, () => {
      onGetPreviewData(viewId, fieldName, filterKey)
    })
  }

  public render () {
    const { views, widgets, items, onCancel, previewData } = this.props
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
