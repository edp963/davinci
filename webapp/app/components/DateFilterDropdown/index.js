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

import React from 'react'
import PropTypes from 'prop-types'

import { Input, DatePicker } from 'antd'
import { uuid } from 'utils/util'
const InputGroup = Input.Group
const RangePicker = DatePicker.RangePicker

import utilStyles from 'assets/less/util.less'

export function DateFilterDropdown (props) {
  const key = `dfd${uuid(8, 16)}`
  return (
    <div className={`${utilStyles.searchFilterDropdown} ${key}`}>
      <InputGroup size="large" compact>
        <RangePicker
          format={'YYYY-MM-DD'}
          onChange={props.onChange}
          onOk={props.onSearch}
          getCalendarContainer={() => document.querySelector(`.${key}`)}
        />
      </InputGroup>
    </div>
  )
}

DateFilterDropdown.propTypes = {
  // from: PropTypes.string,
  // to: PropTypes.string,
  onChange: PropTypes.func,
  onSearch: PropTypes.func
}

export default DateFilterDropdown
