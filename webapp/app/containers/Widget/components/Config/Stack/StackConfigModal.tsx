import React from 'react'
import produce from 'immer'

import { StackGroup, IStackConfig, IStackMetrics } from './types'
import { EmptyStack } from './constants'

import { Row, Col, Form, Button, Tooltip, Icon, Checkbox, Modal } from 'antd'
const FormItem = Form.Item
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { FormComponentProps } from 'antd/lib/form'

import { FontSetting } from 'components/StyleSetting/Font'
import StackContainer from './StackContainer'

import Styles from './Stack.less'

export interface IStackConfigModalProps {
  visible: boolean
  metrics: IStackMetrics
  stack: IStackConfig
  onCancel: () => void
  onSave: (stack: IStackConfig) => void
}

interface IStackConfigModalStates {
  validStack: IStackConfig
}

class StackConfigModal extends React.PureComponent<
  IStackConfigModalProps & FormComponentProps<IStackConfig>,
  IStackConfigModalStates
> {
  constructor (
    props: IStackConfigModalProps & FormComponentProps<IStackConfig>
  ) {
    super(props)
    const { stack, metrics } = props
    this.state = { validStack: this.getValidStack(stack, metrics) }
  }

  public componentDidUpdate (
    prevProps: IStackConfigModalProps & FormComponentProps<IStackConfig>
  ) {
    const { metrics, stack } = this.props
    if (metrics !== prevProps.metrics || stack !== prevProps.stack) {
      const validStack = this.getValidStack(stack, metrics)
      this.setState({ validStack })
    }
  }

  private getValidStack = (
    stackConfig: IStackConfig,
    metrics: IStackMetrics
  ) => {
    const validStack = produce(stackConfig, (draft) => {
      if (!draft) {
        draft = { ...EmptyStack }
        return draft
      }
      const validStackGroup = draft.group.reduce<StackGroup>(
        (acc, stackItem) => {
          const validStackItem = stackItem.filter(
            (metricId) => !!metrics[metricId]
          )
          if (!validStackItem.length) {
            return acc
          }
          acc.push(validStackItem)
          return acc
        },
        []
      )
      draft.group = validStackGroup
    })
    return validStack
  }

  private stackGroupChange = (group: StackGroup) => {
    const { validStack } = this.state
    this.setState({ validStack: { ...validStack, group } })
  }

  private save = () => {
    const { form } = this.props
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return
      }
      const { group } = this.state.validStack
      const stackConfig: IStackConfig = { ...values, group }
      this.props.onSave(stackConfig)
    })
  }

  private sumShowChange = (e: CheckboxChangeEvent) => {
    const show = e.target.checked
    const validStack = produce(this.state.validStack, (draft) => {
      draft.sum.show = show
    })
    this.setState({ validStack })
  }

  private modalTitle = (
    <>
      堆叠设置
      <Tooltip title="拖拽指标至分组中以进行堆叠设置">
        <Icon className={Styles.stackInfo} type="info-circle" />
      </Tooltip>
    </>
  )

  private modalFooter = [(
    <Button key="cancel" size="large" onClick={this.props.onCancel}>
      取 消
    </Button>
  ), (
    <Button key="submit" size="large" type="primary" onClick={this.save}>
      保 存
    </Button>
  )]

  public render () {
    const { validStack } = this.state
    if (!validStack) {
      return null
    }

    const { form, visible, onCancel, metrics } = this.props
    const { getFieldDecorator } = form
    const { group, on, percentage, sum } = validStack

    return (
      <Modal
        title={this.modalTitle}
        wrapClassName="ant-modal-medium"
        footer={this.modalFooter}
        visible={visible}
        onCancel={onCancel}
        onOk={this.save}
      >
        <Form layout="inline">
          <Row>
            <FormItem>
              {getFieldDecorator<IStackConfig>('on', {
                initialValue: on,
                valuePropName: 'checked'
              })(<Checkbox>开启堆叠</Checkbox>)}
            </FormItem>
          </Row>
          <FormItem>
            {getFieldDecorator<IStackConfig>('percentage', {
              initialValue: percentage,
              valuePropName: 'checked'
            })(<Checkbox>百分比堆积</Checkbox>)}
          </FormItem>
          <FormItem>
            {getFieldDecorator('sum.show', {
              initialValue: sum.show,
              valuePropName: 'checked'
            })(<Checkbox onChange={this.sumShowChange}>显示总计</Checkbox>)}
          </FormItem>
          {sum.show && (
            <FormItem>
              {getFieldDecorator('sum.font', { initialValue: sum.font })(
                <FontSetting size="small" />
              )}
            </FormItem>
          )}
        </Form>
        <Row>
          <Col span={24}>
            <StackContainer
              metrics={metrics}
              group={group}
              onStackGroupChange={this.stackGroupChange}
            />
          </Col>
        </Row>
      </Modal>
    )
  }
}

export default Form.create<
  IStackConfigModalProps & FormComponentProps<IStackConfig>
>()(StackConfigModal)
