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
  IControl,
  IDistinctValueReqeustParams,
  IControlRelatedViewFormValue,
  IControlOption,
  IControlRelatedView
} from '../types'
import {
  getDefaultGlobalControl,
  getDefaultLocalControl,
  getEditingControlFormValues,
  getDefaultRelatedView,
  getValidOperator,
  getValidDatePickerFormat,
  stringifyDefaultValue,
  transformOptions,
  getRelatedViewModels
} from '../util'
import {
  ControlTypes,
  IS_RANGE_TYPE,
  ControlQueryMode,
  ControlFieldTypes,
  SHOULD_LOAD_OPTIONS,
  ControlOptionTypes,
  ControlDefaultValueTypes,
  ControlPanelTypes
} from '../constants'

import { ListFormLayout, List } from 'components/ListFormLayout'
import ControlList from './ControlList'
import ControlForm from './ControlForm'
import OptionSettingForm from './OptionSettingForm'
import { Button, Modal, Radio, message } from 'antd'
import FormType from 'antd/lib/form/Form'
import { RadioChangeEvent } from 'antd/lib/radio'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { TreeNode } from 'antd/lib/tree-select'
import { IDashboardItem } from 'containers/Dashboard/types'
import { IFormedViews, IViewBase, IView } from 'app/containers/View/types'
import { IWidgetFormed } from 'app/containers/Widget/types'
import { IFlatRelatedItem, IFlatRelatedView } from './ControlForm/types'
import { DEFAULT_CACHE_EXPIRED } from 'app/globalConstants'
import { getDefaultRelativeDate } from 'app/components/RelativeDatePicker/util'
import styles from '../Control.less'
const RadioGroup = Radio.Group
const RadioButton = Radio.Button

interface IControlConfigProps {
  type: ControlPanelTypes
  originalControls: IControl[]
  currentItems?: IDashboardItem[]
  widgets?: IWidgetFormed[]
  relatedViewId?: number
  views: IViewBase[]
  formedViews: IFormedViews
  visible: boolean
  loading?: boolean
  queryMode: ControlQueryMode
  onCancel: () => void
  onSave: (controls: IControl[], queryMode: ControlQueryMode) => void
  onLoadViews: () => void
  onLoadViewDetail: (
    viewIds: number[],
    resolve?: (views: IView[]) => void
  ) => void
  onGetOptions: (
    paramsByViewId: {
      [viewId: string]: Omit<IDistinctValueReqeustParams, 'cache' | 'expired'>
    },
    callback: (options?: object[]) => void
  ) => void
}

interface IControlConfigStates {
  controls: IControl[]
  editingControlBase: Omit<IControl, 'relatedItems' | 'relatedViews'>
  editingRelatedItemList: IFlatRelatedItem[]
  editingRelatedViewList: IFlatRelatedView[]
  defaultValueOptions: Array<IControlOption | TreeNode>
  defaultValueLoading: boolean
  optionModalVisible: boolean
  optionSettingFormValues: IControlOption
  editingOptionIndex: number
  queryMode: ControlQueryMode
  controlFormWillChangeValues: Partial<IControl>
  prevVisible: boolean
}

export class ControlConfig extends PureComponent<
  IControlConfigProps,
  IControlConfigStates
> {
  public state: IControlConfigStates = {
    controls: [],
    editingControlBase: null,
    editingRelatedItemList: [],
    editingRelatedViewList: [],
    defaultValueOptions: [],
    defaultValueLoading: false,
    optionModalVisible: false,
    optionSettingFormValues: null,
    editingOptionIndex: -1,
    queryMode: ControlQueryMode.Immediately,
    controlFormWillChangeValues: null,
    prevVisible: false
  }

  private controlForm: FormType = null
  private optionSettingForm: FormType = null
  private refHandles = {
    controlForm: (ref) => (this.controlForm = ref),
    optionSettingForm: (ref) => (this.optionSettingForm = ref)
  }

  constructor(props) {
    super(props)
    this.props.onLoadViews()
  }

  public static getDerivedStateFromProps: GetDerivedStateFromProps<
    IControlConfigProps,
    IControlConfigStates
  > = (props, state) => {
    const {
      type: panelType,
      originalControls,
      currentItems,
      widgets,
      formedViews,
      visible,
      queryMode,
      onLoadViewDetail
    } = props
    const { prevVisible } = state
    let nextState: Partial<IControlConfigStates> = {
      prevVisible: visible
    }

    if (visible && !prevVisible && originalControls) {
      const controls = []
      const relatedViewIds = []
      let editingControl

      try {
        originalControls.forEach((origin) => {
          const control: IControl = JSON.parse(JSON.stringify(origin))
          const { type, optionType, valueViewId, relatedItems } = control

          if (panelType === ControlPanelTypes.Global) {
            Object.keys(relatedItems).forEach((itemId) => {
              if (!currentItems.find((ci) => ci.id === Number(itemId))) {
                delete relatedItems[itemId]
              }
            })
          }

          if (
            SHOULD_LOAD_OPTIONS[type] &&
            optionType === ControlOptionTypes.Manual &&
            !formedViews[valueViewId]
          ) {
            relatedViewIds.push(valueViewId)
          }

          if (!editingControl && !control.parent) {
            editingControl = control
          }

          controls.push(control)
        })
      } catch (error) {
        message.error('控制器配置解析失败')
        throw error
      }

      if (relatedViewIds.length) {
        onLoadViewDetail(relatedViewIds)
      }

      nextState = {
        ...nextState,
        controls,
        queryMode,
        ...getEditingControlFormValues(
          editingControl,
          formedViews,
          currentItems,
          widgets
        )
      }
    }

    return nextState
  }

  private selectControl = (key: string) => {
    const { currentItems, widgets, formedViews } = this.props

    this.mergeEditingControl((mergedControls) => {
      this.setState({
        controls: mergedControls,
        defaultValueOptions: [],
        ...getEditingControlFormValues(
          mergedControls.find((c) => c.key === key),
          formedViews,
          currentItems,
          widgets
        )
      })
      this.controlForm.props.form.setFieldsValue({ defaultValue: void 0 })
    })
  }

  private addControl = () => {
    const {
      type,
      relatedViewId,
      currentItems,
      widgets,
      formedViews
    } = this.props
    const { controls, editingControlBase } = this.state

    let control
    if (type === ControlPanelTypes.Global) {
      control = getDefaultGlobalControl()
    } else {
      if (relatedViewId && formedViews[relatedViewId]) {
        control = getDefaultLocalControl(formedViews[relatedViewId])
      } else {
        return
      }
    }

    if (editingControlBase) {
      this.mergeEditingControl((mergedControls) => {
        this.setState({
          controls: [...mergedControls, control],
          defaultValueOptions: [],
          ...getEditingControlFormValues(
            control,
            formedViews,
            currentItems,
            widgets
          )
        })
        this.controlForm.props.form.setFieldsValue({ defaultValue: void 0 })
      })
    } else {
      this.setState({
        controls: [...controls, control],
        ...getEditingControlFormValues(
          control,
          formedViews,
          currentItems,
          widgets
        )
      })
    }
  }

  private deleteControl = (keys: string[], reselectedKey: string) => {
    const { currentItems, widgets, formedViews } = this.props
    const { controls } = this.state

    const reselected = reselectedKey
      ? controls.find((c) => c.key === reselectedKey)
      : null

    this.setState({
      controls: controls.filter((c) => !keys.includes(c.key)),
      defaultValueOptions: [],
      ...getEditingControlFormValues(
        reselected,
        formedViews,
        currentItems,
        widgets
      )
    })
    this.controlForm.props.form.setFieldsValue({ defaultValue: void 0 })
  }

  private changeParent = (
    key: string,
    parentKey: string,
    type: string,
    dropNextKey?: string
  ) => {
    const { editingControlBase, controls } = this.state
    let dragged
    let changedControls = controls.reduce((ctrls, ctrl) => {
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
      changedControls =
        type === 'append'
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
      controls: changedControls,
      ...(dragged.key === editingControlBase.key && {
        editingControlBase: {
          ...editingControlBase,
          parent: dragged.parent
        }
      })
    })
  }

  private changeName = (key: string, name: string) => {
    this.setState({
      controls: this.state.controls.map((c) => {
        return c.key === key ? { ...c, name } : c
      })
    })
  }

  private itemCheck = (id: number) => () => {
    const editingRelatedItemList = this.state.editingRelatedItemList.map(
      (item) =>
        item.id === id
          ? {
              ...item,
              checked: !item.checked
            }
          : item
    )
    const editingRelatedViewList = this.getEditingRelatedViewList(
      editingRelatedItemList
    )
    this.setState({
      editingRelatedItemList,
      editingRelatedViewList,
      controlFormWillChangeValues: {
        ...editingRelatedItemList.reduce(
          (values, { id, checked, viewId }) => ({
            ...values,
            [`relatedItems[${id}].checked`]: checked,
            [`relatedItems[${id}].viewId`]: viewId
          }),
          {}
        ),
        ...editingRelatedViewList.reduce(
          (values, { id, fieldType }) => ({
            ...values,
            [`relatedViews[${id}].fieldType`]: fieldType
          }),
          {}
        )
      }
    })
  }

  private checkAll = (e: CheckboxChangeEvent) => {
    const { editingRelatedItemList } = this.state
    const allChecked = e.target.checked
    const checkedRelatedItemList = editingRelatedItemList.map((v) => ({
      ...v,
      checked: allChecked
    }))
    const editingRelatedViewList = allChecked
      ? this.getEditingRelatedViewList(checkedRelatedItemList)
      : []
    this.setState({
      editingRelatedItemList: checkedRelatedItemList,
      editingRelatedViewList,
      controlFormWillChangeValues: {
        ...checkedRelatedItemList.reduce(
          (values, { id, checked, viewId }) => ({
            ...values,
            [`relatedItems[${id}].checked`]: checked,
            [`relatedItems[${id}].viewId`]: viewId
          }),
          {}
        ),
        ...editingRelatedViewList.reduce(
          (values, { id, fieldType }) => ({
            ...values,
            [`relatedViews[${id}].fieldType`]: fieldType
          }),
          {}
        )
      }
    })
  }

  private getEditingRelatedViewList = (
    relatedItemList: IFlatRelatedItem[]
  ): IFlatRelatedView[] => {
    const { formedViews } = this.props
    const {
      editingControlBase: { type },
      editingRelatedViewList
    } = this.state
    return Array.from(
      new Set(
        relatedItemList
          .filter((item) => item.checked)
          .map((item) => item.viewId)
      )
    ).reduce((mergedRelatedViewList, viewId) => {
      const relatedView = editingRelatedViewList.find((r) => r.id === viewId)
      const view = formedViews[viewId]
      return relatedView
        ? mergedRelatedViewList.concat(relatedView)
        : mergedRelatedViewList.concat(getDefaultRelatedView(view, type))
    }, [])
  }

  private fieldTypeChange = (viewId: number) => (e: RadioChangeEvent) => {
    const {
      editingControlBase: { type },
      editingRelatedViewList
    } = this.state
    const fieldType = e.target.value

    const changedRelatedViewList = editingRelatedViewList.map((relatedView) => {
      return relatedView.id === viewId
        ? {
            ...relatedView,
            fieldType,
            fields: relatedView.fields
          }
        : relatedView
    })
    this.setState({
      editingRelatedViewList: changedRelatedViewList,
      controlFormWillChangeValues: {
        [`relatedViews[${viewId}].fields`]: []
      }
    })
  }

  private controlTypeChange = (value) => {
    const { formedViews } = this.props
    const { editingControlBase, editingRelatedViewList } = this.state
    const { multiple } = editingControlBase

    const changedControlBase: Partial<IControl> = {
      type: value,
      multiple: void 0,
      optionWithVariable: false,
      defaultValueType: ControlDefaultValueTypes.Fixed
    }
    const changedFields: Partial<IControl> = {
      operator: getValidOperator(editingControlBase.operator, value, false),
      multiple: void 0,
      optionWithVariable: false,
      defaultValueType: ControlDefaultValueTypes.Fixed
    }

    switch (value) {
      case ControlTypes.Select:
        changedControlBase.optionType = ControlOptionTypes.Auto
        changedFields.cache = false
        changedFields.expired = DEFAULT_CACHE_EXPIRED
        changedFields.optionType = ControlOptionTypes.Auto
        break
      case ControlTypes.Radio:
        changedControlBase.radioType = 'normal'
        changedFields.radioType = 'normal'
        break
      case ControlTypes.TreeSelect:
        changedControlBase.optionType = ControlOptionTypes.Manual
        changedFields.cache = false
        changedFields.expired = DEFAULT_CACHE_EXPIRED
        changedFields.optionType = ControlOptionTypes.Manual
        break
      case ControlTypes.Date:
      case ControlTypes.DateRange:
        changedFields.dateFormat = getValidDatePickerFormat(
          editingControlBase.dateFormat,
          value,
          multiple
        )
        break
    }

    this.setState({
      editingControlBase: {
        ...editingControlBase,
        ...changedControlBase
      },
      editingRelatedViewList: editingRelatedViewList.map(
        ({ fieldType, fields, ...rest }) => ({
          ...rest,
          models: getRelatedViewModels(formedViews[rest.id], value),
          fieldType,
          fields
        })
      ),
      controlFormWillChangeValues: changedFields
    })

    this.controlForm.props.form.setFieldsValue({ defaultValue: void 0 })
  }

  private multipleSettingChange = (e: CheckboxChangeEvent) => {
    const { editingControlBase } = this.state
    const { type } = editingControlBase
    const changedFields: Partial<IControl> = {
      operator: getValidOperator(
        editingControlBase.operator,
        type,
        e.target.checked
      ),
      defaultValueType: ControlDefaultValueTypes.Fixed,
      defaultValue: void 0
    }
    this.setState({
      editingControlBase: {
        ...editingControlBase,
        multiple: e.target.checked,
        defaultValueType: ControlDefaultValueTypes.Fixed
      },
      controlFormWillChangeValues: changedFields
    })
  }

  private sliderPropChange = (
    min: number = 0,
    max: number = 0,
    step: number
  ) => {
    const { editingControlBase } = this.state
    min = Number(min)
    max = Number(max)
    const adjustedMin = Math.min(min, max)
    const adjustedMax = Math.max(min, max)
    const { defaultValue } = this.controlForm.props.form.getFieldsValue()
    const adjustedDefaultValue = defaultValue && [
      defaultValue[0] >= adjustedMin && defaultValue[0] <= adjustedMax
        ? defaultValue[0]
        : adjustedMin,
      defaultValue[1] >= adjustedMin && defaultValue[1] <= adjustedMax
        ? defaultValue[1]
        : adjustedMax
    ]

    this.setState({
      editingControlBase: {
        ...editingControlBase,
        min: adjustedMin,
        max: adjustedMax,
        step
      }
    })
    this.controlForm.props.form.setFieldsValue({
      defaultValue: adjustedDefaultValue
    })
  }

  private optionTypeChange = (e: RadioChangeEvent) => {
    const { editingControlBase } = this.state
    this.setState({
      editingControlBase: {
        ...editingControlBase,
        optionType: e.target.value,
        optionWithVariable: false
      },
      controlFormWillChangeValues: { defaultValue: void 0 }
    })
  }

  private valueViewChange = (viewId: number) => {
    const { formedViews, onLoadViewDetail } = this.props
    const { editingControlBase } = this.state

    if (!formedViews[viewId]) {
      onLoadViewDetail([viewId])
    }

    this.setState({
      editingControlBase: {
        ...editingControlBase,
        valueViewId: viewId
      }
    })
  }

  private defaultValueTypeChange = (e: RadioChangeEvent) => {
    const { editingControlBase } = this.state

    let changedFields
    if (e.target.value === ControlDefaultValueTypes.Dynamic) {
      switch (editingControlBase.type) {
        case ControlTypes.Date:
          changedFields = { defaultValue: getDefaultRelativeDate() }
          break
        case ControlTypes.DateRange:
          changedFields = {
            defaultValueStart: getDefaultRelativeDate(),
            defaultValueEnd: getDefaultRelativeDate()
          }
          break
        default:
          changedFields = { defaultValue: void 0 }
          break
      }
    } else {
      changedFields = { defaultValue: void 0 }
    }

    this.setState({
      editingControlBase: {
        ...editingControlBase,
        defaultValueType: e.target.value
      },
      controlFormWillChangeValues: changedFields
    })
  }

  private commonControlPropChange = (propName: string, value) => {
    const { editingControlBase } = this.state
    this.setState({
      editingControlBase: {
        ...editingControlBase,
        [propName]: value
      }
    })
  }

  private loadDefaultValueOptions = () => {
    const { onGetOptions } = this.props
    const { editingControlBase, defaultValueLoading } = this.state
    const { type, optionType } = editingControlBase
    this.controlForm.props.form.validateFieldsAndScroll(
      ['relatedViews', 'valueViewId', 'valueField', 'textField', 'parentField'],
      (err, values) => {
        if (err) {
          return
        }
        if (SHOULD_LOAD_OPTIONS[type] && !defaultValueLoading) {
          switch (optionType) {
            case ControlOptionTypes.Auto:
              const relatedViewValues = this.convertFieldFormValues({
                ...values.relatedViews
              })
              const relatedViewMap = Object.entries(relatedViewValues)
              if (relatedViewMap.length) {
                const paramsByViewId = relatedViewMap.reduce(
                  (obj, [viewId, { fieldType, fields }]) => {
                    if (fieldType === ControlFieldTypes.Column) {
                      obj[viewId] = { columns: fields }
                    }
                    return obj
                  },
                  {}
                )
                if (Object.keys(paramsByViewId).length) {
                  this.setState({ defaultValueLoading: true })
                  onGetOptions(paramsByViewId, (options) => {
                    message.success('加载成功！')
                    this.setState({ defaultValueLoading: false })
                    if (options) {
                      this.setState({
                        defaultValueOptions: transformOptions(
                          {
                            ...editingControlBase,
                            ...values,
                            relatedViews: relatedViewValues
                          },
                          options
                        )
                      })
                    }
                  })
                }
              }
              break
            case ControlOptionTypes.Manual:
              const { valueViewId, valueField, textField, parentField } = values
              const paramsByViewId = {
                [valueViewId]: {
                  columns: [valueField, textField, parentField].filter(
                    (s) => !!s
                  )
                }
              }
              this.setState({ defaultValueLoading: true })
              onGetOptions(paramsByViewId, (options) => {
                message.success('加载成功！')
                this.setState({ defaultValueLoading: false })
                if (options) {
                  this.setState({
                    defaultValueOptions: transformOptions(
                      {
                        ...editingControlBase,
                        ...values,
                        relatedViews: relatedViewValues
                      },
                      options
                    )
                  })
                }
              })
              break
          }
        }
      }
    )
  }

  private mergeEditingControl = (resolve: (mergedControls) => void) => {
    const { type } = this.props
    const { controls, editingControlBase } = this.state
    this.controlForm.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return
      }
      const {
        relatedItems,
        relatedViews,
        defaultValue,
        defaultValueStart,
        defaultValueEnd,
        ...restFormValues
      } = values
      const mergedControls = controls.map((control) => {
        const { key, name, parent } = control
        if (key === editingControlBase.key) {
          return {
            key,
            name,
            ...(parent && { parent }),
            ...restFormValues,
            defaultValue: stringifyDefaultValue(
              values,
              defaultValue,
              defaultValueStart,
              defaultValueEnd
            ),
            ...(type === ControlPanelTypes.Global && {
              relatedItems: { ...relatedItems }
            }),
            relatedViews: this.convertFieldFormValues({ ...relatedViews })
          }
        } else {
          return control
        }
      })
      resolve(mergedControls)
    })
  }

  private convertFieldFormValues = (relatedViewFormValues: {
    [viewId: string]: IControlRelatedViewFormValue
  }): { [viewId: string]: IControlRelatedView } => {
    return Object.entries(relatedViewFormValues).reduce(
      (obj, [viewId, { fieldType, fields }]) => {
        obj[viewId] = {
          fieldType,
          fields: [].concat(fields)
        }
        return obj
      },
      {}
    )
  }

  private save = () => {
    const { onSave } = this.props
    const { controls, queryMode } = this.state
    if (controls.length > 0) {
      this.mergeEditingControl((mergedControls) => {
        onSave(mergedControls, queryMode)
      })
    } else {
      onSave([], queryMode)
    }
  }

  private resetForm = () => {
    this.setState({
      ...getEditingControlFormValues(null)
    })
  }

  private openOptionModal = (index?) => {
    const { customOptions } = this.state.editingControlBase
    this.setState({
      optionModalVisible: true,
      optionSettingFormValues:
        index !== void 0 && customOptions ? customOptions[index] : null,
      ...(index !== void 0 && { editingOptionIndex: index })
    })
  }

  private closeOptionModal = () => {
    this.setState({ optionModalVisible: false })
  }

  private afterOptionModalClose = () => {
    this.setState({
      optionSettingFormValues: null,
      editingOptionIndex: -1
    })
    this.optionSettingForm.props.form.resetFields()
  }

  private saveOptions = () => {
    this.optionSettingForm.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return
      }
      const {
        editingControlBase,
        editingRelatedViewList,
        editingOptionIndex
      } = this.state

      let customOptions = editingControlBase.customOptions || []
      const editingOption: IControlOption = {
        value: values.value,
        text: values.text || values.value,
        ...(editingControlBase.optionWithVariable && {
          variables: editingRelatedViewList.reduce((obj, { id }) => {
            if (values[id]) {
              obj[id] = values[id]
            }
            return obj
          }, {})
        })
      }
      if (editingOptionIndex === -1) {
        customOptions = customOptions.concat(editingOption)
      } else {
        customOptions = customOptions.map((option, index) => {
          return index === editingOptionIndex ? editingOption : option
        })
      }

      this.controlForm.props.form.setFieldsValue({ customOptions })
      this.setState({
        editingControlBase: {
          ...editingControlBase,
          customOptions
        }
      })
      this.closeOptionModal()
    })
  }

  private deleteOption = (value) => () => {
    const { editingControlBase } = this.state
    const customOptions = editingControlBase.customOptions.filter(
      (o) => o.value !== value
    )
    this.setState({
      editingControlBase: {
        ...editingControlBase,
        customOptions
      }
    })
    this.controlForm.props.form.setFieldsValue({ customOptions })
  }

  private changeQueryMode = (e: RadioChangeEvent) => {
    this.setState({
      queryMode: e.target.value
    })
  }

  public render() {
    const { type, views, formedViews, loading, visible, onCancel } = this.props
    const {
      controls,
      editingControlBase,
      editingRelatedItemList,
      editingRelatedViewList,
      defaultValueOptions,
      defaultValueLoading,
      controlFormWillChangeValues,
      optionModalVisible,
      optionSettingFormValues,
      queryMode
    } = this.state

    const modalFooter = [
      <RadioGroup
        key="queryMode"
        className={styles.queryMode}
        value={queryMode}
        onChange={this.changeQueryMode}
      >
        <RadioButton value={ControlQueryMode.Immediately}>立即查询</RadioButton>
        <RadioButton value={ControlQueryMode.Manually}>手动查询</RadioButton>
      </RadioGroup>,
      <Button key="cancel" size="large" onClick={onCancel}>
        取 消
      </Button>,
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
    ]

    return (
      <Modal
        wrapClassName="ant-modal-xlarge"
        title={`${
          type === ControlPanelTypes.Global ? '全局' : '组件'
        }控制器配置`}
        maskClosable={false}
        visible={visible}
        footer={modalFooter}
        onCancel={onCancel}
        afterClose={this.resetForm}
        destroyOnClose
      >
        <ListFormLayout
          type="horizontal"
          initialSize={300}
          minSize={300}
          maxSize={480}
          className={styles.container}
          spliter
        >
          <List
            title="控制器列表"
            className={styles.treeContainer}
            onAddItem={this.addControl}
          >
            <ControlList
              list={controls}
              selected={editingControlBase}
              onSelect={this.selectControl}
              onDelete={this.deleteControl}
              onNameChange={this.changeName}
              onParentChange={this.changeParent}
            />
          </List>
          {editingControlBase && (
            <ControlForm
              type={type}
              views={views}
              formedViews={formedViews}
              controls={controls}
              controlBase={editingControlBase}
              relatedItemList={editingRelatedItemList}
              relatedViewList={editingRelatedViewList}
              defaultValueOptions={defaultValueOptions}
              defaultValueLoading={defaultValueLoading}
              formWillChangeValues={controlFormWillChangeValues}
              onItemCheck={this.itemCheck}
              onCheckAll={this.checkAll}
              onFieldTypeChange={this.fieldTypeChange}
              onControlTypeChange={this.controlTypeChange}
              onMultipleSettingChange={this.multipleSettingChange}
              onSliderPropChange={this.sliderPropChange}
              onOptionTypeChange={this.optionTypeChange}
              onValueViewChange={this.valueViewChange}
              onDefaultValueTypeChange={this.defaultValueTypeChange}
              onGetDefaultValueOptions={this.loadDefaultValueOptions}
              onCommonPropChange={this.commonControlPropChange}
              onOpenOptionModal={this.openOptionModal}
              onDeleteOption={this.deleteOption}
              wrappedComponentRef={this.refHandles.controlForm}
            />
          )}
        </ListFormLayout>
        <OptionSettingForm
          visible={optionModalVisible}
          values={optionSettingFormValues}
          customOptions={editingControlBase?.customOptions}
          optionWithVariable={editingControlBase?.optionWithVariable}
          relatedViewList={editingRelatedViewList}
          onSave={this.saveOptions}
          onCancel={this.closeOptionModal}
          afterClose={this.afterOptionModalClose}
          wrappedComponentRef={this.refHandles.optionSettingForm}
        />
      </Modal>
    )
  }
}

export default ControlConfig
