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

import React, { PureComponent, createRef, RefObject, MouseEvent } from 'react'
import classnames from 'classnames'
import { Icon, Input, message } from 'antd'
import styles from './ListFormLayout.less'

interface IListItemProps {
  id: string
  name: string
  className?: string
  onClick?: (key: string) => void
  onChange: (key: string, name: string) => void
  onDelete: (key: string) => void
}

interface IListItemStates {
  editing: boolean
  inputValue: string
}

class ListItem extends PureComponent<IListItemProps, IListItemStates> {
  public state: IListItemStates = {
    editing: false,
    inputValue: this.props.name
  }

  private container: RefObject<HTMLDivElement> = createRef()
  private input: RefObject<Input> = createRef()

  private inputValueChange = (e) => {
    this.setState({
      inputValue: e.target.value
    })
  }

  private editStart = () => {
    this.setState(
      {
        editing: true
      },
      () => {
        this.input.current.input.select()
        window.addEventListener('click', this.editFallback, false)
        window.addEventListener('keydown', this.enterToFinish, false)
      }
    )
  }

  private editFallback = (e) => {
    if (!this.container.current.contains(e.target)) {
      this.setState({
        editing: false,
        inputValue: this.props.name
      })
      window.removeEventListener('click', this.editFallback, false)
      window.removeEventListener('keydown', this.enterToFinish, false)
    }
  }

  private editFinish = () => {
    const { id } = this.props
    const { inputValue } = this.state
    if (inputValue) {
      this.props.onChange(id, inputValue)
      this.setState({
        editing: false
      })
      window.removeEventListener('click', this.editFallback, false)
      window.removeEventListener('keydown', this.enterToFinish, false)
    } else {
      message.error('名称不能为空')
      this.input.current.input.focus()
    }
  }

  private enterToFinish = (e: KeyboardEvent) => {
    if (e.keyCode === 13) {
      this.editFinish()
    }
  }

  private click = () => {
    const { id, onClick } = this.props
    if (onClick) {
      onClick(id)
    }
  }

  private delete = (e: MouseEvent) => {
    e.stopPropagation()
    const { id, onDelete } = this.props
    onDelete(id)
  }

  public render() {
    const { name, className, onClick } = this.props
    const { editing, inputValue } = this.state

    const contentClass = classnames({
      [styles.listItem]: true,
      [styles.editing]: editing,
      [className]: !!className
    })

    return (
      <div className={contentClass} ref={this.container}>
        <h4 onClick={this.click}>{name}</h4>
        <Input
          value={inputValue}
          placeholder="请输入名称"
          size="small"
          onChange={this.inputValueChange}
          ref={this.input}
        />
        <Icon
          className={styles.confirm}
          type="check"
          onClick={this.editFinish}
        />
        <Icon type="edit" className={styles.action} onClick={this.editStart} />
        <Icon type="delete" className={styles.action} onClick={this.delete} />
      </div>
    )
  }
}

export default ListItem
