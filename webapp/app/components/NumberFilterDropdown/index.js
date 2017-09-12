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
// import Select from 'antd/lib/select'
const InputGroup = Input.Group

import utilStyles from '../../assets/less/util.less'

export function NumberFilterDropdown (props) {
  return (
    <div className={utilStyles.searchFilterDropdown}>
      <InputGroup size="large" compact>
        <Input
          className={utilStyles.number}
          value={props.from}
          placeholder="从"
          onChange={props.onFromChange}
          onPressEnter={props.onSearch}
        />
        <Input className={utilStyles.numberDivider} placeholder="~" readOnly tabIndex="-1" />
        <Input
          className={`${utilStyles.number} ${utilStyles.to}`}
          value={props.to}
          placeholder="到"
          onChange={props.onToChange}
          onPressEnter={props.onSearch}
        />
      </InputGroup>
    </div>
  )
}

NumberFilterDropdown.propTypes = {
  from: PropTypes.string,
  to: PropTypes.string,
  onFromChange: PropTypes.func,
  onToChange: PropTypes.func,
  onSearch: PropTypes.func
}

export default NumberFilterDropdown
