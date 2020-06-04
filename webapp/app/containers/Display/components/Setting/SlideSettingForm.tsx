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

import React, { useEffect } from 'react'
import { SlideLayerSettingForm } from './Form'

import { WrappedFormUtils } from 'antd/lib/form/Form'
import { slideSettings, GraphTypes } from './Form/constants'
import { ISlideParams } from 'containers/Viz/types'
const slideSetting = slideSettings[GraphTypes.Slide]

interface ISlideSettingFormProps {
  slideId: number
  slideParams: ISlideParams
  onChange: (changedValues: Partial<ISlideParams>) => void
}

const SlideSettingForm: React.FC<ISlideSettingFormProps> = (props) => {
  const { slideId, slideParams, onChange } = props
  const refForm = React.useRef<WrappedFormUtils>(null)

  useEffect(() => {
    if (refForm.current) {
      const fieldsValue: ISlideParams = {
        autoSlideGlobal: true,
        autoPlay: true,
        transitionGlobal: true,
        backgroundImage: undefined,
        ...slideParams
      }
      refForm.current.setFieldsValue(fieldsValue)
    }
  }, [slideParams])

  return (
    <SlideLayerSettingForm
      wrappedComponentRef={refForm}
      setting={slideSetting}
      slideId={slideId}
      onChange={onChange}
    />
  )
}

export default React.memo(SlideSettingForm)
