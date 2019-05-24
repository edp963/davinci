import { ITableCellStyle } from '../../Workbench/ConfigSections/TableSection'

export function textAlignAdapter (justifyContent: ITableCellStyle['justifyContent']) {
  switch (justifyContent) {
    case 'flex-start': return 'left'
    case 'center':  return 'center'
    case 'flex-end': return 'right'
    default: return 'inherit'
  }
}
