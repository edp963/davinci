import React from 'react'
import memoizeOne from 'memoize-one'
import { Table, Tabs, Radio, Select, Row, Col, Button } from 'antd'
const { TabPane } = Tabs
const RadioGroup = Radio.Group
const { Option } = Select
import { RadioChangeEvent } from 'antd/lib/radio'
import { ColumnProps } from 'antd/lib/table'

import { IViewVariable, IViewModel } from '../types'
import { ViewModelTypes, ViewModelVisualTypes, ViewModelTypesLocale, ViewModelVisualTypesLocale } from '../constants'

import Styles from '../View.less'

interface IModelAuthProps {
  models: IViewModel[]
  variables: IViewVariable[]
  onModelChange: (model: IViewModel) => void
  onStepChange: (stepChange: number) => void
}

export class ModelAuth extends React.Component<IModelAuthProps> {

  private modelTypeOptions = Object.entries(ViewModelTypesLocale).map(([value, label]) => ({
    label,
    value
  }))

  private visualTypeOptions = Object.entries(ViewModelVisualTypesLocale).map(([visualType, text]) => (
    <Option key={visualType} value={visualType}>{text}</Option>
  ))

  private modelChange = (record: IViewModel, key: keyof IViewModel) => (e: RadioChangeEvent | string) => {
    const value: string = (e as RadioChangeEvent).target ? (e as RadioChangeEvent).target.value : e
    const model = {
      ...record,
      [key]: value
    }
    this.props.onModelChange(model)
  }

  private stepChange = (step: number) => () => {
    this.props.onStepChange(step)
  }

  private getModelTableColumns = memoizeOne((models: IViewModel[]) => {
    const columns: Array<ColumnProps<IViewModel>> = [{
      title: '字段名称',
      dataIndex: 'name'
    }, {
      title: '数据类型',
      dataIndex: 'modelType',
      render: (text: string, record) => (
        <RadioGroup
          options={this.modelTypeOptions}
          value={text}
          onChange={this.modelChange(record, 'modelType')}
        />
      )
    }, {
      title: '可视化类型',
      dataIndex: 'visualType',
      render: (text: string, record) => (
        <Select onChange={this.modelChange(record, 'visualType')}>{this.visualTypeOptions}</Select>
      )
    }]
    return columns
  })

  private getAuthTableColumns = memoizeOne((variables: IViewVariable[]) => {
    const columns: Array<ColumnProps<any>> = variables.map((variable) => ({
      title: variable.name
    }))
    columns.unshift({
      title: '角色'
    })
    columns.push({
      title: '可见字段'
    })
    return columns
  })

  public render () {
    const { models, variables } = this.props
    const modelColumns = this.getModelTableColumns(models)
    const authColumns = this.getAuthTableColumns(variables)

    return (
      <div className={Styles.containerHorizontal}>
        <div className={Styles.containerHorizontal}>
          <Tabs defaultActiveKey="model">
            <TabPane tab="Model" key="model">
              <Table
                bordered
                columns={modelColumns}
                dataSource={models}
              />
            </TabPane>
            <TabPane tab="Auth" key="auth">
              <Table
                bordered
                columns={authColumns}
                dataSource={variables}
              />
            </TabPane>
          </Tabs>
        </div>
        <Row className={Styles.bottom} type="flex" align="middle" justify="end">
          <Col span={12} className={Styles.toolBtns}>
            <Button type="primary" onClick={this.stepChange(-1)}>上一步</Button>
            <Button>取消</Button>
            <Button onClick={this.stepChange(1)}>保存</Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default ModelAuth
