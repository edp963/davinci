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

import React, { useContext, useState, useEffect } from 'react'
import moment from 'moment'

import { useLabelStyle } from './hooks'
import { LayerContext } from '../../util'

const Timer: React.FC = () => {
  const { layer: { params } } = useContext(LayerContext)
  const labelStyle = useLabelStyle(params)

  const { timeDuration, timeFormat } = params
  const [currentTime, setCurrentTime] = useState(
    moment().format(timeFormat || 'YYYY-MM-dd HH:mm:ss')
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format(timeFormat || 'YYYY-MM-dd HH:mm:ss'))
    }, timeDuration)

    return () => {
      clearInterval(timer)
    }
  }, [timeFormat])

  return <p style={labelStyle}>{currentTime}</p>
}

export default Timer
