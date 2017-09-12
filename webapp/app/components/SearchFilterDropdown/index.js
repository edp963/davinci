/*-
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

import React, { PropTypes } from 'react'

import Input from 'antd/lib/input'
const Search = Input.Search

import utilStyles from '../../assets/less/util.less'

export function SearchFilterDropdown (props) {
  return (
    <div className={utilStyles.searchFilterDropdown}>
      <Search
        size="large"
        placeholder={`Search ${props.columnName}`}
        value={props.filterValue}
        onChange={props.onSearchInputChange}
        onSearch={props.onSearch}
      />
    </div>
  )
}

SearchFilterDropdown.propTypes = {
  columnName: PropTypes.string,
  filterValue: PropTypes.string,
  onSearchInputChange: PropTypes.func,
  onSearch: PropTypes.func
}

export default SearchFilterDropdown
