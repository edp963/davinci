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

import React, { createRef } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import {
  getDefaultFilterItem,
  OnGetControlOptions,
  IMapControlOptions,
  IGlobalControl,
  IGlobalControlRelatedItem,
  InteractionType,
  IModel,
  IModelItem,
  IGlobalControlRelatedField
} from '..'
import { FilterTypes, IS_RANGE_TYPE} from '../filterTypes'

import FilterList from './FilterList'
import FilterFormWithRedux, { FilterForm } from './FilterForm'
import RelatedInfoSelectors from './RelatedInfoSelectors'
import { Button, Modal } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import { ICurrentDashboard } from '../../../containers/Dashboard'
import { setControlFormValues } from '../../../containers/Dashboard/actions'

const styles = require('../filter.less')

export interface IRelatedItemSource extends IGlobalControlRelatedItem {
  id: number
  name: string
}

export interface IRelatedViewSource {
  id: number
  name: string
  model: IModelItem[]
  variables: string[]
  fields: IGlobalControlRelatedField | IGlobalControlRelatedField[]
}

interface IGlobalControlConfigProps {
  currentDashboard: ICurrentDashboard
  currentItems: any[]
  views: any[]
  widgets: any[]
  visible: boolean
  loading: boolean
  mapOptions: IMapControlOptions
  onCancel: () => void
  onSave: (filterItems: any[]) => void
  onGetOptions: OnGetControlOptions
  onSetControlFormValues: (values) => void
}

interface IGlobalControlConfigStates {
  controls: IGlobalControl[]
  selected: IGlobalControl
  itemSelectorSource: IRelatedItemSource[]
  viewSelectorSource: IRelatedViewSource[]
}

export class GlobalControlConfig extends React.Component<IGlobalControlConfigProps, IGlobalControlConfigStates> {

  constructor (props) {
    super(props)
    this.state = {
      controls: [],
      selected: null,
      itemSelectorSource: [],
      viewSelectorSource: []
    }
  }

  private filterForm = createRef<FilterForm>()

  public componentWillReceiveProps (nextProps: IGlobalControlConfigProps) {
    const { currentDashboard, currentItems, widgets, views, visible } = nextProps
    if (currentDashboard !== this.props.currentDashboard
        || currentItems !== this.props.currentItems
        || visible && !this.props.visible) {
      this.initDerivedState(currentDashboard, currentItems, widgets, views)
    }
  }

  private initDerivedState = (currentDashboard, currentItems, widgets, views) => {
    if (currentDashboard) {
      const config = JSON.parse(currentDashboard.config || '{}')
      const globalControls = config.filters || []

      let selected
      const controls =  globalControls.map((control) => {
        const { relatedItems } = control
        Object.keys(relatedItems).forEach((itemId) => {
          if (!currentItems.find((ci) => ci.id === Number(itemId))) {
            delete relatedItems[itemId]
          }
        })

        if (!selected && !control.parent) {
          selected = control
        }

        return control
      })

      this.setState({
        controls,
        selected
      })
      this.setRelatedInfo(selected, currentItems, widgets, views)
      this.setFormData(selected)
    }
  }

  private setRelatedInfo = (control: IGlobalControl, items, widgets, views) => {
    if (control) {
      const { relatedItems } = control

      const itemSelectorSource: IRelatedItemSource[] = items.map((i) => {
        const widget = widgets.find((w) => w.id === i.widgetId)
        return {
          id: i.id,
          name: widget.name,
          viewId: widget.viewId,
          checked: relatedItems[i.id] ? relatedItems[i.id].checked : false
        }
      })
      const viewSelectorSource = this.getViewSelectorSource(itemSelectorSource, control, views)

      this.setState({
        itemSelectorSource,
        viewSelectorSource
      })
    }
  }

  private getViewSelectorSource = (itemSelectorSource: IRelatedItemSource[], control: IGlobalControl, views) => {
    const { relatedViews, type, interactionType } = control
    const selectedItemRelatedViews = itemSelectorSource
      .filter((s) => s.checked)
      .reduce((viewObj, itemSource) => {
        if (!viewObj[itemSource.viewId]) {
          viewObj[itemSource.viewId] = views.find((v) => v.id === itemSource.viewId)
        }
        return viewObj
      }, {})
    return Object.entries(selectedItemRelatedViews)
      .map(([viewId, view]) => ({
        id: Number(viewId),
        name: view.name,
        ...this.getRelatedViewInfo(relatedViews, view, type, interactionType)
      }))
  }

  private getRelatedViewInfo = (
    relatedViews: {
      [key: string]: IGlobalControlRelatedField | IGlobalControlRelatedField[]
    },
    view,
    type: FilterTypes,
    interactionType: InteractionType
  ): {
    model: IModelItem[],
    variables: string[],
    fields: IGlobalControlRelatedField | IGlobalControlRelatedField[]
  } => {
    const varReg = /query@var\s+\$(\w+)\$/g
    const model = Object.entries(JSON.parse(view.model))
      .filter(([k, v]: [string, IModelItem]) => v.modelType === 'category')
      .map(([k, v]: [string, IModelItem]) => ({
        name: k,
        ...v
      }))
    const variables = (view.sql.match(varReg) || []).map((qv) => qv.substring(qv.indexOf('$') + 1, qv.length - 1))
    const fields = relatedViews[view.id]

    if (fields) {
      return {
        model,
        variables,
        fields
      }
    } else {
      if (interactionType === 'column') {
        return {
          model,
          variables,
          fields: model.length
            ? {
              name: model[0].name,
              sqlType: model[0].sqlType
            }
            : void 0
        }
      } else {
        return {
          model,
          variables,
          fields: variables.length
            ? IS_RANGE_TYPE[type]
              ? [{
                name: variables[0],
                sqlType: ''
              }]
              : {
                name: variables[0],
                sqlType: ''
              }
            : IS_RANGE_TYPE[type] ? [] : void 0
        }
      }
    }
  }

  private setFormData = (control: IGlobalControl) => {
    if (control) {
      const { type, interactionType, defaultValue, relatedItems, relatedViews, ...rest } = control
      const isControlDateType = [FilterTypes.Date, FilterTypes.DateRange].includes(type)
      const fieldsValue = {
        type,
        defaultValue: isControlDateType && defaultValue
          ? moment(defaultValue)
          : defaultValue,
        ...rest
      }
      this.props.onSetControlFormValues(fieldsValue)
    } else {
      this.props.onSetControlFormValues(null)
    }
  }

  private selectFilter = (key: string) => {
    const { currentItems, widgets, views } = this.props

    this.getCachedFormValues((err, controls) => {
      if (err) { return }
      const selected = controls.find((c) => c.key === key)
      this.setState({
        selected,
        controls
      })
      this.setRelatedInfo(selected, currentItems, widgets, views)
      this.setFormData(selected)
    })
  }

  private addFilter = () => {
    const { currentItems, widgets, views } = this.props
    const { controls, selected } = this.state
    const newFilter: IGlobalControl = getDefaultFilterItem()

    if (selected) {
      this.getCachedFormValues((err, cachedControls) => {
        if (err) { return }
        this.setState({
          controls: [...cachedControls, newFilter],
          selected: newFilter
        })
        this.setRelatedInfo(newFilter, currentItems, widgets, views)
        this.setFormData(newFilter)
      })
    } else {
      this.setState({
        controls: [...controls, newFilter],
        selected: newFilter
      })
      this.setRelatedInfo(newFilter, currentItems, widgets, views)
      this.setFormData(newFilter)
    }
  }

  private deleteFilter = (keys: string[], reselectedKey: string) => {
    const { currentItems, widgets, views } = this.props
    const { controls } = this.state

    const reselected = reselectedKey
      ? controls.find((c) => c.key === reselectedKey)
      : null

    this.setState({
      controls: controls.filter((c) => !keys.includes(c.key)),
      selected: reselected
    })
    this.setRelatedInfo(reselected, currentItems, widgets, views)
    this.setFormData(reselected)
  }

  private changeParent = (key: string, parentKey: string, type: string , dropNextKey?: string) => {
    let dragged
    let changedControls = this.state.controls.reduce((ctrls, ctrl) => {
      if (ctrl.key === key) {
        dragged = ctrl
        return ctrls
      }
      return ctrls.concat(ctrl)
    }, [])
    let parent = null
    let parentIndex
    let dropNextIndex

    for (let i = 0, l = changedControls.length; i < l; i += 1) {
      const control = changedControls[i]
      if (control.key === parentKey) {
        parent = control
        parentIndex = i
      }
      if (dropNextKey && control.key === dropNextKey) {
        dropNextIndex = i
      }
    }

    dragged.parent = parent && parent.key

    if (dropNextKey) {
      changedControls = type === 'append'
        ? [
          ...changedControls.slice(0, dropNextIndex + 1),
          dragged,
          ...changedControls.slice(dropNextIndex + 1)
        ]
        : [
          ...changedControls.slice(0, dropNextIndex),
          dragged,
          ...changedControls.slice(dropNextIndex)
        ]
    } else {
      changedControls = parent
        ? [
          ...changedControls.slice(0, parentIndex + 1),
          dragged,
          ...changedControls.slice(parentIndex + 1)
        ]
        : type === 'append'
          ? [...changedControls, dragged]
          : [dragged, ...changedControls]
    }
    this.setState({
      controls: changedControls
    })
  }

  private changeName = (key) => (name) => {
    this.setState({
      controls: this.state.controls.map((c) => {
        return c.key === key
          ? { ...c, name }
          : c
      })
    })
  }

  private getCachedFormValues = (
    resolve?: (err, cachedControls?) => void
  ) => {
    const { controls, selected, itemSelectorSource, viewSelectorSource } = this.state
    this.filterForm.current.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        if (resolve) {
          resolve(err)
        }
        return
      }

      const { type, key, defaultValue, dateFormat } = values
      const isControlDateType = [FilterTypes.Date, FilterTypes.DateRange].includes(type)
      const cachedControls = controls.map((c) => {
        if (c.key === key) {
          return {
            ...c,
            ...values,
            interactionType: selected.interactionType,
            defaultValue: isControlDateType
              ? (defaultValue && defaultValue.format(dateFormat))
              : defaultValue,
            relatedItems: itemSelectorSource.reduce((obj, source) => {
              obj[source.id] = {
                viewId: source.viewId,
                checked: source.checked
              }
              return obj
            }, {}),
            relatedViews: viewSelectorSource.reduce((obj, source) => {
              obj[source.id] = source.fields
              return obj
            }, {})
          }
        } else {
          return c
        }
      })

      if (resolve) {
        resolve(null, cachedControls)
      }
    })
  }

  private save = () => {
    const { onSave } = this.props
    if (this.state.controls.length > 0) {
      this.getCachedFormValues((err, cachedControls) => {
        if (err) { return }
        onSave(cachedControls)
      })
    } else {
      onSave([])
    }
  }

  private resetForm = () => {
    this.setState({
      selected: null
    })
  }

  private itemCheck = (id: number) => () => {
    const { views } = this.props
    const { selected } = this.state
    const itemSelectorSource = this.state.itemSelectorSource.map((s) => {
      return s.id === id
        ? {
          ...s,
          checked: !s.checked
        }
        : s
    })
    const viewSelectorSource = this.getViewSelectorSource(itemSelectorSource, selected, views)
    this.setState({
      itemSelectorSource,
      viewSelectorSource
    })
  }

  private modelOrVariableSelect = (id: number) => (value: string | string[]) => {
    const { selected, viewSelectorSource } = this.state
    this.setState({
      viewSelectorSource: viewSelectorSource.map((v) => {
        if (v.id === id) {
          let fields
          if (selected.interactionType === 'column') {
            const detail = v.model.find((m) => m.name === value)
            fields = {
              name: detail.name,
              sqlType: detail.sqlType
            }
          } else {
            fields = IS_RANGE_TYPE[selected.type]
              ? (value as string[]).map((v) => ({
                name: v,
                sqlType: ''
              }))
              : {
                name: value,
                sqlType: ''
              }
          }
          return {
            ...v,
            fields
          }
        } else {
          return v
        }
      })
    })
  }

  private toggleCheckAll = () => {
    const { views } = this.props
    const { selected } = this.state
    const allChecked = this.state.itemSelectorSource.every((s) => s.checked)
    const itemSelectorSource = this.state.itemSelectorSource.map((a) => ({
      ...a,
      checked: !allChecked
    }))
    const viewSelectorSource = this.getViewSelectorSource(itemSelectorSource, selected, views)
    this.setState({
      itemSelectorSource,
      viewSelectorSource
    })
  }

  private interactionTypeChange = (e: RadioChangeEvent) => {
    const { views } = this.props
    const selected = {
      ...this.state.selected,
      interactionType: e.target.value
    }
    this.setState({
      selected,
      viewSelectorSource: this.getViewSelectorSource(this.state.itemSelectorSource, selected, views)
    })
  }

  private controlTypeChange = (value) => {
    const { views } = this.props
    const { selected, itemSelectorSource } = this.state

    const changedSelected = { ...selected, type: value}

    const viewSelectorSource = this.getViewSelectorSource(itemSelectorSource, changedSelected, views)

    this.setState({
      selected: changedSelected,
      viewSelectorSource
    })
  }

  public render () {
    const { currentItems, views, widgets, loading, visible, mapOptions, onCancel, onGetOptions } = this.props
    const { controls, selected, itemSelectorSource, viewSelectorSource } = this.state

    const modalButtons = [(
      <Button
        key="cancel"
        size="large"
        onClick={onCancel}
      >
        取 消
      </Button>
    ), (
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={loading}
        disabled={loading}
        onClick={this.save}
      >
        保 存
      </Button>
    )]

    return (
      <Modal
        wrapClassName="ant-modal-large ant-modal-center"
        title="全局筛选配置"
        maskClosable={false}
        visible={visible}
        footer={modalButtons}
        onCancel={onCancel}
        afterClose={this.resetForm}
      >
        <div className={styles.filterConfig}>
          <div className={styles.left}>
            <FilterList
              list={controls}
              selectedFilter={selected}
              onSelectFilter={this.selectFilter}
              onAddFilter={this.addFilter}
              onDeleteFilter={this.deleteFilter}
              onNameChange={this.changeName}
              onParentChange={this.changeParent}
            />
          </div>
          <div className={styles.center}>
            {
              selected && (
                <>
                  <RelatedInfoSelectors
                    itemSelectorSource={itemSelectorSource}
                    viewSelectorSource={viewSelectorSource}
                    interactionType={selected.interactionType}
                    onItemCheck={this.itemCheck}
                    onModelOrVariableSelect={this.modelOrVariableSelect}
                    onToggleCheckAll={this.toggleCheckAll}
                    onInteractionTypeChange={this.interactionTypeChange}
                  />
                  <FilterFormWithRedux
                    views={views}
                    onControlTypeChange={this.controlTypeChange}
                    wrappedComponentRef={this.filterForm}
                  />
                </>
              )
            }
          </div>
        </div>
      </Modal>
    )
  }
}

function mapDispatchToProps (dispatch) {
  return {
    onSetControlFormValues: (values) => dispatch(setControlFormValues(values))
  }
}

export default connect(null, mapDispatchToProps)(GlobalControlConfig)
