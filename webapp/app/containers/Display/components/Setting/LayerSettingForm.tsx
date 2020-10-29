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

import React, { useState, useEffect, useCallback } from 'react'

import { WrappedFormUtils } from 'antd/lib/form/Form'
import { SlideLayerSettingForm } from './Form'

import {
  slideSettings,
  GraphTypes,
  SecondaryGraphTypes
} from './Form/constants'
import { ILayerParams } from '../types'

interface ILayerSettingFormProps {
  type: GraphTypes | SecondaryGraphTypes
  slideId: number
  layerId: number
  layerParams: ILayerParams
  onChange: (layerId: number, changedParams: Partial<ILayerParams>) => void
}

const LayerSettingForm: React.FC<ILayerSettingFormProps> = (props) => {
  const { type, slideId, layerId, layerParams, onChange } = props
  const layerSetting = slideSettings[type]
  const refForm = React.useRef<WrappedFormUtils>(null)
  const [lastLayerId, setLastLayerId] = useState<number>(null)

  useEffect(() => {
    if (refForm.current && layerId !== lastLayerId) {
      refForm.current.setFieldsValue(layerParams)
      setLastLayerId(layerId)
    }
  }, [layerParams, layerId])

  const change = (changedValues, layerId) => {
    onChange(layerId, changedValues)
  }

  return (
    <SlideLayerSettingForm
      wrappedComponentRef={refForm}
      setting={layerSetting}
      slideId={slideId}
      layerId={layerId}
      onChange={change}
    />
  )
}

export default React.memo(LayerSettingForm)
