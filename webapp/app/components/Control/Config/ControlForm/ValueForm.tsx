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

import React, { FC, useMemo, useCallback, memo } from 'react'
import classnames from 'classnames'
import {
  Form,
  Row,
  Col,
  Input,
  Checkbox,
  Select,
  Radio,
  Icon,
  Table,
  Divider,
  Tooltip,
  Popconfirm,
  Button
} from 'antd'
import DefaultValue from './DefaultValue'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import { RadioChangeEvent } from 'antd/lib/radio'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import {
  SHOULD_LOAD_OPTIONS,
  ControlOptionTypes,
  ControlTypes
} from '../../constants'
import { IControl, IControlOption } from '../../types'
import { IViewBase, IFormedViews } from 'app/containers/View/types'
import { OperatorTypesLocale } from 'app/utils/operatorTypes'
import { getOperatorOptions } from '../../util'
import { filterSelectOption } from 'app/utils/util'
import { TreeNode } from 'antd/lib/tree-select'
import utilStyles from 'assets/less/util.less'
import { ColumnProps } from 'antd/lib/table'
const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group

interface IValueFormProps {
  form: WrappedFormUtils
  views: IViewBase[]
  formedViews: IFormedViews
  controlBase: Omit<IControl, 'relatedItems' | 'relatedViews'>
  defaultValueOptions: Array<IControlOption | TreeNode>
  defaultValueLoading: boolean
  onOptionTypeChange: (e: RadioChangeEvent) => void
  onValueViewChange: (viewId: number) => void
  onDefaultValueTypeChange: (e: RadioChangeEvent) => void
  onGetDefaultValueOptions: () => void
  onCommonPropChange: (propName: string, value) => void
  onOpenOptionModal: (index?: number) => void
  onDeleteOption: (value: string) => () => void
}

const ValueForm: FC<IValueFormProps> = ({
  form,
  views,
  formedViews,
  controlBase,
  defaultValueOptions,
  defaultValueLoading,
  onOptionTypeChange,
  onValueViewChange,
  onDefaultValueTypeChange,
  onGetDefaultValueOptions,
  onCommonPropChange,
  onOpenOptionModal,
  onDeleteOption
}) => {
  const { getFieldDecorator } = form
  const {
    type,
    multiple,
    optionType,
    valueViewId,
    customOptions,
    optionWithVariable
  } = controlBase
  const operatorOptions = useMemo(() => getOperatorOptions(type, multiple), [
    type,
    multiple
  ])

  const fieldOptions = useMemo(
    () =>
      optionType === ControlOptionTypes.Manual && valueViewId
        ? Object.keys(formedViews[valueViewId].model).map((name) => (
            <Option key={name} value={name}>
              {name}
            </Option>
          ))
        : [],
    [formedViews, optionType, valueViewId]
  )

  const optionWithVariableChange = useCallback(
    (e: CheckboxChangeEvent) => {
      onCommonPropChange('optionWithVariable', e.target.checked)
    },
    [onCommonPropChange]
  )

  const addOption = useCallback(() => {
    onOpenOptionModal()
  }, [onOpenOptionModal])

  const editOption = useCallback(
    (index) => () => {
      onOpenOptionModal(index)
    },
    [onOpenOptionModal]
  )

  const columns: Array<ColumnProps<IControlOption>> = [
    {
      title: '文本',
      key: 'text',
      dataIndex: 'text',
      render: (text) => (text.length > 10 ? `${text.substr(0, 10)}...` : text)
    },
    {
      title: '值',
      key: 'value',
      dataIndex: 'value',
      render: (value) =>
        value.length > 10 ? `${value.substr(0, 10)}...` : value
    }
  ]

  if (optionWithVariable) {
    columns.push({
      title: '关联变量',
      key: 'variables',
      dataIndex: 'variables',
      render: (variables) => variables && Object.values(variables)
    })
  }

  columns.push({
    title: '操作',
    width: 100,
    className: utilStyles.textAlignCenter,
    render: (_, record, index) => (
      <span className="ant-table-action-column">
        <Tooltip title="修改">
          <Button
            icon="edit"
            shape="circle"
            type="ghost"
            onClick={editOption(index)}
          />
        </Tooltip>
        <Popconfirm
          title="确定删除？"
          placement="bottom"
          onConfirm={onDeleteOption(record.value)}
        >
          <Tooltip title="删除">
            <Button icon="delete" shape="circle" type="ghost" />
          </Tooltip>
        </Popconfirm>
      </span>
    )
  })

  const colSpan = { xxl: 12, xl: 18 }
  const itemCols = {
    labelCol: { span: 8 },
    wrapperCol: { span: 12 }
  }

  return (
    <>
      <Divider orientation="left">取值配置</Divider>
      {!!operatorOptions.length && (
        <Row>
          <Col {...colSpan}>
            <FormItem label="对应关系" {...itemCols}>
              {getFieldDecorator('operator', {
                rules: [{ required: true, message: '对应关系不能为空' }]
              })(
                <Select>
                  {operatorOptions.map((o) => (
                    <Option key={o} value={o}>
                      {OperatorTypesLocale[o]}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
      )}
      {SHOULD_LOAD_OPTIONS[type] && (
        <>
          <Row
            key="optionType"
            className={classnames({
              [utilStyles.hide]: type === ControlTypes.TreeSelect
            })}
          >
            <Col {...colSpan}>
              <FormItem label="下拉菜单项" {...itemCols}>
                {getFieldDecorator(
                  'optionType',
                  {}
                )(
                  <RadioGroup onChange={onOptionTypeChange}>
                    <Radio value={ControlOptionTypes.Auto}>自动关联</Radio>
                    <Radio value={ControlOptionTypes.Manual}>手动</Radio>
                    <Radio value={ControlOptionTypes.Custom}>自定义</Radio>
                  </RadioGroup>
                )}
              </FormItem>
            </Col>
          </Row>
          {optionType === ControlOptionTypes.Manual && (
            <>
              <Row key="valueViewId">
                <Col {...colSpan}>
                  <FormItem label="数据视图" {...itemCols}>
                    {getFieldDecorator('valueViewId', {
                      rules: [{ required: true, message: '数据视图不能为空' }]
                    })(
                      <Select
                        showSearch
                        placeholder="请手动关联数据视图"
                        onChange={onValueViewChange}
                        filterOption={filterSelectOption}
                      >
                        {views.map(({ id, name }) => (
                          <Option key={id} value={id}>
                            {name}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row key="valueField">
                <Col {...colSpan}>
                  <FormItem label="取值字段" {...itemCols}>
                    {getFieldDecorator('valueField', {
                      rules: [{ required: true, message: '取值字段不能为空' }]
                    })(
                      <Select
                        showSearch
                        placeholder="请选择取值字段"
                        filterOption={filterSelectOption}
                      >
                        {fieldOptions}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              {type === ControlTypes.TreeSelect && (
                <Row key="parentField">
                  <Col {...colSpan}>
                    <FormItem label="父ID字段" {...itemCols}>
                      {getFieldDecorator('parentField', {
                        rules: [{ required: true, message: '父ID字段不能为空' }]
                      })(
                        <Select
                          showSearch
                          placeholder="请选择父ID字段"
                          filterOption={filterSelectOption}
                        >
                          {fieldOptions}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              )}
              <Row key="textField">
                <Col {...colSpan}>
                  <FormItem
                    label="文本字段"
                    {...itemCols}
                    help="如不设置文本字段，下拉菜单项则默认显示取值字段的值"
                  >
                    {getFieldDecorator(
                      'textField',
                      {}
                    )(
                      <Select
                        showSearch
                        placeholder="请选择文本字段"
                        filterOption={filterSelectOption}
                        allowClear
                      >
                        {fieldOptions}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </>
          )}
          {optionType === ControlOptionTypes.Custom && (
            <>
              <Row>
                <Col {...colSpan}>
                  <FormItem label="选项关联变量" {...itemCols}>
                    {getFieldDecorator('optionWithVariable', {
                      valuePropName: 'checked'
                    })(<Checkbox onChange={optionWithVariableChange} />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col {...colSpan}>
                  <FormItem label=" " colon={false} {...itemCols}>
                    <a onClick={addOption}>
                      <Icon type="plus" /> 点击添加
                    </a>
                  </FormItem>
                  <FormItem className={utilStyles.hide}>
                    {getFieldDecorator('customOptions', {})(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <FormItem
                    label=" "
                    colon={false}
                    labelCol={{ xxl: 4, xl: 6, span: 8 }}
                    wrapperCol={{ xxl: 16, xl: 14, span: 12 }}
                  >
                    <Table
                      size="small"
                      rowKey="value"
                      dataSource={customOptions}
                      columns={columns}
                      pagination={false}
                      bordered
                    />
                  </FormItem>
                </Col>
              </Row>
            </>
          )}
        </>
      )}
      <DefaultValue
        form={form}
        controlBase={controlBase}
        defaultValueOptions={defaultValueOptions}
        defaultValueLoading={defaultValueLoading}
        onDefaultValueTypeChange={onDefaultValueTypeChange}
        onGetDefaultValueOptions={onGetDefaultValueOptions}
      />
    </>
  )
}

export default memo(ValueForm)
