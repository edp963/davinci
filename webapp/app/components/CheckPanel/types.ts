export interface ICheckPanelProps {
  dataSource: any[]
  defaultKeys?: any[]
  labelKey?: string
  valueKey?: string
  placeholder?: string
  labelInValue?: boolean
  closableByTag?: boolean
  tokenSeparators?: string[]
  onChange?: (targets: any[]) => any
}