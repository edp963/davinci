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
import { IViewModel } from 'containers/View/types'
import { ViewModelTypes } from 'containers/View/constants'
export type ModelTypeName = ViewModelTypes.Category | ViewModelTypes.Value
export type getModelsByTypeName = (typeName: ModelTypeName) => Array<string>

export enum DrillType {
  UP='up',
  DOWN='down'
}

export function hasProperty<T extends Object, U extends keyof T>(obj:T, key:U) {
  return obj[key] ? obj[key] : false
}

export function getModelWithModelType (model: IViewModel){
  return Object.keys(model).reduce((iteratee, target) => {
     iteratee[target] = hasProperty(model[target], 'modelType')
     return iteratee
  }, {})
}

export const filterModelByModelType = function (model: IViewModel): getModelsByTypeName{
  const modelWithModelType = getModelWithModelType(model)
  return function (typeName: ModelTypeName):Array<string> {
    return Object.keys(modelWithModelType).reduce((iteratee, target) => {
      return iteratee.concat(modelWithModelType[target] === typeName ? target : [])
    },[])
  }
}




