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

type SettingComponent =
  | { component: 'input'; placeholder: string; default: string }
  | {
      component: 'inputnumber'
      placeholder: string
      min: number
      max: number
      default: number
    }
  | {
      component: 'colorPicker'
      default: [number, number, number, number]
    }
  | {
      component: 'radio'
      default: string
      values: Array<{ name: string; value: string }>
    }
  | {
      component: 'checkbox',
      valuePropName: 'checked'
      default: boolean
  } | {
      component: 'checkboxGroup'
      values: Array<{ label: string; value: string }>
      default: string[]
    }
  | {
      component: 'select'
      default: string
      values: Array<{ name: string; value: string }>
    }
  | {
      component: 'upload'
      title: string
      id: number
      action: string
      accept: string
      autoUpdate: boolean
      labelCol: number
      wrapperCol: number
    }

export type SettingItem = {
  name: string
  title: string
  default: string | number
  relatedItems: Array<{
    name: string,
    values: string[] | number[] | boolean[]
  }>
  labelCol?: number
  wrapperCol?: number
  span?: number
} & SettingComponent

export type SettingParam = {
  name: string
  title: string
  items: SettingItem[]
}

export type SlideLayerSetting = {
  name: string
  title: string
  params: SettingParam[]
}
