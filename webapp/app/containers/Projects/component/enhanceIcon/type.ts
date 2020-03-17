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
import React from 'react'
import {Icon, IconProps} from 'antd/lib/icon'

export const tuple = <T extends string[]>(...args: T) => args

export const tupleNum = <T extends number[]>(...args: T) => args

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K >>

type loading = boolean | {delay?: number}

const x: loading = { 
  delay: 1
}

const IconStatus = tuple('checked', 'unChecked', 'disabled')
const ISizeType = tuple('small', 'middle', 'large')

type iconFontClassName = string

interface BaseEnhanceState {
  iStatus: typeof IconStatus[number]
  form: React.ReactNode | iconFontClassName
}

export interface BaseEnhanceIconProps {
  state?: BaseEnhanceState
  style?: React.CSSProperties
  size?: typeof ISizeType[number]
  onClick?: React.MouseEventHandler<HTMLElement>
}