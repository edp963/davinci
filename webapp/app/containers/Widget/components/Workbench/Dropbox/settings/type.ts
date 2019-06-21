
export enum SettingTypes {
  Dimension = 1 << 0,
  Indicator = 1 << 1,
  Color = 1 << 2,
  Filters = 1 << 3,
  Label = 1 << 4,
  Tip = 1 << 5
}

export enum ItemTypes {
  Category = 1 << 0,
  Value = 1 << 1
}

export interface ISettingItem {
  key: string
  name: string
  settingType: SettingTypes
  itemType: ItemTypes
  sub: boolean
  items: Array<{
    [key: string]: string
  }>
}
