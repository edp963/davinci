import { ColumnProps } from 'antd/lib/table'

export type EditableCellInputTypes = 'none' | 'input' | 'textarea' | 'inputNumber' | 'checkbox' | 'select' | 'date' | 'datetime'

export interface IEditableColumnProps<T> extends ColumnProps<T> {
  editable: boolean
  inputType: EditableCellInputTypes
}
