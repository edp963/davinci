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
import classnames from 'classnames'
import { ResizeHandle } from 'libs/react-resizable/lib/Resizable'

export default (handle: ResizeHandle) => {
  const cls = classnames({
    'resize-handle': true,

    'resize-handle-horizontal': handle === 'e' || handle === 'w',
    'resize-handle-horizontal-1': handle === 'e',
    'resize-handle-horizontal-2': handle === 'w',

    'resize-handle-vertical': handle === 's' || handle === 'n',
    'resize-handle-vertical-1': handle === 's',
    'resize-handle-vertical-2': handle === 'n'
  })

  return <div className={cls} />
}
