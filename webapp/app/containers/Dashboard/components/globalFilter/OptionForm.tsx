import * as React from 'react'

import { WrappedFormUtils } from 'antd/lib/form/Form'
const Form = require('antd/lib/form')
const Table = require('antd/lib/table')
const Input = require('antd/lib/input')
const Button = require('antd/lib/button')
const FormItem = Form.Item

const styles = require('./GlobalFilter.less')
const utilStyles = require('../../../../assets/less/util.less')

interface IOptionFormProps {
  form: WrappedFormUtils
  dataSource: any[]
  onAddOpiton: () => any
  onChangeStatus: (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => void
  onUpdateOption: (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => void
  onDeleteOption: (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => void
}

export class OptionForm extends React.PureComponent<IOptionFormProps, {}> {
  public render () {
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

export default Form.create()(OptionForm)
