import { SortOrder } from 'antd/lib/table'
import { FieldSortTypes } from '../../Config/Sort'

export const MapAntSortOrder: { [key in SortOrder]: FieldSortTypes } = {
  ascend: FieldSortTypes.Asc,
  descend: FieldSortTypes.Desc
}
