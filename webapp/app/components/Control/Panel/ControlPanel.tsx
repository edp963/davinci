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

import React, { PureComponent, GetDerivedStateFromProps } from 'react'
import {
  IGlobalControl,
  ILocalControl,
  IControlRelatedField,
  OnGetControlOptions,
  IMapControlOptions,
  IRenderTreeItem,
  IGlobalRenderTreeItem,
  ILocalRenderTreeItem,
  GlobalControlQueryMode
} from '../types'
import {
  getVariableValue,
  getModelValue,
  getAllChildren,
  getParents,
  getPanelRenderState
} from '../util'
import {
  SHOULD_LOAD_OPTIONS,
  CHANGE_IMMEDIATELY,
  ControlPanelTypes,
  ControlPanelLayoutTypes
} from '../constants'
import DashboardControlPanelLayout from './Layouts/Dashboard'
import DashboardItemControlPanelLayout from './Layouts/DashboardItem'
import FullScreenControlPanelLayout from './Layouts/FullScreen'

interface IControlPanelProps {
  controls: IGlobalControl[] | ILocalControl[]
  items: string
  type: ControlPanelTypes
  layoutType: ControlPanelLayoutTypes
  viewId?: number
  reload: boolean
  queryMode: GlobalControlQueryMode
  formValues: object
  mapOptions: IMapControlOptions
  onGetOptions: OnGetControlOptions
  onChange: (formValues: object) => void
  onSearch: (formValues?: object) => void
}

interface IControlPanelStates {
  renderTree: IRenderTreeItem[]
  flatTree: {
    [key: string]: IRenderTreeItem
  }
  defaultValues: object
  prevControls: IGlobalControl[] | ILocalControl[]
  prevItems: string
}

class ControlPanel extends PureComponent<IControlPanelProps, IControlPanelStates> {
  public state: IControlPanelStates = {
    renderTree: [],
    flatTree: {},
    defaultValues: {},
    prevControls: [],
    prevItems: ''
  }

  public static getDerivedStateFromProps: GetDerivedStateFromProps<
    IControlPanelProps,
    IControlPanelStates
  > = (props, state) => {
    const { type, controls, items } = props
    let nextState: Partial<IControlPanelStates> = {
      prevControls: controls,
      prevItems: items
    }

    if (state.prevControls !== controls || state.prevItems !== items) {
      nextState = {
        ...nextState,
        ...getPanelRenderState(type, controls, items)
      }
    }

    return nextState
  }

  public componentDidMount() {
    this.initFormValuesAndSelectOptions(
      this.props,
      this.state,
      Object.keys(this.props.formValues).length > 0
    )
  }

  public componentDidUpdate(prevProps: IControlPanelProps) {
    const { controls, reload, onSearch } = this.props
    const { defaultValues } = this.state

    if (prevProps.controls !== controls) {
      this.initFormValuesAndSelectOptions(this.props, this.state, false)
    }

    if (reload) {
      onSearch(defaultValues)
    }
  }

  private initFormValuesAndSelectOptions(
    props: IControlPanelProps,
    state: IControlPanelStates,
    initiated: boolean
  ) {
    const { formValues, onChange } = props
    const { flatTree, defaultValues } = state
    const initialFormValues = initiated ? formValues : defaultValues
    onChange(initialFormValues)
    Object.values(flatTree).forEach((control) => {
      if (SHOULD_LOAD_OPTIONS[control.type]) {
        this.loadOptions(control, flatTree, initialFormValues)
      }
    })
  }

  private loadOptions = (
    renderControl: IRenderTreeItem,
    flatTree: { [key: string]: IRenderTreeItem },
    controlValues: { [key: string]: any }
  ) => {
    const { type, viewId, items, onGetOptions } = this.props
    const {
      key,
      interactionType,
      parent,
      cache,
      expired,
      customOptions,
      options
    } = renderControl

    if (customOptions) {
      onGetOptions(
        key,
        true,
        options,
        type === ControlPanelTypes.Local ? Number(items) : void 0
      )
    } else {
      const parents = getParents<IGlobalControl | ILocalControl>(
        parent,
        flatTree
      )
      const requestParams = {}

      if (type === ControlPanelTypes.Global) {
        const { relatedViews } = renderControl as IGlobalRenderTreeItem

        Object.entries(relatedViews).forEach(([relatedViewId, fields]) => {
          let filters = []
          let variables = []

          parents.forEach((parentControl: IGlobalControl) => {
            const parentValue = controlValues[parentControl.key]
            Object.entries(parentControl.relatedViews).forEach(
              ([parentViewId, parentFields]) => {
                if (relatedViews[parentViewId]) {
                  if (parentControl.interactionType === 'column') {
                    filters = filters.concat(
                      getModelValue(
                        parentControl,
                        parentFields as IControlRelatedField,
                        parentValue
                      )
                    )
                  } else {
                    variables = variables.concat(
                      getVariableValue(parentControl, parentFields, parentValue)
                    )
                  }
                }
              }
            )
          })

          if (interactionType === 'column') {
            requestParams[relatedViewId] = {
              columns: [(fields as IControlRelatedField).name],
              filters,
              variables,
              cache,
              expired
            }
          } else {
            if ((fields as IControlRelatedField).optionsFromColumn) {
              requestParams[relatedViewId] = {
                columns: [(fields as IControlRelatedField).column],
                filters,
                variables,
                cache,
                expired
              }
            }
          }
        })

        if (Object.keys(requestParams).length) {
          onGetOptions(key, false, requestParams)
        }
      } else {
        const { fields } = renderControl as ILocalRenderTreeItem
        let filters = []
        let variables = []

        parents.forEach((parentControl: ILocalControl) => {
          const parentValue = controlValues[parentControl.key]
          if (parentControl.interactionType === 'column') {
            filters = filters.concat(
              getModelValue(
                parentControl,
                parentControl.fields as IControlRelatedField,
                parentValue
              )
            )
          } else {
            variables = variables.concat(
              getVariableValue(parentControl, parentControl.fields, parentValue)
            )
          }
        })

        if (interactionType === 'column') {
          requestParams[viewId] = {
            columns: [(fields as IControlRelatedField).name],
            filters,
            variables,
            cache,
            expired
          }
        } else {
          if ((fields as IControlRelatedField).optionsFromColumn) {
            requestParams[viewId] = {
              columns: [(fields as IControlRelatedField).column],
              filters,
              variables,
              cache,
              expired
            }
          }
        }

        if (Object.keys(requestParams).length) {
          onGetOptions(key, false, requestParams, Number(items))
        }
      }
    }
  }

  private change = (control: IGlobalControl | ILocalControl, val) => {
    const { queryMode, formValues, onChange, onSearch } = this.props
    const { flatTree } = this.state
    const { key, type } = control
    const childrenKeys = getAllChildren(key, flatTree)
    const controlValue = {
      [key]: val
    }
    const updatedFormValues = {
      ...formValues,
      ...controlValue
    }

    if (childrenKeys.length) {
      childrenKeys.forEach((childKey) => {
        const child = flatTree[childKey]
        if (SHOULD_LOAD_OPTIONS[child.type]) {
          this.loadOptions(child, flatTree, updatedFormValues)
        }
      })
    }

    onChange(updatedFormValues)

    if (
      queryMode === GlobalControlQueryMode.Immediately &&
      CHANGE_IMMEDIATELY[type]
    ) {
      onSearch(controlValue)
    }
  }

  private reset = () => {
    const { queryMode, onChange, onSearch } = this.props
    const { defaultValues } = this.state
    onChange(defaultValues)
    if (queryMode === GlobalControlQueryMode.Immediately) {
      onSearch(defaultValues)
    }
  }

  public render() {
    const { layoutType, queryMode, formValues, mapOptions, onSearch } = this.props

    const { renderTree } = this.state

    const layoutProps = {
      queryMode,
      renderTree,
      formValues,
      mapOptions,
      onChange: this.change,
      onSearch,
      onReset: this.reset
    }

    switch (layoutType) {
      case ControlPanelLayoutTypes.Dashboard:
        return <DashboardControlPanelLayout {...layoutProps} />
      case ControlPanelLayoutTypes.DashboardItem:
        return <DashboardItemControlPanelLayout {...layoutProps} />
      case ControlPanelLayoutTypes.Fullscreen:
        return <FullScreenControlPanelLayout {...layoutProps} />
      default:
        return null
    }
  }
}

export default ControlPanel
