import React, { PureComponent, createRef, RefObject } from 'react'
import classnames from 'classnames'
import { Icon, Input, message } from 'antd'
const styles = require('../filter.less')

interface IFilterListItemProps {
  title: string
  onNameChange: (name: string) => void
  onDelete: (e: React.MouseEvent<HTMLElement>) => void
}

interface IFilterListItemStates {
  editing: boolean
  inputValue: string
}

class FilterListItem extends PureComponent<IFilterListItemProps, IFilterListItemStates> {
  constructor (props) {
    super(props)
    this.state = {
      editing: false,
      inputValue: props.title
    }
  }

  private container: RefObject<HTMLDivElement> = createRef()
  private input: RefObject<Input> = createRef()

  private inputValueChange = (e) => {
    this.setState({
      inputValue: e.target.value
    })
  }

  private editStart = () => {
    this.setState({
      editing: true
    }, () => {
      this.input.current.input.select()
      window.addEventListener('click', this.editFallback, false)
      window.addEventListener('keydown', this.enterToFinish, false)
    })
  }

  private editFallback = (e) => {
    if (!this.container.current.contains(e.target)) {
      this.setState({
        editing: false,
        inputValue: this.props.title
      })
      window.removeEventListener('click', this.editFallback, false)
      window.removeEventListener('keydown', this.enterToFinish, false)
    }
  }

  private editFinish = () => {
    const { inputValue } = this.state
    if (inputValue) {
      this.props.onNameChange(inputValue)
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

  public render () {
    const { title, onDelete } = this.props
    const { editing, inputValue } = this.state

    const contentClass = classnames({
      [styles.treeNodeContent]: true,
      [styles.editing]: editing
    })

    return (
      <div
        className={contentClass}
        ref={this.container}
      >
        <h4>{title}</h4>
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
        <Icon
          type="edit"
          className={styles.action}
          onClick={this.editStart}
        />
        <Icon
          type="delete"
          className={styles.action}
          onClick={onDelete}
        />
      </div>
    )
  }
}

export default FilterListItem
