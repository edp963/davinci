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
import { defaultFilterControlGridProps, SHOULD_LOAD_OPTIONS } from './filterTypes'
import FilterControl from './FilterControl'
import { globalControlMigrationRecorder } from 'app/utils/migrationRecorders'

import { Row, Col, Form, Button } from 'antd'

const styles = require('./filter.less')

interface IFilterPanelProps {
  currentDashboard: any
  currentItems: any[]
  mapOptions: IMapControlOptions
  onGetOptions: OnGetControlOptions
  onChange: (controlRequestParamsByItem: IMapItemControlRequestParams) => void
  onSearch: (itemIds: number[]) => void
}

interface IFilterPanelStates {
  renderTree: IRenderTreeItem[],
  flatTree: {
    [key: string]: IRenderTreeItem
  },
  controlValues: {
    [key: string]: any
  },
  queryMode: GlobalControlQueryMode
}

export class FilterPanel extends Component<IFilterPanelProps & FormComponentProps, IFilterPanelStates> {

  public constructor (props: IFilterPanelProps & FormComponentProps) {
    super(props)
    this.state = {
      renderTree: [],
      flatTree: {},
      controlValues: {},
      queryMode: GlobalControlQueryMode.Immediately
    }
  }

  private controlRequestParamsByItem: {
    [itemId: number]: {
      [filterKey: string]: IControlRequestParams
    }
  } = {}

  public componentWillReceiveProps (nextProps: IFilterPanelProps & FormComponentProps) {
    const { currentDashboard, currentItems } = nextProps
    if (currentDashboard !== this.props.currentDashboard || currentItems !== this.props.currentItems) {
      this.initDerivedState(currentDashboard, currentItems)
    }
  }

  private initDerivedState = (currentDashboard, currentItems) => {
    if (currentDashboard) {
      const config = JSON.parse(currentDashboard.config || '{}')
      const globalControls = config.filters || []
      const queryMode = config.queryMode || GlobalControlQueryMode.Immediately

      const controlValues = {}

      this.controlRequestParamsByItem = {}

      const controls: IGlobalControl[] = globalControls.map((control) => {
        control = globalControlMigrationRecorder(control)
        const { relatedItems } = control
        Object.keys(relatedItems).forEach((itemId) => {
          if (!currentItems.find((ci) => ci.id === Number(itemId))) {
            delete relatedItems[itemId]
          }
        })

        const defaultFilterValue = deserializeDefaultValue(control)
        if (defaultFilterValue) {
          controlValues[control.key] = defaultFilterValue
          this.setControlRequestParams(control, defaultFilterValue, currentItems)
        }

        return control
      })

      const { renderTree, flatTree } = getControlRenderTree<IGlobalControl, IRenderTreeItem>(controls)

      Object.values(flatTree).forEach((control) => {
        if (SHOULD_LOAD_OPTIONS[control.type]) {
          this.loadOptions(control, flatTree, controlValues)
        }
      })

      this.setState({
        renderTree,
        flatTree,
        controlValues,
        queryMode
      })
    }
  }

  // save defaultFilterValue
  private setControlRequestParams = (control: IGlobalControl, val, currentItems, callback?) => {
    const { key, interactionType, relatedItems, relatedViews } = control

    currentItems.forEach((item) => {
      const { id } = item
      const relatedItem = relatedItems[id]
      if (relatedItem && relatedItem.checked) {
        const fields = relatedViews[relatedItem.viewId]
        if (callback) {
          callback(id)
        }
        if (!this.controlRequestParamsByItem[id]) {
          this.controlRequestParamsByItem[id] = {}
        }
        if (!this.controlRequestParamsByItem[id][key]) {
          this.controlRequestParamsByItem[id][key] = {
            variables: [],
            filters: []
          }
        }
        if (interactionType === 'column') {
          this.controlRequestParamsByItem[id][key].filters = getModelValue(control, fields as IControlRelatedField, val)
        } else {
          this.controlRequestParamsByItem[id][key].variables = getVariableValue(control, fields, val)
        }
      }
    })
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

  private change = (control: IGlobalControl, val, isInputChange?: boolean) => {

    const { currentItems, onChange } = this.props
    const { flatTree, queryMode } = this.state
    const { key } = control
    const childrenKeys = getAllChildren(key, flatTree)
    const relatedItemIds = []

    // console.log(control)
    // console.log(currentItems)
    const controlValues = {
      ...this.state.controlValues,
      [key]: val
    }

    if (childrenKeys.length) {
      childrenKeys.forEach((childKey) => {
        const child = flatTree[childKey]
        if (SHOULD_LOAD_OPTIONS[child.type]) {
          this.loadOptions(child, flatTree, controlValues)
        }
      })
    }

    this.setControlRequestParams(control, val, currentItems, (itemId) => {
      relatedItemIds.push(itemId)
    })

    this.setState({ controlValues })

    const controlRequestParamsByItem: IMapItemControlRequestParams = relatedItemIds.reduce((acc, itemId) => {
      acc[itemId] = Object.values(this.controlRequestParamsByItem[itemId]).reduce((filterValue, val) => {
        filterValue.variables = filterValue.variables.concat(val.variables)
        filterValue.filters = filterValue.filters.concat(val.filters)
        return filterValue
      }, {
        variables: [],
        filters: []
      })
      return acc
    }, {})

    onChange(controlRequestParamsByItem)

    if (queryMode === GlobalControlQueryMode.Immediately && !isInputChange) {
      this.search()
    }
  }

  private search = () => {
    const itemIds: number[] = Object.values(this.state.flatTree)
      .reduce((arr: number[], item) => {
        const { relatedItems } = item as IGlobalRenderTreeItem
        return arr.concat(
          Object.entries(relatedItems)
            .filter(([itemId, info]) => info.checked)
            .map(([itemId, info]) => Number(itemId))
        )
      }, [])
    this.props.onSearch(Array.from(new Set(itemIds)))
  }

  private reset = () => {
    this.props.form.resetFields()

    const { currentItems, onChange } = this.props
    const { flatTree } = this.state
    const formValues = this.props.form.getFieldsValue()

    Object.entries(formValues).forEach(([controlKey, value]) => {
      const control = flatTree[controlKey]
      this.setControlRequestParams(control as IGlobalRenderTreeItem, value, currentItems)
    })

    const controlRequestParamsByItem = Object
      .entries(this.controlRequestParamsByItem)
      .reduce((paramsByItem, [itemId, expsByControl]) => {
        paramsByItem[itemId] = Object
          .values(expsByControl)
          .reduce((params, exps) => {
            params.variables = params.variables.concat(exps.variables)
            params.filters = params.filters.concat(exps.filters)
            return params
          }, {
            variables: [],
            filters: []
          })
        return paramsByItem
      }, {})

    onChange(controlRequestParamsByItem)
  }

  private renderFilterControls = (renderTree: IRenderTreeItem[], parents?: IGlobalControl[]) => {
    const { form, mapOptions } = this.props
    const { controlValues } = this.state

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
      const controlGridProps = width
          ? {
              lg: width,
              md: width < 8 ? 12 : 24
            }
          : defaultFilterControlGridProps
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
    const panelClass = classnames({
      [styles.controlPanel]: true,
      [styles.empty]: !renderTree.length
    })
    return (
      <Form className={panelClass}>
        <div className={styles.controls}>
          <Row gutter={8}>
            {this.renderFilterControls(renderTree)}
          </Row>
        </div>
        {
          queryMode === GlobalControlQueryMode.Manually && (
            <div className={styles.actions}>
              <Button type="primary" icon="search" onClick={this.search}>查询</Button>
              <Button icon="reload" onClick={this.reset}>重置</Button>
            </div>
          )
        }
      </Form>
    )
  }

}

export default Form.create<IFilterPanelProps & FormComponentProps>()(FilterPanel)
