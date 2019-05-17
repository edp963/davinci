import React, { Component } from 'react'
import PropTypes from 'prop-types'
import $ from 'jquery'
import moment from 'moment'
import 'bootstrap-datepicker'

import { Icon } from 'antd'

import styles from './MultiDatePicker.less'

export class MultiDatePicker extends Component {
  constructor (props) {
    super(props)
    this.state = {
      value: this.props.value || ''
    }
  }

  componentWillMount () {
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

  componentDidMount () {
    $(this.refs.input)
      .datepicker({
        multidate: true,
        clearBtn: true,
        language: 'zh'
      })
      .on('changeDate', (e) => {
        const val = e.dates.map(d => moment(d).format(this.props.format)).join(',')
        this.props.onChange(val)
        this.setState({
          value: val
        })
      })
  }

  render () {
    return (
      <span className={styles.datepicker}>
        <input
          type="text"
          placeholder={this.props.placeholder || '请选择日期（多选）'}
          className="ant-input"
          value={this.state.value}
          ref="input"
          readOnly
        />
        <Icon type="calendar" />
      </span>
    )
  }
}

MultiDatePicker.propTypes = {
  value: PropTypes.string,
  format: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func
}

MultiDatePicker.defaultProps = {
  format: 'YYYY-MM-DD'
}

export default MultiDatePicker
