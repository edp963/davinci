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

const selectBizlogic = (state) => state.get('bizlogic')

const makeSelectBizlogics = () => createSelector(
  selectBizlogic,
  (bizlogicState) => bizlogicState.get('bizlogics')
)

const makeSelectSqlValidateCode = () => createSelector(
  selectBizlogic,
  (bizlogicState) => bizlogicState.get('sqlValidateCode')
)

const makeSelectSqlValidateMsg = () => createSelector(
  selectBizlogic,
  (bizlogicState) => bizlogicState.get('sqlValidateMessage')
)

const makeSelectTableLoading = () => createSelector(
  selectBizlogic,
  (bizlogicState) => bizlogicState.get('tableLoading')
)

const makeSelectModalLoading = () => createSelector(
  selectBizlogic,
  (bizlogicState) => bizlogicState.get('modalLoading')
)

const makeSelectExecuteLoading = () => createSelector(
  selectBizlogic,
  (bizlogicState) => bizlogicState.get('executeLoading')
)

const makeSelectViewTeam = () => createSelector(
  selectBizlogic,
  (bizlogicState) => bizlogicState.get('viewTeam')
)

export {
  selectBizlogic,
  makeSelectBizlogics,
  makeSelectSqlValidateMsg,
  makeSelectSqlValidateCode,
  makeSelectTableLoading,
  makeSelectModalLoading,
  makeSelectExecuteLoading,
  makeSelectViewTeam
}
