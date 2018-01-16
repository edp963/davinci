import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import Form from 'antd/lib/form'
import Table from 'antd/lib/table'
import Input from 'antd/lib/input'
import Button from 'antd/lib/button'
const FormItem = Form.Item

import styles from './GlobalFilter.less'
import utilStyles from '../../../../assets/less/util.less'

export class OptionForm extends PureComponent {
  render () {
    const {
      form,
      dataSource,
      onAddOpiton,
      onChangeStatus,
      onUpdateOption,
      onDeleteOption
    } = this.props
    const { getFieldDecorator } = form

    const columns = [{
      title: 'Text',
      dataIndex: 'text',
      render: (text, record) => {
        if (record.status) {
          return (
            <span>{text}</span>
          )
        } else {
          return (
            <FormItem className={styles.tableFormItem}>
              {getFieldDecorator(`${record.id}Text`, {
                rules: [{
                  required: true,
                  message: 'Text 不能为空'
                }],
                initialValue: record.text
              })(
                <Input />
              )}
            </FormItem>
          )
        }
      }
    }, {
      title: 'Value',
      dataIndex: 'value',
      render: (text, record) => {
        if (record.status) {
          return (
            <span>{text}</span>
          )
        } else {
          return (
            <FormItem className={styles.tableFormItem}>
              {getFieldDecorator(`${record.id}Value`, {
                rules: [{
                  required: true,
                  message: 'Value 不能为空'
                }],
                initialValue: record.value
              })(
                <Input />
              )}
            </FormItem>
          )
        }
      }
    }, {
      title: '操作',
      width: 120,
      className: `${utilStyles.textAlignCenter}`,
      render: (text, record) => (
        <span className={styles.actions}>
          {
            record.status
              ? <a onClick={onChangeStatus(record.id)}>修改</a>
              : <a onClick={onUpdateOption(record.id)}>保存</a>
          }
          <a onClick={onDeleteOption(record.id)}>删除</a>
        </span>
      )
    }]

    return (
      <Form className={styles.table}>
        <div className={styles.tools}>
          <Button type="primary" onClick={onAddOpiton}>新增</Button>
        </div>
        <Table
          columns={columns}
          rowKey="id"
          dataSource={dataSource}
          pagination={false}
        />
      </Form>
    )
  }
}

OptionForm.propTypes = {
  form: PropTypes.any,
  dataSource: PropTypes.array,
  onAddOpiton: PropTypes.func,
  onChangeStatus: PropTypes.func,
  onUpdateOption: PropTypes.func,
  onDeleteOption: PropTypes.func
}

export default Form.create()(OptionForm)
