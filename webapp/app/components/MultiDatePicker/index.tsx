import React, { Component, GetDerivedStateFromProps, createRef, RefObject } from 'react'
import $ from 'jquery'
import moment from 'moment'
import classnames from 'classnames'
import 'bootstrap-datepicker'

import { Icon } from 'antd'

import styles from './MultiDatePicker.less'

interface IMultiDatePickerProps {
  value: string
  format: string
  size?: 'default' | 'large' | 'small'
  placeholder: string
  onChange: (value: string) => any
}

interface IMultiDatePickerStates {
  value: string
}

class MultiDatePicker extends Component<IMultiDatePickerProps, IMultiDatePickerStates> {

  public state: IMultiDatePickerStates = {
    value: this.props.value || ''
  }

  public static defaultProps: Partial<IMultiDatePickerProps> = {
    format: 'YYYY-MM-DD'
  }

  private input: RefObject<HTMLInputElement> = createRef()

  constructor (props) {
    super(props)
    $.fn.datepicker.dates['zh'] = {
      days: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      daysShort: ['日', '一', '二', '三', '四', '五', '六'],
      daysMin: ['日', '一', '二', '三', '四', '五', '六'],
      months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      monthsShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      today: '今天',
      clear: '清除',
      format: this.props.format.toLowerCase(),
      titleFormat: 'yyyy MM', /* Leverages same syntax as 'format' */
      weekStart: 0
    }
  }

  public componentDidMount () {
    $(this.input.current)
      .datepicker({
        multidate: true,
        clearBtn: true,
        language: 'zh'
      })
      .on('changeDate', (e) => {
        const val = e.dates.map((d) => moment(d).format(this.props.format)).join(',')
        this.props.onChange(val)
      })
  }

  public static getDerivedStateFromProps: GetDerivedStateFromProps<
    IMultiDatePickerProps,
    IMultiDatePickerStates
  > = (props) => {
    return {
      value: props.value
    }
  }

  public render () {
    const { size } = this.props
    const inputClassNames = classnames({
      'ant-input': true,
      'ant-input-lg': size === 'large',
      'ant-input-sm': size === 'small'
    })
    return (
      <span className={styles.datepicker}>
        <input
          type="text"
          placeholder={this.props.placeholder || '请选择日期（多选）'}
          className={inputClassNames}
          value={this.state.value}
          ref={this.input}
          readOnly
        />
        <Icon type="calendar" />
      </span>
    )
  }
}

export default MultiDatePicker
