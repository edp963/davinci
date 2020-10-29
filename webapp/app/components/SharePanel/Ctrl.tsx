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

import React, { useCallback } from 'react'
import styles from './SharePanel.less'
import { Radio } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
import { ICtrl } from './types'

const Contrl: React.FC<ICtrl> = ({ mode, onModeChange }) => {
  const radioChange = useCallback(
    (e: RadioChangeEvent) => {
      onModeChange(e.target.value)
    },
    [mode]
  )

  return (
    <div className={styles.panelHead}>
      <RadioGroup
        defaultValue={mode}
        buttonStyle="solid"
        onChange={radioChange}
      >
        <RadioButton value="NORMAL">普通分享</RadioButton>
        <RadioButton value="PASSWORD">口令分享</RadioButton>
        <RadioButton value="AUTH">授权分享</RadioButton>
      </RadioGroup>
    </div>
  )
}

export default Contrl
