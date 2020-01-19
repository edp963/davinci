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
import {
  OnGetControlOptions,
  IMapControlOptions,
  IGlobalControl,
  IGlobalControlRelatedItem,
  IControlRelatedField,
  InteractionType,
  GlobalControlQueryMode
} from '../types'
import {
  getDefaultGlobalControl,
  deserializeDefaultValue,
  serializeDefaultValue,
  getRelatedFieldsInfo
} from '../util'
import { FilterTypes, IS_RANGE_TYPE} from '../filterTypes'
import { globalControlMigrationRecorder } from 'app/utils/migrationRecorders'

import FilterList from './FilterList'
import FilterFormWithRedux, { FilterForm } from './FilterForm'
import OptionSettingFormWithModal, { OptionSettingForm } from './OptionSettingForm'
import RelatedInfoSelectors from './RelatedInfoSelectors'
import { Button, Modal, Radio } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { ICurrentDashboard } from 'containers/Dashboard'
import { setControlFormValues } from 'containers/Dashboard/actions'
import { IViewVariable, IFormedViews, IFormedView, IViewModelProps } from 'app/containers/View/types'
const RadioGroup = Radio.Group
const RadioButton = Radio.Button

const styles = require('../filter.less')

export interface IRelatedItemSource extends IGlobalControlRelatedItem {
  id: number
  name: string
}

export interface IRelatedViewSource {
  id: number
  name: string
  model: IViewModelProps[]
  variables: IViewVariable[]
  fields: IControlRelatedField | IControlRelatedField[]
}

interface IGlobalControlConfigProps {
  currentDashboard: ICurrentDashboard
  currentItems: any[]
  views: IFormedViews
  widgets: any[]
  visible: boolean
  loading: boolean
  mapOptions: IMapControlOptions
  onCancel: () => void
  onSave: (filterItems: any[], queryMode: GlobalControlQueryMode) => void
  onGetOptions: OnGetControlOptions
  onSetControlFormValues: (values) => void
}

interface IGlobalControlConfigStates {
  controls: IGlobalControl[]
  selected: IGlobalControl
  itemSelectorSource: IRelatedItemSource[]
  viewSelectorSource: IRelatedViewSource[]
  optionModalVisible: boolean,
  optionValues: string
  queryMode: GlobalControlQueryMode
}

export class GlobalControlConfig extends React.Component<IGlobalControlConfigProps, IGlobalControlConfigStates> {

  constructor (props) {
    super(props)
    this.state = {
      controls: [],
      selected: null,
      itemSelectorSource: [],
      viewSelectorSource: [],
      optionModalVisible: false,
      optionValues: '',
      queryMode: GlobalControlQueryMode.Immediately
    }
  }

  private filterForm = createRef<FilterForm>()
  private optionSettingForm = createRef<OptionSettingForm>()

  public componentWillReceiveProps (nextProps: IGlobalControlConfigProps) {
    const { currentDashboard, currentItems, widgets, views, visible } = nextProps
    if (currentDashboard !== this.props.currentDashboard
        || currentItems !== this.props.currentItems
        || visible && !this.props.visible) {
      if (currentDashboard) {
        const config = JSON.parse(currentDashboard.config || '{}')
        const globalControls = config.filters || []
        const queryMode = config.queryMode || GlobalControlQueryMode.Immediately

        let selected
        const controls =  globalControls.map((control) => {
          control = globalControlMigrationRecorder(control)

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
          selected,
          queryMode
        })
        this.setRelatedInfo(selected, currentItems, widgets, views)
        this.setFormData(selected)
      }
    }
  }

  private setRelatedInfo = (control: IGlobalControl, items, widgets, views: IFormedViews) => {
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

  private getViewSelectorSource = (
    itemSelectorSource: IRelatedItemSource[],
    control: IGlobalControl,
    views: IFormedViews
  ) => {
    const { relatedViews, type, interactionType } = control
    const selectedItemRelatedViews: IFormedViews = itemSelectorSource
      .filter((s) => s.checked)
      .reduce<IFormedViews>((viewObj, itemSource) => {
        if (!viewObj[itemSource.viewId]) {
          viewObj[itemSource.viewId] = views[itemSource.viewId]
        }
        return viewObj
      }, {})
    return Object.entries(selectedItemRelatedViews)
      .map(([viewId, view]: [string, IFormedView]) => ({
        id: Number(viewId),
        name: view.name,
        ...getRelatedFieldsInfo(view, type, interactionType, relatedViews[view.id])
      }))
  }

  private setFormData = (control: IGlobalControl) => {
    if (control) {
      const { type, interactionType, defaultValue, relatedItems, relatedViews, ...rest } = control
      const fieldsValue = {
        type,
        defaultValue: deserializeDefaultValue(control),
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
    const newFilter: IGlobalControl = getDefaultGlobalControl()

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

      const { key, defaultValue } = values
      const cachedControls = controls.map((c) => {
        if (c.key === key) {
          return {
            ...c,
            ...values,
            interactionType: selected.interactionType,
            defaultValue: serializeDefaultValue(values, defaultValue),
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
    const { controls, queryMode } = this.state
    if (controls.length > 0) {
      this.getCachedFormValues((err, cachedControls) => {
        if (err) { return }
        onSave(cachedControls, queryMode)
      })
    } else {
      onSave([], queryMode)
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
          let detail
          if (selected.interactionType === 'column') {
            detail = v.model.find((m) => m.name === value)
            fields = {
              name: detail.name,
              type: detail.sqlType
            }
          } else {
            if (IS_RANGE_TYPE[selected.type]) {
              fields = (value as string[]).map((str) => {
                detail = v.variables.find((m) => m.name === str)
                return {
                  name: detail.name,
                  type: detail.valueType
                }
              })
            } else {
              detail = v.variables.find((m) => m.name === value)
              fields = {
                ...selected.type === FilterTypes.Select && v.fields,
                name: detail.name,
                type: detail.valueType
              }
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

  private optionsFromColumnChecked = (id: number) => (e: CheckboxChangeEvent) => {
    const { viewSelectorSource } = this.state
    this.setState({
      viewSelectorSource: viewSelectorSource.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            fields: {
              ...v.fields,
              optionsFromColumn: e.target.checked
            }
          }
        } else {
          return v
        }
      })
    })
  }

  private optionsFromColumnSelect = (id: number) => (value: string) => {
    const { viewSelectorSource } = this.state
    this.setState({
      viewSelectorSource: viewSelectorSource.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            fields: {
              ...v.fields,
              column: value
            }
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
    const currentSelected = this.state.selected
    const selected = {
      ...currentSelected,
      interactionType: e.target.value,
      relatedViews: Object.keys(currentSelected.relatedViews)
        .reduce((obj, viewId) => {
          obj[viewId] = void 0
          return obj
        }, {})
    }
    this.setState({
      selected,
      viewSelectorSource: this.getViewSelectorSource(this.state.itemSelectorSource, selected, views)
    })
  }

  private controlTypeChange = (value) => {
    const { views } = this.props
    const { selected, itemSelectorSource } = this.state
    const { interactionType, relatedViews } = selected

    const changedSelected = {
      ...selected,
      type: value,
      relatedViews: Object.entries(relatedViews)
        .reduce((obj, [viewId, fields]) => {
          obj[viewId] = this.getValidaFields(interactionType, value, fields)
          return obj
        }, {})
    }

    const viewSelectorSource = this.getViewSelectorSource(itemSelectorSource, changedSelected, views)

    this.setState({
      selected: changedSelected,
      viewSelectorSource
    })
  }

  private getValidaFields = (
    interactionType: InteractionType,
    type: FilterTypes,
    fields: IControlRelatedField | IControlRelatedField[]
  ): IControlRelatedField | IControlRelatedField[] => {
    if (fields) {
      if (interactionType === 'variable') {
        if (IS_RANGE_TYPE[type]) {
          return fields
        } else {
          return Array.isArray(fields) ? fields[0] : fields
        }
      } else {
        return fields
      }
    }
    return fields
  }

  private openOptionModal = () => {
    const { options } = this.state.selected
    this.setState({
      optionModalVisible: true,
      optionValues: options && options.map((o) => `${o.text} ${o.value}`).join('\n')
    })
  }

  private closeOptionModal = () => {
    this.setState({ optionModalVisible: false })
  }

  private saveOptions = () => {
    this.optionSettingForm.current.props.form.validateFieldsAndScroll((err, values) => {
      if (err) { return }
      const options = values.options
        ? [...new Set(values.options.split(/\n/))]
            .filter((tnv: string) => !!tnv.trim())
            .map((tnv: string) => {
              const tnvArr = tnv.split(/\s+/)
              return tnvArr.length === 1
                ? { text: tnvArr[0], value: tnvArr[0] }
                : { text: tnvArr[0], value: tnvArr[1] }
            })
        : []
      this.filterForm.current.props.form.setFieldsValue({options})
      this.closeOptionModal()
    })
  }

  private changeQueryMode = (e: RadioChangeEvent) => {
    this.setState({
      queryMode: e.target.value
    })
  }

  public render () {
    const { loading, visible, onCancel } = this.props
    const {
      controls,
      selected,
      itemSelectorSource,
      viewSelectorSource,
      optionModalVisible,
      optionValues,
      queryMode
    } = this.state

    const modalFooter = [(
      <RadioGroup
        key="queryMode"
        className={styles.queryMode}
        value={queryMode}
        onChange={this.changeQueryMode}
      >
        <RadioButton value={GlobalControlQueryMode.Immediately}>立即查询</RadioButton>
        <RadioButton value={GlobalControlQueryMode.Manually}>手动查询</RadioButton>
      </RadioGroup>
    ), (
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
        title="全局控制器配置"
        maskClosable={false}
        visible={visible}
        footer={modalFooter}
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
                    controlType={selected.type}
                    onItemCheck={this.itemCheck}
                    onModelOrVariableSelect={this.modelOrVariableSelect}
                    onOptionsFromColumnCheck={this.optionsFromColumnChecked}
                    onOptionsFromColumnSelect={this.optionsFromColumnSelect}
                    onToggleCheckAll={this.toggleCheckAll}
                    onInteractionTypeChange={this.interactionTypeChange}
                  />
                  <FilterFormWithRedux
                    interactionType={selected.interactionType}
                    onControlTypeChange={this.controlTypeChange}
                    onOpenOptionModal={this.openOptionModal}
                    wrappedComponentRef={this.filterForm}
                  />
                </>
              )
            }
          </div>
          <OptionSettingFormWithModal
            visible={optionModalVisible}
            options={optionValues}
            onSave={this.saveOptions}
            onCancel={this.closeOptionModal}
            wrappedComponentRef={this.optionSettingForm}
          />
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
