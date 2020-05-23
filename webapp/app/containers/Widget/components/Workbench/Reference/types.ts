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

import {
  ReferenceType,
  ReferenceValueType,
  ReferenceLabelPosition
} from './constants'

export type IReference = IReferenceLine | IReferenceBand

export interface IReferenceLine {
  key: string
  type: ReferenceType.Line
  name: string
  data: IReferenceLineData
}

export interface IReferenceBand {
  key: string
  type: ReferenceType.Band
  name: string
  data: [IReferenceBandData, IReferenceBandData]
}

export interface IReferenceBaseData {
  metric: string
  type: ReferenceValueType
  value: number
}

export interface IReferenceLineData extends IReferenceBaseData {
  label: {
    visible: boolean
    position: ReferenceLabelPosition
    font: {
      size: string
      family: string
      // style: string
      // weight: string
      color: string
    }
  }
  line: {
    width: number
    type: string
    color: string
  }
}

export interface IReferenceBandData extends IReferenceBaseData {
  label?: {
    visible: boolean
    position: string
    font: {
      size: string
      family: string
      // style: string
      // weight: string
      color: string
    }
  }
  band?: {
    color: string
    border: {
      width: number
      type: string
      color: string
    }
  }
}
