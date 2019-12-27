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
import { ResizeHandle } from 'libs/react-resizable'

export default (handle: ResizeHandle) => {
  const cls = classnames({
    'split-pane-resize-handle': true,

    'split-pane-resize-handle-horizontal': handle === 'e' || handle === 'w',
    'split-pane-resize-handle-horizontal-1': handle === 'e',
    'split-pane-resize-handle-horizontal-2': handle === 'w',

    'split-pane-resize-handle-vertical': handle === 's' || handle === 'n',
    'split-pane-resize-handle-vertical-1': handle === 's',
    'split-pane-resize-handle-vertical-2': handle === 'n'
  })

  return <div className={cls} />
}
