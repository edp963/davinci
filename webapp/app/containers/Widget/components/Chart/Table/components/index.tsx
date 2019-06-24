import HeadCell from './HeadCell'
import BodyCell from './BodyCell'
import { TableComponents } from 'antd/lib/table'

export const tableComponents: TableComponents = {
  header: {
    cell: HeadCell
  },
  body: {
    cell: BodyCell
  }
}
