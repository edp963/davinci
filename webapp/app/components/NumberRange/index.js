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

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import Input from 'antd/lib/input'
const InputGroup = Input.Group

import styles from './NumberRange.less'

export class NumberRange extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      value: props.value ? props.value.slice() : ['', '']
    }
  }

  componentWillUpdate (nextProps) {
    const nextValue = nextProps.value
    const { value } = this.state

    if (nextValue) {
      if (nextValue[0] !== value[0] || nextValue[1] !== value[1]) {
        this.state.value = nextValue.slice()
      }
    }
  }

  inputChange = (dir) => {
    const { onChange } = this.props
    const { value } = this.state

    return function (e) {
      if (dir === 'from') {
        onChange([e.target.value.trim(), value[1]])
      } else {
        onChange([value[0], e.target.value.trim()])
      }
    }
  }

  inputSearch = () => {
    this.props.onSearch(this.state.value)
  }

  render () {
    const { placeholder } = this.props
    const { value } = this.state

    return (
      <InputGroup size="large" className={`${styles.range} ${styles.group}`} compact>
        <Input
          className={styles.number}
          value={value[0]}
          placeholder={`${placeholder || ''}从`}
          onChange={this.inputChange('from')}
          onPressEnter={this.inputSearch}
        />
        <Input className={styles.numberDivider} placeholder="~" readOnly tabIndex="-1" />
        <Input
          className={`${styles.number} ${styles.to}`}
          value={value[1]}
          placeholder="到"
          onChange={this.inputChange('to')}
          onPressEnter={this.inputSearch}
        />
      </InputGroup>
    )
  }
}

NumberRange.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.array,
  onChange: PropTypes.func,
  onSearch: PropTypes.func
}

export default NumberRange
