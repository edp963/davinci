import React, { Component } from 'react'
import classnames from 'classnames'
import { FormComponentProps } from 'antd/lib/form/Form'
import {
  IGlobalControl,
  IControlRelatedField,
  IControlRequestParams,
  IMapItemControlRequestParams,
  OnGetControlOptions,
  IMapControlOptions,
  IRenderTreeItem,
  IGlobalRenderTreeItem,
  GlobalControlQueryMode
} from './types'
import {
  getVariableValue,
  getModelValue,
  deserializeDefaultValue,
  getControlRenderTree,
  getAllChildren,
  getParents
} from './util'
import { defaultFilterControlGridProps, SHOULD_LOAD_OPTIONS, fullScreenGlobalControlGridProps } from './filterTypes'
import FilterControl from './FilterControl'
import { globalControlMigrationRecorder } from 'app/utils/migrationRecorders'

import { Row, Col, Form, Button } from 'antd'

const styles = require('./filter.less')

interface IFilterPanelProps extends FormComponentProps {
  currentDashboard: any
  currentItems: any[]
  mapOptions: IMapControlOptions
  onGetOptions: OnGetControlOptions
  onSearch: (requestParamsByItem: IMapItemControlRequestParams) => void
  isFullScreen?: boolean
}

interface IFilterPanelStates {
  renderTree: IRenderTreeItem[],
  flatTree: {
    [key: string]: IRenderTreeItem
  },
  queryMode: GlobalControlQueryMode
}

export class FilterPanel extends Component<IFilterPanelProps, IFilterPanelStates> {

  public constructor (props: IFilterPanelProps) {
    super(props)
    this.state = {
      renderTree: [],
      flatTree: {},
      queryMode: GlobalControlQueryMode.Immediately
    }
  }

  public componentDidMount () {
    const { currentDashboard } = this.props
    if (currentDashboard && currentDashboard.id) {
      this.initDerivedState(this.props, true)
    }
  }

  public componentWillReceiveProps (nextProps: IFilterPanelProps) {
    const { currentDashboard, currentItems } = nextProps
    if (currentDashboard !== this.props.currentDashboard
        || this.dashboardItemsChange(currentItems, this.props.currentItems)) {
      const isCurrentDashboardUpdated = this.props.currentDashboard && this.props.currentDashboard.id === (currentDashboard && currentDashboard.id)
      this.initDerivedState(nextProps, isCurrentDashboardUpdated)
    }
  }

  private dashboardItemsChange = (currentItems, previousItems) => {
    if (currentItems && previousItems) {
      const currentItemIds = currentItems.map((item) => item.id).sort().join(',')
      const previousItemIds = previousItems.map((item) => item.id).sort().join(',')
      return !(currentItems.length === previousItems.length && currentItemIds === previousItemIds)
    }
    return false
  }

  private initDerivedState = (props: IFilterPanelProps, isCurrentDashboardUpdated) => {
    const { currentDashboard, currentItems } = props
    if (currentDashboard) {
      this.props.form.resetFields()

      const config = JSON.parse(currentDashboard.config || '{}')
      const globalControls = config.filters || []
      const queryMode = config.queryMode || GlobalControlQueryMode.Immediately

      const controls: IGlobalControl[] = []
      const defaultValues = {}

      globalControls.forEach((control) => {
        control = globalControlMigrationRecorder(control)
        const { relatedItems } = control
        Object.keys(relatedItems).forEach((itemId) => {
          if (!currentItems.find((ci) => ci.id === Number(itemId))) {
            delete relatedItems[itemId]
          }
        })

        const defaultFilterValue = deserializeDefaultValue(control)
        if (defaultFilterValue) {
          defaultValues[control.key] = defaultFilterValue
        }

        controls.push(control)
      })

      const { renderTree, flatTree } = getControlRenderTree<IGlobalControl, IRenderTreeItem>(controls)
      Object.values(flatTree).forEach((control) => {
        if (SHOULD_LOAD_OPTIONS[control.type]) {
          this.loadOptions(control, flatTree, defaultValues)
        }
      })

      this.setState({
        renderTree,
        flatTree,
        queryMode
      }, () => {
        if (isCurrentDashboardUpdated) {
          this.search(props.form.getFieldsValue(), props)
        }
      })
    }
  }

  private loadOptions = (
    renderControl: IRenderTreeItem,
    flatTree: { [key: string]: IRenderTreeItem },
    controlValues: { [key: string]: any }
  ) => {
    const { onGetOptions } = this.props
    const {
      key,
      interactionType,
      relatedViews,
      parent,
      cache,
      expired,
      customOptions,
      options
    } = renderControl as IGlobalRenderTreeItem

    if (customOptions) {
      onGetOptions(key, true, options)
    } else {
      const parents = getParents<IGlobalControl>(parent, flatTree)

      const requestParams = Object.entries(relatedViews).reduce((obj, [viewId, fields]) => {
        let filters = []
        let variables = []

        parents.forEach((parentControl) => {
          const parentValue = controlValues[parentControl.key]
          Object.entries(parentControl.relatedViews).forEach(([parentViewId, parentFields]) => {
            if (relatedViews[parentViewId]) {
              if (parentControl.interactionType === 'column') {
                filters = filters.concat(getModelValue(parentControl, parentFields as IControlRelatedField, parentValue))
              } else {
                variables = variables.concat(getVariableValue(parentControl, parentFields, parentValue))
              }
            }
          })
        })

        if (interactionType === 'column') {
          obj[viewId] = {
            columns: [(fields as IControlRelatedField).name],
            filters,
            variables,
            cache,
            expired
          }
        } else {
          if ((fields as IControlRelatedField).optionsFromColumn) {
            obj[viewId] = {
              columns: [(fields as IControlRelatedField).column],
              filters,
              variables,
              cache,
              expired
            }
          }
        }

        return obj
      }, {})

      if (Object.keys(requestParams).length) {
        onGetOptions(key, false, requestParams)
      }
    }
  }

  private change = (control: IGlobalControl, val) => {
    const { form } = this.props
    const { flatTree, queryMode } = this.state
    const { key } = control
    const childrenKeys = getAllChildren(key, flatTree)

    const controlValue = {
      [key]: val
    }

    if (childrenKeys.length) {
      childrenKeys.forEach((childKey) => {
        const child = flatTree[childKey]
        if (SHOULD_LOAD_OPTIONS[child.type]) {
          this.loadOptions(child, flatTree, {
            ...form.getFieldsValue(),
            ...controlValue
          })
        }
      })
    }

    if (queryMode === GlobalControlQueryMode.Immediately) {
      this.search(controlValue)
    }
  }

  private search = (changedFormValues, props: IFilterPanelProps = this.props) => {
    const { onSearch, form } = props
    const { flatTree } = this.state
    const allFormValues = form.getFieldsValue()

    const changedFormValuesRelatedItems = Object.keys(changedFormValues)
      .reduce((items, key) => {
        const { relatedItems } = flatTree[key] as IGlobalRenderTreeItem
        const checkedItems = Object.entries(relatedItems)
          .filter(([itemId, config]) => config.checked)
          .map(([itemId]) => itemId)

        return Array.from(new Set([
          ...items,
          ...checkedItems
        ]))
      }, [])

    // get other values that have affected the dashboard items associated with this search
    if (this.partialFormValuesChanged(changedFormValues, allFormValues)) {
      const changedFormValuesRelatedItemsRelatedValues = Object.entries(allFormValues)
        .reduce((values, [key, value]) => {
          if (!changedFormValues.hasOwnProperty(key)) {
            const { relatedItems } = flatTree[key] as IGlobalRenderTreeItem
            const checkedItems = Object.entries(relatedItems)
              .filter(([itemId, config]) => config.checked)
              .map(([itemId]) => itemId)

            if (checkedItems.some(
              (itemId) => changedFormValuesRelatedItems.includes(itemId)
            )) {
              values[key] = value
            }
          }
          return values
        }, {})

      changedFormValues = {
        ...changedFormValues,
        ...changedFormValuesRelatedItemsRelatedValues
      }
    }

    const requestParamsByItem: IMapItemControlRequestParams = {}

    changedFormValuesRelatedItems.forEach((itemId) => {
      Object.entries(changedFormValues).forEach(([key, value]) => {
        const control = flatTree[key] as IGlobalRenderTreeItem
        const { interactionType, relatedViews, relatedItems} = control
        const relatedItem = relatedItems[itemId]

        if (relatedItem && relatedItem.checked) {
          const fields = relatedViews[relatedItem.viewId]
          if (!requestParamsByItem[itemId]) {
            requestParamsByItem[itemId] = {
              variables: [],
              filters: []
            }
          }
          if (interactionType === 'column') {
            const controlFilters = getModelValue(control, fields as IControlRelatedField, value)
            requestParamsByItem[itemId].filters = requestParamsByItem[itemId].filters.concat(controlFilters)
          } else {
            const controlVariables = getVariableValue(control, fields, value)
            requestParamsByItem[itemId].variables = requestParamsByItem[itemId].variables.concat(controlVariables)
          }
        }
      })
    })

    onSearch(requestParamsByItem)
  }

  private partialFormValuesChanged = (changedValues, allValues) => {
    return Object.keys(changedValues).sort().join(',')
      !== Object.keys(allValues).sort().join(',')
  }

  private manualSearch = () => {
    this.search(this.props.form.getFieldsValue())
  }

  private reset = () => {
    this.props.form.resetFields()
    if (this.state.queryMode === GlobalControlQueryMode.Immediately) {
      const formValues = this.props.form.getFieldsValue()
      this.search(formValues)
    }
  }

  private renderFilterControls = (renderTree: IRenderTreeItem[], parents?: IGlobalControl[]) => {
    const { form, mapOptions, isFullScreen } = this.props
    const controlValues = form.getFieldsValue()

    let components = []

    renderTree.forEach((control) => {
      const { key, width, children, ...rest } = control as IGlobalRenderTreeItem
      const parentsInfo = parents
        ? parents.reduce((values, parentControl) => {
            const parentSelectedValue = controlValues[parentControl.key]
            if (parentSelectedValue && !(Array.isArray(parentSelectedValue) && !parentSelectedValue.length)) {
              values = values.concat({
                control: parentControl,
                value: parentSelectedValue
              })
            }
            return values
          }, [])
        : null
      let controlGridProps = width
          ? {
              lg: width,
              md: width < 8 ? 12 : 24
            }
          : defaultFilterControlGridProps
      if (isFullScreen) {
        controlGridProps = fullScreenGlobalControlGridProps
      }
      components = components.concat(
        <Col
          key={key}
          {...controlGridProps}
        >
          <FilterControl
            form={form}
            control={control}
            currentOptions={mapOptions[key] || []}
            parentsInfo={parentsInfo}
            onChange={this.change}
          />
        </Col>
      )
      if (children) {
        const controlWithOutChildren = { key, width, ...rest }
        components = components.concat(
          this.renderFilterControls(children, parents ? parents.concat(controlWithOutChildren) : [controlWithOutChildren])
        )
      }
    })
    return components
  }

  public render () {
    const { renderTree, queryMode } = this.state
    const { isFullScreen } = this.props
    const panelClass = classnames({
      [styles.controlPanel]: true,
      [styles.empty]: !renderTree.length,
      [styles.flexColumn]: isFullScreen
    })

    const controlClass = classnames({
      [styles.wfull]: isFullScreen,
      [styles.controls]: true
    })

    const actionClass = classnames({
      [styles.actions]: true,
      [styles.flexEnd]: isFullScreen,
      [styles.mt16]: isFullScreen
    })

    return (
      <Form className={panelClass}>
        <div className={controlClass}>
          <Row gutter={8}>
            {this.renderFilterControls(renderTree)}
          </Row>
        </div>
        {
          queryMode === GlobalControlQueryMode.Manually && (
            <div className={actionClass}>
              <Button type="primary" icon="search" onClick={this.manualSearch}>查询</Button>
              <Button icon="reload" onClick={this.reset}>重置</Button>
            </div>
          )
        }
      </Form>
    )
  }

}

export default Form.create<IFilterPanelProps>()(FilterPanel)
