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
import { fromJS } from 'immutable'
import { connect } from 'react-redux'
import {
  IGlobalControlRelatedItem,
  InteractionType,
  IControlRelatedField,
  ILocalControl
} from '../types'
import {
  getDefaultLocalControl,
  deserializeDefaultValue,
  serializeDefaultValue,
  getRelatedFieldsInfo
} from '../util'
import { ControlTypes, IS_RANGE_TYPE} from '../constants'
import { localControlMigrationRecorder } from 'app/utils/migrationRecorders'

import { ListFormLayout, List } from 'app/components/ListFormLayout'
import ControlList from '../Config/ControlList'
import ControlFormWithRedux, { ControlForm } from '../Config/ControlForm'
import OptionSettingFormWithModal, { OptionSettingForm } from '../Config/OptionSettingForm'
import { Form, Row, Col, Button, Modal, Radio, Select, Checkbox } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import ControlActions from 'containers/ControlPanel/actions'
import { IViewVariable, IFormedView, IViewModelProps } from 'app/containers/View/types'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import styles from '../Control.less'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const Option = Select.Option

export interface IRelatedItemSource extends IGlobalControlRelatedItem {
  id: number
  name: string
}

export interface IRelatedSource {
  model: IViewModelProps[]
  variables: IViewVariable[]
  fields: IControlRelatedField | IControlRelatedField[]
}

interface ILocalControlConfigProps {
  currentControls: ILocalControl[]
  view: IFormedView
  visible: boolean
  onCancel: () => void
  onSave: (controlItems: any[]) => void
  onSetConfigFormValues: (values) => void
}

interface ILocalControlConfigStates {
  controls: ILocalControl[]
  selected: ILocalControl
  relatedFields: IRelatedSource
  optionModalVisible: boolean,
  optionValues: string
}

export class LocalControlConfig extends React.Component<ILocalControlConfigProps, ILocalControlConfigStates> {

  constructor (props) {
    super(props)
    this.state = {
      controls: [],
      selected: null,
      relatedFields: null,
      optionModalVisible: false,
      optionValues: ''
    }
  }

  private controlForm = createRef<ControlForm>()
  private optionSettingForm = createRef<OptionSettingForm>()

  public componentWillReceiveProps (nextProps: ILocalControlConfigProps) {
    const { view, currentControls, visible } = nextProps
    if (currentControls !== this.props.currentControls
        || visible && !this.props.visible) {
      let selected
      const controls = fromJS(currentControls).toJS().map((control) => {
        control = localControlMigrationRecorder(control)
        if (!selected && !control.parent) {
          selected = control
        }
        return control
      })
      this.setState({
        controls,
        selected,
        relatedFields: this.getRelatedFields(selected, view)
      })
      this.setFormData(selected)
    }
  }

  private getRelatedFields = (selected: ILocalControl, view?: IFormedView): IRelatedSource => {
    if (!view) {
      view = this.props.view
    }
    if (selected) {
      const { type, interactionType, fields } = selected
      return getRelatedFieldsInfo(view, type, interactionType, fields)
    }
    return null
  }

  private setFormData = (control: ILocalControl) => {
    if (control) {
      const { type, interactionType, defaultValue, ...rest } = control
      const fieldsValue = {
        type,
        defaultValue: deserializeDefaultValue(control),
        ...rest
      }
      this.props.onSetConfigFormValues(fieldsValue)
    } else {
      this.props.onSetConfigFormValues(null)
    }
  }

  private selectControl = (key: string) => {
    this.getCachedFormValues((err, controls) => {
      if (err) { return }
      const selected = controls.find((c) => c.key === key)
      this.setState({
        selected,
        controls,
        relatedFields: this.getRelatedFields(selected)
      })
      this.setFormData(selected)
    })
  }

  private addControl = () => {
    const { view } = this.props
    const { controls, selected } = this.state
    const control: ILocalControl = getDefaultLocalControl(view)

    if (selected) {
      this.getCachedFormValues((err, cachedControls) => {
        if (err) { return }
        this.setState({
          controls: [...cachedControls, control],
          selected: control,
          relatedFields: this.getRelatedFields(control)
        })
        this.setFormData(control)
      })
    } else {
      this.setState({
        controls: [...controls, control],
        selected: control,
        relatedFields: this.getRelatedFields(control)
      })
      this.setFormData(control)
    }
  }

  private deleteControl = (keys: string[], reselectedKey: string) => {
    const { controls } = this.state

    const reselected = reselectedKey
      ? controls.find((c) => c.key === reselectedKey)
      : null

    this.setState({
      controls: controls.filter((c) => !keys.includes(c.key)),
      selected: reselected,
      relatedFields: this.getRelatedFields(reselected)
    })
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

  private changeName = (key: string, name: string) => {
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
    const { controls, selected, relatedFields } = this.state
    this.controlForm.current.props.form.validateFieldsAndScroll((err, values) => {
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
            fields: relatedFields.fields
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

  private modelOrVariableSelect = (value: string | string[]) => {
    const { selected, relatedFields } = this.state
    const { model, variables } = relatedFields

    let fields
    let detail
    if (selected.interactionType === 'column') {
      detail = model.find((m) => m.name === value)
      fields = {
        name: detail.name,
        type: detail.sqlType
      }
    } else {
      if (IS_RANGE_TYPE[selected.type]) {
        fields = (value as string[]).map((str) => {
          detail = variables.find((m) => m.name === str)
          return {
            name: detail.name,
            type: detail.valueType
          }
        })
      } else {
        detail = variables.find((m) => m.name === value)
        fields = {
          ...selected.type === ControlTypes.Select && relatedFields.fields,
          name: detail.name,
          type: detail.valueType
        }
      }
    }

    this.setState({
      relatedFields: {
        ...relatedFields,
        fields
      }
    })
  }

  private optionsFromColumnChecked = (e: CheckboxChangeEvent) => {
    const { relatedFields } = this.state
    this.setState({
      relatedFields: {
        ...relatedFields,
        fields: {
          ...relatedFields.fields,
          optionsFromColumn: e.target.checked
        }
      }
    })
  }

  private optionsFromColumnSelect = (value: string) => {
    const { relatedFields } = this.state
    this.setState({
      relatedFields: {
        ...relatedFields,
        fields: {
          ...relatedFields.fields,
          column: value
        }
      }
    })
  }

  private interactionTypeChange = (e: RadioChangeEvent) => {
    const currentSelected = this.state.selected
    const selected = {
      ...currentSelected,
      interactionType: e.target.value,
      fields: void 0
    }
    this.setState({
      selected,
      relatedFields: this.getRelatedFields({
        ...selected,
        fields: void 0
      })
    })
  }

  private controlTypeChange = (value) => {
    const { selected } = this.state
    const { interactionType, fields } = selected

    const changedSelected = {
      ...selected,
      type: value,
      fields: this.getValidaFields(interactionType, value, fields)
    }

    this.setState({
      selected: changedSelected,
      relatedFields: this.getRelatedFields(changedSelected)
    })
  }

  private getValidaFields = (
    interactionType: InteractionType,
    type: ControlTypes,
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
      this.controlForm.current.props.form.setFieldsValue({options})
      this.closeOptionModal()
    })
  }

  public render () {
    const { visible, onCancel } = this.props
    const {
      controls,
      selected,
      relatedFields,
      optionModalVisible,
      optionValues
    } = this.state

    let interactionType
    let interactionTypeContent
    let variableSelect
    let model = []
    let variables = []
    let fieldsValue
    let isMultiple
    let optionsFromColumn
    let column

    if (selected) {
      const { type: t, interactionType: it } = selected
      const { model: o, variables: v, fields } = relatedFields
      interactionType = it
      interactionTypeContent = interactionType === 'column' ? '字段' : '变量'
      variableSelect = it === 'variable' && t === ControlTypes.Select
      model = o
      variables = v
      if (Array.isArray(fields)) {
        isMultiple = true
        fieldsValue = fields.map((f) => f.name)
      } else {
        isMultiple = false
        if (fields) {
          fieldsValue = fields.name
          optionsFromColumn = fields.optionsFromColumn
          column = fields.column
        }
      }
    }

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
        onClick={this.save}
      >
        保 存
      </Button>
    )]

    return (
      <Modal
        wrapClassName="ant-modal-xlarge"
        title="本地控制器配置"
        maskClosable={false}
        visible={visible}
        footer={modalButtons}
        onCancel={onCancel}
        afterClose={this.resetForm}
      >
        <ListFormLayout
          type="horizontal"
          initialSize={256}
          minSize={256}
          maxSize={480}
          className={styles.controlConfig}
          spliter
        >
          <List
            title="控制器列表"
            className={styles.treeContainer}
            onAddItem={this.addControl}
          >
            <ControlList
              list={controls}
              selected={selected}
              onSelect={this.selectControl}
              onDelete={this.deleteControl}
              onNameChange={this.changeName}
              onParentChange={this.changeParent}
            />
          </List>
          {
            selected && (
              <div className={styles.localConfigForm}>
                <div className={styles.baseForm}>
                  <div className={styles.title}>
                    <h2>基础配置</h2>
                  </div>
                  <Row gutter={8} className={styles.formBody}>
                    <Col span={4}>
                      <FormItem label="类型">
                        <RadioGroup
                          value={interactionType}
                          onChange={this.interactionTypeChange}
                        >
                          <Radio value="column">字段</Radio>
                          <Radio value="variable">变量</Radio>
                        </RadioGroup>
                      </FormItem>
                    </Col>
                    {variableSelect && (
                      <Col span={4}>
                        <FormItem label=" " colon={false}>
                          <Checkbox
                            checked={optionsFromColumn}
                            onChange={this.optionsFromColumnChecked}
                          >
                            从字段取值
                          </Checkbox>
                        </FormItem>
                      </Col>
                    )}
                    <Col span={8}>
                      <FormItem label={`关联${interactionTypeContent}`}>
                        <Select
                          placeholder="请选择"
                          className={styles.selector}
                          value={fieldsValue}
                          onChange={this.modelOrVariableSelect}
                          dropdownMatchSelectWidth={false}
                          {...isMultiple && {mode: 'multiple'}}
                        >
                          {
                            interactionType === 'column'
                              ? model.map((m: IViewModelProps) => (
                                <Option key={m.name} value={m.name}>{m.name}</Option>
                              ))
                              : variables.map((v) => (
                                <Option
                                  key={v.name}
                                  value={v.name}
                                  disabled={
                                    isMultiple
                                    && fieldsValue.length === 2
                                    && !fieldsValue.includes(v.name)
                                  }
                                >
                                  {v.name}
                                </Option>
                              ))
                          }
                        </Select>
                      </FormItem>
                    </Col>
                    {optionsFromColumn && (
                      <Col span={8}>
                        <FormItem label="取值字段">
                        <Select
                          placeholder="请选择"
                          className={styles.selector}
                          value={column}
                          onChange={this.optionsFromColumnSelect}
                          dropdownMatchSelectWidth={false}
                          {...isMultiple && {mode: 'multiple'}}
                        >
                          {
                            model.map((m: IViewModelProps) => (
                              <Option key={m.name} value={m.name}>{m.name}</Option>
                            ))
                          }
                        </Select>
                        </FormItem>
                      </Col>
                    )}
                  </Row>
                </div>
                <ControlFormWithRedux
                  interactionType={selected.interactionType}
                  onControlTypeChange={this.controlTypeChange}
                  onOpenOptionModal={this.openOptionModal}
                  wrappedComponentRef={this.controlForm}
                />
              </div>
            )
          }
        </ListFormLayout>
        <OptionSettingFormWithModal
          visible={optionModalVisible}
          options={optionValues}
          onSave={this.saveOptions}
          onCancel={this.closeOptionModal}
          wrappedComponentRef={this.optionSettingForm}
        />
      </Modal>
    )
  }
}

function mapDispatchToProps (dispatch) {
  return {
    onSetConfigFormValues: (values) => dispatch(ControlActions.setConfigFormValues(values))
  }
}

export default connect(null, mapDispatchToProps)(LocalControlConfig)
