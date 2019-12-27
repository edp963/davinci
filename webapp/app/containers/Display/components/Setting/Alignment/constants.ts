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

import { LayerAlignmentItemConfig, LayerAlignmentTypes } from './types'

export { LayerAlignmentTypes } from './types'

export const AlignmentGroups: LayerAlignmentItemConfig[][] = [
  [
    {
      title: '上对齐',
      type: LayerAlignmentTypes.Top,
      icon: 'icon-align-top'
    }
  ],
  [
    {
      title: '左对齐',
      type: LayerAlignmentTypes.Left,
      icon: 'icon-align-left'
    },
    {
      title: '水平居中',
      type: LayerAlignmentTypes.HorizontalCenter,
      icon: 'icon-horizontal-center'
    },
    {
      title: '垂直居中',
      type: LayerAlignmentTypes.VerticalCenter,
      icon: 'icon-vertical-center'
    },
    {
      title: '右对齐',
      type: LayerAlignmentTypes.Right,
      icon: 'icon-align-right'
    }
  ],
  [
    {
      title: '下对齐',
      type: LayerAlignmentTypes.Bottom,
      icon: 'icon-align-bottom'
    }
  ]
]
