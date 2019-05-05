import React from 'react'
import classnames from 'classnames'
import memoizeOne from 'memoize-one'
import { Table, Tabs, Radio, Select, Row, Col, Button } from 'antd'
const { Column } = Table
const { TabPane } = Tabs
const RadioGroup = Radio.Group
const { Option } = Select
import { RadioChangeEvent } from 'antd/lib/radio'
import { ColumnProps } from 'antd/lib/table'

import { IViewVariable, IViewModel, IExecuteSqlResponse } from '../types'
import {
  ViewModelTypes,
  ViewModelVisualTypes,
  ViewModelTypesLocale,
  ModelTypeSqlTypeSetting,
  ViewModelVisualTypesLocale,
  VisualTypeSqlTypeSetting
} from '../constants'

import Styles from '../View.less'
import { SqlTypes } from 'app/globalConstants'

function getMapKeyByValue (value: SqlTypes, map: typeof VisualTypeSqlTypeSetting | typeof ModelTypeSqlTypeSetting) {
  let result
  Object.entries(map).some(([key, values]) => {
    if (values.includes(value)) {
      result = key
      return true
    }
  })
  return result
}

interface IModelAuthProps {
  model: IViewModel[]
  variable: IViewVariable[]
  sqlColumns: IExecuteSqlResponse['columns']
  onModelChange: (model: IViewModel[], replace: boolean) => void
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
    this.props.onModelChange([model], false)
  }

  private stepChange = (step: number) => () => {
    this.props.onStepChange(step)
  }

  private getValidModel = memoizeOne(
    (model: IViewModel[], sqlColumns: IExecuteSqlResponse['columns'], onModelChange: IModelAuthProps['onModelChange']) => {
      if (!Array.isArray(sqlColumns)) { return [] }

      let needNotify = false
      const validModel = sqlColumns.map<IViewModel>((column) => {
        const { name: columnName, type: columnType } = column
        const modelItem = model.find((m) => m.name === columnName)
        if (!modelItem) {
          needNotify = true
          return {
            name: columnName,
            sqlType: columnType,
            visualType: getMapKeyByValue(columnType, VisualTypeSqlTypeSetting),
            modelType: getMapKeyByValue(columnType, ModelTypeSqlTypeSetting)
          }
        } else {
          const item = { ...modelItem }
          // @TODO verify modelType & visualType are valid by the sqlType or not
          // if (!VisualTypeSqlTypeSetting[item.visualType].includes(columnType)) {
          //   needNotify = true
          //   item.visualType = getMapKeyByValue(columnType, VisualTypeSqlTypeSetting)
          // }
          // if (!ModelTypeSqlTypeSetting[item.modelType].includes(columnType)) {
          //   needNotify = true
          //   item.modelType = getMapKeyByValue(columnType, ModelTypeSqlTypeSetting)
          // }
          return item
        }
      })
      if (needNotify) {
        onModelChange(validModel, true)
      }

      return validModel
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

  private renderColumnModelType = (text: string, record) => (
    <RadioGroup
      options={this.modelTypeOptions}
      value={text}
      onChange={this.modelChange(record, 'modelType')}
    />
  )

  private renderColumnVisualType = (text: string, record) => (
    <Select
      className={Styles.tableControl}
      value={text}
      onChange={this.modelChange(record, 'visualType')}
    >
      {this.visualTypeOptions}
    </Select>
  )

  public render () {
    const { model, variable, sqlColumns, onModelChange } = this.props
    const validModel = this.getValidModel(model, sqlColumns, onModelChange)
    const authColumns = this.getAuthTableColumns(variable)
    const styleCls = classnames({
      [Styles.containerHorizontal]: true,
      [Styles.modelAuth]: true
    })
    return (
      <div className={styleCls}>
        <div className={Styles.containerHorizontal}>
          <Tabs defaultActiveKey="model">
            <TabPane tab="Model" key="model">
              <Table bordered pagination={false} rowKey="name" dataSource={validModel}>
                <Column title="字段名称" dataIndex="name" />
                <Column title="数据类型" dataIndex="modelType" render={this.renderColumnModelType} />
                <Column title="可视化类型" dataIndex="visualType" render={this.renderColumnVisualType} />
              </Table>
            </TabPane>
            <TabPane tab="Auth" key="auth">
              <Table
                bordered
                columns={authColumns}
                dataSource={variable}
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
