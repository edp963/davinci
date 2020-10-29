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

import React, { PureComponent } from 'react'
import SplitPane from 'components/SplitPane'
import GlobalControlRelatedItemForm from './GlobalControlRelatedItemForm'
import GlobalControlRelatedViewForm from './GlobalControlRelatedViewForm'
import LocalControlRelatedInfoForm from './LocalControlRelatedInfoForm'
import BaseForm from './BaseForm'
import ValueForm from './ValueForm'
import { Form } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { RadioChangeEvent } from 'antd/lib/radio'
import { TreeNode } from 'antd/lib/tree-select'
import { IControl, IControlOption } from '../../types'
import { IViewBase, IFormedViews } from 'app/containers/View/types'
import { IFlatRelatedItem, IFlatRelatedView } from './types'
import { parseDefaultValue } from '../../util'
import {
  ControlFieldTypes,
  ControlPanelTypes,
  IS_RANGE_TYPE
} from '../../constants'
import styles from '../../Control.less'

interface IControlFormProps extends FormComponentProps {
  type: ControlPanelTypes
  views: IViewBase[]
  formedViews: IFormedViews
  controls: IControl[]
  controlBase: Omit<IControl, 'relatedItems' | 'relatedViews'>
  relatedItemList: IFlatRelatedItem[]
  relatedViewList: IFlatRelatedView[]
  defaultValueOptions: Array<IControlOption | TreeNode>
  defaultValueLoading: boolean
  formWillChangeValues: Partial<IControl>
  onItemCheck: (id: number) => () => void
  onCheckAll: (e: CheckboxChangeEvent) => void
  onFieldTypeChange: (id: number) => (e: RadioChangeEvent) => void
  onControlTypeChange: (value: string) => void
  onMultipleSettingChange: (e: CheckboxChangeEvent) => void
  onSliderPropChange: (min: number, max: number, step: number) => void
  onOptionTypeChange: (e: RadioChangeEvent) => void
  onValueViewChange: (viewId: number) => void
  onDefaultValueTypeChange: (e: RadioChangeEvent) => void
  onGetDefaultValueOptions: () => void
  onCommonPropChange: (propName: string, value) => void
  onOpenOptionModal: (index?: number) => void
  onDeleteOption: (value: string) => () => void
}

class ControlForm extends PureComponent<IControlFormProps> {
  public componentDidMount() {
    const { controlBase, relatedItemList, relatedViewList } = this.props
    this.initControlForm(controlBase, relatedItemList, relatedViewList)
  }

  public componentDidUpdate(prevProps: IControlFormProps) {
    const {
      form,
      controlBase,
      relatedItemList,
      relatedViewList,
      formWillChangeValues
    } = this.props
    if (controlBase.key !== prevProps.controlBase.key) {
      this.initControlForm(controlBase, relatedItemList, relatedViewList)
    }
    if (formWillChangeValues !== prevProps.formWillChangeValues) {
      form.setFieldsValue(formWillChangeValues)
    }
  }

  private initControlForm(
    controlBase: Omit<IControl, 'relatedItems' | 'relatedViews'>,
    relatedItemList: IFlatRelatedItem[],
    relatedViewList: IFlatRelatedView[]
  ) {
    const { form } = this.props
    const relatedItemFormValues = relatedItemList.reduce(
      (values, { id, checked, viewId }) => ({
        ...values,
        [`relatedItems[${id}].checked`]: checked,
        [`relatedItems[${id}].viewId`]: viewId
      }),
      {}
    )
    const relatedViewFormValues = relatedViewList.reduce(
      (values, { id, fieldType, fields }) => ({
        ...values,
        [`relatedViews[${id}].fieldType`]: fieldType,
        [`relatedViews[${id}].fields`]: fields
          ? IS_RANGE_TYPE[controlBase.type] &&
            fieldType === ControlFieldTypes.Variable
            ? fields
            : fields[0]
          : void 0
      }),
      {}
    )
    form.resetFields()
    form.setFieldsValue({
      ...controlBase,
      ...parseDefaultValue(controlBase),
      ...relatedItemFormValues,
      ...relatedViewFormValues
    })
  }

  public render() {
    const {
      form,
      type,
      views,
      formedViews,
      controls,
      controlBase,
      relatedItemList,
      relatedViewList,
      defaultValueOptions,
      defaultValueLoading,
      onItemCheck,
      onCheckAll,
      onFieldTypeChange,
      onControlTypeChange,
      onMultipleSettingChange,
      onSliderPropChange,
      onOptionTypeChange,
      onValueViewChange,
      onDefaultValueTypeChange,
      onGetDefaultValueOptions,
      onCommonPropChange,
      onOpenOptionModal,
      onDeleteOption
    } = this.props

    const commonForm = (
      <>
        <BaseForm
          form={form}
          controls={controls}
          controlBase={controlBase}
          onControlTypeChange={onControlTypeChange}
          onMultipleSettingChange={onMultipleSettingChange}
          onSliderPropChange={onSliderPropChange}
          onCommonPropChange={onCommonPropChange}
        />
        <ValueForm
          form={form}
          views={views}
          formedViews={formedViews}
          controlBase={controlBase}
          defaultValueOptions={defaultValueOptions}
          defaultValueLoading={defaultValueLoading}
          onOptionTypeChange={onOptionTypeChange}
          onValueViewChange={onValueViewChange}
          onDefaultValueTypeChange={onDefaultValueTypeChange}
          onGetDefaultValueOptions={onGetDefaultValueOptions}
          onCommonPropChange={onCommonPropChange}
          onOpenOptionModal={onOpenOptionModal}
          onDeleteOption={onDeleteOption}
        />
      </>
    )
    const compositeForm =
      type === ControlPanelTypes.Global ? (
        <SplitPane
          type="horizontal"
          initialSize={300}
          minSize={300}
          maxSize={480}
          className={styles.splitPanel}
          spliter
        >
          <div className={styles.relatedForm}>
            <GlobalControlRelatedItemForm
              form={form}
              relatedItems={relatedItemList}
              onItemCheck={onItemCheck}
              onCheckAll={onCheckAll}
            />
            <GlobalControlRelatedViewForm
              form={form}
              relatedViews={relatedViewList}
              controlType={controlBase.type}
              optionWithVariable={controlBase.optionWithVariable}
              onFieldTypeChange={onFieldTypeChange}
            />
          </div>
          <div className={styles.commonForm}>{commonForm}</div>
        </SplitPane>
      ) : (
        <div className={styles.commonForm}>
          <LocalControlRelatedInfoForm
            form={form}
            relatedView={relatedViewList[0]}
            controlType={controlBase.type}
            optionWithVariable={controlBase.optionWithVariable}
            onFieldTypeChange={onFieldTypeChange}
          />
          {commonForm}
        </div>
      )

    return <Form className={styles.controlForm}>{compositeForm}</Form>
  }
}

export default Form.create<IControlFormProps>()(ControlForm)
