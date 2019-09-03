/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import React, { PureComponent, Suspense } from 'react'
import { Form, Button, Row, Col } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import { IQueryConditions } from '../Grid'
import {
  IRenderTreeItem,
  ILocalRenderTreeItem,
  IControlRequestParams,
  ILocalControl,
  IControlRelatedField,
  OnGetControlOptions,
  IMapControlOptions
} from 'app/components/Filters/types'
import {
  getVariableValue,
  getModelValue,
  deserializeDefaultValue,
  getControlRenderTree,
  getAllChildren,
  getParents
} from 'app/components/Filters/util'
import { SHOULD_LOAD_OPTIONS, defaultFilterControlGridProps } from 'app/components/Filters/filterTypes'
import FilterControl from 'app/components/Filters/FilterControl'
import { localControlMigrationRecorder } from 'app/utils/migrationRecorders'

const styles = require('../Dashboard.less')

interface IDashboardItemControlFormProps {
  viewId: number
  controls: ILocalControl[]
  mapOptions: IMapControlOptions
  onGetOptions: OnGetControlOptions
  onSearch: (queayConditions: Partial<IQueryConditions>) => void
  onHide: () => void
}

interface IDashboardItemControlFormStates {
  renderTree: IRenderTreeItem[],
  flatTree: {
    [key: string]: IRenderTreeItem
  },
  controlValues: {
    [key: string]: any
  }
}

export class DashboardItemControlForm extends PureComponent<IDashboardItemControlFormProps & FormComponentProps, IDashboardItemControlFormStates> {

  constructor (props) {
    super(props)
    this.state = {
      renderTree: [],
      flatTree: {},
      controlValues: {}
    }
  }

  private controlRequestParams: {
    [filterKey: string]: IControlRequestParams
  } = {}

  public componentWillMount () {
    this.initDerivedState(this.props.controls)
  }

  public componentWillReceiveProps (nextProps) {
    const { controls } = this.props
    if (nextProps.controls !== controls) {
      this.initDerivedState(nextProps.controls)
    }
  }

  private initDerivedState = (controls: ILocalControl[]) => {
    const controlValues = {}

    this.controlRequestParams = {}

    const replica = controls.map((control) => {
      control = localControlMigrationRecorder(control)
      const defaultFilterValue = deserializeDefaultValue(control)
      if (defaultFilterValue) {
        controlValues[control.key] = defaultFilterValue
        this.setControlRequestParams(control, defaultFilterValue)
      }
      return {...control}
    })

    const { renderTree, flatTree } = getControlRenderTree<ILocalControl, IRenderTreeItem>(replica)

    Object.values(flatTree).forEach((control) => {
      if (SHOULD_LOAD_OPTIONS[control.type]) {
        this.loadOptions(control, flatTree, controlValues)
      }
    })

    this.setState({
      renderTree,
      flatTree,
      controlValues
    })
  }

  private setControlRequestParams = (control: ILocalControl, val) => {
    const { key, interactionType, fields } = control

    if (!this.controlRequestParams[key]) {
      this.controlRequestParams[key] = {
        variables: [],
        filters: []
      }
    }
    if (interactionType === 'column') {
      this.controlRequestParams[key].filters = getModelValue(control, fields as IControlRelatedField, val)
    } else {
      this.controlRequestParams[key].variables = getVariableValue(control, fields, val)
    }
  }

  private loadOptions = (
    renderControl: IRenderTreeItem,
    flatTree: { [key: string]: IRenderTreeItem },
    controlValues: { [key: string]: any }
  ) => {
    const { viewId, onGetOptions } = this.props
    const {
      key,
      interactionType,
      fields,
      parent,
      cache,
      expired,
      customOptions,
      options
    } = renderControl as ILocalRenderTreeItem
    if (customOptions) {
      onGetOptions(key, true, options)
    } else {
      const parents = getParents<ILocalControl>(parent, flatTree)
      let filters = []
      let variables = []

      parents.forEach((parentControl) => {
        const parentValue = controlValues[parentControl.key]
        if (parentControl.interactionType === 'column') {
          // get filters
          filters = filters.concat(getModelValue(parentControl, parentControl.fields as IControlRelatedField, parentValue))
        } else {
          variables = variables.concat(getVariableValue(parentControl, parentControl.fields, parentValue))
        }
      })

      const columns = interactionType === 'column'
        ? [(fields as IControlRelatedField).name]
        : (fields as IControlRelatedField).optionsFromColumn
          ? [(fields as IControlRelatedField).column]
          : void 0

      if (columns) {
        onGetOptions(key, false, {
          [viewId]: {
            columns,
            filters,
            variables,
            cache,
            expired
          }
        })
      }
    }
  }

  private change = (control: ILocalControl, val) => {
    const { flatTree } = this.state
    const { key } = control
    const childrenKeys = getAllChildren(key, flatTree)

    const controlValues = {
      ...this.state.controlValues,
      [key]: val
    }

    this.setControlRequestParams(control, val)

    if (childrenKeys.length) {
      childrenKeys.forEach((childKey) => {
        const child = flatTree[childKey]
        if (SHOULD_LOAD_OPTIONS[child.type]) {
          this.loadOptions(child, flatTree, controlValues)
        }
      })
    }

    this.setState({ controlValues })
  }

  private search = () => {
    const { onSearch, onHide } = this.props
    const { flatTree } = this.state
    const formValues = this.props.form.getFieldsValue()

    Object.entries(formValues).forEach(([controlKey, value]) => {
      const control = flatTree[controlKey]
      this.setControlRequestParams(control as ILocalRenderTreeItem, value)
    })

    const queryConditions = Object.values(this.controlRequestParams).reduce((filterValue, val) => {
      filterValue.variables = filterValue.variables.concat(val.variables)
      filterValue.tempFilters = filterValue.tempFilters.concat(val.filters)
      return filterValue
    }, {
      variables: [],
      tempFilters: []
    })
    onSearch({ ...queryConditions })

    onHide()

  }

  private renderFilterControls = (renderTree: IRenderTreeItem[], parents?: ILocalControl[]) => {
    const { form, mapOptions } = this.props
    const { controlValues } = this.state

    let components = []

    renderTree.forEach((control) => {
      const { key, width, children, ...rest } = control as ILocalRenderTreeItem
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
    const { renderTree } = this.state

    return (
      <Form className={styles.controlForm}>
        <Row gutter={10}>
          <Suspense fallback={null}>
            {this.renderFilterControls(renderTree)}
          </Suspense>
        </Row>
        <Row className={styles.buttonRow}>
          <Col span={24}>
            <Button type="primary" onClick={this.search}>查询</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create<IDashboardItemControlFormProps & FormComponentProps>()(DashboardItemControlForm)
