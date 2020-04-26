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
import { TextStyles, ElementTypes, BlockAlignments } from '../../Element'

import TextStyleIcon from './TextStyleIcon'
import ElementIcon from './ElementIcon'
import ToolbarColor from './Color'
import { TextProperties } from '../../Element/constants'

const Format: React.FC = () => {
  return (
    <>
      <TextStyleIcon value={TextStyles.Bold} type="bold" />
      <TextStyleIcon value={TextStyles.Italic} type="italic" />
      <TextStyleIcon value={TextStyles.Underline} type="underline" />
      <TextStyleIcon value={TextStyles.StrikeThrough} type="strikethrough" />
      <TextStyleIcon value={TextStyles.Code} type="code" />

      <ElementIcon value={ElementTypes.BlockQuote} iconFont type="icon-quote" />
      <ElementIcon value={ElementTypes.NumberedList} type="ordered-list" />
      <ElementIcon value={ElementTypes.BulletedList} type="unordered-list" />

      <ToolbarColor type={TextProperties.Color} />
      <ToolbarColor type={TextProperties.BackgroundColor} />
    </>
  )
}

export default Format
