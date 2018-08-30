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

import line from './line'
import bar from './bar'
import scatter from './scatter'
import pie from './pie'
import radar from './radar'

export default function (type, elementSize) {
  switch (type) {
    case 'line': return line()
    case 'bar': return bar(elementSize)
    case 'scatter': return scatter()
    case 'pie': return pie()
    case 'radar': return radar()
  }
}