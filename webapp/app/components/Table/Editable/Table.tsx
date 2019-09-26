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

import React, { useState, useMemo, useCallback } from 'react'
import { Table, Popconfirm, Button } from 'antd'
import { TableComponents } from 'antd/lib/table'
import { FormComponentProps } from 'antd/lib/form'
import Form, { WrappedFormUtils } from 'antd/lib/form/Form'
import EditableCell from './Cell'
import { IEditableColumnProps } from './types'
import { EditableContext } from './util'

interface IEditableTableProps<T> extends FormComponentProps {
  data: T[]
  dataKey: string
  columns: Array<IEditableColumnProps<T>>
  showConfirm?: boolean
  onSave: (newData: T[]) => void
}

const tableComponents: TableComponents = {
  body: {
    cell: EditableCell
  }
}

export const EditableTable: <T extends object>(
  props: IEditableTableProps<T>
) => React.ReactElement = (props) => {
  const { columns, data, dataKey, form, showConfirm, onSave } = props
  const [editingIdx, setEditingIdx] = useState(-1)

  const isEditing = useCallback((idx: number) => editingIdx === idx, [
    editingIdx
  ])
  const save = useCallback(
    (form: WrappedFormUtils, idx: number) => {
      form.validateFields((err, row) => {
        if (err) {
          return
        }
        const newData = [...data]
        const existsIdx = newData.findIndex(
          (record, recordIdx) =>
            record[dataKey] === row[dataKey] && recordIdx !== idx
        )
        newData.splice(idx, 1, { ...newData[idx], ...row })
        if (existsIdx > -1) {
          newData.splice(existsIdx, 1)
        }
        onSave(newData)
        setEditingIdx(-1)
      })
    },
    [data, editingIdx, onSave]
  )
  const cancel = useCallback(() => {
    setEditingIdx(-1)
  }, [])

  const deleteRecord = useCallback(
    (idx: number) => {
      const newData = [...data]
      newData.splice(idx, 1)
      onSave(newData)
    },
    [data, onSave]
  )

  const tableColumns = columns
    .map((col, columnIdx) => {
      if (!col.editable) {
        return col
      }
      return {
        ...col,
        onCell: (record: object, rowIdx: number) => ({
          record,
          inputType: col.inputType,
          dataIndex: col.dataIndex,
          title: col.title,
          editing: isEditing(rowIdx),
          autoFocus: columnIdx === 0
        })
      }
    })
    .concat({
      title: '操作',
      dataIndex: 'operation',
      align: 'center',
      width: 130,
      editable: false,
      inputType: 'none',
      render: (_1, _2, idx) =>
        isEditing(idx) ? (
          <>
            <EditableContext.Consumer>
              {(form) => (
                <Button
                  type="primary"
                  size="small"
                  style={{ marginRight: 8 }}
                  onClick={() => save(form, idx)}
                >
                  保存
                </Button>
              )}
            </EditableContext.Consumer>
            {showConfirm ? (
              <Popconfirm title="确定取消？" onConfirm={cancel}>
                <Button size="small">取消</Button>
              </Popconfirm>
            ) : (
              <Button size="small" onClick={cancel}>
                取消
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              type="primary"
              size="small"
              disabled={editingIdx !== -1 && !isEditing(idx)}
              style={{ marginRight: 8 }}
              onClick={() => setEditingIdx(idx)}
            >
              编辑
            </Button>
            {showConfirm ? (
              <Popconfirm
                title="确定删除？"
                onConfirm={() => deleteRecord(idx)}
              >
                <Button type="danger" size="small">
                  删除
                </Button>
              </Popconfirm>
            ) : (
              <Button
                type="danger"
                size="small"
                onClick={() => deleteRecord(idx)}
              >
                删除
              </Button>
            )}
          </>
        )
    })

  return (
    <EditableContext.Provider value={form}>
      <Table
        bordered
        components={tableComponents}
        dataSource={data}
        pagination={false}
        columns={tableColumns}
      />
    </EditableContext.Provider>
  )
}

// @FIXME typescript generic typing (object to T)
export default Form.create<IEditableTableProps<object>>()(EditableTable)
