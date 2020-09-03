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

import { Input } from 'antd'
const InputGroup = Input.Group

const styles = require('./NumberRange.less')

interface INumberRangeProps {
  placeholder?: string
  value?: string[]
  size?: 'default' | 'large' | 'small'
  onChange?: (value: string[]) => void
  onSearch?: (value: string[]) => void
}

interface INumberRangeStates {
  value: string[]
}

export class NumberRange extends PureComponent<INumberRangeProps, INumberRangeStates> {
  constructor (props) {
    super(props)
    this.state = {
      value: props.value ? props.value.slice() : ['', '']
    }
  }

  private static defaultProps = {
    placeholder: '',
    size: 'default'
  }

  public componentWillReceiveProps (nextProps) {
    const nextValue = nextProps.value
    const { value } = this.state

    if (nextValue) {
      if (nextValue[0] !== value[0] || nextValue[1] !== value[1]) {
        this.setState({
          value: nextValue.slice()
        })
      }
    } else {
      this.setState({
        value: ['', '']
      })
    }
  }

  private inputChange = (dir) => {
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

  private inputSearch = () => {
    const { onSearch } = this.props
    if (onSearch) {
      onSearch(this.state.value)
    }
  }

  public render () {
    const { placeholder, size } = this.props
    const { value } = this.state

    return (
      <InputGroup className={styles.range} {...(size && { size })} compact>
        <Input
          className={styles.number}
          value={value[0]}
          placeholder={`${placeholder || ''}从`}
          onChange={this.inputChange('from')}
          onPressEnter={this.inputSearch}
        />
        <Input className={styles.numberDivider} placeholder="-" readOnly tabIndex={-1} />
        <Input
          className={styles.number}
          value={value[1]}
          placeholder="到"
          onChange={this.inputChange('to')}
          onPressEnter={this.inputSearch}
        />
      </InputGroup>
    )
  }
}

export default NumberRange
