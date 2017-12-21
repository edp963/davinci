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
  LOAD_REPOS,
  LOAD_REPOS_SUCCESS,
  LOAD_REPOS_ERROR
} from '../constants'

import {
  loadRepos,
  reposLoaded,
  repoLoadingError
} from '../actions'

describe('App Actions', () => {
  describe('loadRepos', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: LOAD_REPOS
      }

      expect(loadRepos()).toEqual(expectedResult)
    })
  })

  describe('reposLoaded', () => {
    it('should return the correct type and the passed repos', () => {
      const fixture = ['Test']
      const username = 'test'
      const expectedResult = {
        type: LOAD_REPOS_SUCCESS,
        repos: fixture,
        username
      }

      expect(reposLoaded(fixture, username)).toEqual(expectedResult)
    })
  })

  describe('repoLoadingError', () => {
    it('should return the correct type and the error', () => {
      const fixture = {
        msg: 'Something went wrong!'
      }
      const expectedResult = {
        type: LOAD_REPOS_ERROR,
        error: fixture
      }

      expect(repoLoadingError(fixture)).toEqual(expectedResult)
    })
  })
})
