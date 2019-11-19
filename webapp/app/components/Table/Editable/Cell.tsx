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

import React from 'react'
import { EditableCellInputTypes } from './types'
import { Input, Form, InputNumber, Checkbox } from 'antd'
const FormItem = Form.Item
import { WrappedFormUtils } from 'antd/lib/form/Form'
import { EditableContext } from './util'

const renderInputControl = (inputType: EditableCellInputTypes, autoFocus: boolean) => {
  switch (inputType) {
    case 'input':
      return <Input autoFocus={autoFocus} />
    case 'inputNumber':
      return <InputNumber />
    case 'checkbox':
      return <Checkbox />
    // @TODO other inputType cell render
    default:
      return <Input autoFocus={autoFocus}/>
  }
}

interface IEditableCellProps<T> {
  editing: boolean
  dataIndex: string
  inputType: EditableCellInputTypes
  record: T
  index: number
  autoFocus: boolean
}

const EditableCell: React.FC<IEditableCellProps<object>> = (props) => {

  const { editing, dataIndex, inputType, record, index, autoFocus, children, ...restProps } = props

  const renderCell = (form: WrappedFormUtils) => (
    <td {...restProps}>
      {editing ? (
        <FormItem style={{ margin: 0 }}>
          {form.getFieldDecorator(dataIndex, {
            rules: [{ required: true, message: '不能为空' }],
            initialValue: record[dataIndex],
            valuePropName: inputType === 'checkbox' ? 'checked' : 'value'
          })(renderInputControl(inputType, !!autoFocus))}
        </FormItem>
      ) : children}
    </td>
  )

  return (
    <EditableContext.Consumer>
      {renderCell}
    </EditableContext.Consumer>
  )
}

export default EditableCell
