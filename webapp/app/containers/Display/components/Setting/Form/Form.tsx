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

import React, { useImperativeHandle, forwardRef } from 'react'
import debounce from 'lodash/debounce'

import { Form } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import ItemGroup from './ItemGroup'

import { SlideLayerSetting } from './types'

import { SlideSettingContext } from './util'

import './Form.less'

interface ISettingFormProps extends FormComponentProps {
  setting: SlideLayerSetting
  slideId: number
  layerId?: number
  onChange: (
    changedValues: { [name: string]: number | string },
    layerId?: number
  ) => void
}

const SettingForm: React.FC<ISettingFormProps> = (props, ref) => {
  const { form, setting, slideId, layerId } = props

  useImperativeHandle(ref, () => form)

  return (
    <Form className="display-setting-form" labelAlign="left">
      <SlideSettingContext.Provider value={{ form, slideId, layerId, size: 'small' }}>
        {setting.params.map((param) => (
          <ItemGroup key={param.name} param={param} />
        ))}
      </SlideSettingContext.Provider>
    </Form>
  )
}

let cachedValues = {}

export default Form.create<ISettingFormProps>({
  onValuesChange: (props, changedValues) => {
    if (Object.keys(changedValues).length > 1) {
      return
    }
    cachedValues = { ...cachedValues, ...changedValues }
    const { onChange, layerId } = props
    const debouncedChange = debounce((layerId) => {
      onChange({ ...cachedValues }, layerId)
      cachedValues = {}
    }, 1000)
    debouncedChange(layerId)
  }
})(forwardRef(SettingForm))
