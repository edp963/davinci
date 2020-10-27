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

export function sliceLength<T, U>(length: number, arr1: T[], arr2: U[]) {
  let loop = true
  return () => {
    return new Array(length)
      .fill(0)
      .map(() => {
        if (loop) {
          loop = false
          return arr1.length ? arr1.shift() : arr2.shift()
        } else {
          loop = true
          return arr2.length ? arr2.shift() : arr1.shift()
        }
      })
      .filter((unEmpty) => unEmpty)
  }
}
