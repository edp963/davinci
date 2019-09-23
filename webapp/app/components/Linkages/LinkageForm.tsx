import * as React from 'react'

import { WrappedFormUtils } from 'antd/lib/form/Form'
import { Form, Row, Col, Cascader, Select } from 'antd'
const FormItem = Form.Item
const Option = Select.Option

import { DEFAULT_SPLITER } from 'app/globalConstants'
import { LinkageOperatorTypes } from 'utils/operatorTypes'
const styles = require('./Linkage.less')

interface ILinkageFormProps {
  form: WrappedFormUtils
  cascaderSource: any[]
}

export interface ILinkageForm {
  trigger: string
  linkager: string
  relation: string
}

export class LinkageForm extends React.PureComponent<ILinkageFormProps, {}> {
  private displayRenderHandles = {
    trigger: (labels) => labels.join(' - '),
    linkager: (labels) => labels.join(' - ')
  }

  // FIXME 解决循环联动问题
  private checkRepeatAndType = (rule, value, callback) => {
    const form = this.props.form
    const linkagerValue = form.getFieldValue('linkager')

    if (value && linkagerValue && value.length && linkagerValue.length) {
      const triggerValueArr = value[1].split(DEFAULT_SPLITER)
      const linkagerValueArr = linkagerValue[1].split(DEFAULT_SPLITER)
      const triggerSqlType = triggerValueArr[1]
      const linkagerSqlType = linkagerValueArr[1]
      const linkagerColumnType = linkagerValueArr[2]

      if (value[0] === linkagerValue[0]) {
        callback('不能联动自身')
      }

      if (linkagerColumnType !== 'variable') {
        if (triggerSqlType !== linkagerSqlType) {
          callback('字段类型不一致')
        } else {
          callback()
        }
      } else {
        callback()
      }
    } else {
      callback()
    }
  }

  private confirmCheck = (rule, value, callback) => {
    if (value) {
      this.props.form.validateFields(['trigger'], { force: true }, () => void 0)
    }
    callback()
  }

  public render () {
    const { form, cascaderSource } = this.props
    const { getFieldDecorator } = form

    const relations = LinkageOperatorTypes
    const relationOptions = relations.map((r) => (
      <Option key={r} value={r}>{r}</Option>
    ))

    const commonFormItemStyle = {
      labelCol: { span: 8 },
      wrapperCol: { span: 12 }
    }

    const triggerOptions = cascaderSource.map(({ label, value, children: { columns } }) => ({ label, value, children: columns }))
    const linkagerOptions = cascaderSource.map(({ label, value, children: { columns, variables } }) => ({ label, value, children: [].concat(columns, variables) }))

    return (
      <Form className={styles.linkageForm}>
        <Row gutter={8}>
          <Col md={24}>
            <FormItem
              label="触发器"
              className={styles.linkageFormItem}
              {...commonFormItemStyle}
            >
              {getFieldDecorator('trigger', {
                rules: [{
                  required: true,
                  message: '不能为空'
                }, {
                  validator: this.checkRepeatAndType
                }]
              })(
                <Cascader
                  placeholder="请选择"
                  options={triggerOptions}
                  expandTrigger="hover"
                  displayRender={this.displayRenderHandles.trigger}
                />
              )}
            </FormItem>
          </Col>
          <Col md={24}>
            <FormItem
              label="联动图表"
              className={styles.linkageFormItem}
              {...commonFormItemStyle}
            >
              {getFieldDecorator('linkager', {
                rules: [{
                  required: true,
                  message: '不能为空'
                }, {
                  validator: this.confirmCheck
                }]
              })(
                <Cascader
                  placeholder="请选择"
                  options={linkagerOptions}
                  expandTrigger="hover"
                  displayRender={this.displayRenderHandles.linkager}
                />
              )}
            </FormItem>
          </Col>
          <Col md={24}>
            <FormItem
              label="关系"
              className={styles.linkageFormItem}
              {...commonFormItemStyle}
            >
              {getFieldDecorator('relation', {
                initialValue: '='
              })(
                <Select>{relationOptions}</Select>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create()(LinkageForm)
