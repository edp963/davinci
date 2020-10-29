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

import { createSelector } from 'reselect'
import { IControlState } from './types'


const selectControl = (state: { control: IControlState }) => state.control
const selectItemId = (_, itemId: number) => itemId

const makeSelectGlobalControlPanelFormValues = () =>
  createSelector(
    selectControl,
    (controlState) => controlState.globalControlPanelFormValues
  )

const makeSelectGlobalControlPanelSelectOptions = () =>
  createSelector(
    selectControl,
    (controlState) => controlState.globalControlPanelSelectOptions
  )

const makeSelectLocalControlPanelFormValues = () =>
  createSelector(
    selectControl,
    selectItemId,
    (controlState, itemId) => controlState.localControlPanelFormValues[itemId]
  )

const makeSelectLocalControlPanelSelectOptions = () =>
  createSelector(
    selectControl,
    selectItemId,
    (controlState, itemId) =>
      controlState.localControlPanelSelectOptions[itemId]
  )

export {
  makeSelectGlobalControlPanelFormValues,
  makeSelectGlobalControlPanelSelectOptions,
  makeSelectLocalControlPanelFormValues,
  makeSelectLocalControlPanelSelectOptions
}
