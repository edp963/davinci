import { getSourceInitialState } from 'app/containers/Source/reducer'
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

import {
  selectSource,
  makeSelectSources
} from 'app/containers/Source/selectors'

const state = {
  source: getSourceInitialState()
}

describe('selectSource', () => {
  it('should select the source state', () => {
    expect(selectSource(state)).toEqual(state.source)
  })
})

describe('makeSelectSources', () => {
  const sourcesSelector = makeSelectSources()

  it('should select the sources', () => {
    expect(sourcesSelector(state)).toEqual(state.source.sources)
  })

  it('should memo correctly', () => {
    sourcesSelector(state)
    expect(sourcesSelector.recomputations()).toBe(1)
    sourcesSelector(state)
    expect(sourcesSelector.recomputations()).toBe(1)
    sourcesSelector({
      ...state,
      source: {
        ...state.source
      }
    })
    expect(sourcesSelector.recomputations()).toBe(2)
  })
})
