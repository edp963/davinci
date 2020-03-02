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

import { DEFAULT_BASELINE_COLOR } from './constants'
import { IBaseline } from './types'

interface IBaselineProps {
  value: IBaseline
}

const Baseline: React.FC<IBaselineProps> = (props) => {
  const { top, right, bottom, left } = props.value
  const style: React.CSSProperties = {
    position: 'absolute',
    zIndex: 999999,
    top: `${top}px`,
    right: `${right}px`,
    bottom: `${bottom}px`,
    left: `${left}px`,
    backgroundColor: DEFAULT_BASELINE_COLOR
  }
  return (
    <div style={style} />
  )
}

export default Baseline
