
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

import { IValue } from 'utils/types'

export abstract class OperateObjectAbstract {

  public getTarget<T> (target: T): T {
    return target
  }

  public getTargetPropsByProperty <T, U extends keyof T> (target: T, property: U): IValue<T, U> {
    return target[property]
  }

  public setTargetPropsByProperty<T, K extends keyof T, U extends IValue<T, K>> (target: T, property: K, value: U): T {
    target[property] = value
    return target
  }

  public setTargetProps<T> (target: T, source: Partial<T>): T {
    try {
      Object.keys(target).forEach((property: keyof T) => {
        this.setTargetPropsByProperty(target, property, source[property])
      })
    } catch (error) {
      throw new Error(error)
    }
    return target
  }

  public static getPropsByPropery<T, U extends keyof T> (target: T, property: U): IValue<T, U> {
    return target[property]
  }

}






