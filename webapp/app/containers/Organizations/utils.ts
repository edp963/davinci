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
interface ICacheColorMap<T> {
  [key: string]: T
}

const getOnlyColor = <T>(defaultArray: T[]) => {
  const cacheColorMap: ICacheColorMap<T> = {}
  const stackUp: T[] = [...defaultArray]
  const stackDown: T[] = []
  return (key: string) => {
    if (cacheColorMap[key]) {
      return cacheColorMap[key]
    } else {
      if (stackUp && stackUp.length) {
        const pop = stackUp.pop()
        stackDown.push(pop)
        cacheColorMap[key] = pop
        return cacheColorMap[key]
      } else {
        const pop = stackDown.pop()
        stackUp.push(pop)
        cacheColorMap[key] = pop
        return cacheColorMap[key]
      }
    }
  }
}

declare const antdTagColors: [
  'magenta',
  'red',
  'volcano',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple'
]

const antdTagColorList: TColors[] = [
  'magenta',
  'red',
  'volcano',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple'
]

type TColors = typeof antdTagColors[number]

export const getAntTagColor = getOnlyColor<TColors>(antdTagColorList)
